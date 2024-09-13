const{connection} = require ('./configBD')
const{app} = require ('./app')


//Rodando perfeitamente, só n pega numero INT//
app.get('/pesquisar/:termo', (req, res) => {
  const searchTerm = req.params.termo; // Obtém o termo de pesquisa a partir da URL

  if (!searchTerm) {
    return res.status(400).send('Termo de pesquisa é necessário');
  }

  const searchValue = `%${searchTerm}%`;

  // Função para pesquisar em uma única consulta SQL nos campos desejados
  const query = `
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

  connection.query(query, Array(8).fill(searchValue), (err, rows) => {
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

//teste1//
app.get('/pesquisar/:termo', (req, res) => {
  const searchTerms = req.params.termo.split(' ');  // Divide os termos por espaços
  const searchProduct = searchTerms[0];  // Primeiro termo como produto
  const searchPrice = searchTerms[1] ? parseFloat(searchTerms[1]) : null;  // Segundo termo como preço, se existir

  if (!searchProduct && !searchPrice) {
    return res.status(400).send('Pelo menos um termo de pesquisa é necessário');
  }

  // Query SQL para pesquisar tanto por strings quanto por números
  let query = `
    SELECT nome, email, telefone, endereco, cidade, cep
    FROM clientes 
    WHERE nome LIKE ? OR email LIKE ? OR telefone = ? OR endereco LIKE ? OR cidade LIKE ? OR cep = ?
    UNION
    SELECT titulo AS nome, descricao AS email, preco AS telefone, NULL AS endereco, NULL AS cidade, NULL AS cep
    FROM lanches 
    WHERE titulo LIKE ? OR descricao LIKE ?
  `;

  let queryValues = [
    `%${searchProduct}%`,  // nome (LIKE)
    `%${searchProduct}%`,  // email (LIKE)
    searchProduct,         // telefone (inteiro)
    `%${searchProduct}%`,  // endereco (LIKE)
    `%${searchProduct}%`,  // cidade (LIKE)
    searchProduct,         // cep (inteiro)
    `%${searchProduct}%`,  // titulo (LIKE)
    `%${searchProduct}%`   // descricao (LIKE)
  ];

  // Se o preço foi incluído na pesquisa, adicionar na query
  if (searchPrice) {
    query += `
      UNION
      SELECT titulo AS nome, descricao AS email, preco AS telefone, NULL AS endereco, NULL AS cidade, NULL AS cep
      FROM lanches 
      WHERE preco = ?
    `;
    queryValues.push(searchPrice);  // Adiciona o preço como valor
  }

  // Executar a query
  connection.query(query, queryValues, (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    if (rows.length === 0) {
      return res.status(404).send('Nenhum resultado encontrado');
    }

    res.json(rows);
  });
});

//teste2//
app.get('/pesquisar/:termo/:preco?', (req, res) => {
  const { termo, preco } = req.params;

  if (!termo && !preco) {
    return res.status(400).send('É necessário fornecer pelo menos um termo para "produto" ou "preço".');
  }

  // Verifica se o termo de pesquisa é numérico
  const isNumeric = !isNaN(termo);

  // Define o valor de busca, se for string utiliza "%" para fazer busca com LIKE
  const searchValue = isNumeric ? termo : `%${termo}%`;

  // Inicia a query SQL para buscar em todas as tabelas
  let query = `
    SELECT nome AS resultado FROM clientes WHERE nome LIKE ?
    UNION
    SELECT email AS resultado FROM clientes WHERE email LIKE ?
    UNION
    SELECT telefone AS resultado FROM clientes WHERE telefone = ?
    UNION
    SELECT endereco AS resultado FROM clientes WHERE endereco LIKE ?
    UNION
    SELECT cidade AS resultado FROM clientes WHERE cidade LIKE ?
    UNION
    SELECT cep AS resultado FROM clientes WHERE cep = ?
    UNION
    SELECT titulo AS resultado FROM lanches WHERE titulo LIKE ?
    UNION
    SELECT descricao AS resultado FROM lanches WHERE descricao LIKE ?
    UNION
    SELECT categoria AS resultado FROM lanches WHERE categoria LIKE ?
    UNION
    SELECT forma_pagamento AS resultado FROM pedidos WHERE forma_pagamento LIKE ?
    UNION
    SELECT status_pedido AS resultado FROM pedidos WHERE status_pedido LIKE ?
  `;

  // Array de valores que serão passados para o SQL
  const queryValues = [
    searchValue,  // nome (LIKE)
    searchValue,  // email (LIKE)
    termo,        // telefone (número exato)
    searchValue,  // endereco (LIKE)
    searchValue,  // cidade (LIKE)
    termo,        // cep (número exato)
    searchValue,  // titulo (LIKE)
    searchValue,  // descricao (LIKE)
    searchValue,  // categoria (LIKE)
    searchValue,  // forma_pagamento (LIKE)
    searchValue   // status_pedido (LIKE)
  ];

  // Se o preço foi informado, adiciona uma condição de busca por preço
  if (preco) {
    query += ` UNION SELECT preco AS resultado FROM lanches WHERE preco <= ?`;
    queryValues.push(preco);  // adiciona o preço ao array de valores
  }

  // Executa a consulta no banco de dados
  connection.query(query, queryValues, (err, rows) => {
    if (err) {
      console.error('Erro ao executar a consulta:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    if (rows.length === 0) {
      return res.status(404).send('Nenhum resultado encontrado.');
    }

    // Retorna os resultados encontrados em formato JSON
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
  