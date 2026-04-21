import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import Admisiones from "./pages/admisiones/Admisiones.jsx";
import RegistroPaciente from "./pages/admisiones/RegistroPaciente/RegistroPaciente.jsx";
import Director from "./pages/director/Director.jsx";
import Administrador from "./pages/adminstrador/Administrador.jsx";
import Medico from "./pages/medico/Medico.jsx";
import Clinico from "./pages/clinico/Clinico.jsx";
import Contratos from "./pages/contratos/Contratos.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admisiones" element={<Admisiones />} />
      <Route path="/registro" element={<RegistroPaciente />} />
      <Route path="/director" element={<Director />} />
      <Route path="/administrador" element={<Administrador />} />
      <Route path="/medico" element={<Medico />} />
      <Route path="/clinico" element={<Clinico />} />
      <Route path="/contratos" element={<Contratos />} />
    </Routes>
  </BrowserRouter>
);