"use server";

import fetchWithCookies from "@/lib/fetcher";
import { parseIndexTT } from "@/lib/parser";
import type { TimetableRow } from "@/types";

const REFERER = "https://simsweb4.uitm.edu.my/estudent/class_timetable/indexIllIl.cfm";

export async function getTimetable(url: string): Promise<{ url: string; timetable: TimetableRow[] }> {
  if (!url) throw new Error("Missing url");

  const resp = await fetchWithCookies(url, {
    headers: { Referer: REFERER, "User-Agent": "Mozilla/5.0" },
  });
  const html = await resp.text();
  const timetable = parseIndexTT(html);
  return { url, timetable };
}
