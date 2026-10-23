import assert from 'node:assert/strict';
import type { ModuleServerRequest } from '@sheet-delver/sdk/server';
import { CommandJournal, commandJournal, commandJson, type CommandDriver, type CommandPlan, type CommandRecord } from '../server/commands/journal';
import { commandRoutes } from '../server/routes/commands';

const plan: CommandPlan = { intent: { action: 'synthetic-contract', choice: 'exactID' }, fingerprints: { source: 'independently-reviewed-v1' },
    steps: [{ id: 'one', kind: 'fixture', summary: 'First isolated step' }, { id: 'two', kind: 'fixture', summary: 'Second isolated step' }] };
const one = { ...plan, steps: plan.steps.slice(0, 1) };
function fixture() {
    const store = new Map<string, unknown>();
    let owns = true, revision = 7, epoch = 1, world = 'world', instance = 'instance', caller = 'owner', writes = 0, gets = 0;
    let fail: null | 'throw' | 'silent' | 'read' = null;
    const req = { getAccessContext: () => ({ userId: caller, moduleId: 'dnd5e', isGM: false, role: 2 }), runtime: {
        moduleId: 'dnd5e', world: { snapshot: () => ({ identity: { instanceId: instance, worldId: world, systemId: 'dnd5e', systemVersion: '6.0.6',
            foundryGeneration: 14, foundryBuild: '367', runtimeEpoch: epoch, contextRevision: revision }, settings: {} }),
            assertRevision: (value: number) => { if (value !== revision) throw Error('context changed'); } },
        documents: { get: async (type: string, id: string, opts: { minOwnership: string }) => {
            gets++; assert.equal(type, 'Actor'); assert.equal(opts.minOwnership, 'owner'); return owns ? { _id: id } : null;
        } }, dataStore: { get: async (key: string) => { if (fail === 'read') throw Error('read fault'); return structuredClone(store.get(key) ?? null); },
            set: async (key: string, value: unknown) => { if (fail === 'throw') throw Error('storage fault'); if (fail !== 'silent') store.set(key, structuredClone(value)); } },
    } } as unknown as ModuleServerRequest;
    const driver: CommandDriver = { revalidate: async value => { assert.deepEqual(value.fingerprints, plan.fingerprints); return null; },
        dispatch: async step => { writes++; return { ids: ['Actor.fixtureActor.Item.actual-' + step.id], details: { actual: true } }; }, confirm: async () => true };
    return { req, store, driver, writes: () => writes, gets: () => gets, fault: (value: typeof fail) => { fail = value; },
        owner: (value: boolean) => { owns = value; }, revision: () => { revision++; }, epoch: () => { epoch++; },
        world: (value: string) => { world = value; }, instance: (value: string) => { instance = value; }, caller: (value: string) => { caller = value; } };
}
const recorded: Array<{ id: string; phase: string; dispatches: number }> = [];
async function runCase(id: string, setup: (f: ReturnType<typeof fixture>, journal: CommandJournal) => Promise<CommandRecord>) {
    const f = fixture(), journal = new CommandJournal();
    const result = await setup(f, journal);
    recorded.push({ id, phase: result.phase, dispatches: f.writes() });
}
await runCase('confirmed-duplicate-no-replay', async (f, j) => {
    const reviewed = await j.review(f.req, 'actor', 'op', plan); assert.equal(reviewed.phase, 'reviewed'); assert.equal(f.writes(), 0);
    const result = await j.execute(f.req, 'actor', 'op', plan, f.driver); assert.equal(result.phase, 'confirmed'); assert.equal(f.writes(), 2);
    assert.equal((await j.execute(f.req, 'actor', 'op', plan, f.driver)).phase, 'confirmed'); assert.equal(f.writes(), 2);
    assert.deepEqual((await j.status(f.req, 'actor', 'op'))?.steps.map(step => step.receipt?.ids), [['Actor.fixtureActor.Item.actual-one'], ['Actor.fixtureActor.Item.actual-two']]);
    result.steps[0].receipt!.ids[0] = 'poison'; assert.equal((await j.status(f.req, 'actor', 'op'))?.steps[0].receipt?.ids[0], 'Actor.fixtureActor.Item.actual-one');
    await assert.rejects(j.review(f.req, 'actor', 'op', { ...plan, intent: { different: true } }), /another intent/);
    await assert.rejects(j.execute(f.req, 'actor', 'op', { ...plan, fingerprints: { source: 'changed' } }, f.driver), /another intent/);
    return (await j.status(f.req, 'actor', 'op'))!;
});
for (const scope of ['caller', 'world', 'instance'] as const) await runCase('scope-' + scope, async (f, j) => {
    await j.review(f.req, 'actor', 'op', one); f[scope]('another');
    assert.equal(await j.status(f.req, 'actor', 'op'), null);
    await assert.rejects(j.execute(f.req, 'actor', 'op', one, f.driver), /reviewed intent/);
    return await j.review(f.req, 'actor', 'op', one);
});
for (const change of ['revision', 'epoch'] as const) await runCase('stale-' + change, async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan); f[change]();
    const result = await j.execute(f.req, 'actor', 'op', plan, f.driver); assert.equal(result.phase, 'rejected-zero-write'); assert.equal(f.writes(), 0);
    assert.equal((await j.execute(f.req, 'actor', 'op', plan, f.driver)).phase, 'rejected-zero-write');
    return result;
});
await runCase('context-changes-during-validation', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    let validations = 0; const driver = { ...f.driver, revalidate: async () => { if (++validations === 2) f.revision(); return null; } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'rejected-zero-write'); assert.equal(f.writes(), 0); return result;
});
await runCase('stale-source-fresh-intent', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const stale = { ...f.driver, revalidate: async () => 'Dependency changed' };
    assert.equal((await j.execute(f.req, 'actor', 'op', plan, stale)).phase, 'rejected-zero-write'); assert.equal(f.writes(), 0);
    assert.equal((await j.execute(f.req, 'actor', 'op', plan, f.driver)).phase, 'rejected-zero-write');
    await j.review(f.req, 'actor', 'fresh', plan); const result = await j.execute(f.req, 'actor', 'fresh', plan, f.driver); assert.equal(result.phase, 'confirmed'); return result;
});
for (const fault of ['throw', 'silent', 'read'] as const) await runCase('review-storage-' + fault, async (f, j) => {
    f.fault(fault);
    if (fault === 'read') { await assert.rejects(j.review(f.req, 'actor', 'op', one), /read fault/); assert.equal(f.writes(), 0); f.fault(null); }
    else { const result = await j.review(f.req, 'actor', 'op', one); assert.equal(result.phase, 'rejected-zero-write'); assert.equal(f.writes(), 0); f.fault(null); return (await j.status(f.req, 'actor', 'op'))!; }
    return await j.review(f.req, 'actor', 'fresh', one);
});
await runCase('reviewed-restart-requires-fresh-intent', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const restarted = new CommandJournal(); const result = await restarted.execute(f.req, 'actor', 'op', plan, f.driver);
    assert.equal(result.phase, 'rejected-zero-write'); assert.equal(f.writes(), 0);
    await restarted.review(f.req, 'actor', 'fresh', one); assert.equal((await restarted.execute(f.req, 'actor', 'fresh', one, f.driver)).phase, 'confirmed'); return result;
});
await runCase('unpersisted-zero-write-retirement-survives-restart', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan); f.fault('throw');
    assert.equal((await j.execute(f.req, 'actor', 'op', plan, f.driver)).phase, 'rejected-zero-write'); f.fault(null);
    const result = await new CommandJournal().execute(f.req, 'actor', 'op', plan, f.driver); assert.equal(result.phase, 'rejected-zero-write'); assert.equal(f.writes(), 0); return result;
});
await runCase('execution-admission-storage-failure', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan); f.fault('silent');
    const result = await j.execute(f.req, 'actor', 'op', plan, f.driver); assert.equal(result.phase, 'rejected-zero-write'); assert.equal(f.writes(), 0); return result;
});
await runCase('unknown-first-never-replayed', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => { await f.driver.dispatch(step); throw Error('lost ack'); } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'uncertain'); assert.equal(f.writes(), 1);
    assert.equal((await j.execute(f.req, 'actor', 'op', plan, f.driver)).phase, 'uncertain'); assert.equal(f.writes(), 1); return result;
});
await runCase('partial-second-unknown', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => { const receipt = await f.driver.dispatch(step); if (step.id === 'two') throw Error('lost second'); return receipt; } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'partial'); assert.equal(f.writes(), 2);
    assert.deepEqual(result.steps[0].receipt?.ids, ['Actor.fixtureActor.Item.actual-one']); return result;
});
await runCase('ack-persistence-failure-retains-ids', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => { const receipt = await f.driver.dispatch(step); f.fault('throw'); return receipt; } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'uncertain'); assert.equal(f.writes(), 1);
    assert.deepEqual(result.steps[0].receipt?.ids, ['Actor.fixtureActor.Item.actual-one']); f.fault(null);
    assert.deepEqual((await j.status(f.req, 'actor', 'op'))?.steps[0].receipt, result.steps[0].receipt);
    const restarted = new CommandJournal(); assert.equal((await restarted.execute(f.req, 'actor', 'op', plan, f.driver)).phase, 'uncertain'); assert.equal(f.writes(), 1); return result;
});
for (const confirm of ['false', 'throw'] as const) await runCase('confirmation-' + confirm, async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, confirm: async () => { if (confirm === 'throw') throw Error('readback failure'); return false; } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'uncertain'); assert.equal(f.writes(), 1); assert.ok(result.steps[0].receipt?.ids.length); return result;
});
await runCase('second-source-stale-fences-only-this-operation', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, revalidate: async () => f.writes() ? 'Source changed' : null };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'partial'); assert.equal(f.writes(), 1);
    await j.review(f.req, 'otherActor', 'independent', one); assert.equal((await j.execute(f.req, 'otherActor', 'independent', one, f.driver)).phase, 'confirmed'); return result;
});
await runCase('owner-loss-status-private', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan); f.owner(false);
    await assert.rejects(j.status(f.req, 'actor', 'op'), /ownership/);
    await assert.rejects(j.execute(f.req, 'actor', 'op', plan, f.driver), /ownership/); assert.equal(f.writes(), 0);
    f.owner(true); const result = (await j.status(f.req, 'actor', 'op'))!; assert.equal(result.phase, 'rejected-zero-write');
    assert.equal((await j.execute(f.req, 'actor', 'op', plan, f.driver)).phase, 'rejected-zero-write'); assert.equal(f.writes(), 0); return result;
});
await runCase('owner-loss-between-steps', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, confirm: async () => { f.owner(false); return true; } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'partial'); assert.equal(f.writes(), 1); return result;
});
await runCase('corrupt-journal-never-reinitialized', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan); const key = [...f.store.keys()][0]; f.store.set(key, { schema: 1, phase: 'reviewed', plan });
    await assert.rejects(j.review(f.req, 'actor', 'op', plan), /corrupt/); await assert.rejects(j.execute(f.req, 'actor', 'op', plan, f.driver), /corrupt/); assert.equal(f.writes(), 0);
    f.store.delete(key); return await j.review(f.req, 'actor', 'fresh', one);
});
await runCase('empty-ack-is-unknown', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => { await f.driver.dispatch(step); return { ids: [] }; } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'uncertain'); assert.equal(f.writes(), 1); return result;
});
await runCase('invalid-receipt-details-retain-known-ids', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => {
        const receipt = await f.driver.dispatch(step); return { ...receipt, details: undefined };
    } };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'uncertain'); assert.equal(f.writes(), 1);
    assert.deepEqual(result.steps[0].receipt?.ids, ['Actor.fixtureActor.Item.actual-one']); return result;
});
await runCase('receipt-envelope-rejects-unqualified-payload', async (f, j) => {
    await j.review(f.req, 'actor', 'op', plan);
    const driver = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => ({ ...(await f.driver.dispatch(step)), source: { unqualified: true } }) };
    const result = await j.execute(f.req, 'actor', 'op', plan, driver); assert.equal(result.phase, 'uncertain'); assert.equal(f.writes(), 1);
    assert.deepEqual(result.steps[0].receipt?.ids, ['Actor.fixtureActor.Item.actual-one']); assert.doesNotMatch(JSON.stringify(result), /unqualified/); return result;
});
await runCase('multiple-large-exact-receipts', async (f, j) => {
    const many = { ...plan, steps: [...plan.steps, { id: 'three', kind: 'fixture', summary: 'Third step' }] };
    await j.review(f.req, 'actor', 'op', many);
    const driver = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => {
        await f.driver.dispatch(step); return { ids: Array.from({ length: 128 }, (_, i) => step.id + '-' + i + '-' + 'x'.repeat(200)) };
    } };
    const result = await j.execute(f.req, 'actor', 'op', many, driver); assert.equal(result.phase, 'confirmed'); assert.equal(f.writes(), 3);
    assert.equal(result.steps.flatMap(step => step.receipt!.ids).length, 384); assert.equal((await j.status(f.req, 'actor', 'op'))?.steps[2].receipt?.ids.length, 128); return result;
});
// Actor serialization includes different callers; another Actor can proceed. A failed
// queue entry cannot poison the next entry. No module-world snapshot is cached.
{
    const f = fixture(), j = new CommandJournal(); let release!: () => void, entered!: () => void;
    const waiting = new Promise<void>(resolve => { release = resolve; }), started = new Promise<void>(resolve => { entered = resolve; });
    const anotherCaller = { ...f.req, getAccessContext: () => ({ ...f.req.getAccessContext(), userId: 'otherOwner' }) };
    await j.review(f.req, 'actor', 'op', one); await j.review(anotherCaller, 'actor', 'next', one); await j.review(f.req, 'other', 'parallel', one);
    const blocked = { ...f.driver, dispatch: async (step: Parameters<CommandDriver['dispatch']>[0]) => { entered(); await waiting; return f.driver.dispatch(step); } };
    const first = j.execute(f.req, 'actor', 'op', one, blocked); await started;
    assert.equal((await j.status(f.req, 'actor', 'op'))?.phase, 'executing');
    let secondDone = false; const second = j.execute(anotherCaller, 'actor', 'next', one, f.driver).then(value => { secondDone = true; return value; });
    assert.equal((await j.execute(f.req, 'other', 'parallel', one, f.driver)).phase, 'confirmed'); assert.equal(secondDone, false);
    release(); assert.equal((await first).phase, 'confirmed'); assert.equal((await second).phase, 'confirmed');
    await assert.rejects(j.execute(f.req, 'actor', 'missing', one, f.driver));
    await j.review(f.req, 'actor', 'afterFailure', one); assert.equal((await j.execute(f.req, 'actor', 'afterFailure', one, f.driver)).phase, 'confirmed');
    recorded.push({ id: 'actor-queue-isolation-recovery', phase: 'confirmed', dispatches: f.writes() });
}
// Installed entry point uses the same coordinator and requires current ownership
// before any operation data is returned. This is a route unit test, not installed UI.
{
    const f = fixture(); await commandJournal.review(f.req, 'actor', 'route', one);
    const params = { params: Promise.resolve({ systemId: 'dnd5e', route: ['commands', 'status'] }) };
    const call = async (method: string, query: string) => commandRoutes['commands/status']({ ...f.req, method,
        url: '/api/modules/dnd5e/commands/status' + query }, params) as Promise<{ status: number; json(): Promise<unknown> }>;
    const good = await call('GET', '?actorId=actor&operationId=route'); assert.equal(good.status, 200);
    assert.equal(((await good.json()) as { operation: CommandRecord }).operation.phase, 'reviewed');
    assert.equal((await call('POST', '?actorId=actor&operationId=route')).status, 405);
    for (const query of ['', '?actorId=actor', '?actorId=actor&actorId=other&operationId=route', '?actorId=actor&operationId=route&caller=gm']) assert.equal((await call('GET', query)).status, 400);
    f.owner(false); const denied = await call('GET', '?actorId=actor&operationId=route'); assert.equal(denied.status, 403); assert.doesNotMatch(JSON.stringify(await denied.json()), /independently-reviewed|exactID/);
}
// Strict plan/receipt boundary cases, independent canonical expected bytes.
assert.equal(commandJson({ z: 1, a: [true, null, 'x'] }), '{"a":[true,null,"x"],"z":1}');
for (const invalid of [undefined, NaN, Infinity, new Set(), new Date(), { x: undefined }, new Array(2), JSON.parse('{"__proto__":{}}')]) assert.throws(() => commandJson(invalid));
{
    const f = fixture(), j = new CommandJournal();
    for (const invalid of [{ ...one, steps: [] }, { ...one, steps: [one.steps[0], one.steps[0]] }, { ...one, fingerprints: { source: '' } }, { ...one, steps: [{ ...one.steps[0], state: 'confirmed', receipt: { ids: ['forged'] } }] }]) await assert.rejects(j.review(f.req, 'actor', 'invalid', invalid));
    for (const id of ['', '../escape', 'x'.repeat(129)]) await assert.rejects(j.review(f.req, 'actor', id, one));
    assert.equal(f.store.size, 0); assert.equal(f.writes(), 0);
}
console.log('R: command journal', recorded.length, 'state/storage/identity/queue cases PASS; synthetic drivers, no native/concurrency acceptance');

if (process.argv.includes('--evidence')) console.log(JSON.stringify({ cases: recorded }));
