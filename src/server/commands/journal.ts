import { createHash, randomUUID } from 'node:crypto';
import { SdkError } from '@sheet-delver/sdk';
import type { ModuleServerRequest } from '@sheet-delver/sdk/server';

/** Server-only command infrastructure. Domain handlers must construct/revalidate plans;
 * no generic write route or client-provided patch/formula is accepted here. */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface CommandStep { id: string; kind: string; summary: string }
export interface CommandPlan {
    intent: Json;
    fingerprints: Record<string, string>;
    steps: CommandStep[];
}
export interface CommandReceipt { ids: string[]; details?: Json }
export interface CommandDriver {
    /** Recompute current domain rules, choices, dependencies and affected source facts.
     * Return a reason on mismatch. Owner/context checks are also performed by the journal. */
    revalidate(plan: Readonly<CommandPlan>): Promise<string | null>;
    /** Exactly one SDK operation per step. Any throw is conservatively unknown. */
    dispatch(step: Readonly<CommandStep>): Promise<CommandReceipt>;
    /** Domain-specific exact-field/identity confirmation, with qualified freshness limits.
     * A matching cached primary read alone does not solve C32's external-edit race. */
    confirm(step: Readonly<CommandStep>, receipt: Readonly<CommandReceipt>): Promise<boolean>;
}
export type CommandPhase = 'reviewed' | 'executing' | 'confirmed' | 'rejected-zero-write' | 'partial' | 'uncertain';
type StepState = CommandStep & { state: 'planned' | 'dispatching' | 'acknowledged' | 'confirmed' | 'unknown'; receipt?: CommandReceipt };
interface Scope { module: string; instance: string; world: string; caller: string; actor: string; operation: string }
export interface CommandRecord {
    schema: 1;
    scope: Scope;
    digest: string;
    contextDigest: string;
    contextRevision: number;
    reviewSession: string;
    plan: CommandPlan;
    phase: CommandPhase;
    steps: StepState[];
    reason?: string;
}
const token = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 2048 && !/[\u0000-\u001f]/.test(value);
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
/** Strict JSON canonicalization: no coercion, hidden undefined, nonfinite values or prototypes. */
function encodeJson(value: unknown, maxBytes: number, maxNodes: number): string {
    let nodes = 0;
    function encode(input: unknown, depth: number): string {
        if (++nodes > maxNodes || depth > 24) throw new SdkError('validation', 'Command data exceeds bounds');
        if (input === null || typeof input === 'boolean' || typeof input === 'string') return JSON.stringify(input);
        if (typeof input === 'number' && Number.isFinite(input)) return JSON.stringify(input);
        if (Array.isArray(input)) return '[' + Array.from(input, child => encode(child, depth + 1)).join(',') + ']';
        if (object(input)) return '{' + Object.keys(input).sort().map(key => {
            if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new SdkError('validation', 'Invalid command key');
            return JSON.stringify(key) + ':' + encode(input[key], depth + 1);
        }).join(',') + '}';
        throw new SdkError('validation', 'Command data must be plain JSON');
    }
    const encoded = encode(value, 0);
    if (Buffer.byteLength(encoded, 'utf8') > maxBytes) throw new SdkError('validation', 'Command data exceeds bounds');
    return encoded;
}
export const commandJson = (value: unknown): string => encodeJson(value, 65536, 8192);
// Input plans remain64KiB. A record repeats its step descriptions and can retain
//64 receipts of256 identities (each<=256 chars) plus4KiB ancillary details each.
//8MiB/131072 nodes accommodates that declared aggregate without dropping exact IDs.
const journalJson = (value: unknown) => encodeJson(value, 8 * 1024 * 1024, 131072);
const hash = (value: unknown) => createHash('sha256').update(commandJson(value)).digest('hex');
const copy = <T>(value: T): T => JSON.parse(journalJson(value));
function planValue(value: CommandPlan): CommandPlan {
    commandJson(value);
    const plan = copy(value);
    if (!object(plan) || Object.keys(plan).some(key => !['intent', 'fingerprints', 'steps'].includes(key)) || !object(plan.fingerprints) || Object.keys(plan.fingerprints).length > 64
        || Object.entries(plan.fingerprints).some(([key, value]) => !text(key) || !text(value))
        || !Array.isArray(plan.steps) || !plan.steps.length || plan.steps.length > 64
        || plan.steps.some(step => !object(step) || Object.keys(step).some(key => !['id', 'kind', 'summary'].includes(key)) || !token(step.id) || !token(step.kind) || !text(step.summary))
        || new Set(plan.steps.map(step => step.id)).size !== plan.steps.length
        || !Object.hasOwn(plan, 'intent')) throw new SdkError('validation', 'Invalid server command plan');
    return plan;
}
function receiptValue(value: CommandReceipt): CommandReceipt {
    const receipt = copy(value);
    if (!object(receipt) || Object.keys(receipt).some(key => !['ids', 'details'].includes(key)) || !Array.isArray(receipt.ids) || !receipt.ids.length || receipt.ids.length > 256
        || receipt.ids.some(id => typeof id !== 'string' || !/^[A-Za-z0-9_.:-]{1,256}$/.test(id)) || new Set(receipt.ids).size !== receipt.ids.length)
        throw new SdkError('not_ready', 'Exact acknowledgement identities are unavailable');
    if (Object.hasOwn(receipt, 'details') && commandJson(receipt.details).length > 4096)
        throw new SdkError('not_ready', 'Acknowledgement ancillary details exceed bounds');
    return receipt;
}
const phases: CommandPhase[] = ['reviewed', 'executing', 'confirmed', 'rejected-zero-write', 'partial', 'uncertain'];
function recordValue(value: unknown, scope: Scope): CommandRecord {
    // A corrupt/foreign record is never treated as an absent draft or replay permission.
    if (!object(value) || (value.reason !== undefined && !text(value.reason)) || value.schema !== 1 || commandJson(value.scope) !== commandJson(scope)
        || !phases.includes(value.phase as CommandPhase) || (!Number.isSafeInteger(value.contextRevision) || (value.contextRevision as number) < 0)
        || !token(value.reviewSession)
        || typeof value.contextDigest !== 'string' || !/^[a-f0-9]{64}$/.test(value.contextDigest)
        || typeof value.digest !== 'string' || !/^[a-f0-9]{64}$/.test(value.digest))
        throw new SdkError('not_ready', 'Command journal is corrupt or unavailable; inspection required');
    const plan = planValue(value.plan as CommandPlan);
    if (hash(plan) !== value.digest || !Array.isArray(value.steps) || value.steps.length !== plan.steps.length)
        throw new SdkError('not_ready', 'Command journal plan mismatch; inspection required');
    const states = value.steps as StepState[];
    for (let i = 0; i < states.length; i++) {
        const step = states[i], expected = plan.steps[i];
        if (!object(step) || Object.keys(step).some(key => !['id', 'kind', 'summary', 'state', 'receipt'].includes(key)) || step.id !== expected.id || step.kind !== expected.kind || step.summary !== expected.summary
            || !['planned', 'dispatching', 'acknowledged', 'confirmed', 'unknown'].includes(step.state)
            || (['acknowledged', 'confirmed'].includes(step.state) && !step.receipt)
            || (['planned', 'dispatching'].includes(step.state) && step.receipt !== undefined))
            throw new SdkError('not_ready', 'Command journal step mismatch; inspection required');
        if (step.receipt) receiptValue(step.receipt);
    }
    if (value.phase === 'reviewed' && states.some(step => step.state !== 'planned')
        || value.phase === 'confirmed' && states.some(step => step.state !== 'confirmed')
        || value.phase === 'rejected-zero-write' && states.some(step => step.receipt || !['planned', 'dispatching'].includes(step.state)))
        throw new SdkError('not_ready', 'Command journal outcome mismatch; inspection required');
    return copy(value as unknown as CommandRecord);
}

/** One module-process coordinator: promises serialize Actors, not world data or native clients.
 * Local operation records retain receipts on storage failure; durable executing records fence
 * after restart. No automatic resume/replay/reconciliation or cross-process atomicity promise. */
export class CommandJournal {
    private readonly reviewSession = randomUUID();
    private queues = new Map<string, Promise<void>>();
    private active = new Set<string>();
    private fences = new Map<string, CommandRecord>();
    private async serial<T>(key: string, run: () => Promise<T>): Promise<T> {
        const previous = this.queues.get(key) ?? Promise.resolve();
        const work = previous.then(run);
        const tail = work.then(() => {}, () => {});
        this.queues.set(key, tail);
        try { return await work; }
        finally { if (this.queues.get(key) === tail) this.queues.delete(key); }
    }
    private binding(req: ModuleServerRequest, actor: string, operation: string) {
        const caller = req.getAccessContext(), runtime = req.runtime;
        if (!token(actor) || !token(operation) || !text(caller.userId) || caller.moduleId !== runtime.moduleId || !text(runtime.moduleId))
            throw new SdkError('validation', 'Invalid command identity');
        if (!runtime.world) throw new SdkError('not_ready', 'Command world context unavailable');
        const identity = runtime.world.snapshot().identity;
        if (!text(identity.instanceId) || !text(identity.worldId) || !Number.isSafeInteger(identity.contextRevision))
            throw new SdkError('not_ready', 'Command world identity unavailable');
        const scope: Scope = { module: runtime.moduleId, instance: identity.instanceId, world: identity.worldId, caller: caller.userId, actor, operation };
        return { scope, key: 'command-v1-' + hash(scope), actorKey: hash({ module: scope.module, instance: scope.instance, world: scope.world, actor }), identity };
    }
    private async owner(req: ModuleServerRequest, actor: string) {
        const source = await req.runtime.documents.get('Actor', actor, { minOwnership: 'owner' });
        if (!source || source._id !== actor)
            throw new SdkError('permission_denied', 'Current Actor ownership required');
    }
    private async persist(req: ModuleServerRequest, key: string, row: CommandRecord) {
        const value = copy(row);
        await req.runtime.dataStore.set(key, value);
        const saved = await req.runtime.dataStore.get(key);
        if (journalJson(saved) !== journalJson(value)) throw new SdkError('not_ready', 'Command journal readback failed');
    }
    private async load(req: ModuleServerRequest, key: string, scope: Scope): Promise<CommandRecord | null> {
        const local = this.fences.get(key);
        if (local) return copy(local);
        const value = await req.runtime.dataStore.get(key);
        if (value === null) return null;
        let row: CommandRecord;
        try { row = recordValue(value, scope); }
        catch { throw new SdkError('not_ready', 'Command journal is corrupt or unavailable; inspection required'); }
        if (row.phase === 'reviewed' && row.reviewSession !== this.reviewSession) {
            // A zero-write retirement may have failed to persist before process loss.
            // No reviewed capability from a prior process is executable. Draft resume
            // is separate and must obtain fresh review with a fresh operation ID.
            row.phase = 'rejected-zero-write'; row.reason = 'Review belongs to a previous process; fresh intent required';
            this.fences.set(key, copy(row));
            try { await this.persist(req, key, row); } catch { /* prior-session guard remains on disk */ }
        }
        if (row.phase === 'executing' && !this.active.has(key)) {
            row.phase = row.steps.some(step => step.state === 'confirmed') ? 'partial' : 'uncertain';
            row.reason = 'Interrupted execution; inspect exact outcomes before any new intent';
            this.fences.set(key, copy(row));
            try { await this.persist(req, key, row); } catch { /* executing on disk still fences restart */ }
        }
        return row;
    }
    /** Read requires current ownership even for a previously authorized operation. */
    async status(req: ModuleServerRequest, actor: string, operation: string): Promise<CommandRecord | null> {
        const { scope, key } = this.binding(req, actor, operation);
        await this.owner(req, actor);
        return this.load(req, key, scope);
    }
    /** Only a server-derived plan is admissible; no source changes occur during review. */
    async review(req: ModuleServerRequest, actor: string, operation: string, input: CommandPlan): Promise<CommandRecord> {
        const plan = planValue(input), bound = this.binding(req, actor, operation);
        return this.serial(bound.actorKey, async () => {
            await this.owner(req, actor);
            const existing = await this.load(req, bound.key, bound.scope);
            if (existing) {
                if (existing.digest !== hash(plan)) throw new SdkError('conflict', 'Operation ID already binds another intent');
                return existing;
            }
            // Bind identity after queue admission, not the earlier request snapshot.
            const current = this.binding(req, actor, operation);
            const row: CommandRecord = { schema: 1, scope: bound.scope, digest: hash(plan), contextDigest: hash(current.identity),
                contextRevision: current.identity.contextRevision, reviewSession: this.reviewSession, plan, phase: 'reviewed', steps: plan.steps.map(step => ({ ...step, state: 'planned' })) };
            if (current.key !== bound.key) throw new SdkError('conflict', 'Command world changed');
            try { await this.persist(req, bound.key, row); }
            catch {
                row.phase = 'rejected-zero-write'; row.reason = 'Review persistence unavailable; use fresh intent';
                this.fences.set(bound.key, copy(row));
                try { await this.persist(req, bound.key, row); } catch { /* local fence retained */ }
                return copy(row);
            }
            return copy(row);
        });
    }
    async execute(req: ModuleServerRequest, actor: string, operation: string, input: CommandPlan, driver: CommandDriver): Promise<CommandRecord> {
        const plan = planValue(input), bound = this.binding(req, actor, operation);
        return this.serial(bound.actorKey, async () => {
            try { await this.owner(req, actor); }
            catch (cause) {
                // Retire this caller's old review without disclosing its contents after
                // ownership loss. Restoration must require a fresh operation ID.
                try {
                    const old = await this.load(req, bound.key, bound.scope);
                    if (old?.phase === 'reviewed') {
                        old.phase = 'rejected-zero-write'; old.reason = 'Ownership lost before dispatch; fresh review required';
                        this.fences.set(bound.key, copy(old));
                        try { await this.persist(req, bound.key, old); } catch { /* local fence retained */ }
                    }
                } catch { /* no journal data is returned to a denied caller */ }
                throw cause;
            }
            const row = await this.load(req, bound.key, bound.scope);
            if (!row) throw new SdkError('conflict', 'Current reviewed intent required');
            if (row.digest !== hash(plan)) throw new SdkError('conflict', 'Operation ID already binds another intent');
            if (row.phase !== 'reviewed') return row; // duplicate, terminal or interrupted: never replay
            this.active.add(bound.key);
            let invoked = false;
            const fence = async (reason: string): Promise<CommandRecord> => {
                row.phase = row.steps.some(step => step.state === 'confirmed') ? 'partial' : invoked ? 'uncertain' : 'rejected-zero-write';
                row.reason = reason;
                this.fences.set(bound.key, copy(row)); // retain exact receipts even when persistence fails
                try { await this.persist(req, bound.key, row); } catch { /* durable executing fence remains */ }
                return copy(row);
            };
            const validate = async () => {
                const reason = await driver.revalidate(copy(plan));
                if (reason) throw new Error(reason);
                await this.owner(req, actor);
                // Check synchronous context after all asynchronous domain/owner reads.
                // This narrows admission; it cannot make native writes atomic (E02).
                req.runtime.world!.assertRevision(row.contextRevision);
                const current = this.binding(req, actor, operation);
                if (current.key !== bound.key || hash(current.identity) !== row.contextDigest) throw new Error('Command context changed');
            };
            try {
                try { await validate(); } catch { return await fence('Current ownership, context, choices or source changed; fresh review required'); }
                row.phase = 'executing';
                try { await this.persist(req, bound.key, row); } catch { return await fence('Execution intent persistence unavailable; no dispatch'); }
                for (const step of row.steps) {
                    step.state = 'dispatching';
                    try { await this.persist(req, bound.key, row); } catch { return await fence('Step admission persistence unavailable'); }
                    try { await validate(); } catch { return await fence('Current ownership, context, choices or source changed before step'); }
                    invoked = true;
                    try {
                        const received = await driver.dispatch(copy(step));
                        // Retain valid identities before validating optional ancillary details.
                        step.receipt = receiptValue({ ids: received?.ids });
                        step.receipt = receiptValue(received); step.state = 'acknowledged';
                    }
                    catch { step.state = 'unknown'; return await fence('Step outcome unknown; inspect before any further write'); }
                    try { await this.persist(req, bound.key, row); } catch { return await fence('Acknowledgement retained; journal persistence unavailable'); }
                    try { if (!await driver.confirm(copy(step), copy(step.receipt))) return await fence('Acknowledged step confirmation unavailable'); }
                    catch { return await fence('Acknowledged step confirmation failed'); }
                    step.state = 'confirmed';
                    try { await this.persist(req, bound.key, row); } catch { return await fence('Confirmed step retained; journal persistence unavailable'); }
                }
                row.phase = 'confirmed';
                try { await this.persist(req, bound.key, row); } catch { return await fence('Mutation confirmed; final journal persistence unavailable'); }
                return copy(row);
            } finally { this.active.delete(bound.key); }
        });
    }
}
/** Shared by future request-bound domain handlers, never a privileged bootstrap runtime. */
export const commandJournal = new CommandJournal();
