"use server";

import fetchWithCookies from "@/lib/fetcher";
import type { Campus } from "@/types";

const BASE_URL = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

export async function getCampuses(): Promise<Campus[]> {
  const resp = await fetchWithCookies(
    BASE_URL + "cfc/select.cfc?method=CAM_lII1II11I1lIIII11IIl1I111II&key=s&page=1&page_limit=30",
    { headers: { Referer: BASE_URL + "indexIllIl.cfm" } }
  );
  const data = await resp.json() as { results: Campus[] };
  return data.results.filter((r) => r.id !== "X");
}
