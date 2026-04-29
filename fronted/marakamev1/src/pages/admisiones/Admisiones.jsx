import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admisiones.css";

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
    hora: `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")} AM`,
  };
};

const initiales = (nombre = "", apellido = "") =>
  `${(nombre[0] || "").toUpperCase()}${(apellido[0] || "").toUpperCase()}`;

export default function Admisiones() {
  const navigate  = useNavigate();
  const usuario   = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [pacientes, setPacientes]     = useState([]);
  const [citas, setCitas]             = useState([]);
  const [citaPage, setCitaPage]       = useState(0);
  const [busqueda, setBusqueda]       = useState("");
  const [cargando, setCargando]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/pacientes-admision").then(r => r.json()).catch(() => []),
      fetch("http://localhost:3000/citas").then(r => r.json()).catch(() => []),
    ]).then(([pacs, cts]) => {
      setPacientes(Array.isArray(pacs) ? pacs : []);
      setCitas(Array.isArray(cts) ? cts : []);
      setCargando(false);
    });
  }, []);

  /* ── Derived stats ─────────────────────── */
  const totalPac  = pacientes.length;
  const rechazados= pacientes.filter(p => p.decision === "rechazado").length;
  const pendEstudio = pacientes.filter(p => p.apto === 1 && p.estudio_status !== "enviado");

  const now = new Date();
  const proximasCitas = citas
    .filter(c => c.fecha && new Date(c.fecha) >= now)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const ITEMS_PER_PAGE = 3;
  const citasPage = proximasCitas.slice(citaPage * ITEMS_PER_PAGE, (citaPage + 1) * ITEMS_PER_PAGE);
  const maxPage   = Math.ceil(proximasCitas.length / ITEMS_PER_PAGE) - 1;

  /* ── Chart bars (last 6 months mock relative to real count) ── */
  const bars = [
    { label: "Oct", total: Math.max(1, totalPac), aprobados: Math.max(1, totalPac - rechazados - 3), rechazados: rechazados, proceso: 3 },
    { label: "Nov", total: Math.max(1, totalPac + 2), aprobados: Math.max(1, totalPac - 2), rechazados: 1, proceso: 2 },
    { label: "Dic", total: Math.max(1, totalPac - 1), aprobados: Math.max(1, totalPac - 4), rechazados: 2, proceso: 1 },
    { label: "Ene", total: Math.max(1, totalPac + 1), aprobados: Math.max(1, totalPac - 1), rechazados: 1, proceso: 2 },
    { label: "Feb", total: Math.max(1, totalPac + 3), aprobados: Math.max(1, totalPac), rechazados: 2, proceso: 3 },
    { label: "Mar", total: Math.max(1, totalPac + 5), aprobados: Math.max(1, totalPac + 1), rechazados: rechazados, proceso: 2 },
  ];
  const maxBar = Math.max(...bars.map(b => b.total));

  const BADGE_ESTADO = {
    programada:   ["#eff6ff","#2563eb","Programada"],
    asistio:      ["#e6f4f3","#0b5d5b","Asistió"],
    cancelada:    ["#fff1f2","#ef4444","Cancelada"],
    reprogramada: ["#fff7ed","#d97706","Reprogramada"],
  };

  const sidebar = (
    <div className="adm-sidebar">
      <div className="adm-sidebar-top">
        <h2>MARAKAME</h2>
        <p className="user">ADMISIONES: {usuario.nombre || "Diego"}</p>
      </div>
      <nav>
        <ul>
          <li className="active" onClick={() => navigate("/admisiones")}><IcoGrid />Inicio</li>
          <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
          <li onClick={() => navigate("/pacientes")}><IcoUsers />Pacientes</li>
          <li onClick={() => navigate("/registro")}><IcoUser />Agregar Paciente</li>
          <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
          <li onClick={() => navigate("/estudio")}><IcoMoney />Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
          <li onClick={() => navigate("/preingreso")}><IcoDoc />Preingreso</li>
          <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
        </ul>
      </nav>
      <div className="adm-sidebar-bottom">
        <button className="adm-btn" onClick={() => navigate("/registro")}>
          ⊕ Registro de Paciente
        </button>
        <div className="adm-sidebar-links">
          <span><IcoSettings /> Settings</span>
          <span><IcoHelp /> Help</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {sidebar}

      <div className="main">
        {/* ── Topbar ─────────────────────────── */}
        <div className="adm-topbar">
          <h3>Inicio de Admisiones</h3>
          <div className="adm-topbar-right">
            <div className="adm-search">
              <IcoSearch />
              <input
                placeholder="Buscador"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <div className="adm-topbar-icon"><IcoBell /></div>
            <div className="adm-avatar">
              {(usuario.nombre || "D")[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div className="adm-body">
          {/* ── Stat cards ────────────────────── */}
          <div className="adm-stats">
            {[
              { label: "Pacientes Totales",     val: totalPac,   trend: "+1%", dir: "up" },
              { label: "Solicitudes Recibidas", val: totalPac,   trend: "+1%", dir: "up" },
              { label: "Solicitudes Rechazadas",val: rechazados, trend: rechazados > 0 ? "+1%" : "—", dir: rechazados > 0 ? "down" : "neu" },
            ].map((s, i) => (
              <div key={i} className="adm-stat-card">
                <span className={`adm-stat-trend ${s.dir}`}>
                  {s.dir === "up" ? "↑" : s.dir === "down" ? "↓" : ""} {s.trend} <span style={{ fontWeight: 400, opacity: .7 }}>vs ayer</span>
                </span>
                <span className="adm-stat-label">{s.label}</span>
                <span className="adm-stat-num">{cargando ? "…" : s.val}</span>
              </div>
            ))}
          </div>

          {/* ── Middle ────────────────────────── */}
          <div className="adm-mid">
            {/* Chart */}
            <div className="adm-chart-card">
              <div className="adm-chart-header">
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .4, marginBottom: 2 }}>ADMISIONES</div>
                  <h4>Admisiones</h4>
                </div>
                <span className="adm-period-badge">Últimos 6 meses</span>
              </div>
              <div className="adm-bars-wrap">
                {bars.map((b, i) => (
                  <div key={i} className="adm-bar-group">
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", width: "100%", gap: 2 }}>
                      <div className="adm-bar-block" style={{ background: "#9ca3af", height: `${(b.total / maxBar) * 90}%` }}>
                        {b.total > 0 && <span>{b.total}</span>}
                      </div>
                    </div>
                    <span className="adm-bar-x">{b.label}</span>
                  </div>
                ))}
              </div>
              <div className="adm-legend">
                {[["#9ca3af","Solicitudes totales"],["#0b5d5b","En proceso"],["#4ade80","Aprobados"],["#ef4444","Rechazados"]].map(([c,l])=>(
                  <div key={l} className="adm-legend-item"><div className="adm-legend-dot" style={{background:c}}/>{l}</div>
                ))}
              </div>
            </div>

            {/* Right stack */}
            <div className="adm-right-stack">
              <div className="adm-pending-card">
                <div className="adm-pending-label">PENDIENTES</div>
                <div className="adm-pending-num">{cargando ? "…" : pendEstudio.length}</div>
                <div className="adm-pending-title">EVALUACIONES</div>
                <div className="adm-pending-sub">
                  ESTUDIO SOCIOECONÓMICO · FALTAN {cargando ? "…" : pendEstudio.length}
                </div>
                <button className="adm-pending-btn" onClick={() => navigate("/estudio")}>
                  Revisar Ahora
                </button>
              </div>

              <div className="adm-eficacia-card">
                <div className="adm-eficacia-top">
                  <span className="adm-eficacia-label">EFICACIA</span>
                  <span className="adm-eficacia-pct">+12%</span>
                </div>
                <div className="adm-eficacia-title">Velocidad Admisión</div>
                <div className="adm-eficacia-sub">Promedio: 2.4 Días</div>
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
                  <div key={i} className="adm-cita-item">
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
                <button className="adm-section-link" onClick={() => navigate("/estudio")}>Ver todos</button>
              </div>

              {cargando ? (
                <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Cargando...</div>
              ) : pendEstudio.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No hay estudios pendientes</div>
              ) : pendEstudio.slice(0, 5).map((p, i) => {
                const progress = p.id_estudio ? 60 : 0;
                const dotColor = p.id_estudio ? "#d97706" : "#9ca3af";
                return (
                  <div key={i} className="adm-est-item" onClick={() => navigate(`/estudio?id=${p.id_paciente}`)}>
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
