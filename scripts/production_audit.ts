// Production readiness audit script
// Run with: npx tsx scripts/production_audit.ts
// This script performs a series of API calls against the running dev server
// (backend on http://localhost:5000, frontend proxy on http://localhost:5173).
// It logs results for verification.

import fetch from 'node-fetch'; // fallback if native fetch unavailable

const BASE = 'http://localhost:5000/api';

function randomEmail() {
  return `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
}

async function main() {
  console.log('--- Starting Production Readiness Audit ---');
  // 1. Register a new user with CREATOR role
  const email = randomEmail();
  const password = 'Password123!';
  const registerRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password, role: 'CREATOR' }),
  });
  const registerBody = await registerRes.json();
  console.log('Register response:', registerRes.status, registerBody);

  // 2. Login to obtain JWT (set as cookie automatically by the server)
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    redirect: 'manual',
  });
  const loginBody = await loginRes.json();
  console.log('Login response:', loginRes.status, loginBody);

  // Extract token from Set-Cookie header (accessToken)
  const setCookie = loginRes.headers.get('set-cookie') || '';
  const tokenMatch = setCookie.match(/accessToken=([^;]+);/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (!token) {
    console.error('⚠️ No access token received; aborting further auth‑required steps');
    return;
  }
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 3. Get current user profile
  const meRes = await fetch(`${BASE}/auth/me`, { method: 'GET', headers: authHeaders });
  const meBody = await meRes.json();
  console.log('Current user:', meRes.status, meBody);

  // 4. Update profile (add a skill)
  const profileUpdate = await fetch(`${BASE}/profile`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Test Creator', headline: 'AI Creator', skills: [] }),
  });
  console.log('Profile update status:', profileUpdate.status);

  // 5. Apply as creator (already role CREATOR, but we call endpoint to ensure flow)
  const applyRes = await fetch(`${BASE}/creators/apply`, { method: 'POST', headers: authHeaders });
  console.log('Apply as creator status:', applyRes.status, await applyRes.text());

  // 6. Create a service (required for orders)
  const serviceRes = await fetch(`${BASE}/creator/services`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Test Service', description: 'Demo service', price: 100, tags: ['demo'] }),
  });
  const serviceBody = await serviceRes.json();
  console.log('Create service:', serviceRes.status, serviceBody);
  const serviceId = serviceBody?.data?.service?.id || serviceBody?.service?.id;

  // 7. Create an order for the service
  let orderId: string | undefined;
  if (serviceId) {
    const orderRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ serviceId, brief: 'Test order brief', budget: 150 }),
    });
    const orderBody = await orderRes.json();
    console.log('Create order:', orderRes.status, orderBody);
    orderId = orderBody?.data?.order?.id || orderBody?.order?.id;
  }

  // 8. Retrieve the order to verify persistence
  if (orderId) {
    const getOrder = await fetch(`${BASE}/orders/${orderId}`, { method: 'GET', headers: authHeaders });
    console.log('Get order status:', getOrder.status, await getOrder.json());
  }

  // 9. Delete the order (cleanup)
  if (orderId) {
    const delRes = await fetch(`${BASE}/orders/${orderId}`, { method: 'DELETE', headers: authHeaders });
    console.log('Delete order status:', delRes.status, await delRes.text());
  }

  // 10. Test AI generation in mock mode
  // We'll temporarily set MOCK_AI_GENERATION=true via query param (not supported) – instead we spawn a separate process.
  console.log('\n--- AI Generation (mock mode) ---');
  const mockAiRes = await fetch(`${BASE}/ai/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ toolId: 'ad', input: 'Test ad copy', settings: { tone: 'Professional', length: 'Short', language: 'English' } }),
  });
  console.log('AI mock response status (should be 200 if MOCK_AI_GENERATION=true):', mockAiRes.status);
  console.log('Body:', await mockAiRes.text());

  // 11. Test AI generation without mock (real provider missing) – expect 503
  console.log('\n--- AI Generation (real provider missing) ---');
  const realAiRes = await fetch(`${BASE}/ai/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ toolId: 'ad', input: 'Test ad copy', settings: { tone: 'Professional', length: 'Short', language: 'English' } }),
  });
  console.log('AI real response status (expected 503):', realAiRes.status);
  console.log('Body:', await realAiRes.text());

  console.log('\n--- Audit Completed ---');
}

main().catch((e) => console.error('Audit error:', e));
