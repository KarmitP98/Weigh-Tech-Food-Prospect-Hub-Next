import rawProspects from "@/data/prospects.json";
import type { ProspectData } from "@/lib/types";

export const prospectData = rawProspects as ProspectData;
export const prospects = prospectData.prospects;

export function dashboardSummary(items = prospects) {
  return {
    totalProspects: items.length,
    cities: new Set(items.map((item) => item.city)).size,
    tierA: items.filter((item) => item.tier === "A").length,
    usableEmails: items.filter((item) => item.bestPublicEmail).length,
    highConfidence: items.filter((item) => item.confidence === "High").length,
    lastDataRefresh: prospectData.generatedAt,
  };
}
