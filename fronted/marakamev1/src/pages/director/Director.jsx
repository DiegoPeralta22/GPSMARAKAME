import { useNavigate } from "react-router-dom";
import "./Director.css";

export default function Director() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="dir-layout">

      <aside className="dir-sidebar">
        <div>
          <h2>MARAKAME</h2>
          <p>DIRECCIÓN</p>
          <ul>
            <li className="active">Inicio</li>
            <li onClick={() => navigate("/admisiones")}>Admisiones</li>
            <li onClick={() => navigate("/registro")}>Preregistro</li>
            <li onClick={() => navigate("/historial")}>Historial clínico</li>
            <li onClick={() => navigate("/estudio")}>Estudio Socioeconómico</li>
            <li onClick={() => navigate("/citas")}>Agenda de Citas</li>
            <li onClick={() => navigate("/validacion")}>Validación de Ingreso</li>
            <li onClick={() => navigate("/preingreso")}>Preingreso</li>
            <li onClick={() => navigate("/expedientes")}>Expedientes</li>
          </ul>
        </div>
        <button className="dir-btn-logout" onClick={handleLogout}>Cerrar Sesión</button>
      </aside>

      <main className="dir-main">
        <div className="dir-topbar">
          <div>
            <h2>Panel de Dirección</h2>
            <span className="dir-subtitulo">Bienvenido, {usuario?.nombre}</span>
          </div>
        </div>

        <div className="dir-content">
          <div className="dir-cards-grid">
            <div className="dir-stat-card">
              <span className="dir-stat-label">Pacientes Totales</span>
              <span className="dir-stat-num">—</span>
            </div>
            <div className="dir-stat-card">
              <span className="dir-stat-label">Admisiones del Mes</span>
              <span className="dir-stat-num">—</span>
            </div>
            <div className="dir-stat-card">
              <span className="dir-stat-label">Contratos Activos</span>
              <span className="dir-stat-num">—</span>
            </div>
            <div className="dir-stat-card">
              <span className="dir-stat-label">Citas Pendientes</span>
              <span className="dir-stat-num">—</span>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
