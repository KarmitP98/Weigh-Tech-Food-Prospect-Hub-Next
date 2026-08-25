export type Contact = {
  name: string;
  title: string;
  email: string;
  phone: string;
};

export type Prospect = {
  id: string;
  rank: number;
  tier: "A" | "B" | "C";
  companyName: string;
  city: string;
  facilityAddress: string;
  operationType: string;
  primaryContact: Contact;
  secondaryContact: Contact;
  generalContact: { email: string; phone: string };
  bestPublicEmail: string;
  bestPhone: string;
  website: string;
  contactProfileSource: string;
  companySource: string;
  contactStatus: string;
  confidence: "High" | "Medium" | "Low" | string;
  likelyScaleOpportunities: string[];
  recommendedFirstAsk: string;
  outreach: {
    status: string;
    emailSubject: string;
    customEmail: string;
    callOpener: string;
    recommendedContactMethod: string;
  };
  lastChecked: string;
};

export type ProspectData = {
  generatedAt: string;
  recordCount: number;
  prospects: Prospect[];
};
