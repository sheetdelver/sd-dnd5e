/** Test-only public SDK presentation seam. No host/native connection. */
export function resolveImage(path: string) { return path || '/placeholder.png'; }
export function useSDKComponents(): never { throw new Error('Shared host editor is outside this isolated skill fixture'); }
