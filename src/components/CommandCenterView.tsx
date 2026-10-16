import React, { useState } from 'react';
import { TERRAFORM_COMMANDS, TerraformCommandItem } from '../data/terraformCommands';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Search,
  BookOpen,
  Filter,
  Layers,
  ShieldAlert,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';

interface CommandCenterViewProps {
  onExecuteCommand: (command: string) => void;
  onAskAI?: (prompt: string) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  onExecuteCommand,
  onAskAI
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCommand, setSelectedCommand] = useState<TerraformCommandItem>(TERRAFORM_COMMANDS[0]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredCommands = TERRAFORM_COMMANDS.filter(cmd => {
    const matchesCat = selectedCategory === 'all' || cmd.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || cmd.level === selectedLevel;
    const matchesSearch =
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.shortSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.interviewGotcha.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesLevel && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40';
      case 'Intermediate':
        return 'text-sky-400 border-sky-800/60 bg-sky-950/40';
      case 'Advanced':
        return 'text-amber-400 border-amber-800/60 bg-amber-950/40';
      case 'Expert':
        return 'text-rose-400 border-rose-800/60 bg-rose-950/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Top Filter Bar */}
      <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Terraform Command Center & Zero-to-Hero Cheat Sheet</span>
              <span className="text-[11px] font-mono text-slate-500">·</span>
              <span className="text-[11px] font-mono text-sky-400">Beginner → Advanced</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive reference, CLI flags, execution engine, and Senior DevOps interview traps
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search commands, flags, gotchas..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Category Pills & Level Filter */}
      <div className="px-6 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Commands' },
            { id: 'workflow', label: 'Core Workflow' },
            { id: 'state', label: 'State Surgery & Refactoring' },
            { id: 'inspect', label: 'Inspection & DAG Graph' },
            { id: 'workspace', label: 'Workspaces' },
            { id: 'testing', label: 'Native Testing (.tftest)' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">Level:</span>
          {['all', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-sky-950 text-sky-300 border border-sky-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl === 'all' ? 'All' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List of Commands */}
        <div className="w-80 border-r border-slate-800 overflow-y-auto p-3 space-y-1.5 bg-slate-900/40">
          <div className="text-[11px] font-mono text-slate-500 px-2 py-1 uppercase tracking-wider">
            Matching Commands ({filteredCommands.length})
          </div>

          {filteredCommands.map(cmd => {
            const isSelected = selectedCommand.name === cmd.name;
            return (
              <div
                key={cmd.name}
                onClick={() => setSelectedCommand(cmd)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500/50 shadow-md text-white'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    {cmd.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${getLevelBadgeClass(cmd.level)}`}>
                    {cmd.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {cmd.shortSummary}
                </p>
              </div>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-xs">
              No commands found matching "{searchQuery}".
            </div>
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
          {selectedCommand ? (
            <div className="max-w-4xl space-y-6">
              {/* Command Title & Actions Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xl font-bold text-white">
                      {selectedCommand.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-mono ${getLevelBadgeClass(selectedCommand.level)}`}>
                      {selectedCommand.level}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Category: {selectedCommand.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedCommand.shortSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onExecuteCommand(selectedCommand.runnableCommand)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                    title={`Run "${selectedCommand.runnableCommand}" in terminal`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run in Sandbox Terminal</span>
                  </button>

                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`Explain how to use ${selectedCommand.name} in high-scale production systems and what mistakes junior DevOps engineers make with it.`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Ask AI Deep-Dive</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Syntax & Runnable Code Box */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Command Syntax & Practical Example
                </h4>
                <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden font-mono text-xs">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-slate-400">
                    <span className="text-[11px] text-sky-400">CLI Usage</span>
                    <button
                      onClick={() => handleCopy(selectedCommand.command, 'syntax')}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCmd === 'syntax' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Syntax</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3.5 text-amber-300 select-all overflow-x-auto">
                    <code>{selectedCommand.command}</code>
                  </pre>
                  <div className="px-3.5 py-2.5 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 mr-2">Example:</span>
                      <code className="text-sky-300">{selectedCommand.exampleUsage}</code>
                    </div>
                    <button
                      onClick={() => onExecuteCommand(selectedCommand.exampleUsage)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer underline"
                    >
                      Try this
                    </button>
                  </div>
                </div>
              </div>

              {/* Deep Architectural Explanation */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Under the Hood
                </h4>
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>{selectedCommand.description}</p>
                </div>
              </div>

              {/* Common Flags Table */}
              {selectedCommand.commonFlags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Essential Production Flags
                  </h4>
                  <div className="rounded-lg border border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                          <th className="py-2.5 px-4 font-semibold w-64">Flag / Argument</th>
                          <th className="py-2.5 px-4 font-semibold">Purpose & Production Application</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {selectedCommand.commonFlags.map((f, i) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="py-2 px-4 font-mono text-sky-400 text-xs">
                              {f.flag}
                            </td>
                            <td className="py-2 px-4 text-slate-300 text-xs">
                              {f.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Interview Gotcha & Trap */}
              <div>
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Senior & Staff DevOps Interview Gotcha</span>
                </h4>
                <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/50 text-xs text-amber-200/90 leading-relaxed">
                  <p>{selectedCommand.interviewGotcha}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">Select a command to view details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
