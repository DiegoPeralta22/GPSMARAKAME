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
      SELECT p.id_paciente, p.nombre, p.apellido, p.edad, p.genero,
        e.id_expediente, e.estado, v.sustancia_principal,
        DATEDIFF(day, e.fecha_apertura, GETDATE()) as dias_tratamiento,
        MAX(d.fecha) as ultimo_diagnostico
      FROM Paciente p
      LEFT JOIN Expediente e ON p.id_paciente = e.id_paciente
      LEFT JOIN ValoracionMedica v ON p.id_paciente = v.id_paciente
      LEFT JOIN Diagnostico d ON p.id_paciente = d.id_paciente
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
               DATEDIFF(day, e.fecha_apertura, GETDATE()) as dias_tratamiento,
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
      .query(`SELECT TOP 3 fecha, hora, presion_arterial, glucosa, temperatura, frecuencia_cardiaca FROM NotaEvolucion WHERE id_paciente = @id_paciente ORDER BY fecha DESC, hora DESC`);
    const notasRecientes = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        SELECT * FROM (
          SELECT TOP 3 'Evolución' as tipo, analisis as contenido, fecha FROM NotaEvolucion WHERE id_paciente = @id_paciente
          UNION ALL
          SELECT TOP 3 'Indicaciones' as tipo, indicaciones_generales as contenido, fecha FROM Indicaciones WHERE id_paciente = @id_paciente
          UNION ALL
          SELECT TOP 3 'Diagnóstico' as tipo, descripcion as contenido, fecha FROM Diagnostico WHERE id_paciente = @id_paciente
        ) as notas ORDER BY fecha DESC
      `);
    res.json({ paciente: paciente.recordset[0], signosVitales: signosVitales.recordset, notasRecientes: notasRecientes.recordset });
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
      SELECT v.*, p.nombre, p.apellido, p.edad, p.genero, u.nombre as nombre_medico
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
      .query(`SELECT v.*, p.nombre, p.apellido, p.edad, p.fecha_nacimiento FROM ValoracionMedica v INNER JOIN Paciente p ON v.id_paciente = p.id_paciente WHERE v.id_paciente = @id_paciente ORDER BY v.fecha_valoracion DESC`);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener valoración médica");
  }
};

exports.crearValoracionIndependiente = async (req, res) => {
  const { id_paciente, id_usuario, fecha_valoracion, peso, altura, presion_arterial, frecuencia_cardiaca, temperatura, glucosa, sustancia_principal, tiempo_consumo, frecuencia_consumo, ultimo_consumo, riesgo, apto, observaciones, recomendaciones } = req.body;
  try {
    const pool = await poolPromise;
    const valoracion = await pool.request()
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha_valoracion', fecha_valoracion)
      .input('peso', peso).input('altura', altura).input('presion_arterial', presion_arterial)
      .input('frecuencia_cardiaca', frecuencia_cardiaca).input('temperatura', temperatura).input('glucosa', glucosa)
      .input('sustancia_principal', sustancia_principal).input('tiempo_consumo', tiempo_consumo)
      .input('frecuencia_consumo', frecuencia_consumo).input('ultimo_consumo', ultimo_consumo)
      .input('riesgo', riesgo).input('apto', apto).input('observaciones', observaciones).input('recomendaciones', recomendaciones)
      .query(`
        INSERT INTO ValoracionMedica (id_paciente, id_usuario, fecha_valoracion, peso, altura, presion_arterial, frecuencia_cardiaca, temperatura, glucosa, sustancia_principal, tiempo_consumo, frecuencia_consumo, ultimo_consumo, riesgo, apto, observaciones, recomendaciones)
        OUTPUT INSERTED.id_valoracion
        VALUES (@id_paciente, @id_usuario, @fecha_valoracion, @peso, @altura, @presion_arterial, @frecuencia_cardiaca, @temperatura, @glucosa, @sustancia_principal, @tiempo_consumo, @frecuencia_consumo, @ultimo_consumo, @riesgo, @apto, @observaciones, @recomendaciones)
      `);
    const id_valoracion = valoracion.recordset[0].id_valoracion;
    if (parseInt(apto) === 1) {
      await pool.request().input('id_paciente', id_paciente).query(`INSERT INTO Expediente (id_paciente, estado) VALUES (@id_paciente, 'valoracion')`);
    }
    const admision = await pool.request().query(`SELECT id_usuario FROM Usuario WHERE rol = 'admision'`);
    const mensaje = parseInt(apto) === 1 ? `El paciente ha sido valorado como APTO para ingresar al tratamiento.` : `El paciente ha sido valorado como NO APTO para ingresar al tratamiento.`;
    const tipo = parseInt(apto) === 1 ? 'valoracion_apta' : 'valoracion_no_apta';
    for (const usuario of admision.recordset) {
      await pool.request().input('id_usuario_destino', usuario.id_usuario).input('tipo', tipo).input('mensaje', mensaje).input('id_referencia', id_valoracion)
        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@id_usuario_destino, @tipo, @mensaje, @id_referencia, 'ValoracionMedica')`);
    }
    res.json({ id_valoracion, expediente_creado: parseInt(apto) === 1 });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear valoración");
  }
};

exports.crearValoracion = async (req, res) => {
  const { id_paciente, id_usuario, fecha_valoracion, peso, altura, presion_arterial, frecuencia_cardiaca, temperatura, glucosa, sustancia_principal, tiempo_consumo, frecuencia_consumo, ultimo_consumo, riesgo, apto, observaciones, recomendaciones } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha_valoracion', fecha_valoracion)
      .input('peso', peso).input('altura', altura).input('presion_arterial', presion_arterial)
      .input('frecuencia_cardiaca', frecuencia_cardiaca).input('temperatura', temperatura).input('glucosa', glucosa)
      .input('sustancia_principal', sustancia_principal).input('tiempo_consumo', tiempo_consumo)
      .input('frecuencia_consumo', frecuencia_consumo).input('ultimo_consumo', ultimo_consumo)
      .input('riesgo', riesgo).input('apto', apto).input('observaciones', observaciones).input('recomendaciones', recomendaciones)
      .query(`INSERT INTO ValoracionMedica (id_paciente, id_usuario, fecha_valoracion, peso, altura, presion_arterial, frecuencia_cardiaca, temperatura, glucosa, sustancia_principal, tiempo_consumo, frecuencia_consumo, ultimo_consumo, riesgo, apto, observaciones, recomendaciones) OUTPUT INSERTED.id_valoracion VALUES (@id_paciente, @id_usuario, @fecha_valoracion, @peso, @altura, @presion_arterial, @frecuencia_cardiaca, @temperatura, @glucosa, @sustancia_principal, @tiempo_consumo, @frecuencia_consumo, @ultimo_consumo, @riesgo, @apto, @observaciones, @recomendaciones)`);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear valoración médica");
  }
};

exports.actualizarValoracion = async (req, res) => {
  const { id_valoracion } = req.params;
  const { fecha_valoracion, peso, altura, presion_arterial, frecuencia_cardiaca, temperatura, glucosa, sustancia_principal, tiempo_consumo, frecuencia_consumo, ultimo_consumo, riesgo, apto, observaciones, recomendaciones } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_valoracion', id_valoracion).input('fecha_valoracion', fecha_valoracion).input('peso', peso).input('altura', altura)
      .input('presion_arterial', presion_arterial).input('frecuencia_cardiaca', frecuencia_cardiaca).input('temperatura', temperatura)
      .input('glucosa', glucosa).input('sustancia_principal', sustancia_principal).input('tiempo_consumo', tiempo_consumo)
      .input('frecuencia_consumo', frecuencia_consumo).input('ultimo_consumo', ultimo_consumo).input('riesgo', riesgo)
      .input('apto', apto).input('observaciones', observaciones).input('recomendaciones', recomendaciones)
      .query(`UPDATE ValoracionMedica SET fecha_valoracion=@fecha_valoracion, peso=@peso, altura=@altura, presion_arterial=@presion_arterial, frecuencia_cardiaca=@frecuencia_cardiaca, temperatura=@temperatura, glucosa=@glucosa, sustancia_principal=@sustancia_principal, tiempo_consumo=@tiempo_consumo, frecuencia_consumo=@frecuencia_consumo, ultimo_consumo=@ultimo_consumo, riesgo=@riesgo, apto=@apto, observaciones=@observaciones, recomendaciones=@recomendaciones WHERE id_valoracion=@id_valoracion`);
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
    const result = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT d.*, u.nombre as nombre_medico FROM Diagnostico d INNER JOIN Usuario u ON d.id_usuario = u.id_usuario WHERE d.id_paciente = @id_paciente AND d.estado = 'activo' ORDER BY d.fecha DESC`);
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
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('codigo_cie10', codigo_cie10)
      .input('descripcion', descripcion).input('tipo', tipo).input('fecha', fecha)
      .query(`INSERT INTO Diagnostico (id_paciente, id_usuario, codigo_cie10, descripcion, tipo, fecha, estado) OUTPUT INSERTED.id_diagnostico VALUES (@id_paciente, @id_usuario, @codigo_cie10, @descripcion, @tipo, @fecha, 'activo')`);
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
    await pool.request().input('id_diagnostico', id_diagnostico)
      .input('estado', tipo_solicitud === 'edicion' ? 'edicion_pendiente' : 'eliminacion_pendiente')
      .query(`UPDATE Diagnostico SET estado = @estado WHERE id_diagnostico = @id_diagnostico`);
    const result = await pool.request()
      .input('id_diagnostico', id_diagnostico).input('id_usuario_solicitante', id_usuario_solicitante)
      .input('tipo_solicitud', tipo_solicitud).input('motivo', motivo).input('datos_nuevos', datos_nuevos || null)
      .query(`INSERT INTO SolicitudCambio (id_diagnostico, id_usuario_solicitante, tipo_solicitud, motivo, datos_nuevos, estado, fecha_solicitud) OUTPUT INSERTED.id_solicitud VALUES (@id_diagnostico, @id_usuario_solicitante, @tipo_solicitud, @motivo, @datos_nuevos, 'pendiente', GETDATE())`);
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
    const indicaciones = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT i.*, u.nombre as nombre_medico FROM Indicaciones i INNER JOIN Usuario u ON i.id_usuario = u.id_usuario WHERE i.id_paciente = @id_paciente ORDER BY i.fecha DESC`);
    const medicamentos = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT im.* FROM IndicacionMedicamento im INNER JOIN Indicaciones i ON im.id_indicacion = i.id_indicacion WHERE i.id_paciente = @id_paciente`);
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
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha', fecha)
      .input('dieta', dieta || null).input('nivel_actividad', nivel_actividad || null)
      .input('monitoreo', monitoreo || null).input('indicaciones_generales', indicaciones_generales || null)
      .query(`INSERT INTO Indicaciones (id_paciente, id_usuario, fecha, dieta, nivel_actividad, monitoreo, indicaciones_generales) OUTPUT INSERTED.id_indicacion VALUES (@id_paciente, @id_usuario, @fecha, @dieta, @nivel_actividad, @monitoreo, @indicaciones_generales)`);
    const id_indicacion = result.recordset[0].id_indicacion;
    if (medicamentos && medicamentos.length > 0) {
      for (const med of medicamentos) {
        await pool.request()
          .input('id_indicacion', id_indicacion)
          .input('nombre', med.nombre)
          .input('dosis', med.dosis)
          .input('frecuencia', med.frecuencia || null)
          .input('frecuencia_horas', med.frecuencia_horas || null)
          .input('duracion', med.duracion || null)
          .input('duracion_dias', med.duracion_dias || null)
          .input('total_dosis', med.total_dosis || null)
          .input('fecha_inicio', med.fecha_inicio || null)
          .input('fecha_fin', med.fecha_fin || null)
          .input('via', med.via)
          .input('requiere_receta', med.requiere_receta ? 1 : 0)
          .query(`INSERT INTO IndicacionMedicamento (id_indicacion, nombre, dosis, frecuencia, frecuencia_horas, duracion, duracion_dias, total_dosis, fecha_inicio, fecha_fin, via, requiere_receta) VALUES (@id_indicacion, @nombre, @dosis, @frecuencia, @frecuencia_horas, @duracion, @duracion_dias, @total_dosis, @fecha_inicio, @fecha_fin, @via, @requiere_receta)`);
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
    const result = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT pd.*, u.nombre as nombre_medico FROM ProtocoloDesintoxicacion pd INNER JOIN Usuario u ON pd.id_usuario = u.id_usuario WHERE pd.id_paciente = @id_paciente ORDER BY pd.fecha_inicio DESC`);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener protocolo");
  }
};

exports.crearProtocolo = async (req, res) => {
  const { id_paciente, id_usuario, fecha_inicio, duracion_estimada, sustancia_principal, severidad_sindrome, sintomas_abstinencia, puntuacion_ciwa, protocolo_sedacion, suplementacion_vitaminica, hidratacion_electrolitos, frecuencia_monitoreo, medicacion_prn, indicaciones_medicacion_rescate, precauciones_especiales, contraindicaciones, observaciones_adicionales } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha_inicio', fecha_inicio)
      .input('duracion_estimada', duracion_estimada || null).input('sustancia_principal', sustancia_principal)
      .input('severidad_sindrome', severidad_sindrome || null).input('sintomas_abstinencia', sintomas_abstinencia || null)
      .input('puntuacion_ciwa', puntuacion_ciwa || null).input('protocolo_sedacion', protocolo_sedacion || null)
      .input('suplementacion_vitaminica', suplementacion_vitaminica || null).input('hidratacion_electrolitos', hidratacion_electrolitos || null)
      .input('frecuencia_monitoreo', frecuencia_monitoreo || null).input('medicacion_prn', medicacion_prn || null)
      .input('indicaciones_medicacion_rescate', indicaciones_medicacion_rescate || null)
      .input('precauciones_especiales', precauciones_especiales || null).input('contraindicaciones', contraindicaciones || null)
      .input('observaciones_adicionales', observaciones_adicionales || null)
      .query(`INSERT INTO ProtocoloDesintoxicacion (id_paciente, id_usuario, fecha_inicio, duracion_estimada, sustancia_principal, severidad_sindrome, sintomas_abstinencia, puntuacion_ciwa, protocolo_sedacion, suplementacion_vitaminica, hidratacion_electrolitos, frecuencia_monitoreo, medicacion_prn, indicaciones_medicacion_rescate, precauciones_especiales, contraindicaciones, observaciones_adicionales) OUTPUT INSERTED.id_protocolo VALUES (@id_paciente, @id_usuario, @fecha_inicio, @duracion_estimada, @sustancia_principal, @severidad_sindrome, @sintomas_abstinencia, @puntuacion_ciwa, @protocolo_sedacion, @suplementacion_vitaminica, @hidratacion_electrolitos, @frecuencia_monitoreo, @medicacion_prn, @indicaciones_medicacion_rescate, @precauciones_especiales, @contraindicaciones, @observaciones_adicionales)`);
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
    const result = await pool.request().input('id_protocolo', id_protocolo)
      .query(`SELECT s.*, u.nombre as nombre_usuario FROM SeguimientoDesintoxicacion s INNER JOIN Usuario u ON s.id_usuario = u.id_usuario WHERE s.id_protocolo = @id_protocolo ORDER BY s.fecha DESC, s.hora DESC`);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener seguimientos");
  }
};

exports.crearSeguimiento = async (req, res) => {
  const { id_protocolo, id_paciente, id_usuario, fecha, hora, presion_arterial, frecuencia_cardiaca, temperatura, glucosa, puntuacion_ciwa, estado_general, observaciones } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_protocolo', id_protocolo).input('id_paciente', id_paciente).input('id_usuario', id_usuario)
      .input('fecha', fecha).input('hora', hora).input('presion_arterial', presion_arterial || null)
      .input('frecuencia_cardiaca', frecuencia_cardiaca || null).input('temperatura', temperatura || null)
      .input('glucosa', glucosa || null).input('puntuacion_ciwa', puntuacion_ciwa || null)
      .input('estado_general', estado_general || null).input('observaciones', observaciones || null)
      .query(`INSERT INTO SeguimientoDesintoxicacion (id_protocolo, id_paciente, id_usuario, fecha, hora, presion_arterial, frecuencia_cardiaca, temperatura, glucosa, puntuacion_ciwa, estado_general, observaciones) OUTPUT INSERTED.id_seguimiento VALUES (@id_protocolo, @id_paciente, @id_usuario, @fecha, @hora, @presion_arterial, @frecuencia_cardiaca, @temperatura, @glucosa, @puntuacion_ciwa, @estado_general, @observaciones)`);
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
    const result = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT ne.*, u.nombre as nombre_medico FROM NotaEvolucion ne INNER JOIN Usuario u ON ne.id_usuario = u.id_usuario WHERE ne.id_paciente = @id_paciente ORDER BY ne.fecha DESC, ne.hora DESC`);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener notas de evolución");
  }
};

exports.crearNota = async (req, res) => {
  const { id_paciente, id_usuario, fecha, hora, dia_tratamiento, presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria, saturacion_oxigeno, temperatura, glucosa, subjetivo, objetivo, estado_mental, condicion_general, patron_sueno, apetito, estado_animo, analisis, plan, ajustes_tratamiento } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha', fecha).input('hora', hora)
      .input('dia_tratamiento', dia_tratamiento || null).input('presion_arterial', presion_arterial || null)
      .input('frecuencia_cardiaca', frecuencia_cardiaca || null).input('frecuencia_respiratoria', frecuencia_respiratoria || null)
      .input('saturacion_oxigeno', saturacion_oxigeno || null).input('temperatura', temperatura || null)
      .input('glucosa', glucosa || null).input('subjetivo', subjetivo || null).input('objetivo', objetivo || null)
      .input('estado_mental', estado_mental || null).input('condicion_general', condicion_general || null)
      .input('patron_sueno', patron_sueno || null).input('apetito', apetito || null)
      .input('estado_animo', estado_animo || null).input('analisis', analisis || null)
      .input('plan', plan || null).input('ajustes_tratamiento', ajustes_tratamiento || null)
      .query(`INSERT INTO NotaEvolucion (id_paciente, id_usuario, fecha, hora, dia_tratamiento, presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria, saturacion_oxigeno, temperatura, glucosa, subjetivo, objetivo, estado_mental, condicion_general, patron_sueno, apetito, estado_animo, analisis, [plan], ajustes_tratamiento) OUTPUT INSERTED.id_nota VALUES (@id_paciente, @id_usuario, @fecha, @hora, @dia_tratamiento, @presion_arterial, @frecuencia_cardiaca, @frecuencia_respiratoria, @saturacion_oxigeno, @temperatura, @glucosa, @subjetivo, @objetivo, @estado_mental, @condicion_general, @patron_sueno, @apetito, @estado_animo, @analisis, @plan, @ajustes_tratamiento)`);
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
    const solicitudes = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT sl.*, u.nombre as nombre_medico FROM SolicitudLaboratorio sl INNER JOIN Usuario u ON sl.id_usuario = u.id_usuario WHERE sl.id_paciente = @id_paciente ORDER BY sl.fecha DESC`);
    const estudios = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT sle.* FROM SolicitudLaboratorioEstudio sle INNER JOIN SolicitudLaboratorio sl ON sle.id_solicitud_lab = sl.id_solicitud_lab WHERE sl.id_paciente = @id_paciente`);
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
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha', fecha)
      .input('prioridad', prioridad).input('indicacion_diagnostico', indicacion_diagnostico || null)
      .input('notas_adicionales', notas_adicionales || null)
      .query(`INSERT INTO SolicitudLaboratorio (id_paciente, id_usuario, fecha, prioridad, indicacion_diagnostico, notas_adicionales, estado) OUTPUT INSERTED.id_solicitud_lab VALUES (@id_paciente, @id_usuario, @fecha, @prioridad, @indicacion_diagnostico, @notas_adicionales, 'pendiente')`);
    const id_solicitud_lab = result.recordset[0].id_solicitud_lab;
    if (estudios && estudios.length > 0) {
      for (const estudio of estudios) {
        await pool.request().input('id_solicitud_lab', id_solicitud_lab).input('categoria', estudio.categoria).input('nombre_estudio', estudio.nombre_estudio)
          .query(`INSERT INTO SolicitudLaboratorioEstudio (id_solicitud_lab, categoria, nombre_estudio) VALUES (@id_solicitud_lab, @categoria, @nombre_estudio)`);
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
    const actividades = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT a.*, u.nombre as nombre_medico FROM Actividades a INNER JOIN Usuario u ON a.id_usuario = u.id_usuario WHERE a.id_paciente = @id_paciente ORDER BY a.fecha DESC`);
    const detalles = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT ad.* FROM ActividadDetalle ad INNER JOIN Actividades a ON ad.id_actividad = a.id_actividad WHERE a.id_paciente = @id_paciente`);
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
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha', fecha).input('observaciones', observaciones || null)
      .query(`INSERT INTO Actividades (id_paciente, id_usuario, fecha, observaciones, estado) OUTPUT INSERTED.id_actividad VALUES (@id_paciente, @id_usuario, @fecha, @observaciones, 'pendiente')`);
    const id_actividad = result.recordset[0].id_actividad;
    if (actividades && actividades.length > 0) {
      for (const act of actividades) {
        await pool.request().input('id_actividad', id_actividad).input('categoria', act.categoria).input('nombre_actividad', act.nombre_actividad)
          .query(`INSERT INTO ActividadDetalle (id_actividad, categoria, nombre_actividad, completada) VALUES (@id_actividad, @categoria, @nombre_actividad, 0)`);
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
    const result = await pool.request().input('id_usuario', id_usuario)
      .query(`SELECT TOP 20 * FROM Notificacion WHERE id_usuario_destino = @id_usuario ORDER BY fecha DESC`);
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
    await pool.request().input('id_notificacion', id_notificacion)
      .query(`UPDATE Notificacion SET leida = 1 WHERE id_notificacion = @id_notificacion`);
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
    await pool.request().input('id_usuario', id_usuario)
      .query(`UPDATE Notificacion SET leida = 1 WHERE id_usuario_destino = @id_usuario AND leida = 0`);
    res.json({ mensaje: "Todas marcadas como leídas" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al marcar notificaciones");
  }
};

// ==================== PERSONAL ====================

exports.obtenerPersonal = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.id_usuario, u.nombre, u.correo, u.subrol, r.nombre as rol
      FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol
      WHERE r.nombre IN ('medico', 'enfermera', 'nutriologo', 'jefe_medico')
      ORDER BY r.nombre, u.nombre
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener personal");
  }
};

// ==================== SOLICITUDES DE CAMBIO (JEFE) ====================

exports.obtenerSolicitudesCambio = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT sc.*, d.codigo_cie10, d.descripcion as descripcion_diagnostico,
             p.nombre as nombre_paciente, p.apellido as apellido_paciente, u.nombre as nombre_solicitante
      FROM SolicitudCambio sc
      INNER JOIN Diagnostico d ON sc.id_diagnostico = d.id_diagnostico
      INNER JOIN Paciente p ON d.id_paciente = p.id_paciente
      INNER JOIN Usuario u ON sc.id_usuario_solicitante = u.id_usuario
      WHERE sc.estado = 'pendiente' ORDER BY sc.fecha_solicitud DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener solicitudes");
  }
};

exports.resolverSolicitud = async (req, res) => {
  const { id_solicitud } = req.params;
  const { decision, id_usuario_aprobador, comentario_resolucion } = req.body;
  try {
    const pool = await poolPromise;
    const solicitud = await pool.request().input('id_solicitud', id_solicitud).query(`SELECT * FROM SolicitudCambio WHERE id_solicitud = @id_solicitud`);
    const s = solicitud.recordset[0];
    if (decision === 'aprobado' && s.tipo_solicitud === 'eliminacion') {
      await pool.request().input('id_diagnostico', s.id_diagnostico).query(`UPDATE Diagnostico SET estado = 'eliminado' WHERE id_diagnostico = @id_diagnostico`);
    }
    if (decision === 'aprobado' && s.tipo_solicitud === 'edicion') {
      await pool.request().input('id_diagnostico', s.id_diagnostico).query(`UPDATE Diagnostico SET estado = 'activo' WHERE id_diagnostico = @id_diagnostico`);
    }
    if (decision === 'rechazado') {
      await pool.request().input('id_diagnostico', s.id_diagnostico).query(`UPDATE Diagnostico SET estado = 'activo' WHERE id_diagnostico = @id_diagnostico`);
    }
    await pool.request()
      .input('id_solicitud', id_solicitud).input('estado', decision).input('id_usuario_aprobador', id_usuario_aprobador).input('comentario_resolucion', comentario_resolucion || null)
      .query(`UPDATE SolicitudCambio SET estado=@estado, id_usuario_aprobador=@id_usuario_aprobador, comentario_resolucion=@comentario_resolucion, fecha_resolucion=GETDATE() WHERE id_solicitud=@id_solicitud`);
    res.json({ mensaje: "Solicitud resuelta correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al resolver solicitud");
  }
};

// ==================== NOTAS NUTRICIONALES ====================

exports.obtenerNotasNutricionales = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id_paciente', id_paciente)
      .query(`SELECT nn.*, u.nombre as nombre_nutriologo FROM NotaNutricional nn INNER JOIN Usuario u ON nn.id_usuario = u.id_usuario WHERE nn.id_paciente = @id_paciente ORDER BY nn.fecha DESC, nn.fecha_registro DESC`);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener notas nutricionales");
  }
};

exports.crearNotaNutricional = async (req, res) => {
  const { id_paciente, id_usuario, fecha, tipo_dieta, calorias_recomendadas, plan_alimentario, restricciones_alergias, observaciones, notificar_medico } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente).input('id_usuario', id_usuario).input('fecha', fecha)
      .input('tipo_dieta', tipo_dieta || null).input('calorias_recomendadas', calorias_recomendadas || null)
      .input('plan_alimentario', plan_alimentario || null).input('restricciones_alergias', restricciones_alergias || null)
      .input('observaciones', observaciones || null).input('notificar_medico', notificar_medico ? 1 : 0)
      .query(`INSERT INTO NotaNutricional (id_paciente, id_usuario, fecha, tipo_dieta, calorias_recomendadas, plan_alimentario, restricciones_alergias, observaciones, notificar_medico) OUTPUT INSERTED.id_nota VALUES (@id_paciente, @id_usuario, @fecha, @tipo_dieta, @calorias_recomendadas, @plan_alimentario, @restricciones_alergias, @observaciones, @notificar_medico)`);
    const id_nota = result.recordset[0].id_nota;
    if (notificar_medico) {
      try {
        const pacRes = await pool.request().input('id_paciente', id_paciente).query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id_paciente`);
        const pac = pacRes.recordset[0];
        const nombrePac = pac ? `${pac.nombre} ${pac.apellido}` : `Paciente #${id_paciente}`;
        const nutriRes = await pool.request().input('id_usuario', id_usuario).query(`SELECT nombre FROM Usuario WHERE id_usuario = @id_usuario`);
        const nutriNombre = nutriRes.recordset[0]?.nombre || "Nutriólogo";
        const destinatarios = await pool.request().query(`SELECT u.id_usuario FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol WHERE r.nombre IN ('medico', 'jefe_medico')`);
        const mensaje = `${nutriNombre} ha actualizado el plan nutricional de ${nombrePac}. Se recomienda revisar el expediente.`;
        for (const dest of destinatarios.recordset) {
          await pool.request().input('id_usuario_destino', dest.id_usuario).input('tipo', 'cambio_nutricional').input('mensaje', mensaje).input('id_referencia', id_nota)
            .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@id_usuario_destino, @tipo, @mensaje, @id_referencia, 'NotaNutricional')`);
        }
      } catch (notifErr) { console.error("Error al enviar notificaciones:", notifErr); }
    }
    res.json({ id_nota, notificacion_enviada: !!notificar_medico });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear nota nutricional");
  }
};

// ==================== MEDICAMENTOS ====================

exports.obtenerMedicamentos = async (req, res) => {
  const { tipo } = req.query;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    let where = "WHERE m.activo = 1";
    if (tipo) { where += " AND m.tipo = @tipo"; request.input('tipo', tipo); }
    const result = await request.query(`
      SELECT m.*, u.nombre as nombre_usuario,
             p.nombre as nombre_paciente_exclusivo, p.apellido as apellido_paciente_exclusivo
      FROM Medicamento m
      INNER JOIN Usuario u ON m.id_usuario = u.id_usuario
      LEFT JOIN Paciente p ON m.id_paciente_exclusivo = p.id_paciente
      ${where}
      ORDER BY m.tipo, m.nombre ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener medicamentos");
  }
};

exports.crearMedicamento = async (req, res) => {
  const { tipo, nombre, descripcion, categoria, presentacion, concentracion, unidad_minima, unidad_empaque, cantidad_por_empaque, stock_minimo, es_controlado, id_usuario, id_paciente_exclusivo } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('tipo', tipo).input('nombre', nombre).input('descripcion', descripcion || null)
      .input('categoria', categoria || null).input('presentacion', presentacion || null)
      .input('concentracion', concentracion || null).input('unidad_minima', unidad_minima)
      .input('unidad_empaque', unidad_empaque || null).input('cantidad_por_empaque', cantidad_por_empaque || null)
      .input('stock_minimo', stock_minimo || 5).input('es_controlado', es_controlado ? 1 : 0)
      .input('id_usuario', id_usuario).input('id_paciente_exclusivo', id_paciente_exclusivo || null)
      .query(`
        INSERT INTO Medicamento (tipo, nombre, descripcion, categoria, presentacion, concentracion, unidad_minima, unidad_empaque, cantidad_por_empaque, stock_minimo, es_controlado, id_usuario, id_paciente_exclusivo)
        OUTPUT INSERTED.id_medicamento
        VALUES (@tipo, @nombre, @descripcion, @categoria, @presentacion, @concentracion, @unidad_minima, @unidad_empaque, @cantidad_por_empaque, @stock_minimo, @es_controlado, @id_usuario, @id_paciente_exclusivo)
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear medicamento");
  }
};

exports.actualizarMedicamento = async (req, res) => {
  const { id_medicamento } = req.params;
  const { tipo, nombre, descripcion, categoria, presentacion, concentracion, unidad_minima, unidad_empaque, cantidad_por_empaque, stock_minimo, stock_actual, es_controlado } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_medicamento', id_medicamento)
      .input('tipo', tipo).input('nombre', nombre).input('descripcion', descripcion || null)
      .input('categoria', categoria || null).input('presentacion', presentacion || null)
      .input('concentracion', concentracion || null).input('unidad_minima', unidad_minima)
      .input('unidad_empaque', unidad_empaque || null)
      .input('cantidad_por_empaque', cantidad_por_empaque || null)
      .input('stock_minimo', stock_minimo || 5)
      .input('stock_actual', stock_actual || 0)
      .input('es_controlado', es_controlado ? 1 : 0)
      .query(`
        UPDATE Medicamento SET
          tipo = @tipo, nombre = @nombre, descripcion = @descripcion,
          categoria = @categoria, presentacion = @presentacion,
          concentracion = @concentracion, unidad_minima = @unidad_minima,
          unidad_empaque = @unidad_empaque, cantidad_por_empaque = @cantidad_por_empaque,
          stock_minimo = @stock_minimo, stock_actual = @stock_actual,
          es_controlado = @es_controlado
        WHERE id_medicamento = @id_medicamento
      `);
    res.json({ mensaje: "Medicamento actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al actualizar medicamento");
  }
};

exports.actualizarControlado = async (req, res) => {
  const { id_medicamento } = req.params;
  const { es_controlado } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request().input('id_medicamento', id_medicamento).input('es_controlado', es_controlado ? 1 : 0)
      .query(`UPDATE Medicamento SET es_controlado = @es_controlado WHERE id_medicamento = @id_medicamento`);
    res.json({ mensaje: "Actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al actualizar");
  }
};

exports.registrarMovimiento = async (req, res) => {
  const { id_medicamento, id_usuario, tipo, cantidad, motivo, id_solicitud } = req.body;
  try {
    const pool = await poolPromise;
    if (tipo === 'salida') {
      const stock = await pool.request().input('id_medicamento', id_medicamento).query(`SELECT stock_actual FROM Medicamento WHERE id_medicamento = @id_medicamento`);
      if (stock.recordset[0].stock_actual < cantidad) return res.status(400).json({ error: "Stock insuficiente" });
    }
    await pool.request()
      .input('id_medicamento', id_medicamento).input('id_usuario', id_usuario).input('tipo', tipo)
      .input('cantidad', cantidad).input('motivo', motivo || null).input('id_solicitud', id_solicitud || null)
      .query(`INSERT INTO MovimientoMedicamento (id_medicamento, id_usuario, tipo, cantidad, motivo, id_solicitud) VALUES (@id_medicamento, @id_usuario, @tipo, @cantidad, @motivo, @id_solicitud)`);
    const op = tipo === 'entrada' ? '+' : '-';
    await pool.request().input('id_medicamento', id_medicamento).input('cantidad', cantidad)
      .query(`UPDATE Medicamento SET stock_actual = stock_actual ${op} @cantidad WHERE id_medicamento = @id_medicamento`);
    res.json({ mensaje: "Movimiento registrado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al registrar movimiento");
  }
};

exports.obtenerMovimientos = async (req, res) => {
  const { id_medicamento } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id_medicamento', id_medicamento)
      .query(`
        SELECT 
          m.*, 
          u.nombre as nombre_usuario,
          -- Obtener paciente desde AdministracionMedicamento si es salida por administración
          CASE 
            WHEN m.motivo LIKE '%paciente%' OR m.motivo LIKE '%administrado%' THEN
              (SELECT TOP 1 p.nombre + ' ' + p.apellido 
               FROM AdministracionMedicamento am
               INNER JOIN IndicacionMedicamento im ON am.id_indicacion_med = im.id_medicamento
               INNER JOIN Indicaciones i ON im.id_indicacion = i.id_indicacion
               INNER JOIN Paciente p ON i.id_paciente = p.id_paciente
               WHERE am.id_usuario_enfermera = m.id_usuario
               ORDER BY am.fecha_hora DESC)
            WHEN m.id_solicitud IS NOT NULL THEN
              (SELECT TOP 1 p.nombre + ' ' + p.apellido 
               FROM SolicitudMedicamento sm
               INNER JOIN Paciente p ON sm.id_paciente = p.id_paciente
               WHERE sm.id_solicitud = m.id_solicitud)
            ELSE NULL
          END as nombre_paciente
        FROM MovimientoMedicamento m 
        INNER JOIN Usuario u ON m.id_usuario = u.id_usuario 
        WHERE m.id_medicamento = @id_medicamento 
        ORDER BY m.fecha DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener movimientos");
  }
};

// ==================== SOLICITUDES DE MEDICAMENTO ====================

exports.obtenerSolicitudesMedicamento = async (req, res) => {
  const { estado, id_paciente } = req.query;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    let where = "WHERE 1=1";
    if (estado) { where += " AND sm.estado = @estado"; request.input('estado', estado); }
    if (id_paciente) { where += " AND sm.id_paciente = @id_paciente"; request.input('id_paciente', id_paciente); }
    const result = await request.query(`
      SELECT sm.*,
             p.nombre as nombre_paciente, p.apellido as apellido_paciente,
             u.nombre as nombre_medico,
             m.presentacion, m.concentracion, m.unidad_minima,
             f.nombre as nombre_familiar, f.parentesco, f.telefono,
             am.decision as decision_jefe, am.comentario as comentario_jefe,
             uj.nombre as nombre_jefe,
             em.fecha_entrega, em.id_usuario_enfermera,
             ue.nombre as nombre_enfermera
      FROM SolicitudMedicamento sm
      INNER JOIN Paciente p ON sm.id_paciente = p.id_paciente
      INNER JOIN Usuario u ON sm.id_usuario_medico = u.id_usuario
      LEFT JOIN Medicamento m ON sm.id_medicamento = m.id_medicamento
      LEFT JOIN Familiar f ON sm.id_paciente = f.id_paciente
      LEFT JOIN AprobacionMedicamento am ON sm.id_solicitud = am.id_solicitud
      LEFT JOIN Usuario uj ON am.id_usuario_jefe = uj.id_usuario
      LEFT JOIN EntregaMedicamento em ON sm.id_solicitud = em.id_solicitud
      LEFT JOIN Usuario ue ON em.id_usuario_enfermera = ue.id_usuario
      ${where}
      ORDER BY sm.fecha_solicitud DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener solicitudes de medicamento");
  }
};

exports.crearSolicitudMedicamento = async (req, res) => {
  const { id_paciente, id_usuario_medico, id_medicamento, nombre_medicamento, dosis, cantidad, frecuencia, duracion, via, es_externo, es_controlado, procedencia, farmacia_lugar, fecha_entrega_estimada, observaciones } = req.body;
  try {
    const pool = await poolPromise;
    if (id_medicamento && !es_externo) {
      const med = await pool.request().input('id_medicamento', id_medicamento).query(`SELECT stock_actual FROM Medicamento WHERE id_medicamento = @id_medicamento`);
      if (!med.recordset[0]) return res.status(404).json({ error: "Medicamento no encontrado" });
      if (med.recordset[0].stock_actual < cantidad) return res.status(400).json({ error: "Stock insuficiente" });
    }
    const estadoInicial = (es_controlado || es_externo) ? 'pendiente' : 'listo_recoger';
    const result = await pool.request()
      .input('id_paciente', id_paciente).input('id_usuario_medico', id_usuario_medico)
      .input('id_medicamento', id_medicamento || null).input('nombre_medicamento', nombre_medicamento)
      .input('dosis', dosis || null).input('cantidad', cantidad || 1)
      .input('frecuencia', frecuencia || null).input('duracion', duracion || null).input('via', via || null)
      .input('es_externo', es_externo ? 1 : 0).input('es_controlado', es_controlado ? 1 : 0)
      .input('exclusivo_paciente', es_externo ? 1 : 0)
      .input('procedencia', procedencia || null).input('farmacia_lugar', farmacia_lugar || null)
      .input('fecha_entrega_estimada', fecha_entrega_estimada || null)
      .input('estado', estadoInicial).input('observaciones', observaciones || null)
      .query(`
        INSERT INTO SolicitudMedicamento (id_paciente, id_usuario_medico, id_medicamento, nombre_medicamento, dosis, cantidad, frecuencia, duracion, via, es_externo, es_controlado, exclusivo_paciente, procedencia, farmacia_lugar, fecha_entrega_estimada, estado, observaciones)
        OUTPUT INSERTED.id_solicitud
        VALUES (@id_paciente, @id_usuario_medico, @id_medicamento, @nombre_medicamento, @dosis, @cantidad, @frecuencia, @duracion, @via, @es_externo, @es_controlado, @exclusivo_paciente, @procedencia, @farmacia_lugar, @fecha_entrega_estimada, @estado, @observaciones)
      `);
    const id_solicitud = result.recordset[0].id_solicitud;
    const pacRes = await pool.request().input('id', id_paciente).query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id`);
    const pac = pacRes.recordset[0];
    if (es_controlado || es_externo) {
      const jefes = await pool.request().query(`SELECT u.id_usuario FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol WHERE r.nombre = 'jefe_medico'`);
      const tipo_msg = es_externo ? "externo (familiar)" : "controlado";
      const msg = `Solicitud de medicamento ${tipo_msg}: ${nombre_medicamento} para ${pac.nombre} ${pac.apellido}. Requiere aprobación.`;
      for (const j of jefes.recordset) {
        await pool.request().input('dest', j.id_usuario).input('tipo', 'solicitud_medicamento').input('msg', msg).input('ref', id_solicitud)
          .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'SolicitudMedicamento')`);
      }
    } else {
      const enfermeras = await pool.request().query(`SELECT u.id_usuario FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol WHERE r.nombre = 'enfermera'`);
      const msg = `Medicamento listo para recoger: ${nombre_medicamento} para ${pac.nombre} ${pac.apellido}.`;
      for (const e of enfermeras.recordset) {
        await pool.request().input('dest', e.id_usuario).input('tipo', 'medicamento_listo').input('msg', msg).input('ref', id_solicitud)
          .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'SolicitudMedicamento')`);
      }
    }
    res.json({ id_solicitud });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear solicitud de medicamento");
  }
};

exports.aprobarSolicitudMedicamento = async (req, res) => {
  const { id_solicitud } = req.params;
  const { decision, comentario, id_usuario_jefe } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id_solicitud', id_solicitud).input('id_usuario_jefe', id_usuario_jefe)
      .input('decision', decision).input('comentario', comentario || null)
      .query(`INSERT INTO AprobacionMedicamento (id_solicitud, id_usuario_jefe, decision, comentario) VALUES (@id_solicitud, @id_usuario_jefe, @decision, @comentario)`);
    const sol = await pool.request().input('id', id_solicitud).query(`SELECT * FROM SolicitudMedicamento WHERE id_solicitud = @id`);
    const s = sol.recordset[0];
    if (decision === 'aprobado') {
      if (!s.es_externo) {
        await pool.request().input('id', id_solicitud).query(`UPDATE SolicitudMedicamento SET estado = 'listo_recoger' WHERE id_solicitud = @id`);
        const enfermeras = await pool.request().query(`SELECT u.id_usuario FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol WHERE r.nombre = 'enfermera'`);
        const pacRes = await pool.request().input('id', s.id_paciente).query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id`);
        const pac = pacRes.recordset[0];
        const msg = `Medicamento aprobado listo para recoger: ${s.nombre_medicamento} para ${pac.nombre} ${pac.apellido}.`;
        for (const e of enfermeras.recordset) {
          await pool.request().input('dest', e.id_usuario).input('tipo', 'medicamento_listo').input('msg', msg).input('ref', id_solicitud)
            .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'SolicitudMedicamento')`);
        }
      } else {
        await pool.request().input('id', id_solicitud).query(`UPDATE SolicitudMedicamento SET estado = 'aprobado' WHERE id_solicitud = @id`);
      }
    } else {
      await pool.request().input('id', id_solicitud).query(`UPDATE SolicitudMedicamento SET estado = 'rechazado' WHERE id_solicitud = @id`);
    }
    res.json({ mensaje: "Solicitud resuelta" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al aprobar solicitud");
  }
};

exports.verificarIngresoExterno = async (req, res) => {
  const { id_solicitud } = req.params;
  const { id_usuario_jefe } = req.body;
  try {
    const pool = await poolPromise;
    const sol = await pool.request().input('id', id_solicitud).query(`SELECT * FROM SolicitudMedicamento WHERE id_solicitud = @id`);
    const s = sol.recordset[0];
    if (!s) return res.status(404).json({ error: "Solicitud no encontrada" });
    const medResult = await pool.request()
      .input('nombre', s.nombre_medicamento).input('id_usuario', id_usuario_jefe)
      .input('id_paciente_exclusivo', s.id_paciente).input('cantidad', s.cantidad)
      .query(`INSERT INTO Medicamento (tipo, nombre, unidad_minima, es_controlado, id_usuario, id_paciente_exclusivo, stock_actual, activo) OUTPUT INSERTED.id_medicamento VALUES ('no_controlado', @nombre, 'unidad', 0, @id_usuario, @id_paciente_exclusivo, @cantidad, 1)`);
    const id_medicamento = medResult.recordset[0].id_medicamento;
    await pool.request().input('id_medicamento', id_medicamento).input('id_usuario', id_usuario_jefe).input('cantidad', s.cantidad).input('id_solicitud', id_solicitud)
      .query(`INSERT INTO MovimientoMedicamento (id_medicamento, id_usuario, tipo, cantidad, motivo, id_solicitud) VALUES (@id_medicamento, @id_usuario, 'entrada', @cantidad, 'Medicamento externo verificado por jefe médico', @id_solicitud)`);
    await pool.request().input('id', id_solicitud).input('id_medicamento', id_medicamento)
      .query(`UPDATE SolicitudMedicamento SET estado = 'listo_recoger', id_medicamento = @id_medicamento WHERE id_solicitud = @id`);
    const enfermeras = await pool.request().query(`SELECT u.id_usuario FROM Usuario u INNER JOIN Rol r ON u.id_rol = r.id_rol WHERE r.nombre = 'enfermera'`);
    const pacRes = await pool.request().input('id', s.id_paciente).query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id`);
    const pac = pacRes.recordset[0];
    const msg = `Medicamento externo verificado: ${s.nombre_medicamento} para ${pac.nombre} ${pac.apellido}. Listo para recoger.`;
    for (const e of enfermeras.recordset) {
      await pool.request().input('dest', e.id_usuario).input('tipo', 'medicamento_listo').input('msg', msg).input('ref', id_solicitud)
        .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'SolicitudMedicamento')`);
    }
    res.json({ mensaje: "Medicamento verificado e ingresado al almacén" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al verificar ingreso");
  }
};

exports.registrarEntregaEnfermera = async (req, res) => {
  const { id_solicitud } = req.params;
  const { id_usuario_enfermera, observaciones } = req.body;
  try {
    const pool = await poolPromise;
    const sol = await pool.request().input('id', id_solicitud).query(`SELECT * FROM SolicitudMedicamento WHERE id_solicitud = @id`);
    const s = sol.recordset[0];
    if (!s) return res.status(404).json({ error: "Solicitud no encontrada" });
    await pool.request()
      .input('id_solicitud', id_solicitud).input('id_usuario_enfermera', id_usuario_enfermera)
      .input('cantidad', s.cantidad).input('observaciones', observaciones || null)
      .query(`INSERT INTO EntregaMedicamento (id_solicitud, id_usuario_enfermera, cantidad_entregada, observaciones) VALUES (@id_solicitud, @id_usuario_enfermera, @cantidad, @observaciones)`);
    if (s.id_medicamento) {
      await pool.request().input('id_medicamento', s.id_medicamento).input('cantidad', s.cantidad).input('id_usuario', id_usuario_enfermera).input('id_solicitud', id_solicitud)
        .query(`UPDATE Medicamento SET stock_actual = stock_actual - @cantidad WHERE id_medicamento = @id_medicamento; INSERT INTO MovimientoMedicamento (id_medicamento, id_usuario, tipo, cantidad, motivo, id_solicitud) VALUES (@id_medicamento, @id_usuario, 'salida', @cantidad, 'Entregado a enfermera para paciente', @id_solicitud);`);
    }
    await pool.request().input('id', id_solicitud).query(`UPDATE SolicitudMedicamento SET estado = 'entregado' WHERE id_solicitud = @id`);
    res.json({ mensaje: "Entrega registrada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al registrar entrega");
  }
};

exports.obtenerMedicamentosPaciente = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id_paciente', id_paciente)
      .query(`
        SELECT sm.*, u.nombre as nombre_medico, am.decision as decision_jefe,
               em.fecha_entrega, ue.nombre as nombre_enfermera
        FROM SolicitudMedicamento sm
        INNER JOIN Usuario u ON sm.id_usuario_medico = u.id_usuario
        LEFT JOIN AprobacionMedicamento am ON sm.id_solicitud = am.id_solicitud
        LEFT JOIN EntregaMedicamento em ON sm.id_solicitud = em.id_solicitud
        LEFT JOIN Usuario ue ON em.id_usuario_enfermera = ue.id_usuario
        WHERE sm.id_paciente = @id_paciente
        ORDER BY sm.fecha_solicitud DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener medicamentos del paciente");
  }
};

// ==================== ÁREA CLÍNICA ====================

exports.obtenerPacientesClinico = async (req, res) => {
  const { busqueda } = req.query;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    let where = "WHERE e.id_expediente IS NOT NULL";
    if (busqueda) {
      where += " AND (p.nombre LIKE @busqueda OR p.apellido LIKE @busqueda)";
      request.input('busqueda', `%${busqueda}%`);
    }
    const result = await request.query(`
      SELECT 
        p.id_paciente, p.nombre, p.apellido, p.edad, p.genero, p.telefono,
        e.id_expediente, e.estado,
        DATEDIFF(day, e.fecha_apertura, GETDATE()) as dias_tratamiento,
        f.nombre as contacto_nombre, f.parentesco as contacto_parentesco, 
        f.telefono as contacto_telefono
      FROM Paciente p
      INNER JOIN Expediente e ON p.id_paciente = e.id_paciente
      LEFT JOIN Familiar f ON p.id_paciente = f.id_paciente
      ${where}
      ORDER BY p.nombre ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener pacientes clínicos");
  }
};

exports.obtenerNotasClinicas = async (req, res) => {
  const { id_paciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id_paciente', id_paciente)
      .query(`
        SELECT nc.*, u.nombre as nombre_clinico
        FROM NotaClinica nc
        INNER JOIN Usuario u ON nc.id_usuario = u.id_usuario
        WHERE nc.id_paciente = @id_paciente
        ORDER BY nc.fecha DESC, nc.hora DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener notas clínicas");
  }
};

exports.crearNotaClinica = async (req, res) => {
  const {
    id_paciente, id_usuario, rol_clinico, fecha, hora,
    estado_general, observaciones_generales, acuerdos_compromisos, seguimiento_requerido,
    // Psicólogo
    tecnica_utilizada, estado_emocional, avance_terapeutico,
    // Consejero
    tema_tratado, nivel_motivacion, acuerdos_consejeria,
    // Terapeuta Grupo
    dinamica_grupal, participacion, cohesion_grupo,
    // Terapeuta Familiar
    tipo_visita, actitud_familiar, observaciones_visita,
    // Notificación
    notificar_medico, motivo_notificacion
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .input('id_usuario', id_usuario)
      .input('rol_clinico', rol_clinico)
      .input('fecha', fecha)
      .input('hora', hora)
      .input('estado_general', estado_general)
      .input('observaciones_generales', observaciones_generales || null)
      .input('acuerdos_compromisos', acuerdos_compromisos || null)
      .input('seguimiento_requerido', seguimiento_requerido ? 1 : 0)
      .input('tecnica_utilizada', tecnica_utilizada || null)
      .input('estado_emocional', estado_emocional || null)
      .input('avance_terapeutico', avance_terapeutico || null)
      .input('tema_tratado', tema_tratado || null)
      .input('nivel_motivacion', nivel_motivacion || null)
      .input('acuerdos_consejeria', acuerdos_consejeria || null)
      .input('dinamica_grupal', dinamica_grupal || null)
      .input('participacion', participacion || null)
      .input('cohesion_grupo', cohesion_grupo || null)
      .input('tipo_visita', tipo_visita || null)
      .input('actitud_familiar', actitud_familiar || null)
      .input('observaciones_visita', observaciones_visita || null)
      .input('notificar_medico', notificar_medico ? 1 : 0)
      .input('motivo_notificacion', motivo_notificacion || null)
      .query(`
        INSERT INTO NotaClinica (
          id_paciente, id_usuario, rol_clinico, fecha, hora,
          estado_general, observaciones_generales, acuerdos_compromisos, seguimiento_requerido,
          tecnica_utilizada, estado_emocional, avance_terapeutico,
          tema_tratado, nivel_motivacion, acuerdos_consejeria,
          dinamica_grupal, participacion, cohesion_grupo,
          tipo_visita, actitud_familiar, observaciones_visita,
          notificar_medico, motivo_notificacion
        )
        OUTPUT INSERTED.id_nota
        VALUES (
          @id_paciente, @id_usuario, @rol_clinico, @fecha, @hora,
          @estado_general, @observaciones_generales, @acuerdos_compromisos, @seguimiento_requerido,
          @tecnica_utilizada, @estado_emocional, @avance_terapeutico,
          @tema_tratado, @nivel_motivacion, @acuerdos_consejeria,
          @dinamica_grupal, @participacion, @cohesion_grupo,
          @tipo_visita, @actitud_familiar, @observaciones_visita,
          @notificar_medico, @motivo_notificacion
        )
      `);
    const id_nota = result.recordset[0].id_nota;

    if (notificar_medico) {
      try {
        const pacRes = await pool.request().input('id', id_paciente).query(`SELECT nombre, apellido FROM Paciente WHERE id_paciente = @id`);
        const pac = pacRes.recordset[0];
        const usuRes = await pool.request().input('id', id_usuario).query(`SELECT nombre FROM Usuario WHERE id_usuario = @id`);
        const clinico = usuRes.recordset[0]?.nombre || "Área clínica";
        const rolLabel = { psicologo: "Psicólogo", consejero: "Consejero", terapeuta_grupo: "Terapeuta de Grupo", terapeuta_familiar: "Terapeuta Familiar" };
        const msg = `${rolLabel[rol_clinico] || rol_clinico} ${clinico} requiere asistencia médica para ${pac.nombre} ${pac.apellido}. Motivo: ${motivo_notificacion || "No especificado"}`;
        const destinatarios = await pool.request().query(`
          SELECT u.id_usuario FROM Usuario u
          INNER JOIN Rol r ON u.id_rol = r.id_rol
          WHERE r.nombre IN ('medico', 'jefe_medico')
        `);
        for (const dest of destinatarios.recordset) {
          await pool.request()
            .input('dest', dest.id_usuario).input('tipo', 'alerta_clinica')
            .input('msg', msg).input('ref', id_nota)
            .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'NotaClinica')`);
        }
      } catch (notifErr) { console.error("Error al enviar notificación clínica:", notifErr); }
    }

    res.json({ id_nota, notificacion_enviada: !!notificar_medico });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear nota clínica");
  }
};

// ==================== ADMINISTRACIÓN MEDICAMENTO (ENFERMERA) ====================

exports.obtenerIndicacionesEnfermera = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        im.id_medicamento as id_indicacion_med,
        im.id_indicacion,
        im.nombre as nombre_medicamento,
        im.dosis,
        im.frecuencia,
        im.frecuencia_horas,
        im.duracion,
        im.duracion_dias,
        im.via,
        im.total_dosis,
        im.fecha_inicio,
        im.fecha_fin,
        im.requiere_receta,
        i.fecha as fecha_indicacion,
        i.id_paciente,
        p.nombre as nombre_paciente,
        p.apellido as apellido_paciente,
        u.nombre as nombre_medico,
        e.id_expediente,
        e.estado as estado_paciente,
        (SELECT COUNT(*) FROM AdministracionMedicamento am 
         WHERE am.id_indicacion_med = im.id_medicamento) as dosis_administradas,
        (SELECT TOP 1 CONVERT(varchar(19), am.fecha_hora, 120)
         FROM AdministracionMedicamento am 
         WHERE am.id_indicacion_med = im.id_medicamento 
         ORDER BY am.fecha_hora DESC) as ultima_administracion,
        (SELECT TOP 1 CONVERT(varchar(19), DATEADD(HOUR, im.frecuencia_horas, am.fecha_hora), 120)
         FROM AdministracionMedicamento am 
         WHERE am.id_indicacion_med = im.id_medicamento 
         ORDER BY am.fecha_hora DESC) as proxima_dosis,
        -- Aprobacion: si NO requiere receta siempre es 1
        -- Si requiere receta, buscar si existe aprobacion con decision aprobado
        CASE 
          WHEN im.requiere_receta = 0 THEN 1
          WHEN im.requiere_receta = 1 AND EXISTS (
            SELECT 1 FROM SolicitudMedicamento sm
            INNER JOIN AprobacionMedicamento ap ON sm.id_solicitud = ap.id_solicitud
            WHERE sm.id_paciente = i.id_paciente
              AND sm.nombre_medicamento = im.nombre
              AND ap.decision = 'aprobado'
          ) THEN 1
          ELSE 0
        END as aprobado_jefe,
        -- Minutos restantes
        CASE 
          WHEN (SELECT COUNT(*) FROM AdministracionMedicamento am 
                WHERE am.id_indicacion_med = im.id_medicamento) = 0 THEN 0
          WHEN im.frecuencia_horas IS NULL THEN 0
          ELSE DATEDIFF(MINUTE, GETDATE(), 
               (SELECT TOP 1 DATEADD(HOUR, im.frecuencia_horas, am.fecha_hora) 
                FROM AdministracionMedicamento am 
                WHERE am.id_indicacion_med = im.id_medicamento 
                ORDER BY am.fecha_hora DESC))
        END as minutos_restantes,
        -- Puede administrar (solo tiempo, la aprobacion se verifica aparte)
        CASE 
          WHEN (SELECT COUNT(*) FROM AdministracionMedicamento am 
                WHERE am.id_indicacion_med = im.id_medicamento) = 0 THEN 1
          WHEN im.frecuencia_horas IS NULL THEN 1
          WHEN GETDATE() >= (SELECT TOP 1 DATEADD(HOUR, im.frecuencia_horas, am.fecha_hora) 
                             FROM AdministracionMedicamento am 
                             WHERE am.id_indicacion_med = im.id_medicamento 
                             ORDER BY am.fecha_hora DESC) THEN 1
          ELSE 0
        END as puede_administrar
      FROM IndicacionMedicamento im
      INNER JOIN Indicaciones i ON im.id_indicacion = i.id_indicacion
      INNER JOIN Paciente p ON i.id_paciente = p.id_paciente
      INNER JOIN Usuario u ON i.id_usuario = u.id_usuario
      INNER JOIN Expediente e ON p.id_paciente = e.id_paciente
      WHERE (im.fecha_fin IS NULL OR im.fecha_fin >= GETDATE())
        AND (im.total_dosis IS NULL OR 
             (SELECT COUNT(*) FROM AdministracionMedicamento am 
              WHERE am.id_indicacion_med = im.id_medicamento) < im.total_dosis)
      ORDER BY p.nombre, im.nombre
    `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener indicaciones enfermera");
  }
};

exports.obtenerAdministraciones = async (req, res) => {
  const { id_indicacion_med } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_indicacion_med', id_indicacion_med)
      .query(`
        SELECT am.*, u.nombre as nombre_enfermera
        FROM AdministracionMedicamento am
        INNER JOIN Usuario u ON am.id_usuario_enfermera = u.id_usuario
        WHERE am.id_indicacion_med = @id_indicacion_med
        ORDER BY am.fecha_hora DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener administraciones");
  }
};

exports.registrarAdministracion = async (req, res) => {
  const { id_indicacion_med, id_usuario_enfermera, numero_dosis, observaciones } = req.body;
  try {
    const pool = await poolPromise;

    // Obtener info de la indicación
    const medInfo = await pool.request()
      .input('id', id_indicacion_med)
      .query(`
        SELECT im.*, i.id_paciente
        FROM IndicacionMedicamento im
        INNER JOIN Indicaciones i ON im.id_indicacion = i.id_indicacion
        WHERE im.id_medicamento = @id
      `);

    const med = medInfo.recordset[0];

    // Registrar administración
    const result = await pool.request()
      .input('id_indicacion_med', id_indicacion_med)
      .input('id_usuario_enfermera', id_usuario_enfermera)
      .input('numero_dosis', numero_dosis)
      .input('observaciones', observaciones || null)
      .query(`
        INSERT INTO AdministracionMedicamento (id_indicacion_med, id_usuario_enfermera, fecha_hora, numero_dosis, observaciones)
        OUTPUT INSERTED.id_administracion
        VALUES (@id_indicacion_med, @id_usuario_enfermera, GETDATE(), @numero_dosis, @observaciones)
      `);

    // Buscar medicamento en almacén por nombre y paciente
    if (med) {
      const almacenRes = await pool.request()
        .input('nombre', med.nombre)
        .input('id_paciente', med.id_paciente)
        .query(`
          SELECT TOP 1 id_medicamento, stock_actual, stock_minimo, nombre
          FROM Medicamento
          WHERE activo = 1
            AND (
              -- Medicamento exclusivo del paciente
              (id_paciente_exclusivo = @id_paciente AND nombre = @nombre)
              OR
              -- Medicamento general del almacén
              (id_paciente_exclusivo IS NULL AND nombre = @nombre)
            )
          ORDER BY id_paciente_exclusivo DESC -- Priorizar exclusivo del paciente
        `);

      if (almacenRes.recordset.length > 0) {
        const almacen = almacenRes.recordset[0];

        if (almacen.stock_actual > 0) {
          // Descontar stock
          await pool.request()
            .input('id_medicamento', almacen.id_medicamento)
            .query(`UPDATE Medicamento SET stock_actual = stock_actual - 1 WHERE id_medicamento = @id_medicamento`);

          // Registrar movimiento
          await pool.request()
            .input('id_medicamento', almacen.id_medicamento)
            .input('id_usuario', id_usuario_enfermera)
            .query(`
              INSERT INTO MovimientoMedicamento (id_medicamento, id_usuario, tipo, cantidad, motivo)
              VALUES (@id_medicamento, @id_usuario, 'salida', 1, 'Administrado a paciente por enfermera')
            `);

          // Verificar stock mínimo y notificar al jefe
          const stockActualizado = almacen.stock_actual - 1;
          if (stockActualizado <= almacen.stock_minimo) {
            const jefes = await pool.request().query(`
              SELECT u.id_usuario FROM Usuario u
              INNER JOIN Rol r ON u.id_rol = r.id_rol
              WHERE r.nombre = 'jefe_medico'
            `);
            const msg = `⚠️ Stock mínimo alcanzado: ${almacen.nombre} — Stock actual: ${stockActualizado} unidades. Se recomienda generar una requisición.`;
            for (const j of jefes.recordset) {
              await pool.request()
                .input('dest', j.id_usuario)
                .input('tipo', 'stock_minimo')
                .input('msg', msg)
                .input('ref', almacen.id_medicamento)
                .query(`INSERT INTO Notificacion (id_usuario_destino, tipo, mensaje, id_referencia, tabla_referencia) VALUES (@dest, @tipo, @msg, @ref, 'Medicamento')`);
            }
          }
        }
      }
    }

    res.json({ id_administracion: result.recordset[0].id_administracion });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al registrar administración");
  }
};

// ==================== REQUISICIONES (JEFE MÉDICO) ====================

exports.obtenerRequisiciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.*, u.nombre as nombre_jefe,
             m.nombre as nombre_medicamento_ref
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

exports.crearRequisicion = async (req, res) => {
  const { id_usuario_jefe, tipo, descripcion, cantidad, unidad, motivo, id_medicamento } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_usuario_jefe', id_usuario_jefe)
      .input('tipo', tipo)
      .input('descripcion', descripcion)
      .input('cantidad', cantidad)
      .input('unidad', unidad || null)
      .input('motivo', motivo || null)
      .input('id_medicamento', id_medicamento || null)
      .query(`
        INSERT INTO Requisicion (id_usuario_jefe, tipo, descripcion, cantidad, unidad, motivo, id_medicamento, estado)
        OUTPUT INSERTED.id_requisicion
        VALUES (@id_usuario_jefe, @tipo, @descripcion, @cantidad, @unidad, @motivo, @id_medicamento, 'pendiente')
      `);
    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear requisición");
  }
};