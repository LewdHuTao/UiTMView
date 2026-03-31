"use server";

import fetchWithCookies from "@/lib/fetcher";
import type { Faculty } from "@/types";

const BASE_URL = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";

export async function getFaculties(): Promise<Faculty[]> {
  const resp = await fetchWithCookies(
    BASE_URL + "cfc/select.cfc?method=FAC_lII1II11I1lIIII11IIl1I111II&key=All&page=1&page_limit=30",
    { headers: { Referer: BASE_URL + "indexIllIl.cfm" } }
  );
  const data = await resp.json() as { results: Faculty[] };
  return data.results;
}
