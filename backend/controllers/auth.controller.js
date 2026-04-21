const { pool, poolConnect } = require('../db/connection');

exports.login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('correo', correo)
      .input('password', password)
      .query(`
        SELECT u.id_usuario, u.nombre, u.correo, u.subrol, r.nombre AS rol
        FROM Usuario u
        JOIN Rol r ON u.id_rol = r.id_rol
        WHERE u.correo = @correo AND u.password = @password
      `);

    if (result.recordset.length > 0) {
      res.json({
        success: true,
        user: result.recordset[0]
      });
    } else {
      res.json({ success: false });
    }

  } catch (error) {
    console.log(error);
    res.status(500).send("Error en servidor");
  }
};