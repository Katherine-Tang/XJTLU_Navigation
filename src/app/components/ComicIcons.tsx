/**
 * Comic-style SVG icons — thick rounded strokes, flat fills
 * All use the established color palette.
 */

const stroke = "#0E1B4D";
const sw = 2.8; // strokeWidth
const sc = "round"; // strokeLinecap

interface IconProps {
  size?: number;
  active?: boolean;
  color?: string;
  activeColor?: string;
}

/* ── HOME ── */
export function IconHome({ size = 26, active = false }: IconProps) {
  const fill = active ? "#2350D8" : "none";
  const doorFill = active ? "#A8D4FF" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* roof */}
      <path
        d="M3 13L14 3L25 13"
        stroke={stroke} strokeWidth={sw} strokeLinecap={sc} strokeLinejoin="round"
      />
      {/* house body */}
      <rect x="5" y="12" width="18" height="13" rx="2.5"
        fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* door */}
      <rect x="10.5" y="17" width="7" height="8" rx="2"
        fill={doorFill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </svg>
  );
}

/* ── MAP ── */
export function IconMap({ size = 26, active = false }: IconProps) {
  const f1 = active ? "#A8D4FF" : "none";
  const f2 = active ? "#DCF0FF" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* left panel */}
      <path d="M3 5L10 8V23L3 20V5Z" fill={f1} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* center panel */}
      <path d="M10 8L18 5V20L10 23V8Z" fill={f2} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* right panel */}
      <path d="M18 5L25 8V23L18 20V5Z" fill={f1} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {/* pin */}
      <circle cx="14" cy="12" r="2.2" fill={active ? "#2350D8" : stroke} stroke={stroke} strokeWidth={1.6} />
    </svg>
  );
}

/* ── SCAN (center FAB) ── */
export function IconScan({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* corners */}
      <path d="M3 9V4H9" stroke="white" strokeWidth={sw + 0.4} strokeLinecap={sc} strokeLinejoin="round" />
      <path d="M19 4H25V9" stroke="white" strokeWidth={sw + 0.4} strokeLinecap={sc} strokeLinejoin="round" />
      <path d="M25 19V24H19" stroke="white" strokeWidth={sw + 0.4} strokeLinecap={sc} strokeLinejoin="round" />
      <path d="M9 24H3V19" stroke="white" strokeWidth={sw + 0.4} strokeLinecap={sc} strokeLinejoin="round" />
      {/* grid lines */}
      <line x1="8" y1="10" x2="20" y2="10" stroke="white" strokeWidth={2} strokeLinecap={sc} />
      <line x1="8" y1="14" x2="20" y2="14" stroke="white" strokeWidth={2.8} strokeLinecap={sc} />
      <line x1="8" y1="18" x2="20" y2="18" stroke="white" strokeWidth={2} strokeLinecap={sc} />
      <line x1="10" y1="8" x2="10" y2="20" stroke="white" strokeWidth={2} strokeLinecap={sc} />
      <line x1="14" y1="8" x2="14" y2="20" stroke="white" strokeWidth={2.8} strokeLinecap={sc} />
      <line x1="18" y1="8" x2="18" y2="20" stroke="white" strokeWidth={2} strokeLinecap={sc} />
    </svg>
  );
}

/* ── ROUTE ── */
export function IconRoute({ size = 26, active = false }: IconProps) {
  const dotFill = active ? "#2350D8" : "#4B6898";
  const lineFill = "#000000";
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* start dot */}
      <circle cx="5" cy="5" r="3.5" fill={dotFill} stroke={stroke} strokeWidth={2} />
      {/* end dot */}
      <circle cx="23" cy="23" r="3.5" fill={active ? "#A8D4FF" : "none"} stroke={stroke} strokeWidth={2} />
      {/* path */}
      <path
        d="M5 8.5C5 13.5 10 13.5 14 17C17.2 19.8 20.2 19.8 23 19.5"
        stroke={lineFill} strokeWidth={sw} strokeLinecap={sc} strokeDasharray="0"
      />
    </svg>
  );
}

/* ── PROFILE ── */
export function IconProfile({ size = 26, active = false }: IconProps) {
  const headFill = active ? "#A8D4FF" : "none";
  const bodyFill = active ? "#DCF0FF" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* head */}
      <circle cx="14" cy="9" r="5.5" fill={headFill} stroke={stroke} strokeWidth={sw} />
      {/* body / shoulders */}
      <path
        d="M4 26C4 20 8 17 14 17C20 17 24 20 24 26"
        fill={bodyFill} stroke={stroke} strokeWidth={sw} strokeLinecap={sc} strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── HEART (for favorites) ── */
export function IconHeart({ size = 20, filled = false, color = "#FF6B6B" }: { size?: number; filled?: boolean; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.9 5.1 4 7.5 4C9.2 4 10.7 5 11.5 6.2C12.3 5 13.8 4 15.5 4C17.9 4 20 5.9 20 8.5C20 14.5 12 21 12 21Z"
        fill={filled ? color : "none"}
        stroke="#0E1B4D"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── STAR (for achievement) ── */
export function IconStar({ size = 20, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.9 8.7L22 9.7L17 14.6L18.2 22L12 18.5L5.8 22L7 14.6L2 9.7L9.1 8.7L12 2Z"
        fill={filled ? "#FFD93D" : "none"}
        stroke="#0E1B4D"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── PLAY ── */
export function IconPlay({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 4L20 12L6 20V4Z" fill="white" stroke="#0E1B4D" strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

/* ── CHEVRON RIGHT ── */
export function IconChevronRight({ size = 16, color = "#0E1B4D" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── CHEVRON LEFT ── */
export function IconChevronLeft({ size = 16, color = "#0E1B4D" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15 6L9 12L15 18" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── BACK ARROW ── */
export function IconBack({ color = "white", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15 6L9 12L15 18" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── BELL ── */
export function IconBell({ size = 22, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* bell body */}
      <path
        d="M14 3C10.7 3 8 5.7 8 9V15L5 19H23L20 15V9C20 5.7 17.3 3 14 3Z"
        fill={active ? "#A8D4FF" : "none"}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* clapper */}
      <path d="M11 19C11 20.7 12.3 22 14 22C15.7 22 17 20.7 17 19"
        stroke={stroke} strokeWidth={sw} strokeLinecap={sc} />
      {/* dot */}
      {active && <circle cx="20" cy="6" r="3" fill="#FF6B6B" stroke={stroke} strokeWidth={1.8} />}
    </svg>
  );
}

/* ── BADGE / SEAL ── */
export function IconBadge({ size = 22, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="5" y="14" width="18" height="10" rx="2.5"
        fill={filled ? "#A8D4FF" : "none"} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <rect x="9" y="4" width="10" height="12" rx="3"
        fill={filled ? "#DCF0FF" : "none"} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <line x1="3" y1="14" x2="25" y2="14" stroke={stroke} strokeWidth={sw} strokeLinecap={sc} />
      <line x1="9" y1="20" x2="19" y2="20" stroke={stroke} strokeWidth={2} strokeLinecap={sc} />
    </svg>
  );
}

/* ── TRASH / REMOVE ── */
export function IconTrash({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M8 6V4H16V6" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6L6.5 20H17.5L19 6" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="11" x2="10" y2="16" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="16" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

/* ── SPARKLE / STAR burst ── */
export function IconSparkle({ size = 18, color = "#FFD93D" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M5.6 5.6L8.5 8.5M15.5 15.5L18.4 18.4M18.4 5.6L15.5 8.5M8.5 15.5L5.6 18.4" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" fill={color} stroke="#0E1B4D" strokeWidth={2} />
    </svg>
  );
}

/* ── NAVIGATION / LOCATION ── */
export function IconNavigation({ size = 20, color = "#2350D8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L22 12L12 22L2 12L12 2Z"
        fill={color} stroke="#0E1B4D" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="white" stroke="#0E1B4D" strokeWidth={2} />
    </svg>
  );
}

/* ── CLOCK ── */
export function IconClock({ size = 14, color = "#2350D8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="#0E1B4D" strokeWidth={2.5} />
      <path d="M12 7V13L16 15" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── MAP PIN ── */
export function IconPin({ size = 14, color = "#2350D8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.7 2 6 4.7 6 8C6 13 12 22 12 22C12 22 18 13 18 8C18 4.7 15.3 2 12 2Z"
        fill={color} stroke="#0E1B4D" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx="12" cy="8" r="2.5" fill="white" stroke="#0E1B4D" strokeWidth={1.8} />
    </svg>
  );
}

/* ── RESET / REFRESH ── */
export function IconReset({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 12C3 7 7 3 12 3C15.5 3 18.5 4.8 20 8" stroke="#0E1B4D" strokeWidth={2.8} strokeLinecap="round" />
      <path d="M21 12C21 17 17 21 12 21C8.5 21 5.5 19.2 4 16" stroke="#0E1B4D" strokeWidth={2.8} strokeLinecap="round" />
      <path d="M17 7L20 8L21 4" stroke="#0E1B4D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 17L4 16L3 20" stroke="#0E1B4D" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── CHECK ── */
export function IconCheck({ size = 14, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 12L9 18L20 6" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── CAMERA ── */
export function IconCamera({ size = 26, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* body */}
      <rect x="2" y="9" width="24" height="16" rx="3.5" fill="none" stroke={color} strokeWidth={2.8} strokeLinejoin="round" />
      {/* lens */}
      <circle cx="14" cy="17" r="4.5" fill="none" stroke={color} strokeWidth={2.4} />
      <circle cx="14" cy="17" r="1.8" fill={color} />
      {/* notch / viewfinder bump */}
      <path d="M9 9V7C9 5.9 9.9 5 11 5H17C18.1 5 19 5.9 19 7V9" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
      {/* flash dot */}
      <circle cx="22" cy="13" r="1.4" fill={color} />
    </svg>
  );
}
