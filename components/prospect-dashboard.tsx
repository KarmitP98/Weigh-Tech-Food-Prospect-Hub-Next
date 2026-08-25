"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Contact, Prospect, ProspectData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataImportDialog } from "@/components/data-import-dialog";
import { downloadProspectTemplate } from "@/lib/prospect-import";
import {
  Search,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Download,
  ExternalLink,
  ChevronRight,
  MapPin,
  User,
  Copy,
  Check,
  RotateCcw,
  Scale,
  Flame,
  ArrowUpDown,
  FileQuestion,
  Sparkles,
  Upload,
  FileCode,
  CheckCircle2,
  X,
  LayoutList,
  Table as TableIcon,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Send,
  MessageSquare,
  Globe,
  Radio,
} from "lucide-react";

type Props = { data: ProspectData };
type Sort = "priority" | "company" | "city" | "confidence";
type ViewMode = "cards" | "compact";

const tierOrder: Record<string, number> = { A: 0, B: 1, C: 2 };
const confidenceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

function safePhone(phone: string) {
  return phone.replace(/[^+\d]/g, "");
}

function ContactDetailCard({
  title,
  contact,
  fallbackEmail,
  fallbackPhone,
}: {
  title: string;
  contact: Contact;
  fallbackEmail: string;
  fallbackPhone: string;
}) {
  const email = contact.email || fallbackEmail;
  const phone = contact.phone || fallbackPhone;

  return (
    <Card className="bg-slate-50/80 border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
      <CardContent className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white">
            {title}
          </Badge>
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <User className="h-3 w-3" />
          </div>
        </div>
        <div>
          <p className="font-bold text-sm leading-tight text-slate-900">
            {contact.name || "Route contact"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{contact.title || "—"}</p>
        </div>
        <div className="space-y-1.5 pt-1.5 text-xs border-t border-slate-200/60">
          {email ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-rose-700 hover:text-rose-900 hover:underline font-medium break-all group"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>{email}</span>
            </a>
          ) : (
            <span className="flex items-center gap-2 text-slate-400">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span>No direct email</span>
            </span>
          )}
          {phone && (
            <a
              href={`tel:${safePhone(phone)}`}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium group"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span>{phone}</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProspectDashboard({ data }: Props) {
  const [prospects, setProspects] = useState<Prospect[]>(data.prospects);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [tier, setTier] = useState("");
  const [emailReady, setEmailReady] = useState(false);
  const [highConfidence, setHighConfidence] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [sort, setSort] = useState<Sort>("priority");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [copied, setCopied] = useState<"email" | "subject" | "call" | "quickEmail" | null>(null);
  const [copiedQuickId, setCopiedQuickId] = useState<string | null>(null);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const cities = useMemo(
    () => [...new Set(prospects.map((item) => item.city))].sort(),
    [prospects]
  );

  const tierCounts = useMemo(() => {
    return {
      all: prospects.length,
      tierA: prospects.filter((item) => item.tier === "A").length,
      tierB: prospects.filter((item) => item.tier === "B").length,
      tierC: prospects.filter((item) => item.tier === "C").length,
      emailReady: prospects.filter((item) => item.bestPublicEmail).length,
      highConfidence: prospects.filter((item) => item.confidence === "High").length,
      draftReady: prospects.filter((item) => item.outreach.customEmail).length,
    };
  }, [prospects]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prospects
      .filter((item) => {
        const haystack = [
          item.companyName,
          item.city,
          item.operationType,
          item.primaryContact.name,
          item.primaryContact.title,
          item.bestPublicEmail,
          item.likelyScaleOpportunities.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!needle || haystack.includes(needle)) &&
          (!city || item.city === city) &&
          (!tier || item.tier === tier) &&
          (!emailReady || Boolean(item.bestPublicEmail)) &&
          (!highConfidence || item.confidence === "High") &&
          (!draftReady || Boolean(item.outreach.customEmail))
        );
      })
      .sort((a, b) => {
        if (sort === "company") return a.companyName.localeCompare(b.companyName);
        if (sort === "city")
          return a.city.localeCompare(b.city) || a.rank - b.rank;
        if (sort === "confidence")
          return (
            (confidenceOrder[a.confidence] ?? 9) -
              (confidenceOrder[b.confidence] ?? 9) || a.rank - b.rank
          );
        return (
          (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9) || a.rank - b.rank
        );
      });
  }, [city, draftReady, emailReady, highConfidence, prospects, query, sort, tier]);

  const activeFilterCount =
    (query ? 1 : 0) +
    (city ? 1 : 0) +
    (tier ? 1 : 0) +
    (emailReady ? 1 : 0) +
    (highConfidence ? 1 : 0) +
    (draftReady ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setCity("");
    setTier("");
    setEmailReady(false);
    setHighConfidence(false);
    setDraftReady(false);
    setSort("priority");
  };

  const applyPreset = (preset: "tierA" | "peel" | "emailReady" | "highConfidence") => {
    clearFilters();
    if (preset === "tierA") setTier("A");
    if (preset === "peel") {
      const peelCity = cities.find((c) => c.toLowerCase().includes("brampton") || c.toLowerCase().includes("mississauga") || c.toLowerCase().includes("caledon"));
      if (peelCity) setCity(peelCity);
    }
    if (preset === "emailReady") setEmailReady(true);
    if (preset === "highConfidence") setHighConfidence(true);
  };

  const resetToDefaultData = () => {
    setProspects(data.prospects);
    setImportNotification(null);
    clearFilters();
  };

  const handleDataImport = (newItems: Prospect[], mode: "append" | "replace") => {
    if (mode === "replace") {
      setProspects(newItems);
      setImportNotification(
        `Dataset replaced with ${newItems.length} imported prospects.`
      );
    } else {
      const existingIds = new Set(prospects.map((p) => p.id));
      const toAdd = newItems.filter((p) => !existingIds.has(p.id));
      const merged = [...prospects, ...toAdd];
      setProspects(merged);
      const dups = newItems.length - toAdd.length;
      setImportNotification(
        `Added ${toAdd.length} new prospects${
          dups > 0 ? ` (${dups} duplicates skipped)` : ""
        }. Total active: ${merged.length} records.`
      );
    }
  };

  const copy = async (kind: "email" | "subject" | "call", value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const copyQuickEmail = async (prospect: Prospect, e: React.MouseEvent) => {
    e.stopPropagation();
    const email = prospect.bestPublicEmail || prospect.primaryContact.email;
    if (!email) return;
    await navigator.clipboard.writeText(email);
    setCopiedQuickId(prospect.id);
    window.setTimeout(() => setCopiedQuickId(null), 1500);
  };

  const exportCsv = () => {
    const headers = [
      "Rank",
      "Tier",
      "Company",
      "City",
      "Facility",
      "Operation",
      "Contact",
      "Title",
      "Email",
      "Phone",
      "Outreach status",
      "First ask",
    ];
    const escape = (value: string | number) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = filtered.map((item) =>
      [
        item.rank,
        item.tier,
        item.companyName,
        item.city,
        item.facilityAddress,
        item.operationType,
        item.primaryContact.name,
        item.primaryContact.title,
        item.bestPublicEmail,
        item.bestPhone,
        item.outreach.status,
        item.recommendedFirstAsk,
      ]
        .map(escape)
        .join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "weigh-tech-filtered-food-prospects.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const isCustomDataset = prospects.length !== data.prospects.length || prospects !== data.prospects;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50/50 bg-grid-pattern text-slate-900">
        {/* Sticky Glassmorphic Navbar */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 glass-panel shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Brand Logo & Tag */}
            <div className="flex items-center gap-3.5 min-w-0">
              <Image
                src="/wts-logo.png"
                alt="Weigh-Tech Solutions"
                width={168}
                height={36}
                className="w-36 sm:w-44 h-auto object-contain"
                priority
              />
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="hidden md:flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-700 tracking-tight">
                  Food Prospect Hub
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50/80 border-rose-200">
                  Ontario Pipeline
                </Badge>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex items-center gap-2">
              <DataImportDialog
                currentCount={prospects.length}
                onImport={handleDataImport}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200 bg-white"
                onClick={downloadProspectTemplate}
              >
                <FileCode className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Template JSON</span>
              </Button>
              <Button
                variant="brand"
                size="sm"
                className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
                onClick={exportCsv}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Notification Alert Banner */}
          {importNotification && (
            <div className="p-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="font-semibold">{importNotification}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isCustomDataset && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                    onClick={resetToDefaultData}
                  >
                    Reset Default Dataset
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-emerald-800 hover:text-emerald-950"
                  onClick={() => setImportNotification(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-rose-50/30 to-slate-100/70 border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-100 text-rose-800 border border-rose-200">
                    <Radio className="h-3 w-3 text-rose-600 animate-pulse" /> Verified Sales Intelligence
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Updated Aug 2026</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                  Find the right facility.<br />
                  <span className="bg-gradient-to-r from-[#c91638] via-rose-600 to-amber-600 bg-clip-text text-transparent">
                    Start high-converting conversations.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  Search verified Ontario food processing facilities, discover direct maintenance decision-makers, and copy tailored scale service outreach templates.
                </p>

                {/* Quick Filter Presets */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium mr-1 text-[11px] uppercase tracking-wider">Quick Presets:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-white hover:bg-rose-50 hover:text-rose-900 border-slate-200"
                    onClick={() => applyPreset("tierA")}
                  >
                    🔥 Tier A Priorities ({tierCounts.tierA})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-white hover:bg-slate-100 border-slate-200"
                    onClick={() => applyPreset("emailReady")}
                  >
                    ✉️ Email Ready ({tierCounts.emailReady})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-white hover:bg-emerald-50 hover:text-emerald-900 border-slate-200"
                    onClick={() => applyPreset("highConfidence")}
                  >
                    ⭐ High Confidence ({tierCounts.highConfidence})
                  </Button>
                </div>
              </div>

              {/* Weigh-Tech Focus Card */}
              <Card className="max-w-sm bg-white/90 backdrop-blur-xs border-rose-200/80 shadow-md shadow-rose-500/5 shrink-0 rounded-xl">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#c91638] to-rose-700 text-white shadow-xs">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Weigh-Tech Specialized</h4>
                      <p className="text-[11px] text-slate-500 font-medium">B2B Industrial Scale Services</p>
                    </div>
                  </div>
                  <Separator className="bg-slate-100" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Calibration, load-cell replacement, preventive maintenance, and washdown weighing equipment for food processing plants.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* KPI Metrics Summary Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4" aria-label="Prospect summary">
            {/* Total Prospects Card */}
            <Card className="bg-white border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
              <CardHeader className="p-4 sm:p-5 pb-1">
                <CardDescription className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Total Facilities</span>
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors text-slate-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {prospects.length.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">Ontario food pipeline</p>
                  <Badge variant="secondary" className="text-[10px] font-bold">100%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tier A Priorities Card */}
            <Card className="bg-white border-rose-200/90 shadow-xs hover:shadow-md hover:border-rose-300 transition-all duration-200 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-[#c91638]" />
              <CardHeader className="p-4 sm:p-5 pb-1">
                <CardDescription className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  <span>Tier A Targets</span>
                  <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 group-hover:scale-110 transition-transform">
                    <Flame className="h-4 w-4" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-900">
                  {tierCounts.tierA.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-rose-700 font-medium">Highest priority</p>
                  <Badge variant="tierA" className="text-[10px]">
                    {Math.round((tierCounts.tierA / (prospects.length || 1)) * 100)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Reachable by Email Card */}
            <Card className="bg-white border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
              <CardHeader className="p-4 sm:p-5 pb-1">
                <CardDescription className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Email Reachable</span>
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                    <Mail className="h-4 w-4" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {tierCounts.emailReady.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">Direct or facility email</p>
                  <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
                    {Math.round((tierCounts.emailReady / (prospects.length || 1)) * 100)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* High Confidence Card */}
            <Card className="bg-white border-emerald-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader className="p-4 sm:p-5 pb-1">
                <CardDescription className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  <span>High Confidence</span>
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-1">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-900">
                  {tierCounts.highConfidence.toLocaleString()}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-emerald-700 font-medium">Verified contact route</p>
                  <Badge variant="success" className="text-[10px]">
                    {Math.round((tierCounts.highConfidence / (prospects.length || 1)) * 100)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Main Content: Filters & Interactive Results */}
          <section className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-6 items-start">
            {/* Filter Sidebar Card */}
            <Card className="lg:sticky lg:top-20 bg-white border-slate-200 shadow-xs rounded-xl">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Filter Pipeline
                    </CardTitle>
                  </div>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-2 font-medium"
                      onClick={clearFilters}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear ({activeFilterCount})
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Search Bar Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Keyword Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search company, contact, equipment..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-8 pr-7 text-xs h-9 bg-slate-50/80 border-slate-200 focus:bg-white transition-colors"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* City Location Filter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      City Location
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">{cities.length} cities</span>
                  </div>
                  <Select
                    value={city || "all"}
                    onValueChange={(val) => setCity(val === "all" ? "" : val)}
                  >
                    <SelectTrigger className="h-9 text-xs bg-slate-50/80 border-slate-200">
                      <SelectValue placeholder="All Ontario cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-semibold">
                        All Ontario cities ({prospects.length})
                      </SelectItem>
                      <SelectSeparator />
                      {cities.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-100" />

                {/* Priority Tier Segment Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Priority Tier
                  </label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-lg">
                    {[
                      { id: "", label: "All", count: tierCounts.all },
                      { id: "A", label: "A", count: tierCounts.tierA },
                      { id: "B", label: "B", count: tierCounts.tierB },
                      { id: "C", label: "C", count: tierCounts.tierC },
                    ].map((item) => (
                      <button
                        key={item.id || "all"}
                        type="button"
                        onClick={() => setTier(item.id)}
                        className={`py-1.5 text-xs font-bold rounded-md transition-all flex flex-col items-center justify-center ${
                          tier === item.id
                            ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] font-normal opacity-70">
                          {item.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Contact Readiness Checkboxes */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Contact Readiness
                  </label>
                  <div className="space-y-2.5">
                    <label
                      htmlFor="emailReady"
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="emailReady"
                          checked={emailReady}
                          onCheckedChange={(checked) => setEmailReady(Boolean(checked))}
                        />
                        <span className="text-xs font-medium text-slate-700">Has Usable Email</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{tierCounts.emailReady}</Badge>
                    </label>

                    <label
                      htmlFor="highConfidence"
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="highConfidence"
                          checked={highConfidence}
                          onCheckedChange={(checked) => setHighConfidence(Boolean(checked))}
                        />
                        <span className="text-xs font-medium text-slate-700">High Confidence</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{tierCounts.highConfidence}</Badge>
                    </label>

                    <label
                      htmlFor="draftReady"
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id="draftReady"
                          checked={draftReady}
                          onCheckedChange={(checked) => setDraftReady(Boolean(checked))}
                        />
                        <span className="text-xs font-medium text-slate-700">Outreach Draft Ready</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{tierCounts.draftReady}</Badge>
                    </label>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Sidebar Bottom Actions */}
                <div className="space-y-2 pt-1">
                  <DataImportDialog
                    currentCount={prospects.length}
                    onImport={handleDataImport}
                    triggerButton={
                      <Button
                        variant="outline"
                        className="w-full h-9 font-semibold text-xs gap-1.5 border-slate-200 hover:bg-slate-50"
                      >
                        <Upload className="h-3.5 w-3.5 text-slate-600" />
                        Import More JSON Data
                      </Button>
                    }
                  />

                  <Button
                    onClick={exportCsv}
                    variant="brand"
                    className="w-full h-10 font-bold text-xs gap-1.5 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Filtered List ({filtered.length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-white border-slate-200 shadow-xs rounded-xl overflow-hidden">
              {/* Results Control Toolbar */}
              <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{filtered.length.toLocaleString()} Prospect{filtered.length === 1 ? "" : "s"} Found</span>
                      {activeFilterCount > 0 && (
                        <Badge variant="brand" className="text-[10px] py-0 px-2">Filtered</Badge>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {city ? `Located in ${city}` : "Across all Ontario regions"}
                    </p>
                  </div>
                </div>

                {/* Sort & View Mode Switcher */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                      <ArrowUpDown className="h-3 w-3 text-slate-400" /> Sort:
                    </span>
                    <Select
                      value={sort}
                      onValueChange={(val) => setSort(val as Sort)}
                    >
                      <SelectTrigger className="h-8 w-44 text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Sort results..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority" className="text-xs">
                          Priority (Tier & Rank)
                        </SelectItem>
                        <SelectItem value="company" className="text-xs">
                          Company Name (A–Z)
                        </SelectItem>
                        <SelectItem value="city" className="text-xs">
                          City Location
                        </SelectItem>
                        <SelectItem value="confidence" className="text-xs">
                          Confidence Rating
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setViewMode("cards")}
                          className={`p-1.5 rounded-md transition-colors ${
                            viewMode === "cards"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <LayoutList className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Cards View</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setViewMode("compact")}
                          className={`p-1.5 rounded-md transition-colors ${
                            viewMode === "compact"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <TableIcon className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Compact View</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Tier Legend Color Strip */}
              <div className="px-5 py-2.5 bg-slate-50/30 border-b border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#c91638]" />
                    <strong className="font-semibold text-slate-800">Tier A</strong> (Immediate outreach)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <strong className="font-semibold text-slate-800">Tier B</strong> (High potential)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    <strong className="font-semibold text-slate-800">Tier C</strong> (Niche/Standard)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  Click any account to view facility intel & outreach drafts
                </span>
              </div>

              {/* Prospect Item List */}
              <div className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`w-full text-left p-4 sm:px-6 hover:bg-rose-50/30 transition-all focus-visible:outline-none focus-visible:bg-rose-50/50 group flex items-center justify-between gap-4 cursor-pointer ${
                      viewMode === "compact" ? "py-3" : "py-4 sm:py-5"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Rank Indicator */}
                      <span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">
                        #{item.rank}
                      </span>

                      {/* Company Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-rose-700 transition-colors">
                            {item.companyName}
                          </h3>
                          <Badge
                            variant={
                              item.tier === "A"
                                ? "tierA"
                                : item.tier === "B"
                                ? "tierB"
                                : "tierC"
                            }
                            className="text-[10px] py-0 px-2 tracking-wide uppercase"
                          >
                            Tier {item.tier}
                          </Badge>
                          {item.confidence === "High" && (
                            <Badge variant="success" className="text-[10px] py-0 px-1.5 hidden sm:inline-flex">
                              High Conf
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium flex items-center gap-1.5">
                          <span>{item.operationType}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-semibold">{item.city}</span>
                        </p>
                      </div>

                      {/* Best Contact Column (Desktop) */}
                      <div className="hidden md:flex flex-col min-w-[150px] max-w-[190px]">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Target Contact
                        </span>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {item.primaryContact.name || item.primaryContact.title || "Plant Contact"}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {item.primaryContact.title || "—"}
                        </span>
                      </div>

                      {/* Contact Route Column (Desktop) */}
                      <div className="hidden sm:flex flex-col min-w-[130px] max-w-[160px]">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Route
                        </span>
                        <span
                          className={`text-xs font-semibold truncate flex items-center gap-1 ${
                            item.bestPublicEmail
                              ? "text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          {item.bestPublicEmail ? (
                            <>
                              <Mail className="h-3 w-3" /> Email Available
                            </>
                          ) : (
                            <>
                              <Phone className="h-3 w-3" /> {item.bestPhone ? "Phone Available" : "Facility route"}
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Right Action Icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.bestPublicEmail && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => copyQuickEmail(item, e)}
                              className="hidden sm:flex p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              {copiedQuickId === item.id ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedQuickId === item.id ? "Email Copied!" : "Copy Email"}
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-rose-600 group-hover:bg-rose-100/60 transition-all">
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {!filtered.length && (
                  <div className="py-20 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <FileQuestion className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <p className="text-base font-bold text-slate-900">
                        No prospects match current filters
                      </p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your keywords, selecting all cities, or importing external JSON data.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs font-semibold"
                    >
                      Clear All Active Filters
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </main>

        {/* Prospect Detail Drawer / Slide-Over Sheet */}
        <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
          {selected && (
            <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto space-y-6 p-6 sm:p-8">
              {/* Header Info */}
              <SheetHeader className="space-y-2 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-rose-800 border-rose-200 bg-rose-50 font-bold">
                    {selected.city} • Rank #{selected.rank}
                  </Badge>
                </div>
                <SheetTitle className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {selected.companyName}
                </SheetTitle>
                <SheetDescription className="text-sm font-medium text-slate-500">
                  {selected.operationType}
                </SheetDescription>

                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <Badge
                    variant={
                      selected.tier === "A"
                        ? "tierA"
                        : selected.tier === "B"
                        ? "tierB"
                        : "tierC"
                    }
                  >
                    Tier {selected.tier} Priority
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selected.confidence || "Standard"} Confidence
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selected.outreach.status || "Ready to contact"}
                  </Badge>
                </div>
              </SheetHeader>

              {/* Navigation Tabs Inside Sheet */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-slate-100">
                  <TabsTrigger value="overview" className="text-xs font-bold">
                    Facility & Contacts
                  </TabsTrigger>
                  <TabsTrigger value="outreach" className="text-xs font-bold">
                    Outreach Scripts
                  </TabsTrigger>
                  <TabsTrigger value="intel" className="text-xs font-bold">
                    Intel & Sources
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Overview & Contacts */}
                <TabsContent value="overview" className="space-y-5 pt-4">
                  {/* Facility Location */}
                  <section className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-600" /> Facility Location
                    </h4>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 flex items-start justify-between gap-3">
                      <div>
                        <p>{selected.facilityAddress || "Facility address not specified."}</p>
                        <p className="text-xs text-slate-500 mt-1">{selected.city}, Ontario</p>
                      </div>
                      {selected.facilityAddress && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-700 hover:text-rose-900 px-2 shrink-0"
                          asChild
                        >
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${selected.companyName} ${selected.facilityAddress}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            Map ↗
                          </a>
                        </Button>
                      )}
                    </div>
                  </section>

                  {/* People & Contact Routes */}
                  <section className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-rose-600" /> Best People & Contact Routes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ContactDetailCard
                        title="Primary Contact"
                        contact={selected.primaryContact}
                        fallbackEmail={selected.bestPublicEmail}
                        fallbackPhone={selected.bestPhone}
                      />
                      <ContactDetailCard
                        title="Secondary / Route"
                        contact={selected.secondaryContact}
                        fallbackEmail={selected.generalContact.email}
                        fallbackPhone={selected.generalContact.phone}
                      />
                    </div>
                  </section>

                  {/* Likely Weigh-Tech Opportunities */}
                  <section className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-rose-600" /> Likely Scale Opportunities
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.likelyScaleOpportunities.length ? (
                        selected.likelyScaleOpportunities.map((opp) => (
                          <Badge
                            key={opp}
                            variant="secondary"
                            className="bg-rose-50 text-rose-900 border-rose-200 text-xs py-1 px-2.5 font-semibold"
                          >
                            {opp}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">
                          Review facility weighing needs during introductory call.
                        </span>
                      )}
                    </div>
                  </section>

                  {/* Recommended First Ask */}
                  <section className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recommended First Ask
                    </h4>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-medium">
                      {selected.recommendedFirstAsk || "—"}
                    </div>
                  </section>
                </TabsContent>

                {/* Tab 2: Outreach Scripts */}
                <TabsContent value="outreach" className="space-y-5 pt-4">
                  {/* Custom Email Outreach Card */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-rose-600" /> Tailored Email Draft
                      </h4>
                      {selected.outreach.customEmail && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-white font-semibold"
                          onClick={() => copy("email", selected.outreach.customEmail)}
                        >
                          {copied === "email" ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-emerald-600" />
                              Copied Body
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Email
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {selected.outreach.customEmail ? (
                      <Card className="bg-rose-50/30 border-rose-200 shadow-xs overflow-hidden">
                        <div className="p-3 bg-white border-b border-rose-100 flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            Subject: {selected.outreach.emailSubject || "Custom Outreach"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-rose-700 hover:text-rose-900 px-2"
                            onClick={() => copy("subject", selected.outreach.emailSubject)}
                          >
                            {copied === "subject" ? "Copied" : "Copy Subject"}
                          </Button>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div className="text-xs whitespace-pre-wrap text-slate-700 font-mono bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed max-h-64 overflow-y-auto">
                            {selected.outreach.customEmail}
                          </div>
                          {selected.bestPublicEmail && (
                            <div className="flex justify-end pt-1">
                              <Button
                                variant="brand"
                                size="sm"
                                className="h-8 text-xs font-bold gap-1.5"
                                asChild
                              >
                                <a
                                  href={`mailto:${selected.bestPublicEmail}?subject=${encodeURIComponent(
                                    selected.outreach.emailSubject
                                  )}&body=${encodeURIComponent(selected.outreach.customEmail)}`}
                                >
                                  <Send className="h-3 w-3" />
                                  Open in Email App
                                </a>
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No custom email stored for this account. Use the recommended first ask to start the conversation.
                      </p>
                    )}
                  </section>

                  {/* Phone Opener Script */}
                  {selected.outreach.callOpener && (
                    <section className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-rose-600" /> Phone Call Opener
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-white"
                          onClick={() => copy("call", selected.outreach.callOpener)}
                        >
                          {copied === "call" ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-emerald-600" />
                              Copied Opener
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Script
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                        &ldquo;{selected.outreach.callOpener}&rdquo;
                      </div>
                    </section>
                  )}

                  {selected.outreach.recommendedContactMethod && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                      <Compass className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Recommended Strategy: </strong>
                        <span>{selected.outreach.recommendedContactMethod}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Intel & Research Sources */}
                <TabsContent value="intel" className="space-y-4 pt-4">
                  <section className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Company Intelligence & Profile
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
                        <span className="text-slate-500">Operation Status:</span>
                        <span className="font-semibold text-slate-900">{selected.contactStatus || "Active"}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
                        <span className="text-slate-500">Last Verified:</span>
                        <span className="font-semibold text-slate-900">{selected.lastChecked || "Recent"}</span>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      External Verification Links
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selected.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-9 justify-between bg-white border-slate-200"
                          asChild
                        >
                          <a href={selected.website} target="_blank" rel="noreferrer">
                            <span>Company Website</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                          </a>
                        </Button>
                      )}
                      {selected.contactProfileSource && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-9 justify-between bg-white border-slate-200"
                          asChild
                        >
                          <a href={selected.contactProfileSource} target="_blank" rel="noreferrer">
                            <span>Contact Source</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                          </a>
                        </Button>
                      )}
                      {selected.companySource && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-9 justify-between bg-white border-slate-200"
                          asChild
                        >
                          <a href={selected.companySource} target="_blank" rel="noreferrer">
                            <span>Facility Source</span>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </section>
                </TabsContent>
              </Tabs>
            </SheetContent>
          )}
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
