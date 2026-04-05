const express = require("express");
const router = express.Router();
const controller = require("../controllers/cuestionario.controller");

router.post("/", controller.crearCuestionario);

module.exports = router;