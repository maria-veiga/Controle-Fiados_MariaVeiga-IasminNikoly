# TASKS — Controle de Fiados da Cantina

## Etapa 1 — Backend e API

### TASK01 — Configuração inicial e teste da API

- [ ] Configurar o projeto Node.js e instalar Express, dotenv, Jest e Supertest.
- [ ] Configurar `src/app.js` e `src/server.js`.
- [ ] Criar a rota `GET /api/health`.
- [ ] Criar e executar o primeiro teste automatizado da rota.

**Critério de conclusão:** a rota retorna HTTP 200 e o teste passa.

Exemplo de teste:

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('deve retornar status 200', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

### TASK02 — Configuração do banco de dados

- [ ] Configurar a conexão com PostgreSQL e Sequelize.
- [ ] Criar os modelos `Aluno`, `Fiado` e `Pagamento`.
- [ ] Definir os relacionamentos entre os modelos.
- [ ] Conferir a estrutura das tabelas e as restrições necessárias.
- [ ] Testar a conexão com o banco de dados.

**Critério de conclusão:** os modelos, os relacionamentos e a conexão funcionam corretamente.

Exemplo de relacionamento:

```javascript
Aluno.hasMany(Fiado, {
  foreignKey: 'alunoId',
  as: 'fiados'
});

Fiado.belongsTo(Aluno, {
  foreignKey: 'alunoId',
  as: 'aluno'
});
```

### TASK03 — Cadastro e consulta de alunos

- [ ] Implementar `POST /api/alunos`.
- [ ] Implementar `GET /api/alunos`.
- [ ] Implementar `GET /api/alunos/:id`.
- [ ] Implementar `PUT /api/alunos/:id`.
- [ ] Implementar `PATCH /api/alunos/:id/status`.
- [ ] Validar os dados recebidos.
- [ ] Testar as rotas no Postman.

**Critério de conclusão:** cadastro, listagem, consulta, edição e alteração de status funcionam corretamente.

### TASK04 — Consulta de saldo e registro de consumos

- [ ] Implementar `GET /api/alunos/:id/saldo`.
- [ ] Implementar as rotas de cadastro e consulta de fiados.
- [ ] Criar ou organizar o serviço de cálculo do saldo.
- [ ] Validar o limite de crédito e o status do aluno.
- [ ] Aplicar o bloqueio por atraso conforme os requisitos.
- [ ] Testar os cálculos e as validações.

**Critério de conclusão:** consumos válidos são registrados, consumos proibidos são recusados e o saldo corresponde às movimentações.

### TASK05 — Pagamentos e estornos

- [ ] Implementar o registro de pagamentos.
- [ ] Permitir pagamentos parciais e totais.
- [ ] Implementar a amortização FIFO, priorizando os consumos mais antigos.
- [ ] Implementar estornos com justificativa.
- [ ] Preservar o histórico financeiro.
- [ ] Recalcular corretamente o saldo após cada operação.
- [ ] Testar pagamentos e estornos no Postman.

**Critério de conclusão:** pagamentos e estornos atualizam corretamente o saldo e o extrato, sem apagar o histórico.

### TASK06 — Extratos, configurações e permissões

- [ ] Implementar a consulta do extrato do aluno.
- [ ] Implementar filtros de movimentações previstos nos requisitos.
- [ ] Implementar as configurações de crédito e atraso.
- [ ] Implementar autenticação e controle de permissões.
- [ ] Testar as rotas protegidas e os acessos permitidos.

**Critério de conclusão:** as consultas apresentam dados corretos e cada usuário só acessa as operações autorizadas.

## Etapa 2 — Frontend

### TASK07 — Configuração inicial do React

- [ ] Criar ou configurar o projeto React.
- [ ] Configurar React Router e CSS.
- [ ] Criar o serviço de comunicação com a API.
- [ ] Configurar o tratamento de respostas e erros.
- [ ] Testar a comunicação com o backend.

**Critério de conclusão:** o frontend inicia e consegue consultar a API.

### TASK08 — Página de alunos

- [ ] Criar a listagem de alunos.
- [ ] Implementar pesquisa e filtros.
- [ ] Criar o formulário de cadastro e edição.
- [ ] Implementar a ativação e desativação.
- [ ] Integrar os componentes às rotas da API.

**Critério de conclusão:** é possível cadastrar, consultar, editar e alterar o status dos alunos pela interface.

### TASK09 — Página de detalhes da conta

- [ ] Exibir os dados do aluno.
- [ ] Exibir saldo devedor, limite e crédito disponível.
- [ ] Exibir consumos pendentes.
- [ ] Exibir o extrato financeiro.
- [ ] Integrar o formulário de pagamento.
- [ ] Implementar o formulário de estorno com justificativa, conforme as permissões.

**Critério de conclusão:** as informações e operações da interface correspondem aos dados da API.

### TASK10 — Página de consumos e movimentações

- [ ] Criar o formulário de registro de consumo.
- [ ] Criar a tabela de movimentações.
- [ ] Implementar os filtros previstos no escopo.
- [ ] Exibir mensagens de sucesso, erro e bloqueio.
- [ ] Integrar a página ao backend.

**Critério de conclusão:** é possível registrar consumos e consultar movimentações pela interface.

### TASK11 — Configurações e relatórios

- [ ] Criar os formulários de configuração previstos nos requisitos.
- [ ] Implementar o gerenciamento de operadores, conforme as permissões.
- [ ] Criar as consultas e tabelas de relatórios previstas no escopo.
- [ ] Integrar os componentes à API.

**Critério de conclusão:** as funcionalidades implementadas respeitam as regras de negócio e as permissões.

### TASK12 — Visão geral

- [ ] Criar o resumo financeiro.
- [ ] Exibir contas em atraso.
- [ ] Exibir movimentações recentes.
- [ ] Integrar os indicadores aos dados reais da API.

**Critério de conclusão:** a visão geral apresenta informações corretas e é desenvolvida somente após as funcionalidades principais.

## Etapa 3 — Validação final

### TASK13 — Testes de integração e correções

- [ ] Testar o fluxo completo de cadastro de aluno, consumo e pagamento.
- [ ] Verificar pagamentos parciais, totais e amortização FIFO.
- [ ] Testar estornos e justificativas.
- [ ] Verificar limites de crédito e bloqueios por atraso.
- [ ] Testar autenticação e permissões.
- [ ] Conferir a integração entre React, API e PostgreSQL.
- [ ] Corrigir os erros encontrados.
- [ ] Conferir as telas com o protótipo do Figma.
- [ ] Verificar a consistência entre `REQUIREMENTS.md`, `DESIGN.md` e `TASKS.md`.

**Critério de conclusão:** os fluxos principais funcionam, os testes passam e os documentos correspondem ao sistema implementado.

## Ordem obrigatória de execução

1. Configurar e testar a API.
2. Configurar o banco de dados e os modelos.
3. Implementar e testar as rotas e regras de negócio do backend.
4. Implementar pagamentos, estornos, extratos e permissões.
5. Desenvolver o frontend e integrar com a API.
6. Criar a visão geral por último.
7. Executar os testes finais e conferir o protótipo.

## Regra de conclusão das tarefas

Uma tarefa só poderá ser marcada como concluída após a implementação e os testes correspondentes. Não criar funcionalidades fora do escopo definido em `REQUIREMENTS.md`. O backend deverá estar testado antes do avanço para as funcionalidades dependentes do frontend.
