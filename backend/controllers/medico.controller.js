const sql = require('mssql/msnodesqlv8');

const config = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;"
};

const poolPromise = sql.connect(config);

// ==================== DASHBOARD ====================

exports.obtenerEstadisticas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Paciente) as total_pacientes,
        (SELECT COUNT(*) FROM Expediente WHERE estado = 'tratamiento') as en_tratamiento,
        (SELECT COUNT(*) FROM Expediente WHERE estado = 'desintoxicacion') as en_desintoxicacion,
        (SELECT COUNT(*) FROM ValoracionMedica WHERE apto IS NULL) as valoraciones_pendientes
    `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener estadísticas");
  }
};

exports.obtenerPacientesRecientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 4
        p.id_paciente, p.nombre, p.apellido, p.edad,
        e.estado, e.id_expediente,
        DATEDIFF(day, e.fecha_apertura, GETDATE()) as dias_tratamiento
      FROM Paciente p
      LEFT JOIN Expediente e ON p.id_paciente = e.id_paciente
      ORDER BY p.id_paciente DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener pacientes recientes");
  }
};

exports.obtenerTareasPendientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 4
        'Valoración pendiente' as descripcion,
        p.nombre + ' ' + p.apellido as paciente,
        'urgente' as prioridad
      FROM Paciente p
      LEFT JOIN ValoracionMedica v ON p.id_paciente = v.id_paciente
      WHERE v.id_valoracion IS NULL
      UNION ALL
      SELECT TOP 4
        'Nota de evolución pendiente' as descripcion,
        p.nombre + ' ' + p.apellido as paciente,
        'normal' as prioridad
      FROM Paciente p
      INNER JOIN Expediente e ON p.id_paciente = e.id_paciente
      WHERE e.estado = 'tratamiento'
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener tareas pendientes");
  }
};

// ==================== PACIENTES ====================

exports.obtenerPacientes = async (req, res) => {
  const { filtro, busqueda } = req.query;
  try {
    const pool = await poolPromise;
    let whereClause = '1=1';
    const request = pool.request();

    if (busqueda) {
      whereClause += ` AND (p.nombre LIKE @busqueda OR p.apellido LIKE @busqueda OR CAST(e.id_expediente AS VARCHAR) LIKE @busqueda)`;
      request.input('busqueda', `%${busqueda}%`);
    }
    if (filtro && filtro !== 'todos') {
      whereClause += ` AND e.estado = @filtro`;
      request.input('filtro', filtro);
    }

    const result = await request.query(`
      SELECT
        p.id_paciente, p.nombre, p.apellido, p.edad, p.genero,
        e.id_expediente, e.estado, v.sustancia_principal,
        DATEDIFF(day, e.fecha_apertura, GETDATE()) as dias_tratamiento,
        MAX(ne.fecha) as ultima_visita
      FROM Paciente p
      LEFT JOIN Expediente e ON p.id_paciente = e.id_paciente
      LEFT JOIN ValoracionMedica v ON p.id_paciente = v.id_paciente
      LEFT JOIN NotaEvolucion ne ON p.id_paciente = ne.id_paciente
      WHERE ${whereClause}
      GROUP BY p.id_paciente, p.nombre, p.apellido, p.edad, p.genero,
               e.id_expediente, e.estado, v.sustancia_principal, e.fecha_apertura
      ORDER BY p.id_paciente DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener pacientes");
  }
};

exports.obtenerExpediente = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;

    const paciente = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT p.*, e.id_expediente, e.estado,
               f.nombre as contacto_nombre, f.parentesco as contacto_parentesco,
               f.telefono as contacto_telefono,
               hc.enfermedades_previas, hc.adicciones, hc.tratamientos_previos
        FROM Paciente p
        LEFT JOIN Expediente e ON p.id_paciente = e.id_paciente
        LEFT JOIN Familiar f ON p.id_paciente = f.id_paciente
        LEFT JOIN HistoriaClinica hc ON p.id_paciente = hc.id_paciente
        WHERE p.id_paciente = @id_paciente
      `);

    const signosVitales = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT TOP 3 fecha, hora, presion_arterial, glucosa, temperatura, frecuencia_cardiaca
        FROM NotaEvolucion
        WHERE id_paciente = @id_paciente
        ORDER BY fecha DESC, hora DESC
      `);

    const notasRecientes = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT * FROM (
          SELECT TOP 3 'Evolución' as tipo, analisis as contenido, fecha FROM NotaEvolucion WHERE id_paciente = @id_paciente
          UNION ALL
          SELECT TOP 3 'Indicaciones' as tipo, indicaciones_generales as contenido, fecha FROM Indicaciones WHERE id_paciente = @id_paciente
          UNION ALL
          SELECT TOP 3 'Diagnóstico' as tipo, descripcion as contenido, fecha FROM Diagnostico WHERE id_paciente = @id_paciente
        ) as notas
        ORDER BY fecha DESC
      `);

    res.json({
      paciente: paciente.recordset[0],
      signosVitales: signosVitales.recordset,
      notasRecientes: notasRecientes.recordset
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener expediente");
  }
};

// ==================== VALORACIÓN MÉDICA ====================

exports.obtenerTodasValoraciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        v.*,
        p.nombre, p.apellido, p.edad, p.genero,
        u.nombre as nombre_medico
      FROM ValoracionMedica v
      INNER JOIN Paciente p ON v.id_paciente = p.id_paciente
      INNER JOIN Usuario u ON v.id_usuario = u.id_usuario
      ORDER BY v.fecha_valoracion DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener valoraciones");
  }
};

exports.obtenerValoracion = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT v.*, p.nombre, p.apellido, p.edad, p.fecha_nacimiento
        FROM ValoracionMedica v
        INNER JOIN Paciente p ON v.id_paciente = p.id_paciente
        WHERE v.id_paciente = @id_paciente
        ORDER BY v.fecha_valoracion DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener valoración médica");
  }
};

exports.crearValoracionIndependiente = async (req, res) => {
  const {
    id_paciente, id_usuario, fecha_valoracion, peso, altura,
    presion_arterial, frecuencia_cardiaca, temperatura, glucosa,
    sustancia_principal, tiempo_consumo, frecuencia_consumo,
    ultimo_consumo, riesgo, apto, observaciones, recomendaciones
  } = req.body;

  try {
    const pool = await poolPromise;

    const valoracion = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha_valoracion', fecha_valoracion)
      .input('peso', peso)
      .input('altura', altura)
      .input('presion_arterial', presion_arterial)
      .input('frecuencia_cardiaca', frecuencia_cardiaca)
      .input('temperatura', temperatura)
      .input('glucosa', glucosa)
      .input('sustancia_principal', sustancia_principal)
      .input('tiempo_consumo', tiempo_consumo)
      .input('frecuencia_consumo', frecuencia_consumo)
      .input('ultimo_consumo', ultimo_consumo)
      .input('riesgo', riesgo)
      .input('apto', apto)
      .input('observaciones', observaciones)
      .input('recomendaciones', recomendaciones)
      .query(`
        INSERT INTO ValoracionMedica (
          id_paciente, id_usuario, fecha_valoracion, peso, altura,
          presion_arterial, frecuencia_cardiaca, temperatura, glucosa,
          sustancia_principal, tiempo_consumo, frecuencia_consumo,
          ultimo_consumo, riesgo, apto, observaciones, recomendaciones
        )
        OUTPUT INSERTED.id_valoracion
        VALUES (
          @id_paciente, @id_usuario, @fecha_valoracion, @peso, @altura,
          @presion_arterial, @frecuencia_cardiaca, @temperatura, @glucosa,
          @sustancia_principal, @tiempo_consumo, @frecuencia_consumo,
          @ultimo_consumo, @riesgo, @apto, @observaciones, @recomendaciones
        )
      `);

    const id_valoracion = valoracion.recordset[0].id_valoracion;

    if (parseInt(apto) === 1) {
      await pool.request()
        .input('id_paciente', id_paciente)
        .query(`
          INSERT INTO Expediente (id_paciente, estado)
          VALUES (@id_paciente, 'valoracion')
        `);
    }

    const admision = await pool.request().query(`
      SELECT id_usuario FROM Usuario WHERE rol = 'admision'
    `);

    const mensaje = parseInt(apto) === 1
      ? `El paciente ha sido valorado como APTO para ingresar al tratamiento.`
      : `El paciente ha sido valorado como NO APTO para ingresar al tratamiento.`;

    const tipo = parseInt(apto) === 1 ? 'valoracion_apta' : 'valoracion_no_apta';

    for (const usuario of admision.recordset) {
      await pool.request()
        .input('id_usuario_destino', usuario.id_usuario)
        .input('tipo', tipo)
        .input('mensaje', mensaje)
        .input('id_referencia', id_valoracion)
        .query(`
          INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia)
          VALUES (@id_usuario_destino, @tipo, @mensaje, @id_referencia, 'ValoracionMedica')
        `);
    }

    res.json({ id_valoracion, expediente_creado: parseInt(apto) === 1 });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear valoración");
  }
};

exports.crearValoracion = async (req, res) => {
  const {
    id_paciente, id_usuario, fecha_valoracion, peso, altura,
    presion_arterial, frecuencia_cardiaca, temperatura, glucosa,
    sustancia_principal, tiempo_consumo, frecuencia_consumo,
    ultimo_consumo, riesgo, apto, observaciones, recomendaciones
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha_valoracion', fecha_valoracion)
      .input('peso', peso)
      .input('altura', altura)
      .input('presion_arterial', presion_arterial)
      .input('frecuencia_cardiaca', frecuencia_cardiaca)
      .input('temperatura', temperatura)
      .input('glucosa', glucosa)
      .input('sustancia_principal', sustancia_principal)
      .input('tiempo_consumo', tiempo_consumo)
      .input('frecuencia_consumo', frecuencia_consumo)
      .input('ultimo_consumo', ultimo_consumo)
      .input('riesgo', riesgo)
      .input('apto', apto)
      .input('observaciones', observaciones)
      .input('recomendaciones', recomendaciones)
      .query(`
        INSERT INTO ValoracionMedica (
          id_paciente, id_usuario, fecha_valoracion, peso, altura,
          presion_arterial, frecuencia_cardiaca, temperatura, glucosa,
          sustancia_principal, tiempo_consumo, frecuencia_consumo,
          ultimo_consumo, riesgo, apto, observaciones, recomendaciones
        )
        OUTPUT INSERTED.id_valoracion
        VALUES (
          @id_paciente, @id_usuario, @fecha_valoracion, @peso, @altura,
          @presion_arterial, @frecuencia_cardiaca, @temperatura, @glucosa,
          @sustancia_principal, @tiempo_consumo, @frecuencia_consumo,
          @ultimo_consumo, @riesgo, @apto, @observaciones, @recomendaciones
        )
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear valoración médica");
  }
};

exports.actualizarValoracion = async (req, res) => {
  const { id_valoracion } = req.params;
  const {
    fecha_valoracion, peso, altura, presion_arterial, frecuencia_cardiaca,
    temperatura, glucosa, sustancia_principal, tiempo_consumo,
    frecuencia_consumo, ultimo_consumo, riesgo, apto, observaciones, recomendaciones
  } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_valoracion', id_valoracion)
      .input('fecha_valoracion', fecha_valoracion)
      .input('peso', peso)
      .input('altura', altura)
      .input('presion_arterial', presion_arterial)
      .input('frecuencia_cardiaca', frecuencia_cardiaca)
      .input('temperatura', temperatura)
      .input('glucosa', glucosa)
      .input('sustancia_principal', sustancia_principal)
      .input('tiempo_consumo', tiempo_consumo)
      .input('frecuencia_consumo', frecuencia_consumo)
      .input('ultimo_consumo', ultimo_consumo)
      .input('riesgo', riesgo)
      .input('apto', apto)
      .input('observaciones', observaciones)
      .input('recomendaciones', recomendaciones)
      .query(`
        UPDATE ValoracionMedica SET
          fecha_valoracion = @fecha_valoracion, peso = @peso, altura = @altura,
          presion_arterial = @presion_arterial, frecuencia_cardiaca = @frecuencia_cardiaca,
          temperatura = @temperatura, glucosa = @glucosa,
          sustancia_principal = @sustancia_principal, tiempo_consumo = @tiempo_consumo,
          frecuencia_consumo = @frecuencia_consumo, ultimo_consumo = @ultimo_consumo,
          riesgo = @riesgo, apto = @apto, observaciones = @observaciones,
          recomendaciones = @recomendaciones
        WHERE id_valoracion = @id_valoracion
      `);
    res.json({ mensaje: "Valoración actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al actualizar valoración médica");
  }
};

// ==================== DIAGNÓSTICO ====================

exports.obtenerDiagnosticos = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT d.*, u.nombre as nombre_medico
        FROM Diagnostico d
        INNER JOIN Usuario u ON d.id_usuario = u.id_usuario
        WHERE d.id_paciente = @id_paciente AND d.estado = 'activo'
        ORDER BY d.fecha DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener diagnósticos");
  }
};

exports.crearDiagnostico = async (req, res) => {
  const { id_paciente, id_usuario, codigo_cie10, descripcion, tipo, fecha } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('codigo_cie10', codigo_cie10)
      .input('descripcion', descripcion)
      .input('tipo', tipo)
      .input('fecha', fecha)
      .query(`
        INSERT INTO Diagnostico (id_paciente, id_usuario, codigo_cie10, descripcion, tipo, fecha, estado)
        OUTPUT INSERTED.id_diagnostico
        VALUES (@id_paciente, @id_usuario, @codigo_cie10, @descripcion, @tipo, @fecha, 'activo')
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear diagnóstico");
  }
};

exports.crearSolicitudCambio = async (req, res) => {
  const { id_diagnostico, id_usuario_solicitante, tipo_solicitud, motivo, datos_nuevos } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_diagnostico', id_diagnostico)
      .input('estado', tipo_solicitud === 'edicion' ? 'edicion_pendiente' : 'eliminacion_pendiente')
      .query(`UPDATE Diagnostico SET estado = @estado WHERE id_diagnostico = @id_diagnostico`);

    const result = await pool.request()
      .input('id_diagnostico', id_diagnostico)
      .input('id_usuario_solicitante', id_usuario_solicitante)
      .input('tipo_solicitud', tipo_solicitud)
      .input('motivo', motivo)
      .input('datos_nuevos', datos_nuevos || null)
      .query(`
        INSERT INTO SolicitudCambio (id_diagnostico, id_usuario_solicitante, tipo_solicitud, motivo, datos_nuevos, estado, fecha_solicitud)
        OUTPUT INSERTED.id_solicitud
        VALUES (@id_diagnostico, @id_usuario_solicitante, @tipo_solicitud, @motivo, @datos_nuevos, 'pendiente', GETDATE())
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear solicitud de cambio");
  }
};

// ==================== INDICACIONES ====================

exports.obtenerIndicaciones = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const indicaciones = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT i.*, u.nombre as nombre_medico
        FROM Indicaciones i
        INNER JOIN Usuario u ON i.id_usuario = u.id_usuario
        WHERE i.id_paciente = @id_paciente
        ORDER BY i.fecha DESC
      `);
    const medicamentos = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT im.*
        FROM IndicacionMedicamento im
        INNER JOIN Indicaciones i ON im.id_indicacion = i.id_indicacion
        WHERE i.id_paciente = @id_paciente
      `);
    res.json({ indicaciones: indicaciones.recordset, medicamentos: medicamentos.recordset });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener indicaciones");
  }
};

exports.crearIndicacion = async (req, res) => {
  const { id_paciente, id_usuario, fecha, dieta, nivel_actividad, monitoreo, indicaciones_generales, medicamentos } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha', fecha)
      .input('dieta', dieta || null)
      .input('nivel_actividad', nivel_actividad || null)
      .input('monitoreo', monitoreo || null)
      .input('indicaciones_generales', indicaciones_generales || null)
      .query(`
        INSERT INTO Indicaciones (id_paciente, id_usuario, fecha, dieta, nivel_actividad, monitoreo, indicaciones_generales)
        OUTPUT INSERTED.id_indicacion
        VALUES (@id_paciente, @id_usuario, @fecha, @dieta, @nivel_actividad, @monitoreo, @indicaciones_generales)
      `);
    const id_indicacion = result.recordset[0].id_indicacion;
    if (medicamentos && medicamentos.length > 0) {
      for (const med of medicamentos) {
        await pool.request()
          .input('id_indicacion', id_indicacion)
          .input('nombre', med.nombre)
          .input('dosis', med.dosis)
          .input('frecuencia', med.frecuencia)
          .input('duracion', med.duracion)
          .input('via', med.via)
          .input('requiere_receta', med.requiere_receta ? 1 : 0)
          .query(`
            INSERT INTO IndicacionMedicamento (id_indicacion, nombre, dosis, frecuencia, duracion, via, requiere_receta)
            VALUES (@id_indicacion, @nombre, @dosis, @frecuencia, @duracion, @via, @requiere_receta)
          `);
      }
    }
    res.json({ id_indicacion });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear indicación");
  }
};

// ==================== PROTOCOLO DESINTOXICACIÓN ====================

exports.obtenerProtocolo = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT pd.*, u.nombre as nombre_medico
        FROM ProtocoloDesintoxicacion pd
        INNER JOIN Usuario u ON pd.id_usuario = u.id_usuario
        WHERE pd.id_paciente = @id_paciente
        ORDER BY pd.fecha_inicio DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener protocolo");
  }
};

exports.crearProtocolo = async (req, res) => {
  const {
    id_paciente, id_usuario, fecha_inicio, duracion_estimada, sustancia_principal,
    severidad_sindrome, sintomas_abstinencia, puntuacion_ciwa, protocolo_sedacion,
    suplementacion_vitaminica, hidratacion_electrolitos, frecuencia_monitoreo,
    medicacion_prn, indicaciones_medicacion_rescate, precauciones_especiales,
    contraindicaciones, observaciones_adicionales
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha_inicio', fecha_inicio)
      .input('duracion_estimada', duracion_estimada || null)
      .input('sustancia_principal', sustancia_principal)
      .input('severidad_sindrome', severidad_sindrome || null)
      .input('sintomas_abstinencia', sintomas_abstinencia || null)
      .input('puntuacion_ciwa', puntuacion_ciwa || null)
      .input('protocolo_sedacion', protocolo_sedacion || null)
      .input('suplementacion_vitaminica', suplementacion_vitaminica || null)
      .input('hidratacion_electrolitos', hidratacion_electrolitos || null)
      .input('frecuencia_monitoreo', frecuencia_monitoreo || null)
      .input('medicacion_prn', medicacion_prn || null)
      .input('indicaciones_medicacion_rescate', indicaciones_medicacion_rescate || null)
      .input('precauciones_especiales', precauciones_especiales || null)
      .input('contraindicaciones', contraindicaciones || null)
      .input('observaciones_adicionales', observaciones_adicionales || null)
      .query(`
        INSERT INTO ProtocoloDesintoxicacion (
          id_paciente, id_usuario, fecha_inicio, duracion_estimada, sustancia_principal,
          severidad_sindrome, sintomas_abstinencia, puntuacion_ciwa, protocolo_sedacion,
          suplementacion_vitaminica, hidratacion_electrolitos, frecuencia_monitoreo,
          medicacion_prn, indicaciones_medicacion_rescate, precauciones_especiales,
          contraindicaciones, observaciones_adicionales
        )
        OUTPUT INSERTED.id_protocolo
        VALUES (
          @id_paciente, @id_usuario, @fecha_inicio, @duracion_estimada, @sustancia_principal,
          @severidad_sindrome, @sintomas_abstinencia, @puntuacion_ciwa, @protocolo_sedacion,
          @suplementacion_vitaminica, @hidratacion_electrolitos, @frecuencia_monitoreo,
          @medicacion_prn, @indicaciones_medicacion_rescate, @precauciones_especiales,
          @contraindicaciones, @observaciones_adicionales
        )
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear protocolo");
  }
};

// ==================== SEGUIMIENTO DESINTOXICACIÓN ====================

exports.obtenerSeguimientos = async (req, res) => {
  const { id_protocolo } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_protocolo', id_protocolo)
      .query(`
        SELECT s.*, u.nombre as nombre_usuario
        FROM SeguimientoDesintoxicacion s
        INNER JOIN Usuario u ON s.id_usuario = u.id_usuario
        WHERE s.id_protocolo = @id_protocolo
        ORDER BY s.fecha DESC, s.hora DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener seguimientos");
  }
};

exports.crearSeguimiento = async (req, res) => {
  const {
    id_protocolo, id_paciente, id_usuario, fecha, hora,
    presion_arterial, frecuencia_cardiaca, temperatura,
    glucosa, puntuacion_ciwa, estado_general, observaciones
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_protocolo', id_protocolo)
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha', fecha)
      .input('hora', hora)
      .input('presion_arterial', presion_arterial || null)
      .input('frecuencia_cardiaca', frecuencia_cardiaca || null)
      .input('temperatura', temperatura || null)
      .input('glucosa', glucosa || null)
      .input('puntuacion_ciwa', puntuacion_ciwa || null)
      .input('estado_general', estado_general || null)
      .input('observaciones', observaciones || null)
      .query(`
        INSERT INTO SeguimientoDesintoxicacion (
          id_protocolo, id_paciente, id_usuario, fecha, hora,
          presion_arterial, frecuencia_cardiaca, temperatura,
          glucosa, puntuacion_ciwa, estado_general, observaciones
        )
        OUTPUT INSERTED.id_seguimiento
        VALUES (
          @id_protocolo, @id_paciente, @id_usuario, @fecha, @hora,
          @presion_arterial, @frecuencia_cardiaca, @temperatura,
          @glucosa, @puntuacion_ciwa, @estado_general, @observaciones
        )
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear seguimiento");
  }
};

// ==================== NOTA DE EVOLUCIÓN ====================

exports.obtenerNotas = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT ne.*, u.nombre as nombre_medico
        FROM NotaEvolucion ne
        INNER JOIN Usuario u ON ne.id_usuario = u.id_usuario
        WHERE ne.id_paciente = @id_paciente
        ORDER BY ne.fecha DESC, ne.hora DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener notas de evolución");
  }
};

exports.crearNota = async (req, res) => {
  const {
    id_paciente, id_usuario, fecha, hora, dia_tratamiento,
    presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
    saturacion_oxigeno, temperatura, glucosa, subjetivo, objetivo,
    estado_mental, condicion_general, patron_sueno, apetito,
    estado_animo, analisis, plan, ajustes_tratamiento
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha', fecha)
      .input('hora', hora)
      .input('dia_tratamiento', dia_tratamiento || null)
      .input('presion_arterial', presion_arterial || null)
      .input('frecuencia_cardiaca', frecuencia_cardiaca || null)
      .input('frecuencia_respiratoria', frecuencia_respiratoria || null)
      .input('saturacion_oxigeno', saturacion_oxigeno || null)
      .input('temperatura', temperatura || null)
      .input('glucosa', glucosa || null)
      .input('subjetivo', subjetivo || null)
      .input('objetivo', objetivo || null)
      .input('estado_mental', estado_mental || null)
      .input('condicion_general', condicion_general || null)
      .input('patron_sueno', patron_sueno || null)
      .input('apetito', apetito || null)
      .input('estado_animo', estado_animo || null)
      .input('analisis', analisis || null)
      .input('plan', plan || null)
      .input('ajustes_tratamiento', ajustes_tratamiento || null)
      .query(`
        INSERT INTO NotaEvolucion (
          id_paciente, id_usuario, fecha, hora, dia_tratamiento,
          presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
          saturacion_oxigeno, temperatura, glucosa, subjetivo, objetivo,
          estado_mental, condicion_general, patron_sueno, apetito,
          estado_animo, analisis, [plan], ajustes_tratamiento
        )
        OUTPUT INSERTED.id_nota
        VALUES (
          @id_paciente, @id_usuario, @fecha, @hora, @dia_tratamiento,
          @presion_arterial, @frecuencia_cardiaca, @frecuencia_respiratoria,
          @saturacion_oxigeno, @temperatura, @glucosa, @subjetivo, @objetivo,
          @estado_mental, @condicion_general, @patron_sueno, @apetito,
          @estado_animo, @analisis, @plan, @ajustes_tratamiento
        )
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear nota de evolución");
  }
};

// ==================== SOLICITUD LABORATORIO ====================

exports.obtenerSolicitudesLab = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const solicitudes = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT sl.*, u.nombre as nombre_medico
        FROM SolicitudLaboratorio sl
        INNER JOIN Usuario u ON sl.id_usuario = u.id_usuario
        WHERE sl.id_paciente = @id_paciente
        ORDER BY sl.fecha DESC
      `);
    const estudios = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT sle.*
        FROM SolicitudLaboratorioEstudio sle
        INNER JOIN SolicitudLaboratorio sl ON sle.id_solicitud_lab = sl.id_solicitud_lab
        WHERE sl.id_paciente = @id_paciente
      `);
    res.json({ solicitudes: solicitudes.recordset, estudios: estudios.recordset });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener solicitudes de laboratorio");
  }
};

exports.crearSolicitudLab = async (req, res) => {
  const { id_paciente, id_usuario, fecha, prioridad, indicacion_diagnostico, notas_adicionales, estudios } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha', fecha)
      .input('prioridad', prioridad)
      .input('indicacion_diagnostico', indicacion_diagnostico || null)
      .input('notas_adicionales', notas_adicionales || null)
      .query(`
        INSERT INTO SolicitudLaboratorio (id_paciente, id_usuario, fecha, prioridad, indicacion_diagnostico, notas_adicionales, estado)
        OUTPUT INSERTED.id_solicitud_lab
        VALUES (@id_paciente, @id_usuario, @fecha, @prioridad, @indicacion_diagnostico, @notas_adicionales, 'pendiente')
      `);
    const id_solicitud_lab = result.recordset[0].id_solicitud_lab;
    if (estudios && estudios.length > 0) {
      for (const estudio of estudios) {
        await pool.request()
          .input('id_solicitud_lab', id_solicitud_lab)
          .input('categoria', estudio.categoria)
          .input('nombre_estudio', estudio.nombre_estudio)
          .query(`
            INSERT INTO SolicitudLaboratorioEstudio (id_solicitud_lab, categoria, nombre_estudio)
            VALUES (@id_solicitud_lab, @categoria, @nombre_estudio)
          `);
      }
    }
    res.json({ id_solicitud_lab });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear solicitud de laboratorio");
  }
};

// ==================== ACTIVIDADES ====================

exports.obtenerActividades = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const actividades = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT a.*, u.nombre as nombre_medico
        FROM Actividades a
        INNER JOIN Usuario u ON a.id_usuario = u.id_usuario
        WHERE a.id_paciente = @id_paciente
        ORDER BY a.fecha DESC
      `);
    const detalles = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT ad.*
        FROM ActividadDetalle ad
        INNER JOIN Actividades a ON ad.id_actividad = a.id_actividad
        WHERE a.id_paciente = @id_paciente
      `);
    res.json({ actividades: actividades.recordset, detalles: detalles.recordset });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener actividades");
  }
};

exports.crearActividad = async (req, res) => {
  const { id_paciente, id_usuario, fecha, observaciones, actividades } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('fecha', fecha)
      .input('observaciones', observaciones || null)
      .query(`
        INSERT INTO Actividades (id_paciente, id_usuario, fecha, observaciones, estado)
        OUTPUT INSERTED.id_actividad
        VALUES (@id_paciente, @id_usuario, @fecha, @observaciones, 'pendiente')
      `);
    const id_actividad = result.recordset[0].id_actividad;
    if (actividades && actividades.length > 0) {
      for (const act of actividades) {
        await pool.request()
          .input('id_actividad', id_actividad)
          .input('categoria', act.categoria)
          .input('nombre_actividad', act.nombre_actividad)
          .query(`
            INSERT INTO ActividadDetalle (id_actividad, categoria, nombre_actividad, completada)
            VALUES (@id_actividad, @categoria, @nombre_actividad, 0)
          `);
      }
    }
    res.json({ id_actividad });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear actividad");
  }
};

// ==================== NOTIFICACIONES ====================

exports.obtenerNotificaciones = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_usuario', id_usuario)
      .query(`
        SELECT TOP 20 *
        FROM Notificacion
        WHERE id_usuario_destino = @id_usuario
        ORDER BY fecha DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener notificaciones");
  }
};

exports.marcarLeida = async (req, res) => {
  const { id_notificacion } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_notificacion', id_notificacion)
      .query(`
        UPDATE Notificacion SET leida = 1
        WHERE id_notificacion = @id_notificacion
      `);
    res.json({ mensaje: "Notificación marcada como leída" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al marcar notificación");
  }
};

exports.marcarTodasLeidas = async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_usuario', id_usuario)
      .query(`
        UPDATE Notificacion SET leida = 1
        WHERE id_usuario_destino = @id_usuario AND leida = 0
      `);
    res.json({ mensaje: "Todas marcadas como leídas" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al marcar notificaciones");
  }
};