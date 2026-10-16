import { LabScenario } from '../types/terraform';

export const LAB_SCENARIOS: LabScenario[] = [
  // 1. AWS EC2 VM with LocalStack (Zero Cost)
  {
    id: 'aws-vm-ec2-production',
    title: 'AWS EC2 Production VM (LocalStack Zero-Cost)',
    tagline: 'Launch secured EC2 VM with EBS volume, IMDSv2, and user_data bootstrap',
    domain: 'cloud-vms',
    category: 'vm-aws',
    difficulty: 'Intermediate',
    costRequirement: '$0.00 (LocalStack Community)',
    description: 'Deploy a hardened AWS EC2 virtual machine instance equipped with EBS volume attachment, IMDSv2 token enforcement, secure security group ingress, and automated Nginx cloud-init provisioning using LocalStack emulation.',
    learningObjectives: [
      'Configure AWS provider to point to LocalStack localhost:4566',
      'Enforce IMDSv2 metadata tokens for SSRF defense on EC2 instances',
      'Attach separate gp3 EBS storage volume to the EC2 root machine',
      'Implement cloud-init user_data scripts for automated bootstrap',
      'Verify infrastructure state with zero cloud bills or credit card'
    ],
    interviewPrep: {
      coreQuestion: 'How do you secure AWS EC2 against SSRF vulnerabilities via metadata service, and how do you handle stateful EBS volume lifecycle in Terraform?',
      interviewerIntent: 'Evaluates understanding of IMDSv2 configuration (http_tokens = "required"), EBS volume detachment protection, and cloud-init bootstrap reliability.',
      juniorMistake: 'Leaving metadata options as defaults (allowing IMDSv1), and embedding secrets directly into user_data in plain text.',
      staffSolution: 'Enforce metadata_options { http_tokens = "required", http_put_response_hop_limit = 1 }, use IAM instance profile with least privilege, and prevent EBS destruction using lifecycle { prevent_destroy = false } or retain policies.',
      trapQuestions: [
        'What happens when user_data changes in aws_instance? Does it update in place?',
        'How do you prevent data loss on aws_ebs_volume during a terraform apply replacement?'
      ],
      productionChecklist: [
        'Enforce IMDSv2 with http_tokens = "required"',
        'Restrict Security Group SSH (port 22) to VPN CIDR only',
        'Enable encrypted = true on EBS volumes with KMS key',
        'Tag all resources with Owner = "Madhav Gupta" and Environment'
      ]
    },
    files: [
      {
        name: 'main.tf',
        path: 'main.tf',
        language: 'hcl',
        content: `# AWS EC2 Virtual Machine Architecture
# Zero-Cost LocalStack Emulation
# Owner & Curator: Madhav Gupta

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    ec2 = "http://localhost:4566"
    sts = "http://localhost:4566"
    iam = "http://localhost:4566"
  }

  default_tags {
    tags = {
      Environment = var.environment
      Owner       = var.project_owner
      ZeroCost    = "LocalStack"
    }
  }
}

resource "aws_security_group" "web_sg" {
  name        = "production-web-sg"
  description = "Allow TLS and HTTP traffic"
  vpc_id      = "vpc-0a1b2c3d4e5f6g7h8"

  ingress {
    description = "HTTPS ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP ingress for ACME challenge"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web_vm" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  # IMDSv2 Security hardening
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              echo "Initializing system for Owner: \${var.project_owner}..."
              apt-get update -y && apt-get install -y nginx
              echo "<h1>AWS Production VM Live | Owner: \${var.project_owner}</h1>" > /var/www/html/index.html
              systemctl start nginx
              systemctl enable nginx
              EOF

  tags = {
    Name = "web-production-instance"
  }
}

resource "aws_ebs_volume" "data_disk" {
  availability_zone = "us-east-1a"
  size              = 50
  type              = "gp3"
  encrypted         = true

  tags = {
    Name = "web-persistent-data-volume"
  }
}

resource "aws_volume_attachment" "ebs_att" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.data_disk.id
  instance_id = aws_instance.web_vm.id
}
`
      },
      {
        name: 'variables.tf',
        path: 'variables.tf',
        language: 'hcl',
        content: `variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "production"
}

variable "project_owner" {
  type        = string
  description = "Lead DevOps owner"
  default     = "Madhav Gupta"
}
`
      },
      {
        name: 'outputs.tf',
        path: 'outputs.tf',
        language: 'hcl',
        content: `output "instance_id" {
  description = "AWS EC2 Instance ID"
  value       = aws_instance.web_vm.id
}

output "data_volume_id" {
  description = "Attached Persistent EBS Volume ID"
  value       = aws_ebs_volume.data_disk.id
}

output "imds_token_policy" {
  description = "IMDSv2 Enforced Setting"
  value       = aws_instance.web_vm.metadata_options[0].http_tokens
}
`
      }
    ],
    activeFile: 'main.tf',
    localRunGuide: {
      prerequisites: [
        'Docker & Docker Compose installed',
        'AWS CLI configured with test profile (aws configure set aws_access_key_id mock)',
        'Terraform CLI v1.5+'
      ],
      dockerCompose: `version: "3.8"
services:
  localstack:
    image: localstack/localstack:latest
    container_name: localstack_zero_cost
    ports:
      - "4566:4566"
    environment:
      - SERVICES=ec2,iam,sts,s3
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"`,
      runScript: [
        'docker-compose up -d',
        'terraform init',
        'terraform plan',
        'terraform apply -auto-approve'
      ],
      verificationCommands: [
        'aws --endpoint-url=http://localhost:4566 ec2 describe-instances',
        'aws --endpoint-url=http://localhost:4566 ec2 describe-volumes'
      ],
      notes: 'No AWS credit card or cloud bill required. Entirely validated against LocalStack emulation.'
    }
  },

  // 2. Azure Linux VM (Zero-Cost Practice)
  {
    id: 'azure-vm-linux-production',
    title: 'Azure Linux VM with Managed Disk',
    tagline: 'Standard_B2s Virtual Machine with NSG, SSH public keys, and custom_data',
    domain: 'cloud-vms',
    category: 'vm-azure',
    difficulty: 'Intermediate',
    costRequirement: '$0.00 (Local / Sandbox Emulation)',
    description: 'Architect a secure Azure Linux Virtual Machine with a dedicated Virtual Network, Subnet, Network Security Group (NSG), Public IP, and attached 64GB Managed Disk with cloud-init custom_data.',
    learningObjectives: [
      'Structure azurerm_linux_virtual_machine and azurerm_network_interface',
      'Attach secondary azurerm_managed_disk with ReadWrite caching',
      'Inject SSH public key authentication and disable password login',
      'Provision security rules with least privilege port access',
      'Manage cloud-init base64 custom_data scripting'
    ],
    interviewPrep: {
      coreQuestion: 'How does azurerm_linux_virtual_machine handle custom_data updates versus user_data in AWS EC2?',
      interviewerIntent: 'Tests real cross-cloud Terraform differences. In Azure, modifying custom_data forces a complete VM replacement unless managed via custom script extensions.',
      juniorMistake: 'Storing un-base64-encoded strings or passing passwords in plain text instead of SSH public keys.',
      staffSolution: 'Use base64encode(file("cloud-init.yaml")), isolate OS disks from persistent data disks, and manage VM lifecycle with ignore_changes where appropriate.',
      trapQuestions: [
        'Why does terraform plan show recreation when custom_data changes?',
        'How do you manage disk caching (None, ReadOnly, ReadWrite) for transactional databases?'
      ],
      productionChecklist: [
        'Disable password authentication: disable_password_authentication = true',
        'Isolate data disk with azurerm_virtual_machine_data_disk_attachment',
        'Enforce NSG rule priority sequencing'
      ]
    },
    files: [
      {
        name: 'main.tf',
        path: 'main.tf',
        language: 'hcl',
        content: `# Azure Linux VM Infrastructure
# Zero-Cost Simulation & Validation
# Owner: Madhav Gupta

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-prod-workloads"
  location = "eastus2"
  tags = {
    Owner       = var.project_owner
    Environment = var.environment
  }
}

resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-prod-eastus2"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "snet-compute-01"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_network_security_group" "nsg" {
  name                = "nsg-web-prod"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "Allow-HTTPS"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "nic" {
  name                = "nic-vm-prod-01"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                            = "vm-prod-app-01"
  resource_group_name             = azurerm_resource_group.rg.name
  location                        = azurerm_resource_group.rg.location
  size                            = "Standard_B2s"
  admin_username                  = "madhavadmin"
  disable_password_authentication = true
  network_interface_ids           = [azurerm_network_interface.nic.id]

  admin_ssh_key {
    username   = "madhavadmin"
    public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyForTestingZeroCostMadhavGupta owner@lab"
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
    disk_size_gb         = 30
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  custom_data = base64encode(<<-EOF
                #!/bin/bash
                echo "Azure VM Live | Owner: \${var.project_owner}" > /var/www/html/index.html
                systemctl start nginx
                EOF
  )

  tags = {
    Owner = var.project_owner
  }
}

resource "azurerm_managed_disk" "disk" {
  name                 = "disk-data-prod-64gb"
  location             = azurerm_resource_group.rg.location
  resource_group_name  = azurerm_resource_group.rg.name
  storage_account_type = "Premium_LRS"
  create_option        = "Empty"
  disk_size_gb         = 64
}

resource "azurerm_virtual_machine_data_disk_attachment" "attach" {
  managed_disk_id    = azurerm_managed_disk.disk.id
  virtual_machine_id = azurerm_linux_virtual_machine.vm.id
  lun                = 10
  caching            = "ReadWrite"
}
`
      },
      {
        name: 'variables.tf',
        path: 'variables.tf',
        language: 'hcl',
        content: `variable "environment" {
  type        = string
  default     = "production"
}

variable "project_owner" {
  type        = string
  default     = "Madhav Gupta"
}
`
      },
      {
        name: 'outputs.tf',
        path: 'outputs.tf',
        language: 'hcl',
        content: `output "vm_id" {
  value = azurerm_linux_virtual_machine.vm.id
}

output "data_disk_attachment_lun" {
  value = azurerm_virtual_machine_data_disk_attachment.attach.lun
}
`
      }
    ],
    activeFile: 'main.tf',
    localRunGuide: {
      prerequisites: [
        'Terraform CLI v1.5+',
        'Local mock provider or terraform plan -refresh=false'
      ],
      runScript: [
        'terraform init',
        'terraform validate',
        'terraform plan -out=tfplan'
      ],
      verificationCommands: [
        'terraform show tfplan',
        'terraform state list'
      ],
      notes: 'Zero-cost syntax, lifecycle, and attachment verification without Azure subscription.'
    }
  },

  // 3. AWS EKS Kubernetes Cluster (Zero-Cost Local with Kind/LocalStack)
  {
    id: 'eks-cluster-production',
    title: 'AWS EKS Production Cluster & IRSA',
    tagline: 'Multi-node group EKS with OIDC provider, IRSA roles, and CoreDNS add-ons',
    domain: 'kubernetes',
    category: 'kubernetes-aws',
    difficulty: 'Advanced',
    costRequirement: '$0.00 (Kind / Local Kubernetes)',
    description: 'Model enterprise-grade AWS EKS with managed node groups, OIDC Identity Provider integration for IAM Roles for Service Accounts (IRSA), VPC CNI, and automated cluster security group rules.',
    learningObjectives: [
      'Architect aws_eks_cluster with secure control plane logging',
      'Configure IAM Roles for Service Accounts (IRSA) via aws_iam_openid_connect_provider',
      'Manage multiple managed node groups with taint and label topologies',
      'Integrate kubernetes provider referencing EKS cluster auth token',
      'Simulate Kubernetes cluster operations locally using Kind / Minikube'
    ],
    interviewPrep: {
      coreQuestion: 'How does IRSA (IAM Roles for Service Accounts) work under the hood in AWS EKS, and how is it defined in Terraform?',
      interviewerIntent: 'Assesses deep knowledge of OIDC federation, JWT token projection, mutating admission webhooks, and trust relationship policies in Terraform.',
      juniorMistake: 'Giving worker nodes wide administrator IAM roles instead of scoping permissions to specific Kubernetes ServiceAccounts.',
      staffSolution: 'Create aws_iam_openid_connect_provider from cluster OIDC issuer URL. Define role trust policy with StringEquals condition matching system:serviceaccount:<namespace>:<sa-name>.',
      trapQuestions: [
        'What happens when the EKS cluster certificate expires?',
        'How do you upgrade EKS node groups without application downtime?'
      ],
      productionChecklist: [
        'Enable cluster logging for api, audit, authenticator, controllerManager, scheduler',
        'Set endpoint_private_access = true for VPC-only control plane access',
        'Define max_unavailable or max_unavailable_percentage in update_config'
      ]
    },
    files: [
      {
        name: 'main.tf',
        path: 'main.tf',
        language: 'hcl',
        content: `# AWS EKS Cluster with Managed Node Groups
# Owner: Madhav Gupta
# Zero-Cost Local Simulation via Kind

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
}

resource "aws_eks_cluster" "main" {
  name     = "eks-prod-cluster"
  role_arn = "arn:aws:iam::123456789012:role/eks-cluster-role"
  version  = "1.30"

  vpc_config {
    subnet_ids              = ["subnet-01", "subnet-02", "subnet-03"]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager"]

  tags = {
    Owner       = var.project_owner
    Environment = "production"
  }
}

resource "aws_eks_node_group" "system_nodes" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "ng-system-workers"
  node_role_arn   = "arn:aws:iam::123456789012:role/eks-nodegroup-role"
  subnet_ids      = ["subnet-01", "subnet-02", "subnet-03"]
  instance_types  = ["m5.large"]

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "system-workload"
  }
}

# Kubernetes Namespace in provisioned EKS
resource "kubernetes_namespace" "apps" {
  metadata {
    name = "production-apps"
    labels = {
      managed_by = "terraform"
      curated_by = "Madhav-Gupta"
    }
  }
}
`
      },
      {
        name: 'variables.tf',
        path: 'variables.tf',
        language: 'hcl',
        content: `variable "project_owner" {
  type        = string
  description = "Cluster architect"
  default     = "Madhav Gupta"
}
`
      },
      {
        name: 'outputs.tf',
        path: 'outputs.tf',
        language: 'hcl',
        content: `output "cluster_endpoint" {
  description = "EKS API Server Endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_name" {
  value = aws_eks_cluster.main.name
}
`
      }
    ],
    activeFile: 'main.tf',
    localRunGuide: {
      prerequisites: [
        'Kind (Kubernetes in Docker) or Minikube installed',
        'kubectl CLI installed',
        'Terraform CLI'
      ],
      dockerCompose: `kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker`,
      runScript: [
        'kind create cluster --name eks-zero-cost',
        'kubectl cluster-info',
        'terraform init',
        'terraform apply -auto-approve'
      ],
      verificationCommands: [
        'kubectl get nodes -o wide',
        'kubectl get ns'
      ],
      notes: 'Mirrors production EKS architecture with 1 control plane and 2 worker nodes locally with 0 cloud cost.'
    }
  },

  // 4. Azure AKS Production Cluster (Zero-Cost Practice)
  {
    id: 'aks-cluster-production',
    title: 'Azure AKS Production Cluster with Workload Identity',
    tagline: 'Azure CNI cluster with system + user node pools and Entra Workload Identity',
    domain: 'kubernetes',
    category: 'kubernetes-azure',
    difficulty: 'Advanced',
    costRequirement: '$0.00 (Kind / Local K8s)',
    description: 'Deploy Azure Kubernetes Service (AKS) with Azure CNI networking, automated system and user node pool separation, Azure AD / Entra Workload Identity federation, and auto-repair.',
    learningObjectives: [
      'Provision azurerm_kubernetes_cluster with separated node pools',
      'Configure oid_issuer_enabled = true for Entra Workload Identity',
      'Manage system vs user pool taints to prevent worker eviction',
      'Set up Azure Key Vault Secrets Store CSI Driver integration',
      'Simulate complete deployment locally without paying Azure compute fees'
    ],
    interviewPrep: {
      coreQuestion: 'Why should you separate system node pools from user node pools in Azure AKS, and how is it defined in Terraform?',
      interviewerIntent: 'Checks understanding of CriticalAddonsOnly taint, AKS node pool modes, and noisy neighbor isolation.',
      juniorMistake: 'Deploying heavy user microservices directly on the default system node pool, starving CoreDNS and metrics-server.',
      staffSolution: 'Set default_node_pool only_critical_addons_enabled = true and only_critical_addons_enabled = true. Create secondary azurerm_kubernetes_cluster_node_pool with mode = "User".',
      trapQuestions: [
        'What happens if Azure CNI runs out of IP addresses in the subnet?',
        'How does Workload Identity replace Pod Identity in modern AKS?'
      ],
      productionChecklist: [
        'Enable workload_identity_enabled = true and oidc_issuer_enabled = true',
        'Use network_plugin = "azure" or "azure-overlay"',
        'Enable automated node auto-upgrade and OS security patching'
      ]
    },
    files: [
      {
        name: 'main.tf',
        path: 'main.tf',
        language: 'hcl',
        content: `# Azure AKS Production Architecture
# Owner: Madhav Gupta
# Zero-Cost Simulation

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

resource "azurerm_resource_group" "rg_k8s" {
  name     = "rg-prod-aks-cluster"
  location = "eastus2"
  tags = {
    Owner = var.project_owner
  }
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                      = "aks-prod-platform"
  location                  = azurerm_resource_group.rg_k8s.location
  resource_group_name       = azurerm_resource_group.rg_k8s.name
  dns_prefix                = "aks-prod-platform"
  kubernetes_version        = "1.30.2"
  oidc_issuer_enabled       = true
  workload_identity_enabled = true

  default_node_pool {
    name                = "systempool"
    node_count          = 2
    vm_size             = "Standard_D2s_v5"
    os_disk_size_gb     = 50
    only_critical_addons_enabled = true
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }

  tags = {
    Owner = var.project_owner
  }
}

# User Workload Node Pool
resource "azurerm_kubernetes_cluster_node_pool" "user_pool" {
  name                  = "userpool"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks.id
  vm_size               = "Standard_D4s_v5"
  node_count            = 3
  mode                  = "User"
  enable_auto_scaling   = true
  min_count             = 2
  max_count             = 8

  node_labels = {
    "workload" = "application"
    "curated"  = "Madhav-Gupta"
  }
}
`
      },
      {
        name: 'variables.tf',
        path: 'variables.tf',
        language: 'hcl',
        content: `variable "project_owner" {
  type    = string
  default = "Madhav Gupta"
}
`
      },
      {
        name: 'outputs.tf',
        path: 'outputs.tf',
        language: 'hcl',
        content: `output "aks_oidc_issuer_url" {
  value = azurerm_kubernetes_cluster.aks.oidc_issuer_url
}

output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}
`
      }
    ],
    activeFile: 'main.tf',
    localRunGuide: {
      prerequisites: [
        'Local Kind or K3d installed',
        'kubectl CLI',
        'Terraform CLI v1.5+'
      ],
      runScript: [
        '# Create local K3s or Kind cluster:',
        'kind create cluster --name aks-zero-cost',
        'terraform init',
        'terraform validate'
      ],
      verificationCommands: [
        '# View simulated AKS cluster state:',
        'terraform state show azurerm_kubernetes_cluster.aks'
      ],
      notes: 'Practice enterprise Azure AKS provisioning, workload identity federation, and multiple node pools with zero Azure subscription expense.'
    }
  },

  // 5. Terraform State Surgery (terraform state rm / mv / import)
  {
    id: 'terraform-state-surgery',
    title: 'Terraform State Surgery & Drift Remediation',
    tagline: 'Fix state corruptions, refactor modules with moved blocks, and rm/mv resources',
    domain: 'terraform-core',
    category: 'state-surgery',
    difficulty: 'Advanced',
    costRequirement: '$0.00 (Local State Engine)',
    description: 'Master advanced state management without breaking production. Practice manual resource adoption with import blocks, atomic renaming with moved blocks, and surgical removal via terraform state rm.',
    learningObjectives: [
      'Execute terraform state mv without destroying and recreating resources',
      'Use modern moved {} blocks in Terraform 1.1+ for automated refactoring',
      'Import unmanaged infrastructure cleanly with import {} blocks',
      'Safely remove orphaned state pointers using terraform state rm'
    ],
    interviewPrep: {
      coreQuestion: 'How do you rename a resource or move it into a module without causing Terraform to destroy and recreate it in production?',
      interviewerIntent: 'Determines if candidate knows the difference between legacy state mv CLI commands and declarative moved {} blocks introduced in Terraform 1.1.',
      juniorMistake: 'Simply renaming the HCL block, applying without checking plan, and causing critical production database destruction.',
      staffSolution: 'Declare a moved { from = aws_s3_bucket.legacy to = module.storage.aws_s3_bucket.primary } block in code so changes are version-controlled and reproducible across teammates.',
      trapQuestions: [
        'What is stored in terraform.tfstate lineage and serial?',
        'How do you recover if an engineer force-unlocks a state while an apply is active?'
      ],
      productionChecklist: [
        'Always run terraform plan and inspect for ~ (update) vs -/+ (replace)',
        'Take atomic state backups: terraform state pull > backup.json before surgery',
        'Commit moved {} blocks to Git rather than running manual CLI state mv'
      ]
    },
    files: [
      {
        name: 'main.tf',
        path: 'main.tf',
        language: 'hcl',
        content: `# Terraform State Surgery & Refactoring
# Owner: Madhav Gupta

terraform {
  required_version = ">= 1.5.0"
}

# Declarative refactoring block: Tells Terraform this was moved, not deleted!
moved {
  from = aws_security_group.old_firewall
  to   = aws_security_group.app_firewall
}

resource "aws_security_group" "app_firewall" {
  name        = "app-firewall-v2"
  description = "Managed by Madhav Gupta"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
}
`
      },
      {
        name: 'variables.tf',
        path: 'variables.tf',
        language: 'hcl',
        content: `variable "project_owner" {
  type    = string
  default = "Madhav Gupta"
}
`
      }
    ],
    activeFile: 'main.tf',
    localRunGuide: {
      prerequisites: ['Terraform CLI v1.5+'],
      runScript: [
        'terraform init',
        'terraform state list',
        'terraform plan'
      ],
      verificationCommands: [
        'terraform state show aws_security_group.app_firewall'
      ],
      notes: 'State surgery tests the HCL engine directly in memory with instant feedback.'
    }
  }
];
