var mysql = require('mysql');
var config = require('../secret/db_info').dev;
const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  connectionLimit: 1,
  waitForConnections: true
});

module.exports = pool;
