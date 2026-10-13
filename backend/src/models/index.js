
const Aluno = require('./Aluno');
const Fiado = require('./Fiado');
const Pagamento = require('./Pagamento');

// Um aluno pode ter vários fiados.
Aluno.hasMany(Fiado, {
  foreignKey: 'alunoId',
  as: 'fiados',
  onDelete: 'RESTRICT'
});

Fiado.belongsTo(Aluno, {
  foreignKey: 'alunoId',
  as: 'aluno'
});

// Um fiado pode ter vários pagamentos.
Fiado.hasMany(Pagamento, {
  foreignKey: 'fiadoId',
  as: 'pagamentos',
  onDelete: 'RESTRICT'
});

Pagamento.belongsTo(Fiado, {
  foreignKey: 'fiadoId',
  as: 'fiado'
});

module.exports = {
  Aluno,
  Fiado,
  Pagamento
};
