
import { useState } from "react";
import "../styles/configuracoes.css";

function Configuracoes() {
  const [nomeCantina, setNomeCantina] = useState("Cantina IFAL");
  const [limitePadrao, setLimitePadrao] = useState("50");
  const [prazoAtraso, setPrazoAtraso] = useState("30");
  const [creditoAtivo, setCreditoAtivo] = useState(true);

  const [operadores, setOperadores] = useState([]);
  const [nomeOperador, setNomeOperador] = useState("");
  const [emailOperador, setEmailOperador] = useState("");
  const [cargoOperador, setCargoOperador] = useState("Atendente");

  const [permissoes, setPermissoes] = useState({
    administrador: {
      alunos: true,
      lancamentos: true,
      pagamentos: true,
      estornos: true,
      relatorios: true,
      configuracoes: true,
    },
    atendente: {
      alunos: true,
      lancamentos: true,
      pagamentos: true,
      estornos: false,
      relatorios: false,
      configuracoes: false,
    },
  });

  const [confirmarEstorno, setConfirmarEstorno] = useState(true);
  const [registrarAlteracoes, setRegistrarAlteracoes] = useState(true);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function salvarConfiguracoes() {
    setMensagem("");
    setErro("");

    if (!nomeCantina.trim()) {
      setErro("Informe o nome da cantina.");
      return;
    }

    if (
      !Number.isFinite(Number(limitePadrao)) ||
      Number(limitePadrao) < 0
    ) {
      setErro("Informe um limite de crédito válido.");
      return;
    }

    if (
      !Number.isInteger(Number(prazoAtraso)) ||
      Number(prazoAtraso) < 1
    ) {
      setErro("O prazo de atraso deve ser de pelo menos 1 dia.");
      return;
    }

    setMensagem("Configurações atualizadas com sucesso!");
  }

  function cadastrarOperador(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!nomeOperador.trim() || !emailOperador.trim()) {
      setErro("Preencha o nome e o e-mail do operador.");
      return;
    }

    const emailExiste = operadores.some(
      (operador) =>
        operador.email.toLowerCase() ===
        emailOperador.trim().toLowerCase()
    );

    if (emailExiste) {
      setErro("Já existe um operador cadastrado com esse e-mail.");
      return;
    }

    const novoOperador = {
      id: Date.now(),
      nome: nomeOperador.trim(),
      email: emailOperador.trim(),
      cargo: cargoOperador,
    };

    setOperadores((lista) => [...lista, novoOperador]);
    setNomeOperador("");
    setEmailOperador("");
    setCargoOperador("Atendente");
    setMensagem("Operador cadastrado com sucesso!");
  }

  function removerOperador(id) {
    setOperadores((lista) =>
      lista.filter((operador) => operador.id !== id)
    );
    setMensagem("Operador removido da lista.");
    setErro("");
  }

  function alterarPermissao(cargo, permissao) {
    setPermissoes((estadoAtual) => ({
      ...estadoAtual,
      [cargo]: {
        ...estadoAtual[cargo],
        [permissao]: !estadoAtual[cargo][permissao],
      },
    }));
  }

  const nomesPermissoes = [
    { chave: "alunos", nome: "Visualizar alunos" },
    { chave: "lancamentos", nome: "Registrar consumos" },
    { chave: "pagamentos", nome: "Registrar pagamentos" },
    { chave: "estornos", nome: "Realizar estornos" },
    { chave: "relatorios", nome: "Acessar relatórios" },
    { chave: "configuracoes", nome: "Acessar configurações" },
  ];

  return (
    <div className="configuracoes-page">
      {(mensagem || erro) && (
        <div
          className={`config-feedback ${
            erro ? "feedback-erro" : "feedback-sucesso"
          }`}
        >
          {erro || mensagem}
        </div>
      )}

      {/* CONFIGURAÇÕES GERAIS */}
      <section className="config-section">
        <div className="config-section-header">
          <div className="config-section-icon">
            <span>⚙</span>
          </div>

          <div>
            <h2>Configurações gerais</h2>
            <p>Defina as regras principais de funcionamento da cantina.</p>
          </div>
        </div>

        <div className="config-form-grid">
          <div className="config-field config-field-full">
            <label htmlFor="nomeCantina">Nome da cantina</label>
            <input
              id="nomeCantina"
              type="text"
              value={nomeCantina}
              onChange={(e) => setNomeCantina(e.target.value)}
              placeholder="Digite o nome da cantina"
            />
          </div>

          <div className="config-field">
            <label htmlFor="limitePadrao">
              Limite de crédito padrão (R$)
            </label>
            <input
              id="limitePadrao"
              type="number"
              min="0"
              step="0.01"
              value={limitePadrao}
              onChange={(e) => setLimitePadrao(e.target.value)}
            />
            <small>Valor inicial aplicado aos novos alunos.</small>
          </div>

          <div className="config-field">
            <label htmlFor="prazoAtraso">
              Prazo para bloqueio por atraso (dias)
            </label>
            <input
              id="prazoAtraso"
              type="number"
              min="1"
              step="1"
              value={prazoAtraso}
              onChange={(e) => setPrazoAtraso(e.target.value)}
            />
            <small>
              Prazo após o qual a conta deverá ser bloqueada.
            </small>
          </div>
        </div>

        <div className="config-option">
          <div>
            <strong>Utilização de crédito</strong>
            <p>
              Permite utilizar créditos disponíveis automaticamente
              nos novos consumos.
            </p>
          </div>

          <label className="config-switch">
            <input
              type="checkbox"
              checked={creditoAtivo}
              onChange={(e) => setCreditoAtivo(e.target.checked)}
            />
            <span className="config-switch-slider"></span>
          </label>
        </div>
      </section>

      {/* OPERADORES */}
      <section className="config-section">
        <div className="config-section-header">
          <div className="config-section-icon">
            <span>♙</span>
          </div>

          <div>
            <h2>Operadores</h2>
            <p>
              Cadastre e visualize as pessoas autorizadas a utilizar o sistema.
            </p>
          </div>
        </div>

        <form className="operador-form" onSubmit={cadastrarOperador}>
          <div className="config-field">
            <label htmlFor="nomeOperador">Nome completo</label>
            <input
              id="nomeOperador"
              type="text"
              value={nomeOperador}
              onChange={(e) => setNomeOperador(e.target.value)}
              placeholder="Nome do operador"
            />
          </div>

          <div className="config-field">
            <label htmlFor="emailOperador">E-mail</label>
            <input
              id="emailOperador"
              type="email"
              value={emailOperador}
              onChange={(e) => setEmailOperador(e.target.value)}
              placeholder="operador@email.com"
            />
          </div>

          <div className="config-field">
            <label htmlFor="cargoOperador">Cargo</label>
            <select
              id="cargoOperador"
              value={cargoOperador}
              onChange={(e) => setCargoOperador(e.target.value)}
            >
              <option value="Atendente">Atendente</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <button type="submit" className="btn-adicionar-operador">
            + Adicionar operador
          </button>
        </form>

        <div className="operadores-lista">
          <h3>Operadores cadastrados</h3>

          {operadores.length === 0 ? (
            <div className="config-empty">
              <span>♙</span>
              <p>Nenhum operador cadastrado nesta sessão.</p>
            </div>
          ) : (
            <div className="operadores-tabela-container">
              <table className="operadores-tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Cargo</th>
                    <th>Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {operadores.map((operador) => (
                    <tr key={operador.id}>
                      <td>{operador.nome}</td>
                      <td>{operador.email}</td>
                      <td>
                        <span className="cargo-badge">
                          {operador.cargo}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remover-operador"
                          onClick={() => removerOperador(operador.id)}
                          aria-label={`Remover ${operador.nome}`}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* PERMISSÕES */}
      <section className="config-section">
        <div className="config-section-header">
          <div className="config-section-icon">
            <span>♧</span>
          </div>

          <div>
            <h2>Permissões de acesso</h2>
            <p>
              Defina quais recursos cada tipo de usuário poderá acessar.
            </p>
          </div>
        </div>

        <div className="permissoes-container">
          {[
            { chave: "administrador", nome: "Administrador" },
            { chave: "atendente", nome: "Atendente" },
          ].map((cargo) => (
            <div className="permissao-card" key={cargo.chave}>
              <div className="permissao-card-header">
                <h3>{cargo.nome}</h3>
                <span>
                  {cargo.chave === "administrador"
                    ? "Acesso administrativo"
                    : "Acesso operacional"}
                </span>
              </div>

              <div className="permissao-lista">
                {nomesPermissoes.map((permissao) => (
                  <label
                    className="permissao-item"
                    key={permissao.chave}
                  >
                    <span>{permissao.nome}</span>

                    <input
                      type="checkbox"
                      checked={permissoes[cargo.chave][permissao.chave]}
                      onChange={() =>
                        alterarPermissao(cargo.chave, permissao.chave)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="config-nota">
          As permissões são configurações visuais nesta versão. A aplicação
          efetiva delas dependerá da implementação de autenticação e
          autorização no backend.
        </p>
      </section>

      {/* SEGURANÇA */}
      <section className="config-section">
        <div className="config-section-header">
          <div className="config-section-icon">
            <span>♢</span>
          </div>

          <div>
            <h2>Segurança</h2>
            <p>
              Configure opções para aumentar a segurança das operações.
            </p>
          </div>
        </div>

        <div className="config-option">
          <div>
            <strong>Confirmar antes de realizar estornos</strong>
            <p>
              Solicita uma confirmação antes de concluir um estorno.
            </p>
          </div>

          <label className="config-switch">
            <input
              type="checkbox"
              checked={confirmarEstorno}
              onChange={(e) => setConfirmarEstorno(e.target.checked)}
            />
            <span className="config-switch-slider"></span>
          </label>
        </div>

        <div className="config-option">
          <div>
            <strong>Registrar histórico de alterações</strong>
            <p>
              Mantém o registro das alterações realizadas pelos usuários.
            </p>
          </div>

          <label className="config-switch">
            <input
              type="checkbox"
              checked={registrarAlteracoes}
              onChange={(e) => setRegistrarAlteracoes(e.target.checked)}
            />
            <span className="config-switch-slider"></span>
          </label>
        </div>

        <div className="seguranca-info">
          <strong>Conta administrativa</strong>
          <p>
            As contas e senhas de acesso serão gerenciadas quando
            implementarmos o módulo de autenticação.
          </p>
        </div>
      </section>

      {/* SALVAR */}
      <div className="config-actions">
        <button
          type="button"
          className="btn-salvar-config"
          onClick={salvarConfiguracoes}
        >
          Salvar configurações
        </button>
      </div>
    </div>
  );
}

export default Configuracoes;
