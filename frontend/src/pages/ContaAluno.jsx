
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlunos } from "../context/AlunosContext";

import "../styles/contaAluno.css";

function ContaAluno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    alunos,
    consumos,
    pagamentos,
    estornos,
    registrarPagamento,
    estornarConsumo,
  } = useAlunos();

  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [consumoSelecionado, setConsumoSelecionado] = useState("");
  const [motivoEstorno, setMotivoEstorno] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const aluno = alunos.find((a) => String(a.id) === id);

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) return "Data não informada";

    return new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  if (!aluno) {
    return (
      <div className="conta-nao-encontrada">
        <div className="conta-nao-encontrada-icone">!</div>
        <h2>Aluno não encontrado</h2>
        <p>Não foi possível localizar os dados desta conta.</p>
        <button onClick={() => navigate("/alunos")}>
          Voltar para alunos
        </button>
      </div>
    );
  }

  const saldo = Number(aluno.saldo) || 0;
  const limite = Number(aluno.limite) || 0;
  const credito = Number(aluno.credito) || 0;
  const disponivel = Math.max(limite - saldo, 0);
  const percentualUtilizado =
    limite > 0 ? Math.min((saldo / limite) * 100, 100) : 0;

  const consumosDoAluno = consumos
    .filter((consumo) => consumo.alunoId === aluno.id)
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  const consumosEmAberto = consumosDoAluno.filter(
    (consumo) =>
      !consumo.estornado &&
      Number(consumo.valorPago) < Number(consumo.valor)
  );

  const consumosParaEstorno = consumosDoAluno.filter(
    (consumo) => !consumo.estornado
  );

  const pagamentosDoAluno = pagamentos.filter(
    (pagamento) => pagamento.alunoId === aluno.id
  );

  const estornosDoAluno = (estornos || []).filter(
    (estorno) => estorno.alunoId === aluno.id
  );

  const extrato = [
    ...consumosDoAluno.map((consumo) => ({
      id: `consumo-${consumo.id}`,
      data: consumo.data,
      descricao: consumo.descricao,
      tipo: "Consumo",
      valor: -Number(consumo.valor),
    })),

    ...pagamentosDoAluno.map((pagamento) => ({
      id: `pagamento-${pagamento.id}`,
      data: pagamento.data,
      descricao: `Pagamento - ${pagamento.formaPagamento}`,
      tipo: "Pagamento",
      valor: Number(pagamento.valor),
    })),

    ...estornosDoAluno.map((estorno) => ({
      id: `estorno-${estorno.id}`,
      data: estorno.data,
      descricao: `Estorno - ${estorno.motivo}`,
      tipo: "Estorno",
      valor: Number(estorno.valorRetiradoDaDivida || 0),
      creditoGerado: Number(estorno.creditoGerado || 0),
    })),
  ].sort((a, b) => new Date(a.data) - new Date(b.data));

  let saldoAcumulado = 0;

  const extratoComSaldo = extrato.map((movimento) => {
    saldoAcumulado += movimento.valor;

    return {
      ...movimento,
      saldo: saldoAcumulado,
    };
  });

  function confirmarPagamento(event) {
    event.preventDefault();

    setMensagemErro("");
    setMensagemSucesso("");

    try {
      const pagamento = registrarPagamento(
        aluno.id,
        valorPagamento,
        formaPagamento
      );

      setMensagemSucesso(
        `Pagamento de ${formatarMoeda(pagamento.valor)} registrado com sucesso!`
      );

      setValorPagamento("");
    } catch (erro) {
      setMensagemErro(erro.message);
    }
  }

  function confirmarEstorno(event) {
    event.preventDefault();

    setMensagemErro("");
    setMensagemSucesso("");

    try {
      if (!consumoSelecionado) {
        throw new Error("Selecione um consumo para estornar.");
      }

      const estorno = estornarConsumo(
        consumoSelecionado,
        motivoEstorno
      );

      setMensagemSucesso(
        `Estorno de ${formatarMoeda(estorno.valor)} registrado com sucesso! Crédito gerado: ${formatarMoeda(estorno.creditoGerado)}.`
      );

      setConsumoSelecionado("");
      setMotivoEstorno("");
    } catch (erro) {
      setMensagemErro(erro.message);
    }
  }

  const statusClasse = (aluno.status || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

  const iniciais = aluno.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return (
    <div className="conta-aluno-page">

      {/* CAMINHO DE NAVEGAÇÃO */}
      <div className="conta-breadcrumb">
        <button onClick={() => navigate("/alunos")}>
          <span>←</span> Controle de Alunos
        </button>
        <span className="conta-breadcrumb-separador">/</span>
        <span>Detalhamento da conta</span>
      </div>

      {/* CABEÇALHO */}
      <header className="conta-header">
        <div className="conta-identificacao">
          <div className="conta-avatar">
            {iniciais}
          </div>

          <div className="conta-header-info">
            <span className="conta-subtitulo">
              DETALHAMENTO DA CONTA
            </span>

            <h1>{aluno.nome}</h1>

            <div className="conta-dados-aluno">
              <span>
                <strong>Matrícula:</strong> {aluno.matricula}
              </span>

              <span className="conta-dado-separador">•</span>

              <span>
                <strong>Turma:</strong> {aluno.turma}
              </span>
            </div>
          </div>
        </div>

        <span className={`conta-status conta-status-${statusClasse}`}>
          <span className="conta-status-ponto"></span>
          {aluno.status}
        </span>
      </header>

      {/* RESUMO FINANCEIRO */}
      <section className="conta-resumo">

        <div className="conta-card conta-card-saldo">
          <div className="conta-card-topo">
            <span>Saldo devedor</span>
            <span className="conta-card-icone">R$</span>
          </div>

          <strong>{formatarMoeda(saldo)}</strong>
          <p>Valor atualmente devido</p>

          <div className="conta-card-indicador">
            <span
              className="conta-card-indicador-preenchido"
              style={{ width: `${percentualUtilizado}%` }}
            ></span>
          </div>

          <small>{percentualUtilizado.toFixed(0)}% do limite utilizado</small>
        </div>

        <div className="conta-card">
          <div className="conta-card-topo">
            <span>Limite de crédito</span>
            <span className="conta-card-icone">⌑</span>
          </div>

          <strong>{formatarMoeda(limite)}</strong>
          <p>Limite definido para o aluno</p>
        </div>

        <div className="conta-card conta-card-disponivel">
          <div className="conta-card-topo">
            <span>Crédito disponível</span>
            <span className="conta-card-icone">✓</span>
          </div>

          <strong>{formatarMoeda(disponivel)}</strong>
          <p>Disponível para novos consumos</p>
        </div>

        <div className="conta-card conta-card-credito">
          <div className="conta-card-topo">
            <span>Crédito do aluno</span>
            <span className="conta-card-icone">+</span>
          </div>

          <strong>{formatarMoeda(credito)}</strong>
          <p>Crédito acumulado por estornos</p>
        </div>

      </section>

      {/* ALERTA DE BLOQUEIO */}
      {aluno.status === "Bloqueado" && (
        <section className="conta-alerta">
          <div className="conta-alerta-icone">!</div>

          <div>
            <strong>Conta bloqueada</strong>
            <p>
              Este aluno está com a conta bloqueada.
              Verifique a situação antes de permitir novos consumos.
            </p>
          </div>
        </section>
      )}

      {/* MENSAGENS */}
      {mensagemErro && (
        <div className="pagamento-mensagem pagamento-erro">
          <span>!</span>
          {mensagemErro}
        </div>
      )}

      {mensagemSucesso && (
        <div className="pagamento-mensagem pagamento-sucesso">
          <span>✓</span>
          {mensagemSucesso}
        </div>
      )}

      {/* FORMULÁRIOS */}
      <div className="conta-formularios-grid">

        {/* PAGAMENTO */}
        <section className="conta-section">
          <div className="conta-section-header">
            <div className="conta-section-icone conta-icone-pagamento">
              R$
            </div>

            <div>
              <h2>Registrar pagamento</h2>
              <p>Registre um valor recebido do aluno.</p>
            </div>
          </div>

          <form
            className="pagamento-form"
            onSubmit={confirmarPagamento}
          >
            <div className="pagamento-campo">
              <label htmlFor="valorPagamento">
                Valor recebido (R$)
              </label>

              <input
                id="valorPagamento"
                type="number"
                min="0.01"
                max={saldo}
                step="0.01"
                required
                value={valorPagamento}
                onChange={(e) => setValorPagamento(e.target.value)}
                placeholder="0,00"
                disabled={saldo <= 0}
              />
            </div>

            <div className="pagamento-campo">
              <label htmlFor="formaPagamento">
                Forma de pagamento
              </label>

              <select
                id="formaPagamento"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                disabled={saldo <= 0}
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="Pix">Pix</option>
                <option value="Cartão">Cartão</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-registrar-pagamento"
              disabled={saldo <= 0}
            >
              Confirmar pagamento
            </button>
          </form>

          {saldo <= 0 && (
            <p className="pagamento-sem-divida">
              ✓ Esta conta não possui saldo devedor.
            </p>
          )}
        </section>

        {/* ESTORNO */}
        <section className="conta-section">
          <div className="conta-section-header">
            <div className="conta-section-icone conta-icone-estorno">
              ↶
            </div>

            <div>
              <h2>Registrar estorno</h2>
              <p>Corrija um consumo registrado incorretamente.</p>
            </div>
          </div>

          {consumosParaEstorno.length > 0 ? (
            <form
              className="pagamento-form estorno-form"
              onSubmit={confirmarEstorno}
            >
              <div className="pagamento-campo">
                <label htmlFor="consumoEstorno">
                  Consumo
                </label>

                <select
                  id="consumoEstorno"
                  required
                  value={consumoSelecionado}
                  onChange={(e) => setConsumoSelecionado(e.target.value)}
                >
                  <option value="">Selecione um consumo</option>

                  {consumosParaEstorno.map((consumo) => (
                    <option key={consumo.id} value={consumo.id}>
                      {consumo.descricao} — {formatarMoeda(consumo.valor)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pagamento-campo">
                <label htmlFor="motivoEstorno">
                  Motivo do estorno
                </label>

                <input
                  id="motivoEstorno"
                  type="text"
                  required
                  maxLength={250}
                  value={motivoEstorno}
                  onChange={(e) => setMotivoEstorno(e.target.value)}
                  placeholder="Informe o motivo da correção"
                />
              </div>

              <button
                type="submit"
                className="btn-registrar-estorno"
              >
                Confirmar estorno
              </button>
            </form>
          ) : (
            <div className="conta-empty conta-empty-compacta">
              <strong>Todos os consumos já foram estornados.</strong>
            </div>
          )}
        </section>

      </div>

      {/* CONSUMOS EM ABERTO */}
      <section className="conta-section">
        <div className="conta-section-header">
          <div className="conta-section-icone conta-icone-consumo">
            ▤
          </div>

          <div>
            <h2>Consumos em aberto</h2>
            <p>Movimentações que ainda não foram totalmente quitadas.</p>
          </div>

          <span className="conta-contador">
            {consumosEmAberto.length}
          </span>
        </div>

        {consumosEmAberto.length > 0 ? (
          <div className="conta-lista-consumos">
            {consumosEmAberto.map((consumo) => {
              const pendente =
                Number(consumo.valor) - Number(consumo.valorPago);

              return (
                <div className="conta-consumo-item" key={consumo.id}>
                  <div className="conta-consumo-identificacao">
                    <div className="conta-consumo-icone">−</div>

                    <div>
                      <strong>{consumo.descricao}</strong>
                      <span>{formatarData(consumo.data)}</span>
                    </div>
                  </div>

                  <div className="conta-consumo-valores">
                    <strong>{formatarMoeda(pendente)}</strong>

                    <span className="conta-consumo-status">
                      {Number(consumo.valorPago) > 0
                        ? "Parcialmente pago"
                        : "Pendente"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="conta-empty">
            <span className="conta-empty-icone">✓</span>
            <strong>Nenhum consumo pendente</strong>
            <p>Todos os consumos foram quitados.</p>
          </div>
        )}
      </section>

      {/* EXTRATO */}
      <section className="conta-section">
        <div className="conta-section-header">
          <div className="conta-section-icone conta-icone-extrato">
            ≡
          </div>

          <div>
            <h2>Extrato da conta</h2>
            <p>Histórico de movimentações financeiras do aluno.</p>
          </div>

          <span className="conta-contador">
            {extratoComSaldo.length}
          </span>
        </div>

        {extratoComSaldo.length > 0 ? (
          <div className="conta-tabela-wrapper">
            <table className="conta-tabela">
              <thead>
                <tr>
                  <th>DATA</th>
                  <th>DESCRIÇÃO</th>
                  <th>TIPO</th>
                  <th>VALOR</th>
                  <th>SALDO</th>
                </tr>
              </thead>

              <tbody>
                {extratoComSaldo.map((movimento) => (
                  <tr key={movimento.id}>
                    <td className="conta-tabela-data">
                      {formatarData(movimento.data)}
                    </td>

                    <td className="conta-tabela-descricao">
                      {movimento.descricao}

                      {movimento.creditoGerado > 0 && (
                        <small className="extrato-credito-gerado">
                          Crédito gerado:{" "}
                          {formatarMoeda(movimento.creditoGerado)}
                        </small>
                      )}
                    </td>

                    <td>
                      <span
                        className={`extrato-tipo extrato-${movimento.tipo.toLowerCase()}`}
                      >
                        {movimento.tipo}
                      </span>
                    </td>

                    <td
                      className={
                        movimento.valor < 0
                          ? "extrato-valor-negativo"
                          : "extrato-valor-positivo"
                      }
                    >
                      {movimento.valor < 0 ? "− " : "+ "}
                      {formatarMoeda(Math.abs(movimento.valor))}
                    </td>

                    <td className="conta-tabela-saldo">
                      {formatarMoeda(movimento.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="conta-empty">
            <strong>Nenhuma movimentação registrada</strong>
            <p>O histórico desta conta aparecerá aqui.</p>
          </div>
        )}
      </section>

      {/* CONSUMOS ESTORNADOS */}
      {consumosDoAluno.some((consumo) => consumo.estornado) && (
        <section className="conta-section">
          <div className="conta-section-header">
            <div className="conta-section-icone conta-icone-estorno">
              ↶
            </div>

            <div>
              <h2>Consumos estornados</h2>
              <p>Registros preservados para consulta.</p>
            </div>
          </div>

          <div className="conta-lista-consumos">
            {consumosDoAluno
              .filter((consumo) => consumo.estornado)
              .map((consumo) => (
                <div className="conta-consumo-item" key={consumo.id}>
                  <div>
                    <strong>{consumo.descricao}</strong>

                    <span>
                      Estornado em: {formatarData(consumo.dataEstorno)}
                    </span>

                    <span>
                      Motivo: {consumo.motivoEstorno}
                    </span>
                  </div>

                  <span className="extrato-tipo extrato-estorno">
                    Estornado
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

    </div>
  );
}

export default ContaAluno;
