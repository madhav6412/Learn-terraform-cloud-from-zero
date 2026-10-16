import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = Number(process.env.PORT) || 3000;

// Shared Gemini AI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AssistantChatRequest {
  message: string;
  context?: {
    scenarioId?: string;
    scenarioTitle?: string;
    scenarioCategory?: string;
    activeFileName?: string;
    activeFileContent?: string;
    lastCommandOutput?: string;
    isInitialized?: boolean;
    stateResourcesCount?: number;
    owner?: string;
  };
  history?: Array<{
    role: 'user' | 'model';
    text: string;
  }>;
}

// Fallback intelligence provider if Gemini API key is missing or offline
function getIntelligentFallback(message: string, context?: AssistantChatRequest['context']): string {
  const lower = message.toLowerCase();
  const scenarioTitle = context?.scenarioTitle || 'Terraform & Kubernetes Zero-Cloud Lab';
  const fileName = context?.activeFileName || 'main.tf';

  if (lower.includes('error') || lower.includes('stuck') || lower.includes('fail') || lower.includes('fix')) {
    return `### 🛠️ Troubleshooting & Debugging Guide

**Active Context:** ${scenarioTitle} (${fileName})

1. **Initialization Check:**
   Ensure you run \`terraform init\` first. Terraform must initialize backend state and configure the provider plugins before generating execution plans.

2. **Common Zero-Cloud Traps:**
   - **LocalStack Endpoint Routing:** Ensure your AWS provider points to \`http://localhost:4566\` with \`s3_use_path_style = true\` and \`skip_credentials_validation = true\`.
   - **Kubernetes / Kind Clusters:** Ensure your kubeconfig points to your local cluster context (\`kubectl config current-context\` → \`kind-kind\`).
   - **State Drift:** If resources already exist or state is locked, use \`terraform refresh\` or inspect with \`terraform state list\`.

3. **Recommended Next Command:**
\`\`\`bash
terraform init
terraform plan
\`\`\`

Would you like me to inspect your current \`${fileName}\` code and fix any syntax errors directly?`;
  }

  if (lower.includes('vm') || lower.includes('ec2') || lower.includes('azure vm')) {
    return `### 💻 Zero-Cost Virtual Machine (EC2 & Azure VM) Architecture

In this lab curated by **Madhav Gupta**, you can practice full VM provisioning with **$0 cloud expenditure**:

- **AWS EC2 (LocalStack):**
  - Uses \`aws_instance\` with \`metadata_options { http_tokens = "required" }\` (IMDSv2 hardening).
  - Configures dynamic \`user_data\` with \`user_data_replace_on_change = true\` for cloud-init nginx provisioning.
  - Provisions secondary EBS volumes with \`aws_volume_attachment\`.
  
- **Azure Linux VM (Azurite / Zero-Cloud):**
  - Provisions \`azurerm_linux_virtual_machine\` with SSH key authentication (\`tls_private_key\`).
  - Configures \`custom_data\` with Base64-encoded cloud-init script.
  - Attaches persistent \`azurerm_managed_disk\` (64GB Premium SSD) via LUN 10 with write-through caching.

Run the scenario from the sidebar or click **"Run Locally ($0 Cloud)"** to test it on your machine!`;
  }

  if (lower.includes('k8s') || lower.includes('kubernetes') || lower.includes('eks') || lower.includes('aks')) {
    return `### ☸️ Kubernetes (EKS & AKS) Zero-Cloud Practice

You can master enterprise Kubernetes clusters with zero AWS/Azure bills:
1. **AWS EKS Local Simulation:**
   - Emulate EKS with **Kind (Kubernetes in Docker)** or **LocalStack EKS**.
   - Manage namespaces, deployment replicas, cluster autoscalers, and IRSA (IAM Roles for Service Accounts) with Terraform.
2. **Azure AKS Local Simulation:**
   - Emulate AKS system & user node pools with Kind multi-node configurations.
   - Configure Azure Workload Identity and Kubernetes Ingress controllers.

**Try this quick test command in terminal:**
\`\`\`bash
kubectl get nodes
kubectl get namespaces
\`\`\`
Ask me any specific Kubernetes question, like HPA scaling, CrashLoopBackOff debugging, or NetworkPolicies!`;
  }

  return `### 💡 Madhav Gupta's DevOps & Cloud AI Assistant

I am here to guide you through **Terraform & Kubernetes zero-cloud mastery**! 

**Here is what I can do for you right now:**
- 🔍 **Code Review & Fix:** Analyze your active file (\`${fileName}\`) and fix syntax, lifecycle rules, or provider configurations.
- ⚡ **Explain Command Outputs:** Demystify plan outputs, state locks, or validation errors.
- 🎯 **Interview Coaching:** Quiz you on tricky Staff/Principal DevOps interview questions from Techikrish & real production incidents.
- 🚀 **Generate Custom HCL/YAML:** Ask me to write configurations for VPCs, EKS/AKS clusters, EC2/Azure VMs, or LocalStack services.

Tell me what you'd like to build or where you feel stuck!`;
}

// AI Assistant Chat Route
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, context, history } = req.body as AssistantChatRequest;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const scenarioInfo = context
      ? `Current Scenario: "${context.scenarioTitle || 'Unknown'}" (${context.scenarioCategory || 'general'}, Scenario ID: ${context.scenarioId || 'unknown'})
Active File: "${context.activeFileName || 'main.tf'}"
Active File Content Preview:
\`\`\`hcl
${(context.activeFileContent || '').slice(0, 1500)}
\`\`\`
Is Initialized: ${context.isInitialized ? 'Yes' : 'No'}
Resources in State: ${context.stateResourcesCount || 0}
Last Terminal Output Preview:
\`\`\`
${(context.lastCommandOutput || '').slice(0, 600)}
\`\`\`
Lab Owner: Madhav Gupta`
      : 'No scenario context provided.';

    const systemInstruction = `You are the built-in AI Assistant for "Terraform Zero-Cloud Lab", an advanced DevOps & Cloud engineering training platform owned and curated by Madhav Gupta.
Your goal is to help the user whenever they are stuck, explain Terraform and Kubernetes concepts, debug errors, generate production-grade HCL or Kubernetes YAML, and prepare them for top-tier DevOps interviews.

PLATFORM CAPABILITIES & RULES:
1. Emphasize ZERO-CLOUD COST ($0.00). Users practice using LocalStack, Docker, Kind (Kubernetes in Docker), Azurite, and local state without needing AWS/Azure credit cards or subscriptions.
2. The user has access to AWS EC2 VM, Azure Linux VM, AWS EKS, and Azure AKS scenarios, along with Techikrish interview incident scenarios.
3. Keep code production-grade: include variables, proper tags, security best practices (IMDSv2, KMS encryption, non-root containers, NetworkPolicies, OIDC/Workload Identity).
4. When writing code, output clean, formatted code blocks with appropriate language tags (\`\`\`hcl or \`\`\`yaml or \`\`\`bash).
5. Always address the user directly, encouraging them and providing clear step-by-step actionable commands.
6. Acknowledge Madhav Gupta as the creator/owner of this platform when relevant.`;

    // Try calling Gemini API if key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const contents = [
          {
            role: 'user',
            parts: [
              {
                text: `[SYSTEM CONTEXT]\n${scenarioInfo}\n\n[USER QUESTION]\n${message}`
              }
            ]
          }
        ];

        // Include last few history turns if provided
        if (history && history.length > 0) {
          const formattedHistory = history.slice(-4).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          }));
          contents.unshift(...(formattedHistory as any));
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        const replyText = response.text || getIntelligentFallback(message, context);
        res.json({ reply: replyText, source: 'gemini-3.8-flash' });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to local intelligence engine:', geminiError?.message);
      }
    }

    // Fallback if no key or error
    const fallbackText = getIntelligentFallback(message, context);
    res.json({ reply: fallbackText, source: 'offline-copilot' });
  } catch (error: any) {
    console.error('Assistant error:', error);
    res.status(500).json({ error: 'Failed to process AI assistant request' });
  }
});

// Start Express Server with Vite Dev Server in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Terraform Zero-Cloud Lab running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
