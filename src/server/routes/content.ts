import { isSdkError } from '@sheet-delver/sdk';
import { error, json, type ModuleRouteHandler } from '@sheet-delver/sdk/server';
import { callerCatalog, callerItemDetail } from '../content/catalog';

function readRoute(run: (req: Parameters<ModuleRouteHandler>[0], url: URL) => Promise<unknown>): ModuleRouteHandler {
    return async req => {
        if (req.method !== 'GET') return error('validation', 'GET required', 405);
        try { return json(await run(req, new URL(req.url, 'https://module.invalid'))); }
        catch (cause) { return isSdkError(cause) ? error(cause.code, cause.message, cause.status) : error('internal', 'Content unavailable'); }
    };
}
export const contentRoutes = {
    content: readRoute((req, url) => callerCatalog(req.runtime, {
        page: url.searchParams.has('page') ? Number(url.searchParams.get('page')) : undefined,
        pageSize: url.searchParams.has('pageSize') ? Number(url.searchParams.get('pageSize')) : undefined,
        packId: url.searchParams.get('packId') ?? undefined,
    })),
    'content/detail': readRoute((req, url) => callerItemDetail(req.runtime, url.searchParams.get('uuid') ?? '')),
};
