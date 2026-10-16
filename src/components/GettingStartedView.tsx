import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Box,
  Layers,
  Sparkles,
  ExternalLink,
  UserCheck
} from 'lucide-react';

interface GettingStartedViewProps {
  onSwitchToSection?: (section: string) => void;
  onAskAI?: (prompt: string) => void;
}

export const GettingStartedView: React.FC<GettingStartedViewProps> = ({
  onSwitchToSection,
  onAskAI
}) => {
  const [copied, setCopied] = useState(false);

  const fullReadmeMarkdown = `# Terraform & Kubernetes Zero-Cloud Practice Studio
**Curated & Owned by Madhav Gupta**

Master production-grade Terraform and Kubernetes without spending a single dollar on AWS or Azure subscriptions.

---

## 🚀 Quick Start Guide (3 Minutes)

### Step 1: Clone or Open Workspace
Ensure you have the following free tools installed on your local workstation:
- **Terraform CLI** (v1.5.0 or later): \`brew install terraform\` or \`apt install terraform\`
- **Docker & Docker Compose**: For running LocalStack and Kind clusters
- **Kind (Kubernetes in Docker)**: \`brew install kind\` or \`curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64\`
- **kubectl**: \`brew install kubectl\`

### Step 2: Zero-Cloud Philosophy
All cloud calls in this studio are directed to local emulators:
- **AWS API Calls** → Routed to LocalStack on \`http://localhost:4566\`
- **Azure VM & Disks** → Emulated with local zero-cloud providers and mock backends
- **Kubernetes (EKS & AKS)** → Emulated with multi-node Kind clusters inside Docker
- **State Storage** → Local state with serial tracking (\`terraform.tfstate\`)

---

## 🧱 The 5 Application Sections

### 1. Terraform Core Mastery
Practice enterprise Infrastructure-as-Code patterns:
- Multi-file modular architectures with child modules
- Zero-downtime blue/green deployment lifecycles (\`create_before_destroy\`)
- State surgery without resource destruction (\`moved {}\` blocks & \`terraform state mv\`)
- Dynamic blocks (\`for_each\` inside \`ingress\`)
- Native testing framework (\`terraform test\` with \`.tftest.hcl\`)
- Policy-As-Code with Open Policy Agent (OPA) / Rego

### 2. Cloud Compute & Virtual Machines ($0 Cost)
- **AWS EC2 Virtual Machine:** Ubuntu 22.04 LTS, IMDSv2 security hardening (\`http_tokens = "required"\`), dynamic cloud-init user_data, secondary EBS data disk attachment, and Elastic IP.
- **Azure Linux VM:** SSH authentication with \`tls_private_key\`, custom_data cloud-init base64 script, and persistent 64GB Managed Data Disk with LUN 10 attachment.

### 3. Kubernetes (AWS EKS & Azure AKS)
- **AWS EKS:** OIDC provider, IAM Roles for Service Accounts (IRSA), managed node groups, and AWS EBS CSI driver.
- **Azure AKS:** System and user node pools, Azure Workload Identity federation, and Kubernetes Ingress routing.

### 4. Interactive Terraform Command Center
Interactive reference of all Terraform CLI commands from Beginner (\`init\`, \`plan\`, \`apply\`) to Advanced (\`state mv\`, \`force-unlock\`, \`test\`, \`import\`). Run any command with one click in the embedded sandbox terminal!

### 5. DevOps & Cloud Interview Scenarios Hub (Techikrish Bank)
Real-world incident response and architecture questions for Kubernetes and Terraform, contrasting Junior mistakes against Senior/Staff answers.

---

## ⚡ Essential Commands Cheat Sheet

\`\`\`bash
# 1. Initialize working directory & download providers
terraform init

# 2. Preview execution plan
terraform plan

# 3. Apply changes with automatic approval
terraform apply -auto-approve

# 4. Inspect resources currently tracked in state
terraform state list

# 5. Destroy resources in reverse dependency order
terraform destroy -auto-approve
\`\`\`

---

## 🛡️ License & Attribution
Designed, developed, and maintained by **Madhav Gupta** for DevOps and Platform Engineers.
`;

  const handleDownloadReadme = () => {
    const blob = new Blob([fullReadmeMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(fullReadmeMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-y-auto font-sans p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner / Title */}
        <div className="flex items-start justify-between gap-6 border-b border-slate-800 pb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-semibold">
                DOCUMENTATION & GETTING STARTED
              </span>
              <span className="text-slate-500 font-mono text-xs">·</span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Owner: Madhav Gupta</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Terraform & Kubernetes Zero-Cloud Practice Guide
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Complete setup guide, domain bifurcation manual, and local $0 execution runbook.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReadme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadReadme}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download README.md</span>
            </button>
          </div>
        </div>

        {/* Quick Start Card (3 Minutes) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-base font-bold text-white">
              3-Minute Quick Start: How to Run Everything
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
              <span className="font-semibold text-sky-400 block font-mono">1. Select Domain</span>
              <p className="text-slate-400">
                Choose between <strong>Terraform Core</strong>, <strong>Cloud VMs</strong>, or <strong>Kubernetes (EKS/AKS)</strong> from the top navigation.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
              <span className="font-semibold text-amber-400 block font-mono">2. Code or Create Files</span>
              <p className="text-slate-400">
                Edit code directly in the syntax editor, click <strong>"+ New File"</strong> to add your own HCL or YAML files, or ask AI to write it for you.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
              <span className="font-semibold text-emerald-400 block font-mono">3. Test in Sandbox</span>
              <p className="text-slate-400">
                Click <strong>"init"</strong>, <strong>"plan"</strong>, and <strong>"apply"</strong> in the terminal or export the full Docker Compose runbook.
              </p>
            </div>
          </div>
        </div>

        {/* Section Bifurcation Guide */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-slate-400">
            Platform Sections & Learning Paths
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section 1 */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white">1. Terraform Core Mastery</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Contains root and child modules, local backends, dynamic blocks, state refactoring with <code className="text-sky-300">moved {}</code> blocks, and built-in HCL2 functions (<code className="text-sky-300">jsondecode</code>, <code className="text-sky-300">merge</code>, <code className="text-sky-300">cidrsubnet</code>).
              </p>
            </div>

            {/* Section 2 */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">2. Cloud VMs (AWS EC2 & Azure VM)</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full virtual machine provisioning with zero cloud bills. Includes IMDSv2 security hardening, cloud-init user_data scripts, secondary EBS disks, and Azure 64GB Managed Disks.
              </p>
            </div>

            {/* Section 3 */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">3. Kubernetes (AWS EKS & Azure AKS)</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Production cluster topologies emulated locally with Kind. Covers IAM OIDC providers, IRSA roles, Azure Workload Identity, managed node pools, and Ingress routing.
              </p>
            </div>

            {/* Section 4 */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">4. Command Center & Cheat Sheet</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                From beginner commands (<code className="text-emerald-300">init</code>, <code className="text-emerald-300">plan</code>, <code className="text-emerald-300">apply</code>) to advanced state surgery (<code className="text-emerald-300">state mv</code>, <code className="text-emerald-300">force-unlock</code>, <code className="text-emerald-300">test</code>) with one-click terminal execution.
              </p>
            </div>
          </div>
        </div>

        {/* Zero-Cloud Architecture Diagram */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-bold text-white">Zero-Cloud Architecture Diagram</span>
            <span className="text-emerald-400">$0.00 Expense Guarantee</span>
          </div>
          <pre className="p-4 rounded-lg bg-slate-950 text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/60">
{`+-------------------------------------------------------------+
|                 Developer Workstation ($0 Spend)            |
+-------------------------------------------------------------+
|                                                             |
|  [Terraform CLI]  -->  Points to Local Endpoints            |
|         |                                                   |
|         +--> AWS S3 / EC2   --> http://localhost:4566       |
|         |                       (LocalStack Community)      |
|         |                                                   |
|         +--> Azure VM / Disk --> Azurite / Local Mock       |
|         |                                                   |
|         +--> EKS / AKS      --> http://localhost:6443       |
|         |                       (Kind Cluster in Docker)    |
|         |                                                   |
|         +--> State Storage  --> ./terraform.tfstate (Local) |
|                                                             |
+-------------------------------------------------------------+`}
          </pre>
        </div>

        {/* AI Assistant Help */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border border-sky-800/40 flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Need help while practicing?</span>
            </h4>
            <p className="text-xs text-slate-300">
              The built-in DevOps AI Assistant (powered by Gemini) is always ready to inspect your code, write custom HCL, or quiz you on interview questions.
            </p>
          </div>
          {onAskAI && (
            <button
              onClick={() => onAskAI('Please guide me on where to start as a beginner with Terraform and Kubernetes in this studio.')}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              Ask AI Assistant
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
