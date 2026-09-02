declare module 'bpmn-auto-layout' {
  export function layoutProcess(xml: string): Promise<string>;
}

declare module 'plantuml-encoder' {
  export function encode(text: string): string;
  export function decode(encoded: string): string;
}
