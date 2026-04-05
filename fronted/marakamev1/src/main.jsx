import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login.jsx";
import Admisiones from "./pages/admisiones/Admisiones.jsx";
import RegistroPaciente from "./pages/admisiones/RegistroPaciente/RegistroPaciente.jsx";
import Admin from "./pages/adminstrador/admin.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admisiones" element={<Admisiones />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/registro" element={<RegistroPaciente />} />
    </Routes>
  </BrowserRouter>
);