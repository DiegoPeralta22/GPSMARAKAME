const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;"
};

const poolPromise = sql.connect(config);

// ==================== RECIBOS ====================

exports.obtenerPendientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.*,
        p.nombre + ' ' + p.apellido AS nombre_paciente_db,
        u.nombre AS nombre_creador
      FROM Recibo r
      LEFT JOIN Paciente p ON r.id_paciente = p.id_paciente
      LEFT JOIN Usuario u ON r.id_usuario = u.id_usuario
      WHERE r.estado = 'pendiente'
      ORDER BY r.fecha DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener recibos pendientes");
  }
};

exports.obtenerTodos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.*,
        p.nombre + ' ' + p.apellido AS nombre_paciente_db,
        u.nombre AS nombre_creador,
        ua.nombre AS nombre_admin
      FROM Recibo r
      LEFT JOIN Paciente p ON r.id_paciente = p.id_paciente
      LEFT JOIN Usuario u ON r.id_usuario = u.id_usuario
      LEFT JOIN Usuario ua ON r.id_usuario_admin = ua.id_usuario
      ORDER BY r.fecha DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener recibos");
  }
};

exports.aprobar = async (req, res) => {
  const { id_recibo } = req.params;
  const { id_usuario, observaciones } = req.body;
  try {
    const pool = await poolPromise;

    const reciboRes = await pool.request()
      .input('id_recibo', sql.Int, parseInt(id_recibo))
      .query(`SELECT * FROM Recibo WHERE id_recibo = @id_recibo`);

    const recibo = reciboRes.recordset[0];
    if (!recibo) return res.status(404).send("Recibo no encontrado");

    await pool.request()
      .input('id_recibo', sql.Int, parseInt(id_recibo))
      .input('id_usuario', sql.Int, parseInt(id_usuario))
      .input('observaciones', sql.NVarChar, observaciones || null)
      .query(`
        UPDATE Recibo
        SET estado = 'aprobado',
            id_usuario_admin = @id_usuario,
            observaciones_admin = @observaciones,
            fecha_validacion = GETDATE()
        WHERE id_recibo = @id_recibo
      `);

    if (recibo.id_paciente) {
      await pool.request()
        .input('id_paciente', sql.Int, recibo.id_paciente)
        .query(`UPDATE Expediente SET estado = 'activo' WHERE id_paciente = @id_paciente`);
    }

    const pacRes = await pool.request()
      .input('id_paciente', sql.Int, recibo.id_paciente)
      .query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id_paciente`);
    const pac = pacRes.recordset[0];
    const nombrePac = pac ? `${pac.nombre} ${pac.apellido}` : `Paciente #${recibo.id_paciente}`;

    const admision = await pool.request()
      .query(`SELECT u.id_usuario FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol WHERE r.nombre = 'admision'`);
    for (const u of admision.recordset) {
      await pool.request()
        .input('dest', sql.Int, u.id_usuario)
        .input('mensaje', sql.NVarChar, `Pago aprobado para ${nombrePac}. El paciente está activo y listo para iniciar tratamiento.`)
        .input('ref', sql.Int, parseInt(id_recibo))
        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, 'pago_aprobado', @mensaje, @ref, 'Recibo')`);
    }

    const medicos = await pool.request()
      .query(`SELECT u.id_usuario FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol WHERE r.nombre IN ('medico', 'jefe_medico')`);
    for (const u of medicos.recordset) {
      await pool.request()
        .input('dest', sql.Int, u.id_usuario)
        .input('mensaje', sql.NVarChar, `Pago confirmado. ${nombrePac} está activo. Iniciar protocolo de desintoxicación.`)
        .input('ref', sql.Int, parseInt(id_recibo))
        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, 'paciente_activo', @mensaje, @ref, 'Recibo')`);
    }

    res.json({ mensaje: "Recibo aprobado. Paciente activo." });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al aprobar recibo");
  }
};

exports.rechazar = async (req, res) => {
  const { id_recibo } = req.params;
  const { id_usuario, observaciones } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_recibo', sql.Int, parseInt(id_recibo))
      .input('id_usuario', sql.Int, parseInt(id_usuario))
      .input('observaciones', sql.NVarChar, observaciones || null)
      .query(`
        UPDATE Recibo
        SET estado = 'rechazado',
            id_usuario_admin = @id_usuario,
            observaciones_admin = @observaciones,
            fecha_validacion = GETDATE()
        WHERE id_recibo = @id_recibo
      `);
    res.json({ mensaje: "Recibo rechazado." });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al rechazar recibo");
  }
};

exports.crearRecibo = async (req, res) => {
  const {
    id_paciente, id_usuario, nombre_pagador, fecha_pago, domicilio, cp, rfc, telefono,
    nombre_paciente_recibo, clave_paciente, concepto,
    monto_tratamiento, monto_familiar, total, cantidad_letra,
    firma_responsable, firma_aval
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', sql.Int, id_paciente || null)
      .input('id_usuario', sql.Int, id_usuario || null)
      .input('nombre_pagador', sql.NVarChar, nombre_pagador || null)
      .input('fecha_pago', sql.Date, fecha_pago || null)
      .input('domicilio', sql.NVarChar, domicilio || null)
      .input('cp', sql.NVarChar, cp || null)
      .input('rfc', sql.NVarChar, rfc || null)
      .input('telefono', sql.NVarChar, telefono || null)
      .input('nombre_paciente_recibo', sql.NVarChar, nombre_paciente_recibo || null)
      .input('clave_paciente', sql.NVarChar, clave_paciente || null)
      .input('concepto', sql.NVarChar, concepto || null)
      .input('monto_tratamiento', sql.Decimal(10, 2), parseFloat(monto_tratamiento) || 0)
      .input('monto_familiar', sql.Decimal(10, 2), parseFloat(monto_familiar) || 0)
      .input('total', sql.Decimal(10, 2), parseFloat(total) || 0)
      .input('cantidad_letra', sql.NVarChar, cantidad_letra || null)
      .input('firma_responsable', sql.NVarChar, firma_responsable || null)
      .input('firma_aval', sql.NVarChar, firma_aval || null)
      .query(`
        INSERT INTO Recibo (
          id_paciente, id_usuario, nombre_pagador, fecha_pago, domicilio, cp, rfc, telefono,
          nombre_paciente_recibo, clave_paciente, concepto,
          monto_tratamiento, monto_familiar, total, cantidad_letra,
          firma_responsable, firma_aval, estado
        )
        OUTPUT INSERTED.id_recibo
        VALUES (
          @id_paciente, @id_usuario, @nombre_pagador, @fecha_pago, @domicilio, @cp, @rfc, @telefono,
          @nombre_paciente_recibo, @clave_paciente, @concepto,
          @monto_tratamiento, @monto_familiar, @total, @cantidad_letra,
          @firma_responsable, @firma_aval, 'pendiente'
        )
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear recibo");
  }
};

// ==================== REQUISICIONES ====================

exports.obtenerRequisiciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.*, u.nombre AS nombre_jefe, m.nombre AS nombre_medicamento_ref
      FROM Requisicion r
      INNER JOIN Usuario u ON r.id_usuario_jefe = u.id_usuario
      LEFT JOIN Medicamento m ON r.id_medicamento = m.id_medicamento
      ORDER BY r.fecha DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener requisiciones");
  }
};

exports.obtenerRequisicionesPendientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.*, u.nombre AS nombre_jefe, m.nombre AS nombre_medicamento_ref
      FROM Requisicion r
      INNER JOIN Usuario u ON r.id_usuario_jefe = u.id_usuario
      LEFT JOIN Medicamento m ON r.id_medicamento = m.id_medicamento
      WHERE r.estado = 'pendiente'
      ORDER BY r.fecha DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener requisiciones pendientes");
  }
};

exports.responderRequisicion = async (req, res) => {
  const { id_requisicion } = req.params;
  const { decision, respuesta, id_usuario } = req.body;
  try {
    const pool = await poolPromise;

    const nuevoEstado = decision === 'aprobado' ? 'aprobado' : 'rechazado';

    await pool.request()
      .input('id_requisicion', sql.Int, parseInt(id_requisicion))
      .input('estado', sql.NVarChar, nuevoEstado)
      .input('respuesta', sql.NVarChar, respuesta || null)
      .query(`
        UPDATE Requisicion
        SET estado = @estado,
            respuesta = @respuesta,
            fecha_respuesta = GETDATE()
        WHERE id_requisicion = @id_requisicion
      `);

    // Obtener datos de la requisición para notificar al jefe médico
    const reqRes = await pool.request()
      .input('id_requisicion', sql.Int, parseInt(id_requisicion))
      .query(`SELECT * FROM Requisicion WHERE id_requisicion = @id_requisicion`);
    const req_data = reqRes.recordset[0];

    if (req_data) {
      const accion = nuevoEstado === 'aprobado' ? 'aprobada' : 'rechazada';
      const mensaje = `Tu requisición de "${req_data.descripcion}" ha sido ${accion} por administración.${respuesta ? ' Comentario: ' + respuesta : ''}`;
      await pool.request()
        .input('dest', sql.Int, req_data.id_usuario_jefe)
        .input('mensaje', sql.NVarChar, mensaje)
        .input('ref', sql.Int, parseInt(id_requisicion))
        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, 'requisicion_respondida', @mensaje, @ref, 'Requisicion')`);
    }

    res.json({ mensaje: `Requisición ${nuevoEstado} correctamente.` });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al responder requisición");
  }
};