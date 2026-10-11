import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('./_server.cjs').default;

export default app;
