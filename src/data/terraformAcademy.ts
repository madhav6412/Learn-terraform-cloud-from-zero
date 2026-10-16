export interface TerraformCommandGuide {
  command: string;
  category: 'core' | 'state' | 'workspace' | 'inspection' | 'advanced';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  syntax: string;
  flags: { flag: string; desc: string }[];
  example: string;
  interviewTip: string;
}

export interface LearningLesson {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  summary: string;
  coreConcepts: string[];
  codeSnippet: string;
  keyTakeaway: string;
}

export interface FileTemplate {
  id: string;
  filename: string;
  description: string;
  category: string;
  content: string;
}

export const TERRAFORM_COMMANDS: TerraformCommandGuide[] = [
  {
    command: 'terraform init',
    category: 'core',
    level: 'Beginner',
    summary: 'Initializes a working directory containing Terraform configuration files. Downloads provider plugins and configures the backend.',
    syntax: 'terraform init [options]',
    flags: [
      { flag: '-upgrade', desc: 'Upgrades previously installed plugins and modules to the newest versions matching constraints' },
      { flag: '-reconfigure', desc: 'Disregards any existing backend configuration, preventing state migration prompt' },
      { flag: '-migrate-state', desc: 'Reconfigures a backend and attempts to copy existing state data to the new backend' }
    ],
    example: 'terraform init -upgrade',
    interviewTip: 'Always know the difference between -reconfigure (wipes local state cache and connects to new backend clean) and -migrate-state (copies state from old backend to new).'
  },
  {
    command: 'terraform validate',
    category: 'core',
    level: 'Beginner',
    summary: 'Validates configuration files in a directory to ensure syntactical and internal consistency without accessing remote APIs.',
    syntax: 'terraform validate [options]',
    flags: [
      { flag: '-json', desc: 'Outputs validation errors and warnings in machine-readable JSON format for CI pipelines' }
    ],
    example: 'terraform validate -json',
    interviewTip: 'Fastest check in CI/CD pipeline. It runs locally without needing cloud provider credentials.'
  },
  {
    command: 'terraform fmt',
    category: 'core',
    level: 'Beginner',
    summary: 'Rewrites Terraform configuration files to canonical HCL format and style standards.',
    syntax: 'terraform fmt [options] [target]',
    flags: [
      { flag: '-check', desc: 'Checks if input is formatted; returns non-zero exit code if formatting differences exist (great for CI pre-commit)' },
      { flag: '-recursive', desc: 'Formats files in subdirectories too' },
      { flag: '-diff', desc: 'Displays diff of formatting changes' }
    ],
    example: 'terraform fmt -check -recursive',
    interviewTip: 'Senior engineers always enforce "terraform fmt -check -recursive" in git pre-commit hooks or GitHub Actions.'
  },
  {
    command: 'terraform plan',
    category: 'core',
    level: 'Beginner',
    summary: 'Creates an execution plan, reading current state, querying cloud APIs for drift, and determining what actions are necessary.',
    syntax: 'terraform plan [options]',
    flags: [
      { flag: '-out=<path>', desc: 'Saves the generated execution plan to a file to be applied deterministically later' },
      { flag: '-detailed-exitcode', desc: 'Returns 0 on no changes, 2 on changes present, 1 on error (essential for CI automation)' },
      { flag: '-refresh-only', desc: 'Inspects real-world infrastructure and updates state without planning any resource changes' },
      { flag: '-target=<resource>', desc: 'Targets a single resource (use only during emergency incident recovery)' }
    ],
    example: 'terraform plan -out=tfplan.binary',
    interviewTip: 'Never use -target in daily production. It leads to incomplete state dependency graphs and drift.'
  },
  {
    command: 'terraform apply',
    category: 'core',
    level: 'Beginner',
    summary: 'Executes the actions proposed in a Terraform plan to create, update, or delete infrastructure.',
    syntax: 'terraform apply [options] [plan_file]',
    flags: [
      { flag: '-auto-approve', desc: 'Skips interactive confirmation prompt (used in automated CI runners)' },
      { flag: '-parallelism=n', desc: 'Limits the number of concurrent operations as Terraform walks the graph (default: 10)' },
      { flag: '-replace=<addr>', desc: 'Forces replacement of a specific resource instance in Terraform 0.15+' }
    ],
    example: 'terraform apply tfplan.binary',
    interviewTip: 'Applying an explicit plan file (terraform apply tfplan) guarantees that exactly what was reviewed in PR is applied, preventing race conditions.'
  },
  {
    command: 'terraform destroy',
    category: 'core',
    level: 'Beginner',
    summary: 'Destroys all remote objects managed by the current Terraform configuration.',
    syntax: 'terraform destroy [options]',
    flags: [
      { flag: '-auto-approve', desc: 'Skips interactive confirmation' },
      { flag: '-target=<addr>', desc: 'Surgically destroys only the specified resource' }
    ],
    example: 'terraform destroy -auto-approve',
    interviewTip: 'Protect production databases with lifecycle { prevent_destroy = true } so terraform destroy errors out instead of destroying data.'
  },
  {
    command: 'terraform state list',
    category: 'state',
    level: 'Intermediate',
    summary: 'Lists all resource instances currently tracked in the state file.',
    syntax: 'terraform state list [options] [address...]',
    flags: [
      { flag: '-state=<path>', desc: 'Path to a state file (defaults to current remote/local state)' }
    ],
    example: 'terraform state list',
    interviewTip: 'First command to run when investigating state conflicts or finding exact resource addresses for state surgery.'
  },
  {
    command: 'terraform state show',
    category: 'state',
    level: 'Intermediate',
    summary: 'Shows the full attributes and metadata of a single resource in state.',
    syntax: 'terraform state show <address>',
    flags: [],
    example: 'terraform state show aws_instance.web_vm',
    interviewTip: 'Allows inspection of computed attributes (IPs, ARNs, security tokens) stored in state without logging into the cloud console.'
  },
  {
    command: 'terraform state mv',
    category: 'state',
    level: 'Advanced',
    summary: 'Moves an item in the state file to a different address without destroying and recreating remote infrastructure.',
    syntax: 'terraform state mv <source> <destination>',
    flags: [
      { flag: '-dry-run', desc: 'Simulates the move without writing modifications to state' }
    ],
    example: 'terraform state mv aws_instance.web module.frontend.aws_instance.web',
    interviewTip: 'In modern Terraform 1.1+, prefer declarative "moved {}" blocks in code over CLI state mv so teammates stay in sync.'
  },
  {
    command: 'terraform state rm',
    category: 'state',
    level: 'Advanced',
    summary: 'Removes resources from state so Terraform stops managing them without destroying the actual cloud resource.',
    syntax: 'terraform state rm [options] <address...>',
    flags: [
      { flag: '-backup=<path>', desc: 'Path to backup file before removal' }
    ],
    example: 'terraform state rm aws_s3_bucket.orphan_bucket',
    interviewTip: 'Used when de-coupling infrastructure or handing management over to another team or tool without terminating resources.'
  },
  {
    command: 'terraform import',
    category: 'state',
    level: 'Advanced',
    summary: 'Associates existing unmanaged cloud resources with a Terraform resource block.',
    syntax: 'terraform import [options] <address> <id>',
    flags: [
      { flag: '-var-file=<file>', desc: 'Set variables from an external file' }
    ],
    example: 'terraform import aws_s3_bucket.legacy bkt-production-assets',
    interviewTip: 'In Terraform 1.5+, declarative "import {}" blocks generate configuration automatically with "terraform plan -generate-config-out=generated.tf".'
  },
  {
    command: 'terraform workspace',
    category: 'workspace',
    level: 'Intermediate',
    summary: 'Manages multiple distinct state environments (e.g. dev, staging, prod) within the same configuration directory.',
    syntax: 'terraform workspace [list|select|new|delete] [name]',
    flags: [],
    example: 'terraform workspace select production',
    interviewTip: 'Workspaces share the exact same HCL code. For multi-account or multi-region setups with different IAM permissions, separate directory structures or Terragrunt are often preferred over workspaces.'
  },
  {
    command: 'terraform graph',
    category: 'inspection',
    level: 'Intermediate',
    summary: 'Outputs the visual Directed Acyclic Graph (DAG) of resources in DOT format.',
    syntax: 'terraform graph [options]',
    flags: [
      { flag: '-type=plan', desc: 'Graph type: plan, apply, validate, destroy' }
    ],
    example: 'terraform graph | dot -Tsvg > topology.svg',
    interviewTip: 'Essential for diagnosing cyclic dependency errors (Error: Cycle: resource A -> resource B).'
  },
  {
    command: 'terraform test',
    category: 'advanced',
    level: 'Advanced',
    summary: 'Executes native integration and unit test suites defined in .tftest.hcl files (introduced in Terraform 1.6+).',
    syntax: 'terraform test [options]',
    flags: [
      { flag: '-verbose', desc: 'Prints detailed step-by-step test assertion results' }
    ],
    example: 'terraform test -verbose',
    interviewTip: 'Replaces external third-party tools like Terratest (Go) for lightweight assertion testing directly within the HashiCorp ecosystem.'
  }
];

export const TERRAFORM_LESSONS: LearningLesson[] = [
  {
    id: 'lesson-1-syntax-basics',
    title: '1. HCL2 Core Syntax & Block Anatomy',
    level: 'Beginner',
    duration: '10 min',
    summary: 'Understand the fundamental building blocks of HashiCorp Configuration Language (HCL): blocks, arguments, identifiers, and types.',
    coreConcepts: [
      'Block Type: terraform {}, provider {}, resource {}, variable {}, output {}, local {}',
      'Labels: First label is the resource type (aws_instance), second is the local reference name (web)',
      'Data types: string, number, bool, list(string), map(string), object({ ... })'
    ],
    codeSnippet: `# Standard HCL Block Structure
resource "aws_s3_bucket" "app_storage" {
  bucket = "my-unique-bucket-name"

  tags = {
    Environment = "production"
    Owner       = "Madhav Gupta"
  }
}`,
    keyTakeaway: 'Resource identifier inside code is aws_s3_bucket.app_storage.id, while the cloud provider only sees bucket = "my-unique-bucket-name".'
  },
  {
    id: 'lesson-2-variables-outputs',
    title: '2. Dynamic Configuration: Variables, Locals & Outputs',
    level: 'Beginner',
    duration: '15 min',
    summary: 'Separate configuration from code using typed input variables, DRY local values, and exportable outputs.',
    coreConcepts: [
      'Input Variables: declare with variable "name" { type, default, description, validation }',
      'terraform.tfvars: auto-loaded file for variable value assignments',
      'Local Values: computed intermediate variables declared via locals {}',
      'Outputs: queryable data exposed after apply via output "endpoint" { value }'
    ],
    codeSnippet: `locals {
  common_tags = {
    Project = "Zero-Cloud Lab"
    Owner   = "Madhav Gupta"
  }
}

variable "instance_count" {
  type    = number
  default = 2
  validation {
    condition     = var.instance_count > 0 && var.instance_count <= 10
    error_message = "Instance count must be between 1 and 10."
  }
}`,
    keyTakeaway: 'Use variables for values passed from outside, and locals for reusable internal calculations and DRY tags.'
  },
  {
    id: 'lesson-3-state-remote-backends',
    title: '3. State Engine: Remote Backends & Locking',
    level: 'Intermediate',
    duration: '20 min',
    summary: 'Master how Terraform records real-world resource mappings in terraform.tfstate and locks state via DynamoDB / Azure Blob.',
    coreConcepts: [
      'Lineage & Serial: lineage is unique per state lifecycle; serial increments on every state-altering commit',
      'State Locking: prevents concurrent applies from corrupting the JSON graph',
      'Sensitive Attributes: sensitive values are stored in plaintext in the state JSON; protect backend with KMS encryption and RBAC'
    ],
    codeSnippet: `terraform {
  backend "s3" {
    bucket         = "prod-tfstate-vault"
    key            = "compute/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table"
    encrypt        = true
  }
}`,
    keyTakeaway: 'Never store state files in Git. Always use a remote backend with encryption-at-rest and distributed locking.'
  },
  {
    id: 'lesson-4-modules-reusability',
    title: '4. Enterprise Modules & Dependency Inversion',
    level: 'Intermediate',
    duration: '25 min',
    summary: 'Design modular, reusable infrastructure components following the standard module structure.',
    coreConcepts: [
      'Root Module vs Child Module: root is current directory; child is imported via module "vpc" { source = "./modules/vpc" }',
      'Version Pinning: pin module versions in Git or Registry (source = "...?ref=v2.1.0")',
      'Composition over Monoliths: keep VPC, compute, and database in separate modules'
    ],
    codeSnippet: `module "network" {
  source = "./modules/vpc"

  vpc_cidr            = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  project_owner       = "Madhav Gupta"
}`,
    keyTakeaway: 'Modules should declare only input variables and outputs, keeping providers configured at the root module level.'
  },
  {
    id: 'lesson-5-lifecycle-drift-surgery',
    title: '5. Advanced Lifecycle, Drift & State Surgery',
    level: 'Advanced',
    duration: '30 min',
    summary: 'Prevent production downtime using lifecycle blocks, reconcile drift safely, and execute zero-downtime refactors with moved {}.',
    coreConcepts: [
      'create_before_destroy: creates replacement resource before terminating old instance',
      'prevent_destroy: hard crash if terraform plan attempts destruction',
      'ignore_changes: ignores changes to specific arguments modified out-of-band by autoscalers',
      'moved {} block: declarative state migration without running manual CLI commands'
    ],
    codeSnippet: `resource "aws_instance" "production" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = true
    ignore_changes        = [tags["LastInspected"]]
  }
}`,
    keyTakeaway: 'Combine create_before_destroy with name_prefix to avoid unique name collisions during zero-downtime blue/green replacements.'
  }
];

export const STARTER_TEMPLATES: FileTemplate[] = [
  {
    id: 'template-main',
    filename: 'main.tf',
    category: 'Core',
    description: 'Main resource configuration blueprint for zero-cost infrastructure',
    content: `# Main Terraform Configuration
# Owner & Lead DevOps: Madhav Gupta
# Zero-Cloud Lab ($0.00 Cost Guarantee)

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
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    ec2 = "http://localhost:4566"
    s3  = "http://localhost:4566"
  }
}

resource "aws_s3_bucket" "app_storage" {
  bucket = "madhav-zero-cloud-storage-bucket"

  tags = {
    Environment = var.environment
    Owner       = var.project_owner
    ManagedBy   = "Terraform"
  }
}
`
  },
  {
    id: 'template-variables',
    filename: 'variables.tf',
    category: 'Variables',
    description: 'Strongly-typed input variables with default values and validation rules',
    content: `# Input Variables Definition
# Owner: Madhav Gupta

variable "environment" {
  type        = string
  description = "Target deployment environment (dev, staging, prod)"
  default     = "production"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "project_owner" {
  type        = string
  description = "Lead DevOps architect responsible for this infrastructure"
  default     = "Madhav Gupta"
}

variable "instance_count" {
  type        = number
  description = "Desired number of compute replica nodes"
  default     = 3
}
`
  },
  {
    id: 'template-outputs',
    filename: 'outputs.tf',
    category: 'Outputs',
    description: 'Exportable infrastructure endpoints and attributes',
    content: `# Output Values Definition
# Owner: Madhav Gupta

output "storage_bucket_id" {
  description = "S3 Bucket Identifier"
  value       = aws_s3_bucket.app_storage.id
}

output "storage_bucket_arn" {
  description = "S3 Bucket Amazon Resource Name (ARN)"
  value       = aws_s3_bucket.app_storage.arn
}

output "owner" {
  description = "Infrastructure Owner"
  value       = var.project_owner
}
`
  },
  {
    id: 'template-providers',
    filename: 'providers.tf',
    category: 'Providers',
    description: 'Multi-cloud provider configuration with zero-cost LocalStack endpoints',
    content: `# Multi-Cloud Provider Declaration
# Owner: Madhav Gupta

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
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
  endpoints {
    ec2 = "http://localhost:4566"
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}
`
  },
  {
    id: 'template-tfvars',
    filename: 'terraform.tfvars',
    category: 'Variables',
    description: 'Environment variable value assignments for production deployment',
    content: `# Production Environment Overrides
# Owner: Madhav Gupta

environment   = "production"
project_owner = "Madhav Gupta"
instance_count = 3
`
  }
];
