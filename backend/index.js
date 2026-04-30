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

const pacientesRoutes = require('./routes/pacientes.routes');
app.use('/pacientes', pacientesRoutes);

const contratoRoutes = require('./routes/contrato.routes');
app.use('/contratos', contratoRoutes);

const config = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;"
};

let pool;

sql.connect(config)
    .then(p => {
        pool = p;
        console.log("Conectado a SQL Server 🔥");
        pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RecepcionPaciente' AND xtype='U')
            CREATE TABLE RecepcionPaciente (
                id_recepcion INT PRIMARY KEY IDENTITY,
                id_paciente INT NOT NULL,
                id_usuario INT,
                fecha DATETIME DEFAULT GETDATE(),
                signos_vitales NVARCHAR(MAX),
                es_estable BIT,
                habitacion NVARCHAR(100),
                valoracion_psiquiatrica NVARCHAR(MAX),
                valoracion_nutricional NVARCHAR(MAX),
                valoracion_salud NVARCHAR(MAX),
                plan_tratamiento NVARCHAR(MAX),
                observaciones NVARCHAR(500)
            )
        `).catch(e => console.error("Error creando RecepcionPaciente:", e));
    })
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

// ACTUALIZAR PACIENTE
app.put("/pacientes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, apellido, edad, estado_civil, direccion, escolaridad, telefono, ocupacion, fecha_nacimiento, genero, orientacion_sexual, grupos_vulnerables } = req.body;
    try {
        try {
            await pool.request()
                .input('id', sql.Int, id)
                .input('nombre', nombre || null)
                .input('apellido', apellido || null)
                .input('edad', edad || null)
                .input('estado_civil', estado_civil || null)
                .input('direccion', direccion || null)
                .input('escolaridad', escolaridad || null)
                .input('telefono', telefono || null)
                .input('ocupacion', ocupacion || null)
                .input('fecha_nacimiento', fecha_nacimiento || null)
                .input('genero', genero || null)
                .input('orientacion_sexual', orientacion_sexual || null)
                .input('grupos_vulnerables', grupos_vulnerables || null)
                .query(`UPDATE Paciente SET nombre=@nombre, apellido=@apellido, edad=@edad, estado_civil=@estado_civil, direccion=@direccion, escolaridad=@escolaridad, telefono=@telefono, ocupacion=@ocupacion, fecha_nacimiento=@fecha_nacimiento, genero=@genero, orientacion_sexual=@orientacion_sexual, grupos_vulnerables=@grupos_vulnerables WHERE id_paciente=@id`);
        } catch (e) {
            await pool.request()
                .input('id', sql.Int, id)
                .input('nombre', nombre || null)
                .input('apellido', apellido || null)
                .input('edad', edad || null)
                .input('estado_civil', estado_civil || null)
                .input('direccion', direccion || null)
                .input('escolaridad', escolaridad || null)
                .input('telefono', telefono || null)
                .input('ocupacion', ocupacion || null)
                .input('fecha_nacimiento', fecha_nacimiento || null)
                .input('genero', genero || null)
                .query(`UPDATE Paciente SET nombre=@nombre, apellido=@apellido, edad=@edad, estado_civil=@estado_civil, direccion=@direccion, escolaridad=@escolaridad, telefono=@telefono, ocupacion=@ocupacion, fecha_nacimiento=@fecha_nacimiento, genero=@genero WHERE id_paciente=@id`);
        }
        res.send("ok");
    } catch(err) {
        console.error(err);
        res.status(500).send("Error al actualizar paciente");
    }
});

// OBTENER RESPUESTAS DEL CUESTIONARIO DE UN PACIENTE
app.get("/cuestionario-respuestas/:id_paciente", async (req, res) => {
    const id = parseInt(req.params.id_paciente);
    try {
        const cRes = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente = @id ORDER BY id_cuestionario DESC`);
        const id_cuestionario = cRes.recordset[0]?.id_cuestionario || null;
        if (!id_cuestionario) return res.json({ id_cuestionario: null, respuestas: [] });
        const rRes = await pool.request()
            .input('id_c', sql.Int, id_cuestionario)
            .query(`SELECT id_pregunta, respuesta FROM RespuestaCuestionario WHERE id_cuestionario = @id_c ORDER BY id_pregunta`);
        res.json({ id_cuestionario, respuestas: rRes.recordset });
    } catch(err) {
        console.error(err);
        res.status(500).send("Error");
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
            await transaction.request()
                .input('id_cuestionario', id_cuestionario)
                .query(`DELETE FROM RespuestaCuestionario WHERE id_cuestionario = @id_cuestionario`);
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
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }

        // Notificar a todos los médicos (fuera del try de la transacción)
        try {
            const medicos = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol = 4`);
            for (const m of medicos.recordset) {
                await pool.request()
                    .input('id_usuario_destino', m.id_usuario)
                    .input('id_referencia', id_cuestionario)
                    .query(`
                        INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia)
                        VALUES (@id_usuario_destino, 'nuevo_ingreso', 'Nuevo paciente registrado en admisiones requiere valoración médica.', @id_referencia, 'Cuestionario')
                    `);
            }
        } catch (notifErr) {
            console.error("Error al notificar médicos:", notifErr);
        }

        res.send("Ingreso guardado correctamente");

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

// =============================================
// ESTUDIO SOCIOECONÓMICO
// =============================================
app.post("/estudio", async (req, res) => {
    const { id_paciente, id_usuario, datos_json, ingreso_mensual, egreso_mensual, tipo_vivienda, nivel_economico, observaciones } = req.body;
    try {
        const folio = `MRK-${new Date().getFullYear()}-${String(id_paciente).padStart(4,'0')}`;
        const existing = await pool.request()
            .input('id_paciente', id_paciente)
            .query('SELECT id_estudio FROM EstudioSocioeconomico WHERE id_paciente = @id_paciente');

        if (existing.recordset.length > 0) {
            await pool.request()
                .input('id_estudio', existing.recordset[0].id_estudio)
                .input('datos_json', datos_json || null)
                .input('ingreso_mensual', ingreso_mensual || null)
                .input('egreso_mensual', egreso_mensual || null)
                .input('tipo_vivienda', tipo_vivienda || null)
                .input('nivel_economico', nivel_economico || null)
                .input('observaciones', observaciones || null)
                .input('status', req.body.status || 'borrador')
                .query(`UPDATE EstudioSocioeconomico SET datos_json=@datos_json, ingreso_mensual=@ingreso_mensual, egreso_mensual=@egreso_mensual, tipo_vivienda=@tipo_vivienda, nivel_economico=@nivel_economico, observaciones=@observaciones, status=@status WHERE id_estudio=@id_estudio`);
            res.json({ id_estudio: existing.recordset[0].id_estudio, folio });
        } else {
            const result = await pool.request()
                .input('id_paciente', id_paciente)
                .input('id_usuario', id_usuario || null)
                .input('folio', folio)
                .input('datos_json', datos_json || null)
                .input('ingreso_mensual', ingreso_mensual || null)
                .input('egreso_mensual', egreso_mensual || null)
                .input('tipo_vivienda', tipo_vivienda || null)
                .input('nivel_economico', nivel_economico || null)
                .input('observaciones', observaciones || null)
                .input('status', req.body.status || 'borrador')
                .query(`INSERT INTO EstudioSocioeconomico (id_paciente,id_usuario,folio,datos_json,ingreso_mensual,egreso_mensual,tipo_vivienda,nivel_economico,observaciones,status) OUTPUT INSERTED.id_estudio VALUES (@id_paciente,@id_usuario,@folio,@datos_json,@ingreso_mensual,@egreso_mensual,@tipo_vivienda,@nivel_economico,@observaciones,@status)`);
            res.json({ id_estudio: result.recordset[0].id_estudio, folio });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar estudio socioeconómico");
    }
});

app.get("/estudio/:id_paciente", async (req, res) => {
    try {
        const result = await pool.request()
            .input('id_paciente', req.params.id_paciente)
            .query('SELECT * FROM EstudioSocioeconomico WHERE id_paciente = @id_paciente');
        res.json(result.recordset[0] || null);
    } catch (err) {
        res.status(500).send("Error al obtener estudio");
    }
});

// =============================================
// VALIDAR INGRESO - STATUS COMPLETO DEL PACIENTE
// =============================================
app.get("/validar-ingreso/:id_paciente", async (req, res) => {
    const id = parseInt(req.params.id_paciente);
    if (isNaN(id)) return res.status(400).send("ID inválido");
    try {
        const [paciente, cuestionario, valoracion, estudio, familiar] = await Promise.all([
            pool.request().input('id', sql.Int, id).query(`SELECT * FROM Paciente WHERE id_paciente = @id`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 c.id_cuestionario, COUNT(CASE WHEN LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) as total_respuestas, MAX(CASE WHEN r.id_pregunta = 3 THEN r.respuesta END) as fuente_ingreso FROM Cuestionario c LEFT JOIN RespuestaCuestionario r ON c.id_cuestionario = r.id_cuestionario WHERE c.id_paciente = @id GROUP BY c.id_cuestionario`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 v.*, u.nombre as nombre_medico FROM ValoracionMedica v LEFT JOIN Usuario u ON v.id_usuario = u.id_usuario WHERE v.id_paciente = @id ORDER BY v.fecha_valoracion DESC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM EstudioSocioeconomico WHERE id_paciente = @id ORDER BY id_estudio DESC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM Familiar WHERE id_paciente = @id ORDER BY id_familiar ASC`),
        ]);

        let decision = null;
        try {
            const decRes = await pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM DecisionIngreso WHERE id_paciente = @id ORDER BY fecha DESC`);
            decision = decRes.recordset[0] || null;
        } catch (e) { /* tabla aún no existe */ }

        const val = valoracion.recordset[0] || null;
        if (val && val.apto !== null && val.apto !== undefined) val.apto = Number(val.apto);

        res.json({
            paciente: paciente.recordset[0] || null,
            cuestionario: cuestionario.recordset[0] || null,
            valoracion: val,
            estudio: estudio.recordset[0] || null,
            decision,
            familiar: familiar.recordset[0] || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener estado del paciente");
    }
});

app.post("/validar-ingreso", async (req, res) => {
    const { id_paciente, id_usuario, decision, motivo_rechazo } = req.body;
    try {
        const result = await pool.request()
            .input('id_paciente', id_paciente)
            .input('id_usuario', id_usuario || null)
            .input('decision', decision)
            .input('motivo_rechazo', motivo_rechazo || null)
            .query(`INSERT INTO DecisionIngreso (id_paciente, id_usuario, decision, motivo_rechazo) OUTPUT INSERTED.id_decision VALUES (@id_paciente, @id_usuario, @decision, @motivo_rechazo)`);

        if (decision === 'aprobado') {
            const existing = await pool.request().input('id', id_paciente).query(`SELECT id_expediente FROM Expediente WHERE id_paciente = @id`);
            if (existing.recordset.length === 0) {
                await pool.request().input('id_paciente', id_paciente).query(`INSERT INTO Expediente (id_paciente, estado) VALUES (@id_paciente, 'admitido')`);
            }
        }

        // Si se solicita nueva valoración, resetear el campo apto para que el médico re-evalúe
        if (decision === 'requiere_valoracion') {
            try {
                await pool.request().input('id', id_paciente).query(
                    `UPDATE ValoracionMedica SET apto = NULL WHERE id_valoracion = (SELECT TOP 1 id_valoracion FROM ValoracionMedica WHERE id_paciente = @id ORDER BY fecha_valoracion DESC)`
                );
            } catch (e) { console.error("Error reseteando valoracion:", e); }
        }

        // Notificar clínico si es aprobado
        if (decision === 'aprobado') {
            try {
                const clinicos = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol = 5`);
                for (const c of clinicos.recordset) {
                    await pool.request()
                        .input('id_usuario_destino', c.id_usuario)
                        .input('id_referencia', id_paciente)
                        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@id_usuario_destino, 'ingreso_aprobado', 'Paciente aprobado para ingreso. Acuda a admisiones para trasladarlo.', @id_referencia, 'Paciente')`);
                }
            } catch (e) { console.error("Error notificando clínico:", e); }
        }

        res.json({ id_decision: result.recordset[0].id_decision });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar decisión");
    }
});

// PACIENTES PARA ADMISIONES (subqueries para evitar duplicados por JOINs múltiples)
app.get("/pacientes-admision", async (req, res) => {
    const intentos = [
        // Con todo: subqueries para cuestionario, estudio, decision (sin duplicados)
        `SELECT p.id_paciente, p.nombre, p.apellido, p.edad, p.genero, p.telefono, p.estado_civil, p.escolaridad, p.ocupacion, p.fecha_nacimiento,
                (SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente = p.id_paciente ORDER BY id_cuestionario DESC) as id_cuestionario,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 3 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as total_respuestas,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 20 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as sec4_count,
                (SELECT TOP 1 id_estudio FROM EstudioSocioeconomico WHERE id_paciente = p.id_paciente ORDER BY id_estudio DESC) as id_estudio,
                (SELECT TOP 1 status FROM EstudioSocioeconomico WHERE id_paciente = p.id_paciente ORDER BY id_estudio DESC) as estudio_status,
                (SELECT TOP 1 CAST(apto AS INT) FROM ValoracionMedica WHERE id_paciente = p.id_paciente ORDER BY fecha_valoracion DESC) as apto,
                (SELECT TOP 1 decision FROM DecisionIngreso WHERE id_paciente = p.id_paciente ORDER BY fecha DESC) as decision
         FROM Paciente p
         ORDER BY p.id_paciente DESC`,
        // Sin DecisionIngreso
        `SELECT p.id_paciente, p.nombre, p.apellido, p.edad, p.genero, p.telefono, p.estado_civil, p.escolaridad, p.ocupacion, p.fecha_nacimiento,
                (SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente = p.id_paciente ORDER BY id_cuestionario DESC) as id_cuestionario,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 3 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as total_respuestas,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 20 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as sec4_count,
                (SELECT TOP 1 id_estudio FROM EstudioSocioeconomico WHERE id_paciente = p.id_paciente ORDER BY id_estudio DESC) as id_estudio,
                (SELECT TOP 1 status FROM EstudioSocioeconomico WHERE id_paciente = p.id_paciente ORDER BY id_estudio DESC) as estudio_status,
                (SELECT TOP 1 CAST(apto AS INT) FROM ValoracionMedica WHERE id_paciente = p.id_paciente ORDER BY fecha_valoracion DESC) as apto,
                NULL as decision
         FROM Paciente p
         ORDER BY p.id_paciente DESC`,
        // Sin EstudioSocioeconomico
        `SELECT p.id_paciente, p.nombre, p.apellido, p.edad, p.genero, p.telefono, p.estado_civil, p.escolaridad, p.ocupacion, p.fecha_nacimiento,
                (SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente = p.id_paciente ORDER BY id_cuestionario DESC) as id_cuestionario,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 3 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as total_respuestas,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 20 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as sec4_count,
                NULL as id_estudio, NULL as estudio_status,
                (SELECT TOP 1 CAST(apto AS INT) FROM ValoracionMedica WHERE id_paciente = p.id_paciente ORDER BY fecha_valoracion DESC) as apto,
                NULL as decision
         FROM Paciente p
         ORDER BY p.id_paciente DESC`,
        // Sin ValoracionMedica
        `SELECT p.id_paciente, p.nombre, p.apellido, p.edad, p.genero, p.telefono, p.estado_civil, p.escolaridad, p.ocupacion, p.fecha_nacimiento,
                (SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente = p.id_paciente ORDER BY id_cuestionario DESC) as id_cuestionario,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 3 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as total_respuestas,
                (SELECT COUNT(CASE WHEN r.id_pregunta BETWEEN 20 AND 25 AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) FROM RespuestaCuestionario r INNER JOIN Cuestionario c ON r.id_cuestionario = c.id_cuestionario WHERE c.id_paciente = p.id_paciente) as sec4_count,
                NULL as id_estudio, NULL as estudio_status, NULL as apto, NULL as decision
         FROM Paciente p
         ORDER BY p.id_paciente DESC`,
        // Query mínima — solo la tabla Paciente
        `SELECT id_paciente, nombre, apellido, edad, genero, telefono, estado_civil, escolaridad, ocupacion, fecha_nacimiento,
                NULL as id_cuestionario, NULL as total_respuestas, NULL as sec4_count, NULL as id_estudio, NULL as estudio_status, NULL as apto, NULL as decision
         FROM Paciente ORDER BY id_paciente DESC`
    ];

    for (const q of intentos) {
        try {
            const result = await pool.request().query(q);
            return res.json(result.recordset);
        } catch (e) { console.error("Intento fallido pacientes-admision:", e.message); }
    }
    res.status(500).send("Error al obtener pacientes");
});

// =============================================
// CLÍNICO - TRASLADO E INVENTARIO
// =============================================

// Pacientes aprobados pendientes de traslado
app.get("/clinico/pacientes-aprobados", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT p.id_paciente, p.nombre, p.apellido, p.edad,
                   d.fecha as fecha_aprobacion,
                   t.id_traslado
            FROM Paciente p
            INNER JOIN DecisionIngreso d ON p.id_paciente = d.id_paciente
            LEFT JOIN Traslado t ON p.id_paciente = t.id_paciente
            WHERE d.decision = 'aprobado'
            ORDER BY d.fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener pacientes aprobados");
    }
});

// Guardar traslado + inventario
app.post("/clinico/traslado", async (req, res) => {
    const { id_paciente, id_usuario, tiene_sustancias, descripcion_sustancias, inventario_json, observaciones } = req.body;
    try {
        const existing = await pool.request()
            .input('id_paciente', id_paciente)
            .query('SELECT id_traslado FROM Traslado WHERE id_paciente = @id_paciente');

        let id_traslado;
        if (existing.recordset.length > 0) {
            id_traslado = existing.recordset[0].id_traslado;
            await pool.request()
                .input('id_traslado', id_traslado)
                .input('id_usuario', id_usuario || null)
                .input('tiene_sustancias', tiene_sustancias ? 1 : 0)
                .input('descripcion_sustancias', descripcion_sustancias || null)
                .input('inventario_json', inventario_json || null)
                .input('observaciones', observaciones || null)
                .query(`UPDATE Traslado SET id_usuario=@id_usuario, tiene_sustancias=@tiene_sustancias, descripcion_sustancias=@descripcion_sustancias, inventario_json=@inventario_json, observaciones=@observaciones WHERE id_traslado=@id_traslado`);
        } else {
            const result = await pool.request()
                .input('id_paciente', id_paciente)
                .input('id_usuario', id_usuario || null)
                .input('tiene_sustancias', tiene_sustancias ? 1 : 0)
                .input('descripcion_sustancias', descripcion_sustancias || null)
                .input('inventario_json', inventario_json || null)
                .input('observaciones', observaciones || null)
                .query(`INSERT INTO Traslado (id_paciente, id_usuario, tiene_sustancias, descripcion_sustancias, inventario_json, observaciones) OUTPUT INSERTED.id_traslado VALUES (@id_paciente, @id_usuario, @tiene_sustancias, @descripcion_sustancias, @inventario_json, @observaciones)`);
            id_traslado = result.recordset[0].id_traslado;

            // Actualizar expediente a 'internado'
            try {
                await pool.request().input('id_paciente', id_paciente)
                    .query(`UPDATE Expediente SET estado = 'internado', fecha_ingreso = GETDATE() WHERE id_paciente = @id_paciente`);
            } catch (e) { console.error("Error actualizando expediente:", e); }

            // Paso 14→15: notificar a médicos que paciente está listo para recepción
            try {
                const pacRes = await pool.request().input('id', id_paciente)
                    .query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id`);
                const pac = pacRes.recordset[0];
                const nombre = pac ? `${pac.nombre} ${pac.apellido}` : `Paciente #${id_paciente}`;
                const medicos = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol = 4`);
                for (const m of medicos.recordset) {
                    await pool.request()
                        .input('dest', m.id_usuario)
                        .input('ref', id_paciente)
                        .input('msg', `Traslado completado para ${nombre}. El paciente está listo para recepción médica (primeras 24 hrs).`)
                        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, 'traslado_completado', @msg, @ref, 'Paciente')`);
                }
            } catch (e) { console.error("Error notificando médico post-traslado:", e); }
        }

        res.json({ id_traslado });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar traslado");
    }
});

// Obtener detalle de traslado de un paciente
app.get("/clinico/traslado/:id_paciente", async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', req.params.id_paciente)
            .query('SELECT * FROM Traslado WHERE id_paciente = @id');
        res.json(result.recordset[0] || null);
    } catch (err) {
        res.status(500).send("Error al obtener traslado");
    }
});

// Notificaciones para clínico (reutiliza misma tabla)
app.get("/clinico/notificaciones/:id_usuario", async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', req.params.id_usuario)
            .query(`SELECT TOP 50 * FROM Notificacion WHERE id_usuario_destino = @id ORDER BY fecha DESC`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send("Error al obtener notificaciones");
    }
});

app.post("/clinico/notificaciones/leer/:id", async (req, res) => {
    try {
        await pool.request().input('id', req.params.id).query(`UPDATE Notificacion SET leida=1 WHERE id_notificacion=@id`);
        res.json({ ok: true });
    } catch (err) { res.status(500).send("Error"); }
});

app.post("/clinico/notificaciones/leer-todas/:id_usuario", async (req, res) => {
    try {
        await pool.request().input('id', req.params.id_usuario).query(`UPDATE Notificacion SET leida=1 WHERE id_usuario_destino=@id`);
        res.json({ ok: true });
    } catch (err) { res.status(500).send("Error"); }
});

// =============================================
// CITAS
// =============================================
app.get("/citas", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT c.id_cita, c.id_paciente, c.fecha, c.tipo, c.estado, c.notas, c.duracion, c.especialidad,
                   p.nombre as nombre_paciente, p.apellido as apellido_paciente
            FROM Cita c
            INNER JOIN Paciente p ON c.id_paciente = p.id_paciente
            ORDER BY c.fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener citas");
    }
});

app.post("/citas", async (req, res) => {
    const { id_paciente, fecha, tipo, familiar_nombre, id_usuario } = req.body;
    try {
        // Normalize fecha to YYYY-MM-DDTHH:MM:SS format before passing to SQL
        const fechaNorm = fecha ? (fecha.length === 16 ? fecha + ":00" : fecha) : null;
        const result = await pool.request()
            .input('id_paciente', sql.Int, parseInt(id_paciente))
            .input('fecha', sql.VarChar, fechaNorm)
            .input('tipo', tipo || null)
            .input('estado', 'programada')
            .input('duracion', 120)
            .input('especialidad', familiar_nombre || null)
            .input('id_usuario', id_usuario ? parseInt(id_usuario) : null)
            .query(`
                INSERT INTO Cita (id_paciente, fecha, tipo, estado, duracion, especialidad, id_usuario)
                OUTPUT INSERTED.id_cita
                VALUES (@id_paciente, @fecha, @tipo, @estado, @duracion, @especialidad, @id_usuario)
            `);
        res.json({ id_cita: result.recordset[0].id_cita });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear cita");
    }
});

app.put("/citas/:id", async (req, res) => {
    const { estado, notas, fecha } = req.body;
    try {
        const fechaNorm = fecha ? (fecha.length === 16 ? fecha + ":00" : fecha) : null;
        await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .input('estado', estado || null)
            .input('notas', notas || null)
            .input('fecha', sql.VarChar, fechaNorm)
            .query(`
                UPDATE Cita SET
                  estado = ISNULL(@estado, estado),
                  notas  = ISNULL(@notas,  notas),
                  fecha  = ISNULL(@fecha,  fecha)
                WHERE id_cita = @id
            `);

        // Paso 3: cuando paciente asiste a cita, notificar a médicos y clínicos
        if (estado === 'asistio') {
            try {
                const citaRes = await pool.request().input('id', sql.Int, parseInt(req.params.id))
                    .query(`SELECT c.id_paciente, p.nombre, p.apellido FROM Cita c INNER JOIN Paciente p ON c.id_paciente = p.id_paciente WHERE c.id_cita = @id`);
                const cita = citaRes.recordset[0];
                if (cita) {
                    const nombre = `${cita.nombre} ${cita.apellido}`;
                    const destinatarios = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol IN (4, 5)`);
                    for (const u of destinatarios.recordset) {
                        await pool.request()
                            .input('dest', u.id_usuario)
                            .input('ref', cita.id_paciente)
                            .input('msg', `Paciente ${nombre} acudió a la cita programada. Estar al pendiente para valoración.`)
                            .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, 'paciente_citado', @msg, @ref, 'Paciente')`);
                    }
                }
            } catch (e) { console.error("Error notificando cita asistida:", e); }
        }

        res.send("ok");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al actualizar cita");
    }
});

// =============================================
// RECEPCIÓN MÉDICA — PRIMERAS 24 HORAS (Pasos 15-19)
// =============================================

// Pacientes con traslado completado pendientes de recepción
app.get("/medico/pendientes-recepcion", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT p.id_paciente, p.nombre, p.apellido, p.edad,
                   t.fecha as fecha_traslado, t.id_traslado,
                   r.id_recepcion
            FROM Traslado t
            INNER JOIN Paciente p ON t.id_paciente = p.id_paciente
            LEFT JOIN RecepcionPaciente r ON t.id_paciente = r.id_paciente
            ORDER BY t.fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener pendientes de recepción");
    }
});

// Guardar recepción médica del paciente
app.post("/medico/recepcion", async (req, res) => {
    const { id_paciente, id_usuario, signos_vitales, es_estable, habitacion, valoracion_psiquiatrica, valoracion_nutricional, valoracion_salud, plan_tratamiento, observaciones } = req.body;
    try {
        const existing = await pool.request()
            .input('id_paciente', id_paciente)
            .query('SELECT id_recepcion FROM RecepcionPaciente WHERE id_paciente = @id_paciente');

        let id_recepcion;
        if (existing.recordset.length > 0) {
            id_recepcion = existing.recordset[0].id_recepcion;
            await pool.request()
                .input('id', id_recepcion)
                .input('id_usuario', id_usuario || null)
                .input('signos', signos_vitales || null)
                .input('estable', es_estable !== null && es_estable !== undefined ? (es_estable ? 1 : 0) : null)
                .input('hab', habitacion || null)
                .input('psiq', valoracion_psiquiatrica || null)
                .input('nutr', valoracion_nutricional || null)
                .input('salud', valoracion_salud || null)
                .input('plan', plan_tratamiento || null)
                .input('obs', observaciones || null)
                .query(`UPDATE RecepcionPaciente SET id_usuario=@id_usuario, signos_vitales=@signos, es_estable=@estable, habitacion=@hab, valoracion_psiquiatrica=@psiq, valoracion_nutricional=@nutr, valoracion_salud=@salud, plan_tratamiento=@plan, observaciones=@obs WHERE id_recepcion=@id`);
        } else {
            const result = await pool.request()
                .input('id_paciente', id_paciente)
                .input('id_usuario', id_usuario || null)
                .input('signos', signos_vitales || null)
                .input('estable', es_estable !== null && es_estable !== undefined ? (es_estable ? 1 : 0) : null)
                .input('hab', habitacion || null)
                .input('psiq', valoracion_psiquiatrica || null)
                .input('nutr', valoracion_nutricional || null)
                .input('salud', valoracion_salud || null)
                .input('plan', plan_tratamiento || null)
                .input('obs', observaciones || null)
                .query(`INSERT INTO RecepcionPaciente (id_paciente, id_usuario, signos_vitales, es_estable, habitacion, valoracion_psiquiatrica, valoracion_nutricional, valoracion_salud, plan_tratamiento, observaciones) OUTPUT INSERTED.id_recepcion VALUES (@id_paciente, @id_usuario, @signos, @estable, @hab, @psiq, @nutr, @salud, @plan, @obs)`);
            id_recepcion = result.recordset[0].id_recepcion;

            // Actualizar expediente
            try {
                await pool.request().input('id', id_paciente)
                    .query(`UPDATE Expediente SET estado = 'en_tratamiento' WHERE id_paciente = @id`);
            } catch (e) { console.error("Error actualizando expediente recepcion:", e); }
        }

        res.json({ id_recepcion });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar recepción");
    }
});

// Obtener recepción de un paciente
app.get("/medico/recepcion/:id_paciente", async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', req.params.id_paciente)
            .query('SELECT * FROM RecepcionPaciente WHERE id_paciente = @id ORDER BY fecha DESC');
        res.json(result.recordset[0] || null);
    } catch (err) {
        res.status(500).send("Error al obtener recepción");
    }
});

// =============================================
// ACTUALIZAR ESTADO_PACIENTE
// =============================================
app.put("/pacientes/:id/estado", async (req, res) => {
    const { estado_paciente } = req.body;
    try {
        await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .input('estado', estado_paciente)
            .query(`UPDATE Paciente SET estado_paciente=@estado WHERE id_paciente=@id`);
        res.send("ok");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al actualizar estado");
    }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000 🚀'));