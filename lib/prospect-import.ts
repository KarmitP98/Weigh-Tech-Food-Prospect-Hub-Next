import type { Prospect, ProspectData } from "./types";

export const SAMPLE_PROSPECT_TEMPLATE: ProspectData = {
  generatedAt: new Date().toISOString().split("T")[0],
  recordCount: 2,
  prospects: [
    {
      id: "mississauga-1-sample-bakery-processing",
      rank: 1,
      tier: "A",
      companyName: "Sample Bakery & Snack Foods Inc.",
      city: "Mississauga",
      facilityAddress: "1250 Britannia Rd E, Mississauga, ON L4W 1C8",
      operationType: "Commercial Bakery & Snack Food Processing",
      primaryContact: {
        name: "Jane Smith",
        title: "Plant & Operations Manager",
        email: "jsmith@samplebakery.ca",
        phone: "905-555-0182",
      },
      secondaryContact: {
        name: "David Miller",
        title: "Maintenance Supervisor",
        email: "dmiller@samplebakery.ca",
        phone: "905-555-0183",
      },
      generalContact: {
        email: "info@samplebakery.ca",
        phone: "905-555-0100",
      },
      bestPublicEmail: "jsmith@samplebakery.ca",
      bestPhone: "905-555-0182",
      website: "https://www.samplebakery.ca",
      contactProfileSource: "https://www.linkedin.com/in/sample-contact",
      companySource: "https://www.samplebakery.ca/about",
      contactStatus: "Active food processor in Peel Region",
      confidence: "High",
      likelyScaleOpportunities: [
        "Bench & portion scales",
        "Floor & pallet scales",
        "Receiving & shipping scales",
        "Annual calibration & PM service",
      ],
      recommendedFirstAsk:
        "Ask for Plant Maintenance or Operations lead regarding annual scale calibration and PM service.",
      outreach: {
        status: "Ready",
        emailSubject:
          "Industrial scale calibration & service support – Sample Bakery (Mississauga)",
        customEmail:
          "Hello Jane,\n\nI’m reaching out from Weigh-Tech Solutions. We provide industrial scale calibration, repair, preventive maintenance, and replacement weighing equipment for food manufacturers across Southern Ontario.\n\nFor your Mississauga facility, we can support batching, portion, floor, and receiving scales.\n\nCould we arrange a quick conversation or site visit to review your weighing equipment and calibration needs?\n\nBest regards,\nWeigh-Tech Solutions\nsales@weightechsolutions.ca\nwww.weightechsolutions.ca",
        callOpener:
          "Hi Jane, this is Karmit from Weigh-Tech Solutions. I’m looking for the person managing scale calibration and maintenance at your Mississauga facility.",
        recommendedContactMethod:
          "Direct email to Plant Manager, follow up by phone.",
      },
      lastChecked: new Date().toISOString().split("T")[0],
    },
    {
      id: "guelph-2-sample-dairy-plant",
      rank: 2,
      tier: "B",
      companyName: "Sample Heritage Dairy Co.",
      city: "Guelph",
      facilityAddress: "500 Speedvale Ave W, Guelph, ON N1K 1E5",
      operationType: "Dairy Processing & Bottling",
      primaryContact: {
        name: "Robert Chen",
        title: "Director of Plant Maintenance",
        email: "rchen@sampledairy.ca",
        phone: "519-555-0144",
      },
      secondaryContact: {
        name: "",
        title: "Quality Assurance Lead",
        email: "",
        phone: "",
      },
      generalContact: {
        email: "contact@sampledairy.ca",
        phone: "519-555-0100",
      },
      bestPublicEmail: "rchen@sampledairy.ca",
      bestPhone: "519-555-0144",
      website: "https://www.sampledairy.ca",
      contactProfileSource: "https://www.linkedin.com/company/sample-dairy",
      companySource: "https://www.sampledairy.ca/facility",
      contactStatus: "Operating dairy plant",
      confidence: "High",
      likelyScaleOpportunities: [
        "Washdown stainless steel scales",
        "Tank/hopper weighing systems",
        "Checkweighers",
        "Preventive maintenance contracts",
      ],
      recommendedFirstAsk:
        "Connect with Maintenance / Engineering regarding washdown scale maintenance.",
      outreach: {
        status: "Ready",
        emailSubject:
          "Washdown scale calibration & service – Sample Heritage Dairy Guelph",
        customEmail:
          "Hello Robert,\n\nI’m reaching out from Weigh-Tech Solutions regarding industrial washdown scale calibration, load cell replacement, and preventive maintenance for dairy and food processing facilities in the Guelph area.\n\nWould you have a few minutes this week to discuss your scale service requirements?\n\nBest regards,\nWeigh-Tech Solutions",
        callOpener:
          "Hi Robert, Karmit from Weigh-Tech Solutions. Following up on weighing equipment calibration for your Guelph plant.",
        recommendedContactMethod: "Email or phone to Plant Maintenance",
      },
      lastChecked: new Date().toISOString().split("T")[0],
    },
  ],
};

export function downloadProspectTemplate() {
  const jsonContent = JSON.stringify(SAMPLE_PROSPECT_TEMPLATE, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "weigh-tech-prospect-template.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateAndNormalizeProspects(
  rawData: unknown,
  existingCount: number = 0
): { success: true; prospects: Prospect[]; count: number } | { success: false; error: string } {
  if (!rawData || typeof rawData !== "object") {
    return {
      success: false,
      error: "Uploaded file is not a valid JSON object or array.",
    };
  }

  let items: unknown[] = [];

  if (Array.isArray(rawData)) {
    items = rawData;
  } else if ("prospects" in (rawData as Record<string, unknown>)) {
    const list = (rawData as Record<string, unknown>).prospects;
    if (Array.isArray(list)) {
      items = list;
    } else {
      return {
        success: false,
        error: "The 'prospects' field in the JSON file must be an array of prospects.",
      };
    }
  } else {
    // Maybe single prospect object
    items = [rawData];
  }

  if (items.length === 0) {
    return {
      success: false,
      error: "The JSON file contains no prospect records.",
    };
  }

  const normalized: Prospect[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== "object") {
      return {
        success: false,
        error: `Prospect item at index ${i} is not a valid JSON object.`,
      };
    }

    const rec = item as Record<string, unknown>;

    const companyName = String(rec.companyName || rec.company || "").trim();
    if (!companyName) {
      return {
        success: false,
        error: `Prospect at index ${i + 1} is missing a required 'companyName' field.`,
      };
    }

    const city = String(rec.city || "Ontario").trim();
    const tierRaw = String(rec.tier || "B").toUpperCase().trim();
    const tier = (["A", "B", "C"].includes(tierRaw) ? tierRaw : "B") as "A" | "B" | "C";

    const id = String(
      rec.id ||
        `${city.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${existingCount + i + 1}-${companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
    );

    const primaryContactRaw = (rec.primaryContact || {}) as Record<string, unknown>;
    const secondaryContactRaw = (rec.secondaryContact || {}) as Record<string, unknown>;
    const generalContactRaw = (rec.generalContact || {}) as Record<string, unknown>;
    const outreachRaw = (rec.outreach || {}) as Record<string, unknown>;

    const likelyScaleOpportunities: string[] = Array.isArray(rec.likelyScaleOpportunities)
      ? rec.likelyScaleOpportunities.map((s) => String(s))
      : [];

    const prospect: Prospect = {
      id,
      rank: Number(rec.rank) || existingCount + i + 1,
      tier,
      companyName,
      city,
      facilityAddress: String(rec.facilityAddress || rec.address || ""),
      operationType: String(rec.operationType || rec.operation || "Food Manufacturing"),
      primaryContact: {
        name: String(primaryContactRaw.name || rec.contactName || ""),
        title: String(primaryContactRaw.title || rec.contactTitle || ""),
        email: String(primaryContactRaw.email || rec.contactEmail || ""),
        phone: String(primaryContactRaw.phone || rec.contactPhone || ""),
      },
      secondaryContact: {
        name: String(secondaryContactRaw.name || ""),
        title: String(secondaryContactRaw.title || ""),
        email: String(secondaryContactRaw.email || ""),
        phone: String(secondaryContactRaw.phone || ""),
      },
      generalContact: {
        email: String(generalContactRaw.email || ""),
        phone: String(generalContactRaw.phone || rec.phone || ""),
      },
      bestPublicEmail: String(
        rec.bestPublicEmail || primaryContactRaw.email || generalContactRaw.email || ""
      ),
      bestPhone: String(
        rec.bestPhone || primaryContactRaw.phone || generalContactRaw.phone || rec.phone || ""
      ),
      website: String(rec.website || ""),
      contactProfileSource: String(rec.contactProfileSource || ""),
      companySource: String(rec.companySource || ""),
      contactStatus: String(rec.contactStatus || "Ready to contact"),
      confidence: (["High", "Medium", "Low"].includes(String(rec.confidence))
        ? String(rec.confidence)
        : "Medium") as "High" | "Medium" | "Low",
      likelyScaleOpportunities,
      recommendedFirstAsk: String(rec.recommendedFirstAsk || "Review weighing requirements."),
      outreach: {
        status: String(outreachRaw.status || "Ready"),
        emailSubject: String(outreachRaw.emailSubject || `Weighing scale service for ${companyName}`),
        customEmail: String(outreachRaw.customEmail || ""),
        callOpener: String(outreachRaw.callOpener || ""),
        recommendedContactMethod: String(
          outreachRaw.recommendedContactMethod || "Email or phone outreach"
        ),
      },
      lastChecked: String(rec.lastChecked || new Date().toISOString().split("T")[0]),
    };

    normalized.push(prospect);
  }

  return {
    success: true,
    prospects: normalized,
    count: normalized.length,
  };
}
