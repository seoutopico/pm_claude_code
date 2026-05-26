#!/usr/bin/env node
/**
 * pm sync — espeja una o más carpetas del vault a un destino externo.
 *
 * Cross-platform:
 *   - Windows: usa robocopy (nativo).
 *   - macOS / Linux: usa rsync (debe estar instalado).
 *
 * Configuración: lee .pm/config.json sección `sync`:
 *
 *   "sync": {
 *     "enabled": true,
 *     "destination": "C:/Users/.../OneDrive/Mirror",   // o ${env:VAR}
 *     "sources": ["01_Proyectos", "STATUS.md"],         // opcional; por defecto todo el vault sin _data ni .pm
 *     "exclude_files": ["*.log", "*.tmp"],
 *     "exclude_dirs": ["__pycache__", ".venv", "node_modules", ".git", ".pm", ".obsidian", ".vscode"]
 *   }
 *
 * Uso:
 *   node sync.js                  → corre el sync con la config actual
 *   node sync.js --dry-run        → muestra qué pasaría sin escribir nada
 *   node sync.js --verbose        → log detallado
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const VAULT_ROOT = process.cwd();
const CONFIG_PATH = path.join(VAULT_ROOT, '.pm', 'config.json');

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const VERBOSE = args.has('--verbose');

function fatal(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function log(msg) { console.log(msg); }
function info(msg) { if (VERBOSE) console.log(`  ${msg}`); }

// ---------- Resolución de variables ----------

function resolveEnvVars(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\$\{env:([A-Z_][A-Z0-9_]*)\}/gi, (_, varName) => {
    const v = process.env[varName];
    if (v === undefined) fatal(`Variable de entorno no definida: ${varName}`);
    return v;
  });
}

// ---------- Cargar config ----------

if (!fs.existsSync(CONFIG_PATH)) {
  fatal(`No existe ${CONFIG_PATH}. ¿Has ejecutado /pm:init?`);
}

let cfg;
try { cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
catch (e) { fatal(`config.json no es JSON válido: ${e.message}`); }

if (!cfg.sync || cfg.sync.enabled !== true) {
  fatal('Sync no está activado. Edita .pm/config.json: sync.enabled = true y sync.destination = "..."');
}

const destination = resolveEnvVars(cfg.sync.destination);
if (!destination) fatal('config.sync.destination es obligatorio.');

const sources = (cfg.sync.sources && cfg.sync.sources.length > 0)
  ? cfg.sync.sources
  : ['.'];

const excludeFiles = cfg.sync.exclude_files || ['*.log', '*.tmp', '.DS_Store', 'Thumbs.db'];
const excludeDirs = cfg.sync.exclude_dirs || ['__pycache__', '.venv', 'node_modules', '.git', '.pm', '.obsidian', '.vscode', '.trash'];

const isWindows = process.platform === 'win32';

// ---------- Verificar destino ----------

if (!fs.existsSync(destination)) {
  if (DRY_RUN) {
    log(`[dry-run] Destino no existe: ${destination} (se crearía)`);
  } else {
    fs.mkdirSync(destination, { recursive: true });
    info(`Destino creado: ${destination}`);
  }
}

// ---------- Ejecutar sync ----------

let exitCode = 0;

for (const source of sources) {
  const src = path.isAbsolute(source) ? source : path.join(VAULT_ROOT, source);
  if (!fs.existsSync(src)) {
    log(`⚠ Source no existe: ${source} (salto)`);
    continue;
  }

  const dst = path.join(destination, path.relative(VAULT_ROOT, src) || '.');

  log(`\nSync: ${source}  →  ${dst}`);

  if (isWindows) {
    // robocopy SRC DST [/MIR] [/XF files] [/XD dirs]
    const robocopyArgs = [src, dst, '/MIR', '/R:2', '/W:5', '/MT:8', '/NFL', '/NDL', '/NP'];
    if (excludeFiles.length) robocopyArgs.push('/XF', ...excludeFiles);
    if (excludeDirs.length) robocopyArgs.push('/XD', ...excludeDirs);
    if (DRY_RUN) robocopyArgs.push('/L');

    info(`robocopy ${robocopyArgs.join(' ')}`);
    const res = spawnSync('robocopy', robocopyArgs, { stdio: VERBOSE ? 'inherit' : 'pipe', encoding: 'utf8' });

    // robocopy: 0-7 = OK con distintos niveles de cambio; >=8 = error real.
    const rc = res.status ?? 99;
    if (rc >= 8) {
      log(`  ✗ robocopy falló con código ${rc}`);
      if (!VERBOSE && res.stdout) log(res.stdout);
      exitCode = rc;
    } else {
      log(`  ✔ OK (robocopy rc=${rc})`);
    }
  } else {
    // rsync -av --delete [--exclude=...] SRC/ DST/
    const rsyncArgs = ['-a', '--delete'];
    if (DRY_RUN) rsyncArgs.push('--dry-run');
    if (VERBOSE) rsyncArgs.push('-v');
    for (const pat of excludeFiles) rsyncArgs.push(`--exclude=${pat}`);
    for (const pat of excludeDirs) rsyncArgs.push(`--exclude=${pat}/`);
    rsyncArgs.push(src.endsWith('/') ? src : src + '/');
    rsyncArgs.push(dst.endsWith('/') ? dst : dst + '/');

    info(`rsync ${rsyncArgs.join(' ')}`);
    const res = spawnSync('rsync', rsyncArgs, { stdio: VERBOSE ? 'inherit' : 'pipe', encoding: 'utf8' });

    if (res.error && res.error.code === 'ENOENT') {
      fatal('rsync no está instalado. Instálalo con tu gestor de paquetes (brew/apt).');
    }
    if (res.status !== 0) {
      log(`  ✗ rsync falló con código ${res.status}`);
      if (!VERBOSE && res.stderr) log(res.stderr);
      exitCode = res.status || 1;
    } else {
      log(`  ✔ OK`);
    }
  }
}

if (exitCode === 0) {
  log(DRY_RUN ? '\n[dry-run] Sync simulado correctamente.' : '\nSync completado.');
} else {
  log(`\nSync terminó con errores (código ${exitCode}).`);
}
process.exit(exitCode);
