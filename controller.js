const{connection} = require ('./configBD')
const{app} = require ('./app')

// Histórico do cliente por ID, exibindo os pedidos e somando o total
app.get('/historico/:id', (req, res) => {
  const clienteId = req.params.id;

  // Consulta para buscar os pedidos do cliente e os detalhes dos lanches
  const pedidosLanchesQuery = `
    SELECT 
      pedidos.id AS pedido_id,
      pedidos.forma_pagamento,
      pedidos.data_pedido,
      pedidos.status_pedido,
      lanches.titulo AS lanche_titulo,
      lanches.preco AS lanche_preco,  -- Incluído o valor do lanche
      lanches.categoria AS lanche_categoria,
      lanches.descricao AS lanche_descricao
    FROM 
      pedidos
    JOIN 
      pedido_lanches ON pedidos.id = pedido_lanches.pedido_id
    JOIN 
      lanches ON pedido_lanches.lanche_id = lanches.id
    WHERE 
      pedidos.cliente_id = ?
  `;

  // Consulta para calcular o total dos pedidos
  const totalPedidosQuery = `
    SELECT SUM(total) AS total_pedidos 
    FROM pedidos 
    WHERE cliente_id = ?
  `;

  // Buscar detalhes dos pedidos e lanches
  connection.query(pedidosLanchesQuery, [clienteId], (err, pedidosLanchesResult) => {
    if (err) {
      console.error('Erro ao buscar detalhes dos pedidos:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (pedidosLanchesResult.length === 0) {
      return res.status(404).json({ message: 'Nenhum pedido encontrado para este cliente' });
    }

    // Calcular o total dos pedidos
    connection.query(totalPedidosQuery, [clienteId], (err, totalResult) => {
      if (err) {
        console.error('Erro ao calcular o total dos pedidos:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      const totalPedidos = totalResult[0]?.total_pedidos || 0;

      // Construir a resposta com os detalhes dos pedidos e lanches
      const historicoArray = pedidosLanchesResult.map(pedido => ({
        pedido_id: pedido.pedido_id,
        forma_pagamento: pedido.forma_pagamento,
        data_pedido: pedido.data_pedido,
        status_pedido: pedido.status_pedido,
        lanche_titulo: pedido.lanche_titulo,
        lanche_preco: pedido.lanche_preco,  // Incluído o valor do lanche
        lanche_categoria: pedido.lanche_categoria,
        lanche_descricao: pedido.lanche_descricao
      }));

      res.status(200).json({
        pedidos: historicoArray,
        total_pedidos: totalPedidos
      });
    });
  });
});

app.get('/pesquisar/:termo', (req, res) => {
  const searchTerm = req.params.termo;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Termo de pesquisa é necessário' });
  }

  const isNumber = /^\d+$/.test(searchTerm);
  const searchValue = `%${searchTerm}%`;

  let query;
  let queryParams;

  if (isNumber) {
    query = `SELECT * FROM lanches WHERE preco LIKE ?;`;
    queryParams = [searchValue];
  } else {
    query = `
      SELECT * FROM lanches WHERE titulo LIKE ?
      UNION
      SELECT * FROM lanches WHERE descricao LIKE ?;
    `;
    queryParams = [searchValue, searchValue];
  }

  connection.query(query, queryParams, (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum resultado encontrado' });
    }

    res.status(200).json(rows);
  });
});

app.get('/pedidos', (req, res) => {
  const query = `
    SELECT 
      p.id AS pedido_id, 
      p.cliente_id, 
      p.total, 
      p.forma_pagamento, 
      p.data_pedido, 
      p.status_pedido,
      l.id AS lanche_id, 
      l.titulo AS lanche_titulo, 
      l.preco AS lanche_preco, 
      l.categoria AS lanche_categoria, 
      l.descricao AS lanche_descricao
    FROM pedidos p
    LEFT JOIN pedido_lanches pl ON p.id = pl.pedido_id
    LEFT JOIN lanches l ON pl.lanche_id = l.id
  `;

  connection.query(query, (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const pedidosMap = {};

    rows.forEach(row => {
      const { pedido_id, cliente_id, total, forma_pagamento, data_pedido, status_pedido, lanche_id, lanche_titulo, lanche_preco, lanche_categoria, lanche_descricao } = row;

      if (!pedidosMap[pedido_id]) {
        pedidosMap[pedido_id] = {
          pedido_id,
          cliente_id,
          total,
          forma_pagamento,
          data_pedido,
          status_pedido,
          lanches: []
        };
      }

      if (lanche_id) {
        pedidosMap[pedido_id].lanches.push({
          lanche_id,
          lanche_titulo,
          lanche_preco,
          lanche_categoria,
          lanche_descricao
        });
      }
    });

    const pedidosArray = Object.values(pedidosMap);

    res.status(200).json(pedidosArray);
  });
});

app.get('/pedidos/:id', (req, res) => {
  const pedidoId = req.params.id;
  const query = `
    SELECT 
      p.id AS pedido_id, 
      p.cliente_id, 
      p.total, 
      p.forma_pagamento, 
      p.data_pedido, 
      p.status_pedido,
      l.id AS lanche_id, 
      l.titulo AS lanche_titulo, 
      l.preco AS lanche_preco, 
      l.categoria AS lanche_categoria, 
      l.descricao AS lanche_descricao
    FROM pedidos p
    LEFT JOIN pedido_lanches pl ON p.id = pl.pedido_id
    LEFT JOIN lanches l ON pl.lanche_id = l.id
    WHERE p.id = ?
  `;

  connection.query(query, [pedidoId], (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const pedido = {
      pedido_id: rows[0].pedido_id,
      cliente_id: rows[0].cliente_id,
      total: rows[0].total,
      forma_pagamento: rows[0].forma_pagamento,
      data_pedido: rows[0].data_pedido,
      status_pedido: rows[0].status_pedido,
      lanches: []
    };

    rows.forEach(row => {
      const { lanche_id, lanche_titulo, lanche_preco, lanche_categoria, lanche_descricao } = row;
      if (lanche_id) {
        pedido.lanches.push({
          lanche_id,
          lanche_titulo,
          lanche_preco,
          lanche_categoria,
          lanche_descricao
        });
      }
    });

    res.status(200).json(pedido);
  });
});

// Listar todos os lanches
app.get('/lanches', (req, res) => {
  connection.query('SELECT * FROM lanches', (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.status(200).json(rows);
  });
});

// Listar lanche específico por ID
app.get('/lanches/:id', (req, res) => {
  const lancheId = req.params.id;
  connection.query('SELECT * FROM lanches WHERE id = ?', [lancheId], (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lanche não encontrado' });
    }

    res.status(200).json(rows[0]);
  });
});

// Inserir um novo pedido
app.post('/pedidos', (req, res) => {
  const { cliente_id, lanches, forma_pagamento } = req.body; // Agora 'lanches' é um array de lanche_ids

  if (!lanches || lanches.length === 0) {
    return res.status(400).json({ error: 'É necessário fornecer pelo menos um lanche' });
  }

  // Obter os preços dos lanches e calcular o total
  const lancheIds = lanches; // O array agora contém apenas os IDs dos lanches

  const lanchesQuery = `
    SELECT id, preco FROM lanches WHERE id IN (?)
  `;

  connection.query(lanchesQuery, [lancheIds], (err, lancheResults) => {
    if (err) {
      console.error('Erro ao buscar lanches:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (lancheResults.length !== lanches.length) {
      return res.status(400).json({ error: 'Um ou mais lanches não foram encontrados' });
    }

    // Calcular o total do pedido
    let totalPedido = 0;
    lancheResults.forEach(lanche => {
      totalPedido += lanche.preco;
    });

    // Inserir o pedido na tabela 'pedidos'
    const pedidoQuery = `
      INSERT INTO pedidos (cliente_id, total, forma_pagamento, status_pedido)
      VALUES (?, ?, ?, 'pendente')
    `;

    connection.query(pedidoQuery, [cliente_id, totalPedido, forma_pagamento], (err, result) => {
      if (err) {
        console.error('Erro ao inserir pedido:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      const pedidoId = result.insertId;

      // Inserir os lanches do pedido na tabela 'pedido_lanches'
      const pedidoLanchesQuery = `
        INSERT INTO pedido_lanches (pedido_id, lanche_id)
        VALUES ?
      `;

      const pedidoLanchesValues = lanches.map(lancheId => [pedidoId, lancheId]);

      connection.query(pedidoLanchesQuery, [pedidoLanchesValues], (err) => {
        if (err) {
          console.error('Erro ao inserir lanches do pedido:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        res.status(201).json({ message: 'Pedido adicionado com sucesso', pedido_id: pedidoId });
      });
    });
  });
});

// Atualizar status do pedido
app.put('/statusPedido/:id', (req, res) => {
  const statusPedidoId = req.params.id;
  const { status_pedido } = req.body;

  connection.query(
    'UPDATE pedidos SET status_pedido = ? WHERE id = ?',
    [status_pedido, statusPedidoId],
    (err, result) => {
      if (err) {
        console.error('Erro ao atualizar o status do pedido:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Nenhum pedido encontrado' });
      }

      res.status(200).json({ message: 'Status do pedido atualizado com sucesso' });
    }
  );
});

// Página não encontrada
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Página não encontrada' });
});

  