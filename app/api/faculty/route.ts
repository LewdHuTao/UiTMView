import { NextResponse } from "next/server";
import fetchWithCookies from "@/lib/fetcher";

const BASE_URL = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

export async function GET() {
  try {
    const resp = await fetchWithCookies(
      BASE_URL + "cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111II&key=All&page=1&page_limit=30",
      { headers: { Referer: BASE_URL + "indexIllIl.cfm" } }
    );
    const data = await resp.json() as { results: Array<{ id: string; text: string }> };
    return NextResponse.json(data.results);
  } catch (err) {
    console.error("Error fetching faculties:", err);
    return NextResponse.json({ error: "Failed to fetch faculties" }, { status: 500 });
  }
}
