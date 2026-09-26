// ARJUN VERMA — original fictional athlete-host, pure SVG (no real likeness)
export default function Host({ state = "idle", size = 200, jersey = false }) {
  const mouth = {
    idle: <ellipse cx="100" cy="128" rx="10" ry="4" fill="#7c2d12" />,
    speaking: <ellipse cx="100" cy="129" rx="9" ry="8" fill="#7c2d12" className="host-talking" />,
    thinking: <path d="M92 130 Q100 126 108 130" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />,
    excited: <ellipse cx="100" cy="130" rx="11" ry="9" fill="#7c2d12" />,
    correct: <path d="M88 128 Q100 140 112 128" stroke="#166534" strokeWidth="4" fill="none" strokeLinecap="round" />,
    wrong: <path d="M90 133 Q100 126 110 133" stroke="#7c2d12" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    lifeline: <ellipse cx="100" cy="129" rx="7" ry="7" fill="#7c2d12" className="host-talking" />,
    celebrate: <path d="M86 126 Q100 142 114 126" stroke="#166534" strokeWidth="4.5" fill="none" strokeLinecap="round" />,
  }[state] || <ellipse cx="100" cy="128" rx="10" ry="4" fill="#7c2d12" />;

  const brows =
    state === "wrong" ? (
      <g stroke="#1f2937" strokeWidth="3" strokeLinecap="round">
        <line x1="76" y1="92" x2="92" y2="97" />
        <line x1="124" y1="92" x2="108" y2="97" />
      </g>
    ) : state === "excited" || state === "celebrate" || state === "correct" ? (
      <g stroke="#1f2937" strokeWidth="3" strokeLinecap="round">
        <line x1="76" y1="90" x2="92" y2="88" />
        <line x1="108" y1="88" x2="124" y2="90" />
      </g>
    ) : (
      <g stroke="#1f2937" strokeWidth="3" strokeLinecap="round">
        <line x1="76" y1="93" x2="92" y2="93" />
        <line x1="108" y1="93" x2="124" y2="93" />
      </g>
    );

  const anim =
    state === "celebrate" ? "host-celebrate" : state === "thinking" ? "host-think" : "host-bob";

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <svg viewBox="0 0 200 210" width={size} height={size * 1.05} className={anim}>
        <defs>
          <radialGradient id="avStage" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#3b2a7a" />
            <stop offset="100%" stopColor="#150b33" />
          </radialGradient>
          <linearGradient id="avJersey" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={jersey ? "#f5c518" : "#1d4ed8"} />
            <stop offset="100%" stopColor={jersey ? "#b45309" : "#7c3aed"} />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="94" fill="url(#avStage)" stroke="#f5c518" strokeWidth="3" opacity="0.95" />
        <circle cx="100" cy="100" r="84" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.7" />
        {/* torso / jersey */}
        <path d="M52 210 Q56 168 100 164 Q144 168 148 210 Z" fill="url(#avJersey)" />
        <path d="M92 166 L100 180 L108 166" fill="none" stroke="#f5c518" strokeWidth="3" />
        <circle cx="100" cy="192" r="7" fill="#f5c518" opacity="0.9" />
        <text x="100" y="195" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3a2503">7</text>
        {/* neck + head */}
        <rect x="90" y="142" width="20" height="18" rx="6" fill="#b0713c" />
        <ellipse cx="100" cy="112" rx="40" ry="44" fill="#c98a4b" />
        {/* hair */}
        <path d="M60 108 Q58 66 100 64 Q142 66 140 108 Q132 84 100 82 Q68 84 60 108" fill="#14101f" />
        <path d="M62 100 L58 128 L66 128 Z" fill="#14101f" />
        <path d="M138 100 L142 128 L134 128 Z" fill="#14101f" />
        {/* eyes */}
        <g className="host-eyes">
          <ellipse cx="84" cy="110" rx="7" ry="8" fill="#fff" />
          <ellipse cx="116" cy="110" rx="7" ry="8" fill="#fff" />
          <circle cx="85" cy="111" r="3.4" fill="#1f2937" />
          <circle cx="115" cy="111" r="3.4" fill="#1f2937" />
        </g>
        {brows}
        {state === "thinking" && (
          <g fill="#e9d5ff" fontSize="13" fontWeight="bold">
            <text x="150" y="52">?</text>
            <text x="160" y="36" fontSize="10">?</text>
          </g>
        )}
        {(state === "excited" || state === "celebrate" || state === "correct") && (
          <g fontSize="16">
            <text x="42" y="60">✨</text>
            <text x="146" y="70">✨</text>
          </g>
        )}
        {state === "wrong" && (
          <text x="146" y="60" fontSize="16">💧</text>
        )}
        {mouth}
        {/* headset mic */}
        <path d="M140 100 Q148 130 118 140" stroke="#0ea5e9" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="116" cy="141" r="5" fill="#0ea5e9" />
      </svg>
      <div className="mt-1 text-center">
        <div className="font-display font-bold tracking-widest text-amber-200 text-sm">ARJUN VERMA</div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">Fictional Host • Clean-Sport Champion</div>
      </div>
    </div>
  );
}
