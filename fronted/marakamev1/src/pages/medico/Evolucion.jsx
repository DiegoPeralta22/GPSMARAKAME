import { useState, useEffect } from "react";
import { obtenerPacientes, obtenerNotas, crearNota } from "../../services/medicoService";

const styles = `
  .evo-container { padding: 0; }
  .evo-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .evo-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .evo-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .evo-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .evo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .evo-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
  .evo-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
  .evo-field { display: flex; flex-direction: column; gap: 6px; }
  .evo-label { font-size: 12px; color: #374151; font-weight: 500; }
  .evo-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .evo-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .evo-input.error { border-color: #ef4444; }
  .evo-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 90px; transition: border 0.15s; width: 100%; }
  .evo-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .evo-textarea.error { border-color: #ef4444; }
  .evo-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; background: #fff; }
  .evo-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .evo-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .evo-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .evo-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .evo-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .evo-btn-save:hover { background: #2563eb; }
  .evo-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .evo-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .evo-search-wrap { position: relative; }
  .evo-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .evo-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .evo-search-item:last-child { border-bottom: none; }
  .evo-search-item:hover { background: #f9fafb; }
  .evo-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .evo-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .evo-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .evo-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .evo-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .evo-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }

  /* SOAP INFO */
  .evo-soap-info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
  .evo-soap-item { padding: 10px 14px; border-radius: 8px; border: 1px solid #e5e7eb; }
  .evo-soap-letra { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .evo-soap-desc { font-size: 11px; color: #6b7280; }
  .evo-soap-item.s { border-color: #bfdbfe; background: #eff6ff; }
  .evo-soap-item.s .evo-soap-letra { color: #1d4ed8; }
  .evo-soap-item.o { border-color: #bbf7d0; background: #f0fdf4; }
  .evo-soap-item.o .evo-soap-letra { color: #16a34a; }
  .evo-soap-item.a { border-color: #fde68a; background: #fffbeb; }
  .evo-soap-item.a .evo-soap-letra { color: #d97706; }
  .evo-soap-item.p { border-color: #fecaca; background: #fff1f2; }
  .evo-soap-item.p .evo-soap-letra { color: #dc2626; }

  /* HISTORIAL */
  .evo-historial { margin-top: 20px; }
  .evo-historial-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .evo-nota-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .evo-nota-item:last-child { margin-bottom: 0; }
  .evo-nota-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .evo-nota-autor { font-size: 13px; font-weight: 600; color: #111827; }
  .evo-nota-fecha { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .evo-nota-dia { font-size: 11px; font-weight: 600; background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; }
  .evo-nota-signos { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; background: #fff; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
  .evo-nota-signo-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
  .evo-nota-signo-value { font-size: 12px; color: #111827; font-weight: 600; }
  .evo-nota-soap { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .evo-nota-soap-item { }
  .evo-nota-soap-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .evo-nota-soap-label.s { color: #1d4ed8; }
  .evo-nota-soap-label.o { color: #16a34a; }
  .evo-nota-soap-label.a { color: #d97706; }
  .evo-nota-soap-label.p { color: #dc2626; }
  .evo-nota-soap-value { font-size: 12px; color: #374151; line-height: 1.5; }
  .evo-nota-estado { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #fff; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
  .evo-nota-estado-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
  .evo-nota-estado-value { font-size: 12px; color: #374151; font-weight: 500; }
  .evo-nota-ajuste { font-size: 12px; color: #6b7280; padding-top: 8px; border-top: 1px solid #f3f4f6; }
  .evo-nueva-nota-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; margin-bottom: 20px; }
  .evo-nueva-nota-btn:hover { background: #2563eb; }
  .evo-form-container { border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin-bottom: 20px; background: #f8faff; }
  .evo-form-title { font-size: 14px; font-weight: 600; color: #1d4ed8; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .evo-meta-info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: #1d4ed8; }
`;

const formInicial = {
  presion_arterial: "",
  frecuencia_cardiaca: "",
  frecuencia_respiratoria: "",
  saturacion_oxigeno: "",
  temperatura: "",
  glucosa: "",
  subjetivo: "",
  objetivo: "",
  estado_mental: "",
  condicion_general: "",
  patron_sueno: "",
  apetito: "",
  estado_animo: "",
  analisis: "",
  plan: "",
  ajustes_tratamiento: ""
};

export default function Evolucion({ rol }) {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [notas, setNotas] = useState([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esMedico = rol === "medico" || rol === "medico_turno" || !rol;
  const ahora = new Date();
  const fechaHoy = ahora.toISOString().split("T")[0];
  const horaActual = ahora.toTimeString().slice(0, 5);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  useEffect(() => {
    if (pacienteSeleccionado && esMedico) {
      cargarNotas(pacienteSeleccionado.id_paciente);
    }
  }, [pacienteSeleccionado]);

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
    setMostrarForm(false);
    setNotas([]);
  };

  const cargarNotas = async (id_paciente) => {
    try {
      setCargandoNotas(true);
      const data = await obtenerNotas(id_paciente);
      setNotas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoNotas(false);
    }
  };

  const calcularDiaTratamiento = () => {
    if (!pacienteSeleccionado?.dias_tratamiento) return null;
    return pacienteSeleccionado.dias_tratamiento + 1;
  };

  const validar = () => {
    const e = {};
    if (!form.subjetivo) e.subjetivo = "Requerido";
    if (!form.objetivo) e.objetivo = "Requerido";
    if (!form.analisis) e.analisis = "Requerido";
    if (!form.plan) e.plan = "Requerido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await crearNota({
        ...form,
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        fecha: fechaHoy,
        hora: horaActual,
        dia_tratamiento: calcularDiaTratamiento(),
        frecuencia_cardiaca: form.frecuencia_cardiaca ? parseInt(form.frecuencia_cardiaca) : null,
        frecuencia_respiratoria: form.frecuencia_respiratoria ? parseInt(form.frecuencia_respiratoria) : null,
        saturacion_oxigeno: form.saturacion_oxigeno ? parseFloat(form.saturacion_oxigeno) : null,
        temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
        glucosa: form.glucosa ? parseFloat(form.glucosa) : null,
      });
      setExito("✅ Nota de evolución registrada correctamente.");
      setForm(formInicial);
      setMostrarForm(false);
      if (esMedico) cargarNotas(pacienteSeleccionado.id_paciente);
      setTimeout(() => setExito(null), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="evo-container">
        <h1 className="evo-title">Nota de Evolución</h1>
        <p className="evo-subtitle">Seguimiento médico diario del paciente</p>

        {exito && <div className="evo-success">{exito}</div>}

        {/* SELECCIÓN DE PACIENTE */}
        <div className="evo-card">
          <div className="evo-section-title">Paciente</div>
          {pacienteSeleccionado ? (
            <div className="evo-persona-seleccionada">
              <div>
                <div className="evo-persona-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                <div className="evo-persona-info">
                  {pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • Expediente #{String(pacienteSeleccionado.id_expediente).padStart(3, "0")}
                  {pacienteSeleccionado.estado && ` • ${pacienteSeleccionado.estado}`}
                  {pacienteSeleccionado.dias_tratamiento != null && ` • Día ${pacienteSeleccionado.dias_tratamiento} de tratamiento`}
                </div>
              </div>
              <button className="evo-cambiar-btn" onClick={() => { setPacienteSeleccionado(null); setNotas([]); setMostrarForm(false); }}>Cambiar</button>
            </div>
          ) : (
            <div className="evo-field">
              <label className="evo-label">Buscar paciente</label>
              <div className="evo-search-wrap">
                <input
                  className="evo-input"
                  placeholder="Escribe el nombre del paciente..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
                {busqueda.length >= 2 && (
                  <div className="evo-search-results">
                    {buscando ? (
                      <div className="evo-no-resultados">Buscando...</div>
                    ) : resultadosBusqueda.length === 0 ? (
                      <div className="evo-no-resultados">No se encontraron pacientes</div>
                    ) : (
                      resultadosBusqueda.map((p, i) => (
                        <div key={i} className="evo-search-item" onClick={() => seleccionarPaciente(p)}>
                          <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                          {p.estado && ` • ${p.estado}`}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO TRAS SELECCIONAR PACIENTE */}
        {pacienteSeleccionado && (
          <>
            {/* BOTÓN NUEVA NOTA */}
            {!mostrarForm && (
              <button className="evo-nueva-nota-btn" onClick={() => setMostrarForm(true)}>
                ➕ Nueva Nota de Evolución
              </button>
            )}

            {/* FORMULARIO NUEVA NOTA */}
            {mostrarForm && (
              <div className="evo-form-container">
                <div className="evo-form-title">
                  📝 Nueva Nota de Evolución
                </div>

                <div className="evo-meta-info">
                  📅 <strong>{fechaHoy}</strong> — {horaActual} hrs &nbsp;|&nbsp;
                  👤 <strong>{usuario?.nombre || "Usuario"}</strong>
                  {calcularDiaTratamiento() && <> &nbsp;|&nbsp; Día <strong>{calcularDiaTratamiento()}</strong> de tratamiento</>}
                </div>

                {/* SIGNOS VITALES */}
                <div className="evo-section-title">Signos Vitales</div>
                <div className="evo-grid-4" style={{ marginBottom: 16 }}>
                  <div className="evo-field">
                    <label className="evo-label">Presión Arterial</label>
                    <input className="evo-input" placeholder="120/80" value={form.presion_arterial} onChange={e => setForm({ ...form, presion_arterial: e.target.value })} />
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Frec. Cardíaca (lpm)</label>
                    <input className="evo-input" type="number" placeholder="70" value={form.frecuencia_cardiaca} onChange={e => setForm({ ...form, frecuencia_cardiaca: e.target.value })} />
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Frec. Respiratoria</label>
                    <input className="evo-input" type="number" placeholder="16" value={form.frecuencia_respiratoria} onChange={e => setForm({ ...form, frecuencia_respiratoria: e.target.value })} />
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Saturación O₂ (%)</label>
                    <input className="evo-input" type="number" placeholder="98" value={form.saturacion_oxigeno} onChange={e => setForm({ ...form, saturacion_oxigeno: e.target.value })} />
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Temperatura (°C)</label>
                    <input className="evo-input" type="number" step="0.1" placeholder="36.5" value={form.temperatura} onChange={e => setForm({ ...form, temperatura: e.target.value })} />
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Glucosa (mg/dL)</label>
                    <input className="evo-input" type="number" placeholder="90" value={form.glucosa} onChange={e => setForm({ ...form, glucosa: e.target.value })} />
                  </div>
                </div>

                {/* EVALUACIÓN SOAP */}
                <div className="evo-section-title">Evaluación SOAP</div>
                <div className="evo-soap-info">
                  <div className="evo-soap-item s"><div className="evo-soap-letra">S</div><div className="evo-soap-desc">Subjetivo — Lo que refiere el paciente</div></div>
                  <div className="evo-soap-item o"><div className="evo-soap-letra">O</div><div className="evo-soap-desc">Objetivo — Hallazgos físicos</div></div>
                  <div className="evo-soap-item a"><div className="evo-soap-letra">A</div><div className="evo-soap-desc">Análisis — Impresión diagnóstica</div></div>
                  <div className="evo-soap-item p"><div className="evo-soap-letra">P</div><div className="evo-soap-desc">Plan — Conducta a seguir</div></div>
                </div>

                <div className="evo-grid" style={{ marginBottom: 16 }}>
                  <div className="evo-field">
                    <label className="evo-label" style={{ color: "#1d4ed8" }}>S — Subjetivo *</label>
                    <textarea className={`evo-textarea ${errores.subjetivo ? "error" : ""}`} placeholder="Lo que el paciente refiere al médico: síntomas, quejas, sensaciones, cómo se siente el paciente..." value={form.subjetivo} onChange={e => setForm({ ...form, subjetivo: e.target.value })} />
                    {errores.subjetivo && <span className="evo-error-msg">{errores.subjetivo}</span>}
                  </div>
                  <div className="evo-field">
                    <label className="evo-label" style={{ color: "#16a34a" }}>O — Objetivo *</label>
                    <textarea className={`evo-textarea ${errores.objetivo ? "error" : ""}`} placeholder="Observaciones clínicas, hallazgos físicos en exploración, resultados de laboratorio, factores objetivos..." value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} />
                    {errores.objetivo && <span className="evo-error-msg">{errores.objetivo}</span>}
                  </div>
                  <div className="evo-field">
                    <label className="evo-label" style={{ color: "#d97706" }}>A — Análisis *</label>
                    <textarea className={`evo-textarea ${errores.analisis ? "error" : ""}`} placeholder="Interpretación clínica, diagnósticos diferenciales, impresión diagnóstica, progreso del paciente..." value={form.analisis} onChange={e => setForm({ ...form, analisis: e.target.value })} />
                    {errores.analisis && <span className="evo-error-msg">{errores.analisis}</span>}
                  </div>
                  <div className="evo-field">
                    <label className="evo-label" style={{ color: "#dc2626" }}>P — Plan *</label>
                    <textarea className={`evo-textarea ${errores.plan ? "error" : ""}`} placeholder="Plan de tratamiento, conducta a seguir, medicamentos, estudios, interconsultas..." value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} />
                    {errores.plan && <span className="evo-error-msg">{errores.plan}</span>}
                  </div>
                </div>

                {/* ESTADO DEL PACIENTE */}
                <div className="evo-section-title">Estado del Paciente</div>
                <div className="evo-grid-3" style={{ marginBottom: 16 }}>
                  <div className="evo-field">
                    <label className="evo-label">Estado Mental</label>
                    <select className="evo-select" value={form.estado_mental} onChange={e => setForm({ ...form, estado_mental: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      <option value="Alerta">Alerta</option>
                      <option value="Orientado">Orientado</option>
                      <option value="Confuso">Confuso</option>
                      <option value="Somnoliento">Somnoliento</option>
                      <option value="Agitado">Agitado</option>
                      <option value="Ansioso">Ansioso</option>
                    </select>
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Condición General</label>
                    <select className="evo-select" value={form.condicion_general} onChange={e => setForm({ ...form, condicion_general: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      <option value="Buena">Buena</option>
                      <option value="Regular">Regular</option>
                      <option value="Mala">Mala</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Estado de Ánimo</label>
                    <select className="evo-select" value={form.estado_animo} onChange={e => setForm({ ...form, estado_animo: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      <option value="Estable">Estable</option>
                      <option value="Ansioso">Ansioso</option>
                      <option value="Deprimido">Deprimido</option>
                      <option value="Irritable">Irritable</option>
                      <option value="Eufórico">Eufórico</option>
                    </select>
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Patrón de Sueño</label>
                    <input className="evo-input" placeholder="ej. Duerme bien, insomnio, pesadillas..." value={form.patron_sueno} onChange={e => setForm({ ...form, patron_sueno: e.target.value })} />
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Apetito</label>
                    <select className="evo-select" value={form.apetito} onChange={e => setForm({ ...form, apetito: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      <option value="Normal">Normal</option>
                      <option value="Aumentado">Aumentado</option>
                      <option value="Disminuido">Disminuido</option>
                      <option value="Sin apetito">Sin apetito</option>
                    </select>
                  </div>
                  <div className="evo-field">
                    <label className="evo-label">Ajustes al Tratamiento</label>
                    <input className="evo-input" placeholder="Cambios en medicación, dosis, etc." value={form.ajustes_tratamiento} onChange={e => setForm({ ...form, ajustes_tratamiento: e.target.value })} />
                  </div>
                </div>

                <div className="evo-footer">
                  <button className="evo-btn-cancel" onClick={() => { setMostrarForm(false); setForm(formInicial); setErrores({}); }}>Cancelar</button>
                  <button className="evo-btn-save" onClick={handleGuardar} disabled={guardando}>
                    💾 {guardando ? "Guardando..." : "Guardar Nota"}
                  </button>
                </div>
              </div>
            )}

            {/* HISTORIAL — SOLO MÉDICO */}
            {esMedico && (
              <div className="evo-historial">
                <div className="evo-historial-title">
                  📋 Historial de Notas
                  {notas.length > 0 && <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400 }}>({notas.length} notas registradas)</span>}
                </div>

                {cargandoNotas ? (
                  <div className="evo-empty">Cargando notas...</div>
                ) : notas.length === 0 ? (
                  <div className="evo-empty">No hay notas de evolución registradas para este paciente</div>
                ) : (
                  notas.map((n, i) => (
                    <div className="evo-nota-item" key={i}>
                      <div className="evo-nota-header">
                        <div>
                          <div className="evo-nota-autor">👤 {n.nombre_medico}</div>
                          <div className="evo-nota-fecha">
                            📅 {n.fecha ? new Date(n.fecha).toLocaleDateString() : "—"} — {n.hora || "—"} hrs
                          </div>
                        </div>
                        {n.dia_tratamiento && (
                          <span className="evo-nota-dia">Día {n.dia_tratamiento}</span>
                        )}
                      </div>

                      {/* SIGNOS VITALES */}
                      <div className="evo-nota-signos">
                        <div>
                          <div className="evo-nota-signo-label">Presión</div>
                          <div className="evo-nota-signo-value">{n.presion_arterial || "—"}</div>
                        </div>
                        <div>
                          <div className="evo-nota-signo-label">FC</div>
                          <div className="evo-nota-signo-value">{n.frecuencia_cardiaca ? `${n.frecuencia_cardiaca} lpm` : "—"}</div>
                        </div>
                        <div>
                          <div className="evo-nota-signo-label">FR</div>
                          <div className="evo-nota-signo-value">{n.frecuencia_respiratoria ? `${n.frecuencia_respiratoria} rpm` : "—"}</div>
                        </div>
                        <div>
                          <div className="evo-nota-signo-label">SpO₂</div>
                          <div className="evo-nota-signo-value">{n.saturacion_oxigeno ? `${n.saturacion_oxigeno}%` : "—"}</div>
                        </div>
                        <div>
                          <div className="evo-nota-signo-label">Temp</div>
                          <div className="evo-nota-signo-value">{n.temperatura ? `${n.temperatura}°C` : "—"}</div>
                        </div>
                        <div>
                          <div className="evo-nota-signo-label">Glucosa</div>
                          <div className="evo-nota-signo-value">{n.glucosa ? `${n.glucosa} mg/dL` : "—"}</div>
                        </div>
                      </div>

                      {/* SOAP */}
                      <div className="evo-nota-soap">
                        <div className="evo-nota-soap-item">
                          <div className="evo-nota-soap-label s">S — Subjetivo</div>
                          <div className="evo-nota-soap-value">{n.subjetivo || "—"}</div>
                        </div>
                        <div className="evo-nota-soap-item">
                          <div className="evo-nota-soap-label o">O — Objetivo</div>
                          <div className="evo-nota-soap-value">{n.objetivo || "—"}</div>
                        </div>
                        <div className="evo-nota-soap-item">
                          <div className="evo-nota-soap-label a">A — Análisis</div>
                          <div className="evo-nota-soap-value">{n.analisis || "—"}</div>
                        </div>
                        <div className="evo-nota-soap-item">
                          <div className="evo-nota-soap-label p">P — Plan</div>
                          <div className="evo-nota-soap-value">{n.plan || "—"}</div>
                        </div>
                      </div>

                      {/* ESTADO */}
                      {(n.estado_mental || n.condicion_general || n.estado_animo || n.patron_sueno || n.apetito) && (
                        <div className="evo-nota-estado">
                          {n.estado_mental && <div><div className="evo-nota-estado-label">Estado Mental</div><div className="evo-nota-estado-value">{n.estado_mental}</div></div>}
                          {n.condicion_general && <div><div className="evo-nota-estado-label">Condición</div><div className="evo-nota-estado-value">{n.condicion_general}</div></div>}
                          {n.estado_animo && <div><div className="evo-nota-estado-label">Estado de Ánimo</div><div className="evo-nota-estado-value">{n.estado_animo}</div></div>}
                          {n.patron_sueno && <div><div className="evo-nota-estado-label">Sueño</div><div className="evo-nota-estado-value">{n.patron_sueno}</div></div>}
                          {n.apetito && <div><div className="evo-nota-estado-label">Apetito</div><div className="evo-nota-estado-value">{n.apetito}</div></div>}
                        </div>
                      )}

                      {n.ajustes_tratamiento && (
                        <div className="evo-nota-ajuste">⚙️ <strong>Ajustes:</strong> {n.ajustes_tratamiento}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MENSAJE PARA ENFERMERA */}
            {!esMedico && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "16px", fontSize: 13, color: "#92400e", marginTop: 8 }}>
                ⚠️ El historial de notas de evolución solo está disponible para el médico tratante.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}