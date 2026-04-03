const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

const app = express();
app.use(cors());
app.use(express.json());

const config = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;"
};

// ruta prueba
app.get('/', (req, res) => {
    res.send('Backend funcionando');
});

// ruta usuarios
app.get('/usuarios', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT * FROM Usuario');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.send('Error en consulta');
    }
});
app.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        await sql.connect(config);

        const result = await sql.query`
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
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});