const { pool, poolConnect } = require('../db/connection');

exports.login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('correo', correo)
      .input('password', password)
      .query(`
        SELECT * FROM Usuario
        WHERE correo = @correo AND password = @password
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