import request from 'supertest';
import app from '../server/server';
import { prisma } from '../server/config/prisma';

(async () => {
  // Register a new user
  const regRes = await request(app).post('/api/auth/register').send({ name: 'Test', email: `test${Date.now()}@example.com`, password: 'Pass123!' });
  const token = regRes.body.data?.token;
  console.log('Registration token', token?.slice(0,10));

  // Ensure token exists
  if (!token) { console.error('No token'); process.exit(1); }

  // Delete provider key to simulate missing provider
  delete process.env.GEMINI_API_KEY;
  process.env.MOCK_AI_GENERATION = 'false';

  const aiRes = await request(app).post('/api/ai/generate')
    .set('Authorization', `Bearer ${token}`)
    .send({ toolId: 'ad', input: 'Test prompt', settings: { tone: 'Professional', length: 'Short', language: 'English' } });

  console.log('AI status', aiRes.status);
  console.log('AI body', JSON.stringify(aiRes.body));
})();
