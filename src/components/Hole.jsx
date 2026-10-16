import React from 'react';
import Mole from './Mole';

export default function Hole({
  index,
  isActive,
  moleType,
  isHit,
  onWhack,
  keyBinding
}) {
  const handleClick = (e) => {
    e.preventDefault();
    onWhack(index, e);
  };

  return (
    <div
      className={`hole-container ${isActive ? 'active' : ''} ${isHit ? 'was-hit' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`地洞 ${index + 1}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onWhack(index, e);
        }
      }}
    >
      {/* Key Shortcut Badge */}
      {keyBinding && <span className="hole-key-badge">{keyBinding}</span>}

      {/* Back rim of hole */}
      <div className="hole-back">
        <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="hole-rim-svg">
          <ellipse cx="80" cy="25" rx="72" ry="22" fill="#2d1d13" />
          <ellipse cx="80" cy="28" rx="66" ry="18" fill="#170d08" />
        </svg>
      </div>

      {/* Underground chamber with mole popping out */}
      <div className="mole-viewport">
        <div className={`mole-wrapper ${isActive ? 'up' : 'down'}`}>
          <Mole type={moleType} isHit={isHit} />
        </div>
      </div>

      {/* Front mound of dirt with grass tufts */}
      <div className="hole-front">
        <svg viewBox="0 0 170 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="mound-svg">
          {/* Main dirt mound */}
          <path
            d="M 10 50 C 20 20 60 14 85 14 C 110 14 150 20 160 50 C 165 62 5 62 10 50 Z"
            fill="#5c3826"
          />
          {/* Mound texture/highlight */}
          <path
            d="M 25 45 C 40 26 70 22 85 22 C 100 22 130 26 145 45 Z"
            fill="#784a32"
            opacity="0.8"
          />
          {/* Dirt pebbles */}
          <circle cx="45" cy="46" r="3" fill="#3b2216" />
          <circle cx="120" cy="48" r="3.5" fill="#3b2216" />
          <circle cx="85" cy="52" r="2.5" fill="#9c6344" />
          <circle cx="68" cy="44" r="2" fill="#9c6344" />

          {/* Grass Tufts on front */}
          <path
            d="M 28 36 Q 22 24 16 26 Q 25 32 28 36 Z"
            fill="#22c55e"
          />
          <path
            d="M 32 38 Q 30 22 36 24 Q 34 32 32 38 Z"
            fill="#16a34a"
          />
          <path
            d="M 138 38 Q 134 22 142 24 Q 138 32 138 38 Z"
            fill="#22c55e"
          />
          <path
            d="M 144 36 Q 150 24 156 26 Q 148 32 144 36 Z"
            fill="#16a34a"
          />
        </svg>
      </div>
    </div>
  );
}
