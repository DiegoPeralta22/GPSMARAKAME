const express = require("express");
const router = express.Router();
const familiarController = require("../controllers/familiar.controller");

router.post("/", familiarController.crearFamiliar);

module.exports = router;
