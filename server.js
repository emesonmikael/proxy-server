const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas as rotas
app.use(cors());

// Middleware de proxy
app.use('/proxy', createProxyMiddleware({
  target: 'https://paineliptvbr.ddns.net',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '', // Remove /proxy do caminho
  },
  onError(err, req, res) {
    console.error('Erro no proxy:', err);
    res.status(500).send('Erro ao acessar o recurso.');
  },
  secure: false, // Permitir proxy para servidores HTTP
}));

// Rota raiz para verificar se o servidor está ativo
app.get('/', (req, res) => {
  res.send('Servidor Proxy está rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
});
