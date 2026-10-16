export interface ZeroCloudGuide {
  id: string;
  title: string;
  category: string;
  summary: string;
  keyTechnique: string;
  configSnippet: string;
  commands: string[];
}

export const ZERO_CLOUD_GUIDES: ZeroCloudGuide[] = [
  {
    id: 'localstack-aws',
    title: 'LocalStack AWS Emulation',
    category: 'AWS Without Subscription',
    summary: 'Emulates over 35+ AWS services (S3, Lambda, SQS, SNS, DynamoDB, IAM, Secrets Manager, API Gateway, CloudWatch) entirely on your local machine using Docker.',
    keyTechnique: 'Provider Endpoint Redirection + Authentication Bypass (`skip_credentials_validation = true`, `endpoints { s3 = "http://localhost:4566" }`).',
    configSnippet: `provider "aws" {
  region                      = "us-east-1"
  access_key                  = "mock_key"
  secret_key                  = "mock_secret"
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3       = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    sqs      = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    iam      = "http://localhost:4566"
  }
}`,
    commands: [
      'docker run --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack',
      'terraform init',
      'terraform apply -auto-approve',
      'aws --endpoint-url=http://localhost:4566 s3 ls'
    ]
  },
  {
    id: 'docker-provider',
    title: 'kreuzwerker/docker Provider',
    category: 'Container Orchestration',
    summary: 'Enables managing real containers, bridge/overlay networks, volumes, and images directly on your local Docker daemon without needing ECS, EKS, or GKE.',
    keyTechnique: 'Binding provider directly to unix:///var/run/docker.sock or npipe:////./pipe/docker_engine on Windows.',
    configSnippet: `terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "docker_network" "private" {
  name = "app-network"
}`,
    commands: [
      'terraform init',
      'terraform plan',
      'terraform apply -auto-approve',
      'docker network ls'
    ]
  },
  {
    id: 'minio-s3-backend',
    title: 'MinIO for Remote S3 Backend & State Locking',
    category: 'State & Locking',
    summary: 'Practice remote state storage, state locking, and team collaboration workflows by running MinIO locally as an S3-compatible remote state backend.',
    keyTechnique: 'Configuring standard `backend "s3"` with `endpoint = "http://localhost:9000"` and `use_path_style = true`.',
    configSnippet: `terraform {
  backend "s3" {
    bucket                      = "tf-state-store"
    key                         = "prod/terraform.tfstate"
    region                      = "main"
    endpoint                    = "http://localhost:9000"
    access_key                  = "minioadmin"
    secret_key                  = "minioadmin"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    use_path_style              = true
  }
}`,
    commands: [
      'docker run -p 9000:9000 -p 9001:9001 -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" minio/minio server /data --console-address ":9001"',
      'terraform init -migrate-state',
      'terraform apply'
    ]
  },
  {
    id: 'native-terraform-test',
    title: 'Native "terraform test" Framework',
    category: 'Testing & Verification',
    summary: 'Introduced in Terraform 1.6+, write first-party unit and integration tests in `.tftest.hcl` files using `command = plan` and custom `assert {}` blocks without provisioning any real infrastructure.',
    keyTechnique: 'Using mock providers (`mock_provider "aws" {}`) and asserting output parameters and resource attributes during plan phase.',
    configSnippet: `mock_provider "aws" {}

run "unit_test_naming" {
  command = plan

  variables {
    environment = "staging"
  }

  assert {
    condition     = aws_s3_bucket.main.bucket == "company-staging-bucket"
    error_message = "Bucket name did not match expected staging naming convention."
  }
}`,
    commands: [
      'terraform init',
      'terraform test',
      'terraform test -verbose',
      'terraform test -filter=tests/unit.tftest.hcl'
    ]
  },
  {
    id: 'opa-conftest-policy',
    title: 'Open Policy Agent (OPA) / Conftest',
    category: 'Policy as Code',
    summary: 'Validate your Terraform plans against enterprise compliance and security guardrails (CIS benchmarks, tag enforcement, encryption rules) before apply.',
    keyTechnique: 'Convert binary plan to JSON using `terraform show -json tfplan.binary > tfplan.json` and evaluate with Rego policies.',
    configSnippet: `package terraform.security

deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    not resource.change.after.server_side_encryption_configuration
    msg := "S3 buckets must be encrypted with SSE-KMS."
}`,
    commands: [
      'terraform plan -out=tfplan.binary',
      'terraform show -json tfplan.binary > tfplan.json',
      'conftest test tfplan.json -p policy.rego'
    ]
  }
];
