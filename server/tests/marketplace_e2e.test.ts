import app from '../server';
import request from 'supertest';
import * as aiService from '../services/aiGenerationService';
async function runMarketplaceE2ETests() {
  console.log('🧪 Starting OmniCreator AI Marketplace E2E Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${msg}`);
      failed++;
      throw new Error(msg);
    }
  }

  try {
    // 1. Health Check
    console.log('Test 1: Server Health Endpoint');
    const health = await request(app).get('/api/health');
    assert(health.status === 200, `Health check returned HTTP 200 (Got ${health.status})`);
    assert(health.body.status === 'ok', 'Health status is "ok"');

    // 2. Unauthenticated Access Protection
    console.log('\nTest 2: Security & Unauthenticated Route Guard');
    const unauthMe = await request(app).get('/api/auth/me');
    assert(unauthMe.status === 401, `Protected /api/auth/me rejected unauthenticated request (HTTP 401)`);
    assert(unauthMe.body.error?.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

    // 3. User Registration & Session Token
    console.log('\nTest 3: User Registration & Session Management');
    const email = `e2e_buyer_${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Omni Buyer',
      email,
      password: 'Password123!',
      role: 'USER',
    });
    assert(regRes.status === 201, `Registration succeeded with HTTP 201 (Got ${regRes.status})`);
    const buyerToken = regRes.body.data?.token;
    assert(typeof buyerToken === 'string' && buyerToken.length > 20, 'Received valid JWT session token');

    // 4. Authenticated Profile Identity
    console.log('\nTest 4: Authenticated /api/auth/me Verification');
    const authMe = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${buyerToken}`);
    assert(authMe.status === 200, `Retrieved active user profile (HTTP 200)`);
    assert(authMe.body.data?.user?.email === email.toLowerCase(), 'Profile email matches registered user');

    // 5. Creator Discovery & DB-level Pagination
    console.log('\nTest 5: Creator Discovery & Pagination');
    const p1 = await request(app).get('/api/creators?page=1&limit=2');
    assert(p1.status === 200, 'Creator listing returned HTTP 200');
    assert(p1.body.data?.creators?.length === 2, `Page 1 returned exact requested limit of 2 creators`);
    const totalCount = p1.body.data?.pagination?.total;
    assert(typeof totalCount === 'number' && totalCount >= 6, `Total creator count reflects database count (${totalCount})`);

    const p2 = await request(app).get('/api/creators?page=2&limit=2');
    assert(p2.status === 200, 'Page 2 returned HTTP 200');
    assert(p2.body.data?.creators?.length === 2, 'Page 2 returned exact requested limit of 2 creators');
    assert(p1.body.data?.creators[0]?.id !== p2.body.data?.creators[0]?.id, 'Page 1 and Page 2 contain distinct records');

    // 6. Database Search Filtering
    console.log('\nTest 6: Database Search & Filtering');
    const searchRes = await request(app).get('/api/creators?query=Video');
    assert(searchRes.status === 200, 'Search returned HTTP 200');
    assert(searchRes.body.data?.creators?.length >= 1, 'Search query "Video" found matching creators');

    // 7. Services Marketplace
    console.log('\nTest 7: Published Services Discovery');
    const servicesRes = await request(app).get('/api/services');
    assert(servicesRes.status === 200, 'Services listing returned HTTP 200');
    const services = servicesRes.body.data?.services;
    assert(Array.isArray(services) && services.length >= 1, `Found ${services?.length} published services`);
    const targetService = services[0];

    // 8. Order Placement & State Machine
    console.log('\nTest 8: Authenticated Order Creation & Price Computation');
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        serviceId: targetService.id,
        packageName: 'basic',
        addons: [],
        requirements: 'E2E Automated test campaign requirements',
      });
    assert(orderRes.status === 200, `Order created with HTTP 200 (Got ${orderRes.status})`);
    const createdOrder = orderRes.body.data?.order;
    assert(!!createdOrder?.id, `Received generated Order ID: ${createdOrder?.id}`);
    assert(createdOrder?.status === 'PENDING', `Initial order state is PENDING`);

    // 9. Buyer Orders Retrieval
    console.log('\nTest 9: Buyer Orders Retrieval');
    const myOrders = await request(app)
      .get('/api/orders?role=buyer')
      .set('Authorization', `Bearer ${buyerToken}`);
    assert(myOrders.status === 200, 'Retrieved buyer orders with HTTP 200');
    assert(myOrders.body.data?.orders?.some((o: any) => o.id === createdOrder.id), 'Newly created order appears in buyer list');

    // 10. AI Studio Provider Configuration Guard
    console.log('\nTest 10: AI Studio Provider Guard & Error Handling');
    // Missing provider configuration
    delete process.env.GEMINI_API_KEY;
    process.env.MOCK_AI_GENERATION = 'false';
    const aiResMissing = await request(app)
      .post('/api/ai/generate')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        toolId: 'ad',
        input: 'Test marketing prompt',
        settings: { tone: 'Professional', length: 'Short', language: 'English' },
      });
    assert(aiResMissing.status === 503, 'AI generation should fail with missing provider (503)');
    assert(aiResMissing.body.error?.code === 'AI_PROVIDER_NOT_CONFIGURED', 'Correct error code for missing provider');

    // Provider present with mocked successful generation
    process.env.GEMINI_API_KEY = 'dummy-key';
    process.env.MOCK_AI_GENERATION = 'true';
    const aiResSuccess = await request(app)
      .post('/api/ai/generate')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        toolId: 'ad',
        input: 'Test marketing prompt',
        settings: { tone: 'Professional', length: 'Short', language: 'English' },
      });
    assert(aiResSuccess.status === 200, 'AI generation succeeded with mocked provider');
    // Clean up mock flag
    delete process.env.MOCK_AI_GENERATION;

    console.log(`\n🎉 E2E TEST SUITE COMPLETE: ${passed} passed, ${failed} failed.`);
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ E2E Test Suite Aborted with Error:', err.message);
    process.exit(1);
  }
}

runMarketplaceE2ETests();
