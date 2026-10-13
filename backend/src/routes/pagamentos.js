const express = require('express');
const router = express.Router();

const { Aluno, Fiado, Pagamento } = require('../models');
const sequelize = require('../config/database');

// Registrar pagamento com amortização FIFO
router.post('/', async (req, res) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const { alunoId, valor, observacao } = req.body;

    // Validar campos obrigatórios
    if (
      alunoId === undefined ||
      alunoId === null ||
      alunoId === '' ||
      valor === undefined ||
      valor === null ||
      valor === ''
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'Aluno e valor do pagamento são obrigatórios.'
      });
    }

    const idAluno = Number(alunoId);
    const valorNumerico = Number(valor);

    if (!Number.isInteger(idAluno) || idAluno <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'O ID do aluno é inválido.'
      });
    }

    if (
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(String(valor).trim())
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'O pagamento deve ser maior que zero e ter no máximo duas casas decimais.'
      });
    }

    if (
      observacao !== undefined &&
      observacao !== null &&
      (typeof observacao !== 'string' || observacao.length > 200)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'A observação deve ter no máximo 200 caracteres.'
      });
    }

    const valorCentavos = Math.round(valorNumerico * 100);

    // Verificar se o aluno existe e bloquear sua linha durante a operação
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

    // Buscar os fiados pendentes do mais antigo para o mais recente
    const fiados = await Fiado.findAll({
      where: {
        alunoId: idAluno,
        status: 'pendente'
      },
      order: [
        ['dataCompra', 'ASC'],
        ['id', 'ASC']
      ],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const pendencias = [];
    let totalDevedorCentavos = 0;

    // Calcular o valor restante de cada fiado
    for (const fiado of fiados) {
      const pagamentosAnteriores = await Pagamento.sum('valor', {
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
        Number(pagamentosAnteriores || 0) * 100
      );

      const restanteCentavos = Math.max(
        0,
        valorFiadoCentavos - valorPagoCentavos
      );

      if (restanteCentavos > 0) {
        pendencias.push({
          fiado,
          restanteCentavos
        });

        totalDevedorCentavos += restanteCentavos;
      }
    }

    // Impedir pagamento superior à dívida
    if (valorCentavos > totalDevedorCentavos) {
      await transaction.rollback();

      return res.status(422).json({
        erro: 'O pagamento não pode ser maior que a dívida pendente.',
        totalDevedor: totalDevedorCentavos / 100,
        valorInformado: valorCentavos / 100
      });
    }

    let restantePagamentoCentavos = valorCentavos;
    const pagamentosRegistrados = [];

    // Distribuir o pagamento pelos fiados mais antigos primeiro (FIFO)
    for (const pendencia of pendencias) {
      if (restantePagamentoCentavos <= 0) {
        break;
      }

      const valorAplicadoCentavos = Math.min(
        restantePagamentoCentavos,
        pendencia.restanteCentavos
      );

      const pagamento = await Pagamento.create(
        {
          fiadoId: pendencia.fiado.id,
          valor: valorAplicadoCentavos / 100,
          observacao: observacao?.trim() || null
        },
        { transaction }
      );

      restantePagamentoCentavos -= valorAplicadoCentavos;

      // Somar somente pagamentos que não foram estornados
      const pagamentosDoFiado = await Pagamento.sum('valor', {
        where: {
          fiadoId: pendencia.fiado.id,
          estornado: false
        },
        transaction
      });

      const pagoAcumuladoCentavos = Math.round(
        Number(pagamentosDoFiado || 0) * 100
      );

      const valorOriginalCentavos = Math.round(
        Number(pendencia.fiado.valor) * 100
      );

      const fiadoQuitado =
        pagoAcumuladoCentavos >= valorOriginalCentavos;

      await pendencia.fiado.update(
        {
          status: fiadoQuitado ? 'pago' : 'pendente',
          dataPagamento: fiadoQuitado ? new Date() : null
        },
        { transaction }
      );

      pagamentosRegistrados.push({
        pagamentoId: pagamento.id,
        fiadoId: pendencia.fiado.id,
        descricao: pendencia.fiado.descricao,
        valorAplicado: valorAplicadoCentavos / 100,
        statusFiado: fiadoQuitado ? 'pago' : 'pendente'
      });
    }

    await transaction.commit();

    return res.status(201).json({
      mensagem: 'Pagamento registrado com sucesso!',
      aluno: {
        id: aluno.id,
        nome: aluno.nome
      },
      valorPago: valorCentavos / 100,
      saldoDevedor: (totalDevedorCentavos - valorCentavos) / 100,
      pagamentos: pagamentosRegistrados
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.error('Erro ao registrar pagamento:', error);

    return res.status(500).json({
      erro: 'Não foi possível registrar o pagamento.',
      detalhe: error.message
    });
  }
});

// Estornar pagamento com justificativa obrigatória
router.post('/:id/estorno', async (req, res) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const idPagamento = Number(req.params.id);
    const { justificativa } = req.body;

    if (!Number.isInteger(idPagamento) || idPagamento <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'O ID do pagamento é inválido.'
      });
    }

    if (
      typeof justificativa !== 'string' ||
      justificativa.trim().length === 0 ||
      justificativa.trim().length > 300
    ) {
      await transaction.rollback();

      return res.status(400).json({
        erro: 'Informe uma justificativa com até 300 caracteres.'
      });
    }

    const pagamento = await Pagamento.findByPk(idPagamento, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!pagamento) {
      await transaction.rollback();

      return res.status(404).json({
        erro: 'Pagamento não encontrado.'
      });
    }

    if (pagamento.estornado) {
      await transaction.rollback();

      return res.status(409).json({
        erro: 'Este pagamento já foi estornado.'
      });
    }

    const fiado = await Fiado.findByPk(pagamento.fiadoId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!fiado) {
      await transaction.rollback();

      return res.status(404).json({
        erro: 'Fiado relacionado ao pagamento não encontrado.'
      });
    }

    await pagamento.update(
      {
        estornado: true,
        justificativaEstorno: justificativa.trim(),
        dataEstorno: new Date()
      },
      { transaction }
    );

    const totalPago = await Pagamento.sum('valor', {
      where: {
        fiadoId: fiado.id,
        estornado: false
      },
      transaction
    });

    const totalPagoCentavos = Math.round(
      Number(totalPago || 0) * 100
    );

    const valorFiadoCentavos = Math.round(
      Number(fiado.valor) * 100
    );

    const quitado = totalPagoCentavos >= valorFiadoCentavos;

    await fiado.update(
      {
        status: quitado ? 'pago' : 'pendente',
        dataPagamento: quitado ? new Date() : null
      },
      { transaction }
    );

    const aluno = await Aluno.findByPk(fiado.alunoId, {
      transaction
    });

    const fiadosPendentes = await Fiado.findAll({
      where: {
        alunoId: fiado.alunoId,
        status: 'pendente'
      },
      transaction
    });

    let saldoDevedorCentavos = 0;

    for (const item of fiadosPendentes) {
      const pagamentosAtivos = await Pagamento.sum('valor', {
        where: {
          fiadoId: item.id,
          estornado: false
        },
        transaction
      });

      const valorOriginal = Math.round(Number(item.valor) * 100);
      const valorPago = Math.round(Number(pagamentosAtivos || 0) * 100);

      saldoDevedorCentavos += Math.max(0, valorOriginal - valorPago);
    }

    await transaction.commit();

    return res.status(200).json({
      mensagem: 'Pagamento estornado com sucesso.',
      pagamento: {
        id: pagamento.id,
        valor: Number(pagamento.valor),
        estornado: true,
        justificativa: justificativa.trim(),
        dataEstorno: pagamento.dataEstorno
      },
      aluno: aluno
        ? { id: aluno.id, nome: aluno.nome }
        : null,
      fiado: {
        id: fiado.id,
        status: quitado ? 'pago' : 'pendente'
      },
      saldoDevedor: saldoDevedorCentavos / 100
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.error('Erro ao estornar pagamento:', error);

    return res.status(500).json({
      erro: 'Não foi possível estornar o pagamento.',
      detalhe: error.message
    });
  }
});


module.exports = router;