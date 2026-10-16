import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Share2,
  Flame,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { LabScenario } from '../types/terraform';

export interface WorkflowStep {
  id: string;
  number: number;
  title: string;
  command?: string;
  description: string;
  why: string;
  status: 'pending' | 'active' | 'completed';
  actionType: 'command' | 'view_graph' | 'open_drift' | 'local_run';
  buttonLabel: string;
}

interface ScenarioWorkflowStepperProps {
  scenario: LabScenario;
  currentStepIndex: number; // 0 to 4
  isExecuting: boolean;
  isApplied: boolean;
  onExecuteCommand: (command: string) => void;
  onSwitchStudioView: (view: 'editor' | 'd3-graph' | 'state-json') => void;
  onOpenDriftModal: () => void;
  onOpenLocalRunModal: () => void;
  onOpenHowToUseModal: () => void;
  onAskAI: (prompt: string) => void;
  onResetWorkflow: () => void;
}

export const ScenarioWorkflowStepper: React.FC<ScenarioWorkflowStepperProps> = ({
  scenario,
  currentStepIndex,
  isExecuting,
  isApplied,
  onExecuteCommand,
  onSwitchStudioView,
  onOpenDriftModal,
  onOpenLocalRunModal,
  onOpenHowToUseModal,
  onAskAI,
  onResetWorkflow
}) => {
  const [showArchitectureDetails, setShowArchitectureDetails] = useState(false);

  // Generate dynamic steps tailored to the active scenario
  const getScenarioSteps = (): WorkflowStep[] => {
    const isAws = scenario.category === 'vm-aws' || scenario.category === 'kubernetes-aws';
    const isAzure = scenario.category === 'vm-azure' || scenario.category === 'kubernetes-azure';

    const providerName = isAws ? 'AWS & LocalStack ($0)' : isAzure ? 'AzureRM & Local Emulator ($0)' : 'Providers';
    const resourceTarget = isAws
      ? 'AWS EC2 Web VM & Encrypted EBS Disk'
      : isAzure
      ? 'Azure Linux VM & Managed Disk'
      : 'Infrastructure State';

    return [
      {
        id: 'step-init',
        number: 1,
        title: 'Initialize Providers',
        command: 'terraform init',
        description: `Downloads and configures the ${providerName} plugin in zero-cost emulation mode.`,
        why: 'Terraform needs the provider binary before it can parse resources, state locks, and schema definitions.',
        status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 ? 'active' : 'pending',
        actionType: 'command',
        buttonLabel: 'Run "terraform init"'
      },
      {
        id: 'step-plan',
        number: 2,
        title: 'Preview Execution Plan',
        command: 'terraform plan',
        description: `Calculates delta between empty state and desired state to create ${resourceTarget}.`,
        why: 'Always run plan in production to review resource additions, updates, or destructive replacements before altering state.',
        status: currentStepIndex > 1 ? 'completed' : currentStepIndex === 1 ? 'active' : 'pending',
        actionType: 'command',
        buttonLabel: 'Run "terraform plan"'
      },
      {
        id: 'step-apply',
        number: 3,
        title: 'Provision Infrastructure',
        command: 'terraform apply -auto-approve',
        description: `Provisions ${resourceTarget} into the active state with outputs and attributes.`,
        why: 'Apply commits resources to the state file and outputs IDs (e.g. instance_id, disk_id) for downstream services.',
        status: isApplied || currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 ? 'active' : 'pending',
        actionType: 'command',
        buttonLabel: 'Run "terraform apply"'
      },
      {
        id: 'step-graph',
        number: 4,
        title: 'Inspect D3 Topology DAG',
        description: 'Visualize interactive force-directed graph with live dependency edges and resource relationships.',
        why: 'Visualizing the directed acyclic graph (DAG) helps prevent cyclic dependencies and clarifies blast radius.',
        status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 ? 'active' : 'pending',
        actionType: 'view_graph',
        buttonLabel: 'Open D3 Force Graph'
      },
      {
        id: 'step-drift',
        number: 5,
        title: 'Test Drift Detection',
        description: 'Simulate out-of-band cloud modifications and run "terraform plan" to inspect and reconcile drift.',
        why: 'Real-world clouds drift when engineers modify settings via web console; Terraform catches and fixes this automatically.',
        status: currentStepIndex >= 4 ? 'active' : 'pending',
        actionType: 'open_drift',
        buttonLabel: 'Launch Drift Engine'
      }
    ];
  };

  const steps = getScenarioSteps();
  const activeStep = steps[Math.min(currentStepIndex, steps.length - 1)];

  const handleStepAction = (step: WorkflowStep) => {
    if (step.actionType === 'command' && step.command) {
      onExecuteCommand(step.command);
    } else if (step.actionType === 'view_graph') {
      onSwitchStudioView('d3-graph');
    } else if (step.actionType === 'open_drift') {
      onOpenDriftModal();
    } else if (step.actionType === 'local_run') {
      onOpenLocalRunModal();
    }
  };

  return (
    <div className="bg-[#0b121e] border-b border-slate-800 shrink-0 shadow-sm transition-all">
      {/* Top Bar: Active Scenario Info & Quick Helper Bar */}
      <div className="px-3 md:px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 bg-[#090f1a]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">
              Active Scenario
            </span>
          </div>
          <span className="text-slate-600 font-bold">·</span>
          <h2 className="text-xs md:text-sm font-bold text-white truncate max-w-xs md:max-w-md">
            {scenario.title}
          </h2>
          <span className="px-1.5 py-0.5 text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
            $0.00 ZERO-COST
          </span>
          <span className="hidden xl:inline text-[11px] text-slate-400">
            Owner: <strong className="text-sky-300 font-medium">Madhav Gupta</strong>
          </span>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={onOpenHowToUseModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-600/40 rounded text-[11px] font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            title="Open Interactive Walkthrough Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>How to Use This</span>
          </button>

          <button
            onClick={onOpenLocalRunModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded text-[11px] transition-colors cursor-pointer"
            title="View Local Docker Compose / LocalStack $0 run script"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Run on Laptop ($0)</span>
          </button>

          <button
            onClick={() => setShowArchitectureDetails(!showArchitectureDetails)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded text-[11px] border border-slate-800 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Architecture</span>
            {showArchitectureDetails ? (
              <ChevronUp className="w-3 h-3 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-0.5" />
            )}
          </button>

          <button
            onClick={onResetWorkflow}
            title="Reset Stepper & State"
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Architecture & Scenario Goals Drawer */}
      {showArchitectureDetails && (
        <div className="px-4 py-3 bg-[#0d1627] border-b border-slate-800 text-xs text-slate-300 space-y-2.5 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Scenario Objective & Zero-Cost Architecture</span>
              </div>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">
                {scenario.description}
              </p>
            </div>
            <div className="md:w-72 shrink-0 p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-[11px] space-y-1">
              <div className="font-semibold text-sky-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Production Security Highlights</span>
              </div>
              <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
                <li>IMDSv2 enforced: defense against SSRF</li>
                <li>Separate encrypted storage volume (gp3)</li>
                <li>Zero-cost emulation on LocalStack localhost:4566</li>
                <li>Lead DevOps Curator: Madhav Gupta</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Workflow Progress Stepper (The "What's Next" Guide) */}
      <div className="px-3 md:px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {steps.map((st) => {
            const isCurr = st.number - 1 === currentStepIndex;
            const isDone = st.status === 'completed';

            return (
              <button
                key={st.id}
                onClick={() => handleStepAction(st)}
                disabled={isExecuting}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isCurr
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/25 ring-1 ring-sky-400/50 scale-[1.02]'
                    : isDone
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60 hover:text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurr ? 'bg-white text-sky-900' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {st.number}
                  </span>
                )}
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>

        {/* Big Interactive "WHAT TO DO NEXT" Action Button & Hint */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              Step {activeStep.number} of {steps.length}
            </span>
            <span className="text-xs text-slate-300 font-medium truncate max-w-xs">
              {activeStep.description}
            </span>
          </div>

          <button
            onClick={() => handleStepAction(activeStep)}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer ${
              activeStep.actionType === 'view_graph'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
                : activeStep.actionType === 'open_drift'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/30'
                : 'bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-sky-600/30 animate-pulse'
            }`}
          >
            {isExecuting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running {activeStep.command}...</span>
              </>
            ) : (
              <>
                {activeStep.actionType === 'view_graph' ? (
                  <Share2 className="w-4 h-4 text-white" />
                ) : activeStep.actionType === 'open_drift' ? (
                  <Flame className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>{activeStep.buttonLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
