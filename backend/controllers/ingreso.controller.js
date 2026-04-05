const { pool, poolConnect } = require('../db/connection');

exports.guardarIngreso = async (req, res) => {
  const { id_cuestionario, respuestas } = req.body;

  try {
    await poolConnect;

    for (let r of respuestas) {

      // 🔥 VALIDAR SOLO PREGUNTAS 1–31
      if (r.id_pregunta < 1 || r.id_pregunta > 31) {
        return res.status(400).send(`Pregunta inválida: ${r.id_pregunta}`);
      }

      await pool.request()
        .input('id_cuestionario', id_cuestionario)
        .input('id_pregunta', r.id_pregunta)
        .input('respuesta', r.respuesta)
        .query(`
          INSERT INTO RespuestaCuestionario
          (id_cuestionario, id_pregunta, respuesta)
          VALUES (@id_cuestionario, @id_pregunta, @respuesta)
        `);
    }

    res.send("Ingreso guardado correctamente");

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al guardar ingreso");
  }
};