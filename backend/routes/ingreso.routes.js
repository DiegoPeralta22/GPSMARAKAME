const express = require("express");
const router = express.Router();
const controller = require("../controllers/ingreso.controller");

router.post("/", controller.guardarIngreso);

module.exports = router;