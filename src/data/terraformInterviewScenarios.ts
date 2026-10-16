export interface TerraformInterviewScenario {
  id: string;
  level: 'L1 (0-2 Yrs)' | 'L2 (2-5 Yrs)' | 'L3 (Senior / SRE 5+ Yrs)';
  title: string;
  category: 'State & Disaster Recovery' | 'Drift & Reconciliation' | 'Architecture & Modules' | 'Security & Secrets' | 'CI/CD & Locking';
  problemStatement: string;
  symptoms: string[];
  diagnosisCommands: string[];
  rootCause: string;
  terraformFixExplanation: string;
  hclSnippet: string;
  interviewTalkingPoints: string[];
}

export const TERRAFORM_INTERVIEW_SCENARIOS: TerraformInterviewScenario[] = [
  {
    id: 'tf-stuck-state-lock',
    level: 'L1 (0-2 Yrs)',
    title: 'Error Acquiring State Lock After CI/CD Pipeline Crash',
    category: 'CI/CD & Locking',
    problemStatement: 'A Jenkins / GitHub Actions worker was terminated during terraform apply. All subsequent runs fail immediately with "Error: Error acquiring the state lock: ConditionalCheckFailedException".',
    symptoms: [
      'Terraform apply fails immediately before reading state',
      'Output lists Lock Info: ID: e8b39c01-71bf-4b2a-a82f, Path: prod/terraform.tfstate, Who: runner@github-worker-4',
      'Team members cannot apply emergency hotfixes'
    ],
    diagnosisCommands: [
      'terraform plan (displays lock ID and owner)',
      'aws dynamodb get-item --table-name tf-locks --key \'{"LockID":{"S":"prod/terraform.tfstate-md5"}}\'',
      'terraform force-unlock <LOCK-ID>'
    ],
    rootCause: 'Terraform uses DynamoDB (or Azure Blob lease / Consul) to achieve distributed state locking. When the process died abruptly without executing the defer unlock hook, the lock item remained in DynamoDB.',
    terraformFixExplanation: '1) Verify that the crashed runner is completely dead and no apply is actively writing to state. 2) Execute terraform force-unlock <LOCK-ID>. 3) Run terraform plan -refresh-only to verify state consistency.',
    hclSnippet: `# S3 + DynamoDB Remote Backend Configuration
terraform {
  backend "s3" {
    bucket         = "corp-terraform-state-prod"
    key            = "production/core.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks" # Enforces state locking
    encrypt        = true
  }
}

# CLI command to unlock stuck state:
# terraform force-unlock e8b39c01-71bf-4b2a-a82f`,
    interviewTalkingPoints: [
      'Explain how state locking prevents split-brain writes and race conditions between multiple engineers and pipelines.',
      'Always stress the safety protocol: NEVER run force-unlock without verifying with the team that no one else is running an active apply.',
      'Explain that DynamoDB stores the lock with an MD5 hash of the state path as the primary key.'
    ]
  },

  {
    id: 'tf-drift-reconciliation',
    level: 'L2 (2-5 Yrs)',
    title: 'Production Infrastructure Drift & Manual Console Hotfixes',
    category: 'Drift & Reconciliation',
    problemStatement: 'During a midnight production outage, an on-call engineer manually modified an AWS Security Group rule and bumped an RDS instance size in the AWS Console. Morning Terraform plan wants to revert these changes back.',
    symptoms: [
      'terraform plan shows "~ update in-place" or "- destroy" on manual console changes',
      'Applying the plan would revert the emergency database scaling and cause another outage',
      'State is out of sync with actual cloud reality'
    ],
    diagnosisCommands: [
      'terraform plan -refresh-only',
      'terraform apply -refresh-only',
      'terraform state show aws_db_instance.main'
    ],
    rootCause: 'Terraform state records what was provisioned during the last apply. Out-of-band manual changes in AWS Console create drift. By default, Terraform attempts to re-align cloud reality with code.',
    terraformFixExplanation: '1) Use terraform plan -refresh-only (Terraform 0.15+) to inspect the drifted state without applying code changes. 2) Update the HCL code to reflect the new instance class and security group rules. 3) Run terraform plan to confirm 0 changes required.',
    hclSnippet: `# 1. Update HCL to match reality:
resource "aws_db_instance" "main" {
  identifier     = "production-master-db"
  instance_class = "db.r6g.2xlarge" # Updated from db.r6g.large to match emergency scale

  lifecycle {
    ignore_changes = [
      # Or optionally ignore autoscaling storage drift
      allocated_storage
    ]
  }
}

# 2. CLI Workflow:
# terraform plan -refresh-only
# terraform apply -refresh-only`,
    interviewTalkingPoints: [
      'Explain the difference between normal terraform plan (proposes changes from code -> cloud) vs terraform plan -refresh-only (proposes updating state -> matching cloud reality).',
      'Describe how automated scheduled drift detection pipelines (running daily in CI) alert teams before accidental reverts happen.',
      'Explain when to use lifecycle { ignore_changes = [...] } vs updating the code.'
    ]
  },

  {
    id: 'tf-unmanaged-resource-import',
    level: 'L2 (2-5 Yrs)',
    title: 'Adopting Existing Unmanaged Cloud Resources (Terraform 1.5+ Declarative Import)',
    category: 'State & Disaster Recovery',
    problemStatement: 'A company has a critical legacy VPC and S3 bucket created manually in 2021. You must bring them under Terraform management without recreating or altering them.',
    symptoms: [
      'Writing resource "aws_vpc" "legacy" and running terraform apply fails with "VpcAlreadyExists" or creates a duplicate duplicate VPC',
      'Zero downtime is permitted'
    ],
    diagnosisCommands: [
      'terraform plan -generate-config-out=generated.tf',
      'terraform apply',
      'terraform state list'
    ],
    rootCause: 'Terraform does not manage resources merely by writing HCL; an entry must exist inside the state file linking the HCL address to the cloud provider ID.',
    terraformFixExplanation: 'Use modern Terraform 1.5+ declarative import {} blocks. Combine with -generate-config-out to automatically synthesize pristine HCL code.',
    hclSnippet: `# Modern Declarative Import (Terraform 1.5+)
import {
  to = aws_vpc.legacy_network
  id = "vpc-07b94a12c8e3f"
}

import {
  to = aws_s3_bucket.legacy_assets
  id = "company-legacy-assets-bucket"
}

# Automatically synthesizes code with:
# terraform plan -generate-config-out=generated_resources.tf
# Then apply to record in state with 0 cloud modifications!`,
    interviewTalkingPoints: [
      'Compare legacy imperative terraform import <address> <id> with modern declarative import {} blocks (import blocks are reviewable in pull requests!).',
      'Emphasize that a successful import plan MUST show: "Plan: 1 to import, 0 to add, 0 to change, 0 to destroy".',
      'Mention how import {} protects against typos in resource attributes before writing state.'
    ]
  },

  {
    id: 'tf-secrets-in-state-vault',
    level: 'L3 (Senior / SRE 5+ Yrs)',
    title: 'Securing Sensitive Passwords & Preventing Plaintext Leakage in State',
    category: 'Security & Secrets',
    problemStatement: 'Security scan detected plaintext database master passwords and API keys stored inside the remote terraform.tfstate JSON file in S3.',
    symptoms: [
      'Sensitive variable values masked with (sensitive value) in CLI output, but plain text in terraform.tfstate',
      'Anyone with S3 read access can extract the production database root credentials'
    ],
    diagnosisCommands: [
      'terraform state pull | jq .resources[].instances[].attributes.password',
      'aws s3api get-object --bucket tf-state --key prod.tfstate'
    ],
    rootCause: 'Terraform state stores the full raw API response of all resources in order to track diffs. Marking a variable as sensitive = true only masks it in terminal console outputs, NOT in the state file.',
    terraformFixExplanation: '1) Never generate or store long-lived master passwords in Terraform. 2) Use dynamic secrets via HashiCorp Vault or AWS Secrets Manager with managed rotation (manage_master_user_password = true in AWS RDS). 3) Encrypt the S3 state bucket with KMS customer managed keys and restrict S3 bucket policy.',
    hclSnippet: `# Production Best Practice: Let AWS manage the master password dynamically
resource "aws_db_instance" "secure_postgres" {
  identifier                  = "production-db"
  engine                      = "postgres"
  username                    = "dbadmin"
  
  # AWS RDS manages and rotates the password inside AWS Secrets Manager!
  # Zero plaintext passwords in Terraform HCL or terraform.tfstate!
  manage_master_user_password = true
  master_user_secret_kms_key_id = aws_kms_key.secrets_cmk.arn
}

resource "aws_kms_key" "secrets_cmk" {
  description             = "CMK for RDS and State encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}`,
    interviewTalkingPoints: [
      'Staff Engineer answer: "Terraform is an infrastructure orchestrator, not a secrets store. Manage passwords via native cloud mechanisms (RDS Secrets Manager integration) or HashiCorp Vault dynamic database credentials."',
      'Explain that sensitive = true is a UI display control, not state encryption.',
      'Detail the 3 defense-in-depth layers for state: S3 SSE-KMS, IAM bucket policy restricting access to CI/CD role only, and S3 Object Lock/Versioning.'
    ]
  },

  {
    id: 'tf-monolith-to-modules-moved',
    level: 'L3 (Senior / SRE 5+ Yrs)',
    title: 'Splitting Monolithic Repositories Without Downtime via moved {} Blocks',
    category: 'Architecture & Modules',
    problemStatement: 'A monolithic Terraform codebase managing 400 resources takes 25 minutes to plan. You need to break it down into modular micro-repositories without recreating live databases or VPCs.',
    symptoms: [
      'Moving resources into child modules creates plan actions: - destroy (root resource), + create (module resource)',
      'Applying would cause complete service destruction and database loss'
    ],
    diagnosisCommands: [
      'terraform plan',
      'terraform state list',
      'terraform state mv <from> <to>'
    ],
    rootCause: 'Terraform uses the full resource address (e.g. module.networking.aws_vpc.main vs aws_vpc.main) as the primary index in the state map. Changing module hierarchy alters the address key.',
    terraformFixExplanation: 'Use declarative moved {} blocks directly in the HCL code. When Terraform reads the moved block, it migrates the state index in place without touching the cloud resource.',
    hclSnippet: `# Declarative state migration without downtime
moved {
  from = aws_vpc.main
  to   = module.vpc.aws_vpc.main
}

moved {
  from = aws_internet_gateway.gw
  to   = module.vpc.aws_internet_gateway.gw
}

module "vpc" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
}`,
    interviewTalkingPoints: [
      'Explain how moved {} blocks (Terraform 1.1+) replaced error-prone CLI state mv commands in shared teams.',
      'Describe blast-radius reduction: splitting monoliths into separate state files (network.tfstate, compute.tfstate, data.tfstate) using terraform_remote_state data source.',
      'Explain why plans must show "has moved to" with 0 to add, 0 to destroy.'
    ]
  }
];
