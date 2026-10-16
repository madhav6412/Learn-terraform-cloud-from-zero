import React, { useState } from 'react';
import { TerraformFile } from '../types/terraform';
import {
  Copy,
  Check,
  FileCode,
  RotateCcw,
  Shield,
  Terminal,
  Sparkles,
  Plus,
  Trash2,
  X,
  FileText,
  Edit3,
  Eye
} from 'lucide-react';

interface CodeWorkspaceProps {
  files: TerraformFile[];
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
  onUpdateFileContent: (fileName: string, newContent: string) => void;
  onResetFiles: () => void;
  onCreateFile?: (fileName: string, content: string) => void;
  onDeleteFile?: (fileName: string) => void;
  onAskAI?: () => void;
}

const TEMPLATES: Record<string, { label: string; defaultName: string; content: string }> = {
  terraform_vars: {
    label: 'Terraform Variables (variables.tf)',
    defaultName: 'variables.tf',
    content: `variable "environment" {
  type        = string
  description = "Target environment (e.g. dev, staging, prod)"
  default     = "production"
}

variable "project_owner" {
  type        = string
  description = "Infrastructure owner name"
  default     = "Madhav Gupta"
}
`
  },
  terraform_outputs: {
    label: 'Terraform Outputs (outputs.tf)',
    defaultName: 'outputs.tf',
    content: `output "cluster_endpoint" {
  description = "Public API endpoint URL"
  value       = "https://localhost:6443"
}

output "status" {
  value = "Provisioned successfully"
}
`
  },
  terraform_providers: {
    label: 'Providers Config (providers.tf)',
    defaultName: 'providers.tf',
    content: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25.0"
    }
  }
}
`
  },
  k8s_manifest: {
    label: 'Kubernetes Pod Manifest (pod.yaml)',
    defaultName: 'pod.yaml',
    content: `apiVersion: v1
kind: Pod
metadata:
  name: demo-web
  namespace: default
  labels:
    app: demo-web
    owner: madhav-gupta
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
    resources:
      limits:
        memory: "128Mi"
        cpu: "250m"
`
  },
  empty: {
    label: 'Empty File (custom.tf)',
    defaultName: 'custom.tf',
    content: `# Custom Terraform Configuration
# Owner: Madhav Gupta

`
  }
};

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  files,
  activeFileName,
  onSelectFile,
  onUpdateFileContent,
  onResetFiles,
  onCreateFile,
  onDeleteFile,
  onAskAI
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('variables.tf');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('terraform_vars');

  const activeFile = files.find(f => f.name === activeFileName) || files[0];

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileBadgeIcon = (filename: string) => {
    if (filename.endsWith('.rego')) return <Shield className="w-3.5 h-3.5 text-amber-400" />;
    if (filename.endsWith('.tftest.hcl')) return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return <FileText className="w-3.5 h-3.5 text-purple-400" />;
    return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const template = TEMPLATES[selectedTemplateKey];
    const initialContent = template ? template.content : '# Custom file\n';
    if (onCreateFile) {
      onCreateFile(newFileName.trim(), initialContent);
    }
    setShowNewFileModal(false);
    onSelectFile(newFileName.trim());
  };

  // Syntax highlighting display for Read/Preview mode
  const renderHighlightedCode = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      let lineClass = 'text-slate-200';
      if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
        lineClass = 'text-slate-500 italic';
      }

      return (
        <div key={idx} className="table-row hover:bg-slate-800/30">
          <span className="table-cell select-none text-right pr-4 text-slate-600 font-mono text-xs tabular-nums w-12 border-r border-slate-800/80">
            {idx + 1}
          </span>
          <span className={`table-cell pl-4 font-mono text-xs whitespace-pre ${lineClass}`}>
            {line || ' '}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border-r border-slate-800/80">
      {/* File tab bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-2 py-1.5 overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto">
          {files.map((file) => {
            const isActive = file.name === activeFileName;
            return (
              <div key={file.name} className="flex items-center group">
                <button
                  onClick={() => onSelectFile(file.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 font-medium border border-slate-700/80 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {getFileBadgeIcon(file.name)}
                  <span>{file.name}</span>
                </button>

                {files.length > 1 && onDeleteFile && (
                  <button
                    onClick={() => onDeleteFile(file.name)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-500 p-1 -ml-2 mr-1 transition-opacity cursor-pointer"
                    title={`Delete ${file.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* + New File Button */}
          {onCreateFile && (
            <button
              onClick={() => setShowNewFileModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-dashed border-emerald-700/60 rounded transition-colors cursor-pointer whitespace-nowrap"
              title="Create a new Terraform or Kubernetes file"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New File</span>
            </button>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 pr-2 shrink-0">
          {/* Toggle between Direct Edit and Syntax Highlight Preview */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
              isEditing
                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isEditing ? 'Switch to syntax highlight preview' : 'Switch to interactive code editor'}
          >
            {isEditing ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
            <span className="hidden sm:inline">{isEditing ? 'Preview' : 'Edit'}</span>
          </button>

          {onAskAI && (
            <button
              onClick={onAskAI}
              title="Ask AI Assistant about this file or get help fixing errors"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/70 hover:bg-sky-900 border border-sky-800/80 rounded transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Ask AI Copilot</span>
            </button>
          )}

          <button
            onClick={onResetFiles}
            title="Reset code to original scenario template"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Breadcrumb path & status */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/40 border-b border-slate-800/60 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">path:</span>
          <span className="text-slate-300">{activeFile?.path || activeFileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">{isEditing ? 'Live Editor' : 'Syntax View'}</span>
          <span>·</span>
          <span>HCL2 / YAML</span>
          <span>·</span>
          <span>{activeFile?.content.split('\n').length || 0} lines</span>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs leading-relaxed select-text flex">
        {isEditing ? (
          <div className="w-full h-full flex flex-col relative">
            <textarea
              value={activeFile?.content || ''}
              onChange={(e) => onUpdateFileContent(activeFileName, e.target.value)}
              className="w-full h-full p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-sky-900/50"
              spellCheck={false}
              placeholder="Write your Terraform HCL or Kubernetes YAML code here..."
            />
          </div>
        ) : (
          <div className="p-4 w-full">
            <div className="table w-full border-collapse">
              {activeFile && renderHighlightedCode(activeFile.content)}
            </div>
          </div>
        )}
      </div>

      {/* Create New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Create New File in Workspace</h3>
              </div>
              <button
                onClick={() => setShowNewFileModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  File Name & Extension
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. variables.tf, outputs.tf, pod.yaml"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Starter Template
                </label>
                <div className="space-y-1.5">
                  {Object.entries(TEMPLATES).map(([key, item]) => (
                    <label
                      key={key}
                      onClick={() => {
                        setSelectedTemplateKey(key);
                        setNewFileName(item.defaultName);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        selectedTemplateKey === key
                          ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        checked={selectedTemplateKey === key}
                        onChange={() => {}}
                        className="text-emerald-500"
                      />
                      <span className="font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm cursor-pointer"
                >
                  Create & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
