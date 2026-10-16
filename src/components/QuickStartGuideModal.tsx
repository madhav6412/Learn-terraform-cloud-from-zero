import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Play,
  Terminal,
  Share2,
  Flame,
  Download,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

interface QuickStartGuideModalProps {
  onClose: () => void;
  onSelectScenarioAndStart?: (scenarioId: string) => void;
  onExecuteSampleCommand?: (cmd: string) => void;
  onOpenD3Graph?: () => void;
  onOpenDrift?: () => void;
  onOpenK9s?: () => void;
  onOpenAI?: () => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({
  onClose,
  onSelectScenarioAndStart,
  onExecuteSampleCommand,
  onOpenD3Graph,
  onOpenDrift,
  onOpenK9s,
  onOpenAI
}) => {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'lifecycle' | 'shortcuts' | 'faq'>('walkthrough');

  const walkthroughSteps = [
    {
      step: '1',
      title: 'Select a Scenario from the Left Sidebar',
      summary: 'Pick between AWS EC2, Azure VM, AWS EKS, or Azure AKS.',
      details:
        'When you select "AWS EC2 Production VM", the multi-file editor loads real production HCL2 files: `main.tf` (hardened VM, EBS volume, security group, IMDSv2), `variables.tf`, and `outputs.tf`. Everything is configured to run at $0 cost against LocalStack.',
      actionLabel: 'Select AWS EC2 VM',
      action: () => {
        onSelectScenarioAndStart?.('aws-vm-ec2-production');
        onClose();
      }
    },
    {
      step: '2',
      title: 'Follow the 5-Step Guided Workflow Bar',
      summary: 'Look at the banner right above the code editor.',
      details:
        'You do not have to guess what to type! Click the glowing action button:\n• Click [▶ Run "terraform init"] to configure LocalStack provider.\n• Click [▶ Run "terraform plan"] to preview resources.\n• Click [▶ Run "terraform apply"] to provision the virtual VM and disk.',
      actionLabel: 'Run "terraform init"',
      action: () => {
        onExecuteSampleCommand?.('terraform init');
        onClose();
      }
    },
    {
      step: '3',
      title: 'Inspect the Live D3 Force-Directed Graph',
      summary: 'See your cloud architecture as an interactive physics DAG.',
      details:
        'Click the "D3 Resource DAG" tab in the sub-header. You will see your EC2 instance (`web_vm`) connected to its Security Group (`web_sg`) and persistent EBS volume (`data_disk`). You can drag nodes, zoom in/out, and click any node to view live attributes!',
      actionLabel: 'Switch to D3 DAG View',
      action: () => {
        onOpenD3Graph?.();
        onClose();
      }
    },
    {
      step: '4',
      title: 'Simulate & Reconcile Cloud Drift',
      summary: 'Test what happens when real cloud infrastructure diverges from code.',
      details:
        'Click "Simulate Drift" in the top bar. Pick an out-of-band scenario (e.g. someone opened SSH port 22 in AWS console). Then run "terraform plan" in the terminal to see Terraform detect the drift, and run "terraform apply" to automatically heal and reconcile it!',
      actionLabel: 'Explore Drift Engine',
      action: () => {
        onOpenDrift?.();
        onClose();
      }
    },
    {
      step: '5',
      title: 'Launch K9s Visual Kubernetes Terminal',
      summary: 'Manage simulated pods, nodes, and deployments with full keyboard navigation.',
      details:
        'Switch to the "K8s & K9s" tab in the top header or type `k9s` in the terminal. Navigate with arrow keys, press `<1>` to view Pods, `<2>` for Deployments, `<3>` for Services, and `<d>` to describe or `<l>` to stream logs!',
      actionLabel: 'Launch K9s Terminal',
      action: () => {
        onOpenK9s?.();
        onClose();
      }
    },
    {
      step: '6',
      title: 'Run on Your Own Machine with Docker for $0.00',
      summary: 'Export everything and run real Terraform locally.',
      details:
        'Click "Run on Laptop ($0)" to view the full `docker-compose.yml` for LocalStack or Kind. Copy the commands and execute them on your own computer without needing an AWS or Azure subscription.',
      actionLabel: 'Got It!',
      action: () => onClose()
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c121e] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">How to Use This Studio</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Beginner to Senior Guide
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Created & Curated by <strong className="text-sky-300">Madhav Gupta</strong> · Zero Cloud Bills ($0.00)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 bg-[#090e17] flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'walkthrough'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Step-by-Step Walkthrough
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'lifecycle'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Terraform Lifecycle Explained
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'shortcuts'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. CLI Commands & Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. FAQ & Troubleshooting
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
          {activeTab === 'walkthrough' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-950/40 border border-sky-600/30 rounded-xl text-xs text-sky-200 leading-relaxed">
                👋 <strong>Stuck on what to do after selecting AWS Production VM?</strong> Here is the exact path:
                Simply follow the <strong>glowing step buttons</strong> located directly above the code editor. You can
                run the commands with 1-click or type them into the terminal.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {walkthroughSteps.map((ws) => (
                  <div
                    key={ws.step}
                    className="p-4 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {ws.step}
                        </span>
                        <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                          {ws.title}
                        </h4>
                      </div>
                      <p className="text-[11px] font-semibold text-sky-400 mb-1">{ws.summary}</p>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                        {ws.details}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-end">
                      <button
                        onClick={ws.action}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        <span>{ws.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>The Terraform 3-Stage Engine Cycle</span>
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Terraform works in three essential phases. In this Zero-Cost Studio, you experience all three without spending money:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#0a0f18] border border-sky-500/40 rounded-lg space-y-1.5">
                    <div className="font-bold text-sky-400 flex items-center gap-1.5">
                      <span>1. terraform init</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Scans `main.tf`, downloads providers (`hashicorp/aws`, `hashicorp/azurerm`), sets up local plugins, and initializes state backend.
                    </p>
                  </div>

                  <div className="p-3 bg-[#0a0f18] border border-indigo-500/40 rounded-lg space-y-1.5">
                    <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <span>2. terraform plan</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Reads current `terraform.tfstate`, inspects local cloud API, and builds an execution graph showing `+ create`, `~ update`, or `- destroy`.
                    </p>
                  </div>

                  <div className="p-3 bg-[#0a0f18] border border-emerald-500/40 rounded-lg space-y-1.5">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>3. terraform apply</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Executes API calls to provision real resources, writes assigned IDs (e.g. `i-09f8e4381b0a92d`) to state, and renders DAG topology.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Why $0.00 Cost? (Owner: Madhav Gupta Architecture)</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Normal AWS EC2 or EKS instances can easily incur hundreds of dollars if left running. In this Studio,
                  we configure providers to communicate with in-memory LocalStack & Kind mock endpoints (`http://localhost:4566`).
                  You get 100% authentic HCL2 validation and Terraform state lifecycles with $0.00 cloud expenses.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="font-bold text-white mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Terminal Commands You Can Type</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-sky-300 font-bold">terraform init</div>
                    <div className="text-slate-400 font-sans text-[10px]">Initialize plugins and provider backend</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-sky-300 font-bold">terraform plan</div>
                    <div className="text-slate-400 font-sans text-[10px]">Generate & display execution plan</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-sky-300 font-bold">terraform apply -auto-approve</div>
                    <div className="text-slate-400 font-sans text-[10px]">Build resources and save to state</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-sky-300 font-bold">terraform state list</div>
                    <div className="text-slate-400 font-sans text-[10px]">List all active managed resources</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-sky-300 font-bold">k9s</div>
                    <div className="text-slate-400 font-sans text-[10px]">Launch visual Kubernetes TUI terminal</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <div className="text-sky-300 font-bold">kubectl get pods -A</div>
                    <div className="text-slate-400 font-sans text-[10px]">List all simulated Kubernetes pods</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-white">Q: I modified a file in the workspace. Will it apply?</div>
                <div className="text-slate-300">
                  Yes! You can edit code in `main.tf`, add new resources, or create new `.tf` files using the `+` button in the file tabs.
                  Then run `terraform plan` and `terraform apply` to see the changes reflected.
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-white">Q: How do I test the D3 Force Graph?</div>
                <div className="text-slate-300">
                  Click the <strong>D3 Resource DAG</strong> button in the sub-header bar. It runs a D3.js physics simulation where
                  nodes (VM, Disk, Security Group) repulse and links keep them connected based on Terraform references.
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-white">Q: What if I don't understand an error?</div>
                <div className="text-slate-300">
                  Click the <strong>AI Assistant</strong> button in the top right or the floating button at bottom right. The DevOps AI
                  Copilot reads your code and terminal logs to explain what happened and propose an automatic fix!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#090e17] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Owner: <strong className="text-sky-300">Madhav Gupta</strong> · Zero Cloud Cost Guarantee
          </div>
          <button
            onClick={() => {
              onSelectScenarioAndStart?.('aws-vm-ec2-production');
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>Start AWS Production VM Scenario Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
