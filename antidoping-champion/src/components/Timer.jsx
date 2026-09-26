import { useEffect, useRef } from "react";
import { sfx } from "../utils/sounds";

// 30-second animated countdown ring
export default function Timer({ secondsLeft, total = 30, running }) {
  const prev = useRef(secondsLeft);
  useEffect(() => {
    if (running && secondsLeft <= 5 && secondsLeft > 0 && secondsLeft !== prev.current) {
      sfx.tick();
    }
    prev.current = secondsLeft;
  }, [secondsLeft, running]);

  const pct = Math.max(0, secondsLeft / total);
  const R = 26;
  const C = 2 * Math.PI * R;
  const danger = secondsLeft <= 10;
  return (
    <div className="flex items-center gap-2">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={R} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={R} fill="none"
          stroke={danger ? "#ff6b6b" : "#f5c518"}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
        <text
          x="32" y="37" textAnchor="middle" fontSize="17" fontWeight="bold"
          fill={danger ? "#ff6b6b" : "#fff"}
          className={danger ? "timer-danger" : ""}
        >
          {secondsLeft}
        </text>
      </svg>
      <span className="text-xs text-slate-400 font-semibold">sec</span>
    </div>
  );
}
