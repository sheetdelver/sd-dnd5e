import type { ModuleInfo, UIModuleManifest } from '@sheet-delver/sdk';
import infoJson from '../info.json';

const info = infoJson as ModuleInfo;

// No `actorPage`: the platform hosts the presentational `Sheet` in the default actor
// page via createActorPage (ADR-0027 decision 16). The host supplies load/roll/update
// (rollMode + speaker defaults) and shared-content; the module ships only the visual sheet.
const uiManifest: UIModuleManifest = {
    info,
    sheet: () => import('../src/ui/Sheet'),
    stylesheet: 'assets/dnd5e.css',
};

export default uiManifest;
