
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('deve retornar status 200 e confirmar que a API funciona', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'API funcionando'
    });
  });

  it('deve retornar 404 para uma rota inexistente', async () => {
    const response = await request(app).get('/api/rota-inexistente');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Rota não encontrada');
  });
});
