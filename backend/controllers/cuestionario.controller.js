const { pool, poolConnect } = require('../db/connection');

exports.crearCuestionario = async (req, res) => {
  const { id_paciente } = req.body;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('id_paciente', id_paciente)
      .query(`
        INSERT INTO Cuestionario (id_paciente)
        OUTPUT INSERTED.id_cuestionario
        VALUES (@id_paciente)
      `);

    res.json(result.recordset[0]);

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear cuestionario");
  }
};