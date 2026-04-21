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
