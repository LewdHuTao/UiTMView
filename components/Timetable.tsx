"use client";

import type { SelectedCard } from "@/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT: Record<string, string> = {
  Sunday: "SUN", Monday: "MON", Tuesday: "TUE",
  Wednesday: "WED", Thursday: "THU", Friday: "FRI", Saturday: "SAT",
};

function parseTimeToFloat(str: string): number | null {
  if (!str) return null;
  const m = String(str).trim().match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const mer = m[3]?.toUpperCase();
  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h + min / 60;
}

function extractStartEnd(raw: string): [number | null, number | null] {
  const parts = String(raw || "").split(/[-–—]/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) return [parseTimeToFloat(parts[0]), parseTimeToFloat(parts[1])];
  const a = parseTimeToFloat(raw);
  return [a, a ? a + 1 : null];
}

function fmt(tf: number): string {
  const h = Math.floor(tf);
  const m = Math.round((tf - h) * 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

function lum(hex: string): number {
  const h = hex.replace("#", "");
  const toL = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * toL(parseInt(h.slice(0, 2), 16)) + 0.7152 * toL(parseInt(h.slice(2, 4), 16)) + 0.0722 * toL(parseInt(h.slice(4, 6), 16));
}
const fg = (hex: string) => lum(hex) > 0.45 ? "#0f0f11" : "#ffffff";

function mergeBlocks(
  blocks: { s: number; e: number; code: string; time: string; room: string; bg: string }[]
) {
  if (blocks.length === 0) return blocks;

  const sorted = [...blocks].sort((a, b) => a.s - b.s);
  const merged = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = sorted[i];

    const sameCode = prev.code === cur.code;

    const sameRoom =
      prev.room && cur.room
        ? prev.room === cur.room
        : true;

    const consecutive = Math.abs(prev.e - cur.s) < 0.02;

    if (sameCode && sameRoom && consecutive) {
      prev.e = cur.e;
      prev.time = `${fmt(prev.s)}–${fmt(prev.e)}`;
    } else {
      merged.push({ ...cur });
    }
  }

  return merged;
}

const LEFT_COL_PX = 64;
const COL_PX = 90;
const ROW_H = 108;
const HEADER_H = 36;

interface TimetableProps {
  selectedCards: (SelectedCard | null)[];
}

export default function Timetable({ selectedCards }: TimetableProps) {
  const active = selectedCards.filter(Boolean) as SelectedCard[];

  const daysUsed = new Set<string>();
  active.forEach(item => item.timetable.forEach(r => {
    const d = String(r.day).charAt(0).toUpperCase() + String(r.day).slice(1).toLowerCase();
    if (DAYS.includes(d)) daysUsed.add(d);
  }));
  const days = DAYS.filter(d => daysUsed.has(d));

  let minH = 24, maxH = 0;
  active.forEach(item => item.timetable.forEach(r => {
    const [s, e] = extractStartEnd(r.time || "");
    if (s !== null) minH = Math.min(minH, s);
    if (e !== null) maxH = Math.max(maxH, e);
  }));
  if (minH === 24 && maxH === 0) { minH = 8; maxH = 18; }
  minH = Math.floor(minH);
  maxH = Math.ceil(maxH);
  if (maxH <= minH) maxH = minH + 1;

  const cols = maxH - minH;
  const totalW = LEFT_COL_PX + cols * COL_PX;
  const hours = Array.from({ length: cols }, (_, i) => minH + i);

  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-600">
        <svg className="w-14 h-14 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">No classes to display</p>
        <p className="text-xs mt-1 text-gray-600">Add subjects or enter your student ID</p>
      </div>
    );
  }

  return (
    <div id="timetableGrid" className="overflow-x-auto rounded-xl bg-[#111113]">
      <div style={{ width: totalW, minWidth: totalW }}>
        <div className="flex" style={{ height: HEADER_H }}>
          <div style={{ width: LEFT_COL_PX, minWidth: LEFT_COL_PX }} className="bg-[#111113] border-b border-r border-white/8" />
          {hours.map(h => (
            <div
              key={h}
              style={{ width: COL_PX, minWidth: COL_PX }}
              className="flex items-center justify-start pl-2 text-[11px] font-medium text-gray-500 bg-[#111113] border-b border-r border-white/8"
            >
              {h}:00
            </div>
          ))}
        </div>

        {days.map((day, di) => {
          const blocks: { s: number; e: number; code: string; time: string; room: string; bg: string }[] = [];
          active.forEach(item => {
            item.timetable.forEach(r => {
              const d = String(r.day).charAt(0).toUpperCase() + String(r.day).slice(1).toLowerCase();
              if (d !== day) return;
              const [s, e] = extractStartEnd(r.time || "");
              if (s === null || e === null) return;
              blocks.push({
                s, e,
                code: r.course ?? r.subject?.split(" ")[0] ?? item.courseLabel ?? "",
                time: `${fmt(s)}–${fmt(e)}`,
                room: r.room || "",
                bg: item.color || "#7B2D8B",
              });
            });
          });

          const mergedBlocks = mergeBlocks(blocks);

          return (
            <div
              key={day}
              className="relative flex border-b border-white/5"
              style={{ height: ROW_H }}
            >
              <div
                style={{ width: LEFT_COL_PX, minWidth: LEFT_COL_PX }}
                className="flex flex-col items-center justify-center shrink-0 bg-[#111113] border-r border-white/8 gap-0.5"
              >
                <span className="text-[11px] font-black text-white tracking-widest">{DAY_SHORT[day]}</span>
                {di === 0 && <span className="text-[8px] text-gray-600 uppercase tracking-wider hidden">{day}</span>}
              </div>

              <div className="absolute inset-y-1 flex" style={{ left: LEFT_COL_PX }}>
                {hours.map(h => (
                  <div
                    key={h}
                    style={{ width: COL_PX, minWidth: COL_PX }}
                    className={`h-full border-r border-white/5 ${h % 2 === 0 ? "bg-[#111113]" : "bg-[#111113]"}`}
                  />
                ))}
              </div>

              {mergedBlocks.map((b, bi) => {
                const left = LEFT_COL_PX + (b.s - minH) * COL_PX;
                const width = (b.e - b.s) * COL_PX - 4;
                const color = b.bg;
                const text = fg(color);
                return (
                  <div
                    key={bi}
                    className="absolute top-2 bottom-2 rounded-xl flex flex-col justify-between px-2 py-2 overflow-hidden"
                    style={{
                      left,
                      width,
                      background: color,
                      color: text,
                      fontSize: width < 60 ? "8px" : width < 90 ? "10px" : "12px",
                    }}
                  >
                    <div className="flex items-center gap-1" style={{ opacity: 0.85 }}>
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] font-semibold leading-none">{b.time}</span>
                    </div>
                    <div
                      className="font-black leading-none tracking-tight truncate"
                      style={{
                        fontSize:
                          width < 60 ? "10px" :
                            width < 90 ? "12px" :
                              width < 120 ? "14px" :
                                "18px",
                      }}
                    >
                      {b.code}
                    </div>
                    {b.room && (
                      <div className="flex items-center gap-1" style={{ opacity: 0.8 }}>
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] font-semibold truncate">{b.room}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
