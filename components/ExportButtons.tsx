"use client";

import { useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export default function ExportButtons() {
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);

  async function getCanvas(): Promise<HTMLCanvasElement | null> {
    const el = document.getElementById("timetableGrid");
    if (!el) {
      alert("No timetable to export — add some subjects first.");
      return null;
    }

    return await html2canvas(el, {
      scale: 4,
      backgroundColor: "#111113",
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });
  }

  async function handlePNG() {
    setExporting("png");
    try {
      const canvas = await getCanvas();
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
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    } finally {
      setExporting(null);
    }
  }

  async function handlePDF() {
    setExporting("pdf");
    try {
      const canvas = await getCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/png");

      const pxToPt = 72 / 96;
      const widthPt = (canvas.width / 3) * pxToPt;
      const heightPt = (canvas.height / 3) * pxToPt;

      const pdf = new jsPDF({
        orientation: widthPt > heightPt ? "landscape" : "portrait",
        unit: "pt",
        format: [widthPt, heightPt],
      });

      pdf.addImage(imgData, "PNG", 0, 0, widthPt, heightPt);
      pdf.save(`Timetable-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      alert("PDF export failed.");
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
