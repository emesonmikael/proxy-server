const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { Buffer } = require('buffer');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas as rotas
app.use(cors());

// Middleware de proxy com manipulação de resposta
app.use('/proxy', createProxyMiddleware({
  target: 'http://paineliptvbr.ddns.net',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '', // Remove /proxy do caminho
  },
  selfHandleResponse: true, // Permite interceptar e modificar a resposta
  onProxyRes(proxyRes, req, res) {
    let body = Buffer.from([]);

    proxyRes.on('data', chunk => {
      body = Buffer.concat([body, chunk]);
    });

    proxyRes.on('end', () => {
      const originalText = body.toString('utf8');

      // Substituir os links no corpo da resposta
      const modifiedText = originalText.replace(/https?:\/\/paineliptvbr\.ddns\.net/g, 'https://backend-aejq.vercel.app/proxy');

      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'text/plain');
      res.statusCode = proxyRes.statusCode;
      res.end(modifiedText);
    });
  },
  onError(err, req, res) {
    console.error('Erro no proxy:', err);
    res.status(500).send('Erro ao acessar o recurso.');
  },
  secure: false,
}));

// Rota raiz para verificar se o servidor está ativo
app.get('/', (req, res) => {
  res.send('Servidor Proxy está rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
});
