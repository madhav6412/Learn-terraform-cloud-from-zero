import React, { useState } from 'react';
import { PRACTICE_CHALLENGES } from '../data/challenges';
import { PracticeChallenge } from '../types/terraform';
import { ShieldCheck, X, Check, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

interface ChallengesModalProps {
  onClose: () => void;
  onLoadChallengeToWorkspace?: (filename: string, code: string) => void;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  onClose,
  onLoadChallengeToWorkspace
}) => {
  const [activeChallenge, setActiveChallenge] = useState<PracticeChallenge>(PRACTICE_CHALLENGES[0]);
  const [userCode, setUserCode] = useState(activeChallenge.initialCode);
  const [validationResult, setValidationResult] = useState<{ passed: boolean; message: string } | null>(null);

  const handleSelect = (c: PracticeChallenge) => {
    setActiveChallenge(c);
    setUserCode(c.initialCode);
    setValidationResult(null);
  };

  const handleValidate = () => {
    const res = activeChallenge.validate(userCode);
    setValidationResult(res);
  };

  const handleReset = () => {
    setUserCode(activeChallenge.initialCode);
    setValidationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-text">
      <div className="w-full max-w-4xl h-[85vh] bg-[#0c121e] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="h-14 px-5 bg-[#090d16] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <div className="font-bold text-sm text-white">Interactive Infrastructure Challenges</div>
              <div className="text-[11px] text-slate-400">Validate security guardrails & HCL best practices</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* List */}
          <div className="w-72 border-r border-slate-800 p-3 space-y-2 bg-[#090e18] overflow-y-auto">
            {PRACTICE_CHALLENGES.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  activeChallenge.id === c.id
                    ? 'bg-sky-950/40 border-sky-500/60 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200">{c.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{c.difficulty}</div>
              </div>
            ))}
          </div>

          {/* Editor & Validation */}
          <div className="flex-1 flex flex-col p-5 bg-[#0c121e] overflow-y-auto space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">{activeChallenge.title}</h2>
              <p className="text-xs text-slate-300 mt-1">{activeChallenge.scenarioDescription}</p>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-200">
              <strong>Hint:</strong> {activeChallenge.hint}
            </div>

            <div className="flex-1 flex flex-col space-y-2 min-h-[220px]">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{activeChallenge.filename}</span>
                <button onClick={handleReset} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white">
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-sky-200 outline-none focus:border-sky-500 min-h-[180px]"
              />
            </div>

            {validationResult && (
              <div
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                  validationResult.passed
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                }`}
              >
                {validationResult.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <span>{validationResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              {onLoadChallengeToWorkspace && (
                <button
                  onClick={() => {
                    onLoadChallengeToWorkspace(activeChallenge.filename, userCode);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Load to Workspace
                </button>
              )}
              <button
                onClick={handleValidate}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold ml-auto"
              >
                Validate Solution
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
