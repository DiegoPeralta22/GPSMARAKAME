import { useState } from "react";
import "./Login.css";
import { login } from "../../services/autService";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await login(correo, password);

      if (data.user.id_rol === 1) {
  window.location.href = "/admin";
} else if (data.user.id_rol === 2) {
  window.location.href = "/admin";
} else if (data.user.id_rol === 3) {
  window.location.href = "/admisiones";
}else {
        alert("Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      alert("Error en el servidor");
    }
  };

  return (
    <div className="login-container">
      
      <div className="login-left">
        <div className="left-content">
          <div className="badge">MARAKAME</div>

          <h1>
            Bienvenido a <br />
            <span>MARAKAME</span>
          </h1>

          <p>
            Clínica especializada en tratamiento residencial para adicciones.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>MARAKAME</h2>
          <p>Centro de rehabilitación</p>

          <label>USUARIO:</label>
          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario"
              onChange={(e) => setCorreo(e.target.value)}
            />
            <span className="icon">👤</span>
          </div>

          <div className="label-row">
            <label>CONTRASEÑA:</label>
            <span className="link">Recuperar contraseña</span>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="icon">🔒</span>
          </div>

          <button onClick={handleLogin}>INICIAR SESIÓN</button>

          <p className="footer-text">
            El usuario y contraseña es de uso personal, queda prohibido usar credenciales ajenas.
          </p>
        </div>

        <div className="bottom-footer">
          <div className="icons">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <p>© 2026 MARAKAME • PRIVACY POLICY • TERMS OF SERVICE</p>
        </div>
      </div>

    </div>
  );
}