const { pool, poolConnect } = require('../db/connection');

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

    const result = await pool.request()
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('fecha_nacimiento', fecha_nacimiento)
      .input('edad', edad)
      .input('genero', genero)
      .input('telefono', telefono)
      .input('direccion', direccion)
      .input('estado_civil', estado_civil)
      .input('escolaridad', escolaridad)
      .input('ocupacion', ocupacion)
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