
import { useState } from "react";
import { useAlunos } from "../context/AlunosContext";
import "../styles/lancamentos.css";

function Lancamentos() {
  const { alunos, consumos, registrarConsumo } = useAlunos();

  const [alunoId, setAlunoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!alunoId || !descricao.trim() || !valor) {
      setErro("Preencha todos os campos.");
      return;
    }

    const resultado = registrarConsumo(
      Number(alunoId),
      descricao.trim(),
      Number(valor)
    );

    if (resultado === false || resultado?.erro) {
      setErro(
        resultado?.erro ||
        "Não foi possível registrar o consumo. Verifique os dados e o limite disponível."
      );
      return;
    }

    setMensagem("Consumo registrado com sucesso!");
    setAlunoId("");
    setDescricao("");
    setValor("");
  }

  const alunoSelecionado = alunos.find(
    (aluno) => aluno.id === Number(alunoId)
  );

  const ultimosConsumos = [...consumos]
    .filter((consumo) => !consumo.estornado)
    .reverse()
    .slice(0, 8);

  return (
    <div className="lancamentos-page">
      <div className="lancamentos-intro">
        <h1>Novo lançamento</h1>
        <p>Registre os consumos realizados pelos alunos na cantina.</p>
      </div>

      <div className="lancamentos-layout">
        <section className="lancamento-form-card">
          <h2>Registrar consumo</h2>
          <p className="lancamento-subtitulo">
            Informe os dados do consumo para adicioná-lo à conta do aluno.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="lancamento-campo">
              <label htmlFor="aluno">Aluno</label>
              <select
                id="aluno"
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
              >
                <option value="">Selecione um aluno</option>
                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} — {aluno.turma}
                  </option>
                ))}
              </select>
            </div>

            {alunoSelecionado && (
              <div className="lancamento-aluno-info">
                <div>
                  <span>Saldo devedor</span>
                  <strong>{formatarMoeda(alunoSelecionado.saldo)}</strong>
                </div>

                <div>
                  <span>Crédito disponível</span>
                  <strong className="credito-valor">
                    {formatarMoeda(alunoSelecionado.credito)}
                  </strong>
                </div>

                <div>
                  <span>Limite de crédito</span>
                  <strong>{formatarMoeda(alunoSelecionado.limite)}</strong>
                </div>
              </div>
            )}

            <div className="lancamento-campo">
              <label htmlFor="descricao">Descrição do consumo</label>
              <input
                id="descricao"
                type="text"
                placeholder="Ex.: Salgado e suco"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="lancamento-campo">
              <label htmlFor="valor">Valor (R$)</label>
              <input
                id="valor"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            {erro && (
              <div className="lancamento-mensagem erro">{erro}</div>
            )}

            {mensagem && (
              <div className="lancamento-mensagem sucesso">{mensagem}</div>
            )}

            <button type="submit" className="btn-registrar-consumo">
              Registrar consumo
            </button>
          </form>
        </section>

        <section className="lancamento-info-card">
          <h2>Como funciona?</h2>

          <div className="lancamento-regra">
            <span className="regra-icone">1</span>
            <div>
              <strong>Selecione o aluno</strong>
              <p>Escolha o estudante que realizou o consumo.</p>
            </div>
          </div>

          <div className="lancamento-regra">
            <span className="regra-icone">2</span>
            <div>
              <strong>Informe o consumo</strong>
              <p>Adicione uma descrição e o valor da compra.</p>
            </div>
          </div>

          <div className="lancamento-regra">
            <span className="regra-icone">3</span>
            <div>
              <strong>Crédito utilizado automaticamente</strong>
              <p>
                Se o aluno tiver crédito disponível, ele será utilizado
                primeiro. O restante será acrescentado à dívida.
              </p>
            </div>
          </div>

          <div className="lancamento-regra">
            <span className="regra-icone">4</span>
            <div>
              <strong>Respeito ao limite</strong>
              <p>
                O sistema não permite ultrapassar o limite de crédito
                disponível.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="ultimos-lancamentos-card">
        <div className="ultimos-lancamentos-header">
          <h2>Últimos consumos</h2>
          <p>Consumos registrados recentemente.</p>
        </div>

        {ultimosConsumos.length === 0 ? (
          <div className="lancamentos-vazio">
            Nenhum consumo registrado.
          </div>
        ) : (
          <div className="tabela-lancamentos-container">
            <table className="tabela-lancamentos">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                {ultimosConsumos.map((consumo) => {
                  const aluno = alunos.find(
                    (item) => item.id === consumo.alunoId
                  );

                  return (
                    <tr key={consumo.id}>
                      <td>{aluno?.nome || "Aluno não encontrado"}</td>
                      <td>{consumo.descricao}</td>
                      <td>
                        {consumo.data
                          ? new Date(consumo.data).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td>{formatarMoeda(consumo.valor)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Lancamentos;
