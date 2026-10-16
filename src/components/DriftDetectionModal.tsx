import React, { useState } from 'react';
import { DRIFT_SCENARIOS, DriftItem } from '../data/driftScenarios';
import {
  AlertTriangle,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Layers,
  Flame,
  FileCode,
  Eye
} from 'lucide-react';

interface DriftDetectionModalProps {
  onClose: () => void;
  activeDriftId?: string | null;
  onInjectDrift?: (drift: DriftItem) => void;
  onResolveDrift?: () => void;
  onRunPlanInTerminal?: (cmd: string, output: string) => void;
  onAskAI?: (prompt: string) => void;
}

export const DriftDetectionModal: React.FC<DriftDetectionModalProps> = ({
  onClose,
  activeDriftId,
  onInjectDrift,
  onResolveDrift,
  onRunPlanInTerminal,
  onAskAI
}) => {
  const [selectedDrift, setSelectedDrift] = useState<DriftItem>(
    DRIFT_SCENARIOS.find((d) => d.id === activeDriftId) || DRIFT_SCENARIOS[0]
  );
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isCurrentActive = activeDriftId === selectedDrift.id;

  const handleCopyPlan = () => {
    navigator.clipboard.writeText(selectedDrift.planOutput);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  const handleInject = () => {
    if (onInjectDrift) {
      onInjectDrift(selectedDrift);
      setActionFeedback(`Drift "${selectedDrift.title}" injected into live studio simulation!`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleRevert = () => {
    if (onResolveDrift) {
      onResolveDrift();
      setActionFeedback('Reverted cloud drift via "terraform apply"! Infrastructure matches HCL.');
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleRunPlan = () => {
    if (onRunPlanInTerminal) {
      onRunPlanInTerminal('terraform plan', selectedDrift.planOutput);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-text">
      <div className="w-full max-w-6xl h-[90vh] bg-[#0c121e] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 px-5 bg-[#090d16] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Flame className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Terraform Drift Detection & Remediation Engine</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-mono">
                  State vs Real World
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Simulate out-of-band ClickOps divergence & inspect <code className="text-sky-300 font-bold">terraform plan</code> reports · Owner: <span className="text-sky-400 font-medium">Madhav Gupta</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action feedback banner if any */}
        {actionFeedback && (
          <div className="px-5 py-2 bg-emerald-950/80 border-b border-emerald-500/50 text-xs text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Main Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Drift Scenarios List */}
          <div className="w-80 md:w-96 border-r border-slate-800 bg-[#090e18] overflow-y-auto p-3 space-y-2">
            <div className="text-[11px] font-bold uppercase text-slate-400 px-2 pb-1">
              Select Drift Scenario
            </div>
            {DRIFT_SCENARIOS.map((drift) => (
              <div
                key={drift.id}
                onClick={() => setSelectedDrift(drift)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedDrift.id === drift.id
                    ? 'bg-rose-950/40 border-rose-500/60 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      drift.severity === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : drift.severity === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}
                  >
                    {drift.severity} · {drift.category}
                  </span>
                  {activeDriftId === drift.id && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-200 line-clamp-1">{drift.title}</div>
                <div className="text-[10.5px] font-mono text-slate-400 mt-1 truncate">
                  {drift.targetResource}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Comparison & Plan Output */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0c121e]">
            {/* Header info & Inject trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    Target: {selectedDrift.targetResource}
                  </span>
                  <span className="text-xs text-slate-500">· Source: {selectedDrift.sourceOfDrift}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedDrift.title}</h2>
                <p className="text-xs text-slate-300 mt-1">{selectedDrift.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isCurrentActive ? (
                  <button
                    onClick={handleRevert}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reconcile (apply)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleInject}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Simulate This Drift</span>
                  </button>
                )}
              </div>
            </div>

            {/* Side-by-Side Divergence Matrix */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Divergence Analysis: Terraform State vs Real Cloud</span>
                <span className="text-[11px] text-amber-400 font-mono">Discrepancy Detected</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Expected (Terraform State) */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Terraform State (Codified)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">terraform.tfstate</span>
                  </div>
                  <pre className="text-slate-300 text-[11px] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedDrift.expectedState, null, 2)}
                  </pre>
                </div>

                {/* Real-World (Cloud Drift) */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-rose-900/40">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Live Cloud (Drifted State)</span>
                    </span>
                    <span className="text-[10px] text-rose-400 font-semibold">Out-of-Band</span>
                  </div>
                  <pre className="text-rose-200 text-[11px] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedDrift.realWorldState, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Diff Summary Bullets */}
            <div className="p-3.5 bg-amber-950/20 border border-amber-800/30 rounded-lg space-y-1.5">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Identified Drift Impact</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {selectedDrift.diffSummary.map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            </div>

            {/* Terraform Plan Output Simulator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execution Output: What "terraform plan" Reports</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPlan}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded transition-colors"
                  >
                    {copiedPlan ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPlan ? 'Copied' : 'Copy Plan'}</span>
                  </button>

                  {onRunPlanInTerminal && (
                    <button
                      onClick={handleRunPlan}
                      className="flex items-center gap-1 text-[11px] text-white px-2.5 py-0.5 bg-sky-600 hover:bg-sky-500 rounded font-semibold transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Run in Studio Terminal</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed whitespace-pre select-text">
                {selectedDrift.planOutput}
              </div>
            </div>

            {/* 3-Way Remediation Paths */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Staff Remediation Strategies
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Path 1: Overwrite */}
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-400">1. Revert to Codified State</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {selectedDrift.remediationGuide.revertAction}
                  </p>
                </div>

                {/* Path 2: Adopt */}
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-sky-400">2. Adopt Changes into Code</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {selectedDrift.remediationGuide.adoptAction}
                  </p>
                </div>

                {/* Path 3: Ignore Changes */}
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400">3. Ignore Dynamic Attributes</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-mono text-[10px]">
                    {selectedDrift.remediationGuide.ignoreAction}
                  </p>
                </div>
              </div>
            </div>

            {/* Ask AI */}
            {onAskAI && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Need Help Troubleshooting This Drift?</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Ask your DevOps AI Copilot to explain why this drift occurred and how to prevent it in CI/CD.
                  </div>
                </div>

                <button
                  onClick={() =>
                    onAskAI(
                      `Explain the drift scenario "${selectedDrift.title}" on ${selectedDrift.targetResource}. What are the security and operational risks, and how should a Staff DevOps engineer resolve it?`
                    )
                  }
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                >
                  Ask AI Copilot
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
