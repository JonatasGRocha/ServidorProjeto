const express = require('express');
const cors = require('cors'); // Importando o cors
const { connection } = require('./configBD');
const {
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
} = require('./utils');

const app = express();
const port = 3000;

app.use(cors()); // Adicionando o middleware cors
app.use(express.json());
app.use(express.static('components')); // Servindo arquivos estáticos

// Rotas
app.get('/', homeRoute);
app.get('/historico/:id', getHistorico(connection));
app.get('/lanches/search/:termo', (req, res) => searchLanches(connection)(req, res));
app.get('/pedidos', getPedidos(connection));
app.get('/pedidos/:id', getPedidoById(connection));
app.get('/lanches', getLanches(connection));
app.get('/lanches/:id', getLancheById(connection));
app.post('/pedidos', insertPedido(connection));
app.put('/statusPedido/:id', updateStatusPedido(connection));
app.get('/lanchesCategoria', getLanchesByCategoria(connection));

// Página não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Página não encontrada' });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

module.exports = { app };
