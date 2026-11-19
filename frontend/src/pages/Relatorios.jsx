
import { useMemo, useState } from "react";
import { useAlunos } from "../context/AlunosContext";
import "../styles/relatorios.css";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) return "—";

  return new Date(data).toLocaleDateString("pt-BR");
}

function obterInicioPeriodo(periodo) {
  const hoje = new Date();
  const inicio = new Date(hoje);

  inicio.setHours(0, 0, 0, 0);

  if (periodo === "7dias") {
    inicio.setDate(inicio.getDate() - 6);
    return inicio;
  }

  if (periodo === "30dias") {
    inicio.setDate(inicio.getDate() - 29);
    return inicio;
  }

  if (periodo === "mes") {
    inicio.setDate(1);
    return inicio;
  }

  return null;
}

function Relatorios() {
  const {
    alunos,
    consumos,
    pagamentos,
    estornos,
  } = useAlunos();

  const [periodo, setPeriodo] = useState("30dias");
  const [tipoRelatorio, setTipoRelatorio] = useState("geral");

  const inicioPeriodo = obterInicioPeriodo(periodo);
  const fimPeriodo = new Date();
  fimPeriodo.setHours(23, 59, 59, 999);

  function estaNoPeriodo(data) {
    const dataRegistro = new Date(data);

    if (Number.isNaN(dataRegistro.getTime())) {
      return false;
    }

    if (inicioPeriodo && dataRegistro < inicioPeriodo) {
      return false;
    }

    return dataRegistro <= fimPeriodo;
  }

  const consumosFiltrados = useMemo(
    () =>
      consumos.filter(
        (consumo) =>
          !consumo.estornado && estaNoPeriodo(consumo.data)
      ),
    [consumos, periodo]
  );

  const pagamentosFiltrados = useMemo(
    () =>
      pagamentos.filter((pagamento) =>
        estaNoPeriodo(pagamento.data)
      ),
    [pagamentos, periodo]
  );

  const estornosFiltrados = useMemo(
    () =>
      estornos.filter((estorno) =>
        estaNoPeriodo(estorno.data)
      ),
    [estornos, periodo]
  );

  const totalConsumido = consumosFiltrados.reduce(
    (total, consumo) => total + Number(consumo.valor || 0),
    0
  );

  const totalRecebido = pagamentosFiltrados.reduce(
    (total, pagamento) => total + Number(pagamento.valor || 0),
    0
  );

  const totalEmAberto = alunos.reduce(
    (total, aluno) => total + Number(aluno.saldo || 0),
    0
  );

  const totalEstornado = estornosFiltrados.reduce(
    (total, estorno) => total + Number(estorno.valor || 0),
    0
  );

  const contasAtencao = alunos.filter(
    (aluno) =>
      aluno.status === "Atenção" ||
      aluno.status === "Bloqueado"
  );

  const consumoPorTurma = useMemo(() => {
    const agrupamento = {};

    consumosFiltrados.forEach((consumo) => {
      const aluno = alunos.find(
        (item) => item.id === consumo.alunoId
      );

      const turma = aluno?.turma || "Sem turma";

      agrupamento[turma] =
        (agrupamento[turma] || 0) + Number(consumo.valor || 0);
    });

    return Object.entries(agrupamento)
      .map(([turma, valor]) => ({ turma, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [consumosFiltrados, alunos]);

  const faturamentoMensal = useMemo(() => {
    const agrupamento = {};

    pagamentosFiltrados.forEach((pagamento) => {
      const data = new Date(pagamento.data);

      const chave = `${data.getFullYear()}-${String(
        data.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!agrupamento[chave]) {
        agrupamento[chave] = {
          mes: data.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          }),
          valor: 0,
        };
      }

      agrupamento[chave].valor += Number(pagamento.valor || 0);
    });

    return Object.entries(agrupamento)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, dados]) => dados);
  }, [pagamentosFiltrados]);

  const maiorFaturamento = Math.max(
    ...faturamentoMensal.map((item) => item.valor),
    1
  );

  const maiorConsumoTurma = Math.max(
    ...consumoPorTurma.map((item) => item.valor),
    1
  );

  const nomeAluno = (alunoId) =>
    alunos.find((aluno) => aluno.id === alunoId)?.nome ||
    "Aluno não encontrado";

  return (
    <div className="relatorios-page">
      {/* FILTROS */}
      <section className="relatorios-filtros">
        <div className="relatorio-filtro">
          <label htmlFor="periodoRelatorio">Período</label>
          <select
            id="periodoRelatorio"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="mes">Mês atual</option>
            <option value="todos">Todo o período</option>
          </select>
        </div>

        <div className="relatorio-filtro">
          <label htmlFor="tipoRelatorio">Tipo de relatório</label>
          <select
            id="tipoRelatorio"
            value={tipoRelatorio}
            onChange={(e) => setTipoRelatorio(e.target.value)}
          >
            <option value="geral">Visão geral</option>
            <option value="consumos">Consumo por turma</option>
            <option value="pagamentos">Faturamento</option>
            <option value="estornos">Estornos</option>
            <option value="contas">Contas que exigem atenção</option>
          </select>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="relatorios-indicadores">
        <article className="relatorio-card">
          <div className="relatorio-card-topo">
            <span className="relatorio-icone icone-verde">R$</span>
            <span className="relatorio-card-legenda">Recebimentos</span>
          </div>

          <strong>{formatarMoeda(totalRecebido)}</strong>
          <p>Pagamentos registrados no período</p>
        </article>

        <article className="relatorio-card">
          <div className="relatorio-card-topo">
            <span className="relatorio-icone icone-roxo">↗</span>
            <span className="relatorio-card-legenda">Consumos</span>
          </div>

          <strong>{formatarMoeda(totalConsumido)}</strong>
          <p>Consumos válidos no período</p>
        </article>

        <article className="relatorio-card">
          <div className="relatorio-card-topo">
            <span className="relatorio-icone icone-laranja">!</span>
            <span className="relatorio-card-legenda">Em aberto</span>
          </div>

          <strong>{formatarMoeda(totalEmAberto)}</strong>
          <p>Saldo devedor atual dos alunos</p>
        </article>

        <article className="relatorio-card">
          <div className="relatorio-card-topo">
            <span className="relatorio-icone icone-vermelho">↶</span>
            <span className="relatorio-card-legenda">Estornos</span>
          </div>

          <strong>{formatarMoeda(totalEstornado)}</strong>
          <p>Valores estornados no período</p>
        </article>
      </section>

      {/* FATURAMENTO */}
      {(tipoRelatorio === "geral" ||
        tipoRelatorio === "pagamentos") && (
        <section className="relatorio-section">
          <div className="relatorio-section-header">
            <div>
              <h2>Faturamento mensal</h2>
              <p>Valores recebidos por meio dos pagamentos registrados.</p>
            </div>
          </div>

          {faturamentoMensal.length === 0 ? (
            <div className="relatorio-vazio">
              <span>R$</span>
              <p>Nenhum pagamento registrado neste período.</p>
            </div>
          ) : (
            <div className="grafico-faturamento">
              {faturamentoMensal.map((item, index) => (
                <div className="barra-mes" key={`${item.mes}-${index}`}>
                  <div className="barra-mes-valor">
                    {formatarMoeda(item.valor)}
                  </div>

                  <div className="barra-mes-area">
                    <div
                      className="barra-mes-preenchimento"
                      style={{
                        height: `${Math.max(
                          (item.valor / maiorFaturamento) * 100,
                          4
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="barra-mes-label">{item.mes}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CONSUMO POR TURMA */}
      {(tipoRelatorio === "geral" ||
        tipoRelatorio === "consumos") && (
        <section className="relatorio-section">
          <div className="relatorio-section-header">
            <div>
              <h2>Consumo por turma</h2>
              <p>
                Comparação dos valores consumidos por alunos de cada turma.
              </p>
            </div>
          </div>

          {consumoPorTurma.length === 0 ? (
            <div className="relatorio-vazio">
              <span>▤</span>
              <p>Nenhum consumo registrado neste período.</p>
            </div>
          ) : (
            <div className="consumo-turmas">
              {consumoPorTurma.map((item) => (
                <div className="consumo-turma-item" key={item.turma}>
                  <div className="consumo-turma-info">
                    <strong>{item.turma}</strong>
                    <span>{formatarMoeda(item.valor)}</span>
                  </div>

                  <div className="consumo-turma-trilho">
                    <div
                      className="consumo-turma-barra"
                      style={{
                        width: `${(item.valor / maiorConsumoTurma) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CONTAS QUE EXIGEM ATENÇÃO */}
      {(tipoRelatorio === "geral" ||
        tipoRelatorio === "contas") && (
        <section className="relatorio-section">
          <div className="relatorio-section-header">
            <div>
              <h2>Contas que exigem atenção</h2>
              <p>
                Alunos com situação de atenção ou bloqueio no cadastro.
              </p>
            </div>

            <span className="relatorio-contagem">
              {contasAtencao.length}{" "}
              {contasAtencao.length === 1 ? "aluno" : "alunos"}
            </span>
          </div>

          {contasAtencao.length === 0 ? (
            <div className="relatorio-vazio">
              <span>✓</span>
              <p>Nenhuma conta precisa de atenção no momento.</p>
            </div>
          ) : (
            <div className="relatorio-tabela-container">
              <table className="relatorio-tabela">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Turma</th>
                    <th>Saldo devedor</th>
                    <th>Limite</th>
                    <th>Situação</th>
                  </tr>
                </thead>

                <tbody>
                  {contasAtencao.map((aluno) => (
                    <tr key={aluno.id}>
                      <td>{aluno.nome}</td>
                      <td>{aluno.turma}</td>
                      <td className="valor-destaque">
                        {formatarMoeda(aluno.saldo)}
                      </td>
                      <td>{formatarMoeda(aluno.limite)}</td>
                      <td>
                        <span
                          className={`relatorio-status ${
                            aluno.status === "Bloqueado"
                              ? "status-bloqueado"
                              : "status-atencao"
                          }`}
                        >
                          {aluno.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* HISTÓRICO DE ESTORNOS */}
      {(tipoRelatorio === "geral" ||
        tipoRelatorio === "estornos") && (
        <section className="relatorio-section">
          <div className="relatorio-section-header">
            <div>
              <h2>Histórico de estornos</h2>
              <p>Correções financeiras realizadas no período.</p>
            </div>
          </div>

          {estornosFiltrados.length === 0 ? (
            <div className="relatorio-vazio">
              <span>↶</span>
              <p>Nenhum estorno registrado neste período.</p>
            </div>
          ) : (
            <div className="relatorio-tabela-container">
              <table className="relatorio-tabela">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Motivo</th>
                  </tr>
                </thead>

                <tbody>
                  {[...estornosFiltrados]
                    .sort(
                      (a, b) =>
                        new Date(b.data) - new Date(a.data)
                    )
                    .map((estorno) => (
                      <tr key={estorno.id}>
                        <td>{nomeAluno(estorno.alunoId)}</td>
                        <td>{formatarData(estorno.data)}</td>
                        <td className="valor-destaque">
                          {formatarMoeda(estorno.valor)}
                        </td>
                        <td>{estorno.motivo}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="relatorio-observacao">
        Os relatórios são calculados com base nos registros disponíveis nesta
        sessão. Os dados ainda não estão persistidos no banco de dados.
      </p>
    </div>
  );
}

export default Relatorios;
