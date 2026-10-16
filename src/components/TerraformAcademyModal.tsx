import React, { useState } from 'react';
import {
  TERRAFORM_COMMANDS,
  TERRAFORM_LESSONS,
  STARTER_TEMPLATES,
  TerraformCommandGuide,
  LearningLesson,
  FileTemplate
} from '../data/terraformAcademy';
import {
  BookOpen,
  Terminal,
  FilePlus,
  X,
  Search,
  Copy,
  Check,
  Play,
  Sparkles,
  Layers,
  ChevronRight,
  Code2,
  CheckCircle2
} from 'lucide-react';

interface TerraformAcademyModalProps {
  onClose: () => void;
  onExecuteCommand?: (cmd: string) => void;
  onCreateFileInWorkspace?: (filename: string, content: string) => void;
  onAskAI?: (prompt: string) => void;
}

export const TerraformAcademyModal: React.FC<TerraformAcademyModalProps> = ({
  onClose,
  onExecuteCommand,
  onCreateFileInWorkspace,
  onAskAI
}) => {
  const [activeTab, setActiveTab] = useState<'commands' | 'roadmap' | 'file-creator'>('commands');
  const [selectedCommand, setSelectedCommand] = useState<TerraformCommandGuide>(TERRAFORM_COMMANDS[0]);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson>(TERRAFORM_LESSONS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<FileTemplate>(STARTER_TEMPLATES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [fileCreatedFeedback, setFileCreatedFeedback] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateFile = (tmpl: FileTemplate) => {
    if (onCreateFileInWorkspace) {
      onCreateFileInWorkspace(tmpl.filename, tmpl.content);
      setFileCreatedFeedback(tmpl.filename);
      setTimeout(() => setFileCreatedFeedback(null), 2500);
    }
  };

  const filteredCommands = TERRAFORM_COMMANDS.filter(c =>
    c.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.syntax.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-text">
      <div className="w-full max-w-6xl h-[90vh] bg-[#0c121e] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 px-5 bg-[#090d16] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Terraform Academy & CLI Reference</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Beginner to Advanced
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Commands, HCL curriculum & File Generator · Owner: <span className="text-sky-400 font-medium">Madhav Gupta</span>
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

        {/* 3 Main View Tabs */}
        <div className="px-5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('commands')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'commands' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>All Terraform Commands ({TERRAFORM_COMMANDS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Beginner to Advanced Lessons</span>
            </button>

            <button
              onClick={() => setActiveTab('file-creator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'file-creator' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>File Creator & Templates</span>
            </button>
          </div>

          {activeTab === 'commands' && (
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commands..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {/* Tab 1: All Commands */}
        {activeTab === 'commands' && (
          <div className="flex-1 flex overflow-hidden">
            {/* List */}
            <div className="w-80 md:w-96 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-[#0a0f19]">
              {filteredCommands.map((c) => (
                <div
                  key={c.command}
                  onClick={() => setSelectedCommand(c)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedCommand.command === c.command
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-amber-300">{c.command}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                      {c.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{c.summary}</div>
                </div>
              ))}
            </div>

            {/* Command Detail */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0c121e]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium mb-1">Terraform CLI Reference</div>
                  <h2 className="text-2xl font-bold font-mono text-amber-300">{selectedCommand.command}</h2>
                </div>

                {onExecuteCommand && (
                  <button
                    onClick={() => {
                      onExecuteCommand(selectedCommand.command);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-md shadow-amber-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run in Terminal</span>
                  </button>
                )}
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">Syntax & Usage</div>
                <div className="font-mono text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  $ {selectedCommand.syntax}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{selectedCommand.summary}</p>
              </div>

              {/* Flags */}
              {selectedCommand.flags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase text-slate-400">Common Flags & Options</div>
                  <div className="space-y-1.5">
                    {selectedCommand.flags.map((f, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs">
                        <code className="text-amber-300 font-bold shrink-0">{f.flag}</code>
                        <span className="text-slate-300">{f.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">Practical Example</div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 flex items-center justify-between">
                  <span>$ {selectedCommand.example}</span>
                  <button
                    onClick={() => handleCopy(selectedCommand.example)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Interview / Production Tip */}
              <div className="p-4 rounded-lg bg-sky-950/30 border border-sky-800/40 space-y-1.5">
                <div className="text-xs font-bold text-sky-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interview & Production Tip (Madhav Gupta)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedCommand.interviewTip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Roadmap Lessons */}
        {activeTab === 'roadmap' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 md:w-96 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-[#0a0f19]">
              {TERRAFORM_LESSONS.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setSelectedLesson(l)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedLesson.id === l.id
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-200">{l.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                      {l.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{l.duration} · {l.summary}</div>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0c121e]">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {selectedLesson.level} Level
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">{selectedLesson.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedLesson.summary}</p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400">Core Concepts</div>
                <div className="space-y-1.5">
                  {selectedLesson.coreConcepts.map((cc, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{cc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase text-slate-400">HCL Pattern Code</div>
                  <button
                    onClick={() => handleCopy(selectedLesson.codeSnippet)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-sky-300 overflow-x-auto whitespace-pre-wrap">
                  {selectedLesson.codeSnippet}
                </pre>
              </div>

              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                <div className="text-xs font-bold text-emerald-300 uppercase">Key Takeaway</div>
                <p className="text-xs text-slate-300">{selectedLesson.keyTakeaway}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: File Creator & Templates */}
        {activeTab === 'file-creator' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 md:w-96 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-[#0a0f19]">
              <div className="text-[11px] text-slate-400 px-2 pb-1">
                Select a template to generate and inject files into your Terraform workspace:
              </div>
              {STARTER_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedTemplate.id === tmpl.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-300">{tmpl.filename}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                      {tmpl.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{tmpl.description}</div>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0c121e]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">File Generator (Owner: Madhav Gupta)</div>
                  <h2 className="text-2xl font-bold font-mono text-emerald-300">{selectedTemplate.filename}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedTemplate.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selectedTemplate.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy HCL'}</span>
                  </button>

                  <button
                    onClick={() => handleCreateFile(selectedTemplate)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Create in Workspace</span>
                  </button>
                </div>
              </div>

              {fileCreatedFeedback && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-lg text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Successfully injected {fileCreatedFeedback} into your active Terraform workspace!</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-400 font-mono">
                  File Preview: {selectedTemplate.filename}
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-sky-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedTemplate.content}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
