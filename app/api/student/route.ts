import { NextRequest, NextResponse } from "next/server";
import type { StudentSchedule, StudentDaySchedule, TimetableRow } from "@/types";

function extractFirstWeek(schedule: StudentSchedule): TimetableRow[] {
  const entries = Object.entries(schedule)
    .filter(([, v]) => v !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return [];

  const firstDate = new Date(entries[0][0]);
  const weekEnd = new Date(firstDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const firstWeekEntries = entries.filter(([dateStr]) => {
    const d = new Date(dateStr);
    return d >= firstDate && d <= weekEnd;
  });

  const rows: TimetableRow[] = [];
  firstWeekEntries.forEach(([, dayData]) => {
    const d = dayData as StudentDaySchedule;
    d.jadual.forEach((cls) => {
      const parts = cls.masa.split("-").map((s) => s.trim());
      const timeStr = parts.length >= 2
        ? `${parts[0].replace(/\s*(AM|PM)/i, "$1").trim()}-${parts[1].replace(/\s*(AM|PM)/i, "$1").trim()}`
        : cls.masa;

      rows.push({
        no: "",
        day: d.hari,
        time: timeStr,
        group: cls.groups,
        mode: "",
        status: "",
        room: cls.bilik,
        program: "",
        faculty: cls.lecturer ?? "",
        course: cls.courseid,
        subject: cls.course_desc,
      });
    });
  });

  return rows;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentNo = searchParams.get("studentNo");
  if (!studentNo) return NextResponse.json({ error: "Missing studentNo" }, { status: 400 });

  try {
    const resp = await fetch(
      `https://cdn.uitm.edu.my/jadual/baru/${studentNo}.json`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 300 } }
    );
    if (!resp.ok) {
      return NextResponse.json({ error: "Student not found or schedule unavailable" }, { status: 404 });
    }
    const schedule: StudentSchedule = await resp.json();
    const timetable = extractFirstWeek(schedule);
    return NextResponse.json({ timetable });
  } catch (err) {
    console.error("Error fetching student schedule:", err);
    return NextResponse.json({ error: "Failed to fetch student schedule" }, { status: 500 });
  }
}
