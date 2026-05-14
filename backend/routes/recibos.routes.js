const express = require('express');
const router = express.Router();
const recibos = require('../controllers/recibos.controller');

// ── Requisiciones (van ANTES de /:id_recibo para evitar conflictos) ──
router.get('/requisiciones/pendientes', recibos.obtenerRequisicionesPendientes);
router.get('/requisiciones', recibos.obtenerRequisiciones);
router.put('/requisiciones/:id_requisicion/responder', recibos.responderRequisicion);

// ── Recibos ──
router.get('/pendientes', recibos.obtenerPendientes);
router.get('/', recibos.obtenerTodos);
router.post('/', recibos.crearRecibo);
router.put('/:id_recibo/aprobar', recibos.aprobar);
router.put('/:id_recibo/rechazar', recibos.rechazar);

module.exports = router;