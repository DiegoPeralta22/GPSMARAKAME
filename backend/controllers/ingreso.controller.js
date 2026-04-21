const { sql, pool, poolConnect } = require('../db/connection');

exports.guardarIngreso = async (req, res) => {
  const { id_cuestionario, respuestas } = req.body;

  try {
    await poolConnect;

    const cuestionarioId = parseInt(id_cuestionario);
    if (isNaN(cuestionarioId)) {
      return res.status(400).send("id_cuestionario inválido");
    }

    const ids = respuestas.map(r => parseInt(r.id_pregunta)).filter(id => !isNaN(id));
    if (ids.length !== respuestas.length) {
      return res.status(400).send("IDs de pregunta inválidos");
    }

    const validacion = await pool.request()
      .query(`SELECT id_pregunta FROM Pregunta WHERE id_pregunta IN (${ids.join(',')})`);

    const idsValidos = validacion.recordset.map(r => r.id_pregunta);
    const invalidas = ids.filter(id => !idsValidos.includes(id));

    if (invalidas.length > 0) {
      return res.status(400).send(`Preguntas inválidas: ${invalidas.join(', ')}`);
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      for (let i = 0; i < respuestas.length; i++) {
        const r = respuestas[i];
        await transaction.request()
          .input('id_cuestionario', sql.Int, cuestionarioId)
          .input('id_pregunta', sql.Int, ids[i])
          .input('respuesta', sql.NVarChar, r.respuesta)
          .query(`
            INSERT INTO RespuestaCuestionario
            (id_cuestionario, id_pregunta, respuesta)
            VALUES (@id_cuestionario, @id_pregunta, @respuesta)
          `);
      }

      await transaction.commit();
      res.send("Ingreso guardado correctamente");

    } catch (innerError) {
      await transaction.rollback();
      throw innerError;
    }

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al guardar ingreso");
  }
};