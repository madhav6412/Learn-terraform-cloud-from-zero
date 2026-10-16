import React from 'react';
import { InterviewPrep, LabScenario } from '../types/terraform';
import { Award, AlertTriangle, CheckCircle2, HelpCircle, ShieldCheck, Flame, BookOpen } from 'lucide-react';

interface InterviewPrepPaneProps {
  scenario: LabScenario;
}

export const InterviewPrepPane: React.FC<InterviewPrepPaneProps> = ({ scenario }) => {
  const prep = scenario.interviewPrep;

  if (!prep) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No interview preparation data available for this scenario.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-200">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 to-indigo-950/40 border border-sky-800/50">
        <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1.5">
          <Award className="w-4 h-4" />
          <span>Staff / Senior DevOps Interview Breakdown</span>
        </div>
        <h3 className="text-base font-bold text-white mb-2">
          "{prep.coreQuestion}"
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-sky-300 font-medium">What Interviewers Are Testing:</strong> {prep.interviewerIntent}
        </p>
      </div>

      {/* Junior Mistake vs Staff Solution (Side-by-side comparison) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* The Junior / Mid Mistake */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>The Common Junior Mistake (Red Flag)</span>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed font-sans">
            {prep.juniorMistake}
          </p>
        </div>

        {/* The Staff / Production Standard */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>The Staff Engineer Answer (Hired)</span>
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed font-sans">
            {prep.staffSolution}
          </p>
        </div>
      </div>

      {/* Trap Questions Interviewers Ask */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Follow-Up & Trap Questions Asked By Panel</span>
        </div>
        <ul className="space-y-2">
          {prep.trapQuestions.map((q, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Production Architecture Checklist */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Production Architecture Checklist</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {prep.productionChecklist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-300 p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-emerald-400 text-sm">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
