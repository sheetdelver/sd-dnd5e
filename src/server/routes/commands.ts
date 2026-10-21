import { isSdkError } from '@sheet-delver/sdk';
import { error, json, type ModuleRouteTable } from '@sheet-delver/sdk/server';
import { commandJournal } from '../commands/journal';

/** Inspection only. Domain review/execute routes remain gated by their own rules
 * and Q02 outcome qualification; there is no generic client-supplied write API. */
export const commandRoutes: ModuleRouteTable = {
    'commands/status': async req => {
        if (req.method !== 'GET') return error('validation', 'GET required', 405);
        try {
            const query = new URL(req.url, 'https://module.invalid').searchParams;
            if (query.getAll('actorId').length !== 1 || query.getAll('operationId').length !== 1
                || [...query.keys()].some(key => !['actorId', 'operationId'].includes(key)))
                return error('validation', 'Exact Actor and operation identities required');
            return json({ operation: await commandJournal.status(req, query.get('actorId')!, query.get('operationId')!) });
        } catch (cause) {
            return isSdkError(cause) ? error(cause.code, cause.message, cause.status) : error('internal', 'Command status unavailable');
        }
    },
};
