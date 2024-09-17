const express = require('express');
const { connection } = require('./configBD');
const {
  getHistorico,
  searchLanches,
  getPedidos,
  getPedidoById,
  getLanches,
  getLancheById,
  insertPedido,
  updateStatusPedido
} = require('./utils');

const app = express();
const port = 3000;

app.use(express.json()); // Para fazer parsing de JSON no corpo da requisição

// Rotas
app.get('/historico/:id', getHistorico(connection));
app.get('/pesquisar/:termo', searchLanches(connection));
app.get('/pedidos', getPedidos(connection));
app.get('/pedidos/:id', getPedidoById(connection));
app.get('/lanches', getLanches(connection));
app.get('/lanches/:id', getLancheById(connection));
app.post('/pedidos', insertPedido(connection));
app.put('/statusPedido/:id', updateStatusPedido(connection));

// Página não encontrada
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Página não encontrada' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = { app };
