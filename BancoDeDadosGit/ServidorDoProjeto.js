const express = require('express');
const mysql = require('mysql');
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

app.post('/lanches', (req, res) => {
  const { titulo, preco, categoria, descricao } = req.body;
  connection.query(
    'INSERT INTO lanches (titulo, preco, categoria, descricao) VALUES (?, ?, ?, ?)',
    [titulo, preco, categoria, descricao],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir lanche:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }
      res.status(201).send('Lanche adicionado com sucesso');
    }
  );
});

app.put('/lanches/:id', (req, res) => {
  const lancheId = req.params.id;
  const { titulo, preco, categoria, descricao } = req.body;
  connection.query(
    'UPDATE lanches SET titulo = ?, preco = ?, categoria = ?, descricao = ? WHERE id = ?',
    [titulo, preco, categoria, descricao, lancheId],
    (err, result) => {
      if (err) {
        console.error('Erro ao atualizar lanche:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }
      res.send('Lanche atualizado com sucesso');
    }
  );
});

app.delete('/lanches/:id', (req, res) => {
  const lancheId = req.params.id;
  connection.query('DELETE FROM lanches WHERE id = ?', [lancheId], (err, result) => {
    if (err) {
      console.error('Erro ao deletar lanche:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('Lanche não encontrado');
      return;
    }
    res.status(200).send('Lanche deletado com sucesso');
  });
});

app.get('/pedidos', (req, res) => {
  connection.query('SELECT * FROM pedidos', (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    res.json(rows);
  });
});

app.get('/pedidos/:id', (req, res) => {
  const pedidoId = req.params.id;
  connection.query('SELECT * FROM pedidos WHERE id = ?', [pedidoId], (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    if (rows.length === 0) {
      res.status(404).send('Pedido não encontrado');
      return;
    }
    res.json(rows[0]);
  });
});

app.post('/pedidos', (req, res) => {
  const { cliente_nome, total, forma_pagamento, cidade, endereco, cep, itens_pedidos, status_pedido } = req.body;
  connection.query(
    'INSERT INTO pedidos (cliente_nome, total, forma_pagamento, cidade, endereco, cep, itens_pedidos, status_pedido) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [cliente_nome, total, forma_pagamento, cidade, endereco, cep, itens_pedidos, status_pedido],
    (err, result) => {
      if (err) {
        console.error('Erro ao inserir pedido:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }
      res.status(201).send('Pedido adicionado com sucesso');
    }
  );
});

app.put('/pedidos/:id', (req, res) => {
  const pedidoId = req.params.id;
  const { cliente_nome, total, forma_pagamento, cidade, endereco, cep, itens_pedidos, status_pedido } = req.body;
  connection.query(
    'UPDATE pedidos SET cliente_nome = ?, total = ?, forma_pagamento = ?, cidade = ?, endereco = ?, cep = ?, itens_pedidos = ?, status_pedido = ? WHERE id = ?',
    [cliente_nome, total, forma_pagamento, cidade, endereco, cep, itens_pedidos, status_pedido, pedidoId],
    (err, result) => {
      if (err) {
        console.error('Erro ao atualizar pedido:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }
      res.send('Pedido atualizado com sucesso');
    }
  );
});


app.delete('/pedidos/:id', (req, res) => {
  const pedidoId = req.params.id;
  connection.query('DELETE FROM pedidos WHERE id = ?', [pedidoId], (err, result) => {
    if (err) {
      console.error('Erro ao deletar pedido:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('Pedido não encontrado');
      return;
    }
    res.status(200).send('Pedido deletado com sucesso');
  });
});

app.get('*', (req, res) => {
  res.status(404).send('Página não encontrada');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
