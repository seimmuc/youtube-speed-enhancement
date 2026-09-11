import esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { cp, stat, mkdir, rm, constants as fsc } from 'node:fs/promises';

const isWatch = process.argv.includes('--watch');
const isProd = process.argv.includes('--production');
const cleanOutDir = process.argv.includes('--clean');
const staticDir = 'static';
const outDir = 'dist';

async function resetOutDir() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
}

async function copyStaticFiles() {
  await cp(staticDir, outDir, {
    recursive: true,
    mode: fsc.COPYFILE_FICLONE,
    filter: async (src, dest) => {
      const srcStat = await stat(src);
      if (!srcStat.isFile()) {
        // Copy directories, skip other non-files
        return srcStat.isDirectory();
      }
      try {
        const destStat = await stat(dest);
        // Dest file exists, copy only if src is newer
        return srcStat.mtime > destStat.mtime;
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Dest file does not exist, copy it
          return true;
        } else {
          throw err;
        }
      }
    }
  });
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
    outdir: outDir,
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
  }

  const ctx = await esbuild.context(options);

  if (isWatch) {
    await ctx.watch();
    console.log('Watching for changes... (Ctrl+C to stop)');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log(`Build complete (${outDir}/)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
