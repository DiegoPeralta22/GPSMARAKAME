import { useState, useEffect } from "react";
import { obtenerExpediente } from "../../services/medicoService";

const styles = `
  .exp-container { padding: 0; }
  .exp-back { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 13px; cursor: pointer; margin-bottom: 16px; background: none; border: none; font-family: 'Inter', sans-serif; }
  .exp-back:hover { color: #111827; }
  .exp-back svg { width: 14px; height: 14px; }
  .exp-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .exp-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .exp-card { background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; margin-bottom: 16px; }
  .exp-patient-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .exp-avatar { width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; flex-shrink: 0; }
  .exp-patient-name { font-size: 20px; font-weight: 700; color: #111827; }
  .exp-patient-exp { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .exp-estado-badge { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-left: auto; }
  .exp-estado-badge.desintoxicacion { background: #fff7ed; color: #f97316; }
  .exp-estado-badge.tratamiento { background: #f0fdf4; color: #16a34a; }
  .exp-estado-badge.valoracion { background: #eff6ff; color: #3b82f6; }
  .exp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
  .exp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .exp-field-label { font-size: 11px; color: #9ca3af; margin-bottom: 2px; }
  .exp-field-value { font-size: 13px; color: #111827; font-weight: 500; }
  .exp-divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
  .exp-section-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; }
  .exp-actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .exp-action-btn { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif; }
  .exp-action-btn:hover { border-color: #3b82f6; background: #eff6ff; transform: translateY(-1px); }
  .exp-action-btn svg { width: 20px; height: 20px; color: #3b82f6; }
  .exp-action-label { font-size: 12px; color: #374151; font-weight: 500; }
  .exp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .exp-historia-item { margin-bottom: 12px; }
  .exp-historia-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .exp-historia-value { font-size: 13px; color: #374151; }
  .exp-signos-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
  .exp-signos-row:last-child { border-bottom: none; }
  .exp-signo-label { font-size: 11px; color: #9ca3af; }
  .exp-signo-value { font-size: 13px; color: #111827; font-weight: 600; }
  .exp-signo-fecha { font-size: 11px; color: #6b7280; grid-column: 1/-1; margin-bottom: 4px; }
  .exp-nota-item { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
  .exp-nota-item:last-child { border-bottom: none; }
  .exp-nota-tipo { font-size: 12px; font-weight: 600; color: #3b82f6; margin-bottom: 4px; }
  .exp-nota-contenido { font-size: 13px; color: #374151; }
  .exp-nota-fecha { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .exp-empty { color: #9ca3af; font-size: 13px; font-style: italic; }
  .exp-loading { text-align: center; padding: 48px; color: #9ca3af; }
`;

const ICONS = {
  diagnostico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  indicaciones: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2"/><circle cx="18" cy="18" r="4"/><path d="m15.5 15.5 5 5"/></svg>,
  desintoxicacion: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  evolucion: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  laboratorio: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6l1 9H8L9 3z"/><path d="M6.5 21a5 5 0 0 0 11 0c0-3-2.5-5.5-5.5-8.5C9 15.5 6.5 18 6.5 21z"/></svg>,
  actividades: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

export default function Expediente({ id_paciente, onVolver, onNavegar }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id_paciente) cargarExpediente();
  }, [id_paciente]);

  const cargarExpediente = async () => {
    try {
      setCargando(true);
      const data = await obtenerExpediente(id_paciente);
      setDatos(data);
    } catch (error) {
      console.error("Error al cargar expediente:", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div className="exp-loading">Cargando expediente...</div>;
  if (!datos?.paciente) return <div className="exp-loading">No se encontró el expediente.</div>;

  const { paciente, signosVitales, notasRecientes } = datos;
  const iniciales = `${paciente.nombre?.[0] || ""}${paciente.apellido?.[0] || ""}`.toUpperCase();

  const getBadgeClass = (estado) => {
    if (!estado) return "valoracion";
    if (estado.includes("desintox")) return "desintoxicacion";
    if (estado.includes("tratamiento")) return "tratamiento";
    return "valoracion";
  };

  return (
    <>
      <style>{styles}</style>
      <div className="exp-container">
        <button className="exp-back" onClick={onVolver}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Volver a lista de pacientes
        </button>

        <h1 className="exp-title">Expediente Clínico</h1>
        <p className="exp-subtitle">Información completa del paciente</p>

        {/* HEADER PACIENTE */}
        <div className="exp-card">
          <div className="exp-patient-header">
            <div className="exp-avatar">{iniciales}</div>
            <div>
              <div className="exp-patient-name">{paciente.nombre} {paciente.apellido}</div>
              <div className="exp-patient-exp">Expediente #{String(paciente.id_expediente || "—").padStart(3, "0")}</div>
            </div>
            <span className={`exp-estado-badge ${getBadgeClass(paciente.estado)}`}>
              {paciente.estado ? paciente.estado.charAt(0).toUpperCase() + paciente.estado.slice(1) : "Sin estado"}
            </span>
          </div>

          <div className="exp-grid">
            <div><div className="exp-field-label">Edad</div><div className="exp-field-value">{paciente.edad} años</div></div>
            <div><div className="exp-field-label">Género</div><div className="exp-field-value">{paciente.genero}</div></div>
            <div><div className="exp-field-label">Estado Civil</div><div className="exp-field-value">{paciente.estado_civil}</div></div>
            <div><div className="exp-field-label">Ocupación</div><div className="exp-field-value">{paciente.ocupacion}</div></div>
            <div><div className="exp-field-label">Escolaridad</div><div className="exp-field-value">{paciente.escolaridad}</div></div>
            <div><div className="exp-field-label">Fecha de Ingreso</div><div className="exp-field-value">{paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString() : "—"}</div></div>
            <div><div className="exp-field-label">Teléfono</div><div className="exp-field-value">{paciente.telefono}</div></div>
            <div><div className="exp-field-label">Días de Tratamiento</div><div className="exp-field-value">—</div></div>
          </div>

          <hr className="exp-divider" />

          <div className="exp-grid-2">
            <div>
              <div className="exp-field-label">Dirección</div>
              <div className="exp-field-value">{paciente.direccion}</div>
            </div>
            <div>
              <div className="exp-field-label">Contacto de Emergencia</div>
              <div className="exp-field-value">
                {paciente.contacto_nombre ? `${paciente.contacto_nombre} • ${paciente.contacto_parentesco} • ${paciente.contacto_telefono}` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="exp-actions-grid">
          {[
            { label: "Diagnóstico", icon: "diagnostico", nav: "diagnostico" },
            { label: "Indicaciones", icon: "indicaciones", nav: "indicaciones" },
            { label: "Desintoxicación", icon: "desintoxicacion", nav: "desintoxicacion" },
            { label: "Nota Evolución", icon: "evolucion", nav: "evolucion" },
            { label: "Laboratorio", icon: "laboratorio", nav: "laboratorio" },
            { label: "Actividades", icon: "actividades", nav: "actividades" },
          ].map((a, i) => (
            <button key={i} className="exp-action-btn" onClick={() => onNavegar(a.nav)}>
              {ICONS[a.icon]}
              <span className="exp-action-label">{a.label}</span>
            </button>
          ))}
        </div>

        {/* HISTORIA MÉDICA + SIGNOS VITALES */}
        <div className="exp-two-col">
          <div className="exp-card">
            <div className="exp-section-title">Historia Médica</div>
            <div className="exp-historia-item">
              <div className="exp-historia-label">Alergias / Enfermedades</div>
              <div className="exp-historia-value">{paciente.enfermedades_previas || <span className="exp-empty">Sin registro</span>}</div>
            </div>
            <div className="exp-historia-item">
              <div className="exp-historia-label">Adicciones</div>
              <div className="exp-historia-value">{paciente.adicciones || <span className="exp-empty">Sin registro</span>}</div>
            </div>
            <div className="exp-historia-item">
              <div className="exp-historia-label">Tratamientos Previos</div>
              <div className="exp-historia-value">{paciente.tratamientos_previos || <span className="exp-empty">Sin registro</span>}</div>
            </div>
          </div>

          <div className="exp-card">
            <div className="exp-section-title">Signos Vitales Recientes</div>
            {signosVitales.length === 0 ? (
              <div className="exp-empty">Sin registros de signos vitales</div>
            ) : (
              signosVitales.map((s, i) => (
                <div key={i}>
                  <div className="exp-signo-fecha">{new Date(s.fecha).toLocaleDateString()} {s.hora}</div>
                  <div className="exp-signos-row">
                    <div><div className="exp-signo-label">Presión</div><div className="exp-signo-value">{s.presion_arterial || "—"}</div></div>
                    <div><div className="exp-signo-label">Glucosa</div><div className="exp-signo-value">{s.glucosa || "—"}</div></div>
                    <div><div className="exp-signo-label">Temp</div><div className="exp-signo-value">{s.temperatura || "—"}°C</div></div>
                    <div><div className="exp-signo-label">FC</div><div className="exp-signo-value">{s.frecuencia_cardiaca || "—"} lpm</div></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* NOTAS RECIENTES */}
        <div className="exp-card">
          <div className="exp-section-title">Notas Recientes</div>
          {notasRecientes.length === 0 ? (
            <div className="exp-empty">Sin notas recientes</div>
          ) : (
            notasRecientes.map((n, i) => (
              <div className="exp-nota-item" key={i}>
                <div className="exp-nota-tipo">{n.tipo}</div>
                <div className="exp-nota-contenido">{n.contenido || "—"}</div>
                <div className="exp-nota-fecha">{n.fecha ? new Date(n.fecha).toLocaleDateString() : "—"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}