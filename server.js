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
    '628397.m3u8': 'http://cdn-br.in:80/978460358/473005646/628397.m3u8',
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
app.get('/playlist.m3u8', (req, res) => {
  const playlist = `
#EXTM3U
#EXT-X-SESSION-DATA:DATA-ID="com.xui.1_5_13"
#EXTINF:-1 tvg-id="a.e.br" tvg-name="A&E FHD" tvg-logo="https://i.ibb.co/DzvKbBK/AEdw-DAdbs.png" group-title="Canais || Filmes & Séries",A&E FHD
https://m3u8-proxy.onrender.com/proxy/628397.m3u8
#EXTINF:-1 tvg-id="a.e.br" tvg-name="A&E FHD H.265" tvg-logo="https://i.ibb.co/DzvKbBK/AEdw-DAdbs.png" group-title="Canais || Filmes & Séries",A&E FHD H.265
https://m3u8-proxy.onrender.com/proxy/628829.m3u8
#EXTINF:-1 tvg-id="a.e.br" tvg-name="A&E HD" tvg-logo="https://i.ibb.co/DzvKbBK/AEdw-DAdbs.png" group-title="Canais || Filmes & Séries",A&E HD
https://m3u8-proxy.onrender.com/proxy/628398.m3u8
#EXTINF:-1 tvg-id="a.e.br" tvg-name="A&E SD" tvg-logo="https://i.ibb.co/DzvKbBK/AEdw-DAdbs.png" group-title="Canais || Filmes & Séries",A&E SD
https://m3u8-proxy.onrender.com/proxy/628399.m3u8
#EXTINF:-1 tvg-id="" tvg-name="AE Alterosa Esporte" tvg-logo="https://i.ibb.co/kmDVR7H/52640e104071781-5f5a9c3f82521.png" group-title="Canais || Pay Per View",AE Alterosa Esporte
https://m3u8-proxy.onrender.com/proxy/628461.m3u8
  `;
  res.set('Content-Type', 'application/vnd.apple.mpegurl');
  res.send(playlist);
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server está rodando na porta ${PORT}`);
});