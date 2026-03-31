"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Option { value: string; text: string; }
interface DropdownProps {
  placeholder?: string;
  emptyText?: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  onOpen?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Dropdown({
  placeholder = "Select...",
  emptyText = "No results",
  options,
  value,
  onChange,
  onOpen,
  disabled = false,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);
  const filtered = options.filter(o =>
    o.text.toLowerCase().includes(search.toLowerCase()) ||
    o.value.toLowerCase().includes(search.toLowerCase())
  );

  const close = useCallback(() => { setOpen(false); setSearch(""); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    if (!open) onOpen?.();
    setOpen(v => !v);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all
          bg-[#1c1c1f] border
          ${disabled ? "opacity-40 cursor-not-allowed border-white/5" : "cursor-pointer border-white/10 hover:border-purple-500/50"}
          ${open ? "border-purple-500/70 ring-2 ring-purple-500/20" : ""}`}
      >
        <span className={`truncate ${selected ? "text-gray-100" : "text-gray-500"}`}>
          {selected ? selected.text : placeholder}
        </span>
        <svg
          className={`shrink-0 w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-50 bg-[#1c1c1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 bg-[#111113] rounded-lg border border-white/10 outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">{emptyText}</div>
            ) : filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); close(); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:cursor-pointer
                  ${o.value === value
                    ? "bg-purple-600/20 text-purple-300 font-medium"
                    : "text-gray-300 hover:bg-white/5"}`}
              >
                {o.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
