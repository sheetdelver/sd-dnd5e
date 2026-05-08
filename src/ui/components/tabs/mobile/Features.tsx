'use client';

import React from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import StandardFeatures from '../standard/Features';

interface Props {
    features: FoundryItem[];
}

export default function Features(props: Props) {
    return <StandardFeatures {...props} />;
}
