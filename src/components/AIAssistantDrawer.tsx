import React, { useState, useRef, useEffect } from 'react';
import { LabScenario, TerraformFile } from '../types/terraform';
import {
  Sparkles,
  Send,
  X,
  Volume2,
  VolumeX,
  Play,
  Terminal,
  Share2,
  Flame,
  Download,
  Copy,
  Check,
  Code2,
  Radio,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ayushi';
  text: string;
  timestamp: string;
  action?: {
    type: 'execute_command' | 'switch_view' | 'open_drift' | 'open_k9s' | 'open_local_run' | 'apply_code';
    label: string;
    command?: string;
    view?: 'editor' | 'd3-graph' | 'state-json';
    code?: string;
    filename?: string;
  };
  codeSnippet?: {
    filename: string;
    code: string;
    language: string;
  };
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario?: LabScenario;
  activeFile?: TerraformFile;
  latestTerminalLogs?: string;
  currentStepIndex?: number;
  isApplied?: boolean;
  onExecuteCommand?: (command: string) => void;
  onSwitchStudioView?: (view: 'editor' | 'd3-graph' | 'state-json') => void;
  onOpenDriftModal?: () => void;
  onOpenK9s?: () => void;
  onOpenLocalRun?: () => void;
  onApplyCodeToWorkspace?: (filename: string, code: string) => void;
  initialPrompt?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeScenario,
  activeFile,
  latestTerminalLogs,
  currentStepIndex = 0,
  isApplied = false,
  onExecuteCommand,
  onSwitchStudioView,
  onOpenDriftModal,
  onOpenK9s,
  onOpenLocalRun,
  onApplyCodeToWorkspace,
  initialPrompt
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Ayushi's greeting in Jarvis / Edith persona
  useEffect(() => {
    if (messages.length === 0) {
      const scenarioName = activeScenario?.title || 'AWS EC2 Production VM';
      const welcomeText = `Good day, Sir. Systems are online and fully operational.

I am **Ayushi**, your tactical Cloud & DevOps Autonomous AI — engineered with J.A.R.V.I.S. & E.D.I.T.H. protocols for **Madhav Gupta's Zero-Cost Studio**.

**Status Report:**
• Active Protocol: **${scenarioName}**
• Cloud Cost: **$0.00** (LocalStack & In-Memory Isolation Matrix)
• Current Objective: **${
        currentStepIndex === 0
          ? 'Step 1: Initialize Provider Plugins'
          : currentStepIndex === 1
          ? 'Step 2: Preview Execution Plan'
          : currentStepIndex === 2
          ? 'Step 3: Provision Virtual Infrastructure'
          : 'Step 4: Inspect Topology DAG & Drift'
      }**

**What would you like to do, Sir?**`;

      setMessages([
        {
          id: 'ayushi-init',
          sender: 'ayushi',
          text: welcomeText,
          timestamp: 'Just now',
          action:
            currentStepIndex === 0
              ? {
                  type: 'execute_command',
                  label: 'Execute Directive: terraform init',
                  command: 'terraform init'
                }
              : currentStepIndex === 1
              ? {
                  type: 'execute_command',
                  label: 'Execute Directive: terraform plan',
                  command: 'terraform plan'
                }
              : currentStepIndex === 2
              ? {
                  type: 'execute_command',
                  label: 'Execute Directive: terraform apply',
                  command: 'terraform apply -auto-approve'
                }
              : {
                  type: 'switch_view',
                  label: 'Project Holographic D3 DAG',
                  view: 'd3-graph'
                }
        }
      ]);
    }
  }, [activeScenario, currentStepIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Voice synthesis (SpeechSynthesis)
  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const clean = text
        .replace(/[*#`_>-]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/https?:\/\/\S+/g, '');

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Try selecting a smooth English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen'))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleToggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      speakText('Voice synthesis activated, Sir. I am listening.');
    }
  };

  const extractCodeBlock = (text: string): { filename: string; code: string; language: string } | undefined => {
    const match = text.match(/```([a-zA-Z]*)\n([\s\S]*?)```/);
    if (match) {
      const language = match[1] || 'hcl';
      const code = match[2];
      const filename = language === 'hcl' ? 'main.tf' : language === 'yaml' ? 'k8s-pod.yaml' : 'variables.tf';
      return { filename, code, language };
    }
    return undefined;
  };

  // Ayushi's Iron Man Jarvis/Edith reasoning engine
  const generateAyushiResponse = (
    query: string
  ): {
    reply: string;
    action?: ChatMessage['action'];
    codeSnippet?: ChatMessage['codeSnippet'];
  } => {
    const q = query.toLowerCase();

    // 1. "What next", "what should I do", "how to use", "stuck"
    if (q.includes('what next') || q.includes('what to do') || q.includes('how to use') || q.includes('stuck') || q.includes('next step') || q.includes('where to start')) {
      if (currentStepIndex === 0) {
        return {
          reply: `Right away, Sir. Allow me to chart our flight path:

1. **Step 1: Initialize Provider Plugins** (\`terraform init\`)
   Terraform must download the AWS provider binary tailored for our LocalStack $0 endpoint.
2. **Step 2: Preview Resources** (\`terraform plan\`)
   We will inspect the creation of the hardened EC2 VM, EBS volume, and Security Group.
3. **Step 3: Provision Virtual Infrastructure** (\`terraform apply\`)
   I will write the live resource IDs into our in-memory state.
4. **Step 4: Holographic D3 DAG**
   We will project the force-directed topology graph.

Shall I commence **Step 1: terraform init** for you right now, Sir?`,
          action: {
            type: 'execute_command',
            label: 'Execute: terraform init, Ayushi',
            command: 'terraform init'
          }
        };
      } else if (currentStepIndex === 1) {
        return {
          reply: `Providers are already primed and initialized, Sir.

Your next tactical directive is **Step 2: Generate the Execution Plan** (\`terraform plan\`). This will calculate the delta between the null state and your codified infrastructure before modifying state.

Shall I run the plan sequence for you, Sir?`,
          action: {
            type: 'execute_command',
            label: 'Execute: terraform plan, Ayushi',
            command: 'terraform plan'
          }
        };
      } else if (currentStepIndex === 2) {
        return {
          reply: `Execution plan is verified, Sir! All resources are clean with zero destructive replacements.

Your next directive is **Step 3: Provision Virtual Infrastructure** (\`terraform apply -auto-approve\`). This will spin up the virtual EC2 instance \`web_vm\` and attached 50GB encrypted gp3 volume.

Shall I deploy the infrastructure, Sir?`,
          action: {
            type: 'execute_command',
            label: 'Execute: terraform apply, Ayushi',
            command: 'terraform apply -auto-approve'
          }
        };
      } else {
        return {
          reply: `Your infrastructure is fully deployed and active in state, Sir!

We have two optimal directives at this stage:
1. **Project D3 Force Graph** to view the live dependency edges between your VM and attached disk.
2. **Launch Drift Engine** to simulate an engineer altering security rules out-of-band in AWS console, and watch Terraform detect it!

What is your directive, Sir?`,
          action: {
            type: 'switch_view',
            label: 'Project D3 Force Graph, Ayushi',
            view: 'd3-graph'
          }
        };
      }
    }

    // 2. Direct orders: "deploy", "apply", "run apply"
    if (q.includes('deploy') || q.includes('apply') || q.includes('provision') || q.includes('build it')) {
      return {
        reply: `Initiating provisioning protocol at your command, Sir. Executing \`terraform apply -auto-approve\` now.

All resources are being staged against the LocalStack zero-cost isolation matrix. No credit card or cloud bill will be charged, Sir.`,
        action: {
          type: 'execute_command',
          label: 'Run terraform apply, Sir',
          command: 'terraform apply -auto-approve'
        }
      };
    }

    // 3. "plan", "preview"
    if (q.includes('plan') || q.includes('preview')) {
      return {
        reply: `Generating infrastructure execution plan, Sir. Scanning \`main.tf\` and calculating DAG dependencies against state serial #${activeScenario?.id || '0'}.`,
        action: {
          type: 'execute_command',
          label: 'Run terraform plan, Sir',
          command: 'terraform plan'
        }
      };
    }

    // 4. "init", "initialize"
    if (q.includes('init') || q.includes('download provider')) {
      return {
        reply: `Initializing provider plugins, Sir. Downloading hashicorp/aws v5.42.0 and configuring local emulation endpoints.`,
        action: {
          type: 'execute_command',
          label: 'Run terraform init, Sir',
          command: 'terraform init'
        }
      };
    }

    // 5. "d3", "graph", "dag", "topology", "visual"
    if (q.includes('graph') || q.includes('d3') || q.includes('dag') || q.includes('topology') || q.includes('map')) {
      return {
        reply: `Projecting holographic D3 force-directed DAG, Sir.

You can drag nodes to test physics repulsion, inspect dependency edges (e.g. EC2 depends on Security Group), and examine live attributes. Switching view now, Sir.`,
        action: {
          type: 'switch_view',
          label: 'Switch to D3 DAG View',
          view: 'd3-graph'
        }
      };
    }

    // 6. "drift", "simulate drift", "out of band"
    if (q.includes('drift') || q.includes('divergence') || q.includes('out-of-band') || q.includes('reconcile')) {
      return {
        reply: `Launching Drift Detection Diagnostic Suite, Sir.

In production, cloud drift occurs when someone manually modifies security groups, tags, or firewall rules directly in the cloud console. Terraform identifies the divergence via \`terraform plan\` and reconciles it back to your source code upon apply.

Opening Drift Simulator now, Sir.`,
        action: {
          type: 'open_drift',
          label: 'Launch Drift Engine, Ayushi'
        }
      };
    }

    // 7. "k8s", "k9s", "kubernetes", "pods", "cluster"
    if (q.includes('k9s') || q.includes('kubernetes') || q.includes('k8s') || q.includes('pods')) {
      return {
        reply: `Switching to tactical Kubernetes Radar (K9s visual terminal), Sir.

All telemetry, namespace pods, and node metrics are rendered with zero cloud expense. You can navigate with your keyboard directly, Sir.`,
        action: {
          type: 'open_k9s',
          label: 'Launch K9s Terminal, Ayushi'
        }
      };
    }

    // 8. "run on laptop", "local", "docker", "my computer"
    if (q.includes('local') || q.includes('laptop') || q.includes('docker') || q.includes('pc') || q.includes('computer')) {
      return {
        reply: `Accessing local deployment blueprint, Sir.

You can run this exact architecture on your personal computer using Docker Compose and LocalStack Community without an AWS or Azure account. Opening the run guide now, Sir.`,
        action: {
          type: 'open_local_run',
          label: 'Open Zero-Cost Local Run Guide'
        }
      };
    }

    // 9. "security", "imdsv2", "ssrf"
    if (q.includes('security') || q.includes('imdsv2') || q.includes('ssrf') || q.includes('harden')) {
      const code = `# Hardened EC2 Security Blueprint (IMDSv2 Enforced)
resource "aws_instance" "hardened_vm" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"

  # Iron-clad IMDSv2 defense against SSRF
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv1 strictly disabled
    http_put_response_hop_limit = 1          # Prevents container traversal
  }

  root_block_device {
    encrypted   = true
    volume_type = "gp3"
  }

  tags = {
    Name    = "production-secure-vm"
    Owner   = "Madhav Gupta"
    Auditor = "Ayushi AI"
  }
}`;
      return {
        reply: `Security diagnostics complete, Sir.

I have verified our IMDSv2 configuration. By specifying \`http_tokens = "required"\` and \`http_put_response_hop_limit = 1\`, we neutralize Server-Side Request Forgery (SSRF) threats attempting to extract AWS STS credentials from instance metadata.

Here is the hardened specification, Sir:`,
        codeSnippet: {
          filename: 'security_hardened.tf',
          code,
          language: 'hcl'
        },
        action: {
          type: 'apply_code',
          label: 'Apply Hardened Security Code to Workspace',
          filename: 'security_hardened.tf',
          code
        }
      };
    }

    // Default intelligent conversational butler response
    return {
      reply: `Certainly, Sir. I have processed your inquiry regarding "${query}".

As your tactical assistant for this **Zero-Cloud Studio** (Curated by **Madhav Gupta**), I am ready to carry out any directive:
• Say **"Deploy VM"** to run apply automatically.
• Say **"Show me the graph"** to inspect the D3 force topology.
• Say **"Simulate drift"** to test out-of-band drift healing.
• Say **"What next"** if you ever need guidance on the current step.

What is your command, Sir?`
    };
  };

  const handleSend = (customText?: string) => {
    const promptToSend = (customText || inputText).trim();
    if (!promptToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const response = generateAyushiResponse(promptToSend);
      const ayushiMsg: ChatMessage = {
        id: `ayushi-${Date.now()}`,
        sender: 'ayushi',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
        codeSnippet: response.codeSnippet
      };

      setMessages((prev) => [...prev, ayushiMsg]);
      setIsLoading(false);
      speakText(response.reply);
    }, 450);
  };

  const handleActionClick = (action: NonNullable<ChatMessage['action']>) => {
    if (action.type === 'execute_command' && action.command) {
      onExecuteCommand?.(action.command);
      speakText(`Executing ${action.command} now, Sir.`);
    } else if (action.type === 'switch_view' && action.view) {
      onSwitchStudioView?.(action.view);
      speakText(`Switching display to holographic D3 DAG, Sir.`);
    } else if (action.type === 'open_drift') {
      onOpenDriftModal?.();
      speakText(`Opening Drift Detection protocol, Sir.`);
    } else if (action.type === 'open_k9s') {
      onOpenK9s?.();
      speakText(`Launching K9s radar, Sir.`);
    } else if (action.type === 'open_local_run') {
      onOpenLocalRun?.();
      speakText(`Accessing local deployment guide, Sir.`);
    } else if (action.type === 'apply_code' && action.code && action.filename) {
      onApplyCodeToWorkspace?.(action.filename, action.code);
      speakText(`Code injected into workspace as ${action.filename}, Sir.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[520px] bg-[#070d17]/95 backdrop-blur-xl border-l border-cyan-500/40 shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden text-slate-100 font-sans animate-slideLeft">
      {/* Holographic Header Bar (Iron Man HUD / Arc Reactor Style) */}
      <div className="px-4 py-3.5 border-b border-cyan-500/30 bg-[#081324] flex items-center justify-between shrink-0 relative overflow-hidden">
        {/* Subtle HUD scanline background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/20 via-transparent to-sky-950/20 pointer-events-none" />

        {/* Brand & Arc Reactor Core */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            {/* Pulsing Arc Reactor Rings */}
            <div className="w-10 h-10 rounded-full bg-cyan-950/90 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/40">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-white flex items-center justify-center animate-pulse">
                <Radio className="w-3 h-3 text-cyan-950" />
              </div>
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
                <span>AYUSHI</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  JARVIS / EDITH HUD
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
              <span>·</span>
              <span>Tactical DevOps AI</span>
              <span>·</span>
              <span className="text-slate-500 text-[10px]">At your service, Sir</span>
            </div>
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-1.5 relative z-10">
          {/* Audio Speech Toggle */}
          <button
            onClick={handleToggleVoice}
            title={voiceEnabled ? 'Mute Ayushi voice' : 'Enable Ayushi voice response'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              voiceEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Futuristic Telemetry HUD Bar */}
      <div className="px-4 py-1.5 bg-[#050c18] border-b border-cyan-900/40 flex items-center justify-between text-[10.5px] font-mono text-cyan-400/80 shrink-0">
        <div className="flex items-center gap-3">
          <span>LATENCY: 4ms</span>
          <span>·</span>
          <span>COST: $0.00 ZERO-CLOUD</span>
          <span>·</span>
          <span>STATE: SECURE</span>
        </div>
        <div className="text-slate-400">
          Target: <span className="text-cyan-300">{activeScenario?.domain?.toUpperCase() || 'AWS'}</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl p-3.5 space-y-2.5 transition-all ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs shadow-md'
                  : 'bg-[#0d182b] border border-cyan-500/30 text-slate-200 rounded-bl-xs shadow-lg shadow-cyan-950/40'
              }`}
            >
              {msg.sender === 'ayushi' && (
                <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20 text-[10px] font-mono text-cyan-400">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    AYUSHI · A.I. COMMAND
                  </span>
                  <span className="text-slate-500">{msg.timestamp}</span>
                </div>
              )}

              {/* Message text with markdown formatting */}
              <div className="leading-relaxed whitespace-pre-wrap font-sans text-[12px]">
                {msg.text}
              </div>

              {/* Code Snippet Card */}
              {msg.codeSnippet && (
                <div className="mt-2 rounded-lg bg-[#050a14] border border-slate-800 overflow-hidden font-mono text-[11px]">
                  <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-400">
                    <span className="text-sky-300 font-bold">{msg.codeSnippet.filename}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.codeSnippet!.code);
                        setCopiedId(msg.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 text-cyan-300 overflow-x-auto whitespace-pre max-h-56">
                    {msg.codeSnippet.code}
                  </pre>
                </div>
              )}

              {/* One-Click Directive Action Button */}
              {msg.action && (
                <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-end">
                  <button
                    onClick={() => handleActionClick(msg.action!)}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-600/30 cursor-pointer active:scale-95 transition-all"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{msg.action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-[#0d182b] border border-cyan-500/30 rounded-xl text-xs text-cyan-300 animate-pulse w-fit font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Ayushi calculating tactical sequence, Sir...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Tactical Command Chips (What Would You Like to Do, Sir?) */}
      <div className="px-3 py-2 bg-[#091120] border-t border-cyan-900/30 flex flex-wrap gap-1.5 shrink-0">
        <span className="text-[10px] font-mono text-cyan-400/70 w-full uppercase">
          Tactical Directives:
        </span>
        <button
          onClick={() => handleSend('What should I do next, Ayushi? Guide me.')}
          className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-700/50 rounded-full text-[11px] font-medium transition-all cursor-pointer"
        >
          👉 "What should I do next, Ayushi?"
        </button>
        <button
          onClick={() => handleSend('Ayushi, deploy the AWS VM now')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-full text-[11px] transition-all cursor-pointer"
        >
          🚀 "Deploy the VM, Ayushi"
        </button>
        <button
          onClick={() => handleSend('Show me the D3 architecture graph, Ayushi')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-full text-[11px] transition-all cursor-pointer"
        >
          🌐 "Show D3 Force Graph"
        </button>
        <button
          onClick={() => handleSend('Ayushi, simulate cloud drift on my security group')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-full text-[11px] transition-all cursor-pointer"
        >
          ⚡ "Simulate Cloud Drift"
        </button>
        <button
          onClick={() => handleSend('How do I run this on my laptop for $0, Ayushi?')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-full text-[11px] transition-all cursor-pointer"
        >
          💻 "Run on my laptop for $0"
        </button>
      </div>

      {/* Command Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#060c18] border-t border-cyan-500/30 flex items-center gap-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Ask Ayushi (e.g. "What next, Sir?", "Deploy VM", "Show D3 Graph")...'
          className="flex-1 bg-slate-900/90 border border-cyan-900/60 focus:border-cyan-400 text-xs text-white placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 outline-none font-sans transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-40 text-white rounded-xl shadow-md shadow-cyan-600/30 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
