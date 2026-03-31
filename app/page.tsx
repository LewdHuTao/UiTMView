"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dropdown from "@/components/Dropdown";
import Timetable from "@/components/Timetable";
import ColorLegend from "@/components/ColorLegend";
import ExportButtons from "@/components/ExportButtons";
import { getCampuses } from "@/lib/actions/campus";
import { getFaculties } from "@/lib/actions/faculty";
import { getCourses } from "@/lib/actions/courses";
import { getTimetable } from "@/lib/actions/timetable";
import { getStudentSchedule } from "@/lib/actions/student";
import type { Campus, Faculty, Course, SelectedCard, TimetableRow } from "@/types";

const PRESET_COLORS = ["#8b5cf6","#3b82f6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16"];

interface CardState {
  id: number; courseUrl: string; courseLabel: string; group: string;
  groups: string[]; timetable: TimetableRow[];
  color: string; loading: boolean;
}

const mkCard = (id: number): CardState => ({
  id, courseUrl: "", courseLabel: "", group: "",
  groups: [], timetable: [],
  color: PRESET_COLORS[id % PRESET_COLORS.length], loading: false,
});

const SECTION = "bg-[#18181b] border border-white/8 rounded-2xl p-5";
const LABEL = "text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block";

export default function HomePage() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  const [studentId, setStudentId] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [studentCards, setStudentCards] = useState<SelectedCard[]>([]);

  const [manualReady, setManualReady] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [campus, setCampus] = useState("");
  const [faculty, setFaculty] = useState("");
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [showFaculty, setShowFaculty] = useState(false);

  const [sharedCourses, setSharedCourses] = useState<Course[]>([]);

  const [cards, setCards] = useState<CardState[]>([mkCard(0),mkCard(1),mkCard(2),mkCard(3)]);
  const [selectedCards, setSelectedCards] = useState<(SelectedCard|null)[]>([null,null,null,null]);
  const [nextId, setNextId] = useState(4);

  const handleSwitchToManual = useCallback(async () => {
    setMode("manual");
    if (manualReady) return;
    setManualLoading(true);
    try {
      const [camRes, facRes] = await Promise.all([getCampuses(), getFaculties()]);
      setCampuses(camRes);
      setFaculties(facRes);
      setManualReady(true);
    } finally {
      setManualLoading(false);
    }
  }, [manualReady]);

  const handleCampusChange = useCallback(async (val: string) => {
    setCampus(val);
    const needsFaculty = val === "B";
    setShowFaculty(needsFaculty);
    setFaculty("");
    setSharedCourses([]);
    setCards([mkCard(0),mkCard(1),mkCard(2),mkCard(3)]);
    setSelectedCards([null,null,null,null]);

    if (needsFaculty) return;

    setCoursesLoading(true);
    try {
      const courses = await getCourses(val, val);
      setSharedCourses(courses);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const handleFacultyChange = useCallback(async (val: string) => {
    setFaculty(val);
    setSharedCourses([]);
    setCards([mkCard(0),mkCard(1),mkCard(2),mkCard(3)]);
    setSelectedCards([null,null,null,null]);
    if (!val) return;

    setCoursesLoading(true);
    try {
      const courses = await getCourses(campus, val);
      setSharedCourses(courses);
    } finally {
      setCoursesLoading(false);
    }
  }, [campus]);

  const handleCourseChange = useCallback(async (cardId: number, url: string) => {
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (!url) {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, courseUrl: "", courseLabel: "", groups: [], group: "", timetable: [] } : c));
      setSelectedCards(prev => { const n = [...prev]; n[cardIndex] = null; return n; });
      return;
    }
    const course = sharedCourses.find(c => c.url === url);
    const label = course?.code ?? url;
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, courseUrl: url, courseLabel: label, loading: true } : c));
    try {
      const data = await getTimetable(url);
      const tt: TimetableRow[] = data.timetable ?? [];
      const groups = [...new Set(tt.map(r => r.group).filter(Boolean))];
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, timetable: tt, groups, group: "", loading: false } : c));
    } catch {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, loading: false } : c));
    }
  }, [cards, sharedCourses]);

  const handleGroupChange = useCallback((cardId: number, group: string) => {
    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;
    const card = cards[cardIndex];
    const rows = card.timetable.filter(r => r.group === group);
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, group } : c));
    setSelectedCards(prev => {
      const n = [...prev];
      while (n.length <= cardIndex) n.push(null);
      n[cardIndex] = group ? { url: card.courseUrl, timetable: rows, originalTimetable: card.timetable, group, courseLabel: card.courseLabel, color: card.color } : null;
      return n;
    });
  }, [cards]);

  const handleColorChange = useCallback((index: number, color: string) => {
    const card = cards[index];
    if (card) setCards(prev => prev.map(c => c.id === card.id ? { ...c, color } : c));
    setSelectedCards(prev => prev.map((s, i) => i === index && s ? { ...s, color } : s));
  }, [cards]);

  const addCard = () => {
    const id = nextId; setNextId(id + 1);
    setCards(prev => [...prev, mkCard(id)]);
    setSelectedCards(prev => [...prev, null]);
  };

  const removeCard = (cardId: number) => {
    const idx = cards.findIndex(c => c.id === cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
    setSelectedCards(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setCards([mkCard(0),mkCard(1),mkCard(2),mkCard(3)]);
    setSelectedCards([null,null,null,null]);
    setNextId(4);
  };

  const fetchStudentSchedule = async () => {
    if (!studentId.trim()) return;
    setStudentLoading(true); setStudentError(""); setStudentCards([]);
    try {
      const data = await getStudentSchedule(studentId.trim());
      const tt: TimetableRow[] = data.timetable ?? [];
      const byCourse: Record<string, TimetableRow[]> = {};
      tt.forEach(r => { const k = r.course ?? "?"; if (!byCourse[k]) byCourse[k] = []; byCourse[k].push(r); });
      setStudentCards(Object.entries(byCourse).map(([code, rows], i) => ({
        url: code, timetable: rows, originalTimetable: rows,
        group: rows[0]?.group ?? "",
        courseLabel: `${code}${rows[0]?.subject ? " – " + rows[0].subject : ""}`,
        color: PRESET_COLORS[i % PRESET_COLORS.length],
      })));
    } catch (err) {
      setStudentError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setStudentLoading(false);
    }
  };

  const displayCards = mode === "auto"
    ? studentCards.map(s => s as SelectedCard | null)
    : selectedCards;

  const coursesReady = sharedCourses.length > 0;

  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col select-none">
      <Navbar
        mode={mode}
        onModeChange={(m) => m === "manual" ? handleSwitchToManual() : setMode(m)}
        onManualClick={handleSwitchToManual}
      />

      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-5 flex-1">
        {mode === "auto" && (
          <section className={SECTION}>
            <span className={LABEL}>Fetch by Student ID</span>
            <p className="text-xs text-gray-500 mb-4">Enter your UiTM student number to auto-load your weekly schedule.</p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchStudentSchedule()}
                placeholder="e.g. 2023123456"
                className="flex-1 min-w-50 px-4 py-2.5 rounded-xl bg-[#111113] border border-white/10 text-gray-100 placeholder-gray-600 text-sm outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
              />
              <button
                onClick={fetchStudentSchedule}
                disabled={studentLoading || !studentId.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer transition-colors flex items-center gap-2"
              >
                {studentLoading
                  ? <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Loading…</>
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>Fetch</>}
              </button>
            </div>
            {studentError && <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{studentError}</p>}
          </section>
        )}

        {mode === "manual" && (
          <section className={SECTION}>
            {manualLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg className="w-6 h-6 animate-spin text-purple-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-sm text-gray-500">Loading campuses…</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <span className={LABEL + " mb-0"}>Timetable Generator</span>
                  <div className="flex gap-2">
                    <button
                      onClick={addCard}
                      disabled={!coursesReady}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition hover:cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                      Add
                    </button>
                    <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-400 transition hover:cursor-pointer">
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mb-4 flex-wrap">
                  <Dropdown
                    placeholder="Select Campus"
                    options={campuses.map(c => ({ value: c.id, text: c.text }))}
                    value={campus}
                    onChange={handleCampusChange}
                    className="min-w-50 flex-1"
                  />
                  {showFaculty && (
                    <Dropdown
                      placeholder="Select Faculty"
                      options={faculties.map(f => ({ value: f.id, text: f.text }))}
                      value={faculty}
                      onChange={handleFacultyChange}
                      className="min-w-50 flex-1"
                    />
                  )}
                </div>

                {coursesLoading && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <svg className="w-4 h-4 animate-spin text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <p className="text-xs text-purple-300">Loading courses for selected campus…</p>
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  {cards.map((card, idx) => (
                    <div key={card.id} className="flex flex-wrap items-center gap-2.5 bg-[#111113] rounded-xl p-3 border border-white/5">
                      <div className="relative shrink-0">
                        <input type="color" value={card.color} onChange={e => handleColorChange(idx, e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-white/10 p-0.5 bg-[#1c1c1f]" />
                      </div>
                      <div className="flex-1 min-w-40">
                        <Dropdown
                          placeholder={coursesLoading ? "Loading courses…" : !coursesReady ? "Select a campus first" : "Select Subject"}
                          options={sharedCourses.map(c => ({ value: c.url, text: c.code }))}
                          value={card.courseUrl}
                          onChange={val => handleCourseChange(card.id, val)}
                          disabled={!coursesReady || coursesLoading}
                          className="w-full"
                        />
                      </div>
                      <div className="w-full sm:w-36">
                        <Dropdown
                          placeholder="Group"
                          options={card.groups.map(g => ({ value: g, text: g }))}
                          value={card.group}
                          onChange={val => handleGroupChange(card.id, val)}
                          disabled={!card.courseUrl || card.loading}
                          className="w-full"
                        />
                      </div>
                      {card.loading && (
                        <svg className="w-4 h-4 animate-spin text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      )}
                      {idx >= 4 && (
                        <button onClick={() => removeCard(card.id)} className="text-gray-600 hover:text-red-400 transition shrink-0 p-1 hover:cursor-pointer">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!campus && !coursesLoading && (
                  <p className="text-[11px] text-gray-600 mt-3">Select a campus to load available courses.</p>
                )}
              </>
            )}
          </section>
        )}

        <section className={SECTION}>
          <span className={LABEL}>Timetable</span>
          <ColorLegend
            cards={displayCards}
            onColorChange={mode === "auto"
              ? (i, c) => setStudentCards(prev => prev.map((s, j) => j === i ? { ...s, color: c } : s))
              : handleColorChange}
          />
          <Timetable selectedCards={displayCards} />
          <ExportButtons />
        </section>

      </main>
      <Footer />
    </div>
  );
}
