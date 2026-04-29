import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Admisiones.css";

const IcoGrid   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoHome   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoUsers  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoUser   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="16" y1="11" x2="16" y2="17"/><line x1="13" y1="14" x2="19" y2="14"/></svg>;
const IcoFile   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
const IcoMoney  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>;
const IcoCal    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoDoc    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>;
const IcoFolder = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const IcoEye    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoDl     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoPrint  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const IcoX      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoEdit   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

const lbl = { fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 };
const val = { fontSize: 14, fontWeight: 500, color: "#374151" };

const TIPOS_CITA = ["Primera vez", "Seguimiento", "Valoración médica", "Entrevista familiar", "Entrevista de ingreso", "Otro"];

const ESTADO_CITA = {
  programada:   { bg: "#eff6ff", color: "#2563eb", label: "Programada" },
  asistio:      { bg: "#e6f4f3", color: "#0b5d5b", label: "Asistió" },
  cancelada:    { bg: "#fff1f2", color: "#ef4444", label: "Cancelada" },
  reprogramada: { bg: "#fff7ed", color: "#d97706", label: "Reprogramada" },
};

function fmtFecha(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

function fmtCita(iso) {
  if (!iso) return "—";
  try {
    const str = iso.replace("Z", "").replace(/\+.*/, "");
    const d = new Date(str);
    const dd = d.getDate().toString().padStart(2, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const hh = d.getHours().toString().padStart(2, "0");
    const mn = d.getMinutes().toString().padStart(2, "0");
    return { fecha: `${dd}/${mm}/${d.getFullYear()}`, hora: `${hh}:${mn}` };
  } catch { return { fecha: iso, hora: "" }; }
}

function mkId(id) {
  return `MK-${new Date().getFullYear()}-${String(id || 0).padStart(3, "0")}`;
}
function initials(n, a) {
  return `${(n || "")[0] || ""}${(a || "")[0] || ""}`.toUpperCase();
}
function Badge({ bg, color, text }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
}

export default function Expedientes() {
  const navigate   = useNavigate();
  const [sp]       = useSearchParams();
  const idPaciente = sp.get("id");
  const usuario    = JSON.parse(localStorage.getItem("usuario") || "{}");

  /* list state */
  const [pacientes,     setPacientes]     = useState([]);
  const [busqueda,      setBusqueda]      = useState("");
  const [cargandoLista, setCargandoLista] = useState(false);

  /* detail state */
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(false);
  const [tab,      setTab]      = useState("general");

  /* citas state */
  const [citas, setCitas] = useState([]);

  /* modal nueva cita */
  const [modalCita, setModalCita]       = useState(false);
  const [citaFamiliar, setCitaFamiliar] = useState("");
  const [citaFecha,    setCitaFecha]    = useState("");
  const [citaHora,     setCitaHora]     = useState("");
  const [citaTipo,     setCitaTipo]     = useState("");
  const [citaNotas,    setCitaNotas]    = useState("");
  const [guardandoCita, setGuardandoCita] = useState(false);

  /* modal editar cita */
  const [modalEditCita, setModalEditCita] = useState(null);
  const [editEstado,    setEditEstado]    = useState("");
  const [editFecha,     setEditFecha]     = useState("");
  const [editHora,      setEditHora]      = useState("");
  const [editNotas,     setEditNotas]     = useState("");
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  useEffect(() => {
    if (idPaciente) {
      cargarDetalle(idPaciente);
      cargarCitas(idPaciente);
    } else {
      setTab("general");
      cargarLista();
    }
  }, [idPaciente]);

  const cargarLista = async () => {
    setCargandoLista(true);
    try {
      const res  = await fetch("http://localhost:3000/pacientes-admision");
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch { setPacientes([]); }
    finally { setCargandoLista(false); }
  };

  const cargarDetalle = async (id) => {
    setCargando(true);
    setDatos(null);
    try {
      const res  = await fetch(`http://localhost:3000/validar-ingreso/${id}`);
      const data = await res.json();
      setDatos(data);
    } catch { setDatos({}); }
    finally { setCargando(false); }
  };

  const cargarCitas = async (id) => {
    try {
      const res  = await fetch("http://localhost:3000/citas");
      const data = await res.json();
      setCitas(Array.isArray(data) ? data.filter(c => c.id_paciente === parseInt(id)) : []);
    } catch { setCitas([]); }
  };

  const abrirModalCita = () => {
    const fam = datos?.familiar;
    setCitaFamiliar(fam?.nombre || "");
    setCitaFecha("");
    setCitaHora("");
    setCitaTipo("");
    setCitaNotas("");
    setModalCita(true);
  };

  const crearCita = async () => {
    if (!citaFecha || !citaHora) return alert("Indica la fecha y hora");
    if (!citaTipo) return alert("Selecciona el tipo de cita");
    setGuardandoCita(true);
    try {
      const res = await fetch("http://localhost:3000/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: parseInt(idPaciente),
          fecha: `${citaFecha}T${citaHora}:00`,
          tipo: citaTipo,
          familiar_nombre: citaFamiliar || null,
          id_usuario: usuario.id_usuario || null,
        }),
      });
      if (!res.ok) throw new Error();
      setModalCita(false);
      cargarCitas(idPaciente);
    } catch { alert("Error al guardar la cita"); }
    finally { setGuardandoCita(false); }
  };

  const abrirEditarCita = (c) => {
    const parsed = fmtCita(c.fecha);
    setModalEditCita(c);
    setEditEstado(c.estado || "programada");
    setEditFecha(c.fecha ? c.fecha.split("T")[0].split(" ")[0] : "");
    setEditHora(parsed.hora || "");
    setEditNotas(c.notas || "");
  };

  const guardarEditCita = async () => {
    if (!editEstado) return;
    setGuardandoEdit(true);
    try {
      const body = { estado: editEstado, notas: editNotas || null };
      if (editFecha && editHora) body.fecha = `${editFecha}T${editHora}:00`;
      const res = await fetch(`http://localhost:3000/citas/${modalEditCita.id_cita}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setModalEditCita(null);
      cargarCitas(idPaciente);
    } catch { alert("Error al actualizar"); }
    finally { setGuardandoEdit(false); }
  };

  /* ── Sidebar ─────────────────────────────────────────── */
  const Sidebar = () => (
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
        <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
        <li onClick={() => navigate("/preingreso")}><IcoDoc />Preingreso</li>
        <li className="active"><IcoFolder />Expedientes</li>
      </ul>
      <button className="adm-btn" onClick={() => navigate("/registro")}>+ Registro de Paciente</button>
    </div>
  );

  /* ── LIST VIEW ───────────────────────────────────────── */
  if (!idPaciente) {
    const filtrados = pacientes.filter(p => {
      const nom = `${p.nombre} ${p.apellido}`.toLowerCase();
      return !busqueda.trim() || nom.includes(busqueda.toLowerCase());
    });

    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main" style={{ overflowY: "auto" }}>
          <div className="header">
            <h3>Expedientes</h3>
            <input placeholder="Buscar paciente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <div style={{ padding: "16px 24px" }}>
            {cargandoLista ? (
              <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Cargando expedientes...</div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["ID", "Paciente", "Edad", "Val. Médica", "Decisión", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                        {busqueda ? "Sin resultados" : "No hay expedientes registrados"}
                      </td></tr>
                    ) : filtrados.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                        onClick={() => navigate(`/expedientes?id=${p.id_paciente}`)}
                      >
                        <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>{mkId(p.id_paciente)}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {initials(p.nombre, p.apellido)}
                            </div>
                            {p.nombre} {p.apellido}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{p.edad} años</td>
                        <td style={{ padding: "12px 14px" }}>
                          {p.apto === 1 ? <Badge bg="#e6f4f3" color="#0b5d5b" text="Apto" />
                          : p.apto === 0 ? <Badge bg="#fff1f2" color="#ef4444" text="No Apto" />
                          : <Badge bg="#f3f4f6" color="#9ca3af" text="Pendiente" />}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {p.decision === "aprobado" ? <Badge bg="#e6f4f3" color="#0b5d5b" text="✓ Aprobado" />
                          : p.decision === "rechazado" ? <Badge bg="#fff1f2" color="#ef4444" text="✗ Rechazado" />
                          : <Badge bg="#fff7ed" color="#d97706" text="⏳ En proceso" />}
                        </td>
                        <td style={{ padding: "12px 14px" }}><span style={{ color: "#0b5d5b", fontWeight: 700, fontSize: 12 }}>Ver expediente →</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── LOADING ─────────────────────────────────────────── */
  if (cargando) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "#9ca3af", fontSize: 14 }}>Cargando expediente...</div>
        </div>
      </div>
    );
  }

  /* ── DETAIL DATA ─────────────────────────────────────── */
  const pac = datos?.paciente || {};
  const v   = datos?.valoracion;
  const e   = datos?.estudio;
  const c   = datos?.cuestionario;
  const dec = datos?.decision;
  const fam = datos?.familiar;

  const decColor = dec?.decision === "aprobado" ? "#0b5d5b" : dec?.decision === "rechazado" ? "#ef4444" : "#d97706";
  const decBg    = dec?.decision === "aprobado" ? "#e6f4f3" : dec?.decision === "rechazado" ? "#fff1f2" : "#fff7ed";
  const decLabel = dec?.decision === "aprobado" ? "APROBADO" : dec?.decision === "rechazado" ? "RECHAZADO" : "EN PROCESO";

  const pasos = [
    { label: "REGISTRO",   done: true, fecha: fmtFecha(pac.fecha_registro) },
    { label: "EVALUACIÓN", done: !!v,  fecha: v ? fmtFecha(v.fecha_valoracion) : "Pendiente" },
    { label: "VALIDACIÓN", done: !!e,  fecha: e ? (e.status || "En proceso") : "Pendiente" },
    { label: dec?.decision === "aprobado" ? "APROBADO" : "DECISIÓN",
      done: !!dec, fecha: dec ? (dec.decision || "—") : "Pendiente" },
  ];

  const documentos = [
    {
      icon: "📋", nombre: "Cuestionario de Admisión",
      status: c ? "Completado" : "Pendiente", ok: !!c,
      verUrl: `/registro?id=${idPaciente}`,
    },
    {
      icon: "📊", nombre: "Estudio Socioeconómico",
      status: e?.status === "enviado" ? "Completado" : e ? "Borrador" : "Pendiente",
      ok: e?.status === "enviado",
      verUrl: `/estudio?id=${idPaciente}`,
    },
    {
      icon: "📄", nombre: "Valoración Médica",
      status: v ? (v.apto === 1 ? "Completado" : "No Apto") : "Pendiente",
      ok: !!v,
      verUrl: `/validacion`,
    },
    {
      icon: "📝", nombre: "Decisión de Ingreso",
      status: dec ? (dec.decision === "aprobado" ? "Aprobado" : "Rechazado") : "Pendiente",
      ok: !!dec,
      verUrl: `/validacion`,
    },
  ];

  const citasFuturas = citas.filter(ci => new Date(ci.fecha) >= new Date()).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const TABS = ["General", "Documentos", "Estatus", "Citas"];

  /* ── DETAIL VIEW ─────────────────────────────────────── */
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main" style={{ overflowY: "auto", background: "#f3f4f6", padding: 0 }}>

        {/* Patient header + tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0 12px" }}>
            <button onClick={() => navigate("/expedientes")} style={{ background: "none", border: "none", cursor: "pointer", color: "#0b5d5b", fontWeight: 700, fontSize: 13, padding: 0, marginRight: 4 }}>← Volver</button>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800 }}>
                {initials(pac.nombre, pac.apellido)}
              </div>
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: decColor, border: "2px solid #fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{pac.nombre} {pac.apellido}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: decBg, color: decColor }}>● {decLabel}</span>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 3 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{mkId(pac.id_paciente || idPaciente)}</span>
                {pac.edad && <span style={{ fontSize: 12, color: "#6b7280" }}>{pac.edad} años</span>}
                {pac.genero && <span style={{ fontSize: 12, color: "#6b7280" }}>{pac.genero}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => navigate(`/validacion`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <IcoEye /> Ver validación
              </button>
              <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#0b5d5b", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
                <IcoPrint /> Imprimir expediente
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
                padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                color: tab === t.toLowerCase() ? "#0b5d5b" : "#6b7280",
                borderBottom: tab === t.toLowerCase() ? "2px solid #0b5d5b" : "2px solid transparent",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* ── Tab: General ── */}
        {tab === "general" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, padding: 20, alignItems: "start" }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Información General */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 22 }}>
                <h4 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Información General</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div><div style={lbl}>Nombre Completo</div><div style={val}>{pac.nombre} {pac.apellido}</div></div>
                  <div><div style={lbl}>Teléfono</div><div style={val}>{pac.telefono || "—"}</div></div>
                  <div><div style={lbl}>Fuente de Ingreso</div><div style={val}>{c?.fuente_ingreso || "—"}</div></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div><div style={lbl}>Dirección</div><div style={val}>{pac.direccion || "—"}</div></div>
                  <div><div style={lbl}>Fecha de Nacimiento</div><div style={val}>{fmtFecha(pac.fecha_nacimiento)}</div></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div><div style={lbl}>Estado Civil</div><div style={val}>{pac.estado_civil || "—"}</div></div>
                  <div><div style={lbl}>Escolaridad</div><div style={val}>{pac.escolaridad || "—"}</div></div>
                  <div><div style={lbl}>Ocupación</div><div style={val}>{pac.ocupacion || "—"}</div></div>
                </div>
                {(pac.orientacion_sexual || pac.grupos_vulnerables) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18, borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                    {pac.orientacion_sexual && <div><div style={lbl}>Orientación Sexual</div><div style={val}>{pac.orientacion_sexual}</div></div>}
                    {pac.grupos_vulnerables && <div><div style={lbl}>Grupos Vulnerables</div><div style={val}>{pac.grupos_vulnerables}</div></div>}
                  </div>
                )}
                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                  <div style={{ ...lbl, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    Datos del Acompañante / Familiar
                    {!fam && <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 400, textTransform: "none" }}>No registrado</span>}
                  </div>
                  {fam ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                      <div><div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>Nombre</div><div style={val}>{fam.nombre || "—"}</div></div>
                      <div><div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>Parentesco</div><div style={val}>{fam.parentesco || "—"}</div></div>
                      <div><div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>Teléfono</div><div style={val}>{fam.telefono || "—"}</div></div>
                      {fam.direccion && <div style={{ gridColumn: "1 / -1" }}><div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>Dirección</div><div style={val}>{fam.direccion}</div></div>}
                    </div>
                  ) : <div style={{ fontSize: 13, color: "#9ca3af" }}>—</div>}
                </div>
              </div>

              {/* Línea de Vida */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 22 }}>
                <h4 style={{ margin: "0 0 24px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Línea de Vida del Proceso</h4>
                <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
                  <div style={{ position: "absolute", top: 15, left: "12%", right: "12%", height: 3, background: "#e5e7eb", zIndex: 0 }} />
                  <div style={{ position: "absolute", top: 15, left: "12%", width: `${Math.max(0, (pasos.filter(p => p.done).length - 1)) / 3 * 76}%`, height: 3, background: "#0b5d5b", zIndex: 1 }} />
                  {pasos.map((paso, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 2 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", margin: "0 auto 10px", background: paso.done ? "#0b5d5b" : "#fff", color: paso.done ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, border: paso.done ? "none" : "2px solid #d1d5db", boxShadow: paso.done ? "0 0 0 3px #e6f4f3" : "none" }}>
                        {paso.done ? "✓" : i + 1}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: paso.done ? "#0b5d5b" : "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>{paso.label}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>{paso.fecha}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximas Citas */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Próximas Citas</h4>
                  <button onClick={abrirModalCita} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Nueva cita</button>
                </div>
                {citasFuturas.length === 0 ? (
                  <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No hay citas programadas</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                        {["Fecha", "Hora", "Tipo de Cita", "Estado"].map((h, i) => (
                          <th key={i} style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {citasFuturas.map((ci, i) => {
                        const fmt = fmtCita(ci.fecha);
                        const est = ESTADO_CITA[ci.estado] || ESTADO_CITA.programada;
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                            <td style={{ padding: "8px" }}>{fmt.fecha}</td>
                            <td style={{ padding: "8px" }}>{fmt.hora}</td>
                            <td style={{ padding: "8px" }}>{ci.tipo || "—"}</td>
                            <td style={{ padding: "8px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: est.bg, color: est.color }}>{est.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Documentos */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 16 }}>📁</span>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Documentos</h4>
                </div>
                {documentos.map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < documentos.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{doc.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.nombre}</div>
                      <div style={{ fontSize: 11, color: doc.ok ? "#0b5d5b" : "#9ca3af", marginTop: 1 }}>{doc.status}</div>
                    </div>
                    {doc.ok && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => navigate(doc.verUrl)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}><IcoEye /></button>
                        <button onClick={() => { navigate(doc.verUrl); setTimeout(() => window.print(), 1000); }} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}><IcoDl /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Documentos ── */}
        {tab === "documentos" && (
          <div style={{ padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
              <h4 style={{ margin: "0 0 18px", color: "#111827", fontSize: 15 }}>Documentos del Paciente</h4>
              {documentos.map((doc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < documentos.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: 26 }}>{doc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{doc.nombre}</div>
                    <div style={{ fontSize: 12, color: doc.ok ? "#0b5d5b" : "#9ca3af", marginTop: 2 }}>{doc.status}</div>
                  </div>
                  {doc.ok ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => navigate(doc.verUrl)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "#fff", border: "1px solid #0b5d5b", borderRadius: 8, color: "#0b5d5b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <IcoEye /> Ver
                      </button>
                      <button onClick={() => { navigate(doc.verUrl); setTimeout(() => window.print(), 1000); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "#0b5d5b", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <IcoDl /> Descargar
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>No disponible</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Estatus ── */}
        {tab === "estatus" && (
          <div style={{ padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
              <h4 style={{ margin: "0 0 18px", color: "#111827", fontSize: 15 }}>Estado del Proceso</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Cuestionario", val: c ? "Completo" : "Pendiente", ok: !!c },
                  { label: "Val. Médica",  val: v ? (v.apto === 1 ? "Apto" : "No Apto") : "Pendiente", ok: v?.apto === 1, bad: v?.apto === 0 },
                  { label: "Estudio",      val: e?.status === "enviado" ? "Enviado" : e ? "Borrador" : "Pendiente", ok: e?.status === "enviado" },
                  { label: "Decisión",     val: dec ? (dec.decision === "aprobado" ? "Aprobado" : "Rechazado") : "Pendiente", ok: dec?.decision === "aprobado", bad: dec?.decision === "rechazado" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.bad ? "#ef4444" : s.ok ? "#0b5d5b" : "#9ca3af" }}>{s.val}</div>
                  </div>
                ))}
              </div>
              {v?.observaciones && (
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>Observaciones Médicas</div>
                  <p style={{ fontSize: 13, color: "#374151", fontStyle: "italic", margin: 0 }}>"{v.observaciones}"</p>
                </div>
              )}
              <button onClick={() => navigate("/validacion")} style={{ padding: "9px 18px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Ir a Validación de Ingreso
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Citas ── */}
        {tab === "citas" && (
          <div style={{ padding: 20 }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h4 style={{ margin: 0, color: "#111827", fontSize: 15 }}>Agenda de Citas</h4>
                <button onClick={abrirModalCita} style={{ padding: "8px 16px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Nueva cita</button>
              </div>
              {citas.length === 0 ? (
                <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "48px 0" }}>No hay citas registradas para este paciente</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Fecha", "Hora", "Tipo", "Familiar", "Estado", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {citas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((ci, i) => {
                      const fmt = fmtCita(ci.fecha);
                      const est = ESTADO_CITA[ci.estado] || ESTADO_CITA.programada;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 12px" }}>{fmt.fecha}</td>
                          <td style={{ padding: "10px 12px" }}>{fmt.hora}</td>
                          <td style={{ padding: "10px 12px" }}>{ci.tipo || "—"}</td>
                          <td style={{ padding: "10px 12px", color: "#6b7280" }}>{ci.especialidad || "—"}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: est.bg, color: est.color }}>{est.label}</span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button onClick={() => abrirEditarCita(ci)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 600, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" }}>
                              <IcoEdit /> Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL: Nueva Cita ── */}
      {modalCita && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 460, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Nueva Cita</h4>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{pac.nombre} {pac.apellido}</div>
              </div>
              <button onClick={() => setModalCita(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><IcoX /></button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Familiar que agenda</label>
              <input
                placeholder="Nombre del familiar..."
                value={citaFamiliar}
                onChange={e => setCitaFamiliar(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
              />
              {fam?.nombre && citaFamiliar !== fam.nombre && (
                <button onClick={() => setCitaFamiliar(fam.nombre)} style={{ marginTop: 4, fontSize: 11, color: "#0b5d5b", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Usar datos registrados: {fam.nombre}
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Fecha *</label>
                <input type="date" value={citaFecha} onChange={e => setCitaFecha(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hora *</label>
                <input type="time" value={citaHora} onChange={e => setCitaHora(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Tipo de cita *</label>
              <select value={citaTipo} onChange={e => setCitaTipo(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}>
                <option value="">Seleccionar tipo...</option>
                {TIPOS_CITA.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Notas (opcional)</label>
              <textarea value={citaNotas} onChange={e => setCitaNotas(e.target.value)} rows={2} placeholder="Observaciones..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
              Duración: <strong>2 horas</strong> · Estado inicial: <strong>Programada</strong>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModalCita(false)} style={{ padding: "8px 20px", background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={crearCita} disabled={guardandoCita} style={{ padding: "8px 20px", background: guardandoCita ? "#9ca3af" : "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: guardandoCita ? "default" : "pointer" }}>
                {guardandoCita ? "Guardando..." : "Crear Cita"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Editar Cita ── */}
      {modalEditCita && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 440, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Editar Cita</h4>
              <button onClick={() => setModalEditCita(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><IcoX /></button>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: "#111827" }}>{modalEditCita.tipo || "Sin tipo"}</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>{fmtCita(modalEditCita.fecha).fecha} {fmtCita(modalEditCita.fecha).hora}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Fecha</label>
                <input type="date" value={editFecha} onChange={e => setEditFecha(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hora</label>
                <input type="time" value={editHora} onChange={e => setEditHora(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Estado</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["programada","Programada","#eff6ff","#2563eb"],["asistio","Asistió","#e6f4f3","#0b5d5b"],["cancelada","Cancelada","#fff1f2","#ef4444"],["reprogramada","Reprogramada","#fff7ed","#d97706"]].map(([v, label, bg, color]) => (
                  <button key={v} onClick={() => setEditEstado(v)} style={{ padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: editEstado === v ? bg : "#f9fafb", color: editEstado === v ? color : "#6b7280", border: `2px solid ${editEstado === v ? color : "#e5e7eb"}` }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Notas</label>
              <textarea value={editNotas} onChange={e => setEditNotas(e.target.value)} rows={2} placeholder="Motivo de cambio, observaciones..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModalEditCita(null)} style={{ padding: "8px 20px", background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarEditCita} disabled={guardandoEdit} style={{ padding: "8px 20px", background: guardandoEdit ? "#9ca3af" : "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: guardandoEdit ? "default" : "pointer" }}>
                {guardandoEdit ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
