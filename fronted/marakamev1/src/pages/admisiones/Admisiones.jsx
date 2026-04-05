import "./Admisiones.css";
import { useNavigate } from "react-router-dom";

export default function Admisiones() {

  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>MARAKAME</h2>
        <p className="user">ADMINISTRADOR: DIEGO</p>

        <ul>
          <li className="active" onClick={() => navigate("/")}>Inicio</li>
          <li onClick={() => navigate("/admisiones")}>Admisiones</li>
          <li onClick={() => navigate("/registro")}>Agregar Paciente</li>
          <li onClick={() => navigate("/historial")}>Historial clínico</li>
          <li onClick={() => navigate("/estudio")}>Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}>Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}>Validación de Ingreso</li>
          <li onClick={() => navigate("/contratos")}>Contratos</li>
          <li onClick={() => navigate("/expedientes")}>Expedientes</li>
        </ul>

        <button 
          className="btn"
          onClick={() => navigate("/registro")}
        >
          + Registro de Paciente
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <h3>Inicio de Admisiones</h3>
          <input placeholder="Buscar..." />
        </div>

        {/* CARDS */}
        <div className="cards">
          <div className="card">Pacientes Totales<br /><strong>142</strong></div>
          <div className="card">Solicitudes Recibidas<br /><strong>142</strong></div>
          <div className="card">Solicitudes Rechazadas<br /><strong>142</strong></div>
        </div>

        {/* SECCIÓN CENTRAL */}
        <div className="content">

          <div className="chart">
            <h4>Admisiones</h4>
            <div className="bars">
              <div className="bar gray"></div>
              <div className="bar green"></div>
              <div className="bar red"></div>
              <div className="bar dark"></div>
            </div>
          </div>

          <div className="side-card">
            <h4>Pendientes</h4>
            <h2>12 Evaluaciones</h2>
            <button onClick={() => navigate("/validacion")}>
              Revisar Ahora
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}