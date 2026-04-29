import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Admisiones.css";
import "./ValidarIngreso.css";

const IcoGrid   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoHome   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoUser   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="16" y1="11" x2="16" y2="17"/><line x1="13" y1="14" x2="19" y2="14"/></svg>;
const IcoFile   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
const IcoMoney  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>;
const IcoCal    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoDoc    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>;
const IcoFolder = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const IcoUsers  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const S = {
  th: { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", background: "#f9fafb" },
  td: { padding: "13px 14px", borderBottom: "1px solid #f3f4f6" },
  badge: (bg, color) => ({ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: bg, color }),
};

const BADGE = {
  ok:       ["#e6f4f3", "#0b5d5b"],
  pendiente:["#f3f4f6", "#9ca3af"],
  bloqueado:["#fef2f2", "#ef4444"],
  "en-curso":["#fff7ed", "#d97706"],
  rechazado:["#fff1f2", "#ef4444"],
  "no-apto":["#fff1f2", "#ef4444"],
};

const ICON = {
  ok:"✓", pendiente:"○", bloqueado:"✗", "en-curso":"⏳", rechazado:"✗", "no-apto":"✗",
};

export default function ValidarIngreso() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [pacientes, setPacientes]         = useState([]);
  const [seleccionado, setSeleccionado]   = useState(null);
  const [datos, setDatos]                 = useState(null);
  const [cargando, setCargando]           = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [decision, setDecision]           = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [referir, setReferir]             = useState(false);
  const [lugarReferencia, setLugarReferencia] = useState("");
  const [lugarPersonalizado, setLugarPersonalizado] = useState("");
  const [guardando, setGuardando]         = useState(false);
  const [busqueda, setBusqueda]           = useState("");

  useEffect(() => { cargarPacientes(); }, []);

  const cargarPacientes = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/pacientes-admision");
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch { setPacientes([]); }
    finally { setCargando(false); }
  };

  useEffect(() => {
    let cancel = false;
    if (!seleccionado) return;
    setCargandoDetalle(true);
    setDatos(null);
    fetch(`http://localhost:3000/validar-ingreso/${seleccionado.id_paciente}`)
      .then(r => r.json())
      .then(d => { if (!cancel) { setDatos(d); if (d.decision?.decision) setDecision(d.decision.decision); } })
      .catch(() => { if (!cancel) setDatos({}); })
      .finally(() => { if (!cancel) setCargandoDetalle(false); });
    return () => { cancel = true; };
  }, [seleccionado]);

  const guardarDecision = async () => {
    if (!decision) { alert("Selecciona una decisión."); return; }
    setGuardando(true);
    try {
      let motivo = motivoRechazo;
      if (decision === "rechazado" && referir) {
        const lugar = lugarReferencia === "otro" ? lugarPersonalizado : lugarReferencia;
        if (lugar) {
          motivo = motivo ? `${motivo}\n[Referido a: ${lugar}]` : `[Referido a: ${lugar}]`;
        }
      }
      await fetch("http://localhost:3000/validar-ingreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_paciente: seleccionado.id_paciente, id_usuario: usuario.id_usuario, decision, motivo_rechazo: motivo })
      });
      const msgs = {
        aprobado: "Paciente aprobado. Se notificó al área clínica.",
        rechazado: "Paciente rechazado.",
        requiere_valoracion: "Se solicitó nueva valoración médica. El médico debe re-evaluar al paciente.",
      };
      alert(msgs[decision] || "Decisión guardada.");
      await cargarPacientes();
      setSeleccionado(null);
      setDatos(null);
      setReferir(false);
      setLugarReferencia("");
      setLugarPersonalizado("");
    } catch (e) { alert("Error: " + e.message); }
    finally { setGuardando(false); }
  };

  const sidebar = (
    <div className="adm-sidebar">
      <h2>MARAKAME</h2>
      <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
      <ul>
        <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
        <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
        <li onClick={() => navigate("/pacientes")}><IcoUsers />Pacientes</li>
        <li onClick={() => navigate("/registro")}><IcoUser />Agregar Paciente</li>
        <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
        <li onClick={() => navigate("/estudio")}><IcoMoney />Estudio Socioeconómico</li>
        <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
        <li className="active"><IcoShield />Validación de Ingreso</li>
        <li onClick={() => navigate("/preingreso")}><IcoDoc />Preingreso</li>
        <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
      </ul>
      <button className="adm-btn" onClick={() => navigate("/registro")}>+ Registro de Paciente</button>
    </div>
  );

  // ─── Detalle: loading ───────────────────────────────────
  if (seleccionado && cargandoDetalle) {
    return (
      <div className="dashboard">
        {sidebar}
        <div className="main" style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
          Cargando datos del paciente...
        </div>
      </div>
    );
  }

  // ─── Detalle: proceso ───────────────────────────────────
  if (seleccionado && datos !== null) {
    const pac        = datos.paciente || seleccionado;
    const v          = datos.valoracion;
    const e          = datos.estudio;
    const c          = datos.cuestionario;
    const dec        = datos.decision;
    const medicoApto  = v?.apto === 1;
    const medicoNoApto= v?.apto === 0;
    const estudioOk   = e?.status === "enviado";
    const yaDecidido  = !!dec && dec.decision !== "requiere_valoracion";
    const cuestionarioOk = c && (c.total_respuestas >= 5);
    const puedeAprobar = medicoApto && estudioOk;

    const pasos = [
      {
        num: 1, etapa: "Cuestionario de Admisión", responsable: "Admisiones",
        estado: cuestionarioOk ? "ok" : c ? "en-curso" : "pendiente",
        label: cuestionarioOk ? "Completo" : c ? "Incompleto" : "Pendiente",
        accion: cuestionarioOk ? null : {
          label: c ? "Completar" : "Llenar",
          fn: () => navigate(`/registro?id=${seleccionado.id_paciente}`)
        },
      },
      {
        num: 2, etapa: "Valoración Médica", responsable: "Médico",
        estado: !cuestionarioOk ? "bloqueado" : v ? (medicoApto ? "ok" : "no-apto") : "pendiente",
        label: !cuestionarioOk ? "Bloqueado" : v ? (medicoApto ? "Apto" : "No Apto") : "Pendiente",
        accion: null,
      },
      {
        num: 3, etapa: "Estudio Socioeconómico", responsable: "Admisiones",
        estado: medicoNoApto ? "bloqueado" : estudioOk ? "ok" : e ? "en-curso" : "pendiente",
        label: medicoNoApto ? "No aplica" : estudioOk ? "Enviado" : e ? "Borrador" : "Pendiente",
        accion: medicoNoApto ? null : {
          label: estudioOk ? "Ver Estudio" : "Llenar Estudio",
          fn: () => navigate(`/estudio?id=${seleccionado.id_paciente}`)
        },
      },
      {
        num: 4, etapa: "Decisión de Admisión", responsable: "Admisiones",
        estado: dec ? (dec.decision === "aprobado" ? "ok" : "rechazado") : "pendiente",
        label: dec ? (dec.decision === "aprobado" ? "Aprobado" : "Rechazado") : "Pendiente",
        accion: null,
      },
      {
        num: 5, etapa: "Traslado Clínico", responsable: "Clínico",
        estado: dec?.decision === "aprobado" ? "pendiente" : "bloqueado",
        label: dec?.decision === "aprobado" ? "Pendiente" : "Bloqueado",
        accion: null,
      },
    ];

    return (
      <div className="dashboard">
        {sidebar}
        <div className="main" style={{ overflowY: "auto" }}>
          {/* Header */}
          <div className="header">
            <button onClick={() => { setSeleccionado(null); setDatos(null); }} style={{ background: "none", border: "none", color: "#0b5d5b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>← Volver</button>
            <h3>Proceso de Ingreso</h3>
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            {/* Expediente card */}
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#0b5d5b", textTransform: "uppercase", letterSpacing: .5 }}>EXPEDIENTE CLÍNICO</span>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "4px 0 8px" }}>{pac.nombre} {pac.apellido}</h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12, color: "#6b7280", flexWrap: "wrap" }}>
                <span>🆔 MK-{new Date().getFullYear()}-{String(pac.id_paciente||0).padStart(3,"0")}</span>
                <span>👤 {pac.edad || pac.edad_calc || "—"} años</span>
                <span style={{ background: "#e0f2fe", color: "#0284c7", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>EN PROCESO</span>
              </div>
            </div>

            {/* Resumen 3 cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { icon: "⚕️", label: "Resultado médico",  val: v ? (medicoApto ? "Apto" : "No Apto") : "Pendiente", ok: !!v && medicoApto, bad: medicoNoApto },
                { icon: "💰", label: "Socioeconómico",     val: estudioOk ? "Aceptado" : e ? "Borrador" : "Pendiente", ok: estudioOk },
                { icon: "📋", label: "Cuestionario",       val: cuestionarioOk ? "Completo" : c ? "Incompleto" : "Pendiente", ok: cuestionarioOk, bad: c && !cuestionarioOk },
              ].map((s, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.bad ? "#ef4444" : s.ok ? "#0b5d5b" : "#9ca3af" }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Tabla de proceso */}
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Tabla de Proceso</h4>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={S.th}>#</th>
                    <th style={S.th}>Etapa</th>
                    <th style={S.th}>Responsable</th>
                    <th style={S.th}>Estado</th>
                    <th style={S.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pasos.map((p, i) => {
                    const [bg, color] = BADGE[p.estado] || BADGE.pendiente;
                    return (
                      <tr key={i}>
                        <td style={S.td}>
                          <span style={{ width: 28, height: 28, borderRadius: "50%", background: bg, color, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            {ICON[p.estado] || "○"}
                          </span>
                        </td>
                        <td style={{ ...S.td, fontWeight: 500, color: "#374151" }}>{p.etapa}</td>
                        <td style={{ ...S.td, color: "#6b7280" }}>{p.responsable}</td>
                        <td style={S.td}>
                          <span style={S.badge(bg, color)}>{p.label}</span>
                        </td>
                        <td style={S.td}>
                          {p.accion && (
                            <button onClick={p.accion.fn} style={{ padding: "5px 14px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              {p.accion.label}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Observaciones médicas */}
            {v?.observaciones && (
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: 6 }}>OBSERVACIONES MÉDICAS</span>
                <p style={{ fontSize: 13, color: "#374151", fontStyle: "italic", margin: 0 }}>"{v.observaciones}"</p>
              </div>
            )}

            {/* Decision ya tomada */}
            {yaDecidido && (
              <div style={{
                padding: 20, borderRadius: 10, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 20,
                background: dec.decision === "aprobado" ? "#e6f4f3" : "#fff1f2",
                color: dec.decision === "aprobado" ? "#0b5d5b" : "#ef4444",
                border: `1px solid ${dec.decision === "aprobado" ? "#0b5d5b" : "#ef4444"}`,
              }}>
                {dec.decision === "aprobado" ? "✓ Ingreso Aprobado" : "✗ Ingreso Rechazado"}
                {dec.motivo_rechazo && <p style={{ fontSize: 13, marginTop: 6, fontWeight: 400 }}>{dec.motivo_rechazo}</p>}
              </div>
            )}

            {/* Panel de decisión */}
            {!yaDecidido && (
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16, textAlign: "center" }}>Decisión de Ingreso</h4>
                {dec?.decision === "requiere_valoracion" && (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#92400e" }}>
                    ↺ Se había solicitado nueva valoración médica. Puedes tomar una nueva decisión.
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <button
                    onClick={() => puedeAprobar && setDecision("aprobado")}
                    style={{
                      padding: "14px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${decision === "aprobado" ? "#0b5d5b" : "#e5e7eb"}`,
                      background: decision === "aprobado" ? "#e6f4f3" : puedeAprobar ? "#fff" : "#f9fafb",
                      color: decision === "aprobado" ? "#0b5d5b" : puedeAprobar ? "#374151" : "#9ca3af",
                      cursor: puedeAprobar ? "pointer" : "not-allowed",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6
                    }}
                  >
                    <span style={{ fontSize: 20 }}>✓</span>
                    Aprobar ingreso
                    {!puedeAprobar && <span style={{ fontSize: 10, fontWeight: 400 }}>Requiere médico apto + estudio</span>}
                  </button>
                  <button
                    onClick={() => setDecision("rechazado")}
                    style={{
                      padding: "14px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${decision === "rechazado" ? "#ef4444" : "#e5e7eb"}`,
                      background: decision === "rechazado" ? "#fff1f2" : "#fff",
                      color: decision === "rechazado" ? "#ef4444" : "#374151",
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6
                    }}
                  >
                    <span style={{ fontSize: 20 }}>✗</span>
                    Rechazar
                  </button>
                  <button
                    onClick={() => setDecision("requiere_valoracion")}
                    style={{
                      padding: "14px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${decision === "requiere_valoracion" ? "#7c3aed" : "#e5e7eb"}`,
                      background: decision === "requiere_valoracion" ? "#f5f3ff" : "#fff",
                      color: decision === "requiere_valoracion" ? "#7c3aed" : "#374151",
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center"
                    }}
                  >
                    <span style={{ fontSize: 20 }}>↺</span>
                    Nueva valoración médica
                  </button>
                </div>
                {(decision === "rechazado" || decision === "requiere_valoracion") && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 6 }}>
                      {decision === "rechazado" ? "Motivo del rechazo (opcional)" : "Motivo / notas para el médico (opcional)"}
                    </label>
                    <textarea
                      style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "inherit", minHeight: 80, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                      placeholder={decision === "rechazado" ? "Describa el motivo del rechazo..." : "Indique qué debe re-evaluar el médico..."}
                      value={motivoRechazo}
                      onChange={e => setMotivoRechazo(e.target.value)}
                    />
                  </div>
                )}

                {decision === "rechazado" && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", marginBottom: 10 }}>
                      <input type="checkbox" checked={referir} onChange={e => setReferir(e.target.checked)} />
                      Referir al paciente a otro lugar
                    </label>
                    {referir && (
                      <div style={{ padding: 14, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>¿A dónde se refiere?</div>
                        <select
                          value={lugarReferencia}
                          onChange={e => setLugarReferencia(e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}
                        >
                          <option value="">Seleccionar lugar...</option>
                          <option value="Hospital General">Hospital General</option>
                          <option value="IMSS">IMSS</option>
                          <option value="ISSSTE">ISSSTE</option>
                          <option value="Centro de Salud Mental">Centro de Salud Mental</option>
                          <option value="CIJ (Centro de Integración Juvenil)">CIJ (Centro de Integración Juvenil)</option>
                          <option value="CONADIC">CONADIC</option>
                          <option value="Cruz Roja">Cruz Roja</option>
                          <option value="Clínica privada">Clínica privada</option>
                          <option value="otro">Otro (especificar)</option>
                        </select>
                        {lugarReferencia === "otro" && (
                          <input
                            placeholder="Nombre del lugar al que se refiere..."
                            value={lugarPersonalizado}
                            onChange={e => setLugarPersonalizado(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={guardarDecision}
                  disabled={guardando || !decision || (decision === "aprobado" && !puedeAprobar)}
                  style={{ width: "100%", padding: 13, background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >
                  {guardando ? "Guardando..." : "Guardar decisión"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Lista de pacientes ─────────────────────────────────
  const filtrados = pacientes.filter(p =>
    !busqueda.trim() || `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const bk = (bg, color, text) => (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>
  );

  return (
    <div className="dashboard">
      {sidebar}
      <div className="main" style={{ overflowY: "auto" }}>
        <div className="header">
          <h3>Validación de Ingreso</h3>
          <input
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div style={{ padding: "16px 24px" }}>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["ID", "Nombre", "Edad", "Cuestionario", "Val. Médica", "Estudio", "Decisión", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Cargando...</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{busqueda ? "Sin coincidencias" : "No hay pacientes registrados"}</td></tr>
                ) : filtrados.map((p, i) => {
                  const medicoOk = p.apto === 1;
                  const medicoNo = p.apto === 0;
                  const estOk    = p.estudio_status === "enviado";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => setSeleccionado(p)}>
                      <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>MK-{new Date().getFullYear()}-{String(p.id_paciente).padStart(3,"0")}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>{p.nombre} {p.apellido}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7280" }}>{p.edad} años</td>
                      <td style={{ padding: "12px 14px" }}>{p.id_cuestionario ? bk("#e6f4f3","#0b5d5b","✓ Completo") : bk("#f3f4f6","#9ca3af","Pendiente")}</td>
                      <td style={{ padding: "12px 14px" }}>{medicoOk ? bk("#e6f4f3","#0b5d5b","Apto") : medicoNo ? bk("#fff1f2","#ef4444","No Apto") : bk("#f3f4f6","#9ca3af","Sin valorar")}</td>
                      <td style={{ padding: "12px 14px" }}>{estOk ? bk("#e6f4f3","#0b5d5b","Enviado") : p.id_estudio ? bk("#fff7ed","#d97706","Borrador") : bk("#f3f4f6","#9ca3af","Pendiente")}</td>
                      <td style={{ padding: "12px 14px" }}>{p.decision === "aprobado" ? bk("#e6f4f3","#0b5d5b","✓ Aprobado") : p.decision === "rechazado" ? bk("#fff1f2","#ef4444","✗ Rechazado") : bk("#fff7ed","#d97706","⏳ Pendiente")}</td>
                      <td style={{ padding: "12px 14px" }}><span style={{ color: "#0b5d5b", fontWeight: 600, fontSize: 12 }}>Ver proceso →</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
