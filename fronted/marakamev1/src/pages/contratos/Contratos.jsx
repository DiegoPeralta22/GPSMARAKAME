import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Contratos.css";

const TIPOS = [
  { key: "nicotina", label: "Protocolo Libre de Nicotina", desc: "Compromiso de desintoxicación tabáquica" },
  { key: "no_suicidio", label: "Contrato de No Suicidio", desc: "Pacto terapéutico de preservación de vida" },
];

export default function Contratos() {
  const navigate = useNavigate();
  const [seleccionado, setSeleccionado] = useState("nicotina");
  const [archivos, setArchivos] = useState({ nicotina: null, no_suicidio: null });
  const [previews, setPreviews] = useState({ nicotina: null, no_suicidio: null });
  const [firmado, setFirmado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [paciente, setPaciente] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const busquedaTimeout = useRef(null);

  useEffect(() => {
    if (!busqueda.trim()) { setResultados([]); return; }
    clearTimeout(busquedaTimeout.current);
    busquedaTimeout.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(`http://localhost:3000/pacientes/buscar?nombre=${encodeURIComponent(busqueda)}`);
        const data = await res.json();
        setResultados(data);
      } catch { setResultados([]); }
      finally { setBuscando(false); }
    }, 350);
  }, [busqueda]);

  const seleccionarPaciente = (p) => {
    setPaciente(p);
    setBusqueda(`${p.nombre} ${p.apellido}`);
    setResultados([]);
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
    if (!firmado) return alert("Debes aceptar los términos antes de guardar");

    setGuardando(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("tipo", seleccionado);
      if (!paciente) return alert("Selecciona un paciente primero");
      formData.append("id_paciente", paciente.id_paciente);

      const res = await fetch("http://localhost:3000/contratos/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Contrato guardado correctamente");
      } else {
        alert("Error al guardar el contrato");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  const preview = previews[seleccionado];
  const tipoActual = TIPOS.find(t => t.key === seleccionado);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>MARAKAME</h2>
        <p>GESTIÓN LEGAL</p>
        <ul>
          <li onClick={() => navigate("/admisiones")}>Admisiones</li>
          <li onClick={() => navigate("/registro")}>Agregar Paciente</li>
          <li onClick={() => navigate("/historial")}>Historial clínico</li>
          <li onClick={() => navigate("/estudio")}>Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}>Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}>Validación de Ingreso</li>
          <li className="active">Contratos</li>
          <li onClick={() => navigate("/expedientes")}>Expedientes</li>
        </ul>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h2>Formalización de Compromiso</h2>
            <span className="subtitulo">Gestión de documentos contractuales</span>
          </div>
          <button className="btn-save" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar Contrato"}
          </button>
        </div>

        <div className="contratos-body">
          {/* PANEL IZQUIERDO */}
          <div className="panel-izq">
            <div className="card busqueda-card">
              <h4>PACIENTE</h4>
              <div className="busqueda-wrap">
                <input
                  className="input-busqueda"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={e => { setBusqueda(e.target.value); setPaciente(null); }}
                />
                {buscando && <span className="buscando-txt">Buscando...</span>}
                {resultados.length > 0 && (
                  <ul className="lista-resultados">
                    {resultados.map(p => (
                      <li key={p.id_paciente} onClick={() => seleccionarPaciente(p)}>
                        <strong>{p.nombre} {p.apellido}</strong>
                        <span>{p.edad} años</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {paciente && (
                <div className="paciente-seleccionado">
                  ✓ {paciente.nombre} {paciente.apellido}
                </div>
              )}
            </div>

          <div className="card">
              <h4>SELECCIONAR DOCUMENTO</h4>
              {TIPOS.map(t => (
                <div
                  key={t.key}
                  className={`doc-card ${seleccionado === t.key ? "doc-card-active" : ""}`}
                  onClick={() => setSeleccionado(t.key)}
                >
                  <div className="doc-card-info">
                    <strong>{t.label}</strong>
                    <span>{t.desc}</span>
                  </div>
                  {archivos[t.key] && <span className="check">✓</span>}
                </div>
              ))}
            </div>

            <div className="card estado-card">
              <h4>ESTADO</h4>
              <div className={`badge ${archivos[seleccionado] ? "badge-ok" : "badge-pendiente"}`}>
                {archivos[seleccionado] ? "DOCUMENTO CARGADO" : "SIN DOCUMENTO"}
              </div>
            </div>
          </div>

          {/* PANEL DERECHO */}
          <div className="panel-der">
            <div className="card upload-area">
              <h3>{tipoActual.label}</h3>
              <p className="doc-desc">{tipoActual.desc}</p>

              {preview ? (
                <iframe
                  src={preview}
                  title="Vista previa"
                  className="pdf-preview"
                />
              ) : (
                <label className="drop-zone">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleArchivo}
                    hidden
                  />
                  <div className="drop-icon">📄</div>
                  <p>Haz clic para subir el PDF</p>
                  <span>Solo archivos .pdf</span>
                </label>
              )}

              {preview && (
                <label className="btn-replace">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleArchivo}
                    hidden
                  />
                  Reemplazar documento
                </label>
              )}

              <div className="firma-area">
                <label className="check-firma">
                  <input
                    type="checkbox"
                    checked={firmado}
                    onChange={e => setFirmado(e.target.checked)}
                  />
                  Acepto los términos y condiciones del contrato terapéutico y me comprometo a cumplirlos.
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
