
import { createContext, useContext, useState } from "react";

const AlunosContext = createContext(null);

const alunosIniciais = [
  {
    id: 1,
    nome: "Ana Clara Silva",
    matricula: "2024001",
    turma: "2º Informática",
    saldo: 35,
    credito: 0,
    limite: 50,
    status: "Ativo",
  },
  {
    id: 2,
    nome: "João Pedro Santos",
    matricula: "2024002",
    turma: "3º Informática",
    saldo: 48,
    credito: 0,
    limite: 50,
    status: "Atenção",
  },
  {
    id: 3,
    nome: "Mariana Oliveira",
    matricula: "2024003",
    turma: "1º Informática",
    saldo: 15,
    credito: 0,
    limite: 50,
    status: "Ativo",
  },
  {
    id: 4,
    nome: "Lucas Ferreira",
    matricula: "2024004",
    turma: "2º Administração",
    saldo: 65,
    credito: 0,
    limite: 50,
    status: "Bloqueado",
  },
];

const consumosIniciais = [
  {
    id: 1,
    alunoId: 1,
    descricao: "Lanche e suco",
    data: "2026-11-12T09:30:00",
    valor: 20,
    valorPago: 0,
    creditoUtilizado: 0,
    estornado: false,
  },
  {
    id: 2,
    alunoId: 1,
    descricao: "Salgado e refrigerante",
    data: "2026-11-14T10:00:00",
    valor: 15,
    valorPago: 0,
    creditoUtilizado: 0,
    estornado: false,
  },
  {
    id: 3,
    alunoId: 2,
    descricao: "Almoço",
    data: "2026-11-11T12:00:00",
    valor: 30,
    valorPago: 0,
    creditoUtilizado: 0,
    estornado: false,
  },
  {
    id: 4,
    alunoId: 2,
    descricao: "Lanche",
    data: "2026-11-15T09:00:00",
    valor: 18,
    valorPago: 0,
    creditoUtilizado: 0,
    estornado: false,
  },
  {
    id: 5,
    alunoId: 3,
    descricao: "Salgado e suco",
    data: "2026-11-16T10:00:00",
    valor: 15,
    valorPago: 0,
    creditoUtilizado: 0,
    estornado: false,
  },
  {
    id: 6,
    alunoId: 4,
    descricao: "Almoço",
    data: "2026-11-10T12:00:00",
    valor: 40,
    valorPago: 0,
    creditoUtilizado: 0,
    estornado: false,
  },
  {
    id: 7,
    alunoId: 4,
    descricao: "Lanches diversos",
    data: "2026-11-13T09:30:00",
    valor: 25,
    valorPago: 0,
    creditoUtilizado: 0,
    estornado: false,
  },
];

export function AlunosProvider({ children }) {
  const [alunos, setAlunos] = useState(alunosIniciais);
  const [consumos, setConsumos] = useState(consumosIniciais);
  const [pagamentos, setPagamentos] = useState([]);
  const [estornos, setEstornos] = useState([]);
  const [creditosUtilizados, setCreditosUtilizados] = useState([]);

  // Gera identificadores novos para os lançamentos.
  function gerarId(lista) {
    return lista.reduce(
      (maiorId, item) => Math.max(maiorId, Number(item.id) || 0),
      0
    ) + 1;
  }

  // REGISTRAR PAGAMENTO
  function registrarPagamento(alunoId, valor, formaPagamento) {
    const idAluno = Number(alunoId);

    const aluno = alunos.find((item) => item.id === idAluno);

    if (!aluno) {
      throw new Error("Aluno não encontrado.");
    }

    const valorPagamento = Math.round(Number(valor) * 100) / 100;

    if (!Number.isFinite(valorPagamento) || valorPagamento <= 0) {
      throw new Error("Informe um valor válido.");
    }

    if (valorPagamento > Number(aluno.saldo)) {
      throw new Error(
        "O pagamento não pode ser maior que o saldo devedor."
      );
    }

    const formasValidas = ["Dinheiro", "Pix", "Cartão"];

    if (!formasValidas.includes(formaPagamento)) {
      throw new Error("Selecione uma forma de pagamento válida.");
    }

    let restante = Math.round(valorPagamento * 100);

    const novosConsumos = consumos.map((consumo) => ({
      ...consumo,
    }));

    const consumosDoAluno = novosConsumos
      .filter(
        (consumo) =>
          consumo.alunoId === idAluno &&
          !consumo.estornado &&
          Number(consumo.valorPago) < Number(consumo.valor)
      )
      .sort(
        (a, b) =>
          new Date(a.data).getTime() -
          new Date(b.data).getTime()
      );

    // Aplica o pagamento aos consumos mais antigos primeiro.
    for (const consumo of consumosDoAluno) {
      if (restante <= 0) break;

      const valorTotal = Math.round(Number(consumo.valor) * 100);
      const jaPago = Math.round(Number(consumo.valorPago) * 100);
      const faltaPagar = valorTotal - jaPago;

      const aplicado = Math.min(restante, faltaPagar);

      consumo.valorPago = (jaPago + aplicado) / 100;
      restante -= aplicado;
    }

    if (restante > 0) {
      throw new Error("Não foi possível aplicar todo o pagamento.");
    }

    const novoPagamento = {
      id: gerarId(pagamentos),
      alunoId: idAluno,
      valor: valorPagamento,
      formaPagamento,
      data: new Date().toISOString(),
    };

    const novoSaldo =
      Math.round((Number(aluno.saldo) - valorPagamento) * 100) / 100;

    setConsumos(novosConsumos);

    setPagamentos((listaAtual) => [
      ...listaAtual,
      novoPagamento,
    ]);

    setAlunos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === idAluno
          ? {
              ...item,
              saldo: Math.max(novoSaldo, 0),
              status: novoSaldo <= 0 ? "Quitada" : item.status,
            }
          : item
      )
    );

    return novoPagamento;
  }

  // REGISTRAR ESTORNO
  function estornarConsumo(consumoId, motivo) {
    const idConsumo = Number(consumoId);
    const justificativa = String(motivo || "").trim();

    if (!justificativa) {
      throw new Error("Informe o motivo do estorno.");
    }

    const consumo = consumos.find(
      (item) => item.id === idConsumo
    );

    if (!consumo) {
      throw new Error("Consumo não encontrado.");
    }

    if (consumo.estornado) {
      throw new Error("Este consumo já foi estornado.");
    }

    const aluno = alunos.find(
      (item) => item.id === consumo.alunoId
    );

    if (!aluno) {
      throw new Error("Aluno não encontrado.");
    }

    const valorTotal = Math.round(Number(consumo.valor) * 100);
    const valorPago = Math.round(Number(consumo.valorPago) * 100);
    const valorPendente = Math.max(valorTotal - valorPago, 0);

    const novoSaldo =
      Math.max(
        Math.round(Number(aluno.saldo) * 100) - valorPendente,
        0
      ) / 100;

    const creditoGerado = valorPago / 100;

    const novoCredito =
      Math.round(
        (Number(aluno.credito || 0) + creditoGerado) * 100
      ) / 100;

    const dataEstorno = new Date().toISOString();

    const novoEstorno = {
      id: gerarId(estornos),
      consumoId: idConsumo,
      alunoId: aluno.id,
      valor: valorTotal / 100,
      valorPago: creditoGerado,
      valorRetiradoDaDivida: valorPendente / 100,
      creditoGerado,
      motivo: justificativa,
      data: dataEstorno,
    };

    setConsumos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === idConsumo
          ? {
              ...item,
              estornado: true,
              dataEstorno,
              motivoEstorno: justificativa,
            }
          : item
      )
    );

    setEstornos((listaAtual) => [
      ...listaAtual,
      novoEstorno,
    ]);

    setAlunos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === aluno.id
          ? {
              ...item,
              saldo: novoSaldo,
              credito: novoCredito,
              status: novoSaldo <= 0 ? "Quitada" : item.status,
            }
          : item
      )
    );

    return novoEstorno;
  }

  // REGISTRAR NOVO CONSUMO COM UTILIZAÇÃO AUTOMÁTICA DE CRÉDITO
  function registrarConsumo(alunoId, descricao, valor) {
    const idAluno = Number(alunoId);

    const aluno = alunos.find(
      (item) => item.id === idAluno
    );

    if (!aluno) {
      throw new Error("Aluno não encontrado.");
    }

    const descricaoConsumo = String(descricao || "").trim();
    const valorConsumo = Math.round(Number(valor) * 100) / 100;

    if (!descricaoConsumo) {
      throw new Error("Informe a descrição do consumo.");
    }

    if (!Number.isFinite(valorConsumo) || valorConsumo <= 0) {
      throw new Error("Informe um valor válido.");
    }

    if (aluno.status === "Bloqueado") {
      throw new Error("A conta deste aluno está bloqueada.");
    }

    const valorEmCentavos = Math.round(valorConsumo * 100);

    const creditoDisponivel = Math.round(
      Number(aluno.credito || 0) * 100
    );

    // Primeiro utiliza o crédito que o aluno possui.
    const creditoUtilizado = Math.min(
      creditoDisponivel,
      valorEmCentavos
    );

    // Somente o restante será adicionado à dívida.
    const valorRestante = valorEmCentavos - creditoUtilizado;

    const saldoAtual = Math.round(Number(aluno.saldo) * 100);
    const limiteAtual = Math.round(Number(aluno.limite) * 100);

    if (saldoAtual + valorRestante > limiteAtual) {
      throw new Error(
        "Consumo não autorizado: o limite de crédito seria ultrapassado."
      );
    }

    const novoConsumo = {
      id: gerarId(consumos),
      alunoId: idAluno,
      descricao: descricaoConsumo,
      data: new Date().toISOString(),
      valor: valorConsumo,
      valorPago: creditoUtilizado / 100,
      creditoUtilizado: creditoUtilizado / 100,
      estornado: false,
    };

    const novoSaldo = (saldoAtual + valorRestante) / 100;

    const novoCredito =
      (creditoDisponivel - creditoUtilizado) / 100;

    const novoRegistroCredito = creditoUtilizado > 0
      ? {
          id: gerarId(creditosUtilizados),
          alunoId: idAluno,
          consumoId: novoConsumo.id,
          valor: creditoUtilizado / 100,
          data: novoConsumo.data,
        }
      : null;

    setConsumos((listaAtual) => [
      ...listaAtual,
      novoConsumo,
    ]);

    if (novoRegistroCredito) {
      setCreditosUtilizados((listaAtual) => [
        ...listaAtual,
        novoRegistroCredito,
      ]);
    }

    setAlunos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === idAluno
          ? {
              ...item,
              saldo: novoSaldo,
              credito: novoCredito,
              status:
                novoSaldo >= limiteAtual / 100
                  ? "No limite"
                  : novoSaldo > 0
                    ? "Atenção"
                    : "Ativo",
            }
          : item
      )
    );

    return novoConsumo;
  }

  return (
    <AlunosContext.Provider
      value={{
        alunos,
        setAlunos,
        consumos,
        setConsumos,
        pagamentos,
        estornos,
        creditosUtilizados,
        registrarPagamento,
        estornarConsumo,
        registrarConsumo,
      }}
    >
      {children}
    </AlunosContext.Provider>
  );
}

export function useAlunos() {
  const contexto = useContext(AlunosContext);

  if (!contexto) {
    throw new Error(
      "useAlunos deve ser usado dentro de AlunosProvider."
    );
  }

  return contexto;
}
