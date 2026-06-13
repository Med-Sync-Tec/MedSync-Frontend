/**
 * Babel config used EXCLUSIVELY by Jest (referenced from jest.config.cjs).
 * Vite does not read this file, so the app build is unaffected.
 */

/**
 * Vite exposes env vars on `import.meta.env`, which is ESM-only syntax that
 * Jest (CommonJS) cannot parse. This plugin rewrites `import.meta` to an
 * object backed by `process.env`, so `import.meta.env.VITE_X` becomes
 * `({ env: process.env }).env.VITE_X` at test time.
 */
function importMetaToProcessEnv({ types: t }) {
  return {
    name: 'import-meta-to-process-env',
    visitor: {
      MetaProperty(path) {
        path.replaceWith(
          t.objectExpression([
            t.objectProperty(
              t.identifier('env'),
              t.memberExpression(t.identifier('process'), t.identifier('env')),
            ),
          ]),
        );
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [importMetaToProcessEnv],
};
