import { ProspectDashboard } from "@/components/prospect-dashboard";
import { prospectData } from "@/lib/prospects";

export default function Home() {
  return <ProspectDashboard data={prospectData} />;
}
