const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const medico = require('../controllers/medico.controller');

const historiasDir = path.join(__dirname, '../uploads/historias');
if (!fs.existsSync(historiasDir)) fs.mkdirSync(historiasDir, { recursive: true });

const storageHist = multer.diskStorage({
  destination: (req, file, cb) => cb(null, historiasDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `historia_${Date.now()}${ext}`);
  }
});

const uploadHist = multer({
  storage: storageHist,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Solo se permiten PDF, JPG o PNG'));
  }
});

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

// Seguimiento Desintoxicación
router.get('/seguimiento/:id_protocolo', medico.obtenerSeguimientos);
router.post('/seguimiento', medico.crearSeguimiento);

// Nota de Evolución
router.get('/evolucion/:id_paciente', medico.obtenerNotas);
router.post('/evolucion', medico.crearNota);

// Solicitud Laboratorio
router.get('/laboratorio/:id_paciente', medico.obtenerSolicitudesLab);
router.post('/laboratorio', medico.crearSolicitudLab);

// Actividades
router.get('/actividades/:id_paciente', medico.obtenerActividades);
router.post('/actividades', medico.crearActividad);

// Valoración de Ingreso
router.get('/pendientes-valoracion', medico.obtenerPendientesValoracion);
router.post('/valorar-ingreso', medico.valorarIngreso);

// Notificaciones
router.get('/notificaciones/:id_usuario', medico.obtenerNotificaciones);
router.put('/notificaciones/:id_notificacion/leida', medico.marcarLeida);
router.put('/notificaciones/todas/:id_usuario/leidas', medico.marcarTodasLeidas);

// Historia Médica (formulario + firma)
router.get('/historia-medica/:id_paciente', medico.obtenerHistoriaMedica);
router.post('/historia-medica/guardar', medico.guardarHistoriaMedica);
router.post('/historia-medica/firma', uploadHist.single('archivo'), medico.subirFirmaHistoria);

module.exports = router;