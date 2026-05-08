'use client';

import React from 'react';
import type { FoundryItem } from '@sheet-delver/sdk';
import StandardInventory from '../standard/Inventory';

interface Props {
    gear: FoundryItem[];
}

export default function Inventory(props: Props) {
    return <StandardInventory {...props} />;
}
