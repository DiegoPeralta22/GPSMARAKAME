import { useState, useEffect } from "react";
import {
  obtenerPacientes,
  obtenerExpediente,
  obtenerNotasNutricionales,
  crearNotaNutricional,
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas
} from "../../services/medicoService";
import Expediente from "../medico/Expediente";
import Pacientes from "../medico/Pacientes";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .nut-app { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #f0fdf4; color: #111827; }
  .nut-sidebar { width: 200px; min-height: 100vh; background: #065f46; display: flex; flex-direction: column; padding: 20px 0; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
  .nut-sidebar-header { padding: 0 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .nut-sidebar-header h2 { color: #fff; font-size: 14px; font-weight: 700; }
  .nut-sidebar-header p { color: rgba(255,255,255,0.45); font-size: 11px; margin-top: 2px; }
  .nut-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .nut-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
  .nut-nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .nut-nav-item.active { background: rgba(167,243,208,0.2); color: #6ee7b7; border-left: 3px solid #10b981; }
  .nut-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .nut-sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
  .nut-sidebar-footer-user { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .nut-avatar { width: 34px; height: 34px; border-radius: 50%; background: #059669; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .nut-sidebar-footer-info h4 { color: #fff; font-size: 12px; font-weight: 600; }
  .nut-sidebar-footer-info p { color: rgba(255,255,255,0.4); font-size: 10px; }
  .nut-logout-btn { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-family: 'Inter', sans-serif; width: 100%; transition: all 0.15s; }
  .nut-logout-btn:hover { background: rgba(239,68,68,0.2); color: #fca5a5; border-color: rgba(239,68,68,0.3); }
  .nut-logout-btn svg { width: 14px; height: 14px; }
  .nut-topbar { background: #065f46; position: fixed; top: 0; left: 0; right: 0; height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 200; }
  .nut-topbar span { color: rgba(255,255,255,0.5); font-size: 11px; }
  .nut-main { margin-left: 200px; flex: 1; padding: 28px 32px; margin-top: 36px; }
  .nut-page-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .nut-page-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .nut-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .nut-stat-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #d1fae5; }
  .nut-stat-number { font-size: 28px; font-weight: 700; color: #065f46; letter-spacing: -0.5px; }
  .nut-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .nut-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #d1fae5; margin-bottom: 16px; }
  .nut-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .nut-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .nut-label { font-size: 12px; color: #374151; font-weight: 500; }
  .nut-label span.req { color: #ef4444; margin-left: 2px; }
  .nut-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .nut-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
  .nut-input.error { border-color: #ef4444; }
  .nut-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; background: #fff; }
  .nut-select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
  .nut-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 90px; transition: border 0.15s; width: 100%; }
  .nut-textarea:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
  .nut-textarea.error { border-color: #ef4444; }
  .nut-error-msg { font-size: 11px; color: #ef4444; }
  .nut-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .nut-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .nut-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .nut-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .nut-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #10b981; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .nut-btn-save:hover { background: #059669; }
  .nut-btn-save:disabled { background: #6ee7b7; cursor: not-allowed; }
  .nut-btn-primary { padding: 10px 20px; border: none; border-radius: 8px; background: #10b981; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .nut-btn-primary:hover { background: #059669; }
  .nut-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .nut-empty { text-align: center; padding: 32px; color: #9ca3af; font-size: 13px; }
  .nut-loading { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }

  /* BÚSQUEDA PACIENTE */
  .nut-search-wrap { position: relative; }
  .nut-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .nut-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .nut-search-item:hover { background: #f0fdf4; }
  .nut-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .nut-persona-seleccionada { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .nut-persona-nombre { font-size: 14px; font-weight: 600; color: #065f46; }
  .nut-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .nut-cambiar-btn { font-size: 12px; color: #10b981; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }

  /* TOGGLE NOTIFICAR */
  .nut-notif-toggle { display: flex; align-items: flex-start; gap: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; }
  .nut-notif-toggle.activo { background: #fffbeb; border-color: #fde68a; }
  .nut-toggle-switch { position: relative; width: 40px; height: 22px; flex-shrink: 0; margin-top: 1px; }
  .nut-toggle-switch input { opacity: 0; width: 0; height: 0; }
  .nut-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; border-radius: 22px; transition: 0.2s; }
  .nut-toggle-slider:before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
  input:checked + .nut-toggle-slider { background: #f59e0b; }
  input:checked + .nut-toggle-slider:before { transform: translateX(18px); }
  .nut-toggle-info h4 { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 2px; }
  .nut-toggle-info p { font-size: 12px; color: #6b7280; }

  /* HISTORIAL NOTAS */
  .nut-nota-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .nut-nota-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .nut-nota-autor { font-size: 13px; font-weight: 600; color: #111827; }
  .nut-nota-fecha { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .nut-nota-dieta { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #d1fae5; color: #065f46; }
  .nut-nota-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #fff; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
  .nut-nota-field-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
  .nut-nota-field-value { font-size: 12px; color: #374151; font-weight: 500; margin-top: 2px; }
  .nut-nota-plan { font-size: 12px; color: #374151; line-height: 1.5; margin-bottom: 8px; }
  .nut-nota-restricciones { font-size: 12px; color: #ef4444; padding: 6px 10px; background: #fff1f2; border-radius: 6px; margin-bottom: 8px; }
  .nut-nota-obs { font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 8px; }
  .nut-nota-notif { font-size: 11px; color: #d97706; font-weight: 500; }

  /* NOTIFICACIONES */
  .nut-notif-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
  .nut-notif-btn svg { width: 18px; height: 18px; color: rgba(255,255,255,0.6); }
  .nut-notif-btn:hover svg { color: #fff; }
  .nut-notif-counter { position: absolute; top: -2px; right: -2px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .nut-notif-panel { position: fixed; top: 36px; right: 0; width: 360px; height: calc(100vh - 36px); background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.12); z-index: 300; display: flex; flex-direction: column; }
  .nut-notif-panel-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
  .nut-notif-panel-title { font-size: 15px; font-weight: 600; color: #111827; }
  .nut-notif-marcar-todas { font-size: 11px; color: #10b981; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; font-weight: 500; }
  .nut-notif-close { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 18px; }
  .nut-notif-list { flex: 1; overflow-y: auto; }
  .nut-notif-item { padding: 14px 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; display: flex; gap: 12px; align-items: flex-start; }
  .nut-notif-item:hover { background: #f9fafb; }
  .nut-notif-item.no-leida { background: #f0fdf4; border-left: 3px solid #10b981; }
  .nut-notif-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; background: #d1fae5; }
  .nut-notif-msg { font-size: 13px; color: #374151; line-height: 1.4; }
  .nut-notif-fecha { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .nut-notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; flex-shrink: 0; margin-top: 4px; }
  .nut-notif-overlay { position: fixed; inset: 0; z-index: 250; }
  .nut-nueva-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border: none; border-radius: 8px; background: #10b981; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; margin-bottom: 20px; }
  .nut-nueva-btn:hover { background: #059669; }
  .nut-form-container { border: 2px solid #10b981; border-radius: 10px; padding: 20px; margin-bottom: 20px; background: #f0fdf4; }
  .nut-form-title { font-size: 14px; font-weight: 600; color: #065f46; margin-bottom: 16px; }
`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Inicio", icon: "home" },
  { id: "pacientes", label: "Pacientes", icon: "users" },
  { id: "notas", label: "Notas Nutricionales", icon: "leaf" },
];

const ICONS = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  leaf: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const formInicial = {
  tipo_dieta: "",
  calorias_recomendadas: "",
  plan_alimentario: "",
  restricciones_alergias: "",
  observaciones: "",
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

export default function Nutriologo() {
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);

  // Notas
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [notas, setNotas] = useState([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [notificarMedico, setNotificarMedico] = useState(false);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

  // Dashboard stats
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [totalNotas, setTotalNotas] = useState(0);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUsuario(u);
    if (u?.id_usuario) cargarNotificaciones(u.id_usuario);
    cargarStats();
  }, []);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  useEffect(() => {
    if (pacienteSeleccionado) cargarNotas(pacienteSeleccionado.id_paciente);
  }, [pacienteSeleccionado]);

  const cargarStats = async () => {
    try {
      const data = await obtenerPacientes("todos", "");
      setTotalPacientes(data.filter(p => p.id_expediente).length);
    } catch (e) { console.error(e); }
  };

  const cargarNotificaciones = async (id) => {
    try {
      const data = await obtenerNotificaciones(id);
      setNotificaciones(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const buscarPacientes = async () => {
    try {
      setBuscando(true);
      const data = await obtenerPacientes("todos", busqueda);
      setResultadosBusqueda(data.filter(p => p.id_expediente));
    } catch (e) { console.error(e); }
    finally { setBuscando(false); }
  };

  const seleccionarPaciente = (p) => {
    setPacienteSeleccionado(p);
    setBusqueda("");
    setResultadosBusqueda([]);
    setMostrarForm(false);
    setNotas([]);
  };

  const cargarNotas = async (id_paciente) => {
    try {
      setCargandoNotas(true);
      const data = await obtenerNotasNutricionales(id_paciente);
      setNotas(Array.isArray(data) ? data : []);
      setTotalNotas(prev => prev + (Array.isArray(data) ? data.length : 0));
    } catch (e) { console.error(e); }
    finally { setCargandoNotas(false); }
  };

  const validar = () => {
    const e = {};
    if (!form.plan_alimentario || form.plan_alimentario.trim().length < 10)
      e.plan_alimentario = "Ingresa al menos 10 caracteres";
    if (!form.tipo_dieta) e.tipo_dieta = "Selecciona el tipo de dieta";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      const fechaHoy = new Date().toISOString().split("T")[0];
      await crearNotaNutricional({
        ...form,
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        fecha: fechaHoy,
        calorias_recomendadas: form.calorias_recomendadas ? parseInt(form.calorias_recomendadas) : null,
        notificar_medico: notificarMedico,
      });
      const msg = notificarMedico
        ? "✅ Nota registrada y médicos notificados del cambio nutricional."
        : "✅ Nota nutricional registrada correctamente.";
      setExito(msg);
      setForm(formInicial);
      setNotificarMedico(false);
      setMostrarForm(false);
      cargarNotas(pacienteSeleccionado.id_paciente);
      setTimeout(() => setExito(null), 6000);
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
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

  const handleVerExpediente = (id) => {
    setPacienteActivo(id);
    setSeccionActiva("expediente");
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "NU";

  const getLabel = () => NAV_ITEMS.find(n => n.id === seccionActiva)?.label || "Inicio";

  return (
    <>
      <style>{styles}</style>
      <div className="nut-app">

        {panelAbierto && <div className="nut-notif-overlay" onClick={() => setPanelAbierto(false)} />}

        {/* TOPBAR */}
        <div className="nut-topbar">
          <span>{seccionActiva === "expediente" ? "Expediente" : getLabel()}</span>
          <button className="nut-notif-btn" onClick={() => setPanelAbierto(!panelAbierto)}>
            {ICONS.bell}
            {noLeidas > 0 && <span className="nut-notif-counter">{noLeidas > 9 ? "9+" : noLeidas}</span>}
          </button>
        </div>

        {/* PANEL NOTIFICACIONES */}
        {panelAbierto && (
          <div className="nut-notif-panel">
            <div className="nut-notif-panel-header">
              <span className="nut-notif-panel-title">🔔 Notificaciones {noLeidas > 0 && <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>({noLeidas} nuevas)</span>}</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {noLeidas > 0 && <button className="nut-notif-marcar-todas" onClick={handleMarcarTodas}>Marcar todas leídas</button>}
                <button className="nut-notif-close" onClick={() => setPanelAbierto(false)}>✕</button>
              </div>
            </div>
            <div className="nut-notif-list">
              {notificaciones.length === 0 ? (
                <div className="nut-empty"><div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>No tienes notificaciones</div>
              ) : notificaciones.map((n, i) => (
                <div key={i} className={`nut-notif-item ${!n.leida ? "no-leida" : ""}`} onClick={() => handleMarcarLeida(n)}>
                  <div className="nut-notif-icon">🔔</div>
                  <div style={{ flex: 1 }}>
                    <div className="nut-notif-msg">{n.mensaje}</div>
                    <div className="nut-notif-fecha">{formatFecha(n.fecha)}</div>
                  </div>
                  {!n.leida && <div className="nut-notif-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIDEBAR */}
        <aside className="nut-sidebar">
          <div className="nut-sidebar-header" style={{ marginTop: 36 }}>
            <h2>Sistema Nutrición</h2>
            <p>{usuario?.nombre || "Nutriólogo"} · Área Médica</p>
          </div>
          <nav className="nut-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`nut-nav-item ${seccionActiva === item.id ? "active" : ""}`} onClick={() => { setSeccionActiva(item.id); setPacienteActivo(null); }}>
                {ICONS[item.icon]}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="nut-sidebar-footer">
            <div className="nut-sidebar-footer-user">
              <div className="nut-avatar">{iniciales}</div>
              <div className="nut-sidebar-footer-info">
                <h4>{usuario?.nombre || "Nutriólogo"}</h4>
                <p>Nutriólogo</p>
              </div>
            </div>
            <button className="nut-logout-btn" onClick={handleCerrarSesion}>
              {ICONS.logout}
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="nut-main">

          {/* DASHBOARD */}
          {seccionActiva === "dashboard" && (
            <>
              <h1 className="nut-page-title">Inicio Nutrición</h1>
              <p className="nut-page-subtitle">Bienvenido al sistema de nutrición clínica</p>
              <div className="nut-stats-grid">
                <div className="nut-stat-card">
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🧑‍⚕️</div>
                  <div className="nut-stat-number">{totalPacientes}</div>
                  <div className="nut-stat-label">Pacientes en tratamiento</div>
                </div>
                <div className="nut-stat-card">
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📋</div>
                  <div className="nut-stat-number">{notas.length}</div>
                  <div className="nut-stat-label">Notas del paciente activo</div>
                </div>
                <div className="nut-stat-card">
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🔔</div>
                  <div className="nut-stat-number">{noLeidas}</div>
                  <div className="nut-stat-label">Notificaciones sin leer</div>
                </div>
              </div>
              <div className="nut-card">
                <div className="nut-section-title">Acciones Rápidas</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="nut-btn-primary" onClick={() => setSeccionActiva("notas")}>
                    🥗 Registrar Nota Nutricional
                  </button>
                  <button className="nut-btn-primary" style={{ background: "#0891b2" }} onClick={() => setSeccionActiva("pacientes")}>
                    👤 Ver Pacientes
                  </button>
                </div>
              </div>
            </>
          )}

          {/* PACIENTES */}
          {seccionActiva === "pacientes" && <Pacientes onVerExpediente={handleVerExpediente} />}

          {/* EXPEDIENTE */}
          {seccionActiva === "expediente" && pacienteActivo && (
            <Expediente id_paciente={pacienteActivo} onVolver={() => setSeccionActiva("pacientes")} onNavegar={() => {}} />
          )}

          {/* NOTAS NUTRICIONALES */}
          {seccionActiva === "notas" && (
            <>
              <h1 className="nut-page-title">Notas Nutricionales</h1>
              <p className="nut-page-subtitle">Registro de planes y recomendaciones alimentarias</p>

              {exito && <div className="nut-success">{exito}</div>}

              {/* SELECCIÓN PACIENTE */}
              <div className="nut-card">
                <div className="nut-section-title">Paciente</div>
                {pacienteSeleccionado ? (
                  <div className="nut-persona-seleccionada">
                    <div>
                      <div className="nut-persona-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                      <div className="nut-persona-info">
                        {pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • Expediente #{String(pacienteSeleccionado.id_expediente).padStart(3, "0")}
                      </div>
                    </div>
                    <button className="nut-cambiar-btn" onClick={() => { setPacienteSeleccionado(null); setNotas([]); setMostrarForm(false); }}>Cambiar</button>
                  </div>
                ) : (
                  <div className="nut-field" style={{ marginBottom: 0 }}>
                    <label className="nut-label">Buscar paciente</label>
                    <div className="nut-search-wrap">
                      <input
                        className="nut-input"
                        placeholder="Escribe el nombre del paciente..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                      />
                      {busqueda.length >= 2 && (
                        <div className="nut-search-results">
                          {buscando ? <div className="nut-no-resultados">Buscando...</div>
                            : resultadosBusqueda.length === 0 ? <div className="nut-no-resultados">No se encontraron pacientes</div>
                            : resultadosBusqueda.map((p, i) => (
                              <div key={i} className="nut-search-item" onClick={() => seleccionarPaciente(p)}>
                                <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {pacienteSeleccionado && (
                <>
                  {!mostrarForm && (
                    <button className="nut-nueva-btn" onClick={() => setMostrarForm(true)}>
                      ➕ Nueva Nota Nutricional
                    </button>
                  )}

                  {/* FORMULARIO */}
                  {mostrarForm && (
                    <div className="nut-form-container">
                      <div className="nut-form-title">🥗 Nueva Nota Nutricional — {new Date().toLocaleDateString()}</div>

                      <div className="nut-grid" style={{ marginBottom: 14 }}>
                        <div className="nut-field" style={{ marginBottom: 0 }}>
                          <label className="nut-label">Tipo de Dieta <span className="req">*</span></label>
                          <select className={`nut-select ${errores.tipo_dieta ? "error" : ""}`} value={form.tipo_dieta} onChange={e => { setForm({ ...form, tipo_dieta: e.target.value }); setErrores(p => ({ ...p, tipo_dieta: undefined })); }}>
                            <option value="">Seleccionar...</option>
                            <option value="Normal">Normal</option>
                            <option value="Blanda">Blanda</option>
                            <option value="Líquida">Líquida</option>
                            <option value="Hipocalórica">Hipocalórica</option>
                            <option value="Hiperproteica">Hiperproteica</option>
                            <option value="Diabética">Diabética</option>
                            <option value="Sin gluten">Sin gluten</option>
                            <option value="Sin lactosa">Sin lactosa</option>
                            <option value="Vegetariana">Vegetariana</option>
                          </select>
                          {errores.tipo_dieta && <span className="nut-error-msg">⚠️ {errores.tipo_dieta}</span>}
                        </div>
                        <div className="nut-field" style={{ marginBottom: 0 }}>
                          <label className="nut-label">Calorías Recomendadas (kcal/día)</label>
                          <input className="nut-input" type="number" placeholder="ej. 2000" value={form.calorias_recomendadas} onChange={e => setForm({ ...form, calorias_recomendadas: e.target.value })} />
                        </div>
                      </div>

                      <div className="nut-field">
                        <label className="nut-label">Plan Alimentario <span className="req">*</span></label>
                        <textarea className={`nut-textarea ${errores.plan_alimentario ? "error" : ""}`} placeholder="Describe el plan alimentario detallado: desayuno, comida, cena, colaciones..." value={form.plan_alimentario} onChange={e => { setForm({ ...form, plan_alimentario: e.target.value }); setErrores(p => ({ ...p, plan_alimentario: undefined })); }} />
                        {errores.plan_alimentario && <span className="nut-error-msg">⚠️ {errores.plan_alimentario}</span>}
                      </div>

                      <div className="nut-field">
                        <label className="nut-label">Restricciones / Alergias</label>
                        <textarea className="nut-textarea" style={{ minHeight: 60 }} placeholder="Alimentos prohibidos, alergias, intolerancias..." value={form.restricciones_alergias} onChange={e => setForm({ ...form, restricciones_alergias: e.target.value })} />
                      </div>

                      <div className="nut-field">
                        <label className="nut-label">Observaciones</label>
                        <textarea className="nut-textarea" style={{ minHeight: 60 }} placeholder="Observaciones adicionales sobre el estado nutricional..." value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} />
                      </div>

                      {/* TOGGLE NOTIFICAR MÉDICO */}
                      <div className={`nut-notif-toggle ${notificarMedico ? "activo" : ""}`}>
                        <label className="nut-toggle-switch">
                          <input type="checkbox" checked={notificarMedico} onChange={e => setNotificarMedico(e.target.checked)} />
                          <span className="nut-toggle-slider"></span>
                        </label>
                        <div className="nut-toggle-info">
                          <h4>🔔 Notificar al médico y jefe médico</h4>
                          <p>{notificarMedico
                            ? "Se enviará una notificación a todos los médicos y al jefe médico sobre el cambio en el plan nutricional."
                            : "La nota se guardará sin notificar al equipo médico."}</p>
                        </div>
                      </div>

                      <div className="nut-footer">
                        <button className="nut-btn-cancel" onClick={() => { setMostrarForm(false); setForm(formInicial); setErrores({}); setNotificarMedico(false); }}>Cancelar</button>
                        <button className="nut-btn-save" onClick={handleGuardar} disabled={guardando}>
                          💾 {guardando ? "Guardando..." : "Guardar Nota"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HISTORIAL */}
                  <div className="nut-card">
                    <div className="nut-section-title">
                      Historial de Notas
                      {notas.length > 0 && <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>({notas.length} registradas)</span>}
                    </div>
                    {cargandoNotas ? <div className="nut-loading">Cargando notas...</div>
                      : notas.length === 0 ? <div className="nut-empty">No hay notas nutricionales para este paciente</div>
                      : notas.map((n, i) => (
                        <div className="nut-nota-item" key={i}>
                          <div className="nut-nota-header">
                            <div>
                              <div className="nut-nota-autor">👤 {n.nombre_nutriologo}</div>
                              <div className="nut-nota-fecha">📅 {n.fecha ? new Date(n.fecha).toLocaleDateString() : "—"}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              {n.tipo_dieta && <span className="nut-nota-dieta">{n.tipo_dieta}</span>}
                              {n.notificar_medico && <span className="nut-nota-notif">🔔 Médico notificado</span>}
                            </div>
                          </div>

                          <div className="nut-nota-grid">
                            <div>
                              <div className="nut-nota-field-label">Tipo de Dieta</div>
                              <div className="nut-nota-field-value">{n.tipo_dieta || "—"}</div>
                            </div>
                            <div>
                              <div className="nut-nota-field-label">Calorías</div>
                              <div className="nut-nota-field-value">{n.calorias_recomendadas ? `${n.calorias_recomendadas} kcal/día` : "—"}</div>
                            </div>
                            <div>
                              <div className="nut-nota-field-label">Fecha Registro</div>
                              <div className="nut-nota-field-value">{n.fecha_registro ? new Date(n.fecha_registro).toLocaleString() : "—"}</div>
                            </div>
                          </div>

                          {n.plan_alimentario && (
                            <div className="nut-nota-plan">📋 <strong>Plan:</strong> {n.plan_alimentario}</div>
                          )}

                          {n.restricciones_alergias && (
                            <div className="nut-nota-restricciones">⚠️ <strong>Restricciones:</strong> {n.restricciones_alergias}</div>
                          )}

                          {n.observaciones && (
                            <div className="nut-nota-obs">💬 {n.observaciones}</div>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}