import { useState, useEffect } from "react";
import {
  obtenerPacientes, obtenerProtocolo, crearProtocolo,
  obtenerValoracion, obtenerSeguimientos, crearSeguimiento
} from "../../services/medicoService";

const styles = `
  .dex-container { padding: 0; }
  .dex-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .dex-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .dex-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .dex-tab { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; transition: all 0.15s; }
  .dex-tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  .dex-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .dex-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .dex-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .dex-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
  .dex-field { display: flex; flex-direction: column; gap: 6px; }
  .dex-label { font-size: 12px; color: #374151; font-weight: 500; }
  .dex-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .dex-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .dex-input.error { border-color: #ef4444; }
  .dex-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 80px; transition: border 0.15s; width: 100%; }
  .dex-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .dex-textarea.error { border-color: #ef4444; }
  .dex-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .dex-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .dex-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .dex-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .dex-btn-save:hover { background: #2563eb; }
  .dex-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .dex-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .dex-warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; color: #92400e; font-size: 13px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 10px; }
  .dex-search-wrap { position: relative; }
  .dex-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .dex-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .dex-search-item:last-child { border-bottom: none; }
  .dex-search-item:hover { background: #f9fafb; }
  .dex-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .dex-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .dex-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .dex-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .dex-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .dex-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
  .dex-ciwa-info { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #0369a1; margin-bottom: 16px; }
  .dex-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; background: #fff; }
  .dex-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .dex-select.error { border-color: #ef4444; }
  .dex-protocolo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .dex-protocolo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
  .dex-protocolo-label { font-size: 11px; color: #9ca3af; margin-bottom: 2px; text-transform: uppercase; }
  .dex-protocolo-value { font-size: 13px; color: #374151; font-weight: 500; }
  .dex-lista-item { padding: 20px; border-bottom: 1px solid #f3f4f6; }
  .dex-lista-item:last-child { border-bottom: none; }
  .dex-lista-nombre { font-size: 15px; font-weight: 600; color: #111827; }
  .dex-lista-info { font-size: 12px; color: #6b7280; margin-top: 2px; margin-bottom: 12px; }
  .dex-ciwa-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .dex-ciwa-badge.leve { background: #f0fdf4; color: #16a34a; }
  .dex-ciwa-badge.moderado { background: #fefce8; color: #ca8a04; }
  .dex-ciwa-badge.severo { background: #fff1f2; color: #ef4444; }

  /* SEGUIMIENTO */
  .dex-seg-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .dex-seg-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 12px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; }
  .dex-seg-btn:hover { background: #2563eb; }
  .dex-seg-toggle { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151; font-size: 12px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; }
  .dex-seg-toggle:hover { border-color: #3b82f6; color: #3b82f6; }
  .dex-seg-panel { margin-top: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
  .dex-seg-form { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  .dex-seg-form-title { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .dex-seg-historial-title { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .dex-seg-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
  .dex-seg-item:last-child { margin-bottom: 0; }
  .dex-seg-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .dex-seg-item-fecha { font-size: 12px; font-weight: 600; color: #111827; }
  .dex-seg-item-usuario { font-size: 11px; color: #9ca3af; }
  .dex-seg-item-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px; }
  .dex-seg-item-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
  .dex-seg-item-value { font-size: 12px; color: #374151; font-weight: 500; }
  .dex-seg-item-obs { font-size: 12px; color: #6b7280; margin-top: 6px; padding-top: 6px; border-top: 1px solid #f3f4f6; }
  .dex-seg-empty { text-align: center; padding: 20px; color: #9ca3af; font-size: 13px; }
  .dex-btn-seg-save { padding: 8px 16px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 12px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; }
  .dex-btn-seg-save:hover { background: #2563eb; }
  .dex-btn-seg-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .dex-btn-seg-cancel { padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
`;

const formInicial = {
  fecha_inicio: new Date().toISOString().split("T")[0],
  duracion_estimada: "",
  sustancia_principal: "",
  severidad_sindrome: "",
  sintomas_abstinencia: "",
  puntuacion_ciwa: "",
  protocolo_sedacion: "",
  suplementacion_vitaminica: "",
  hidratacion_electrolitos: "",
  frecuencia_monitoreo: "",
  medicacion_prn: "",
  indicaciones_medicacion_rescate: "",
  precauciones_especiales: "",
  contraindicaciones: "",
  observaciones_adicionales: ""
};

const segInicial = {
  presion_arterial: "",
  frecuencia_cardiaca: "",
  temperatura: "",
  glucosa: "",
  puntuacion_ciwa: "",
  estado_general: "",
  observaciones: ""
};

function ciwaLabel(val) {
  if (val === "" || val === null || val === undefined) return null;
  const n = parseFloat(val);
  if (n < 10) return <span className="dex-ciwa-badge leve">🟢 Leve</span>;
  if (n <= 15) return <span className="dex-ciwa-badge moderado">🟡 Moderado</span>;
  return <span className="dex-ciwa-badge severo">🔴 Severo</span>;
}

function SeguimientoPanel({ protocolo, usuario }) {
  const [abierto, setAbierto] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [seguimientos, setSeguimientos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [form, setForm] = useState(segInicial);
  const [errores, setErrores] = useState({});

  const ahora = new Date();
  const fechaHoy = ahora.toISOString().split("T")[0];
  const horaActual = ahora.toTimeString().slice(0, 5);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await obtenerSeguimientos(protocolo.id_protocolo);
      setSeguimientos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrir = () => {
    if (!abierto) cargar();
    setAbierto(!abierto);
    setMostrarForm(false);
  };

  const handleNuevo = () => {
    if (!abierto) { setAbierto(true); cargar(); }
    setMostrarForm(true);
  };

  const validar = () => {
    const e = {};
    if (!form.presion_arterial) e.presion_arterial = "Requerido";
    if (!form.frecuencia_cardiaca) e.frecuencia_cardiaca = "Requerido";
    if (!form.temperatura) e.temperatura = "Requerido";
    if (!form.estado_general) e.estado_general = "Requerido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await crearSeguimiento({
        ...form,
        id_protocolo: protocolo.id_protocolo,
        id_paciente: protocolo.id_paciente,
        id_usuario: usuario.id_usuario,
        fecha: fechaHoy,
        hora: horaActual,
        frecuencia_cardiaca: form.frecuencia_cardiaca ? parseInt(form.frecuencia_cardiaca) : null,
        temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
        glucosa: form.glucosa ? parseFloat(form.glucosa) : null,
        puntuacion_ciwa: form.puntuacion_ciwa ? parseFloat(form.puntuacion_ciwa) : null,
      });
      setExito(true);
      setForm(segInicial);
      setMostrarForm(false);
      cargar();
      setTimeout(() => setExito(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="dex-seg-actions">
        <button className="dex-seg-btn" onClick={handleNuevo}>
          ➕ Registrar Seguimiento
        </button>
        <button className="dex-seg-toggle" onClick={handleAbrir}>
          📋 {abierto ? "Ocultar" : "Ver"} Historial {seguimientos.length > 0 ? `(${seguimientos.length})` : ""}
        </button>
      </div>

      {exito && <div className="dex-success" style={{ marginTop: 10 }}>✅ Seguimiento registrado correctamente.</div>}

      {abierto && (
        <div className="dex-seg-panel">

          {/* FORMULARIO */}
          {mostrarForm && (
            <div className="dex-seg-form">
              <div className="dex-seg-form-title">📝 Nuevo Seguimiento — {fechaHoy} {horaActual}</div>

              <div className="dex-grid-4">
                <div className="dex-field">
                  <label className="dex-label">Presión Arterial *</label>
                  <input className={`dex-input ${errores.presion_arterial ? "error" : ""}`} placeholder="120/80" value={form.presion_arterial} onChange={e => setForm({ ...form, presion_arterial: e.target.value })} />
                  {errores.presion_arterial && <span className="dex-error-msg">{errores.presion_arterial}</span>}
                </div>
                <div className="dex-field">
                  <label className="dex-label">Frec. Cardíaca (lpm) *</label>
                  <input className={`dex-input ${errores.frecuencia_cardiaca ? "error" : ""}`} type="number" placeholder="70" value={form.frecuencia_cardiaca} onChange={e => setForm({ ...form, frecuencia_cardiaca: e.target.value })} />
                  {errores.frecuencia_cardiaca && <span className="dex-error-msg">{errores.frecuencia_cardiaca}</span>}
                </div>
                <div className="dex-field">
                  <label className="dex-label">Temperatura (°C) *</label>
                  <input className={`dex-input ${errores.temperatura ? "error" : ""}`} type="number" step="0.1" placeholder="36.5" value={form.temperatura} onChange={e => setForm({ ...form, temperatura: e.target.value })} />
                  {errores.temperatura && <span className="dex-error-msg">{errores.temperatura}</span>}
                </div>
                <div className="dex-field">
                  <label className="dex-label">Glucosa (mg/dL)</label>
                  <input className="dex-input" type="number" placeholder="90" value={form.glucosa} onChange={e => setForm({ ...form, glucosa: e.target.value })} />
                </div>
              </div>

              <div className="dex-grid" style={{ marginBottom: 12 }}>
                <div className="dex-field">
                  <label className="dex-label">Puntuación CIWA-Ar (0-47)</label>
                  <input className="dex-input" type="number" min="0" max="47" placeholder="ej. 8" value={form.puntuacion_ciwa} onChange={e => setForm({ ...form, puntuacion_ciwa: e.target.value })} />
                  <span style={{ fontSize: 11 }}>{ciwaLabel(form.puntuacion_ciwa)}</span>
                </div>
                <div className="dex-field">
                  <label className="dex-label">Estado General *</label>
                  <select className={`dex-select ${errores.estado_general ? "error" : ""}`} value={form.estado_general} onChange={e => setForm({ ...form, estado_general: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    <option value="Estable">Estable</option>
                    <option value="Mejorando">Mejorando</option>
                    <option value="Sin cambios">Sin cambios</option>
                    <option value="Empeorando">Empeorando</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                  {errores.estado_general && <span className="dex-error-msg">{errores.estado_general}</span>}
                </div>
              </div>

              <div className="dex-field" style={{ marginBottom: 12 }}>
                <label className="dex-label">Observaciones</label>
                <textarea className="dex-textarea" style={{ minHeight: 60 }} placeholder="Observaciones del seguimiento, cambios en el estado del paciente..." value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="dex-btn-seg-cancel" onClick={() => { setMostrarForm(false); setForm(segInicial); setErrores({}); }}>Cancelar</button>
                <button className="dex-btn-seg-save" onClick={handleGuardar} disabled={guardando}>
                  💾 {guardando ? "Guardando..." : "Guardar Seguimiento"}
                </button>
              </div>
            </div>
          )}

          {/* HISTORIAL */}
          <div className="dex-seg-historial-title">📋 Historial de Seguimientos</div>
          {cargando ? (
            <div className="dex-seg-empty">Cargando...</div>
          ) : seguimientos.length === 0 ? (
            <div className="dex-seg-empty">No hay seguimientos registrados aún</div>
          ) : (
            seguimientos.map((s, i) => (
              <div className="dex-seg-item" key={i}>
                <div className="dex-seg-item-header">
                  <span className="dex-seg-item-fecha">📅 {s.fecha ? new Date(s.fecha).toLocaleDateString() : "—"} — {s.hora || "—"}</span>
                  <span className="dex-seg-item-usuario">{s.nombre_usuario}</span>
                </div>
                <div className="dex-seg-item-grid">
                  <div className="dex-seg-item-field">
                    <div className="dex-seg-item-label">Presión</div>
                    <div className="dex-seg-item-value">{s.presion_arterial || "—"}</div>
                  </div>
                  <div className="dex-seg-item-field">
                    <div className="dex-seg-item-label">F. Cardíaca</div>
                    <div className="dex-seg-item-value">{s.frecuencia_cardiaca ? `${s.frecuencia_cardiaca} lpm` : "—"}</div>
                  </div>
                  <div className="dex-seg-item-field">
                    <div className="dex-seg-item-label">Temperatura</div>
                    <div className="dex-seg-item-value">{s.temperatura ? `${s.temperatura}°C` : "—"}</div>
                  </div>
                  <div className="dex-seg-item-field">
                    <div className="dex-seg-item-label">Glucosa</div>
                    <div className="dex-seg-item-value">{s.glucosa ? `${s.glucosa} mg/dL` : "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                  <div className="dex-seg-item-field">
                    <div className="dex-seg-item-label">CIWA-Ar</div>
                    <div className="dex-seg-item-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {s.puntuacion_ciwa ?? "—"} {s.puntuacion_ciwa != null && ciwaLabel(s.puntuacion_ciwa)}
                    </div>
                  </div>
                  <div className="dex-seg-item-field">
                    <div className="dex-seg-item-label">Estado General</div>
                    <div className="dex-seg-item-value">{s.estado_general || "—"}</div>
                  </div>
                </div>
                {s.observaciones && <div className="dex-seg-item-obs">💬 {s.observaciones}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Desintoxicacion({ rol }) {
  const [tab, setTab] = useState("lista");
  const [protocolos, setProtocolos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [errores, setErrores] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [cargandoValoracion, setCargandoValoracion] = useState(false);
  const [form, setForm] = useState(formInicial);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esReadOnly = rol === "enfermera";

  useEffect(() => { cargarProtocolos(); }, []);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientesAptos();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  useEffect(() => {
    if (pacienteSeleccionado) cargarValoracionPaciente(pacienteSeleccionado.id_paciente);
  }, [pacienteSeleccionado]);

  const cargarValoracionPaciente = async (id_paciente) => {
    try {
      setCargandoValoracion(true);
      const data = await obtenerValoracion(id_paciente);
      const valoracion = Array.isArray(data) && data.length > 0 ? data[0] : null;
      setForm(f => ({
        ...f,
        sustancia_principal: valoracion?.sustancia_principal || "",
        fecha_inicio: new Date().toISOString().split("T")[0]
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoValoracion(false);
    }
  };

  const cargarProtocolos = async () => {
    try {
      setCargando(true);
      const pacientes = await obtenerPacientes("todos", "");
      const conExpediente = pacientes.filter(p => p.id_expediente);
      const todos = [];
      for (const p of conExpediente) {
        const data = await obtenerProtocolo(p.id_paciente);
        if (data && data.length > 0) {
          todos.push({ ...data[0], nombre: p.nombre, apellido: p.apellido });
        }
      }
      setProtocolos(todos);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const buscarPacientesAptos = async () => {
    try {
      setBuscando(true);
      const data = await obtenerPacientes("todos", busqueda);
      setResultadosBusqueda(data.filter(p => p.id_expediente));
    } catch (error) {
      console.error(error);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarPaciente = (p) => {
    setPacienteSeleccionado(p);
    setBusqueda("");
    setResultadosBusqueda([]);
  };

  const validar = () => {
    const e = {};
    if (!pacienteSeleccionado) e.paciente = "Selecciona un paciente";
    if (!form.sustancia_principal) e.sustancia_principal = "Requerido";
    if (!form.severidad_sindrome) e.severidad_sindrome = "Requerido";
    if (!form.sintomas_abstinencia) e.sintomas_abstinencia = "Requerido";
    if (!form.protocolo_sedacion) e.protocolo_sedacion = "Requerido";
    if (!form.frecuencia_monitoreo) e.frecuencia_monitoreo = "Requerido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await crearProtocolo({
        ...form,
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        puntuacion_ciwa: form.puntuacion_ciwa ? parseFloat(form.puntuacion_ciwa) : null
      });
      setExito("✅ Protocolo de desintoxicación guardado correctamente.");
      cargarProtocolos();
      setTab("lista");
      resetForm();
      setTimeout(() => setExito(null), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const resetForm = () => {
    setPacienteSeleccionado(null);
    setForm(formInicial);
    setErrores({});
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dex-container">
        <h1 className="dex-title">Protocolo de Desintoxicación</h1>
        <p className="dex-subtitle">Manejo del síndrome de abstinencia</p>

        {exito && <div className="dex-success">{exito}</div>}

        <div className="dex-tabs">
          <button className={`dex-tab ${tab === "lista" ? "active" : ""}`} onClick={() => setTab("lista")}>
            Protocolos Registrados
          </button>
          {!esReadOnly && (
            <button className={`dex-tab ${tab === "nuevo" ? "active" : ""}`} onClick={() => setTab("nuevo")}>
              Nuevo Protocolo
            </button>
          )}
        </div>

        {/* LISTA */}
        {tab === "lista" && (
          <div className="dex-card">
            {cargando ? (
              <div className="dex-empty">Cargando protocolos...</div>
            ) : protocolos.length === 0 ? (
              <div className="dex-empty">No hay protocolos de desintoxicación registrados</div>
            ) : (
              protocolos.map((p, i) => (
                <div className="dex-lista-item" key={i}>
                  <div className="dex-protocolo-header">
                    <div>
                      <div className="dex-lista-nombre">{p.nombre} {p.apellido}</div>
                      <div className="dex-lista-info">Dr. {p.nombre_medico} • Inicio: {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : "—"}{p.duracion_estimada && ` • Duración: ${p.duracion_estimada}`}</div>
                    </div>
                  </div>
                  <div className="dex-protocolo-grid">
                    <div>
                      <div className="dex-protocolo-label">Sustancia</div>
                      <div className="dex-protocolo-value">{p.sustancia_principal || "—"}</div>
                    </div>
                    <div>
                      <div className="dex-protocolo-label">Severidad</div>
                      <div className="dex-protocolo-value">{p.severidad_sindrome || "—"}</div>
                    </div>
                    <div>
                      <div className="dex-protocolo-label">CIWA-Ar inicial</div>
                      <div className="dex-protocolo-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {p.puntuacion_ciwa ?? "—"} {p.puntuacion_ciwa != null && ciwaLabel(p.puntuacion_ciwa)}
                      </div>
                    </div>
                    <div>
                      <div className="dex-protocolo-label">Monitoreo</div>
                      <div className="dex-protocolo-value">{p.frecuencia_monitoreo || "—"}</div>
                    </div>
                  </div>
                  <SeguimientoPanel protocolo={p} usuario={usuario} />
                </div>
              ))
            )}
          </div>
        )}

        {/* NUEVO PROTOCOLO */}
        {tab === "nuevo" && !esReadOnly && (
          <>
            <div className="dex-card">
              <div className="dex-section-title">Paciente</div>
              <div className="dex-warning">
                <span>⚠️</span>
                <span>Solo se muestran pacientes que han sido <strong>valorados y declarados aptos</strong> para el tratamiento (con expediente generado).</span>
              </div>
              {pacienteSeleccionado ? (
                <div className="dex-persona-seleccionada">
                  <div>
                    <div className="dex-persona-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                    <div className="dex-persona-info">{pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • Expediente #{String(pacienteSeleccionado.id_expediente).padStart(3, "0")}</div>
                  </div>
                  <button className="dex-cambiar-btn" onClick={() => setPacienteSeleccionado(null)}>Cambiar</button>
                </div>
              ) : (
                <div className="dex-field">
                  <label className="dex-label">Buscar paciente apto</label>
                  <div className="dex-search-wrap">
                    <input className={`dex-input ${errores.paciente ? "error" : ""}`} placeholder="Escribe el nombre del paciente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                    {busqueda.length >= 2 && (
                      <div className="dex-search-results">
                        {buscando ? <div className="dex-no-resultados">Buscando...</div>
                          : resultadosBusqueda.length === 0 ? <div className="dex-no-resultados">No se encontraron pacientes aptos</div>
                          : resultadosBusqueda.map((p, i) => (
                            <div key={i} className="dex-search-item" onClick={() => seleccionarPaciente(p)}>
                              <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  {errores.paciente && <span className="dex-error-msg">{errores.paciente}</span>}
                </div>
              )}
            </div>

            <div className="dex-card">
              <div className="dex-section-title">Información General</div>
              <div className="dex-grid">
                <div className="dex-field">
                  <label className="dex-label">Fecha de Inicio <span style={{ color: "#9ca3af", fontWeight: 400 }}>(automática)</span></label>
                  <input className="dex-input" type="date" value={form.fecha_inicio} readOnly style={{ background: "#f9fafb", color: "#6b7280", cursor: "not-allowed" }} />
                </div>
                <div className="dex-field">
                  <label className="dex-label">Duración Estimada</label>
                  <input className="dex-input" placeholder="ej. 7 días" value={form.duracion_estimada} onChange={e => setForm({ ...form, duracion_estimada: e.target.value })} />
                </div>
                <div className="dex-field">
                  <label className="dex-label">Sustancia Principal <span style={{ color: "#9ca3af", fontWeight: 400 }}>(de valoración)</span></label>
                  <input className={`dex-input ${errores.sustancia_principal ? "error" : ""}`} value={cargandoValoracion ? "Cargando..." : form.sustancia_principal} readOnly style={{ background: "#f9fafb", color: "#374151", cursor: "not-allowed" }} />
                  {errores.sustancia_principal && <span className="dex-error-msg">{errores.sustancia_principal}</span>}
                </div>
                <div className="dex-field">
                  <label className="dex-label">Severidad del Síndrome</label>
                  <select className={`dex-select ${errores.severidad_sindrome ? "error" : ""}`} value={form.severidad_sindrome} onChange={e => setForm({ ...form, severidad_sindrome: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    <option value="Leve">Leve</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Severo">Severo</option>
                  </select>
                  {errores.severidad_sindrome && <span className="dex-error-msg">{errores.severidad_sindrome}</span>}
                </div>
              </div>
            </div>

            <div className="dex-card">
              <div className="dex-section-title">Evaluación de Síntomas</div>
              <div className="dex-ciwa-info">
                📋 <strong>Escala CIWA-Ar</strong> (Clinical Institute Withdrawal Assessment): Puntuación 0-47. &lt;10 = leve, 10-15 = moderado, &gt;15 = severo.
              </div>
              <div className="dex-grid">
                <div className="dex-field">
                  <label className="dex-label">Síntomas de Abstinencia</label>
                  <textarea className={`dex-textarea ${errores.sintomas_abstinencia ? "error" : ""}`} placeholder="Describir síntomas: temblor, sudoración, ansiedad, náuseas, vómito, taquicardia, hipertensión, etc." value={form.sintomas_abstinencia} onChange={e => setForm({ ...form, sintomas_abstinencia: e.target.value })} />
                  {errores.sintomas_abstinencia && <span className="dex-error-msg">{errores.sintomas_abstinencia}</span>}
                </div>
                <div className="dex-field">
                  <label className="dex-label">Puntuación CIWA-Ar (0-47)</label>
                  <input className="dex-input" type="number" min="0" max="47" placeholder="ej. 12" value={form.puntuacion_ciwa} onChange={e => setForm({ ...form, puntuacion_ciwa: e.target.value })} />
                  <span style={{ fontSize: 11 }}>{ciwaLabel(form.puntuacion_ciwa)}</span>
                </div>
              </div>
            </div>

            <div className="dex-card">
              <div className="dex-section-title">Protocolo de Tratamiento</div>
              <div className="dex-field" style={{ marginBottom: 16 }}>
                <label className="dex-label">Protocolo de Sedación</label>
                <textarea className={`dex-textarea ${errores.protocolo_sedacion ? "error" : ""}`} placeholder="ej. Diazepam 10mg c/6h VO, disminuir según CIWA-Ar" value={form.protocolo_sedacion} onChange={e => setForm({ ...form, protocolo_sedacion: e.target.value })} />
                {errores.protocolo_sedacion && <span className="dex-error-msg">{errores.protocolo_sedacion}</span>}
              </div>
              <div className="dex-grid">
                <div className="dex-field">
                  <label className="dex-label">Suplementación Vitamínica</label>
                  <textarea className="dex-textarea" placeholder="ej. Tiamina 100mg c/8h IV, Ácido Fólico 5mg c/24h VO, Complejo B" value={form.suplementacion_vitaminica} onChange={e => setForm({ ...form, suplementacion_vitaminica: e.target.value })} />
                </div>
                <div className="dex-field">
                  <label className="dex-label">Hidratación y Electrolitos</label>
                  <textarea className="dex-textarea" placeholder="ej. SS 1000ml c/8h IV, reposición de electrolitos según laboratorio" value={form.hidratacion_electrolitos} onChange={e => setForm({ ...form, hidratacion_electrolitos: e.target.value })} />
                </div>
              </div>
              <div className="dex-field">
                <label className="dex-label">Frecuencia de Monitoreo</label>
                <input className={`dex-input ${errores.frecuencia_monitoreo ? "error" : ""}`} placeholder="ej. Signos vitales cada 4 horas, CIWA-Ar cada 8 horas" value={form.frecuencia_monitoreo} onChange={e => setForm({ ...form, frecuencia_monitoreo: e.target.value })} />
                {errores.frecuencia_monitoreo && <span className="dex-error-msg">{errores.frecuencia_monitoreo}</span>}
              </div>
            </div>

            <div className="dex-card">
              <div className="dex-section-title">Medicación de Rescate</div>
              <div className="dex-grid">
                <div className="dex-field">
                  <label className="dex-label">Medicación PRN (Por Razón Necesaria)</label>
                  <textarea className="dex-textarea" placeholder="ej. Haloperidol 5mg IM PRN para agitación severa. Clonazepam 1mg VO PRN para ansiedad" value={form.medicacion_prn} onChange={e => setForm({ ...form, medicacion_prn: e.target.value })} />
                </div>
                <div className="dex-field">
                  <label className="dex-label">Indicaciones para Medicación de Rescate</label>
                  <textarea className="dex-textarea" placeholder="Especificar cuándo y cómo administrar la medicación de rescate" value={form.indicaciones_medicacion_rescate} onChange={e => setForm({ ...form, indicaciones_medicacion_rescate: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="dex-card">
              <div className="dex-section-title">Precauciones y Observaciones</div>
              <div className="dex-grid" style={{ marginBottom: 16 }}>
                <div className="dex-field">
                  <label className="dex-label">Precauciones Especiales</label>
                  <textarea className="dex-textarea" placeholder="Riesgo de convulsiones, delirium, caídas, etc." value={form.precauciones_especiales} onChange={e => setForm({ ...form, precauciones_especiales: e.target.value })} />
                </div>
                <div className="dex-field">
                  <label className="dex-label">Contraindicaciones</label>
                  <textarea className="dex-textarea" placeholder="Alergias, condiciones médicas que limiten el tratamiento" value={form.contraindicaciones} onChange={e => setForm({ ...form, contraindicaciones: e.target.value })} />
                </div>
              </div>
              <div className="dex-field">
                <label className="dex-label">Observaciones Adicionales</label>
                <textarea className="dex-textarea" placeholder="Notas adicionales sobre el protocolo" value={form.observaciones_adicionales} onChange={e => setForm({ ...form, observaciones_adicionales: e.target.value })} />
              </div>
            </div>

            <div className="dex-footer">
              <button className="dex-btn-cancel" onClick={() => { setTab("lista"); resetForm(); }}>Cancelar</button>
              <button className="dex-btn-save" onClick={handleGuardar} disabled={guardando}>
                💾 {guardando ? "Guardando..." : "Guardar Protocolo"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}