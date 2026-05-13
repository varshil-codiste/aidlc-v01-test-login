import { defineWorkspace } from 'vitest/config';
import swc from 'unplugin-swc';

// SWC plugin is required so vitest preserves TypeScript decorator metadata —
// NestJS's runtime DI uses Reflect.metadata("design:paramtypes", ...) which
// esbuild (vitest's default transformer) does not emit. Each workspace project
// is its own config and does NOT inherit plugins from vitest.config.ts, so the
// plugin must be wired in here.
const swcPlugin = swc.vite({
  module: { type: 'es6' },
  jsc: {
    parser: { syntax: 'typescript', decorators: true },
    transform: { legacyDecorator: true, decoratorMetadata: true },
    target: 'es2021',
  },
});

export default defineWorkspace([
  {
    plugins: [swcPlugin],
    test: {
      name: 'unit',
      include: ['tests/unit/**/*.spec.ts'],
      environment: 'node',
    },
  },
  {
    plugins: [swcPlugin],
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.int-spec.ts'],
      environment: 'node',
      testTimeout: 60_000,
    },
  },
  {
    plugins: [swcPlugin],
    test: {
      name: 'properties',
      include: ['tests/properties/**/*.prop-spec.ts'],
      environment: 'node',
      testTimeout: 30_000,
    },
  },
]);
