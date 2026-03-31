import { NextRequest, NextResponse } from "next/server";
import fetchWithCookies from "@/lib/fetcher";
import { parseIndexTT } from "@/lib/parser";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const resp = await fetchWithCookies(url, {
      headers: {
        Referer: "https://simsweb4.uitm.edu.my/estudent/class_timetable/indexIllIl.cfm",
        "User-Agent": "Mozilla/5.0",
      },
    });
    const html = await resp.text();
    const timetable = parseIndexTT(html);
    return NextResponse.json({ url, timetable });
  } catch (err) {
    console.error("❌ Error fetching timetable:", err);
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}
