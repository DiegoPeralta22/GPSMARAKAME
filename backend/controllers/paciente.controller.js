const { sql, pool, poolConnect } = require('../db/connection');

exports.buscarPacientes = async (req, res) => {
  const { nombre } = req.query;
  if (!nombre) return res.json([]);

  try {
    await poolConnect;

    const result = await pool.request()
      .input('nombre', `%${nombre}%`)
      .query(`
        SELECT id_paciente, nombre, apellido, edad
        FROM Paciente
        WHERE nombre LIKE @nombre OR apellido LIKE @nombre
        ORDER BY nombre
      `);

    res.json(result.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error al buscar pacientes");
  }
};

exports.crearPaciente = async (req, res) => {
  const {
    nombre,
    apellido,
    fecha_nacimiento,
    edad,
    genero,
    telefono,
    direccion,
    estado_civil,
    escolaridad,
    ocupacion
  } = req.body;

  try {
    await poolConnect;

    const edadInt = edad ? parseInt(edad) : null;

    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre || null)
      .input('apellido', sql.NVarChar, apellido || null)
      .input('fecha_nacimiento', sql.Date, fecha_nacimiento || null)
      .input('edad', sql.Int, isNaN(edadInt) ? null : edadInt)
      .input('genero', sql.NVarChar, genero || null)
      .input('telefono', sql.NVarChar, telefono || null)
      .input('direccion', sql.NVarChar, direccion || null)
      .input('estado_civil', sql.NVarChar, estado_civil || null)
      .input('escolaridad', sql.NVarChar, escolaridad || null)
      .input('ocupacion', sql.NVarChar, ocupacion || null)
      .query(`
        INSERT INTO Paciente (
          nombre,
          apellido,
          fecha_nacimiento,
          edad,
          genero,
          telefono,
          direccion,
          estado_civil,
          escolaridad,
          ocupacion
        )
        OUTPUT INSERTED.id_paciente
        VALUES (
          @nombre,
          @apellido,
          @fecha_nacimiento,
          @edad,
          @genero,
          @telefono,
          @direccion,
          @estado_civil,
          @escolaridad,
          @ocupacion
        )
      `);

    res.json(result.recordset[0]);

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear paciente");
  }
};