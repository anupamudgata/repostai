"use client";

import { useEffect, useState, type CSSProperties } from "react";

type ConfettiPiece = { id: number; hue: number; dx: string; delay: string; dur: string };

function makeConfettiPieces(): ConfettiPiece[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    hue: (i * 53 + 17) % 360,
    dx: `${Math.round((Math.random() - 0.5) * 200)}px`,
    delay: `${i * 25}ms`,
    dur: `${1.1 + Math.random() * 0.9}s`,
  }));
}

export function FirstRepurposeConfetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(id);
  }, [onDone]);

  // Lazy init — runs once on mount, Math.random() is safe outside render
  const [pieces] = useState<ConfettiPiece[]>(makeConfettiPieces);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2 h-0 w-0">
        {pieces.map((p) => (
          <div
            key={p.id}
            className="repostai-confetti-piece absolute h-2.5 w-2 rounded-sm shadow-sm"
            style={
              {
                backgroundColor: `hsl(${p.hue} 82% 58%)`,
                "--confetti-dx": p.dx,
                animationDelay: p.delay,
                animationDuration: p.dur,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
