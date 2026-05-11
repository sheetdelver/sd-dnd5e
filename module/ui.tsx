import type { ModuleInfo, UIModuleManifest } from '@sheet-delver/sdk';
import infoJson from '../info.json';

const info = infoJson as ModuleInfo;

const uiManifest: UIModuleManifest = {
    info,
    sheet: () => import('../src/ui/Sheet'),
    actorPage: () => import('../src/ui/ActorPage'),
    stylesheet: 'assets/dnd5e.css',
};

export default uiManifest;
