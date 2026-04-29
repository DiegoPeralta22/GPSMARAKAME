import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../admisiones/Admisiones.css";

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

export default function Preingreso() {
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

  // Subir documento
  const initArchivos = () => Object.fromEntries(TIPOS_DOC.map(t => [t.key, null]));
  const [seleccionado, setSeleccionado] = useState("contrato_terapeutico");
  const [archivos, setArchivos]         = useState(initArchivos());
  const [previews, setPreviews]         = useState(initArchivos());
  const [aceptado, setAceptado]         = useState(false);
  const [guardando, setGuardando]       = useState(false);
  const [docsActuales, setDocsActuales] = useState([]);

  useEffect(() => { cargar(); }, []);

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

  const abrirDocs = async (p) => {
    setPacienteSeleccionado(p);
    setArchivos(initArchivos());
    setPreviews(initArchivos());
    setAceptado(false);
    setSeleccionado("contrato_terapeutico");
    setVista("docs");
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
        <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
        <li className="active"><IcoDoc />Preingreso</li>
        <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
      </ul>
    </div>
  );

  // ─── VISTA LISTA ────────────────────────────────────────
  if (vista === "lista") {
    return (
      <div className="dashboard">
        {sidebar}
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
                        <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>{p.id_paciente}</td>
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
      </div>
    );
  }

  // ─── VISTA DOCS ────────────────────────────────────────
  return (
    <div className="dashboard">
      {sidebar}
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

            {/* Documentos existentes */}
            {docsActuales.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 10 }}>Documentos guardados</div>
                {docsActuales.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < docsActuales.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{labelTipo(d.tipo)}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(d.fecha).toLocaleDateString("es-MX")}</div>
                    </div>
                    {badge("#e6f4f3", "#0b5d5b", "✓")}
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
              <iframe src={preview} title="Vista previa" style={{ width: "100%", height: 420, border: "1px solid #e5e7eb", borderRadius: 8 }} />
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

            {preview && (
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", width: "fit-content" }}>
                <input type="file" accept="application/pdf" onChange={handleArchivo} hidden />
                Reemplazar documento
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
      </div>
    </div>
  );
}
