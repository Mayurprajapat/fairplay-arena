import { useEffect, useState } from "react";

// Lightweight CSS confetti burst (no external assets)
const COLORS = ["#f5c518", "#ff9d2e", "#38bdf8", "#7c3aed", "#34d399", "#ffffff", "#ff5d8f"];

export default function Confetti({ burst = 0 }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!burst) return;
    const arr = Array.from({ length: 90 }, (_, i) => ({
      id: `${burst}-${i}`,
      x: 50 + (Math.random() - 0.5) * 30,
      dx: (Math.random() - 0.5) * 70,
      delay: Math.random() * 0.4,
      dur: 1.8 + Math.random() * 1.4,
      size: 6 + Math.random() * 8,
      color: COLORS[i % COLORS.length],
      round: Math.random() > 0.6,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 3600);
    return () => clearTimeout(t);
  }, [burst]);

  if (!pieces.length) return null;
  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.round ? p.size : p.size * 0.6,
            borderRadius: p.round ? "50%" : "2px",
            background: p.color,
            animation: `confettiFall ${p.dur}s ${p.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
            ["--dx"]: `${p.dx}vw`,
          }}
        />
      ))}
      <style>{`@keyframes confettiFall { to { transform: translate(var(--dx), 108vh) rotate(720deg); opacity: 0.9; } }`}</style>
    </div>
  );
}
