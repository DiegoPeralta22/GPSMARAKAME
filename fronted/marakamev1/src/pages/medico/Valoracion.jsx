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
  .val-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .val-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .val-input.error { border-color: #ef4444; }
  .val-input[readonly] { background: #f9fafb; color: #6b7280; }
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
  .val-readonly-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
  .val-readonly-card { background: #f9fafb; border-radius: 8px; padding: 16px; border: 1px solid #f0f0f0; }
  .val-readonly-label { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
  .val-readonly-value { font-size: 14px; font-weight: 600; color: #111827; }
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

  useEffect(() => {
    cargarValoraciones();
  }, []);

  useEffect(() => {
    if (busqueda.length >= 2) {
      buscarPersonas();
    } else {
      setResultadosBusqueda([]);
    }
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
      // Solo personas SIN expediente (pendientes de valoración)
      const sinExpediente = data.filter(p => !p.id_expediente);
      setResultadosBusqueda(sinExpediente);
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
  };

  const validar = () => {
    const e = {};
    if (!personaSeleccionada) e.persona = "Selecciona una persona";
    if (!form.fecha_valoracion) e.fecha_valoracion = "Requerido";
    if (!form.peso || isNaN(form.peso) || form.peso <= 0) e.peso = "Peso inválido";
    if (!form.altura || isNaN(form.altura) || form.altura <= 0) e.altura = "Altura inválida";
    if (!form.presion_arterial || !/^\d{2,3}\/\d{2,3}$/.test(form.presion_arterial)) e.presion_arterial = "Formato: 120/80";
    if (!form.frecuencia_cardiaca || isNaN(form.frecuencia_cardiaca) || form.frecuencia_cardiaca < 30 || form.frecuencia_cardiaca > 250) e.frecuencia_cardiaca = "30-250 lpm";
    if (!form.temperatura || isNaN(form.temperatura) || form.temperatura < 34 || form.temperatura > 42) e.temperatura = "34-42°C";
    if (!form.glucosa || isNaN(form.glucosa) || form.glucosa <= 0) e.glucosa = "Inválida";
    if (!form.sustancia_principal) e.sustancia_principal = "Requerido";
    if (!form.apto) e.apto = "Selecciona una opción";
    if (!form.observaciones) e.observaciones = "Requerido";
    if (!form.recomendaciones) e.recomendaciones = "Requerido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
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
      setTimeout(() => setExito(null), 5000);
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

        {/* LISTA DE VALORACIONES */}
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
            {/* SELECCIONAR PERSONA */}
            <div className="val-card">
              <div className="val-section-title">Persona a Valorar</div>
              {personaSeleccionada ? (
                <div className="val-persona-seleccionada">
                  <div>
                    <div className="val-persona-nombre">{personaSeleccionada.nombre} {personaSeleccionada.apellido}</div>
                    <div className="val-persona-info">{personaSeleccionada.edad} años • {personaSeleccionada.genero}</div>
                  </div>
                  <button className="val-cambiar-btn" onClick={() => setPersonaSeleccionada(null)}>Cambiar</button>
                </div>
              ) : (
                <div className="val-field">
                  <label className="val-label">Buscar por nombre</label>
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
                          <div className="val-no-resultados">No se encontraron personas sin valoración</div>
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
                  {errores.persona && <span className="val-error-msg">{errores.persona}</span>}
                </div>
              )}
            </div>

            {/* DATOS GENERALES */}
            <div className="val-card">
              <div className="val-section-title">Datos Generales</div>
              <div className="val-grid">
                <div className="val-field">
                  <label className="val-label">Fecha de Valoración</label>
                  <input className={`val-input ${errores.fecha_valoracion ? "error" : ""}`} type="date" value={form.fecha_valoracion} onChange={e => setForm({...form, fecha_valoracion: e.target.value})} />
                  {errores.fecha_valoracion && <span className="val-error-msg">{errores.fecha_valoracion}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Peso (kg)</label>
                  <input className={`val-input ${errores.peso ? "error" : ""}`} type="number" placeholder="ej. 70" value={form.peso} onChange={e => setForm({...form, peso: e.target.value})} />
                  {errores.peso && <span className="val-error-msg">{errores.peso}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Altura (cm)</label>
                  <input className={`val-input ${errores.altura ? "error" : ""}`} type="number" placeholder="ej. 170" value={form.altura} onChange={e => setForm({...form, altura: e.target.value})} />
                  {errores.altura && <span className="val-error-msg">{errores.altura}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Riesgo</label>
                  <input className="val-input" placeholder="ej. Alto, Medio, Bajo" value={form.riesgo} onChange={e => setForm({...form, riesgo: e.target.value})} />
                </div>
              </div>
            </div>

            {/* SIGNOS VITALES */}
            <div className="val-card">
              <div className="val-section-title">Signos Vitales</div>
              <div className="val-grid-4">
                <div className="val-field">
                  <label className="val-label">Presión Arterial</label>
                  <input className={`val-input ${errores.presion_arterial ? "error" : ""}`} placeholder="120/80" value={form.presion_arterial} onChange={e => setForm({...form, presion_arterial: e.target.value})} />
                  {errores.presion_arterial && <span className="val-error-msg">{errores.presion_arterial}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Frecuencia Cardíaca (lpm)</label>
                  <input className={`val-input ${errores.frecuencia_cardiaca ? "error" : ""}`} type="number" placeholder="70" value={form.frecuencia_cardiaca} onChange={e => setForm({...form, frecuencia_cardiaca: e.target.value})} />
                  {errores.frecuencia_cardiaca && <span className="val-error-msg">{errores.frecuencia_cardiaca}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Temperatura (°C)</label>
                  <input className={`val-input ${errores.temperatura ? "error" : ""}`} type="number" step="0.1" placeholder="36.5" value={form.temperatura} onChange={e => setForm({...form, temperatura: e.target.value})} />
                  {errores.temperatura && <span className="val-error-msg">{errores.temperatura}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Glucosa (mg/dL)</label>
                  <input className={`val-input ${errores.glucosa ? "error" : ""}`} type="number" placeholder="90" value={form.glucosa} onChange={e => setForm({...form, glucosa: e.target.value})} />
                  {errores.glucosa && <span className="val-error-msg">{errores.glucosa}</span>}
                </div>
              </div>
            </div>

            {/* HISTORIA DE CONSUMO */}
            <div className="val-card">
              <div className="val-section-title">Historia de Consumo</div>
              <div className="val-grid">
                <div className="val-field">
                  <label className="val-label">Sustancia Principal</label>
                  <input className={`val-input ${errores.sustancia_principal ? "error" : ""}`} placeholder="ej. Alcohol" value={form.sustancia_principal} onChange={e => setForm({...form, sustancia_principal: e.target.value})} />
                  {errores.sustancia_principal && <span className="val-error-msg">{errores.sustancia_principal}</span>}
                </div>
                <div className="val-field">
                  <label className="val-label">Tiempo de Consumo</label>
                  <input className="val-input" placeholder="ej. 5 años" value={form.tiempo_consumo} onChange={e => setForm({...form, tiempo_consumo: e.target.value})} />
                </div>
                <div className="val-field">
                  <label className="val-label">Frecuencia de Consumo</label>
                  <input className="val-input" placeholder="ej. Diario" value={form.frecuencia_consumo} onChange={e => setForm({...form, frecuencia_consumo: e.target.value})} />
                </div>
                <div className="val-field">
                  <label className="val-label">Último Consumo</label>
                  <input className="val-input" placeholder="ej. Hace 2 días" value={form.ultimo_consumo} onChange={e => setForm({...form, ultimo_consumo: e.target.value})} />
                </div>
              </div>
            </div>

            {/* CONCLUSIÓN */}
            <div className="val-card">
              <div className="val-section-title">Conclusión de Valoración</div>
              <div className="val-field" style={{ marginBottom: 16 }}>
                <label className="val-label">¿La persona es apta para el tratamiento?</label>
                <div className="val-radio-group">
                  <label className="val-radio-label">
                    <input type="radio" name="apto" value="1" checked={form.apto === "1"} onChange={e => setForm({...form, apto: e.target.value})} />
                    Sí, es apta
                  </label>
                  <label className="val-radio-label">
                    <input type="radio" name="apto" value="0" checked={form.apto === "0"} onChange={e => setForm({...form, apto: e.target.value})} />
                    No es apta
                  </label>
                </div>
                {errores.apto && <span className="val-error-msg">{errores.apto}</span>}
              </div>
              <div className="val-field" style={{ marginBottom: 16 }}>
                <label className="val-label">Observaciones</label>
                <textarea className={`val-textarea ${errores.observaciones ? "error" : ""}`} placeholder="Observaciones generales sobre el estado de la persona" value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} />
                {errores.observaciones && <span className="val-error-msg">{errores.observaciones}</span>}
              </div>
              <div className="val-field">
                <label className="val-label">Recomendaciones</label>
                <textarea className={`val-textarea ${errores.recomendaciones ? "error" : ""}`} placeholder="Recomendaciones y plan de tratamiento inicial" value={form.recomendaciones} onChange={e => setForm({...form, recomendaciones: e.target.value})} />
                {errores.recomendaciones && <span className="val-error-msg">{errores.recomendaciones}</span>}
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