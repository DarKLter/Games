#!/usr/bin/env node
/**
 * Live Modular Classic-ES5 Folder Emitter
 * ---------------------------------------
 * Emits 100% browser-native classic ES5 .js and legacy-downgraded .css files into:
 *   ./vendor/
 *   ./core/
 *   ./games/<game-slug>/
 * and writes a tiny (<30 KB) root index.html that loads every file directly via
 * classic relative <link rel="stylesheet" href="./...?v=1"> and <script src="./...?v=1">
 * with ZERO frozen OFFLINE_BUNDLE_START, ZERO <script type="module">, and ZERO fetch().
 *
 * Guarantees:
 *   - Every emitted .js file passes Acorn strict ES5 parsing (ecmaVersion: 5).
 *   - Every emitted .js and .css file is strictly <= 150 KB (153,600 bytes).
 *   - Works 100% offline (file://) and online (http://localhost:3000).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import swc from '@swc/core';
import * as acorn from 'acorn';
import { downgradeCssForLegacyBrowsers } from './legacy-css-downgrade.mjs';
import { LEGACY_POLYFILL_SCRIPT } from './legacy-polyfills.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CACHE_VER = process.env.ARCADE_CACHE_VER || '8';
const BUILD_VERSION_STAMP = `Tsepang Arcade · Live Modular v2.6 (rev ?v=${CACHE_VER} · Hoops 2K26 Part 7 Complete 7-Tab Settings, Sliders, HUD Editor, Replay & MVP · Offline Ready)`;
const MAX_CHUNK_BYTES = 132 * 1024; // 132 KB target cap (strictly below 150 KB hard cap)
const HARD_CAP_BYTES = 150 * 1024;  // 153,600 bytes absolute limit

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function stripExt(p) {
  return p.replace(/\.(tsx|ts|jsx|mjs|cjs|js)$/i, '');
}

function walkFiles(dir, predicate) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, predicate));
    } else if (!predicate || predicate(full)) {
      out.push(full);
    }
  }
  return out.sort();
}

function verifyStrictEs5(filePath, code) {
  try {
    acorn.parse(code, { ecmaVersion: 5, sourceType: 'script' });
  } catch (err) {
    throw new Error(`Strict ES5 Acorn verification FAILED for ${filePath}: ${err.message}`);
  }
  const bytes = Buffer.byteLength(code, 'utf8');
  if (bytes > HARD_CAP_BYTES) {
    throw new Error(
      `150 KB HARD CAP VIOLATED for ${filePath}: ${(bytes / 1024).toFixed(1)} KB`
    );
  }
  return bytes;
}

function writeCheckedJs(relPath, code) {
  const abs = path.join(ROOT_DIR, relPath);
  ensureDir(path.dirname(abs));
  const bytes = verifyStrictEs5(relPath, code);
  fs.writeFileSync(abs, code, 'utf8');
  return { relPath: toPosix(relPath), bytes };
}

function writeCheckedCss(relPath, cssCode) {
  const abs = path.join(ROOT_DIR, relPath);
  ensureDir(path.dirname(abs));
  const bytes = Buffer.byteLength(cssCode, 'utf8');
  if (bytes > HARD_CAP_BYTES) {
    throw new Error(
      `150 KB HARD CAP VIOLATED for CSS ${relPath}: ${(bytes / 1024).toFixed(1)} KB`
    );
  }
  fs.writeFileSync(abs, cssCode, 'utf8');
  return { relPath: toPosix(relPath), bytes };
}

async function swcToEs5Cjs(code, filename, isTsx, isTs, minify = true) {
  const res = await swc.transform(code, {
    filename,
    sourceMaps: false,
    minify,
    jsc: {
      parser: isTs
        ? { syntax: 'typescript', tsx: isTsx, decorators: false }
        : { syntax: 'ecmascript', jsx: isTsx },
      transform: {
        react: {
          runtime: 'automatic',
          development: false,
          importSource: 'react',
        },
      },
      target: 'es5',
      loose: true,
      externalHelpers: false,
      minify: minify
        ? {
            compress: {
              ecma: 5,
              arrows: false,
              booleans: true,
              comparisons: true,
              dead_code: true,
              unused: true,
            },
            mangle: true,
            format: {
              ecma: 5,
              asciiOnly: true,
            },
          }
        : undefined,
    },
    module: {
      type: 'commonjs',
      strict: false,
      strictMode: false,
      noInterop: false,
      lazy: false,
    },
  });
  return res.code;
}

function wrapDefine(modId, bodyCode) {
  return `ArcadeMod.define(${JSON.stringify(modId)},function(require,module,exports){\n${bodyCode}\n});\n`;
}

function packModulesIntoFiles(folderRel, baseName, entries, aliases = []) {
  const written = [];
  const header = `(function(ArcadeMod){\n`;
  const footer = `\n})(window.ArcadeMod);\n`;
  const chunks = [];
  let cur = '';

  const flush = () => {
    if (cur.length > 0) {
      chunks.push(header + cur + footer);
      cur = '';
    }
  };

  for (const item of entries) {
    const piece = wrapDefine(item.id, item.code);
    const pieceBytes = Buffer.byteLength(piece, 'utf8');
    if (pieceBytes + 128 > HARD_CAP_BYTES) {
      // Split single oversized module safely into <= 105 KB defineChunk files
      flush();
      const CHUNK_STR_LEN = 96 * 1024;
      const parts = [];
      for (let i = 0; i < item.code.length; i += CHUNK_STR_LEN) {
        parts.push(item.code.slice(i, i + CHUNK_STR_LEN));
      }
      for (let p = 0; p < parts.length; p++) {
        const partCode =
          header +
          `ArcadeMod.defineChunk(${JSON.stringify(item.id)},${p},${parts.length},${JSON.stringify(parts[p])});\n` +
          footer;
        chunks.push(partCode);
      }
      continue;
    }

    if (cur.length > 0 && Buffer.byteLength(header + cur + piece + footer, 'utf8') > MAX_CHUNK_BYTES) {
      flush();
    }
    cur += piece;
  }

  for (const [aliasId, targetId] of aliases) {
    const aliasPiece = `ArcadeMod.alias(${JSON.stringify(aliasId)},${JSON.stringify(targetId)});\n`;
    if (cur.length > 0 && Buffer.byteLength(header + cur + aliasPiece + footer, 'utf8') > MAX_CHUNK_BYTES) {
      flush();
    }
    cur += aliasPiece;
  }
  flush();

  for (let i = 0; i < chunks.length; i++) {
    const fname = chunks.length === 1 ? `${baseName}.js` : `${baseName}-${i + 1}.js`;
    const rel = path.join(folderRel, fname);
    written.push(writeCheckedJs(rel, chunks[i]));
  }
  return written;
}

// ============================================================================
// 1. MODULE RUNTIME (./core/module-runtime.js)
// ============================================================================
function emitModuleRuntime() {
  const code = `/* Tsepang Arcade Live Modular Classic-ES5 Runtime (Zero fetch, Zero ES Modules) */
(function(global){
  "use strict";
  global.ARCADE_BUILD_VERSION = ${JSON.stringify(BUILD_VERSION_STAMP)};
  var defs = {};
  var aliases = {};
  var chunkStore = {};
  var cache = {};

  function stripExt(p) {
    return p.replace(/\\.(tsx|ts|jsx|mjs|cjs|js)$/i, "");
  }

  function normalizePath(baseId, req) {
    if (!req) return "";
    if (req.indexOf("./") !== 0 && req.indexOf("../") !== 0) {
      return aliases[req] || req;
    }
    var baseParts = baseId.split("/");
    baseParts.pop();
    var reqParts = req.split("/");
    for (var i = 0; i < reqParts.length; i++) {
      var seg = reqParts[i];
      if (!seg || seg === ".") continue;
      if (seg === "..") {
        if (baseParts.length > 0) baseParts.pop();
      } else {
        baseParts.push(seg);
      }
    }
    var joined = baseParts.join("/");
    return aliases[joined] || joined;
  }

  function resolveId(baseId, req) {
    if (/\\.css(\\?.*)?$/i.test(req)) return "__CSS_NOOP__";
    var direct = normalizePath(baseId, req);
    if (defs[direct]) return direct;
    var stripped = stripExt(direct);
    if (defs[stripped]) return stripped;
    if (aliases[stripped] && defs[aliases[stripped]]) return aliases[stripped];
    if (defs[stripped + "/index"]) return stripped + "/index";
    if (defs[direct + "/index"]) return direct + "/index";
    return stripped;
  }

  function loadModule(id) {
    if (id === "__CSS_NOOP__") return {};
    if (aliases[id]) id = aliases[id];
    if (cache[id]) return cache[id].exports;
    var factory = defs[id];
    if (!factory) {
      throw new Error("ArcadeMod: module not found -> " + id);
    }
    var mod = { exports: {} };
    cache[id] = mod;
    var localRequire = function(spec) {
      var target = resolveId(id, spec);
      return loadModule(target);
    };
    factory(localRequire, mod, mod.exports);
    return mod.exports;
  }

  global.ArcadeMod = {
    define: function(id, factory) {
      defs[id] = factory;
    },
    alias: function(fromId, toId) {
      aliases[fromId] = toId;
    },
    defineChunk: function(id, partIdx, totalParts, partStr) {
      if (!chunkStore[id]) chunkStore[id] = new Array(totalParts);
      chunkStore[id][partIdx] = partStr;
      var ready = true;
      for (var i = 0; i < totalParts; i++) {
        if (typeof chunkStore[id][i] !== "string") {
          ready = false;
          break;
        }
      }
      if (ready) {
        var joined = chunkStore[id].join("");
        delete chunkStore[id];
        defs[id] = new Function("require", "module", "exports", joined);
      }
    },
    require: function(id) {
      return loadModule(resolveId("", id));
    },
    has: function(id) {
      return Boolean(defs[id] || aliases[id]);
    }
  };
})(window);
`;
  return writeCheckedJs('core/module-runtime.js', code);
}

// ============================================================================
// 2. VENDOR FOLDERS (./vendor/ — polyfills, react, react-dom, lucide, three)
// ============================================================================
function loadRegeneratorRuntime() {
  try {
    const regPath = require.resolve('regenerator-runtime/runtime.js');
    const src = fs.readFileSync(regPath, 'utf8');
    return `\n;(function(){var module={exports:{}};var exports=module.exports;\n${src}\nif(typeof window!=='undefined'&&!window.regeneratorRuntime&&module.exports){window.regeneratorRuntime=module.exports;}})();\n`;
  } catch {
    return '';
  }
}

function collectUsedLucideIcons() {
  const icons = new Set();
  const files = walkFiles(path.join(ROOT_DIR, 'src'), (f) => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts'));
  const re = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(text)) !== null) {
      const names = m[1].split(',');
      for (const raw of names) {
        const clean = raw.replace(/\s+as\s+.*/i, '').replace(/type\s+/i, '').trim();
        if (clean) icons.add(clean);
      }
    }
  }
  return Array.from(icons).sort();
}

async function swcDownlevelCjs(rawCjsCode, filename = 'vendor.js') {
  const swcRes = await swc.transform(rawCjsCode, {
    filename,
    sourceMaps: false,
    minify: true,
    jsc: {
      parser: { syntax: 'ecmascript' },
      target: 'es5',
      loose: true,
      externalHelpers: false,
      minify: {
        compress: {
          ecma: 5,
          arrows: false,
          booleans: true,
          comparisons: true,
          dead_code: true,
          unused: true,
        },
        mangle: true,
        format: {
          ecma: 5,
          asciiOnly: true,
        },
      },
    },
  });
  return swcRes.code;
}

async function bundleCjsToEs5(entryContents, external = []) {
  const res = await esbuild.build({
    stdin: { contents: entryContents, resolveDir: ROOT_DIR },
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'browser',
    target: ['es2015'],
    define: { 'process.env.NODE_ENV': '"production"' },
    external,
  });
  return swcDownlevelCjs(res.outputFiles[0].text, 'vendor.js');
}

async function bundleEntryFileToEs5(absEntryPath, external = []) {
  const res = await esbuild.build({
    entryPoints: [absEntryPath],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'browser',
    target: ['es2015'],
    define: { 'process.env.NODE_ENV': '"production"' },
    external,
  });
  return swcDownlevelCjs(res.outputFiles[0].text, path.basename(absEntryPath));
}

async function emitThreeVendorChunks() {
  const threeEntry = path.join(ROOT_DIR, 'node_modules/three/src/Three.js');
  const roomEnvEntry = path.join(ROOT_DIR, 'node_modules/three/examples/jsm/environments/RoomEnvironment.js');

  const visited = new Set();
  const queue = [threeEntry, roomEnvEntry];
  const modules = [];

  const importRe = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;

  while (queue.length > 0) {
    const absFile = queue.shift();
    if (visited.has(absFile) || !fs.existsSync(absFile)) continue;
    visited.add(absFile);

    const src = fs.readFileSync(absFile, 'utf8');
    let m;
    importRe.lastIndex = 0;
    while ((m = importRe.exec(src)) !== null) {
      const spec = m[1];
      if (spec.startsWith('./') || spec.startsWith('../')) {
        let resolved = path.resolve(path.dirname(absFile), spec);
        if (!fs.existsSync(resolved) && fs.existsSync(resolved + '.js')) {
          resolved += '.js';
        }
        if (fs.existsSync(resolved) && !visited.has(resolved)) {
          queue.push(resolved);
        }
      }
    }

    const relFromNm = toPosix(path.relative(path.join(ROOT_DIR, 'node_modules'), absFile));
    const modId = stripExt(relFromNm);
    const es5Body = await swcToEs5Cjs(src, relFromNm, false, false, true);
    modules.push({ id: modId, code: es5Body });
  }

  return packModulesIntoFiles('vendor', 'three', modules, [
    ['three', 'three/src/Three'],
    ['three/examples/jsm/environments/RoomEnvironment.js', 'three/examples/jsm/environments/RoomEnvironment'],
    ['three/addons/environments/RoomEnvironment.js', 'three/examples/jsm/environments/RoomEnvironment'],
    ['three/addons/environments/RoomEnvironment', 'three/examples/jsm/environments/RoomEnvironment'],
  ]);
}

async function emitVendor() {
  const vendorScripts = [];

  // 1. Polyfills + regeneratorRuntime
  const rawPoly = LEGACY_POLYFILL_SCRIPT + loadRegeneratorRuntime();
  const polySwc = await swc.transform(rawPoly, {
    filename: 'polyfills.js',
    minify: true,
    jsc: {
      parser: { syntax: 'ecmascript' },
      target: 'es5',
      loose: true,
      minify: { compress: { ecma: 5, arrows: false }, mangle: false, format: { ecma: 5, asciiOnly: true } },
    },
  });
  vendorScripts.push(writeCheckedJs('vendor/polyfills.js', polySwc.code));

  // 2. React + jsx-runtime + tree-shaken lucide-react
  const reactCode = await bundleEntryFileToEs5(require.resolve('react'));
  const jsxRuntimeCode = await bundleEntryFileToEs5(require.resolve('react/jsx-runtime'), ['react']);
  const usedIcons = collectUsedLucideIcons();
  const lucideEntry =
    usedIcons.length > 0
      ? `export { ${usedIcons.join(', ')} } from "lucide-react";`
      : `export const __empty = true;`;
  const lucideCode = await bundleCjsToEs5(lucideEntry, ['react']);

  vendorScripts.push(
    ...packModulesIntoFiles(
      'vendor',
      'react-core',
      [
        { id: 'react', code: reactCode },
        { id: 'react/jsx-runtime', code: jsxRuntimeCode },
        { id: 'lucide-react', code: lucideCode },
      ],
      [['react/jsx-dev-runtime', 'react/jsx-runtime']]
    )
  );

  // 3. react-dom/client (auto-split cleanly into <= 132 KB chunks via defineChunk)
  const reactDomCode = await bundleEntryFileToEs5(require.resolve('react-dom/client'), ['react']);
  vendorScripts.push(
    ...packModulesIntoFiles('vendor', 'react-dom', [{ id: 'react-dom/client', code: reactDomCode }])
  );

  // 4. Three.js individual ES5 modules packed into <= 132 KB chunks
  const threeScripts = await emitThreeVendorChunks();
  vendorScripts.push(...threeScripts);

  return vendorScripts;
}

// ============================================================================
// 3. CORE & 29 GAMES FOLDERS (./core/ + ./games/<game-slug>/)
// ============================================================================
async function compileSrcFile(absFile) {
  const rel = toPosix(path.relative(ROOT_DIR, absFile));
  const id = stripExt(rel);
  const src = fs.readFileSync(absFile, 'utf8');
  const isTsx = /\.tsx$/i.test(absFile);
  const code = await swcToEs5Cjs(src, rel, isTsx, true, true);
  return { id, rel, code };
}

async function emitCoreModules() {
  const coreFiles = walkFiles(
    path.join(ROOT_DIR, 'src/core'),
    (f) => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts')
  );
  coreFiles.push(path.join(ROOT_DIR, 'src/App.tsx'));

  const engineBase = [];
  const threeShared = [];
  const uiShell = [];
  const uiSettings = [];
  const uiLobbies = [];
  const registryMod = [];

  for (const abs of coreFiles) {
    const compiled = await compileSrcFile(abs);
    if (compiled.id === 'src/core/registry') {
      registryMod.push(compiled);
    } else if (compiled.id === 'src/core/threeShared' || compiled.id === 'src/core/LobbyShowcase3D') {
      threeShared.push(compiled);
    } else if (compiled.id === 'src/core/ui/ArcadeShell' || compiled.id === 'src/App') {
      uiShell.push(compiled);
    } else if (
      compiled.id === 'src/core/ui/ArcadeSettingsAndModals' ||
      compiled.id === 'src/core/ui/arcadeUiConstants'
    ) {
      uiSettings.push(compiled);
    } else if (
      compiled.id === 'src/core/ui/Lobby3DOverlay' ||
      compiled.id === 'src/core/ui/ArcadeLegacyGameHuds'
    ) {
      uiLobbies.push(compiled);
    } else {
      engineBase.push(compiled);
    }
  }

  const coreScripts = [];
  coreScripts.push(...packModulesIntoFiles('core', 'engine-base', engineBase));
  coreScripts.push(...packModulesIntoFiles('core', 'three-shared', threeShared));
  coreScripts.push(...packModulesIntoFiles('core', 'ui-shell', uiShell));
  coreScripts.push(...packModulesIntoFiles('core', 'ui-settings', uiSettings));
  coreScripts.push(...packModulesIntoFiles('core', 'ui-lobbies', uiLobbies));

  const registryScripts = packModulesIntoFiles('core', 'registry', registryMod);

  // app-main.js (compiles src/main.tsx and invokes it)
  const mainCompiled = await compileSrcFile(path.join(ROOT_DIR, 'src/main.tsx'));
  const appMainCode =
    `(function(ArcadeMod){\n` +
    wrapDefine(mainCompiled.id, mainCompiled.code) +
    `ArcadeMod.require(${JSON.stringify(mainCompiled.id)});\n` +
    `})(window.ArcadeMod);\n`;
  const appMainScript = writeCheckedJs('core/app-main.js', appMainCode);

  return { coreScripts, registryScripts, appMainScript };
}

async function emitAllGameFolders() {
  const gamesRoot = path.join(ROOT_DIR, 'src/games');
  const slugs = fs
    .readdirSync(gamesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const allGameScripts = [];
  const allGameCss = [];

  for (const slug of slugs) {
    const srcGameDir = path.join(gamesRoot, slug);
    const tsFiles = walkFiles(srcGameDir, (f) => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts'));
    const cssFiles = walkFiles(srcGameDir, (f) => /\.css$/i.test(f));

    // Emit per-game CSS if present
    if (cssFiles.length > 0) {
      const mergedCss = cssFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n\n');
      const safeCss = downgradeCssForLegacyBrowsers(mergedCss);
      allGameCss.push(writeCheckedCss(`games/${slug}/styles.css`, safeCss));
    }

    const compiled = [];
    for (const f of tsFiles) {
      compiled.push(await compileSrcFile(f));
    }

    const totalSize = compiled.reduce((acc, m) => acc + Buffer.byteLength(m.code, 'utf8'), 0);
    if (totalSize <= MAX_CHUNK_BYTES - 1024) {
      // Compact game -> single clean ./games/<slug>/game.js
      allGameScripts.push(...packModulesIntoFiles(`games/${slug}`, 'game', compiled));
    } else {
      // Large game -> group into clean semantic buckets (data / engine / ui)
      const dataBucket = [];
      const engineBucket = [];
      const uiBucket = [];
      for (const m of compiled) {
        if (/data|catalog|roster|skill|emblem|item|hero|mapData|modesData/i.test(m.id)) {
          dataBucket.push(m);
        } else if (/\.tsx$|ui|view|shell|modal|hud|lobby|overlay|setup|panel|bar|screen/i.test(m.rel)) {
          uiBucket.push(m);
        } else {
          engineBucket.push(m);
        }
      }
      if (dataBucket.length > 0) {
        allGameScripts.push(...packModulesIntoFiles(`games/${slug}`, 'data', dataBucket));
      }
      if (engineBucket.length > 0) {
        allGameScripts.push(...packModulesIntoFiles(`games/${slug}`, 'engine', engineBucket));
      }
      if (uiBucket.length > 0) {
        allGameScripts.push(...packModulesIntoFiles(`games/${slug}`, 'ui', uiBucket));
      }
    }
  }

  return { slugs, allGameScripts, allGameCss };
}

// ============================================================================
// 4. CORE CSS (with legacy fallbacks & Tailwind utilities extracted cleanly)
// ============================================================================
function splitCssSafely(cssText, maxBytes) {
  const parts = [];
  let start = 0;
  while (start < cssText.length) {
    if (Buffer.byteLength(cssText.slice(start), 'utf8') <= maxBytes) {
      parts.push(cssText.slice(start));
      break;
    }
    // Find a clean rule boundary (`}`) near maxBytes
    let cut = Math.min(cssText.length, start + maxBytes - 512);
    let depth = 0;
    let lastGood = -1;
    for (let i = start; i < cut; i++) {
      const ch = cssText[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth = Math.max(0, depth - 1);
        if (depth === 0) lastGood = i + 1;
      }
    }
    if (lastGood <= start) lastGood = cut;
    parts.push(cssText.slice(start, lastGood));
    start = lastGood;
  }
  return parts;
}

function emitCoreCss() {
  const cssList = [];

  // Optional pre-compiled Tailwind utility sheet (if extracted via dist/assets/*.css before index.html swap)
  const twCache = path.join(ROOT_DIR, 'scripts', '.tailwind-utilities.css');
  if (fs.existsSync(twCache)) {
    const rawTw = fs.readFileSync(twCache, 'utf8');
    const safeTw = downgradeCssForLegacyBrowsers(rawTw);
    const parts = splitCssSafely(safeTw, MAX_CHUNK_BYTES);
    parts.forEach((p, idx) => {
      const name = parts.length === 1 ? 'core/styles-tailwind.css' : `core/styles-tailwind-${idx + 1}.css`;
      cssList.push(writeCheckedCss(name, p));
    });
  }

  const baseCss = downgradeCssForLegacyBrowsers(
    fs.readFileSync(path.join(ROOT_DIR, 'src/styles/base.css'), 'utf8') +
      '\n\n' +
      fs.readFileSync(path.join(ROOT_DIR, 'src/styles/modals.css'), 'utf8')
  );
  cssList.push(writeCheckedCss('core/styles-base.css', baseCss));

  const gamesCss = downgradeCssForLegacyBrowsers(
    fs.readFileSync(path.join(ROOT_DIR, 'src/styles/games.css'), 'utf8')
  );
  const gParts = splitCssSafely(gamesCss, MAX_CHUNK_BYTES);
  gParts.forEach((p, idx) => {
    const name = gParts.length === 1 ? 'core/styles-games.css' : `core/styles-games-${idx + 1}.css`;
    cssList.push(writeCheckedCss(name, p));
  });

  return cssList;
}

// ============================================================================
// 5. TINY LIVE ROOT index.html (< 30 KB, ZERO OFFLINE_BUNDLE_START!)
// ============================================================================
function emitRootIndexHtml(cssFiles, scriptFiles) {
  const v = CACHE_VER;
  const cssLinks = cssFiles
    .map((f) => `    <link rel="stylesheet" href="./${f.relPath}?v=${v}" />`)
    .join('\n');
  const scriptTags = scriptFiles
    .map((f) => `    <script src="./${f.relPath}?v=${v}"></script>`)
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Tsepang Arcade" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="theme-color" content="#121c14" />
    <meta name="color-scheme" content="dark light" />
    <title>&#x1F33F; Tsepang Garden &amp; Game Arcade</title>
    <meta
      name="description"
      content="Interactive garden world and 29-game arcade featuring Mini Militia DA2, Hoops 2K26 + NBA 2K14 Hybrid 3D, Legends Arena MOBA, 3D Battle Royale, Asphalt Nitro 3D, Stockfish Chess, Tactical Ops FPS, Candy Clash, Sudoku, and more."
    />
    <meta property="og:title" content="&#x1F33F; Tsepang Garden &amp; Game Arcade" />
    <meta
      property="og:description"
      content="Interactive garden world and 29-game arcade — 100% live modular offline &amp; online launcher."
    />
    <meta property="og:type" content="website" />
    <style id="arcade-boot-style">
      #arcade-boot-screen{position:fixed;top:0;right:0;bottom:0;left:0;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;padding:20px;background:#101d15;color:#e8f5ec;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;z-index:9999}
      .arcade-boot-card{max-width:440px;width:100%;background:#16281c;border:1px solid #84fab0;border-radius:16px;padding:20px;text-align:center}
      .arcade-boot-title{font-size:19px;font-weight:700;margin:0 0 8px;color:#84fab0}
      .arcade-boot-sub{font-size:13px;line-height:1.5;color:#cbe3d2;margin:0 0 10px}
      .arcade-boot-err{margin-top:8px;font-size:11px;color:#fca5a5;word-break:break-word}
    </style>
${cssLinks}
  </head>
  <body data-state="garden">
    <div id="root">
      <div id="arcade-boot-screen">
        <div class="arcade-boot-card">
          <div class="arcade-boot-title">&#x1F33F; Tsepang Garden &amp; Game Arcade</div>
          <p class="arcade-boot-sub" id="arcadeBootStatus">Loading 29 live modular games...</p>
          <div class="arcade-boot-err" id="arcadeBootErr"></div>
          <noscript>
            <p class="arcade-boot-sub">Enable JavaScript or open index.html in Chrome, Safari, Firefox, or Samsung Internet.</p>
          </noscript>
        </div>
      </div>
    </div>
    <script>
      (function () {
        window.ARCADE_BUILD_VERSION = ${JSON.stringify(BUILD_VERSION_STAMP)};
        window.onerror = function (msg) {
          var el = document.getElementById('arcadeBootErr');
          if (el) el.textContent = String(msg || 'Runtime error');
        };
      })();
    </script>
${scriptTags}
  </body>
</html>
`;

  const indexBytes = Buffer.byteLength(html, 'utf8');
  if (indexBytes > 30 * 1024) {
    throw new Error(`Root index.html exceeded 30 KB cap: ${(indexBytes / 1024).toFixed(1)} KB`);
  }
  if (html.indexOf('OFFLINE_BUNDLE_START') !== -1) {
    throw new Error('Root index.html MUST NOT contain OFFLINE_BUNDLE_START');
  }
  if (html.indexOf('type="module"') !== -1) {
    throw new Error('Root index.html MUST NOT contain script type="module"');
  }
  if (html.indexOf('諺') !== -1) {
    throw new Error('Root index.html contains mojibake 諺');
  }

  fs.writeFileSync(path.join(ROOT_DIR, 'index.html'), html, 'utf8');
  return indexBytes;
}

async function run() {
  const t0 = Date.now();
  cleanDir(path.join(ROOT_DIR, 'vendor'));
  cleanDir(path.join(ROOT_DIR, 'core'));
  cleanDir(path.join(ROOT_DIR, 'games'));

  const coreCss = emitCoreCss();
  const runtimeScript = emitModuleRuntime();
  const vendorScripts = await emitVendor();
  const { coreScripts, registryScripts, appMainScript } = await emitCoreModules();
  const { slugs, allGameScripts, allGameCss } = await emitAllGameFolders();

  // Exact classic load order:
  // 1. vendor/polyfills.js -> core/module-runtime.js -> remaining vendor/*
  // 2. core/* -> games/*/* -> core/registry.js -> core/app-main.js
  const polyfillScript = vendorScripts[0];
  const restVendor = vendorScripts.slice(1);
  const orderedScripts = [
    polyfillScript,
    runtimeScript,
    ...restVendor,
    ...coreScripts,
    ...allGameScripts,
    ...registryScripts,
    appMainScript,
  ];
  const orderedCss = [...coreCss, ...allGameCss];

  const indexBytes = emitRootIndexHtml(orderedCss, orderedScripts);

  const allFiles = [...orderedCss, ...orderedScripts];
  const maxFile = allFiles.reduce((a, b) => (b.bytes > a.bytes ? b : a), { relPath: '', bytes: 0 });
  const overCap = allFiles.filter((f) => f.bytes > HARD_CAP_BYTES);

  console.log(`Live Modular Folder Emit COMPLETE in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
  console.log(`- Root index.html: ${(indexBytes / 1024).toFixed(2)} KB (ZERO OFFLINE_BUNDLE_START)`);
  console.log(`- Game folders emitted: ${slugs.length} (./games/<slug>/)`);
  console.log(`- Total CSS files: ${orderedCss.length} | Total JS files: ${orderedScripts.length}`);
  console.log(`- Largest code file: ${maxFile.relPath} (${(maxFile.bytes / 1024).toFixed(1)} KB)`);
  console.log(`- Files > 150 KB: ${overCap.length}`);
  if (overCap.length > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
