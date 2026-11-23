
# REQUIREMENTS.md
# Sistema de Controle de Fiados da Cantina

## 1. Objetivo do sistema

O Sistema de Controle de Fiados da Cantina permite que a administração da cantina cadastre e consulte alunos, registre compras a prazo e à vista, acompanhe dívidas e créditos, registre pagamentos e estornos e consulte informações operacionais.

O sistema deve manter o histórico financeiro de cada aluno. O saldo devedor não pode ser editado diretamente: ele deve resultar dos lançamentos financeiros válidos.

## 2. Escopo

### 2.1 Funcionalidades incluídas

1. Cadastro, consulta, pesquisa e filtro de alunos.
2. Consulta da conta financeira de um aluno, incluindo saldo devedor, limite, crédito disponível e situação.
3. Registro de consumo a prazo associado a um aluno.
4. Registro de compra à vista, com forma de pagamento informada manualmente.
5. Registro de pagamento total ou parcial de uma dívida existente.
6. Amortização dos pagamentos nos consumos em aberto mais antigos primeiro (FIFO).
7. Registro de estorno/correção com motivo obrigatório e preservação do histórico.
8. Consulta do extrato de lançamentos.
9. Aplicação das regras de limite de crédito e atraso.
10. Configuração de dados operacionais da cantina, limite padrão e prazo para bloqueio.
11. Perfil administrativo e estrutura prevista para controle de acesso por perfil/permissão.
12. Relatórios operacionais e financeiros derivados dos lançamentos.
13. Visão geral com indicadores calculados a partir dos dados registrados.

### 2.2 Fora do escopo desta versão

- Integração com bancos, Pix, maquininhas ou gateways de pagamento.
- Cobrança automática por e-mail, SMS ou WhatsApp.
- Aplicativo móvel independente.
- Integração com sistemas acadêmicos externos.
- Emissão fiscal ou contabilidade oficial.
- Gestão de estoque, fornecedores, receitas ou compras da cantina.
- Juros, multas ou parcelamento de dívidas.
- Portal independente para aluno/responsável nesta versão.
- Múltiplas unidades com consolidação entre cantinas.

## 3. Atores e permissões

### Administrador da cantina
- Gerenciar dados e configurações operacionais.
- Consultar alunos, contas, lançamentos e relatórios.
- Registrar consumos a prazo e compras à vista.
- Registrar pagamentos e estornos.
- Gerenciar operadores e permissões quando a autenticação estiver implementada.

### Operador da cantina
- Consultar alunos e contas.
- Registrar consumos e compras à vista.
- Registrar pagamentos e estornos se possuir permissão.
- Consultar os lançamentos necessários à sua operação.

### Aluno/responsável
Nesta versão do projeto, não haverá portal de autenticação próprio para aluno/responsável. A consulta e a administração dos registros serão realizadas pela interface administrativa da cantina.

## 4. Requisitos funcionais

### RF01 — Cadastro de aluno
O sistema deve permitir cadastrar aluno com identificador único, nome, turma/série e demais dados definidos para a operação. Deve validar campos obrigatórios e impedir duplicidade do identificador.

### RF02 — Consulta de alunos
O sistema deve listar e pesquisar alunos por nome ou matrícula e permitir filtrar resultados por situação. A listagem deve apresentar informações relevantes da conta.

### RF03 — Consulta de conta do aluno
O sistema deve exibir saldo devedor, limite de crédito, crédito disponível, situação da conta e histórico cronológico dos lançamentos do aluno.

### RF04 — Registro de consumo a prazo
O sistema deve registrar consumo com aluno, data/hora, descrição e valor positivo. Antes de aceitar o lançamento, deve validar a situação da conta, o crédito disponível e o limite.

### RF05 — Registro de compra à vista
O sistema deve permitir registrar uma compra paga no momento do lançamento, informando aluno, descrição, valor e forma de pagamento (Dinheiro, Pix ou Cartão). A compra deve ser registrada como quitada, sem aumentar a dívida e sem consumir o crédito disponível do aluno.

### RF06 — Atualização do saldo
O saldo devedor deve resultar dos lançamentos financeiros válidos, considerando pagamentos e estornos. Valores monetários devem ser tratados com precisão decimal, evitando cálculos financeiros baseados em ponto flutuante binário.

### RF07 — Limite de crédito
O sistema deve permitir definir limite por aluno e limite padrão para novas contas. O valor padrão inicial é R$ 50,00. Um consumo a prazo que ultrapasse o limite disponível deve ser recusado.

### RF08 — Bloqueio por atraso
O sistema deve identificar contas com lançamentos vencidos conforme o prazo configurado. A conta em atraso/bloqueada não pode receber novos consumos a prazo. Compras à vista não geram nova dívida e podem ser registradas sem alterar o saldo devedor.

### RF09 — Registro de pagamento de dívida
O sistema deve permitir registrar pagamento total ou parcial de uma dívida existente, informando aluno, valor, data/hora e forma de pagamento. O valor deve ser positivo e não pode exceder o saldo em aberto.

### RF10 — Amortização de pagamentos
O pagamento deve abater primeiro os consumos em aberto mais antigos (FIFO). O sistema deve preservar o valor original, o valor amortizado e o saldo restante de cada consumo.

### RF11 — Estorno/correção
O sistema deve permitir estornar um lançamento autorizado, exigir motivo, registrar data/hora e preservar o registro original. Um estorno não deve apagar fisicamente o lançamento e não pode ser repetido.

### RF12 — Extrato e lançamentos
O sistema deve listar lançamentos com data/hora, aluno, tipo, descrição/motivo, forma de pagamento quando aplicável e valor. Deve oferecer pesquisa e filtros compatíveis com a tela.

### RF13 — Configurações operacionais
O sistema deve permitir a usuários autorizados alterar dados operacionais da cantina, ano letivo, limite padrão, prazo para bloqueio e opções de bloqueio. As alterações devem ser validadas e persistidas quando a integração estiver concluída.

### RF14 — Operadores e permissões
O sistema deve identificar o operador responsável pelas operações e restringir ações conforme as permissões atribuídas. Senhas, se utilizadas, devem ser armazenadas como hash, nunca em texto puro.

### RF15 — Relatórios
O sistema deve disponibilizar relatórios operacionais e financeiros derivados dos lançamentos, incluindo inadimplência, consumo por turma e estornos. Valores recebidos por compras à vista e pagamentos de dívidas devem ser identificados corretamente, sem duplicidade.

### RF16 — Visão geral
O sistema deve apresentar indicadores como total a receber, contas em atraso, contas próximas do limite e total recebido no período. Os indicadores devem ser calculados a partir dos registros financeiros.

### RF17 — Perfil administrativo
O sistema deve apresentar os dados do perfil administrativo e permitir editar os campos pessoais previstos na interface. Alteração de senha e gerenciamento real de sessão dependem da implementação da autenticação.

## 5. Regras de negócio

- RN01: O saldo devedor corresponde à soma dos valores de consumo a prazo ainda não amortizados, considerando pagamentos e estornos válidos.
- RN02: O limite padrão de crédito é R$ 50,00, podendo ser alterado por usuário autorizado.
- RN03: Um consumo a prazo que ultrapasse o limite disponível deve ser recusado.
- RN04: Contas com consumo vencido há mais dias do que o prazo configurado ficam bloqueadas para novos consumos a prazo.
- RN05: O pagamento parcial deve ser aplicado aos consumos mais antigos em aberto antes dos mais recentes.
- RN06: Estorno exige motivo e não remove o registro original; deve manter registro compensatório/rastreável.
- RN07: Operações financeiras devem ser atômicas/transacionais na versão integrada ao banco.
- RN08: O saldo exibido no resumo e no extrato deve ser consistente com os lançamentos.
- RN09: Somente operadores autenticados e autorizados podem realizar operações protegidas quando a autenticação estiver implementada.
- RN10: Relatórios e indicadores devem derivar dos dados registrados, sem números demonstrativos fixos.
- RN11: Valores financeiros devem usar NUMERIC/DECIMAL no PostgreSQL e validação adequada na API.
- RN12: O ano letivo e o prazo de atraso devem ser tratados como configurações.
- RN13: Compra à vista é registrada como quitada e não aumenta o saldo devedor nem utiliza crédito disponível.
- RN14: A forma de pagamento de uma compra à vista ou de um pagamento de dívida é apenas registrada manualmente; o sistema não processa a transação financeira externa.
- RN15: Uma conta bloqueada para compras a prazo ainda pode registrar compra à vista, pois essa operação não aumenta a dívida.

## 6. Requisitos não funcionais

- RNF01 — Arquitetura: frontend separado de API backend Node.js/Express.
- RNF02 — Persistência: PostgreSQL como banco de dados relacional.
- RNF03 — ORM: Sequelize para modelos e associações.
- RNF04 — Segurança: validar dados no servidor e aplicar autorização por perfil.
- RNF05 — Integridade: transações de banco para consumo, pagamento, amortização e estorno.
- RNF06 — Testabilidade: rotas documentadas e testadas por testes automatizados.
- RNF07 — Usabilidade: mensagens claras de validação, confirmação para operações sensíveis e indicação visível de conta bloqueada.
- RNF08 — Manutenibilidade: separar rotas, controllers, services, models e middlewares.
- RNF09 — Auditoria: preservar o histórico das operações financeiras relevantes.
- RNF10 — Interface: priorizar a resolução de referência 1366 × 768, com adaptação básica para telas menores.
- RNF11 — Configuração: credenciais e parâmetros de ambiente devem ficar em variáveis de ambiente.

## 7. Critérios de aceitação essenciais

1. Um aluno pode ser cadastrado e localizado na listagem.
2. Um consumo a prazo válido aparece no histórico e aumenta o saldo em aberto.
3. Um consumo que viola o limite ou o bloqueio por atraso é recusado.
4. Uma compra à vista aparece como quitada e não altera saldo devedor nem crédito disponível.
5. Um pagamento parcial reduz a dívida e abate primeiro o consumo mais antigo.
6. Um estorno exige motivo, mantém o histórico e não pode ser repetido.
7. O resumo da conta e o extrato apresentam valores consistentes.
8. Usuários sem permissão não conseguem executar operações restritas quando a autorização da API estiver implementada.
9. Indicadores e relatórios são calculados a partir dos lançamentos.
10. As telas integradas usam a API e os dados persistidos, sem depender de dados demonstrativos fixos.

## 8. Premissas e pontos pendentes

- Os nomes, valores e datas usados no protótipo são demonstrativos.
- As formas de pagamento Dinheiro, Pix e Cartão são apenas registradas manualmente; não existe processamento de pagamento externo.
- A autenticação e a política de criação de operadores ainda precisam ser concluídas.
- A regra exata de vencimento de cada consumo deve ser formalizada na implementação do backend.
- O frontend atualmente possui fluxos que usam estado local do React; isso não equivale à persistência definitiva no PostgreSQL.
