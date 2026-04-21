const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const contratoController = require("../controllers/contrato.controller");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/contratos"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Solo se permiten archivos PDF"));
  }
});

router.post("/upload", upload.single("archivo"), contratoController.subirContrato);
router.get("/:id_paciente", contratoController.obtenerContratos);

module.exports = router;
