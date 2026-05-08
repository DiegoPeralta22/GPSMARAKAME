import { useState, useEffect } from "react";
import {
  obtenerPacientes,
  obtenerIndicaciones,
  crearIndicacion,
  obtenerMedicamentos,
  crearSolicitudMedicamento,
} from "../../services/medicoService";

const styles = `
  .ind-container { padding: 0; }
  .ind-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .ind-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .ind-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .ind-tab { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; transition: all 0.15s; }
  .ind-tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  .ind-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .ind-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .ind-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .ind-field { display: flex; flex-direction: column; gap: 6px; }
  .ind-label { font-size: 12px; color: #374151; font-weight: 500; }
  .ind-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .ind-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .ind-input.error { border-color: #ef4444; }
  .ind-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 80px; transition: border 0.15s; width: 100%; }
  .ind-textarea:focus { border-color: #3b82f6; }
  .ind-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .ind-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .ind-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .ind-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; }
  .ind-btn-save:hover { background: #2563eb; }
  .ind-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .ind-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .ind-search-wrap { position: relative; }
  .ind-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 220px; overflow-y: auto; }
  .ind-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .ind-search-item:last-child { border-bottom: none; }
  .ind-search-item:hover { background: #f9fafb; }
  .ind-search-item-nombre { font-weight: 600; color: #111827; }
  .ind-search-item-info { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .ind-search-item-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; margin-left: 6px; }
  .ind-search-item-badge.controlado { background: #fee2e2; color: #dc2626; }
  .ind-search-item-badge.sin-stock { background: #f3f4f6; color: #6b7280; }
  .ind-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .ind-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .ind-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .ind-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ind-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .ind-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
  .ind-med-agregados { margin-bottom: 16px; }
  .ind-med-item { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; }
  .ind-med-item.controlado { border-color: #fecaca; background: #fff5f5; }
  .ind-med-item.externo { border-color: #fed7aa; background: #fff7ed; }
  .ind-med-item-nombre { font-size: 13px; font-weight: 600; color: #111827; }
  .ind-med-item-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ind-med-item-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; margin-left: 6px; }
  .ind-med-item-badge.controlado { background: #fee2e2; color: #dc2626; }
  .ind-med-item-badge.externo { background: #fff7ed; color: #ea580c; }
  .ind-med-item-remove { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 16px; padding: 0 4px; flex-shrink: 0; }
  .ind-med-form { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  .ind-med-form-title { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ind-med-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px; align-items: end; }
  .ind-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; width: 100%; background: #fff; }
  .ind-select:focus { border-color: #3b82f6; }
  .ind-btn-add-med { padding: 9px 16px; border: none; border-radius: 8px; background: #22c55e; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; white-space: nowrap; height: 38px; }
  .ind-btn-add-med:hover { background: #16a34a; }
  .ind-btn-add-med:disabled { background: #86efac; cursor: not-allowed; }
  .ind-med-alerta { font-size: 12px; padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; }
  .ind-med-alerta.controlado { background: #fff1f2; color: #dc2626; border: 1px solid #fecaca; }
  .ind-med-alerta.sin-stock { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
  .ind-lista-item { padding: 20px; border-bottom: 1px solid #f3f4f6; }
  .ind-lista-item:last-child { border-bottom: none; }
  .ind-lista-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .ind-lista-nombre { font-size: 15px; font-weight: 600; color: #111827; }
  .ind-lista-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ind-lista-fecha { font-size: 12px; color: #9ca3af; }
  .ind-lista-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
  .ind-lista-field-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 2px; }
  .ind-lista-field-value { font-size: 13px; color: #374151; font-weight: 500; }
  .ind-med-tag { display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 4px; }
  .ind-med-tag.controlado { background: #fee2e2; color: #dc2626; }
  .ind-med-tag.externo { background: #fff7ed; color: #ea580c; }
`;

const medInicial = { id_medicamento: null, nombre: "", dosis: "", frecuencia: "", duracion: "", via: "", es_controlado: false, es_externo: false, stock_actual: 0 };

export default function Indicaciones({ rol }) {
  const [tab, setTab] = useState("lista");
  const [indicaciones, setIndicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [errores, setErrores] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [medicamentosAgregados, setMedicamentosAgregados] = useState([]);

  // Autocomplete medicamentos del almacén
  const [catalogoMeds, setCatalogoMeds] = useState([]);
  const [busquedaMed, setBusquedaMed] = useState("");
  const [resultadosMed, setResultadosMed] = useState([]);
  const [medSeleccionado, setMedSeleccionado] = useState(null);
  const [medForm, setMedForm] = useState({ dosis: "", frecuencia: "", duracion: "", via: "" });
  const [erroresMed, setErroresMed] = useState({});
  const [alertaMed, setAlertaMed] = useState(null);

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    dieta: "",
    nivel_actividad: "",
    monitoreo: "",
    indicaciones_generales: ""
  });

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esReadOnly = rol === "enfermera" || rol === "nutriologo";

  useEffect(() => { cargarIndicaciones(); cargarCatalogo(); }, []);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  useEffect(() => {
    if (busquedaMed.length >= 2) {
      const filtro = catalogoMeds.filter(m =>
        m.nombre.toLowerCase().includes(busquedaMed.toLowerCase()) ||
        (m.presentacion && m.presentacion.toLowerCase().includes(busquedaMed.toLowerCase()))
      );
      setResultadosMed(filtro);
    } else {
      setResultadosMed([]);
    }
  }, [busquedaMed, catalogoMeds]);

  const cargarCatalogo = async () => {
    try {
      const data = await obtenerMedicamentos();
      setCatalogoMeds(Array.isArray(data) ? data.filter(m => m.tipo !== "insumo") : []);
    } catch (e) { console.error(e); }
  };

  const cargarIndicaciones = async () => {
    try {
      setCargando(true);
      const pacientes = await obtenerPacientes("todos", "");
      const conExpediente = pacientes.filter(p => p.id_expediente);
      const todas = [];
      for (const p of conExpediente) {
        const data = await obtenerIndicaciones(p.id_paciente);
        if (data?.indicaciones?.length > 0) {
          data.indicaciones.forEach(ind => {
            const meds = data.medicamentos?.filter(m => m.id_indicacion === ind.id_indicacion) || [];
            todas.push({ ...ind, nombre: p.nombre, apellido: p.apellido, medicamentos: meds });
          });
        }
      }
      todas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setIndicaciones(todas);
    } catch (error) { console.error(error); }
    finally { setCargando(false); }
  };

  const buscarPacientes = async () => {
    try {
      setBuscando(true);
      const data = await obtenerPacientes("todos", busqueda);
      setResultadosBusqueda(data.filter(p => p.id_expediente));
    } catch (error) { console.error(error); }
    finally { setBuscando(false); }
  };

  const seleccionarPaciente = (p) => {
    setPacienteSeleccionado(p);
    setBusqueda("");
    setResultadosBusqueda([]);
  };

  const seleccionarMedCatalogo = (med) => {
    setMedSeleccionado(med);
    setBusquedaMed(med.nombre);
    setResultadosMed([]);
    setAlertaMed(null);

    // Precargar vía si tiene presentación
    const viaMap = { Ampolleta: "IV", Jarabe: "VO", Cápsula: "VO", Tableta: "VO", Solución: "IV", Crema: "Tópica" };
    const via = viaMap[med.presentacion] || "";
    setMedForm(prev => ({ ...prev, via }));

    if (med.es_controlado) {
      setAlertaMed({ tipo: "controlado", msg: "⚠️ Medicamento controlado — la solicitud requerirá aprobación del jefe médico." });
    } else if (med.stock_actual <= 0) {
      setAlertaMed({ tipo: "sin-stock", msg: "🏪 Sin stock disponible — se generará una solicitud de medicamento externo al familiar." });
    }
  };

  const validarMed = () => {
    const e = {};
    if (!medSeleccionado && !busquedaMed.trim()) e.nombre = "Selecciona o escribe un medicamento";
    if (!medForm.dosis) e.dosis = "Requerido";
    if (!medForm.frecuencia) e.frecuencia = "Requerido";
    if (!medForm.via) e.via = "Requerido";
    setErroresMed(e);
    return Object.keys(e).length === 0;
  };

  const agregarMedicamento = () => {
    if (!validarMed()) return;

    const esMedCatalogo = !!medSeleccionado;
    const sinStock = esMedCatalogo && medSeleccionado.stock_actual <= 0;
    const esControlado = esMedCatalogo && medSeleccionado.es_controlado;

    const nuevo = {
      id_medicamento: medSeleccionado?.id_medicamento || null,
      nombre: medSeleccionado ? medSeleccionado.nombre : busquedaMed.trim(),
      ...medForm,
      es_controlado: esControlado,
      es_externo: sinStock || !esMedCatalogo,
      stock_actual: medSeleccionado?.stock_actual || 0,
      requiere_receta: esControlado,
    };

    setMedicamentosAgregados([...medicamentosAgregados, nuevo]);
    setMedSeleccionado(null);
    setBusquedaMed("");
    setMedForm({ dosis: "", frecuencia: "", duracion: "", via: "" });
    setErroresMed({});
    setAlertaMed(null);
  };

  const quitarMedicamento = (index) => {
    setMedicamentosAgregados(medicamentosAgregados.filter((_, i) => i !== index));
  };

  const validar = () => {
    const e = {};
    if (!pacienteSeleccionado) e.paciente = "Selecciona un paciente";
    if (!form.fecha) e.fecha = "Requerido";
    if (medicamentosAgregados.length === 0 && !form.indicaciones_generales)
      e.general = "Agrega al menos un medicamento o una indicación general";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);

      // Guardar indicación con medicamentos en IndicacionMedicamento
      await crearIndicacion({
        ...form,
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        medicamentos: medicamentosAgregados.map(m => ({
          nombre: m.nombre,
          dosis: m.dosis,
          frecuencia: m.frecuencia,
          duracion: m.duracion,
          via: m.via,
          requiere_receta: m.es_controlado,
        }))
      });

      // Crear solicitudes de medicamento para cada med del catálogo
      for (const med of medicamentosAgregados) {
        if (med.id_medicamento || med.es_externo) {
          await crearSolicitudMedicamento({
            id_paciente: pacienteSeleccionado.id_paciente,
            id_usuario_medico: usuario.id_usuario,
            id_medicamento: med.id_medicamento || null,
            nombre_medicamento: med.nombre,
            dosis: med.dosis,
            cantidad: 1,
            frecuencia: med.frecuencia,
            duracion: med.duracion,
            via: med.via,
            es_externo: med.es_externo,
            es_controlado: med.es_controlado,
            observaciones: `Indicado en indicaciones médicas del ${form.fecha}`,
          });
        }
      }

      setExito("✅ Indicaciones guardadas. Los medicamentos han sido solicitados al almacén.");
      cargarIndicaciones();
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
    setPacienteSeleccionado(null);
    setMedicamentosAgregados([]);
    setMedSeleccionado(null);
    setBusquedaMed("");
    setMedForm({ dosis: "", frecuencia: "", duracion: "", via: "" });
    setForm({ fecha: new Date().toISOString().split("T")[0], dieta: "", nivel_actividad: "", monitoreo: "", indicaciones_generales: "" });
    setErrores({});
    setErroresMed({});
    setAlertaMed(null);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ind-container">
        <h1 className="ind-title">Indicaciones Médicas</h1>
        <p className="ind-subtitle">Tratamiento farmacológico y no farmacológico</p>

        {exito && <div className="ind-success">{exito}</div>}

        <div className="ind-tabs">
          <button className={`ind-tab ${tab === "lista" ? "active" : ""}`} onClick={() => setTab("lista")}>Indicaciones Registradas</button>
          {!esReadOnly && (
            <button className={`ind-tab ${tab === "nueva" ? "active" : ""}`} onClick={() => setTab("nueva")}>Nueva Indicación</button>
          )}
        </div>

        {/* LISTA */}
        {tab === "lista" && (
          <div className="ind-card">
            {cargando ? <div className="ind-empty">Cargando indicaciones...</div>
              : indicaciones.length === 0 ? <div className="ind-empty">No hay indicaciones registradas</div>
              : indicaciones.map((ind, i) => (
                <div className="ind-lista-item" key={i}>
                  <div className="ind-lista-header">
                    <div>
                      <div className="ind-lista-nombre">{ind.nombre} {ind.apellido}</div>
                      <div className="ind-lista-info">Dr. {ind.nombre_medico}</div>
                    </div>
                    <div className="ind-lista-fecha">{ind.fecha ? new Date(ind.fecha).toLocaleDateString() : "—"}</div>
                  </div>
                  <div className="ind-lista-grid">
                    <div><div className="ind-lista-field-label">Dieta</div><div className="ind-lista-field-value">{ind.dieta || "—"}</div></div>
                    <div><div className="ind-lista-field-label">Nivel de Actividad</div><div className="ind-lista-field-value">{ind.nivel_actividad || "—"}</div></div>
                    <div><div className="ind-lista-field-label">Monitoreo</div><div className="ind-lista-field-value">{ind.monitoreo || "—"}</div></div>
                  </div>
                  {ind.indicaciones_generales && (
                    <div style={{ marginBottom: 10 }}>
                      <div className="ind-lista-field-label">Indicaciones Generales</div>
                      <div className="ind-lista-field-value" style={{ fontSize: 13, color: "#374151" }}>{ind.indicaciones_generales}</div>
                    </div>
                  )}
                  {ind.medicamentos?.length > 0 && (
                    <div>
                      <div className="ind-lista-field-label" style={{ marginBottom: 6 }}>💊 Medicamentos</div>
                      {ind.medicamentos.map((m, j) => (
                        <span key={j} className={`ind-med-tag ${m.requiere_receta ? "controlado" : ""}`} title={`${m.dosis} • ${m.frecuencia} • Vía ${m.via}`}>
                          {m.requiere_receta ? "⚠️ " : ""}{m.nombre} {m.dosis}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* NUEVA INDICACIÓN */}
        {tab === "nueva" && !esReadOnly && (
          <>
            {/* PACIENTE */}
            <div className="ind-card">
              <div className="ind-section-title">Paciente</div>
              {pacienteSeleccionado ? (
                <div className="ind-persona-seleccionada">
                  <div>
                    <div className="ind-persona-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                    <div className="ind-persona-info">
                      {pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • Expediente #{String(pacienteSeleccionado.id_expediente).padStart(3, "0")}
                    </div>
                  </div>
                  <button className="ind-cambiar-btn" onClick={() => setPacienteSeleccionado(null)}>Cambiar</button>
                </div>
              ) : (
                <div className="ind-field">
                  <label className="ind-label">Buscar paciente</label>
                  <div className="ind-search-wrap">
                    <input
                      className={`ind-input ${errores.paciente ? "error" : ""}`}
                      placeholder="Escribe el nombre del paciente..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                    />
                    {busqueda.length >= 2 && (
                      <div className="ind-search-results">
                        {buscando ? <div className="ind-no-resultados">Buscando...</div>
                          : resultadosBusqueda.length === 0 ? <div className="ind-no-resultados">No se encontraron pacientes</div>
                          : resultadosBusqueda.map((p, i) => (
                            <div key={i} className="ind-search-item" onClick={() => seleccionarPaciente(p)}>
                              <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errores.paciente && <span className="ind-error-msg">{errores.paciente}</span>}
                </div>
              )}
              <div className="ind-field" style={{ marginTop: 12, maxWidth: 200 }}>
                <label className="ind-label">Fecha</label>
                <input className="ind-input" type="date" value={form.fecha} readOnly style={{ background: "#f9fafb", color: "#6b7280", cursor: "not-allowed" }} />
              </div>
            </div>

            {/* MEDICAMENTOS DEL ALMACÉN */}
            <div className="ind-card">
              <div className="ind-section-title">💊 Medicamentos</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
                Busca medicamentos del catálogo del instituto. Si hay stock se solicitará al almacén; si no, se generará solicitud al familiar.
              </div>

              <div className="ind-med-form">
                <div className="ind-med-form-title">Buscar en catálogo</div>
                <div className="ind-med-grid">
                  <div className="ind-field">
                    <label className="ind-label">Medicamento</label>
                    <div className="ind-search-wrap">
                      <input
                        className={`ind-input ${erroresMed.nombre ? "error" : ""}`}
                        placeholder="Escribe el nombre del medicamento..."
                        value={busquedaMed}
                        onChange={e => { setBusquedaMed(e.target.value); setMedSeleccionado(null); setAlertaMed(null); }}
                      />
                      {busquedaMed.length >= 2 && resultadosMed.length > 0 && (
                        <div className="ind-search-results">
                          {resultadosMed.map((m, i) => (
                            <div key={i} className="ind-search-item" onClick={() => seleccionarMedCatalogo(m)}>
                              <div className="ind-search-item-nombre">
                                {m.nombre}
                                {m.es_controlado && <span className="ind-search-item-badge controlado">⚠️ Controlado</span>}
                                {m.stock_actual <= 0 && <span className="ind-search-item-badge sin-stock">Sin stock</span>}
                              </div>
                              <div className="ind-search-item-info">
                                {m.presentacion} {m.concentracion} • Stock: {m.stock_actual} {m.unidad_minima}
                              </div>
                            </div>
                          ))}
                          {busquedaMed.length >= 2 && resultadosMed.length === 0 && (
                            <div className="ind-no-resultados">No encontrado en catálogo — se registrará como externo</div>
                          )}
                        </div>
                      )}
                    </div>
                    {erroresMed.nombre && <span className="ind-error-msg">{erroresMed.nombre}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label">Dosis *</label>
                    <input className={`ind-input ${erroresMed.dosis ? "error" : ""}`} placeholder="ej. 500mg" value={medForm.dosis} onChange={e => setMedForm({ ...medForm, dosis: e.target.value })} />
                    {erroresMed.dosis && <span className="ind-error-msg">{erroresMed.dosis}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label">Frecuencia *</label>
                    <input className={`ind-input ${erroresMed.frecuencia ? "error" : ""}`} placeholder="ej. Cada 8h" value={medForm.frecuencia} onChange={e => setMedForm({ ...medForm, frecuencia: e.target.value })} />
                    {erroresMed.frecuencia && <span className="ind-error-msg">{erroresMed.frecuencia}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label">Vía *</label>
                    <select className={`ind-select ${erroresMed.via ? "error" : ""}`} value={medForm.via} onChange={e => setMedForm({ ...medForm, via: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      <option value="VO">VO — Oral</option>
                      <option value="IV">IV — Intravenosa</option>
                      <option value="IM">IM — Intramuscular</option>
                      <option value="SC">SC — Subcutánea</option>
                      <option value="SL">SL — Sublingual</option>
                      <option value="Tópica">Tópica</option>
                    </select>
                    {erroresMed.via && <span className="ind-error-msg">{erroresMed.via}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label" style={{ opacity: 0 }}>.</label>
                    <button className="ind-btn-add-med" onClick={agregarMedicamento}>+ Agregar</button>
                  </div>
                </div>

                {alertaMed && (
                  <div className={`ind-med-alerta ${alertaMed.tipo}`}>{alertaMed.msg}</div>
                )}

                {medSeleccionado && (
                  <div style={{ fontSize: 12, color: "#059669", marginTop: 8 }}>
                    ✅ Seleccionado del catálogo: <strong>{medSeleccionado.nombre}</strong> — Stock disponible: {medSeleccionado.stock_actual} {medSeleccionado.unidad_minima}
                  </div>
                )}
              </div>

              {/* MEDICAMENTOS AGREGADOS */}
              {medicamentosAgregados.length > 0 && (
                <div className="ind-med-agregados">
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Medicamentos a indicar ({medicamentosAgregados.length})
                  </div>
                  {medicamentosAgregados.map((m, i) => (
                    <div className={`ind-med-item ${m.es_controlado ? "controlado" : m.es_externo ? "externo" : ""}`} key={i}>
                      <div>
                        <div className="ind-med-item-nombre">
                          {m.nombre}
                          {m.es_controlado && <span className="ind-med-item-badge controlado">⚠️ Controlado — pendiente aprobación jefe</span>}
                          {m.es_externo && !m.es_controlado && <span className="ind-med-item-badge externo">🏪 Sin stock — solicitud al familiar</span>}
                        </div>
                        <div className="ind-med-item-info">{m.dosis} • {m.frecuencia} • Vía {m.via}{m.duracion ? ` • ${m.duracion}` : ""}</div>
                      </div>
                      <button className="ind-med-item-remove" onClick={() => quitarMedicamento(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {errores.general && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errores.general}</div>}
            </div>

            {/* INDICACIONES NO FARMACOLÓGICAS */}
            <div className="ind-card">
              <div className="ind-section-title">Indicaciones No Farmacológicas</div>
              <div className="ind-field" style={{ marginBottom: 16 }}>
                <label className="ind-label">Dieta</label>
                <textarea className="ind-textarea" placeholder="Indicaciones dietéticas, restricciones alimentarias..." value={form.dieta} onChange={e => setForm({ ...form, dieta: e.target.value })} />
              </div>
              <div className="ind-field" style={{ marginBottom: 16 }}>
                <label className="ind-label">Nivel de Actividad</label>
                <input className="ind-input" placeholder="ej. Reposo absoluto, actividad ligera..." value={form.nivel_actividad} onChange={e => setForm({ ...form, nivel_actividad: e.target.value })} />
              </div>
              <div className="ind-field" style={{ marginBottom: 16 }}>
                <label className="ind-label">Monitoreo</label>
                <textarea className="ind-textarea" placeholder="Frecuencia de monitoreo de signos vitales..." value={form.monitoreo} onChange={e => setForm({ ...form, monitoreo: e.target.value })} />
              </div>
              <div className="ind-field">
                <label className="ind-label">Indicaciones Generales</label>
                <textarea className={`ind-textarea ${errores.general ? "error" : ""}`} placeholder="Otras indicaciones, cuidados especiales..." value={form.indicaciones_generales} onChange={e => setForm({ ...form, indicaciones_generales: e.target.value })} />
              </div>
            </div>

            <div className="ind-footer">
              <button className="ind-btn-cancel" onClick={() => { setTab("lista"); resetForm(); }}>Cancelar</button>
              <button className="ind-btn-save" onClick={handleGuardar} disabled={guardando}>
                💾 {guardando ? "Guardando..." : "Guardar Indicaciones"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}