"use client";

import Link from "next/link";

interface NavbarProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
  onManualClick: () => void;
}

export default function Navbar({ mode, onModeChange, onManualClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0f0f11]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <Link href="/">
        <div className="flex items-center gap-3">
          <img src="/UiTM_Logo.svg" alt="UiTM" className="h-9 w-auto" />
          <div className="hidden sm:block">
            <p className="font-bold text-[20px] leading-tight">
              <span className="text-white">UiTM</span>
              <span className="text-purple-400">View</span>
            </p>
          </div>
        </div>
      </Link>

        <div className="flex items-center bg-white/5 rounded-xl p-1 gap-0.5">
          <button
            onClick={() => onModeChange("auto")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:cursor-pointer ${mode === "auto"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
              }`}
          >
            Student ID
          </button>
          <button
            onClick={() => { onModeChange("manual"); onManualClick(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:cursor-pointer ${mode === "manual"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
              }`}
          >
            Manual
          </button>
        </div>
      </div>
    </header>
  );
}
