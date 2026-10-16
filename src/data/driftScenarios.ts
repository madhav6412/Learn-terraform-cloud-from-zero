export interface DriftItem {
  id: string;
  title: string;
  category: 'security' | 'cost' | 'governance' | 'availability';
  severity: 'Critical' | 'High' | 'Medium';
  targetResource: string;
  sourceOfDrift: string; // e.g. "AWS Console ClickOps"
  description: string;
  expectedState: Record<string, any>;
  realWorldState: Record<string, any>;
  diffSummary: string[];
  planOutput: string;
  remediationGuide: {
    revertAction: string; // e.g. "terraform apply to overwrite console changes"
    adoptAction: string; // e.g. "terraform apply -refresh-only or update variables.tf"
    ignoreAction: string; // e.g. "Add lifecycle { ignore_changes = [instance_type] }"
  };
}

export const DRIFT_SCENARIOS: DriftItem[] = [
  {
    id: 'drift-sg-ssh-open',
    title: 'ClickOps Security Hole: Unapproved SSH (Port 22) Opened to 0.0.0.0/0',
    category: 'security',
    severity: 'Critical',
    targetResource: 'aws_security_group.web_sg',
    sourceOfDrift: 'AWS Management Console (ClickOps by On-Call)',
    description: 'During a late-night debugging incident, an engineer logged into the AWS console and added an inbound rule allowing port 22 from 0.0.0.0/0. The change was never committed to Terraform, violating zero-trust policy.',
    expectedState: {
      name: 'production-web-sg',
      ingress_rules: [
        { from_port: 443, to_port: 443, protocol: 'tcp', cidr: '0.0.0.0/0', desc: 'HTTPS' },
        { from_port: 80, to_port: 80, protocol: 'tcp', cidr: '0.0.0.0/0', desc: 'HTTP' }
      ]
    },
    realWorldState: {
      name: 'production-web-sg',
      ingress_rules: [
        { from_port: 443, to_port: 443, protocol: 'tcp', cidr: '0.0.0.0/0', desc: 'HTTPS' },
        { from_port: 80, to_port: 80, protocol: 'tcp', cidr: '0.0.0.0/0', desc: 'HTTP' },
        { from_port: 22, to_port: 22, protocol: 'tcp', cidr: '0.0.0.0/0', desc: 'TEMPORARY_DEBUG_SSH (UNMANAGED DRIFT)' }
      ]
    },
    diffSummary: [
      '- Unmanaged ingress rule detected: Port 22 (SSH) open to public internet (0.0.0.0/0)',
      '- Security group in AWS console does not match Terraform state',
      '- High vulnerability: Exposed to brute-force credential stuffing'
    ],
    planOutput: `Note: Objects have changed outside of Terraform

Terraform detected the following changes made outside of Terraform since the
last "terraform apply" which have been detected with "terraform plan":

  # aws_security_group.web_sg has changed outside of Terraform:
  ~ resource "aws_security_group" "web_sg" {
        id                     = "sg-04a91b2c3d4e5f"
        name                   = "production-web-sg"
      ~ ingress = [
            # (2 unchanged elements hidden)
          - {
              - cidr_blocks      = [
                  - "0.0.0.0/0",
                ]
              - description      = "TEMPORARY_DEBUG_SSH"
              - from_port        = 22
              - protocol         = "tcp"
              - to_port          = 22
            },
        ]
        # (4 unchanged attributes hidden)
    }

Unless you have made equivalent changes to your configuration, or ignored the
relevant attributes using "ignore_changes", the following plan will apply:

Terraform will perform the following actions:

  # aws_security_group.web_sg will be updated in-place:
  ~ resource "aws_security_group" "web_sg" {
        id   = "sg-04a91b2c3d4e5f"
      ~ ingress = [
          # Revoking unmanaged Port 22 rule to restore compliance
        ]
    }

Plan: 0 to add, 1 to change, 0 to destroy.`,
    remediationGuide: {
      revertAction: 'Run "terraform apply" to automatically strip the unauthorized SSH rule and enforce security compliance.',
      adoptAction: 'If SSH is genuinely required, codify the rule into main.tf using aws_security_group_rule restricted to corporate VPN CIDR.',
      ignoreAction: 'lifecycle { ignore_changes = [ingress] } (Not recommended for security groups).'
    }
  },

  {
    id: 'drift-instance-type',
    title: 'Manual VM Resize: t3.medium Scaled to t3.2xlarge ($$$ Billing Spike)',
    category: 'cost',
    severity: 'High',
    targetResource: 'aws_instance.web_vm',
    sourceOfDrift: 'AWS EC2 Console / CloudWatch Alarm Lambda',
    description: 'An automated autoscaling script or engineer manually resized the EC2 instance from t3.medium (2 vCPU, 4GB RAM) to t3.2xlarge (8 vCPU, 32GB RAM), increasing monthly cloud expenditure by 400%.',
    expectedState: {
      id: 'i-09f8e4381b0a92d',
      instance_type: 't3.medium',
      vcpus: 2,
      ram_gb: 4,
      monthly_cost: '$30.37'
    },
    realWorldState: {
      id: 'i-09f8e4381b0a92d',
      instance_type: 't3.2xlarge',
      vcpus: 8,
      ram_gb: 32,
      monthly_cost: '$242.94 (+$212.57 Drift)'
    },
    diffSummary: [
      '- Instance type drifted: expected "t3.medium", found "t3.2xlarge"',
      '- 8x RAM allocation out-of-band',
      '- Monthly cost increased by $212.57 without budget approval'
    ],
    planOutput: `Note: Objects have changed outside of Terraform

Terraform detected the following changes made outside of Terraform since the
last "terraform apply":

  # aws_instance.web_vm has changed outside of Terraform:
  ~ resource "aws_instance" "web_vm" {
        id                          = "i-09f8e4381b0a92d"
      ~ instance_type               = "t3.2xlarge" -> "t3.medium"
        tags                        = {
            "Owner" = "Madhav Gupta"
        }
        # (14 unchanged attributes hidden)
    }

Terraform will perform the following actions:

  # aws_instance.web_vm will be updated in-place:
  ~ resource "aws_instance" "web_vm" {
      ~ instance_type = "t3.2xlarge" -> "t3.medium"
    }

Plan: 0 to add, 1 to change, 0 to destroy.`,
    remediationGuide: {
      revertAction: 'Run "terraform apply" to downscale the machine back to t3.medium.',
      adoptAction: 'If workload requires higher capacity, update variable "instance_type" in variables.tf to "t3.2xlarge" and run terraform apply.',
      ignoreAction: 'lifecycle { ignore_changes = [instance_type] } if external scheduler manages sizing.'
    }
  },

  {
    id: 'drift-missing-resource',
    title: 'Zombie State: Persistent EBS Volume Deleted Directly in Cloud Console',
    category: 'availability',
    severity: 'Critical',
    targetResource: 'aws_ebs_volume.data_disk',
    sourceOfDrift: 'Manual EC2 Volumes Cleanup / Purge Script',
    description: 'The attached 50GB EBS data disk was deleted directly by a junior engineer cleaning up stale volumes. The Terraform state file still expects the volume to exist, creating a "Zombie State" error.',
    expectedState: {
      id: 'vol-0a1b2c3d4e5f6g7h8',
      size: 50,
      status: 'in-use',
      encrypted: true
    },
    realWorldState: {
      id: 'vol-0a1b2c3d4e5f6g7h8',
      status: 'DELETED / 404 Not Found'
    },
    diffSummary: [
      '- Remote object has been deleted outside of Terraform',
      '- Resource id vol-0a1b2c3d4e5f6g7h8 does not exist in AWS',
      '- State file holds orphan pointer to non-existent disk'
    ],
    planOutput: `Note: Objects have changed outside of Terraform

Terraform detected the following changes made outside of Terraform:

  # aws_ebs_volume.data_disk has been deleted outside of Terraform:
  - resource "aws_ebs_volume" "data_disk" {
      - availability_zone = "us-east-1a"
      - encrypted         = true
      - id                = "vol-0a1b2c3d4e5f6g7h8"
      - size              = 50
      - type              = "gp3"
    }

Terraform will perform the following actions:

  # aws_ebs_volume.data_disk will be created:
  + resource "aws_ebs_volume" "data_disk" {
      + availability_zone = "us-east-1a"
      + encrypted         = true
      + id                = (known after apply)
      + size              = 50
      + type              = "gp3"
    }

Plan: 1 to add, 0 to change, 0 to destroy.`,
    remediationGuide: {
      revertAction: 'Run "terraform apply" to recreate the missing EBS volume with identical specifications.',
      adoptAction: 'If volume was intentionally retired, remove the resource block from main.tf and run "terraform state rm aws_ebs_volume.data_disk".',
      ignoreAction: 'Cannot ignore deleted resources; Terraform must recreate or remove from state.'
    }
  },

  {
    id: 'drift-tag-tampering',
    title: 'Governance Violation: Owner Tag Cleared / Tampered in Console',
    category: 'governance',
    severity: 'Medium',
    targetResource: 'aws_instance.web_vm',
    sourceOfDrift: 'FinOps Bulk Tagging Script',
    description: 'An automated FinOps cleaning script wiped out the mandatory `Owner = "Madhav Gupta"` tag from the virtual machine, causing internal auditing and chargeback pipelines to flag the instance as unowned.',
    expectedState: {
      Owner: 'Madhav Gupta',
      Environment: 'production',
      ManagedBy: 'Terraform'
    },
    realWorldState: {
      Owner: null,
      Environment: 'production',
      CostCenter: '9901-Unknown'
    },
    diffSummary: [
      '- Tag "Owner" was deleted from live AWS resource',
      '- Unmanaged tag "CostCenter: 9901-Unknown" added out-of-band',
      '- Audit pipeline failed: Missing required owner Madhav Gupta'
    ],
    planOutput: `Note: Objects have changed outside of Terraform

Terraform detected the following changes made outside of Terraform:

  # aws_instance.web_vm has changed outside of Terraform:
  ~ resource "aws_instance" "web_vm" {
        id    = "i-09f8e4381b0a92d"
      ~ tags  = {
          - "CostCenter"  = "9901-Unknown"
          + "Owner"       = "Madhav Gupta"
            # (2 unchanged elements hidden)
        }
    }

Terraform will perform the following actions:

  # aws_instance.web_vm will be updated in-place:
  ~ resource "aws_instance" "web_vm" {
      ~ tags = {
          + "Owner" = "Madhav Gupta"
        }
    }

Plan: 0 to add, 1 to change, 0 to destroy.`,
    remediationGuide: {
      revertAction: 'Run "terraform apply" to re-apply Owner = "Madhav Gupta" tag.',
      adoptAction: 'Run "terraform apply -refresh-only" if external tags should be accepted.',
      ignoreAction: 'lifecycle { ignore_changes = [tags["CostCenter"]] }'
    }
  }
];
