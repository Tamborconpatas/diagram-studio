import { useState } from 'react';
import plantumlEncoder from 'plantuml-encoder';
import { EditorLayout, toolbarBtn, toolbarSelect } from '../EditorLayout';
import { ExportButtons } from '../ExportButtons';
import { OpenFileButton } from '../OpenFileButton';
import { downloadText } from '../export';

const THEMES = [
  '_none_', 'amiga', 'aws-orange', 'black-knight', 'bluegray', 'cerulean',
  'crt-amber', 'mars', 'materia', 'metal', 'mono', 'plain', 'sketchy', 'spacelab', 'vibrant',
] as const;

const DEFAULT_CODE = `@startuml
Alice -> Bob: Hola
Bob --> Alice: Respuesta
@enduml`;

// Force the classic UML stick-figure actor: some themes (and the public
// server's current default) swap it for a modern "avatar" icon otherwise.
function withTheme(code: string, theme: string) {
  const themeLine = theme === '_none_' ? '' : `\n!theme ${theme}`;
  return code.replace(/^@startuml.*$/m, (line) => `${line}${themeLine}\nskinparam actorStyle stick`);
}

function toUrl(text: string, theme: string) {
  return `https://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(withTheme(text, theme))}`;
}

export default function PlantUmlEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('_none_');
  const [src, setSrc] = useState(() => toUrl(DEFAULT_CODE, '_none_'));
  const [error, setError] = useState<string | null>(null);

  const getSvg = async () => {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`No se pudo obtener el SVG (${res.status})`);
    return res.text();
  };

  return (
    <EditorLayout
      toolbar={
        <>
          <OpenFileButton
            accept=".puml,.pu,.plantuml,.txt"
            label="Abrir .puml"
            onOpen={(text) => {
              setCode(text);
              setSrc(toUrl(text, theme));
            }}
          />
          <button className={toolbarBtn} onClick={() => setSrc(toUrl(code, theme))}>Renderizar</button>
          <select
            className={toolbarSelect}
            value={theme}
            onChange={(e) => {
              const t = e.target.value as (typeof THEMES)[number];
              setTheme(t);
              setSrc(toUrl(code, t));
            }}
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>{t === '_none_' ? 'sin tema' : t}</option>
            ))}
          </select>
          <button className={toolbarBtn} onClick={() => downloadText(code, 'diagrama.puml')}>
            Descargar .puml
          </button>
          <ExportButtons filename="diagrama-plantuml" getSvg={getSvg} />
        </>
      }
      error={error}
      code={code}
      onCodeChange={setCode}
      renderArea={
        <div className="w-full h-full flex items-center justify-center overflow-auto p-6">
          <img
            src={src}
            alt="Diagrama PlantUML"
            className="max-w-none"
            onError={() => setError('No se pudo renderizar el diagrama (servidor PlantUML público, requiere internet)')}
            onLoad={() => setError(null)}
          />
        </div>
      }
    />
  );
}
