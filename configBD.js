const mysql = require('mysql');
 
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'Acaiteria'
  });

connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      throw err;
    }
    console.log('Conexão bem-sucedida ao banco de dados');
  });

module.exports = {connection}