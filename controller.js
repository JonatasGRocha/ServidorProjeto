const{connection} = require ('./configBD')
const{app} = require ('./app')

app.get('/historico/:id', (req, res) => {
  const clienteId = req.params.id;

  // Consulta SQL para pegar todos os dados do cliente com base no ID, exceto o ID
  const clienteQuery = 'SELECT nome, email, telefone, endereco, cidade, cep FROM clientes WHERE id = ?';

  // Consulta SQL para somar o número total de itens comprados pelo cliente
  const itensQuery = 'SELECT SUM(quantidade) AS total_itens FROM pedidos WHERE cliente_id = ?';

  // Consulta SQL para contar o número total de pedidos do cliente
  const pedidosQuery = 'SELECT COUNT(*) AS total_pedidos FROM pedidos WHERE cliente_id = ?';

  // Consulta SQL para buscar detalhes do primeiro pedido do cliente
  const detalhesPedidosQuery = `
    SELECT quantidade, total, forma_pagamento, data_pedido, status_pedido 
    FROM pedidos 
    WHERE cliente_id = ? LIMIT 1`;

  // Executar a query do cliente
  connection.query(clienteQuery, [clienteId], (err, clienteResult) => {
    if (err) {
      console.error('Erro ao buscar cliente:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    // Verifica se o cliente foi encontrado
    if (clienteResult.length === 0) {
      return res.status(404).send('Cliente não encontrado');
    }

    // Executar a query de soma dos itens
    connection.query(itensQuery, [clienteId], (err, itensResult) => {
      if (err) {
        console.error('Erro ao buscar itens:', err);
        return res.status(500).send('Erro interno do servidor');
      }

      // Executar a query de contagem de pedidos
      connection.query(pedidosQuery, [clienteId], (err, pedidosResult) => {
        if (err) {
          console.error('Erro ao contar pedidos:', err);
          return res.status(500).send('Erro interno do servidor');
        }

        // Executar a query de detalhes do primeiro pedido
        connection.query(detalhesPedidosQuery, [clienteId], (err, detalhesPedidosResult) => {
          if (err) {
            console.error('Erro ao buscar detalhes dos pedidos:', err);
            return res.status(500).send('Erro interno do servidor');
          }

          // Combina os resultados e organiza a resposta JSON
          const clienteInfo = clienteResult[0]; // Informações do cliente
          const pedidos_realizados = pedidosResult[0].total_pedidos; // Total de pedidos
          const detalhesPedido = detalhesPedidosResult[0] || {}; // Detalhes do primeiro pedido, se houver

          // Organiza os dados do cliente e inclui o primeiro pedido diretamente
          res.json({
            historico_do_pedido: {
              ...clienteInfo, // Dados do cliente
              quantidade: detalhesPedido.quantidade || null, // Quantidade do pedido
              total: detalhesPedido.total || null, // Total do pedido
              forma_pagamento: detalhesPedido.forma_pagamento || null, // Forma de pagamento do pedido
              data_pedido: detalhesPedido.data_pedido || null, // Data do pedido
              status_pedido: detalhesPedido.status_pedido || null, // Status do pedido
              cep: clienteInfo.cep, // CEP
              pedidos_realizados: pedidos_realizados // Número total de pedidos
            }
          });
        });
      });
    });
  });
});
 
//Rodando perfeitamente, só n pega numero INT//
app.get('/pesquisar/:termo', (req, res) => {
  const searchTerm = req.params.termo; // Obtém o termo de pesquisa a partir da URL

  if (!searchTerm) {
    return res.status(400).send('Termo de pesquisa é necessário');
  }

  // Verifica se o termo é um número inteiro
  const isNumber = /^\d+$/.test(searchTerm);
  const searchValue = `%${searchTerm}%`;

  // Função para pesquisar em uma única consulta SQL nos campos desejados
  let query;
  let queryParams;

  if (isNumber) {
    // Se o termo for um número, procura em campos numéricos
    query = `
      SELECT forma_pagamento AS info FROM pedidos WHERE forma_pagamento LIKE ?
      UNION
      SELECT status_pedido AS info FROM pedidos WHERE status_pedido LIKE ?;
    `;
    queryParams = Array(2).fill(searchValue);
  } else {
    // Se o termo for texto, pesquisa em campos de texto
    query = `
      SELECT nome AS info FROM clientes WHERE nome LIKE ?
      UNION
      SELECT email AS info FROM clientes WHERE email LIKE ?
      UNION
      SELECT endereco AS info FROM clientes WHERE endereco LIKE ?
      UNION
      SELECT cidade AS info FROM clientes WHERE cidade LIKE ?
      UNION
      SELECT titulo AS info FROM lanches WHERE titulo LIKE ?
      UNION
      SELECT descricao AS info FROM lanches WHERE descricao LIKE ?
      UNION
      SELECT forma_pagamento AS info FROM pedidos WHERE forma_pagamento LIKE ?
      UNION
      SELECT status_pedido AS info FROM pedidos WHERE status_pedido LIKE ?;
    `;
    queryParams = Array(8).fill(searchValue);
  }

  connection.query(query, queryParams, (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    if (rows.length === 0) {
      return res.status(404).send('Nenhum resultado encontrado');
    }

    // Envia apenas os resultados encontrados, sem campos adicionais
    res.json(rows.map(row => row.info));
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
  