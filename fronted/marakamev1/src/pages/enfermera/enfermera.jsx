import { useState, useEffect } from "react";
import {
  obtenerEstadisticas,
  obtenerPacientesRecientes,
  obtenerTareasPendientes,
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas
} from "../../services/medicoService";
import Pacientes from "../medico/Pacientes";
import Expediente from "../medico/Expediente";
import Diagnostico from "../medico/Diagnostico";
import Indicaciones from "../medico/Indicaciones";
import Desintoxicacion from "../medico/Desintoxicacion";
import Evolucion from "../medico/Evolucion";
import Laboratorio from "../medico/Laboratorio";
import IndicacionesEnfermera from "./IndicacionesEnfermera";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .enf-app { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #f4f6f9; color: #1a1a2e; }

  .enf-sidebar {
    width: 200px;
    background: #4c1d95;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
  }

  .enf-sidebar-header { padding: 52px 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
  .enf-sidebar-header h2 { color: #fff; font-size: 14px; font-weight: 700; }
  .enf-sidebar-header p { color: rgba(255,255,255,0.45); font-size: 11px; margin-top: 2px; }

  .enf-nav { flex: 1; padding: 12px 0; overflow-y: auto; min-height: 0; }

  .enf-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
  .enf-nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .enf-nav-item.active { background: rgba(167,139,250,0.2); color: #c4b5fd; border-left: 3px solid #7c3aed; }
  .enf-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }

  .enf-sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
  .enf-sidebar-footer-user { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .enf-avatar { width: 34px; height: 34px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .enf-sidebar-footer-info h4 { color: #fff; font-size: 12px; font-weight: 600; }
  .enf-sidebar-footer-info p { color: rgba(255,255,255,0.4); font-size: 10px; }

  .enf-logout-btn { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: rgba(255,255,255,0.6); font-size: 12px; cursor: pointer; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-family: 'Inter', sans-serif; width: 100%; transition: all 0.15s; }
  .enf-logout-btn:hover { background: rgba(239,68,68,0.25); color: #fca5a5; border-color: rgba(239,68,68,0.4); }
  .enf-logout-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

  .enf-topbar { background: #4c1d95; position: fixed; top: 0; left: 0; right: 0; height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 200; }
  .enf-topbar span { color: rgba(255,255,255,0.5); font-size: 11px; }

  .enf-main { margin-left: 200px; flex: 1; padding: 28px 32px; margin-top: 36px; }
  .enf-page-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .enf-page-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; }

  .enf-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
  .enf-stat-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
  .enf-stat-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .enf-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .enf-stat-icon.purple { background: #ede9fe; color: #7c3aed; }
  .enf-stat-icon.green { background: #f0fdf4; color: #22c55e; }
  .enf-stat-icon.red { background: #fff1f2; color: #ef4444; }
  .enf-stat-icon.orange { background: #fff7ed; color: #f97316; }
  .enf-stat-number { font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px; }
  .enf-stat-label { font-size: 12px; color: #6b7280; margin-top: 2px; }

  .enf-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .enf-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
  .enf-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .enf-card-title { font-size: 15px; font-weight: 600; color: #111827; }
  .enf-card-action { font-size: 12px; color: #7c3aed; cursor: pointer; font-weight: 500; }
  .enf-card-badge { font-size: 12px; color: #6b7280; }

  .enf-patient-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
  .enf-patient-item:last-child { border-bottom: none; }
  .enf-patient-name { font-size: 14px; font-weight: 600; color: #111827; }
  .enf-patient-status { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .enf-patient-days { font-size: 13px; font-weight: 600; color: #111827; }
  .enf-patient-exp { font-size: 11px; color: #9ca3af; margin-top: 1px; }

  .enf-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
  .enf-badge.urgente { background: #fff1f2; color: #ef4444; }
  .enf-badge.normal { background: #fef9c3; color: #ca8a04; }

  .enf-task-item { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
  .enf-task-item:last-child { border-bottom: none; }
  .enf-task-name { font-size: 13px; color: #374151; margin-bottom: 5px; font-weight: 500; }

  .enf-empty { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
  .enf-loading { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }

  .enf-notif-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
  .enf-notif-btn svg { width: 18px; height: 18px; color: rgba(255,255,255,0.6); }
  .enf-notif-btn:hover svg { color: #fff; }
  .enf-notif-counter { position: absolute; top: -2px; right: -2px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

  .enf-notif-panel { position: fixed; top: 36px; right: 0; width: 360px; height: calc(100vh - 36px); background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.12); z-index: 300; display: flex; flex-direction: column; border-left: 1px solid #e5e7eb; }
  .enf-notif-panel-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
  .enf-notif-panel-title { font-size: 15px; font-weight: 600; color: #111827; }
  .enf-notif-panel-actions { display: flex; align-items: center; gap: 10px; }
  .enf-notif-marcar-todas { font-size: 11px; color: #7c3aed; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; font-weight: 500; }
  .enf-notif-close { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 18px; line-height: 1; }
  .enf-notif-list { flex: 1; overflow-y: auto; }
  .enf-notif-item { padding: 14px 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; display: flex; gap: 12px; align-items: flex-start; }
  .enf-notif-item:hover { background: #f9fafb; }
  .enf-notif-item.no-leida { background: #f5f3ff; border-left: 3px solid #7c3aed; }
  .enf-notif-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; background: #ede9fe; }
  .enf-notif-msg { font-size: 13px; color: #374151; line-height: 1.4; }
  .enf-notif-fecha { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .enf-notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #7c3aed; flex-shrink: 0; margin-top: 4px; }
  .enf-notif-empty { text-align: center; padding: 48px 20px; color: #9ca3af; font-size: 13px; }
  .enf-notif-overlay { position: fixed; inset: 0; z-index: 250; }
`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Inicio", icon: "chart" },
  { id: "pacientes", label: "Pacientes", icon: "users" },
  { id: "administracion", label: "Administración Meds", icon: "syringe" },
  { id: "diagnostico", label: "Diagnóstico", icon: "file" },
  { id: "indicaciones", label: "Indicaciones", icon: "pill" },
  { id: "desintoxicacion", label: "Desintoxicación", icon: "drop" },
  { id: "evolucion", label: "Evolución", icon: "activity" },
  { id: "laboratorio", label: "Laboratorio", icon: "flask" },
];

const ICONS = {
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  pill: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2"/><circle cx="18" cy="18" r="4"/><path d="m15.5 15.5 5 5"/></svg>,
  syringe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>,
  drop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  flask: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6l1 9H8L9 3z"/><path d="M6.5 21a5 5 0 0 0 11 0c0-3-2.5-5.5-5.5-8.5C9 15.5 6.5 18 6.5 21z"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

function formatFecha(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  const ahora = new Date();
  const diff = Math.floor((ahora - d) / 1000 / 60);
  if (diff < 1) return "Ahora mismo";
  if (diff < 60) return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString();
}

export default function Enfermera() {
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [pacientesRecientes, setPacientesRecientes] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUsuario(u);
    cargarDashboard();
    if (u?.id_usuario) cargarNotificaciones(u.id_usuario);
  }, []);

  useEffect(() => {
    if (!usuario?.id_usuario) return;
    const interval = setInterval(() => cargarNotificaciones(usuario.id_usuario), 60000);
    return () => clearInterval(interval);
  }, [usuario]);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      const [stats, pacientes, tareas] = await Promise.all([
        obtenerEstadisticas(),
        obtenerPacientesRecientes(),
        obtenerTareasPendientes()
      ]);
      setEstadisticas(stats);
      setPacientesRecientes(pacientes);
      setTareasPendientes(tareas);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const cargarNotificaciones = async (id) => {
    try {
      const data = await obtenerNotificaciones(id);
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleMarcarLeida = async (notif) => {
    if (notif.leida) return;
    await marcarNotificacionLeida(notif.id_notificacion);
    setNotificaciones(prev => prev.map(n => n.id_notificacion === notif.id_notificacion ? { ...n, leida: 1 } : n));
  };

  const handleMarcarTodas = async () => {
    if (!usuario?.id_usuario) return;
    await marcarTodasLeidas(usuario.id_usuario);
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: 1 })));
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "EN";

  const handleNav = (id) => {
    setSeccionActiva(id);
    if (!["expediente"].includes(id)) setPacienteActivo(null);
  };

  const handleVerExpediente = (id) => {
    setPacienteActivo(id);
    setSeccionActiva("expediente");
  };

  const getLabel = () => NAV_ITEMS.find(n => n.id === seccionActiva)?.label || "Inicio";

  return (
    <>
      <style>{styles}</style>
      <div className="enf-app">

        {panelAbierto && <div className="enf-notif-overlay" onClick={() => setPanelAbierto(false)} />}

        <div className="enf-topbar">
          <span>{seccionActiva === "expediente" ? "Expediente" : getLabel()}</span>
          <button className="enf-notif-btn" onClick={() => setPanelAbierto(!panelAbierto)}>
            {ICONS.bell}
            {noLeidas > 0 && <span className="enf-notif-counter">{noLeidas > 9 ? "9+" : noLeidas}</span>}
          </button>
        </div>

        {panelAbierto && (
          <div className="enf-notif-panel">
            <div className="enf-notif-panel-header">
              <span className="enf-notif-panel-title">🔔 Notificaciones {noLeidas > 0 && <span style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700 }}>({noLeidas} nuevas)</span>}</span>
              <div className="enf-notif-panel-actions">
                {noLeidas > 0 && <button className="enf-notif-marcar-todas" onClick={handleMarcarTodas}>Marcar todas como leídas</button>}
                <button className="enf-notif-close" onClick={() => setPanelAbierto(false)}>✕</button>
              </div>
            </div>
            <div className="enf-notif-list">
              {notificaciones.length === 0 ? (
                <div className="enf-notif-empty"><div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>No tienes notificaciones</div>
              ) : notificaciones.map((n, i) => (
                <div key={i} className={`enf-notif-item ${!n.leida ? "no-leida" : ""}`} onClick={() => handleMarcarLeida(n)}>
                  <div className="enf-notif-icon">🔔</div>
                  <div style={{ flex: 1 }}>
                    <div className="enf-notif-msg">{n.mensaje}</div>
                    <div className="enf-notif-fecha">{formatFecha(n.fecha)}</div>
                  </div>
                  {!n.leida && <div className="enf-notif-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}

        <aside className="enf-sidebar">
          <div className="enf-sidebar-header">
            <h2>Sistema Enfermería</h2>
            <p>{usuario?.nombre || "Enfermera"} · Área Médica</p>
          </div>
          <nav className="enf-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`enf-nav-item ${seccionActiva === item.id ? "active" : ""}`} onClick={() => handleNav(item.id)}>
                {ICONS[item.icon]}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="enf-sidebar-footer">
            <div className="enf-sidebar-footer-user">
              <div className="enf-avatar">{iniciales}</div>
              <div className="enf-sidebar-footer-info">
                <h4>{usuario?.nombre || "Enfermera"}</h4>
                <p>Enfermera</p>
              </div>
            </div>
            <button className="enf-logout-btn" onClick={handleCerrarSesion}>
              {ICONS.logout}
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="enf-main">
          {seccionActiva === "dashboard" && (
            <>
              <h1 className="enf-page-title">Inicio Enfermería</h1>
              <p className="enf-page-subtitle">Vista general del turno</p>
              <div className="enf-stats-grid">
                {[
                  { label: "Total Pacientes", value: estadisticas?.total_pacientes ?? 0, iconKey: "users", iconClass: "purple" },
                  { label: "En Tratamiento", value: estadisticas?.en_tratamiento ?? 0, iconKey: "activity", iconClass: "green" },
                  { label: "En Desintoxicación", value: estadisticas?.en_desintoxicacion ?? 0, iconKey: "drop", iconClass: "red" },
                  { label: "Valoraciones Pendientes", value: estadisticas?.valoraciones_pendientes ?? 0, iconKey: "chart", iconClass: "orange" },
                ].map((s, i) => (
                  <div className="enf-stat-card" key={i}>
                    <div className="enf-stat-card-header">
                      <div className={`enf-stat-icon ${s.iconClass}`}>{ICONS[s.iconKey]}</div>
                    </div>
                    <div className="enf-stat-number">{cargando ? "—" : s.value}</div>
                    <div className="enf-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="enf-two-col">
                <div className="enf-card">
                  <div className="enf-card-header">
                    <span className="enf-card-title">Pacientes Recientes</span>
                    <span className="enf-card-action" onClick={() => handleNav("pacientes")}>Ver todos</span>
                  </div>
                  {cargando ? <div className="enf-loading">Cargando...</div>
                    : pacientesRecientes.length === 0 ? <div className="enf-empty">No hay pacientes aún</div>
                    : pacientesRecientes.map((p, i) => (
                      <div className="enf-patient-item" key={i} onClick={() => handleVerExpediente(p.id_paciente)}>
                        <div>
                          <div className="enf-patient-name">{p.nombre} {p.apellido}</div>
                          <div className="enf-patient-status">{p.estado || "Sin estado"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="enf-patient-days">{p.dias_tratamiento ?? 0} días</div>
                          <div className="enf-patient-exp">Expediente {String(p.id_expediente || "—").padStart(3, "0")}</div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="enf-card">
                  <div className="enf-card-header">
                    <span className="enf-card-title">Tareas Pendientes</span>
                    <span className="enf-card-badge">{tareasPendientes.length} pendientes</span>
                  </div>
                  {cargando ? <div className="enf-loading">Cargando...</div>
                    : tareasPendientes.length === 0 ? <div className="enf-empty">No hay tareas pendientes</div>
                    : tareasPendientes.map((t, i) => (
                      <div className="enf-task-item" key={i}>
                        <div className="enf-task-name">{t.descripcion} - {t.paciente}</div>
                        <span className={`enf-badge ${t.prioridad}`}>{t.prioridad === "urgente" ? "Urgente" : "Normal"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {seccionActiva === "pacientes" && <Pacientes onVerExpediente={handleVerExpediente} />}
          {seccionActiva === "expediente" && pacienteActivo && <Expediente id_paciente={pacienteActivo} onVolver={() => setSeccionActiva("pacientes")} onNavegar={handleNav} />}
          {seccionActiva === "administracion" && <IndicacionesEnfermera usuario={usuario} />}
          {seccionActiva === "diagnostico" && <Diagnostico rol="enfermera" />}
          {seccionActiva === "indicaciones" && <Indicaciones rol="enfermera" />}
          {seccionActiva === "desintoxicacion" && <Desintoxicacion rol="enfermera" />}
          {seccionActiva === "evolucion" && <Evolucion rol="enfermera" />}
          {seccionActiva === "laboratorio" && <Laboratorio rol="enfermera" />}
        </main>
      </div>
    </>
  );
}