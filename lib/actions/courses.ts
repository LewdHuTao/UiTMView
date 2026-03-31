"use server";

import * as cheerio from "cheerio";
import fetchWithCookies from "@/lib/fetcher";
import { removeScripts } from "@/lib/parser";
import { extractAjaxUrl, extractJsMutations } from "@/lib/scraper";
import { getCache, setCache } from "@/lib/cache";
import type { Course } from "@/types";

const BASE_URL = "https://simsweb4.uitm.edu.my/estudent/class_timetable/";
const CACHE_TTL = 1000 * 60 * 10;

async function fetchCourses(campus: string, faculty: string): Promise<Course[]> {
  const formPage = await fetchWithCookies(BASE_URL + "indexIllIl.cfm", {
    headers: { "User-Agent": "Mozilla/5.0", Referer: BASE_URL + "indexIllIl.cfm" },
  });

  const formHtml = await formPage.text();
  const $form = cheerio.load(formHtml);

  const ajaxUrl = extractAjaxUrl(formHtml);
  if (!ajaxUrl) throw new Error("Could not find AJAX URL in page scripts");

  const resultUrl = BASE_URL + ajaxUrl;
  const jsMutations = extractJsMutations(formHtml);
  const formData = new URLSearchParams();

  $form("input").each((_, el) => {
    const name = $form(el).attr("name");
    const id = $form(el).attr("id");
    const value = $form(el).attr("value") || "";
    if (name) {
      const mutatedValue = id && jsMutations[id] !== undefined ? jsMutations[id] : value;
      formData.set(name, mutatedValue);
    }
  });

  $form("select").each((_, el) => {
    const name = $form(el).attr("name");
    const selected =
      $form(el).find("option[selected]").attr("value") ||
      $form(el).find("option").first().attr("value") ||
      "";
    if (name) formData.set(name, selected);
  });

  formData.set("search_campus", campus);
  formData.set("search_course", "");
  if (faculty) formData.set("search_faculty", faculty);

  const resp = await fetchWithCookies(resultUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: BASE_URL + "indexIllIl.cfm",
      "User-Agent": "Mozilla/5.0",
    },
    body: formData,
  });

  const html = await resp.text();
  const cleanHtml = removeScripts(html);
  const $ = cheerio.load(cleanHtml);

  const courses: Course[] = [];
  $("tr").each((i, row) => {
    if (i === 0) return;
    const tds = $(row).find("td");
    const link = $(row).find("a").attr("href");
    if (tds.length >= 2 && link && link.includes("index_tt.cfm")) {
      courses.push({
        code: $(tds[1]).text().trim().replace(/^\./, ""),
        url: BASE_URL + link,
      });
    }
  });

  return courses;
}

export async function getCourses(campus: string, faculty: string): Promise<Course[]> {
  if (!campus || !faculty) throw new Error("Missing campus or faculty");

  const cacheKey = `courses_${campus}_${faculty}`;
  const cached = getCache<Course[]>(cacheKey, CACHE_TTL);
  if (cached) return cached;

  const tries = [
    { campus, faculty },
    { campus, faculty: "" },
    { campus, faculty: "All" },
  ];

  let courses: Course[] = [];
  for (const payload of tries) {
    try {
      courses = await fetchCourses(payload.campus, payload.faculty);
      if (courses.length > 0) break;
    } catch { continue; }
  }

  setCache(cacheKey, courses);
  return courses;
}
