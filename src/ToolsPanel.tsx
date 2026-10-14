import { useCallback, useEffect, useState } from 'react';
import { toolbarBtn } from './EditorLayout';
import { useI18n } from './i18n';

interface ToolInfo {
  id: string;
  label: string;
  installed: boolean;
}

interface Job {
  ids: string[];
  state: 'running' | 'done' | 'error';
  log: string[];
  error?: string;
}

interface Status {
  tools: ToolInfo[];
  formats: Record<string, string[]>;
  job: Job | null;
}

// Asks the backend (tools-installer.ts) which external tools a CLI-backed
// format needs and whether they are installed. If the endpoint is not there
// (e.g. a static deploy) nothing is reported missing and the panel stays hidden.
export function useTools(formatId: string) {
  const [status, setStatus] = useState<Status | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/tools/status');
      if (res.ok) setStatus(await res.json());
    } catch {
      // backend unavailable: leave the previous status
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const running = status?.job?.state === 'running';
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => void refresh(), 1500);
    return () => clearInterval(timer);
  }, [running, refresh]);

  const needed = status?.formats[formatId] ?? [];
  const missing = status ? status.tools.filter((tool) => needed.includes(tool.id) && !tool.installed) : [];
  const job = status?.job && status.job.ids.some((id) => needed.includes(id)) ? status.job : null;

  const install = async (ids: string[]) => {
    await fetch('/api/tools/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    await refresh();
  };

  return { missing, job, install };
}

export function ToolsPanel({ missing, job, onInstall }: { missing: ToolInfo[]; job: Job | null; onInstall: (ids: string[]) => void }) {
  const { t } = useI18n();
  const running = job?.state === 'running';
  const failed = job?.state === 'error';

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 text-zinc-300 space-y-4">
        <h2 className="text-sm font-mono-code font-bold uppercase tracking-wide text-teal-400">
          {running ? t.toolInstaller.installingTitle : failed ? t.toolInstaller.failedTitle : t.toolInstaller.missingTitle}
        </h2>
        <p className="text-sm text-zinc-400">
          {running ? t.toolInstaller.installingHint : t.toolInstaller.missingHint(missing.map((tool) => tool.label).join(', '))}
        </p>
        {failed && <pre className="text-xs text-red-400 whitespace-pre-wrap">{job?.error}</pre>}
        {job && job.log.length > 0 && (
          <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-zinc-500 whitespace-pre-wrap">
            {job.log.slice(-12).join('\n')}
          </pre>
        )}
        {!running && (
          <button className={toolbarBtn} onClick={() => onInstall(missing.map((tool) => tool.id))}>
            {failed ? t.toolInstaller.retryBtn : t.toolInstaller.installBtn}
          </button>
        )}
      </div>
    </div>
  );
}
