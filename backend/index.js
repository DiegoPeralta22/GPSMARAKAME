const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 CONFIGURACIÓN SQL SERVER
const config = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;"
};

// 🔥 CONEXIÓN GLOBAL
let pool;

sql.connect(config)
    .then(p => {
        pool = p;
        console.log("Conectado a SQL Server 🔥");
    })
    .catch(err => console.log(err));


// 🔹 RUTA PRUEBA
app.get('/', (req, res) => {
    res.send('Backend funcionando');
});


// 🔹 OBTENER USUARIOS
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Usuario');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error en consulta');
    }
});


// 🔐 LOGIN
app.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).send('Faltan datos');
    }

    try {
        const result = await pool.request().query`
            SELECT id_usuario, nombre, correo, id_rol
            FROM Usuario 
            WHERE correo = ${correo} 
            AND password = ${password}
        `;

        if (result.recordset.length > 0) {
            res.json({
                success: true,
                user: result.recordset[0]
            });
        } else {
            res.json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

    } catch (err) {
        console.log(err);
        res.status(500).send('Error en login');
    }
});


// 🔥 CREAR PACIENTE
app.post("/paciente", async (req, res) => {
    try {
        const { nombre, telefono } = req.body;

        if (!nombre || !telefono) {
            return res.status(400).send("Faltan datos");
        }

        const result = await pool.request().query`
            INSERT INTO Paciente (nombre, telefono)
            OUTPUT INSERTED.id_paciente
            VALUES (${nombre}, ${telefono})
        `;

        res.json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear paciente");
    }
});


// 🔥 CREAR CUESTIONARIO
app.post("/cuestionario", async (req, res) => {
    try {
        const { id_paciente } = req.body;

        if (!id_paciente) {
            return res.status(400).send("Falta id_paciente");
        }

        const result = await pool.request().query`
            INSERT INTO Cuestionario (id_paciente)
            OUTPUT INSERTED.id_cuestionario
            VALUES (${id_paciente})
        `;

        res.json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear cuestionario");
    }
});


// 🔥 GUARDAR RESPUESTA
app.post("/respuesta", async (req, res) => {
    try {
        const { id_cuestionario, id_pregunta, respuesta } = req.body;

        if (!id_cuestionario || !id_pregunta) {
            return res.status(400).send("Datos incompletos");
        }

        await pool.request().query`
            INSERT INTO RespuestaCuestionario
            (id_cuestionario, id_pregunta, respuesta)
            VALUES (${id_cuestionario}, ${id_pregunta}, ${respuesta})
        `;

        res.send("OK");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar respuesta");
    }
});


// 🔥 OBTENER TODAS LAS PREGUNTAS
app.get("/preguntas", async (req, res) => {
    try {
        const result = await pool.request().query`
            SELECT * FROM Pregunta
        `;
        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener preguntas");
    }
});


// 🔥 OBTENER PREGUNTAS POR TIPO (PRO)
app.get("/preguntas/:tipo", async (req, res) => {
    try {
        const { tipo } = req.params;

        const result = await pool.request().query`
            SELECT * FROM Pregunta WHERE tipo = ${tipo}
        `;

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

app.post("/paciente", async (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    const result = await pool.request().query`
      INSERT INTO Paciente (nombre, telefono)
      OUTPUT INSERTED.id_paciente
      VALUES (${nombre}, ${telefono})
    `;

    res.json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// 🔥 SERVIDOR
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000 🚀');
});