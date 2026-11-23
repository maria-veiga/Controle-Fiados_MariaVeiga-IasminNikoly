
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define(
  'Usuario',
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

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    senha: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    perfil: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'administrador'
    },

    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'usuarios',
    timestamps: true
  }
);

module.exports = Usuario;
