#!/usr/bin/env node
/**
 * pm validate-config — valida .pm/config.json y _config/projects.json contra los schemas.
 *
 * Uso:
 *   node validate-config.js [vault_root]
 *
 * Validación mínima sin AJV: comprueba campos requeridos, tipos primitivos y patrones críticos.
 * Para validación completa con AJV usar npx ajv-cli o instalar ajv como dep en el wizard.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = path.resolve(process.argv[2] || process.cwd());
const CONFIG_PATH = path.join(VAULT_ROOT, '.pm', 'config.json');

const errors = [];

function fail(msg) { errors.push(msg); }

function isString(v) { return typeof v === 'string' && v.length > 0; }
function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
function isArr(v) { return Array.isArray(v); }

function validateConfig(cfg) {
  if (!isObj(cfg)) return fail('config no es un objeto');
  if (cfg.version !== 1) fail('config.version debe ser 1');
  if (!isObj(cfg.owner) || !isString(cfg.owner.name)) fail('config.owner.name es obligatorio');
  if (!isString(cfg.language) || !/^[a-z]{2}(-[A-Z]{2})?$/.test(cfg.language)) {
    fail('config.language debe ser código ISO (ej. "es" o "es-ES")');
  }
  const requiredPaths = ['projects_root', 'reports_root', 'templates_root', 'data_root', 'inbox', 'status', 'registry'];
  if (!isObj(cfg.paths)) fail('config.paths es obligatorio');
  else {
    for (const k of requiredPaths) {
      if (!isString(cfg.paths[k])) fail(`config.paths.${k} es obligatorio`);
    }
  }
  if (!isObj(cfg.features)) fail('config.features es obligatorio');

  if (cfg.report) {
    if (!['weekly', 'monthly', 'custom'].includes(cfg.report.cadence)) {
      fail('config.report.cadence debe ser weekly|monthly|custom');
    }
  }

  if (cfg.taxonomies) {
    for (const k of ['project_status', 'project_priority', 'project_states_active']) {
      if (cfg.taxonomies[k] !== undefined && !isArr(cfg.taxonomies[k])) {
        fail(`config.taxonomies.${k} debe ser array si está definido`);
      }
    }
  }
}

function validateRegistry(reg) {
  if (!isObj(reg)) return fail('registry no es un objeto');
  if (reg.version !== 1) fail('registry.version debe ser 1');
  if (!isString(reg.last_updated)) fail('registry.last_updated es obligatorio');
  if (!isArr(reg.projects)) return fail('registry.projects debe ser array');

  const seenIds = new Set();
  reg.projects.forEach((p, i) => {
    const ctx = `registry.projects[${i}]`;
    if (!isString(p.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) {
      fail(`${ctx}.id inválido (kebab-case)`);
    } else if (seenIds.has(p.id)) {
      fail(`${ctx}.id duplicado: "${p.id}"`);
    } else {
      seenIds.add(p.id);
    }
    if (!isString(p.name)) fail(`${ctx}.name es obligatorio`);
    if (!isString(p.path)) fail(`${ctx}.path es obligatorio`);
    if (!isString(p.status)) fail(`${ctx}.status es obligatorio`);
    if (!isString(p.priority)) fail(`${ctx}.priority es obligatorio`);
    if (p.progreso !== undefined && (typeof p.progreso !== 'number' || p.progreso < 0 || p.progreso > 100)) {
      fail(`${ctx}.progreso debe ser número 0-100`);
    }
  });
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`✗ No existe ${CONFIG_PATH}. ¿Has ejecutado /pm:init?`);
    process.exit(1);
  }
  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch (e) { console.error(`✗ config.json no es JSON válido: ${e.message}`); process.exit(1); }

  validateConfig(cfg);

  const registryPath = path.join(VAULT_ROOT, cfg.paths?.registry || '_config/projects.json');
  if (fs.existsSync(registryPath)) {
    let reg;
    try { reg = JSON.parse(fs.readFileSync(registryPath, 'utf8')); }
    catch (e) { fail(`registry no es JSON válido: ${e.message}`); }
    if (reg) validateRegistry(reg);
  } else {
    console.log(`⚠ Registry no encontrado en ${registryPath} (puede ser normal si no hay proyectos aún).`);
  }

  if (errors.length) {
    console.error('✗ Validación falló:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log('✔ Configuración válida.');
}

main();
