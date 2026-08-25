"use client";

import React, { useState, useRef } from "react";
import type { Prospect } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  downloadProspectTemplate,
  validateAndNormalizeProspects,
} from "@/lib/prospect-import";
import {
  Upload,
  FileCode,
  Download,
  AlertCircle,
  CheckCircle2,
  FileJson,
  Plus,
  RefreshCw,
} from "lucide-react";

interface DataImportDialogProps {
  currentCount: number;
  onImport: (newProspects: Prospect[], mode: "append" | "replace") => void;
  triggerButton?: React.ReactNode;
}

export function DataImportDialog({
  currentCount,
  onImport,
  triggerButton,
}: DataImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewProspects, setPreviewProspects] = useState<Prospect[]>([]);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setError(null);
    setPreviewProspects([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileProcess = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".json")) {
      setError("Please select a valid .json file.");
      setFile(null);
      setPreviewProspects([]);
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setError("Invalid JSON syntax: Unable to parse file content.");
        setPreviewProspects([]);
        return;
      }

      const result = validateAndNormalizeProspects(parsed, currentCount);
      if (!result.success) {
        setError(result.error);
        setPreviewProspects([]);
      } else {
        setPreviewProspects(result.prospects);
        setError(null);
      }
    } catch {
      setError("An error occurred while reading the file.");
      setPreviewProspects([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleFileProcess(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileProcess(droppedFile);
    }
  };

  const handleConfirmImport = () => {
    if (previewProspects.length === 0) return;
    onImport(previewProspects, importMode);
    setOpen(false);
    resetState();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold">
            <Upload className="h-3.5 w-3.5" />
            Add / Import JSON Data
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Import Prospect Data
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add additional food processing accounts by uploading a structured JSON file matching Weigh-Tech’s prospect schema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template Download Card */}
          <Card className="bg-brand-50/50 border-brand-200">
            <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-md bg-white border border-brand-200 text-primary shrink-0">
                  <FileCode className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold text-foreground">Need the JSON format?</p>
                  <p className="text-muted-foreground">
                    Download our ready-to-use template with sample fields and contacts.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="brandOutline"
                size="sm"
                className="text-xs h-8 gap-1.5 shrink-0"
                onClick={downloadProspectTemplate}
              >
                <Download className="h-3.5 w-3.5" />
                Download Template JSON
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* File Upload Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 rounded-full bg-muted text-muted-foreground">
                <Upload className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {file ? file.name : "Click to browse or drop your JSON file here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Accepts <code className="bg-muted px-1 py-0.5 rounded text-[11px]">.json</code> containing a prospect array or full export
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Validation Preview */}
          {previewProspects.length > 0 && !error && (
            <div className="space-y-3 p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {previewProspects.length} valid prospect{previewProspects.length === 1 ? "" : "s"} ready to import
                </span>
                <Badge variant="outline" className="text-[10px] bg-white border-emerald-300 text-emerald-800">
                  Valid Schema
                </Badge>
              </div>

              {/* Sample list preview */}
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {previewProspects.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="text-xs bg-white p-1.5 px-2.5 rounded border border-emerald-100 flex items-center justify-between"
                  >
                    <span className="font-medium text-foreground truncate max-w-[240px]">
                      {p.companyName}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {p.city} · Tier {p.tier}
                    </span>
                  </div>
                ))}
                {previewProspects.length > 5 && (
                  <p className="text-[11px] text-emerald-700 text-center pt-0.5">
                    + {previewProspects.length - 5} more records
                  </p>
                )}
              </div>

              {/* Import Mode Options */}
              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium">Import Strategy:</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={importMode === "append" ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setImportMode("append")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Append to Existing
                  </Button>
                  <Button
                    type="button"
                    variant={importMode === "replace" ? "destructive" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setImportMode("replace")}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Replace Dataset
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen(false);
              resetState();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            size="sm"
            disabled={previewProspects.length === 0}
            onClick={handleConfirmImport}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            Import {previewProspects.length > 0 ? `${previewProspects.length} Prospects` : "Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
