const express = require('express');
const router = express.Router();

const { Aluno, Fiado, Pagamento } = require('../models');
const sequelize = require('../config/database');

// Cadastrar um fiado
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { alunoId, descricao, valor } = req.body;

    // Validar os campos obrigatórios
    if (
      alunoId === undefined ||
      alunoId === null ||
      alunoId === '' ||
      typeof descricao !== 'string' ||
      !descricao.trim() ||
      valor === undefined ||
      valor === null ||
      valor === ''
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'Aluno, descrição e valor são obrigatórios.'
      });
    }

    // Validar o ID do aluno
    const idAluno = Number(alunoId);

    if (!Number.isInteger(idAluno) || idAluno <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'O ID do aluno é inválido.'
      });
    }

    // Validar o valor monetário
    const valorTexto = String(valor).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(valorTexto)) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'Informe um valor com no máximo duas casas decimais.'
      });
    }

    const valorNumerico = Number(valorTexto);

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'O valor deve ser maior que zero.'
      });
    }

    const valorEmCentavos = Math.round(valorNumerico * 100);

    // Consultar e bloquear o aluno durante a operação
    const aluno = await Aluno.findByPk(idAluno, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!aluno) {
      await transaction.rollback();

      return res.status(404).json({
        erro: 'Aluno não encontrado.'
      });
    }

    // Verificar situação do aluno se o modelo possuir esse campo
    if (
      Object.prototype.hasOwnProperty.call(aluno.dataValues, 'ativo') &&
      !aluno.ativo
    ) {
      await transaction.rollback();

      return res.status(403).json({
        erro: 'Aluno inativo não pode realizar novos consumos.'
      });
    }

    // Buscar os fiados pendentes
    const fiadosPendentes = await Fiado.findAll({
      where: {
        alunoId: idAluno,
        status: 'pendente'
      },
      transaction
    });

    // Calcular a dívida restante, descontando pagamentos ativos
    let saldoCentavos = 0;

    for (const fiado of fiadosPendentes) {
      const totalPago = await Pagamento.sum('valor', {
        where: {
          fiadoId: fiado.id,
          estornado: false
        },
        transaction
      });

      const valorFiadoCentavos = Math.round(
        Number(fiado.valor) * 100
      );

      const valorPagoCentavos = Math.round(
        Number(totalPago || 0) * 100
      );

      saldoCentavos += Math.max(
        0,
        valorFiadoCentavos - valorPagoCentavos
      );
    }

    const limiteCentavos = Math.round(
      Number(aluno.limiteCredito) * 100
    );

    // Verificar se o consumo ultrapassa o limite
    if (saldoCentavos + valorEmCentavos > limiteCentavos) {
      await transaction.rollback();

      return res.status(422).json({
        erro: 'Consumo não autorizado: o limite de crédito seria ultrapassado.',
        limiteCredito: Number(aluno.limiteCredito),
        saldoDevedor: saldoCentavos / 100,
        limiteDisponivel: Math.max(
          0,
          (limiteCentavos - saldoCentavos) / 100
        ),
        valorSolicitado: valorEmCentavos / 100
      });
    }

    // Registrar o fiado
    const fiado = await Fiado.create(
      {
        alunoId: idAluno,
        descricao: descricao.trim(),
        valor: valorEmCentavos / 100
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      mensagem: 'Fiado cadastrado com sucesso!',
      fiado
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error('Erro ao cadastrar fiado:', error);

    return res.status(500).json({
      erro: 'Não foi possível cadastrar o fiado.'
    });
  }
});

// Listar todos os fiados
router.get('/', async (req, res) => {
  try {
    const fiados = await Fiado.findAll({
      order: [['id', 'DESC']]
    });

    return res.status(200).json(fiados);
  } catch (error) {
    console.error('Erro ao listar fiados:', error);

    return res.status(500).json({
      erro: 'Não foi possível listar os fiados.'
    });
  }
});

// Consultar fiados de um aluno, incluindo os pagamentos
router.get('/aluno/:alunoId', async (req, res) => {
  try {
    const alunoId = Number(req.params.alunoId);

    if (!Number.isInteger(alunoId) || alunoId <= 0) {
      return res.status(400).json({
        erro: 'O ID do aluno é inválido.'
      });
    }

    const aluno = await Aluno.findByPk(alunoId);

    if (!aluno) {
      return res.status(404).json({
        erro: 'Aluno não encontrado.'
      });
    }

    const fiados = await Fiado.findAll({
      where: { alunoId },
      include: [
        {
          model: Pagamento,
          as: 'pagamentos',
          attributes: [
            'id',
            'valor',
            'dataPagamento',
            'observacao',
            'estornado',
            'justificativaEstorno',
            'dataEstorno'
          ]
        }
      ],
      order: [['id', 'DESC']]
    });

    const resultado = fiados.map((fiado) => {
      const dados = fiado.toJSON();

      const pagamentosAtivos = dados.pagamentos
        .filter((pagamento) => !pagamento.estornado)
        .reduce(
          (total, pagamento) =>
            total + Math.round(Number(pagamento.valor) * 100),
          0
        );

      const valorFiadoCentavos = Math.round(
        Number(dados.valor) * 100
      );

      return {
        ...dados,
        totalPago: pagamentosAtivos / 100,
        saldoRestante: Math.max(
          0,
          valorFiadoCentavos - pagamentosAtivos
        ) / 100
      };
    });

    return res.status(200).json({
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula
      },
      fiados: resultado
    });
  } catch (error) {
    console.error('Erro ao consultar fiados do aluno:', error);

    return res.status(500).json({
      erro: 'Não foi possível consultar os fiados do aluno.'
    });
  }
});

module.exports = router;