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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const crearValoracionIndependiente = async (datos) => {
  const res = await fetch(`${BASE_URL}/valoracion/independiente`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const actualizarValoracion = async (id_valoracion, datos) => {
  const res = await fetch(`${BASE_URL}/valoracion/${id_valoracion}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const crearSolicitudCambio = async (datos) => {
  const res = await fetch(`${BASE_URL}/diagnostico/solicitud`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== MEDICAMENTOS ====================

export const obtenerMedicamentos = async (tipo = "") => {
  const url = tipo ? `${BASE_URL}/medicamentos?tipo=${tipo}` : `${BASE_URL}/medicamentos`;
  const res = await fetch(url);
  return res.json();
};

export const crearMedicamento = async (datos) => {
  const res = await fetch(`${BASE_URL}/medicamentos`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const actualizarControlado = async (id_medicamento, es_controlado) => {
  const res = await fetch(`${BASE_URL}/medicamentos/${id_medicamento}/controlado`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ es_controlado }),
  });
  return res.json();
};

export const registrarMovimiento = async (datos) => {
  const res = await fetch(`${BASE_URL}/medicamentos/movimiento`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const obtenerMovimientos = async (id_medicamento) => {
  const res = await fetch(`${BASE_URL}/medicamentos/movimientos/${id_medicamento}`);
  return res.json();
};

// ==================== SOLICITUDES DE MEDICAMENTO ====================

export const obtenerSolicitudesMedicamento = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/solicitudes-medicamento?${query}`);
  return res.json();
};

export const crearSolicitudMedicamento = async (datos) => {
  const res = await fetch(`${BASE_URL}/solicitudes-medicamento`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const aprobarSolicitudMedicamento = async (id_solicitud, datos) => {
  const res = await fetch(`${BASE_URL}/solicitudes-medicamento/${id_solicitud}/aprobar`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const verificarIngresoExterno = async (id_solicitud, datos) => {
  const res = await fetch(`${BASE_URL}/solicitudes-medicamento/${id_solicitud}/verificar-externo`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const registrarEntregaEnfermera = async (id_solicitud, datos) => {
  const res = await fetch(`${BASE_URL}/solicitudes-medicamento/${id_solicitud}/entregar`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

export const obtenerMedicamentosPaciente = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/medicamentos-paciente/${id_paciente}`);
  return res.json();
};

// ==================== PERSONAL ====================

export const obtenerPersonal = async () => {
  const res = await fetch(`${BASE_URL}/personal`);
  return res.json();
};

// ==================== SOLICITUDES DE CAMBIO (JEFE) ====================

export const obtenerSolicitudesCambio = async () => {
  const res = await fetch(`${BASE_URL}/solicitudes-cambio`);
  return res.json();
};

export const resolverSolicitud = async (id_solicitud, datos) => {
  const res = await fetch(`${BASE_URL}/solicitudes-cambio/${id_solicitud}/resolver`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};

// ==================== NOTIFICACIONES ====================

export const obtenerNotificaciones = async (id_usuario) => {
  const res = await fetch(`${BASE_URL}/notificaciones/${id_usuario}`);
  return res.json();
};

export const marcarNotificacionLeida = async (id_notificacion) => {
  const res = await fetch(`${BASE_URL}/notificaciones/${id_notificacion}/leida`, { method: "PUT" });
  return res.json();
};

export const marcarTodasLeidas = async (id_usuario) => {
  const res = await fetch(`${BASE_URL}/notificaciones/todas/${id_usuario}/leidas`, { method: "PUT" });
  return res.json();
};

// ==================== NOTAS NUTRICIONALES ====================

export const obtenerNotasNutricionales = async (id_paciente) => {
  const res = await fetch(`${BASE_URL}/nutricion/${id_paciente}`);
  return res.json();
};

export const crearNotaNutricional = async (datos) => {
  const res = await fetch(`${BASE_URL}/nutricion`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos),
  });
  return res.json();
};