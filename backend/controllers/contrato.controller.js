const { sql, pool, poolConnect } = require('../db/connection');

exports.subirContrato = async (req, res) => {
  const { id_paciente, tipo } = req.body;
  const archivo = req.file;

  if (!archivo) return res.status(400).send("No se subió ningún archivo");

  try {
    await poolConnect;

    await pool.request()
      .input('id_paciente', sql.Int, parseInt(id_paciente))
      .input('tipo', sql.NVarChar, tipo)
      .input('contenido', sql.NVarChar, archivo.filename)
      .input('firmado', sql.Bit, 0)
      .query(`
        INSERT INTO Contrato (id_paciente, tipo, contenido, firmado)
        VALUES (@id_paciente, @tipo, @contenido, @firmado)
      `);

    res.json({ mensaje: "Contrato guardado", archivo: archivo.filename });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al guardar contrato");
  }
};

exports.obtenerContratos = async (req, res) => {
  const { id_paciente } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('id_paciente', sql.Int, parseInt(id_paciente))
      .query(`SELECT * FROM Contrato WHERE id_paciente = @id_paciente ORDER BY fecha DESC`);

    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener contratos");
  }
};

exports.getPacientesAptos = async (req, res) => {
  try {
    await poolConnect;

    let result;
    try {
      result = await pool.request().query(`
        SELECT p.id_paciente, p.nombre, p.apellido, p.edad,
               (SELECT TOP 1 fecha FROM DecisionIngreso WHERE id_paciente = p.id_paciente AND decision = 'aprobado' ORDER BY fecha DESC) as fecha_aprobacion,
               (SELECT COUNT(*) FROM Contrato WHERE id_paciente = p.id_paciente) as num_contratos
        FROM Paciente p
        WHERE (SELECT TOP 1 decision FROM DecisionIngreso WHERE id_paciente = p.id_paciente ORDER BY fecha DESC) = 'aprobado'
        ORDER BY p.id_paciente DESC
      `);
    } catch (e) {
      result = await pool.request().query(`
        SELECT p.id_paciente, p.nombre, p.apellido, p.edad,
               NULL as fecha_aprobacion,
               (SELECT COUNT(*) FROM Contrato WHERE id_paciente = p.id_paciente) as num_contratos
        FROM Paciente p ORDER BY p.id_paciente DESC
      `);
    }

    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al obtener pacientes aptos");
  }
};
