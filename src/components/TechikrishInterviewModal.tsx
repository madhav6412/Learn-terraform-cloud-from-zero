import React, { useState } from 'react';
import { TECHIKRISH_SCENARIOS, TechikrishScenario } from '../data/techikrishScenarios';
import {
  Award,
  X,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  FileCode,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface TechikrishInterviewModalProps {
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
  onLoadCodeToWorkspace?: (filename: string, code: string) => void;
}

export const TechikrishInterviewModal: React.FC<TechikrishInterviewModalProps> = ({
  onClose,
  onAskAI,
  onLoadCodeToWorkspace
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'kubernetes' | 'terraform'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<TechikrishScenario>(TECHIKRISH_SCENARIOS[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredScenarios = TECHIKRISH_SCENARIOS.filter(s => {
    const categoryMatch = filterCategory === 'all' || s.category === filterCategory;
    const queryMatch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rootCause.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && queryMatch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-text">
      <div className="w-full max-w-6xl h-[90vh] bg-[#0c121e] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 px-5 bg-[#090d16] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Techikrish DevOps & Cloud Interview Scenarios</span>
                <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  Kubernetes & Terraform
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Staff-level incidents & remediation bank · Curated by <span className="text-sky-400 font-medium">Madhav Gupta</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Techikrish/devops-cloud-interview-scenarios"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filterCategory === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Scenarios ({TECHIKRISH_SCENARIOS.length})
            </button>
            <button
              onClick={() => setFilterCategory('kubernetes')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filterCategory === 'kubernetes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kubernetes Incidents
            </button>
            <button
              onClick={() => setFilterCategory('terraform')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filterCategory === 'terraform' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terraform Incidents
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by symptom or keyword..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Scenario List */}
          <div className="w-80 md:w-96 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-[#0a0f19]">
            {filteredScenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedScenario.id === sc.id
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      sc.category === 'kubernetes'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {sc.category} #{sc.number}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="font-semibold text-xs text-slate-200 line-clamp-1">{sc.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{sc.symptom}</div>
              </div>
            ))}
          </div>

          {/* Right Column: Deep Incident Breakdown */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0c121e]">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                    selectedScenario.category === 'kubernetes'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {selectedScenario.category} Scenario #{selectedScenario.number}
                </span>
                <span className="text-xs text-slate-400">Owner & Curator: Madhav Gupta</span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedScenario.title}</h2>
            </div>

            {/* Core Interview Question */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Interviewer Question</span>
              </div>
              <div className="text-sm font-medium text-slate-100 italic">
                "{selectedScenario.interviewQuestion}"
              </div>
            </div>

            {/* Symptom & Root Cause Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Production Symptom</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">{selectedScenario.symptom}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Technical Root Cause</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">{selectedScenario.rootCause}</div>
              </div>
            </div>

            {/* Investigation Steps */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Staff Investigation Checklist
              </div>
              <div className="space-y-1.5">
                {selectedScenario.investigationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-sky-400 shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Commands */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Remediation CLI Commands</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
                {selectedScenario.remediationCommands.map((cmd, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>$ {cmd}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Fix Comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>Code Fix ({selectedScenario.codeFix.filename})</span>
                </span>
                <button
                  onClick={() => handleCopy(selectedScenario.codeFix.goodCode)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Fix'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-lg">
                  <div className="text-[11px] font-sans font-bold text-rose-400 mb-1.5">❌ Problematic Code</div>
                  <pre className="text-slate-300 text-[11px] whitespace-pre-wrap">{selectedScenario.codeFix.badCode}</pre>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg">
                  <div className="text-[11px] font-sans font-bold text-emerald-400 mb-1.5">✅ Remediated Code</div>
                  <pre className="text-slate-300 text-[11px] whitespace-pre-wrap">{selectedScenario.codeFix.goodCode}</pre>
                </div>
              </div>
            </div>

            {/* Senior Interview Tips */}
            <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-800/40 space-y-2">
              <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff & Principal Engineer Interview Edge</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {selectedScenario.seniorTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
