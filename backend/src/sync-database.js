
require('dotenv').config();

const sequelize = require('./config/database');

// Carrega os modelos e configura os relacionamentos.
require('./models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com PostgreSQL realizada com sucesso!');

    await sequelize.sync();
    console.log('Tabelas criadas e sincronizadas com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
