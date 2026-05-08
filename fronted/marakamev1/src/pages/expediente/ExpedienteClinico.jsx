import { useState, useEffect } from "react";

/* ─── helpers ──────────────────────────────────── */
function fmtFecha(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return iso; }
}
function fmtHora(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function folio(id) { return `MK-${new Date().getFullYear()}-${String(id||0).padStart(4,"0")}`; }
function iniciales(n, a) { return `${(n||"")[0]||""}${(a||"")[0]||""}`.toUpperCase(); }

const TIPOS_CUESTIONARIO = {
  seguimiento: "Información del Solicitante",
  solicitante: "Datos del Solicitante",
  paciente: "Datos del Paciente",
  valoracion: "Valoración Inicial",
  estatus: "Estado y Observaciones",
};

/* ─── styles ─────────────────────────────────── */
const styles = `
  .ec-wrap { font-family: 'Inter','Segoe UI',sans-serif; color: #111827; background: #f4f6f8; min-height: 100vh; }
  .ec-header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .ec-header-left { display: flex; align-items: center; gap: 14px; }
  .ec-avatar { width: 48px; height: 48px; border-radius: 50%; background: #0b5d5b; color: #fff; font-size: 17px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ec-name { font-size: 20px; font-weight: 800; color: #111827; }
  .ec-folio { font-size: 12px; color: #9ca3af; margin-top: 2px; }
  .ec-header-right { display: flex; gap: 10px; align-items: center; }
  .ec-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; }
  .ec-btn-outline { background: #fff; border: 1px solid #e5e7eb; color: #374151; }
  .ec-btn-outline:hover { border-color: #0b5d5b; color: #0b5d5b; }
  .ec-btn-primary { background: #0b5d5b; border: none; color: #fff; }
  .ec-btn-primary:hover { background: #094e4c; }
  .ec-status { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; white-space: nowrap; }
  .ec-tabs { display: flex; gap: 0; background: #fff; border-bottom: 1px solid #e5e7eb; padding: 0 28px; }
  .ec-tab { padding: 12px 22px; border: none; background: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; border-bottom: 3px solid transparent; color: #6b7280; display: flex; align-items: center; gap: 8px; }
  .ec-tab:hover { color: #374151; }
  .ec-tab.a-active { color: #0b5d5b; border-bottom-color: #0b5d5b; }
  .ec-tab.m-active { color: #3b82f6; border-bottom-color: #3b82f6; }
  .ec-tab.c-active { color: #16a34a; border-bottom-color: #16a34a; }
  .ec-tab-dot { width: 8px; height: 8px; border-radius: 50%; }
  .ec-body { padding: 24px 28px; }
  .ec-section { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 16px; overflow: hidden; }
  .ec-section-header { padding: 14px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #f3f4f6; }
  .ec-section-header.adm { background: #f0faf9; border-bottom-color: #d1fae5; }
  .ec-section-header.med { background: #eff6ff; border-bottom-color: #bfdbfe; }
  .ec-section-header.cli { background: #f0fdf4; border-bottom-color: #bbf7d0; }
  .ec-section-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .ec-section-title { font-size: 14px; font-weight: 700; }
  .ec-section-title.adm { color: #0b5d5b; }
  .ec-section-title.med { color: #1d4ed8; }
  .ec-section-title.cli { color: #15803d; }
  .ec-section-body { padding: 18px 20px; }
  .ec-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .ec-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .ec-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ec-field-lbl { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 3px; }
  .ec-field-val { font-size: 13px; color: #374151; font-weight: 500; }
  .ec-divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
  .ec-sub-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; margin: 16px 0 10px; padding-left: 8px; border-left: 3px solid #e5e7eb; }
  .ec-sub-title.adm { color: #0b5d5b; border-left-color: #0b5d5b; }
  .ec-sub-title.med { color: #3b82f6; border-left-color: #3b82f6; }
  .ec-sub-title.cli { color: #16a34a; border-left-color: #16a34a; }
  .ec-qa-list { display: flex; flex-direction: column; gap: 8px; }
  .ec-qa-item { background: #f9fafb; border-radius: 8px; padding: 10px 14px; border-left: 3px solid #e5e7eb; }
  .ec-qa-q { font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 3px; }
  .ec-qa-a { font-size: 13px; color: #111827; }
  .ec-qa-group-title { font-size: 11px; font-weight: 700; color: #0b5d5b; text-transform: uppercase; letter-spacing: .5px; margin: 14px 0 8px; }
  .ec-citas-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .ec-citas-table th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
  .ec-citas-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  .ec-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .ec-inv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .ec-inv-table th { background: #f9fafb; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
  .ec-inv-table td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  .ec-signos-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 10px; }
  .ec-signo-card { background: #f9fafb; border-radius: 8px; padding: 12px 10px; text-align: center; border: 1px solid #f0f0f0; }
  .ec-signo-val { font-size: 18px; font-weight: 700; color: #111827; }
  .ec-signo-lbl { font-size: 10px; color: #9ca3af; margin-top: 3px; text-transform: uppercase; }
  .ec-signo-unit { font-size: 10px; color: #6b7280; }
  .ec-val-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #374151; line-height: 1.6; min-height: 70px; white-space: pre-wrap; }
  .ec-empty { color: #9ca3af; font-size: 13px; font-style: italic; padding: 8px 0; }
  .ec-decision-banner { padding: 14px 18px; border-radius: 10px; font-size: 14px; font-weight: 700; margin-bottom: 14px; }
  .ec-loading { display: flex; align-items: center; justify-content: center; min-height: 300px; color: #9ca3af; font-size: 14px; }

  /* ── PRINT ────────────────────────────────────── */
  @media print {
    body { margin: 0; padding: 0; font-size: 10pt; }
    .ec-no-print { display: none !important; }
    .ec-wrap { background: white; }
    .ec-header { border-bottom: 2px solid #111; padding: 12px 20px; }
    .ec-name { font-size: 16pt; }
    .ec-tabs { display: none; }
    .ec-body { padding: 16px 20px; }
    .ec-tab-content { display: block !important; }
    .ec-section { border: 1px solid #ccc; border-radius: 0; margin-bottom: 12px; break-inside: avoid; }
    .ec-section-header.adm { background: #e6f4f3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ec-section-header.med { background: #dbeafe !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ec-section-header.cli { background: #dcfce7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ec-print-header { display: block !important; border-bottom: 2px solid #0b5d5b; padding-bottom: 10px; margin-bottom: 16px; }
    .ec-area-break { page-break-before: always; }
    .ec-signos-grid { grid-template-columns: repeat(4,1fr); }
  }
  .ec-print-header { display: none; }
`;

const ESTADO_CITA = {
  programada: { bg: "#eff6ff", color: "#2563eb", label: "Programada" },
  asistio: { bg: "#e6f4f3", color: "#0b5d5b", label: "Asistió" },
  cancelada: { bg: "#fff1f2", color: "#ef4444", label: "Cancelada" },
  reprogramada: { bg: "#fff7ed", color: "#d97706", label: "Reprogramada" },
};

export default function ExpedienteClinico({ id_paciente, onVolver }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("adm");

  useEffect(() => {
    if (id_paciente) cargar();
  }, [id_paciente]);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch(`http://localhost:3000/expediente-completo/${id_paciente}`);
      const data = await res.json();
      setDatos(data);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  if (cargando) return <div className="ec-loading">Cargando expediente...</div>;
  if (!datos?.paciente) return <div className="ec-loading">No se encontró el expediente.</div>;

  const { paciente: pac, familiar: fam, cuestionario, valoracion: val, estudio, decision: dec, traslado, recepcion, citas } = datos;

  let inventario = [];
  if (traslado?.inventario_json) try { inventario = JSON.parse(traslado.inventario_json).filter(r => r.articulo); } catch {}
  let signos = {};
  if (recepcion?.signos_vitales) try { signos = JSON.parse(recepcion.signos_vitales); } catch {}

  const decColor = dec?.decision === "aprobado" ? "#0b5d5b" : dec?.decision === "rechazado" ? "#ef4444" : "#d97706";
  const decBg = dec?.decision === "aprobado" ? "#e6f4f3" : dec?.decision === "rechazado" ? "#fff1f2" : "#fff7ed";
  const decLabel = { aprobado: "✓ APROBADO PARA INGRESO", rechazado: "✗ RECHAZADO", requiere_valoracion: "↺ REQUIERE NUEVA VALORACIÓN" }[dec?.decision] || "⏳ EN PROCESO";

  const respByTipo = {};
  (cuestionario?.respuestas || []).forEach(r => {
    const t = r.tipo || "otro";
    if (!respByTipo[t]) respByTipo[t] = [];
    respByTipo[t].push(r);
  });

  const IcoPrint = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
  const IcoBack = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;

  return (
    <>
      <style>{styles}</style>
      <div className="ec-wrap">

        {/* Print letterhead (only shows in print) */}
        <div className="ec-print-header" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0b5d5b" }}>INSTITUTO MARAKAME</div>
          <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>EXPEDIENTE CLÍNICO — {folio(pac.id_paciente)}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Fecha de impresión: {new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</div>
        </div>

        {/* HEADER */}
        <div className="ec-header">
          <div className="ec-header-left">
            {onVolver && (
              <button className="ec-btn ec-btn-outline ec-no-print" onClick={onVolver} style={{ gap: 4 }}>
                <IcoBack /> Volver
              </button>
            )}
            <div className="ec-avatar">{iniciales(pac.nombre, pac.apellido)}</div>
            <div>
              <div className="ec-name">{pac.nombre} {pac.apellido}</div>
              <div className="ec-folio">{folio(pac.id_paciente)} · {pac.edad} años · {pac.genero || "—"}</div>
            </div>
            {dec?.decision && (
              <span className="ec-status" style={{ background: decBg, color: decColor }}>{decLabel}</span>
            )}
          </div>
          <div className="ec-header-right ec-no-print">
            <button className="ec-btn ec-btn-primary" onClick={() => window.print()}>
              <IcoPrint /> Imprimir Expediente
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="ec-tabs ec-no-print">
          {[
            { id: "adm", label: "Admisiones", dot: "#0b5d5b", cls: "a-active" },
            { id: "med", label: "Médico", dot: "#3b82f6", cls: "m-active" },
            { id: "cli", label: "Clínico", dot: "#16a34a", cls: "c-active" },
          ].map(t => (
            <button key={t.id} className={`ec-tab ${tab === t.id ? t.cls : ""}`} onClick={() => setTab(t.id)}>
              <span className="ec-tab-dot" style={{ background: t.dot }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="ec-body">

          {/* ══════════ ADMISIONES ══════════ */}
          <div className="ec-tab-content" style={{ display: tab === "adm" ? "block" : "none" }}>

            {/* Datos del Paciente */}
            <div className="ec-section">
              <div className="ec-section-header adm">
                <span className="ec-section-icon">🏥</span>
                <span className="ec-section-title adm">Datos del Paciente</span>
              </div>
              <div className="ec-section-body">
                <div className="ec-grid-4">
                  <div><div className="ec-field-lbl">Nombre Completo</div><div className="ec-field-val">{pac.nombre} {pac.apellido}</div></div>
                  <div><div className="ec-field-lbl">Fecha de Nacimiento</div><div className="ec-field-val">{fmtFecha(pac.fecha_nacimiento)}</div></div>
                  <div><div className="ec-field-lbl">Edad</div><div className="ec-field-val">{pac.edad} años</div></div>
                  <div><div className="ec-field-lbl">Género</div><div className="ec-field-val">{pac.genero || "—"}</div></div>
                </div>
                <hr className="ec-divider" />
                <div className="ec-grid-4">
                  <div><div className="ec-field-lbl">Estado Civil</div><div className="ec-field-val">{pac.estado_civil || "—"}</div></div>
                  <div><div className="ec-field-lbl">Escolaridad</div><div className="ec-field-val">{pac.escolaridad || "—"}</div></div>
                  <div><div className="ec-field-lbl">Ocupación</div><div className="ec-field-val">{pac.ocupacion || "—"}</div></div>
                  <div><div className="ec-field-lbl">Teléfono</div><div className="ec-field-val">{pac.telefono || "—"}</div></div>
                </div>
                <hr className="ec-divider" />
                <div className="ec-grid-2">
                  <div><div className="ec-field-lbl">Dirección</div><div className="ec-field-val">{pac.direccion || "—"}</div></div>
                  {(pac.orientacion_sexual || pac.grupos_vulnerables) && (
                    <div><div className="ec-field-lbl">Grupos Vulnerables / Orientación</div><div className="ec-field-val">{[pac.grupos_vulnerables, pac.orientacion_sexual].filter(Boolean).join(" · ")}</div></div>
                  )}
                </div>

                {fam && (
                  <>
                    <hr className="ec-divider" />
                    <p className="ec-sub-title adm">Familiar / Responsable</p>
                    <div className="ec-grid-3">
                      <div><div className="ec-field-lbl">Nombre</div><div className="ec-field-val">{fam.nombre || "—"}</div></div>
                      <div><div className="ec-field-lbl">Parentesco</div><div className="ec-field-val">{fam.parentesco || "—"}</div></div>
                      <div><div className="ec-field-lbl">Teléfono</div><div className="ec-field-val">{fam.telefono || "—"}</div></div>
                      {fam.direccion && <div style={{ gridColumn: "1/-1" }}><div className="ec-field-lbl">Dirección del Familiar</div><div className="ec-field-val">{fam.direccion}</div></div>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Cuestionario */}
            {cuestionario?.respuestas?.length > 0 && (
              <div className="ec-section">
                <div className="ec-section-header adm">
                  <span className="ec-section-icon">📋</span>
                  <span className="ec-section-title adm">Cuestionario de Admisión</span>
                </div>
                <div className="ec-section-body">
                  {Object.entries(respByTipo).map(([tipo, resps]) => (
                    <div key={tipo}>
                      <p className="ec-qa-group-title">{TIPOS_CUESTIONARIO[tipo] || tipo}</p>
                      <div className="ec-qa-list">
                        {resps.map((r, i) => (
                          <div key={i} className="ec-qa-item">
                            <div className="ec-qa-q">{r.pregunta}</div>
                            <div className="ec-qa-a">{r.respuesta}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estudio Socioeconómico */}
            {estudio && (
              <div className="ec-section">
                <div className="ec-section-header adm">
                  <span className="ec-section-icon">💰</span>
                  <span className="ec-section-title adm">Estudio Socioeconómico</span>
                </div>
                <div className="ec-section-body">
                  <div className="ec-grid-4">
                    <div><div className="ec-field-lbl">Folio</div><div className="ec-field-val">{estudio.folio || "—"}</div></div>
                    <div><div className="ec-field-lbl">Estado</div><div className="ec-field-val">{estudio.status || "—"}</div></div>
                    <div><div className="ec-field-lbl">Ingreso Mensual</div><div className="ec-field-val">{estudio.ingreso_mensual ? `$${Number(estudio.ingreso_mensual).toLocaleString()}` : "—"}</div></div>
                    <div><div className="ec-field-lbl">Egreso Mensual</div><div className="ec-field-val">{estudio.egreso_mensual ? `$${Number(estudio.egreso_mensual).toLocaleString()}` : "—"}</div></div>
                    <div><div className="ec-field-lbl">Tipo de Vivienda</div><div className="ec-field-val">{estudio.tipo_vivienda || "—"}</div></div>
                    <div><div className="ec-field-lbl">Nivel Económico</div><div className="ec-field-val">{estudio.nivel_economico || "—"}</div></div>
                  </div>
                  {estudio.observaciones && (
                    <>
                      <hr className="ec-divider" />
                      <div className="ec-field-lbl">Observaciones del Trabajador Social</div>
                      <div className="ec-val-box" style={{ marginTop: 6 }}>{estudio.observaciones}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Decisión de Ingreso */}
            {dec && (
              <div className="ec-section">
                <div className="ec-section-header adm">
                  <span className="ec-section-icon">⚖️</span>
                  <span className="ec-section-title adm">Decisión de Ingreso</span>
                </div>
                <div className="ec-section-body">
                  <div className="ec-decision-banner" style={{ background: decBg, color: decColor }}>
                    {decLabel}
                  </div>
                  <div className="ec-grid-3">
                    <div><div className="ec-field-lbl">Fecha de Decisión</div><div className="ec-field-val">{fmtFecha(dec.fecha)}</div></div>
                    {dec.motivo_rechazo && <div style={{ gridColumn: "1/-1" }}><div className="ec-field-lbl">Motivo / Referencia</div><div className="ec-field-val">{dec.motivo_rechazo}</div></div>}
                  </div>
                </div>
              </div>
            )}

            {/* Citas */}
            {citas?.length > 0 && (
              <div className="ec-section">
                <div className="ec-section-header adm">
                  <span className="ec-section-icon">📅</span>
                  <span className="ec-section-title adm">Historial de Citas</span>
                </div>
                <div className="ec-section-body" style={{ padding: 0 }}>
                  <table className="ec-citas-table">
                    <thead>
                      <tr>
                        <th>Fecha</th><th>Hora</th><th>Tipo</th><th>Familiar</th><th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.map((ci, i) => {
                        const est = ESTADO_CITA[ci.estado] || ESTADO_CITA.programada;
                        const [nom] = (ci.especialidad || "").split("|");
                        return (
                          <tr key={i}>
                            <td>{fmtFecha(ci.fecha)}</td>
                            <td>{fmtHora(ci.fecha)}</td>
                            <td>{ci.tipo || "—"}</td>
                            <td style={{ color: "#6b7280" }}>{nom || "—"}</td>
                            <td><span className="ec-badge" style={{ background: est.bg, color: est.color }}>{est.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ══════════ MÉDICO ══════════ */}
          <div className="ec-tab-content ec-area-break" style={{ display: tab === "med" ? "block" : "none" }}>

            {/* Valoración de Ingreso */}
            <div className="ec-section">
              <div className="ec-section-header med">
                <span className="ec-section-icon">🩺</span>
                <span className="ec-section-title med">Valoración de Ingreso</span>
              </div>
              <div className="ec-section-body">
                {val ? (
                  <>
                    <div className="ec-grid-3" style={{ marginBottom: 14 }}>
                      <div>
                        <div className="ec-field-lbl">Resultado</div>
                        <span className="ec-badge" style={{ background: val.apto === 1 ? "#e6f4f3" : val.apto === 0 ? "#fff1f2" : "#f3f4f6", color: val.apto === 1 ? "#0b5d5b" : val.apto === 0 ? "#ef4444" : "#9ca3af", fontSize: 13, padding: "4px 12px" }}>
                          {val.apto === 1 ? "✓ Apto para tratamiento" : val.apto === 0 ? "✗ No Apto" : "Pendiente"}
                        </span>
                      </div>
                      <div><div className="ec-field-lbl">Médico Valorador</div><div className="ec-field-val">{val.nombre_medico || "—"}</div></div>
                      <div><div className="ec-field-lbl">Fecha</div><div className="ec-field-val">{fmtFecha(val.fecha_valoracion)}</div></div>
                    </div>
                    {val.observaciones && (
                      <>
                        <div className="ec-field-lbl">Observaciones Médicas</div>
                        <div className="ec-val-box" style={{ marginTop: 6 }}>{val.observaciones}</div>
                      </>
                    )}
                  </>
                ) : <div className="ec-empty">Sin valoración de ingreso registrada</div>}
              </div>
            </div>

            {/* Recepción Primeras 24h */}
            {recepcion && (
              <div className="ec-section">
                <div className="ec-section-header med">
                  <span className="ec-section-icon">❤️</span>
                  <span className="ec-section-title med">Recepción Médica — Primeras 24 Horas</span>
                </div>
                <div className="ec-section-body">
                  <p className="ec-sub-title med">Signos Vitales</p>
                  <div className="ec-signos-grid">
                    {[
                      { k: "pa_sistolica", lbl: "PA Sistólica", unit: "mmHg" },
                      { k: "pa_diastolica", lbl: "PA Diastólica", unit: "mmHg" },
                      { k: "fc", lbl: "Frec. Cardíaca", unit: "lpm" },
                      { k: "fr", lbl: "Frec. Resp.", unit: "rpm" },
                      { k: "temp", lbl: "Temperatura", unit: "°C" },
                      { k: "peso", lbl: "Peso", unit: "kg" },
                      { k: "talla", lbl: "Talla", unit: "cm" },
                    ].map(({ k, lbl, unit }) => (
                      <div key={k} className="ec-signo-card">
                        <div className="ec-signo-val">{signos[k] || "—"}</div>
                        <div className="ec-signo-unit">{unit}</div>
                        <div className="ec-signo-lbl">{lbl}</div>
                      </div>
                    ))}
                  </div>

                  <hr className="ec-divider" />
                  <div className="ec-grid-2">
                    <div>
                      <div className="ec-field-lbl">Estado de Estabilidad</div>
                      <div>
                        {recepcion.es_estable === null || recepcion.es_estable === undefined
                          ? <span className="ec-empty">No registrado</span>
                          : <span className="ec-badge" style={{ background: Number(recepcion.es_estable) ? "#f0fdf4" : "#fff1f2", color: Number(recepcion.es_estable) ? "#16a34a" : "#ef4444", fontSize: 13, padding: "4px 12px" }}>
                              {Number(recepcion.es_estable) ? "✓ Paciente Estable" : "⚠ No Estable"}
                            </span>
                        }
                      </div>
                    </div>
                    {recepcion.habitacion && (
                      <div><div className="ec-field-lbl">Habitación Asignada</div><div className="ec-field-val">{recepcion.habitacion}</div></div>
                    )}
                  </div>

                  <hr className="ec-divider" />
                  <p className="ec-sub-title med">Valoración Integral</p>
                  <div className="ec-grid-3">
                    <div>
                      <div className="ec-field-lbl">Psiquiátrica</div>
                      <div className="ec-val-box" style={{ fontSize: 12 }}>{recepcion.valoracion_psiquiatrica || <span className="ec-empty">Sin notas</span>}</div>
                    </div>
                    <div>
                      <div className="ec-field-lbl">Nutricional</div>
                      <div className="ec-val-box" style={{ fontSize: 12 }}>{recepcion.valoracion_nutricional || <span className="ec-empty">Sin notas</span>}</div>
                    </div>
                    <div>
                      <div className="ec-field-lbl">Salud General</div>
                      <div className="ec-val-box" style={{ fontSize: 12 }}>{recepcion.valoracion_salud || <span className="ec-empty">Sin notas</span>}</div>
                    </div>
                  </div>

                  {recepcion.plan_tratamiento && (
                    <>
                      <hr className="ec-divider" />
                      <div className="ec-field-lbl">Plan de Tratamiento</div>
                      <div className="ec-val-box" style={{ marginTop: 6 }}>{recepcion.plan_tratamiento}</div>
                    </>
                  )}
                  {recepcion.observaciones && (
                    <>
                      <hr className="ec-divider" />
                      <div className="ec-field-lbl">Observaciones</div>
                      <div className="ec-val-box" style={{ marginTop: 6 }}>{recepcion.observaciones}</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!val && !estudio && !recepcion && (
              <div className="ec-section"><div className="ec-section-body"><div className="ec-empty">Sin información médica registrada</div></div></div>
            )}
          </div>

          {/* ══════════ CLÍNICO ══════════ */}
          <div className="ec-tab-content ec-area-break" style={{ display: tab === "cli" ? "block" : "none" }}>
            {traslado ? (
              <>
                {/* Traslado */}
                <div className="ec-section">
                  <div className="ec-section-header cli">
                    <span className="ec-section-icon">🚐</span>
                    <span className="ec-section-title cli">Traslado al Departamento Clínico</span>
                  </div>
                  <div className="ec-section-body">
                    <div className="ec-grid-3">
                      <div><div className="ec-field-lbl">Fecha de Traslado</div><div className="ec-field-val">{fmtFecha(traslado.fecha)}</div></div>
                      <div>
                        <div className="ec-field-lbl">¿Trajo Sustancias?</div>
                        <span className="ec-badge" style={{ background: traslado.tiene_sustancias ? "#fff1f2" : "#e6f4f3", color: traslado.tiene_sustancias ? "#ef4444" : "#0b5d5b", fontSize: 13, padding: "3px 10px" }}>
                          {traslado.tiene_sustancias ? "Sí" : "No"}
                        </span>
                      </div>
                    </div>
                    {traslado.tiene_sustancias && traslado.descripcion_sustancias && (
                      <>
                        <hr className="ec-divider" />
                        <div className="ec-field-lbl">Descripción de Sustancias Encontradas</div>
                        <div className="ec-val-box" style={{ marginTop: 6, borderLeft: "3px solid #ef4444" }}>{traslado.descripcion_sustancias}</div>
                      </>
                    )}
                    {traslado.observaciones && (
                      <>
                        <hr className="ec-divider" />
                        <div className="ec-field-lbl">Observaciones del Traslado</div>
                        <div className="ec-val-box" style={{ marginTop: 6 }}>{traslado.observaciones}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Inventario */}
                <div className="ec-section">
                  <div className="ec-section-header cli">
                    <span className="ec-section-icon">📦</span>
                    <span className="ec-section-title cli">Inventario de Pertenencias</span>
                  </div>
                  <div className="ec-section-body" style={{ padding: inventario.length > 0 ? 0 : 18 }}>
                    {inventario.length === 0
                      ? <div className="ec-empty" style={{ padding: 18 }}>No se registraron pertenencias</div>
                      : (
                        <table className="ec-inv-table">
                          <thead>
                            <tr><th>#</th><th>Artículo</th><th>Cantidad</th><th>Observaciones</th></tr>
                          </thead>
                          <tbody>
                            {inventario.map((row, i) => (
                              <tr key={i}>
                                <td style={{ color: "#9ca3af", width: 32 }}>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{row.articulo}</td>
                                <td>{row.cantidad}</td>
                                <td style={{ color: "#6b7280" }}>{row.observaciones || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    }
                  </div>
                </div>
              </>
            ) : (
              <div className="ec-section"><div className="ec-section-body"><div className="ec-empty">Sin información de traslado registrada. El traslado se registra una vez que el paciente es aprobado e ingresa al instituto.</div></div></div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
