import { useState, useEffect } from "react";
import ExpedienteClinico from "../expediente/ExpedienteClinico";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .cli-app { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #f4f6f9; color: #1a1a2e; }
  .cli-sidebar { width: 200px; min-height: 100vh; background: #0b5d5b; display: flex; flex-direction: column; padding: 20px 0; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
  .cli-sidebar-header { padding: 0 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.12); }
  .cli-sidebar-header h2 { color: #fff; font-size: 14px; font-weight: 700; }
  .cli-sidebar-header p { color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 2px; }
  .cli-nav { flex: 1; padding: 12px 0; }
  .cli-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; color: rgba(255,255,255,0.65); font-size: 13px; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
  .cli-nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .cli-nav-item.active { background: rgba(255,255,255,0.15); color: #fff; border-left: 3px solid #4ade80; font-weight: 600; }
  .cli-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .cli-sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; gap: 10px; }
  .cli-avatar { width: 34px; height: 34px; border-radius: 50%; background: #4ade80; display: flex; align-items: center; justify-content: center; color: #0b5d5b; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .cli-sidebar-footer-info h4 { color: #fff; font-size: 12px; font-weight: 600; }
  .cli-sidebar-footer-info p { color: rgba(255,255,255,0.4); font-size: 10px; }
  .cli-topbar { background: #0b5d5b; position: fixed; top: 0; left: 0; right: 0; height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 200; }
  .cli-topbar span { color: rgba(255,255,255,0.6); font-size: 11px; }
  .cli-notif-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
  .cli-notif-btn svg { width: 18px; height: 18px; color: rgba(255,255,255,0.6); }
  .cli-notif-btn:hover svg { color: #fff; }
  .cli-notif-counter { position: absolute; top: -2px; right: -2px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .cli-main { margin-left: 200px; flex: 1; padding: 28px 32px; margin-top: 36px; }
  .cli-page-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .cli-page-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .cli-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .cli-stat-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
  .cli-stat-num { font-size: 28px; font-weight: 700; color: #0b5d5b; }
  .cli-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .cli-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .cli-card-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; }

  /* Lista de pacientes para traslado */
  .cli-pac-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .cli-pac-card { background: #fff; border-radius: 10px; border: 1px solid #e5e7eb; padding: 18px; cursor: pointer; transition: all .15s; }
  .cli-pac-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); border-color: #0b5d5b; }
  .cli-pac-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .cli-pac-info { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
  .cli-badge-pend { background: #fff7ed; color: #d97706; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 10px; display: inline-block; }
  .cli-badge-done { background: #e6f4f3; color: #0b5d5b; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 10px; display: inline-block; }
  .cli-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }

  /* Formulario de traslado */
  .cli-form-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .cli-section-title { font-size: 12px; font-weight: 700; color: #0b5d5b; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 14px; padding-left: 8px; border-left: 3px solid #0b5d5b; }
  .cli-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
  .cli-field label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
  .cli-field input, .cli-field select, .cli-field textarea { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
  .cli-field input:focus, .cli-field select:focus, .cli-field textarea:focus { border-color: #0b5d5b; }
  .cli-field textarea { min-height: 80px; resize: vertical; }
  .cli-readonly { background: #f9fafb; color: #374151; cursor: default; }

  /* Sustancias toggle */
  .cli-toggle-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 12px; }
  .cli-toggle-label { font-size: 13px; font-weight: 600; color: #374151; flex: 1; }
  .cli-toggle-btns { display: flex; gap: 8px; }
  .cli-toggle-btn { padding: 5px 16px; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .cli-toggle-btn.si { border-color: #ef4444; background: #fff1f2; color: #ef4444; }
  .cli-toggle-btn.no { border-color: #0b5d5b; background: #e6f4f3; color: #0b5d5b; }

  /* Inventario */
  .cli-inv-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 10px; }
  .cli-inv-table th { background: #f9fafb; padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
  .cli-inv-table td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; }
  .cli-inv-table td input { width: 100%; padding: 5px 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 12px; font-family: inherit; }
  .cli-btn-add { padding: 6px 14px; background: #0b5d5b; color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
  .cli-btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; font-weight: bold; }
  .cli-btn-save { width: 100%; padding: 13px; background: #0b5d5b; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 16px; }
  .cli-btn-save:hover { background: #094e4c; }
  .cli-btn-save:disabled { background: #9ca3af; cursor: not-allowed; }
  .cli-btn-back { background: none; border: none; color: #0b5d5b; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }

  /* Notificaciones */
  .cli-notif-overlay { position: fixed; inset: 0; z-index: 250; }
  .cli-notif-panel { position: fixed; top: 36px; right: 0; width: 360px; height: calc(100vh - 36px); background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.12); z-index: 300; display: flex; flex-direction: column; border-left: 1px solid #e5e7eb; }
  .cli-notif-panel-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
  .cli-notif-panel-title { font-size: 15px; font-weight: 600; color: #111827; }
  .cli-notif-close { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 18px; }
  .cli-notif-list { flex: 1; overflow-y: auto; }
  .cli-notif-item { padding: 14px 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
  .cli-notif-item.no-leida { background: #f0fdf4; border-left: 3px solid #0b5d5b; }
  .cli-notif-msg { font-size: 13px; color: #374151; }
  .cli-notif-fecha { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .cli-notif-empty { text-align: center; padding: 48px 20px; color: #9ca3af; font-size: 13px; }
`;

const IcoHome = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoUsers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBell = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoTruck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoFile = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>;

const NAV_ITEMS = [
  { id: "dashboard", label: "Inicio", Icon: IcoHome },
  { id: "traslado", label: "Traslados", Icon: IcoTruck },
  { id: "expediente", label: "Expediente", Icon: IcoFile },
];

function formatFecha(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return "Ahora";
  if (diff < 60) return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString("es-MX");
}

export default function Clinico() {
  const [seccion, setSeccion] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [pacienteExpediente, setPacienteExpediente] = useState(null);
  const [traslado, setTraslado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Formulario traslado
  const [tieneSustancias, setTieneSustancias] = useState(false);
  const [descSustancias, setDescSustancias] = useState("");
  const [inventario, setInventario] = useState([{ articulo: "", cantidad: "1", observaciones: "" }]);
  const [observaciones, setObservaciones] = useState("");

  // Notificaciones
  const [notifs, setNotifs] = useState([]);
  const [panelNotif, setPanelNotif] = useState(false);
  const noLeidas = notifs.filter(n => !n.leida).length;

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUsuario(u);
    if (u?.id_usuario) cargarNotifs(u.id_usuario);
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/clinico/pacientes-aprobados");
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const cargarNotifs = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/clinico/notificaciones/${id}`);
      const data = await res.json();
      setNotifs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const seleccionarPaciente = async (p) => {
    setSeleccionado(p);
    setTieneSustancias(false);
    setDescSustancias("");
    setInventario([{ articulo: "", cantidad: "1", observaciones: "" }]);
    setObservaciones("");
    try {
      const res = await fetch(`http://localhost:3000/clinico/traslado/${p.id_paciente}`);
      const data = await res.json();
      if (data) {
        setTraslado(data);
        setTieneSustancias(!!data.tiene_sustancias);
        setDescSustancias(data.descripcion_sustancias || "");
        setObservaciones(data.observaciones || "");
        if (data.inventario_json) {
          try { setInventario(JSON.parse(data.inventario_json)); } catch {}
        }
      } else {
        setTraslado(null);
      }
    } catch (e) { console.error(e); }
  };

  const agregarFila = () => setInventario(prev => [...prev, { articulo: "", cantidad: "1", observaciones: "" }]);
  const eliminarFila = (i) => setInventario(prev => prev.filter((_, idx) => idx !== i));
  const actualizarFila = (i, campo, val) => setInventario(prev => prev.map((row, idx) => idx === i ? { ...row, [campo]: val } : row));

  const guardar = async () => {
    if (!seleccionado) return;
    setGuardando(true);
    try {
      const res = await fetch("http://localhost:3000/clinico/traslado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: seleccionado.id_paciente,
          id_usuario: usuario?.id_usuario,
          tiene_sustancias: tieneSustancias,
          descripcion_sustancias: descSustancias || null,
          inventario_json: JSON.stringify(inventario.filter(r => r.articulo.trim())),
          observaciones: observaciones || null
        })
      });
      if (res.ok) {
        alert("Traslado guardado correctamente.");
        cargarPacientes();
        setSeleccionado(null);
      } else {
        alert("Error al guardar.");
      }
    } catch (e) { alert("Error: " + e.message); }
    finally { setGuardando(false); }
  };

  const marcarLeida = async (n) => {
    if (n.leida) return;
    try {
      await fetch(`http://localhost:3000/clinico/notificaciones/leer/${n.id_notificacion}`, { method: "POST" });
      setNotifs(prev => prev.map(x => x.id_notificacion === n.id_notificacion ? { ...x, leida: 1 } : x));
    } catch (e) { console.error(e); }
  };

  const marcarTodas = async () => {
    if (!usuario?.id_usuario) return;
    try {
      await fetch(`http://localhost:3000/clinico/notificaciones/leer-todas/${usuario.id_usuario}`, { method: "POST" });
      setNotifs(prev => prev.map(n => ({ ...n, leida: 1 })));
    } catch (e) { console.error(e); }
  };

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "CL";

  const pendientes = pacientes.filter(p => !p.id_traslado).length;
  const completados = pacientes.filter(p => !!p.id_traslado).length;

  return (
    <>
      <style>{styles}</style>
      <div className="cli-app">

        {panelNotif && <div className="cli-notif-overlay" onClick={() => setPanelNotif(false)} />}

        {/* TOPBAR */}
        <div className="cli-topbar">
          <span>Sistema Clínico — {NAV_ITEMS.find(n => n.id === seccion)?.label}</span>
          <button className="cli-notif-btn" onClick={() => setPanelNotif(!panelNotif)}>
            <IcoBell />
            {noLeidas > 0 && <span className="cli-notif-counter">{noLeidas > 9 ? "9+" : noLeidas}</span>}
          </button>
        </div>

        {/* PANEL NOTIFICACIONES */}
        {panelNotif && (
          <div className="cli-notif-panel">
            <div className="cli-notif-panel-header">
              <span className="cli-notif-panel-title">🔔 Notificaciones {noLeidas > 0 && <span style={{ fontSize: 12, color: "#0b5d5b", fontWeight: 700 }}>({noLeidas} nuevas)</span>}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {noLeidas > 0 && <button onClick={marcarTodas} style={{ fontSize: 11, color: "#0b5d5b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Marcar todas leídas</button>}
                <button className="cli-notif-close" onClick={() => setPanelNotif(false)}>✕</button>
              </div>
            </div>
            <div className="cli-notif-list">
              {notifs.length === 0 ? (
                <div className="cli-notif-empty">No tienes notificaciones</div>
              ) : notifs.map((n, i) => (
                <div key={i} className={`cli-notif-item ${!n.leida ? "no-leida" : ""}`} onClick={() => marcarLeida(n)}>
                  <div className="cli-notif-msg">{n.mensaje}</div>
                  <div className="cli-notif-fecha">{formatFecha(n.fecha)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIDEBAR */}
        <aside className="cli-sidebar">
          <div className="cli-sidebar-header" style={{ marginTop: 36 }}>
            <h2>Sistema Clínico</h2>
            <p>{usuario?.nombre || "Clínico"} · Traslados</p>
          </div>
          <nav className="cli-nav">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button key={id} className={`cli-nav-item ${seccion === id ? "active" : ""}`} onClick={() => { setSeccion(id); setSeleccionado(null); }}>
                <Icon />{label}
              </button>
            ))}
          </nav>
          <div className="cli-sidebar-footer">
            <div className="cli-avatar">{iniciales}</div>
            <div className="cli-sidebar-footer-info">
              <h4>{usuario?.nombre || "Clínico"}</h4>
              <p>Área Clínica</p>
            </div>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="cli-main">

          {/* DASHBOARD */}
          {seccion === "dashboard" && (
            <>
              <h1 className="cli-page-title">Inicio Clínico</h1>
              <p className="cli-page-subtitle">Control de traslados e inventario de pertenencias</p>
              <div className="cli-stats-grid">
                <div className="cli-stat-card">
                  <div className="cli-stat-num">{pendientes}</div>
                  <div className="cli-stat-label">Traslados Pendientes</div>
                </div>
                <div className="cli-stat-card">
                  <div className="cli-stat-num">{completados}</div>
                  <div className="cli-stat-label">Traslados Realizados</div>
                </div>
                <div className="cli-stat-card">
                  <div className="cli-stat-num">{pacientes.length}</div>
                  <div className="cli-stat-label">Pacientes Aprobados</div>
                </div>
              </div>
              {pendientes > 0 && (
                <div className="cli-card" style={{ background: "#fff7ed", border: "1px solid #fbbf24" }}>
                  <div style={{ fontWeight: 700, color: "#d97706", marginBottom: 6 }}>⚠ Tienes {pendientes} traslado{pendientes > 1 ? "s" : ""} pendiente{pendientes > 1 ? "s" : ""}</div>
                  <button onClick={() => setSeccion("traslado")} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Ir a Traslados →
                  </button>
                </div>
              )}
            </>
          )}

          {/* TRASLADOS - LISTA */}
          {seccion === "traslado" && !seleccionado && (
            <>
              <h1 className="cli-page-title">Traslados</h1>
              <p className="cli-page-subtitle">Pacientes aprobados para ingreso — completa el traslado e inventario</p>
              {cargando ? (
                <div className="cli-empty">Cargando...</div>
              ) : pacientes.length === 0 ? (
                <div className="cli-empty">No hay pacientes aprobados pendientes de traslado</div>
              ) : (
                <div className="cli-pac-grid">
                  {pacientes.map((p, i) => (
                    <div key={i} className="cli-pac-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div onClick={() => seleccionarPaciente(p)} style={{ flex: 1 }}>
                          <div className="cli-pac-name">{p.nombre} {p.apellido}</div>
                          <div className="cli-pac-info">{p.edad} años · Aprobado {formatFecha(p.fecha_aprobacion)}</div>
                          {p.id_traslado
                            ? <span className="cli-badge-done">✓ Traslado completado</span>
                            : <span className="cli-badge-pend">Pendiente de traslado</span>
                          }
                        </div>
                        <button
                          onClick={() => { setPacienteExpediente(p); setSeccion("expediente"); }}
                          style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#6b7280", cursor: "pointer", whiteSpace: "nowrap", marginLeft: 8, marginTop: 2 }}
                        >
                          Ver exp.
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* EXPEDIENTE */}
          {seccion === "expediente" && !pacienteExpediente && (
            <>
              <h1 className="cli-page-title">Expediente Clínico</h1>
              <p className="cli-page-subtitle">Selecciona un paciente para ver su expediente completo</p>
              {pacientes.length === 0 ? (
                <div className="cli-empty">No hay pacientes registrados</div>
              ) : (
                <div className="cli-pac-grid">
                  {pacientes.map((p, i) => (
                    <div key={i} className="cli-pac-card" onClick={() => setPacienteExpediente(p)}>
                      <div className="cli-pac-name">{p.nombre} {p.apellido}</div>
                      <div className="cli-pac-info">{p.edad} años</div>
                      <span className="cli-badge-done" style={{ background: "#eff6ff", color: "#2563eb" }}>Ver Expediente →</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {seccion === "expediente" && pacienteExpediente && (
            <ExpedienteClinico
              id_paciente={pacienteExpediente.id_paciente}
              onVolver={() => setPacienteExpediente(null)}
            />
          )}

          {/* TRASLADOS - FORMULARIO */}
          {seccion === "traslado" && seleccionado && (
            <>
              <button className="cli-btn-back" onClick={() => setSeleccionado(null)}>← Volver a la lista</button>
              <h1 className="cli-page-title">{seleccionado.nombre} {seleccionado.apellido}</h1>
              <p className="cli-page-subtitle">{seleccionado.edad} años · Traslado e inventario de pertenencias</p>

              {traslado && (
                <div style={{ background: "#e6f4f3", border: "1px solid #0b5d5b", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#0b5d5b", fontWeight: 600 }}>
                  ✓ Este paciente ya tiene un traslado registrado. Puedes modificarlo.
                </div>
              )}

              <div className="cli-form-layout">

                {/* COLUMNA IZQUIERDA: Sustancias + Observaciones */}
                <div>
                  <div className="cli-card">
                    <p className="cli-section-title">Revisión de Sustancias</p>
                    <div className="cli-toggle-row">
                      <span className="cli-toggle-label">¿El paciente trae sustancias?</span>
                      <div className="cli-toggle-btns">
                        <button
                          className={`cli-toggle-btn ${tieneSustancias ? "si" : ""}`}
                          onClick={() => setTieneSustancias(true)}
                          style={tieneSustancias ? {} : { color: "#6b7280" }}
                        >
                          Sí
                        </button>
                        <button
                          className={`cli-toggle-btn ${!tieneSustancias ? "no" : ""}`}
                          onClick={() => { setTieneSustancias(false); setDescSustancias(""); }}
                          style={!tieneSustancias ? {} : { color: "#6b7280" }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {tieneSustancias && (
                      <div className="cli-field">
                        <label>Descripción de sustancias encontradas</label>
                        <textarea
                          placeholder="Ej: Cigarros, medicamento sin receta, alcohol..."
                          value={descSustancias}
                          onChange={e => setDescSustancias(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="cli-card">
                    <p className="cli-section-title">Observaciones del Traslado</p>
                    <div className="cli-field">
                      <label>Observaciones generales</label>
                      <textarea
                        placeholder="Notas sobre el traslado, condición del paciente al llegar..."
                        value={observaciones}
                        onChange={e => setObservaciones(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Inventario */}
                <div>
                  <div className="cli-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <p className="cli-section-title" style={{ marginBottom: 0 }}>Inventario de Pertenencias</p>
                      <button className="cli-btn-add" onClick={agregarFila}>+ Agregar</button>
                    </div>
                    <table className="cli-inv-table">
                      <thead>
                        <tr>
                          <th>Artículo</th>
                          <th style={{ width: 70 }}>Cantidad</th>
                          <th>Observaciones</th>
                          <th style={{ width: 36 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventario.map((row, i) => (
                          <tr key={i}>
                            <td><input placeholder="Ej: Ropa, reloj, documentos..." value={row.articulo} onChange={e => actualizarFila(i, "articulo", e.target.value)} /></td>
                            <td><input type="number" min="1" value={row.cantidad} onChange={e => actualizarFila(i, "cantidad", e.target.value)} /></td>
                            <td><input placeholder="Notas..." value={row.observaciones} onChange={e => actualizarFila(i, "observaciones", e.target.value)} /></td>
                            <td><button className="cli-btn-remove" onClick={() => eliminarFila(i)}>×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <button className="cli-btn-save" onClick={guardar} disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar Traslado e Inventario"}
              </button>
            </>
          )}

        </main>
      </div>
    </>
  );
}
