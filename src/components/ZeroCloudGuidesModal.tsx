import React, { useState } from 'react';
import { ZERO_CLOUD_GUIDES, ZeroCloudGuide } from '../data/zeroCloudGuides';
import { X, BookOpen, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface ZeroCloudGuidesModalProps {
  onClose: () => void;
}

export const ZeroCloudGuidesModal: React.FC<ZeroCloudGuidesModalProps> = ({ onClose }) => {
  const [selectedGuide, setSelectedGuide] = useState<ZeroCloudGuide>(ZERO_CLOUD_GUIDES[0]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(selectedGuide.configSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Zero-Cloud Terraform Masterclass Guides
              </h3>
              <p className="text-xs text-slate-400">
                Architectures and techniques to master advanced Terraform without cloud bills
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

        {/* Content: Left sidebar list + Right guide reader */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r border-slate-800 p-3 space-y-2 overflow-y-auto bg-slate-950/40">
            {ZERO_CLOUD_GUIDES.map((g) => {
              const isSelected = g.id === selectedGuide.id;
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGuide(g);
                    setCopiedSnippet(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-white mb-1">
                    {g.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {g.category}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Guide details */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                {selectedGuide.category}
              </span>
              <h4 className="text-lg font-bold text-white mb-2">
                {selectedGuide.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedGuide.summary}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">Key Senior Technique:</span>
              <p className="text-slate-400 text-[11px] font-mono">{selectedGuide.keyTechnique}</p>
            </div>

            {/* Provider Configuration Snippet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Provider Configuration Pattern
                </span>
                <button
                  onClick={handleCopySnippet}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer font-medium"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy HCL'}</span>
                </button>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <pre>{selectedGuide.configSnippet}</pre>
              </div>
            </div>

            {/* CLI Commands */}
            <div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Local CLI Commands
              </span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1.5">
                {selectedGuide.commands.map((cmd, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-600 select-none">$</span>
                    <span>{cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
