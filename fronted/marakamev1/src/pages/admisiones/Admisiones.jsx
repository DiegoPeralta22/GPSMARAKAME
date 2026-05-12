import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Admisiones.css";
import { fetchPacientes, invalidatePacientes } from "../../utils/pacientes.js";
import Pacientes from "./Pacientes/Pacientes";
import Expedientes from "./Expedientes/Expedientes";
import EstudioSocioeconomico from "./EstudioSocioeconomico/EstudioSocioeconomico";
import RegistroPaciente from "./RegistroPaciente/RegistroPaciente";
import ValidarIngreso from "./ValidarIngreso/ValidarIngreso";
import Citas from "../citas/Citas";
import Preingreso from "../preingreso/Preingreso";
import ExpedienteClinico from "../expediente/ExpedienteClinico";
import Requisiciones from "./Requisiciones/Requisiciones";

/* ── Inline SVG icons ─────────────────── */
const IcoGrid   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoHome   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoUser   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="16" y1="11" x2="16" y2="17"/><line x1="13" y1="14" x2="19" y2="14"/></svg>;
const IcoUsers  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoFile   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
const IcoMoney  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>;
const IcoCal    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoShield = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoDoc    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>;
const IcoFolder = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const IcoBell   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoSearch = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoSettings=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IcoHelp   = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

const fmtCita = (iso) => {
  if (!iso) return { mes: "—", dia: "—", hora: "—" };
  const d = new Date(iso);
  return {
    mes: MESES[d.getMonth()],
    dia: d.getDate(),
    hora: `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`,
  };
};

const initiales = (nombre, apellido) => {
  const n = nombre ?? "";
  const a = apellido ?? "";
  return `${(n[0] || "").toUpperCase()}${(a[0] || "").toUpperCase()}`;
};

export default function Admisiones() {
  const navigate  = useNavigate();
  const usuario   = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [seccion, setSeccion]         = useState("dashboard");
  const [expedienteId, setExpedienteId] = useState(null);
  const [validacionPacId, setValidacionPacId] = useState(null);
  const [estudioPresetId, setEstudioPresetId] = useState(null);
  const [cuestionarioPresetId, setCuestionarioPresetId] = useState(null);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [historialPacId, setHistorialPacId] = useState(null);
  const [historialPacs, setHistorialPacs]   = useState([]);
  const [historialBusq, setHistorialBusq]   = useState("");
  const [showNotifs, setShowNotifs]   = useState(false);
  const [notifs, setNotifs]           = useState([]);
  const [pacientes, setPacientes]     = useState([]);
  const [citas, setCitas]             = useState([]);
  const [citaPage, setCitaPage]       = useState(0);
  const [busqueda, setBusqueda]       = useState("");
  const [cargando, setCargando]       = useState(true);

  useEffect(() => {
    if (!usuario.id_usuario) return;
    fetch(`http://localhost:3000/clinico/notificaciones/${usuario.id_usuario}`)
      .then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d.slice(0,20) : [])).catch(() => {});
  }, []);

  const leerNotif = async (id) => {
    try { await fetch(`http://localhost:3000/clinico/notificaciones/leer/${id}`, { method: "POST" }); } catch {}
    setNotifs(prev => prev.map(n => n.id_notificacion === id ? { ...n, leida: 1 } : n));
  };

  const irAPaciente = (notif) => {
    leerNotif(notif.id_notificacion);
    setShowNotifs(false);
    const tipo    = notif.tipo || "";
    const pacId   = notif.id_paciente || notif.id_referencia;
    if (tipo === "cita_nueva" || tipo === "cita_actualizada")          { setSeccion("citas"); return; }
    if (tipo === "ingreso_aprobado" || tipo === "traslado_completado") { pacId ? navigate(`/expedientes?id=${pacId}`) : setSeccion("expedientes"); return; }
    if (pacId) { setValidacionPacId(pacId); setSeccion("validacion"); return; }
    setSeccion("validacion");
  };

  useEffect(() => {
    if (seccion !== "historial") return;
    setHistorialPacId(null);
    fetchPacientes().then(d => setHistorialPacs(Array.isArray(d) ? d : [])).catch(() => {});
  }, [seccion]);

  useEffect(() => {
    if (seccion !== "dashboard") return;
    Promise.all([
      fetchPacientes().catch(() => []),
      fetch("http://localhost:3000/citas").then(r => r.json()).catch(() => []),
    ]).then(([pacs, cts]) => {
      setPacientes(Array.isArray(pacs) ? pacs : []);
      setCitas(Array.isArray(cts) ? cts : []);
      setCargando(false);
    });
  }, [seccion]);

  /* ── Derived stats (memoized) ──────────── */
  const stats = useMemo(() => {
    const now = new Date();
    const totalPac   = pacientes.length;
    const rechazados = pacientes.filter(p => p.decision === "rechazado").length;
    const aprobados  = pacientes.filter(p => p.decision === "aprobado").length;
    const enProceso  = pacientes.filter(p => !p.decision || p.decision === "pendiente").length;
    const pendEstudio= pacientes.filter(p => p.apto === 1 && p.estudio_status !== "enviado");
    const bars = Array.from({ length: 6 }, (_, i) => {
      const d  = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const yr = d.getFullYear(), mo = d.getMonth();
      const total = pacientes.filter(p => {
        if (!p.fecha_registro) return false;
        const fr = new Date(String(p.fecha_registro).replace(/Z$/, '').replace(/\+.*/, ''));
        return fr.getFullYear() === yr && fr.getMonth() === mo;
      }).length;
      return { label: MESES[mo], total };
    });
    const maxBar     = Math.max(1, ...bars.map(b => b.total));
    const thisMonth  = bars[5]?.total ?? 0;
    const prevMonth  = bars[4]?.total ?? 0;
    const deltaPct   = prevMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - prevMonth) / prevMonth) * 100);
    const trendDir   = deltaPct > 0 ? "up" : deltaPct < 0 ? "down" : "neu";
    const trendStr   = deltaPct === 0 ? "—" : `${deltaPct > 0 ? "+" : ""}${deltaPct}%`;
    const tasaAprobacion = totalPac > 0 ? Math.round((aprobados / totalPac) * 100) : 0;
    return { totalPac, rechazados, aprobados, enProceso, pendEstudio, bars, maxBar, trendDir, trendStr, tasaAprobacion };
  }, [pacientes]);

  const { totalPac, rechazados, aprobados, enProceso, pendEstudio, bars, maxBar, trendDir, trendStr, tasaAprobacion } = stats;

  const now = new Date();
  const proximasCitas = useMemo(() =>
    citas.filter(c => c.fecha && new Date(c.fecha) >= now)
         .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
  [citas]);

  const ITEMS_PER_PAGE = 3;
  const citasPage = proximasCitas.slice(citaPage * ITEMS_PER_PAGE, (citaPage + 1) * ITEMS_PER_PAGE);
  const maxPage   = Math.ceil(proximasCitas.length / ITEMS_PER_PAGE) - 1;

  const BADGE_ESTADO = {
    programada:   ["#eff6ff","#2563eb","Programada"],
    asistio:      ["#e6f4f3","#0b5d5b","Asistió"],
    cancelada:    ["#fff1f2","#ef4444","Cancelada"],
    reprogramada: ["#fff7ed","#d97706","Reprogramada"],
  };

  const NAV = [
    { id: "dashboard",  label: "Inicio",                icon: <IcoGrid /> },
    { id: "registro",   label: "Preregistro",           icon: <IcoUser /> },
    { id: "pacientes",  label: "Pacientes",              icon: <IcoUsers /> },
    { id: "historial",  label: "Historial clínico",      icon: <IcoFile /> },
    { id: "estudio",    label: "Estudio Socioeconómico", icon: <IcoMoney /> },
    { id: "citas",      label: "Agenda de Citas",        icon: <IcoCal /> },
    { id: "validacion", label: "Validación de Ingreso",  icon: <IcoShield /> },
    { id: "preingreso", label: "Preingreso",             icon: <IcoDoc /> },
    { id: "expedientes",   label: "Expedientes",            icon: <IcoFolder /> },
    { id: "requisiciones", label: "Requisiciones",          icon: <IcoDoc /> },
  ];

  const notifNoLeidas = notifs.filter(n => !n.leida).length;

  const renderNotifPanel = (fixedLeft) => showNotifs && (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={() => setShowNotifs(false)} />
      <div
        style={{ position: "fixed", top: 68, ...(fixedLeft !== undefined ? { left: fixedLeft } : { right: 16 }), width: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 500, overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Notificaciones</span>
          {notifs.some(n => !n.leida) && (
            <button onClick={async () => { try { await fetch(`http://localhost:3000/clinico/notificaciones/leer-todas/${usuario.id_usuario}`, { method: "POST" }); setNotifs(prev => prev.map(n => ({ ...n, leida: 1 }))); } catch {} }} style={{ fontSize: 11, color: "#0b5d5b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Marcar todas leídas</button>
          )}
        </div>
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          {notifs.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Sin notificaciones</div>
          ) : notifs.map((n, i) => (
            <div key={i} onClick={() => irAPaciente(n)} style={{ padding: "12px 18px", borderBottom: "1px solid #f9fafb", cursor: n.id_referencia ? "pointer" : "default", background: n.leida ? "#fff" : "#f0faf9", display: "flex", gap: 12, alignItems: "flex-start" }}
              onMouseEnter={e => { if (n.id_referencia) e.currentTarget.style.background = "#e6f4f3"; }}
              onMouseLeave={e => e.currentTarget.style.background = n.leida ? "#fff" : "#f0faf9"}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.leida ? "#d1d5db" : "#0b5d5b", flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{n.mensaje}</div>
                {n.nombre_paciente && <div style={{ fontSize: 11, fontWeight: 700, color: "#0b5d5b", marginTop: 2 }}>👤 {n.nombre_paciente.trim()}</div>}
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{n.fecha ? new Date(String(n.fecha).replace(/Z$/,'').replace(/\+.*/,'')).toLocaleDateString("es-MX", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : ""}</div>
                {(n.id_paciente || n.id_referencia) && <div style={{ fontSize: 10, color: "#0b5d5b", fontWeight: 600, marginTop: 2 }}>Ver en Validación de Ingreso →</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const sidebar = (
    <div className="adm-sidebar" onClick={e => e.stopPropagation()}>
      <div className="adm-sidebar-top">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>MARAKAME</h2>
          {seccion !== "dashboard" && (
            <div style={{ position: "relative" }}>
              <div className="adm-topbar-icon" onClick={() => setShowNotifs(s => !s)} style={{ cursor: "pointer", position: "relative" }}>
                <IcoBell />
                {notifNoLeidas > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {notifNoLeidas}
                  </span>
                )}
              </div>
              {renderNotifPanel(248)}
            </div>
          )}
        </div>
        <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
      </div>
      <nav>
        <ul>
          {NAV.map(item => (
            <li
              key={item.id}
              className={seccion === item.id ? "active" : ""}
              onClick={() => {
                if (item.id === "registro") setCuestionarioPresetId(null);
                if (item.id === "estudio")  setEstudioPresetId(null);
                setSeccion(item.id);
              }}
            >
              {item.icon}{item.label}
            </li>
          ))}
        </ul>
      </nav>
      <div className="adm-sidebar-bottom">
        <button className="adm-btn" onClick={() => { setCuestionarioPresetId(null); setSeccion("registro"); }}>
          ⊕ Preregistro
        </button>
        <div className="adm-sidebar-links">
          <span style={{ cursor: "pointer" }} onClick={() => setModalPerfil(true)}><IcoSettings /> Mi Perfil</span>
          <span><IcoHelp /> Help</span>
        </div>
      </div>
    </div>
  );

  /* ── Modal Perfil ──────────────────────── */
  const perfilModal = modalPerfil && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setModalPerfil(false)}>
      <div style={{ background: "#fff", borderRadius: 16, width: 380, padding: 32, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>Mi Perfil</h4>
          <button onClick={() => setModalPerfil(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            {(usuario.nombre || "?")[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{usuario.nombre || "—"}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {usuario.rol === 3 ? "Admisiones" : usuario.rol === 4 ? "Médico" : usuario.rol === 5 ? "Clínico" : `Rol ${usuario.rol || "—"}`}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "ID de usuario",    val: usuario.id_usuario || "—" },
            { label: "Nombre completo",  val: usuario.nombre || "—" },
            { label: "Correo",           val: usuario.correo || "—" },
            { label: "Área",             val: "Admisiones" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f9fafb", borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{f.label}</span>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{f.val}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { localStorage.removeItem("usuario"); navigate("/"); }} style={{ marginTop: 20, width: "100%", padding: "10px", background: "#fff1f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  /* ── Sub-section rendering ──────────────── */
  if (seccion === "pacientes")   return <>{perfilModal}<div className="dashboard">{sidebar}<Pacientes embedded onVerExpediente={(id) => { setExpedienteId(String(id)); setSeccion("expedientes"); }} /></div></>;
  if (seccion === "registro")    return <>{perfilModal}<div className="dashboard">{sidebar}<RegistroPaciente embedded presetId={cuestionarioPresetId} onClose={cuestionarioPresetId ? () => { setCuestionarioPresetId(null); setSeccion("expedientes"); } : () => setSeccion("dashboard")} /></div></>;
  if (seccion === "estudio")     return <>{perfilModal}<div className="dashboard">{sidebar}<EstudioSocioeconomico embedded presetId={estudioPresetId} onClose={estudioPresetId ? () => { setEstudioPresetId(null); setSeccion("expedientes"); } : null} /></div></>;
  if (seccion === "citas")       return <>{perfilModal}<div className="dashboard">{sidebar}<Citas embedded onVerPaciente={(c) => { setValidacionPacId(c.id_paciente); setSeccion("validacion"); }} /></div></>;
  if (seccion === "validacion")  return <>{perfilModal}<div className="dashboard">{sidebar}<ValidarIngreso embedded defaultPacienteId={validacionPacId} onMounted={() => setValidacionPacId(null)} onIrEstudio={(id) => { setEstudioPresetId(String(id)); setSeccion("estudio"); }} /></div></>;
  if (seccion === "preingreso")  return <>{perfilModal}<div className="dashboard">{sidebar}<Preingreso embedded /></div></>;
  if (seccion === "expedientes")   return <>{perfilModal}<div className="dashboard">{sidebar}<Expedientes embedded defaultId={expedienteId} onVolver={expedienteId ? () => { setExpedienteId(null); setSeccion("pacientes"); } : null} onVerEstudio={(id) => { setEstudioPresetId(String(id)); setSeccion("estudio"); }} onVerCuestionario={(id) => { setCuestionarioPresetId(String(id)); setSeccion("registro"); }} /></div></>;
  if (seccion === "requisiciones") return <>{perfilModal}<div className="dashboard">{sidebar}<div className="main" style={{ overflowY: "auto", background: "#f8fafc" }}><Requisiciones /></div></div></>;
  if (seccion === "historial") {
    if (historialPacId) {
      return <>{perfilModal}<div className="dashboard">{sidebar}
        <div className="main" style={{ overflowY: "auto", padding: 0, background: "#f4f6f8" }}>
          <ExpedienteClinico id_paciente={historialPacId} onVolver={() => setHistorialPacId(null)} />
        </div>
      </div></>;
    }
    const pacsFiltrados = historialPacs.filter(p => {
      const q = historialBusq.trim().toLowerCase();
      if (!q) return true;
      return `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) || String(p.id_paciente).includes(q);
    });
    return <>{perfilModal}<div className="dashboard">{sidebar}
      <div className="main" style={{ overflowY: "auto" }}>
        <div className="header"><h3>Historial Clínico</h3></div>
        <div style={{ padding: "16px 24px" }}>
          <input
            placeholder="Buscar paciente por nombre o ID..."
            value={historialBusq}
            onChange={e => setHistorialBusq(e.target.value)}
            style={{ width: "100%", maxWidth: 380, padding: "9px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: "border-box" }}
          />
          {pacsFiltrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 14 }}>
              {historialBusq ? "Sin resultados" : "Cargando pacientes..."}
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Paciente", "Edad", "Valoración", "Decisión", ""].map((h, i) => (
                      <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pacsFiltrados.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                      onClick={() => setHistorialPacId(p.id_paciente)}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {`${(p.nombre||"")[0]||""}${(p.apellido||"")[0]||""}`.toUpperCase()}
                          </div>
                          {p.nombre} {p.apellido}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#6b7280" }}>{p.edad ? `${p.edad} años` : "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.apto === 1 ? <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#e6f4f3", color: "#0b5d5b" }}>Apto</span>
                        : p.apto === 0 ? <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#fff1f2", color: "#ef4444" }}>No Apto</span>
                        : <span style={{ fontSize: 11, color: "#9ca3af" }}>Pendiente</span>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.decision === "aprobado" ? <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#e6f4f3", color: "#0b5d5b" }}>✓ Aprobado</span>
                        : p.decision === "rechazado" ? <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#fff1f2", color: "#ef4444" }}>✗ Rechazado</span>
                        : <span style={{ fontSize: 11, color: "#9ca3af" }}>En proceso</span>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#0b5d5b", fontWeight: 700, fontSize: 12 }}>Ver historial →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div></>;
  }

  /* ── Dashboard ─────────────────────────── */
  return (
    <div className="dashboard" onClick={() => showNotifs && setShowNotifs(false)}>
      {sidebar}
      {perfilModal}

      <div className="main">
        {/* ── Topbar ─────────────────────────── */}
        <div className="adm-topbar">
          <h3>Inicio de Admisiones</h3>
          <div className="adm-topbar-right">
            <div style={{ position: "relative" }}>
              <div className="adm-topbar-icon" onClick={() => setShowNotifs(s => !s)} style={{ cursor: "pointer", position: "relative" }}>
                <IcoBell />
                {notifNoLeidas > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {notifNoLeidas}
                  </span>
                )}
              </div>
              {renderNotifPanel()}
            </div>
            <div className="adm-avatar" onClick={() => setModalPerfil(true)} style={{ cursor: "pointer" }} title="Ver perfil">
              {(usuario.nombre || "D")[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div className="adm-body">
          {/* ── Stat cards ────────────────────── */}
          <div className="adm-stats">
            {[
              { label: "Solicitudes Recibidas",  val: totalPac,   trend: trendStr, dir: trendDir, sub: "vs mes anterior", onClick: () => setSeccion("pacientes") },
              { label: "En Proceso",             val: enProceso,  trend: "en flujo", dir: "neu", sub: "de admisión", onClick: () => setSeccion("validacion") },
              { label: "Aprobados",              val: aprobados,  trend: totalPac > 0 ? `${Math.round((aprobados/totalPac)*100)}%` : "—", dir: aprobados > 0 ? "up" : "neu", sub: "del total", onClick: () => setSeccion("pacientes") },
              { label: "Rechazados",             val: rechazados, trend: totalPac > 0 ? `${Math.round((rechazados/totalPac)*100)}%` : "—", dir: rechazados > 0 ? "down" : "neu", sub: "del total", onClick: () => setSeccion("pacientes") },
            ].map((s, i) => (
              <div key={i} className="adm-stat-card" onClick={s.onClick} style={{ cursor: "pointer" }}>
                <span className={`adm-stat-trend ${s.dir}`}>
                  {s.dir === "up" ? "↑" : s.dir === "down" ? "↓" : ""} {s.trend} <span style={{ fontWeight: 400, opacity: .7 }}>{s.sub}</span>
                </span>
                <span className="adm-stat-label">{s.label}</span>
                <span className="adm-stat-num">{cargando ? "…" : s.val}</span>
              </div>
            ))}
          </div>

          {/* ── Middle ────────────────────────── */}
          <div className="adm-mid">
            {/* Right stack */}
            <div className="adm-right-stack">
              <div className="adm-pending-card">
                <div className="adm-pending-label">PENDIENTES</div>
                <div className="adm-pending-num">{cargando ? "…" : pendEstudio.length}</div>
                <div className="adm-pending-title">EVALUACIONES</div>
                <div className="adm-pending-sub">
                  ESTUDIO SOCIOECONÓMICO · FALTAN {cargando ? "…" : pendEstudio.length}
                </div>
                <button className="adm-pending-btn" onClick={() => setSeccion("estudio")}>
                  Revisar Ahora
                </button>
              </div>

              <div className="adm-eficacia-card">
                <div className="adm-eficacia-top">
                  <span className="adm-eficacia-label">APROBADOS</span>
                  <span className="adm-eficacia-pct" style={{ color: tasaAprobacion >= 50 ? "#0b5d5b" : "#d97706" }}>
                    {cargando ? "…" : `${tasaAprobacion}%`}
                  </span>
                </div>
                <div className="adm-eficacia-title">Tasa de Aprobación</div>
                <div className="adm-eficacia-sub">{cargando ? "…" : `${aprobados} aprobados de ${totalPac} totales`}</div>
              </div>
            </div>
          </div>

          {/* ── Bottom ────────────────────────── */}
          <div className="adm-bottom">
            {/* Próximas citas */}
            <div className="adm-section-card">
              <div className="adm-section-header">
                <h4>Próximas Citas</h4>
                <div className="adm-section-nav">
                  <button className="adm-nav-btn" onClick={() => setCitaPage(p => Math.max(0, p - 1))} disabled={citaPage === 0}>‹</button>
                  <button className="adm-nav-btn" onClick={() => setCitaPage(p => Math.min(maxPage, p + 1))} disabled={citaPage >= maxPage || proximasCitas.length === 0}>›</button>
                </div>
              </div>

              {cargando ? (
                <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Cargando...</div>
              ) : citasPage.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No hay citas próximas</div>
              ) : citasPage.map((c, i) => {
                const f = fmtCita(c.fecha);
                const familiar = (c.especialidad || "").split("|")[0];
                const [bg, color, label] = BADGE_ESTADO[c.estado] || ["#f3f4f6","#6b7280", c.estado];
                return (
                  <div key={i} className="adm-cita-item" onClick={() => setSeccion("citas")} style={{ cursor: "pointer" }}>
                    <div className="adm-cita-fecha">
                      <div className="adm-cita-mes">{f.mes}</div>
                      <div className="adm-cita-dia">{f.dia}</div>
                    </div>
                    <div className="adm-cita-info">
                      <div className="adm-cita-name">
                        {c.nombre_paciente} {c.apellido_paciente}
                      </div>
                      <div className="adm-cita-desc">
                        @ {f.hora} · {familiar || "Admisiones"} · {c.tipo || "Cita"}
                      </div>
                    </div>
                    <span className="adm-cita-badge" style={{ background: bg, color }}>{label}</span>
                  </div>
                );
              })}
            </div>

            {/* Estudios pendientes */}
            <div className="adm-section-card">
              <div className="adm-section-header">
                <h4>Estudios Socioeconómicos Pendientes</h4>
                <button className="adm-section-link" onClick={() => setSeccion("estudio")}>Ver todos</button>
              </div>

              {cargando ? (
                <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Cargando...</div>
              ) : pendEstudio.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No hay estudios pendientes</div>
              ) : pendEstudio.slice(0, 5).map((p, i) => {
                const progress = p.id_estudio ? 60 : 0;
                const dotColor = p.id_estudio ? "#d97706" : "#9ca3af";
                return (
                  <div key={i} className="adm-est-item" onClick={() => setSeccion("estudio")} style={{ cursor: "pointer" }}>
                    <div className="adm-est-avatar" style={{ background: progress > 0 ? "#0b5d5b" : "#6b7280" }}>
                      {initiales(p.nombre, p.apellido)}
                    </div>
                    <div className="adm-est-info">
                      <div className="adm-est-name">{p.nombre} {p.apellido}</div>
                      <div className="adm-est-when">
                        {p.id_estudio ? "Borrador guardado" : "Sin iniciar"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="adm-est-bar">
                        <div className="adm-est-bar-fill" style={{ width: `${progress}%`, background: dotColor }} />
                      </div>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, display: "inline-block" }} />
                    </div>
                    <span className="adm-est-arrow">›</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
