import type { ModuleRouteTable } from '@sheet-delver/sdk/server';
import { contentRoutes } from '../src/server/routes/content';
import { commandRoutes } from '../src/server/routes/commands';
import {healthRoutes} from '../src/server/routes/health';

/** Caller-bound content, journal inspection and bounded reviewed health edits. */
export const apiRoutes: ModuleRouteTable = { ...contentRoutes, ...commandRoutes,...healthRoutes };
