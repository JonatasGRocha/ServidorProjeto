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

//lanches

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

//pedidos

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

app.post('/filtro', (req, res) => {
  const {
    id,
    titulo,
    preco,
    categoria,
    descricao,
    cliente_nome: clienteNome,
    total,
    forma_pagamento: formaPagamento,
    cidade,
    endereco,
    cep,
    data_pedido: dataPedido,
    status_pedido: statusPedido,
    quantidade,
    data_inicio: dataInicio,
    data_fim: dataFim,
    ordenar_por: ordenarPor,
    campos // campos a serem retornados
  } = req.body;

  // Definir os campos a serem retornados, se especificados
  const defaultFields = 'lanches.*, pedidos.*, pedido_lanches.quantidade';
  const selectedFields = campos?.length ? campos.join(', ') : defaultFields;

  // Construir a consulta SQL base
  let query = `
    SELECT ${selectedFields}
    FROM lanches
    INNER JOIN pedido_lanches ON lanches.id = pedido_lanches.lanche_id
    INNER JOIN pedidos ON pedido_lanches.pedido_id = pedidos.id
    WHERE 1=1
  `;
  // Array de parâmetros para serem usados na query
  const params = [];

  // Adicionar filtros baseados no body da requisição
  const filters = {
    'lanches.id': id,
    'lanches.titulo': titulo ? `%${titulo}%` : null,
    'lanches.preco': preco,
    'lanches.categoria': categoria,
    'lanches.descricao': descricao ? `%${descricao}%` : null,
    'pedidos.cliente_nome': clienteNome ? `%${clienteNome}%` : null,
    'pedidos.total': total,
    'pedidos.forma_pagamento': formaPagamento,
    'pedidos.cidade': cidade ? `%${cidade}%` : null,
    'pedidos.endereco': endereco ? `%${endereco}%` : null,
    'pedidos.cep': cep ? `%${cep}%` : null,
    'pedidos.data_pedido': dataPedido,
    'pedidos.status_pedido': statusPedido,
    'pedido_lanches.quantidade': quantidade,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query += ` AND ${key} ${key.includes('LIKE') ? 'LIKE' : '='} ?`;
      params.push(value);
    }
  });

  if (dataInicio) {
    query += ' AND pedidos.data_pedido >= ?';
    params.push(dataInicio);
  }
  if (dataFim) {
    query += ' AND pedidos.data_pedido <= ?';
    params.push(dataFim);
  }

  // Adicionar lógica de ordenação
  const validOrderFields = ['lanches.titulo', 'lanches.preco', 'pedidos.total', 'pedido_lanches.quantidade'];
  if (ordenarPor) {
    if (validOrderFields.includes(ordenarPor)) {
      query += ` ORDER BY ${ordenarPor}`;
    } else {
      return res.status(400).json({ error: 'Campo de ordenação inválido' });
    }
  }

  // Debug: Exibir a consulta SQL e os parâmetros para verificação
  console.log('Consulta SQL:', query);
  console.log('Parâmetros:', params);

  // Executar a consulta no banco de dados
  connection.query(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum resultado encontrado com os filtros aplicados' });
    }

    // Retornar os resultados filtrados
    res.json(rows);
  });
});

app.put('/statusPedido/:id', (req, res) => {
  const statusPedidoId = req.params.id;
  const { status_pedido } = req.body;

  connection.query(
    'UPDATE pedidos SET status_pedido = ? WHERE id = ?',
    [status_pedido, statusPedidoId],
    (err, result) => {
      if (err) {                                       
        console.error('Erro ao executar a atualização do status do pedido:', err);
        res.status(500).send('Erro interno do servidor');  
        return;
      }

      if (result.affectedRows === 0) {                          
        res.status(404).send('Nenhum pedido encontrado');
        return;
      } 

      res.status(200).send('Status do pedido atualizado com sucesso' ); 
    }
  ); 
});

//outros

app.get('*', (req, res) => {
  res.status(404).send('Página não encontrada');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
