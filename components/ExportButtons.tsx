"use client";

import { useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export default function ExportButtons() {
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);

  async function getCanvas(forPDF: boolean = false): Promise<HTMLCanvasElement | null> {
    const el = document.getElementById("timetableGrid") as HTMLElement;
    if (!el) return null;

    const original = {
      width: el.style.width,
      height: el.style.height,
      overflow: el.style.overflow,
    };

    const fullWidth = el.scrollWidth;
    const fullHeight = el.scrollHeight;

    el.style.width = fullWidth + "px";
    el.style.height = fullHeight + "px";
    el.style.overflow = "visible";

    const canvas = await html2canvas(el, {
      scale: 3,
      backgroundColor: "#111113",
      useCORS: true,
      logging: false,
      windowWidth: fullWidth,
      windowHeight: fullHeight,
    });

    el.style.width = original.width;
    el.style.height = original.height;
    el.style.overflow = original.overflow;

    return canvas;
  }

  async function handlePNG() {
    setExporting("png");
    try {
      const canvas = await getCanvas(false);
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Timetable-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  async function handlePDF() {
    setExporting("pdf");
    try {
      const canvas = await getCanvas(true);
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Timetable-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(null);
    }
  }

  const btnBase =
    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex gap-3 justify-center mt-5 flex-wrap">
      <button
        onClick={handlePNG}
        disabled={!!exporting}
        className={`${btnBase} bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:cursor-pointer`}
      >
        {exporting === "png" ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
        )}
        {exporting === "png" ? "Exporting…" : "Save PNG"}
      </button>

      <button
        onClick={handlePDF}
        disabled={!!exporting}
        className={`${btnBase} bg-purple-600 hover:bg-purple-500 text-white hover:cursor-pointer`}
      >
        {exporting === "pdf" ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        )}
        {exporting === "pdf" ? "Exporting…" : "Save PDF"}
      </button>
    </div>
  );
}
