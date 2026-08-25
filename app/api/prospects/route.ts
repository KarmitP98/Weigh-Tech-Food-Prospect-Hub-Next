import { prospectData } from "@/lib/prospects";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(prospectData);
}
