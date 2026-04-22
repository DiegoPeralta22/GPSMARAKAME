const express = require('express');
const router = express.Router();
const medico = require('../controllers/medico.controller');

// Dashboard
router.get('/estadisticas', medico.obtenerEstadisticas);
router.get('/pacientes-recientes', medico.obtenerPacientesRecientes);
router.get('/tareas-pendientes', medico.obtenerTareasPendientes);

// Pacientes
router.get('/pacientes', medico.obtenerPacientes);
router.get('/expediente/:id_paciente', medico.obtenerExpediente);

// Valoración
router.get('/valoraciones', medico.obtenerTodasValoraciones);
router.get('/valoracion/:id_paciente', medico.obtenerValoracion);
router.post('/valoracion', medico.crearValoracion);
router.post('/valoracion/independiente', medico.crearValoracionIndependiente);
router.put('/valoracion/:id_valoracion', medico.actualizarValoracion);

// Diagnóstico
router.get('/diagnostico/:id_paciente', medico.obtenerDiagnosticos);
router.post('/diagnostico', medico.crearDiagnostico);
router.post('/diagnostico/solicitud', medico.crearSolicitudCambio);

// Indicaciones
router.get('/indicaciones/:id_paciente', medico.obtenerIndicaciones);
router.post('/indicaciones', medico.crearIndicacion);

// Protocolo Desintoxicación
router.get('/protocolo/:id_paciente', medico.obtenerProtocolo);
router.post('/protocolo', medico.crearProtocolo);

// Nota de Evolución
router.get('/evolucion/:id_paciente', medico.obtenerNotas);
router.post('/evolucion', medico.crearNota);

// Solicitud Laboratorio
router.get('/laboratorio/:id_paciente', medico.obtenerSolicitudesLab);
router.post('/laboratorio', medico.crearSolicitudLab);

// Actividades
router.get('/actividades/:id_paciente', medico.obtenerActividades);
router.post('/actividades', medico.crearActividad);

module.exports = router;