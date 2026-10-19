import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { join } from 'node:path';

export const nativeCommit = '87e94dbd9f930135e0694cd7e7d49f210603cd2c';
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function readRelease(repo) {
    const git = args => execFileSync('git', ['-C', repo, ...args], { maxBuffer: 128 * 1024 * 1024 });
    const actual = git(['rev-parse', 'release-6.0.6^{commit}']).toString().trim();
    if (actual !== nativeCommit) throw new Error(`Wrong native oracle: ${actual}; expected ${nativeCommit}`);
    const tree = git(['ls-tree', '-r', nativeCommit]).toString().trim().split('\n').map(line => {
        const [, hash, path] = line.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/) ?? [];
        return { hash, path };
    }).filter(row => row.path && (/^module\/.*\.mjs$/.test(row.path) || /^packs\/_source\/.*\.ya?ml$/.test(row.path)
        || ['system.json', 'LICENSE.txt', 'README.md'].includes(row.path)));
    const batch = execFileSync('git', ['-C', repo, 'cat-file', '--batch'], {
        input: tree.map(row => row.hash).join('\n') + '\n', maxBuffer: 128 * 1024 * 1024,
    });
    let offset = 0;
    return new Map(tree.map(row => {
        const end = batch.indexOf(10, offset);
        const [hash, type, length] = batch.subarray(offset, end).toString().split(' ');
        if (hash !== row.hash || type !== 'blob') throw new Error('Invalid native git blob');
        offset = end + 1;
        const source = batch.subarray(offset, offset + Number(length)).toString();
        offset += Number(length) + 1;
        return [row.path, source];
    }));
}

// Parse syntax as data. Never import/evaluate native modules or instantiate Foundry models.
export function settingInventory(source, ts) {
    const file = ts.createSourceFile('settings.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    function literal(node) {
        if (!node) return { unavailable: 'no-explicit-default' };
        if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
        if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
        if (node.kind === ts.SyntaxKind.NullKeyword) return null;
        if (ts.isStringLiteral(node)) return node.text;
        if (ts.isNumericLiteral(node)) return Number(node.text);
        if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(p => [p.name?.text, literal(p.initializer)]));
        if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
        return { expression: node.getText(file) };
    }
    const settings = {};
    function visit(node) {
        if (ts.isCallExpression(node) && node.expression.getText(file) === 'game.settings.register') {
            const [namespace, key, config] = node.arguments;
            if (!ts.isStringLiteral(namespace) || !ts.isStringLiteral(key) || !ts.isObjectLiteralExpression(config)) throw new Error('Unknown native setting registration shape');
            const fields = Object.fromEntries(config.properties.filter(ts.isPropertyAssignment).map(p => [p.name.text, p.initializer]));
            settings[`${namespace.text}.${key.text}`] = {
                scope: literal(fields.scope), default: literal(fields.default),
                choices: fields.choices && ts.isObjectLiteralExpression(fields.choices) ? fields.choices.properties.map(p => p.name.text) : null,
                type: fields.type?.getText(file) ?? null,
            };
        }
        ts.forEachChild(node, visit);
    }
    visit(file);
    return settings;
}
export function inventory(files, core) {
    const require = createRequire(join(core, 'package.json'));
    const yaml = require('js-yaml');
    const ts = require('typescript');
    const manifest = JSON.parse(files.get('system.json'));
    if (manifest.version !== '6.0.6' || manifest.compatibility.minimum !== '14.367') throw new Error('Unsupported native manifest');
    const packs = new Map(manifest.packs.map(pack => [pack.name, pack.type]));
    const records = new Map();
    const types = {}, activities = {}, advancements = {}, effects = {}, shapes = {}, formulas = {}, directives = {};
    const increment = (target, key) => { target[key] = (target[key] ?? 0) + 1; };
    const refs = [];
    for (const [path, source] of files) {
        const match = path.match(/^packs\/_source\/([^/]+24)\/.*\.ya?ml$/);
        if (!match || /(?:^|\/)_(?:folder|folders)/.test(path)) continue;
        const record = yaml.load(source);
        if (!record?._id || record._key?.startsWith('!folders!')) continue;
        const pack = match[1];
        const uuid = `Compendium.dnd5e.${pack}.${packs.get(pack)}.${record._id}`;
        if (records.has(uuid)) throw new Error(`Duplicate canonical UUID: ${uuid}`);
        records.set(uuid, { path, record });
        increment(types, `${pack}:${record.type ?? packs.get(pack)}`);
        for (const a of Object.values(record.system?.activities ?? {})) increment(activities, a.type ?? 'unknown');
        for (const a of Object.values(record.system?.advancement ?? {})) increment(advancements, a.type ?? 'unknown');
        if (record.system?.advancement) increment(shapes, `advancement:${Array.isArray(record.system.advancement) ? 'array' : typeof record.system.advancement}`);
        for (const effect of record.effects ?? []) {
            increment(effects, `type:${effect.type ?? 'base'}`);
            increment(effects, `transfer:${effect.transfer ?? 'absent'}`);
            for (const change of effect.changes ?? []) increment(effects, `mode:${change.mode}`);
        }
        function scan(value, segments) {
            if (typeof value === 'string') {
                const field = segments.at(-1);
                if (value && /^(?:formula|bonus|max|attackBonus|damageBonus|healingBonus|preparation|count|value)$/.test(field)
                    && !segments.some(s => /description|biography/.test(s)) && /[@+*/()\d]|\bd\d/.test(value)) {
                    const key = value;
                    formulas[key] ??= { count: 0, example: { uuid, field: segments.join('.') } };
                    formulas[key].count++;
                }
                for (const m of value.matchAll(/@([A-Za-z]+)\[/g)) increment(directives, m[1]);
                for (const m of value.matchAll(/Compendium\.[\w-]+\.[\w-]+(?:\.[A-Za-z]+)?\.[\w-]+(?:\.[A-Za-z]+\.[\w-]+)*/g)) {
                    refs.push({ from: uuid, to: m[0], field: segments.join('.'), kind: segments.some(s => /description|biography|text/.test(s)) ? 'display' : segments[0] === '_stats' ? 'provenance' : 'structured' });
                }
            } else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) scan(child, [...segments, key]);
        }
        scan(record, []);
    }
    const canonicalRoot = uuid => uuid.split('.').slice(0, 5).join('.');
    const missing = refs.filter(ref => !records.has(canonicalRoot(ref.to)));
    const edges = new Map([...records.keys()].map(id => [id, new Set()]));
    for (const ref of refs.filter(r => r.kind === 'structured')) if (edges.has(canonicalRoot(ref.to))) edges.get(ref.from).add(canonicalRoot(ref.to));
    const cycles = new Set(), visited = new Set(), active = new Set();
    function visit(id, trail) {
        if (active.has(id)) { cycles.add([...trail.slice(trail.indexOf(id)), id].join(' -> ')); return; }
        if (visited.has(id)) return;
        active.add(id);
        for (const next of edges.get(id) ?? []) visit(next, [...trail, id]);
        active.delete(id); visited.add(id);
    }
    for (const id of edges.keys()) visit(id, []);
    const sorted = obj => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b, 'en')));
    const sourcePaths = [...files.keys()].filter(path => path.startsWith('module/') || ['system.json', 'LICENSE.txt', 'README.md'].includes(path));
    return {
        evidence: 'S: static exact-release source inventory, not native execution or formula support',
        native: { release: '6.0.6', commit: nativeCommit, foundryMinimum: manifest.compatibility.minimum },
        sourceTreeSha256: sha256([...files].map(([path, source]) => `${path}:${sha256(source)}`).join('\n')),
        modernRecords: records.size, recordTypes: sorted(types), activities: sorted(activities), advancements: sorted(advancements),
        effects: sorted(effects), shapes: sorted(shapes), directives: sorted(directives),
        settings: settingInventory(files.get('module/settings.mjs'), ts),
        formulas: sorted(formulas),
        references: { total: refs.length, structured: refs.filter(r => r.kind === 'structured').length,
            missing: missing.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en')), cycles: [...cycles].sort() },
        sources: Object.fromEntries(sourcePaths.map(path => [path, sha256(files.get(path))])),
    };
}
