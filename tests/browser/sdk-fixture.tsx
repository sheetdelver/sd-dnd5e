/** Test-only public SDK presentation seam. No host/native connection. */
import React from 'react';
export const SDKContext=React.createContext<any>(null);
export function resolveImage(path: string) { return path || '/placeholder.png'; }
export function useSDKComponents(): never { throw new Error('Shared host editor is outside this isolated skill fixture'); }
// Presentation seam only. Fixture descriptions are inert; security/sanitization
// acceptance belongs to the real public SDK, never this identity collaborator.
export function processHtmlContent(html:string){return html;}
