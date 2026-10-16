import React, { useState } from 'react';
import { LAB_SCENARIOS } from './data/scenarios';
import { LabScenario, TerraformFile, CommandLog, TerraformState, ResourceNode } from './types/terraform';
import { createInitialState, extractNodesFromScenario } from './utils/hclEngine';

import { Header, ActiveSection } from './components/Header';
import { CodeWorkspace } from './components/CodeWorkspace';
import { TerminalPane } from './components/TerminalPane';
import { K9sTerminalView } from './components/K9sTerminalView';
import { ProjectBuilderModal } from './components/ProjectBuilderModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { TechikrishInterviewModal } from './components/TechikrishInterviewModal';
import { TerraformAcademyModal } from './components/TerraformAcademyModal';
import { ReadmeModal } from './components/ReadmeModal';
import { LocalRunGuideModal } from './components/LocalRunGuideModal';
import { ChallengesModal } from './components/ChallengesModal';
import { D3ForceGraph } from './components/D3ForceGraph';
import { DriftDetectionModal } from './components/DriftDetectionModal';
import { DRIFT_SCENARIOS, DriftItem } from './data/driftScenarios';
import { ScenarioWorkflowStepper } from './components/ScenarioWorkflowStepper';
import { QuickStartGuideModal } from './components/QuickStartGuideModal';

import {
  Layers,
  Terminal,
  Cpu,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  FolderPlus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  Box,
  ExternalLink,
  Code2,
  Share2,
  FileCode,
  Copy,
  Check,
  Flame
} from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeSection, setActiveSection] = useState<ActiveSection>('terraform-studio');
  const [studioView, setStudioView] = useState<'editor' | 'd3-graph' | 'state-json'>('editor');
  const [copiedState, setCopiedState] = useState(false);

  // Scenario & Files State
  const [scenarios] = useState<LabScenario[]>(LAB_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(LAB_SCENARIOS[0].id);
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  const [files, setFiles] = useState<TerraformFile[]>(activeScenario.files);
  const [activeFileName, setActiveFileName] = useState<string>(activeScenario.activeFile);
  const activeFile = files.find((f) => f.name === activeFileName) || files[0];

  // State & Terminal Logs
  const [terraformState, setTerraformState] = useState<TerraformState>(createInitialState(activeScenario.id));
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>(
    extractNodesFromScenario(activeScenario, createInitialState(activeScenario.id))
  );
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-log-0',
      timestamp: '00:00:01',
      command: 'system info',
      output: `[SUCCESS] Studio Environment Ready
Owner: Madhav Gupta
Zero-Cloud Simulation: LocalStack, Kind & In-Memory HCL2 Engine Active ($0.00 Expense)
Loaded Scenario: ${activeScenario.title}`,
      exitCode: 0
    }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showHowToUseModal, setShowHowToUseModal] = useState<boolean>(false);

  // Modals & Drawers
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string | undefined>(undefined);
  const [showLocalRunModal, setShowLocalRunModal] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showAcademyModal, setShowAcademyModal] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [showProjectBuilder, setShowProjectBuilder] = useState(false);
  const [activeDrift, setActiveDrift] = useState<DriftItem | null>(null);
  const [showDriftModal, setShowDriftModal] = useState(false);

  // Compute recommended next action based on stepper & drift
  const getSuggestedAction = () => {
    if (activeDrift) {
      return {
        command: 'terraform plan',
        label: 'Inspect active out-of-band drift report'
      };
    }
    if (currentStepIndex === 0) {
      return {
        command: 'terraform init',
        label: 'Initialize AWS & LocalStack provider plugins'
      };
    }
    if (currentStepIndex === 1) {
      return {
        command: 'terraform plan',
        label: 'Preview resource additions'
      };
    }
    if (currentStepIndex === 2) {
      return {
        command: 'terraform apply -auto-approve',
        label: 'Provision infrastructure into virtual state'
      };
    }
    if (currentStepIndex === 3) {
      return {
        command: 'terraform state list',
        label: 'Inspect provisioned state resources'
      };
    }
    return {
      command: 'k9s',
      label: 'Launch K9s visual Kubernetes terminal'
    };
  };
  const suggestedAction = getSuggestedAction();

  // Switch scenario
  const handleSelectScenario = (id: string) => {
    const sc = scenarios.find((s) => s.id === id);
    if (!sc) return;
    setActiveScenarioId(id);
    setFiles(sc.files);
    setActiveFileName(sc.activeFile);
    const newState = createInitialState(sc.id);
    setTerraformState(newState);
    setResourceNodes(extractNodesFromScenario(sc, newState));
    setIsApplied(false);
    setCurrentStepIndex(0);
    setLogs((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        command: `switch-scenario ${sc.id}`,
        output: `[INFO] Switched to ${sc.title}\nZero-Cloud cost requirement: ${sc.costRequirement}\nAyushi Protocol: Ready for Step 1 (terraform init)`,
        exitCode: 0
      }
    ]);
  };

  // File mutations
  const handleUpdateFileContent = (fileName: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.name === fileName ? { ...f, content: newContent } : f))
    );
  };

  const handleResetFiles = () => {
    setFiles(activeScenario.files);
    setActiveFileName(activeScenario.activeFile);
  };

  const handleCreateFile = (fileName: string, content: string) => {
    const extension = fileName.split('.').pop() || 'tf';
    const language = extension === 'json' ? 'json' : extension === 'yaml' || extension === 'yml' ? 'yaml' : 'hcl';
    const newFile: TerraformFile = {
      name: fileName,
      path: fileName,
      language: language as any,
      content
    };
    setFiles((prev) => {
      const existing = prev.find((f) => f.name === fileName);
      if (existing) {
        return prev.map((f) => (f.name === fileName ? newFile : f));
      }
      return [...prev, newFile];
    });
    setActiveFileName(fileName);
  };

  const handleDeleteFile = (fileName: string) => {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    const remaining = files.filter((f) => f.name !== fileName);
    if (remaining.length > 0) {
      setActiveFileName(remaining[0].name);
    }
  };

  // Command execution
  // Command execution
  const executeCommand = (command: string) => {
    setIsExecuting(true);
    const timestamp = new Date().toLocaleTimeString();

    setTimeout(() => {
      try {
        const lower = command.toLowerCase().trim();

        // 1. K9s launcher
        if (lower === 'k9s' || lower.startsWith('k9s ')) {
          setActiveSection('kubernetes-k9s');
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: '[SUCCESS] Launching K9s Visual Kubernetes Terminal simulator...\nConnecting to kind-local-cluster v1.29.2 ($0.00 cloud cost)',
              exitCode: 0
            }
          ]);
          return;
        }

        // 2. Terraform Init
        if (lower.startsWith('terraform init')) {
          setCurrentStepIndex((prev) => Math.max(prev, 1));
          const isAws = activeScenario.category === 'vm-aws' || activeScenario.category === 'kubernetes-aws';
          const isAzure = activeScenario.category === 'vm-azure' || activeScenario.category === 'kubernetes-azure';

          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.42.0 (signed by HashiCorp)...
- Finding hashicorp/azurerm versions matching "~> 3.90"...
- Installing hashicorp/azurerm v3.95.0 (signed by HashiCorp)...
- Finding hashicorp/kubernetes versions matching "~> 2.25"...
- Installing hashicorp/kubernetes v2.26.0 (signed by HashiCorp)...

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure.

[AYUSHI A.I.]: "Providers primed for ${isAws ? 'LocalStack AWS' : isAzure ? 'AzureRM Sandbox' : 'Zero-Cost Simulation'}, Sir. Next directive: Step 2 (terraform plan)."`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 3. Terraform Plan
        if (lower.startsWith('terraform plan')) {
          setCurrentStepIndex((prev) => Math.max(prev, 2));

          if (activeDrift) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: activeDrift.planOutput,
                exitCode: 2
              }
            ]);
            return;
          }

          if (isApplied) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration
and found no differences, so no changes are needed.

[AYUSHI A.I.]: "State is in 100% equilibrium with codified HCL2 specifications, Sir."`,
                exitCode: 0
              }
            ]);
            return;
          }

          // Generate plan based on scenario
          let planDetails = '';
          if (activeScenario.id === 'azure-vm-linux-production') {
            planDetails = `Terraform will perform the following actions:

  # azurerm_resource_group.rg will be created
  + resource "azurerm_resource_group" "rg" {
      + id       = (known after apply)
      + location = "eastus"
      + name     = "rg-production-eastus"
    }

  # azurerm_linux_virtual_machine.main_vm will be created
  + resource "azurerm_linux_virtual_machine" "main_vm" {
      + admin_username        = "azureuser"
      + disable_password_auth = true
      + id                    = (known after apply)
      + name                  = "vm-prod-linux-01"
      + size                  = "Standard_B2s"
    }

  # azurerm_managed_disk.data_disk will be created
  + resource "azurerm_managed_disk" "data_disk" {
      + create_option        = "Empty"
      + disk_size_gb         = 64
      + id                   = (known after apply)
      + storage_account_type = "Premium_LRS"
    }

Plan: 3 to add, 0 to change, 0 to destroy.`;
          } else if (activeScenario.id === 'aws-eks-production-cluster') {
            planDetails = `Terraform will perform the following actions:

  # aws_eks_cluster.main will be created
  + resource "aws_eks_cluster" "main" {
      + arn      = (known after apply)
      + endpoint = (known after apply)
      + id       = (known after apply)
      + name     = "production-k8s-us-east-1"
      + version  = "1.29"
    }

  # aws_eks_node_group.workers will be created
  + resource "aws_eks_node_group" "workers" {
      + id             = (known after apply)
      + instance_types = ["t3.xlarge"]
      + scaling_config {
          + desired_size = 3
          + max_size     = 6
          + min_size     = 1
        }
    }

Plan: 4 to add, 0 to change, 0 to destroy.`;
          } else {
            planDetails = `Terraform will perform the following actions:

  # aws_security_group.web_sg will be created
  + resource "aws_security_group" "web_sg" {
      + arn    = (known after apply)
      + id     = (known after apply)
      + name   = "production-web-sg"
      + vpc_id = "vpc-0a1b2c3d4e5f6g7h8"
    }

  # aws_instance.web_vm will be created
  + resource "aws_instance" "web_vm" {
      + ami           = "ami-0c55b159cbfafe1f0"
      + arn           = (known after apply)
      + id            = (known after apply)
      + instance_type = "t3.medium"
      + metadata_options {
          + http_endpoint = "enabled"
          + http_tokens   = "required" # IMDSv2 Enforced
        }
      + tags          = { "Owner" = "Madhav Gupta", "Environment" = "production" }
    }

  # aws_ebs_volume.data_disk will be created
  + resource "aws_ebs_volume" "data_disk" {
      + encrypted = true
      + id        = (known after apply)
      + size      = 50
      + type      = "gp3"
    }

Plan: 3 to add, 0 to change, 0 to destroy.`;
          }

          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `${planDetails}

─────────────────────────────────────────────────────────────────────────────
Note: You didn't use the -out option to save this plan.
[AYUSHI A.I.]: "Plan generated, Sir. Ready for Step 3: terraform apply."`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 4. Terraform Apply
        if (lower.startsWith('terraform apply')) {
          if (activeDrift) {
            const resolvedTitle = activeDrift.title;
            const targetRes = activeDrift.targetResource;
            setActiveDrift(null);
            setIsApplied(true);
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `[RECONCILING OUT-OF-BAND DRIFT: "${resolvedTitle}"]
${targetRes}: Modifying...
${targetRes}: Stripping out-of-band console changes and enforcing codified HCL configuration...
${targetRes}: Modifications complete after 2s

Apply complete! Resources: 0 added, 1 changed, 0 destroyed.

[SUCCESS] Out-of-band cloud drift has been reconciled. Infrastructure matches codified Terraform state baseline (Owner: Madhav Gupta).
[AYUSHI A.I.]: "Compliance restored, Sir. Security perimeter is 100% verified."`,
                exitCode: 0
              }
            ]);
            return;
          }

          setIsApplied(true);
          setCurrentStepIndex((prev) => Math.max(prev, 3));

          let newResources: any[] = [];
          let newOutputs: any = {};
          let applyLogOutput = '';

          if (activeScenario.id === 'azure-vm-linux-production') {
            newResources = [
              {
                mode: 'managed',
                type: 'azurerm_resource_group',
                name: 'rg',
                provider: 'provider["registry.terraform.io/hashicorp/azurerm"]',
                instances: [{ schema_version: 0, attributes: { id: '/subscriptions/00000000/resourceGroups/rg-prod', name: 'rg-production-eastus', location: 'eastus' } }]
              },
              {
                mode: 'managed',
                type: 'azurerm_linux_virtual_machine',
                name: 'main_vm',
                provider: 'provider["registry.terraform.io/hashicorp/azurerm"]',
                instances: [{ schema_version: 0, attributes: { id: '/subscriptions/00000000/virtualMachines/vm-prod-linux-01', name: 'vm-prod-linux-01', size: 'Standard_B2s', private_ip: '10.0.1.4', public_ip: '20.52.14.88', owner: 'Madhav Gupta' } }]
              },
              {
                mode: 'managed',
                type: 'azurerm_managed_disk',
                name: 'data_disk',
                provider: 'provider["registry.terraform.io/hashicorp/azurerm"]',
                instances: [{ schema_version: 0, attributes: { id: '/subscriptions/00000000/disks/disk-prod-data', disk_size_gb: 64, storage_account_type: 'Premium_LRS' } }]
              }
            ];
            newOutputs = {
              vm_id: { value: '/subscriptions/00000000/virtualMachines/vm-prod-linux-01', type: 'string' },
              public_ip_address: { value: '20.52.14.88', type: 'string' },
              admin_username: { value: 'azureuser', type: 'string' },
              owner: { value: 'Madhav Gupta', type: 'string' }
            };
            applyLogOutput = `azurerm_resource_group.rg: Creating...
azurerm_resource_group.rg: Creation complete after 1s
azurerm_managed_disk.data_disk: Creating...
azurerm_managed_disk.data_disk: Creation complete after 2s [id=/subscriptions/00000000/disks/disk-prod-data]
azurerm_linux_virtual_machine.main_vm: Creating...
azurerm_linux_virtual_machine.main_vm: Creation complete after 6s [id=/subscriptions/00000000/virtualMachines/vm-prod-linux-01]

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:
admin_username = "azureuser"
public_ip_address = "20.52.14.88"
vm_id = "/subscriptions/00000000/virtualMachines/vm-prod-linux-01"
owner = "Madhav Gupta"
cost = "$0.00 (Zero-Cost Sandbox Emulation)"`;
          } else if (activeScenario.id === 'aws-eks-production-cluster') {
            newResources = [
              {
                mode: 'managed',
                type: 'aws_eks_cluster',
                name: 'main',
                provider: 'provider["registry.terraform.io/hashicorp/aws"]',
                instances: [{ schema_version: 0, attributes: { id: 'production-k8s-us-east-1', arn: 'arn:aws:eks:us-east-1:123456789012:cluster/production-k8s-us-east-1', endpoint: 'https://A1B2C3D4E5.gr7.us-east-1.eks.amazonaws.com', version: '1.29' } }]
              },
              {
                mode: 'managed',
                type: 'aws_eks_node_group',
                name: 'workers',
                provider: 'provider["registry.terraform.io/hashicorp/aws"]',
                instances: [{ schema_version: 0, attributes: { id: 'eks-workers-node-group', instance_types: ['t3.xlarge'], desired_size: 3, owner: 'Madhav Gupta' } }]
              }
            ];
            newOutputs = {
              cluster_name: { value: 'production-k8s-us-east-1', type: 'string' },
              cluster_endpoint: { value: 'https://A1B2C3D4E5.gr7.us-east-1.eks.amazonaws.com', type: 'string' },
              kubeconfig_command: { value: 'aws eks update-kubeconfig --name production-k8s-us-east-1 --region us-east-1', type: 'string' },
              owner: { value: 'Madhav Gupta', type: 'string' }
            };
            applyLogOutput = `aws_eks_cluster.main: Creating...
aws_eks_cluster.main: Creation complete after 8s [id=production-k8s-us-east-1]
aws_eks_node_group.workers: Creating...
aws_eks_node_group.workers: Creation complete after 5s [id=eks-workers-node-group]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:
cluster_name = "production-k8s-us-east-1"
cluster_endpoint = "https://A1B2C3D4E5.gr7.us-east-1.eks.amazonaws.com"
kubeconfig_command = "aws eks update-kubeconfig --name production-k8s-us-east-1 --region us-east-1"
owner = "Madhav Gupta"
cost = "$0.00 (Zero-Cost LocalStack/Kind Emulation)"`;
          } else {
            newResources = [
              {
                mode: 'managed',
                type: 'aws_security_group',
                name: 'web_sg',
                provider: 'provider["registry.terraform.io/hashicorp/aws"]',
                instances: [{ schema_version: 1, attributes: { id: 'sg-0a1b2c3d4e5f6g7h8', name: 'production-web-sg', vpc_id: 'vpc-0a1b2c3d4e5f6g7h8' } }]
              },
              {
                mode: 'managed',
                type: 'aws_instance',
                name: 'web_vm',
                provider: 'provider["registry.terraform.io/hashicorp/aws"]',
                instances: [{ schema_version: 1, attributes: { id: 'i-09f8e4381b0a92d', instance_type: 't3.medium', private_ip: '10.0.1.42', owner: 'Madhav Gupta', imds_tokens: 'required' } }]
              },
              {
                mode: 'managed',
                type: 'aws_ebs_volume',
                name: 'data_disk',
                provider: 'provider["registry.terraform.io/hashicorp/aws"]',
                instances: [{ schema_version: 0, attributes: { id: 'vol-0a1b2c3d4e5f6g7h8', size: 50, encrypted: true } }]
              },
              {
                mode: 'managed',
                type: 'aws_volume_attachment',
                name: 'ebs_att',
                provider: 'provider["registry.terraform.io/hashicorp/aws"]',
                instances: [{ schema_version: 0, attributes: { id: 'vai-3829104', instance_id: 'i-09f8e4381b0a92d', volume_id: 'vol-0a1b2c3d4e5f6g7h8' } }]
              }
            ];
            newOutputs = {
              instance_id: { value: 'i-09f8e4381b0a92d', type: 'string' },
              data_volume_id: { value: 'vol-0a1b2c3d4e5f6g7h8', type: 'string' },
              imds_token_policy: { value: 'required', type: 'string' },
              owner: { value: 'Madhav Gupta', type: 'string' }
            };
            applyLogOutput = `aws_security_group.web_sg: Creating...
aws_security_group.web_sg: Creation complete after 1s [id=sg-0a1b2c3d4e5f6g7h8]
aws_ebs_volume.data_disk: Creating...
aws_ebs_volume.data_disk: Creation complete after 2s [id=vol-0a1b2c3d4e5f6g7h8]
aws_instance.web_vm: Creating...
aws_instance.web_vm: Still creating... [4s elapsed]
aws_instance.web_vm: Creation complete after 5s [id=i-09f8e4381b0a92d]
aws_volume_attachment.ebs_att: Creating...
aws_volume_attachment.ebs_att: Creation complete after 1s [id=vai-3829104]

Apply complete! Resources: 4 added, 0 changed, 0 destroyed.

Outputs:
data_volume_id = "vol-0a1b2c3d4e5f6g7h8"
imds_token_policy = "required"
instance_id = "i-09f8e4381b0a92d"
owner = "Madhav Gupta"
cost = "$0.00 (Zero-Cost LocalStack Emulation)"`;
          }

          const updatedState: TerraformState = {
            ...terraformState,
            serial: terraformState.serial + 1,
            resources: newResources,
            outputs: newOutputs
          };
          setTerraformState(updatedState);
          setResourceNodes(extractNodesFromScenario(activeScenario, updatedState));

          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `${applyLogOutput}

[AYUSHI A.I.]: "Deployment protocol verified, Sir. Next directive: Open D3 Resource DAG to inspect topology."`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 5. Terraform Destroy
        if (lower.startsWith('terraform destroy')) {
          setIsApplied(false);
          setCurrentStepIndex(0);
          const clearedState: TerraformState = {
            ...terraformState,
            serial: terraformState.serial + 1,
            resources: [],
            outputs: {}
          };
          setTerraformState(clearedState);
          setResourceNodes(extractNodesFromScenario(activeScenario, clearedState));

          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `Destroying all managed resources...
aws_volume_attachment.ebs_att: Destruction complete after 1s
aws_instance.web_vm: Destruction complete after 2s
aws_ebs_volume.data_disk: Destruction complete after 1s
aws_security_group.web_sg: Destruction complete after 1s

Destroy complete! Resources: 4 destroyed.
[AYUSHI A.I.]: "All virtual infrastructure decommissioned. State is clean, Sir."`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 6. Terraform State List
        if (lower.startsWith('terraform state list')) {
          const resList = terraformState.resources.map((r) => `${r.type}.${r.name}`).join('\n');
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output:
                terraformState.resources.length > 0
                  ? resList
                  : 'No resources found in state file.\n(Hint: Run "terraform apply" to provision infrastructure first)',
              exitCode: 0
            }
          ]);
          return;
        }

        // 7. Terraform State Show
        if (lower.startsWith('terraform state show')) {
          const parts = command.trim().split(/\s+/);
          const targetAddr = parts[3];
          const matched = terraformState.resources.find(
            (r) => !targetAddr || `${r.type}.${r.name}` === targetAddr || r.name === targetAddr
          );

          if (matched) {
            const hclOutput = `# ${matched.type}.${matched.name}:
resource "${matched.type}" "${matched.name}" {
${Object.entries(matched.instances[0]?.attributes || {})
  .map(([k, v]) => `    ${k} = ${JSON.stringify(v)}`)
  .join('\n')}
}`;
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: hclOutput,
                exitCode: 0
              }
            ]);
          } else {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `No instance(s) found for resource "${targetAddr || 'unknown'}".\nRun "terraform state list" to view active resources.`,
                exitCode: 1
              }
            ]);
          }
          return;
        }

        // 8. Terraform Output
        if (lower.startsWith('terraform output')) {
          const outputEntries = Object.entries(terraformState.outputs);
          const outText =
            outputEntries.length > 0
              ? outputEntries.map(([k, v]) => `${k} = ${JSON.stringify(v.value)}`).join('\n')
              : 'No outputs found in current state file.';

          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: outText,
              exitCode: 0
            }
          ]);
          return;
        }

        // 9. Terraform Validate
        if (lower.startsWith('terraform validate')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `Success! The configuration is valid.
0 syntax or reference errors found across ${files.length} workspace files.`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 10. Terraform Format
        if (lower.startsWith('terraform fmt')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `${files.map((f) => f.name).join('\n')}\nAll files canonically styled.`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 11. Terraform Version
        if (lower === 'terraform -v' || lower === 'terraform version' || lower === 'terraform --version') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `Terraform v1.8.4
on linux_amd64
+ provider registry.terraform.io/hashicorp/aws v5.42.0
+ provider registry.terraform.io/hashicorp/azurerm v3.95.0
+ provider registry.terraform.io/hashicorp/kubernetes v2.26.0`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 12. Kubectl Get Pods
        if (lower.startsWith('kubectl get pod') || lower.startsWith('kubectl get po')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `NAMESPACE          NAME                                 READY   STATUS             RESTARTS   AGE
production-apps    order-api-7b8f99d6d-2kz8w            1/1     Running            0          3d4h
production-apps    payment-processor-59d4c7b89-9xqlm    1/1     Running            1          18h
production-apps    inventory-worker-84d77b47b-cr45h     0/1     CrashLoopBackOff   14         2h15m
production-apps    analytics-aggregator-66bf875d-oomkd  0/1     OOMKilled          6          45m

Tip: Run "k9s" to launch the visual interactive terminal!`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 13. Kubectl Get Nodes
        if (lower.startsWith('kubectl get node') || lower.startsWith('kubectl get no')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `NAME                         STATUS   ROLES           AGE   VERSION
control-plane-master-01      Ready    control-plane   14d   v1.29.2
worker-pool-node-01          Ready    worker          14d   v1.29.2
worker-pool-node-02          Ready    worker          14d   v1.29.2`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 14. Kubectl Get Services
        if (lower.startsWith('kubectl get svc') || lower.startsWith('kubectl get service')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `NAME               TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)
kubernetes         ClusterIP      10.96.0.1       <none>          443/TCP
order-api-svc      ClusterIP      10.96.42.18     <none>          8080/TCP
payment-svc        ClusterIP      10.96.99.201    <none>          8443/TCP
ingress-nginx-lb   LoadBalancer   10.96.110.5     20.52.14.88     80:30080/TCP,443:30443/TCP`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 15. Kubectl Describe
        if (lower.startsWith('kubectl describe')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `Name:         inventory-worker-84d77b47b-cr45h
Namespace:    production-apps
State:        Waiting
  Reason:     CrashLoopBackOff
Last State:   Terminated
  Exit Code:  1
Events:
  Type     Reason   Age                From     Message
  ----     ------   ----               ----     -------
  Warning  BackOff  2m (x14 over 2h)   kubelet  Back-off restarting failed container inventory-worker`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 16. Docker Commands
        if (lower.startsWith('docker ps') || lower.startsWith('docker-compose ps')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `CONTAINER ID   IMAGE                          COMMAND                  STATUS         PORTS
a1b2c3d4e5f6   localstack/localstack:latest   "docker-entrypoint.sh"   Up 4 hours     0.0.0.0:4566->4566/tcp
f6e5d4c3b2a1   kindest/node:v1.29.2           "/usr/local/bin/entr…"   Up 14 hours    127.0.0.1:32768->6443/tcp`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 17. Filesystem (ls, dir, cat, pwd)
        if (lower === 'ls' || lower === 'dir' || lower.startsWith('ls ')) {
          const fileNames = files.map((f) => f.name).join('  ');
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `${fileNames}  terraform.tfstate`,
              exitCode: 0
            }
          ]);
          return;
        }

        if (lower.startsWith('cat ')) {
          const targetName = command.trim().split(/\s+/)[1];
          const matchedFile = files.find((f) => f.name === targetName);
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: matchedFile ? matchedFile.content : `cat: ${targetName}: No such file or directory`,
              exitCode: matchedFile ? 0 : 1
            }
          ]);
          return;
        }

        if (lower === 'pwd') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: '/workspace/terraform-zero-cost-lab',
              exitCode: 0
            }
          ]);
          return;
        }

        // 18. Date command (Real dynamic timestamp)
        if (lower === 'date' || lower.startsWith('date ')) {
          const now = new Date();
          const dateOutput = now.toString();
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: dateOutput,
              exitCode: 0
            }
          ]);
          return;
        }

        // 19. Whoami & Uptime & System info
        if (lower === 'whoami') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: 'madhav-gupta (DevOps Staff Architect · Studio Owner)',
              exitCode: 0
            }
          ]);
          return;
        }

        if (lower.startsWith('uname')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: 'Linux zero-cloud-studio 6.6.0-generic #2026-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
              exitCode: 0
            }
          ]);
          return;
        }

        if (lower === 'uptime') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `${new Date().toLocaleTimeString()} up 14 days, 3:42, 1 user, load average: 0.08, 0.04, 0.01`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 20. Environment variables (env, printenv)
        if (lower === 'env' || lower === 'printenv' || lower === 'export') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `USER=madhav-gupta
LOGNAME=madhav-gupta
HOME=/home/madhav-gupta
PWD=/workspace/terraform-zero-cost-lab
SHELL=/bin/bash
TERM=xterm-256color
AWS_DEFAULT_REGION=us-east-1
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=mock_access_key
AWS_SECRET_ACCESS_KEY=mock_secret_key
KUBECONFIG=/home/madhav-gupta/.kube/config
TERRAFORM_VERSION=1.8.4
LOCALSTACK_SIMULATION=ACTIVE
CLOUD_COST_ESTIMATE=$0.00
AI_ASSISTANT=Ayushi (J.A.R.V.I.S./E.D.I.T.H. Protocol)`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 21. Echo command
        if (lower.startsWith('echo ') || lower === 'echo') {
          let echoText = command.slice(4).trim();
          echoText = echoText.replace(/["']/g, '');
          echoText = echoText.replace(/\$USER/g, 'madhav-gupta');
          echoText = echoText.replace(/\$AWS_DEFAULT_REGION/g, 'us-east-1');
          echoText = echoText.replace(/\$CLOUD_COST_ESTIMATE/g, '$0.00');
          echoText = echoText.replace(/\$AI_ASSISTANT/g, 'Ayushi');
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: echoText,
              exitCode: 0
            }
          ]);
          return;
        }

        // 22. History
        if (lower === 'history') {
          const histText = logs.map((l, i) => `  ${i + 1}  ${l.command}`).join('\n');
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: histText || '  1  terraform init',
              exitCode: 0
            }
          ]);
          return;
        }

        // 23. Git commands
        if (lower.startsWith('git ')) {
          if (lower.includes('status')) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
\tmodified:   main.tf
\tmodified:   variables.tf
\tmodified:   outputs.tf

no changes added to commit (use "git add" and "git commit -m")`,
                exitCode: 0
              }
            ]);
            return;
          }
          if (lower.includes('log')) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `commit 4f9e8a71d2b3c4e5 (HEAD -> main, origin/main)
Author: Madhav Gupta <madhavgupta0594@gmail.com>
Date:   ${new Date().toDateString()}

    feat: hardened AWS EC2 and EBS topology with IMDSv2 defense and $0 LocalStack matrix

commit 1a2b3c4d5e6f7a8b
Author: Madhav Gupta <madhavgupta0594@gmail.com>
Date:   Thu Oct 15 10:15:22 2026

    chore: initialize Zero-Cloud Studio with D3 DAG and Ayushi AI assistant`,
                exitCode: 0
              }
            ]);
            return;
          }
          if (lower.includes('branch')) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: '* main',
                exitCode: 0
              }
            ]);
            return;
          }
        }

        // 24. AWS CLI commands (LocalStack Emulation)
        if (lower.startsWith('aws ')) {
          if (lower.includes('sts get-caller-identity')) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `{
    "UserId": "AKIAIOSFODNN7EXAMPLE",
    "Account": "000000000000",
    "Arn": "arn:aws:iam::000000000000:root",
    "Owner": "Madhav Gupta",
    "ZeroCost": "LocalStack localhost:4566"
}`,
                exitCode: 0
              }
            ]);
            return;
          }
          if (lower.includes('s3 ls')) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `2026-10-16 08:00:00 tfstate-production-bucket\n2026-10-16 08:00:00 app-assets-zero-cost`,
                exitCode: 0
              }
            ]);
            return;
          }
          if (lower.includes('ec2 describe-instances')) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: JSON.stringify(
                  {
                    Reservations: [
                      {
                        Instances: [
                          {
                            InstanceId: isApplied ? 'i-09f8e4381b0a92d' : '(none - run terraform apply)',
                            InstanceType: 't3.medium',
                            State: { Name: isApplied ? 'running' : 'terminated' },
                            Tags: [{ Key: 'Owner', Value: 'Madhav Gupta' }],
                            MetadataOptions: { HttpTokens: 'required' }
                          }
                        ]
                      }
                    ]
                  },
                  null,
                  2
                ),
                exitCode: 0
              }
            ]);
            return;
          }
        }

        // 25. Which command
        if (lower.startsWith('which ')) {
          const bin = command.trim().split(/\s+/)[1];
          const knownBins = ['terraform', 'kubectl', 'docker', 'docker-compose', 'k9s', 'aws', 'git', 'bash', 'curl', 'helm', 'date', 'pwd', 'cat', 'ls'];
          if (knownBins.includes(bin)) {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `/usr/local/bin/${bin}`,
                exitCode: 0
              }
            ]);
          } else {
            setLogs((prev) => [
              ...prev,
              {
                id: `cmd-${Date.now()}`,
                timestamp,
                command,
                output: `${bin} not found in /usr/local/bin:/usr/bin:/bin`,
                exitCode: 1
              }
            ]);
          }
          return;
        }

        // 26. Curl command
        if (lower.startsWith('curl ')) {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: LocalStack/3.2.0 (Zero-Cost Emulator)
Content-Type: application/json

{"status": "running", "services": ["ec2", "s3", "iam", "sts", "k8s"]}`,
              exitCode: 0
            }
          ]);
          return;
        }

        // 27. System diagnostics (df -h, free -m)
        if (lower === 'df -h' || lower === 'df') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/root        50G   12G   38G  24% /
tmpfs           3.9G  1.2M  3.9G   1% /dev/shm
/dev/nvme0n1    100G   24G   76G  24% /workspace`,
              exitCode: 0
            }
          ]);
          return;
        }

        if (lower === 'free -m' || lower === 'free') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `               total        used        free      shared  buff/cache   available
Mem:           16000        2450       11200         128        2350       13200
Swap:           4096           0        4096`,
              exitCode: 0
            }
          ]);
          return;
        }

        if (lower === 'clear') {
          setLogs([]);
          return;
        }

        if (lower === 'help') {
          setLogs((prev) => [
            ...prev,
            {
              id: `cmd-${Date.now()}`,
              timestamp,
              command,
              output: `=== AVAILABLE COMMANDS ===
Terraform:
  terraform init
  terraform plan
  terraform apply -auto-approve
  terraform destroy -auto-approve
  terraform state list
  terraform state show <resource>
  terraform validate
  terraform fmt
  terraform output
  terraform version

Kubernetes:
  kubectl get pods -A
  kubectl get nodes
  kubectl get svc
  kubectl describe pod <name>
  k9s (Launches visual TUI terminal)

Cloud & Tools:
  date / whoami / uname -a / uptime / env / echo <text> / history
  git status / git log / git branch
  aws sts get-caller-identity / aws ec2 describe-instances / aws s3 ls
  docker ps / which <bin> / curl <url> / df -h / free -m
  ls / cat <file> / pwd / clear / help`,
              exitCode: 0
            }
          ]);
          return;
        }

        // Authentic shell fallback for unknown commands
        const cmdName = command.trim().split(/\s+/)[0];
        setLogs((prev) => [
          ...prev,
          {
            id: `cmd-${Date.now()}`,
            timestamp,
            command,
            output: `bash: ${cmdName}: command not found

(Tip: Try "date", "terraform plan", "terraform apply", "kubectl get pods", "k9s", or "help")`,
            exitCode: 127
          }
        ]);
      } catch (err: any) {
        setLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            timestamp,
            command,
            output: `[ERROR] Command failed: ${err?.message || err}`,
            exitCode: 1
          }
        ]);
      } finally {
        setIsExecuting(false);
      }
    }, 180);
  };

  const handleOpenAIAssistant = (prompt?: string) => {
    if (prompt) {
      setAiAssistantPrompt(prompt);
    }
    setShowAIAssistant(true);
  };

  const handleLoadProjectToWorkspace = (title: string, generatedFiles: TerraformFile[]) => {
    setFiles(generatedFiles);
    setActiveFileName(generatedFiles[0].name);
    setActiveSection('terraform-studio');
    setLogs((prev) => [
      ...prev,
      {
        id: `proj-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        command: `load-project "${title}"`,
        output: `[SUCCESS] Loaded Custom Multi-Resource Project with ${generatedFiles.length} files into workspace!\nOwner: Madhav Gupta`,
        exitCode: 0
      }
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0f18] text-slate-100 font-sans">
      {/* Header Bar */}
      <Header
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          if (sec === 'interview-hub') setShowInterviewModal(true);
          if (sec === 'terraform-academy') setShowAcademyModal(true);
          if (sec === 'readme') setShowReadmeModal(true);
          if (sec === 'project-builder') setShowProjectBuilder(true);
        }}
        onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)}
        onQuickRun={() => executeCommand('terraform plan')}
        onOpenLocalRun={() => setShowLocalRunModal(true)}
        onOpenChallenges={() => setShowChallengesModal(true)}
        onOpenDriftDetection={() => setShowDriftModal(true)}
        onOpenHowToUse={() => setShowHowToUseModal(true)}
        activeDriftCount={activeDrift ? 1 : 0}
        isApplied={isApplied}
      />

      {/* Main Content Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* VIEW 1: TERRAFORM STUDIO */}
        {activeSection === 'terraform-studio' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Scenarios Sidebar */}
            <aside className="w-full md:w-64 lg:w-72 border-r border-slate-800 bg-[#0c121e] flex flex-col shrink-0 overflow-y-auto">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lab Scenarios
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-semibold">
                  $0.00
                </span>
              </div>

              <div className="p-2 space-y-1.5 flex-1">
                {scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      activeScenarioId === sc.id
                        ? 'bg-sky-950/50 border-sky-500/60 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-sky-400 uppercase">{sc.domain}</span>
                      <span className="px-1.5 py-0.2 bg-slate-800 rounded">{sc.difficulty}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 line-clamp-1">{sc.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{sc.tagline}</div>
                  </div>
                ))}
              </div>

              {/* Sidebar Footer info */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Owner: <span className="text-sky-300 font-medium">Madhav Gupta</span></div>
                <div className="text-[10px] text-slate-500">LocalStack · Kind · Docker Topologies</div>
              </div>
            </aside>

            {/* Center & Right: Code Editor / D3 Graph & Interactive Terminal */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Interactive Scenario Mission Control & Workflow Stepper ("What to do next") */}
              <ScenarioWorkflowStepper
                scenario={activeScenario}
                currentStepIndex={currentStepIndex}
                isExecuting={isExecuting}
                isApplied={isApplied}
                onExecuteCommand={executeCommand}
                onSwitchStudioView={(v) => {
                  setStudioView(v);
                  if (v === 'd3-graph') {
                    setCurrentStepIndex((prev) => Math.max(prev, 4));
                  }
                }}
                onOpenDriftModal={() => setShowDriftModal(true)}
                onOpenLocalRunModal={() => setShowLocalRunModal(true)}
                onOpenHowToUseModal={() => setShowHowToUseModal(true)}
                onAskAI={(p) => handleOpenAIAssistant(p)}
                onResetWorkflow={() => {
                  setCurrentStepIndex(0);
                  setIsApplied(false);
                  const resetState = createInitialState(activeScenario.id);
                  setTerraformState(resetState);
                  setResourceNodes(extractNodesFromScenario(activeScenario, resetState));
                  setLogs((prev) => [
                    ...prev,
                    {
                      id: `reset-${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString(),
                      command: 'reset-workflow',
                      output: '[RESET] Scenario workflow reset to Step 1 (terraform init). Infrastructure state cleared.',
                      exitCode: 0
                    }
                  ]);
                }}
              />

              {/* Studio Sub-Header View Switcher */}
              <div className="h-9 px-3 bg-[#0d1422] border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setStudioView('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      studioView === 'editor'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>HCL Code Workspace</span>
                  </button>

                  <button
                    onClick={() => setStudioView('d3-graph')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      studioView === 'd3-graph'
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>D3 Resource DAG (Force Graph)</span>
                    <span className="px-1.5 py-0.2 text-[9.5px] bg-sky-400/20 text-sky-300 rounded font-mono font-bold">
                      D3.js
                    </span>
                  </button>

                  <button
                    onClick={() => setStudioView('state-json')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      studioView === 'state-json'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live State JSON</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {activeDrift ? (
                    <button
                      onClick={() => setShowDriftModal(true)}
                      className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/80 rounded text-[11px] font-semibold text-rose-300 animate-pulse transition-all cursor-pointer shadow-sm shadow-rose-500/20"
                    >
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>Drift Active: {activeDrift.targetResource}</span>
                      <span className="underline ml-1">Inspect</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDriftModal(true)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded text-[11px] text-slate-300 transition-colors cursor-pointer"
                    >
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline">Simulate Drift</span>
                      <span className="sm:hidden">Drift</span>
                    </button>
                  )}

                  <span className="font-mono text-[11px] text-slate-400 hidden md:inline">
                    State Serial: #{terraformState.serial}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">
                    {terraformState.resources.length} active resources
                  </span>
                </div>
              </div>

              {/* View Body + Terminal Layout */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Center Content based on studioView */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 overflow-hidden">
                  {studioView === 'editor' && (
                    <CodeWorkspace
                      files={files}
                      activeFileName={activeFileName}
                      onSelectFile={setActiveFileName}
                      onUpdateFileContent={handleUpdateFileContent}
                      onResetFiles={handleResetFiles}
                      onCreateFile={handleCreateFile}
                      onDeleteFile={handleDeleteFile}
                      onAskAI={() => handleOpenAIAssistant(`Help me improve or fix my ${activeFileName} file`)}
                    />
                  )}

                  {studioView === 'd3-graph' && (
                    <D3ForceGraph
                      state={terraformState}
                      scenario={activeScenario}
                      files={files}
                      activeDriftResourceId={activeDrift?.targetResource}
                      onOpenDrift={() => setShowDriftModal(true)}
                      onAskAI={(p) => handleOpenAIAssistant(p)}
                    />
                  )}

                  {studioView === 'state-json' && (
                    <div className="flex-1 flex flex-col bg-[#070b12] overflow-hidden select-text">
                      <div className="h-10 px-4 bg-[#0a0f18] border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono text-xs font-bold text-slate-200">terraform.tfstate</span>
                          <span className="text-[10px] text-slate-500 font-mono">v{terraformState.version}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(terraformState, null, 2));
                            setCopiedState(true);
                            setTimeout(() => setCopiedState(false), 2000);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
                        >
                          {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedState ? 'Copied' : 'Copy State JSON'}</span>
                        </button>
                      </div>
                      <pre className="flex-1 p-4 font-mono text-xs text-sky-300 overflow-auto whitespace-pre leading-relaxed bg-[#060910]">
                        {JSON.stringify(terraformState, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Terminal & Topology Column */}
                <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col border-t lg:border-t-0 bg-[#080d14] shrink-0">
                  <TerminalPane
                    logs={logs}
                    isExecuting={isExecuting}
                    onExecuteCommand={executeCommand}
                    onClearLogs={() => setLogs([])}
                    onOpenK9s={() => setActiveSection('kubernetes-k9s')}
                    onOpenGraph={() => {
                      setStudioView('d3-graph');
                      setCurrentStepIndex((prev) => Math.max(prev, 4));
                    }}
                    onAskAI={(p) => handleOpenAIAssistant(p)}
                    suggestedNextCommand={suggestedAction.command}
                    suggestedNextLabel={suggestedAction.label}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: KUBERNETES & K9S TERMINAL */}
        {activeSection === 'kubernetes-k9s' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-black">
            <K9sTerminalView
              onClose={() => setActiveSection('terraform-studio')}
              onAskAI={(p) => handleOpenAIAssistant(p)}
            />
          </div>
        )}

        {/* VIEW 3: CLOUD SANDBOX (AWS/AZURE VMs & EKS/AKS) */}
        {activeSection === 'cloud-sandbox' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0b101b] space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  $0.00 Expense
                </span>
                <span className="text-xs text-slate-400">Curated by Madhav Gupta</span>
              </div>
              <h1 className="text-2xl font-bold text-white">AWS, Azure VM & Kubernetes Cluster Sandbox</h1>
              <p className="text-xs text-slate-400 mt-1">
                Practice enterprise virtual machines and container orchestration with 100% free local emulation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((sc) => (
                <div key={sc.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-sky-400">{sc.domain}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {sc.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{sc.title}</h3>
                  <p className="text-xs text-slate-300">{sc.description}</p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs text-emerald-400 font-semibold">{sc.costRequirement}</span>
                    <button
                      onClick={() => {
                        handleSelectScenario(sc.id);
                        setActiveSection('terraform-studio');
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Open in Studio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Sections can also be opened via tabs or modals */}
      </main>

      {/* Floating Ayushi Trigger Button (Bottom Right - Jarvis / Edith HUD) */}
      {!showAIAssistant && (
        <button
          onClick={() => handleOpenAIAssistant()}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-[#081324]/90 hover:bg-[#0c1c36] text-cyan-300 text-xs font-bold rounded-full shadow-2xl shadow-cyan-500/30 border-2 border-cyan-400/60 active:scale-95 transition-all cursor-pointer backdrop-blur-md group"
          title="Launch Ayushi (Jarvis/Edith AI)"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-400 relative">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="absolute inset-0 rounded-full border border-cyan-400/50 animate-ping opacity-75" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono text-cyan-300 tracking-wide font-bold">AYUSHI (A.I.)</span>
            <span className="text-[10px] text-cyan-400/70 font-sans font-normal">What you want to do, Sir?</span>
          </div>
        </button>
      )}

      {/* Ayushi (Jarvis/Edith Autonomous AI Assistant Drawer) */}
      <AIAssistantDrawer
        isOpen={showAIAssistant}
        onClose={() => {
          setShowAIAssistant(false);
          setAiAssistantPrompt(undefined);
        }}
        activeScenario={activeScenario}
        activeFile={activeFile}
        latestTerminalLogs={logs.map((l) => `${l.command}\n${l.output}`).join('\n')}
        currentStepIndex={currentStepIndex}
        isApplied={isApplied}
        onExecuteCommand={(cmd) => executeCommand(cmd)}
        onSwitchStudioView={(v) => {
          setStudioView(v);
          if (v === 'd3-graph') setCurrentStepIndex((prev) => Math.max(prev, 4));
        }}
        onOpenDriftModal={() => setShowDriftModal(true)}
        onOpenK9s={() => setActiveSection('kubernetes-k9s')}
        onOpenLocalRun={() => setShowLocalRunModal(true)}
        initialPrompt={aiAssistantPrompt}
        onApplyCodeToWorkspace={(filename, code) => handleCreateFile(filename, code)}
      />

      {/* Modals */}
      {showInterviewModal && (
        <TechikrishInterviewModal
          onClose={() => {
            setShowInterviewModal(false);
            if (activeSection === 'interview-hub') setActiveSection('terraform-studio');
          }}
          onAskAI={(p) => handleOpenAIAssistant(p)}
          onLoadCodeToWorkspace={(fn, code) => handleCreateFile(fn, code)}
        />
      )}

      {showAcademyModal && (
        <TerraformAcademyModal
          onClose={() => {
            setShowAcademyModal(false);
            if (activeSection === 'terraform-academy') setActiveSection('terraform-studio');
          }}
          onExecuteCommand={executeCommand}
          onCreateFileInWorkspace={(fn, content) => handleCreateFile(fn, content)}
          onAskAI={(p) => handleOpenAIAssistant(p)}
        />
      )}

      {showReadmeModal && (
        <ReadmeModal
          onClose={() => {
            setShowReadmeModal(false);
            if (activeSection === 'readme') setActiveSection('terraform-studio');
          }}
          onSelectSection={(sec) => setActiveSection(sec)}
        />
      )}

      {showProjectBuilder && (
        <ProjectBuilderModal
          onClose={() => {
            setShowProjectBuilder(false);
            if (activeSection === 'project-builder') setActiveSection('terraform-studio');
          }}
          onLoadProjectToWorkspace={handleLoadProjectToWorkspace}
          onAskAI={(p) => handleOpenAIAssistant(p)}
        />
      )}

      {showLocalRunModal && (
        <LocalRunGuideModal
          scenario={activeScenario}
          onClose={() => setShowLocalRunModal(false)}
        />
      )}

      {showChallengesModal && (
        <ChallengesModal
          onClose={() => setShowChallengesModal(false)}
          onLoadChallengeToWorkspace={(fn, code) => handleCreateFile(fn, code)}
        />
      )}

      {showDriftModal && (
        <DriftDetectionModal
          onClose={() => setShowDriftModal(false)}
          activeDriftId={activeDrift?.id}
          onInjectDrift={(d) => {
            setActiveDrift(d);
            setLogs((prev) => [
              ...prev,
              {
                id: `drift-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                command: `inject-drift "${d.id}"`,
                output: `[DRIFT INJECTED] Real-world divergence detected on ${d.targetResource}!\nSeverity: ${d.severity} · Source: ${d.sourceOfDrift}\nRun "terraform plan" in the terminal to inspect the drift report and proposed remediation.`,
                exitCode: 2
              }
            ]);
          }}
          onResolveDrift={() => {
            const resolvedTitle = activeDrift?.title || 'Active Drift';
            setActiveDrift(null);
            setIsApplied(true);
            setLogs((prev) => [
              ...prev,
              {
                id: `resolve-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                command: 'terraform apply -auto-approve',
                output: `[SUCCESS] Reconciled out-of-band cloud drift: "${resolvedTitle}"!\nInfrastructure has been restored to match codified Terraform state baseline (Owner: Madhav Gupta).`,
                exitCode: 0
              }
            ]);
          }}
          onRunPlanInTerminal={(cmd, out) => {
            executeCommand(cmd);
          }}
          onAskAI={(p) => handleOpenAIAssistant(p)}
        />
      )}

      {/* Quick Start & How to Use Modal */}
      {showHowToUseModal && (
        <QuickStartGuideModal
          onClose={() => setShowHowToUseModal(false)}
          onSelectScenarioAndStart={(scId) => handleSelectScenario(scId)}
          onExecuteSampleCommand={(cmd) => executeCommand(cmd)}
          onOpenD3Graph={() => {
            setActiveSection('terraform-studio');
            setStudioView('d3-graph');
            setCurrentStepIndex((prev) => Math.max(prev, 4));
          }}
          onOpenDrift={() => setShowDriftModal(true)}
          onOpenK9s={() => setActiveSection('kubernetes-k9s')}
          onOpenAI={() => setShowAIAssistant(true)}
        />
      )}
    </div>
  );
}
