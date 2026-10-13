const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pagamento = sequelize.define(
  'Pagamento',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    fiadoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'fiado_id'
    },

    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0.01
      }
    },

    dataPagamento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'data_pagamento'
    },

    observacao: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    estornado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    justificativaEstorno: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'justificativa_estorno'
    },

    dataEstorno: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'data_estorno'
    }
  },
  {
    tableName: 'pagamentos',
    timestamps: true
  }
);

module.exports = Pagamento;