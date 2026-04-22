import { useState, useEffect } from "react";
import { obtenerPacientes } from "../../services/medicoService";

const styles = `
  .pac-container { padding: 0; }
  .pac-header { margin-bottom: 24px; }
  .pac-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .pac-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .pac-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; background: #fff; padding: 16px; border-radius: 10px; border: 1px solid #f0f0f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .pac-search-wrap { flex: 1; position: relative; }
  .pac-search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; }
  .pac-search { width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; font-family: 'Inter', sans-serif; }
  .pac-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .pac-filters { display: flex; gap: 8px; }
  .pac-filter-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; transition: all 0.15s; }
  .pac-filter-btn.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  .pac-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .pac-card { background: #fff; border-radius: 10px; padding: 20px; border: 1px solid #f0f0f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.15s; }
  .pac-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .pac-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .pac-card-name { font-size: 15px; font-weight: 700; color: #111827; }
  .pac-card-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .pac-estado-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .pac-estado-badge.desintoxicacion { background: #fff7ed; color: #f97316; }
  .pac-estado-badge.tratamiento { background: #f0fdf4; color: #16a34a; }
  .pac-estado-badge.valoracion { background: #eff6ff; color: #3b82f6; }
  .pac-alerta { display: flex; align-items: center; gap: 6px; background: #fff1f2; border-radius: 6px; padding: 6px 10px; margin-bottom: 12px; font-size: 12px; color: #ef4444; font-weight: 500; }
  .pac-datos { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; }
  .pac-dato-label { font-size: 11px; color: #9ca3af; }
  .pac-dato-value { font-size: 12px; color: #374151; font-weight: 500; }
  .pac-btn { width: 100%; padding: 9px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s; }
  .pac-btn:hover { background: #2563eb; }
  .pac-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; grid-column: 1/-1; }
  .pac-loading { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; grid-column: 1/-1; }
`;

const FILTROS = ["todos", "desintoxicacion", "tratamiento", "valoracion"];

export default function Pacientes({ onVerExpediente }) {
  const [pacientes, setPacientes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPacientes();
  }, [filtro, busqueda]);

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      const data = await obtenerPacientes(filtro, busqueda);
      setPacientes(data);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    } finally {
      setCargando(false);
    }
  };

  const getBadgeClass = (estado) => {
    if (!estado) return "valoracion";
    if (estado.toLowerCase().includes("desintox")) return "desintoxicacion";
    if (estado.toLowerCase().includes("tratamiento")) return "tratamiento";
    return "valoracion";
  };

  const getEstadoLabel = (estado) => {
    if (!estado) return "Valoración";
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="pac-container">
        <div className="pac-header">
          <h1 className="pac-title">Lista de Pacientes</h1>
          <p className="pac-subtitle">Gestión y seguimiento de pacientes</p>
        </div>

        <div className="pac-toolbar">
          <div className="pac-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="pac-search"
              placeholder="Buscar por nombre o expediente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="pac-filters">
            {FILTROS.map(f => (
              <button
                key={f}
                className={`pac-filter-btn ${filtro === f ? "active" : ""}`}
                onClick={() => setFiltro(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="pac-grid">
          {cargando ? (
            <div className="pac-loading">Cargando pacientes...</div>
          ) : pacientes.length === 0 ? (
            <div className="pac-empty">No hay pacientes registrados aún</div>
          ) : (
            pacientes.map((p, i) => (
              <div className="pac-card" key={i}>
                <div className="pac-card-header">
                  <div>
                    <div className="pac-card-name">{p.nombre} {p.apellido}</div>
                    <div className="pac-card-info">{p.edad} años • {p.genero}</div>
                  </div>
                  <span className={`pac-estado-badge ${getBadgeClass(p.estado)}`}>
                    {getEstadoLabel(p.estado)}
                  </span>
                </div>

                <div className="pac-datos">
                  <div>
                    <div className="pac-dato-label">Expediente:</div>
                    <div className="pac-dato-value">{String(p.id_expediente || "—").padStart(3, "0")}</div>
                  </div>
                  <div>
                    <div className="pac-dato-label">Sustancia:</div>
                    <div className="pac-dato-value">{p.sustancia_principal || "—"}</div>
                  </div>
                  <div>
                    <div className="pac-dato-label">Días de tratamiento:</div>
                    <div className="pac-dato-value">{p.dias_tratamiento ?? 0} días</div>
                  </div>
                  <div>
                    <div className="pac-dato-label">Última visita:</div>
                    <div className="pac-dato-value">{p.ultima_visita ? new Date(p.ultima_visita).toLocaleDateString() : "—"}</div>
                  </div>
                </div>

                <button className="pac-btn" onClick={() => onVerExpediente(p.id_paciente)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  Ver Expediente
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}