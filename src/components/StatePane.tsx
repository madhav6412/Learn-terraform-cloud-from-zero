import React, { useState } from 'react';
import { TerraformState } from '../types/terraform';
import { Copy, Check, Database, RefreshCw, FileText } from 'lucide-react';

interface StatePaneProps {
  state: TerraformState;
}

export const StatePane: React.FC<StatePaneProps> = ({ state }) => {
  const [copied, setCopied] = useState(false);
  const [filterTerm, setFilterTerm] = useState('');

  const jsonString = JSON.stringify(state, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStateEmpty = state.resources.length === 0;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200">
      {/* State Header Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Database className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-white">terraform.tfstate</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Backend: <span className="text-slate-200">local</span></span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[11px] tabular-nums">
            <span>Serial: <span className="text-sky-300 font-medium">{state.serial}</span></span>
            <span>·</span>
            <span>Resources: <span className="text-emerald-300 font-medium">{state.resources.length}</span></span>
            <span>·</span>
            <span>Outputs: <span className="text-amber-300 font-medium">{Object.keys(state.outputs).length}</span></span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied JSON</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy State JSON</span>
            </>
          )}
        </button>
      </div>

      {isStateEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200 mb-1">State File is Empty</h4>
          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            No infrastructure is currently recorded in your local state. Run <code className="text-sky-400 font-mono">terraform apply</code> in the terminal to provision resources into state.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 font-mono text-xs select-text">
          <pre className="text-slate-300 whitespace-pre leading-relaxed">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
};
