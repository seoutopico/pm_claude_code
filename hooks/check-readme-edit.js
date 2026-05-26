#!/usr/bin/env node
/**
 * Hook PostToolUse (Edit|Write).
 *
 * Si el archivo editado es un README de proyecto bajo {paths.projects_root},
 * escribe un aviso informativo a stderr. NO bloquea (exit 0 siempre).
 *
 * Lee stdin (JSON con el evento de Claude Code) y .pm/config.json para conocer paths.
 */

'use strict';

const fs = require('fs');
const path = require('path');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function loadConfig(vaultRoot) {
  const cfgPath = path.join(vaultRoot, '.pm', 'config.json');
  if (!fs.existsSync(cfgPath)) return null;
  try { return JSON.parse(fs.readFileSync(cfgPath, 'utf8')); }
  catch { return null; }
}

async function main() {
  const raw = await readStdin();
  let event;
  try { event = JSON.parse(raw || '{}'); } catch { event = {}; }

  // El evento de PostToolUse incluye tool_input con el path editado.
  const filePath = event.tool_input?.file_path
    || event.tool_input?.filePath
    || event.tool_input?.path
    || '';
  if (!filePath) process.exit(0);

  const vaultRoot = process.cwd();
  const cfg = loadConfig(vaultRoot);
  if (!cfg || !cfg.paths?.projects_root) process.exit(0);

  // Normaliza separadores para regex
  const projectsRoot = cfg.paths.projects_root.replace(/\\/g, '/');
  const norm = filePath.replace(/\\/g, '/');

  const re = new RegExp(`(^|/)${projectsRoot}/[^/]+/README\\.md$`);
  if (re.test(norm)) {
    const projectId = norm.match(new RegExp(`${projectsRoot}/([^/]+)/README\\.md$`))?.[1] || '?';
    process.stderr.write(
      `[pm] README de proyecto editado: ${projectId}. ` +
      `Considera ejecutar /pm:sync-view para refrescar STATUS.md.\n`
    );
  }

  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(`[pm:check-readme-edit] error: ${e.message}\n`);
  process.exit(0); // no bloqueante
});
