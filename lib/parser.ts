import * as cheerio from "cheerio";
import type { TimetableRow } from "@/types";

export function parseIndexTT(html: string): TimetableRow[] {
  const $ = cheerio.load(html);

  const headerText = $("body").text();
  const match = headerText.match(/COURSE\s*:\s*(\w+)/);
  let courseCode = match ? match[1] : null;
  if (courseCode) courseCode = courseCode.replace(/CAMPUS$/i, "");

  const rows: TimetableRow[] = [];
  $("#example tbody tr").each((_, row) => {
    const cols = $(row)
      .find("td, th")
      .map((_, td) => $(td).text().trim().replace(/\s+/g, " "))
      .get();

    if (cols.length >= 1) {
      let mode = cols[3] || "";
      let status = cols[4] || "";
      mode = mode.replace(/Fulltimeand/i, "Fulltime and");
      status = status.replace(/Timerand/i, "Timer and");

      let day = "", time = "";
      const dayTime = cols[1] || "";
      const dtMatch = dayTime.match(/([A-Z]+)\s*\(?([0-9:AMP\- ]+)?\)?/i);
      if (dtMatch) {
        day = dtMatch[1] || "";
        time = dtMatch[2] || "";
      }

      rows.push({
        no: cols[0] || "",
        day,
        time,
        group: cols[2] || "",
        mode,
        status,
        room: cols[5] || "",
        program: cols[6] || "",
        faculty: cols[7] || "",
        course: courseCode,
      });
    }
  });

  return rows;
}

export function removeScripts(html: string): string {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}
