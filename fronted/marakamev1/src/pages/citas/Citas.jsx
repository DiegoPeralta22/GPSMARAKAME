import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../admisiones/Admisiones.css";
import { fetchPacientes } from "../../utils/pacientes.js";

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
const IcoX      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoBell   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

const ESTADO_CONFIG = {
  programada:    { bg: "#eff6ff", color: "#2563eb", label: "Programada" },
  asistio:       { bg: "#e6f4f3", color: "#0b5d5b", label: "Asistió" },
  cancelada:     { bg: "#fff1f2", color: "#ef4444", label: "Cancelada" },
  reprogramada:  { bg: "#fff7ed", color: "#d97706", label: "Reprogramada" },
  no_asistio:    { bg: "#f3f4f6", color: "#6b7280", label: "No asistió" },
};

const TIPOS_CITA = ["Primera vez", "Seguimiento", "Valoración médica", "Entrevista familiar", "Entrevista de ingreso", "Otro"];

// Strips timezone so SQL Server datetime strings show as stored (no UTC offset applied)
const parseLocal = (iso) => {
  const s = String(iso).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
  return new Date(s);
};

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const s = String(iso).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
  const [datePart, timePart = "00:00"] = s.split('T');
  if (!datePart) return "—";
  const [y, m, d] = datePart.split('-');
  const [hh, mn] = timePart.split(':');
  return `${d}/${m}/${y} ${hh}:${mn}`;
};

export default function Citas({ embedded = false, onVerPaciente = null }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [citas, setCitas]         = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState(false);
  const [filtro, setFiltro]       = useState("todas");
  const [busqueda, setBusqueda]   = useState("");
  const [modal, setModal]         = useState(false);
  const [modalEstado, setModalEstado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [notifs, setNotifs]         = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifNoLeidas = notifs.filter(n => !n.leida).length;

  // form nueva cita
  const [busqPac, setBusqPac]         = useState("");
  const [pacSelec, setPacSelec]       = useState(null);
  const [familiarNombre, setFamiliarNombre] = useState("");
  const [familiarTelefono, setFamiliarTelefono] = useState("");
  const [fechaCita, setFechaCita]     = useState("");
  const [horaCita, setHoraCita]       = useState("");
  const [tipoCita, setTipoCita]       = useState("");
  const [notasCita, setNotasCita]     = useState("");

  // conflicto de cita
  const [conflicto, setConflicto] = useState(null);

  // vista calendario
  const [vistaCalendario, setVistaCalendario] = useState(false);
  const [diaCalendario, setDiaCalendario] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  });

  // form actualizar estado
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [nuevaFecha, setNuevaFecha]   = useState("");
  const [nuevaHora, setNuevaHora]     = useState("");
  const [notasEstado, setNotasEstado] = useState("");
  const [marcandoLlegada, setMarcandoLlegada] = useState(null);

  useEffect(() => {
    cargarCitas();
    cargarPacientes();
    if (usuario?.id_usuario) {
      fetch(`http://localhost:3000/clinico/notificaciones/${usuario.id_usuario}`)
        .then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d.slice(0,20) : [])).catch(() => {});
    }
  }, []);

  const cargarCitas = async () => {
    setCargando(true);
    setError(false);
    try {
      const res = await fetch("http://localhost:3000/citas");
      if (!res.ok) throw new Error();
      const raw = await res.json();
      const data = Array.isArray(raw) ? raw : [];

      // Auto-marcar como "no_asistio" las citas programadas cuya ventana ya pasó (hora + 2h)
      const ahoraMs = Date.now();
      const DOS_H = 2 * 60 * 60 * 1000;
      const expiradas = data.filter(c => c.estado === 'programada' && parseLocal(c.fecha).getTime() + DOS_H < ahoraMs);
      expiradas.forEach(c => {
        fetch(`http://localhost:3000/citas/${c.id_cita}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: 'no_asistio' }),
        }).catch(() => {});
      });

      const updated = data.map(c =>
        expiradas.some(e => e.id_cita === c.id_cita) ? { ...c, estado: 'no_asistio' } : c
      );
      setCitas(updated);
    } catch {
      setError(true);
      setCitas([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarPacientes = async () => {
    try {
      const data = await fetchPacientes();
      setPacientes(Array.isArray(data) ? data : []);
    } catch {}
  };

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

  const VEINTE_DIAS_MS = 20 * 24 * 60 * 60 * 1000;
  const ahora = Date.now();
  const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();

  const conteoHoy = citas.filter(c => {
    const s = String(c.fecha).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
    return s.startsWith(todayStr);
  }).length;

  const citasFiltradas = citas.filter(c => {
    const fechaCita = parseLocal(c.fecha);
    if ((c.estado === 'asistio' || c.estado === 'cancelada' || c.estado === 'no_asistio') && (ahora - fechaCita.getTime()) > VEINTE_DIAS_MS) return false;
    if (busqueda.trim()) {
      const nombre = `${c.nombre_paciente} ${c.apellido_paciente}`.toLowerCase();
      const familiar = (c.especialidad || "").toLowerCase();
      const q = busqueda.trim().toLowerCase();
      if (!nombre.includes(q) && !familiar.includes(q)) return false;
    }
    if (filtro === "hoy") {
      const s = String(c.fecha).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
      return s.startsWith(todayStr);
    }
    if (filtro !== "todas") return c.estado === filtro;
    return true;
  }).sort((a, b) => parseLocal(a.fecha) - parseLocal(b.fecha));

  const conteo = (est) => citas.filter(c => c.estado === est).length;

  const pacientesFiltrados = pacientes.filter(p => {
    const q = busqPac.trim().toLowerCase();
    if (!q) return true;
    const nombre = `${p.nombre} ${p.apellido}`.toLowerCase();
    const idStr = String(p.id_paciente);
    return nombre.includes(q) || idStr.includes(q);
  }).slice(0, 8);

  const verificarConflicto = (pacId, fecha, hora) => {
    if (!fecha || !hora) { setConflicto(null); return; }
    const nueva = parseLocal(`${fecha}T${hora}:00`);
    const DOS_H = 2 * 60 * 60 * 1000;
    const choque = citas.find(c => {
      if (c.estado === 'cancelada') return false;
      const existe = parseLocal(c.fecha);
      return Math.abs(nueva.getTime() - existe.getTime()) < DOS_H;
    });
    setConflicto(choque || null);
  };

  const crearCita = async () => {
    if (!pacSelec) return alert("Selecciona un paciente");
    if (!fechaCita || !horaCita) return alert("Indica la fecha y hora de la cita");
    if (new Date(`${fechaCita}T${horaCita}:00`) <= new Date()) return alert("No se puede agendar una cita en el pasado. Selecciona una fecha y hora futura.");
    if (!tipoCita) return alert("Selecciona el tipo de cita");
    if (conflicto) return alert(`Ya existe una cita agendada a esa hora (${fmtFecha(conflicto.fecha)} — ${conflicto.nombre_paciente || ""} ${conflicto.apellido_paciente || ""}). Elige otro horario.`);

    setGuardando(true);
    try {
      const fechaISO = `${fechaCita}T${horaCita}:00`;
      const res = await fetch("http://localhost:3000/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: pacSelec.id_paciente,
          fecha: fechaISO,
          tipo: tipoCita,
          familiar_nombre: (familiarNombre || familiarTelefono)
            ? [familiarNombre, familiarTelefono].filter(Boolean).join("|")
            : null,
          id_usuario: usuario.id_usuario || null,
        }),
      });
      if (!res.ok) throw new Error();
      setModal(false);
      resetForm();
      cargarCitas();
    } catch {
      alert("Error al guardar la cita. Verifica la conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const actualizarEstado = async () => {
    if (!nuevoEstado) return alert("Selecciona el nuevo estado");
    if ((nuevoEstado === 'cancelada' || nuevoEstado === 'reprogramada') && !notasEstado.trim()) {
      return alert(`Escribe el motivo de ${nuevoEstado === 'cancelada' ? 'cancelación' : 'reprogramación'}`);
    }
    if (nuevaFecha && nuevaHora) {
      const nueva = parseLocal(`${nuevaFecha}T${nuevaHora}:00`);
      const DOS_H = 2 * 60 * 60 * 1000;
      const choque = citas.find(c => {
        if (c.id_cita === modalEstado.cita.id_cita) return false;
        if (c.estado === 'cancelada') return false;
        const existe = parseLocal(c.fecha);
        return Math.abs(nueva.getTime() - existe.getTime()) < DOS_H;
      });
      if (choque) return alert(`Ya hay una cita en ese intervalo de 2 horas: ${choque.nombre_paciente} ${choque.apellido_paciente} (${fmtFecha(choque.fecha)}). Elige otro horario.`);
    }
    setGuardando(true);
    try {
      const body = { estado: nuevoEstado, notas: notasEstado || null };
      if (nuevaFecha && nuevaHora) body.fecha = `${nuevaFecha}T${nuevaHora}:00`;
      const res = await fetch(`http://localhost:3000/citas/${modalEstado.cita.id_cita}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setModalEstado(null);
      setNuevoEstado("");
      setNuevaFecha("");
      setNuevaHora("");
      setNotasEstado("");
      cargarCitas();
    } catch {
      alert("Error al actualizar. Verifica la conexión.");
    } finally {
      setGuardando(false);
    }
  };

  const marcarLlegada = async (cita) => {
    setMarcandoLlegada(cita.id_cita);
    try {
      const res = await fetch(`http://localhost:3000/citas/${cita.id_cita}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: 'asistio' }),
      });
      if (!res.ok) throw new Error();
      cargarCitas();
    } catch {
      alert("Error al registrar la llegada. Verifica la conexión.");
    } finally {
      setMarcandoLlegada(null);
    }
  };

  const resetForm = () => {
    setBusqPac("");
    setPacSelec(null);
    setFamiliarNombre("");
    setFamiliarTelefono("");
    setFechaCita("");
    setHoraCita("");
    setTipoCita("");
    setNotasCita("");
    setConflicto(null);
  };

  const abrirModalEstado = (cita) => {
    setModalEstado({ cita });
    setNuevoEstado(cita.estado || "programada");
    if (cita.fecha) {
      const d = new Date(cita.fecha);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const MM = (d.getMonth() + 1).toString().padStart(2, "0");
        const dd = d.getDate().toString().padStart(2, "0");
        const hh = d.getHours().toString().padStart(2, "0");
        const mn = d.getMinutes().toString().padStart(2, "0");
        setNuevaFecha(`${yyyy}-${MM}-${dd}`);
        setNuevaHora(`${hh}:${mn}`);
      } else {
        setNuevaFecha(""); setNuevaHora("");
      }
    } else {
      setNuevaFecha(""); setNuevaHora("");
    }
    setNotasEstado(cita.notas || "");
  };

  const adm_sidebar = (
    <div className="adm-sidebar">
      <div className="adm-sidebar-top">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2>MARAKAME</h2>
            <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
          </div>
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
      </div>
      <nav>
        <ul>
          <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
          <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
          <li onClick={() => navigate("/pacientes")}><IcoUsers />Pacientes</li>
          <li onClick={() => navigate("/registro")}><IcoUser />Preregistro</li>
          <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
          <li onClick={() => navigate("/estudio")}><IcoMoney />Estudio Socioeconómico</li>
          <li className="active"><IcoCal />Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
          <li onClick={() => navigate("/preingreso")}><IcoDoc />Preingreso</li>
          <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
        </ul>
      </nav>
      <div className="adm-sidebar-bottom">
        <button className="adm-btn" onClick={() => navigate("/registro")}>+ Registro de Paciente</button>
      </div>
    </div>
  );
  const wrap = (m) => embedded ? m : <div className="dashboard">{adm_sidebar}{m}</div>;
  return wrap(<>
    <div className="main" style={{ overflowY: "auto" }}>
        <div className="header">
          <h3>Agenda de Citas</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Buscar paciente o familiar..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ minWidth: 220 }}
            />
            <button
              onClick={() => setVistaCalendario(v => !v)}
              style={{ padding: "8px 14px", background: vistaCalendario ? "#0b5d5b" : "#f3f4f6", color: vistaCalendario ? "#fff" : "#374151", border: `1px solid ${vistaCalendario ? "#0b5d5b" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              title="Vista calendario por hora"
            >
              📅 Calendario
            </button>
            <button
              onClick={() => setModal(true)}
              style={{ padding: "8px 18px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              + Nueva Cita
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["todas", "Todas"],
            ["hoy", "Hoy"],
            ["programada", "Programadas"],
            ["asistio", "Asistió"],
            ["no_asistio", "No asistió"],
            ["cancelada", "Canceladas"],
            ["reprogramada", "Reprogramadas"],
          ].map(([val, label]) => (
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
              {label}{val === "todas" ? ` (${citas.length})` : val === "hoy" ? ` (${conteoHoy})` : ` (${conteo(val)})`}
            </button>
          ))}
        </div>

        {/* Tabla */}
        {!vistaCalendario && <div style={{ padding: "16px 24px" }}>
          {cargando ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Cargando citas...</div>
          ) : error ? (
            <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 10, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>No se pudo conectar al servidor</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>Asegúrate de que el backend esté corriendo en el puerto 3000.</div>
              <button onClick={cargarCitas} style={{ padding: "8px 20px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Reintentar</button>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Paciente", "Tel. Paciente", "Familiar que agendó", "Fecha y Hora", "Duración", "Tipo", "Estado", ""].map((h, i) => (
                      <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                        {busqueda ? "Sin resultados para esa búsqueda" : "No hay citas registradas"}
                      </td>
                    </tr>
                  ) : citasFiltradas.map((c, i) => {
                    const est = ESTADO_CONFIG[c.estado] || { bg: "#f3f4f6", color: "#6b7280", label: c.estado };
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                          <div
                            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                            onClick={() => onVerPaciente ? onVerPaciente(c) : navigate(`/validacion?pacienteId=${c.id_paciente}`)}
                            title="Ver paciente"
                          >
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {(c.nombre_paciente || "?")[0]?.toUpperCase()}
                            </div>
                            <span style={{ color: "#0b5d5b", textDecoration: "underline" }}>{c.nombre_paciente} {c.apellido_paciente}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: 12 }}>
                          {c.telefono_paciente || <span style={{ color: "#9ca3af" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#374151" }}>
                          {c.especialidad ? (() => {
                            const [nom, tel] = c.especialidad.split("|");
                            return <div>
                              <div style={{ fontWeight: 500 }}>{nom}</div>
                              {tel && <div style={{ fontSize: 11, color: "#6b7280" }}>{tel}</div>}
                            </div>;
                          })() : <span style={{ color: "#9ca3af" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#374151" }}>{fmtFecha(c.fecha)}</td>
                        <td style={{ padding: "12px 14px", color: "#374151" }}>2 horas</td>
                        <td style={{ padding: "12px 14px", color: "#374151" }}>{c.tipo || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: est.bg, color: est.color, whiteSpace: "nowrap" }}>
                            {est.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {c.estado === 'programada' && (
                              <button
                                onClick={() => marcarLlegada(c)}
                                disabled={marcandoLlegada === c.id_cita}
                                style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, background: marcandoLlegada === c.id_cita ? "#9ca3af" : "#e6f4f3", color: marcandoLlegada === c.id_cita ? "#fff" : "#0b5d5b", border: "1px solid #0b5d5b", borderRadius: 6, cursor: marcandoLlegada === c.id_cita ? "default" : "pointer", whiteSpace: "nowrap" }}
                                title="Registrar que el paciente llegó y notificar al médico"
                              >
                                ✓ Llegó
                              </button>
                            )}
                            <button
                              onClick={() => abrirModalEstado(c)}
                              style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" }}
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>}

        {/* Vista Calendario */}
        {vistaCalendario && (
          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Vista por hora</span>
                <input
                  type="date"
                  value={diaCalendario}
                  onChange={e => setDiaCalendario(e.target.value)}
                  style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}
                />
                <button
                  onClick={() => setDiaCalendario(todayStr)}
                  style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600, background: "#e6f4f3", color: "#0b5d5b", border: "1px solid #0b5d5b", borderRadius: 8, cursor: "pointer" }}
                >
                  Hoy
                </button>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {citas.filter(c => { const s = String(c.fecha).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0]; return s.startsWith(diaCalendario) && c.estado !== 'cancelada'; }).length} citas ese día
                </span>
              </div>
              {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => {
                const citasEnHora = citas.filter(c => {
                  if (c.estado === 'cancelada') return false;
                  const s = String(c.fecha).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
                  if (!s.startsWith(diaCalendario)) return false;
                  const h = parseInt(s.split('T')[1]?.split(':')[0] || "-1");
                  return h === hour;
                });
                const isNow = new Date().getHours() === hour && diaCalendario === todayStr;
                return (
                  <div key={hour} style={{ display: "flex", minHeight: 52, borderBottom: "1px solid #f3f4f6", background: isNow ? "#fefce8" : undefined }}>
                    <div style={{ width: 64, flexShrink: 0, padding: "14px 10px", fontSize: 12, color: isNow ? "#d97706" : "#9ca3af", fontWeight: isNow ? 700 : 400, textAlign: "right", borderRight: "1px solid #f3f4f6" }}>
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    <div style={{ flex: 1, padding: "8px 14px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {citasEnHora.length === 0 ? (
                        <span style={{ fontSize: 11, color: "#e5e7eb" }}>·</span>
                      ) : citasEnHora.map((c, i) => {
                        const est = ESTADO_CONFIG[c.estado] || { bg: "#f3f4f6", color: "#6b7280", label: c.estado };
                        const mn = String(c.fecha).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0].split('T')[1]?.slice(0, 5) || '';
                        return (
                          <div key={i} style={{ background: est.bg, borderLeft: `3px solid ${est.color}`, borderRadius: 8, padding: "6px 12px", minWidth: 200 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{mn} — {c.nombre_paciente} {c.apellido_paciente}</div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>{c.tipo || "Sin tipo"} · <span style={{ color: est.color }}>{est.label}</span></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Nueva Cita */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 520, maxHeight: "90vh", overflowY: "auto", padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h4 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Nueva Cita</h4>
              <button onClick={() => { setModal(false); resetForm(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><IcoX /></button>
            </div>

            {/* Buscar paciente */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Paciente *</label>
              {pacSelec ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#e6f4f3", borderRadius: 8, border: "1px solid #0b5d5b" }}>
                  <span style={{ fontWeight: 600, color: "#0b5d5b", fontSize: 14 }}>{pacSelec.nombre} {pacSelec.apellido}</span>
                  <button onClick={() => { setPacSelec(null); setBusqPac(""); setConflicto(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#0b5d5b" }}><IcoX /></button>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <input
                    placeholder="Buscar por nombre o N° ID..."
                    value={busqPac}
                    onChange={e => setBusqPac(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                  />
                  {busqPac.trim() && pacientesFiltrados.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
                      {pacientesFiltrados.map((p, i) => (
                        <div
                          key={i}
                          onClick={() => { setPacSelec(p); setBusqPac(""); verificarConflicto(p.id_paciente, fechaCita, horaCita); }}
                          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f3f4f6" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                          onMouseLeave={e => e.currentTarget.style.background = ""}
                        >
                          <span style={{ fontWeight: 600 }}>{p.nombre} {p.apellido}</span>
                          <span style={{ color: "#9ca3af", marginLeft: 8 }}>#{p.id_paciente}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {busqPac.trim() && pacientesFiltrados.length === 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#9ca3af" }}>
                      Sin resultados
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Familiar que agendó */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Familiar que agendó</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input
                  placeholder="Nombre completo"
                  value={familiarNombre}
                  onChange={e => setFamiliarNombre(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                />
                <input
                  placeholder="Teléfono"
                  value={familiarTelefono}
                  onChange={e => setFamiliarTelefono(e.target.value)}
                  style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Fecha y hora */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: conflicto ? 8 : 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Fecha *</label>
                <input
                  type="date"
                  value={fechaCita}
                  min={todayStr}
                  onChange={e => { setFechaCita(e.target.value); verificarConflicto(pacSelec?.id_paciente, e.target.value, horaCita); }}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hora *</label>
                <input
                  type="time"
                  value={horaCita}
                  onChange={e => { setHoraCita(e.target.value); verificarConflicto(pacSelec?.id_paciente, fechaCita, e.target.value); }}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            </div>

            {conflicto && (
              <div style={{ marginBottom: 16, background: "#fff7ed", border: "1px solid #d97706", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
                ⚠️ <strong>Ya hay una cita en ese intervalo de 2 horas:</strong> {conflicto.nombre_paciente} {conflicto.apellido_paciente} ({conflicto.tipo || "sin tipo"}) — {fmtFecha(conflicto.fecha)}. Selecciona otro horario.
              </div>
            )}

            {/* Citas del día seleccionado */}
            {fechaCita && (() => {
              const citasHoy = citas.filter(c => {
                if (c.estado === 'cancelada') return false;
                const s = String(c.fecha).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
                return s.startsWith(fechaCita);
              }).sort((a, b) => parseLocal(a.fecha) - parseLocal(b.fecha));
              if (!citasHoy.length) return null;
              return (
                <div style={{ marginBottom: 16, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 6, textTransform: "uppercase" }}>Citas ya agendadas el {fechaCita}:</div>
                  {citasHoy.map((c, i) => {
                    const h = String(c.fecha).replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0].split('T')[1]?.slice(0, 5) || '';
                    return (
                      <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 2 }}>
                        🕐 {h} — {c.nombre_paciente} {c.apellido_paciente} <span style={{ color: "#6b7280" }}>({c.tipo || "Sin tipo"})</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Tipo de cita */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Tipo de cita *</label>
              <select
                value={tipoCita}
                onChange={e => setTipoCita(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
              >
                <option value="">Seleccionar tipo...</option>
                {TIPOS_CITA.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Notas */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Notas (opcional)</label>
              <textarea
                placeholder="Observaciones sobre la cita..."
                value={notasCita}
                onChange={e => setNotasCita(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
              La cita tendrá una duración de <strong>2 horas</strong> y se guardará con estado <strong>Programada</strong>.
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setModal(false); resetForm(); }}
                style={{ padding: "8px 20px", background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={crearCita}
                disabled={guardando}
                style={{ padding: "8px 20px", background: guardando ? "#9ca3af" : "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: guardando ? "default" : "pointer" }}
              >
                {guardando ? "Guardando..." : "Crear Cita"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Actualizar Estado */}
      {modalEstado && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, width: 440, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ margin: 0, fontSize: 16, color: "#111827" }}>Editar Cita</h4>
              <button onClick={() => setModalEstado(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><IcoX /></button>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: "#111827" }}>
                {modalEstado.cita.nombre_paciente} {modalEstado.cita.apellido_paciente}
              </div>
              <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
                {fmtFecha(modalEstado.cita.fecha)} · {modalEstado.cita.tipo || "Sin tipo"}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nuevo estado *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["asistio", "Asistió", "#e6f4f3", "#0b5d5b"],
                  ["cancelada", "Cancelada", "#fff1f2", "#ef4444"],
                  ["reprogramada", "Reprogramada", "#fff7ed", "#d97706"],
                  ["programada", "Programada", "#eff6ff", "#2563eb"],
                  ["no_asistio", "No asistió", "#f3f4f6", "#6b7280"],
                ].map(([val, label, bg, color]) => (
                  <button
                    key={val}
                    onClick={() => setNuevoEstado(val)}
                    style={{
                      padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: nuevoEstado === val ? bg : "#f9fafb",
                      color: nuevoEstado === val ? color : "#6b7280",
                      border: `2px solid ${nuevoEstado === val ? color : "#e5e7eb"}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Fecha</label>
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={e => setNuevaFecha(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hora</label>
                <input
                  type="time"
                  value={nuevaHora}
                  onChange={e => setNuevaHora(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {nuevoEstado === 'cancelada' ? "Motivo de cancelación *" : nuevoEstado === 'reprogramada' ? "Motivo de reprogramación *" : "Notas (opcional)"}
              </label>
              <textarea
                placeholder={nuevoEstado === 'cancelada' ? "¿Por qué se cancela la cita?" : nuevoEstado === 'reprogramada' ? "¿Por qué se reprograma?" : "Observaciones adicionales..."}
                value={notasEstado}
                onChange={e => setNotasEstado(e.target.value)}
                rows={2}
                style={{ width: "100%", padding: "8px 12px", border: `1px solid ${(nuevoEstado === 'cancelada' || nuevoEstado === 'reprogramada') && !notasEstado.trim() ? "#f87171" : "#e5e7eb"}`, borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
              />
              {(nuevoEstado === 'cancelada' || nuevoEstado === 'reprogramada') && !notasEstado.trim() && (
                <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>Campo requerido para este estado</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setModalEstado(null)}
                style={{ padding: "8px 20px", background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={actualizarEstado}
                disabled={guardando}
                style={{ padding: "8px 20px", background: guardando ? "#9ca3af" : "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: guardando ? "default" : "pointer" }}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
  </>);
}
