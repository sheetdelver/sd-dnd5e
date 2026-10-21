'use client';

import React from 'react';

import Skills from '../../blocks/Skills';
import Tools from '../../blocks/Tools';
import PassiveSenses from '../../blocks/PassiveSenses';
import {MovementDetails} from '../../shared/MovementFacts';
import {movementProjection} from '../../../../logic/preparation/movement';

interface Props {
    derived: Record<string, any>;
    onRoll?: (type: string, key: string, options?: Record<string, unknown>) => Promise<void>;
}

export default function SkillsTab({ derived, onRoll }: Props) {
    return <><Skills skills={derived.skills} onRoll={onRoll} /><Tools onRoll={onRoll} /><PassiveSenses perception={derived.passivePerception} investigation={derived.passiveInvestigation} insight={derived.passiveInsight} senses={derived.senses}/><div className="block-card"><h2 className="block-heading">Movement</h2><MovementDetails fact={movementProjection(derived)}/></div></>;
}
