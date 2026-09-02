// Newer mermaid (11.13+) prefixes every rendered SVG element's id with its
// own render id (e.g. "mermaid-diagram-2-entity-Foo-0"), but
// @excalidraw/mermaid-to-excalidraw@2.2.2 (built against mermaid ^11.12.1,
// no newer release exists) looks elements up by their *exact* original id
// ("entity-Foo-0"), so ER/state diagrams fail with
// "entity ... not found in rendered SVG" and silently fall back to a flat
// image. Patch querySelector to fall back to a suffix match, scoped to the
// duration of the call.
export async function withMermaidIdCompat<T>(fn: () => Promise<T>): Promise<T> {
  const original = Element.prototype.querySelector;
  Element.prototype.querySelector = function (this: Element, selectors: string) {
    const direct = original.call(this, selectors);
    if (direct) return direct;
    if (!/\[id="[^"]+"\]/.test(selectors)) return direct;
    const suffixSelector = selectors.replace(/\[id="([^"]+)"\]/, (_, id) => `[id$="-${id}"]`);
    return original.call(this, suffixSelector);
  } as typeof Element.prototype.querySelector;

  try {
    return await fn();
  } finally {
    Element.prototype.querySelector = original;
  }
}
