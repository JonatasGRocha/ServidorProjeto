const express = require('express');
const port = 3000;
const app = express();

app.use(express.json());

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });

module.exports ={app} 