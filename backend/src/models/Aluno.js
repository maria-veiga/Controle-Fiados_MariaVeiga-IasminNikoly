const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aluno = sequelize.define(
  'Aluno',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    matricula: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },

    turma: {
      type: DataTypes.STRING(30),
      allowNull: false
    },

    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    limiteCredito: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 50.00,
      validate: {
        min: 0
      },
      field: 'limite_credito'
    }
  },
  {
    tableName: 'alunos',
    timestamps: true
  }
);

module.exports = Aluno;