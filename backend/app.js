const express = require('express');
const cors = require('cors');
const path = require('path');

const cuestionarioRoutes = require('./routes/cuestionario.routes');
const ingresoRoutes = require('./routes/ingreso.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const familiarRoutes = require('./routes/familiar.routes');
const contratoRoutes = require('./routes/contrato.routes');
const medicoRoutes = require('./routes/medico.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/cuestionario', cuestionarioRoutes);
app.use('/', authRoutes);
app.use('/ingreso', ingresoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/pacientes', pacientesRoutes);
app.use('/familiar', familiarRoutes);
app.use('/contratos', contratoRoutes);
app.use('/medico', medicoRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});