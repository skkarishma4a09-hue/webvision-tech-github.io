import request from 'supertest';
import app from '../server';

async function run() {
  // Register a user
  const email = `e2e_test_${Date.now()}@example.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'TestUser',
    email,
    password: 'Password123!',
    role: 'USER',
  });
  const token = reg.body.data?.token;
  console.log('Registered token:', token);

  // Ensure env vars cleared
  process.env.GEMINI_API_KEY = '';
  process.env.MOCK_AI_GENERATION = 'false';

  const res = await request(app)
    .post('/api/ai/generate')
    .set('Authorization', `Bearer ${token}`)
    .send({
      toolId: 'ad',
      input: 'test prompt',
      settings: { tone: 'Professional', length: 'Short', language: 'English' },
    });
  console.log('AI response status:', res.status);
  console.log('AI response body:', JSON.stringify(res.body));
}

run().catch((e) => console.error(e));
