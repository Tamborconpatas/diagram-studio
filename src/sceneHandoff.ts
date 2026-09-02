import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';
import type { BinaryFiles } from '@excalidraw/excalidraw/types';

// A diagram converted (e.g. from Mermaid) into an editable Excalidraw scene,
// handed off from one editor tab to the Excalidraw tab.
export type PendingScene = { elements: ExcalidrawElementSkeleton[]; files?: BinaryFiles; warning?: string };
