import { useState, useEffect } from "react";
import { obtenerPendientesValoracion, valorarIngreso } from "../../services/medicoService";

const styles = `
  .vi-container { padding: 0; }
  .vi-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .vi-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .vi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .vi-card { background: #fff; border-radius: 10px; padding: 20px; border: 1px solid #f0f0f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.15s; }
  .vi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .vi-card-name { font-size: 15px; font-weight: 700; color: #111827; }
  .vi-card-info { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .vi-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: #fff7ed; color: #f97316; margin-top: 10px; }
  .vi-empty { text-align: center; padding: 60px; color: #9ca3af; font-size: 14px; grid-column: 1/-1; }
  .vi-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 400; display: flex; align-items: center; justify-content: center; }
  .vi-modal { background: #fff; border-radius: 12px; padding: 28px; width: 500px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.18); }
  .vi-modal-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .vi-modal-sub { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
  .vi-info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
  .vi-info-row { display: flex; justify-content: space-between; font-size: 13px; color: #374151; margin-bottom: 6px; }
  .vi-info-row:last-child { margin-bottom: 0; }
  .vi-info-label { color: #9ca3af; font-weight: 500; }
  .vi-field { margin-bottom: 16px; }
  .vi-label { display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 6px; }
  .vi-input { width: 100%; padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; background: #f9fafb; color: #6b7280; }
  .vi-textarea { width: 100%; padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 90px; transition: border 0.15s; }
  .vi-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .vi-radio-group { display: flex; gap: 16px; margin-top: 4px; }
  .vi-radio-opt { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.15s; }
  .vi-radio-opt.apto-sel { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }
  .vi-radio-opt.no-apto-sel { border-color: #ef4444; background: #fff1f2; color: #ef4444; }
  .vi-radio-opt input { display: none; }
  .vi-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
  .vi-btn-cancel { padding: 10px 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .vi-btn-save { padding: 10px 24px; border: none; border-radius: 8px; background: #3b82f6; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
  .vi-btn-save:hover { background: #2563eb; }
  .vi-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
`;

export default function ValoracionIngreso() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [apto, setApto] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await obtenerPendientesValoracion();
      setPendientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (paciente) => {
    setPacienteSeleccionado(paciente);
    setObservaciones("");
    setApto(null);
  };

  const cerrarModal = () => {
    setPacienteSeleccionado(null);
    setObservaciones("");
    setApto(null);
  };

  const handleGuardar = async () => {
    if (apto === null) {
      alert("Debes indicar si el paciente es apto o no.");
      return;
    }
    setGuardando(true);
    try {
      await valorarIngreso({
        id_paciente: pacienteSeleccionado.id_paciente,
        id_usuario: usuario.id_usuario,
        observaciones,
        apto,
      });
      cerrarModal();
      cargar();
    } catch (err) {
      alert("Error al guardar valoración: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="vi-container">
        <h1 className="vi-title">Valoración de Ingreso</h1>
        <p className="vi-subtitle">Pacientes nuevos pendientes de valoración médica</p>

        <div className="vi-grid">
          {cargando ? (
            <div className="vi-empty">Cargando...</div>
          ) : pendientes.length === 0 ? (
            <div className="vi-empty">No hay pacientes pendientes de valoración</div>
          ) : (
            pendientes.map((p, i) => (
              <div className="vi-card" key={i} onClick={() => abrirModal(p)}>
                <div className="vi-card-name">{p.nombre} {p.apellido}</div>
                <div className="vi-card-info">{p.edad} años</div>
                <div className="vi-card-info">Sustancias: {p.sustancias || "—"}</div>
                <div className="vi-card-info">Registrado por: {p.registrado_por || "—"}</div>
                <div className="vi-badge">Pendiente de valoración</div>
              </div>
            ))
          )}
        </div>

        {pacienteSeleccionado && (
          <div className="vi-modal-overlay" onClick={cerrarModal}>
            <div className="vi-modal" onClick={e => e.stopPropagation()}>
              <div className="vi-modal-title">Valorar Ingreso</div>
              <div className="vi-modal-sub">Completa la valoración del paciente</div>

              <div className="vi-info-box">
                <div className="vi-info-row">
                  <span className="vi-info-label">Paciente:</span>
                  <span>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</span>
                </div>
                <div className="vi-info-row">
                  <span className="vi-info-label">Edad:</span>
                  <span>{pacienteSeleccionado.edad} años</span>
                </div>
                <div className="vi-info-row">
                  <span className="vi-info-label">Sustancias:</span>
                  <span>{pacienteSeleccionado.sustancias || "—"}</span>
                </div>
              </div>

              <div className="vi-field">
                <label className="vi-label">Médico que valora</label>
                <input className="vi-input" readOnly value={usuario.nombre || ""} />
              </div>

              <div className="vi-field">
                <label className="vi-label">Observaciones médicas</label>
                <textarea
                  className="vi-textarea"
                  placeholder="Escribe tus observaciones..."
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                />
              </div>

              <div className="vi-field">
                <label className="vi-label">¿Es apto para ingresar?</label>
                <div className="vi-radio-group">
                  <label className={`vi-radio-opt ${apto === 1 ? "apto-sel" : ""}`}>
                    <input type="radio" name="apto" onChange={() => setApto(1)} />
                    ✓ Apto
                  </label>
                  <label className={`vi-radio-opt ${apto === 0 ? "no-apto-sel" : ""}`}>
                    <input type="radio" name="apto" onChange={() => setApto(0)} />
                    ✗ No Apto
                  </label>
                </div>
              </div>

              <div className="vi-footer">
                <button className="vi-btn-cancel" onClick={cerrarModal}>Cancelar</button>
                <button className="vi-btn-save" onClick={handleGuardar} disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar Valoración"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
