import { useState, useEffect } from "react";
import { obtenerPacientes, obtenerIndicaciones, crearIndicacion } from "../../services/medicoService";

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
  .ind-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
  .ind-field { display: flex; flex-direction: column; gap: 6px; }
  .ind-label { font-size: 12px; color: #374151; font-weight: 500; }
  .ind-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .ind-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .ind-input.error { border-color: #ef4444; }
  .ind-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 80px; transition: border 0.15s; width: 100%; }
  .ind-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .ind-textarea.error { border-color: #ef4444; }
  .ind-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .ind-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .ind-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .ind-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .ind-btn-save:hover { background: #2563eb; }
  .ind-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .ind-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .ind-search-wrap { position: relative; }
  .ind-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .ind-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .ind-search-item:last-child { border-bottom: none; }
  .ind-search-item:hover { background: #f9fafb; }
  .ind-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .ind-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .ind-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .ind-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ind-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .ind-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }

  /* MEDICAMENTOS */
  .ind-med-comunes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .ind-med-comun { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
  .ind-med-comun:hover { border-color: #3b82f6; background: #eff6ff; }
  .ind-med-comun.selected { border-color: #3b82f6; background: #eff6ff; }
  .ind-med-comun-nombre { font-size: 13px; font-weight: 600; color: #3b82f6; }
  .ind-med-comun-info { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .ind-med-agregados { margin-bottom: 16px; }
  .ind-med-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; }
  .ind-med-item:last-child { margin-bottom: 0; }
  .ind-med-item-nombre { font-size: 13px; font-weight: 600; color: #111827; }
  .ind-med-item-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ind-med-item-remove { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 16px; padding: 0 4px; }
  .ind-med-form { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  .ind-med-form-title { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ind-med-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto; gap: 10px; align-items: end; }
  .ind-btn-add-med { padding: 9px 16px; border: none; border-radius: 8px; background: #22c55e; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; white-space: nowrap; height: 38px; }
  .ind-btn-add-med:hover { background: #16a34a; }

  /* LISTA */
  .ind-lista-item { padding: 20px; border-bottom: 1px solid #f3f4f6; }
  .ind-lista-item:last-child { border-bottom: none; }
  .ind-lista-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .ind-lista-nombre { font-size: 15px; font-weight: 600; color: #111827; }
  .ind-lista-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ind-lista-fecha { font-size: 12px; color: #9ca3af; }
  .ind-lista-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
  .ind-lista-field-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; margin-bottom: 2px; }
  .ind-lista-field-value { font-size: 13px; color: #374151; font-weight: 500; }
  .ind-meds-lista { margin-top: 10px; }
  .ind-meds-lista-title { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .ind-med-tag { display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 4px; }
  .ind-readonly-badge { background: #f3f4f6; color: #6b7280; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
`;

const MEDICAMENTOS_COMUNES = [
  { nombre: "Tiamina (Vitamina B1)", dosis: "100mg", frecuencia: "Cada 8 horas", via: "IV", duracion: "7 días" },
  { nombre: "Ácido Fólico", dosis: "5mg", frecuencia: "Cada 24 horas", via: "VO", duracion: "30 días" },
  { nombre: "Diazepam", dosis: "5-10mg", frecuencia: "Cada 6-8 horas PRN", via: "VO", duracion: "7 días" },
  { nombre: "Clonazepam", dosis: "0.5-1mg", frecuencia: "Cada 12 horas", via: "VO", duracion: "7 días" },
  { nombre: "Haloperidol", dosis: "2-5mg", frecuencia: "Cada 8 horas PRN", via: "IM", duracion: "5 días" },
  { nombre: "Omeprazol", dosis: "20mg", frecuencia: "Cada 24 horas", via: "VO", duracion: "30 días" },
];

const medInicial = { nombre: "", dosis: "", frecuencia: "", duracion: "", via: "", requiere_receta: false };

export default function Indicaciones({ rol }) {
  const [tab, setTab] = useState("lista");
  const [indicaciones, setIndicaciones] = useState([]);
  const [medicamentosLista, setMedicamentosLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [errores, setErrores] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [medicamentosAgregados, setMedicamentosAgregados] = useState([]);
  const [medForm, setMedForm] = useState(medInicial);
  const [erroresMed, setErroresMed] = useState({});

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    dieta: "",
    nivel_actividad: "",
    monitoreo: "",
    indicaciones_generales: ""
  });

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esMedico = rol === "medico" || rol === "medico_turno" || !rol;
  const esReadOnly = !esMedico;

  useEffect(() => { cargarIndicaciones(); }, []);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  const cargarIndicaciones = async () => {
    try {
      setCargando(true);
      // Traer todos los pacientes con expediente y sus indicaciones
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
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const buscarPacientes = async () => {
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

  const agregarMedicamentoComun = (med) => {
    const yaExiste = medicamentosAgregados.find(m => m.nombre === med.nombre);
    if (yaExiste) return;
    setMedicamentosAgregados([...medicamentosAgregados, { ...med, requiere_receta: false }]);
  };

  const validarMed = () => {
    const e = {};
    if (!medForm.nombre) e.nombre = "Requerido";
    if (!medForm.dosis) e.dosis = "Requerido";
    if (!medForm.frecuencia) e.frecuencia = "Requerido";
    if (!medForm.via) e.via = "Requerido";
    setErroresMed(e);
    return Object.keys(e).length === 0;
  };

  const agregarMedicamentoManual = () => {
    if (!validarMed()) return;
    setMedicamentosAgregados([...medicamentosAgregados, { ...medForm }]);
    setMedForm(medInicial);
    setErroresMed({});
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
      await crearIndicacion({
        ...form,
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        medicamentos: medicamentosAgregados
      });
      setExito("✅ Indicaciones guardadas correctamente.");
      cargarIndicaciones();
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
    setMedicamentosAgregados([]);
    setMedForm(medInicial);
    setForm({
      fecha: new Date().toISOString().split("T")[0],
      dieta: "",
      nivel_actividad: "",
      monitoreo: "",
      indicaciones_generales: ""
    });
    setErrores({});
    setErroresMed({});
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ind-container">
        <h1 className="ind-title">Indicaciones Médicas</h1>
        <p className="ind-subtitle">Tratamiento farmacológico y no farmacológico</p>

        {exito && <div className="ind-success">{exito}</div>}

        <div className="ind-tabs">
          <button className={`ind-tab ${tab === "lista" ? "active" : ""}`} onClick={() => setTab("lista")}>
            Indicaciones Registradas
          </button>
          {!esReadOnly && (
            <button className={`ind-tab ${tab === "nueva" ? "active" : ""}`} onClick={() => setTab("nueva")}>
              Nueva Indicación
            </button>
          )}
        </div>

        {/* LISTA */}
        {tab === "lista" && (
          <div className="ind-card">
            {cargando ? (
              <div className="ind-empty">Cargando indicaciones...</div>
            ) : indicaciones.length === 0 ? (
              <div className="ind-empty">No hay indicaciones registradas</div>
            ) : (
              indicaciones.map((ind, i) => (
                <div className="ind-lista-item" key={i}>
                  <div className="ind-lista-header">
                    <div>
                      <div className="ind-lista-nombre">{ind.nombre} {ind.apellido}</div>
                      <div className="ind-lista-info">Dr. {ind.nombre_medico}</div>
                    </div>
                    <div className="ind-lista-fecha">
                      {ind.fecha ? new Date(ind.fecha).toLocaleDateString() : "—"}
                    </div>
                  </div>

                  <div className="ind-lista-grid">
                    <div>
                      <div className="ind-lista-field-label">Dieta</div>
                      <div className="ind-lista-field-value">{ind.dieta || "—"}</div>
                    </div>
                    <div>
                      <div className="ind-lista-field-label">Nivel de Actividad</div>
                      <div className="ind-lista-field-value">{ind.nivel_actividad || "—"}</div>
                    </div>
                    <div>
                      <div className="ind-lista-field-label">Monitoreo</div>
                      <div className="ind-lista-field-value">{ind.monitoreo || "—"}</div>
                    </div>
                  </div>

                  {ind.indicaciones_generales && (
                    <div style={{ marginBottom: 10 }}>
                      <div className="ind-lista-field-label">Indicaciones Generales</div>
                      <div className="ind-lista-field-value" style={{ fontSize: 13, color: "#374151" }}>{ind.indicaciones_generales}</div>
                    </div>
                  )}

                  {ind.medicamentos?.length > 0 && (
                    <div className="ind-meds-lista">
                      <div className="ind-meds-lista-title">💊 Medicamentos</div>
                      {ind.medicamentos.map((m, j) => (
                        <span key={j} className="ind-med-tag" title={`${m.dosis} • ${m.frecuencia} • Vía ${m.via}`}>
                          {m.nombre} {m.dosis}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* NUEVA INDICACIÓN */}
        {tab === "nueva" && !esReadOnly && (
          <>
            {/* PACIENTE */}
            <div className="ind-card">
              <div className="ind-section-title">Información del Paciente</div>
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
                        {buscando ? (
                          <div className="ind-no-resultados">Buscando...</div>
                        ) : resultadosBusqueda.length === 0 ? (
                          <div className="ind-no-resultados">No se encontraron pacientes</div>
                        ) : (
                          resultadosBusqueda.map((p, i) => (
                            <div key={i} className="ind-search-item" onClick={() => seleccionarPaciente(p)}>
                              <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                              {p.sustancia_principal && ` • ${p.sustancia_principal}`}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {errores.paciente && <span className="ind-error-msg">{errores.paciente}</span>}
                </div>
              )}

              <div className="ind-field" style={{ marginTop: 12 }}>
                <label className="ind-label">Fecha</label>
                <input
                  className="ind-input"
                  type="date"
                  value={form.fecha}
                  readOnly
                  style={{ background: "#f9fafb", color: "#6b7280", cursor: "not-allowed", maxWidth: 200 }}
                />
              </div>
            </div>

            {/* TRATAMIENTO FARMACOLÓGICO */}
            <div className="ind-card">
              <div className="ind-section-title">Tratamiento Farmacológico</div>

              <div style={{ marginBottom: 12, fontSize: 13, color: "#6b7280" }}>Medicamentos comunes para desintoxicación:</div>
              <div className="ind-med-comunes">
                {MEDICAMENTOS_COMUNES.map((med, i) => (
                  <div
                    key={i}
                    className={`ind-med-comun ${medicamentosAgregados.find(m => m.nombre === med.nombre) ? "selected" : ""}`}
                    onClick={() => agregarMedicamentoComun(med)}
                  >
                    <div className="ind-med-comun-nombre">{med.nombre}</div>
                    <div className="ind-med-comun-info">{med.dosis} · {med.frecuencia}</div>
                  </div>
                ))}
              </div>

              {/* MEDICAMENTOS AGREGADOS */}
              {medicamentosAgregados.length > 0 && (
                <div className="ind-med-agregados">
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Medicamentos seleccionados
                  </div>
                  {medicamentosAgregados.map((m, i) => (
                    <div className="ind-med-item" key={i}>
                      <div>
                        <div className="ind-med-item-nombre">{m.nombre}</div>
                        <div className="ind-med-item-info">{m.dosis} • {m.frecuencia} • Vía {m.via}{m.duracion ? ` • ${m.duracion}` : ""}</div>
                      </div>
                      <button className="ind-med-item-remove" onClick={() => quitarMedicamento(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* AGREGAR MANUAL */}
              <div className="ind-med-form">
                <div className="ind-med-form-title">➕ Agregar medicamento personalizado</div>
                <div className="ind-med-grid">
                  <div className="ind-field">
                    <label className="ind-label">Medicamento *</label>
                    <input className={`ind-input ${erroresMed.nombre ? "error" : ""}`} placeholder="Nombre" value={medForm.nombre} onChange={e => setMedForm({ ...medForm, nombre: e.target.value })} />
                    {erroresMed.nombre && <span className="ind-error-msg">{erroresMed.nombre}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label">Dosis *</label>
                    <input className={`ind-input ${erroresMed.dosis ? "error" : ""}`} placeholder="10mg" value={medForm.dosis} onChange={e => setMedForm({ ...medForm, dosis: e.target.value })} />
                    {erroresMed.dosis && <span className="ind-error-msg">{erroresMed.dosis}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label">Frecuencia *</label>
                    <input className={`ind-input ${erroresMed.frecuencia ? "error" : ""}`} placeholder="Cada 8h" value={medForm.frecuencia} onChange={e => setMedForm({ ...medForm, frecuencia: e.target.value })} />
                    {erroresMed.frecuencia && <span className="ind-error-msg">{erroresMed.frecuencia}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label">Duración</label>
                    <input className="ind-input" placeholder="7 días" value={medForm.duracion} onChange={e => setMedForm({ ...medForm, duracion: e.target.value })} />
                  </div>
                  <div className="ind-field">
                    <label className="ind-label">Vía *</label>
                    <input className={`ind-input ${erroresMed.via ? "error" : ""}`} placeholder="VO / IV / IM" value={medForm.via} onChange={e => setMedForm({ ...medForm, via: e.target.value })} />
                    {erroresMed.via && <span className="ind-error-msg">{erroresMed.via}</span>}
                  </div>
                  <div className="ind-field">
                    <label className="ind-label" style={{ opacity: 0 }}>.</label>
                    <button className="ind-btn-add-med" onClick={agregarMedicamentoManual}>+ Agregar</button>
                  </div>
                </div>
              </div>

              {errores.general && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errores.general}</div>}
            </div>

            {/* INDICACIONES NO FARMACOLÓGICAS */}
            <div className="ind-card">
              <div className="ind-section-title">Indicaciones No Farmacológicas</div>
              <div className="ind-field" style={{ marginBottom: 16 }}>
                <label className="ind-label">Dieta</label>
                <textarea
                  className="ind-textarea"
                  placeholder="Indicaciones dietéticas, restricciones alimentarias, hidratación..."
                  value={form.dieta}
                  onChange={e => setForm({ ...form, dieta: e.target.value })}
                />
              </div>
              <div className="ind-field" style={{ marginBottom: 16 }}>
                <label className="ind-label">Nivel de Actividad</label>
                <input
                  className="ind-input"
                  placeholder="ej. Reposo absoluto, actividad ligera, ejercicio moderado..."
                  value={form.nivel_actividad}
                  onChange={e => setForm({ ...form, nivel_actividad: e.target.value })}
                />
              </div>
              <div className="ind-field" style={{ marginBottom: 16 }}>
                <label className="ind-label">Monitoreo</label>
                <textarea
                  className="ind-textarea"
                  placeholder="Especificar frecuencia de monitoreo de signos vitales, estudios de laboratorio, etc."
                  value={form.monitoreo}
                  onChange={e => setForm({ ...form, monitoreo: e.target.value })}
                />
              </div>
              <div className="ind-field">
                <label className="ind-label">Indicaciones Generales</label>
                <textarea
                  className={`ind-textarea ${errores.general ? "error" : ""}`}
                  placeholder="Otras indicaciones, cuidados especiales, restricciones, etc."
                  value={form.indicaciones_generales}
                  onChange={e => setForm({ ...form, indicaciones_generales: e.target.value })}
                />
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