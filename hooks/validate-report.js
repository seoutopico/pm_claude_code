#!/usr/bin/env node
/**
 * Hook SubagentStop matcher: report-writer.
 *
 * Valida el último mensaje del subagente contra reglas declarativas que el usuario
 * define en `.pm/validation/report-rules.json` (opcional). Si el archivo no existe,
 * el hook no hace nada (exit 0).
 *
 * Si encuentra violaciones, escribe a stderr y sale con exit 2 (bloqueante).
 *
 * Esquema de report-rules.json:
 *   {
 *     "forbidden_patterns": [
 *       { "name": "no_colors", "regex": "VERDE|AMBAR|ROJO|🟢|🟡|🔴", "flags": "i" },
 *       { "name": "no_budget", "regex": "presupuesto|budget|€", "flags": "i" }
 *     ],
 *     "required_patterns": [
 *       { "name": "has_cartera", "regex": "## Cartera", "flags": "" }
 *     ],
 *     "max_words": 800
 *   }
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

async function main() {
  const raw = await readStdin();
  let event;
  try { event = JSON.parse(raw || '{}'); } catch { event = {}; }

  const message = event.last_assistant_message
    || event.subagent_output
    || event.message
    || '';

  if (!message) process.exit(0);

  const vaultRoot = process.cwd();
  const rulesPath = path.join(vaultRoot, '.pm', 'validation', 'report-rules.json');
  if (!fs.existsSync(rulesPath)) process.exit(0);

  let rules;
  try { rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8')); }
  catch (e) {
    process.stderr.write(`[pm:validate-report] report-rules.json inválido: ${e.message}\n`);
    process.exit(0); // no bloquees por error de configuración
  }

  const errors = [];

  for (const p of rules.forbidden_patterns || []) {
    const re = new RegExp(p.regex, p.flags || '');
    if (re.test(message)) {
      errors.push(`Patrón prohibido "${p.name}": coincide con /${p.regex}/${p.flags || ''}`);
    }
  }

  for (const p of rules.required_patterns || []) {
    const re = new RegExp(p.regex, p.flags || '');
    if (!re.test(message)) {
      errors.push(`Patrón obligatorio "${p.name}" no encontrado: /${p.regex}/${p.flags || ''}`);
    }
  }

  if (typeof rules.max_words === 'number') {
    const words = (message.match(/\S+/g) || []).length;
    if (words > rules.max_words) {
      errors.push(`Excede el máximo de palabras: ${words} > ${rules.max_words}`);
    }
  }

  if (errors.length) {
    process.stderr.write('[pm:validate-report] Validación falló:\n');
    errors.forEach((e) => process.stderr.write(`  - ${e}\n`));
    process.exit(2); // bloqueante: el subagente debe corregir
  }

  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(`[pm:validate-report] error: ${e.message}\n`);
  process.exit(0);
});
