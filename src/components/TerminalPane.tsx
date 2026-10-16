import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Trash2,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CommandLog } from '../types/terraform';

interface TerminalPaneProps {
  logs: CommandLog[];
  isExecuting: boolean;
  onExecuteCommand: (command: string) => void;
  onClearLogs: () => void;
  onOpenK9s?: () => void;
  onOpenGraph?: () => void;
  onAskAI?: (prompt?: string) => void;
  suggestedNextCommand?: string;
  suggestedNextLabel?: string;
}

export const TerminalPane: React.FC<TerminalPaneProps> = ({
  logs,
  isExecuting,
  onExecuteCommand,
  onClearLogs,
  onOpenK9s,
  onOpenGraph,
  onAskAI,
  suggestedNextCommand,
  suggestedNextLabel
}) => {
  const [inputCommand, setInputCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'terraform init',
    'terraform plan',
    'terraform apply -auto-approve',
    'terraform state list',
    'kubectl get pods -A',
    'k9s'
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputCommand.trim();
    if (!cmd || isExecuting) return;

    if (cmd.toLowerCase() === 'clear') {
      onClearLogs();
      setInputCommand('');
      return;
    }

    if (cmd.toLowerCase() === 'k9s') {
      if (onOpenK9s) {
        onOpenK9s();
      }
      onExecuteCommand('k9s');
      setInputCommand('');
      return;
    }

    setCommandHistory(prev => [...prev.filter(c => c !== cmd), cmd]);
    setHistoryIndex(-1);
    onExecuteCommand(cmd);
    setInputCommand('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputCommand(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputCommand('');
      } else {
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocompletion
      const suggestions = [
        'terraform init',
        'terraform plan',
        'terraform apply -auto-approve',
        'terraform state list',
        'terraform state show',
        'terraform validate',
        'terraform fmt',
        'terraform destroy -auto-approve',
        'kubectl get pods',
        'kubectl get nodes',
        'kubectl describe pod',
        'k9s'
      ];
      const match = suggestions.find(s => s.startsWith(inputCommand.toLowerCase()));
      if (match) {
        setInputCommand(match);
      }
    }
  };

  const formatLogOutput = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let colorClass = 'text-slate-300';
      if (line.includes('[SUCCESS]') || line.includes('Apply complete!') || line.includes('Success!') || line.includes('PASS')) {
        colorClass = 'text-emerald-400 font-semibold';
      } else if (line.includes('[ERROR]') || line.includes('Error:') || line.includes('FAILED') || line.includes('CrashLoopBackOff')) {
        colorClass = 'text-rose-400 font-medium';
      } else if (line.includes('[WARN]') || line.includes('Warning:')) {
        colorClass = 'text-amber-400';
      } else if (line.startsWith('+') || line.includes('will be created')) {
        colorClass = 'text-emerald-300';
      } else if (line.startsWith('~') || line.includes('will be updated in-place')) {
        colorClass = 'text-amber-300';
      } else if (line.startsWith('-') || line.includes('will be destroyed')) {
        colorClass = 'text-rose-400';
      } else if (line.startsWith('#') || line.startsWith('//')) {
        colorClass = 'text-slate-500 italic';
      }

      return (
        <div key={idx} className={`leading-relaxed ${colorClass}`}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#080d14] border-t border-slate-800 text-slate-200 font-mono text-xs select-text">
      {/* Terminal Top Control Bar */}
      <div className="h-9 px-3 bg-[#0d1421] border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
            Interactive HCL & K8s Terminal
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            (HCL2 Engine · LocalStack · kubectl · k9s)
          </span>
        </div>

        {/* Quick Action Commands */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[50%]">
          <button
            onClick={() => onExecuteCommand('terraform init')}
            disabled={isExecuting}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer"
          >
            init
          </button>
          <button
            onClick={() => onExecuteCommand('terraform plan')}
            disabled={isExecuting}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer"
          >
            plan
          </button>
          <button
            onClick={() => onExecuteCommand('terraform apply -auto-approve')}
            disabled={isExecuting}
            className="px-2 py-0.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer font-semibold"
          >
            apply
          </button>
          <button
            onClick={() => onExecuteCommand('terraform state list')}
            disabled={isExecuting}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer"
          >
            state list
          </button>
          {onOpenK9s && (
            <button
              onClick={onOpenK9s}
              title="Launch K9s Terminal UI"
              className="px-2 py-0.5 bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 border border-blue-700/50 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer font-bold flex items-center gap-1"
            >
              <span>k9s</span>
            </button>
          )}
          {onOpenGraph && (
            <button
              onClick={onOpenGraph}
              title="Open D3.js Resource Dependency Graph"
              className="px-2 py-0.5 bg-sky-950/60 hover:bg-sky-900/70 text-sky-300 border border-sky-700/50 rounded text-[11px] transition-colors whitespace-nowrap cursor-pointer font-semibold flex items-center gap-1"
            >
              <span>D3 Graph</span>
            </button>
          )}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {onAskAI && (
            <button
              onClick={() => onAskAI('Explain this terminal output and help me debug any issues')}
              title="Ask AI to analyze and troubleshoot output"
              className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 px-2 py-0.5 bg-purple-950/40 border border-purple-800/40 rounded transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Ask AI Debug</span>
            </button>
          )}

          <button
            onClick={onClearLogs}
            title="Clear terminal output"
            className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-[11.5px] leading-relaxed select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 py-4 flex flex-col gap-1">
            <div className="text-sky-400 font-semibold flex items-center gap-1.5">
              <span>●</span> Zero-Cloud Sandbox Terminal Ready (Owner: Madhav Gupta)
            </div>
            <div>Type any command below or use quick action buttons.</div>
            <div className="text-slate-600 mt-2">
              Try: <code className="text-slate-400">terraform init</code>, <code className="text-slate-400">terraform plan</code>, <code className="text-slate-400">terraform apply -auto-approve</code>, <code className="text-slate-400">kubectl get pods</code>, or <code className="text-sky-300 font-bold">k9s</code>
            </div>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="text-emerald-500 font-bold">$</span>
                <span className="text-sky-300 font-bold">{log.command}</span>
                <span className="text-slate-600 text-[10px] ml-auto">{log.timestamp}</span>
              </div>
              <div className="pl-3 border-l-2 border-slate-800/80 py-0.5">
                {formatLogOutput(log.output)}
              </div>
            </div>
          ))
        )}

        {isExecuting && (
          <div className="flex items-center gap-2 text-amber-400 pl-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Executing command against zero-cost HCL2 engine...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Contextual Next Step Quick Hint Bar */}
      {suggestedNextCommand && !isExecuting && (
        <div className="px-3 py-1.5 bg-[#0e1626] border-t border-sky-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-amber-400 font-bold">👉 Next:</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {suggestedNextLabel || 'Recommended command:'}
            </span>
            <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 font-mono text-[11px] font-bold">
              {suggestedNextCommand}
            </code>
          </div>
          <button
            type="button"
            onClick={() => onExecuteCommand(suggestedNextCommand)}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-bold shadow-sm cursor-pointer transition-colors"
          >
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Run</span>
          </button>
        </div>
      )}

      {/* Interactive Command Prompt Form */}
      <form
        onSubmit={handleSubmit}
        className="h-9 px-3 bg-[#0a0f18] border-t border-slate-800/80 flex items-center gap-2 shrink-0"
      >
        <span className="text-emerald-400 font-bold text-sm">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. terraform plan, terraform apply, kubectl get pods, k9s)..."
          disabled={isExecuting}
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 text-xs font-mono outline-none border-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={!inputCommand.trim() || isExecuting}
          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded text-[11px] font-sans font-semibold transition-all cursor-pointer"
        >
          Run
        </button>
      </form>
    </div>
  );
};
