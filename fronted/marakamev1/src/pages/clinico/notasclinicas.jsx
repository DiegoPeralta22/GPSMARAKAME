import { useState, useEffect } from "react";

const BASE = "http://localhost:3000/medico";

const ROL_CONFIG = {
  psicologo:          { label: "Psicólogo",           icon: "🧠", color: "#7c3aed", bg: "#f5f3ff" },
  consejero:          { label: "Consejero",            icon: "🤝", color: "#0369a1", bg: "#f0f9ff" },
  terapeuta_grupo:    { label: "Terapeuta de Grupo",   icon: "👥", color: "#065f46", bg: "#f0fdf4" },
  terapeuta_familiar: { label: "Terapeuta Familiar",   icon: "👨‍👩‍👧", color: "#92400e", bg: "#fff7ed" },
};

const ESTADO_GENERAL = ["Estable", "En proceso", "Dificultades", "Crisis"];
const ESTADO_COLORS = {
  "Estable":      { bg: "#d1fae5", color: "#065f46" },
  "En proceso":   { bg: "#dbeafe", color: "#1e40af" },
  "Dificultades": { bg: "#fef9c3", color: "#92400e" },
  "Crisis":       { bg: "#fee2e2", color: "#dc2626" },
};

const styles = `
  .nc-wrap { font-family: 'Inter', sans-serif; }
  .nc-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .nc-tab { padding: 8px 18px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; color: #374151; transition: all 0.15s; }
  .nc-tab.active { background: #0b5d5b; color: #fff; border-color: #0b5d5b; }
  .nc-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; margin-bottom: 16px; }
  .nc-section-title { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; text-transform: uppercase; letter-spacing: 0.5px; }
  .nc-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
  .nc-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
  .nc-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; outline: none; width: 100%; }
  .nc-input:focus { border-color: #0b5d5b; box-shadow: 0 0 0 3px rgba(11,93,91,0.1); }
  .nc-input.error { border-color: #ef4444; }
  .nc-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; outline: none; width: 100%; background: #fff; }
  .nc-select:focus { border-color: #0b5d5b; }
  .nc-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; outline: none; resize: vertical; min-height: 80px; width: 100%; }
  .nc-textarea:focus { border-color: #0b5d5b; }
  .nc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .nc-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .nc-error { font-size: 11px; color: #ef4444; }
  .nc-search-wrap { position: relative; }
  .nc-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .nc-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  .nc-search-item:hover { background: #f9fafb; }
  .nc-pac-selected { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .nc-pac-nombre { font-size: 14px; font-weight: 600; color: #065f46; }
  .nc-pac-info { font-size: 12px; color: #6b7280; }
  .nc-cambiar { background: none; border: none; color: #0b5d5b; font-size: 12px; cursor: pointer; font-family: inherit; font-weight: 600; }
  .nc-notif-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; }
  .nc-notif-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 10px; }
  .nc-notif-switch-row { display: flex; align-items: center; justify-content: space-between; }
  .nc-notif-label { font-size: 13px; color: #374151; font-weight: 500; }
  .nc-notif-desc { font-size: 11px; color: #9ca3af; }
  .nc-switch { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
  .nc-switch input { opacity: 0; width: 0; height: 0; }
  .nc-switch-slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; border-radius: 20px; transition: 0.2s; }
  .nc-switch-slider:before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
  input:checked + .nc-switch-slider { background: #dc2626; }
  input:checked + .nc-switch-slider:before { transform: translateX(16px); }
  .nc-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
  .nc-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; color: #374151; }
  .nc-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #0b5d5b; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .nc-btn-save:hover { background: #094e4c; }
  .nc-btn-save:disabled { background: #9ca3af; cursor: not-allowed; }
  .nc-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #065f46; font-size: 13px; margin-bottom: 16px; }
  .nc-empty { text-align: center; padding: 40px; color: #9ca3af; font-size: 13px; }
  .nc-loading { text-align: center; padding: 40px; color: #9ca3af; }

  /* HISTORIAL */
  .nc-nota-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .nc-nota-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .nc-nota-autor { font-size: 13px; font-weight: 600; color: #111827; }
  .nc-nota-rol { font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 20px; }
  .nc-nota-fecha { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .nc-nota-estado { font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 20px; }
  .nc-nota-body { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .nc-nota-campo { font-size: 10px; color: #9ca3af; text-transform: uppercase; margin-bottom: 2px; }
  .nc-nota-valor { font-size: 12px; color: #374151; line-height: 1.5; }
  .nc-nota-obs { font-size: 12px; color: #374151; line-height: 1.5; padding: 8px 12px; background: #fff; border-radius: 6px; border: 1px solid #f3f4f6; margin-bottom: 8px; }
  .nc-nota-acuerdos { font-size: 12px; color: #374151; padding: 6px 10px; background: #eff6ff; border-radius: 6px; border-left: 3px solid #3b82f6; }
  .nc-nota-seguimiento { font-size: 11px; font-weight: 600; color: #d97706; background: #fef9c3; padding: 2px 8px; border-radius: 20px; display: inline-block; }
  .nc-nota-alerta { font-size: 11px; font-weight: 600; color: #dc2626; background: #fee2e2; padding: 2px 8px; border-radius: 20px; display: inline-block; margin-left: 6px; }
  .nc-filtros { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .nc-filtro-btn { padding: 5px 14px; border-radius: 20px; border: 1px solid #e5e7eb; background: #fff; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; color: #374151; transition: all 0.15s; }
  .nc-filtro-btn.active { color: #fff; border-color: transparent; }
`;

export default function NotasClinicas({ rolUsuario, idUsuario }) {
  const [tab, setTab] = useState("historial");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [notas, setNotas] = useState([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [filtroRol, setFiltroRol] = useState("todos");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [errores, setErrores] = useState({});

  const rolCfg = ROL_CONFIG[rolUsuario] || ROL_CONFIG.consejero;
  const now = new Date();

  const [form, setForm] = useState({
    estado_general: "",
    observaciones_generales: "",
    acuerdos_compromisos: "",
    seguimiento_requerido: false,
    // Psicólogo
    tecnica_utilizada: "",
    estado_emocional: "",
    avance_terapeutico: "",
    // Consejero
    tema_tratado: "",
    nivel_motivacion: "",
    acuerdos_consejeria: "",
    // Terapeuta Grupo
    dinamica_grupal: "",
    participacion: "",
    cohesion_grupo: "",
    // Terapeuta Familiar
    tipo_visita: "",
    actitud_familiar: "",
    observaciones_visita: "",
    // Notificación
    notificar_medico: false,
    motivo_notificacion: "",
  });

  useEffect(() => { cargarPacientes(); }, []);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultados([]);
  }, [busqueda]);

  useEffect(() => {
    if (pacienteSeleccionado) cargarNotas(pacienteSeleccionado.id_paciente);
  }, [pacienteSeleccionado]);

  const cargarPacientes = async () => {
    try {
      const data = await fetch(`${BASE}/clinico/pacientes`).then(r => r.json());
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const buscarPacientes = async () => {
    try {
      setBuscando(true);
      const data = await fetch(`${BASE}/clinico/pacientes?busqueda=${busqueda}`).then(r => r.json());
      setResultados(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setBuscando(false); }
  };

  const seleccionarPaciente = (p) => {
    setPacienteSeleccionado(p);
    setBusqueda("");
    setResultados([]);
  };

  const cargarNotas = async (id_paciente) => {
    try {
      setCargandoNotas(true);
      const data = await fetch(`${BASE}/clinico/notas/${id_paciente}`).then(r => r.json());
      setNotas(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setCargandoNotas(false); }
  };

  const validar = () => {
    const e = {};
    if (!pacienteSeleccionado) e.paciente = "Selecciona un paciente";
    if (!form.estado_general) e.estado_general = "Requerido";
    if (!form.observaciones_generales.trim()) e.observaciones_generales = "Requerido";
    if (form.notificar_medico && !form.motivo_notificacion.trim()) e.motivo_notificacion = "Describe el motivo de la notificación";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await fetch(`${BASE}/clinico/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_paciente: pacienteSeleccionado.id_paciente,
          id_usuario: idUsuario,
          rol_clinico: rolUsuario,
          fecha: now.toISOString().split("T")[0],
          hora: `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`,
        })
      });
      setExito(`✅ Nota clínica guardada.${form.notificar_medico ? " Se notificó al área médica." : ""}`);
      cargarNotas(pacienteSeleccionado.id_paciente);
      setTab("historial");
      resetForm();
      setTimeout(() => setExito(null), 6000);
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  const resetForm = () => {
    setForm({
      estado_general: "", observaciones_generales: "", acuerdos_compromisos: "", seguimiento_requerido: false,
      tecnica_utilizada: "", estado_emocional: "", avance_terapeutico: "",
      tema_tratado: "", nivel_motivacion: "", acuerdos_consejeria: "",
      dinamica_grupal: "", participacion: "", cohesion_grupo: "",
      tipo_visita: "", actitud_familiar: "", observaciones_visita: "",
      notificar_medico: false, motivo_notificacion: "",
    });
    setErrores({});
  };

  const notasFiltradas = filtroRol === "todos" ? notas : notas.filter(n => n.rol_clinico === filtroRol);

  return (
    <>
      <style>{styles}</style>
      <div className="nc-wrap">

        {exito && <div className="nc-success">{exito}</div>}

        {/* BUSCADOR PACIENTE */}
        <div className="nc-card">
          <div className="nc-section-title">Paciente</div>
          {pacienteSeleccionado ? (
            <div className="nc-pac-selected">
              <div>
                <div className="nc-pac-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                <div className="nc-pac-info">
                  {pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • {pacienteSeleccionado.dias_tratamiento ?? 0} días de tratamiento
                </div>
                {pacienteSeleccionado.contacto_nombre && (
                  <div className="nc-pac-info">📞 Contacto: {pacienteSeleccionado.contacto_nombre} ({pacienteSeleccionado.contacto_parentesco}) — {pacienteSeleccionado.contacto_telefono}</div>
                )}
              </div>
              <button className="nc-cambiar" onClick={() => { setPacienteSeleccionado(null); setNotas([]); }}>Cambiar</button>
            </div>
          ) : (
            <div className="nc-field">
              <label className="nc-label">Buscar paciente</label>
              <div className="nc-search-wrap">
                <input className={`nc-input ${errores.paciente ? "error" : ""}`} placeholder="Escribe el nombre del paciente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                {busqueda.length >= 2 && (
                  <div className="nc-search-results">
                    {buscando ? <div style={{ padding: "10px 14px", fontSize: 13, color: "#9ca3af" }}>Buscando...</div>
                      : resultados.length === 0 ? <div style={{ padding: "10px 14px", fontSize: 13, color: "#9ca3af" }}>No se encontraron pacientes</div>
                      : resultados.map((p, i) => (
                        <div key={i} className="nc-search-item" onClick={() => seleccionarPaciente(p)}>
                          <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {errores.paciente && <span className="nc-error">{errores.paciente}</span>}
            </div>
          )}
        </div>

        {pacienteSeleccionado && (
          <>
            <div className="nc-tabs">
              <button className={`nc-tab ${tab === "historial" ? "active" : ""}`} onClick={() => setTab("historial")}>📋 Historial Clínico</button>
              <button className={`nc-tab ${tab === "nueva" ? "active" : ""}`} onClick={() => setTab("nueva")}>✏️ Nueva Nota</button>
            </div>

            {/* ===== HISTORIAL ===== */}
            {tab === "historial" && (
              <>
                <div className="nc-filtros">
                  <span style={{ fontSize: 12, color: "#6b7280", alignSelf: "center" }}>Filtrar:</span>
                  {[{ key: "todos", label: "Todos" }, ...Object.entries(ROL_CONFIG).map(([k, v]) => ({ key: k, label: `${v.icon} ${v.label}` }))].map(f => (
                    <button key={f.key} className={`nc-filtro-btn ${filtroRol === f.key ? "active" : ""}`}
                      style={filtroRol === f.key ? { background: ROL_CONFIG[f.key]?.color || "#0b5d5b" } : {}}
                      onClick={() => setFiltroRol(f.key)}>{f.label}</button>
                  ))}
                </div>

                {cargandoNotas ? <div className="nc-loading">Cargando historial...</div>
                  : notasFiltradas.length === 0 ? <div className="nc-empty">No hay notas clínicas registradas{filtroRol !== "todos" ? ` para ${ROL_CONFIG[filtroRol]?.label}` : ""}</div>
                  : notasFiltradas.map((n, i) => {
                    const rcfg = ROL_CONFIG[n.rol_clinico] || { label: n.rol_clinico, icon: "📝", color: "#374151", bg: "#f9fafb" };
                    const ecfg = ESTADO_COLORS[n.estado_general] || { bg: "#f3f4f6", color: "#6b7280" };
                    return (
                      <div className="nc-nota-item" key={i} style={{ borderLeft: `4px solid ${rcfg.color}` }}>
                        <div className="nc-nota-header">
                          <div>
                            <div className="nc-nota-autor">
                              {rcfg.icon} {n.nombre_clinico}
                              {n.seguimiento_requerido && <span className="nc-nota-seguimiento" style={{ marginLeft: 8 }}>⚠ Seguimiento requerido</span>}
                              {n.notificar_medico && <span className="nc-nota-alerta">🚨 Alerta médica enviada</span>}
                            </div>
                            <div className="nc-nota-fecha">📅 {n.fecha ? new Date(n.fecha).toLocaleDateString("es-MX") : "—"} • {n.hora ? n.hora.slice(0,5) : "—"} hrs</div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
                            <span className="nc-nota-rol" style={{ background: rcfg.bg, color: rcfg.color }}>{rcfg.label}</span>
                            <span className="nc-nota-estado" style={{ background: ecfg.bg, color: ecfg.color }}>{n.estado_general}</span>
                          </div>
                        </div>

                        {n.observaciones_generales && (
                          <div className="nc-nota-obs">📝 {n.observaciones_generales}</div>
                        )}

                        {/* Campos específicos por rol */}
                        <div className="nc-nota-body">
                          {n.rol_clinico === "psicologo" && (
                            <>
                              {n.tecnica_utilizada && <div><div className="nc-nota-campo">Técnica utilizada</div><div className="nc-nota-valor">{n.tecnica_utilizada}</div></div>}
                              {n.estado_emocional && <div><div className="nc-nota-campo">Estado emocional</div><div className="nc-nota-valor">{n.estado_emocional}</div></div>}
                              {n.avance_terapeutico && <div><div className="nc-nota-campo">Avance terapéutico</div><div className="nc-nota-valor">{n.avance_terapeutico}</div></div>}
                            </>
                          )}
                          {n.rol_clinico === "consejero" && (
                            <>
                              {n.tema_tratado && <div><div className="nc-nota-campo">Tema tratado</div><div className="nc-nota-valor">{n.tema_tratado}</div></div>}
                              {n.nivel_motivacion && <div><div className="nc-nota-campo">Nivel de motivación</div><div className="nc-nota-valor">{n.nivel_motivacion}</div></div>}
                            </>
                          )}
                          {n.rol_clinico === "terapeuta_grupo" && (
                            <>
                              {n.dinamica_grupal && <div><div className="nc-nota-campo">Dinámica grupal</div><div className="nc-nota-valor">{n.dinamica_grupal}</div></div>}
                              {n.participacion && <div><div className="nc-nota-campo">Participación</div><div className="nc-nota-valor">{n.participacion}</div></div>}
                              {n.cohesion_grupo && <div><div className="nc-nota-campo">Cohesión del grupo</div><div className="nc-nota-valor">{n.cohesion_grupo}</div></div>}
                            </>
                          )}
                          {n.rol_clinico === "terapeuta_familiar" && (
                            <>
                              {n.tipo_visita && <div><div className="nc-nota-campo">Tipo de visita</div><div className="nc-nota-valor">{n.tipo_visita}</div></div>}
                              {n.actitud_familiar && <div><div className="nc-nota-campo">Actitud del familiar</div><div className="nc-nota-valor">{n.actitud_familiar}</div></div>}
                              {n.observaciones_visita && <div><div className="nc-nota-campo">Observaciones visita</div><div className="nc-nota-valor">{n.observaciones_visita}</div></div>}
                            </>
                          )}
                        </div>

                        {n.acuerdos_compromisos && (
                          <div className="nc-nota-acuerdos">📌 <strong>Acuerdos:</strong> {n.acuerdos_compromisos}</div>
                        )}
                        {(n.rol_clinico === "consejero" && n.acuerdos_consejeria) && (
                          <div className="nc-nota-acuerdos" style={{ marginTop: 6 }}>📌 <strong>Acuerdos de consejería:</strong> {n.acuerdos_consejeria}</div>
                        )}
                        {n.notificar_medico && n.motivo_notificacion && (
                          <div style={{ fontSize: 12, color: "#dc2626", background: "#fff5f5", padding: "6px 10px", borderRadius: 6, marginTop: 8, borderLeft: "3px solid #dc2626" }}>
                            🚨 <strong>Motivo alerta médica:</strong> {n.motivo_notificacion}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}

            {/* ===== NUEVA NOTA ===== */}
            {tab === "nueva" && (
              <>
                {/* CAMPOS GENERALES */}
                <div className="nc-card">
                  <div className="nc-section-title">📋 Información General</div>

                  <div className="nc-field">
                    <label className="nc-label">Estado General del Paciente *</label>
                    <select className={`nc-select ${errores.estado_general ? "error" : ""}`} value={form.estado_general}
                      onChange={e => { setForm({ ...form, estado_general: e.target.value }); setErrores(p => ({ ...p, estado_general: undefined })); }}>
                      <option value="">Seleccionar...</option>
                      {ESTADO_GENERAL.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    {errores.estado_general && <span className="nc-error">{errores.estado_general}</span>}
                  </div>

                  <div className="nc-field">
                    <label className="nc-label">Observaciones Generales *</label>
                    <textarea className={`nc-textarea ${errores.observaciones_generales ? "error" : ""}`}
                      placeholder="Describe el estado general del paciente en esta sesión..."
                      value={form.observaciones_generales}
                      onChange={e => { setForm({ ...form, observaciones_generales: e.target.value }); setErrores(p => ({ ...p, observaciones_generales: undefined })); }} />
                    {errores.observaciones_generales && <span className="nc-error">{errores.observaciones_generales}</span>}
                  </div>

                  <div className="nc-field">
                    <label className="nc-label">Acuerdos y Compromisos</label>
                    <textarea className="nc-textarea" placeholder="Acuerdos alcanzados con el paciente..." value={form.acuerdos_compromisos} onChange={e => setForm({ ...form, acuerdos_compromisos: e.target.value })} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                    <input type="checkbox" id="seguimiento" checked={form.seguimiento_requerido} onChange={e => setForm({ ...form, seguimiento_requerido: e.target.checked })} />
                    <label htmlFor="seguimiento" style={{ fontSize: 13, color: "#374151", cursor: "pointer" }}>⚠ Requiere seguimiento especial</label>
                  </div>
                </div>

                {/* CAMPOS ESPECÍFICOS POR ROL */}
                <div className="nc-card">
                  <div className="nc-section-title" style={{ color: rolCfg.color }}>
                    {rolCfg.icon} Campos de {rolCfg.label}
                  </div>

                  {rolUsuario === "psicologo" && (
                    <>
                      <div className="nc-field">
                        <label className="nc-label">Técnica Utilizada</label>
                        <input className="nc-input" placeholder="ej. TCC, Mindfulness, Entrevista motivacional..." value={form.tecnica_utilizada} onChange={e => setForm({ ...form, tecnica_utilizada: e.target.value })} />
                      </div>
                      <div className="nc-grid-2">
                        <div className="nc-field" style={{ marginBottom: 0 }}>
                          <label className="nc-label">Estado Emocional</label>
                          <select className="nc-select" value={form.estado_emocional} onChange={e => setForm({ ...form, estado_emocional: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {["Tranquilo", "Ansioso", "Deprimido", "Irritable", "Motivado", "Apático", "Inestable"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div className="nc-field" style={{ marginBottom: 0 }}>
                          <label className="nc-label">Avance Terapéutico</label>
                          <select className="nc-select" value={form.avance_terapeutico} onChange={e => setForm({ ...form, avance_terapeutico: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {["Significativo", "Moderado", "Leve", "Sin avance", "Retroceso"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {rolUsuario === "consejero" && (
                    <>
                      <div className="nc-field">
                        <label className="nc-label">Tema Tratado</label>
                        <input className="nc-input" placeholder="ej. Manejo de emociones, Prevención de recaídas..." value={form.tema_tratado} onChange={e => setForm({ ...form, tema_tratado: e.target.value })} />
                      </div>
                      <div className="nc-field">
                        <label className="nc-label">Nivel de Motivación</label>
                        <select className="nc-select" value={form.nivel_motivacion} onChange={e => setForm({ ...form, nivel_motivacion: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {["Alto", "Moderado", "Bajo", "Sin motivación"].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="nc-field">
                        <label className="nc-label">Acuerdos de Consejería</label>
                        <textarea className="nc-textarea" placeholder="Compromisos específicos de la sesión de consejería..." value={form.acuerdos_consejeria} onChange={e => setForm({ ...form, acuerdos_consejeria: e.target.value })} />
                      </div>
                    </>
                  )}

                  {rolUsuario === "terapeuta_grupo" && (
                    <>
                      <div className="nc-field">
                        <label className="nc-label">Dinámica Grupal</label>
                        <input className="nc-input" placeholder="ej. Terapia de arte, Grupo de apoyo, Psicodrama..." value={form.dinamica_grupal} onChange={e => setForm({ ...form, dinamica_grupal: e.target.value })} />
                      </div>
                      <div className="nc-grid-2">
                        <div className="nc-field" style={{ marginBottom: 0 }}>
                          <label className="nc-label">Participación del Paciente</label>
                          <select className="nc-select" value={form.participacion} onChange={e => setForm({ ...form, participacion: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {["Activa", "Moderada", "Pasiva", "Disruptiva", "Ausente"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div className="nc-field" style={{ marginBottom: 0 }}>
                          <label className="nc-label">Cohesión del Grupo</label>
                          <select className="nc-select" value={form.cohesion_grupo} onChange={e => setForm({ ...form, cohesion_grupo: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {["Alta", "Moderada", "Baja", "Conflictiva"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {rolUsuario === "terapeuta_familiar" && (
                    <>
                      <div className="nc-grid-2">
                        <div className="nc-field" style={{ marginBottom: 0 }}>
                          <label className="nc-label">Tipo de Visita</label>
                          <select className="nc-select" value={form.tipo_visita} onChange={e => setForm({ ...form, tipo_visita: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {["Visita familiar", "Sesión terapéutica", "Llamada telefónica", "Entrega de medicamento", "Reunión informativa"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div className="nc-field" style={{ marginBottom: 0 }}>
                          <label className="nc-label">Actitud del Familiar</label>
                          <select className="nc-select" value={form.actitud_familiar} onChange={e => setForm({ ...form, actitud_familiar: e.target.value })}>
                            <option value="">Seleccionar...</option>
                            {["Muy colaborador", "Colaborador", "Indiferente", "Resistente", "Conflictivo"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="nc-field" style={{ marginTop: 14 }}>
                        <label className="nc-label">Observaciones de la Visita</label>
                        <textarea className="nc-textarea" placeholder="Describe cómo fue la visita, qué se habló, estado del familiar..." value={form.observaciones_visita} onChange={e => setForm({ ...form, observaciones_visita: e.target.value })} />
                      </div>
                    </>
                  )}
                </div>

                {/* NOTIFICACIÓN MÉDICA */}
                <div className="nc-notif-box">
                  <div className="nc-notif-title">🚨 Notificación al Área Médica</div>
                  <div className="nc-notif-switch-row">
                    <div>
                      <div className="nc-notif-label">Notificar a médico y jefe médico</div>
                      <div className="nc-notif-desc">Úsalo si hay malestar físico o se requiere asistencia médica inmediata</div>
                    </div>
                    <label className="nc-switch">
                      <input type="checkbox" checked={form.notificar_medico} onChange={e => setForm({ ...form, notificar_medico: e.target.checked, motivo_notificacion: "" })} />
                      <span className="nc-switch-slider"></span>
                    </label>
                  </div>
                  {form.notificar_medico && (
                    <div className="nc-field" style={{ marginTop: 12, marginBottom: 0 }}>
                      <label className="nc-label">Motivo de la notificación *</label>
                      <textarea className={`nc-textarea ${errores.motivo_notificacion ? "error" : ""}`}
                        placeholder="Describe el malestar o situación que requiere atención médica..."
                        value={form.motivo_notificacion}
                        onChange={e => { setForm({ ...form, motivo_notificacion: e.target.value }); setErrores(p => ({ ...p, motivo_notificacion: undefined })); }} />
                      {errores.motivo_notificacion && <span className="nc-error">{errores.motivo_notificacion}</span>}
                    </div>
                  )}
                </div>

                <div className="nc-footer">
                  <button className="nc-btn-cancel" onClick={() => { setTab("historial"); resetForm(); }}>Cancelar</button>
                  <button className="nc-btn-save" onClick={handleGuardar} disabled={guardando}>
                    {guardando ? "Guardando..." : "💾 Guardar Nota"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}