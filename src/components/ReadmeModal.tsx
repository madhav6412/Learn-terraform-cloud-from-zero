import React from 'react';
import {
  BookOpen,
  X,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Layers,
  Cpu,
  FolderPlus,
  Sparkles,
  Download,
  Copy,
  Check
} from 'lucide-react';

interface ReadmeModalProps {
  onClose: () => void;
  onSelectSection?: (section: any) => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ onClose, onSelectSection }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-text">
      <div className="w-full max-w-4xl h-[88vh] bg-[#0c121e] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 bg-[#090d16] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>README & Getting Started Documentation</span>
                <span className="text-[10px] px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full font-mono">
                  v2.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Created & Curated by <span className="text-sky-400 font-medium">Madhav Gupta</span> · Zero Cloud Subscription Guarantee ($0.00)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs text-slate-300 leading-relaxed bg-[#0c121e]">
          {/* Welcome Box */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/20 border border-sky-500/30 space-y-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🚀 Welcome to the Terraform & Kubernetes Zero-Cloud Studio</span>
            </h1>
            <p className="text-slate-200">
              This interactive platform is engineered for engineers who want to gain deep, hands-on production expertise in 
              <strong> HashiCorp Terraform</strong>, <strong>Kubernetes (k9s)</strong>, <strong>AWS EC2</strong>, <strong>Azure VMs</strong>, <strong>EKS</strong>, 
              and <strong>AKS</strong> without spending a single penny on cloud subscriptions or cloud bills.
            </p>
            <div className="text-[11px] text-sky-300 font-semibold pt-1">
              Owner & Lead Architect: Madhav Gupta (madhavgupta0594@gmail.com)
            </div>
          </div>

          {/* Section Bifurcation Guide */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>1. Application Bifurcation & Distinct Sections</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400">1. TF Studio (Core Workspace)</div>
                <p className="text-slate-400">
                  Full multi-file HCL2 editor, syntax validator, interactive terminal, real-time DAG resource visualizer, and state inspector.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">2. TF Academy & CLI Reference</div>
                <p className="text-slate-400">
                  Beginner-to-Advanced lessons, interactive CLI cheatsheet for all Terraform commands, and 1-click file creator (variables.tf, outputs.tf, providers.tf).
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-blue-400">3. Kubernetes & K9s Terminal</div>
                <p className="text-slate-400">
                  Visual TUI terminal simulator for K9s. Live pods, crashloop inspection, real-time container logs, describe outputs, and pod rebooting.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400">4. AWS / Azure VMs & Clusters</div>
                <p className="text-slate-400">
                  Zero-cost sandboxes for AWS EC2, Azure Linux VM, AWS EKS, and Azure AKS using LocalStack and Kind.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-purple-400">5. Techikrish Interview Scenarios</div>
                <p className="text-slate-400">
                  Comprehensive real-world breakdowns from Techikrish GitHub repositories: CrashLoopBackOff, OOMKilled, Pod Pending, State Lock, Drift, Cyclic Dependencies.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-teal-400">6. Custom Project Builder</div>
                <p className="text-slate-400">
                  Multi-resource architect: combine Terraform + Kubernetes + AWS + Azure + Bitbucket CI/CD pipelines without paying cloud bills.
                </p>
              </div>
            </div>
          </div>

          {/* How to Start Local Practice */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>2. How to Start & Run on Your Local Computer ($0.00 Cost)</span>
            </h2>
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="text-slate-400"># Step 1: Install Docker Desktop (Free)</div>
              <div className="text-emerald-400">$ brew install --cask docker # (macOS) or download from docker.com</div>

              <div className="text-slate-400 pt-2"># Step 2: Run LocalStack for AWS emulation</div>
              <div className="text-emerald-400">$ docker run --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack</div>

              <div className="text-slate-400 pt-2"># Step 3: Run Kind for free Kubernetes cluster</div>
              <div className="text-emerald-400">$ brew install kind kubectl</div>
              <div className="text-emerald-400">$ kind create cluster --name zero-cost-eks</div>

              <div className="text-slate-400 pt-2"># Step 4: Run Terraform commands</div>
              <div className="text-emerald-400">$ terraform init</div>
              <div className="text-emerald-400">$ terraform plan</div>
              <div className="text-emerald-400">$ terraform apply -auto-approve</div>
            </div>
          </div>

          {/* AI Copilot */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>3. Built-in DevOps AI Assistant</span>
            </div>
            <p className="text-xs text-slate-300">
              Whenever you encounter a syntax error, state lock, cyclic dependency, or Kubernetes CrashLoop, click the 
              <strong> AI Assistant</strong> button at the top right or bottom right. The AI Copilot is pre-loaded with current file code and terminal output to troubleshoot instantly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
