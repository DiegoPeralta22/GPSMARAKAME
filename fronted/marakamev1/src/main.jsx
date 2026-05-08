import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import Admisiones from "./pages/admisiones/Admisiones.jsx";
import RegistroPaciente from "./pages/admisiones/RegistroPaciente/RegistroPaciente.jsx";
import EstudioSocioeconomico from "./pages/admisiones/EstudioSocioeconomico/EstudioSocioeconomico.jsx";
import ValidarIngreso from "./pages/admisiones/ValidarIngreso/ValidarIngreso.jsx";
import Director from "./pages/director/Director.jsx";
import Administrador from "./pages/adminstrador/Administrador.jsx";
import Medico from "./pages/medico/Medico.jsx";
import JefeMedico from "./pages/Jefe/JefeMedico.jsx";
import Enfermera from "./pages/enfermera/Enfermera.jsx";
import Nutriologo from "./pages/nutriologo/Nutriologo.jsx";
import Clinico from "./pages/clinico/Clinico.jsx";
import Contratos from "./pages/contratos/Contratos.jsx";
import Preingreso from "./pages/preingreso/Preingreso.jsx";
import Citas from "./pages/citas/Citas.jsx";
import Pacientes from "./pages/admisiones/Pacientes/Pacientes.jsx";
import Expedientes from "./pages/admisiones/Expedientes/Expedientes.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admisiones" element={<Admisiones />} />
      <Route path="/registro" element={<RegistroPaciente />} />
      <Route path="/estudio" element={<EstudioSocioeconomico />} />
      <Route path="/validacion" element={<ValidarIngreso />} />
      <Route path="/director" element={<Director />} />
      <Route path="/administrador" element={<Administrador />} />
      <Route path="/medico" element={<Medico />} />
      <Route path="/jefe-medico" element={<JefeMedico />} />
      <Route path="/enfermera" element={<Enfermera />} />
      <Route path="/nutriologo" element={<Nutriologo />} />
      <Route path="/clinico" element={<Clinico />} />
      <Route path="/contratos" element={<Contratos />} />
      <Route path="/preingreso" element={<Preingreso />} />
      <Route path="/citas" element={<Citas />} />
      <Route path="/pacientes" element={<Pacientes />} />
      <Route path="/expedientes" element={<Expedientes />} />
    </Routes>
  </BrowserRouter>
);