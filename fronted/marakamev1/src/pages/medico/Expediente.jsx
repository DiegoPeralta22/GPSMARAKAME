import { useState, useEffect } from "react";
import {
  obtenerExpediente,
  obtenerDiagnosticos,
  obtenerIndicaciones,
  obtenerProtocolo,
  obtenerNotas,
  obtenerSolicitudesLab,
  obtenerActividades,
  obtenerNotasNutricionales,
  obtenerMedicamentosPaciente,
} from "../../services/medicoService";

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
  .exp-field-label { font-size: 11px; color: #9ca3af; margin-bottom: 2px; text-transform: uppercase; }
  .exp-field-value { font-size: 13px; color: #111827; font-weight: 500; }
  .exp-divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
  .exp-section-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
  .exp-empty { color: #9ca3af; font-size: 13px; font-style: italic; text-align: center; padding: 24px; }
  .exp-loading { text-align: center; padding: 48px; color: #9ca3af; }

  /* TABS */
  .exp-tabs-wrap { background: #fff; border-radius: 10px; border: 1px solid #f0f0f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 16px; overflow: hidden; }
  .exp-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid #f3f4f6; scrollbar-width: none; }
  .exp-tabs::-webkit-scrollbar { display: none; }
  .exp-tab { padding: 12px 18px; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; border: none; background: none; font-family: 'Inter', sans-serif; white-space: nowrap; border-bottom: 2px solid transparent; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
  .exp-tab:hover { color: #111827; background: #f9fafb; }
  .exp-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; background: #f8faff; }
  .exp-tab-badge { background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; }
  .exp-tab-badge.blue { background: #3b82f6; }
  .exp-tab-content { padding: 20px; }

  /* HISTORIA */
  .exp-historia-item { margin-bottom: 14px; }
  .exp-historia-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .exp-historia-value { font-size: 13px; color: #374151; }

  /* SIGNOS */
  .exp-signos-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; }
  .exp-signo-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
  .exp-signo-value { font-size: 13px; color: #111827; font-weight: 600; margin-top: 2px; }
  .exp-signo-fecha { font-size: 11px; color: #6b7280; margin-bottom: 6px; font-weight: 500; }

  /* DIAGNÓSTICOS */
  .exp-dx-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: flex-start; justify-content: space-between; }
  .exp-dx-codigo { font-size: 12px; font-weight: 700; color: #3b82f6; }
  .exp-dx-desc { font-size: 13px; color: #374151; margin-top: 2px; }
  .exp-dx-meta { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .exp-dx-tipo { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; flex-shrink: 0; }
  .exp-dx-tipo.principal { background: #eff6ff; color: #1d4ed8; }
  .exp-dx-tipo.secundario { background: #f5f3ff; color: #7c3aed; }
  .exp-dx-tipo.comorbilidad { background: #fff7ed; color: #f97316; }

  /* INDICACIONES */
  .exp-ind-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .exp-ind-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .exp-ind-medico { font-size: 12px; font-weight: 600; color: #374151; }
  .exp-ind-fecha { font-size: 11px; color: #9ca3af; }
  .exp-ind-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
  .exp-ind-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; margin-bottom: 2px; }
  .exp-ind-value { font-size: 12px; color: #374151; }
  .exp-med-tag { display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 4px; }
  .exp-med-tag.solicitado { background: #fff7ed; color: #ea580c; }
  .exp-med-tag.controlado { background: #fee2e2; color: #dc2626; }

  /* DESINTOXICACIÓN */
  .exp-dex-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .exp-dex-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .exp-dex-nombre { font-size: 13px; font-weight: 600; color: #111827; }
  .exp-dex-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
  .exp-dex-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; margin-bottom: 2px; }
  .exp-dex-value { font-size: 12px; color: #374151; font-weight: 500; }
  .exp-ciwa-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .exp-ciwa-badge.leve { background: #f0fdf4; color: #16a34a; }
  .exp-ciwa-badge.moderado { background: #fefce8; color: #ca8a04; }
  .exp-ciwa-badge.severo { background: #fff1f2; color: #ef4444; }

  /* EVOLUCIÓN */
  .exp-nota-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .exp-nota-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .exp-nota-autor { font-size: 12px; font-weight: 600; color: #374151; }
  .exp-nota-fecha { font-size: 11px; color: #9ca3af; }
  .exp-nota-dia { font-size: 11px; font-weight: 600; background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; }
  .exp-nota-soap { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .exp-nota-soap-label { font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
  .exp-nota-soap-label.s { color: #1d4ed8; }
  .exp-nota-soap-label.o { color: #16a34a; }
  .exp-nota-soap-label.a { color: #d97706; }
  .exp-nota-soap-label.p { color: #dc2626; }
  .exp-nota-soap-value { font-size: 12px; color: #374151; line-height: 1.5; }
  .exp-nota-signos { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; background: #fff; border: 1px solid #f3f4f6; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; }

  /* LABORATORIO */
  .exp-lab-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .exp-lab-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .exp-lab-medico { font-size: 12px; font-weight: 600; color: #374151; }
  .exp-lab-fecha { font-size: 11px; color: #9ca3af; }
  .exp-prioridad-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .exp-prioridad-badge.urgente { background: #fff1f2; color: #ef4444; }
  .exp-prioridad-badge.prioritario { background: #fff7ed; color: #f97316; }
  .exp-prioridad-badge.rutina { background: #f0fdf4; color: #16a34a; }
  .exp-estudio-tag { display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 4px; }

  /* ACTIVIDADES */
  .exp-act-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .exp-act-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .exp-act-medico { font-size: 12px; font-weight: 600; color: #374151; }
  .exp-act-fecha { font-size: 11px; color: #9ca3af; }
  .exp-act-tag { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 4px; }
  .exp-act-tag.Deportes { background: #f0fdf4; color: #16a34a; }
  .exp-act-tag.Servicio { background: #fff7ed; color: #f97316; }
  .exp-act-tag.Recreación { background: #fef9c3; color: #ca8a04; }

  /* NUTRICIÓN */
  .exp-nut-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .exp-nut-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .exp-nut-autor { font-size: 12px; font-weight: 600; color: #374151; }
  .exp-nut-fecha { font-size: 11px; color: #9ca3af; }
  .exp-nut-dieta { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; background: #d1fae5; color: #065f46; }
  .exp-nut-notif { font-size: 11px; color: #d97706; font-weight: 600; }
  .exp-nut-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #fff; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
  .exp-nut-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
  .exp-nut-value { font-size: 12px; color: #374151; font-weight: 500; margin-top: 2px; }
  .exp-nut-restriccion { font-size: 12px; color: #ef4444; padding: 6px 10px; background: #fff1f2; border-radius: 6px; margin-bottom: 8px; }
  .exp-nut-plan { font-size: 12px; color: #374151; line-height: 1.5; margin-bottom: 8px; }
  .exp-nut-obs { font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 8px; }

  /* MEDICAMENTOS PACIENTE */
  .exp-medpac-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
  .exp-medpac-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .exp-medpac-nombre { font-size: 14px; font-weight: 600; color: #111827; }
  .exp-medpac-estado { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
  .exp-medpac-estado.pendiente { background: #fef9c3; color: #ca8a04; }
  .exp-medpac-estado.aprobado { background: #d1fae5; color: #059669; }
  .exp-medpac-estado.listo_recoger { background: #dbeafe; color: #1d4ed8; }
  .exp-medpac-estado.entregado { background: #f3f4f6; color: #6b7280; }
  .exp-medpac-estado.rechazado { background: #fee2e2; color: #dc2626; }
  .exp-medpac-detalle { font-size: 12px; color: #6b7280; }
`;

const TABS = [
  { id: "resumen", label: "📋 Resumen" },
  { id: "diagnostico", label: "🩺 Diagnóstico" },
  { id: "indicaciones", label: "💊 Indicaciones" },
  { id: "desintoxicacion", label: "🔵 Desintoxicación" },
  { id: "evolucion", label: "📈 Evolución" },
  { id: "laboratorio", label: "🔬 Laboratorio" },
  { id: "actividades", label: "🏃 Actividades" },
  { id: "nutricion", label: "🥗 Nutrición" },
  { id: "medicamentos", label: "💉 Medicamentos" },
];

function ciwaLabel(val) {
  if (val === null || val === undefined || val === "") return null;
  const n = parseFloat(val);
  if (n < 10) return <span className="exp-ciwa-badge leve">🟢 Leve</span>;
  if (n <= 15) return <span className="exp-ciwa-badge moderado">🟡 Moderado</span>;
  return <span className="exp-ciwa-badge severo">🔴 Severo</span>;
}

const estadoMedLabel = { pendiente: "Pendiente", aprobado: "Aprobado", listo_recoger: "Listo p/ Recoger", entregado: "Entregado", rechazado: "Rechazado" };

export default function Expediente({ id_paciente, onVolver, onNavegar }) {
  const [tabActiva, setTabActiva] = useState("resumen");
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [indicaciones, setIndicaciones] = useState({ indicaciones: [], medicamentos: [] });
  const [protocolos, setProtocolos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [laboratorio, setLaboratorio] = useState({ solicitudes: [], estudios: [] });
  const [actividades, setActividades] = useState({ actividades: [], detalles: [] });
  const [notasNutricionales, setNotasNutricionales] = useState([]);
  const [medicamentosPaciente, setMedicamentosPaciente] = useState([]);
  const [cargandoTab, setCargandoTab] = useState(false);
  const [tabsCargadas, setTabsCargadas] = useState(new Set(["resumen"]));

  useEffect(() => {
    if (id_paciente) cargarExpediente();
  }, [id_paciente]);

  useEffect(() => {
    if (!id_paciente || tabsCargadas.has(tabActiva)) return;
    cargarTab(tabActiva);
  }, [tabActiva]);

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

  const cargarTab = async (tab) => {
    try {
      setCargandoTab(true);
      if (tab === "diagnostico") {
        const data = await obtenerDiagnosticos(id_paciente);
        setDiagnosticos(Array.isArray(data) ? data : []);
      } else if (tab === "indicaciones") {
        const data = await obtenerIndicaciones(id_paciente);
        setIndicaciones(data || { indicaciones: [], medicamentos: [] });
      } else if (tab === "desintoxicacion") {
        const data = await obtenerProtocolo(id_paciente);
        setProtocolos(Array.isArray(data) ? data : []);
      } else if (tab === "evolucion") {
        const data = await obtenerNotas(id_paciente);
        setNotas(Array.isArray(data) ? data : []);
      } else if (tab === "laboratorio") {
        const data = await obtenerSolicitudesLab(id_paciente);
        setLaboratorio(data || { solicitudes: [], estudios: [] });
      } else if (tab === "actividades") {
        const data = await obtenerActividades(id_paciente);
        setActividades(data || { actividades: [], detalles: [] });
      } else if (tab === "nutricion") {
        const data = await obtenerNotasNutricionales(id_paciente);
        setNotasNutricionales(Array.isArray(data) ? data : []);
      } else if (tab === "medicamentos") {
        const data = await obtenerMedicamentosPaciente(id_paciente);
        setMedicamentosPaciente(Array.isArray(data) ? data : []);
      }
      setTabsCargadas(prev => new Set([...prev, tab]));
    } catch (error) {
      console.error(`Error cargando tab ${tab}:`, error);
    } finally {
      setCargandoTab(false);
    }
  };

  if (cargando) return <div className="exp-loading">Cargando expediente...</div>;
  if (!datos?.paciente) return <div className="exp-loading">No se encontró el expediente.</div>;

  const { paciente, signosVitales, notasRecientes } = datos;
  const iniciales = `${paciente.nombre?.[0] || ""}${paciente.apellido?.[0] || ""}`.toUpperCase();

  const getBadgeClass = (estado) => {
    if (!estado) return "valoracion";
    if (estado.toLowerCase().includes("desintox")) return "desintoxicacion";
    if (estado.toLowerCase().includes("tratamiento")) return "tratamiento";
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
            <div><div className="exp-field-label">Estado Civil</div><div className="exp-field-value">{paciente.estado_civil || "—"}</div></div>
            <div><div className="exp-field-label">Ocupación</div><div className="exp-field-value">{paciente.ocupacion || "—"}</div></div>
            <div><div className="exp-field-label">Escolaridad</div><div className="exp-field-value">{paciente.escolaridad || "—"}</div></div>
            <div><div className="exp-field-label">Fecha Nacimiento</div><div className="exp-field-value">{paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString() : "—"}</div></div>
            <div><div className="exp-field-label">Teléfono</div><div className="exp-field-value">{paciente.telefono || "—"}</div></div>
            <div><div className="exp-field-label">Días de Tratamiento</div><div className="exp-field-value">{paciente.dias_tratamiento ?? "—"}</div></div>
          </div>

          <hr className="exp-divider" />

          <div className="exp-grid-2">
            <div>
              <div className="exp-field-label">Dirección</div>
              <div className="exp-field-value">{paciente.direccion || "—"}</div>
            </div>
            <div>
              <div className="exp-field-label">Contacto de Emergencia</div>
              <div className="exp-field-value">
                {paciente.contacto_nombre ? `${paciente.contacto_nombre} • ${paciente.contacto_parentesco} • ${paciente.contacto_telefono}` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="exp-tabs-wrap">
          <div className="exp-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`exp-tab ${tabActiva === t.id ? "active" : ""}`} onClick={() => setTabActiva(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="exp-tab-content">
            {cargandoTab && tabActiva !== "resumen" ? (
              <div className="exp-empty">Cargando...</div>
            ) : (
              <>
                {/* ===== RESUMEN ===== */}
                {tabActiva === "resumen" && (
                  <div>
                    <div className="exp-grid-2" style={{ marginBottom: 0 }}>
                      <div>
                        <div className="exp-section-title">Historia Médica</div>
                        <div className="exp-historia-item">
                          <div className="exp-historia-label">Alergias / Enfermedades</div>
                          <div className="exp-historia-value">{paciente.enfermedades_previas || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Sin registro</span>}</div>
                        </div>
                        <div className="exp-historia-item">
                          <div className="exp-historia-label">Adicciones</div>
                          <div className="exp-historia-value">{paciente.adicciones || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Sin registro</span>}</div>
                        </div>
                        <div className="exp-historia-item">
                          <div className="exp-historia-label">Tratamientos Previos</div>
                          <div className="exp-historia-value">{paciente.tratamientos_previos || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Sin registro</span>}</div>
                        </div>
                      </div>
                      <div>
                        <div className="exp-section-title">Signos Vitales Recientes</div>
                        {signosVitales.length === 0 ? (
                          <div className="exp-empty" style={{ padding: 16 }}>Sin registros de signos vitales</div>
                        ) : (
                          signosVitales.map((s, i) => (
                            <div key={i}>
                              <div className="exp-signo-fecha">📅 {s.fecha ? new Date(s.fecha).toLocaleDateString() : "—"} {s.hora}</div>
                              <div className="exp-signos-row">
                                <div><div className="exp-signo-label">Presión</div><div className="exp-signo-value">{s.presion_arterial || "—"}</div></div>
                                <div><div className="exp-signo-label">Glucosa</div><div className="exp-signo-value">{s.glucosa || "—"}</div></div>
                                <div><div className="exp-signo-label">Temp</div><div className="exp-signo-value">{s.temperatura ? `${s.temperatura}°C` : "—"}</div></div>
                                <div><div className="exp-signo-label">FC</div><div className="exp-signo-value">{s.frecuencia_cardiaca ? `${s.frecuencia_cardiaca} lpm` : "—"}</div></div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    {notasRecientes.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <div className="exp-section-title">Actividad Reciente</div>
                        {notasRecientes.map((n, i) => (
                          <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", marginBottom: 3 }}>{n.tipo}</div>
                            <div style={{ fontSize: 13, color: "#374151" }}>{n.contenido || "—"}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{n.fecha ? new Date(n.fecha).toLocaleDateString() : "—"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== DIAGNÓSTICO ===== */}
                {tabActiva === "diagnostico" && (
                  <div>
                    <div className="exp-section-title">Diagnósticos Registrados ({diagnosticos.length})</div>
                    {diagnosticos.length === 0 ? <div className="exp-empty">No hay diagnósticos registrados</div>
                      : diagnosticos.map((d, i) => (
                        <div className="exp-dx-item" key={i}>
                          <div>
                            <div className="exp-dx-codigo">{d.codigo_cie10}</div>
                            <div className="exp-dx-desc">{d.descripcion}</div>
                            <div className="exp-dx-meta">Dr. {d.nombre_medico} • {d.fecha ? new Date(d.fecha).toLocaleDateString() : "—"}</div>
                          </div>
                          <span className={`exp-dx-tipo ${d.tipo}`}>{d.tipo?.charAt(0).toUpperCase() + d.tipo?.slice(1)}</span>
                        </div>
                      ))}
                  </div>
                )}

                {/* ===== INDICACIONES ===== */}
                {tabActiva === "indicaciones" && (
                  <div>
                    <div className="exp-section-title">Indicaciones Médicas ({indicaciones.indicaciones?.length || 0})</div>
                    {!indicaciones.indicaciones?.length ? <div className="exp-empty">No hay indicaciones registradas</div>
                      : indicaciones.indicaciones.map((ind, i) => {
                        const meds = indicaciones.medicamentos?.filter(m => m.id_indicacion === ind.id_indicacion) || [];
                        return (
                          <div className="exp-ind-item" key={i}>
                            <div className="exp-ind-header">
                              <div className="exp-ind-medico">👤 Dr. {ind.nombre_medico}</div>
                              <div className="exp-ind-fecha">{ind.fecha ? new Date(ind.fecha).toLocaleDateString() : "—"}</div>
                            </div>
                            <div className="exp-ind-grid">
                              {ind.dieta && <div><div className="exp-ind-label">Dieta</div><div className="exp-ind-value">{ind.dieta}</div></div>}
                              {ind.nivel_actividad && <div><div className="exp-ind-label">Actividad</div><div className="exp-ind-value">{ind.nivel_actividad}</div></div>}
                              {ind.monitoreo && <div><div className="exp-ind-label">Monitoreo</div><div className="exp-ind-value">{ind.monitoreo}</div></div>}
                            </div>
                            {ind.indicaciones_generales && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>📝 {ind.indicaciones_generales}</div>}
                            {meds.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, textTransform: "uppercase" }}>Medicamentos</div>
                                {meds.map((m, j) => (
                                  <span key={j} className={`exp-med-tag ${m.es_controlado ? "controlado" : ""}`} title={`${m.dosis} • ${m.frecuencia} • Vía ${m.via}`}>
                                    {m.es_controlado ? "⚠️ " : ""}{m.nombre} {m.dosis}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* ===== DESINTOXICACIÓN ===== */}
                {tabActiva === "desintoxicacion" && (
                  <div>
                    <div className="exp-section-title">Protocolo de Desintoxicación ({protocolos.length})</div>
                    {protocolos.length === 0 ? <div className="exp-empty">No hay protocolo de desintoxicación registrado</div>
                      : protocolos.map((p, i) => (
                        <div className="exp-dex-item" key={i}>
                          <div className="exp-dex-header">
                            <div>
                              <div className="exp-dex-nombre">👤 Dr. {p.nombre_medico}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>Inicio: {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : "—"}{p.duracion_estimada && ` • Duración: ${p.duracion_estimada}`}</div>
                            </div>
                          </div>
                          <div className="exp-dex-grid">
                            <div><div className="exp-dex-label">Sustancia</div><div className="exp-dex-value">{p.sustancia_principal || "—"}</div></div>
                            <div><div className="exp-dex-label">Severidad</div><div className="exp-dex-value">{p.severidad_sindrome || "—"}</div></div>
                            <div><div className="exp-dex-label">CIWA-Ar</div><div className="exp-dex-value">{p.puntuacion_ciwa ?? "—"} {p.puntuacion_ciwa != null && ciwaLabel(p.puntuacion_ciwa)}</div></div>
                            <div><div className="exp-dex-label">Monitoreo</div><div className="exp-dex-value">{p.frecuencia_monitoreo || "—"}</div></div>
                          </div>
                          {p.sintomas_abstinencia && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>🔴 <strong>Síntomas:</strong> {p.sintomas_abstinencia}</div>}
                          {p.protocolo_sedacion && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>💊 <strong>Sedación:</strong> {p.protocolo_sedacion}</div>}
                          {p.precauciones_especiales && <div style={{ fontSize: 12, color: "#f97316" }}>⚠️ <strong>Precauciones:</strong> {p.precauciones_especiales}</div>}
                        </div>
                      ))}
                  </div>
                )}

                {/* ===== EVOLUCIÓN ===== */}
                {tabActiva === "evolucion" && (
                  <div>
                    <div className="exp-section-title">Notas de Evolución ({notas.length})</div>
                    {notas.length === 0 ? <div className="exp-empty">No hay notas de evolución registradas</div>
                      : notas.map((n, i) => (
                        <div className="exp-nota-item" key={i}>
                          <div className="exp-nota-header">
                            <div>
                              <div className="exp-nota-autor">👤 {n.nombre_medico}</div>
                              <div className="exp-nota-fecha">📅 {n.fecha ? new Date(n.fecha).toLocaleDateString() : "—"} — {n.hora || "—"} hrs</div>
                            </div>
                            {n.dia_tratamiento && <span className="exp-nota-dia">Día {n.dia_tratamiento}</span>}
                          </div>
                          <div className="exp-nota-signos">
                            <div><div className="exp-signo-label">Presión</div><div className="exp-signo-value">{n.presion_arterial || "—"}</div></div>
                            <div><div className="exp-signo-label">FC</div><div className="exp-signo-value">{n.frecuencia_cardiaca ? `${n.frecuencia_cardiaca} lpm` : "—"}</div></div>
                            <div><div className="exp-signo-label">FR</div><div className="exp-signo-value">{n.frecuencia_respiratoria ? `${n.frecuencia_respiratoria} rpm` : "—"}</div></div>
                            <div><div className="exp-signo-label">SpO₂</div><div className="exp-signo-value">{n.saturacion_oxigeno ? `${n.saturacion_oxigeno}%` : "—"}</div></div>
                            <div><div className="exp-signo-label">Temp</div><div className="exp-signo-value">{n.temperatura ? `${n.temperatura}°C` : "—"}</div></div>
                            <div><div className="exp-signo-label">Glucosa</div><div className="exp-signo-value">{n.glucosa ? `${n.glucosa} mg/dL` : "—"}</div></div>
                          </div>
                          <div className="exp-nota-soap">
                            <div><div className="exp-nota-soap-label s">S — Subjetivo</div><div className="exp-nota-soap-value">{n.subjetivo || "—"}</div></div>
                            <div><div className="exp-nota-soap-label o">O — Objetivo</div><div className="exp-nota-soap-value">{n.objetivo || "—"}</div></div>
                            <div><div className="exp-nota-soap-label a">A — Análisis</div><div className="exp-nota-soap-value">{n.analisis || "—"}</div></div>
                            <div><div className="exp-nota-soap-label p">P — Plan</div><div className="exp-nota-soap-value">{n.plan || "—"}</div></div>
                          </div>
                          {(n.estado_mental || n.condicion_general || n.estado_animo) && (
                            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280" }}>
                              {n.estado_mental && <span>🧠 {n.estado_mental}</span>}
                              {n.condicion_general && <span>💪 {n.condicion_general}</span>}
                              {n.estado_animo && <span>😊 {n.estado_animo}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* ===== LABORATORIO ===== */}
                {tabActiva === "laboratorio" && (
                  <div>
                    <div className="exp-section-title">Solicitudes de Laboratorio ({laboratorio.solicitudes?.length || 0})</div>
                    {!laboratorio.solicitudes?.length ? <div className="exp-empty">No hay solicitudes de laboratorio registradas</div>
                      : laboratorio.solicitudes.map((sol, i) => {
                        const estudios = laboratorio.estudios?.filter(e => e.id_solicitud_lab === sol.id_solicitud_lab) || [];
                        return (
                          <div className="exp-lab-item" key={i}>
                            <div className="exp-lab-header">
                              <div>
                                <div className="exp-lab-medico">👤 Dr. {sol.nombre_medico}</div>
                                <div className="exp-lab-fecha">{sol.fecha ? new Date(sol.fecha).toLocaleDateString() : "—"}</div>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
                                <span className={`exp-prioridad-badge ${sol.prioridad}`}>{sol.prioridad?.charAt(0).toUpperCase() + sol.prioridad?.slice(1)}</span>
                                <span style={{ fontSize: 11, color: sol.estado === "pendiente" ? "#ca8a04" : "#16a34a", fontWeight: 600 }}>
                                  {sol.estado === "pendiente" ? "⏳ Pendiente" : "✅ Completado"}
                                </span>
                              </div>
                            </div>
                            {sol.indicacion_diagnostico && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>📋 {sol.indicacion_diagnostico}</div>}
                            {estudios.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, textTransform: "uppercase" }}>Estudios ({estudios.length})</div>
                                {estudios.map((e, j) => <span key={j} className="exp-estudio-tag">{e.nombre_estudio}</span>)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* ===== ACTIVIDADES ===== */}
                {tabActiva === "actividades" && (
                  <div>
                    <div className="exp-section-title">Actividades Registradas ({actividades.actividades?.length || 0})</div>
                    {!actividades.actividades?.length ? <div className="exp-empty">No hay actividades registradas</div>
                      : actividades.actividades.map((a, i) => {
                        const dets = actividades.detalles?.filter(d => d.id_actividad === a.id_actividad) || [];
                        return (
                          <div className="exp-act-item" key={i}>
                            <div className="exp-act-header">
                              <div className="exp-act-medico">👤 {a.nombre_medico}</div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: a.estado === "pendiente" ? "#ca8a04" : "#16a34a", fontWeight: 600 }}>
                                  {a.estado === "pendiente" ? "⏳ Pendiente" : "✅ Completado"}
                                </span>
                                <div className="exp-act-fecha">{a.fecha ? new Date(a.fecha).toLocaleDateString() : "—"}</div>
                              </div>
                            </div>
                            {dets.length > 0 && <div>{dets.map((d, j) => <span key={j} className={`exp-act-tag ${d.categoria}`}>{d.nombre_actividad}</span>)}</div>}
                            {a.observaciones && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8, borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>💬 {a.observaciones}</div>}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* ===== NUTRICIÓN ===== */}
                {tabActiva === "nutricion" && (
                  <div>
                    <div className="exp-section-title">Notas Nutricionales ({notasNutricionales.length})</div>
                    {notasNutricionales.length === 0 ? <div className="exp-empty">No hay notas nutricionales registradas</div>
                      : notasNutricionales.map((n, i) => (
                        <div className="exp-nut-item" key={i}>
                          <div className="exp-nut-header">
                            <div>
                              <div className="exp-nut-autor">🥗 {n.nombre_nutriologo}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>📅 {n.fecha ? new Date(n.fecha).toLocaleDateString() : "—"}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              {n.tipo_dieta && <span className="exp-nut-dieta">{n.tipo_dieta}</span>}
                              {n.notificar_medico && <span className="exp-nut-notif">🔔 Médico notificado</span>}
                            </div>
                          </div>
                          <div className="exp-nut-grid">
                            <div><div className="exp-nut-label">Tipo de Dieta</div><div className="exp-nut-value">{n.tipo_dieta || "—"}</div></div>
                            <div><div className="exp-nut-label">Calorías</div><div className="exp-nut-value">{n.calorias_recomendadas ? `${n.calorias_recomendadas} kcal/día` : "—"}</div></div>
                            <div><div className="exp-nut-label">Fecha Registro</div><div className="exp-nut-value">{n.fecha_registro ? new Date(n.fecha_registro).toLocaleString() : "—"}</div></div>
                          </div>
                          {n.plan_alimentario && <div className="exp-nut-plan">📋 <strong>Plan:</strong> {n.plan_alimentario}</div>}
                          {n.restricciones_alergias && <div className="exp-nut-restriccion">⚠️ <strong>Restricciones:</strong> {n.restricciones_alergias}</div>}
                          {n.observaciones && <div className="exp-nut-obs">💬 {n.observaciones}</div>}
                        </div>
                      ))}
                  </div>
                )}

                {/* ===== MEDICAMENTOS PACIENTE ===== */}
                {tabActiva === "medicamentos" && (
                  <div>
                    <div className="exp-section-title">Medicamentos Solicitados ({medicamentosPaciente.length})</div>
                    {medicamentosPaciente.length === 0 ? <div className="exp-empty">No hay medicamentos solicitados para este paciente</div>
                      : medicamentosPaciente.map((m, i) => (
                        <div className="exp-medpac-item" key={i}>
                          <div className="exp-medpac-header">
                            <div>
                              <div className="exp-medpac-nombre">
                                {m.es_controlado ? "⚠️ " : ""}{m.es_externo ? "🏪 " : "💊 "}{m.nombre_medicamento}
                              </div>
                              <div className="exp-medpac-detalle">Dr. {m.nombre_medico} • {m.fecha_solicitud ? new Date(m.fecha_solicitud).toLocaleDateString() : "—"}</div>
                            </div>
                            <span className={`exp-medpac-estado ${m.estado}`}>{estadoMedLabel[m.estado] || m.estado}</span>
                          </div>
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {m.dosis && <div className="exp-medpac-detalle">Dosis: <strong>{m.dosis}</strong></div>}
                            {m.cantidad && <div className="exp-medpac-detalle">Cantidad: <strong>{m.cantidad}</strong></div>}
                            {m.frecuencia && <div className="exp-medpac-detalle">Frecuencia: <strong>{m.frecuencia}</strong></div>}
                            {m.via && <div className="exp-medpac-detalle">Vía: <strong>{m.via}</strong></div>}
                          </div>
                          {m.es_externo && <div style={{ fontSize: 11, color: "#ea580c", marginTop: 6, fontWeight: 600 }}>📦 Medicamento externo — traído por el familiar</div>}
                          {m.decision_jefe && <div style={{ fontSize: 11, color: m.decision_jefe === "aprobado" ? "#059669" : "#dc2626", marginTop: 4 }}>{m.decision_jefe === "aprobado" ? "✅ Aprobado" : "❌ Rechazado"} por jefatura médica</div>}
                          {m.nombre_enfermera && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>💉 Entregado por: {m.nombre_enfermera} — {m.fecha_entrega ? new Date(m.fecha_entrega).toLocaleString() : "—"}</div>}
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}