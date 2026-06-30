import { useNavigate } from "react-router";
import { Burst } from "./PhoneShell";
import { IconCamera, IconMap, IconRoute, IconBadge } from "./ComicIcons";
import { useLanguage } from "../context/LanguageContext";

/* halftone dots bg */
const dotsBg: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, #0E1B4D1A 1.2px, transparent 1.2px)",
  backgroundSize: "14px 14px",
};

export function SplashScreen() {
  const navigate = useNavigate();
  const { tPair } = useLanguage();

  const featureChips = [
    { key: "splash_f1", icon: <IconCamera size={14} color="#0E1B4D" /> },
    { key: "splash_f2", icon: <IconMap size={14} active /> },
    { key: "splash_f3", icon: <IconRoute size={14} active /> },
    { key: "splash_f4", icon: <IconBadge size={14} filled /> },
  ];

  return (
    <div
      className="flex min-h-screen w-full justify-center"
      style={{
        minHeight: "100dvh",
        backgroundColor: "#A8D4FF",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          minHeight: "100dvh",
          backgroundColor: "#DCF0FF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          borderRadius: "clamp(0px, 2vw, 28px)",
          border: "none",
          boxShadow: "0 18px 40px rgba(14, 27, 77, 0.18)",
          ...dotsBg,
        }}
      >
        {/* ── Top coloured band ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "clamp(320px, 42vh, 420px)",
            backgroundColor: "#2350D8",
            borderBottom: "none",
            overflow: "hidden",
          }}
        >
          {/* inner dots on blue */}
          <div style={{ ...dotsBg, position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)" }} />

          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#4B9EF7", border: "none" }} />
          <div style={{ position: "absolute", top: "30px", right: "20px", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#A8D4FF", border: "none" }} />
          <div style={{ position: "absolute", bottom: "40px", left: "-30px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#4B9EF7", border: "none" }} />
        </div>

        {/* ── Burst decorations ── */}
        <div style={{ position: "absolute", top: "40px", left: "26px" }}>
          <Burst size={52} color="#FFD93D"  />
        </div>
        <div style={{ position: "absolute", top: "160px", right: "36px" }}>
          <Burst size={36} color="#5EEAA8" />
        </div>
        <div style={{ position: "absolute", top: "260px", left: "50px" }}>
          <Burst size={28} color="#FFD93D" />
        </div>

        {/* ── Big logo / campus emoji ── */}
        <div style={{ position: "absolute", top: "95px", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center" }}>
          <div
            style={{
              width: "clamp(112px, 24vw, 130px)",
              height: "clamp(112px, 24vw, 130px)",
              backgroundColor: "#FFFBF0",
              border: "none",
              borderRadius: "32px",
              boxShadow: "5px 5px 0px #0E1B4D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(56px, 12vw, 72px)",
              margin: "0 auto",
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}bode.png`}
              alt="bode"
              style={{
                width: "74%",
                height: "74%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* ── Bottom white panel ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "clamp(400px, 46vh, 460px)",
            backgroundColor: "#FFFBF0",
            borderTop: "none",
            borderTopLeftRadius: "32px",
            borderTopRightRadius: "32px",
            padding: "clamp(32px, 5vw, 40px) clamp(20px, 5vw, 28px) 28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* location tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#A8D4FF",
              border: "none",
              borderRadius: "20px",
              padding: "4px 12px",
              marginBottom: "14px",
              boxShadow: "2px 2px 0 #0E1B4D",
              alignSelf: "flex-start",
            }}
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>📍</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
              <span className="font-[Playpen_Sans]" style={{ fontSize: "12px", fontWeight: 800, color: "#0E1B4D", lineHeight: 1.2 }}>
                {tPair("splash_location").zh}
              </span>
              <span className="font-[Playpen_Sans]" style={{ fontSize: "10px", fontWeight: 700, color: "#0E1B4D", opacity: 0.78, lineHeight: 1.2 }}>
                {tPair("splash_location").en}
              </span>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "50px",
                fontWeight: 900,
                color: "#2350D8",
                letterSpacing: "-2px",
                lineHeight: 1,
                display: "block",
                textShadow: "3px 3px 0 #0E1B4D",
              }}
            >
              UniBuddy
            </span>
          </div>
          <div
            style={{
              marginBottom: "28px",
              borderLeft: "3px solid #FFD93D",
              paddingLeft: "10px",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: 800, color: "#0E1B4D", margin: 0, lineHeight: 1.35 }}>
              {tPair("splash_subtitle").zh}
            </p>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#0E1B4D", margin: "6px 0 0", opacity: 0.88, lineHeight: 1.35 }}>
              {tPair("splash_subtitle").en} 
            </p>
          </div>

          {/* CTA button */}
          <button
            onClick={() => navigate("/home")}
            style={{
              width: "100%",
              height: "58px",
              backgroundColor: "#2350D8",
              border: "2.5px solid #0E1B4D",
              borderRadius: "16px",
              boxShadow: "4px 4px 0px #0E1B4D",
              color: "white",
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "transform 0.1s",
              marginBottom: "14px",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
          >
            <span style={{ display: "block", fontSize: "16px", lineHeight: 1.2 }}>{tPair("splash_cta").zh}</span>
            <span style={{ display: "block", fontSize: "12px", fontWeight: 800, opacity: 0.92, marginTop: "2px", lineHeight: 1.2 }}>
              {tPair("splash_cta").en}
            </span>
          </button>

          {/* Feature chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {featureChips.map((f) => (
              <div
                key={f.key}
                style={{
                  backgroundColor: "#DCF0FF",
                  border: "none",
                  borderRadius: "20px",
                  padding: "3px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#0E1B4D",
                  boxShadow: "2px 2px 0px #0E1B4D",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "14px", height: "14px", flexShrink: 0 }}>
                  {f.icon}
                </span>
                {tPair(f.key).zh}
                <span style={{ opacity: 0.75, fontWeight: 600 }}> · {tPair(f.key).en}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
