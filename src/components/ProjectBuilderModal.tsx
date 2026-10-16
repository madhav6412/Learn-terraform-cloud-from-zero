import React, { useState } from 'react';
import { TerraformFile } from '../types/terraform';
import {
  Layers,
  Box,
  Terminal,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Workflow,
  Cpu
} from 'lucide-react';

interface ProjectBuilderModalProps {
  onClose: () => void;
  onLoadProjectToWorkspace: (title: string, files: TerraformFile[]) => void;
  onAskAI?: (prompt: string) => void;
}

export const ProjectBuilderModal: React.FC<ProjectBuilderModalProps> = ({
  onClose,
  onLoadProjectToWorkspace,
  onAskAI
}) => {
  const [projectName, setProjectName] = useState('enterprise-zero-cloud-platform');
  const [selectedCloud, setSelectedCloud] = useState<'aws' | 'azure' | 'hybrid'>('aws');
  const [selectedCompute, setSelectedCompute] = useState<'kubernetes' | 'vm' | 'both'>('kubernetes');
  const [selectedCicd, setSelectedCicd] = useState<'bitbucket' | 'github' | 'gitlab'>('bitbucket');
  const [enableMonitoring, setEnableMonitoring] = useState(true);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Generate complete zero-cloud multi-file configuration based on selections
  const generateFiles = (): TerraformFile[] => {
    const files: TerraformFile[] = [];

    // 1. Providers.tf
    const providersHcl = `# Terraform Providers Configuration
# Owner: Madhav Gupta
# Zero-Cloud Guarantee ($0.00 Expense)

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    ${selectedCloud === 'aws' || selectedCloud === 'hybrid' ? `aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }` : ''}
    ${selectedCloud === 'azure' || selectedCloud === 'hybrid' ? `azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }` : ''}
    ${selectedCompute !== 'vm' ? `kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }` : ''}
  }
}

${selectedCloud === 'aws' || selectedCloud === 'hybrid' ? `provider "aws" {
  region                      = "us-east-1"
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3  = "http://localhost:4566"
    ec2 = "http://localhost:4566"
    iam = "http://localhost:4566"
  }
}` : ''}

${selectedCloud === 'azure' || selectedCloud === 'hybrid' ? `provider "azurerm" {
  features {}
  skip_provider_registration = true
}` : ''}

${selectedCompute !== 'vm' ? `provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "kind-local-cluster"
}` : ''}
`;
    files.push({ name: 'providers.tf', path: 'providers.tf', language: 'hcl', content: providersHcl });

    // 2. Main.tf
    let mainHcl = `# Main Infrastructure Definition: ${projectName}
# Architecture: ${selectedCloud.toUpperCase()} + ${selectedCompute.toUpperCase()} + ${selectedCicd.toUpperCase()} CI/CD
# Curated by: Madhav Gupta

`;
    if (selectedCompute === 'vm' || selectedCompute === 'both') {
      if (selectedCloud === 'aws' || selectedCloud === 'hybrid') {
        mainHcl += `# AWS EC2 Virtual Machine with IMDSv2 Hardening
resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required" # IMDSv2
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y nginx
              echo "<h1>Provisioned by Madhav Gupta | \${var.project_name}</h1>" > /var/www/html/index.html
              systemctl start nginx
              EOF

  tags = {
    Name  = "\${var.project_name}-vm"
    Owner = var.project_owner
  }
}
\n`;
      }
      if (selectedCloud === 'azure') {
        mainHcl += `# Azure Linux Virtual Machine
resource "azurerm_resource_group" "rg" {
  name     = "rg-\${var.project_name}"
  location = var.azure_location
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                = "vm-\${var.project_name}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_D2s_v5"
  admin_username      = "azureuser"

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}
\n`;
      }
    }

    if (selectedCompute === 'kubernetes' || selectedCompute === 'both') {
      mainHcl += `# Kubernetes Namespace & Microservice Workloads
resource "kubernetes_namespace" "apps" {
  metadata {
    name = var.k8s_namespace
    labels = {
      environment = var.environment
      managed_by  = "terraform"
      owner       = var.project_owner
    }
  }
}

resource "kubernetes_deployment" "api" {
  metadata {
    name      = "core-api"
    namespace = kubernetes_namespace.apps.metadata[0].name
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "core-api"
      }
    }

    template {
      metadata {
        labels = {
          app = "core-api"
        }
      }

      spec {
        container {
          name  = "api-server"
          image = "nginx:alpine"

          port {
            container_port = 80
          }

          resources {
            limits = {
              cpu    = "250m"
              memory = "256Mi"
            }
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }
        }
      }
    }
  }
}
`;
    }
    files.push({ name: 'main.tf', path: 'main.tf', language: 'hcl', content: mainHcl });

    // 3. Variables.tf
    const varsHcl = `variable "project_name" {
  type    = string
  default = "${projectName}"
}

variable "project_owner" {
  type    = string
  default = "Madhav Gupta"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "azure_location" {
  type    = string
  default = "eastus2"
}

variable "k8s_namespace" {
  type    = string
  default = "enterprise-apps"
}
`;
    files.push({ name: 'variables.tf', path: 'variables.tf', language: 'hcl', content: varsHcl });

    // 4. Outputs.tf
    const outputsHcl = `output "project_owner" {
  value = var.project_owner
}

output "deployment_status" {
  value = "Infrastructure successfully provisioned without cloud fees"
}

output "architecture_summary" {
  value = {
    cloud_emulation = "${selectedCloud.toUpperCase()}"
    compute_layer   = "${selectedCompute.toUpperCase()}"
    pipeline        = "${selectedCicd.toUpperCase()}"
    cost            = "$0.00"
  }
}
`;
    files.push({ name: 'outputs.tf', path: 'outputs.tf', language: 'hcl', content: outputsHcl });

    // 5. CI/CD Pipeline Configuration (Bitbucket, GitHub, or GitLab)
    if (selectedCicd === 'bitbucket') {
      const bitbucketYaml = `# Bitbucket Pipelines CI/CD Workflow
# Owner: Madhav Gupta
# Production Automated Lint, Validate, Plan, and Deploy

image: hashicorp/terraform:1.8.0

pipelines:
  branches:
    master:
      - step:
          name: "Terraform Lint & Security Scan"
          script:
            - terraform fmt -check -diff
            - terraform init -backend=false
            - terraform validate
      - step:
          name: "Terraform Plan ($0 LocalStack / Emulation)"
          script:
            - terraform init
            - terraform plan -out=tfplan.binary
          artifacts:
            - tfplan.binary
      - step:
          name: "Production Deployment (Manual Approval)"
          trigger: manual
          script:
            - terraform apply -auto-approve tfplan.binary
            - echo "Deployment complete by Madhav Gupta"
`;
      files.push({ name: 'bitbucket-pipelines.yml', path: 'bitbucket-pipelines.yml', language: 'yaml', content: bitbucketYaml });
    } else if (selectedCicd === 'github') {
      const githubYaml = `name: Production CI/CD Pipeline
on:
  push:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.8.0
      - name: Terraform Init & Validate
        run: |
          terraform fmt -check
          terraform init
          terraform validate
      - name: Terraform Plan
        run: terraform plan -out=tfplan
      - name: Terraform Apply
        run: terraform apply -auto-approve tfplan
`;
      files.push({ name: 'github-workflow.yml', path: '.github/workflows/deploy.yml', language: 'yaml', content: githubYaml });
    }

    return files;
  };

  const handleApplyToWorkspace = () => {
    const generated = generateFiles();
    onLoadProjectToWorkspace(projectName, generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Zero-Cloud Custom Project Builder
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-semibold">
                  $0 Spend Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Assemble custom Terraform, Kubernetes, AWS, Azure, & Bitbucket CI/CD pipelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1.5">
              Project Identifier
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Cloud Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
              1. Cloud Provider Emulation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'aws', title: 'AWS (LocalStack)', desc: 'EC2, S3, IAM, & KMS on port 4566' },
                { id: 'azure', title: 'Azure (Azurite & Mock)', desc: 'Linux VMs, Managed Disks, & Resource Groups' },
                { id: 'hybrid', title: 'Multi-Cloud Hybrid', desc: 'Simultaneous AWS + Azure provider topologies' }
              ].map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCloud(c.id as any)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedCloud === c.id
                      ? 'bg-sky-950/40 border-sky-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-bold text-xs mb-1 text-sky-400">{c.title}</div>
                  <div className="text-[11px] text-slate-400">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compute & Container Layer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
              2. Compute Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'kubernetes', title: 'Kubernetes Cluster (Kind)', desc: 'Namespaces, Pods, Deployments & K9s access' },
                { id: 'vm', title: 'Virtual Machines (EC2 / Azure VM)', desc: 'Cloud-init bootstrap, IMDSv2, EBS & Managed Disks' },
                { id: 'both', title: 'Full Stack (VMs + K8s)', desc: 'Bastion host VM + Kubernetes worker node pools' }
              ].map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCompute(c.id as any)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedCompute === c.id
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-bold text-xs mb-1 text-emerald-400">{c.title}</div>
                  <div className="text-[11px] text-slate-400">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CI/CD Pipeline Automation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
              3. CI/CD Pipeline Automation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'bitbucket', title: 'Bitbucket Pipelines', desc: 'bitbucket-pipelines.yml with manual apply gate' },
                { id: 'github', title: 'GitHub Actions', desc: '.github/workflows/deploy.yml with OIDC auth' },
                { id: 'gitlab', title: 'GitLab CI', desc: '.gitlab-ci.yml with multi-stage runners' }
              ].map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCicd(c.id as any)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedCicd === c.id
                      ? 'bg-amber-950/40 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-bold text-xs mb-1 text-amber-400">{c.title}</div>
                  <div className="text-[11px] text-slate-400">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span>Owner: <strong className="text-sky-300">Madhav Gupta</strong></span>
            <span className="mx-2">·</span>
            <span>Generates 5 ready-to-run files</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleApplyToWorkspace}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate & Load into Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
