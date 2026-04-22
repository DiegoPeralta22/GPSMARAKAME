import { useState, useEffect } from "react";
import {
  obtenerEstadisticas,
  obtenerPacientesRecientes,
  obtenerTareasPendientes
} from "../../services/medicoService";
import Pacientes from "./Pacientes";
import Expediente from "./Expediente";
import Valoracion from "./Valoracion";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .med-app { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #f4f6f9; color: #1a1a2e; }
  .med-sidebar { width: 200px; min-height: 100vh; background: #1a1a2e; display: flex; flex-direction: column; padding: 20px 0; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
  .med-sidebar-header { padding: 0 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .med-sidebar-header h2 { color: #fff; font-size: 14px; font-weight: 700; }
  .med-sidebar-header p { color: rgba(255,255,255,0.45); font-size: 11px; margin-top: 2px; }
  .med-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .med-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
  .med-nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .med-nav-item.active { background: rgba(59,130,246,0.18); color: #60a5fa; border-left: 3px solid #3b82f6; }
  .med-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .med-sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px; }
  .med-avatar { width: 34px; height: 34px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .med-sidebar-footer-info h4 { color: #fff; font-size: 12px; font-weight: 600; }
  .med-sidebar-footer-info p { color: rgba(255,255,255,0.4); font-size: 10px; }
  .med-topbar { background: #111827; position: fixed; top: 0; left: 0; right: 0; height: 36px; display: flex; align-items: center; padding: 0 16px; z-index: 200; }
  .med-topbar span { color: rgba(255,255,255,0.5); font-size: 11px; }
  .med-main { margin-left: 200px; flex: 1; padding: 28px 32px; margin-top: 36px; }
  .med-page-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .med-page-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .med-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
  .med-stat-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
  .med-stat-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .med-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .med-stat-icon.blue { background: #eff6ff; color: #3b82f6; }
  .med-stat-icon.green { background: #f0fdf4; color: #22c55e; }
  .med-stat-icon.red { background: #fff1f2; color: #ef4444; }
  .med-stat-icon.orange { background: #fff7ed; color: #f97316; }
  .med-stat-number { font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px; }
  .med-stat-label { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .med-two-col { display: grid; grid-template-columns: 1fr 380px; gap: 16px; margin-bottom: 16px; }
  .med-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
  .med-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .med-card-title { font-size: 15px; font-weight: 600; color: #111827; }
  .med-card-action { font-size: 12px; color: #3b82f6; cursor: pointer; font-weight: 500; }
  .med-card-badge { font-size: 12px; color: #6b7280; }
  .med-patient-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
  .med-patient-item:last-child { border-bottom: none; }
  .med-patient-name { font-size: 14px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; }
  .med-patient-status { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .med-patient-meta { text-align: right; }
  .med-patient-days { font-size: 13px; font-weight: 600; color: #111827; }
  .med-patient-exp { font-size: 11px; color: #9ca3af; margin-top: 1px; }
  .med-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
  .med-badge.urgente { background: #fff1f2; color: #ef4444; }
  .med-badge.normal { background: #fef9c3; color: #ca8a04; }
  .med-task-item { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
  .med-task-item:last-child { border-bottom: none; }
  .med-task-name { font-size: 13px; color: #374151; margin-bottom: 5px; font-weight: 500; }
  .med-actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
  .med-action-btn { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif; }
  .med-action-btn:hover { border-color: #3b82f6; background: #eff6ff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.12); }
  .med-action-btn svg { width: 20px; height: 20px; color: #3b82f6; }
  .med-action-label { font-size: 12px; color: #374151; font-weight: 500; text-align: center; }
  .med-empty { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
  .med-loading { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "chart" },
  { id: "pacientes", label: "Pacientes", icon: "users" },
  { id: "valoracion", label: "Valoración", icon: "heart" },
  { id: "diagnostico", label: "Diagnóstico", icon: "file" },
  { id: "indicaciones", label: "Indicaciones", icon: "pill" },
  { id: "desintoxicacion", label: "Desintoxicación", icon: "drop" },
  { id: "evolucion", label: "Evolución", icon: "activity" },
  { id: "laboratorio", label: "Laboratorio", icon: "flask" },
  { id: "actividades", label: "Actividades", icon: "calendar" },
];

const ICONS = {
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  pill: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2"/><circle cx="18" cy="18" r="4"/><path d="m15.5 15.5 5 5"/></svg>,
  drop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  flask: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6l1 9H8L9 3z"/><path d="M6.5 21a5 5 0 0 0 11 0c0-3-2.5-5.5-5.5-8.5C9 15.5 6.5 18 6.5 21z"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

export default function Medico() {
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [pacientesRecientes, setPacientesRecientes] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [pacienteInfo, setPacienteInfo] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUsuario(u);
    cargarDashboard();
  }, []);

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
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "JV";

  const handleNav = (id) => {
    setSeccionActiva(id);
    if (!["expediente", "valoracion", "diagnostico", "indicaciones", "desintoxicacion", "evolucion", "laboratorio", "actividades"].includes(id)) {
      setPacienteActivo(null);
      setPacienteInfo(null);
    }
  };

  const handleVerExpediente = (id, info = null) => {
    setPacienteActivo(id);
    if (info) setPacienteInfo(info);
    setSeccionActiva("expediente");
  };

  const rol = usuario?.rol || "medico";

  return (
    <>
      <style>{styles}</style>
      <div className="med-app">
        <div className="med-topbar">
          <span>
            {seccionActiva === "expediente" ? "Expediente" :
             seccionActiva === "valoracion" ? "Valoración Médica" :
             NAV_ITEMS.find(n => n.id === seccionActiva)?.label || "Dashboard"}
          </span>
        </div>

        <aside className="med-sidebar">
          <div className="med-sidebar-header" style={{ marginTop: 36 }}>
            <h2>Sistema Médico</h2>
            <p>{usuario?.nombre || "Dr. Javier"} · Control Clínico</p>
          </div>
          <nav className="med-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`med-nav-item ${seccionActiva === item.id ? "active" : ""}`} onClick={() => handleNav(item.id)}>
                {ICONS[item.icon]}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="med-sidebar-footer">
            <div className="med-avatar">{iniciales}</div>
            <div className="med-sidebar-footer-info">
              <h4>{usuario?.nombre || "Dr. Javier"}</h4>
              <p>Médico Tratante</p>
            </div>
          </div>
        </aside>

        <main className="med-main">
          {/* DASHBOARD */}
          {seccionActiva === "dashboard" && (
            <>
              <h1 className="med-page-title">Inicio Médico</h1>
              <p className="med-page-subtitle">Vista general del control clínico</p>
              <div className="med-stats-grid">
                {[
                  { label: "Total Pacientes", value: estadisticas?.total_pacientes ?? 0, iconKey: "users", iconClass: "blue" },
                  { label: "En Tratamiento", value: estadisticas?.en_tratamiento ?? 0, iconKey: "heart", iconClass: "green" },
                  { label: "En Desintoxicación", value: estadisticas?.en_desintoxicacion ?? 0, iconKey: "activity", iconClass: "red" },
                  { label: "Valoraciones Pendientes", value: estadisticas?.valoraciones_pendientes ?? 0, iconKey: "calendar", iconClass: "orange" },
                ].map((s, i) => (
                  <div className="med-stat-card" key={i}>
                    <div className="med-stat-card-header">
                      <div className={`med-stat-icon ${s.iconClass}`}>{ICONS[s.iconKey]}</div>
                    </div>
                    <div className="med-stat-number">{cargando ? "—" : s.value}</div>
                    <div className="med-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="med-two-col">
                <div className="med-card">
                  <div className="med-card-header">
                    <span className="med-card-title">Pacientes Recientes</span>
                    <span className="med-card-action" onClick={() => handleNav("pacientes")}>Ver todos</span>
                  </div>
                  {cargando ? <div className="med-loading">Cargando...</div>
                    : pacientesRecientes.length === 0 ? <div className="med-empty">No hay pacientes registrados aún</div>
                    : pacientesRecientes.map((p, i) => (
                      <div className="med-patient-item" key={i} onClick={() => handleVerExpediente(p.id_paciente, p)}>
                        <div>
                          <div className="med-patient-name">{p.nombre} {p.apellido}</div>
                          <div className="med-patient-status">{p.estado || "Sin estado"}</div>
                        </div>
                        <div className="med-patient-meta">
                          <div className="med-patient-days">{p.dias_tratamiento ?? 0} días</div>
                          <div className="med-patient-exp">Expediente {String(p.id_expediente || "—").padStart(3, "0")}</div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="med-card">
                  <div className="med-card-header">
                    <span className="med-card-title">Tareas Pendientes</span>
                    <span className="med-card-badge">{tareasPendientes.length} pendientes</span>
                  </div>
                  {cargando ? <div className="med-loading">Cargando...</div>
                    : tareasPendientes.length === 0 ? <div className="med-empty">No hay tareas pendientes</div>
                    : tareasPendientes.map((t, i) => (
                      <div className="med-task-item" key={i}>
                        <div className="med-task-name">{t.descripcion} - {t.paciente}</div>
                        <span className={`med-badge ${t.prioridad}`}>{t.prioridad === "urgente" ? "Urgente" : "Normal"}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="med-card">
                <div className="med-card-header">
                  <span className="med-card-title">Acciones Rápidas</span>
                </div>
                <div className="med-actions-grid">
                  {[
                    { label: "Nueva Valoración", icon: "activity", nav: "valoracion" },
                    { label: "Nota de Evolución", icon: "chart", nav: "evolucion" },
                    { label: "Solicitud Laboratorio", icon: "flask", nav: "laboratorio" },
                    { label: "Ver Pacientes", icon: "users", nav: "pacientes" },
                  ].map((a, i) => (
                    <button key={i} className="med-action-btn" onClick={() => handleNav(a.nav)}>
                      {ICONS[a.icon]}
                      <span className="med-action-label">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PACIENTES */}
          {seccionActiva === "pacientes" && (
            <Pacientes onVerExpediente={handleVerExpediente} />
          )}

          {/* EXPEDIENTE */}
          {seccionActiva === "expediente" && pacienteActivo && (
            <Expediente
              id_paciente={pacienteActivo}
              onVolver={() => setSeccionActiva("pacientes")}
              onNavegar={(seccion) => setSeccionActiva(seccion)}
            />
          )}

          {/* VALORACIÓN */}
          {seccionActiva === "valoracion" && (
            <Valoracion rol={rol} />
          )}

          {/* SECCIONES EN DESARROLLO */}
          {!["dashboard", "pacientes", "expediente", "valoracion"].includes(seccionActiva) && (
            pacienteActivo ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#374151" }}>
                  {NAV_ITEMS.find(n => n.id === seccionActiva)?.label}
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 14 }}>Esta sección está en desarrollo</p>
                <button onClick={() => setSeccionActiva("expediente")} style={{ marginTop: 8, padding: "8px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  ← Volver al Expediente
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#374151" }}>
                  {NAV_ITEMS.find(n => n.id === seccionActiva)?.label}
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 14 }}>Selecciona un paciente primero</p>
                <button onClick={() => handleNav("pacientes")} style={{ marginTop: 8, padding: "8px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  Ir a Pacientes
                </button>
              </div>
            )
          )}
        </main>
      </div>
    </>
  );
}