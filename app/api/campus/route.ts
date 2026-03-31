import { NextResponse } from "next/server";
import fetchWithCookies from "@/lib/fetcher";

const BASE_URL = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

export async function GET() {
  try {
    const resp = await fetchWithCookies(
      BASE_URL + "cfc/select.cfc?method=CAM_lII1II11I1lIIII11IIl1I111II&key=s&page=1&page_limit=30",
      { headers: { Referer: BASE_URL + "indexIllIl.cfm" } }
    );
    const data = await resp.json() as { results: Array<{ id: string; text: string }> };
    return NextResponse.json(data.results.filter((r) => r.id !== "X"));
  } catch (err) {
    console.error("Error fetching campuses:", err);
    return NextResponse.json({ error: "Failed to fetch campuses" }, { status: 500 });
  }
}
