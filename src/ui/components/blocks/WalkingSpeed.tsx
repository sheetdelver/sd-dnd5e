'use client';

import React from 'react';
import {useSheet} from '../shared/SheetContext';
import {movementProjection} from '../../../logic/preparation/movement';
import {WalkingSpeedReadout,MovementDetails} from '../shared/MovementFacts';

interface Props {
    walk?: number;
}

export default function WalkingSpeed({ walk:_walk }: Props) {
    const {actor}=useSheet(),fact=movementProjection(actor?.derived??{});
    return (
        <div className="block-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                <WalkingSpeedReadout fact={fact}/>
            </div>
            <div className="block-heading" style={{ marginBottom: 0 }}>Walking Speed</div>
            <MovementDetails fact={fact}/>
        </div>
    );
}
