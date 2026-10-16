import React, { useState } from 'react';
import { LabScenario } from '../types/terraform';
import { Download, X, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface LocalRunGuideModalProps {
  scenario: LabScenario;
  onClose: () => void;
}

export const LocalRunGuideModal: React.FC<LocalRunGuideModalProps> = ({ scenario, onClose }) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCompose, setCopiedCompose] = useState(false);

  const guide = scenario.localRunGuide;

  const copyText = (text: string, type: 'script' | 'compose') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedCompose(true);
      setTimeout(() => setCopiedCompose(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-text">
      <div className="w-full max-w-2xl bg-[#0c121e] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="h-14 px-5 bg-[#090d16] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-sky-400" />
            <div>
              <div className="font-bold text-sm text-white">Local Run Guide ($0.00 Cloud Cost)</div>
              <div className="text-[11px] text-slate-400 truncate max-w-sm">For {scenario.title}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          <div>
            <div className="font-semibold text-slate-200 mb-1.5 uppercase text-[11px]">Prerequisites</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              {guide.prerequisites.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {guide.dockerCompose && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-200 uppercase text-[11px]">docker-compose.yml</span>
                <button
                  onClick={() => copyText(guide.dockerCompose!, 'compose')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedCompose ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCompose ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-sky-300 overflow-x-auto">
                {guide.dockerCompose}
              </pre>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200 uppercase text-[11px]">Execution Script</span>
              <button
                onClick={() => copyText(guide.runScript.join('\n'), 'script')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScript ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-400 space-y-1">
              {guide.runScript.map((cmd, i) => (
                <div key={i}>$ {cmd}</div>
              ))}
            </div>
          </div>

          {guide.notes && (
            <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-lg text-slate-300 text-xs">
              <strong>Notes:</strong> {guide.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
