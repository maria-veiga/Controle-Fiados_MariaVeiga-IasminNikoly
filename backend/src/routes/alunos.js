const express = require('express');
const router = express.Router();

const { Aluno, Fiado, Pagamento } = require('../models');

// Cadastrar um aluno
router.post('/', async (req, res) => {
  try {
    const { nome, matricula, turma } = req.body;

    if (
      typeof nome !== 'string' ||
      !nome.trim() ||
      typeof matricula !== 'string' ||
      !matricula.trim() ||
      typeof turma !== 'string' ||
      !turma.trim()
    ) {
      return res.status(400).json({
        erro: 'Nome, matrícula e turma são obrigatórios.'
      });
    }

    const matriculaNormalizada = matricula.trim();

    const alunoExistente = await Aluno.findOne({
      where: { matricula: matriculaNormalizada }
    });

    if (alunoExistente) {
      return res.status(409).json({
        erro: 'Já existe um aluno com essa matrícula.'
      });
    }

    const aluno = await Aluno.create({
      nome: nome.trim(),
      matricula: matriculaNormalizada,
      turma: turma.trim()
    });

    return res.status(201).json({
      mensagem: 'Aluno cadastrado com sucesso!',
      aluno
    });
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);

    return res.status(500).json({
      erro: 'Não foi possível cadastrar o aluno.'
    });
  }
});

// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const alunos = await Aluno.findAll({
      order: [['nome', 'ASC']]
    });

    return res.status(200).json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);

    return res.status(500).json({
      erro: 'Não foi possível listar os alunos.'
    });
  }
});

// Consultar saldo de um aluno
router.get('/:id/saldo', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: 'ID do aluno inválido.'
      });
    }

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        erro: 'Aluno não encontrado.'
      });
    }

    // Buscar os fiados pendentes do aluno
    const fiados = await Fiado.findAll({
      where: {
        alunoId: id,
        status: 'pendente'
      }
    });

    // Calcular a dívida restante, descontando os pagamentos
    // que não foram estornados.
    let saldoDevedorCentavos = 0;

    for (const fiado of fiados) {
      const totalPago = await Pagamento.sum('valor', {
        where: {
          fiadoId: fiado.id,
          estornado: false
        }
      });

      const valorFiadoCentavos = Math.round(
        Number(fiado.valor) * 100
      );

      const valorPagoCentavos = Math.round(
        Number(totalPago || 0) * 100
      );

      saldoDevedorCentavos += Math.max(
        0,
        valorFiadoCentavos - valorPagoCentavos
      );
    }

    const saldoDevedor = saldoDevedorCentavos / 100;
    const limiteCredito = Number(aluno.limiteCredito);

    const limiteDisponivel = Math.max(
      0,
      Number((limiteCredito - saldoDevedor).toFixed(2))
    );

    return res.status(200).json({
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula
      },
      limiteCredito,
      saldoDevedor,
      limiteDisponivel
    });
  } catch (error) {
    console.error('Erro ao consultar saldo:', error);

    return res.status(500).json({
      erro: 'Não foi possível consultar o saldo.'
    });
  }
});

// Editar um aluno
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, matricula, turma, limiteCredito } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: 'ID do aluno inválido.'
      });
    }

    if (
      typeof nome !== 'string' || !nome.trim() ||
      typeof matricula !== 'string' || !matricula.trim() ||
      typeof turma !== 'string' || !turma.trim()
    ) {
      return res.status(400).json({
        erro: 'Nome, matrícula e turma são obrigatórios.'
      });
    }

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        erro: 'Aluno não encontrado.'
      });
    }

    const matriculaNormalizada = matricula.trim();

    const matriculaExistente = await Aluno.findOne({
      where: { matricula: matriculaNormalizada }
    });

    if (matriculaExistente && matriculaExistente.id !== aluno.id) {
      return res.status(409).json({
        erro: 'Já existe outro aluno com essa matrícula.'
      });
    }

    const dadosAtualizados = {
      nome: nome.trim(),
      matricula: matriculaNormalizada,
      turma: turma.trim()
    };

    if (limiteCredito !== undefined) {
      const limite = Number(limiteCredito);

      if (!Number.isFinite(limite) || limite < 0) {
        return res.status(400).json({
          erro: 'O limite de crédito deve ser um número maior ou igual a zero.'
        });
      }

      dadosAtualizados.limiteCredito = limite;
    }

    await aluno.update(dadosAtualizados);

    return res.status(200).json({
      mensagem: 'Aluno atualizado com sucesso!',
      aluno
    });
  } catch (error) {
    console.error('Erro ao editar aluno:', error);

    return res.status(500).json({
      erro: 'Não foi possível editar o aluno.'
    });
  }
});

// Alterar o status de um aluno
router.patch('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { ativo } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: 'ID do aluno inválido.'
      });
    }

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        erro: 'O campo ativo deve ser true ou false.'
      });
    }

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        erro: 'Aluno não encontrado.'
      });
    }

    await aluno.update({ ativo });

    return res.status(200).json({
      mensagem: `Aluno ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
      aluno
    });
  } catch (error) {
    console.error('Erro ao alterar status do aluno:', error);

    return res.status(500).json({
      erro: 'Não foi possível alterar o status do aluno.'
    });
  }
});

module.exports = router;