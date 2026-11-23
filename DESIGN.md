
# DESIGN.md
# Arquitetura e design — Sistema de Controle de Fiados da Cantina

## 1. Objetivo arquitetural

A solução está organizada em frontend React e backend Node.js/Express, com PostgreSQL e Sequelize previstos para persistência. O backend deve concentrar as regras financeiras e ser a camada responsável por alterar os dados persistidos.

**Estado atual:** a interface frontend possui páginas e fluxos funcionais em estado local do React. A integração completa das telas com a API e a persistência de todos os fluxos ainda está pendente. Portanto, o comportamento do protótipo não deve ser confundido com funcionamento integrado em produção.

## 2. Stack

- Frontend: React, Vite, React Router e CSS.
- Backend: Node.js e Express.
- Banco de dados: PostgreSQL.
- ORM: Sequelize.
- Testes previstos: Jest e Supertest.
- Comunicação prevista: HTTP/JSON por cliente centralizado em `src/services`.
- Configuração: variáveis de ambiente.

## 3. Estrutura atual do repositório

```text
Controle-Fiados/
├── backend/
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        ├── context/
        │   └── AlunosContext.jsx
        ├── pages/
        │   ├── Alunos.jsx
        │   ├── Configuracoes.jsx
        │   ├── ContaAluno.jsx
        │   ├── DetalhesAluno.jsx
        │   ├── Home.jsx
        │   ├── Lancamentos.jsx
        │   ├── Login.jsx
        │   ├── Perfil.jsx
        │   └── Relatorios.jsx
        ├── services/
        └── styles/
```

A estrutura acima registra a organização observada no projeto. Arquivos e módulos adicionais podem existir; a árvore deve ser atualizada quando a arquitetura mudar.

## 4. Modelo de dados

### 4.1 Aluno
- `id`: chave primária.
- `nome`: nome do aluno.
- `matricula`: identificador escolar.
- `turma`: turma/série.
- `ativo`: situação cadastral.
- `createdAt`, `updatedAt`.

### 4.2 Fiado/Consumo
- `id`: chave primária.
- `aluno_id` ou associação equivalente: aluno relacionado.
- `descricao`: descrição do consumo.
- `valor`: valor original.
- `data_compra`: data/hora do consumo.
- `data_pagamento`: quando aplicável.
- `status`: situação do lançamento.
- Campos adicionais do protótipo: `valorPago`, `creditoUtilizado`, `estornado`, `formaPagamento` e `pagamentoAvista`.

### 4.3 Pagamento
- `id`: chave primária.
- `fiado_id` ou associação equivalente: lançamento relacionado.
- `valor`: valor amortizado.
- `data_pagamento`: data/hora do pagamento.
- A forma de pagamento deve ser registrada quando aplicável.

### 4.4 Relações

- Aluno possui vários Fiados.
- Fiado pertence a um Aluno.
- Fiado possui vários Pagamentos.
- Pagamento pertence a um Fiado.

**Observação:** os nomes e campos acima descrevem o modelo Sequelize existente no projeto e o estado observado durante o desenvolvimento. A modelagem final precisa ser revisada para garantir que compras à vista, pagamentos de dívidas, alocações FIFO e estornos sejam persistidos sem ambiguidades.

## 5. Regras de cálculo e operações

### 5.1 Consumo a prazo
1. Identificar o aluno.
2. Validar descrição e valor positivo.
3. Verificar se a conta está bloqueada.
4. Utilizar o crédito disponível primeiro, quando houver.
5. Somar o restante ao saldo devedor.
6. Recusar o consumo se ultrapassar o limite.
7. Registrar o lançamento no histórico.

### 5.2 Compra à vista
1. Identificar o aluno.
2. Validar descrição, valor e forma de pagamento.
3. Registrar o consumo com `pagamentoAvista = true`.
4. Registrar `valorPago` igual ao valor total e `creditoUtilizado = 0`.
5. Não alterar saldo devedor nem crédito disponível.
6. Não realizar integração com Pix, cartão ou banco.

### 5.3 Pagamento de dívida
1. Identificar o aluno e validar o valor.
2. Impedir pagamento maior que o saldo devedor.
3. Aplicar o valor aos consumos em aberto mais antigos primeiro (FIFO).
4. Registrar data e forma de pagamento.
5. Atualizar saldo e situação da conta.

### 5.4 Estorno
1. Selecionar lançamento elegível.
2. Exigir motivo.
3. Preservar o lançamento original.
4. Registrar a operação de estorno.
5. Recalcular saldo/crédito conforme a natureza do lançamento.
6. Impedir estorno duplicado.

A implementação definitiva dessas regras deve ocorrer no backend, em transações de banco. A lógica atualmente executada no contexto React é uma implementação local do protótipo e ainda requer validação e integração.

## 6. Rotas previstas da API

Prefixo comum: `/api`.

### Saúde
- `GET /api/health`

### Alunos
- `POST /api/alunos`
- `GET /api/alunos`
- `GET /api/alunos/:id`
- `PATCH /api/alunos/:id`

### Consumos/fiados
- `POST /api/fiados`
- `GET /api/fiados`
- `GET /api/alunos/:id/fiados`

### Pagamentos
- `POST /api/pagamentos`

### Estornos
- Rota para criação de estorno de lançamento, com motivo obrigatório e prevenção de duplicidade.

### Configurações, operadores e relatórios
As rotas de configurações, autenticação, operadores, relatórios e visão geral devem ser definidas e implementadas conforme os requisitos. Os caminhos desta seção são contratos de planejamento, não confirmação de que todas as rotas já existem ou estão testadas.

## 7. Frontend: páginas e responsabilidades

### 7.1 Visão geral — `Home.jsx`
Apresenta indicadores e informações resumidas da cantina, além de atalhos para as principais operações. No estado atual, a interface utiliza os dados disponíveis no contexto local; a origem definitiva deve ser a API.

### 7.2 Contas de alunos — `Alunos.jsx`
- Listagem de alunos.
- Busca e filtros.
- Cadastro de aluno.
- Acesso ao detalhe da conta.

### 7.3 Conta do aluno — `ContaAluno.jsx`
- Dados e situação do aluno.
- Saldo devedor, limite e crédito.
- Consumos em aberto e histórico.
- Formulário de pagamento.
- Formulário de estorno com motivo obrigatório.

### 7.4 Lançamentos — `Lancamentos.jsx`
- Busca de aluno por nome ou matrícula.
- Seleção da modalidade: a prazo ou à vista.
- Registro de consumo a prazo.
- Registro de compra à vista com forma de pagamento Dinheiro, Pix ou Cartão.
- Exibição dos lançamentos recentes.
- Compra à vista deve aparecer quitada e não alterar saldo nem crédito.

### 7.5 Configurações — `Configuracoes.jsx`
Interface para parâmetros operacionais da cantina. A persistência e a autorização das alterações dependem da integração com a API.

### 7.6 Relatórios — `Relatorios.jsx`
Apresenta relatórios e indicadores. Os cálculos precisam ser conferidos com os lançamentos persistidos, incluindo a distinção entre compras à vista e pagamentos de dívidas.

### 7.7 Perfil — `Perfil.jsx`
Apresenta dados do administrador e permite editar campos pessoais previstos na interface. Alteração real de senha e sessão depende da autenticação.

### 7.8 Login — `Login.jsx`
Página de entrada prevista. A autenticação real e o controle de sessão ainda precisam ser implementados e protegidos no backend.

## 8. Contexto de estado do frontend

O `AlunosContext.jsx` centraliza atualmente:
- lista de alunos;
- consumos;
- pagamentos;
- estornos;
- registros de crédito utilizado;
- funções para registrar consumo a prazo;
- função para registrar compra à vista;
- função para registrar pagamento;
- função para estornar consumo.

O estado é mantido no React. Sem integração e persistência, os dados podem ser perdidos ao atualizar ou reiniciar a aplicação. O contexto é adequado ao protótipo, mas não substitui a API nem o banco de dados.

## 9. Estados de interface

As páginas devem prever:
- carregamento;
- lista vazia;
- erro de comunicação;
- erro de validação;
- sucesso;
- acesso negado;
- confirmação para pagamento/estorno;
- indicação de conta bloqueada;
- atualização após operação financeira.

## 10. Segurança e integridade

- A validação de limite, saldo, atraso e permissão deve ser repetida no backend.
- A interface não pode ser a única barreira de autorização.
- Valores financeiros devem ser persistidos em `NUMERIC/DECIMAL`.
- Consumo, pagamento, amortização e estorno devem ser atômicos.
- Lançamentos confirmados não devem ser apagados fisicamente.
- Credenciais não devem ser armazenadas em texto puro.
- Formas de pagamento são apenas registradas manualmente; não existe processamento externo.

## 11. Estratégia de testes

Testar, no mínimo:
- cadastro e pesquisa de aluno;
- consumo permitido e consumo acima do limite;
- bloqueio por atraso;
- compra à vista sem alteração do saldo ou crédito;
- pagamento parcial e total com FIFO;
- estorno com motivo e bloqueio de duplicidade;
- consistência entre resumo e extrato;
- permissões de operador;
- relatórios calculados a partir dos lançamentos.

## 12. Limites e decisões

- A resolução de referência da interface é 1366 × 768, com adaptação básica.
- Não implementar integração bancária, Pix ou maquininha.
- Não iniciar novas funcionalidades pelo dashboard; priorizar regras financeiras e persistência.
- O estado local do React é provisório.
- Mudanças de escopo devem ser registradas em `REQUIREMENTS.md`, refletidas em `DESIGN.md` e decompostas em `TASKS.md`.
