#!/usr/bin/env node
/**
 * pm init — wizard interactivo para inicializar un vault de claude-pm.
 *
 * Uso:
 *   node init.js [--force] [--demo] [--no-demo]
 *
 * Requisitos: Node >= 16. Sin dependencias externas.
 *
 * El script espera dos variables de entorno opcionales:
 *   CLAUDE_PLUGIN_ROOT — raíz del plugin (donde están templates/, schemas/, examples/).
 *                       Si no está, se infiere como dirname(__dirname).
 *   PWD                — cwd del usuario (donde se crea el vault). Si no, process.cwd().
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ---------- Resolución de paths ----------

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT
  ? path.resolve(process.env.CLAUDE_PLUGIN_ROOT)
  : path.resolve(__dirname, '..');

const VAULT_ROOT = process.cwd();

const TEMPLATES_SRC = path.join(PLUGIN_ROOT, 'templates');
const EXAMPLES_SRC = path.join(PLUGIN_ROOT, 'examples');
const SCHEMA_PATH = path.join(PLUGIN_ROOT, 'schemas', 'config.schema.json');

// ---------- Args ----------

const args = process.argv.slice(2);
const argSet = new Set(args);
const FORCE = argSet.has('--force');
const DEMO_FLAG = argSet.has('--demo') ? true : argSet.has('--no-demo') ? false : null;

function getArgValue(name) {
  const i = args.indexOf(name);
  if (i >= 0 && i + 1 < args.length) return args[i + 1];
  const prefix = `${name}=`;
  for (const a of args) {
    if (a.startsWith(prefix)) return a.slice(prefix.length);
  }
  return null;
}

const ANSWERS_FILE = getArgValue('--answers');
const NON_INTERACTIVE = !!ANSWERS_FILE || argSet.has('--non-interactive');

// ---------- Helpers I/O ----------

// Cargar respuestas pre-grabadas (modo no interactivo)
let ANSWERS = null;
if (ANSWERS_FILE) {
  try {
    ANSWERS = JSON.parse(fs.readFileSync(path.resolve(ANSWERS_FILE), 'utf8'));
  } catch (e) {
    console.error(`✗ No se pudo leer --answers ${ANSWERS_FILE}: ${e.message}`);
    process.exit(1);
  }
}

const rl = NON_INTERACTIVE
  ? null
  : readline.createInterface({ input: process.stdin, output: process.stdout });

function answerKey(question) {
  // Convierte "Tu nombre" → "tu_nombre" para buscar en el JSON de respuestas.
  return question.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function ask(question, fallback, keyOverride) {
  const key = keyOverride || answerKey(question);
  if (ANSWERS && Object.prototype.hasOwnProperty.call(ANSWERS, key)) {
    const v = ANSWERS[key];
    return Promise.resolve(v === undefined || v === null ? (fallback ?? '') : String(v));
  }
  if (NON_INTERACTIVE) {
    return Promise.resolve(fallback ?? '');
  }
  const hint = fallback !== undefined && fallback !== '' ? ` [${fallback}]` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${hint}: `, (answer) => {
      const trimmed = (answer || '').trim();
      resolve(trimmed === '' ? (fallback ?? '') : trimmed);
    });
  });
}

async function askYesNo(question, defaultYes = true, keyOverride) {
  const key = keyOverride || answerKey(question);
  if (ANSWERS && Object.prototype.hasOwnProperty.call(ANSWERS, key)) {
    const v = ANSWERS[key];
    if (typeof v === 'boolean') return v;
    return String(v).toLowerCase().startsWith('y') || String(v).toLowerCase().startsWith('s');
  }
  if (NON_INTERACTIVE) return defaultYes;
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = (await ask(`${question} (${hint})`, '')).toLowerCase();
  if (answer === '') return defaultYes;
  return answer.startsWith('y') || answer.startsWith('s');
}

async function askChoice(question, choices, defaultIdx = 0, keyOverride) {
  const key = keyOverride || answerKey(question);
  if (ANSWERS && Object.prototype.hasOwnProperty.call(ANSWERS, key)) {
    const v = String(ANSWERS[key]).trim();
    const byValue = choices.find((c) => c.value === v);
    if (byValue) return byValue;
    const idx = parseInt(v, 10) - 1;
    if (Number.isInteger(idx) && idx >= 0 && idx < choices.length) return choices[idx];
    return choices[defaultIdx];
  }
  if (NON_INTERACTIVE) return choices[defaultIdx];
  console.log(`\n${question}`);
  choices.forEach((c, i) => console.log(`  ${i + 1}) ${c.label}`));
  const raw = await ask(`Elige (1-${choices.length})`, String(defaultIdx + 1));
  const idx = parseInt(raw, 10) - 1;
  return Number.isInteger(idx) && idx >= 0 && idx < choices.length
    ? choices[idx]
    : choices[defaultIdx];
}

function log(msg) { console.log(msg); }
function ok(msg) { console.log(`  ✔ ${msg}`); }
function warn(msg) { console.log(`  ⚠ ${msg}`); }
function err(msg) { console.error(`  ✗ ${msg}`); }

// ---------- Helpers FS ----------

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

// ---------- Plantillas: variables {{var}} ----------

function renderTemplate(content, vars) {
  return content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const value = key.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), vars);
    return value !== undefined && value !== null ? String(value) : '';
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- Estructuras de carpetas predefinidas ----------

const STRUCTURES = {
  numerada: {
    label: 'Numerada (01_Proyectos, 02_Reportes, ...) — orden visual; añade tus propias 06_*, 07_* libremente',
    paths: {
      projects_root: '01_Proyectos',
      reports_root: '02_Reportes',
      communications_root: '03_Comunicaciones',
      processes_root: '04_Procesos',
      meetings_root: '05_Reuniones',
      templates_root: '_plantillas',
      config_root: '_config',
      data_root: '_data',
      inbox: '_inbox.md',
      status: 'STATUS.md',
      registry: '_config/projects.json'
    }
  },
  simple: {
    label: 'Simple (projects, reports, ...) — convención mainstream',
    paths: {
      projects_root: 'projects',
      reports_root: 'reports',
      communications_root: 'communications',
      processes_root: 'processes',
      meetings_root: 'meetings',
      templates_root: 'templates',
      config_root: '_config',
      data_root: '_data',
      inbox: '_inbox.md',
      status: 'STATUS.md',
      registry: '_config/projects.json'
    }
  }
};

// ---------- Defaults de taxonomías por idioma ----------

const TAXONOMIES_BY_LANG = {
  es: {
    project_status: ['Explorando', 'Haciendo', 'Bloqueado', 'En revisión', 'Cerrado'],
    project_priority: ['Alta', 'Media', 'Baja'],
    project_states_active: ['Explorando', 'Haciendo', 'En revisión']
  },
  en: {
    project_status: ['Exploring', 'In progress', 'Blocked', 'In review', 'Closed'],
    project_priority: ['High', 'Medium', 'Low'],
    project_states_active: ['Exploring', 'In progress', 'In review']
  }
};

// ---------- Wizard principal ----------

async function main() {
  log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  claude-pm — wizard de inicialización                       ');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');
  log(`Vault destino:    ${VAULT_ROOT}`);
  log(`Plugin root:      ${PLUGIN_ROOT}`);
  log('');

  // 0. Comprobar que no existe ya un config
  const configDir = path.join(VAULT_ROOT, '.pm');
  const configPath = path.join(configDir, 'config.json');
  if (exists(configPath) && !FORCE) {
    err(`Ya existe ${configPath}. Aborta para no sobreescribir.`);
    err('Si quieres reinicializar, ejecuta con --force.');
    if (rl) rl.close();
    process.exit(1);
  }
  if (FORCE && exists(configPath)) {
    warn('--force activo: se sobreescribirá la configuración existente.');
  }

  // 1. Owner
  log('— Datos del owner —');
  const ownerName = await ask('Tu nombre', '', 'owner_name');
  if (!ownerName) {
    err('El nombre es obligatorio.');
    if (rl) rl.close();
    process.exit(1);
  }
  const ownerRole = await ask('Tu rol (opcional)', '', 'owner_role');
  const ownerEmail = await ask('Email (opcional)', '', 'owner_email');

  // 2. Idioma
  log('\n— Idioma —');
  const language = await ask('Código ISO (es/en/fr/de/pt/...)', 'es', 'language');

  // 3. Estructura
  const structureChoice = await askChoice(
    '— Estructura de carpetas —',
    [
      { value: 'numerada', label: STRUCTURES.numerada.label },
      { value: 'simple', label: STRUCTURES.simple.label }
    ],
    1,
    'structure'
  );
  const paths = STRUCTURES[structureChoice.value].paths;

  // 4. Cadencia del reporte
  const cadenceChoice = await askChoice(
    '— Cadencia del reporte —',
    [
      { value: 'weekly', label: 'Semanal' },
      { value: 'monthly', label: 'Mensual' },
      { value: 'none', label: 'Ninguno (no genera reportes)' }
    ],
    0,
    'cadence'
  );
  const cadence = cadenceChoice.value;

  // 5. Taxonomías
  log('\n— Taxonomías —');
  log('(Puedes aceptar los defaults pulsando ENTER)');
  const langKey = TAXONOMIES_BY_LANG[language] ? language : 'en';
  const defaultTax = TAXONOMIES_BY_LANG[langKey];
  const statusRaw = await ask(
    'Estados de proyecto (separados por coma)',
    defaultTax.project_status.join(','),
    'project_status'
  );
  const priorityRaw = await ask(
    'Prioridades (separadas por coma)',
    defaultTax.project_priority.join(','),
    'project_priority'
  );
  const activeStatesRaw = await ask(
    'Estados considerados "activos" (separados por coma)',
    defaultTax.project_states_active.join(','),
    'project_states_active'
  );

  const taxonomies = {
    project_status: statusRaw.split(',').map((s) => s.trim()).filter(Boolean),
    project_priority: priorityRaw.split(',').map((s) => s.trim()).filter(Boolean),
    project_states_active: activeStatesRaw.split(',').map((s) => s.trim()).filter(Boolean)
  };

  // 6. Módulos opcionales
  log('\n— Módulos opcionales —');
  log('(El core "proyectos + reportes" está siempre activo. Activa los módulos que quieras usar.)');
  const enableCommunications = await askYesNo(
    'Activar módulo Comunicaciones (archivar mails/anuncios con metadatos)',
    false,
    'enable_communications'
  );
  const enableProcesses = await askYesNo(
    'Activar módulo Procesos (documentar procesos internos con TBDs)',
    false,
    'enable_processes'
  );
  const enableMeetings = await askYesNo(
    'Activar módulo Reuniones (plantilla de acta bajo cada proyecto)',
    false,
    'enable_meetings'
  );
  const enableSync = await askYesNo(
    'Activar módulo Sync (espejar el vault a OneDrive / Dropbox / path externo)',
    false,
    'enable_sync'
  );
  let syncDestination = '';
  if (enableSync) {
    syncDestination = await ask(
      'Destino del sync (ruta absoluta o ${env:VAR_NAME})',
      '',
      'sync_destination'
    );
  }

  // 7. Demo
  const installDemo = DEMO_FLAG !== null
    ? DEMO_FLAG
    : await askYesNo('\n¿Instalar proyecto demo de ejemplo?', true, 'install_demo');

  // Quitar paths de módulos no activados
  const pathsFiltered = { ...paths };
  if (!enableCommunications) delete pathsFiltered.communications_root;
  if (!enableProcesses) delete pathsFiltered.processes_root;
  if (!enableMeetings) delete pathsFiltered.meetings_root;

  // ---------- Construir config ----------

  const config = {
    $schema: '../plugin/schemas/config.schema.json',
    version: 1,
    owner: {
      name: ownerName,
      ...(ownerRole ? { role: ownerRole } : {}),
      ...(ownerEmail ? { email: ownerEmail } : {})
    },
    language,
    language_strict: true,
    paths: pathsFiltered,
    taxonomies,
    features: {
      inbox_processing: true,
      project_scaffolding: true,
      view_sync: true,
      periodic_report: cadence !== 'none',
      report_validation: false,
      communications: enableCommunications,
      processes: enableProcesses,
      meetings: enableMeetings,
      sync: enableSync
    },
    ...(cadence !== 'none' ? {
      report: {
        cadence,
        output_pattern: cadence === 'weekly'
          ? `{reports_root}/Semanales/semana_{N}_{ISO_DATE}.md`
          : `{reports_root}/Mensuales/{YYYY}-{MM}.md`,
        history_file: `${paths.data_root}/historico_porcentajes.json`,
        rules_skill: 'reporte-periodico-rules',
        history_track_field: 'progreso'
      }
    } : {}),
    ...(enableSync ? {
      sync: {
        enabled: true,
        destination: syncDestination,
        exclude_files: ['*.log', '*.tmp', '.DS_Store', 'Thumbs.db'],
        exclude_dirs: ['__pycache__', '.venv', 'node_modules', '.git', '.pm', '.obsidian', '.vscode', '.trash']
      }
    } : {}),
    validation: {
      on_subagent_stop: [],
      on_inbox_processed: 'none'
    },
    extensions: {
      extra_agents_dir: '.pm/agents',
      extra_skills_dir: '.pm/skills',
      extra_commands_dir: '.pm/commands'
    }
  };

  // ---------- Escribir ----------

  log('\n— Generando archivos —');

  ensureDir(configDir);
  writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
  ok(`Creado ${path.relative(VAULT_ROOT, configPath)}`);

  // Crear carpetas (solo las del core + módulos activados)
  const foldersToCreate = [
    paths.projects_root,
    paths.reports_root + (cadence === 'weekly' ? '/Semanales' : cadence === 'monthly' ? '/Mensuales' : ''),
    paths.templates_root,
    paths.config_root,
    paths.data_root
  ];
  if (enableCommunications) foldersToCreate.push(paths.communications_root);
  if (enableProcesses) foldersToCreate.push(paths.processes_root);
  // Meetings root es OPCIONAL para actas globales; las actas por proyecto van en {projects_root}/{id}/reuniones/.
  // Solo creamos meetings_root si se activa explícitamente (para reuniones transversales no atadas a un proyecto).
  if (enableMeetings) foldersToCreate.push(paths.meetings_root);

  for (const folder of foldersToCreate) {
    if (folder) {
      ensureDir(path.join(VAULT_ROOT, folder));
      ok(`Carpeta ${folder}/`);
    }
  }

  // Copiar plantillas al templates_root del usuario
  const templatesDst = path.join(VAULT_ROOT, paths.templates_root);
  for (const fname of fs.readdirSync(TEMPLATES_SRC)) {
    copyFile(path.join(TEMPLATES_SRC, fname), path.join(templatesDst, fname));
  }
  ok(`Plantillas copiadas a ${paths.templates_root}/`);

  // _inbox.md
  const inboxPath = path.join(VAULT_ROOT, paths.inbox);
  if (!exists(inboxPath) || FORCE) {
    writeFile(inboxPath, `# Inbox\n\n<!-- Escribe aquí notas libres. Ejecuta /pm:procesar para distribuirlas. -->\n`);
    ok(`Inbox vacío en ${paths.inbox}`);
  }

  // STATUS.md
  const statusPath = path.join(VAULT_ROOT, paths.status);
  if (!exists(statusPath) || FORCE) {
    const statusTpl = fs.readFileSync(path.join(TEMPLATES_SRC, 'TPL_status.md'), 'utf8');
    writeFile(statusPath, renderTemplate(statusTpl, {
      last_synced: todayISO(),
      rows: '| _(sin proyectos aún)_ | | | | | |',
      count_active: 0,
      count_blocked: 0,
      count_review: 0,
      count_archived: 0
    }));
    ok(`Esqueleto inicial en ${paths.status}`);
  }

  // _config/projects.json
  const registryPath = path.join(VAULT_ROOT, paths.registry);
  if (!exists(registryPath) || FORCE) {
    writeFile(registryPath, JSON.stringify({
      $schema: '../plugin/schemas/projects.schema.json',
      version: 1,
      last_updated: todayISO(),
      projects: []
    }, null, 2) + '\n');
    ok(`Registry vacío en ${paths.registry}`);
  }

  // Demo
  if (installDemo) {
    const demoSrc = path.join(EXAMPLES_SRC, 'projects', 'proyecto-demo');
    const demoDst = path.join(VAULT_ROOT, paths.projects_root, 'proyecto-demo');
    if (exists(demoSrc)) {
      copyDir(demoSrc, demoDst);
      ok(`Proyecto demo en ${paths.projects_root}/proyecto-demo/`);

      // Añadir entrada al registry
      const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      reg.projects.push({
        id: 'proyecto-demo',
        name: 'Proyecto Demo',
        path: `${paths.projects_root}/proyecto-demo`,
        status: taxonomies.project_status[1] || taxonomies.project_status[0],
        priority: taxonomies.project_priority[1] || taxonomies.project_priority[0],
        progreso: 35,
        keywords: ['demo', 'ejemplo', 'tutorial'],
        archived: false,
        created: todayISO(),
        last_updated: todayISO()
      });
      writeFile(registryPath, JSON.stringify(reg, null, 2) + '\n');
      ok('Entrada del demo añadida al registry');
    } else {
      warn(`No se encontraron ejemplos en ${demoSrc}. Salto la instalación del demo.`);
    }
  }

  // ---------- Cierre ----------

  log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  Listo. Próximos pasos:');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(`  1. Escribe notas en ${paths.inbox}`);
  log('  2. Ejecuta /pm:procesar para distribuirlas');
  log('  3. Crea proyectos nuevos con /pm:nuevo-proyecto');
  if (cadence !== 'none') {
    log(`  4. Genera reportes con /pm:reporte (cadencia: ${cadence})`);
  }
  log('');
  log(`Personaliza tu setup editando ${path.relative(VAULT_ROOT, configPath)}.`);
  log('Documentación: docs/ONBOARDING.md, docs/CUSTOMIZATION.md.');
  log('');

  if (rl) rl.close();
}

main().catch((e) => {
  err(`Error: ${e.message}`);
  console.error(e.stack);
  if (rl) rl.close();
  process.exit(1);
});
