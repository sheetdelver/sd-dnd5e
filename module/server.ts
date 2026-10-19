import type { ModuleRouteTable } from '@sheet-delver/sdk/server';
import { contentRoutes } from '../src/server/routes/content';

/** Read-only M1 content routes. Rules-bearing writes will use the M3 journal. */
export const apiRoutes: ModuleRouteTable = { ...contentRoutes };
