
# TASKS.md
# Plano de implementação — Sistema de Controle de Fiados da Cantina

## Como interpretar os status

- `[x]` Concluído e confirmado no projeto.
- `[ ]` Pendente ou ainda sem confirmação suficiente.
- `PARCIAL` A interface ou parte da lógica existe, mas o critério completo da tarefa ainda não foi atendido.

As tarefas que exigem integração com API, banco, autenticação ou testes não devem ser consideradas concluídas apenas porque existe uma tela funcional com estado local do React.

## Fase 1 — Backend, banco e regras financeiras

### T01 — Estrutura do backend e endpoint de saúde
- [ ] Separar aplicação Express (`app.js`) e inicialização (`server.js`) para permitir testes.
- [ ] Disponibilizar `GET /api/health`.
- [ ] Criar teste automatizado do endpoint.
- [ ] Confirmar resposta HTTP 200 e execução do teste.

Status: PARCIAL — o servidor Express foi iniciado localmente, mas não há confirmação suficiente de endpoint de saúde e teste automatizado aprovados.

### T02 — PostgreSQL e Sequelize
- [x] Criar banco local `controle_fiados`.
- [x] Configurar o serviço PostgreSQL local.
- [ ] Padronizar configuração por variáveis de ambiente.
- [ ] Confirmar migrations reproduzíveis em banco limpo.
- [ ] Criar e validar banco de teste.

Status: PARCIAL — banco local e tabelas foram criados/consultados, mas a configuração completa e migrations ainda precisam ser verificadas.

### T03 — Modelos e associações
- [x] Criar modelos relacionados a Aluno, Fiado e Pagamento.
- [x] Definir associações entre Aluno, Fiado e Pagamento.
- [ ] Revisar campos e tipos monetários para persistência consistente.
- [ ] Garantir migrations reversíveis e criação do esquema do zero.
- [ ] Testar todas as relações em banco de teste.

Status: PARCIAL — modelos e tabelas principais existem, mas a modelagem final e as migrations precisam ser validadas.

### T04 — Cadastro e consulta de alunos pela API
- [ ] Implementar e validar `POST /api/alunos`.
- [ ] Implementar e validar `GET /api/alunos` com busca e filtros.
- [ ] Implementar e validar `GET /api/alunos/:id`.
- [ ] Implementar e validar atualização cadastral.
- [ ] Testar validação, duplicidade e aluno inexistente.

Status: PENDENTE — a interface de alunos existe, mas a integração completa com a API não foi confirmada.

### T05 — Consulta da conta e cálculo do saldo no backend
- [ ] Criar consulta de conta por aluno.
- [ ] Centralizar cálculo de saldo, limite e crédito disponível no backend.
- [ ] Garantir consistência entre resumo e extrato.
- [ ] Testar conta sem lançamentos, com consumo, pagamento e estorno.

Status: PENDENTE — os cálculos atuais do protótipo são realizados no contexto React.

### T06 — Registro de consumo a prazo pela API
- [ ] Implementar rota de criação de consumo/fiado.
- [ ] Validar valor, aluno, situação e limite.
- [ ] Implementar bloqueio por atraso.
- [ ] Registrar operação e auditoria na mesma transação.
- [ ] Testar sucesso, limite excedido e conta bloqueada.

Status: PARCIAL — a regra de consumo a prazo existe no contexto React, mas a validação definitiva no backend não foi confirmada.

### T07 — Pagamento parcial/total e amortização FIFO
- [ ] Implementar rota de pagamento.
- [ ] Validar valor e saldo em aberto.
- [ ] Aplicar pagamento aos consumos mais antigos primeiro.
- [ ] Persistir as amortizações.
- [ ] Testar pagamento parcial, quitação de vários consumos e valor acima da dívida.

Status: PARCIAL — existe função de pagamento no contexto React com aplicação FIFO local; falta comprovar a operação transacional pela API.

### T08 — Estorno auditável
- [ ] Implementar rota de estorno.
- [ ] Exigir motivo e permissão.
- [ ] Impedir estorno duplicado.
- [ ] Preservar lançamento original e registrar operação compensatória.
- [ ] Testar estorno e consistência de saldo/crédito.

Status: PARCIAL — existe função de estorno no contexto React com motivo obrigatório e marcação do lançamento; falta integração e auditoria persistente no backend.

### T09 — Extrato e filtros pela API
- [ ] Implementar consulta de lançamentos.
- [ ] Implementar extrato por aluno.
- [ ] Implementar filtros por aluno, período, tipo e forma de pagamento.
- [ ] Implementar paginação e ordenação estável.
- [ ] Testar saldo acumulado e combinação de filtros.

Status: PARCIAL — existem históricos e listagens no frontend, mas a consulta integrada pela API não foi confirmada.

### T10 — Autenticação, autorização e operadores
- [ ] Definir mecanismo de autenticação.
- [ ] Armazenar senhas com hash seguro.
- [ ] Criar middlewares de autenticação e autorização.
- [ ] Implementar gerenciamento de operadores.
- [ ] Proteger rotas financeiras e configurações.
- [ ] Testar acesso sem login e sem permissão.

Status: PENDENTE — há páginas de Login e Perfil, mas isso não comprova autenticação ou autorização real.

### T11 — Configurações operacionais
- [ ] Implementar leitura e atualização de configurações pela API.
- [ ] Persistir nome da cantina, ano letivo, limite padrão e prazo de atraso.
- [ ] Validar campos e restringir alterações por permissão.
- [ ] Testar aplicação das configurações às operações.

Status: PARCIAL — a página de configurações existe no frontend; persistência e autorização pela API ainda não foram confirmadas.

### T12 — Testes de integração e documentação da API
- [ ] Criar testes automatizados para rotas principais.
- [ ] Testar sequência cadastro → consumo → pagamento → consulta → estorno.
- [ ] Testar integridade transacional.
- [ ] Padronizar respostas de erro.
- [ ] Executar a suíte em ambiente de teste limpo.

Status: PENDENTE — não há confirmação de suíte de integração aprovada.

## Fase 2 — Frontend

### T13 — Estrutura React e cliente de API
- [x] Criar aplicação frontend com React/Vite.
- [x] Configurar navegação com React Router.
- [x] Organizar páginas, componentes, contexto e estilos.
- [ ] Criar cliente central de API em `src/services`.
- [ ] Configurar URL base por variável de ambiente.
- [ ] Centralizar tratamento de erros e carregamento das requisições.

Status: PARCIAL — estrutura e navegação estão implementadas; integração centralizada com a API continua pendente.

### T14 — Tela de contas dos alunos
- [x] Criar listagem de alunos.
- [x] Criar busca e filtros na interface.
- [x] Criar formulário de cadastro na interface.
- [x] Permitir abrir a conta/detalhe do aluno.
- [ ] Integrar listagem e cadastro à API.
- [ ] Validar persistência, duplicidade e erros retornados pelo backend.

Status: PARCIAL — interface implementada; integração com API não concluída.

### T15 — Detalhe da conta do aluno
- [x] Exibir dados do aluno e situação da conta.
- [x] Exibir resumo de saldo, limite e crédito.
- [x] Exibir consumos e histórico.
- [x] Criar formulário de pagamento.
- [x] Criar formulário de estorno com motivo.
- [ ] Integrar operações à API.
- [ ] Validar atualização do resumo após operações persistidas.

Status: PARCIAL — fluxos visuais e lógica local implementados; falta integração e validação ponta a ponta.

### T16 — Tela de lançamentos
- [x] Criar formulário de consumo a prazo.
- [x] Criar busca de aluno por nome ou matrícula.
- [x] Criar seleção entre lançamento a prazo e compra à vista.
- [x] Criar seleção de forma de pagamento para compra à vista (Dinheiro, Pix ou Cartão).
- [x] Registrar compra à vista como quitada no estado local, sem aumentar dívida nem consumir crédito.
- [x] Exibir lançamentos recentes com modalidade e forma de pagamento.
- [ ] Integrar lançamentos à API e ao banco.
- [ ] Validar comportamento de conta bloqueada pela API.
- [ ] Integrar compras à vista aos relatórios sem duplicar valores.

Status: PARCIAL — interface e lógica local implementadas; persistência e integração com relatórios pendentes.

### T17 — Configurações e perfil
- [x] Criar página de configurações.
- [x] Criar página de perfil administrativo.
- [x] Permitir edição local dos campos previstos no perfil.
- [ ] Persistir configurações e perfil pela API.
- [ ] Implementar autenticação, alteração de senha e permissões reais.
- [ ] Validar acesso conforme perfil.

Status: PARCIAL — páginas do frontend existem; persistência e segurança ainda não foram concluídas.

### T18 — Relatórios
- [x] Criar página de relatórios.
- [ ] Integrar relatórios aos dados persistidos.
- [ ] Validar filtros de período.
- [ ] Conferir cálculos de recebimentos, consumos e estornos.
- [ ] Incluir compras à vista nos totais apropriados sem contar duas vezes.
- [ ] Testar consistência com as contas dos alunos.

Status: PARCIAL — página visual existe; cálculos e integração precisam ser validados com dados da API.

### T19 — Visão geral
- [x] Criar página inicial/visão geral.
- [x] Exibir cartões e informações resumidas no protótipo.
- [ ] Integrar indicadores a consultas reais da API.
- [ ] Conferir total a receber, contas em atraso e próximas do limite.
- [ ] Validar total recebido no período com pagamentos e compras à vista.

Status: PARCIAL — visão geral visual existe; indicadores ainda precisam ser ligados aos dados persistidos.

## Fase 3 — Verificação final

### T20 — Teste ponta a ponta e revisão
- [ ] Executar cadastro de aluno pela API.
- [ ] Registrar consumo a prazo e validar saldo/limite.
- [ ] Registrar compra à vista e validar que não altera dívida nem crédito.
- [ ] Registrar pagamento parcial e validar FIFO.
- [ ] Estornar lançamento e verificar motivo e histórico.
- [ ] Validar bloqueio por limite e atraso.
- [ ] Validar permissões de operador.
- [ ] Conferir filtros, estados vazios e mensagens de erro.
- [ ] Conferir relatórios e visão geral com dados persistidos.
- [ ] Comparar as telas com o Figma.
- [ ] Confirmar que os três documentos refletem o código entregue.

Status: PENDENTE — os testes completos integrados ainda não foram confirmados.

## Resumo do que já está implementado no protótipo

- [x] Estrutura inicial do frontend React/Vite.
- [x] Navegação entre as páginas principais.
- [x] Listagem, busca e cadastro de alunos na interface.
- [x] Tela de conta do aluno.
- [x] Pagamento local com amortização FIFO.
- [x] Estorno local com motivo obrigatório.
- [x] Lançamento de consumo a prazo.
- [x] Busca por nome ou matrícula na tela de lançamentos.
- [x] Compra à vista com forma de pagamento registrada.
- [x] Página de configurações.
- [x] Página de perfil administrativo.
- [x] Página de relatórios e visão geral no frontend.

**Importante:** os itens acima descrevem o protótipo frontend e a lógica em memória. Eles não significam que todas as funcionalidades estejam persistidas no PostgreSQL, integradas à API, protegidas por autenticação ou cobertas por testes automatizados.
