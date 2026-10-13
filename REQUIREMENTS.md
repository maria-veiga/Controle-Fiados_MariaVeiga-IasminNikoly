# REQUIREMENTS.md — Sistema de Controle de Fiados da Cantina

## 1. Objetivo do sistema

O sistema tem como objetivo controlar os consumos fiados realizados pelos alunos na cantina, registrando as dívidas, os pagamentos e os estornos.

A aplicação deverá permitir consultar o saldo devedor de cada aluno, controlar o limite de crédito e manter um histórico das movimentações financeiras.

O foco principal é registrar e controlar os fiados com segurança e consistência.

## 2. Escopo do sistema

O sistema deverá oferecer as seguintes funcionalidades:

- Cadastro, consulta, edição e ativação ou desativação de alunos.
- Definição e consulta do limite de crédito dos alunos.
- Registro e consulta de consumos fiados.
- Cálculo do saldo devedor e do crédito disponível.
- Registro de pagamentos parciais e totais.
- Distribuição dos pagamentos conforme a regra FIFO.
- Registro de estornos com justificativa.
- Consulta do extrato e do histórico financeiro.
- Bloqueio de novos consumos conforme as regras de limite e atraso.
- Controle de acesso conforme o perfil do usuário.
- Configuração das regras de crédito e atraso, quando autorizada.
- Consulta de informações financeiras e operacionais previstas no projeto.

## 3. Requisitos funcionais

### RF01 — Cadastro de alunos

O sistema deverá permitir cadastrar alunos com nome, matrícula e turma.

A matrícula deverá ser única. O sistema deverá validar os campos obrigatórios e impedir cadastros inválidos.

### RF02 — Consulta e edição de alunos

O sistema deverá permitir listar, pesquisar, consultar e editar os dados dos alunos.

Também deverá permitir ativar ou desativar um cadastro sem excluir o histórico financeiro associado.

### RF03 — Limite de crédito

Cada aluno deverá possuir um limite de crédito. O limite padrão será de R$ 50,00.

O sistema deverá calcular o crédito disponível subtraindo o saldo devedor do limite de crédito.

### RF04 — Registro de consumos fiados

O sistema deverá permitir registrar consumos com identificação do aluno, descrição, valor e data.

Antes de registrar um consumo, deverá verificar se o aluno existe, está ativo, não está bloqueado e possui crédito disponível.

### RF05 — Consulta de saldo

O sistema deverá apresentar o saldo devedor, o limite de crédito e o crédito disponível de cada aluno.

O saldo deverá ser calculado a partir dos consumos e dos pagamentos válidos, sem depender de alterações manuais no valor da dívida.

### RF06 — Registro de pagamentos

O sistema deverá permitir registrar pagamentos parciais ou totais associados aos consumos fiados.

O valor pago deverá ser validado para impedir pagamentos inválidos ou superiores ao saldo devido.

### RF07 — Amortização FIFO

Quando um pagamento for distribuído entre diferentes dívidas abertas, o sistema deverá priorizar os consumos mais antigos.

A distribuição deverá respeitar os valores ainda devidos em cada consumo.

### RF08 — Estornos

O sistema deverá permitir estornar pagamentos mediante justificativa e autorização adequada.

O estorno deverá preservar o registro original, armazenar a justificativa e atualizar os cálculos financeiros.

### RF09 — Extrato financeiro

O sistema deverá apresentar o histórico de consumos, pagamentos e estornos do aluno.

As informações deverão permitir identificar as movimentações, seus valores e suas datas.

### RF10 — Bloqueio por limite e atraso

O sistema deverá impedir novos consumos quando o aluno não possuir crédito disponível ou estiver bloqueado por atraso, conforme as regras configuradas.

### RF11 — Autenticação e permissões

O sistema deverá controlar o acesso às funcionalidades de acordo com o perfil do usuário.

As operações administrativas e financeiras deverão ser restritas aos usuários autorizados.

O aluno poderá consultar apenas os próprios dados financeiros, conforme as permissões definidas.

### RF12 — Configurações

O sistema deverá permitir que usuários autorizados consultem e alterem as regras de crédito e atraso previstas no projeto.

### RF13 — Consultas e informações operacionais

O sistema deverá permitir consultar movimentações financeiras e informações operacionais necessárias ao controle dos fiados.

Os resultados deverão ser baseados nos dados registrados no banco de dados.

### RF14 — Visão geral

O sistema poderá apresentar um resumo financeiro, contas em atraso e movimentações recentes.

Essa funcionalidade será desenvolvida somente após a conclusão das operações principais de cadastro, consumo, pagamento e consulta.

## 4. Requisitos não funcionais

### RNF01 — Tecnologias

O backend deverá utilizar Node.js e Express para disponibilizar uma API REST.

O banco de dados deverá utilizar PostgreSQL, com Sequelize ORM para o mapeamento das entidades e operações de persistência.

O frontend deverá utilizar React, React Router e CSS.

### RNF02 — Integridade dos dados

O sistema deverá preservar os relacionamentos entre alunos, consumos e pagamentos.

As operações financeiras deverão evitar inconsistências nos saldos e nos registros.

### RNF03 — Validação

Os dados recebidos pela API deverão ser validados antes de serem persistidos.

Erros deverão retornar respostas adequadas, sem expor informações internas desnecessárias.

### RNF04 — Segurança

O sistema deverá proteger as operações por autenticação e autorização, conforme os perfis definidos.

As permissões deverão ser verificadas no backend.

### RNF05 — Testabilidade

As rotas deverão poder ser testadas individualmente com o Postman e por testes automatizados, utilizando Jest e Supertest.

### RNF06 — Manutenibilidade

O código deverá ser organizado em rotas, modelos, serviços e middlewares, conforme a necessidade do projeto.

As responsabilidades deverão ser separadas para facilitar a manutenção e os testes.

### RNF07 — Usabilidade

As páginas deverão apresentar informações claras, mensagens de erro e confirmações de operações.

A interface deverá seguir o protótipo aprovado no Figma.

## 5. Regras de negócio

### RN01 — Limite padrão

O limite de crédito padrão de cada aluno será de R$ 50,00, podendo ser alterado por usuário autorizado, conforme as regras do sistema.

### RN02 — Cálculo do saldo

O saldo devedor corresponderá aos consumos ainda não quitados, descontando os pagamentos válidos e considerando os estornos registrados.

### RN03 — Restrição de consumo

O sistema não deverá permitir consumos que ultrapassem o crédito disponível nem consumos realizados por alunos bloqueados.

### RN04 — Pagamentos parciais

Um consumo poderá receber vários pagamentos até a quitação do valor devido.

### RN05 — Amortização FIFO

Os pagamentos distribuídos entre diferentes consumos deverão quitar primeiro as dívidas mais antigas.

### RN06 — Estornos

Todo estorno deverá possuir justificativa, preservar o histórico e refletir corretamente nos cálculos financeiros.

### RN07 — Histórico

Consumos, pagamentos e estornos deverão manter seus registros para permitir consultas posteriores.

### RN08 — Permissões

As operações deverão respeitar as permissões atribuídas a cada perfil de usuário.

## 6. Restrições de escopo

O desenvolvimento deverá se limitar às funcionalidades descritas neste documento e ao protótipo do Figma.

Não fazem parte do escopo, salvo alteração formal dos requisitos:

- Integração com bancos ou gateways de pagamento.
- Aplicativo móvel independente.
- Envio automático de notificações.
- Funcionalidades adicionais de exportação de dados.
- Gráficos avançados sem necessidade definida.
- Funcionalidades que não contribuam diretamente para o controle de fiados.

A visão geral não deverá ser desenvolvida antes das funcionalidades principais.

## 7. Critérios gerais de aceitação

O sistema será considerado funcional quando:

- Os alunos puderem ser cadastrados, consultados e editados.
- Os consumos forem registrados respeitando os limites e bloqueios.
- O saldo devedor e o crédito disponível forem calculados corretamente.
- Os pagamentos parciais e totais funcionarem.
- A amortização FIFO respeitar a ordem das dívidas.
- Os estornos exigirem justificativa e preservarem o histórico.
- As permissões impedirem operações não autorizadas.
- O extrato apresentar as movimentações financeiras corretamente.
- As rotas principais e os fluxos financeiros forem testados.
- O frontend estiver integrado à API e alinhado ao protótipo.
- Os três documentos do projeto apresentarem requisitos, arquitetura e tarefas consistentes entre si.
