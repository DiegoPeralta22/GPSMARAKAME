import { useState, useEffect } from "react";
import { obtenerPacientes, obtenerActividades, crearActividad } from "../../services/medicoService";

const styles = `
  .act-container { padding: 0; }
  .act-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .act-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .act-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .act-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .act-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .act-field { display: flex; flex-direction: column; gap: 6px; }
  .act-label { font-size: 12px; color: #374151; font-weight: 500; }
  .act-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .act-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .act-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 80px; transition: border 0.15s; width: 100%; }
  .act-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .act-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .act-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .act-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .act-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .act-btn-save:hover { background: #2563eb; }
  .act-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .act-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .act-search-wrap { position: relative; }
  .act-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .act-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .act-search-item:last-child { border-bottom: none; }
  .act-search-item:hover { background: #f9fafb; }
  .act-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .act-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .act-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .act-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .act-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .act-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
  .act-nueva-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; margin-bottom: 20px; }
  .act-nueva-btn:hover { background: #2563eb; }
  .act-form-container { border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin-bottom: 20px; background: #f8faff; }
  .act-form-title { font-size: 14px; font-weight: 600; color: #1d4ed8; margin-bottom: 16px; }

  /* CATEGORIAS */
  .act-categoria { margin-bottom: 20px; }
  .act-categoria-title { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .act-categoria-title::after { content: ''; flex: 1; height: 1px; background: #f3f4f6; }
  .act-checks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .act-check { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.15s; user-select: none; }
  .act-check:hover { border-color: #3b82f6; background: #f8faff; }
  .act-check.selected { border-color: #3b82f6; background: #eff6ff; }
  .act-check input[type="checkbox"] { accent-color: #3b82f6; width: 14px; height: 14px; cursor: pointer; flex-shrink: 0; }
  .act-check-nombre { font-size: 12px; color: #374151; font-weight: 500; }
  .act-check.selected .act-check-nombre { color: #1d4ed8; }
  .act-resumen { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; margin-top: 16px; }
  .act-resumen-title { font-size: 12px; font-weight: 600; color: #0369a1; margin-bottom: 8px; }
  .act-resumen-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .act-resumen-tag { background: #fff; border: 1px solid #bae6fd; border-radius: 20px; padding: 3px 10px; font-size: 11px; color: #0369a1; font-weight: 500; }

  /* HISTORIAL */
  .act-hist-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .act-hist-item:last-child { margin-bottom: 0; }
  .act-hist-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .act-hist-autor { font-size: 13px; font-weight: 600; color: #111827; }
  .act-hist-fecha { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .act-hist-estado { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .act-hist-estado.pendiente { background: #fefce8; color: #ca8a04; }
  .act-hist-estado.completado { background: #f0fdf4; color: #16a34a; }
  .act-hist-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .act-hist-tag { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
  .act-hist-tag.terapia { background: #eff6ff; color: #1d4ed8; }
  .act-hist-tag.taller { background: #f5f3ff; color: #7c3aed; }
  .act-hist-tag.deporte { background: #f0fdf4; color: #16a34a; }
  .act-hist-tag.servicio { background: #fff7ed; color: #f97316; }
  .act-hist-tag.recreacion { background: #fef9c3; color: #ca8a04; }
  .act-hist-obs { font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 8px; margin-top: 4px; }
`;

const CATEGORIAS_ACTIVIDADES = [
  {
    nombre: "Deportes",
    emoji: "⚽",
    color: "deporte",
    actividades: ["Fútbol", "Basquetbol", "Voleibol", "Natación", "Caminata", "Ejercicio Físico General"]
  },
  {
    nombre: "Servicio",
    emoji: "🤝",
    color: "servicio",
    actividades: ["Actividad Física Terapéutica", "Servicio Comunitario", "Jardinería", "Cocina Terapéutica"]
  },
  {
    nombre: "Recreación",
    emoji: "🎮",
    color: "recreacion",
    actividades: ["Juegos de Mesa", "Lectura", "Música", "Manualidades", "Pintura", "Meditación"]
  }
];

export default function Actividades({ rol }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [errores, setErrores] = useState({});

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const fechaHoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  useEffect(() => {
    if (pacienteSeleccionado) cargarActividades(pacienteSeleccionado.id_paciente);
  }, [pacienteSeleccionado]);

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
    setActividades([]);
    setDetalles([]);
  };

  const cargarActividades = async (id_paciente) => {
    try {
      setCargando(true);
      const data = await obtenerActividades(id_paciente);
      setActividades(Array.isArray(data?.actividades) ? data.actividades : []);
      setDetalles(Array.isArray(data?.detalles) ? data.detalles : []);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const toggleActividad = (categoria, nombre) => {
    const key = `${categoria}||${nombre}`;
    const yaExiste = seleccionadas.find(a => a.key === key);
    if (yaExiste) {
      setSeleccionadas(seleccionadas.filter(a => a.key !== key));
    } else {
      setSeleccionadas([...seleccionadas, { key, categoria, nombre_actividad: nombre }]);
    }
  };

  const estaSeleccionada = (categoria, nombre) =>
    seleccionadas.some(a => a.key === `${categoria}||${nombre}`);

  const validar = () => {
    const e = {};
    if (seleccionadas.length === 0) e.actividades = "Selecciona al menos una actividad";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await crearActividad({
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        fecha: fechaHoy,
        observaciones: observaciones || null,
        actividades: seleccionadas.map(a => ({
          categoria: a.categoria,
          nombre_actividad: a.nombre_actividad
        }))
      });
      setExito("✅ Actividades registradas correctamente.");
      setSeleccionadas([]);
      setObservaciones("");
      setMostrarForm(false);
      cargarActividades(pacienteSeleccionado.id_paciente);
      setTimeout(() => setExito(null), 5000);
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  const getColorTag = (categoria) => {
    const cat = CATEGORIAS_ACTIVIDADES.find(c => c.nombre === categoria);
    return cat?.color || "terapia";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="act-container">
        <h1 className="act-title">Actividades del Paciente</h1>
        <p className="act-subtitle">Registro de terapias, talleres y actividades físicas</p>

        {exito && <div className="act-success">{exito}</div>}

        {/* SELECCIÓN PACIENTE */}
        <div className="act-card">
          <div className="act-section-title">Paciente</div>
          {pacienteSeleccionado ? (
            <div className="act-persona-seleccionada">
              <div>
                <div className="act-persona-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                <div className="act-persona-info">
                  {pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • Expediente #{String(pacienteSeleccionado.id_expediente).padStart(3, "0")}
                  {pacienteSeleccionado.estado && ` • ${pacienteSeleccionado.estado}`}
                </div>
              </div>
              <button className="act-cambiar-btn" onClick={() => { setPacienteSeleccionado(null); setActividades([]); setDetalles([]); setMostrarForm(false); }}>Cambiar</button>
            </div>
          ) : (
            <div className="act-field">
              <label className="act-label">Buscar paciente</label>
              <div className="act-search-wrap">
                <input
                  className="act-input"
                  placeholder="Escribe el nombre del paciente..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
                {busqueda.length >= 2 && (
                  <div className="act-search-results">
                    {buscando ? (
                      <div className="act-no-resultados">Buscando...</div>
                    ) : resultadosBusqueda.length === 0 ? (
                      <div className="act-no-resultados">No se encontraron pacientes</div>
                    ) : (
                      resultadosBusqueda.map((p, i) => (
                        <div key={i} className="act-search-item" onClick={() => seleccionarPaciente(p)}>
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
            {!mostrarForm && (
              <button className="act-nueva-btn" onClick={() => setMostrarForm(true)}>
                ➕ Registrar Actividades
              </button>
            )}

            {/* FORMULARIO */}
            {mostrarForm && (
              <div className="act-form-container">
                <div className="act-form-title">📅 Registrar Actividades — {fechaHoy}</div>

                {errores.actividades && (
                  <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>
                    ⚠️ {errores.actividades}
                  </div>
                )}

                {CATEGORIAS_ACTIVIDADES.map((cat, ci) => (
                  <div className="act-categoria" key={ci}>
                    <div className="act-categoria-title">{cat.emoji} {cat.nombre}</div>
                    <div className="act-checks-grid">
                      {cat.actividades.map((act, ai) => (
                        <label
                          key={ai}
                          className={`act-check ${estaSeleccionada(cat.nombre, act) ? "selected" : ""}`}
                          onClick={() => toggleActividad(cat.nombre, act)}
                        >
                          <input
                            type="checkbox"
                            checked={estaSeleccionada(cat.nombre, act)}
                            onChange={() => {}}
                          />
                          <span className="act-check-nombre">{act}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {seleccionadas.length > 0 && (
                  <div className="act-resumen">
                    <div className="act-resumen-title">📋 {seleccionadas.length} actividad(es) seleccionada(s)</div>
                    <div className="act-resumen-tags">
                      {seleccionadas.map((a, i) => (
                        <span key={i} className="act-resumen-tag">{a.nombre_actividad}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="act-field" style={{ marginTop: 16 }}>
                  <label className="act-label">Observaciones</label>
                  <textarea
                    className="act-textarea"
                    placeholder="Observaciones adicionales sobre las actividades del paciente..."
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                  />
                </div>

                <div className="act-footer">
                  <button className="act-btn-cancel" onClick={() => { setMostrarForm(false); setSeleccionadas([]); setObservaciones(""); setErrores({}); }}>Cancelar</button>
                  <button className="act-btn-save" onClick={handleGuardar} disabled={guardando}>
                    💾 {guardando ? "Guardando..." : "Guardar Actividades"}
                  </button>
                </div>
              </div>
            )}

            {/* HISTORIAL */}
            <div className="act-card">
              <div className="act-section-title">
                Historial de Actividades
                {actividades.length > 0 && <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>({actividades.length} registros)</span>}
              </div>

              {cargando ? (
                <div className="act-empty">Cargando actividades...</div>
              ) : actividades.length === 0 ? (
                <div className="act-empty">No hay actividades registradas para este paciente</div>
              ) : (
                actividades.map((a, i) => {
                  const dets = detalles.filter(d => d.id_actividad === a.id_actividad);
                  return (
                    <div className="act-hist-item" key={i}>
                      <div className="act-hist-header">
                        <div>
                          <div className="act-hist-autor">👤 {a.nombre_medico}</div>
                          <div className="act-hist-fecha">📅 {a.fecha ? new Date(a.fecha).toLocaleDateString() : "—"}</div>
                        </div>
                        <span className={`act-hist-estado ${a.estado}`}>
                          {a.estado === "pendiente" ? "⏳ Pendiente" : "✅ Completado"}
                        </span>
                      </div>

                      {dets.length > 0 && (
                        <div className="act-hist-tags">
                          {dets.map((d, j) => (
                            <span key={j} className={`act-hist-tag ${getColorTag(d.categoria)}`}>
                              {d.nombre_actividad}
                            </span>
                          ))}
                        </div>
                      )}

                      {a.observaciones && (
                        <div className="act-hist-obs">💬 {a.observaciones}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}   