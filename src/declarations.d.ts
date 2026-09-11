declare module 'bpmn-auto-layout' {
  export function layoutProcess(xml: string): Promise<string>;
}

declare module 'plantuml-encoder' {
  export function encode(text: string): string;
  export function decode(encoded: string): string;
}

declare module 'wavedrom' {
  export function renderAny(index: number, source: unknown, skin: unknown): unknown;
  export const waveSkin: unknown;
}

declare module 'onml' {
  export function stringify(tree: unknown, indent?: string): string;
}
