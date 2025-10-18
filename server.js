const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { Buffer } = require('buffer');
const fs = require('fs').promises; // Usar promessas para operações de arquivo
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_FILE = path.join(__dirname, 'cache', 'response.txt'); // Caminho do arquivo de cache

// Criar diretório de cache se não existir
async function ensureCacheDir() {
  const cacheDir = path.dirname(CACHE_FILE);
  try {
    await fs.mkdir(cacheDir, { recursive: true });
  } catch (err) {
    console.error('Erro ao criar diretório de cache:', err);
  }
}

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
  async onProxyRes(proxyRes, req, res) {
    let body = Buffer.from([]);

    proxyRes.on('data', chunk => {
      body = Buffer.concat([body, chunk]);
    });

    proxyRes.on('end', async () => {
      try {
        const originalText = body.toString('utf8');

        // Substituir os links no corpo da resposta
        const modifiedText = originalText.replace(/http?:\/\/paineliptvbr\.ddns\.net/g, 'https://proxy-server-eight-omega.vercel.app/');

        // Garantir que o diretório de cache existe
        await ensureCacheDir();

        // Salvar a resposta modificada em um arquivo
        await fs.writeFile(CACHE_FILE, modifiedText, 'utf8');

        // Configurar cabeçalhos da resposta
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'text/plain');
        res.statusCode = proxyRes.statusCode;

        // Enviar o arquivo salvo como resposta
        const fileContent = await fs.readFile(CACHE_FILE, 'utf8');
        res.end(fileContent);
      } catch (err) {
        console.error('Erro ao processar a resposta:', err);
        res.status(500).send('Erro ao processar a resposta.');
      }
    });
  },
  onError(err, req, res) {
    console.error('Erro no proxy:', err);
    res.status(500).send('Erro ao acessar o recurso.');
  },
  secure: false,
}));

// Rota para servir o arquivo salvo diretamente (opcional, para testes)
app.get('/cached', async (req, res) => {
  try {
    const fileContent = await fs.readFile(CACHE_FILE, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(fileContent);
  } catch (err) {
    console.error('Erro ao ler o arquivo de cache:', err);
    res.status(404).send('Arquivo de cache não encontrado.');
  }
});

// Rota raiz para verificar se o servidor está ativo
app.get('/', (req, res) => {
  res.send('Servidor Proxy está rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
});
