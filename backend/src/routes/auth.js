
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Informe o e-mail e a senha.'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado no .env');

      return res.status(500).json({
        erro: 'Erro de configuração do servidor.'
      });
    }

    const usuario = await Usuario.findOne({
      where: {
        email: email.trim().toLowerCase()
      }
    });

    if (!usuario || !usuario.ativo || usuario.perfil !== 'administrador') {
      return res.status(401).json({
        erro: 'E-mail ou senha inválidos.'
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: 'E-mail ou senha inválidos.'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });

  } catch (error) {
    console.error('Erro ao realizar login:', error);

    return res.status(500).json({
      erro: 'Não foi possível realizar o login.'
    });
  }
});

module.exports = router;
