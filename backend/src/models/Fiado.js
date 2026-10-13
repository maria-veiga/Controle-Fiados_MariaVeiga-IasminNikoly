
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fiado = sequelize.define('Fiado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  alunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'aluno_id'
  },

  descricao: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0.01
    }
  },

  dataCompra: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'data_compra'
  },

  dataPagamento: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_pagamento'
  },

  status: {
    type: DataTypes.ENUM('pendente', 'pago'),
    allowNull: false,
    defaultValue: 'pendente'
  }
}, {
  tableName: 'fiados',
  timestamps: true
});

module.exports = Fiado;
