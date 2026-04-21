const { sql, pool, poolConnect } = require('../db/connection');

exports.crearFamiliar = async (req, res) => {
  const { id_paciente, nombre, parentesco, telefono, direccion } = req.body;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('id_paciente', sql.Int, parseInt(id_paciente))
      .input('nombre', sql.NVarChar, nombre)
      .input('parentesco', sql.NVarChar, parentesco)
      .input('telefono', sql.NVarChar, telefono)
      .input('direccion', sql.NVarChar, direccion)
      .query(`
        INSERT INTO Familiar (id_paciente, nombre, parentesco, telefono, direccion)
        OUTPUT INSERTED.id_familiar
        VALUES (@id_paciente, @nombre, @parentesco, @telefono, @direccion)
      `);

    res.json(result.recordset[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al guardar familiar");
  }
};
