import {
  Layers,
  Terminal,
  BookOpen,
  Award,
  Sparkles,
  Play,
  Download,
  ShieldCheck,
  Cpu,
  FolderPlus,
  HelpCircle,
  Flame
} from 'lucide-react';

export type ActiveSection =
  | 'terraform-studio'
  | 'terraform-academy'
  | 'kubernetes-k9s'
  | 'cloud-sandbox'
  | 'interview-hub'
  | 'project-builder'
  | 'readme';

interface HeaderProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  onToggleAIAssistant: () => void;
  onQuickRun: () => void;
  onOpenLocalRun: () => void;
  onOpenChallenges: () => void;
  onOpenDriftDetection: () => void;
  onOpenHowToUse?: () => void;
  activeDriftCount?: number;
  isApplied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onSelectSection,
  onToggleAIAssistant,
  onQuickRun,
  onOpenLocalRun,
  onOpenChallenges,
  onOpenDriftDetection,
  onOpenHowToUse,
  activeDriftCount = 0,
  isApplied
}) => {
  return (
    <header className="h-14 bg-[#0d131f] border-b border-slate-800/80 px-3 md:px-5 flex items-center justify-between gap-2 shrink-0 select-none z-30">
      {/* Zone 1: Brand & Owner */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              Terraform & K8s Studio
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
              $0.00 ZERO-COST
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Owner:</span>
            <span className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
              Madhav Gupta
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Distinct Section Bifurcation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onSelectSection('terraform-studio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSection === 'terraform-studio'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>TF Studio</span>
        </button>

        <button
          onClick={() => onSelectSection('terraform-academy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSection === 'terraform-academy'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>TF Academy & CLI</span>
        </button>

        <button
          onClick={() => onSelectSection('kubernetes-k9s')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSection === 'kubernetes-k9s'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>K8s & K9s</span>
        </button>

        <button
          onClick={() => onSelectSection('cloud-sandbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSection === 'cloud-sandbox'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>AWS / Azure VMs & Clusters</span>
        </button>

        <button
          onClick={() => onSelectSection('interview-hub')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSection === 'interview-hub'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>Techikrish Scenarios</span>
        </button>

        <button
          onClick={() => onSelectSection('project-builder')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSection === 'project-builder'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5 text-teal-400" />
          <span>Custom Project</span>
        </button>

        <button
          onClick={() => onSelectSection('readme')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeSection === 'readme'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
          <span>README Guide</span>
        </button>
      </nav>

      {/* Mobile section dropdown */}
      <div className="lg:hidden flex items-center">
        <select
          value={activeSection}
          onChange={(e) => onSelectSection(e.target.value as ActiveSection)}
          className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5"
        >
          <option value="terraform-studio">TF Studio</option>
          <option value="terraform-academy">TF Academy & CLI</option>
          <option value="kubernetes-k9s">K8s & K9s Terminal</option>
          <option value="cloud-sandbox">AWS/Azure VMs & Clusters</option>
          <option value="interview-hub">Techikrish Scenarios</option>
          <option value="project-builder">Custom Project Builder</option>
          <option value="readme">README Guide</option>
        </select>
      </div>

      {/* Zone 3: Actions & AI Assistant Launcher */}
      <div className="flex items-center gap-2">
        {/* How to Use Walkthrough */}
        {onOpenHowToUse && (
          <button
            onClick={onOpenHowToUse}
            title="How to Use This Studio & Step-by-Step Guide"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 border border-sky-600/50 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm shadow-sky-600/20"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">How to Use</span>
            <span className="sm:hidden">Help</span>
          </button>
        )}

        {/* Quick Run Plan/Apply */}
        <button
          onClick={onQuickRun}
          title="Fast Plan & Apply current scenario"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>Quick Plan</span>
        </button>

        {/* Local Run Guide */}
        <button
          onClick={onOpenLocalRun}
          title="LocalStack & Kind Zero-Cost Setup"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Local Setup</span>
        </button>

        {/* Interactive Challenges */}
        <button
          onClick={onOpenChallenges}
          title="Interactive HCL Challenges"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-lg transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden xl:inline">Challenges</span>
        </button>

        {/* Drift Detection Button */}
        <button
          onClick={onOpenDriftDetection}
          title="Simulate & Detect Infrastructure Drift (terraform plan)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeDriftCount > 0
              ? 'bg-rose-950/70 border border-rose-500/70 text-rose-300 shadow-sm shadow-rose-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${activeDriftCount > 0 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
          <span className="hidden sm:inline">Drift Engine</span>
          <span className="sm:hidden">Drift</span>
          {activeDriftCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          )}
        </button>

        {/* Ayushi (Jarvis/Edith AI) Button */}
        <button
          onClick={onToggleAIAssistant}
          title="Launch Ayushi (Jarvis/Edith Autonomous DevOps AI)"
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-cyan-500/25 active:scale-95 cursor-pointer ring-1 ring-cyan-400/50"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          <span className="tracking-wide">Ayushi (A.I.)</span>
        </button>
      </div>
    </header>
  );
};
