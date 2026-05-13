import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

// Projects defined in vitest.workspace.ts (vitest 2.x API).
// This file holds shared options + coverage config used across all projects.
//
// SWC plugin is required so vitest preserves TypeScript decorator metadata —
// NestJS's runtime DI uses Reflect.metadata("design:paramtypes", ...) which
// esbuild (vitest's default transformer) does not emit.
export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2021',
      },
    }),
  ],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80 }, // NFR-MAINT-001
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/dto/*.ts', 'src/**/*.module.ts'],
    },
  },
});
