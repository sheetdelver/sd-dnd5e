import type { ModuleRouteTable } from '@sheet-delver/sdk/server';
import { contentRoutes } from '../src/server/routes/content';
import { commandRoutes } from '../src/server/routes/commands';

/** Read-only content and caller-owned operation inspection. No gameplay write routes yet. */
export const apiRoutes: ModuleRouteTable = { ...contentRoutes, ...commandRoutes };
