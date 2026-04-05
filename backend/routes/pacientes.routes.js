const express = require("express");
const router = express.Router();
const pacienteController = require("../controllers/paciente.controller");

router.post("/", pacienteController.crearPaciente);

module.exports = router;