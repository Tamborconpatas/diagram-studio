import { toolbarBtn } from './EditorLayout';

export function ExamplesMenu({
  examples,
  onSelect,
}: {
  examples: readonly { label: string; code: string }[];
  onSelect: (code: string) => void;
}) {
  return (
    <>
      {examples.map((ex) => (
        <button key={ex.label} className={toolbarBtn} onClick={() => onSelect(ex.code)}>
          {ex.label}
        </button>
      ))}
    </>
  );
}
