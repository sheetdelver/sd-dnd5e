import React from 'react';
import { UIModuleManifest } from '@modules/registry/types';
import info from '../info.json';

const uiManifest: UIModuleManifest = {
    info,
    sheet: () => import('@client/ui/components/GenericSheet'),
    actorPage: () => import('@client/ui/pages/GenericActorPage'),
};

export default uiManifest;
