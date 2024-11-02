const express = require('express');
//const fetch = require('node-fetch');
const app = express();
const PORT = 5000;

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('URL não fornecida');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar o arquivo');

    const content = await response.text();
    res.set('Content-Type', 'text/plain');
    res.send(content);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar o arquivo M3U');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy rodando em http://localhost:${PORT}`);
});