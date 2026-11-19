
import { useState } from "react";
import { useAlunos } from "../context/AlunosContext";

import "../styles/home.css";
import "../styles/alunos.css";

function Home() {
  const { alunos, setAlunos } = useAlunos();

  const [modalAberto, setModalAberto] = useState(false);

  const [novoAluno, setNovoAluno] = useState({
    nome: "",
    matricula: "",
    turma: "",
    limite: "50",
  });

  function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function cadastrarAluno(event) {
    event.preventDefault();

    const aluno = {
      id: Date.now(),
      nome: novoAluno.nome,
      matricula: novoAluno.matricula,
      turma: novoAluno.turma,
      saldo: 0,
      limite: Number(novoAluno.limite),
      status: "Ativo",
    };

    setAlunos((listaAtual) => [...listaAtual, aluno]);

    fecharModal();
  }

  function fecharModal() {
    setModalAberto(false);

    setNovoAluno({
      nome: "",
      matricula: "",
      turma: "",
      limite: "50",
    });
  }

  return (
    <div className="home-container">
      <div className="home-heading">
        <div>
          <h1>Visão Geral</h1>
          <p>Acompanhe os principais indicadores da cantina.</p>
        </div>

        <span className="system-status">
          ● Sistema Central Ativo
        </span>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total de alunos</span>
          <h2>{alunos.length}</h2>
          <small>Alunos cadastrados</small>
        </div>

        <div className="stat-card">
          <span>Fiados em aberto</span>
          <h2>R$ 2.450,00</h2>
          <small>Valor total pendente</small>
        </div>

        <div className="stat-card">
          <span>Pagamentos hoje</span>
          <h2>R$ 380,00</h2>
          <small>Valores recebidos hoje</small>
        </div>

        <div className="stat-card">
          <span>Alunos bloqueados</span>
          <h2>
            {alunos.filter((aluno) => aluno.status === "Bloqueado").length}
          </h2>
          <small>Com limite ultrapassado</small>
        </div>
      </section>

      <section className="quick-actions">
        <h2>Ações rápidas</h2>

        <div className="actions-grid">
          <button
            type="button"
            className="btn-novo-aluno"
            onClick={() => setModalAberto(true)}
          >
            + Novo Aluno
          </button>

          <button
            type="button"
            onClick={() => alert("Ação em desenvolvimento")}
          >
            + Registrar fiado
          </button>

          <button
            type="button"
            onClick={() => alert("Ação em desenvolvimento")}
          >
            Registrar pagamento
          </button>
        </div>
      </section>

      <div className="home-content-grid">
        <section className="home-panel">
          <div className="panel-heading">
            <h2>Alunos recentes</h2>
            <a href="/alunos">Ver todos</a>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th>Saldo devedor</th>
                  <th>Situação</th>
                </tr>
              </thead>

              <tbody>
                {alunos.slice(-5).reverse().map((aluno) => (
                  <tr key={aluno.id}>
                    <td>{aluno.nome}</td>
                    <td>{aluno.matricula}</td>
                    <td>{formatarMoeda(aluno.saldo)}</td>
                    <td>
                      <span
                        className={`status-badge status-${aluno.status
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")}`}
                      >
                        {aluno.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {alunos.length === 0 && (
                  <tr>
                    <td colSpan="4">Nenhum aluno cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="home-side-panels">
          <section className="home-panel">
            <h2>Maiores devedores</h2>

            {alunos
              .filter((aluno) => aluno.saldo > 0)
              .sort((a, b) => b.saldo - a.saldo)
              .slice(0, 3)
              .map((aluno) => (
                <div className="debtor-item" key={aluno.id}>
                  <span>{aluno.nome}</span>
                  <strong>{formatarMoeda(aluno.saldo)}</strong>
                </div>
              ))}
          </section>

          <section className="home-panel">
            <h2>Atividades recentes</h2>

            <div className="activity-item">
              <span className="activity-dot green"></span>
              <div>
                <strong>Pagamento registrado</strong>
                <p>Pagamento recebido de Ana Clara.</p>
              </div>
            </div>

            <div className="activity-item">
              <span className="activity-dot purple"></span>
              <div>
                <strong>Novo consumo</strong>
                <p>Consumo registrado na cantina.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {modalAberto && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <div className="modal-aluno">
            <div className="modal-aluno-header">
              <div>
                <h2>Novo aluno</h2>
                <p>Preencha os dados para cadastrar uma conta.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={fecharModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={cadastrarAluno}>
              <label>Nome completo</label>
              <input
                required
                value={novoAluno.nome}
                onChange={(e) =>
                  setNovoAluno({
                    ...novoAluno,
                    nome: e.target.value,
                  })
                }
                placeholder="Digite o nome do aluno"
              />

              <label>Matrícula</label>
              <input
                required
                value={novoAluno.matricula}
                onChange={(e) =>
                  setNovoAluno({
                    ...novoAluno,
                    matricula: e.target.value,
                  })
                }
                placeholder="Digite a matrícula"
              />

              <label>Turma</label>
              <input
                required
                value={novoAluno.turma}
                onChange={(e) =>
                  setNovoAluno({
                    ...novoAluno,
                    turma: e.target.value,
                  })
                }
                placeholder="Ex.: 2º Informática"
              />

              <label>Limite de crédito (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={novoAluno.limite}
                onChange={(e) =>
                  setNovoAluno({
                    ...novoAluno,
                    limite: e.target.value,
                  })
                }
              />

              <div className="modal-aluno-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-salvar-aluno"
                >
                  Cadastrar aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
