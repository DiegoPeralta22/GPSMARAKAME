import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Admisiones.css";
import { fetchPacientes } from "../../../utils/pacientes.js";
import ExpedienteClinico from "../../expediente/ExpedienteClinico";

const IcoGrid   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoHome   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoUsers  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoUser   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="16" y1="11" x2="16" y2="17"/><line x1="13" y1="14" x2="19" y2="14"/></svg>;
const IcoFile   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
const IcoMoney  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>;
const IcoCal    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoDoc    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>;
const IcoFolder = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const IcoEye    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoDl     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoPrint  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IcoX      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoEdit   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoBell   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoSettings=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IcoHelp   = ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const lbl = { fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 };
const val = { fontSize: 14, fontWeight: 500, color: "#374151" };

const TIPOS_CONTRATO = {
  contrato_terapeutico: "Contrato Terapéutico",
  consentimiento:       "Consentimiento Informado",
  carta_autorizacion:   "Carta de Autorización",
  reglamento:           "Reglamento Interno",
  carta_responsiva:     "Carta Responsiva Familiar",
  nicotina:             "Protocolo Libre de Nicotina",
  no_suicidio:          "Contrato de No Suicidio",
};

const TIPOS_CITA = ["Primera vez", "Seguimiento", "Valoración médica", "Entrevista familiar", "Entrevista de ingreso", "Otro"];

const ESTADO_CITA = {
  programada:   { bg: "#eff6ff", color: "#2563eb", label: "Programada" },
  asistio:      { bg: "#e6f4f3", color: "#0b5d5b", label: "Asistió" },
  cancelada:    { bg: "#fff1f2", color: "#ef4444", label: "Cancelada" },
  reprogramada: { bg: "#fff7ed", color: "#d97706", label: "Reprogramada" },
};

function fmtFecha(iso) {
  if (!iso) return "—";
  try {
    const s = String(iso).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
    return new Date(s).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

function fmtCita(iso) {
  if (!iso) return "—";
  try {
    const str = iso.replace("Z", "").replace(/\+.*/, "");
    const d = new Date(str);
    const dd = d.getDate().toString().padStart(2, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const hh = d.getHours().toString().padStart(2, "0");
    const mn = d.getMinutes().toString().padStart(2, "0");
    return { fecha: `${dd}/${mm}/${d.getFullYear()}`, hora: `${hh}:${mn}` };
  } catch { return { fecha: iso, hora: "" }; }
}

function mkId(id) {
  return `MK-${new Date().getFullYear()}-${String(id || 0).padStart(3, "0")}`;
}
function initials(n, a) {
  return `${(n || "")[0] || ""}${(a || "")[0] || ""}`.toUpperCase();
}
function Badge({ bg, color, text }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
}

// Timezone-safe parser: strips Z so SQL Server datetimes show as stored
const parseLocal = (iso) => {
  const s = String(iso).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
  return new Date(s);
};
const fmtLocal = (iso) => {
  if (!iso) return "—";
  const s = String(iso).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
  const [datePart, timePart = "00:00"] = s.split('T');
  if (!datePart) return "—";
  const [y, m, d] = datePart.split('-');
  const [hh, mn] = timePart.split(':');
  return `${d}/${m}/${y} ${hh}:${mn}`;
};

export default function Expedientes({ embedded = false, defaultId = null, onVolver = null, onVerEstudio = null, onVerCuestionario = null }) {
  const navigate   = useNavigate();
  const [sp]       = useSearchParams();
  const [localId,  setLocalId]  = useState(defaultId);
  const idPaciente = embedded ? localId : sp.get("id");
  const usuario    = JSON.parse(localStorage.getItem("usuario") || "{}");

  /* list state */
  const [pacientes,     setPacientes]     = useState([]);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState("todos");
  const [cargandoLista, setCargandoLista] = useState(false);

  /* detail state */
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(false);
  const [tab,      setTab]      = useState("general");

  /* citas state */
  const [citas, setCitas] = useState([]);

  /* contratos / preingreso */
  const [contratos, setContratos] = useState([]);

  /* expediente completo (áreas) */
  const [completo,          setCompleto]          = useState(null);
  const [cargandoCompleto,  setCargandoCompleto]  = useState(false);
  const [areaSelec,         setAreaSelec]         = useState("admisiones");

  /* modal nueva cita */
  const [modalCita, setModalCita]       = useState(false);
  const [citaFamiliar, setCitaFamiliar] = useState("");
  const [citaFecha,    setCitaFecha]    = useState("");
  const [citaHora,     setCitaHora]     = useState("");
  const [citaTipo,     setCitaTipo]     = useState("");
  const [citaNotas,    setCitaNotas]    = useState("");
  const [guardandoCita, setGuardandoCita] = useState(false);

  /* modal editar cita */
  const [modalEditCita, setModalEditCita] = useState(null);
  const [editEstado,    setEditEstado]    = useState("");
  const [editFecha,     setEditFecha]     = useState("");
  const [editHora,      setEditHora]      = useState("");
  const [editNotas,     setEditNotas]     = useState("");
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  /* notifications */
  const [notifs,     setNotifs]     = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (!usuario.id_usuario) return;
    fetch(`http://localhost:3000/clinico/notificaciones/${usuario.id_usuario}`)
      .then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d.slice(0, 20) : [])).catch(() => {});
  }, []);

  const leerNotif = async (id) => {
    try { await fetch(`http://localhost:3000/clinico/notificaciones/leer/${id}`, { method: "POST" }); } catch {}
    setNotifs(prev => prev.map(n => n.id_notificacion === id ? { ...n, leida: 1 } : n));
  };

  /* Word export */
  const [generandoWord,    setGenerandoWord]    = useState(false);
  const [generandoExpWord, setGenerandoExpWord] = useState(false);
  const [generandoDoc,     setGenerandoDoc]     = useState("");

  const descargarExpedienteWord = async () => {
    setGenerandoExpWord(true);
    try {
      const res  = await fetch(`http://localhost:3000/expediente-completo/${idPaciente}`);
      const data = await res.json();
      const p    = data.paciente || {};
      const fam  = data.familiar;
      const resp = data.cuestionario?.respuestas || [];
      const val  = data.valoracion;
      const est  = data.estudio;
      const rec  = data.recepcion;
      const trasl= data.traslado;
      const dec  = data.decision;

      const SECCIONES = {
        seguimiento: "SECCIÓN 1 — ATENCIÓN Y SEGUIMIENTO",
        solicitante: "SECCIÓN 2 — DATOS DEL SOLICITANTE",
        paciente:    "SECCIÓN 3 — INFORMACIÓN DEL PACIENTE",
        valoracion:  "SECCIÓN 4 — VALORACIÓN INICIAL",
        estatus:     "SECCIÓN 5 — ESTATUS Y PROGRAMACIÓN",
      };
      const byTipo = {};
      resp.forEach(r => { const t = r.tipo || "otro"; if (!byTipo[t]) byTipo[t] = []; byTipo[t].push(r); });
      const qaHTML = Object.entries(SECCIONES).map(([tipo, titulo]) => {
        const items = byTipo[tipo]; if (!items?.length) return "";
        return `<div class="sec-title">${titulo}</div>${items.map(r => `<div class="qa-item"><div class="qa-q">${r.pregunta||""}</div><div class="qa-a">${r.respuesta||"—"}</div></div>`).join("")}`;
      }).join("");

      const folio = `MK-${new Date().getFullYear()}-${String(p.id_paciente || 0).padStart(4,"0")}`;
      const hoy   = new Date().toLocaleDateString("es-MX", { day:"2-digit", month:"long", year:"numeric" });

      const medHTML = val ? `
        <div class="area-title">ÁREA MÉDICA — VALORACIÓN</div>
        <div class="qa-item"><div class="qa-q">Resultado</div><div class="qa-a">${val.apto===1?"✓ APTO":val.apto===0?"✗ NO APTO":"Pendiente"}</div></div>
        ${val.nombre_medico?`<div class="qa-item"><div class="qa-q">Médico responsable</div><div class="qa-a">${val.nombre_medico}</div></div>`:""}
        ${val.observaciones?`<div class="qa-item"><div class="qa-q">Observaciones</div><div class="qa-a">${val.observaciones}</div></div>`:""}
      ` : "";

      const estHTML = est ? `
        <div class="area-title">TRABAJO SOCIAL — ESTUDIO SOCIOECONÓMICO</div>
        <div class="qa-item"><div class="qa-q">Nivel Económico</div><div class="qa-a">${est.nivel_economico||"—"}</div></div>
        <div class="qa-item"><div class="qa-q">Ingreso Mensual</div><div class="qa-a">${est.ingreso_mensual!=null?"$"+est.ingreso_mensual:"—"}</div></div>
        <div class="qa-item"><div class="qa-q">Egreso Mensual</div><div class="qa-a">${est.egreso_mensual!=null?"$"+est.egreso_mensual:"—"}</div></div>
        ${est.tipo_vivienda?`<div class="qa-item"><div class="qa-q">Tipo de Vivienda</div><div class="qa-a">${est.tipo_vivienda}</div></div>`:""}
        ${est.observaciones?`<div class="qa-item"><div class="qa-q">Observaciones</div><div class="qa-a">${est.observaciones}</div></div>`:""}
      ` : "";

      const recHTML = rec ? `
        <div class="area-title">RECEPCIÓN — PRIMERAS 24 HORAS</div>
        ${rec.habitacion?`<div class="qa-item"><div class="qa-q">Habitación</div><div class="qa-a">${rec.habitacion}</div></div>`:""}
        ${rec.signos_vitales?`<div class="qa-item"><div class="qa-q">Signos Vitales</div><div class="qa-a">${rec.signos_vitales}</div></div>`:""}
        ${rec.valoracion_psiquiatrica?`<div class="qa-item"><div class="qa-q">Valoración Psiquiátrica</div><div class="qa-a">${rec.valoracion_psiquiatrica}</div></div>`:""}
        ${rec.valoracion_nutricional?`<div class="qa-item"><div class="qa-q">Valoración Nutricional</div><div class="qa-a">${rec.valoracion_nutricional}</div></div>`:""}
        ${rec.plan_tratamiento?`<div class="qa-item"><div class="qa-q">Plan de Tratamiento</div><div class="qa-a">${rec.plan_tratamiento}</div></div>`:""}
      ` : "";

      const decHTML = dec ? `
        <div class="area-title">DECISIÓN DE INGRESO</div>
        <div class="qa-item"><div class="qa-q">Decisión</div><div class="qa-a">${dec.decision==="aprobado"?"✓ APROBADO":dec.decision==="rechazado"?"✗ RECHAZADO":dec.decision||"—"}</div></div>
        ${dec.motivo_rechazo?`<div class="qa-item"><div class="qa-q">Motivo de rechazo</div><div class="qa-a">${dec.motivo_rechazo}</div></div>`:""}
      ` : "";

      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Expediente - ${p.nombre} ${p.apellido}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
  @page{size:letter;margin:2.5cm 3cm}body{font-family:Arial,sans-serif;font-size:10pt;color:#1a1a1a;line-height:1.5}
  .header{border-bottom:3pt solid #0b5d5b;padding-bottom:12pt;margin-bottom:16pt}
  .logo{font-size:20pt;font-weight:900;color:#0b5d5b;margin:0}.logo-sub{font-size:8pt;color:#6b7280;text-transform:uppercase;margin:0}
  .doc-title{font-size:14pt;font-weight:800;color:#111;text-align:center;margin:14pt 0 4pt}
  .pac-box{background:#f0faf9;border:1.5pt solid #0b5d5b;border-radius:4pt;padding:12pt 16pt;margin-bottom:18pt}
  .pac-name{font-size:13pt;font-weight:800;color:#0b5d5b;margin:0 0 8pt}
  .pac-row{display:flex;gap:20pt;flex-wrap:wrap}.pac-field{min-width:100pt}
  .pac-field label{font-size:7.5pt;color:#6b7280;text-transform:uppercase;font-weight:700;display:block;margin-bottom:1pt}
  .pac-field span{font-size:10pt;font-weight:600;color:#111}
  .sec-title{font-size:10pt;font-weight:800;color:#fff;background:#0b5d5b;padding:5pt 10pt;margin:18pt 0 10pt}
  .area-title{font-size:10pt;font-weight:800;color:#fff;background:#374151;padding:5pt 10pt;margin:18pt 0 10pt}
  .qa-item{margin-bottom:8pt;padding-bottom:8pt;border-bottom:0.5pt solid #e5e7eb}
  .qa-q{font-size:8pt;color:#6b7280;font-weight:600;margin-bottom:2pt;text-transform:uppercase}
  .qa-a{font-size:10pt;color:#111;font-weight:500}
  .page-footer{margin-top:24pt;border-top:0.5pt solid #e5e7eb;padding-top:8pt;font-size:8pt;color:#9ca3af;text-align:center}
</style></head><body>
<div class="header"><p class="logo">MARAKAME</p><p class="logo-sub">Instituto de Rehabilitación — Expediente Completo</p></div>
<div class="doc-title">EXPEDIENTE DE ADMISIÓN</div>
<div style="text-align:center;font-size:9pt;color:#6b7280;margin-bottom:16pt">Folio: ${folio} &nbsp;|&nbsp; Impreso el ${hoy} por ${usuario?.nombre||"—"}</div>
<div class="pac-box">
  <p class="pac-name">${p.nombre||""} ${p.apellido||""}</p>
  <div class="pac-row">
    <div class="pac-field"><label>Edad</label><span>${p.edad?p.edad+" años":"—"}</span></div>
    <div class="pac-field"><label>Género</label><span>${p.genero||"—"}</span></div>
    <div class="pac-field"><label>Estado Civil</label><span>${p.estado_civil||"—"}</span></div>
    <div class="pac-field"><label>Teléfono</label><span>${p.telefono||"—"}</span></div>
    <div class="pac-field"><label>Escolaridad</label><span>${p.escolaridad||"—"}</span></div>
    <div class="pac-field"><label>Ocupación</label><span>${p.ocupacion||"—"}</span></div>
  </div>
  ${p.direccion?`<div style="margin-top:8pt"><label style="font-size:7.5pt;color:#6b7280;text-transform:uppercase;font-weight:700">Dirección</label><div>${p.direccion}</div></div>`:""}
  ${fam?`<div style="margin-top:12pt;border-top:1pt solid #ccc;padding-top:8pt"><label style="font-size:7.5pt;color:#6b7280;text-transform:uppercase;font-weight:700;display:block;margin-bottom:6pt">Familiar / Responsable</label><div class="pac-row"><div class="pac-field"><label>Nombre</label><span>${fam.nombre||"—"}</span></div><div class="pac-field"><label>Parentesco</label><span>${fam.parentesco||"—"}</span></div><div class="pac-field"><label>Teléfono</label><span>${fam.telefono||"—"}</span></div></div></div>`:""}
</div>
${qaHTML}${medHTML}${estHTML}${recHTML}${decHTML}
<div class="page-footer">Instituto MARAKAME de Rehabilitación &nbsp;|&nbsp; ${folio} &nbsp;|&nbsp; ${hoy}</div>
</body></html>`;

      const blob = new Blob(["﻿", html], { type: "application/msword" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Expediente_${p.nombre}_${p.apellido}_${folio}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al generar el documento");
    } finally {
      setGenerandoExpWord(false);
    }
  };

  const descargarDocumentoWord = async (tipo) => {
    setGenerandoDoc(tipo);
    try {
      const res  = await fetch(`http://localhost:3000/expediente-completo/${idPaciente}`);
      const data = await res.json();
      const p    = data.paciente || {};
      const folio = `MK-${new Date().getFullYear()}-${String(p.id_paciente || 0).padStart(4, "0")}`;
      const hoy   = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
      const BASE_STYLE = `<style>@page{size:letter;margin:2.5cm 3cm}body{font-family:Arial,sans-serif;font-size:10pt;color:#1a1a1a;line-height:1.5}.header{border-bottom:3pt solid #0b5d5b;padding-bottom:10pt;margin-bottom:16pt}.logo{font-size:18pt;font-weight:900;color:#0b5d5b;margin:0}.logo-sub{font-size:8pt;color:#6b7280;text-transform:uppercase;margin:0}.doc-title{font-size:14pt;font-weight:800;color:#111;text-align:center;margin:12pt 0 4pt}.doc-sub{text-align:center;font-size:9pt;color:#6b7280;margin-bottom:16pt}.pac-box{background:#f0faf9;border:1.5pt solid #0b5d5b;border-radius:4pt;padding:12pt 16pt;margin-bottom:16pt}.pac-name{font-size:13pt;font-weight:800;color:#0b5d5b;margin:0 0 6pt}.sec-title{font-size:10pt;font-weight:800;color:#fff;background:#0b5d5b;padding:5pt 10pt;margin:16pt 0 8pt}.qa-item{margin-bottom:7pt;padding-bottom:7pt;border-bottom:0.5pt solid #e5e7eb}.qa-q{font-size:8pt;color:#6b7280;font-weight:600;margin-bottom:2pt;text-transform:uppercase}.qa-a{font-size:10pt;color:#111;font-weight:500}.footer{margin-top:20pt;border-top:0.5pt solid #e5e7eb;padding-top:6pt;font-size:8pt;color:#9ca3af;text-align:center}</style>`;
      const HDR = `<div class="header"><p class="logo">MARAKAME</p><p class="logo-sub">Instituto de Rehabilitación</p></div>`;
      const PAC = `<div class="pac-box"><p class="pac-name">${p.nombre||""} ${p.apellido||""}</p><div style="display:flex;gap:20pt;flex-wrap:wrap;font-size:9pt"><span><b>Folio:</b> ${folio}</span><span><b>Edad:</b> ${p.edad||"—"} años</span><span><b>Teléfono:</b> ${p.telefono||"—"}</span></div></div>`;
      const FTR = `<div class="footer">Instituto MARAKAME de Rehabilitación | ${folio} | ${hoy}</div>`;

      let cuerpo = "";
      let titulo = "";
      let nombre_archivo = "";

      if (tipo === "estudio") {
        const e = data.estudio;
        titulo = "ESTUDIO SOCIOECONÓMICO";
        nombre_archivo = `Estudio_Socioeconomico_${p.nombre}_${p.apellido}_${folio}.doc`;
        if (!e) { alert("No hay estudio socioeconómico registrado para este paciente."); setGenerandoDoc(""); return; }
        cuerpo = `<div class="sec-title">DATOS SOCIOECONÓMICOS</div>
          ${e.nivel_economico?`<div class="qa-item"><div class="qa-q">Nivel Económico</div><div class="qa-a">${e.nivel_economico}</div></div>`:""}
          ${e.ingreso_mensual!=null?`<div class="qa-item"><div class="qa-q">Ingreso Mensual</div><div class="qa-a">$${e.ingreso_mensual}</div></div>`:""}
          ${e.egreso_mensual!=null?`<div class="qa-item"><div class="qa-q">Egreso Mensual</div><div class="qa-a">$${e.egreso_mensual}</div></div>`:""}
          ${e.tipo_vivienda?`<div class="qa-item"><div class="qa-q">Tipo de Vivienda</div><div class="qa-a">${e.tipo_vivienda}</div></div>`:""}
          ${e.num_dependientes!=null?`<div class="qa-item"><div class="qa-q">Número de Dependientes</div><div class="qa-a">${e.num_dependientes}</div></div>`:""}
          ${e.situacion_laboral?`<div class="qa-item"><div class="qa-q">Situación Laboral</div><div class="qa-a">${e.situacion_laboral}</div></div>`:""}
          ${e.observaciones?`<div class="qa-item"><div class="qa-q">Observaciones</div><div class="qa-a">${e.observaciones}</div></div>`:""}
          <div style="display:flex;justify-content:space-around;margin-top:40pt">
            <div style="text-align:center;width:160pt"><div style="border-top:1pt solid #111;padding-top:6pt;font-size:9pt;font-weight:600">Trabajador(a) Social</div></div>
            <div style="text-align:center;width:160pt"><div style="border-top:1pt solid #111;padding-top:6pt;font-size:9pt;font-weight:600">${p.nombre||""} ${p.apellido||""}</div><div style="font-size:8pt;color:#6b7280">Paciente / Representante</div></div>
          </div>`;
      } else if (tipo === "valoracion") {
        const v = data.valoracion;
        titulo = "VALORACIÓN MÉDICA";
        nombre_archivo = `Valoracion_Medica_${p.nombre}_${p.apellido}_${folio}.doc`;
        if (!v) { alert("No hay valoración médica registrada para este paciente."); setGenerandoDoc(""); return; }
        cuerpo = `<div class="sec-title">RESULTADO DE VALORACIÓN MÉDICA</div>
          <div class="qa-item"><div class="qa-q">Resultado</div><div class="qa-a" style="font-size:13pt;font-weight:800;color:${v.apto===1?"#0b5d5b":"#ef4444"}">${v.apto===1?"✓ APTO PARA INGRESO":v.apto===0?"✗ NO APTO PARA INGRESO":"Pendiente"}</div></div>
          ${v.nombre_medico?`<div class="qa-item"><div class="qa-q">Médico Responsable</div><div class="qa-a">${v.nombre_medico}</div></div>`:""}
          ${v.fecha_valoracion?`<div class="qa-item"><div class="qa-q">Fecha de Valoración</div><div class="qa-a">${fmtFecha(v.fecha_valoracion)}</div></div>`:""}
          ${v.observaciones?`<div class="qa-item"><div class="qa-q">Observaciones Clínicas</div><div class="qa-a">${v.observaciones}</div></div>`:""}
          <div style="display:flex;justify-content:space-around;margin-top:40pt">
            <div style="text-align:center;width:160pt"><div style="border-top:1pt solid #111;padding-top:6pt;font-size:9pt;font-weight:600">${v.nombre_medico||"Dr./Dra."}</div><div style="font-size:8pt;color:#6b7280">Médico Responsable</div></div>
          </div>`;
      } else if (tipo === "decision") {
        const dec = data.decision;
        titulo = "DECISIÓN DE INGRESO";
        nombre_archivo = `Decision_Ingreso_${p.nombre}_${p.apellido}_${folio}.doc`;
        if (!dec) { alert("No hay decisión registrada para este paciente."); setGenerandoDoc(""); return; }
        const esAprobado = dec.decision === "aprobado";
        cuerpo = `<div class="sec-title">RESOLUCIÓN DE ADMISIÓN</div>
          <div style="text-align:center;margin:20pt 0;padding:16pt;background:${esAprobado?"#f0faf9":"#fff1f2"};border:2pt solid ${esAprobado?"#0b5d5b":"#ef4444"};border-radius:4pt">
            <div style="font-size:18pt;font-weight:900;color:${esAprobado?"#0b5d5b":"#ef4444"}">${esAprobado?"✓ APROBADO":"✗ RECHAZADO"}</div>
          </div>
          ${dec.motivo_rechazo?`<div class="qa-item"><div class="qa-q">Motivo</div><div class="qa-a">${dec.motivo_rechazo}</div></div>`:""}
          ${dec.fecha?`<div class="qa-item"><div class="qa-q">Fecha de Resolución</div><div class="qa-a">${fmtFecha(dec.fecha)}</div></div>`:""}
          <div style="display:flex;justify-content:space-around;margin-top:40pt">
            <div style="text-align:center;width:160pt"><div style="border-top:1pt solid #111;padding-top:6pt;font-size:9pt;font-weight:600">Personal de Admisiones</div></div>
            <div style="text-align:center;width:160pt"><div style="border-top:1pt solid #111;padding-top:6pt;font-size:9pt;font-weight:600">${p.nombre||""} ${p.apellido||""}</div><div style="font-size:8pt;color:#6b7280">Paciente / Representante</div></div>
          </div>`;
      }

      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${titulo}</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->${BASE_STYLE}</head><body>${HDR}<div class="doc-title">${titulo}</div><div class="doc-sub">Folio: ${folio} | Impreso el ${hoy} por ${usuario?.nombre||"—"}</div>${PAC}${cuerpo}${FTR}</body></html>`;
      const blob = new Blob(["﻿", html], { type: "application/msword" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = nombre_archivo;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al generar el documento");
    } finally {
      setGenerandoDoc("");
    }
  };

  const descargarCuestionarioWord = async () => {
    setGenerandoWord(true);
    try {
      const res  = await fetch(`http://localhost:3000/cuestionario-word/${idPaciente}`);
      const data = await res.json();
      const p    = data.paciente || {};
      const fam  = data.familiar;
      const resp = data.respuestas || [];

      const SECCIONES = {
        seguimiento: "SECCIÓN 1 — ATENCIÓN Y SEGUIMIENTO",
        solicitante: "SECCIÓN 2 — DATOS DEL SOLICITANTE",
        paciente:    "SECCIÓN 3 — INFORMACIÓN DEL PACIENTE",
        valoracion:  "SECCIÓN 4 — VALORACIÓN INICIAL",
        estatus:     "SECCIÓN 5 — ESTATUS Y PROGRAMACIÓN",
      };

      const byTipo = {};
      resp.forEach(r => {
        const t = r.tipo || "otro";
        if (!byTipo[t]) byTipo[t] = [];
        byTipo[t].push(r);
      });

      const qaHTML = Object.entries(SECCIONES).map(([tipo, titulo]) => {
        const items = byTipo[tipo];
        if (!items?.length) return "";
        return `
          <div class="sec-title">${titulo}</div>
          ${items.map(r => `
            <div class="qa-item">
              <div class="qa-q">${r.pregunta || ""}</div>
              <div class="qa-a">${r.respuesta && r.respuesta.trim() ? r.respuesta : '<span style="color:#9ca3af;font-style:italic">Sin respuesta</span>'}</div>
            </div>
          `).join("")}
        `;
      }).join("");

      const folio = `MK-${new Date().getFullYear()}-${String(p.id_paciente || 0).padStart(4, "0")}`;
      const hoy   = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });

      const html = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Cuestionario de Admisión - ${p.nombre} ${p.apellido}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page { size: letter; margin: 2.5cm 3cm; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #1a1a1a; line-height: 1.5; }
  .header { border-bottom: 3pt solid #0b5d5b; padding-bottom: 12pt; margin-bottom: 16pt; display: flex; align-items: center; justify-content: space-between; }
  .logo-block {}
  .logo { font-size: 20pt; font-weight: 900; color: #0b5d5b; letter-spacing: 1px; margin: 0; }
  .logo-sub { font-size: 8pt; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
  .doc-meta { text-align: right; font-size: 9pt; color: #6b7280; }
  .doc-title { font-size: 14pt; font-weight: 800; color: #111; text-align: center; margin: 14pt 0 4pt; }
  .doc-folio { text-align: center; font-size: 9pt; color: #6b7280; margin-bottom: 16pt; }
  .pac-box { background: #f0faf9; border: 1.5pt solid #0b5d5b; border-radius: 4pt; padding: 12pt 16pt; margin-bottom: 18pt; }
  .pac-name { font-size: 13pt; font-weight: 800; color: #0b5d5b; margin: 0 0 8pt; }
  .pac-row { display: flex; gap: 20pt; flex-wrap: wrap; }
  .pac-field { min-width: 100pt; }
  .pac-field label { font-size: 7.5pt; color: #6b7280; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 1pt; letter-spacing: 0.5px; }
  .pac-field span { font-size: 10pt; font-weight: 600; color: #111; }
  .sec-title { font-size: 10pt; font-weight: 800; color: #fff; background: #0b5d5b; padding: 5pt 10pt; margin: 18pt 0 10pt; letter-spacing: 0.5px; }
  .qa-item { margin-bottom: 8pt; padding-bottom: 8pt; border-bottom: 0.5pt solid #e5e7eb; }
  .qa-q { font-size: 8pt; color: #6b7280; font-weight: 600; margin-bottom: 2pt; text-transform: uppercase; letter-spacing: 0.3px; }
  .qa-a { font-size: 10pt; color: #111; font-weight: 500; }
  .fam-box { background: #fff7ed; border: 1pt solid #d97706; border-radius: 4pt; padding: 10pt 14pt; margin: 14pt 0; }
  .fam-title { font-size: 9pt; font-weight: 700; color: #d97706; text-transform: uppercase; margin: 0 0 6pt; }
  .firmas { display: flex; justify-content: space-around; margin-top: 40pt; }
  .firma-box { text-align: center; width: 160pt; }
  .firma-line { border-top: 1pt solid #111; padding-top: 6pt; font-size: 9pt; font-weight: 600; }
  .firma-cargo { font-size: 8pt; color: #6b7280; }
  .page-footer { margin-top: 24pt; border-top: 0.5pt solid #e5e7eb; padding-top: 8pt; font-size: 8pt; color: #9ca3af; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <div class="logo-block">
    <p class="logo">MARAKAME</p>
    <p class="logo-sub">Instituto de Rehabilitación</p>
  </div>
  <div class="doc-meta">
    <div>Fecha de impresión: ${hoy}</div>
    <div>Impreso por: ${usuario?.nombre || "—"}</div>
  </div>
</div>

<div class="doc-title">CUESTIONARIO DE ADMISIÓN</div>
<div class="doc-folio">Folio: ${folio} &nbsp;|&nbsp; Fecha de registro: ${new Date(p.fecha_registro || Date.now()).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</div>

<div class="pac-box">
  <p class="pac-name">${p.nombre || ""} ${p.apellido || ""}</p>
  <div class="pac-row">
    <div class="pac-field"><label>Edad</label><span>${p.edad ? p.edad + " años" : "—"}</span></div>
    <div class="pac-field"><label>Género</label><span>${p.genero || "—"}</span></div>
    <div class="pac-field"><label>Estado Civil</label><span>${p.estado_civil || "—"}</span></div>
    <div class="pac-field"><label>Escolaridad</label><span>${p.escolaridad || "—"}</span></div>
    <div class="pac-field"><label>Ocupación</label><span>${p.ocupacion || "—"}</span></div>
    <div class="pac-field"><label>Teléfono</label><span>${p.telefono || "—"}</span></div>
  </div>
  ${p.direccion ? `<div style="margin-top:8pt"><label style="font-size:7.5pt;color:#6b7280;text-transform:uppercase;font-weight:700">Dirección</label><div style="font-size:10pt;font-weight:500">${p.direccion}</div></div>` : ""}
</div>

${fam ? `
<div class="fam-box">
  <p class="fam-title">Familiar / Responsable</p>
  <div class="pac-row">
    <div class="pac-field"><label>Nombre</label><span>${fam.nombre || "—"}</span></div>
    <div class="pac-field"><label>Parentesco</label><span>${fam.parentesco || "—"}</span></div>
    <div class="pac-field"><label>Teléfono</label><span>${fam.telefono || "—"}</span></div>
    ${fam.direccion ? `<div class="pac-field"><label>Dirección</label><span>${fam.direccion}</span></div>` : ""}
  </div>
</div>
` : ""}

${qaHTML}

<div class="firmas">
  <div class="firma-box">
    <div class="firma-line">${p.nombre || ""} ${p.apellido || ""}</div>
    <div class="firma-cargo">Paciente / Representante</div>
  </div>
  <div class="firma-box">
    <div class="firma-line">&nbsp;</div>
    <div class="firma-cargo">Personal de Admisiones</div>
  </div>
  <div class="firma-box">
    <div class="firma-line">&nbsp;</div>
    <div class="firma-cargo">Director / Responsable</div>
  </div>
</div>

<div class="page-footer">
  Instituto MARAKAME de Rehabilitación &nbsp;|&nbsp; Documento generado el ${hoy} &nbsp;|&nbsp; ${folio}
</div>

</body>
</html>`;

      const blob = new Blob(["﻿", html], { type: "application/msword" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Cuestionario_${p.nombre}_${p.apellido}_${folio}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al generar el documento Word");
    } finally {
      setGenerandoWord(false);
    }
  };

  useEffect(() => {
    if (idPaciente) {
      cargarDetalle(idPaciente);
      cargarCitas(idPaciente);
      setCompleto(null);
      fetch(`http://localhost:3000/contratos/${idPaciente}`)
        .then(r => r.json())
        .then(data => setContratos(Array.isArray(data) ? data : []))
        .catch(() => setContratos([]));
    } else {
      setTab("general");
      cargarLista();
      setContratos([]);
    }
  }, [idPaciente]);

  const cargarCompleto = async (id) => {
    setCargandoCompleto(true);
    try {
      const res  = await fetch(`http://localhost:3000/expediente-completo/${id}`);
      const data = await res.json();
      setCompleto(data);
    } catch { setCompleto(null); }
    finally { setCargandoCompleto(false); }
  };

  const handleTabClick = (t) => {
    setTab(t);
    if (t === "áreas" && idPaciente && !completo) cargarCompleto(idPaciente);
  };

  const cargarLista = async () => {
    setCargandoLista(true);
    try {
      const data = await fetchPacientes();
      setPacientes(Array.isArray(data) ? data : []);
    } catch { setPacientes([]); }
    finally { setCargandoLista(false); }
  };

  const cargarDetalle = async (id) => {
    setCargando(true);
    setDatos(null);
    try {
      const res  = await fetch(`http://localhost:3000/validar-ingreso/${id}`);
      const data = await res.json();
      setDatos(data);
    } catch { setDatos({}); }
    finally { setCargando(false); }
  };

  const cargarCitas = async (id) => {
    try {
      const res  = await fetch("http://localhost:3000/citas");
      const data = await res.json();
      setCitas(Array.isArray(data) ? data.filter(c => c.id_paciente === parseInt(id)) : []);
    } catch { setCitas([]); }
  };

  const abrirModalCita = () => {
    const fam = datos?.familiar;
    setCitaFamiliar(fam?.nombre || "");
    setCitaFecha("");
    setCitaHora("");
    setCitaTipo("");
    setCitaNotas("");
    setModalCita(true);
  };

  const crearCita = async () => {
    if (!citaFecha || !citaHora) return alert("Indica la fecha y hora");
    if (!citaTipo) return alert("Selecciona el tipo de cita");
    setGuardandoCita(true);
    try {
      const res = await fetch("http://localhost:3000/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: parseInt(idPaciente),
          fecha: `${citaFecha}T${citaHora}:00`,
          tipo: citaTipo,
          familiar_nombre: citaFamiliar || null,
          id_usuario: usuario.id_usuario || null,
        }),
      });
      if (!res.ok) throw new Error();
      setModalCita(false);
      cargarCitas(idPaciente);
    } catch { alert("Error al guardar la cita"); }
    finally { setGuardandoCita(false); }
  };

  const abrirEditarCita = (c) => {
    const parsed = fmtCita(c.fecha);
    setModalEditCita(c);
    setEditEstado(c.estado || "programada");
    setEditFecha(c.fecha ? c.fecha.split("T")[0].split(" ")[0] : "");
    setEditHora(parsed.hora || "");
    setEditNotas(c.notas || "");
  };

  const guardarEditCita = async () => {
    if (!editEstado) return;
    setGuardandoEdit(true);
    try {
      const body = { estado: editEstado, notas: editNotas || null };
      if (editFecha && editHora) body.fecha = `${editFecha}T${editHora}:00`;
      const res = await fetch(`http://localhost:3000/citas/${modalEditCita.id_cita}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setModalEditCita(null);
      cargarCitas(idPaciente);
    } catch { alert("Error al actualizar"); }
    finally { setGuardandoEdit(false); }
  };

  /* ── Sidebar ─────────────────────────────────────────── */
  const notifNoLeidas = notifs.filter(n => !n.leida).length;
  const Sidebar = () => (
    <div className="adm-sidebar" onClick={e => e.stopPropagation()}>
      <div className="adm-sidebar-top">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>MARAKAME</h2>
          <div style={{ position: "relative" }}>
            <div className="adm-topbar-icon" onClick={() => setShowNotifs(s => !s)} style={{ cursor: "pointer", position: "relative" }}>
              <IcoBell />
              {notifNoLeidas > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifNoLeidas}
                </span>
              )}
            </div>
            {showNotifs && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={() => setShowNotifs(false)} />
                <div style={{ position: "fixed", top: 68, left: 248, width: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 500, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Notificaciones</span>
                  </div>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifs.length === 0
                      ? <div style={{ padding: "32px 18px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Sin notificaciones</div>
                      : notifs.map((n, i) => (
                        <div key={i} onClick={() => { leerNotif(n.id_notificacion); setShowNotifs(false); if (n.id_referencia) navigate(`/expedientes?id=${n.id_referencia}`); }}
                          style={{ padding: "12px 18px", borderBottom: "1px solid #f9fafb", cursor: "pointer", background: n.leida ? "#fff" : "#f0faf9", display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.leida ? "#d1d5db" : "#0b5d5b", flexShrink: 0, marginTop: 5 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{n.mensaje}</div>
                            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{n.fecha ? new Date(String(n.fecha).replace(/Z$/,'').replace(/\+.*/,'')).toLocaleDateString("es-MX", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : ""}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
      </div>
      <nav>
        <ul>
          <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
          <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
          <li onClick={() => navigate("/pacientes")}><IcoUsers />Pacientes</li>
          <li onClick={() => navigate("/registro")}><IcoUser />Preregistro</li>
          <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
          <li onClick={() => navigate("/estudio")}><IcoMoney />Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
          <li onClick={() => navigate("/preingreso")}><IcoDoc />Preingreso</li>
          <li className="active"><IcoFolder />Expedientes</li>
        </ul>
      </nav>
      <div className="adm-sidebar-bottom">
        <button className="adm-btn" onClick={() => navigate("/registro")}>⊕ Preregistro</button>
        <div className="adm-sidebar-links">
          <span><IcoSettings /> Mi Perfil</span>
          <span><IcoHelp /> Help</span>
        </div>
      </div>
    </div>
  );
  const wrap = (m) => embedded ? m : <div className="dashboard"><Sidebar />{m}</div>;

  /* ── LIST VIEW ───────────────────────────────────────── */
  if (!idPaciente) {
    const getEstatus = (p) => {
      if (p.decision === "rechazado") return "rechazado";
      if (p.decision === "aprobado")  return "tratamiento";
      if (p.apto === 0)               return "revaloracion";
      if (p.apto === 1 || p.id_cuestionario) return "espera";
      return "solicitante";
    };

    const filtrados = pacientes.filter(p => {
      const nom = `${p.nombre} ${p.apellido}`.toLowerCase();
      const matchBusqueda = !busqueda.trim() || nom.includes(busqueda.toLowerCase());
      const matchEstado = filtroEstado === "todos" || getEstatus(p) === filtroEstado;
      return matchBusqueda && matchEstado;
    });

    const FILTROS = [
      { key: "todos",       label: "Todos" },
      { key: "espera",      label: "En Espera",       bg: "#eff6ff", color: "#2563eb" },
      { key: "tratamiento", label: "En Tratamiento",  bg: "#e6f4f3", color: "#0b5d5b" },
      { key: "revaloracion",label: "Revaloración",    bg: "#fff7ed", color: "#d97706" },
      { key: "rechazado",   label: "Rechazado",       bg: "#fff1f2", color: "#ef4444" },
      { key: "solicitante", label: "Solicitante",     bg: "#f3f4f6", color: "#6b7280" },
    ];

    return wrap(
      <div className="main" style={{ overflowY: "auto" }}>
          <div className="header">
            <h3>Expedientes</h3>
            <input placeholder="Buscar paciente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <div style={{ padding: "8px 24px 0" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FILTROS.map(f => {
                const activo = filtroEstado === f.key;
                return (
                  <button key={f.key} onClick={() => setFiltroEstado(f.key)}
                    style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${activo ? (f.color || "#0b5d5b") : "#e5e7eb"}`,
                      background: activo ? (f.bg || "#e6f4f3") : "#fff",
                      color: activo ? (f.color || "#0b5d5b") : "#6b7280",
                      fontSize: 12, fontWeight: activo ? 700 : 500, cursor: "pointer", transition: "all .15s" }}>
                    {f.label}
                    {f.key !== "todos" && (
                      <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.8 }}>
                        ({pacientes.filter(p => getEstatus(p) === f.key).length})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "12px 24px" }}>
            {cargandoLista ? (
              <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Cargando expedientes...</div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["ID", "Paciente", "Estatus", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                        {busqueda ? "Sin resultados" : "No hay expedientes registrados"}
                      </td></tr>
                    ) : filtrados.map((p, i) => {
                      const estKey = getEstatus(p);
                      const estInfo = FILTROS.find(f => f.key === estKey) || FILTROS[0];
                      const est = { bg: estInfo.bg || "#f3f4f6", color: estInfo.color || "#6b7280", label: estInfo.label };
                      return (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                        onClick={() => embedded ? setLocalId(String(p.id_paciente)) : navigate(`/expedientes?id=${p.id_paciente}`)}
                      >
                        <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>{mkId(p.id_paciente)}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {initials(p.nombre, p.apellido)}
                            </div>
                            <div>
                              <div>{p.nombre} {p.apellido}</div>
                              {p.edad ? <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>{p.edad} años</div> : null}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}><Badge bg={est.bg} color={est.color} text={est.label} /></td>
                        <td style={{ padding: "12px 14px" }}><span style={{ color: "#0b5d5b", fontWeight: 700, fontSize: 12 }}>Ver expediente →</span></td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    );
  }

  const pac = datos?.paciente || {};
  const v   = datos?.valoracion;
  const e   = datos?.estudio;
  const c   = datos?.cuestionario;
  const dec = datos?.decision;
  const fam = datos?.familiar;

  const decColor = dec?.decision === "aprobado" ? "#0b5d5b" : dec?.decision === "rechazado" ? "#ef4444" : "#d97706";
  const decBg    = dec?.decision === "aprobado" ? "#e6f4f3" : dec?.decision === "rechazado" ? "#fff1f2" : "#fff7ed";
  const decLabel = dec?.decision === "aprobado" ? "APROBADO" : dec?.decision === "rechazado" ? "RECHAZADO" : "EN PROCESO";

  const pasos = [
    { label: "REGISTRO",   done: true, fecha: fmtFecha(pac.fecha_registro) },
    { label: "EVALUACIÓN", done: !!v,  fecha: v ? fmtFecha(v.fecha_valoracion) : "Pendiente" },
    { label: "VALIDACIÓN", done: !!e,  fecha: e ? (e.status || "En proceso") : "Pendiente" },
    { label: dec?.decision === "aprobado" ? "APROBADO" : "DECISIÓN",
      done: !!dec, fecha: dec ? (dec.decision || "—") : "Pendiente" },
  ];

  const documentos = [
    {
      icon: "📋", nombre: "Cuestionario de Admisión",
      status: c ? "Completado" : "Pendiente", ok: !!c,
      verUrl: `/registro?id=${idPaciente}`, wordTipo: "cuestionario",
    },
    {
      icon: "📊", nombre: "Estudio Socioeconómico",
      status: e?.status === "enviado" ? "Completado" : e ? "Borrador" : "Pendiente",
      ok: !!(e),
      verUrl: `/estudio?id=${idPaciente}`, wordTipo: "estudio",
    },
    {
      icon: "📄", nombre: "Valoración Médica",
      status: v ? (v.apto === 1 ? "Completado" : "No Apto") : "Pendiente",
      ok: !!v,
      verUrl: `/validacion`, wordTipo: "valoracion",
    },
    {
      icon: "📝", nombre: "Decisión de Ingreso",
      status: dec ? (dec.decision === "aprobado" ? "Aprobado" : "Rechazado") : "Pendiente",
      ok: !!dec,
      verUrl: `/validacion`, wordTipo: "decision",
    },
  ];

  const citasFuturas = citas.filter(ci => new Date(ci.fecha) >= new Date()).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const TABS = ["General", "Documentos", "Estatus", "Citas", "Áreas"];

  /* ── DETAIL VIEW ─────────────────────────────────────── */
  return wrap(<>
    <div className="main" style={{ overflowY: "auto", background: "#f3f4f6", padding: 0 }}>

        {/* Patient header + tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0 12px" }}>
            <button onClick={() => onVolver ? onVolver() : embedded ? setLocalId(null) : navigate("/expedientes")} style={{ background: "none", border: "none", cursor: "pointer", color: "#0b5d5b", fontWeight: 700, fontSize: 13, padding: 0, marginRight: 4 }}>← Volver</button>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800 }}>
                {initials(pac.nombre, pac.apellido)}
              </div>
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: decColor, border: "2px solid #fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{pac.nombre} {pac.apellido}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: decBg, color: decColor }}>● {decLabel}</span>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{mkId(pac.id_paciente || idPaciente)}</span>
                {pac.edad && <span style={{ fontSize: 12, color: "#6b7280" }}>{pac.edad} años</span>}
                {pac.genero && <span style={{ fontSize: 12, color: "#6b7280" }}>{pac.genero}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => navigate(`/validacion`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <IcoEye /> Ver validación
              </button>
              <button onClick={descargarExpedienteWord} disabled={generandoExpWord} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: generandoExpWord ? "#9ca3af" : "#0b5d5b", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: generandoExpWord ? "default" : "pointer" }}>
                <IcoPrint /> {generandoExpWord ? "Generando..." : "Descargar Word"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => handleTabClick(t.toLowerCase())} style={{
                padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                color: tab === t.toLowerCase() ? "#0b5d5b" : "#6b7280",
                borderBottom: tab === t.toLowerCase() ? "2px solid #0b5d5b" : "2px solid transparent",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* ── Tab: General ── */}
        {tab === "general" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, padding: 20, alignItems: "start" }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Información General */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 22 }}>
                <h4 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Información General</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div><div style={lbl}>Nombre Completo</div><div style={val}>{pac.nombre} {pac.apellido}</div></div>
                  <div><div style={lbl}>Teléfono</div><div style={val}>{pac.telefono || "—"}</div></div>
                  <div><div style={lbl}>Fuente de Ingreso</div><div style={val}>{c?.fuente_ingreso || "—"}</div></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div><div style={lbl}>Dirección</div><div style={val}>{pac.direccion || "—"}</div></div>
                  <div><div style={lbl}>Fecha de Nacimiento</div><div style={val}>{fmtFecha(pac.fecha_nacimiento)}</div></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div><div style={lbl}>Estado Civil</div><div style={val}>{pac.estado_civil || "—"}</div></div>
                  <div><div style={lbl}>Escolaridad</div><div style={val}>{pac.escolaridad || "—"}</div></div>
                  <div><div style={lbl}>Ocupación</div><div style={val}>{pac.ocupacion || "—"}</div></div>
                </div>
                {(pac.orientacion_sexual || pac.grupos_vulnerables) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                    {pac.orientacion_sexual && <div><div style={lbl}>Orientación Sexual</div><div style={val}>{pac.orientacion_sexual}</div></div>}
                    {pac.grupos_vulnerables && <div><div style={lbl}>Grupos Vulnerables</div><div style={val}>{pac.grupos_vulnerables}</div></div>}
                  </div>
                )}
              </div>

              {/* Familiar de Contacto */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>👨‍👩‍👧</div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Familiar / Contacto de Emergencia</h4>
                  {!fam && <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>No registrado</span>}
                </div>
                {fam ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                    <div><div style={lbl}>Nombre Completo</div><div style={val}>{fam.nombre || "—"}</div></div>
                    <div><div style={lbl}>Parentesco</div><div style={val}>{fam.parentesco || "—"}</div></div>
                    <div><div style={lbl}>Teléfono</div><div style={val}>{fam.telefono || "—"}</div></div>
                    {fam.direccion && <div style={{ gridColumn: "1 / -1" }}><div style={lbl}>Dirección</div><div style={val}>{fam.direccion}</div></div>}
                  </div>
                ) : (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No se registró familiar o contacto de emergencia</div>
                )}
              </div>

              {/* Línea de Vida */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 22 }}>
                <h4 style={{ margin: "0 0 24px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Línea de Vida del Proceso</h4>
                <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
                  <div style={{ position: "absolute", top: 15, left: "12%", right: "12%", height: 3, background: "#e5e7eb", zIndex: 0 }} />
                  <div style={{ position: "absolute", top: 15, left: "12%", width: `${Math.max(0, (pasos.filter(p => p.done).length - 1)) / 3 * 76}%`, height: 3, background: "#0b5d5b", zIndex: 1 }} />
                  {pasos.map((paso, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 2 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", margin: "0 auto 10px", background: paso.done ? "#0b5d5b" : "#fff", color: paso.done ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, border: paso.done ? "none" : "2px solid #d1d5db", boxShadow: paso.done ? "0 0 0 3px #e6f4f3" : "none" }}>
                        {paso.done ? "✓" : i + 1}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: paso.done ? "#0b5d5b" : "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>{paso.label}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>{paso.fecha}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximas Citas */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Próximas Citas</h4>
                  <button onClick={abrirModalCita} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Nueva cita</button>
                </div>
                {citasFuturas.length === 0 ? (
                  <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No hay citas programadas</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                        {["Fecha", "Hora", "Tipo de Cita", "Estado"].map((h, i) => (
                          <th key={i} style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {citasFuturas.map((ci, i) => {
                        const fmt = fmtCita(ci.fecha);
                        const est = ESTADO_CITA[ci.estado] || ESTADO_CITA.programada;
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                            <td style={{ padding: "8px" }}>{fmt.fecha}</td>
                            <td style={{ padding: "8px" }}>{fmt.hora}</td>
                            <td style={{ padding: "8px" }}>{ci.tipo || "—"}</td>
                            <td style={{ padding: "8px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: est.bg, color: est.color }}>{est.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Documentos */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>📁</span>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Documentos</h4>
                  {contratos.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: "#e6f4f3", color: "#0b5d5b" }}>+{contratos.length} preingreso</span>}
                </div>
                {documentos.map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < documentos.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{doc.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.nombre}</div>
                      <div style={{ fontSize: 11, color: doc.ok ? "#0b5d5b" : "#9ca3af", marginTop: 1 }}>{doc.status}</div>
                    </div>
                    {doc.ok && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => {
                          if (doc.wordTipo === "estudio" && onVerEstudio) return onVerEstudio(idPaciente);
                          if (doc.wordTipo === "cuestionario" && onVerCuestionario) return onVerCuestionario(idPaciente);
                          navigate(doc.verUrl);
                        }} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }} title="Ver"><IcoEye /></button>
                        <button onClick={() => doc.wordTipo === "cuestionario" ? descargarCuestionarioWord() : descargarDocumentoWord(doc.wordTipo)} disabled={!!generandoDoc || generandoWord} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#2563eb", display: "flex", alignItems: "center" }} title="Descargar Word"><IcoDl /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Documentos ── */}
        {tab === "documentos" && (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h4 style={{ margin: 0, color: "#111827", fontSize: 15 }}>Documentos del Proceso de Admisión</h4>
                {c && (
                  <button
                    onClick={descargarCuestionarioWord}
                    disabled={generandoWord}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", background: generandoWord ? "#9ca3af" : "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: generandoWord ? "default" : "pointer" }}
                  >
                    📄 {generandoWord ? "Generando..." : "Descargar Cuestionario Word"}
                  </button>
                )}
              </div>
              {documentos.map((doc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < documentos.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: 26 }}>{doc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{doc.nombre}</div>
                    <div style={{ fontSize: 12, color: doc.ok ? "#0b5d5b" : "#9ca3af", marginTop: 2 }}>{doc.status}</div>
                  </div>
                  {doc.ok ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => {
                          if (doc.wordTipo === "estudio" && onVerEstudio) return onVerEstudio(idPaciente);
                          if (doc.wordTipo === "cuestionario" && onVerCuestionario) return onVerCuestionario(idPaciente);
                          navigate(doc.verUrl);
                        }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff", border: "1px solid #0b5d5b", borderRadius: 8, color: "#0b5d5b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <IcoEye /> Ver
                      </button>
                      <button
                        onClick={() => doc.wordTipo === "cuestionario" ? descargarCuestionarioWord() : descargarDocumentoWord(doc.wordTipo)}
                        disabled={!!generandoDoc || generandoWord}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: (generandoDoc === doc.wordTipo || generandoWord) ? "#9ca3af" : "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                      >
                        📄 Word
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>No disponible</span>
                  )}
                </div>
              ))}
            </div>

            {/* Documentación de Preingreso (contratos subidos) */}
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 18 }}>📂</span>
                <h4 style={{ margin: 0, color: "#111827", fontSize: 15 }}>Documentación de Preingreso</h4>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: contratos.length > 0 ? "#e6f4f3" : "#f3f4f6", color: contratos.length > 0 ? "#0b5d5b" : "#9ca3af" }}>
                  {contratos.length} / 7 documentos
                </span>
              </div>
              {contratos.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                  No hay documentos de preingreso subidos aún
                </div>
              ) : (
                contratos.map((ct, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: i < contratos.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{TIPOS_CONTRATO[ct.tipo] || ct.tipo}</div>
                      <div style={{ fontSize: 11, color: "#0b5d5b", marginTop: 2 }}>
                        ✓ Subido · {ct.fecha ? new Date(String(ct.fecha).replace(/Z$/,'').replace(/\+.*/,'')).toLocaleDateString("es-MX") : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={`http://localhost:3000/uploads/contratos/${ct.contenido}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff", border: "1px solid #0b5d5b", borderRadius: 8, color: "#0b5d5b", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                      >
                        <IcoEye /> Ver
                      </a>
                      <a
                        href={`http://localhost:3000/uploads/contratos/${ct.contenido}`}
                        download
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#2563eb", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                      >
                        <IcoDl /> Descargar
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Estatus ── */}
        {tab === "estatus" && (() => {
          const estatus = dec?.decision === "rechazado" ? { bg: "#fff1f2", color: "#ef4444", label: "Rechazado", icon: "✗" }
            : dec?.decision === "aprobado"  ? { bg: "#e6f4f3", color: "#0b5d5b", label: "En Tratamiento", icon: "✓" }
            : v?.apto === 0                 ? { bg: "#fff7ed", color: "#d97706", label: "Requiere Revaloración", icon: "↺" }
            : v?.apto === 1                 ? { bg: "#eff6ff", color: "#2563eb", label: "En Espera de Decisión", icon: "⏳" }
            : c                             ? { bg: "#eff6ff", color: "#2563eb", label: "En Espera", icon: "⏳" }
            :                                 { bg: "#f3f4f6", color: "#6b7280", label: "Solicitante", icon: "○" };
          return (
          <div style={{ padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
              <h4 style={{ margin: "0 0 18px", color: "#111827", fontSize: 15 }}>Estatus del Paciente</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: estatus.bg, borderRadius: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: estatus.color }}>{estatus.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: estatus.color }}>{estatus.label}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{mkId(pac.id_paciente || idPaciente)} · {pac.nombre} {pac.apellido}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Cuestionario",  val: c ? "Completo" : "Pendiente", ok: !!c },
                  { label: "Val. Médica",   val: v ? (v.apto === 1 ? "Apto" : "No Apto") : "Pendiente", ok: v?.apto === 1, bad: v?.apto === 0 },
                  { label: "Decisión",      val: dec ? (dec.decision === "aprobado" ? "Aprobado" : "Rechazado") : "Pendiente", ok: dec?.decision === "aprobado", bad: dec?.decision === "rechazado" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.bad ? "#ef4444" : s.ok ? "#0b5d5b" : "#9ca3af" }}>{s.val}</div>
                  </div>
                ))}
              </div>
              {v?.observaciones && (
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>Observaciones Médicas</div>
                  <p style={{ fontSize: 13, color: "#374151", fontStyle: "italic", margin: 0 }}>"{v.observaciones}"</p>
                </div>
              )}
            </div>
          </div>
          );
        })()}

        {/* ── Tab: Citas ── */}
        {tab === "citas" && (
          <div style={{ padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h4 style={{ margin: 0, color: "#111827", fontSize: 15 }}>Agenda de Citas</h4>
                <button onClick={abrirModalCita} style={{ padding: "8px 16px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Nueva cita</button>
              </div>
              {citas.length === 0 ? (
                <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "48px 0" }}>No hay citas registradas para este paciente</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Fecha", "Hora", "Tipo", "Familiar", "Estado", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {citas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((ci, i) => {
                      const fmt = fmtCita(ci.fecha);
                      const est = ESTADO_CITA[ci.estado] || ESTADO_CITA.programada;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 12px" }}>{fmt.fecha}</td>
                          <td style={{ padding: "10px 12px" }}>{fmt.hora}</td>
                          <td style={{ padding: "10px 12px" }}>{ci.tipo || "—"}</td>
                          <td style={{ padding: "10px 12px", color: "#6b7280" }}>{ci.especialidad || "—"}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: est.bg, color: est.color }}>{est.label}</span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button onClick={() => abrirEditarCita(ci)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 600, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" }}>
                              <IcoEdit /> Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Áreas ── */}
        {tab === "áreas" && (
          <div style={{ padding: 20 }}>
            {cargandoCompleto ? (
              <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Cargando datos de áreas...</div>
            ) : !completo ? (
              <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>No se pudo cargar la información</div>
            ) : (
              <>
                {/* Botones de área - solo 3 */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {[
                    { id: "admisiones", label: "Admisiones", icon: "📋", color: "#0b5d5b", ok: !!(completo.cuestionario?.respuestas?.length) },
                    { id: "medico",     label: "Médico",     icon: "🩺", color: "#1d4ed8", ok: !!completo.valoracion },
                    { id: "clinico",    label: "Clínico",    icon: "🚐", color: "#374151", ok: !!completo.traslado },
                  ].map(a => (
                    <button key={a.id} onClick={() => setAreaSelec(a.id)} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 22px",
                      background: areaSelec === a.id ? a.color : "#fff",
                      color: areaSelec === a.id ? "#fff" : "#374151",
                      border: `1.5px solid ${areaSelec === a.id ? a.color : "#e5e7eb"}`,
                      borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                      <span>{a.icon}</span>
                      {a.label}
                      {a.ok && <span style={{ width: 7, height: 7, borderRadius: "50%", background: areaSelec === a.id ? "rgba(255,255,255,0.7)" : "#22c55e", flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>

                {/* Contenido por área */}

                {areaSelec === "admisiones" && (() => {
                  const resp = completo.cuestionario?.respuestas || [];
                  if (!resp.length) return <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 40, textAlign: "center", color: "#9ca3af" }}>Sin cuestionario de admisión</div>;
                  const SECS = { seguimiento: "Atención y Seguimiento", solicitante: "Datos del Solicitante", paciente: "Información del Paciente", valoracion: "Valoración Inicial", estatus: "Estatus y Programación" };
                  const byTipo = {};
                  resp.forEach(r => { const t = r.tipo || "otro"; if (!byTipo[t]) byTipo[t] = []; byTipo[t].push(r); });
                  return (
                    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                      <div style={{ background: "#0b5d5b", padding: "12px 20px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>📋 ADMISIONES — Cuestionario de Admisión</div>
                      </div>
                      <div style={{ padding: "18px 20px" }}>
                        {Object.entries(SECS).map(([tipo, titulo]) => {
                          const items = byTipo[tipo]; if (!items?.length) return null;
                          return (
                            <div key={tipo} style={{ marginBottom: 18 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#0b5d5b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, paddingBottom: 4, borderBottom: "2px solid #e6f4f3" }}>{titulo}</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                {items.map((r, i) => (
                                  <div key={i} style={{ paddingBottom: 6 }}>
                                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{r.pregunta}</div>
                                    <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>{r.respuesta || "—"}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {areaSelec === "medico" && (
                  <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <div style={{ background: "#1d4ed8", padding: "12px 20px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>🩺 MÉDICO — Valoración Médica de Ingreso</div>
                    </div>
                    {completo.valoracion ? (
                      <div style={{ padding: "18px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Resultado</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: completo.valoracion.apto === 1 ? "#0b5d5b" : completo.valoracion.apto === 0 ? "#ef4444" : "#9ca3af" }}>
                              {completo.valoracion.apto === 1 ? "✓ APTO" : completo.valoracion.apto === 0 ? "✗ NO APTO" : "Pendiente"}
                            </div>
                          </div>
                          {completo.valoracion.nombre_medico && <div><div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Médico</div><div style={{ fontSize: 13, color: "#374151" }}>{completo.valoracion.nombre_medico}</div></div>}
                          {completo.valoracion.fecha_valoracion && <div><div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Fecha</div><div style={{ fontSize: 13, color: "#374151" }}>{fmtLocal(completo.valoracion.fecha_valoracion)}</div></div>}
                        </div>
                        {completo.valoracion.observaciones && <div><div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Observaciones</div><div style={{ fontSize: 13, color: "#374151", background: "#eff6ff", padding: "10px 14px", borderRadius: 8, fontStyle: "italic" }}>"{completo.valoracion.observaciones}"</div></div>}
                      </div>
                    ) : <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Sin valoración médica registrada</div>}
                  </div>
                )}

                {areaSelec === "clinico" && (
                  <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <div style={{ background: "#374151", padding: "12px 20px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>🚐 CLÍNICO — Traslado e Inventario</div>
                    </div>
                    {completo.traslado ? (
                      <div style={{ padding: "18px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                          <div><div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Sustancias al ingresar</div><div style={{ fontSize: 13, color: completo.traslado.tiene_sustancias ? "#ef4444" : "#0b5d5b", fontWeight: 600 }}>{completo.traslado.tiene_sustancias ? "Sí" : "No"}</div></div>
                          {completo.traslado.descripcion_sustancias && <div><div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Descripción</div><div style={{ fontSize: 13, color: "#374151" }}>{completo.traslado.descripcion_sustancias}</div></div>}
                          {completo.traslado.observaciones && <div style={{ gridColumn: "1 / -1" }}><div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Observaciones</div><div style={{ fontSize: 13, color: "#374151", background: "#f9fafb", padding: "10px 14px", borderRadius: 8 }}>{completo.traslado.observaciones}</div></div>}
                        </div>
                        {/* Inventario */}
                        {(() => {
                          let inv = [];
                          try { inv = JSON.parse(completo.traslado.inventario_json || "[]").filter(r => r.articulo); } catch {}
                          return inv.length > 0 ? (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", marginBottom: 8 }}>Inventario de Pertenencias</div>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead><tr style={{ background: "#f9fafb" }}>{["#","Artículo","Cantidad","Observaciones"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>)}</tr></thead>
                                <tbody>{inv.map((row, i) => <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}><td style={{ padding: "8px 10px", color: "#9ca3af" }}>{i+1}</td><td style={{ padding: "8px 10px", fontWeight: 500 }}>{row.articulo}</td><td style={{ padding: "8px 10px" }}>{row.cantidad}</td><td style={{ padding: "8px 10px", color: "#6b7280" }}>{row.observaciones || "—"}</td></tr>)}</tbody>
                              </table>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    ) : <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Sin traslado registrado aún</div>}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {/* ── MODAL: Nueva Cita ── */}
      {modalCita && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 460, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Nueva Cita</h4>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{pac.nombre} {pac.apellido}</div>
              </div>
              <button onClick={() => setModalCita(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><IcoX /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Familiar que agenda</label>
              <input
                placeholder="Nombre del familiar..."
                value={citaFamiliar}
                onChange={e => setCitaFamiliar(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
              />
              {fam?.nombre && citaFamiliar !== fam.nombre && (
                <button onClick={() => setCitaFamiliar(fam.nombre)} style={{ marginTop: 4, fontSize: 11, color: "#0b5d5b", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Usar datos registrados: {fam.nombre}
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Fecha *</label>
                <input type="date" value={citaFecha} onChange={e => setCitaFecha(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hora *</label>
                <input type="time" value={citaHora} onChange={e => setCitaHora(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Tipo de cita *</label>
              <select value={citaTipo} onChange={e => setCitaTipo(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}>
                <option value="">Seleccionar tipo...</option>
                {TIPOS_CITA.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Notas (opcional)</label>
              <textarea value={citaNotas} onChange={e => setCitaNotas(e.target.value)} rows={2} placeholder="Observaciones..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
              Duración: <strong>2 horas</strong> · Estado inicial: <strong>Programada</strong>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModalCita(false)} style={{ padding: "8px 20px", background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={crearCita} disabled={guardandoCita} style={{ padding: "8px 20px", background: guardandoCita ? "#9ca3af" : "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: guardandoCita ? "default" : "pointer" }}>
                {guardandoCita ? "Guardando..." : "Crear Cita"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Editar Cita ── */}
      {modalEditCita && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 440, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Editar Cita</h4>
              <button onClick={() => setModalEditCita(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><IcoX /></button>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: "#111827" }}>{modalEditCita.tipo || "Sin tipo"}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>{fmtCita(modalEditCita.fecha).fecha} {fmtCita(modalEditCita.fecha).hora}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Fecha</label>
                <input type="date" value={editFecha} onChange={e => setEditFecha(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hora</label>
                <input type="time" value={editHora} onChange={e => setEditHora(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Estado</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["programada","Programada","#eff6ff","#2563eb"],["asistio","Asistió","#e6f4f3","#0b5d5b"],["cancelada","Cancelada","#fff1f2","#ef4444"],["reprogramada","Reprogramada","#fff7ed","#d97706"]].map(([v, label, bg, color]) => (
                  <button key={v} onClick={() => setEditEstado(v)} style={{ padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: editEstado === v ? bg : "#f9fafb", color: editEstado === v ? color : "#6b7280", border: `2px solid ${editEstado === v ? color : "#e5e7eb"}` }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Notas</label>
              <textarea value={editNotas} onChange={e => setEditNotas(e.target.value)} rows={2} placeholder="Motivo de cambio, observaciones..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModalEditCita(null)} style={{ padding: "8px 20px", background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarEditCita} disabled={guardandoEdit} style={{ padding: "8px 20px", background: guardandoEdit ? "#9ca3af" : "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: guardandoEdit ? "default" : "pointer" }}>
                {guardandoEdit ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
  </>);
}
