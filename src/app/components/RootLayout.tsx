import { Outlet, useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { CameraProvider } from "../context/CameraContext";
import { LanguageProvider } from "../context/LanguageContext";
import { useLanguage } from "../context/LanguageContext";

export function RootLayout() {
  return (
    <LanguageProvider>
      <CameraProvider>
        <div>
          <Outlet />
        </div>
      </CameraProvider>
    </LanguageProvider>
  );
}

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useLanguage();

  let message = t("error_unknown");
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? t("error_404") : t("error_generic", { n: error.status });
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        background: "#DCF0FF",
        fontFamily: "sans-serif",
        gap: "16px",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFBF0",
          border: "2.5px solid #0E1B4D",
          borderRadius: "20px",
          boxShadow: "5px 5px 0 #0E1B4D",
          padding: "32px 28px",
          textAlign: "center",
          maxWidth: "320px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "12px" }}>🙈</div>
        <p style={{ fontSize: "18px", fontWeight: 900, color: "#0E1B4D", marginBottom: "8px" }}>
          {t("error_title")}
        </p>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#4B6898", marginBottom: "20px" }}>
          {message}
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#2350D8",
            border: "2.5px solid #0E1B4D",
            borderRadius: "12px",
            boxShadow: "3px 3px 0 #0E1B4D",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 800,
            padding: "10px 24px",
            cursor: "pointer",
          }}
        >
          {t("error_back_home")}
        </button>
      </div>
    </div>
  );
}
