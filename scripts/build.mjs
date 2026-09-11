import esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';
import { cp, stat, mkdir, rm, constants as fsc, readdir } from 'node:fs/promises';
import AdmZip from "adm-zip";
import path from "node:path";

const isWatch = process.argv.includes('--watch');
const isProd = process.argv.includes('--production');
const cleanOutDir = process.argv.includes('--clean');
const doPack = process.argv.includes('--pack');
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

  if (doPack && !isWatch) {
    console.log('Packing extension...');
    const zipFilePath = `${outDir}.zip`;
    const zip = new AdmZip();
    const entries = await readdir(outDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(outDir, entry.name);
      if (entry.isFile()) {
        zip.addLocalFile(fullPath);
      } else if (entry.isDirectory()) {
        zip.addLocalFolder(fullPath, entry.name);
      }
      // we intentionally ignore any other type of directory entry
    }
    await zip.writeZipPromise(zipFilePath, { overwrite: true });
    console.log(`Packed extension was saved as ${zipFilePath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
