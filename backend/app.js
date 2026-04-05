const express = require('express');
const cors = require('cors');
const cuestionarioRoutes = require('./routes/cuestionario.routes');

const app = express();
const ingresoRoutes = require('./routes/ingreso.routes');
app.use(cors());
app.use(express.json());
const pacientesRoutes = require('./routes/pacientes.routes');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/cuestionario', cuestionarioRoutes);
app.use('/', authRoutes);
app.use('/ingreso', ingresoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/paciente', pacientesRoutes);
app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});