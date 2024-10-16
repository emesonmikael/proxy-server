// index.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Configurações do Proxy
const proxyOptions = {
  changeOrigin: true,
  secure: false,
};

// Middleware para redirecionar streams via proxy
app.use('/proxy/:streamName', (req, res, next) => {
  const { streamName } = req.params;

  // Mapeie os nomes dos streams para suas URLs HTTP correspondentes
  const streamUrls = {
    '1227625.mp4': 'http://cdn-br.in/movie/978460358/473005646/1227625.mp4',
    '628829.m3u8': 'http://cdn-br.in:80/978460358/473005646/628829.m3u8',
    '628398.m3u8': 'http://cdn-br.in:80/978460358/473005646/628398.m3u8',
    '628399.m3u8': 'http://cdn-br.in:80/978460358/473005646/628399.m3u8',
    '628461.m3u8': 'http://cdn-br.in:80/978460358/473005646/628461.m3u8',
  };

  const target = streamUrls[streamName];
  if (target) {
    // Atualiza as opções do proxy para a URL correta
    proxyOptions.target = target;
    createProxyMiddleware(proxyOptions)(req, res, next);
  } else {
    res.status(404).send('Stream não encontrado');
  }
});


// Rota para servir a playlist M3U8 com URLs proxy
app.get('/http://cdn-br.in/movie/978460358/473005646/1227625.mp4', (req, res) => {
  const playlist = `

  `;
  res.set('Content-Type', 'application/vnd.apple.mpegurl');
  res.send(playlist);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server está rodando na porta ${PORT}`);
});