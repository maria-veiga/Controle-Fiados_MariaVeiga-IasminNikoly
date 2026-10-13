const express = require('express');
const app = express();

const alunosRoutes = require('./routes/alunos');
const fiadosRoutes = require('./routes/fiados');
const pagamentosRoutes = require('./routes/pagamentos');

app.use(express.json());

// Verificar se a API está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API funcionando'
  });
});

// Rotas de alunos
app.use('/api/alunos', alunosRoutes);

// Rotas de fiados
app.use('/api/fiados', fiadosRoutes);

// Rotas de pagamentos
app.use('/api/pagamentos', pagamentosRoutes);

// Rota para endereços não encontrados
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

module.exports = app;