/**
 * AppEmojis – SVG icon components replacing all emoji usage.
 *
 * ── HOW TO SWAP ANY EMOJI WITH YOUR OWN IMAGE ────────────────────────────
 *
 *  Option A – Global override (affects every <EmojiDisplay emoji="🎓" /> in the app):
 *    1. Import your image at the top of this file:
 *         import gradcapImg from "figma:asset/your-file.png";
 *    2. Add it to `emojiImageOverrides`:
 *         "🎓": gradcapImg,
 *
 *  Option B – Per-component override (pass src directly):
 *         import myImg from "figma:asset/your-file.png";
 *         <EGradCap size={40} src={myImg} />
 *
 * ─────────────────────────────────────────────────────────────────────────
 */

// ── Paste your image imports here ────────────────────────────────────────
// import gradcapImg  from "figma:asset/xxx.png";
// import mapImg      from "figma:asset/xxx.png";
// ... etc.

/**
 * Map emoji characters → imported image src.
 * Leave a value empty ("") or absent to keep the SVG fallback.
 */
export const emojiImageOverrides: Record<string, string> = {
  // "🎓": gradcapImg,
  // "🗺️": mapImg,
  // "🧭": compassImg,
  // "🏅": medalImg,
  // "🎲": diceImg,
  // "🧩": puzzleImg,
  // "📚": booksImg,
  // "🌸": flowerImg,
  // "🚪": doorImg,
  // "🏃": runnerImg,
  // "🍜": noodlesImg,
  // "💧": dropImg,
  // "🎨": paletteImg,
  // "🔬": microscopeImg,
  // "⚙️": gearImg,
  // "🏺": vaseImg,
  // "🏠": houseImg,
  // "🏛️": buildingImg,
  // "🔋": batteryImg,
  // "🌿": leafImg,
  // "⚡": lightningImg,
  // "💫": sparkleImg,
  // "🏫": schoolImg,
  // "🌱": seedlingImg,
  // "✨": sparklesImg,
  // "📌": pushpinImg,
  // "🚶": walkerImg,
  // "🏁": finishFlagImg,
  // "🛗": elevatorImg,
  // "🪜": ladderImg,
  // "📍": locationPinImg,
  // "🔍": searchImg,
  // "📷": cameraImg,
  // "📸": cameraImg,
  // "✅": checkCircleImg,
};

// ─────────────────────────────────────────────────────────────────────────

const navy = "#0E1B4D";
const sw = 2.2;

export interface EmojiProps {
  size?: number;
  color?: string;
  /** Optional: pass an imported image src to render <img> instead of SVG */
  src?: string;
}

/** Internal helper: renders <img> when src is provided, else renders children (SVG) */
function SvgOrImg({
  src, size, children,
}: { src?: string; size: number; children: React.ReactNode }) {
  if (src) {
    return (
      <img
        src={src}
        width={size}
        height={size}
        style={{ objectFit: "contain", display: "inline-block", verticalAlign: "middle" }}
        alt=""
      />
    );
  }
  return <>{children}</>;
}

/* ── Graduation Cap 🎓 ── */
export function EGradCap({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M4 14L16 8L28 14L16 20L4 14Z" fill={color + "28"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <polygon points="16,8 28,14 16,20 4,14" fill={color + "18"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="28" y1="14" x2="28" y2="22" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="28" cy="23" r="1.5" fill={color} />
        <line x1="10" y1="17.5" x2="10" y2="25" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <path d="M8 25 Q10 27 12 25" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Map 🗺️ ── */
export function EMap({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M4 8L12 6V26L4 24V8Z" fill={color + "22"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M12 6L20 9V29L12 26V6Z" fill={color + "10"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M20 9L28 6V24L20 27V9Z" fill={color + "22"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="12" y1="6" x2="12" y2="26" stroke={color} strokeWidth={sw} />
        <line x1="20" y1="9" x2="20" y2="27" stroke={color} strokeWidth={sw} />
        <circle cx="17" cy="16" r="2" fill={color} />
        <path d="M17 18L17 21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Compass 🧭 ── */
export function ECompass({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" fill={color + "12"} stroke={color} strokeWidth={sw} />
        <circle cx="16" cy="16" r="2" fill={color} />
        <path d="M16 14L13 22L16 16Z" fill="#FF6B6B" stroke="#FF6B6B" strokeWidth="1" strokeLinejoin="round" />
        <path d="M16 18L19 10L16 16Z" fill={color + "80"} stroke={color} strokeWidth="1" strokeLinejoin="round" />
        <text x="16" y="8" textAnchor="middle" fontSize="4" fontWeight="900" fill={color} fontFamily="sans-serif">N</text>
        <text x="16" y="27" textAnchor="middle" fontSize="4" fontWeight="900" fill={color} fontFamily="sans-serif">S</text>
        <text x="7" y="17" textAnchor="middle" fontSize="4" fontWeight="900" fill={color} fontFamily="sans-serif">W</text>
        <text x="25" y="17" textAnchor="middle" fontSize="4" fontWeight="900" fill={color} fontFamily="sans-serif">E</text>
      </svg>
    </SvgOrImg>
  );
}

/* ── Medal 🏅 ── */
export function EMedal({ size = 32, color = "#FFD93D", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M13 6L10 14L16 12Z" fill="#4B9EF7" stroke={navy} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M19 6L22 14L16 12Z" fill="#2350D8" stroke={navy} strokeWidth={1.5} strokeLinejoin="round" />
        <circle cx="16" cy="20" r="9" fill={color} stroke={navy} strokeWidth={sw} />
        <circle cx="16" cy="20" r="6" fill={color} stroke={navy} strokeWidth="1.2" />
        <path d="M16 15l1.5 3.5H21l-2.8 2 1 3.5-2.7-2-2.7 2 1-3.5L12 18.5h3.5z" fill={navy} />
      </svg>
    </SvgOrImg>
  );
}

/* ── Dice 🎲 ── */
export function EDice({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="5" y="5" width="22" height="22" rx="4" fill={color + "18"} stroke={color} strokeWidth={sw} />
        <circle cx="10" cy="10" r="2" fill={color} />
        <circle cx="22" cy="10" r="2" fill={color} />
        <circle cx="16" cy="16" r="2" fill={color} />
        <circle cx="10" cy="22" r="2" fill={color} />
        <circle cx="22" cy="22" r="2" fill={color} />
      </svg>
    </SvgOrImg>
  );
}

/* ── Puzzle 🧩 ── */
export function EPuzzle({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path
          d="M6 6h8v3a2 2 0 0 0 4 0V6h8v8h-3a2 2 0 0 0 0 4h3v8H18v-3a2 2 0 0 0-4 0v3H6V18h3a2 2 0 0 0 0-4H6V6z"
          fill={color + "20"} stroke={color} strokeWidth={sw} strokeLinejoin="round"
        />
      </svg>
    </SvgOrImg>
  );
}

/* ── Books 📚 ── */
export function EBooks({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="5" y="8" width="7" height="18" rx="1.5" fill="#4B9EF7" stroke={color} strokeWidth={sw} />
        <line x1="7" y1="8" x2="7" y2="26" stroke={color} strokeWidth="1.2" />
        <rect x="13" y="6" width="7" height="20" rx="1.5" fill="#5EEAA8" stroke={color} strokeWidth={sw} />
        <line x1="15" y1="6" x2="15" y2="26" stroke={color} strokeWidth="1.2" />
        <rect x="21" y="9" width="6" height="17" rx="1.5" fill="#FFD93D" stroke={color} strokeWidth={sw} />
        <line x1="23" y1="9" x2="23" y2="26" stroke={color} strokeWidth="1.2" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Flower 🌸 ── */
export function EFlower({ size = 32, color = "#FF6B6B", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="16" cy="9" rx="3.5" ry="5"
            fill={color + "90"} stroke={navy} strokeWidth="1.5"
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
        <circle cx="16" cy="16" r="4" fill="#FFD93D" stroke={navy} strokeWidth={sw} />
        <line x1="16" y1="22" x2="16" y2="28" stroke="#5EEAA8" strokeWidth={sw} strokeLinecap="round" />
        <path d="M16 26 Q13 24 11 25" stroke="#5EEAA8" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Door 🚪 ── */
export function EDoor({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="7" y="4" width="18" height="26" rx="2" fill={color + "15"} stroke={color} strokeWidth={sw} />
        <rect x="9" y="6" width="14" height="22" rx="1.5" fill={color + "08"} stroke={color} strokeWidth="1.2" />
        <circle cx="22" cy="17" r="1.8" fill={color} />
        <line x1="16" y1="8" x2="16" y2="26" stroke={color} strokeWidth="1" opacity="0.3" />
        <line x1="10" y1="16" x2="22" y2="16" stroke={color} strokeWidth="1" opacity="0.3" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Runner 🏃 ── */
export function ERunner({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="20" cy="6" r="3" fill={color + "30"} stroke={color} strokeWidth={sw} />
        <path d="M20 9L17 17L13 22" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 13L11 10M17 13L22 16" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <path d="M17 17L12 26M17 17L22 24" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Noodles 🍜 ── */
export function ENoodles({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M5 18 Q5 28 16 28 Q27 28 27 18Z" fill="#FFD93D" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="5" y1="18" x2="27" y2="18" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <path d="M9 18 Q10 14 12 16 Q14 18 16 14 Q18 10 20 14 Q22 18 24 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M13 10 Q14 7 13 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M20 9 Q21 6 20 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Water Drop 💧 ── */
export function EDrop({ size = 32, color = "#4B9EF7", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 4 Q22 12 22 19 A6 6 0 0 1 10 19 Q10 12 16 4Z" fill={color + "50"} stroke={navy} strokeWidth={sw} strokeLinejoin="round" />
        <ellipse cx="13" cy="17" rx="2" ry="3" fill="white" opacity="0.5" transform="rotate(-20 13 17)" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Palette 🎨 ── */
export function EPalette({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 5C9.4 5 4 10.4 4 17c0 5.5 4.5 10 10 10 2 0 3.5-1.5 3.5-3.5 0-0.9-0.3-1.7-0.8-2.4-.5-.6-.5-1.6.5-1.6H21c3.3 0 7-2.7 7-6C28 9.4 22.6 5 16 5z"
          fill={color + "18"} stroke={color} strokeWidth={sw} />
        <circle cx="10" cy="14" r="2" fill="#FF6B6B" />
        <circle cx="14" cy="10" r="2" fill="#FFD93D" />
        <circle cx="20" cy="10" r="2" fill="#5EEAA8" />
        <circle cx="24" cy="14" r="2" fill="#4B9EF7" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Microscope 🔬 ── */
export function EMicroscope({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="7" y="25" width="18" height="3" rx="1.5" fill={color + "30"} stroke={color} strokeWidth={sw} />
        <line x1="13" y1="25" x2="13" y2="14" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1="13" y1="14" x2="20" y2="14" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <rect x="17" y="6" width="6" height="12" rx="2" fill={color + "25"} stroke={color} strokeWidth={sw} />
        <rect x="16" y="4" width="8" height="4" rx="2" fill={color + "40"} stroke={color} strokeWidth="1.5" />
        <rect x="7" y="22" width="12" height="2" rx="1" fill={color + "20"} stroke={color} strokeWidth="1.5" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Gear ⚙️ ── */
export function EGear({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path
          d="M13 4h6l1 3.5a9 9 0 0 1 3 1.7l3.5-1 3 5-2.5 2.7a9 9 0 0 1 0 3.2L30 22l-3 5-3.5-1a9 9 0 0 1-3 1.7L19 31h-6l-1-3.5a9 9 0 0 1-3-1.7L5.5 27l-3-5 2.5-2.7a9 9 0 0 1 0-3.2L2.5 13l3-5 3.5 1A9 9 0 0 1 12 7.5L13 4z"
          fill={color + "18"} stroke={color} strokeWidth={sw} strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="5" fill={color + "25"} stroke={color} strokeWidth={sw} />
      </svg>
    </SvgOrImg>
  );
}

/* ── Vase/Amphora 🏺 ── */
export function EVase({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M12 4h8v4H12z" fill={color + "20"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M10 8 Q6 14 8 22 Q10 28 16 28 Q22 28 24 22 Q26 14 22 8H10z"
          fill={color + "18"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M10 12 Q5 13 6 18 Q7 20 10 19" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <path d="M22 12 Q27 13 26 18 Q25 20 22 19" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
        <line x1="10" y1="8" x2="22" y2="8" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── House 🏠 ── */
export function EHouse({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M3 15L16 4L29 15" fill={color + "25"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="6" y="15" width="20" height="14" rx="1.5" fill={color + "12"} stroke={color} strokeWidth={sw} />
        <rect x="13" y="21" width="6" height="8" rx="1" fill={color + "35"} stroke={color} strokeWidth="1.5" />
        <rect x="8" y="18" width="5" height="5" rx="1" fill={color + "20"} stroke={color} strokeWidth="1.5" />
        <rect x="19" y="18" width="5" height="5" rx="1" fill={color + "20"} stroke={color} strokeWidth="1.5" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Building/Columns 🏛️ ── */
export function EBuilding({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="3" y="5" width="26" height="6" rx="1" fill={color + "25"} stroke={color} strokeWidth={sw} />
        {[7, 12, 17, 22].map((x) => (
          <rect key={x} x={x} y={11} width="3" height="16" rx="1" fill={color + "18"} stroke={color} strokeWidth="1.5" />
        ))}
        <rect x="3" y="26" width="26" height="3" rx="1" fill={color + "30"} stroke={color} strokeWidth={sw} />
      </svg>
    </SvgOrImg>
  );
}

/* ── Battery 🔋 ── */
export function EBattery({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="10" width="22" height="12" rx="3" fill={color + "15"} stroke={color} strokeWidth={sw} />
        <rect x="6" y="13" width="12" height="6" rx="1.5" fill="#5EEAA8" stroke={color} strokeWidth="1.2" />
        <path d="M26 13v6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1="26" y1="16" x2="30" y2="16" stroke={color} strokeWidth="1.5" />
        <path d="M14 8L11 16h5l-2 8" stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Leaf/Plant 🌿 ── */
export function ELeaf({ size = 32, color = "#5EEAA8", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 28 Q8 20 8 12 Q8 4 16 4 Q24 4 24 12 Q24 20 16 28Z"
          fill={color + "70"} stroke={navy} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="16" y1="6" x2="16" y2="28" stroke={navy} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 12 Q12 12 10 15" stroke={navy} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M16 16 Q20 16 22 19" stroke={navy} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M16 20 Q12 20 11 22" stroke={navy} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Lightning ⚡ ── */
export function ELightning({ size = 32, color = "#FFD93D", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M20 4L10 18h8L12 28l14-16h-9z" fill={color} stroke={navy} strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Sparkle 💫 ── */
export function ESparkle({ size = 32, color = "#FFD93D", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 4L18 12L26 10L20 16L26 22L18 20L16 28L14 20L6 22L12 16L6 10L14 12Z"
          fill={color} stroke={navy} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="24" cy="8" r="2.5" fill={color} stroke={navy} strokeWidth="1.5" />
        <circle cx="8" cy="24" r="1.5" fill={color} stroke={navy} strokeWidth="1.2" />
      </svg>
    </SvgOrImg>
  );
}

/* ── School Building 🏫 ── */
export function ESchool({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="10" width="24" height="19" rx="1" fill={color + "12"} stroke={color} strokeWidth={sw} />
        <path d="M2 11L16 4L30 11" fill={color + "25"} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <line x1="16" y1="4" x2="16" y2="1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 1L21 3L16 5" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
        <rect x="13" y="21" width="6" height="8" rx="1" fill={color + "30"} stroke={color} strokeWidth="1.5" />
        <rect x="6" y="14" width="5" height="5" rx="1" fill={color + "20"} stroke={color} strokeWidth="1.5" />
        <rect x="21" y="14" width="5" height="5" rx="1" fill={color + "20"} stroke={color} strokeWidth="1.5" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Seedling 🌱 ── */
export function ESeedling({ size = 32, color = "#5EEAA8", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <line x1="16" y1="28" x2="16" y2="16" stroke={navy} strokeWidth={sw} strokeLinecap="round" />
        <path d="M16 20 Q8 18 8 10 Q14 10 16 18" fill={color + "70"} stroke={navy} strokeWidth={sw} strokeLinejoin="round" />
        <path d="M16 16 Q24 14 24 7 Q18 7 16 14" fill={color + "70"} stroke={navy} strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Sparkles ✨ ── */
export function ESparkles({ size = 32, color = "#FFD93D", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 6L17.2 11L22 10L18.5 14L21 18L16.5 16.5L14 21L13 16L8 15L12 12L10 7L15 10Z"
          fill={color} stroke={navy} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M26 5L26.8 8L30 8L27.5 10L28.5 13L26 11L23 13L24.2 10L22 8L25 8Z"
          fill={color} stroke={navy} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M6 22L6.6 24.5L9 24.5L7.2 26L8 28.5L6 27L4 28.5L4.8 26L3 24.5L5.4 24.5Z"
          fill={color} stroke={navy} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Pushpin 📌 ── */
export function EPushpin({ size = 32, color = "#FF6B6B", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <ellipse cx="16" cy="10" rx="7" ry="5" fill={color + "60"} stroke={navy} strokeWidth={sw} />
        <rect x="14" y="14" width="4" height="8" rx="1" fill={color} stroke={navy} strokeWidth="1.5" />
        <line x1="16" y1="22" x2="16" y2="28" stroke={navy} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Walker 🚶 ── */
export function EWalker({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="18" cy="5" r="3" fill={color + "30"} stroke={color} strokeWidth={sw} />
        <path d="M18 8L16 16L12 22" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 12L10 10M16 12L20 14" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <path d="M16 16L13 26M16 16L20 22" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Finish Flag 🏁 ── */
export function EFinishFlag({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <line x1="7" y1="4" x2="7" y2="30" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <rect x="7" y="4" width="18" height="12" rx="1" fill="white" stroke={color} strokeWidth="1.5" />
        <rect x="7" y="4" width="5" height="4" fill={color} />
        <rect x="17" y="4" width="5" height="4" fill={color} />
        <rect x="12" y="8" width="5" height="4" fill={color} />
        <rect x="22" y="8" width="3" height="4" fill={color} />
      </svg>
    </SvgOrImg>
  );
}

/* ── Elevator 🛗 ── */
export function EElevator({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="26" rx="3" fill={color + "12"} stroke={color} strokeWidth={sw} />
        <line x1="16" y1="6" x2="16" y2="28" stroke={color} strokeWidth="1.5" />
        <path d="M12 13L16 8L20 13" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19L16 24L20 19" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Ladder 🪜 ── */
export function ELadder({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <line x1="9" y1="4" x2="9" y2="28" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1="23" y1="4" x2="23" y2="28" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        {[8, 14, 20, 26].map((y) => (
          <line key={y} x1="9" y1={y} x2="23" y2={y} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        ))}
      </svg>
    </SvgOrImg>
  );
}

/* ── Location Pin 📍 ── */
export function ELocationPin({ size = 32, color = "#FF6B6B", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 4A8 8 0 0 0 8 12c0 6 8 16 8 16s8-10 8-16A8 8 0 0 0 16 4z"
          fill={color + "60"} stroke={navy} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="16" cy="12" r="3" fill={navy} />
      </svg>
    </SvgOrImg>
  );
}

/* ── Search 🔍 ── */
export function ESearch({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="14" cy="14" r="9" fill={color + "15"} stroke={color} strokeWidth={sw} />
        <path d="M21 21L28 28" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Camera 📷 ── */
export function ECamera({ size = 32, color = navy, src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="3" y="10" width="26" height="18" rx="3" fill={color + "15"} stroke={color} strokeWidth={sw} />
        <path d="M10 10L12 5H20L22 10" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="16" cy="19" r="5" fill={color + "25"} stroke={color} strokeWidth={sw} />
        <circle cx="16" cy="19" r="3" fill={color + "40"} />
        <circle cx="25" cy="14" r="1.5" fill={color} />
      </svg>
    </SvgOrImg>
  );
}

/* ── Check Circle ✅ ── */
export function ECheckCircle({ size = 32, color = "#5EEAA8", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" fill={color + "40"} stroke={navy} strokeWidth={sw} />
        <path d="M9 16L14 21L23 11" stroke={navy} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </SvgOrImg>
  );
}

/* ── Badge/Seal (for badge collection) ── */
export function EBadge({ size = 32, color = "#2350D8", src }: EmojiProps) {
  return (
    <SvgOrImg src={src} size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="4" fill={color + "20"} stroke={color} strokeWidth={sw} />
        <rect x="7" y="7" width="18" height="18" rx="3" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M10 16L14 20L22 12" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </SvgOrImg>
  );
}

// Backward-compatible alias
export const EStamp = EBadge;

/* ── Generic EmojiDisplay – maps emoji string → SVG component ──────────────
   Uses emojiImageOverrides first, then falls back to SVG.
   Pass `src` directly to override for this instance only.              */
export function EmojiDisplay({
  emoji, size = 24, color, src,
}: { emoji: string; size?: number; color?: string; src?: string }) {
  // Per-instance override takes priority, then global map, then SVG
  const resolvedSrc = src ?? emojiImageOverrides[emoji];
  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        width={size}
        height={size}
        style={{ objectFit: "contain", display: "inline-block", verticalAlign: "middle" }}
        alt=""
      />
    );
  }

  const props = { size, color };
  switch (emoji) {
    case "🎓": return <EGradCap {...props} />;
    case "🗺️": return <EMap {...props} />;
    case "🧭": return <ECompass {...props} />;
    case "🏅": return <EMedal {...props} color={color ?? "#FFD93D"} />;
    case "🎲": return <EDice {...props} />;
    case "🧩": return <EPuzzle {...props} />;
    case "📚": return <EBooks {...props} />;
    case "🌸": return <EFlower {...props} color={color ?? "#FF6B6B"} />;
    case "🚪": return <EDoor {...props} />;
    case "🏃": return <ERunner {...props} />;
    case "🍜": return <ENoodles {...props} />;
    case "💧": return <EDrop {...props} color={color ?? "#4B9EF7"} />;
    case "🎨": return <EPalette {...props} />;
    case "🔬": return <EMicroscope {...props} />;
    case "⚙️": return <EGear {...props} />;
    case "🏺": return <EVase {...props} />;
    case "🏠": return <EHouse {...props} />;
    case "🏛️": return <EBuilding {...props} />;
    case "🔋": return <EBattery {...props} />;
    case "🌿": return <ELeaf {...props} color={color ?? "#5EEAA8"} />;
    case "⚡": return <ELightning {...props} color={color ?? "#FFD93D"} />;
    case "💫": return <ESparkle {...props} color={color ?? "#FFD93D"} />;
    case "🏫": return <ESchool {...props} />;
    case "🌱": return <ESeedling {...props} color={color ?? "#5EEAA8"} />;
    case "✨": return <ESparkles {...props} color={color ?? "#FFD93D"} />;
    case "📌": return <EPushpin {...props} color={color ?? "#FF6B6B"} />;
    case "🚶": return <EWalker {...props} />;
    case "🏁": return <EFinishFlag {...props} />;
    case "🛗": return <EElevator {...props} />;
    case "🪜": return <ELadder {...props} />;
    case "📍": return <ELocationPin {...props} color={color ?? "#FF6B6B"} />;
    case "🔍": return <ESearch {...props} />;
    case "📷": return <ECamera {...props} />;
    case "✅": return <ECheckCircle {...props} color={color ?? "#5EEAA8"} />;
    case "📸": return <ECamera {...props} />;
    default: return <span style={{ fontSize: size }}>{emoji}</span>;
  }
}
