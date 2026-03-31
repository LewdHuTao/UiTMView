"use client";

import type { SelectedCard } from "@/types";

interface Props {
  cards: (SelectedCard | null)[];
  onColorChange: (index: number, color: string) => void;
}

export default function ColorLegend({ cards, onColorChange }: Props) {
  const active = cards.map((c, i) => ({ card: c, index: i })).filter(({ card }) => card !== null);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {active.map(({ card, index }) => (
        <div key={index} className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: card!.color }} />
          <span className="text-xs font-medium text-gray-300 max-w-35 truncate">{card!.courseLabel}</span>
          <input
            type="color"
            value={card!.color}
            onChange={e => onColorChange(index, e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
          />
        </div>
      ))}
    </div>
  );
}
