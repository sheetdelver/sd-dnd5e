import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { PreparedActorData } from '@sheet-delver/sdk';
import Sheet from '../../src/ui/Sheet';
import Skills from '../../src/ui/components/blocks/Skills';
import { SheetProvider } from '../../src/ui/components/shared/SheetContext';
import { ModalProvider, useModal } from '../../src/ui/components/shared/useModal';
import ModalHost from '../../src/ui/components/shared/ModalHost';

type Confirm = (options: Record<string, unknown>) => Promise<void>;
interface Fixture {
    render(actor: PreparedActorData, probe?: boolean): void;
    calls: Array<{ type: string; key: string; options: unknown }>;
    hold(): void;
    submitHeld(): Promise<string>;
}
declare global { interface Window { skillFixture: Fixture } }
const root = createRoot(document.getElementById('root')!);
let held: Confirm | undefined, current: Confirm | undefined;
const fixture: Fixture = {
    calls: [],
    hold() { held = current; if (!held) throw new Error('No open intent'); },
    async submitHeld() { try { if (!held) throw new Error('No held intent'); await held({ advantage: 'normal' }); return 'dispatched'; } catch { return 'retired'; } },
    render(actor, probe = false) {
        const onRoll = async (type: string, key: string, options?: Record<string, unknown>) => { fixture.calls.push({ type, key, options }); };
        flushSync(() => root.render(probe ? <SheetProvider actor={actor}><ModalProvider>
            <Skills skills={actor.derived.skills as any} onRoll={onRoll} /><Probe /><ModalHost />
        </ModalProvider></SheetProvider> : <Sheet actor={actor} onRoll={onRoll} onUpdate={async () => {}} isOwner />));
    },
};
function Probe() {
    const { activeProps } = useModal();
    current = activeProps.onConfirm as Confirm | undefined;
    return null;
}
window.skillFixture = fixture;
