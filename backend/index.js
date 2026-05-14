const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

const recibosRoutes = require('./routes/recibos.routes');
app.use('/recibos', recibosRoutes);

const medicoRoutes = require('./routes/medico.routes');
app.use('/medico', medicoRoutes);

const pacientesRoutes = require('./routes/pacientes.routes');
app.use('/pacientes', pacientesRoutes);

const contratoRoutes = require('./routes/contrato.routes');
app.use('/contratos', contratoRoutes);

const config = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;",
    pool: { max: 10, min: 2, idleTimeoutMillis: 30000 },
    requestTimeout: 60000,
    connectionTimeout: 15000,
};

// Caché en memoria para /pacientes-admision (se invalida al crear/editar/archivar pacientes)
let _pacCache = null;
let _pacCacheTs = 0;
const PAC_TTL = 8000; // 8 segundos
const getPacCache  = ()     => _pacCache && (Date.now() - _pacCacheTs < PAC_TTL) ? _pacCache : null;
const setPacCache  = (data) => { _pacCache = data; _pacCacheTs = Date.now(); };
const clearPacCache = ()    => { _pacCache = null; };

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

        // Asegurar preguntas extendidas del solicitante
        pool.request().query(`
            SET IDENTITY_INSERT Pregunta ON
            IF NOT EXISTS (SELECT 1 FROM Pregunta WHERE id_pregunta = 32)
                INSERT INTO Pregunta (id_pregunta, texto, tipo) VALUES (32, 'Género del solicitante', 'registro')
            IF NOT EXISTS (SELECT 1 FROM Pregunta WHERE id_pregunta = 33)
                INSERT INTO Pregunta (id_pregunta, texto, tipo) VALUES (33, 'Fecha de nacimiento del solicitante', 'registro')
            IF NOT EXISTS (SELECT 1 FROM Pregunta WHERE id_pregunta = 34)
                INSERT INTO Pregunta (id_pregunta, texto, tipo) VALUES (34, 'Estado civil del solicitante', 'registro')
            IF NOT EXISTS (SELECT 1 FROM Pregunta WHERE id_pregunta = 35)
                INSERT INTO Pregunta (id_pregunta, texto, tipo) VALUES (35, 'Escolaridad del solicitante', 'registro')
            SET IDENTITY_INSERT Pregunta OFF
        `).catch(e => console.error("Error insertando preguntas 32-35:", e));

        pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Recibo' AND xtype='U')
            CREATE TABLE Recibo (
                id_recibo INT PRIMARY KEY IDENTITY,
                id_paciente INT NOT NULL,
                id_usuario INT,
                fecha DATETIME DEFAULT GETDATE(),
                nombre_pagador NVARCHAR(200),
                domicilio NVARCHAR(300),
                cp NVARCHAR(20),
                rfc NVARCHAR(50),
                telefono NVARCHAR(30),
                clave_paciente NVARCHAR(50),
                concepto NVARCHAR(500),
                monto_tratamiento DECIMAL(10,2) DEFAULT 0,
                monto_familiar DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) DEFAULT 0,
                cantidad_letra NVARCHAR(300),
                validado BIT DEFAULT 0,
                fecha_validacion DATETIME,
                id_usuario_valido INT
            )
        `).catch(e => console.error("Error creando Recibo:", e));

        pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Paciente') AND name='archivado')
                ALTER TABLE Paciente ADD archivado BIT NOT NULL DEFAULT 0
        `).catch(e => console.error("Error migrando columna archivado:", e));

        // Índices para acelerar /pacientes-admision
        pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Cuestionario_Paciente' AND object_id=OBJECT_ID('Cuestionario'))
                CREATE INDEX IX_Cuestionario_Paciente ON Cuestionario(id_paciente, id_cuestionario DESC);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Estudio_Paciente' AND object_id=OBJECT_ID('EstudioSocioeconomico'))
                CREATE INDEX IX_Estudio_Paciente ON EstudioSocioeconomico(id_paciente, id_estudio DESC);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Valoracion_Paciente' AND object_id=OBJECT_ID('ValoracionMedica'))
                CREATE INDEX IX_Valoracion_Paciente ON ValoracionMedica(id_paciente, fecha_valoracion DESC);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Decision_Paciente' AND object_id=OBJECT_ID('DecisionIngreso'))
                CREATE INDEX IX_Decision_Paciente ON DecisionIngreso(id_paciente, fecha DESC);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Paciente_Archivado' AND object_id=OBJECT_ID('Paciente'))
                CREATE INDEX IX_Paciente_Archivado ON Paciente(archivado, id_paciente DESC);
        `).catch(e => console.error("Error creando índices:", e));

        pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HistoriaMedica' AND xtype='U')
            CREATE TABLE HistoriaMedica (
                id_historia INT PRIMARY KEY IDENTITY,
                id_paciente INT NOT NULL UNIQUE,
                id_usuario INT,
                fecha DATETIME DEFAULT GETDATE(),
                fecha_actualizacion DATETIME DEFAULT GETDATE(),
                datos_json NVARCHAR(MAX),
                firma_archivo NVARCHAR(500),
                firma_tipo NVARCHAR(10)
            )
        `).catch(e => console.error("Error creando HistoriaMedica:", e));

        pool.request().query(`
            IF EXISTS (SELECT * FROM sysobjects WHERE name='HistoriaMedica' AND xtype='U')
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('HistoriaMedica') AND name='datos_json')
                    ALTER TABLE HistoriaMedica ADD datos_json NVARCHAR(MAX)
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('HistoriaMedica') AND name='firma_archivo')
                    ALTER TABLE HistoriaMedica ADD firma_archivo NVARCHAR(500)
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('HistoriaMedica') AND name='firma_tipo')
                    ALTER TABLE HistoriaMedica ADD firma_tipo NVARCHAR(10)
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('HistoriaMedica') AND name='fecha_actualizacion')
                    ALTER TABLE HistoriaMedica ADD fecha_actualizacion DATETIME DEFAULT GETDATE()
            END
        `).catch(e => console.error("Error migrando HistoriaMedica:", e));

        pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Requisicion' AND xtype='U')
            CREATE TABLE Requisicion (
                id_requisicion INT PRIMARY KEY IDENTITY,
                folio NVARCHAR(50),
                id_usuario INT,
                nombre_solicitante NVARCHAR(200),
                area NVARCHAR(100) DEFAULT 'Admisiones',
                fecha DATETIME DEFAULT GETDATE(),
                observaciones NVARCHAR(500),
                total DECIMAL(10,2) DEFAULT 0,
                estado VARCHAR(20) DEFAULT 'pendiente',
                items_json NVARCHAR(MAX)
            )
        `).catch(e => console.error("Error creando Requisicion:", e));

        pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Recibo') AND name='estado')
                ALTER TABLE Recibo ADD estado VARCHAR(20) DEFAULT 'pendiente'
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Recibo') AND name='nombre_paciente_recibo')
                ALTER TABLE Recibo ADD nombre_paciente_recibo NVARCHAR(200) NULL
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Recibo') AND name='firma_responsable')
                ALTER TABLE Recibo ADD firma_responsable NVARCHAR(200) NULL
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Recibo') AND name='firma_aval')
                ALTER TABLE Recibo ADD firma_aval NVARCHAR(200) NULL
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Recibo') AND name='observaciones_admin')
                ALTER TABLE Recibo ADD observaciones_admin NVARCHAR(MAX) NULL
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Recibo') AND name='fecha_pago')
                ALTER TABLE Recibo ADD fecha_pago DATE NULL
        `).catch(e => console.error("Error migrando columnas de Recibo:", e));
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

        clearPacCache();
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear paciente");
    }
});

// ARCHIVAR PACIENTE (cerrar caso definitivamente)
app.put("/pacientes/:id/archivar", async (req, res) => {
    try {
        await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('UPDATE Paciente SET archivado = 1 WHERE id_paciente = @id');
        clearPacCache();
        res.json({ ok: true });
    } catch (err) {
        console.error("Error archivando paciente:", err.message);
        res.status(500).send("Error al archivar paciente");
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
        clearPacCache();
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
            for (const r of respuestas) {
                await transaction.request()
                    .input('id_cuestionario', id_cuestionario)
                    .input('id_pregunta', r.id_pregunta)
                    .input('respuesta', r.respuesta ?? null)
                    .query(`INSERT INTO RespuestaCuestionario (id_cuestionario, id_pregunta, respuesta) VALUES (@id_cuestionario, @id_pregunta, @respuesta)`);
            }
            await transaction.commit();
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }

        // Notificar a todos los médicos
        try {
            const medicos = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol = 4`);
            for (const m of medicos.recordset) {
                await pool.request()
                    .input('id_usuario_destino', m.id_usuario)
                    .input('id_referencia', id_cuestionario)
                    .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@id_usuario_destino, 'nuevo_ingreso', 'Nuevo paciente registrado en admisiones requiere valoración médica.', @id_referencia, 'Cuestionario')`);
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
        // Una sola query con OUTER APPLY en lugar de 6-8 queries paralelas
        const main = await pool.request().input('id', sql.Int, id).query(`
            SELECT
                p.*,
                c.id_cuestionario, c.total_respuestas, c.fuente_ingreso,
                CAST(v.apto AS INT) AS apto, v.observaciones AS obs_medico,
                v.id_valoracion, v.nombre_medico,
                e.id_estudio, e.status AS estudio_status, e.datos_json AS estudio_json,
                d.id_decision, d.decision, d.motivo_rechazo, d.fecha AS fecha_decision,
                f.id_familiar, f.nombre AS fam_nombre, f.telefono AS fam_telefono,
                t.id_traslado, t.fecha AS fecha_traslado,
                ISNULL(ct.num_contratos, 0) AS num_contratos
            FROM Paciente p
            OUTER APPLY (
                SELECT TOP 1 c2.id_cuestionario,
                    COUNT(CASE WHEN LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' THEN 1 END) AS total_respuestas,
                    MAX(CASE WHEN r.id_pregunta=3 THEN r.respuesta END) AS fuente_ingreso
                FROM Cuestionario c2
                LEFT JOIN RespuestaCuestionario r ON c2.id_cuestionario=r.id_cuestionario
                WHERE c2.id_paciente=p.id_paciente
                GROUP BY c2.id_cuestionario
                ORDER BY c2.id_cuestionario DESC
            ) c
            OUTER APPLY (
                SELECT TOP 1 v2.id_valoracion, v2.apto, v2.observaciones, u.nombre AS nombre_medico
                FROM ValoracionMedica v2
                LEFT JOIN Usuario u ON v2.id_usuario=u.id_usuario
                WHERE v2.id_paciente=p.id_paciente ORDER BY v2.fecha_valoracion DESC
            ) v
            OUTER APPLY (SELECT TOP 1 id_estudio, status, datos_json FROM EstudioSocioeconomico WHERE id_paciente=p.id_paciente ORDER BY id_estudio DESC) e
            OUTER APPLY (SELECT TOP 1 id_decision, decision, motivo_rechazo, fecha FROM DecisionIngreso WHERE id_paciente=p.id_paciente ORDER BY fecha DESC) d
            OUTER APPLY (SELECT TOP 1 id_familiar, nombre, telefono FROM Familiar WHERE id_paciente=p.id_paciente ORDER BY id_familiar ASC) f
            OUTER APPLY (SELECT TOP 1 id_traslado, fecha FROM Traslado WHERE id_paciente=p.id_paciente ORDER BY id_traslado DESC) t
            OUTER APPLY (SELECT COUNT(*) AS num_contratos FROM Contrato WHERE id_paciente=p.id_paciente) ct
            WHERE p.id_paciente = @id
        `);
        const row = main.recordset[0];
        if (!row) return res.status(404).send("Paciente no encontrado");
        res.json({
            paciente: {
                id_paciente:row.id_paciente, nombre:row.nombre, apellido:row.apellido,
                edad:row.edad, genero:row.genero, telefono:row.telefono,
                estado_civil:row.estado_civil, escolaridad:row.escolaridad,
                ocupacion:row.ocupacion, fecha_nacimiento:row.fecha_nacimiento,
                direccion:row.direccion,
            },
            cuestionario: row.id_cuestionario ? { id_cuestionario:row.id_cuestionario, total_respuestas:row.total_respuestas, fuente_ingreso:row.fuente_ingreso } : null,
            valoracion: row.id_valoracion ? { id_valoracion:row.id_valoracion, apto:row.apto, observaciones:row.obs_medico, nombre_medico:row.nombre_medico } : null,
            estudio: row.id_estudio ? { id_estudio:row.id_estudio, status:row.estudio_status, datos_json:row.estudio_json } : null,
            decision: row.id_decision ? { id_decision:row.id_decision, decision:row.decision, motivo_rechazo:row.motivo_rechazo, fecha:row.fecha_decision } : null,
            familiar: row.id_familiar ? { id_familiar:row.id_familiar, nombre:row.fam_nombre, telefono:row.fam_telefono } : null,
            traslado: row.id_traslado ? { id_traslado:row.id_traslado, fecha:row.fecha_traslado } : null,
            num_contratos: row.num_contratos || 0,
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

// PACIENTES PARA ADMISIONES — OUTER APPLY con TOP 1 (más rápido que ROW_NUMBER)
app.get("/pacientes-admision", async (req, res) => {
    const cached = getPacCache();
    if (cached) return res.json(cached);
    try {
        const result = await pool.request().query(`
            SELECT
                p.id_paciente, p.nombre, p.apellido, p.edad, p.genero, p.telefono,
                p.estado_civil, p.escolaridad, p.ocupacion, p.fecha_nacimiento,
                c.id_cuestionario,
                NULL AS total_respuestas, NULL AS sec4_count,
                e.id_estudio, e.estudio_status,
                CAST(v.apto AS INT) AS apto,
                d.decision
            FROM Paciente p
            OUTER APPLY (SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente=p.id_paciente ORDER BY id_cuestionario DESC) c
            OUTER APPLY (SELECT TOP 1 id_estudio, status AS estudio_status FROM EstudioSocioeconomico WHERE id_paciente=p.id_paciente ORDER BY id_estudio DESC) e
            OUTER APPLY (SELECT TOP 1 apto FROM ValoracionMedica WHERE id_paciente=p.id_paciente ORDER BY fecha_valoracion DESC) v
            OUTER APPLY (SELECT TOP 1 decision FROM DecisionIngreso WHERE id_paciente=p.id_paciente ORDER BY fecha DESC) d
            WHERE p.archivado = 0
            ORDER BY p.id_paciente DESC
        `);
        setPacCache(result.recordset);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error pacientes-admision:", err.message);
        // Fallback mínimo si alguna tabla auxiliar falla
        try {
            const r2 = await pool.request().query(`
                SELECT p.id_paciente, p.nombre, p.apellido, p.edad, p.genero, p.telefono,
                       p.estado_civil, p.escolaridad, p.ocupacion, p.fecha_nacimiento,
                       c.id_cuestionario,
                       NULL AS total_respuestas, NULL AS sec4_count,
                       NULL AS id_estudio, NULL AS estudio_status, NULL AS apto, NULL AS decision
                FROM Paciente p
                LEFT JOIN (
                    SELECT id_paciente, MAX(id_cuestionario) AS id_cuestionario
                    FROM Cuestionario GROUP BY id_paciente
                ) c ON p.id_paciente = c.id_paciente
                WHERE ISNULL(p.archivado, 0) = 0
                ORDER BY p.id_paciente DESC
            `);
            res.json(r2.recordset);
        } catch (e2) {
            console.error("Fallback pacientes-admision:", e2.message);
            res.status(500).send("Error al obtener pacientes");
        }
    }
});

// =============================================
// CLÍNICO - TRASLADO E INVENTARIO
// =============================================

// Pacientes aprobados pendientes de traslado
app.get("/clinico/pacientes-aprobados", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT p.id_paciente, p.nombre, p.apellido, p.edad,
                   d.fecha AS fecha_aprobacion,
                   t.id_traslado
            FROM Paciente p
            OUTER APPLY (SELECT TOP 1 decision, fecha FROM DecisionIngreso WHERE id_paciente=p.id_paciente ORDER BY fecha DESC) d
            OUTER APPLY (SELECT TOP 1 id_traslado FROM Traslado WHERE id_paciente=p.id_paciente ORDER BY id_traslado DESC) t
            WHERE d.decision = 'aprobado' AND ISNULL(p.archivado, 0) = 0
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
            .query(`
                SELECT TOP 50
                    n.*,
                    COALESCE(
                        CASE WHEN n.tabla_referencia = 'ValoracionMedica' THEN p1.nombre + ' ' + ISNULL(p1.apellido,'') END,
                        CASE WHEN n.tabla_referencia = 'Paciente' THEN p2.nombre + ' ' + ISNULL(p2.apellido,'') END,
                        CASE WHEN n.tabla_referencia = 'Cuestionario' THEN p3.nombre + ' ' + ISNULL(p3.apellido,'') END
                    ) AS nombre_paciente,
                    COALESCE(
                        CASE WHEN n.tabla_referencia = 'ValoracionMedica' THEN v.id_paciente END,
                        CASE WHEN n.tabla_referencia = 'Paciente' THEN n.id_referencia END,
                        CASE WHEN n.tabla_referencia = 'Cuestionario' THEN cu.id_paciente END
                    ) AS id_paciente
                FROM Notificacion n
                LEFT JOIN ValoracionMedica v ON n.tabla_referencia = 'ValoracionMedica' AND n.id_referencia = v.id_valoracion
                LEFT JOIN Paciente p1 ON n.tabla_referencia = 'ValoracionMedica' AND v.id_paciente = p1.id_paciente
                LEFT JOIN Paciente p2 ON n.tabla_referencia = 'Paciente' AND n.id_referencia = p2.id_paciente
                LEFT JOIN Cuestionario cu ON n.tabla_referencia = 'Cuestionario' AND n.id_referencia = cu.id_cuestionario
                LEFT JOIN Paciente p3 ON n.tabla_referencia = 'Cuestionario' AND cu.id_paciente = p3.id_paciente
                WHERE n.id_usuario_destino = @id
                ORDER BY n.fecha DESC
            `);
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
                   p.nombre as nombre_paciente, p.apellido as apellido_paciente, p.telefono as telefono_paciente
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
        const id_cita = result.recordset[0].id_cita;
        // Notify doctors and clinicos about the new appointment
        try {
            const pacRes = await pool.request().input('id', sql.Int, parseInt(id_paciente))
                .query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id`);
            const pac = pacRes.recordset[0];
            if (pac) {
                const nombre = `${pac.nombre} ${pac.apellido}`;
                const fechaStr = fechaNorm ? fechaNorm.replace('T', ' ').slice(0, 16) : '';
                const mensaje = `Cita agendada: ${nombre} — ${tipo || 'Sin tipo'}${fechaStr ? ` el ${fechaStr}` : ''}.`;
                const destinatarios = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol IN (4, 5)`);
                for (const u of destinatarios.recordset) {
                    await pool.request()
                        .input('dest', u.id_usuario)
                        .input('ref', parseInt(id_paciente))
                        .input('msg', mensaje)
                        .input('tipo', 'cita_nueva')
                        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'Paciente')`);
                }
            }
        } catch (e) { console.error("Error notificando nueva cita:", e); }
        res.json({ id_cita });
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

        // Notificar a médicos y clínicos según el estado de la cita
        if (estado === 'asistio' || estado === 'cancelada' || estado === 'reprogramada') {
            try {
                const citaRes = await pool.request().input('id', sql.Int, parseInt(req.params.id))
                    .query(`SELECT c.id_paciente, c.fecha, c.tipo, p.nombre, p.apellido FROM Cita c INNER JOIN Paciente p ON c.id_paciente = p.id_paciente WHERE c.id_cita = @id`);
                const cita = citaRes.recordset[0];
                if (cita) {
                    const nombre = `${cita.nombre} ${cita.apellido}`;
                    let tipoNotif, mensaje;
                    if (estado === 'asistio') {
                        tipoNotif = 'paciente_citado';
                        mensaje = `${nombre} acudió a su cita. Realizar valoración inicial.`;
                    } else if (estado === 'cancelada') {
                        tipoNotif = 'cita_cancelada';
                        mensaje = `Cita de ${nombre} fue cancelada.${notas ? ` Motivo: ${notas}` : ''}`;
                    } else {
                        tipoNotif = 'cita_reprogramada';
                        mensaje = `Cita de ${nombre} fue reprogramada.${notas ? ` Nota: ${notas}` : ''}`;
                    }
                    const destinatarios = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol IN (4, 5)`);
                    for (const u of destinatarios.recordset) {
                        await pool.request()
                            .input('dest', u.id_usuario)
                            .input('ref', cita.id_paciente)
                            .input('msg', mensaje)
                            .input('tipo', tipoNotif)
                            .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'Paciente')`);
                    }
                }
            } catch (e) { console.error("Error notificando cambio de cita:", e); }
        }

        res.send("ok");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al actualizar cita");
    }
});

// =============================================
// CUESTIONARIO WORD — todas las preguntas con respuesta opcional
// =============================================
app.get("/cuestionario-word/:id_paciente", async (req, res) => {
    const id = parseInt(req.params.id_paciente);
    if (isNaN(id)) return res.status(400).send("ID inválido");
    try {
        const [pacRes, famRes, cRes] = await Promise.all([
            pool.request().input('id', sql.Int, id).query(`SELECT * FROM Paciente WHERE id_paciente = @id`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM Familiar WHERE id_paciente = @id ORDER BY id_familiar ASC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente = @id ORDER BY id_cuestionario DESC`),
        ]);
        const id_cuestionario = cRes.recordset[0]?.id_cuestionario || null;
        let respuestas = [];
        if (id_cuestionario) {
            const rRes = await pool.request().input('id_c', sql.Int, id_cuestionario)
                .query(`SELECT p.id_pregunta, p.texto as pregunta, p.tipo, ISNULL(r.respuesta, '') as respuesta
                        FROM Pregunta p
                        LEFT JOIN RespuestaCuestionario r ON p.id_pregunta = r.id_pregunta AND r.id_cuestionario = @id_c
                        ORDER BY p.id_pregunta`);
            respuestas = rRes.recordset;
        }
        res.json({ paciente: pacRes.recordset[0] || null, familiar: famRes.recordset[0] || null, respuestas });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener cuestionario");
    }
});

// =============================================
// EXPEDIENTE CLÍNICO COMPLETO (todas las áreas)
// =============================================
app.get("/expediente-completo/:id_paciente", async (req, res) => {
    const id = parseInt(req.params.id_paciente);
    if (isNaN(id)) return res.status(400).send("ID inválido");
    try {
        const [paciente, familiar, cuestionarioBase, valoracion, estudio, decision, traslado] = await Promise.all([
            pool.request().input('id', sql.Int, id).query(`SELECT * FROM Paciente WHERE id_paciente = @id`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM Familiar WHERE id_paciente = @id ORDER BY id_familiar ASC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 id_cuestionario FROM Cuestionario WHERE id_paciente = @id ORDER BY id_cuestionario DESC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 v.*, u.nombre as nombre_medico FROM ValoracionMedica v LEFT JOIN Usuario u ON v.id_usuario = u.id_usuario WHERE v.id_paciente = @id ORDER BY v.fecha_valoracion DESC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM EstudioSocioeconomico WHERE id_paciente = @id ORDER BY id_estudio DESC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM DecisionIngreso WHERE id_paciente = @id ORDER BY fecha DESC`),
            pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM Traslado WHERE id_paciente = @id ORDER BY fecha DESC`),
        ]);

        const id_cuestionario = cuestionarioBase.recordset[0]?.id_cuestionario || null;
        let respuestas = [];
        if (id_cuestionario) {
            try {
                const rRes = await pool.request()
                    .input('id_c', sql.Int, id_cuestionario)
                    .query(`SELECT p.texto as pregunta, p.tipo, r.respuesta FROM RespuestaCuestionario r INNER JOIN Pregunta p ON r.id_pregunta = p.id_pregunta WHERE r.id_cuestionario = @id_c AND LTRIM(RTRIM(ISNULL(r.respuesta,''))) <> '' ORDER BY r.id_pregunta`);
                respuestas = rRes.recordset;
            } catch (e) { console.error("Error respuestas:", e.message); }
        }

        let recepcion = null;
        try {
            const rRes = await pool.request().input('id', sql.Int, id).query(`SELECT TOP 1 * FROM RecepcionPaciente WHERE id_paciente = @id ORDER BY fecha DESC`);
            recepcion = rRes.recordset[0] || null;
        } catch (e) {}

        const citasRes = await pool.request().input('id', sql.Int, id)
            .query(`SELECT * FROM Cita WHERE id_paciente = @id ORDER BY fecha DESC`);

        const val = valoracion.recordset[0] || null;
        if (val?.apto !== null && val?.apto !== undefined) val.apto = Number(val.apto);

        res.json({
            paciente: paciente.recordset[0] || null,
            familiar: familiar.recordset[0] || null,
            cuestionario: { id_cuestionario, respuestas },
            valoracion: val,
            estudio: estudio.recordset[0] || null,
            decision: decision.recordset[0] || null,
            traslado: traslado.recordset[0] || null,
            recepcion,
            citas: citasRes.recordset,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener expediente completo");
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

// =============================================
// RECIBOS / MÓDULO FINANCIERO
// =============================================
app.post("/recibos", async (req, res) => {
    const { id_paciente, id_usuario, nombre_pagador, domicilio, cp, rfc, telefono,
            nombre_paciente_recibo, clave_paciente, concepto, monto_tratamiento,
            monto_familiar, total, cantidad_letra, firma_responsable, firma_aval, fecha_pago } = req.body;
    try {
        const result = await pool.request()
            .input('id_paciente',           sql.Int,          parseInt(id_paciente))
            .input('id_usuario',            sql.Int,          id_usuario ? parseInt(id_usuario) : null)
            .input('nombre_pagador',        sql.NVarChar(200), nombre_pagador || "")
            .input('domicilio',             sql.NVarChar(300), domicilio || "")
            .input('cp',                    sql.NVarChar(20),  cp || "")
            .input('rfc',                   sql.NVarChar(50),  rfc || "")
            .input('telefono',              sql.NVarChar(30),  telefono || "")
            .input('nombre_paciente_recibo',sql.NVarChar(200), nombre_paciente_recibo || "")
            .input('clave_paciente',        sql.NVarChar(50),  clave_paciente || "")
            .input('concepto',              sql.NVarChar(500), concepto || "")
            .input('monto_tratamiento',     sql.Decimal(10,2), parseFloat(monto_tratamiento) || 0)
            .input('monto_familiar',        sql.Decimal(10,2), parseFloat(monto_familiar) || 0)
            .input('total',                 sql.Decimal(10,2), parseFloat(total) || 0)
            .input('cantidad_letra',        sql.NVarChar(400), cantidad_letra || "")
            .input('firma_responsable',     sql.NVarChar(200), firma_responsable || "")
            .input('firma_aval',            sql.NVarChar(200), firma_aval || "")
            .input('fecha_pago',            sql.Date,          fecha_pago || null)
            .query(`INSERT INTO Recibo (id_paciente,id_usuario,nombre_pagador,domicilio,cp,rfc,telefono,
                    nombre_paciente_recibo,clave_paciente,concepto,monto_tratamiento,monto_familiar,total,
                    cantidad_letra,firma_responsable,firma_aval,fecha_pago,estado)
                    OUTPUT INSERTED.id_recibo
                    VALUES (@id_paciente,@id_usuario,@nombre_pagador,@domicilio,@cp,@rfc,@telefono,
                    @nombre_paciente_recibo,@clave_paciente,@concepto,@monto_tratamiento,@monto_familiar,
                    @total,@cantidad_letra,@firma_responsable,@firma_aval,@fecha_pago,'pendiente')`);

        const id_recibo = result.recordset[0].id_recibo;

        // Crear decisión "pendiente_pago" en DecisionIngreso
        await pool.request()
            .input('id_paciente', sql.Int, parseInt(id_paciente))
            .input('id_usuario',  sql.Int, id_usuario ? parseInt(id_usuario) : null)
            .query(`INSERT INTO DecisionIngreso (id_paciente, id_usuario, decision, motivo_rechazo)
                    VALUES (@id_paciente, @id_usuario, 'pendiente_pago', NULL)`);

        // Notificar a administradores
        try {
            const admins = await pool.request().query(`SELECT u.id_usuario FROM Usuario u JOIN Rol r ON u.id_rol=r.id_rol WHERE r.nombre='administrador'`);
            for (const a of admins.recordset) {
                await pool.request()
                    .input('dest', sql.Int, a.id_usuario)
                    .input('ref',  sql.Int, parseInt(id_paciente))
                    .query(`INSERT INTO Notificacion (id_usuario_destino,tipo,mensaje,id_referencia,tabla_referencia)
                            VALUES (@dest,'recibo_pendiente','Nuevo recibo de pago pendiente de aprobación.',@ref,'Paciente')`);
            }
        } catch (e) { console.error("Error notificando admin:", e); }

        res.json({ id_recibo });
    } catch (err) { console.error(err); res.status(500).send("Error al crear recibo"); }
});

app.get("/recibos/pendientes", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT r.*,
                   p.nombre + ' ' + ISNULL(p.apellido,'') AS nombre_paciente_db,
                   u.nombre AS nombre_creador
            FROM Recibo r
            LEFT JOIN Paciente p ON p.id_paciente = r.id_paciente
            LEFT JOIN Usuario  u ON u.id_usuario  = r.id_usuario
            WHERE ISNULL(r.estado,'pendiente') = 'pendiente'
            ORDER BY r.fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).send("Error al obtener recibos pendientes"); }
});

app.get("/recibos", async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT r.*, p.nombre + ' ' + ISNULL(p.apellido,'') AS nombre_paciente_db
            FROM Recibo r
            LEFT JOIN Paciente p ON p.id_paciente = r.id_paciente
            ORDER BY r.fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).send("Error al obtener recibos"); }
});

app.get("/recibos/paciente/:id_paciente", async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id_paciente))
            .query(`SELECT * FROM Recibo WHERE id_paciente=@id ORDER BY fecha DESC`);
        res.json(result.recordset);
    } catch (err) { res.status(500).send("Error al obtener recibos del paciente"); }
});

app.put("/recibos/:id/aprobar", async (req, res) => {
    const { id_usuario, observaciones } = req.body;
    try {
        const rec = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query(`SELECT id_paciente FROM Recibo WHERE id_recibo=@id`);
        if (!rec.recordset.length) return res.status(404).send("Recibo no encontrado");
        const id_paciente = rec.recordset[0].id_paciente;

        await pool.request()
            .input('id',  sql.Int,          parseInt(req.params.id))
            .input('obs', sql.NVarChar(500), observaciones || null)
            .input('uid', sql.Int,           id_usuario ? parseInt(id_usuario) : null)
            .query(`UPDATE Recibo SET estado='aprobado', observaciones_admin=@obs, id_usuario_valido=@uid, fecha_validacion=GETDATE(), validado=1 WHERE id_recibo=@id`);

        await pool.request()
            .input('id_paciente', sql.Int, id_paciente)
            .input('id_usuario',  sql.Int, id_usuario ? parseInt(id_usuario) : null)
            .query(`INSERT INTO DecisionIngreso (id_paciente, id_usuario, decision) VALUES (@id_paciente, @id_usuario, 'aprobado')`);

        const existing = await pool.request().input('id', sql.Int, id_paciente)
            .query(`SELECT id_expediente FROM Expediente WHERE id_paciente=@id`);
        if (!existing.recordset.length) {
            await pool.request().input('id_paciente', sql.Int, id_paciente)
                .query(`INSERT INTO Expediente (id_paciente, estado) VALUES (@id_paciente, 'admitido')`);
        }

        const clinicos = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE id_rol=5`);
        for (const c of clinicos.recordset) {
            await pool.request()
                .input('dest', sql.Int, c.id_usuario)
                .input('ref',  sql.Int, id_paciente)
                .query(`INSERT INTO Notificacion (id_usuario_destino,tipo,mensaje,id_referencia,tabla_referencia) VALUES (@dest,'ingreso_aprobado','Paciente aprobado para ingreso. Acuda a admisiones para trasladarlo.',@ref,'Paciente')`);
        }

        res.json({ ok: true });
    } catch (err) { console.error(err); res.status(500).send("Error al aprobar recibo"); }
});

app.put("/recibos/:id/rechazar", async (req, res) => {
    const { id_usuario, observaciones } = req.body;
    try {
        const rec = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query(`SELECT id_paciente FROM Recibo WHERE id_recibo=@id`);
        if (!rec.recordset.length) return res.status(404).send("Recibo no encontrado");
        const id_paciente = rec.recordset[0].id_paciente;

        await pool.request()
            .input('id',  sql.Int,          parseInt(req.params.id))
            .input('obs', sql.NVarChar(500), observaciones || null)
            .input('uid', sql.Int,           id_usuario ? parseInt(id_usuario) : null)
            .query(`UPDATE Recibo SET estado='rechazado', observaciones_admin=@obs, id_usuario_valido=@uid, fecha_validacion=GETDATE() WHERE id_recibo=@id`);

        await pool.request()
            .input('id_paciente', sql.Int, id_paciente)
            .input('id_usuario',  sql.Int, id_usuario ? parseInt(id_usuario) : null)
            .input('obs', sql.NVarChar(500), observaciones || "Recibo rechazado por administración")
            .query(`INSERT INTO DecisionIngreso (id_paciente, id_usuario, decision, motivo_rechazo) VALUES (@id_paciente, @id_usuario, 'rechazado', @obs)`);

        res.json({ ok: true });
    } catch (err) { console.error(err); res.status(500).send("Error al rechazar recibo"); }
});

app.put("/recibos/:id/validar", async (req, res) => {
    const { id_usuario_valido } = req.body;
    try {
        await pool.request()
            .input('id',         sql.Int, parseInt(req.params.id))
            .input('id_usuario', sql.Int, id_usuario_valido ? parseInt(id_usuario_valido) : null)
            .query(`UPDATE Recibo SET validado=1, fecha_validacion=GETDATE(), id_usuario_valido=@id_usuario WHERE id_recibo=@id`);
        res.json({ ok: true });
    } catch (err) { res.status(500).send("Error al validar recibo"); }
});

// =============================================
// REQUISICIONES DE COMPRA
// =============================================
app.post("/requisiciones", async (req, res) => {
    const { id_usuario, nombre_solicitante, area, observaciones, total, items } = req.body;
    try {
        const anio = new Date().getFullYear();
        const cnt  = await pool.request().input('anio', sql.Int, anio)
            .query(`SELECT COUNT(*) AS n FROM Requisicion WHERE YEAR(fecha)=@anio`);
        const num  = String((cnt.recordset[0]?.n || 0) + 1).padStart(4, "0");
        const folio = `REQ-${anio}-${num}`;
        const result = await pool.request()
            .input('folio',              sql.NVarChar(50),  folio)
            .input('id_usuario',         sql.Int,           id_usuario || null)
            .input('nombre_solicitante', sql.NVarChar(200), nombre_solicitante || null)
            .input('area',               sql.NVarChar(100), area || 'Admisiones')
            .input('observaciones',      sql.NVarChar(500), observaciones || null)
            .input('total',              sql.Decimal(10,2), total || 0)
            .input('items_json',         sql.NVarChar(sql.MAX), items ? JSON.stringify(items) : null)
            .query(`INSERT INTO Requisicion (folio,id_usuario,nombre_solicitante,area,observaciones,total,items_json)
                    OUTPUT INSERTED.id_requisicion, INSERTED.folio
                    VALUES (@folio,@id_usuario,@nombre_solicitante,@area,@observaciones,@total,@items_json)`);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Error creando requisicion:", err);
        res.status(500).send("Error al crear requisición");
    }
});

app.get("/requisiciones", async (req, res) => {
    const { area } = req.query;
    try {
        const r = pool.request();
        let where = area ? "WHERE area = @area" : "";
        if (area) r.input('area', sql.NVarChar(100), area);
        const result = await r.query(`
            SELECT id_requisicion, folio, nombre_solicitante, area, fecha, total, estado, observaciones, items_json
            FROM Requisicion ${where}
            ORDER BY fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error obteniendo requisiciones:", err);
        res.status(500).send("Error al obtener requisiciones");
    }
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000 🚀'));