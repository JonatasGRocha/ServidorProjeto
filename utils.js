// Função para rota '/'
const homeRoute = (req, res) => {
  res.send('Lanchonete Online!');
}

function getHistorico(connection) {
  return (req, res) => {
    const clienteId = req.params.id;

    const pedidosLanchesQuery = `
      SELECT 
        pedidos.id AS pedido_id,
        pedidos.forma_pagamento,
        pedidos.data_pedido,
        pedidos.status_pedido,
        lanches.titulo AS lanche_titulo,
        lanches.preco AS lanche_preco,
        lanches.categoria AS lanche_categoria,
        lanches.descricao AS lanche_descricao,
        lanches.imagem AS lanche_imagem
      FROM 
        pedidos
      JOIN 
        pedido_lanches ON pedidos.id = pedido_lanches.pedido_id
      JOIN 
        lanches ON pedido_lanches.lanche_id = lanches.id
      WHERE 
        pedidos.cliente_id = ?
    `;

    connection.query(pedidosLanchesQuery, [clienteId], (err, pedidosLanchesResult) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      if (pedidosLanchesResult.length === 0) {
        return res.status(404).json({ message: 'Nenhum pedido encontrado para este cliente' });
      }

      // Estruturar os resultados para agrupar os lanches por pedido
      const historicoMap = {};

      pedidosLanchesResult.forEach(pedido => {
        const pedidoId = pedido.pedido_id;

        // Se o pedido não estiver no histórico, adiciona
        if (!historicoMap[pedidoId]) {
          historicoMap[pedidoId] = {
            pedido_id: pedidoId,
            forma_pagamento: pedido.forma_pagamento,
            data_pedido: pedido.data_pedido,
            status_pedido: pedido.status_pedido,
            lanches: [] // Inicializa um array para os lanches
          };
        }

        // Adiciona o lanche ao array de lanches do pedido
        historicoMap[pedidoId].lanches.push({
          titulo: pedido.lanche_titulo,
          preco: pedido.lanche_preco,
          categoria: pedido.lanche_categoria,
          descricao: pedido.lanche_descricao,
          imagem: pedido.lanche_imagem
        });
      });

      // Converte o objeto para um array
      const historicoArray = Object.values(historicoMap);

      res.status(200).json({ pedidos: historicoArray });
    });
  };
}



// Função para buscar lanches
function searchLanches(connection) {
  return (req, res) => {
    const searchTerm = req.params.termo;

    if (!searchTerm) return res.status(400).json({ error: 'Termo de pesquisa é necessário' });

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
      if (err) return res.status(500).json({ error: 'Erro interno do servidor' });
      if (rows.length === 0) return res.status(404).json({ message: 'Nenhum resultado encontrado' });
    
      console.log('Dados retornados do MySQL:', rows); // Adiciona um log para depurar os dados do banco
      res.status(200).json(rows);
    });
    
  };
}

// Função para obter todos os pedidos
function getPedidos(connection) {
  return (req, res) => {
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
      if (err) return res.status(500).json({ error: 'Erro interno do servidor' });

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
  };
}

// Função para obter um pedido por ID
function getPedidoById(connection) {
  return (req, res) => {
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
      if (err) return res.status(500).json({ error: 'Erro interno do servidor' });
      if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado' });

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
  };
}

// Função para listar todos os lanches
function getLanches(connection) {
  return (req, res) => {
    connection.query('SELECT * FROM lanches', (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro interno do servidor' });
      res.status(200).json(rows);
    });
  };
}

// Função para listar um lanche específico por ID
function getLancheById(connection) {
  return (req, res) => {
    const lancheId = req.params.id;
    connection.query('SELECT * FROM lanches WHERE id = ?', [lancheId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro interno do servidor' });
      if (rows.length === 0) return res.status(404).json({ message: 'Lanche não encontrado' });
      res.status(200).json(rows[0]);
    });
  };
}

// Função para inserir um novo pedido
function insertPedido(connection) {
  return (req, res) => {
    const { cliente_id, lanches, forma_pagamento } = req.body;

    if (!lanches || lanches.length === 0) return res.status(400).json({ error: 'É necessário fornecer pelo menos um lanche' });

    const lancheIds = lanches;

    const lanchesQuery = `
      SELECT id, preco FROM lanches WHERE id IN (?)
    `;
    connection.query(lanchesQuery, [lancheIds], (err, lancheResults) => {
      if (err) return res.status(500).json({ error: 'Erro interno do servidor' });

      if (lancheResults.length !== new Set(lanches).size) return res.status(400).json({ error: 'Um ou mais lanches não foram encontrados' });

      let totalPedido = 0;
      lancheResults.forEach(lanche => {
        totalPedido += lanche.preco * lanches.filter(id => id === lanche.id).length; // Contabiliza lanches repetidos
      });

      const pedidoQuery = `
        INSERT INTO pedidos (cliente_id, total, forma_pagamento, status_pedido)
        VALUES (?, ?, ?, 'pendente')
      `;
      connection.query(pedidoQuery, [cliente_id, totalPedido, forma_pagamento], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro interno do servidor' });

        const pedidoId = result.insertId;

        const pedidoLanchesQuery = `
          INSERT INTO pedido_lanches (pedido_id, lanche_id)
          VALUES ?
        `;
        const pedidoLanchesValues = lanches.map(lancheId => [pedidoId, lancheId]);

        connection.query(pedidoLanchesQuery, [pedidoLanchesValues], (err) => {
          if (err) return res.status(500).json({ error: 'Erro interno do servidor' });
          res.status(201).json({ message: 'Pedido adicionado com sucesso', pedido_id: pedidoId });
        });
      });
    });
  };
}

// Função para atualizar o status do pedido
function updateStatusPedido(connection) {
  return (req, res) => {
    const statusPedidoId = req.params.id;
    const { status_pedido } = req.body;

    connection.query(
      'UPDATE pedidos SET status_pedido = ? WHERE id = ?',
      [status_pedido, statusPedidoId],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro interno do servidor' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Nenhum pedido encontrado' });
        res.status(200).json({ message: 'Status do pedido atualizado com sucesso' });
      }
    );
  };
}

function getLanchesByCategoria(connection) {
  return (req, res) => {
    const { categoria } = req.query; // Obtém a categoria da query string

    const query = `
      SELECT * FROM lanches WHERE categoria = ?
    `;
    connection.query(query, [categoria], (err, results) => {
      if (err) {
        console.error(err); // Log do erro
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Nenhum lanche encontrado para essa categoria' });
      }

      res.status(200).json(results); // Retorna os resultados
    });
  };
}



module.exports = {
  homeRoute,
  getHistorico,
  searchLanches,
  getPedidos,
  getPedidoById,
  getLanches,
  getLancheById,
  insertPedido,
  updateStatusPedido,
  getLanchesByCategoria
};
