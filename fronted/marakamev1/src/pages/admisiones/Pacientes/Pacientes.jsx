import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Admisiones.css";
import { fetchPacientes } from "../../../utils/pacientes.js";

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

const badge = (bg, color, text) => (
  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>
);

export default function Pacientes({ embedded = false, onVerExpediente }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState(false);
  const [busqueda, setBusqueda]   = useState("");
  const [filtro, setFiltro]       = useState("todos");

  const getEstadoPaciente = (p) => {
    if (p.decision === "rechazado")     return { label: "Rechazado",    bg: "#fff1f2", color: "#ef4444" };
    if (p.decision === "aprobado")      return { label: "Paciente",     bg: "#e6f4f3", color: "#0b5d5b" };
    if (p.decision === "pendiente_pago")return { label: "Pend. Admin.", bg: "#fff7ed", color: "#d97706" };
    if (p.apto === 0)                   return { label: "Revaloración", bg: "#fff7ed", color: "#d97706" };
    if (p.apto === 1)                   return { label: "Espera",       bg: "#eff6ff", color: "#2563eb" };
    if (p.id_cuestionario)              return { label: "Espera",       bg: "#eff6ff", color: "#2563eb" };
    return                                     { label: "Solicitante",  bg: "#f3f4f6", color: "#6b7280" };
  };

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const data = await fetchPacientes();
      setPacientes(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
      setPacientes([]);
    }
    finally { setCargando(false); }
  };

  const filtrados = pacientes.filter(p => {
    if (busqueda.trim()) {
      const nombre = `${p.nombre} ${p.apellido}`.toLowerCase();
      const idStr  = String(p.id_paciente);
      const fechaStr = p.fecha_registro ? p.fecha_registro.slice(0, 10) : "";
      const q = busqueda.trim().toLowerCase();
      if (!nombre.includes(q) && !idStr.includes(q) && !fechaStr.includes(q)) return false;
    }
    if (filtro === "admisiones")   return !p.decision || p.decision === "requiere_valoracion";
    if (filtro === "medico")       return p.apto === 1 && p.decision !== "aprobado" && p.decision !== "rechazado";
    if (filtro === "tratamiento")  return p.decision === "aprobado";
    if (filtro === "rechazados")   return p.decision === "rechazado" || p.apto === 0;
    return true;
  });

  const conteo = (f) => pacientes.filter(p =>
    f === "admisiones"  ? (!p.decision || p.decision === "requiere_valoracion") :
    f === "medico"      ? (p.apto === 1 && p.decision !== "aprobado" && p.decision !== "rechazado") :
    f === "tratamiento" ? p.decision === "aprobado" :
    p.decision === "rechazado" || p.apto === 0
  ).length;

  const adm_sidebar = (
    <div className="adm-sidebar">
      <div className="adm-sidebar-top">
        <h2>MARAKAME</h2>
        <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
      </div>
      <nav>
        <ul>
          <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
          <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
          <li className="active"><IcoUsers />Pacientes</li>
          <li onClick={() => navigate("/registro")}><IcoUser />Preregistro</li>
          <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
          <li onClick={() => navigate("/estudio")}><IcoMoney />Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
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
  return wrap(
    <div className="main" style={{ overflowY: "auto" }}>
        <div className="header">
          <h3>Pacientes</h3>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              placeholder="Buscar por nombre, N° ID o fecha (YYYY-MM-DD)..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ minWidth: 300, paddingRight: busqueda ? 28 : 12 }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                style={{ position: "absolute", right: 8, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, lineHeight: 1, padding: 0 }}
              >×</button>
            )}
          </div>
        </div>

        {/* Filtros por área */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["todos",       "Todos",          "#6b7280"],
            ["admisiones",  "Admisiones",     "#0b5d5b"],
            ["medico",      "Médico",         "#2563eb"],
            ["tratamiento", "En Tratamiento", "#16a34a"],
            ["rechazados",  "Rechazados",     "#ef4444"],
          ].map(([val, label, dot]) => (
            <button
              key={val}
              onClick={() => setFiltro(val)}
              style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: filtro === val ? dot : "#fff",
                color: filtro === val ? "#fff" : "#374151",
                border: `1px solid ${filtro === val ? dot : "#e5e7eb"}`,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {filtro !== val && <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block" }} />}
              {label}{val !== "todos" ? ` (${conteo(val)})` : ` (${pacientes.length})`}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ padding: "16px 24px" }}>
          {cargando ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Cargando...</div>
          ) : error ? (
            <div style={{ background: "#fff1f2", border: "1px solid #fecaca", borderRadius: 10, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>No se pudo conectar al servidor</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>Asegúrate de que el backend esté corriendo en el puerto 3000.</div>
              <button onClick={cargar} style={{ padding: "8px 20px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Reintentar
              </button>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["ID", "Paciente", "Estatus", ""].map((h, i) => (
                      <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                        {busqueda ? "Sin resultados para esa búsqueda" : "No hay pacientes registrados"}
                      </td>
                    </tr>
                  ) : filtrados.map((p, i) => {
                    const est = getEstadoPaciente(p);
                    return (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                      onClick={() => embedded && onVerExpediente ? onVerExpediente(p.id_paciente) : navigate(`/expedientes?id=${p.id_paciente}`)}
                    >
                      <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>
                        {`MK-${new Date().getFullYear()}-${String(p.id_paciente).padStart(3,"0")}`}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0b5d5b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {(p.nombre||"")[0]}{(p.apellido||"")[0]}
                          </div>
                          <div>
                            <div>{p.nombre} {p.apellido}</div>
                            {p.edad ? <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>{p.edad} años</div> : null}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {badge(est.bg, est.color, est.label)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ color: "#0b5d5b", fontWeight: 700, fontSize: 12 }}>Ver expediente →</span>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}
