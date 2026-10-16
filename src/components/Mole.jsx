import React from 'react';

export default function Mole({ type = 'normal', isHit = false }) {
  const isGolden = type === 'golden';
  const isBomb = type === 'bomb';

  // Body Colors
  const bodyColor = isGolden ? '#f59e0b' : isBomb ? '#475569' : '#8d5b4c';
  const bellyColor = isGolden ? '#fef08a' : isBomb ? '#94a3b8' : '#e6ba95';
  const snoutColor = isGolden ? '#fbbf24' : isBomb ? '#64748b' : '#d49b7a';
  const noseColor = isGolden ? '#f43f5e' : isBomb ? '#ef4444' : '#fb7185';

  return (
    <div className={`mole-graphic ${isHit ? 'hit' : ''} ${type}`}>
      <svg
        viewBox="0 0 140 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mole-svg"
      >
        <defs>
          {/* Mole body gradient */}
          <radialGradient id={`bodyGrad-${type}`} cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor={isGolden ? '#fde047' : isBomb ? '#64748b' : '#a26a5b'} />
            <stop offset="100%" stopColor={bodyColor} />
          </radialGradient>

          {/* Golden glow filter */}
          {isGolden && (
            <filter id="goldenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#facc15" floodOpacity="0.8" />
            </filter>
          )}

          {/* Bomb shadow */}
          {isBomb && (
            <filter id="bombGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.6" />
            </filter>
          )}
        </defs>

        <g filter={isGolden ? 'url(#goldenGlow)' : isBomb ? 'url(#bombGlow)' : undefined}>
          {/* Mole Ears */}
          <circle cx="36" cy="40" r="14" fill={bodyColor} />
          <circle cx="36" cy="40" r="8" fill="#fda4af" opacity="0.8" />
          <circle cx="104" cy="40" r="14" fill={bodyColor} />
          <circle cx="104" cy="40" r="8" fill="#fda4af" opacity="0.8" />

          {/* Mole Head & Body */}
          <ellipse cx="70" cy="72" rx="46" ry="48" fill={`url(#bodyGrad-${type})`} />

          {/* Mole Belly highlight */}
          <ellipse cx="70" cy="88" rx="30" ry="24" fill={bellyColor} opacity="0.85" />

          {/* Snout Area */}
          <ellipse cx="70" cy="66" rx="24" ry="16" fill={snoutColor} />
          {/* Nose */}
          <ellipse cx="70" cy="58" rx="8" ry="6" fill={noseColor} />
          <ellipse cx="68" cy="56" rx="3" ry="2" fill="#fff" opacity="0.7" />

          {/* Whisker lines */}
          <line x1="32" y1="64" x2="48" y2="66" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          <line x1="30" y1="72" x2="48" y2="70" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          <line x1="108" y1="64" x2="92" y2="66" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />
          <line x1="110" y1="72" x2="92" y2="70" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" />

          {/* Mouth & Teeth */}
          {!isHit ? (
            isBomb ? (
              // Evil smirk for bomb mole
              <path
                d="M 60 72 Q 70 80 82 70"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              // Happy cute smile with front tooth
              <>
                <path
                  d="M 60 69 Q 70 78 80 69"
                  stroke="#4a3728"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <rect x="67" y="70" width="6" height="5" rx="1.5" fill="#ffffff" />
              </>
            )
          ) : (
            // Dizzy open mouth when hit
            <ellipse cx="70" cy="74" rx="7" ry="5" fill="#3b1d11" />
          )}

          {/* Eyes */}
          {!isHit ? (
            <>
              {/* Left Eye */}
              <circle cx="53" cy="48" r="6.5" fill="#1e293b" />
              <circle cx="51.5" cy="46" r="2.2" fill="#ffffff" />
              {/* Right Eye */}
              <circle cx="87" cy="48" r="6.5" fill="#1e293b" />
              <circle cx="85.5" cy="46" r="2.2" fill="#ffffff" />
              {/* Cheeks */}
              <ellipse cx="42" cy="58" rx="5" ry="3.5" fill="#fb7185" opacity="0.6" />
              <ellipse cx="98" cy="58" rx="5" ry="3.5" fill="#fb7185" opacity="0.6" />
            </>
          ) : (
            // Dizzy X eyes when hit
            <>
              {/* Left X */}
              <line x1="48" y1="44" x2="58" y2="54" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="58" y1="44" x2="48" y2="54" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              {/* Right X */}
              <line x1="82" y1="44" x2="92" y2="54" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="92" y1="44" x2="82" y2="54" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            </>
          )}

          {/* Golden Mole Crown & Sparkles */}
          {isGolden && (
            <g className="golden-crown">
              <path
                d="M 52 25 L 56 12 L 70 20 L 84 12 L 88 25 Z"
                fill="#facc15"
                stroke="#eab308"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="56" cy="11" r="2.5" fill="#ef4444" />
              <circle cx="70" cy="19" r="2.5" fill="#3b82f6" />
              <circle cx="84" cy="11" r="2.5" fill="#10b981" />
              <circle cx="70" cy="24" r="2" fill="#ffffff" />
            </g>
          )}

          {/* Bomb Mole Helmet & Dynamite Wick */}
          {isBomb && (
            <g className="bomb-gear">
              {/* Danger Helmet */}
              <path
                d="M 38 38 C 42 16 98 16 102 38 Z"
                fill="#0f172a"
                stroke="#ef4444"
                strokeWidth="2"
              />
              {/* Wick */}
              <path
                d="M 70 18 Q 78 8 85 10"
                stroke="#d97706"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Spark on wick */}
              <circle cx="87" cy="10" r="3.5" fill="#ef4444" className="bomb-spark" />
              <circle cx="87" cy="10" r="1.5" fill="#fef08a" />
              {/* Warning Skull / Exclamation */}
              <text x="70" y="32" fill="#ef4444" fontSize="13" fontWeight="bold" textAnchor="middle">
                ⚠️
              </text>
            </g>
          )}

          {/* Cute Little Paws resting on the ground */}
          <ellipse cx="40" cy="98" rx="9" ry="6" fill={snoutColor} />
          <ellipse cx="100" cy="98" rx="9" ry="6" fill={snoutColor} />
          {/* Paw pads */}
          <circle cx="39" cy="98" r="2" fill={noseColor} opacity="0.8" />
          <circle cx="101" cy="98" r="2" fill={noseColor} opacity="0.8" />
        </g>

        {/* Hit Star Burst Overlay */}
        {isHit && (
          <g className="hit-stars">
            <text x="70" y="32" textAnchor="middle" fontSize="18" fill="#facc15" className="bonk-text">
              💥 BONK!
            </text>
            <circle cx="28" cy="28" r="3" fill="#facc15" />
            <circle cx="112" cy="24" r="3.5" fill="#facc15" />
            <circle cx="118" cy="40" r="2" fill="#f43f5e" />
          </g>
        )}
      </svg>
    </div>
  );
}
