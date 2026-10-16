import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Hole from './components/Hole';
import {
  playWhackSound,
  playGoldenSound,
  playBombSound,
  playTickSound,
  playStartSound,
  playFinishSound,
  toggleSound,
  isSoundEnabled
} from './utils/sound';
import './App.css';

const TOTAL_TIME = 20; // 20 秒計時
const GRID_SIZE = 9;

// Difficulty configurations (stay duration and spawn interval in ms)
const DIFFICULTY_CONFIG = {
  easy: { stayTime: 1200, spawnInterval: 900, maxActive: 1 },
  normal: { stayTime: 900, spawnInterval: 650, maxActive: 2 },
  hard: { stayTime: 650, spawnInterval: 480, maxActive: 2 }
};

// Keyboard mapping for holes (3x3 grid: 1-9 or QWE/ASD/ZXC)
const KEY_MAP = {
  '1': 0, '2': 1, '3': 2,
  '4': 3, '5': 4, '6': 5,
  '7': 6, '8': 7, '9': 8,
  'q': 0, 'w': 1, 'e': 2,
  'a': 3, 's': 4, 'd': 5,
  'z': 6, 'x': 7, 'c': 8,
};

const KEY_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function App() {
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'finished'
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('whack_mole_high_score') || '0', 10);
  });
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ hits: 0, goldenHits: 0, bombHits: 0 });
  const [soundOn, setSoundOn] = useState(true);

  // Holes state: each has { active: boolean, type: 'normal'|'golden'|'bomb', hit: boolean }
  const [holes, setHoles] = useState(() =>
    Array(GRID_SIZE).fill(null).map(() => ({ active: false, type: 'normal', hit: false }))
  );

  // Floating score popups: array of { id, text, x, y, type }
  const [popups, setPopups] = useState([]);

  // Hammer swing state
  const [isSwinging, setIsSwinging] = useState(false);
  const hammerRef = useRef(null);

  // Difficulty speed setting (easy, normal, hard)
  const [difficulty, setDifficulty] = useState('normal');

  // Refs for mole timers
  const moleTimerRef = useRef(null);
  const hideTimersRef = useRef({});
  const lastActiveHoleRef = useRef(-1);

  // Confetti launcher for finish
  const triggerFinishConfetti = useCallback(() => {
    try {
      const end = Date.now() + 1800;
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // fallback
    }
  }, []);

  // Finish game handler
  const finishGame = useCallback(() => {
    clearTimeout(moleTimerRef.current);
    Object.values(hideTimersRef.current).forEach(t => clearTimeout(t));
    hideTimersRef.current = {};

    setGameState('finished');
    playFinishSound();
    triggerFinishConfetti();

    // Reset holes
    setHoles(Array(GRID_SIZE).fill(null).map(() => ({ active: false, type: 'normal', hit: false })));

    // Update high score
    setScore(currentScore => {
      setHighScore(prevHigh => {
        if (currentScore > prevHigh) {
          localStorage.setItem('whack_mole_high_score', currentScore.toString());
          return currentScore;
        }
        return prevHigh;
      });
      return currentScore;
    });
  }, [triggerFinishConfetti]);

  // Start / Restart game
  const startGame = () => {
    clearTimeout(moleTimerRef.current);
    Object.values(hideTimersRef.current).forEach(t => clearTimeout(t));
    hideTimersRef.current = {};

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setStats({ hits: 0, goldenHits: 0, bombHits: 0 });
    setTimeLeft(TOTAL_TIME);
    setPopups([]);
    setHoles(Array(GRID_SIZE).fill(null).map(() => ({ active: false, type: 'normal', hit: false })));
    setGameState('playing');

    playStartSound();
  };

  // Dedicated 20s countdown timer Effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        if (prev <= 6) {
          playTickSound(true); // alert ticking for last 5s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Watch for timer hitting 0 to finish the game
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      finishGame();
    }
  }, [timeLeft, gameState, finishGame]);

  // Pop up a mole
  const popMole = useCallback(() => {
    const currentConfig = DIFFICULTY_CONFIG[difficulty];

    setHoles(prevHoles => {
      const activeCount = prevHoles.filter(h => h.active).length;
      if (activeCount >= currentConfig.maxActive) return prevHoles;

      // Available holes that are not currently active
      const availableIndices = prevHoles
        .map((h, idx) => (!h.active ? idx : null))
        .filter(idx => idx !== null && idx !== lastActiveHoleRef.current);

      if (availableIndices.length === 0) return prevHoles;

      const randomHole = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      lastActiveHoleRef.current = randomHole;

      // Determine mole type: 70% normal, 18% golden, 12% bomb
      const rand = Math.random();
      let type = 'normal';
      if (rand > 0.88) {
        type = 'bomb';
      } else if (rand > 0.70) {
        type = 'golden';
      }

      const nextHoles = [...prevHoles];
      nextHoles[randomHole] = { active: true, type, hit: false };

      // Set timeout to automatically hide this mole if not hit
      if (hideTimersRef.current[randomHole]) {
        clearTimeout(hideTimersRef.current[randomHole]);
      }

      hideTimersRef.current[randomHole] = setTimeout(() => {
        setHoles(curr => {
          if (!curr[randomHole].active) return curr;
          const updated = [...curr];
          if (!curr[randomHole].hit && curr[randomHole].type !== 'bomb') {
            setCombo(0);
          }
          updated[randomHole] = { ...updated[randomHole], active: false, hit: false };
          return updated;
        });
      }, currentConfig.stayTime);

      return nextHoles;
    });
  }, [difficulty]);

  // Mole spawning loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const currentConfig = DIFFICULTY_CONFIG[difficulty];
    let isCancelled = false;

    const scheduleNext = () => {
      if (isCancelled) return;
      const jitter = (Math.random() - 0.5) * 200;
      const nextInterval = Math.max(300, currentConfig.spawnInterval + jitter);
      moleTimerRef.current = setTimeout(() => {
        popMole();
        scheduleNext();
      }, nextInterval);
    };

    // First mole popup after starting
    moleTimerRef.current = setTimeout(() => {
      popMole();
      scheduleNext();
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(moleTimerRef.current);
      Object.values(hideTimersRef.current).forEach(t => clearTimeout(t));
      hideTimersRef.current = {};
    };
  }, [gameState, difficulty, popMole]);

  // Add floating popup
  const addPopup = (text, x, y, type = 'normal') => {
    const id = Date.now() + Math.random();
    setPopups(prev => [...prev.slice(-6), { id, text, x, y, type }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 900);
  };

  // Handle whacking a hole
  const handleWhack = useCallback((index, event) => {
    if (gameState !== 'playing') return;

    // Trigger hammer animation
    let clientX = 0;
    let clientY = 0;
    if (event && event.clientX) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      const el = document.querySelectorAll('.hole-container')[index];
      if (el) {
        const rect = el.getBoundingClientRect();
        clientX = rect.left + rect.width / 2;
        clientY = rect.top + rect.height / 3;
      }
    }

    setIsSwinging(true);
    setTimeout(() => {
      setIsSwinging(false);
    }, 180);

    setHoles(prevHoles => {
      const hole = prevHoles[index];
      if (!hole.active || hole.hit) {
        return prevHoles;
      }

      // Hit successfully!
      const updated = [...prevHoles];
      updated[index] = { ...hole, hit: true };

      if (hole.type === 'normal') {
        playWhackSound();
        setCombo(c => {
          const newCombo = c + 1;
          setMaxCombo(m => Math.max(m, newCombo));
          const bonus = Math.min(newCombo * 2, 20);
          const points = 10 + bonus;
          setScore(s => s + points);
          addPopup(newCombo > 1 ? `+${points} (${newCombo}連擊!)` : `+${points}`, clientX, clientY, 'normal');
          return newCombo;
        });
        setStats(s => ({ ...s, hits: s.hits + 1 }));
      } else if (hole.type === 'golden') {
        playGoldenSound();
        setCombo(c => {
          const newCombo = c + 1;
          setMaxCombo(m => Math.max(m, newCombo));
          const points = 30 + newCombo * 3;
          setScore(s => s + points);
          addPopup(`+${points} ✨金地鼠!`, clientX, clientY, 'golden');
          return newCombo;
        });
        setStats(s => ({ ...s, hits: s.hits + 1, goldenHits: s.goldenHits + 1 }));
      } else if (hole.type === 'bomb') {
        playBombSound();
        setCombo(0);
        const penalty = 15;
        setScore(s => Math.max(0, s - penalty));
        setStats(s => ({ ...s, bombHits: s.bombHits + 1 }));
        addPopup(`-${penalty} 💣炸彈!`, clientX, clientY, 'bomb');
      }

      // Hide after showing hit animation
      if (hideTimersRef.current[index]) {
        clearTimeout(hideTimersRef.current[index]);
      }
      hideTimersRef.current[index] = setTimeout(() => {
        setHoles(curr => {
          const next = [...curr];
          next[index] = { active: false, type: 'normal', hit: false };
          return next;
        });
      }, 350);

      return updated;
    });
  }, [gameState]);

  // Keyboard shortcut listener (1-9 and QWE/ASD/ZXC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (KEY_MAP[key] !== undefined) {
        e.preventDefault();
        handleWhack(KEY_MAP[key]);
      } else if ((e.key === ' ' || e.key === 'Enter') && gameState !== 'playing') {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleWhack]);

  // Track mouse move for hammer cursor via direct DOM (super smooth, zero re-renders)
  const handleMouseMove = (e) => {
    if (hammerRef.current) {
      hammerRef.current.style.left = `${e.clientX}px`;
      hammerRef.current.style.top = `${e.clientY}px`;
      hammerRef.current.style.display = 'block';
    }
  };

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  // Performance title evaluation
  const getRating = () => {
    if (score >= 260) return { title: '👑 神級地鼠捕手', desc: '不可思議的神速反應！打地鼠之神！' };
    if (score >= 180) return { title: '🥇 鑽石打擊達人', desc: '反應敏捷，精準度破表！' };
    if (score >= 120) return { title: '🥈 黃金好手', desc: '表現優秀，連擊節奏掌控得宜！' };
    if (score >= 60) return { title: '🥉 潛力新秀', desc: '手感很不錯，再挑戰一次打破紀錄！' };
    return { title: '🌱 地鼠實習生', desc: '別灰心，多練習手眼協調就能拿高分！' };
  };

  return (
    <div className="game-wrapper" onMouseMove={handleMouseMove}>
      {/* Top Header / Brand */}
      <header className="game-header">
        <div className="header-badge">
          <span className="badge-icon">⚡</span>
          <span className="badge-text">20秒快節奏反應力考驗</span>
        </div>
        <h1 className="game-title">
          <span className="title-highlight">打地鼠</span> 冒險擂台
        </h1>
        <p className="game-subtitle">20秒極限挑戰！消滅地鼠，拿取最高榮耀！</p>
      </header>

      {/* Control Bar: Audio, High Score, Difficulty */}
      <div className="top-dashboard">
        <div className="dash-card high-score-card">
          <span className="card-label">🏆 歷史最高分</span>
          <span className="card-value highlight-gold">{highScore}</span>
        </div>

        <div className="dash-controls">
          {/* Difficulty selector */}
          <div className="difficulty-pill-group">
            <button
              className={`pill-btn ${difficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setDifficulty('easy')}
              disabled={gameState === 'playing'}
              title="適合休閒練習"
            >
              輕鬆
            </button>
            <button
              className={`pill-btn ${difficulty === 'normal' ? 'active' : ''}`}
              onClick={() => setDifficulty('normal')}
              disabled={gameState === 'playing'}
              title="推薦標準速度"
            >
              標準
            </button>
            <button
              className={`pill-btn ${difficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setDifficulty('hard')}
              disabled={gameState === 'playing'}
              title="超快地鼠節奏"
            >
              狂熱
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            className={`sound-btn ${soundOn ? 'sound-on' : 'sound-off'}`}
            onClick={handleToggleSound}
            aria-label="音效開關"
            title={soundOn ? '點擊靜音' : '點擊開啟音效'}
          >
            {soundOn ? '🔊 音效開' : '🔇 靜音'}
          </button>
        </div>
      </div>

      {/* Live Game Scoreboard during Playing */}
      <div className="live-scoreboard">
        {/* Timer Card */}
        <div className={`score-stat-box timer-box ${timeLeft <= 5 && gameState === 'playing' ? 'urgent' : ''}`}>
          <div className="stat-header">
            <span className="stat-icon">⏱️</span>
            <span className="stat-name">剩餘時間</span>
          </div>
          <div className="stat-number time-digits">
            {timeLeft}<span className="unit">秒</span>
          </div>
          {/* Animated Time Progress Bar */}
          <div className="timer-bar-track">
            <div
              className="timer-bar-fill"
              style={{ width: `${(timeLeft / TOTAL_TIME) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Score Card */}
        <div className="score-stat-box score-box">
          <div className="stat-header">
            <span className="stat-icon">🎯</span>
            <span className="stat-name">目前得分</span>
          </div>
          <div className="stat-number score-digits">{score}</div>
          <div className="stat-sub">
            {combo > 1 ? (
              <span className="combo-tag">🔥 {combo} 連擊 (加分加成!)</span>
            ) : (
              <span className="combo-placeholder">普通擊中 +10 分</span>
            )}
          </div>
        </div>

        {/* Action / Quick Info */}
        <div className="score-stat-box info-box">
          <div className="stat-header">
            <span className="stat-icon">🐾</span>
            <span className="stat-name">地鼠類型</span>
          </div>
          <div className="mole-legend">
            <span className="legend-item"><span className="legend-dot normal-dot"></span>普通 +10</span>
            <span className="legend-item"><span className="legend-dot golden-dot"></span>金鼠 +30</span>
            <span className="legend-item"><span className="legend-dot bomb-dot"></span>炸彈 -15</span>
          </div>
        </div>
      </div>

      {/* Main Game Stage / Lawn */}
      <main className="lawn-stage">
        <div className="grid-container">
          {holes.map((hole, index) => (
            <Hole
              key={index}
              index={index}
              isActive={hole.active}
              moleType={hole.type}
              isHit={hole.hit}
              onWhack={handleWhack}
              keyBinding={KEY_LABELS[index]}
            />
          ))}
        </div>

        {/* Idle Start Overlay */}
        {gameState === 'idle' && (
          <div className="stage-overlay idle-overlay">
            <div className="overlay-dialog">
              <div className="dialog-badge">READY GO!</div>
              <h2 className="dialog-title">準備好打地鼠了嗎？</h2>
              <p className="dialog-desc">
                點擊冒出頭的地鼠！抓準時機連續擊中賺取高額連擊加分，小心別敲到炸彈！
              </p>
              <div className="rules-chip-row">
                <div className="rule-chip">⏳ 遊戲時間：<strong>20 秒</strong></div>
                <div className="rule-chip">⌨️ 支援鍵盤數字鍵 <strong>1 ~ 9</strong></div>
              </div>
              <button
                className="big-action-btn start-btn"
                onClick={startGame}
                id="start-game-btn"
              >
                <span className="btn-icon">🔨</span>
                <span className="btn-text">開始遊戲 (20秒)</span>
              </button>
            </div>
          </div>
        )}

        {/* Finished Game Overlay (Requirement: "時間到後顯示「finish」和重新開始按鈕") */}
        {gameState === 'finished' && (
          <div className="stage-overlay finished-overlay" id="finish-modal">
            <div className="overlay-dialog finish-card">
              <div className="finish-banner">
                <span className="finish-word">FINISH</span>
                <span className="finish-sub">時間到！遊戲結束</span>
              </div>

              {/* High Score Celebration Badge */}
              {score > 0 && score >= highScore && (
                <div className="new-record-ribbon">
                  🎉 突破歷史最高紀錄！
                </div>
              )}

              {/* Rating Title */}
              <div className="rating-card">
                <div className="rating-title">{getRating().title}</div>
                <div className="rating-desc">{getRating().desc}</div>
              </div>

              {/* Stats Summary */}
              <div className="finish-stats-grid">
                <div className="f-stat-item">
                  <span className="f-stat-label">最終得分</span>
                  <span className="f-stat-val highlight">{score}</span>
                </div>
                <div className="f-stat-item">
                  <span className="f-stat-label">擊中次數</span>
                  <span className="f-stat-val">{stats.hits} 次</span>
                </div>
                <div className="f-stat-item">
                  <span className="f-stat-label">最高連擊</span>
                  <span className="f-stat-val">{maxCombo} Combo</span>
                </div>
                <div className="f-stat-item">
                  <span className="f-stat-label">金地鼠收穫</span>
                  <span className="f-stat-val">{stats.goldenHits} 隻</span>
                </div>
              </div>

              {/* Restart Button (Requirement: "重新開始按鈕") */}
              <button
                className="big-action-btn restart-btn"
                onClick={startGame}
                id="restart-game-btn"
              >
                <span className="btn-icon">🔄</span>
                <span className="btn-text">重新開始</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Score Popups */}
      {popups.map(popup => (
        <div
          key={popup.id}
          className={`floating-popup popup-${popup.type}`}
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.text}
        </div>
      ))}

      {/* Animated Custom Hammer Cursor */}
      <div
        ref={hammerRef}
        className={`hammer-cursor ${isSwinging ? 'swing' : ''}`}
        style={{ display: 'none' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 80 80" width="56" height="56" fill="none">
          {/* Hammer Handle */}
          <rect
            x="24"
            y="32"
            width="8"
            height="44"
            rx="4"
            transform="rotate(-40 24 32)"
            fill="#854d0e"
            stroke="#451a03"
            strokeWidth="1.5"
          />
          {/* Handle Grip Stripes */}
          <line x1="44" y1="48" x2="48" y2="52" stroke="#fde047" strokeWidth="2" />
          <line x1="50" y1="54" x2="54" y2="58" stroke="#fde047" strokeWidth="2" />
          {/* Hammer Head */}
          <rect
            x="14"
            y="12"
            width="42"
            height="22"
            rx="4"
            transform="rotate(-40 14 12)"
            fill="#e11d48"
            stroke="#881337"
            strokeWidth="2"
          />
          {/* Mallet Cushion Ends */}
          <rect
            x="8"
            y="10"
            width="8"
            height="26"
            rx="3"
            transform="rotate(-40 8 10)"
            fill="#facc15"
          />
          <rect
            x="48"
            y="44"
            width="8"
            height="26"
            rx="3"
            transform="rotate(-40 48 44)"
            fill="#facc15"
          />
        </svg>
      </div>

      {/* Footer Instructions */}
      <footer className="game-footer">
        <p className="footer-tip">
          💡 小提示：你可以用滑鼠點擊，也可以直接按鍵盤上的 <strong>1 ~ 9</strong> 鍵來打對應位置的地鼠！
        </p>
      </footer>
    </div>
  );
}
