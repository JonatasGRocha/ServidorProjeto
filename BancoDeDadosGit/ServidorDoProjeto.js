const express = require('express');  
const mysql = require('mysql');      
const { LATIN2_CZECH_CS } = require('mysql/lib/protocol/constants/charsets');
const app = express();               
const port = 3000;                   

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

app.use(express.json());

  app.get('/lanches', (req, res) => {
    connection.query('SELECT * FROM lanches', (err, rows) => {  
      if (err) {                                               
        console.error('Erro ao executar a consulta:', err);
        res.status(500).send('Erro interno do servidor');      
        return;
      }
      res.json(rows);  
    });
  });

  app.get('/lanches/:id', (req, res) => {
    const lancheId = req.params.id;   
    connection.query('SELECT * FROM lanches WHERE id = ?', [lancheId], (err, rows) => {  
      if (err) {                                       
        console.error('Erro ao executar a consulta:', err);
        res.status(500).send('Erro interno do servidor');  
        return;
      }
      if (rows.length === 0) {                          
        res.status(404).send('Lanche não encontrado');
        return;
      }
      res.json(rows[0]); 
    });
  });

  app.get('/categorias/:id', (req, res) => {
    const categoriaId = req.params.id;   
    connection.query('SELECT * FROM lanches WHERE categoria = ?', [categoriaId], (err, rows) => {  
        if (err) {                                       
            console.error('Erro ao executar a consulta:', err);
            res.status(500).send('Erro interno do servidor');  
            return;
        }
        if (rows.length === 0) {                          
            res.status(404).send('Nenhum lanche encontrado para essa categoria');
            return;
        } 
        for (let i = 0; i < rows.length; i++) {
            console.log(`Lanche ${i + 1}:`, rows[i]);     
        }
        res.json(rows);  
    });
});



  app.get('*', (req, res) => {
    res.status(404).send('Página não encontrada');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`); 
});