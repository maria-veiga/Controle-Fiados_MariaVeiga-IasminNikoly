
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlunos } from "../context/AlunosContext";

import "../styles/alunos.css";

function Alunos() {
  const { alunos, setAlunos } = useAlunos();
  const navigate = useNavigate();

  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [modalAberto, setModalAberto] = useState(false);

  const [novoAluno, setNovoAluno] = useState({
    nome: "",
    matricula: "",
    turma: "",
    limite: "50",
  });

  const alunosFiltrados = alunos.filter((aluno) => {
    const correspondePesquisa =
      aluno.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      aluno.matricula.includes(pesquisa);

    const correspondeFiltro =
      filtro === "Todos" || aluno.status === filtro;

    return correspondePesquisa && correspondeFiltro;
  });

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
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

    setNovoAluno({
      nome: "",
      matricula: "",
      turma: "",
      limite: "50",
    });

    setModalAberto(false);
  }

  return (
    <div className="alunos-page">
      <div className="alunos-topbar">
        <div>
          <h1>Contas de Alunos</h1>
          <p>Gerencie os alunos e acompanhe suas contas na cantina.</p>
        </div>

        <button
          className="btn-novo-aluno"
          onClick={() => setModalAberto(true)}
        >
          + Novo Aluno
        </button>
      </div>

      <section className="alunos-summary">
        <div className="alunos-summary-card">
          <span>Total de alunos</span>
          <strong>{alunos.length}</strong>
        </div>

        <div className="alunos-summary-card">
          <span>Contas ativas</span>
          <strong>
            {alunos.filter((a) => a.status === "Ativo").length}
          </strong>
        </div>

        <div className="alunos-summary-card">
          <span>Em atenção</span>
          <strong>
            {alunos.filter((a) => a.status === "Atenção").length}
          </strong>
        </div>

        <div className="alunos-summary-card">
          <span>Bloqueadas</span>
          <strong>
            {alunos.filter((a) => a.status === "Bloqueado").length}
          </strong>
        </div>
      </section>

      <section className="alunos-table-card">
        <div className="alunos-table-header">
          <div>
            <h2>Lista de alunos</h2>
            <p>Consulte e gerencie as contas cadastradas.</p>
          </div>
        </div>

        <div className="alunos-filters">
          <div className="alunos-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Pesquisar por nome ou matrícula..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
          </div>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="Todos">Todas as situações</option>
            <option value="Ativo">Ativo</option>
            <option value="Atenção">Atenção</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
        </div>

        <div className="alunos-table-wrapper">
          <table className="alunos-table">
            <thead>
              <tr>
                <th>ALUNO</th>
                <th>MATRÍCULA</th>
                <th>TURMA</th>
                <th>SALDO DEVEDOR</th>
                <th>LIMITE</th>
                <th>SITUAÇÃO</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id}>
                  <td className="aluno-nome">
                    <button
                      type="button"
                      className="aluno-nome-link"
                      onClick={() => navigate(`/alunos/${aluno.id}`)}
                    >
                      {aluno.nome}
                    </button>
                  </td>

                  <td>{aluno.matricula}</td>
                  <td>{aluno.turma}</td>

                  <td className="aluno-saldo">
                    {formatarMoeda(aluno.saldo)}
                  </td>

                  <td>{formatarMoeda(aluno.limite)}</td>

                  <td>
                    <span
                      className={`aluno-status aluno-status-${aluno.status
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")}`}
                    >
                      {aluno.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn-acao"
                      title="Visualizar aluno"
                      onClick={() => navigate(`/alunos/${aluno.id}`)}
                    >
                      ◉
                    </button>

                    <button
                      className="btn-acao"
                      title="Editar aluno"
                      onClick={() => alert("Edição em desenvolvimento")}
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))}

              {alunosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" className="alunos-empty">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="alunos-table-footer">
          <span>
            Exibindo {alunosFiltrados.length} de {alunos.length} alunos
          </span>
        </div>
      </section>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-aluno">
            <div className="modal-aluno-header">
              <div>
                <h2>Novo aluno</h2>
                <p>Preencha os dados para cadastrar uma conta.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalAberto(false)}
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
                  setNovoAluno({ ...novoAluno, nome: e.target.value })
                }
                placeholder="Digite o nome do aluno"
              />

              <label>Matrícula</label>
              <input
                required
                value={novoAluno.matricula}
                onChange={(e) =>
                  setNovoAluno({ ...novoAluno, matricula: e.target.value })
                }
                placeholder="Digite a matrícula"
              />

              <label>Turma</label>
              <input
                required
                value={novoAluno.turma}
                onChange={(e) =>
                  setNovoAluno({ ...novoAluno, turma: e.target.value })
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
                  setNovoAluno({ ...novoAluno, limite: e.target.value })
                }
              />

              <div className="modal-aluno-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-salvar-aluno">
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

export default Alunos;
