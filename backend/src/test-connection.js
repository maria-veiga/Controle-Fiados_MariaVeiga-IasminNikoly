
require('dotenv').config();

const sequelize = require('./config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();

    console.log('Conexão com PostgreSQL realizada com sucesso!');
    console.log(`Banco conectado: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error('Erro ao conectar com o PostgreSQL:');
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testConnection();
