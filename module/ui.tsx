import type { UIModuleManifest } from '@sheet-delver/sdk';
import info from '../info.json';

const uiManifest: UIModuleManifest = {
    info,
    sheet: () => import('../src/ui/DnD5eSheet'),
    actorPage: () => import('../src/ui/DnD5eActorPage'),
};

export default uiManifest;
