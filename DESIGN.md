# DESIGN.md — Sistema de Controle de Fiados da Cantina

## 1. Objetivo e arquitetura

O sistema tem como objetivo registrar os consumos fiados dos alunos, calcular suas dívidas, controlar os limites de crédito e registrar pagamentos e estornos.

O fluxo principal é:

**Identificar aluno → registrar consumo → atualizar saldo → registrar pagamento ou estorno → consultar extrato.**

A aplicação utilizará arquitetura cliente-servidor, dividida em três partes:

- **Frontend:** React, React Router e CSS.
- **Backend:** Node.js e Express, responsável pela API REST, validações e regras de negócio.
- **Banco de dados:** PostgreSQL, acessado pelo Sequelize ORM.

Fluxo técnico:

`React → API Express → Serviços de negócio → Sequelize → PostgreSQL`

O desenvolvimento começará pelo backend. As rotas serão implementadas e testadas antes da integração com o frontend. A visão geral será desenvolvida por último.

## 2. Estrutura do projeto

```text
Controle-Fiados/
├── REQUIREMENTS.md
├── DESIGN.md
├── TASKS.md
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── Aluno.js
│   │   │   ├── Fiado.js
│   │   │   ├── Pagamento.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── alunos.js
│   │   │   ├── fiados.js
│   │   │   └── pagamentos.js
│   │   ├── services/
│   │   └── middlewares/
│   └── tests/
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── services/
        ├── App.jsx
        └── main.jsx
```

A estrutura representa a organização planejada. Arquivos e pastas adicionais só serão criados quando necessários para os requisitos definidos.

## 3. Modelo de dados

O sistema terá três entidades centrais relacionadas: aluno, consumo fiado e pagamento.

### 3.1 Aluno

Representa o aluno que possui uma conta de fiado.

Campos principais:

- `id`: identificador único.
- `nome`: nome do aluno.
- `matricula`: matrícula única.
- `turma`: turma do aluno.
- `ativo`: indica se o cadastro está ativo.
- `limiteCredito`: limite de crédito permitido.

O limite padrão será de R$ 50,00, conforme a regra de negócio.

### 3.2 Fiado

Representa um consumo realizado por um aluno.

Campos principais:

- `id`: identificador do consumo.
- `alunoId`: referência ao aluno.
- `descricao`: descrição do consumo.
- `valor`: valor registrado.
- `dataCompra`: data do consumo.
- `dataPagamento`: data de quitação, quando aplicável.
- `status`: pendente ou pago.

Um aluno pode possuir vários consumos. Cada consumo pertence a um único aluno.

### 3.3 Pagamento

Representa um pagamento associado a um consumo.

Campos principais:

- `id`: identificador do pagamento.
- `fiadoId`: referência ao consumo.
- `valor`: valor pago.
- `dataPagamento`: data do pagamento.
- `observacao`: informação complementar, quando necessária.
- `estornado`: indica se o pagamento foi estornado.
- `justificativaEstorno`: motivo do estorno.
- `dataEstorno`: data do estorno.

Um consumo pode possuir vários pagamentos. Cada pagamento pertence a um consumo.

### 3.4 Relacionamentos

```javascript
Aluno.hasMany(Fiado, {
  foreignKey: 'alunoId',
  as: 'fiados'
});

Fiado.belongsTo(Aluno, {
  foreignKey: 'alunoId',
  as: 'aluno'
});

Fiado.hasMany(Pagamento, {
  foreignKey: 'fiadoId',
  as: 'pagamentos'
});

Pagamento.belongsTo(Fiado, {
  foreignKey: 'fiadoId',
  as: 'fiado'
});
```

O saldo devedor será calculado a partir dos consumos e dos pagamentos válidos. O saldo não será editado diretamente.

A estrutura também deverá preservar o histórico das operações financeiras, inclusive após estornos.

## 4. API REST

A API será implementada com Express e utilizará o prefixo `/api`. As rotas deverão ser testáveis individualmente no Postman e, quando possível, por testes automatizados com Jest e Supertest.

### 4.1 Saúde da API

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/api/health` | Verificar se a API está funcionando. |

**Exemplo de resposta — `200 OK`:**

```json
{
  "status": "ok",
  "message": "API funcionando"
}
```

Esta será a primeira rota implementada e testada antes das demais funcionalidades.

### 4.2 Rotas de alunos

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/api/alunos` | Cadastrar um aluno. |
| GET | `/api/alunos` | Listar alunos. |
| GET | `/api/alunos/:id` | Consultar um aluno. |
| PUT | `/api/alunos/:id` | Editar os dados de um aluno. |
| PATCH | `/api/alunos/:id/status` | Ativar ou desativar um aluno. |
| GET | `/api/alunos/:id/saldo` | Consultar saldo e crédito disponível. |

**Exemplo — cadastrar aluno:**

Requisição `POST /api/alunos`:

```json
{
  "nome": "Aluno Teste",
  "matricula": "TESTE001",
  "turma": "2A"
}
```

Resposta esperada: `201 Created`, com a mensagem de sucesso e os dados cadastrados.

**Exemplo — alterar status:**

Requisição `PATCH /api/alunos/1/status`:

```json
{
  "ativo": false
}
```

Resposta esperada: `200 OK`, confirmando a alteração.

**Exemplo — consultar saldo:**

Requisição `GET /api/alunos/1/saldo`.

Resposta esperada:

```json
{
  "aluno": {
    "id": 1,
    "nome": "Aluno Teste",
    "matricula": "TESTE001"
  },
  "limiteCredito": 50,
  "saldoDevedor": 12.5,
  "limiteDisponivel": 37.5
}
```

Os valores acima são ilustrativos. A resposta real deverá ser calculada com base nos dados do banco.

### 4.3 Rotas de consumos fiados

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/api/fiados` | Registrar um consumo fiado. |
| GET | `/api/fiados` | Listar consumos com os filtros definidos no escopo. |
| GET | `/api/fiados/:id` | Consultar um consumo. |
| GET | `/api/fiados/aluno/:id` | Consultar os consumos e pagamentos de um aluno. |

Ao registrar um consumo, a API deverá verificar a existência do aluno, seu status, o limite de crédito e o bloqueio por atraso.

O consumo não poderá ser editado ou excluído depois de registrado. Correções deverão respeitar o processo de estorno previsto nos requisitos.

### 4.4 Rotas de pagamentos e estornos

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/api/pagamentos` | Registrar um pagamento total ou parcial. |
| POST | `/api/pagamentos/:id/estorno` | Estornar um pagamento com justificativa. |

O pagamento deverá ser associado ao consumo correspondente. A amortização seguirá a regra FIFO: os consumos mais antigos serão quitados primeiro.

O estorno deverá exigir justificativa, preservar o registro original e atualizar corretamente os cálculos financeiros.

As rotas acima definem o contrato planejado da API. A implementação deverá manter os nomes e os formatos alinhados ao código efetivamente utilizado no projeto.

### 4.5 Respostas e tratamento de erros

A API deverá utilizar códigos HTTP adequados:

- `200 OK`: consulta ou operação concluída.
- `201 Created`: cadastro ou registro criado.
- `400 Bad Request`: dados inválidos.
- `401 Unauthorized`: usuário não autenticado.
- `403 Forbidden`: usuário sem permissão.
- `404 Not Found`: recurso ou rota inexistente.
- `409 Conflict`: conflito, como matrícula duplicada.
- `500 Internal Server Error`: erro inesperado do servidor.

As mensagens de erro deverão ser claras e não deverão expor credenciais ou detalhes internos desnecessários.

## 5. Organização do backend

- `app.js`: configura o Express, os middlewares e as rotas.
- `server.js`: inicia o servidor.
- `config/database.js`: configura a conexão com o PostgreSQL.
- `models/`: define os modelos Sequelize e seus relacionamentos.
- `routes/`: declara os endpoints da API.
- `services/`: concentra regras de negócio quando necessário.
- `middlewares/`: trata autenticação, autorização e erros.
- `tests/`: contém os testes automatizados.

### 5.1 Exemplo de `src/app.js`

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'API funcionando'
  });
});

module.exports = app;
```

Esse exemplo representa o ponto de partida da API. As rotas de alunos, fiados e pagamentos serão registradas progressivamente, após os testes iniciais.

### 5.2 Exemplo de `src/server.js`

```javascript
require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
```

### 5.3 Primeiro teste automatizado

Arquivo `backend/tests/health.test.js`:

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('deve retornar status 200', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

O teste utiliza Jest e Supertest. Antes de continuar, deverá ser executado e aprovado.

## 6. Regras de negócio nos serviços

### Consumo

Antes de registrar o consumo, verificar se o aluno existe, está ativo, não está bloqueado por atraso e possui crédito disponível.

### Saldo

Calcular o saldo a partir dos consumos e pagamentos válidos. Valores monetários deverão ser tratados com precisão de centavos.

### Pagamento

Permitir pagamento parcial ou total. Distribuir os valores conforme a regra FIFO, sem ultrapassar o saldo devido.

### Estorno

Exigir justificativa, preservar o histórico e recalcular os valores afetados sem apagar o registro original.

### Limite e atraso

Utilizar o limite definido para o aluno e as regras de atraso especificadas nos requisitos. O consumo que ultrapassar o limite deverá ser bloqueado.

### Permissões

Restringir as operações conforme o perfil do usuário. O administrador poderá gerenciar as operações autorizadas; o aluno poderá consultar somente o próprio extrato e saldo.

As operações financeiras deverão utilizar transações do banco de dados quando necessário para evitar inconsistências.

## 7. Design do frontend por página

O frontend será desenvolvido em React, utilizando React Router para navegação e componentes reutilizáveis. As páginas deverão seguir o protótipo do Figma, sem acrescentar funcionalidades que não estejam no escopo.

### 7.1 Login

**Objetivo:** permitir o acesso dos perfis definidos nos requisitos.

Componentes:

- `LoginForm`: formulário de acesso.
- `FormField`: campos de entrada.
- `SubmitButton`: botão de acesso.
- `LoginError`: apresentação de erros de autenticação.

### 7.2 Listagem de alunos

**Objetivo:** localizar alunos e acessar suas contas.

Componentes:

- `StudentSearch`: pesquisa por nome ou matrícula.
- `StudentFilters`: filtros de consulta.
- `StudentTable`: listagem de alunos.
- `StudentForm`: cadastro e edição.
- `StudentStatusControl`: ativação ou desativação.

A página utilizará as rotas de alunos da API.

### 7.3 Detalhes da conta do aluno

**Objetivo:** consultar a dívida e administrar as operações financeiras autorizadas.

Componentes:

- `StudentAccountHeader`: identificação do aluno.
- `DebtSummary`: saldo devedor, limite e crédito disponível.
- `OpenConsumptionsList`: consumos pendentes.
- `TransactionStatement`: histórico de movimentações.
- `RegisterPaymentForm`: registro de pagamento.
- `ReversalForm`: estorno com justificativa.

O saldo exibido deverá vir da API, sem cálculos financeiros independentes no frontend.

### 7.4 Consumos e lançamentos

**Objetivo:** registrar consumos e consultar movimentações.

Componentes:

- `ConsumptionForm`: formulário de consumo.
- `TransactionFilters`: filtros por aluno, período e tipo.
- `TransactionTable`: tabela de movimentações.
- `FormFeedback`: mensagens de sucesso ou erro.

A página deverá informar quando um consumo for bloqueado pelas regras de crédito.

### 7.5 Configurações

**Objetivo:** permitir o gerenciamento das regras previstas nos requisitos.

Componentes:

- `CreditRulesForm`: configuração de limite e prazo de atraso.
- `OperatorList`: listagem de operadores autorizados.
- `OperatorForm`: gerenciamento de operadores, conforme as permissões definidas.

Essa página só deverá ser implementada se as respectivas funcionalidades estiverem previstas nos requisitos e forem suportadas pela API.

### 7.6 Extrato e relatórios

**Objetivo:** consultar o histórico financeiro e as informações operacionais previstas no escopo.

Componentes:

- `StatementFilters`: filtros do extrato.
- `TransactionStatement`: histórico de lançamentos.
- `ReportSummary`: resumo dos dados disponíveis.
- `ReportTable`: tabela de resultados.

Relatórios deverão utilizar dados reais da API. Exportações e gráficos adicionais não serão incluídos sem previsão explícita nos requisitos.

### 7.7 Visão geral

A visão geral será a última página desenvolvida, após o funcionamento das operações principais.

Componentes:

- `FinancialSummary`: indicadores financeiros previstos.
- `OverdueAccounts`: resumo das contas em atraso.
- `RecentTransactions`: movimentações recentes.

Os indicadores deverão ser calculados a partir dos dados persistidos. A visão geral não será o ponto de partida do projeto.

## 8. Estados e integração do frontend

As páginas que consultam a API deverão apresentar:

- estado de carregamento;
- lista vazia;
- erro de comunicação;
- erro de validação;
- confirmação de sucesso;
- indicação de conta bloqueada;
- confirmação antes de operações financeiras relevantes.

Após consumos, pagamentos e estornos, a interface deverá atualizar os dados a partir da API.

A autenticação e as permissões deverão ser verificadas no backend, não apenas por controles visuais no frontend.

## 9. Estratégia de testes

A execução seguirá esta ordem:

1. Testar `GET /api/health`.
2. Testar as rotas de cadastro, consulta, edição e status de alunos.
3. Testar a consulta de saldo e o cálculo do crédito disponível.
4. Testar o registro de consumos e os bloqueios por limite e atraso.
5. Testar pagamentos parciais e totais, incluindo a amortização FIFO.
6. Testar estornos e a preservação do histórico.
7. Testar autenticação e permissões.
8. Testar a integração entre frontend, API e PostgreSQL.
9. Conferir as páginas com o protótipo do Figma.

Cada rota deverá ser testada antes de avançar para a próxima etapa dependente.

## 10. Critérios de conclusão do design

O design será considerado atendido quando:

- a arquitetura e os modelos estiverem documentados;
- as rotas tiverem contratos definidos e testáveis;
- as regras financeiras estiverem relacionadas aos serviços responsáveis;
- os componentes estiverem especificados por página;
- o protótipo e os requisitos estiverem alinhados;
- o desenvolvimento seguir a ordem backend → testes → frontend → validação final.

Nenhuma funcionalidade deverá ser adicionada apenas por conveniência técnica ou estética. Mudanças de escopo deverão ser registradas primeiro em `REQUIREMENTS.md` e refletidas em `DESIGN.md` e `TASKS.md`.
