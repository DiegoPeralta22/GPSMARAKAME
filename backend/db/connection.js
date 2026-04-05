const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=MARAKAMEV1;Trusted_Connection=yes;"
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql,
  pool,
  poolConnect
};