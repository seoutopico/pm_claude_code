#!/usr/bin/env node
/**
 * Hook Stop.
 *
 * Si `config.validation.on_inbox_processed == "check_empty"` y la sesión actual
 * invocó /pm:procesar (heurística: hay edits al archivo del inbox), verifica que
 * el inbox quedó vacío (solo plantilla, sin notas reales del usuario).
 *
 * Sale con exit 2 si detecta notas residuales (bloqueante = aviso al final).
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

function isInboxEmpty(content) {
  // El inbox se considera vacío si solo tiene el header "# Inbox" y comentarios HTML.
  const stripped = content
    .replace(/<!--[\s\S]*?-->/g, '')   // quita comentarios
    .replace(/^#\s.*$/m, '')            // quita el primer header
    .trim();
  return stripped.length === 0;
}

async function main() {
  // No necesitamos stdin para este hook, pero lo consumimos para no bloquear.
  await readStdin().catch(() => '');

  const vaultRoot = process.cwd();
  const cfg = loadConfig(vaultRoot);
  if (!cfg) process.exit(0);

  if (cfg.validation?.on_inbox_processed !== 'check_empty') process.exit(0);

  const inboxPath = path.join(vaultRoot, cfg.paths?.inbox || '_inbox.md');
  if (!fs.existsSync(inboxPath)) process.exit(0);

  const content = fs.readFileSync(inboxPath, 'utf8');
  if (isInboxEmpty(content)) process.exit(0);

  // Hay contenido residual.
  const previewLines = content.split('\n').slice(0, 5).join('\n');
  process.stderr.write(
    '[pm:check-inbox-empty] El inbox aún tiene contenido sin procesar:\n\n' +
    previewLines + '\n\n' +
    'Considera ejecutar /pm:procesar antes de cerrar.\n'
  );
  process.exit(2);
}

main().catch((e) => {
  process.stderr.write(`[pm:check-inbox-empty] error: ${e.message}\n`);
  process.exit(0);
});
