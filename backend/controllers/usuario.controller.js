const { pool, poolConnect } = require('../db/connection');

exports.getUsuarios = async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request().query('SELECT * FROM Usuario');
    res.json(result.recordset);

  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
};