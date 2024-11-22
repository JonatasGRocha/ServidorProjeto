// Função para rota '/'
const homeRoute = (req, res) => {
  res.send('Lanchonete Online!');
}
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken'); // Opcional, se você quiser gerar um token JWT

function login(connection) {
  return async (req, res) => {
    const { email, password } = req.body;

    // Verificar se os dados estão completos
    if (!email || !password) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    try {
      // Buscar o usuário no banco de dados
      connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
          console.error('Erro ao buscar usuário:', err);
          return res.status(500).json({ message: 'Erro interno' });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: 'E-mail ou senha inválidos' });
        }

        const user = results[0];

        // Verificar a senha com bcrypt
        bcrypt.compare(password, user.senha, (err, isMatch) => {
          if (err) {
            console.error('Erro ao comparar senhas:', err);
            return res.status(500).json({ message: 'Erro interno' });
          }

          if (!isMatch) {
            return res.status(400).json({ message: 'E-mail ou senha inválidos' });
          }

          // Gerar o token JWT
          const token = jwt.sign(
            { id: user.id, email: user.email },
            'secreta123',  // Sua chave secreta
            { expiresIn: '1h' }
          );

          // Retornar a resposta com o token
          res.status(200).json({
            message: 'Login realizado com sucesso',
            token: token
          });
        });
      });
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      res.status(500).json({ message: 'Erro interno' });
    }
  };
}

module.exports = { login };


function register(connection) {
  return async (req, res) => {
    const { name, email, password } = req.body;

    // Verificar se todos os dados estão presentes
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Verificar se o email já existe
      connection.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email],
        (err, results) => {
          if (err) {
            console.error('Erro ao buscar email:', err);
            return res.status(500).json({ message: 'Erro interno' });
          }

          if (results.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado' });
          }

          // Inserir novo usuário no banco de dados
          connection.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            (err) => {
              if (err) {
                console.error('Erro ao cadastrar usuário:', err);
                return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
              }

              // Resposta indicando sucesso com o e-mail e senha para redirecionar
              res.status(201).json({ 
                message: 'Usuário cadastrado com sucesso', 
                email,
                password
              });
            }
          );
        }
      );
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      res.status(500).json({ message: 'Erro interno' });
    }
  };
}

module.exports = { register };



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

          console.log('Dados retornados do MySQL:', rows);
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

function insertPedido(connection) {
  return (req, res) => {
    const { cliente_id, lanches, forma_pagamento, total, nome_titular, numero_cartao, validade_cartao, cvv } = req.body;

    // Validação dos dados necessários
    if (!cliente_id || !lanches || lanches.length === 0 || !forma_pagamento) {
      return res.status(400).json({ message: 'Dados incompletos para o pedido.' });
    }

    // Convertendo a forma de pagamento para o formato que o banco de dados espera
    const formaPagamentoBanco = forma_pagamento === 'cartao' ? 'Cartão de crédito' : forma_pagamento === 'pix' ? 'Pix' : null;

    if (!formaPagamentoBanco) {
      return res.status(400).json({ message: 'Método de pagamento inválido.' });
    }

    // Prepare a consulta para inserir o pedido
    let queryPedido = `INSERT INTO pedidos (cliente_id, total, forma_pagamento` + 
                      (formaPagamentoBanco === 'Cartão de crédito' ? ', nome_titular, numero_cartao, validade_cartao, cvv' : '') + 
                      `) VALUES (?, ?, ?` + 
                      (formaPagamentoBanco === 'Cartão de crédito' ? ', ?, ?, ?, ?' : '') + `)`; 

    const values = [cliente_id, total, formaPagamentoBanco];

    // Adiciona os dados do cartão apenas se a forma de pagamento for Cartão de crédito
    if (formaPagamentoBanco === 'Cartão de crédito') {
      // Validação dos dados do cartão
      if (!nome_titular || !numero_cartao || !validade_cartao || !cvv) {
        return res.status(400).json({ message: 'Dados incompletos do cartão.' });
      }
      values.push(nome_titular, numero_cartao, validade_cartao, cvv);
    } else {
      // Para Pix, não precisa adicionar dados do cartão
      values.push(null, null, null, null); // Adiciona valores nulos para campos do cartão
    }

    // Executa a consulta para inserir o pedido
    connection.query(queryPedido, values, (error, results) => {
      if (error) {
        console.error('Erro ao criar o pedido:', error); // Log do erro para facilitar o debugging
        return res.status(500).json({ message: 'Erro ao criar o pedido.' });
      }
      const pedido_id = results.insertId;

      // Insere os itens de lanche na tabela intermediária
      let queryLanchePedido = 'INSERT INTO pedido_lanches (pedido_id, lanche_id) VALUES ?';
      let lanchesValues = lanches.map(lanche => [pedido_id, lanche.id]);

      connection.query(queryLanchePedido, [lanchesValues], (err) => {
        if (err) {
          console.error('Erro ao adicionar lanches ao pedido:', err); // Log do erro para facilitar o debugging
          return res.status(500).json({ message: 'Erro ao adicionar lanches ao pedido.' });
        }
        res.status(200).json({ message: 'Pedido adicionado com sucesso' });
      });
    });
  };
}


module.exports = insertPedido;


function updateStatusPedido(connection) {
  return (req, res) => {
    const { status_pedido } = req.body; // Recebe o status do corpo da requisição

    if (!status_pedido) {
      return res.status(400).json({ error: 'Status do pedido não fornecido' });
    }

    connection.query(
      'UPDATE pedidos SET status_pedido = ? WHERE status_pedido = "pendente"',
      [status_pedido], // Atualiza todos os pedidos com status "pendente"
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro interno do servidor' });
        res.status(200).json({ message: `Status de ${result.affectedRows} pedidos atualizado para "${status_pedido}"` });
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
  login,
  register,
  homeRoute,
  getHistorico,
  searchLanches,
  getPedidos,
  getPedidoById,
  getLanches,
  getLancheById,
  insertPedido,
  updateStatusPedido,
  getLanchesByCategoria,
};
