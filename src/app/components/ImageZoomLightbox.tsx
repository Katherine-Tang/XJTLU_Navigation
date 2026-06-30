import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type ImageZoomLightboxProps = {
  src: string | null;
  alt: string;
  onClose: () => void;
  lang: "zh" | "en";
};

export function ImageZoomLightbox({ src, alt, onClose, lang }: ImageZoomLightboxProps) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; ox: number; oy: number } | null>(null);
  const pinchRef = useRef<{ dist: number; startScale: number } | null>(null);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    if (!src) return;
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [src]);

  useEffect(() => {
    if (!src) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [src]);

  useEffect(() => {
    if (scale <= 1) setPan({ x: 0, y: 0 });
  }, [scale]);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !src) return;

    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.14 : 0.14;
      setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
    };

    const touchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = { dist: Math.hypot(dx, dy), startScale: scaleRef.current };
        e.preventDefault();
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const { dist: startDist, startScale } = pinchRef.current;
        if (startDist > 0) {
          const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, (startScale * dist) / startDist));
          setScale(next);
        }
        e.preventDefault();
      }
    };

    const touchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("touchstart", touchStart, { passive: false });
    el.addEventListener("touchmove", touchMove, { passive: false });
    el.addEventListener("touchend", touchEnd);
    el.addEventListener("touchcancel", touchEnd);

    return () => {
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("touchstart", touchStart);
      el.removeEventListener("touchmove", touchMove);
      el.removeEventListener("touchend", touchEnd);
      el.removeEventListener("touchcancel", touchEnd);
    };
  }, [src]);

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + 0.35));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - 0.35));
  const reset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      ox: pan.x,
      oy: pan.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current?.active) return;
    setPan({
      x: dragRef.current.ox + (e.clientX - dragRef.current.startX),
      y: dragRef.current.oy + (e.clientY - dragRef.current.startY),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const hint =
    lang === "zh"
      ? "滚轮或双指缩放 · 放大后可拖移"
      : "Scroll or pinch to zoom · drag when zoomed";

  if (!src) return null;

  const ui = (
    <div
      role="dialog"
      aria-modal
      aria-label={lang === "zh" ? "图片预览" : "Image preview"}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        backgroundColor: "rgba(14, 27, 77, 0.94)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        touchAction: "none",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "10px 12px 4px",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            minWidth: "44px",
            height: "40px",
            borderRadius: "12px",
            border: "2.5px solid #FFFBF0",
            backgroundColor: "#FF6B6B",
            color: "#FFFFFF",
            fontSize: "20px",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "3px 3px 0 #0E1B4D",
          }}
        >
          ×
        </button>
      </div>

      <div
        ref={stageRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "8px 12px",
          cursor: scale > 1 ? "grab" : "default",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
            <img
              src={src}
              alt={alt}
              draggable={false}
              style={{
                maxWidth: "min(92vw, 520px)",
                maxHeight: "min(78vh, 640px)",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "10px 12px 16px",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={zoomOut}
          style={{
            width: "44px",
            height: "40px",
            borderRadius: "10px",
            border: "2.5px solid #0E1B4D",
            backgroundColor: "#FFFFFF",
            fontSize: "20px",
            fontWeight: 900,
            color: "#0E1B4D",
            cursor: "pointer",
            boxShadow: "2px 2px 0 #0E1B4D",
          }}
        >
          −
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "0 14px",
            height: "40px",
            borderRadius: "10px",
            border: "2.5px solid #0E1B4D",
            backgroundColor: "#A8D4FF",
            fontSize: "12px",
            fontWeight: 800,
            color: "#0E1B4D",
            cursor: "pointer",
            boxShadow: "2px 2px 0 #0E1B4D",
          }}
        >
          {lang === "zh" ? "还原" : "Reset"}
        </button>
        <button
          type="button"
          onClick={zoomIn}
          style={{
            width: "44px",
            height: "40px",
            borderRadius: "10px",
            border: "2.5px solid #0E1B4D",
            backgroundColor: "#FFFFFF",
            fontSize: "20px",
            fontWeight: 900,
            color: "#0E1B4D",
            cursor: "pointer",
            boxShadow: "2px 2px 0 #0E1B4D",
          }}
        >
          +
        </button>
      </div>

      <p
        style={{
          margin: 0,
          paddingBottom: "12px",
          textAlign: "center",
          fontSize: "11px",
          fontWeight: 600,
          color: "rgba(255,255,255,0.82)",
        }}
      >
        {hint}
      </p>
    </div>
  );

  return createPortal(ui, document.body);
}
