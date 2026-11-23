require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function perguntar(mensagem) {
  return new Promise((resolve) => {
    rl.question(mensagem, resolve);
  });
}

async function criarAdministrador() {
  try {
    const nome = (await perguntar('Nome do administrador: ')).trim();
    const email = (await perguntar('E-mail do administrador: '))
      .trim()
      .toLowerCase();
    const senha = await perguntar('Senha do administrador: ');

    if (!nome || !email || !senha) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    if (senha.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres.');
    }

    await sequelize.authenticate();

    const existente = await Usuario.findOne({
      where: { email }
    });

    if (existente) {
      throw new Error('Já existe um usuário cadastrado com esse e-mail.');
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      perfil: 'administrador',
      ativo: true
    });

    console.log('\nAdministrador cadastrado com sucesso!');
  } catch (error) {
    console.error('\nErro:', error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await sequelize.close();
  }
}

criarAdministrador();