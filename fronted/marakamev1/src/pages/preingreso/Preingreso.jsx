import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../admisiones/Admisiones.css";

const IcoBell = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

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

const TIPOS_DOC = [
  { key: "contrato_terapeutico",    label: "Contrato Terapéutico",           desc: "Compromisos del paciente con el programa" },
  { key: "consentimiento",          label: "Consentimiento Informado",        desc: "Autorización para el tratamiento" },
  { key: "carta_autorizacion",      label: "Carta de Autorización",           desc: "Autorización del familiar responsable" },
  { key: "reglamento",              label: "Reglamento Interno",              desc: "Normas y reglas del centro" },
  { key: "carta_responsiva",        label: "Carta Responsiva Familiar",       desc: "Responsabilidad del familiar ante el tratamiento" },
  { key: "nicotina",                label: "Protocolo Libre de Nicotina",     desc: "Compromiso de desintoxicación tabáquica" },
  { key: "no_suicidio",             label: "Contrato de No Suicidio",         desc: "Pacto terapéutico de preservación de vida" },
];

const badge = (bg, color, text) => (
  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>
);

const labelTipo = (key) => TIPOS_DOC.find(t => t.key === key)?.label || key;

export default function Preingreso({ embedded = false }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [vista, setVista] = useState("lista");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  // Lista
  const [pacientes, setPacientes]   = useState([]);
  const [cargando, setCargando]     = useState(false);
  const [error, setError]           = useState(false);
  const [busqueda, setBusqueda]     = useState("");
  const [filtro, setFiltro]         = useState("todos");

  // Recibo de pago
  const [recibos, setRecibos]           = useState([]);
  const [modalRecibo, setModalRecibo]   = useState(false);
  const [guardandoRecibo, setGuardandoRecibo] = useState(false);
  const [formRecibo, setFormRecibo]     = useState({
    nombre_pagador:"", domicilio:"", cp:"", rfc:"", telefono:"",
    clave_paciente:"", concepto:"", monto_tratamiento:"", monto_familiar:"", total:"", cantidad_letra:""
  });

  // Subir documento
  const initArchivos = () => Object.fromEntries(TIPOS_DOC.map(t => [t.key, null]));
  const [seleccionado, setSeleccionado] = useState("contrato_terapeutico");
  const [archivos, setArchivos]         = useState(initArchivos());
  const [previews, setPreviews]         = useState(initArchivos());
  const [aceptado, setAceptado]         = useState(false);
  const [guardando, setGuardando]       = useState(false);
  const [docsActuales, setDocsActuales] = useState([]);

  const [notifs, setNotifs]         = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifNoLeidas = notifs.filter(n => !n.leida).length;

  useEffect(() => {
    cargar();
    if (usuario?.id_usuario) {
      fetch(`http://localhost:3000/clinico/notificaciones/${usuario.id_usuario}`)
        .then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d.slice(0,20) : [])).catch(() => {});
    }
  }, []);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const res = await fetch("http://localhost:3000/contratos/pacientes-aptos");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setPacientes([]);
    } finally { setCargando(false); }
  };

  const filtrados = pacientes.filter(p => {
    const nombre = `${p.nombre} ${p.apellido}`.toLowerCase();
    const idStr = String(p.id_paciente);
    const q = busqueda.trim().toLowerCase();
    if (q && !nombre.includes(q) && !idStr.includes(q)) return false;
    if (filtro === "con")  return (p.num_contratos ?? 0) > 0;
    if (filtro === "sin")  return (p.num_contratos ?? 0) === 0;
    return true;
  });

  const conteo = (f) => pacientes.filter(p =>
    f === "con" ? (p.num_contratos ?? 0) > 0 : (p.num_contratos ?? 0) === 0
  ).length;

  const cargarRecibos = async (id_paciente) => {
    try {
      const res = await fetch(`http://localhost:3000/recibos/paciente/${id_paciente}`);
      const data = await res.json();
      setRecibos(Array.isArray(data) ? data : []);
    } catch { setRecibos([]); }
  };

  const guardarRecibo = async () => {
    if (!pacienteSeleccionado) return;
    setGuardandoRecibo(true);
    try {
      const total = (parseFloat(formRecibo.monto_tratamiento) || 0) + (parseFloat(formRecibo.monto_familiar) || 0);
      await fetch("http://localhost:3000/recibos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formRecibo, id_paciente: pacienteSeleccionado.id_paciente, id_usuario: usuario.id_usuario, total }),
      });
      await cargarRecibos(pacienteSeleccionado.id_paciente);
      setModalRecibo(false);
      setFormRecibo({ nombre_pagador:"", domicilio:"", cp:"", rfc:"", telefono:"", clave_paciente:"", concepto:"", monto_tratamiento:"", monto_familiar:"", total:"", cantidad_letra:"" });
    } catch { alert("Error al guardar recibo"); }
    finally { setGuardandoRecibo(false); }
  };

  const abrirDocs = async (p) => {
    setPacienteSeleccionado(p);
    setArchivos(initArchivos());
    setPreviews(initArchivos());
    setAceptado(false);
    setSeleccionado("contrato_terapeutico");
    setVista("docs");
    cargarRecibos(p.id_paciente);
    try {
      const res = await fetch(`http://localhost:3000/contratos/${p.id_paciente}`);
      const data = await res.json();
      setDocsActuales(Array.isArray(data) ? data : []);
    } catch { setDocsActuales([]); }
  };

  const handleArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setArchivos(prev => ({ ...prev, [seleccionado]: file }));
    setPreviews(prev => ({ ...prev, [seleccionado]: url }));
  };

  const handleGuardar = async () => {
    const archivo = archivos[seleccionado];
    if (!archivo) return alert("Primero sube el documento PDF");
    if (!aceptado) return alert("Debes confirmar los términos antes de guardar");
    if (!pacienteSeleccionado) return;

    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("tipo", seleccionado);
      formData.append("id_paciente", pacienteSeleccionado.id_paciente);

      const res = await fetch("http://localhost:3000/contratos/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const updated = await fetch(`http://localhost:3000/contratos/${pacienteSeleccionado.id_paciente}`);
        const data = await updated.json();
        setDocsActuales(Array.isArray(data) ? data : []);
        setArchivos(prev => ({ ...prev, [seleccionado]: null }));
        setPreviews(prev => ({ ...prev, [seleccionado]: null }));
        setAceptado(false);
        const newCount = (pacienteSeleccionado.num_contratos ?? 0) + 1;
        setPacientes(prev => prev.map(p =>
          p.id_paciente === pacienteSeleccionado.id_paciente
            ? { ...p, num_contratos: newCount }
            : p
        ));
        setPacienteSeleccionado(prev => ({ ...prev, num_contratos: newCount }));
      } else {
        alert("Error al guardar el documento");
      }
    } catch {
      alert("Error de conexión");
    } finally { setGuardando(false); }
  };

  const tipoActual = TIPOS_DOC.find(t => t.key === seleccionado);
  const preview = previews[seleccionado];
  const docGuardado = docsActuales.find(d => d.tipo === seleccionado);

  const irANotif = (notif) => {
    try { fetch(`http://localhost:3000/clinico/notificaciones/leer/${notif.id_notificacion}`, { method: "POST" }); } catch {}
    setNotifs(prev => prev.map(n => n.id_notificacion === notif.id_notificacion ? { ...n, leida: 1 } : n));
    setShowNotifs(false);
    const tipo = notif.tipo || "";
    const id = notif.id_referencia;
    if (tipo === "ingreso_aprobado" || tipo === "traslado_completado") { navigate(id ? `/expedientes?id=${id}` : "/expedientes"); return; }
    if (id) { navigate(`/validacion?pacienteId=${id}`); return; }
    navigate("/admisiones");
  };

  const sidebar = (
    <div className="adm-sidebar" onClick={e => e.stopPropagation()}>
      <div className="adm-sidebar-top">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>MARAKAME</h2>
          <div style={{ position: "relative" }}>
            <div className="adm-topbar-icon" onClick={() => setShowNotifs(s => !s)} style={{ cursor: "pointer", position: "relative" }}>
              <IcoBell />
              {notifNoLeidas > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifNoLeidas}
                </span>
              )}
            </div>
            {showNotifs && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={() => setShowNotifs(false)} />
                <div style={{ position: "fixed", top: 68, left: 248, width: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 500, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Notificaciones</span>
                    {notifs.some(n => !n.leida) && (
                      <button onClick={async () => { try { await fetch(`http://localhost:3000/clinico/notificaciones/leer-todas/${usuario.id_usuario}`, { method: "POST" }); setNotifs(prev => prev.map(n => ({ ...n, leida: 1 }))); } catch {} }} style={{ fontSize: 11, color: "#0b5d5b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Marcar todas leídas</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: "32px 18px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Sin notificaciones</div>
                    ) : notifs.map((n, i) => (
                      <div key={i} onClick={() => irANotif(n)} style={{ padding: "12px 18px", borderBottom: "1px solid #f9fafb", cursor: n.id_referencia ? "pointer" : "default", background: n.leida ? "#fff" : "#f0faf9", display: "flex", gap: 12, alignItems: "flex-start" }}
                        onMouseEnter={e => { if (n.id_referencia) e.currentTarget.style.background = "#e6f4f3"; }}
                        onMouseLeave={e => e.currentTarget.style.background = n.leida ? "#fff" : "#f0faf9"}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.leida ? "#d1d5db" : "#0b5d5b", flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{n.mensaje}</div>
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{n.fecha ? new Date(String(n.fecha).replace(/Z$/,'').replace(/\+.*/,'')).toLocaleDateString("es-MX", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : ""}</div>
                          {n.id_referencia && <div style={{ fontSize: 10, color: "#0b5d5b", fontWeight: 600, marginTop: 2 }}>Ver paciente →</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
      </div>
      <nav>
      <ul>
        <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
        <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
        <li onClick={() => navigate("/pacientes")}><IcoUsers />Pacientes</li>
        <li onClick={() => navigate("/registro")}><IcoUser />Preregistro</li>
        <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
        <li onClick={() => navigate("/estudio")}><IcoMoney />Estudio Socioeconómico</li>
        <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
        <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
        <li className="active"><IcoDoc />Preingreso</li>
        <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
      </ul>
      </nav>
    </div>
  );
  const wrap = (m) => embedded ? m : <div className="dashboard">{sidebar}{m}</div>;

  // ─── VISTA LISTA ────────────────────────────────────────
  if (vista === "lista") {
    return wrap(
      <div className="main" style={{ overflowY: "auto" }}>
          <div className="header">
            <h3>Preingreso — Documentos</h3>
            <input
              placeholder="Buscar por nombre o N° ID..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ minWidth: 220 }}
            />
          </div>

          <div style={{ padding: "16px 24px 0", display: "flex", gap: 8 }}>
            {[["todos","Todos"], ["con","Con documentos"], ["sin","Sin documentos"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFiltro(val)}
                style={{
                  padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: filtro === val ? "#0b5d5b" : "#fff",
                  color: filtro === val ? "#fff" : "#374151",
                  border: `1px solid ${filtro === val ? "#0b5d5b" : "#e5e7eb"}`,
                }}
              >
                {label}{val !== "todos" ? ` (${conteo(val)})` : ""}
              </button>
            ))}
          </div>

          <div style={{ padding: "16px 24px" }}>
            {cargando ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Cargando...</div>
            ) : error ? (
              <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 10, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>No se pudo conectar al servidor</div>
                <button onClick={cargar} style={{ padding: "8px 20px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Reintentar</button>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["ID", "Nombre", "Edad", "Documentos", "Fecha aprobación", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                          {busqueda
                            ? "Sin resultados para esa búsqueda"
                            : filtro === "sin"
                              ? "Todos los pacientes aprobados ya tienen documentos"
                              : "No hay pacientes aprobados aún"}
                        </td>
                      </tr>
                    ) : filtrados.map((p, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                        onClick={() => abrirDocs(p)}
                      >
                        <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>{`MK-${new Date().getFullYear()}-${String(p.id_paciente).padStart(3,'0')}`}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {(p.nombre || "")[0]}{(p.apellido || "")[0]}
                            </div>
                            {p.nombre} {p.apellido}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>{p.edad} años</td>
                        <td style={{ padding: "12px 14px" }}>
                          {(p.num_contratos ?? 0) > 0
                            ? badge("#e6f4f3", "#0b5d5b", `✓ ${p.num_contratos} doc${p.num_contratos > 1 ? "s" : ""}`)
                            : badge("#fff7ed", "#d97706", "Sin documentos")}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: 12 }}>
                          {p.fecha_aprobacion ? new Date(p.fecha_aprobacion).toLocaleDateString("es-MX") : "—"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ color: "#0b5d5b", fontWeight: 700, fontSize: 12 }}>
                            {(p.num_contratos ?? 0) > 0 ? "Ver / Agregar →" : "Subir documento →"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    );
  }

  // ─── VISTA DOCS ────────────────────────────────────────
  return wrap(
    <div className="main" style={{ overflowY: "auto" }}>
        <div className="header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setVista("lista")}
              style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 600 }}
            >
              ← Volver
            </button>
            <h3 style={{ margin: 0 }}>
              Preingreso — {pacienteSeleccionado?.nombre} {pacienteSeleccionado?.apellido}
            </h3>
          </div>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", gap: 20 }}>
          {/* Panel izquierdo */}
          <div style={{ width: 290, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Info paciente */}
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 10 }}>Paciente</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>
                {pacienteSeleccionado?.nombre} {pacienteSeleccionado?.apellido}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>{pacienteSeleccionado?.edad} años · #{pacienteSeleccionado?.id_paciente}</div>
              {(pacienteSeleccionado?.num_contratos ?? 0) > 0
                ? badge("#e6f4f3", "#0b5d5b", `✓ ${pacienteSeleccionado?.num_contratos} doc${pacienteSeleccionado?.num_contratos > 1 ? "s" : ""} guardado${pacienteSeleccionado?.num_contratos > 1 ? "s" : ""}`)
                : badge("#fff7ed", "#d97706", "Sin documentos aún")}
            </div>

            {/* Recibos de pago */}
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Nota de Pago</div>
                <button onClick={() => setModalRecibo(true)} style={{ fontSize: 11, fontWeight: 700, color: "#0b5d5b", background: "#e6f4f3", border: "none", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>+ Registrar</button>
              </div>
              {recibos.length === 0 ? (
                <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "10px 0" }}>Sin recibos registrados</div>
              ) : recibos.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < recibos.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>#{String(r.id_recibo).padStart(4,"0")} — ${Number(r.total||0).toLocaleString("es-MX")}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.nombre_pagador || "Sin nombre"}</div>
                  </div>
                  {r.validado
                    ? badge("#e6f4f3", "#0b5d5b", "✓ Validado")
                    : badge("#fff7ed", "#d97706", "⏳ Pendiente")}
                </div>
              ))}
            </div>

            {/* Documentos existentes */}
            {docsActuales.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 10 }}>Documentos guardados</div>
                {docsActuales.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < docsActuales.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{labelTipo(d.tipo)}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{d.fecha ? new Date(String(d.fecha).replace(/Z$/,'').replace(/\+.*/,'')).toLocaleDateString("es-MX") : "—"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {badge("#e6f4f3", "#0b5d5b", "✓")}
                      <button
                        onClick={() => window.open(`http://localhost:3000/uploads/contratos/${d.contenido}`, "_blank")}
                        style={{ fontSize: 11, fontWeight: 600, color: "#0b5d5b", background: "#e6f4f3", border: "1px solid #0b5d5b", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Seleccionar tipo de documento */}
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 10 }}>Nuevo documento</div>
              {TIPOS_DOC.map(t => (
                <div
                  key={t.key}
                  onClick={() => setSeleccionado(t.key)}
                  style={{
                    padding: "9px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer", transition: "all .15s",
                    border: `1px solid ${seleccionado === t.key ? "#0b5d5b" : "#e5e7eb"}`,
                    background: seleccionado === t.key ? "#e6f4f3" : "#f9fafb",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: seleccionado === t.key ? "#0b5d5b" : "#111827" }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{t.desc}</div>
                  {archivos[t.key] && <span style={{ marginTop: 3, display: "inline-block", fontSize: 10, fontWeight: 700, color: "#0b5d5b" }}>✓ PDF cargado</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho */}
          <div style={{ flex: 1, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{tipoActual.label}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{tipoActual.desc}</div>
            </div>

            {preview ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#eff6ff", border: "1px solid #2563eb", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>
                  📎 Nuevo archivo listo para guardar — reemplazará el anterior si ya existe.
                </div>
                <iframe src={preview} title="Vista previa" style={{ width: "100%", height: 380, border: "1px solid #e5e7eb", borderRadius: 8 }} />
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", width: "fit-content" }}>
                  <input type="file" accept="application/pdf" onChange={handleArchivo} hidden />
                  Cambiar archivo
                </label>
              </div>
            ) : docGuardado ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#e6f4f3", border: "1px solid #0b5d5b", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0b5d5b" }}>✓ Documento guardado</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{docGuardado.fecha ? new Date(String(docGuardado.fecha).replace(/Z$/,'').replace(/\+.*/,'')).toLocaleDateString("es-MX") : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => window.open(`http://localhost:3000/uploads/contratos/${docGuardado.contenido}`, "_blank")} style={{ padding: "7px 14px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      📄 Ver PDF
                    </button>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff7ed", color: "#d97706", border: "1px solid #d97706", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      <input type="file" accept="application/pdf" onChange={handleArchivo} hidden />
                      🔄 Reemplazar
                    </label>
                  </div>
                </div>
                <iframe
                  src={`http://localhost:3000/uploads/contratos/${docGuardado.contenido}`}
                  title="Documento guardado"
                  style={{ width: "100%", height: 380, border: "1px solid #e5e7eb", borderRadius: 8 }}
                />
              </div>
            ) : (
              <label
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, border: "2px dashed #e5e7eb", borderRadius: 10, padding: "48px 24px", cursor: "pointer", background: "#f9fafb", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0b5d5b"; e.currentTarget.style.background = "#e6f4f3"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f9fafb"; }}
              >
                <input type="file" accept="application/pdf" onChange={handleArchivo} hidden />
                <div style={{ fontSize: 36 }}>📄</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Haz clic para subir el PDF</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Solo archivos .pdf · {tipoActual.label}</div>
              </label>
            )}

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 14, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
              <input type="checkbox" checked={aceptado} onChange={e => setAceptado(e.target.checked)} style={{ marginTop: 2 }} />
              Confirmo que el documento ha sido revisado, firmado por el paciente y/o su familiar responsable, y está listo para ser guardado en el expediente.
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleGuardar}
                disabled={guardando || !archivos[seleccionado]}
                style={{ padding: "10px 28px", background: archivos[seleccionado] ? "#0b5d5b" : "#d1d5db", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: archivos[seleccionado] ? "pointer" : "not-allowed" }}
              >
                {guardando ? "Guardando..." : "Guardar Documento"}
              </button>
            </div>
          </div>
        </div>

        {/* Modal recibo de pago */}
        {modalRecibo && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setModalRecibo(false)}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Registrar Nota de Pago</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[
                  ["nombre_pagador","Nombre de quien paga *","",true],
                  ["domicilio","Domicilio","",false],
                  ["cp","C.P.","",false],
                  ["rfc","R.F.C.","",false],
                  ["telefono","Teléfono","",false],
                  ["clave_paciente","Clave del paciente","",false],
                ].map(([key, ph]) => (
                  <input key={key} placeholder={ph} value={formRecibo[key]} onChange={e => setFormRecibo(p => ({ ...p, [key]: e.target.value }))}
                    style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }} />
                ))}
              </div>
              <textarea placeholder="Concepto" value={formRecibo.concepto} onChange={e => setFormRecibo(p => ({ ...p, concepto: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, minHeight: 60, boxSizing: "border-box", marginBottom: 10, resize: "vertical" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input type="number" placeholder="Monto tratamiento" value={formRecibo.monto_tratamiento} onChange={e => setFormRecibo(p => ({ ...p, monto_tratamiento: e.target.value }))}
                  style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }} />
                <input type="number" placeholder="Monto programa familiar" value={formRecibo.monto_familiar} onChange={e => setFormRecibo(p => ({ ...p, monto_familiar: e.target.value }))}
                  style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }} />
              </div>
              <input placeholder="Cantidad con letra" value={formRecibo.cantidad_letra} onChange={e => setFormRecibo(p => ({ ...p, cantidad_letra: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box", marginBottom: 16 }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setModalRecibo(false)} style={{ padding: "9px 20px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                <button onClick={guardarRecibo} disabled={guardandoRecibo || !formRecibo.nombre_pagador}
                  style={{ padding: "9px 24px", background: formRecibo.nombre_pagador ? "#0b5d5b" : "#d1d5db", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: formRecibo.nombre_pagador ? "pointer" : "not-allowed" }}>
                  {guardandoRecibo ? "Guardando..." : "Guardar Recibo"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
