import { useState, useEffect } from "react";
import {
  obtenerPacientes,
  obtenerDiagnosticos,
  crearDiagnostico,
  crearSolicitudCambio
} from "../../services/medicoService";

const styles = `
  .dx-container { padding: 0; }
  .dx-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .dx-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .dx-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .dx-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .dx-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .dx-field { display: flex; flex-direction: column; gap: 6px; }
  .dx-label { font-size: 12px; color: #374151; font-weight: 500; }
  .dx-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; }
  .dx-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .dx-input.error { border-color: #ef4444; }
  .dx-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 80px; transition: border 0.15s; width: 100%; }
  .dx-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .dx-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border 0.15s; width: 100%; background: #fff; }
  .dx-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .dx-select.error { border-color: #ef4444; }
  .dx-error-msg { font-size: 11px; color: #ef4444; margin-top: 2px; }
  .dx-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
  .dx-btn-cancel { padding: 10px 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .dx-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .dx-btn-save:hover { background: #2563eb; }
  .dx-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .dx-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; color: #16a34a; font-size: 13px; margin-bottom: 16px; }
  .dx-search-wrap { position: relative; }
  .dx-search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 50; max-height: 200px; overflow-y: auto; }
  .dx-search-item { padding: 10px 14px; cursor: pointer; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .dx-search-item:last-child { border-bottom: none; }
  .dx-search-item:hover { background: #f9fafb; }
  .dx-no-resultados { padding: 12px 14px; font-size: 13px; color: #9ca3af; text-align: center; }
  .dx-persona-seleccionada { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .dx-persona-nombre { font-size: 14px; font-weight: 600; color: #1d4ed8; }
  .dx-persona-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .dx-cambiar-btn { font-size: 12px; color: #3b82f6; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; }
  .dx-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }

  /* CIE-10 */
  .dx-cie-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .dx-cie-item { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
  .dx-cie-item:hover { border-color: #3b82f6; background: #f8faff; }
  .dx-cie-item.selected { border-color: #3b82f6; background: #eff6ff; }
  .dx-cie-codigo { font-size: 12px; font-weight: 700; color: #3b82f6; margin-bottom: 2px; }
  .dx-cie-desc { font-size: 12px; color: #374151; }
  .dx-cie-item.selected .dx-cie-codigo { color: #1d4ed8; }

  /* DIAGNÓSTICOS REGISTRADOS */
  .dx-nueva-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; margin-bottom: 20px; }
  .dx-nueva-btn:hover { background: #2563eb; }
  .dx-form-container { border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin-bottom: 20px; background: #f8faff; }
  .dx-form-title { font-size: 14px; font-weight: 600; color: #1d4ed8; margin-bottom: 16px; }
  .dx-dx-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .dx-dx-item:last-child { margin-bottom: 0; }
  .dx-dx-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .dx-dx-codigo { font-size: 13px; font-weight: 700; color: #3b82f6; }
  .dx-dx-tipo { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .dx-dx-tipo.principal { background: #eff6ff; color: #1d4ed8; }
  .dx-dx-tipo.secundario { background: #f5f3ff; color: #7c3aed; }
  .dx-dx-tipo.comorbilidad { background: #fff7ed; color: #f97316; }
  .dx-dx-desc { font-size: 13px; color: #374151; margin-bottom: 6px; }
  .dx-dx-meta { font-size: 11px; color: #9ca3af; }
  .dx-dx-actions { display: flex; gap: 8px; margin-top: 10px; }
  .dx-btn-solicitar { padding: 6px 12px; border: 1px solid #f97316; border-radius: 6px; background: #fff; color: #f97316; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
  .dx-btn-solicitar:hover { background: #fff7ed; }
  .dx-btn-eliminar { padding: 6px 12px; border: 1px solid #ef4444; border-radius: 6px; background: #fff; color: #ef4444; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
  .dx-btn-eliminar:hover { background: #fff1f2; }

  /* MODAL SOLICITUD */
  .dx-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 500; display: flex; align-items: center; justify-content: center; }
  .dx-modal { background: #fff; border-radius: 12px; padding: 24px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .dx-modal-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 16px; }
  .dx-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .dx-modal-info { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; font-size: 12px; color: #92400e; margin-bottom: 16px; }
  .dx-estado-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .dx-estado-badge.edicion_pendiente { background: #fff7ed; color: #f97316; }
  .dx-estado-badge.eliminacion_pendiente { background: #fff1f2; color: #ef4444; }
  .dx-estado-badge.activo { background: #f0fdf4; color: #16a34a; }
`;

const CIE10_COMUNES = [
  { codigo: "F10.2", descripcion: "Síndrome de dependencia al alcohol" },
  { codigo: "F11.2", descripcion: "Trastorno por uso de opioides" },
  { codigo: "F12.2", descripcion: "Trastorno por uso de cannabinoides" },
  { codigo: "F13.2", descripcion: "Trastorno por uso de sedantes o hipnóticos" },
  { codigo: "F14.2", descripcion: "Trastorno por uso de cocaína" },
  { codigo: "F15.2", descripcion: "Trastorno por uso de otros estimulantes (metanfetamina)" },
  { codigo: "F19.2", descripcion: "Trastorno por uso de múltiples sustancias" },
  { codigo: "F32.0", descripcion: "Episodio depresivo leve" },
  { codigo: "F32.1", descripcion: "Episodio depresivo moderado" },
  { codigo: "F41.1", descripcion: "Trastorno de ansiedad generalizada" },
];

const formInicial = {
  codigo_cie10: "",
  descripcion: "",
  tipo: "principal",
  fecha: new Date().toISOString().split("T")[0]
};

function ModalSolicitud({ diagnostico, usuario, onClose, onExito }) {
  const [tipo, setTipo] = useState("edicion");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleEnviar = async () => {
    if (!motivo.trim()) { setError("El motivo es requerido"); return; }
    try {
      setGuardando(true);
      await crearSolicitudCambio({
        id_diagnostico: diagnostico.id_diagnostico,
        id_usuario_solicitante: usuario.id_usuario,
        tipo_solicitud: tipo,
        motivo,
        datos_nuevos: null
      });
      onExito(`✅ Solicitud de ${tipo === "edicion" ? "edición" : "eliminación"} enviada al jefe médico.`);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="dx-modal-overlay" onClick={onClose}>
      <div className="dx-modal" onClick={e => e.stopPropagation()}>
        <div className="dx-modal-title">📋 Solicitar cambio al Jefe Médico</div>
        <div className="dx-modal-info">
          ⚠️ Esta acción enviará una solicitud al jefe médico para su aprobación. El diagnóstico quedará en estado pendiente hasta que sea revisado.
        </div>

        <div style={{ marginBottom: 14, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>DIAGNÓSTICO</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>{diagnostico.codigo_cie10}</div>
          <div style={{ fontSize: 13, color: "#374151" }}>{diagnostico.descripcion}</div>
        </div>

        <div className="dx-field" style={{ marginBottom: 14 }}>
          <label className="dx-label">Tipo de solicitud</label>
          <select className="dx-select" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="edicion">Edición</option>
            <option value="eliminacion">Eliminación</option>
          </select>
        </div>

        <div className="dx-field">
          <label className="dx-label">Motivo *</label>
          <textarea
            className={`dx-textarea ${error ? "error" : ""}`}
            placeholder="Explica el motivo del cambio..."
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setError(""); }}
            style={{ minHeight: 80 }}
          />
          {error && <span className="dx-error-msg">{error}</span>}
        </div>

        <div className="dx-modal-footer">
          <button className="dx-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="dx-btn-save" onClick={handleEnviar} disabled={guardando}>
            📤 {guardando ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Diagnostico({ rol }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);
  const [modalSolicitud, setModalSolicitud] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    if (busqueda.length >= 2) buscarPacientes();
    else setResultadosBusqueda([]);
  }, [busqueda]);

  useEffect(() => {
    if (pacienteSeleccionado) cargarDiagnosticos(pacienteSeleccionado.id_paciente);
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
    setDiagnosticos([]);
  };

  const cargarDiagnosticos = async (id_paciente) => {
    try {
      setCargando(true);
      const data = await obtenerDiagnosticos(id_paciente);
      setDiagnosticos(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const seleccionarCIE = (cie) => {
    setForm({ ...form, codigo_cie10: cie.codigo, descripcion: cie.descripcion });
  };

  const validar = () => {
    const e = {};
    if (!form.codigo_cie10) e.codigo_cie10 = "Requerido";
    if (!form.descripcion) e.descripcion = "Requerido";
    if (!form.tipo) e.tipo = "Requerido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await crearDiagnostico({
        ...form,
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario
      });
      setExito("✅ Diagnóstico registrado correctamente.");
      setForm(formInicial);
      setMostrarForm(false);
      cargarDiagnosticos(pacienteSeleccionado.id_paciente);
      setTimeout(() => setExito(null), 5000);
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  const handleExitoSolicitud = (msg) => {
    setExito(msg);
    cargarDiagnosticos(pacienteSeleccionado.id_paciente);
    setTimeout(() => setExito(null), 5000);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dx-container">
        <h1 className="dx-title">Diagnóstico Médico</h1>
        <p className="dx-subtitle">Registro de diagnósticos CIE-10</p>

        {exito && <div className="dx-success">{exito}</div>}

        {/* MODAL SOLICITUD */}
        {modalSolicitud && (
          <ModalSolicitud
            diagnostico={modalSolicitud}
            usuario={usuario}
            onClose={() => setModalSolicitud(null)}
            onExito={handleExitoSolicitud}
          />
        )}

        {/* SELECCIÓN PACIENTE */}
        <div className="dx-card">
          <div className="dx-section-title">Paciente</div>
          {pacienteSeleccionado ? (
            <div className="dx-persona-seleccionada">
              <div>
                <div className="dx-persona-nombre">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                <div className="dx-persona-info">
                  {pacienteSeleccionado.edad} años • {pacienteSeleccionado.genero} • Expediente #{String(pacienteSeleccionado.id_expediente).padStart(3, "0")}
                  {pacienteSeleccionado.estado && ` • ${pacienteSeleccionado.estado}`}
                </div>
              </div>
              <button className="dx-cambiar-btn" onClick={() => { setPacienteSeleccionado(null); setDiagnosticos([]); setMostrarForm(false); }}>Cambiar</button>
            </div>
          ) : (
            <div className="dx-field">
              <label className="dx-label">Buscar paciente</label>
              <div className="dx-search-wrap">
                <input
                  className="dx-input"
                  placeholder="Escribe el nombre del paciente..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
                {busqueda.length >= 2 && (
                  <div className="dx-search-results">
                    {buscando ? (
                      <div className="dx-no-resultados">Buscando...</div>
                    ) : resultadosBusqueda.length === 0 ? (
                      <div className="dx-no-resultados">No se encontraron pacientes</div>
                    ) : (
                      resultadosBusqueda.map((p, i) => (
                        <div key={i} className="dx-search-item" onClick={() => seleccionarPaciente(p)}>
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
            {/* BOTÓN NUEVO DIAGNÓSTICO */}
            {!mostrarForm && (
              <button className="dx-nueva-btn" onClick={() => setMostrarForm(true)}>
                ➕ Nuevo Diagnóstico
              </button>
            )}

            {/* FORMULARIO */}
            {mostrarForm && (
              <div className="dx-form-container">
                <div className="dx-form-title">📋 Nuevo Diagnóstico</div>

                {/* CIE-10 COMUNES */}
                <div className="dx-section-title" style={{ fontSize: 13 }}>Diagnósticos Comunes (CIE-10)</div>
                <div className="dx-cie-grid">
                  {CIE10_COMUNES.map((cie, i) => (
                    <div
                      key={i}
                      className={`dx-cie-item ${form.codigo_cie10 === cie.codigo ? "selected" : ""}`}
                      onClick={() => seleccionarCIE(cie)}
                    >
                      <div className="dx-cie-codigo">{cie.codigo}</div>
                      <div className="dx-cie-desc">{cie.descripcion}</div>
                    </div>
                  ))}
                </div>

                {/* FORMULARIO MANUAL */}
                <div className="dx-grid">
                  <div className="dx-field">
                    <label className="dx-label">Código CIE-10 *</label>
                    <input
                      className={`dx-input ${errores.codigo_cie10 ? "error" : ""}`}
                      placeholder="ej. F10.2"
                      value={form.codigo_cie10}
                      onChange={e => setForm({ ...form, codigo_cie10: e.target.value })}
                    />
                    {errores.codigo_cie10 && <span className="dx-error-msg">{errores.codigo_cie10}</span>}
                  </div>
                  <div className="dx-field">
                    <label className="dx-label">Tipo *</label>
                    <select
                      className={`dx-select ${errores.tipo ? "error" : ""}`}
                      value={form.tipo}
                      onChange={e => setForm({ ...form, tipo: e.target.value })}
                    >
                      <option value="principal">Principal</option>
                      <option value="secundario">Secundario</option>
                      <option value="comorbilidad">Comorbilidad</option>
                    </select>
                    {errores.tipo && <span className="dx-error-msg">{errores.tipo}</span>}
                  </div>
                </div>

                <div className="dx-field" style={{ marginBottom: 16 }}>
                  <label className="dx-label">Descripción *</label>
                  <input
                    className={`dx-input ${errores.descripcion ? "error" : ""}`}
                    placeholder="Descripción del diagnóstico"
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  />
                  {errores.descripcion && <span className="dx-error-msg">{errores.descripcion}</span>}
                </div>

                <div className="dx-footer">
                  <button className="dx-btn-cancel" onClick={() => { setMostrarForm(false); setForm(formInicial); setErrores({}); }}>Cancelar</button>
                  <button className="dx-btn-save" onClick={handleGuardar} disabled={guardando}>
                    💾 {guardando ? "Guardando..." : "Guardar Diagnóstico"}
                  </button>
                </div>
              </div>
            )}

            {/* DIAGNÓSTICOS REGISTRADOS */}
            <div className="dx-card">
              <div className="dx-section-title">
                Diagnósticos Registrados
                {diagnosticos.length > 0 && <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>({diagnosticos.length})</span>}
              </div>

              {cargando ? (
                <div className="dx-empty">Cargando diagnósticos...</div>
              ) : diagnosticos.length === 0 ? (
                <div className="dx-empty">No hay diagnósticos registrados para este paciente</div>
              ) : (
                diagnosticos.map((d, i) => (
                  <div className="dx-dx-item" key={i}>
                    <div className="dx-dx-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="dx-dx-codigo">{d.codigo_cie10}</span>
                        <span className={`dx-dx-tipo ${d.tipo}`}>{d.tipo?.charAt(0).toUpperCase() + d.tipo?.slice(1)}</span>
                        {d.estado !== "activo" && (
                          <span className={`dx-estado-badge ${d.estado}`}>
                            {d.estado === "edicion_pendiente" ? "⏳ Edición pendiente" : "⏳ Eliminación pendiente"}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {d.fecha ? new Date(d.fecha).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="dx-dx-desc">{d.descripcion}</div>
                    <div className="dx-dx-meta">Dr. {d.nombre_medico}</div>

                    {/* ACCIONES — solo si está activo */}
                    {d.estado === "activo" && (
                      <div className="dx-dx-actions">
                        <button
                          className="dx-btn-solicitar"
                          onClick={() => setModalSolicitud({ ...d, tipo_solicitud: "edicion" })}
                        >
                          ✏️ Solicitar Edición
                        </button>
                        <button
                          className="dx-btn-eliminar"
                          onClick={() => setModalSolicitud({ ...d, tipo_solicitud: "eliminacion" })}
                        >
                          🗑️ Solicitar Eliminación
                        </button>
                      </div>
                    )}

                    {d.estado !== "activo" && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#f97316" }}>
                        ⏳ Solicitud pendiente de aprobación por el jefe médico
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}