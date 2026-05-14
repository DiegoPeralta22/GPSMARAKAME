import { useState, useEffect, useCallback } from "react";

let _show = null;

export function showAlert(msg) {
  return new Promise(resolve => {
    if (_show) _show(String(msg ?? ""), resolve);
    else { console.warn(msg); resolve(); }
  });
}

const getType = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes("error") || m.includes("no se pudo") || m.includes("fallo"))
    return "error";
  if (m.includes("correctamente") || m.includes("guardado") || m.includes("enviado") ||
      m.includes("aprobado") || m.includes("completado") || m.includes("actualizado"))
    return "success";
  if (m.includes("selecciona") || m.includes("debes") || m.includes("indica") ||
      m.includes("requerido") || m.includes("primero") || m.includes("ya existe") ||
      m.includes("choca") || m.includes("motivo"))
    return "warning";
  return "info";
};

const ICONS = {
  success: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  error: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  warning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

const COLORS = {
  success: { icon: "#0b5d5b", bg: "#e6f4f3", btn: "#0b5d5b", btnHover: "#0a4f4d" },
  error:   { icon: "#ef4444", bg: "#fff1f2", btn: "#ef4444", btnHover: "#dc2626" },
  warning: { icon: "#d97706", bg: "#fff7ed", btn: "#d97706", btnHover: "#b45309" },
  info:    { icon: "#2563eb", bg: "#eff6ff", btn: "#2563eb", btnHover: "#1d4ed8" },
};

const TITLES = {
  success: "Operación exitosa",
  error:   "Ocurrió un error",
  warning: "Atención",
  info:    "Información",
};

export default function GlobalAlert() {
  const [state, setState] = useState(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);

  const show = useCallback((msg, resolve) => {
    setState({ msg, resolve, type: getType(msg) });
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    _show = show;
    const orig = window.alert;
    window.alert = (msg) => show(String(msg ?? ""), () => {});
    return () => { window.alert = orig; _show = null; };
  }, [show]);

  const close = () => {
    setVisible(false);
    setTimeout(() => {
      state?.resolve?.();
      setState(null);
    }, 180);
  };

  if (!state) return null;

  const { msg, type } = state;
  const c = COLORS[type];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.18s ease",
      }}
      onClick={close}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: 380,
          maxWidth: "90vw",
          padding: "28px 28px 24px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.93) translateY(12px)",
          transition: "transform 0.18s ease, opacity 0.18s ease",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: c.bg,
            color: c.icon,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {ICONS[type]}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            {TITLES[type]}
          </div>
        </div>

        {/* Message */}
        <div style={{
          fontSize: 13.5, color: "#374151", lineHeight: 1.6,
          marginBottom: 22,
          paddingLeft: 2,
        }}>
          {msg}
        </div>

        {/* Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={close}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              padding: "9px 28px",
              background: hover ? c.btnHover : c.btn,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.12s",
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
