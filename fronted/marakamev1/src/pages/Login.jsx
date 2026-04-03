import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-container">
      
      {/* LADO IZQUIERDO */}
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

      {/* LADO DERECHO */}
      <div className="login-right">
  <div className="login-box">
    
    <h2>MARAKAME</h2>
    <p>Centro de rehabilitación</p>

    {/* USUARIO */}
    <label>USUARIO:</label>
    <div className="input-group">
      <input
        type="text"
        placeholder="Usuario"
        onChange={(e) => setCorreo(e.target.value)}
      />
      <span className="icon">👤</span>
    </div>

    {/* CONTRASEÑA */}
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

  {/* FOOTER ABAJO */}
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