const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

const medicoRoutes = require('./routes/medico.routes');
app.use('/medico', medicoRoutes);

const config = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;"
};

let pool;

sql.connect(config)
    .then(p => { pool = p; console.log("Conectado a SQL Server 🔥"); })
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Backend funcionando'));

// OBTENER USUARIOS
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Usuario');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error en consulta');
    }
});

// CREAR PACIENTE
app.post("/pacientes", async (req, res) => {
    try {
        const { nombre, apellido, edad, estado_civil, direccion, escolaridad, telefono, ocupacion, fecha_nacimiento, genero } = req.body;

        const result = await pool.request()
            .input('nombre', nombre)
            .input('apellido', apellido)
            .input('edad', edad)
            .input('estado_civil', estado_civil)
            .input('direccion', direccion)
            .input('escolaridad', escolaridad)
            .input('telefono', telefono)
            .input('ocupacion', ocupacion)
            .input('fecha_nacimiento', fecha_nacimiento)
            .input('genero', genero)
            .query(`
                INSERT INTO Paciente (nombre, apellido, edad, estado_civil, direccion, escolaridad, telefono, ocupacion, fecha_nacimiento, genero)
                OUTPUT INSERTED.id_paciente
                VALUES (@nombre, @apellido, @edad, @estado_civil, @direccion, @escolaridad, @telefono, @ocupacion, @fecha_nacimiento, @genero)
            `);

        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear paciente");
    }
});

// CREAR CUESTIONARIO
app.post("/cuestionario", async (req, res) => {
    try {
        const { id_paciente } = req.body;

        const result = await pool.request()
            .input('id_paciente', id_paciente)
            .query(`
                INSERT INTO Cuestionario (id_paciente)
                OUTPUT INSERTED.id_cuestionario
                VALUES (@id_paciente)
            `);

        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear cuestionario");
    }
});

// GUARDAR INGRESO
app.post("/ingreso", async (req, res) => {
    const { id_cuestionario, respuestas } = req.body;

    try {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (let r of respuestas) {
                await transaction.request()
                    .input('id_cuestionario', id_cuestionario)
                    .input('id_pregunta', r.id_pregunta)
                    .input('respuesta', r.respuesta)
                    .query(`
                        INSERT INTO RespuestaCuestionario (id_cuestionario, id_pregunta, respuesta)
                        VALUES (@id_cuestionario, @id_pregunta, @respuesta)
                    `);
            }

            await transaction.commit();
            res.send("Ingreso guardado correctamente");

        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar ingreso");
    }
});

// OBTENER PREGUNTAS
app.get("/preguntas", async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Pregunta');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send("Error al obtener preguntas");
    }
});

app.get("/preguntas/:tipo", async (req, res) => {
    try {
        const { tipo } = req.params;
        const result = await pool.request()
            .input('tipo', tipo)
            .query('SELECT * FROM Pregunta WHERE tipo = @tipo');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send("Error");
    }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000 🚀'));