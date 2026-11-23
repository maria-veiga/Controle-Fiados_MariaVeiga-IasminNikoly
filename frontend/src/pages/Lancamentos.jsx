
import { useState } from "react";
import { useAlunos } from "../context/AlunosContext";
import "../styles/lancamentos.css";

function Lancamentos() {
  const {
    alunos,
    consumos,
    registrarConsumo,
    registrarConsumoAvista,
  } = useAlunos();

  const [alunoId, setAlunoId] = useState("");
  const [buscaAluno, setBuscaAluno] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [modalidade, setModalidade] = useState("prazo");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  const alunosFiltrados = alunos.filter((aluno) => {
    const pesquisa = normalizarTexto(buscaAluno);
    const nome = normalizarTexto(aluno.nome);
    const matricula = normalizarTexto(aluno.matricula);

    return nome.includes(pesquisa) || matricula.includes(pesquisa);
  });

  const alunoSelecionado = alunos.find(
    (aluno) => aluno.id === Number(alunoId)
  );

  function handleSubmit(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!alunoId || !descricao.trim() || !valor) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      if (modalidade === "avista") {
        registrarConsumoAvista(
          Number(alunoId),
          descricao.trim(),
          Number(valor),
          formaPagamento
        );

        setMensagem("Compra à vista registrada com sucesso!");
      } else {
        registrarConsumo(
          Number(alunoId),
          descricao.trim(),
          Number(valor)
        );

        setMensagem("Consumo a prazo registrado com sucesso!");
      }

      setAlunoId("");
      setBuscaAluno("");
      setDescricao("");
      setValor("");
      setModalidade("prazo");
      setFormaPagamento("Dinheiro");
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível registrar o lançamento."
      );
    }
  }

  const ultimosConsumos = [...consumos]
    .filter((consumo) => !consumo.estornado)
    .reverse()
    .slice(0, 8);

  return (
    <div className="lancamentos-page">
      <div className="lancamentos-intro">
        <h1>Novo lançamento</h1>
        <p>
          Registre compras pagas na hora ou consumos adicionados à conta dos alunos.
        </p>
      </div>

      <div className="lancamentos-layout">
        <section className="lancamento-form-card">
          <h2>Registrar lançamento</h2>

          <p className="lancamento-subtitulo">
            Escolha a modalidade e informe os dados da compra.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="lancamento-campo">
              <label>Tipo de lançamento</label>

              <div className="modalidade-opcoes">
                <button
                  type="button"
                  className={
                    modalidade === "prazo"
                      ? "modalidade-opcao ativa"
                      : "modalidade-opcao"
                  }
                  onClick={() => {
                    setModalidade("prazo");
                    setErro("");
                    setMensagem("");
                  }}
                >
                  A prazo
                  <span>Adicionar à dívida</span>
                </button>

                <button
                  type="button"
                  className={
                    modalidade === "avista"
                      ? "modalidade-opcao ativa"
                      : "modalidade-opcao"
                  }
                  onClick={() => {
                    setModalidade("avista");
                    setErro("");
                    setMensagem("");
                  }}
                >
                  À vista
                  <span>Pagamento imediato</span>
                </button>
              </div>
            </div>

            <div className="lancamento-campo">
              <label htmlFor="buscaAluno">Buscar aluno</label>

              <input
                id="buscaAluno"
                type="text"
                placeholder="Digite o nome ou a matrícula do aluno"
                value={buscaAluno}
                onChange={(e) => {
                  setBuscaAluno(e.target.value);
                  setAlunoId("");
                  setErro("");
                  setMensagem("");
                }}
                autoComplete="off"
              />

              <span className="lancamento-ajuda">
                {buscaAluno
                  ? `${alunosFiltrados.length} aluno(s) encontrado(s)`
                  : "Pesquise pelo nome ou número de matrícula."}
              </span>
            </div>

            <div className="lancamento-campo">
              <label htmlFor="aluno">Aluno</label>

              <select
                id="aluno"
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
              >
                <option value="">Selecione um aluno</option>

                {alunosFiltrados.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} — {aluno.matricula || "Sem matrícula"}
                  </option>
                ))}
              </select>

              {buscaAluno && alunosFiltrados.length === 0 && (
                <span className="lancamento-sem-resultado">
                  Nenhum aluno encontrado. Verifique o nome ou a matrícula.
                </span>
              )}
            </div>

            {alunoSelecionado && (
              <div className="lancamento-aluno-info">
                <div>
                  <span>Saldo devedor</span>
                  <strong>
                    {formatarMoeda(alunoSelecionado.saldo)}
                  </strong>
                </div>

                <div>
                  <span>Crédito disponível</span>
                  <strong className="credito-valor">
                    {formatarMoeda(alunoSelecionado.credito)}
                  </strong>
                </div>

                <div>
                  <span>Limite de crédito</span>
                  <strong>
                    {formatarMoeda(alunoSelecionado.limite)}
                  </strong>
                </div>
              </div>
            )}

            <div className="lancamento-campo">
              <label htmlFor="descricao">Descrição da compra</label>

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

            {modalidade === "avista" && (
              <div className="lancamento-campo">
                <label htmlFor="formaPagamento">
                  Forma de pagamento
                </label>

                <select
                  id="formaPagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
            )}

            {modalidade === "avista" && (
              <div className="aviso-avista">
                <strong>Compra paga na hora</strong>
                <p>
                  O consumo será registrado como quitado. O saldo devedor
                  e o crédito disponível do aluno não serão alterados.
                </p>
              </div>
            )}

            {modalidade === "prazo" && (
              <div className="aviso-prazo">
                <strong>Compra a prazo</strong>
                <p>
                  O crédito disponível será utilizado primeiro. O restante
                  será acrescentado à dívida, respeitando o limite do aluno.
                </p>
              </div>
            )}

            {erro && (
              <div className="lancamento-mensagem erro">
                {erro}
              </div>
            )}

            {mensagem && (
              <div className="lancamento-mensagem sucesso">
                {mensagem}
              </div>
            )}

            <button type="submit" className="btn-registrar-consumo">
              {modalidade === "avista"
                ? "Registrar compra à vista"
                : "Registrar consumo a prazo"}
            </button>
          </form>
        </section>

        <section className="lancamento-info-card">
          <h2>Como funciona?</h2>

          <div className="lancamento-regra">
            <span className="regra-icone">1</span>
            <div>
              <strong>Selecione a modalidade</strong>
              <p>
                Escolha entre registrar uma compra paga na hora ou adicionar
                um consumo à conta do aluno.
              </p>
            </div>
          </div>

          <div className="lancamento-regra">
            <span className="regra-icone">2</span>
            <div>
              <strong>Busque o aluno</strong>
              <p>
                Digite o nome ou a matrícula para encontrar o estudante.
              </p>
            </div>
          </div>

          <div className="lancamento-regra">
            <span className="regra-icone">3</span>
            <div>
              <strong>Informe a compra</strong>
              <p>
                Adicione a descrição e o valor. Para compras à vista,
                informe também a forma de pagamento.
              </p>
            </div>
          </div>

          <div className="lancamento-regra">
            <span className="regra-icone">4</span>
            <div>
              <strong>Registro automático</strong>
              <p>
                Compras à vista ficam quitadas. Compras a prazo seguem
                as regras de crédito e limite da conta.
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
                  <th>Tipo</th>
                  <th>Pagamento</th>
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
                        {consumo.pagamentoAvista ? "À vista" : "A prazo"}
                      </td>
                      <td>{consumo.formaPagamento || "—"}</td>
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
