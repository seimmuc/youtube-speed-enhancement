import esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const isWatch = process.argv.includes('--watch');
const isProd = process.argv.includes('--production');
const cleanOutDir = process.argv.includes('--clean');
const outdir = 'dist';

async function resetOutDir() {
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });
}

async function copyStaticFiles() {
  await cp('static/manifest.json', path.join(outdir, 'manifest.json'));
}

async function main() {
  if (cleanOutDir) {
    await resetOutDir();
  }
  await copyStaticFiles();

  /** @type {esbuild.BuildOptions} */
  const options = {
    entryPoints: ['src/main.ts'],
    outbase: 'src',
    outdir,
    bundle: true,
    format: 'iife',
    target: 'es2020',
    conditions: ['svelte'],
    plugins: [
        sveltePlugin({
          compilerOptions: {
            css: 'external',
          },
          preprocess: sveltePreprocess(),
        }),
    ],
    sourcemap: true,
    minify: false,
    logLevel: 'info',
  };

  if (isProd) {
    options.sourcemap = false;
    options.minify = true;
  }

  const ctx = await esbuild.context(options);

  if (isWatch) {
    await ctx.watch();
    console.log('Watching for changes... (Ctrl+C to stop)');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log(`Build complete (${outdir}/)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
