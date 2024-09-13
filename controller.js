const{connection} = require ('./configBD')
const{app} = require ('./app')

app.get('/search', (req, res) => {
  const searchTerm = req.query.term;

  if (!searchTerm) {
    return res.status(400).send('Parâmetro de pesquisa não fornecido');
  }

  const query = `
    SELECT pedidos.id AS pedido_id, clientes.nome AS cliente_nome, lanches.titulo AS lanche_titulo, 
           pedidos.quantidade, pedidos.total, pedidos.forma_pagamento, pedidos.data_pedido, 
           pedidos.status_pedido
    FROM pedidos
    JOIN clientes ON pedidos.cliente_id = clientes.id
    JOIN lanches ON pedidos.lanche_id = lanches.id
    WHERE clientes.nome LIKE ? OR lanches.titulo LIKE ? OR pedidos.forma_pagamento LIKE ? 
          OR pedidos.status_pedido LIKE ? 
  `;

  const searchTermLike = `%${searchTerm}%`;

  connection.query(query, [searchTermLike, searchTermLike, searchTermLike, searchTermLike], (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    if (rows.length === 0) {
      res.status(404).send('Nenhum resultado encontrado');
      return;
    }
    res.json(rows);
  });
});


app.get('/pedidos', (req, res) => {
  const query = `
    SELECT pedidos.id, clientes.nome, clientes.email, clientes.telefone, 
           lanches.titulo, pedidos.quantidade, pedidos.total, 
           pedidos.forma_pagamento, pedidos.data_pedido, pedidos.status_pedido
    FROM pedidos
    JOIN clientes ON pedidos.cliente_id = clientes.id
    JOIN lanches ON pedidos.lanche_id = lanches.id
  `;
  
  connection.query(query, (err, rows) => {
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
  const query = `
    SELECT pedidos.id, clientes.nome, clientes.email, clientes.telefone, 
           clientes.endereco, clientes.cidade, clientes.cep,
           lanches.titulo, pedidos.quantidade, pedidos.total, 
           pedidos.forma_pagamento, pedidos.data_pedido, pedidos.status_pedido
    FROM pedidos
    JOIN clientes ON pedidos.cliente_id = clientes.id
    JOIN lanches ON pedidos.lanche_id = lanches.id
    WHERE pedidos.id = ?
  `;
  
  connection.query(query, [pedidoId], (err, rows) => {
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

app.post('/pedidos', (req, res) => {
  const { cliente_id, lanche_id, quantidade, forma_pagamento } = req.body;
  const query = `
    INSERT INTO pedidos (cliente_id, lanche_id, quantidade, total, forma_pagamento, status_pedido)
    SELECT ?, ?, ?, lanches.preco * ?, ?, 'pendente'
    FROM lanches
    WHERE id = ?
  `;

  connection.query(query, [cliente_id, lanche_id, quantidade, quantidade, forma_pagamento, lanche_id], (err, result) => {
    if (err) {
      console.error('Erro ao inserir pedido:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }
    res.status(201).send('Pedido adicionado com sucesso');
  });
});

app.post('/filtro', (req, res) => {
  const conditions = [];
  const params = [];

  const addCondition = (column, value, operator = '=') => {
    if (value !== undefined && value !== null) {
      conditions.push(`${column} ${operator} ?`);
      params.push(value);
    }
  };

  addCondition('lanches.categoria', req.body.categoria);
  addCondition('lanches.preco', req.body.preco, '<=');
  addCondition('pedidos.status_pedido', req.body.status_pedido);
  addCondition('clientes.nome', req.body.cliente_nome && `%${req.body.cliente_nome}%`, 'LIKE');
  addCondition('pedidos.forma_pagamento', req.body.forma_pagamento);
  addCondition('clientes.cidade', req.body.cidade && `%${req.body.cidade}%`, 'LIKE');
  addCondition('clientes.endereco', req.body.endereco && `%${req.body.endereco}%`, 'LIKE');
  addCondition('lanches.titulo', req.body.titulo && `%${req.body.titulo}%`, 'LIKE');

  const query = `
    SELECT lanches.*, pedidos.*, clientes.nome, clientes.email, clientes.telefone
    FROM lanches
    INNER JOIN pedidos ON lanches.id = pedidos.lanche_id
    INNER JOIN clientes ON pedidos.cliente_id = clientes.id
    WHERE ${conditions.length ? conditions.join(' AND ') : '1=1'}
  `;

  connection.query(query, params, (err, rows) => {
    if (err) return res.status(500).send('Erro interno do servidor');
    if (!rows.length) return res.status(404).send('Nenhum resultado encontrado');
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

      res.status(200).send('Status do pedido atualizado com sucesso');
    }
  );
});

app.get('*', (req, res) => {
  res.status(404).send('Página não encontrada');
});
  