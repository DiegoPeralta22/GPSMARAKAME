const BASE_URL = "http://localhost:3000/medico";

// ==================== DASHBOARD ====================

export const obtenerEstadisticas = async () => {
  const res = await fetch(`${BASE_URL}/estadisticas`);
  return res.json();
};

export const obtenerPacientesRecientes = async () => {
  const res = await fetch(`${BASE_URL}/pacientes-recientes`);
  return res.json();
};

export const obtenerTareasPendientes = async () => {
  const res = await fetch(`${BASE_URL}/tareas-pendientes`);
  return res.json();
};

// ==================== PACIENTES ====================

export const obtenerPacientes = async (filtro = "todos", busqueda = "") => {
  const res = await fetch(`${BASE_URL}/pacientes?filtro=${filtro}&busqueda=${busqueda}`);
  return res.json();
};

export const obtenerExpediente = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/expediente/${id_paciente}`);
  return res.json();
};

// ==================== VALORACIÓN ====================

export const obtenerTodasValoraciones = async () => {
  const res = await fetch(`${BASE_URL}/valoraciones`);
  return res.json();
};

export const obtenerValoracion = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/valoracion/${id_paciente}`);
  return res.json();
};

export const crearValoracion = async (datos) => {
  const res = await fetch(`${BASE_URL}/valoracion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

export const crearValoracionIndependiente = async (datos) => {
  const res = await fetch(`${BASE_URL}/valoracion/independiente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

export const actualizarValoracion = async (id_valoracion, datos) => {
  const res = await fetch(`${BASE_URL}/valoracion/${id_valoracion}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== DIAGNÓSTICO ====================

export const obtenerDiagnosticos = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/diagnostico/${id_paciente}`);
  return res.json();
};

export const crearDiagnostico = async (datos) => {
  const res = await fetch(`${BASE_URL}/diagnostico`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

export const crearSolicitudCambio = async (datos) => {
  const res = await fetch(`${BASE_URL}/diagnostico/solicitud`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== INDICACIONES ====================

export const obtenerIndicaciones = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/indicaciones/${id_paciente}`);
  return res.json();
};

export const crearIndicacion = async (datos) => {
  const res = await fetch(`${BASE_URL}/indicaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== PROTOCOLO DESINTOXICACIÓN ====================

export const obtenerProtocolo = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/protocolo/${id_paciente}`);
  return res.json();
};

export const crearProtocolo = async (datos) => {
  const res = await fetch(`${BASE_URL}/protocolo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== SEGUIMIENTO DESINTOXICACIÓN ====================

export const obtenerSeguimientos = async (id_protocolo) => {
  const res = await fetch(`${BASE_URL}/seguimiento/${id_protocolo}`);
  return res.json();
};

export const crearSeguimiento = async (datos) => {
  const res = await fetch(`${BASE_URL}/seguimiento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== NOTA DE EVOLUCIÓN ====================

export const obtenerNotas = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/evolucion/${id_paciente}`);
  return res.json();
};

export const crearNota = async (datos) => {
  const res = await fetch(`${BASE_URL}/evolucion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== LABORATORIO ====================

export const obtenerSolicitudesLab = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/laboratorio/${id_paciente}`);
  return res.json();
};

export const crearSolicitudLab = async (datos) => {
  const res = await fetch(`${BASE_URL}/laboratorio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== ACTIVIDADES ====================

export const obtenerActividades = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/actividades/${id_paciente}`);
  return res.json();
};

export const crearActividad = async (datos) => {
  const res = await fetch(`${BASE_URL}/actividades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== NOTIFICACIONES ====================

export const obtenerNotificaciones = async (id_usuario) => {
  const res = await fetch(`${BASE_URL}/notificaciones/${id_usuario}`);
  return res.json();
};

export const marcarNotificacionLeida = async (id_notificacion) => {
  const res = await fetch(`${BASE_URL}/notificaciones/${id_notificacion}/leida`, {
    method: "PUT"
  });
  return res.json();
};

export const marcarTodasLeidas = async (id_usuario) => {
  const res = await fetch(`${BASE_URL}/notificaciones/todas/${id_usuario}/leidas`, {
    method: "PUT"
  });
  return res.json();
};