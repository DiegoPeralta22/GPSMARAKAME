import { useState, useEffect } from "react";
import { obtenerTodasValoraciones, crearValoracionIndependiente, obtenerPacientes } from "../../services/medicoService";

const styles = `
  .val-container { padding: 0; }
  .val-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .val-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .val-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .val-tab { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; transition: all 0.15s; }
  .val-tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  .val-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .val-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .val-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .val-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
  .val-field { display: flex; flex-direction: column; gap: 6px; }
  .val-label { font-size: 12px; color: #374151; font-weight: 500; }
  .val-label span.req { color: #ef4444; margin-left: 2px; }
  .val-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .val-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .val-input.error { border-color: #ef4444; }
  .val-input[readonly] { background: #f9fafb; color: #6b7280; }
  .val-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; background: #fff; }
  .val-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .val-select.error { border-color: #ef4444; }
  .val-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 80px; transition: border 0.15s; width: 100%; }
  .val-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .val-textarea.error { border-color: #ef4444; }
  .val-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .val-radio-group { display: flex; gap: 16px; align-items: center; margin-top: 8px; }
  .val-radio-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; cursor: pointer; }
  .val-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .val-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .val-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .val-btn-save:hover { background: #2563eb; }
  .val-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .val-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .val-apto-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .val-apto-badge.apto { background: #f0fdf4; color: #16a34a; }
  .val-apto-badge.no-apto { background: #fff1f2; color: #ef4444; }
  .val-search-wrap { position: relative; }
  .val-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .val-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .val-search-item:last-child { border-bottom: none; }
  .val-search-item:hover { background: #f9fafb; }
  .val-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .val-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .val-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .val-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .val-lista-item { padding: 16px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
  .val-lista-item:last-child { border-bottom: none; }
  .val-lista-nombre { font-size: 14px; font-weight: 600; color: #111827; }
  .val-lista-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .val-lista-fecha { font-size: 12px; color: #9ca3af; }
  .val-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
  .val-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .val-required-note { font-size: 11px; color: #9ca3af; margin-bottom: 16px; }
`;

export default function Valoracion({ rol }) {
  const [tab, setTab] = useState("lista");
  const [valoraciones, setValoraciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [errores, setErrores] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const [form, setForm] = useState({
    fecha_valoracion: new Date().toISOString().split("T")[0],
    peso: "", altura: "",
    presion_arterial: "", frecuencia_cardiaca: "",
    temperatura: "", glucosa: "",
    sustancia_principal: "", tiempo_consumo: "",
    frecuencia_consumo: "", ultimo_consumo: "",
    riesgo: "", apto: "", observaciones: "", recomendaciones: ""
  });

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esReadOnly = rol === "enfermera";

  useEffect(() => { cargarValoraciones(); }, []);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPersonas();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  const cargarValoraciones = async () => {
    try {
      setCargando(true);
      const data = await obtenerTodasValoraciones();
      setValoraciones(data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const buscarPersonas = async () => {
    try {
      setBuscando(true);
      const data = await obtenerPacientes("todos", busqueda);
      setResultadosBusqueda(data.filter(p => !p.id_expediente));
    } catch (error) {
      console.error(error);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarPersona = (p) => {
    setPersonaSeleccionada(p);
    setBusqueda("");
    setResultadosBusqueda([]);
    setErrores(prev => ({ ...prev, persona: undefined }));
  };

  const validar = () => {
    const e = {};

    // Paciente
    if (!personaSeleccionada) e.persona = "Selecciona una persona";

    // Datos generales
    if (!form.fecha_valoracion) e.fecha_valoracion = "Requerido";
    if (!form.peso || isNaN(form.peso) || Number(form.peso) <= 0 || Number(form.peso) > 300)
      e.peso = "Ingresa un peso válido (1-300 kg)";
    if (!form.altura || isNaN(form.altura) || Number(form.altura) <= 0 || Number(form.altura) > 250)
      e.altura = "Ingresa una altura válida (1-250 cm)";
    if (!form.riesgo) e.riesgo = "Selecciona el nivel de riesgo";

    // Signos vitales
    if (!form.presion_arterial || !/^\d{2,3}\/\d{2,3}$/.test(form.presion_arterial))
      e.presion_arterial = "Formato requerido: 120/80";
    if (!form.frecuencia_cardiaca || isNaN(form.frecuencia_cardiaca) ||
        Number(form.frecuencia_cardiaca) < 30 || Number(form.frecuencia_cardiaca) > 250)
      e.frecuencia_cardiaca = "Valor válido: 30-250 lpm";
    if (!form.temperatura || isNaN(form.temperatura) ||
        Number(form.temperatura) < 34 || Number(form.temperatura) > 42)
      e.temperatura = "Valor válido: 34-42°C";
    if (!form.glucosa || isNaN(form.glucosa) || Number(form.glucosa) <= 0 || Number(form.glucosa) > 1000)
      e.glucosa = "Ingresa un valor válido";

    // Historia de consumo
    if (!form.sustancia_principal) e.sustancia_principal = "Requerido";
    if (!form.tiempo_consumo) e.tiempo_consumo = "Requerido";
    if (!form.frecuencia_consumo) e.frecuencia_consumo = "Requerido";
    if (!form.ultimo_consumo) e.ultimo_consumo = "Requerido";

    // Conclusión
    if (!form.apto) e.apto = "Selecciona si la persona es apta o no";
    if (!form.observaciones || form.observaciones.trim().length < 10)
      e.observaciones = "Ingresa al menos 10 caracteres";
    if (!form.recomendaciones || form.recomendaciones.trim().length < 10)
      e.recomendaciones = "Ingresa al menos 10 caracteres";

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      setGuardando(true);
      const result = await crearValoracionIndependiente({
        ...form,
        id_paciente: personaSeleccionada.id_paciente,
        id_usuario: usuario.id_usuario
      });
      const msg = result.expediente_creado
        ? "✅ Valoración guardada. Persona marcada como APTA — Expediente creado y Admisión notificada."
        : "✅ Valoración guardada. Persona marcada como NO APTA — Admisión ha sido notificada.";
      setExito(msg);
      cargarValoraciones();
      setTab("lista");
      resetForm();
      setTimeout(() => setExito(null), 6000);
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const resetForm = () => {
    setPersonaSeleccionada(null);
    setForm({
      fecha_valoracion: new Date().toISOString().split("T")[0],
      peso: "", altura: "", presion_arterial: "", frecuencia_cardiaca: "",
      temperatura: "", glucosa: "", sustancia_principal: "", tiempo_consumo: "",
      frecuencia_consumo: "", ultimo_consumo: "", riesgo: "", apto: "",
      observaciones: "", recomendaciones: ""
    });
    setErrores({});
  };

  const f = (key) => ({
    onChange: e => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
      if (errores[key]) setErrores(prev => ({ ...prev, [key]: undefined }));
    }
  });

  return (
    <>
      <style>{styles}</style>
      <div className="val-container">
        <h1 className="val-title">Valoración Médica</h1>
        <p className="val-subtitle">Evaluación inicial para ingreso al tratamiento</p>

        {exito && <div className="val-success">{exito}</div>}

        <div className="val-tabs">
          <button className={`val-tab ${tab === "lista" ? "active" : ""}`} onClick={() => setTab("lista")}>
            Valoraciones Registradas
          </button>
          {!esReadOnly && (
            <button className={`val-tab ${tab === "nueva" ? "active" : ""}`} onClick={() => setTab("nueva")}>
              Nueva Valoración
            </button>
          )}
        </div>

        {/* LISTA */}
        {tab === "lista" && (
          <div className="val-card">
            {cargando ? (
              <div className="val-empty">Cargando valoraciones...</div>
            ) : valoraciones.length === 0 ? (
              <div className="val-empty">No hay valoraciones registradas</div>
            ) : (
              valoraciones.map((v, i) => (
                <div className="val-lista-item" key={i}>
                  <div>
                    <div className="val-lista-nombre">{v.nombre} {v.apellido}</div>
                    <div className="val-lista-info">
                      {v.edad} años • {v.sustancia_principal} • Dr. {v.nombre_medico}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span className={`val-apto-badge ${v.apto ? "apto" : "no-apto"}`}>
                      {v.apto ? "Apto" : "No Apto"}
                    </span>
                    <span className="val-lista-fecha">
                      {v.fecha_valoracion ? new Date(v.fecha_valoracion).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NUEVA VALORACIÓN */}
        {tab === "nueva" && !esReadOnly && (
          <>
            <p className="val-required-note">Los campos marcados con <span style={{ color: "#ef4444" }}>*</span> son obligatorios.</p>

            {/* SELECCIONAR PERSONA */}
            <div className="val-card">
              <div className="val-section-title">Persona a Valorar</div>
              {personaSeleccionada ? (
                <div className="val-persona-seleccionada">
                  <div>
                    <div className="val-persona-nombre">{personaSeleccionada.nombre} {personaSeleccionada.apellido}</div>
                    <div className="val-persona-info">{personaSeleccionada.edad} años • {personaSeleccionada.genero}</div>
                  </div>
                  <button className="val-cambiar-btn" onClick={() => { setPersonaSeleccionada(null); }}>Cambiar</button>
                </div>
              ) : (
                <div className="val-field">
                  <label className="val-label">Buscar por nombre <span className="req">*</span></label>
                  <div className="val-search-wrap">
                    <input
                      className={`val-input ${errores.persona ? "error" : ""}`}
                      placeholder="Escribe el nombre de la persona..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                    />
                    {busqueda.length >= 2 && (
                      <div className="val-search-results">
                        {buscando ? (
                          <div className="val-no-resultados">Buscando...</div>
                        ) : resultadosBusqueda.length === 0 ? (
                          <div className="val-no-resultados">No se encontraron personas pendientes de valoración</div>
                        ) : (
                          resultadosBusqueda.map((p, i) => (
                            <div key={i} className="val-search-item" onClick={() => seleccionarPersona(p)}>
                              <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • {p.genero}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {errores.persona && <span className="val-error-msg">⚠️ {errores.persona}</span>}
                </div>
              )}
            </div>

            {/* DATOS GENERALES */}
            <div className="val-card">
              <div className="val-section-title">Datos Generales</div>
              <div className="val-grid">
                <div className="val-field">
                  <label className="val-label">Fecha de Valoración <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.fecha_valoracion ? "error" : ""}`}
                    type="date"
                    value={form.fecha_valoracion}
                    {...f("fecha_valoracion")}
                  />
                  {errores.fecha_valoracion && <span className="val-error-msg">⚠️ {errores.fecha_valoracion}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Riesgo <span className="req">*</span></label>
                  <select
                    className={`val-select ${errores.riesgo ? "error" : ""}`}
                    value={form.riesgo}
                    {...f("riesgo")}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                  </select>
                  {errores.riesgo && <span className="val-error-msg">⚠️ {errores.riesgo}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Peso (kg) <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.peso ? "error" : ""}`}
                    type="number"
                    placeholder="ej. 70"
                    value={form.peso}
                    {...f("peso")}
                  />
                  {errores.peso && <span className="val-error-msg">⚠️ {errores.peso}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Altura (cm) <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.altura ? "error" : ""}`}
                    type="number"
                    placeholder="ej. 170"
                    value={form.altura}
                    {...f("altura")}
                  />
                  {errores.altura && <span className="val-error-msg">⚠️ {errores.altura}</span>}
                </div>
              </div>
            </div>

            {/* SIGNOS VITALES */}
            <div className="val-card">
              <div className="val-section-title">Signos Vitales</div>
              <div className="val-grid-4">
                <div className="val-field">
                  <label className="val-label">Presión Arterial <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.presion_arterial ? "error" : ""}`}
                    placeholder="120/80"
                    value={form.presion_arterial}
                    {...f("presion_arterial")}
                  />
                  {errores.presion_arterial && <span className="val-error-msg">⚠️ {errores.presion_arterial}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Frecuencia Cardíaca (lpm) <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.frecuencia_cardiaca ? "error" : ""}`}
                    type="number"
                    placeholder="70"
                    value={form.frecuencia_cardiaca}
                    {...f("frecuencia_cardiaca")}
                  />
                  {errores.frecuencia_cardiaca && <span className="val-error-msg">⚠️ {errores.frecuencia_cardiaca}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Temperatura (°C) <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.temperatura ? "error" : ""}`}
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={form.temperatura}
                    {...f("temperatura")}
                  />
                  {errores.temperatura && <span className="val-error-msg">⚠️ {errores.temperatura}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Glucosa (mg/dL) <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.glucosa ? "error" : ""}`}
                    type="number"
                    placeholder="90"
                    value={form.glucosa}
                    {...f("glucosa")}
                  />
                  {errores.glucosa && <span className="val-error-msg">⚠️ {errores.glucosa}</span>}
                </div>
              </div>
            </div>

            {/* HISTORIA DE CONSUMO */}
            <div className="val-card">
              <div className="val-section-title">Historia de Consumo</div>
              <div className="val-grid">
                <div className="val-field">
                  <label className="val-label">Sustancia Principal <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.sustancia_principal ? "error" : ""}`}
                    placeholder="ej. Alcohol"
                    value={form.sustancia_principal}
                    {...f("sustancia_principal")}
                  />
                  {errores.sustancia_principal && <span className="val-error-msg">⚠️ {errores.sustancia_principal}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Tiempo de Consumo <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.tiempo_consumo ? "error" : ""}`}
                    placeholder="ej. 5 años"
                    value={form.tiempo_consumo}
                    {...f("tiempo_consumo")}
                  />
                  {errores.tiempo_consumo && <span className="val-error-msg">⚠️ {errores.tiempo_consumo}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Frecuencia de Consumo <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.frecuencia_consumo ? "error" : ""}`}
                    placeholder="ej. Diario"
                    value={form.frecuencia_consumo}
                    {...f("frecuencia_consumo")}
                  />
                  {errores.frecuencia_consumo && <span className="val-error-msg">⚠️ {errores.frecuencia_consumo}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Último Consumo <span className="req">*</span></label>
                  <input
                    className={`val-input ${errores.ultimo_consumo ? "error" : ""}`}
                    placeholder="ej. Hace 2 días"
                    value={form.ultimo_consumo}
                    {...f("ultimo_consumo")}
                  />
                  {errores.ultimo_consumo && <span className="val-error-msg">⚠️ {errores.ultimo_consumo}</span>}
                </div>
              </div>
            </div>

            {/* CONCLUSIÓN */}
            <div className="val-card">
              <div className="val-section-title">Conclusión de Valoración</div>
              <div className="val-field" style={{ marginBottom: 16 }}>
                <label className="val-label">¿La persona es apta para el tratamiento? <span className="req">*</span></label>
                <div className="val-radio-group">
                  <label className="val-radio-label">
                    <input
                      type="radio"
                      name="apto"
                      value="1"
                      checked={form.apto === "1"}
                      onChange={e => { setForm({ ...form, apto: e.target.value }); setErrores(prev => ({ ...prev, apto: undefined })); }}
                    />
                    Sí, es apta
                  </label>
                  <label className="val-radio-label">
                    <input
                      type="radio"
                      name="apto"
                      value="0"
                      checked={form.apto === "0"}
                      onChange={e => { setForm({ ...form, apto: e.target.value }); setErrores(prev => ({ ...prev, apto: undefined })); }}
                    />
                    No es apta
                  </label>
                </div>
                {errores.apto && <span className="val-error-msg">⚠️ {errores.apto}</span>}
              </div>
              <div className="val-field" style={{ marginBottom: 16 }}>
                <label className="val-label">Observaciones <span className="req">*</span></label>
                <textarea
                  className={`val-textarea ${errores.observaciones ? "error" : ""}`}
                  placeholder="Observaciones generales sobre el estado de la persona (mínimo 10 caracteres)"
                  value={form.observaciones}
                  {...f("observaciones")}
                />
                {errores.observaciones && <span className="val-error-msg">⚠️ {errores.observaciones}</span>}
              </div>
              <div className="val-field">
                <label className="val-label">Recomendaciones <span className="req">*</span></label>
                <textarea
                  className={`val-textarea ${errores.recomendaciones ? "error" : ""}`}
                  placeholder="Recomendaciones y plan de tratamiento inicial (mínimo 10 caracteres)"
                  value={form.recomendaciones}
                  {...f("recomendaciones")}
                />
                {errores.recomendaciones && <span className="val-error-msg">⚠️ {errores.recomendaciones}</span>}
              </div>
            </div>

            <div className="val-footer">
              <button className="val-btn-cancel" onClick={() => { setTab("lista"); resetForm(); }}>Cancelar</button>
              <button className="val-btn-save" onClick={handleGuardar} disabled={guardando}>
                💾 {guardando ? "Guardando..." : "Guardar Valoración"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}