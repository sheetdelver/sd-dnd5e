import type { UIModuleManifest } from '@sheet-delver/sdk';
import info from '../info.json';

const uiManifest: UIModuleManifest = {
    info,
    sheet: () => import('../src/ui/Sheet'),
    actorPage: () => import('../src/ui/ActorPage'),
    stylesheet: 'assets/dnd5e.css',
};

export default uiManifest;
