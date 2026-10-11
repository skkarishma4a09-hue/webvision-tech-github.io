import { build } from 'esbuild';

await build({
  entryPoints: ['server/server.ts'],
  outfile: 'api/_server.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  target: 'node20',
});
