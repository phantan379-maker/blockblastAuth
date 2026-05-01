import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trophy, Palette, Flame, Zap, TreePine, CircleDashed } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Jumpscare } from './Jumpscare';

// ==========================================
// AUDIO URL CONFIGURATION
// You can replace these URLs with direct links to your .ogg or .mp3 files
// Note: The host you upload them to MUST support CORS, or the audio won't play.
// ==========================================
const PLACE_SND_URL = "https://files.catbox.moe/4eeoxr.ogg";
const CLEAR_SND_URL = "https://files.catbox.moe/uc9a04.ogg";
const COMBO_SND_URL = "https://files.catbox.moe/zzakw7.ogg";
// ==========================================

type GridData = number[][]; // 0 empty, 1..9 color index
interface ShapeDef { id: string; matrix: number[][]; colorIdx: number; }
interface ExplosionData { id: string; r: number; c: number; colorIdx: number; isCombo: boolean; }

const THEMES = {
  vibrant: {
    name: 'Vibrant',
    appBg: 'bg-[#181a33]',
    gridBg: 'bg-[#1e2444]',
    gridBorder: 'border-[#181a33] shadow-2xl rounded-xl',
    text: 'text-white',
    scoreLabel: 'text-slate-400',
    emptyCell: 'bg-[#293256] rounded-[4px] shadow-[inset_0_0_8px_rgba(0,0,0,0.2)]',
    colors: [
      'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-emerald-500',
      'bg-cyan-400', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-lime-500'
    ],
    blockClasses: 'shadow-[inset_0_4px_0_rgba(255,255,255,0.25),inset_0_-4px_0_rgba(0,0,0,0.2),inset_4px_0_0_rgba(255,255,255,0.1),inset_-4px_0_0_rgba(0,0,0,0.1)] rounded-[4px] ring-1 ring-black/20'
  },
  neon: {
    name: 'Cyber Neon',
    appBg: 'bg-zinc-950',
    gridBg: 'bg-black',
    gridBorder: 'border-fuchsia-900/40 shadow-[0_0_20px_rgba(217,70,239,0.15)] rounded-xl',
    text: 'text-fuchsia-100',
    scoreLabel: 'text-fuchsia-400/70',
    emptyCell: 'bg-zinc-900/30 border border-zinc-800/50',
    colors: [
        'bg-transparent border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5),inset_0_0_10px_rgba(239,68,68,0.3)]',
        'bg-transparent border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5),inset_0_0_10px_rgba(249,115,22,0.3)]',
        'bg-transparent border-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5),inset_0_0_10px_rgba(250,204,21,0.3)]',
        'bg-transparent border-2 border-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5),inset_0_0_10px_rgba(163,230,53,0.3)]',
        'bg-transparent border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5),inset_0_0_10px_rgba(34,211,238,0.3)]',
        'bg-transparent border-2 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5),inset_0_0_10px_rgba(217,70,239,0.3)]',
        'bg-transparent border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5),inset_0_0_10px_rgba(168,85,247,0.3)]',
        'bg-transparent border-2 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5),inset_0_0_10px_rgba(236,72,153,0.3)]',
        'bg-transparent border-2 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5),inset_0_0_10px_rgba(45,212,191,0.3)]'
    ],
    blockClasses: 'rounded-sm'
  },
  wood: {
    name: 'Classic Wood',
    appBg: 'bg-[#211611]',
    gridBg: 'bg-[#3b2a21]',
    gridBorder: 'border-[#1f1510] shadow-2xl rounded-xl',
    text: 'text-amber-100',
    scoreLabel: 'text-amber-500/70',
    emptyCell: 'bg-[#291e17] border-t border-l border-[#45362b] border-b border-r border-[#1a120e]',
    colors: [
      'bg-[#8b5a2b]', 'bg-[#a0522d]', 'bg-[#cd853f]', 'bg-[#d2b48c]',
      'bg-[#deb887]', 'bg-[#bc8f8f]', 'bg-[#f4a460]', 'bg-[#d2691e]', 'bg-[#b8860b]'
    ],
    blockClasses: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-4px_6px_rgba(0,0,0,0.4)] ring-1 ring-[#3a2210] rounded-[2px]'
  },
  retro: {
    name: 'Retro Bevel',
    appBg: 'bg-zinc-100',
    gridBg: 'bg-white',
    gridBorder: 'border-zinc-200 shadow-xl rounded-xl',
    text: 'text-slate-900',
    scoreLabel: 'text-slate-500',
    emptyCell: 'bg-zinc-100 rounded-none',
    colors: [
      'bg-[#df2c31]', 'bg-[#ed8b22]', 'bg-[#efd324]', 'bg-[#6eb12d]',
      'bg-[#72c2da]', 'bg-[#224497]', 'bg-[#984594]', 'bg-[#ec4899]', 'bg-[#14b8a6]'
    ],
    blockClasses: 'border-[5px] border-t-white/40 border-l-white/40 border-b-black/30 border-r-black/30 rounded-none'
  },
  breakfast: {
    name: 'Sizzling Breakfast',
    appBg: 'bg-zinc-800',
    gridBg: 'bg-zinc-950 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]',
    gridBorder: 'border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(0,0,0,0.9)] rounded-[16px]',
    text: 'text-zinc-100',
    scoreLabel: 'text-orange-400/80',
    emptyCell: 'bg-zinc-900/60 border border-zinc-800/40 rounded-[4px]',
    colors: Array(9).fill('bg-breakfast'), // dummy class to indicate it's not empty
    blockClasses: ''
  }
};
type ThemeKey = keyof typeof THEMES;

const THEME_ICONS: Record<ThemeKey, React.ElementType> = {
    vibrant: Palette,
    neon: Zap,
    wood: TreePine,
    retro: CircleDashed,
    breakfast: Flame
};

const BreakfastCell = ({ colorIdx }: { colorIdx: number }) => {
   if (colorIdx === 0) return null;

   if (colorIdx === 7) {
       return (
           <div className="absolute inset-[2px] bg-[#8B2323] rounded-sm shadow-[inset_0_2px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.4)] overflow-hidden flex flex-col justify-evenly">
              <div className="w-full h-[3px] bg-[#E8B8B8] opacity-60 skew-y-3" />
              <div className="w-full h-[4px] bg-[#E8B8B8] opacity-60 -skew-y-3" />
              <div className="w-full h-[3px] bg-[#E8B8B8] opacity-60 skew-y-3" />
           </div>
       );
   }

   if (colorIdx === 8) {
       return (
           <div className="absolute inset-[2px] bg-[#70321F] rounded-full shadow-[inset_0_4px_4px_rgba(255,255,255,0.2),inset_0_-4px_4px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <div className="w-[70%] h-[70%] rounded-full bg-[#5C2616] opacity-50 shadow-inner" />
           </div>
       );
   }

   const yolkColors = [
       '',
       'bg-yellow-400', // 1
       'bg-orange-500', // 2
       'bg-amber-400',  // 3
       'bg-[#FFD700]',  // 4
       'bg-[#FFA500]',  // 5
       '', '', '', // 7,8 bacon/sausage
       'bg-lime-400'    // 9
   ];

   const isQuail = colorIdx === 6;
   
   return (
       <div className="absolute inset-[1px] bg-[radial-gradient(ellipse_at_top_left,_#ffffff_0%,_#fbf8f1_70%,_#e6dfd1_100%)] rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center">
          {isQuail ? (
             <div className="relative w-full h-full">
                <div className="absolute top-[15%] left-[15%] w-[35%] h-[35%] bg-yellow-400 rounded-full shadow-[inset_-1px_-2px_2px_rgba(0,0,0,0.2)]">
                   <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white rounded-full opacity-60" />
                </div>
                <div className="absolute bottom-[20%] left-[25%] w-[30%] h-[30%] bg-orange-400 rounded-full shadow-[inset_-1px_-2px_2px_rgba(0,0,0,0.2)]">
                   <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white rounded-full opacity-60" />
                </div>
                <div className="absolute top-[35%] right-[15%] w-[40%] h-[40%] bg-yellow-500 rounded-full shadow-[inset_-1px_-2px_2px_rgba(0,0,0,0.2)]">
                   <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white rounded-full opacity-60" />
                </div>
             </div>
          ) : (
             <div className={`w-[60%] h-[60%] rounded-full ${yolkColors[colorIdx] || 'bg-yellow-400'} shadow-[inset_-2px_-3px_5px_rgba(0,0,0,0.2),0_2px_5px_rgba(0,0,0,0.2)] relative`}>
                <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white rounded-full opacity-70 blur-[1px]" />
                <div className="absolute top-[35%] left-[12%] w-[15%] h-[15%] bg-white rounded-full opacity-40 blur-[0.5px]" />
             </div>
          )}
       </div>
   );
}

const SHAPE_DEFS_RAW = [
  [[1]], [[1, 1]], [[1], [1]], [[1, 1, 1]], [[1], [1], [1]], [[1, 1, 1, 1]], [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]], [[1], [1], [1], [1], [1]], [[1, 1], [1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  [[1, 0], [1, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]],
  [[1, 0, 0], [1, 0, 0], [1, 1, 1]], [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
  [[1, 1, 1], [1, 0, 0], [1, 0, 0]], [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
  [[0, 1, 0], [1, 1, 1]], [[1, 0], [1, 1], [1, 0]], [[1, 1, 1], [0, 1, 0]],
  [[0, 1], [1, 1], [0, 1]], [[1, 1, 1], [0, 1, 0], [0, 1, 0]],
  [[0, 0, 1], [1, 1, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1], [1, 0, 0]], [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
];
const SHAPE_DEFS: { matrix: number[][] }[] = SHAPE_DEFS_RAW.map(m => ({ matrix: m }));

const createEmptyGrid = (): GridData => Array.from({ length: 8 }, () => Array(8).fill(0));
const canPlace = (grid: GridData, matrix: number[][], col: number, row: number) => {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] && (row + r < 0 || row + r >= 8 || col + c < 0 || col + c >= 8 || grid[row + r][col + c] !== 0)) return false;
    }
  }
  return true;
};

const getShapeSize = (matrix: number[][]) => {
  return matrix.reduce((acc, row) => acc + row.filter(v => v).length, 0);
};

const getRandomShapes = (grid?: GridData): ShapeDef[] => {
  let validShapes = grid ? SHAPE_DEFS.filter(s => {
    for(let r=0; r<8; r++) {
      for(let c=0; c<8; c++) {
        if(canPlace(grid, s.matrix, c, r)) return true;
      }
    }
    return false;
  }) : [];

  let emptyCells = 64;
  if (grid) {
     emptyCells = grid.reduce((acc, row) => acc + row.filter(v => v === 0).length, 0);
  }

  return Array.from({ length: 3 }).map((_, i) => {
    let pool = SHAPE_DEFS;
    
    // Auto-balance logic: help the player when board is tight
    let forceValid = false;
    if (grid && validShapes.length > 0) {
      if (i === 0) forceValid = true; // Always guarantee at least 1 valid shape
      else if (emptyCells < 45 && Math.random() > 0.3) forceValid = true;
    }

    if (forceValid) {
       // if very tight, bias heavily towards small shapes
       const smallValidShapes = validShapes.filter(s => getShapeSize(s.matrix) <= 4);
       if (emptyCells < 35 && smallValidShapes.length > 0 && Math.random() > 0.2) {
           pool = smallValidShapes;
       } else {
           pool = validShapes;
       }
    }

    const s = pool[Math.floor(Math.random() * pool.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      matrix: s.matrix,
      colorIdx: Math.floor(Math.random() * 9) + 1
    };
  });
};
const checkGameOver = (grid: GridData, tray: (ShapeDef | null)[]) => {
  if (!tray.some(s => s !== null)) return false;
  for (const shape of tray) {
    if (!shape) continue;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (canPlace(grid, shape.matrix, c, r)) return false;
  }
  return true;
};

// -- Audio System --
let audioCtx: AudioContext | null = null;
const audioBuffers: Record<string, AudioBuffer> = {};

const loadBuffer = async (url: string, name: string) => {
  if (!audioCtx) return;
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioBuffers[name] = audioBuffer;
  } catch (e) {
    console.error(`Failed to load audio ${name}`, e);
  }
};

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    loadBuffer(PLACE_SND_URL, 'place');
    loadBuffer(CLEAR_SND_URL, 'clear');
    loadBuffer(COMBO_SND_URL, 'combo');
  }
  if (audioCtx.state === 'suspended') {
      audioCtx.resume();
  }
};

const playSynth = (type: 'place' | 'clear' | 'combo', streak: number = 0) => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const buffer = audioBuffers[type];
  if (buffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const minRate = 1.0;
    const maxRate = 2.5;
    source.playbackRate.value = Math.min(minRate + streak * 0.1, maxRate);
    const gain = audioCtx.createGain();
    gain.gain.value = 0.5;
    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start(0);
    return;
  }

  // Fallback to oscillator if buffer missing (e.g. empty file)
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  const pitchShift = Math.min(streak * 30, 400);

  if (type === 'place') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300 + pitchShift/2, now);
    osc.frequency.exponentialRampToValueAtTime(100 + pitchShift/2, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'clear') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(300 + pitchShift, now);
    osc.frequency.setValueAtTime(375 + pitchShift, now + 0.05);
    osc.frequency.setValueAtTime(450 + pitchShift, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'combo') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400 + pitchShift, now);
    osc.frequency.setValueAtTime(500 + pitchShift, now + 0.05);
    osc.frequency.setValueAtTime(600 + pitchShift, now + 0.1);
    osc.frequency.setValueAtTime(800 + pitchShift, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  }
  osc.connect(gain);
  gain.connect(audioCtx.destination);
};

const ParticleExplosion = ({ exp, dim, themeColorClass }: {key?: string, exp: ExplosionData, dim: number, themeColorClass: string}) => {
  const gap = 4;
  const x = exp.c * dim + exp.c * gap + dim / 2;
  const y = exp.r * dim + exp.r * gap + dim / 2;
  const particles = Array.from({ length: exp.isCombo ? 10 : 5 });
  
  // Clean string to get primary color for background of particle if it's neon
  const cleanColor = themeColorClass.replace(/bg-transparent|border-\d|border-[a-z]+-\d+|shadow-\[.*?\]/g, '').trim() || themeColorClass;
  
  let particleColor = themeColorClass;
  if(themeColorClass.includes('border-')) {
     const match = themeColorClass.match(/border-([a-z]+-\d+)/);
     if(match) particleColor = `bg-${match[1]}`;
  }

  let isRounded = "rounded-sm";
  if (themeColorClass.includes('breakfast')) {
      particleColor = Math.random() > 0.4 ? 'bg-yellow-400' : 'bg-white';
      isRounded = "rounded-full";
  }

  return (
    <div className="absolute top-0 left-0 pointer-events-none" style={{ transform: `translate(${x}px, ${y}px)` }}>
       {particles.map((_, i) => {
          const angle = (Math.PI * 2 * i) / particles.length + (Math.random() * 0.5);
          const dist = exp.isCombo ? dim * 2 + Math.random()*dim : dim * 1.5 + Math.random()*dim;
          return (
             <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                animate={{ opacity: 0, x: Math.cos(angle)*dist, y: Math.sin(angle)*dist, scale: 0.2, rotate: Math.random()*360 }}
                transition={{ duration: 0.4 + Math.random()*0.3, ease: "easeOut" }}
                className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 ${isRounded} shadow-md ${particleColor}`}
             />
          );
       })}
    </div>
  );
};

export const BlockBlast = () => {
  const [theme, setTheme] = useState<ThemeKey>('vibrant');
  const t = THEMES[theme];

  const [grid, setGrid] = useState<GridData>(createEmptyGrid());
  const [tray, setTray] = useState<(ShapeDef | null)[]>(getRandomShapes());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missedClears, setMissedClears] = useState(0);
  const [comboMsgs, setComboMsgs] = useState<{id: string, text: string}[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isJumpscare, setIsJumpscare] = useState(false);

  // Dragging State
  const [dragState, setDragState] = useState<{ active: boolean; shape: ShapeDef | null; index: number; x: number; y: number; }>({
    active: false, shape: null, index: -1, x: 0, y: 0
  });
  const [shadow, setShadow] = useState<{ col: number; row: number } | null>(null);
  const [blockDim, setBlockDim] = useState(38);
  
  // Animation States
  const [previewClears, setPreviewClears] = useState<{rows: number[], cols: number[]}>({rows: [], cols: []});
  const [lastPlaced, setLastPlaced] = useState<string[]>([]);
  const [explosions, setExplosions] = useState<ExplosionData[]>([]);
  const [isShaking, setIsShaking] = useState<'normal'|'hard'|false>(false);

  const gridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('mousedown', handleFirstInteraction);
    };
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('mousedown', handleFirstInteraction);
    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('mousedown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('blockBlastBest');
    if (saved) setBestScore(parseInt(saved, 10));
    const savedTheme = localStorage.getItem('blockBlastTheme') as ThemeKey;
    if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);
  }, []);

  const changeTheme = (key: ThemeKey) => {
      setTheme(key);
      localStorage.setItem('blockBlastTheme', key);
  }

  useEffect(() => {
    const updateSize = () => {
      if (gridRef.current && gridRef.current.children[0]) {
        setBlockDim(gridRef.current.children[0].children[0].getBoundingClientRect().width);
      }
    };
    setTimeout(updateSize, 50);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, shape: ShapeDef, index: number) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    initAudio();
    if (gameOver) return;
    setDragState({ active: true, shape, index, x: e.clientX, y: e.clientY });
    setShadow(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.active || !dragState.shape) return;
    setDragState(prev => ({ ...prev, x: e.clientX, y: e.clientY }));

    if (gridRef.current) {
      const isTouch = e.pointerType === 'touch' || navigator.maxTouchPoints > 0;
      const cols = dragState.shape.matrix[0].length;
      const rows = dragState.shape.matrix.length;
      const gap = 4;
      const shapePxWidth = cols * blockDim + (cols - 1) * gap;
      // Increased offsetY so block stays well above finger
      const shapePxHeight = rows * blockDim + (rows - 1) * gap;
      const offsetY = isTouch ? Math.max(80, shapePxHeight + 30) : 20;

      const shapeLeft = e.clientX - shapePxWidth / 2;
      const shapeTop = e.clientY - offsetY;
      
      const rect = gridRef.current.getBoundingClientRect();
      const cellOuterW = (rect.width - 16) / 8; // approx minus padding
      const col = Math.round((shapeLeft - rect.left - 8) / cellOuterW);
      const row = Math.round((shapeTop - rect.top - 8) / cellOuterW);

      if (canPlace(grid, dragState.shape.matrix, col, row)) {
        setShadow({ col, row });
        const mockGrid = grid.map(r => [...r]);
        for (let r = 0; r < rows; r++) {
           for (let c = 0; c < cols; c++) {
              if (dragState.shape.matrix[r][c]) mockGrid[row + r][col + c] = dragState.shape.colorIdx;
           }
        }
        const pRows: number[] = []; const pCols: number[] = [];
        for (let r = 0; r < 8; r++) if (mockGrid[r].every(x => x !== 0)) pRows.push(r);
        for (let c = 0; c < 8; c++) {
           let full = true;
           for (let r = 0; r < 8; r++) if (mockGrid[r][c] === 0) { full = false; break; }
           if (full) pCols.push(c);
        }
        setPreviewClears({ rows: pRows, cols: pCols });
      } else {
        setShadow(null);
        setPreviewClears({ rows: [], cols: [] });
      }
    }
  };

  const showComboText = (text: string) => {
      const id = Math.random().toString();
      setComboMsgs(p => [...p, {id, text}]);
      setTimeout(() => setComboMsgs(p => p.filter(m => m.id !== id)), 1500);
  }

  const handlePointerUp = () => {
    if (!dragState.active || !dragState.shape) return;

    if (shadow) {
      const newGrid = grid.map(row => [...row]);
      let blocksPlaced = 0;
      const matrix = dragState.shape.matrix;
      const placedCells: string[] = [];

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            newGrid[shadow.row + r][shadow.col + c] = dragState.shape.colorIdx;
            blocksPlaced++;
            placedCells.push(`${shadow.row+r}-${shadow.col+c}`);
          }
        }
      }

      setLastPlaced(placedCells);
      setTimeout(() => setLastPlaced([]), 250);

      const rowsToClear: number[] = [];
      const colsToClear: number[] = [];
      for (let r = 0; r < 8; r++) if (newGrid[r].every(cell => cell !== 0)) rowsToClear.push(r);
      for (let c = 0; c < 8; c++) {
        let isFull = true;
        for (let r = 0; r < 8; r++) if (newGrid[r][c] === 0) { isFull = false; break; }
        if (isFull) colsToClear.push(c);
      }

      const linesCleared = rowsToClear.length + colsToClear.length;
      let newStreak = streak;
      let newMissedClears = missedClears;

      if (linesCleared > 0) {
          const isCombo = linesCleared > 1;
          newStreak += 1;
          newMissedClears = 0; // reset missed clears
          
          playSynth(isCombo ? 'combo' : 'clear', newStreak);
          setIsShaking(isCombo ? 'hard' : 'normal');
          setTimeout(() => setIsShaking(false), isCombo ? 250 : 150);
          
          if (isCombo) showComboText(`Combo x${linesCleared}!`);
          if (newStreak > 1) setTimeout(() => showComboText(`Streak x${newStreak}!`), isCombo ? 200 : 0);

          const expList: ExplosionData[] = [];
          for(const r of rowsToClear) {
             for(let c=0; c<8; c++) expList.push({ id: Math.random().toString(), r, c, colorIdx: newGrid[r][c], isCombo });
          }
          for(const c of colsToClear) {
             for(let r=0; r<8; r++) {
                if (!rowsToClear.includes(r)) expList.push({ id: Math.random().toString(), r, c, colorIdx: newGrid[r][c], isCombo });
             }
          }
          setExplosions(prev => [...prev, ...expList]);
          setTimeout(() => setExplosions(prev => prev.filter(e => !expList.map(x=>x.id).includes(e.id))), 800);
          
          for (const r of rowsToClear) for(let c=0; c<8; c++) newGrid[r][c] = 0;
          for (const c of colsToClear) for(let r=0; r<8; r++) newGrid[r][c] = 0;
      } else {
          newMissedClears += 1;
          if (newMissedClears >= 3) {
              newStreak = 0;
              newMissedClears = 0;
          }
          playSynth('place');
      }

      setStreak(newStreak);
      setMissedClears(newMissedClears);

      let earned = blocksPlaced;
      if (linesCleared > 0) {
          earned += linesCleared * 20;
          if (linesCleared > 1) earned += Math.pow(2, linesCleared) * 10; // combo bonus
          if (newStreak > 1) earned += newStreak * 20; // Streak bonus
      }

      const newScore = score + earned;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('blockBlastBest', newScore.toString());
      }
      
      if (!isJumpscare && newScore >= 200) setIsJumpscare(true);

      const newTray = [...tray];
      newTray[dragState.index] = null;
      let nextTray = newTray;
      if (newTray.every(s => s === null)) nextTray = getRandomShapes(newGrid);

      setGrid(newGrid);
      setTray(nextTray);

      const isOver = checkGameOver(newGrid, nextTray);
      if (isOver) {
        setGameOver(true);
        if (newScore > 50 && !isJumpscare) setTimeout(() => setIsJumpscare(true), 1500);
      }
    }

    setDragState({ active: false, shape: null, index: -1, x: 0, y: 0 });
    setShadow(null);
    setPreviewClears({ rows: [], cols: [] });
  };

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setTray(getRandomShapes());
    setScore(0);
    setStreak(0);
    setMissedClears(0);
    setGameOver(false);
  };

  const getCellClass = (colorIndex: number) => {
      if (colorIndex === 0) return t.emptyCell;
      if (theme === 'breakfast') return ''; // BreakfastCell handles background
      return `${t.colors[colorIndex - 1]} ${t.blockClasses}`;
  }

  // Adjust placement preview offset calculation
  const isTouch = navigator.maxTouchPoints > 0;
  let dragOffsetLeft = 0;
  let dragOffsetTop = 0;
  if (dragState.shape) {
      const cols = dragState.shape.matrix[0].length;
      const rows = dragState.shape.matrix.length;
      const shapePxWidth = cols * blockDim + (cols - 1) * 4;
      const shapePxHeight = rows * blockDim + (rows - 1) * 4;
      dragOffsetLeft = dragState.x - shapePxWidth / 2;
      dragOffsetTop = dragState.y - (isTouch ? Math.max(80, shapePxHeight + 30) : 20);
  }

  return (
    <div 
      className={`min-h-screen ${t.appBg} ${t.text} flex flex-col items-center py-4 px-4 touch-none select-none overflow-hidden relative font-sans transition-colors duration-500`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {isJumpscare && <Jumpscare />}
      
      {/* Header & Theme Switcher */}
      <div className="w-full max-w-md flex justify-between items-start mb-6 px-2">
         <div className="flex gap-2">
             {Object.entries(THEMES).map(([k, th]) => {
                const Icon = THEME_ICONS[k as ThemeKey] || Palette;
                return (
                 <button 
                   key={k} 
                   onClick={() => changeTheme(k as ThemeKey)}
                   className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${theme === k ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'} ${th.gridBg}`}
                   title={th.name}
                 >
                   <Icon size={14} className={theme !== k ? 'opacity-50' : ''} />
                 </button>
                )
             })}
         </div>
         <div className="flex flex-col items-end">
            <div className={`flex items-center text-amber-500 mb-0.5 gap-1`}>
              <Trophy size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Best</span>
            </div>
            <div className="text-xl font-bold tracking-tight text-amber-500 leading-none">{bestScore}</div>
         </div>
      </div>

      {/* Score Area */}
      <div className="w-full max-w-md flex justify-between items-end mb-6 px-4">
        <div>
           <div className={`${t.scoreLabel} text-xs font-semibold tracking-wider mb-1 uppercase`}>Score</div>
           <div className="text-5xl font-black tracking-tight leading-none">{score}</div>
        </div>
        
        {/* Streak Display */}
        <AnimatePresence>
            {streak > 1 && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.5, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.5 }}
                   className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full"
                >
                   <Flame size={18} className="animate-pulse" />
                   <span className="font-bold text-sm tracking-wide">Streak {streak}</span>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Floating Combo Texts */}
      <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center">
         {comboMsgs.map(msg => (
             <h2 key={msg.id} className="absolute text-3xl font-black text-amber-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-float tracking-tight">
                 {msg.text}
             </h2>
         ))}
      </div>

      <style>{`
        @keyframes rainbowGlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-rainbow-glow {
          animation: rainbowGlow 1.5s linear infinite;
        }
      `}</style>

      <div className={`relative w-full max-w-md mx-auto transition-transform duration-300 ${isShaking === 'hard' ? 'animate-shake-hard' : isShaking === 'normal' ? 'animate-shake' : ''}`}>
        <div 
          ref={gridRef} 
          className={`relative w-full ${t.gridBg} p-2 rounded-xl bg-clip-padding transition-colors z-10 border ${t.gridBorder}`}
        >
          <div className="grid grid-cols-8 gap-1 relative z-10 transition-colors">
          {grid.map((rowArr, r) => 
            rowArr.map((colorIdx, c) => {
               const isHovered = shadow && dragState.shape && 
                  r >= shadow.row && r < shadow.row + dragState.shape.matrix.length &&
                  c >= shadow.col && c < shadow.col + dragState.shape.matrix[0].length &&
                  dragState.shape.matrix[r - shadow.row][c - shadow.col] === 1;
               const isPreviewClear = previewClears.rows.includes(r) || previewClears.cols.includes(c);
               const isJustPlaced = lastPlaced.includes(`${r}-${c}`);

               let cellClass = getCellClass(colorIdx);
               
               if (isPreviewClear && dragState.shape) {
                  // highlight color of the piece being dropped
                  cellClass = `${getCellClass(dragState.shape.colorIdx)} opacity-100 scale-105 z-20 ${theme === 'breakfast' ? 'shadow-[0_0_20px_white]' : 'shadow-[0_0_20px_inherit]'} animate-pulse ring-2 ring-white/50`;
               } else if (isHovered) {
                  cellClass = `${getCellClass(dragState.shape!.colorIdx)} opacity-40 shadow-inner`;
               }

               let animationClasses = 'transition-all duration-75';
               if (isJustPlaced && !isPreviewClear) animationClasses += ' animate-pop z-10';

               const willClear = previewClears.rows.length > 0 || previewClears.cols.length > 0;
               const showRainbow = streak >= 3 && willClear && (isHovered || isPreviewClear);
               
               const isBreakfastColor = colorIdx > 0 && theme === 'breakfast';
               const isPreviewBreakfastColor = isHovered && theme === 'breakfast';

               return (
                 <div key={`${r}-${c}`} className="relative w-full aspect-square">
                    {showRainbow && (
                       <div className="absolute -inset-[3px] rounded bg-[linear-gradient(90deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#8b00ff,#ff0000)] bg-[length:200%_100%] animate-rainbow-glow opacity-60 blur-[3px] z-0 pointer-events-none" />
                    )}
                    <div className={`relative w-full h-full ${cellClass} ${animationClasses} z-10 rounded-[2px]`}>
                        {(isBreakfastColor || isPreviewBreakfastColor) && (
                            <BreakfastCell colorIdx={isHovered ? dragState.shape!.colorIdx : colorIdx} />
                        )}
                    </div>
                 </div>
               );
            })
          )}
        </div>
        
        {explosions.length > 0 && (
           <div className="absolute inset-0 p-2 overflow-visible pointer-events-none z-30">
              {explosions.map(exp => <ParticleExplosion key={exp.id} exp={exp} dim={blockDim} themeColorClass={t.colors[exp.colorIdx - 1]} />)}
           </div>
        )}
        </div>
      </div>

      <div className="w-full max-w-md mt-8 h-36 flex justify-center items-center gap-4 px-2">
        {tray.map((shape, idx) => (
          <div key={idx} className="flex-1 flex justify-center items-center h-full relative">
            <div 
              onPointerDown={(e) => { initAudio(); if (shape) handlePointerDown(e, shape, idx); }}
              className={`grid gap-1 transition-transform touch-none origin-center ${dragState.active && dragState.index === idx ? 'opacity-0 scale-50' : 'cursor-grab active:cursor-grabbing hover:scale-105'} ${(gameOver || !shape) ? 'opacity-50 pointer-events-none' : ''}`}
              style={{
                gridTemplateColumns: shape ? `repeat(${shape.matrix[0].length}, min(5vw, 22px))` : 'none',
                gridAutoRows: 'min(5vw, 22px)'
              }}
            >
               {shape?.matrix.map((row, r) => row.map((val, c) => (
                 val ? <div key={`${r}-${c}`} className={`relative w-full h-full ${getCellClass(shape.colorIdx)}`}>
                         {theme === 'breakfast' && <BreakfastCell colorIdx={shape.colorIdx} />}
                       </div> 
                     : <div key={`${r}-${c}`} />
               )))}
            </div>
          </div>
        ))}
      </div>

      {gameOver && !isJumpscare && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
           <h2 className="text-6xl font-black text-white mb-2 tracking-tight drop-shadow-lg">GAME OVER</h2>
           <p className="text-slate-300 font-medium mb-8 text-xl">Final Score: <span className="text-white font-bold">{score}</span></p>
           <button 
             onClick={resetGame}
             className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-all w-64 justify-center text-lg active:scale-95"
           >
              <RefreshCw size={24} /> Play Again
           </button>
        </div>
      )}

      {dragState.active && dragState.shape && (
         <div 
           className="fixed inset-0 z-50 overflow-hidden touch-none pointer-events-none"
         >
           <div
              className="absolute grid gap-1 drop-shadow-2xl z-50 transition-transform duration-75 ease-out scale-110 pointer-events-none"
              style={{
                 left: dragOffsetLeft,
                 top: dragOffsetTop,
                 gridTemplateColumns: `repeat(${dragState.shape!.matrix[0].length}, ${blockDim}px)`,
                 gridAutoRows: `${blockDim}px`
              }}
           >
               {dragState.shape!.matrix.map((row, r) => row.map((val, c) => (
                  val ? <div key={`${r}-${c}`} className={`relative w-full h-full ${getCellClass(dragState.shape!.colorIdx)}`}>
                           {theme === 'breakfast' && <BreakfastCell colorIdx={dragState.shape!.colorIdx} />}
                        </div> 
                      : <div key={`${r}-${c}`} />
               )))}
           </div>
         </div>
      )}
    </div>
  );
};
