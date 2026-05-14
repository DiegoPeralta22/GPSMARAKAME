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

// Notificaciones
router.get('/notificaciones/:id_usuario', medico.obtenerNotificaciones);
router.put('/notificaciones/:id_notificacion/leida', medico.marcarLeida);
router.put('/notificaciones/todas/:id_usuario/leidas', medico.marcarTodasLeidas);

// Historia Médica (formulario + firma)
router.get('/historia-medica/:id_paciente', medico.obtenerHistoriaMedica);
router.post('/historia-medica/guardar', medico.guardarHistoriaMedica);
router.post('/historia-medica/firma', uploadHist.single('archivo'), medico.subirFirmaHistoria);

// Medicamentos
router.get('/medicamentos', medico.obtenerMedicamentos);
router.post('/medicamentos', medico.crearMedicamento);
router.put('/medicamentos/:id_medicamento', medico.actualizarMedicamento);
router.put('/medicamentos/:id_medicamento/controlado', medico.actualizarControlado);
router.post('/medicamentos/movimiento', medico.registrarMovimiento);
router.get('/medicamentos/movimientos/:id_medicamento', medico.obtenerMovimientos);

// Solicitudes de Medicamento
router.get('/solicitudes-medicamento', medico.obtenerSolicitudesMedicamento);
router.post('/solicitudes-medicamento', medico.crearSolicitudMedicamento);
router.put('/solicitudes-medicamento/:id_solicitud/aprobar', medico.aprobarSolicitudMedicamento);
router.put('/solicitudes-medicamento/:id_solicitud/verificar-externo', medico.verificarIngresoExterno);
router.put('/solicitudes-medicamento/:id_solicitud/entregar', medico.registrarEntregaEnfermera);
router.get('/medicamentos-paciente/:id_paciente', medico.obtenerMedicamentosPaciente);

// Personal
router.get('/personal', medico.obtenerPersonal);

// Solicitudes de cambio (jefe)
router.get('/solicitudes-cambio', medico.obtenerSolicitudesCambio);
router.put('/solicitudes-cambio/:id_solicitud/resolver', medico.resolverSolicitud);

// Notas Nutricionales
router.get('/nutricion/:id_paciente', medico.obtenerNotasNutricionales);
router.post('/nutricion', medico.crearNotaNutricional);

// Área Clínica
router.get('/clinico/pacientes', medico.obtenerPacientesClinico);
router.get('/clinico/notas/:id_paciente', medico.obtenerNotasClinicas);
router.post('/clinico/notas', medico.crearNotaClinica);

// Administración Medicamento (Enfermera)
router.get('/indicaciones-enfermera', medico.obtenerIndicacionesEnfermera);
router.get('/administraciones/:id_indicacion_med', medico.obtenerAdministraciones);
router.post('/administraciones', medico.registrarAdministracion);

// Requisiciones (Jefe Médico)
router.get('/requisiciones', medico.obtenerRequisiciones);
router.post('/requisiciones', medico.crearRequisicion);

module.exports = router;