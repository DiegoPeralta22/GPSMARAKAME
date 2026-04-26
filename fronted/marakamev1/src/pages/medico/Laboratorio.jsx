import { useState, useEffect } from "react";
import { obtenerPacientes, obtenerSolicitudesLab, crearSolicitudLab } from "../../services/medicoService";

const styles = `
  .lab-container { padding: 0; }
  .lab-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .lab-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .lab-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .lab-tab { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; transition: all 0.15s; }
  .lab-tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  .lab-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .lab-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .lab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .lab-field { display: flex; flex-direction: column; gap: 6px; }
  .lab-label { font-size: 12px; color: #374151; font-weight: 500; }
  .lab-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .lab-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .lab-input.error { border-color: #ef4444; }
  .lab-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 80px; transition: border 0.15s; width: 100%; }
  .lab-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .lab-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; background: #fff; }
  .lab-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .lab-select.error { border-color: #ef4444; }
  .lab-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .lab-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .lab-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .lab-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .lab-btn-save:hover { background: #2563eb; }
  .lab-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .lab-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .lab-search-wrap { position: relative; }
  .lab-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .lab-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .lab-search-item:last-child { border-bottom: none; }
  .lab-search-item:hover { background: #f9fafb; }
  .lab-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .lab-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .lab-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .lab-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .lab-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .lab-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }

  /* ESTUDIOS */
  .lab-categoria { margin-bottom: 20px; }
  .lab-categoria-title { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .lab-categoria-title::after { content: ''; flex: 1; height: 1px; background: #f3f4f6; }
  .lab-estudios-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .lab-estudio-check { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.15s; user-select: none; }
  .lab-estudio-check:hover { border-color: #3b82f6; background: #f8faff; }
  .lab-estudio-check.selected { border-color: #3b82f6; background: #eff6ff; }
  .lab-estudio-check input[type="checkbox"] { accent-color: #3b82f6; width: 14px; height: 14px; cursor: pointer; flex-shrink: 0; }
  .lab-estudio-nombre { font-size: 12px; color: #374151; font-weight: 500; }
  .lab-estudio-check.selected .lab-estudio-nombre { color: #1d4ed8; }
  .lab-resumen-estudios { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; margin-top: 16px; }
  .lab-resumen-title { font-size: 12px; font-weight: 600; color: #0369a1; margin-bottom: 8px; }
  .lab-resumen-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .lab-resumen-tag { background: #fff; border: 1px solid #bae6fd; border-radius: 20px; padding: 3px 10px; font-size: 11px; color: #0369a1; font-weight: 500; }

  /* LISTA */
  .lab-lista-item { padding: 20px; border-bottom: 1px solid #f3f4f6; }
  .lab-lista-item:last-child { border-bottom: none; }
  .lab-lista-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .lab-lista-nombre { font-size: 15px; font-weight: 600; color: #111827; }
  .lab-lista-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .lab-lista-meta { display: flex; align-items: center; gap: 8px; flex-direction: column; align-items: flex-end; }
  .lab-lista-fecha { font-size: 12px; color: #9ca3af; }
  .lab-prioridad-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .lab-prioridad-badge.urgente { background: #fff1f2; color: #ef4444; }
  .lab-prioridad-badge.rutina { background: #f0fdf4; color: #16a34a; }
  .lab-prioridad-badge.prioritario { background: #fff7ed; color: #f97316; }
  .lab-estado-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .lab-estado-badge.pendiente { background: #fefce8; color: #ca8a04; }
  .lab-estado-badge.completado { background: #f0fdf4; color: #16a34a; }
  .lab-estudios-lista { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  .lab-estudio-tag { background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
  .lab-instrucciones { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-top: 16px; }
  .lab-instrucciones-title { font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 6px; }
  .lab-instrucciones-text { font-size: 12px; color: #78350f; }
`;

const CATEGORIAS_ESTUDIOS = [
  {
    nombre: "Química Sanguínea",
    estudios: ["Glucosa", "Urea", "Creatinina", "Ácido Úrico", "Colesterol Total", "Triglicéridos", "HDL", "LDL"]
  },
  {
    nombre: "Electrolitos",
    estudios: ["Sodio", "Potasio", "Cloro", "Magnesio", "Fósforo", "Calcio"]
  },
  {
    nombre: "Función Hepática",
    estudios: ["Bilirrubina Total", "Bilirrubina Directa", "TGO (AST)", "TGP (ALT)", "Fosfatasa Alcalina", "Albúmina", "Proteínas Totales"]
  },
  {
    nombre: "Biometría Hemática",
    estudios: ["Hemoglobina", "Hematocrito", "Leucocitos", "Linfocitos", "Plaquetas", "Neutrófilos"]
  },
  {
    nombre: "Serología",
    estudios: ["VIH", "Hepatitis B (HBsAg)", "Hepatitis C (Anti-HCV)", "VDRL", "Mycobacterium Tuberculosis"]
  },
  {
    nombre: "Otros",
    estudios: ["Examen General de Orina", "Amilasa", "Lipasa", "Pruebas de Coagulación", "Perfil Tiroideo"]
  }
];

export default function Laboratorio({ rol }) {
  const [tab, setTab] = useState("lista");
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [errores, setErrores] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [estudiosSeleccionados, setEstudiosSeleccionados] = useState([]);

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    prioridad: "rutina",
    indicacion_diagnostico: "",
    notas_adicionales: ""
  });

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esReadOnly = rol === "enfermera";

  useEffect(() => { cargarSolicitudes(); }, []);

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      const pacientes = await obtenerPacientes("todos", "");
      const conExpediente = pacientes.filter(p => p.id_expediente);
      const todas = [];
      for (const p of conExpediente) {
        const data = await obtenerSolicitudesLab(p.id_paciente);
        if (data?.solicitudes?.length > 0) {
          data.solicitudes.forEach(sol => {
            const estudios = data.estudios?.filter(e => e.id_solicitud_lab === sol.id_solicitud_lab) || [];
            todas.push({ ...sol, nombre: p.nombre, apellido: p.apellido, estudios });
          });
        }
      }
      todas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setSolicitudes(todas);
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

  const toggleEstudio = (categoria, estudio) => {
    const key = `${categoria}||${estudio}`;
    const yaExiste = estudiosSeleccionados.find(e => e.key === key);
    if (yaExiste) {
      setEstudiosSeleccionados(estudiosSeleccionados.filter(e => e.key !== key));
    } else {
      setEstudiosSeleccionados([...estudiosSeleccionados, { key, categoria, nombre_estudio: estudio }]);
    }
  };

  const estaSeleccionado = (categoria, estudio) =>
    estudiosSeleccionados.some(e => e.key === `${categoria}||${estudio}`);

  const validar = () => {
    const e = {};
    if (!pacienteSeleccionado) e.paciente = "Selecciona un paciente";
    if (estudiosSeleccionados.length === 0) e.estudios = "Selecciona al menos un estudio";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await crearSolicitudLab({
        ...form,
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        estudios: estudiosSeleccionados.map(e => ({
          categoria: e.categoria,
          nombre_estudio: e.nombre_estudio
        }))
      });
      setExito("✅ Solicitud de laboratorio enviada correctamente.");
      cargarSolicitudes();
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
    setEstudiosSeleccionados([]);
    setForm({
      fecha: new Date().toISOString().split("T")[0],
      prioridad: "rutina",
      indicacion_diagnostico: "",
      notas_adicionales: ""
    });
    setErrores({});
  };

  return (
    <>
      <style>{styles}</style>
      <div className="lab-container">
        <h1 className="lab-title">Solicitud de Laboratorio</h1>
        <p className="lab-subtitle">Envío de estudios de laboratorio</p>

        {exito && <div className="lab-success">{exito}</div>}

        <div className="lab-tabs">
          <button className={`lab-tab ${tab === "lista" ? "active" : ""}`} onClick={() => setTab("lista")}>
            Solicitudes Registradas
          </button>
          {!esReadOnly && (
            <button className={`lab-tab ${tab === "nueva" ? "active" : ""}`} onClick={() => setTab("nueva")}>
              Nueva Solicitud
            </button>
          )}
        </div>

        {/* LISTA */}
        {tab === "lista" && (
          <div className="lab-card">
            {cargando ? (
              <div className="lab-empty">Cargando solicitudes...</div>
            ) : solicitudes.length === 0 ? (
              <div className="lab-empty">No hay solicitudes de laboratorio registradas</div>
            ) : (
              solicitudes.map((sol, i) => (
                <div className="lab-lista-item" key={i}>
                  <div className="lab-lista-header">
                    <div>
                      <div className="lab-lista-nombre">{sol.nombre} {sol.apellido}</div>
                      <div className="lab-lista-info">Dr. {sol.nombre_medico}</div>
                    </div>
                    <div className="lab-lista-meta">
                      <span className={`lab-prioridad-badge ${sol.prioridad}`}>{sol.prioridad?.charAt(0).toUpperCase() + sol.prioridad?.slice(1)}</span>
                      <span className={`lab-estado-badge ${sol.estado}`}>{sol.estado?.charAt(0).toUpperCase() + sol.estado?.slice(1)}</span>
                      <span className="lab-lista-fecha">{sol.fecha ? new Date(sol.fecha).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>

                  {sol.indicacion_diagnostico && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Indicación Diagnóstica</div>
                      <div style={{ fontSize: 13, color: "#374151" }}>{sol.indicacion_diagnostico}</div>
                    </div>
                  )}

                  {sol.estudios?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", marginBottom: 6 }}>Estudios solicitados ({sol.estudios.length})</div>
                      <div className="lab-estudios-lista">
                        {sol.estudios.map((e, j) => (
                          <span key={j} className="lab-estudio-tag">{e.nombre_estudio}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sol.notas_adicionales && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                      💬 {sol.notas_adicionales}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* NUEVA SOLICITUD */}
        {tab === "nueva" && !esReadOnly && (
          <>
            {/* PACIENTE */}
            <div className="lab-card">
              <div className="lab-section-title">Información del Paciente</div>
              {pacienteSeleccionado ? (
                <div className="lab-persona-seleccionada">
                  <div>
                    <div className="lab-persona-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                    <div className="lab-persona-info">
                      {pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • Expediente #{String(pacienteSeleccionado.id_expediente).padStart(3, "0")}
                    </div>
                  </div>
                  <button className="lab-cambiar-btn" onClick={() => setPacienteSeleccionado(null)}>Cambiar</button>
                </div>
              ) : (
                <div className="lab-field">
                  <label className="lab-label">Buscar paciente</label>
                  <div className="lab-search-wrap">
                    <input
                      className={`lab-input ${errores.paciente ? "error" : ""}`}
                      placeholder="Escribe el nombre del paciente..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                    />
                    {busqueda.length >= 2 && (
                      <div className="lab-search-results">
                        {buscando ? (
                          <div className="lab-no-resultados">Buscando...</div>
                        ) : resultadosBusqueda.length === 0 ? (
                          <div className="lab-no-resultados">No se encontraron pacientes</div>
                        ) : (
                          resultadosBusqueda.map((p, i) => (
                            <div key={i} className="lab-search-item" onClick={() => seleccionarPaciente(p)}>
                              <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {errores.paciente && <span className="lab-error-msg">{errores.paciente}</span>}
                </div>
              )}

              <div className="lab-grid" style={{ marginTop: 16 }}>
                <div className="lab-field">
                  <label className="lab-label">Fecha <span style={{ color: "#9ca3af", fontWeight: 400 }}>(automática)</span></label>
                  <input className="lab-input" type="date" value={form.fecha} readOnly style={{ background: "#f9fafb", color: "#6b7280", cursor: "not-allowed" }} />
                </div>
                <div className="lab-field">
                  <label className="lab-label">Prioridad</label>
                  <select className="lab-select" value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })}>
                    <option value="rutina">Rutina</option>
                    <option value="prioritario">Prioritario</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ESTUDIOS */}
            <div className="lab-card">
              <div className="lab-section-title">Seleccionar Estudios</div>

              {errores.estudios && (
                <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>
                  ⚠️ {errores.estudios}
                </div>
              )}

              {CATEGORIAS_ESTUDIOS.map((cat, ci) => (
                <div className="lab-categoria" key={ci}>
                  <div className="lab-categoria-title">{cat.nombre}</div>
                  <div className="lab-estudios-grid">
                    {cat.estudios.map((estudio, ei) => (
                      <label
                        key={ei}
                        className={`lab-estudio-check ${estaSeleccionado(cat.nombre, estudio) ? "selected" : ""}`}
                        onClick={() => toggleEstudio(cat.nombre, estudio)}
                      >
                        <input
                          type="checkbox"
                          checked={estaSeleccionado(cat.nombre, estudio)}
                          onChange={() => {}}
                        />
                        <span className="lab-estudio-nombre">{estudio}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {estudiosSeleccionados.length > 0 && (
                <div className="lab-resumen-estudios">
                  <div className="lab-resumen-title">📋 {estudiosSeleccionados.length} estudio(s) seleccionado(s)</div>
                  <div className="lab-resumen-tags">
                    {estudiosSeleccionados.map((e, i) => (
                      <span key={i} className="lab-resumen-tag">{e.nombre_estudio}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* INFORMACIÓN CLÍNICA */}
            <div className="lab-card">
              <div className="lab-section-title">Información Clínica</div>
              <div className="lab-field" style={{ marginBottom: 16 }}>
                <label className="lab-label">Indicación / Diagnóstico Presuntivo</label>
                <textarea
                  className="lab-textarea"
                  placeholder="Motivo de la solicitud, diagnóstico presuntivo, sospecha clínica..."
                  value={form.indicacion_diagnostico}
                  onChange={e => setForm({ ...form, indicacion_diagnostico: e.target.value })}
                />
              </div>
              <div className="lab-field">
                <label className="lab-label">Notas Adicionales</label>
                <textarea
                  className="lab-textarea"
                  placeholder="Información adicional relevante para el laboratorio..."
                  value={form.notas_adicionales}
                  onChange={e => setForm({ ...form, notas_adicionales: e.target.value })}
                />
              </div>

              <div className="lab-instrucciones">
                <div className="lab-instrucciones-title">📌 Instrucciones para el Paciente</div>
                <div className="lab-instrucciones-text">
                  • Ayuno de 8-12 horas antes de la toma de muestra<br/>
                  • Suspender suplementos vitamínicos 48 horas antes<br/>
                  • Presentarse con hidratación normal (no en Ayuno de líquidos)<br/>
                  • Esperar confirmación y fecha de toma de muestra
                </div>
              </div>
            </div>

            <div className="lab-footer">
              <button className="lab-btn-cancel" onClick={() => { setTab("lista"); resetForm(); }}>Cancelar</button>
              <button className="lab-btn-save" onClick={handleGuardar} disabled={guardando}>
                🔬 {guardando ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}