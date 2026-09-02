import { toolbarBtn } from './EditorLayout';
import { openTextFile } from './export';

export function OpenFileButton({ accept, label, onOpen }: { accept: string; label: string; onOpen: (text: string) => void }) {
  return (
    <button
      className={toolbarBtn}
      onClick={async () => {
        try {
          const text = await openTextFile(accept);
          onOpen(text);
        } catch {
          // user closed the file picker without choosing a file
        }
      }}
    >
      {label}
    </button>
  );
}
