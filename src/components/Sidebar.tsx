import React from 'react';
import { SCENARIOS } from '../data/scenarios';
import { LabScenario } from '../types/terraform';
import { Layers, CloudOff, Box, GitBranch, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';

interface SidebarProps {
  currentScenario: LabScenario;
  onSelectScenario: (scenario: LabScenario) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isApplied: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScenario,
  onSelectScenario,
  selectedCategory,
  onSelectCategory,
  isApplied
}) => {
  const filteredScenarios = selectedCategory === 'all'
    ? SCENARIOS
    : SCENARIOS.filter(s => s.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kubernetes-aws':
        return <Box className="w-4 h-4 text-amber-400" />;
      case 'kubernetes-azure':
        return <Box className="w-4 h-4 text-blue-400" />;
      case 'networking':
        return <GitBranch className="w-4 h-4 text-emerald-400" />;
      case 'localstack':
        return <CloudOff className="w-4 h-4 text-sky-400" />;
      case 'modules':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'docker':
        return <Box className="w-4 h-4 text-cyan-400" />;
      case 'state-surgery':
        return <GitBranch className="w-4 h-4 text-amber-400" />;
      case 'testing':
      case 'iam-security':
      case 'zero-downtime':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <aside className="w-80 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-57px)] overflow-hidden">
      {/* Category selector */}
      <div className="p-3.5 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Practice Labs ({filteredScenarios.length})
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            All Labs
          </button>
          <button
            onClick={() => onSelectCategory('kubernetes-aws')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'kubernetes-aws'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            AWS EKS
          </button>
          <button
            onClick={() => onSelectCategory('kubernetes-azure')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'kubernetes-azure'
                ? 'bg-slate-800 text-blue-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Azure AKS
          </button>
          <button
            onClick={() => onSelectCategory('networking')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'networking'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            VPC Network
          </button>
          <button
            onClick={() => onSelectCategory('localstack')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'localstack'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            LocalStack
          </button>
          <button
            onClick={() => onSelectCategory('modules')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'modules'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Modules & HCL2
          </button>
        </div>
      </div>

      {/* Lab List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredScenarios.map((scenario) => {
          const isSelected = scenario.id === currentScenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500/50 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(scenario.category)}
                  <span className="text-sm font-semibold text-slate-100 line-clamp-1">
                    {scenario.title}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                {scenario.tagline}
              </p>

              {/* Zero-Pill Unboxed Metadata with Typographic Separator */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>{scenario.difficulty}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-400">$0 Cloud Cost</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{scenario.files.length} files</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Zero Cloud Guarantee footer card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
          <CloudOff className="w-4 h-4" />
          <span>Zero-Cloud Guarantee</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          All scenarios run with LocalStack, Docker, or local filesystem providers. No credit cards or cloud account required.
        </p>
      </div>
    </aside>
  );
};
