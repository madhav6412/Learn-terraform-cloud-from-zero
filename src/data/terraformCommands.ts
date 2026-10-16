export interface TerraformCommandItem {
  name: string;
  command: string;
  category: 'workflow' | 'state' | 'inspect' | 'workspace' | 'testing';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  shortSummary: string;
  description: string;
  commonFlags: Array<{ flag: string; description: string }>;
  exampleUsage: string;
  interviewGotcha: string;
  runnableCommand: string;
}

export const TERRAFORM_COMMANDS: TerraformCommandItem[] = [
  // --- 1. CORE WORKFLOW ---
  {
    name: 'terraform init',
    command: 'terraform init [options]',
    category: 'workflow',
    level: 'Beginner',
    shortSummary: 'Initializes working directory, backend, and provider plugins',
    description: 'Scans the root configuration files for required providers, resolves versions from the Terraform Registry or local mirrors, configures the backend (local, s3, azurerm, gcs), and initializes child modules.',
    commonFlags: [
      { flag: '-upgrade', description: 'Re-evaluates version constraints and upgrades providers/modules to the newest allowed versions.' },
      { flag: '-reconfigure', description: 'Ignores existing backend state and reinitializes with new backend configuration.' },
      { flag: '-migrate-state', description: 'Migrates existing state from an old backend to a newly configured backend.' },
      { flag: '-backend-config=path/to/backend.tfvars', description: 'Passes dynamic backend parameters without hardcoding them in HCL.' }
    ],
    exampleUsage: 'terraform init -upgrade -backend-config="bucket=my-state-bucket"',
    interviewGotcha: 'Interview Question: "Why does terraform init fail in air-gapped or CI/CD pipelines?" Answer: It tries to connect to registry.terraform.io. In enterprise setups, you must use .terraform.lock.hcl and a local provider cache or private registry mirror.',
    runnableCommand: 'terraform init'
  },
  {
    name: 'terraform fmt',
    command: 'terraform fmt [options] [target]',
    category: 'workflow',
    level: 'Beginner',
    shortSummary: 'Rewrites Terraform configuration files to canonical HCL format',
    description: 'Ensures consistent indentation, spacing, and attribute alignment across all team members according to the official HashiCorp styling standards.',
    commonFlags: [
      { flag: '-check', description: 'Checks if files are formatted without modifying them. Returns exit code 0 if formatted, non-zero if changes needed (ideal for CI/CD).' },
      { flag: '-diff', description: 'Displays unified diffs of formatting changes.' },
      { flag: '-recursive', description: 'Formats files in all subdirectories and child modules.' }
    ],
    exampleUsage: 'terraform fmt -check -diff -recursive',
    interviewGotcha: 'Used as a mandatory pre-commit hook and PR linting check in production CI/CD pipelines to prevent messy git diffs.',
    runnableCommand: 'terraform fmt'
  },
  {
    name: 'terraform validate',
    command: 'terraform validate [options]',
    category: 'workflow',
    level: 'Beginner',
    shortSummary: 'Verifies syntax and internal consistency of HCL configurations',
    description: 'Checks whether the configuration is syntactically valid and internally consistent without accessing remote services or cloud APIs. Validates variable types, resource references, and argument schemas.',
    commonFlags: [
      { flag: '-json', description: 'Outputs validation diagnostics in machine-readable JSON format for automated tooling.' },
      { flag: '-no-color', description: 'Disables ANSI color codes in terminal output.' }
    ],
    exampleUsage: 'terraform validate -json',
    interviewGotcha: 'Interview Trap: "Does terraform validate check if your AWS AMI ID or Azure VM size actually exists in the cloud?" Answer: No! Validation only verifies schema structure and type validity locally; it does not make cloud API calls.',
    runnableCommand: 'terraform validate'
  },
  {
    name: 'terraform plan',
    command: 'terraform plan [options]',
    category: 'workflow',
    level: 'Intermediate',
    shortSummary: 'Creates an execution plan predicting infrastructure changes',
    description: 'Reads current state, refreshes against live infrastructure (or emulators like LocalStack), identifies drift, and calculates the exact dependency delta: resources to create (+), modify (~), or destroy (-).',
    commonFlags: [
      { flag: '-out=tfplan.binary', description: 'Saves the computed plan to a file for deterministic execution in terraform apply.' },
      { flag: '-target=resource.name', description: 'Limits planning to a specific resource or module (use sparingly in production).' },
      { flag: '-var-file="prod.tfvars"', description: 'Loads environment-specific variables from a dedicated file.' },
      { flag: '-refresh-only', description: 'Detects real-world drift without proposing changes to match the configuration.' },
      { flag: '-destroy', description: 'Generates a plan to tear down all managed infrastructure.' }
    ],
    exampleUsage: 'terraform plan -out=production.tfplan -var-file="prod.tfvars"',
    interviewGotcha: 'Interview Question: "Why should production CI/CD never run terraform apply without a saved plan file?" Answer: Between plan and apply, live infrastructure or git code could change. Saving -out=plan guarantees that only what was approved is applied.',
    runnableCommand: 'terraform plan'
  },
  {
    name: 'terraform apply',
    command: 'terraform apply [options] [plan-file]',
    category: 'workflow',
    level: 'Intermediate',
    shortSummary: 'Executes actions proposed in a plan to reach desired state',
    description: 'Applies the changes required to reach the desired state of configuration. Interacts with cloud/provider APIs via CRUD operations, acquires state locks, updates terraform.tfstate, and outputs computed values.',
    commonFlags: [
      { flag: '-auto-approve', description: 'Skips interactive confirmation prompt (standard for automated CI/CD pipelines).' },
      { flag: '-parallelism=n', description: 'Limits the number of concurrent operations as Terraform walks the graph (default: 10).' },
      { flag: '-replace=aws_instance.web', description: 'Forces recreation of a specific resource instance without tainting it in state.' }
    ],
    exampleUsage: 'terraform apply -auto-approve production.tfplan',
    interviewGotcha: 'Interview Trap: "What happens if terraform apply crashes halfway through?" Answer: Terraform persists partial state for every resource that successfully returned an ID. State locking prevents race conditions, and re-running plan detects remaining changes.',
    runnableCommand: 'terraform apply -auto-approve'
  },
  {
    name: 'terraform destroy',
    command: 'terraform destroy [options]',
    category: 'workflow',
    level: 'Intermediate',
    shortSummary: 'Terminates all resources managed by the current configuration',
    description: 'Calculates the reverse dependency DAG and tears down all managed infrastructure in safe reverse order. Respects lifecycle { prevent_destroy = true } safeguards.',
    commonFlags: [
      { flag: '-auto-approve', description: 'Skips terminal confirmation prompt.' },
      { flag: '-target=resource.name', description: 'Destroys only a targeted resource and its direct dependents.' }
    ],
    exampleUsage: 'terraform destroy -auto-approve',
    interviewGotcha: 'Interview Question: "How do you protect a production database from accidental terraform destroy?" Answer: Add `lifecycle { prevent_destroy = true }` in HCL and IAM policies denying `rds:DeleteDBInstance`.',
    runnableCommand: 'terraform destroy -auto-approve'
  },

  // --- 2. STATE SURGERY & REFACTORING ---
  {
    name: 'terraform state list',
    command: 'terraform state list [options] [address...]',
    category: 'state',
    level: 'Intermediate',
    shortSummary: 'Lists all resources tracked in the current state file',
    description: 'Outputs resource addresses for everything Terraform is actively managing, including modules, nested for_each instances, and data sources.',
    commonFlags: [
      { flag: '-id=resource_id', description: 'Filters resources matching a specific cloud provider ID (e.g. i-0123456789).' }
    ],
    exampleUsage: 'terraform state list module.vpc.aws_subnet.public',
    interviewGotcha: 'Interview Tip: Always run `terraform state list` before performing refactoring, `state mv`, or `state rm` to get exact resource addresses.',
    runnableCommand: 'terraform state list'
  },
  {
    name: 'terraform state show',
    command: 'terraform state show [options] ADDRESS',
    category: 'state',
    level: 'Intermediate',
    shortSummary: 'Shows comprehensive attributes of a single resource in state',
    description: 'Dumps all metadata, computed IDs, network configurations, tags, and schema versions stored in the state file for the specified resource.',
    commonFlags: [],
    exampleUsage: 'terraform state show aws_instance.web_server',
    interviewGotcha: 'Essential for finding hidden computed attributes (like IAM ARNs, KMS keys, or Subnet IDs) when debugging dependencies.',
    runnableCommand: 'terraform state show aws_instance.web_server'
  },
  {
    name: 'terraform state mv',
    command: 'terraform state mv [options] SOURCE DESTINATION',
    category: 'state',
    level: 'Advanced',
    shortSummary: 'Moves a resource to a new address without recreating it',
    description: 'Renames a resource or migrates it into/out of a module inside the state file without triggering a delete-and-recreate cycle in cloud providers. In modern Terraform (>= 1.1), `moved {}` blocks are preferred for declarative version control.',
    commonFlags: [
      { flag: '-dry-run', description: 'Simulates the move operation without modifying state.' }
    ],
    exampleUsage: 'terraform state mv aws_instance.web module.compute.aws_instance.web',
    interviewGotcha: 'Interview Question: "How do you refactor monolithic root resources into child modules without destroying production databases?" Answer: Use `moved {}` blocks in HCL or run `terraform state mv` to align state addresses.',
    runnableCommand: 'terraform state mv aws_instance.web module.compute.aws_instance.web'
  },
  {
    name: 'terraform state rm',
    command: 'terraform state rm [options] ADDRESS...',
    category: 'state',
    level: 'Advanced',
    shortSummary: 'Stops managing a resource without destroying it in the cloud',
    description: 'Deletes the specified resource entry from terraform.tfstate. The physical cloud infrastructure continues running untouched, but Terraform will no longer track or manage it.',
    commonFlags: [
      { flag: '-dry-run', description: 'Shows what would be removed without writing changes.' }
    ],
    exampleUsage: 'terraform state rm aws_s3_bucket.legacy_logs',
    interviewGotcha: 'Crucial when decommissioning Terraform management of an external asset or transferring ownership between different repositories/teams.',
    runnableCommand: 'terraform state rm aws_s3_bucket.legacy_logs'
  },
  {
    name: 'terraform import',
    command: 'terraform import [options] ADDRESS ID',
    category: 'state',
    level: 'Advanced',
    shortSummary: 'Brings pre-existing cloud resources into Terraform state',
    description: 'Attaches existing unmanaged cloud infrastructure to a defined Terraform resource block. Modern Terraform 1.5+ also supports the declarative `import {}` block.',
    commonFlags: [
      { flag: '-var-file=...', description: 'Variables file needed to evaluate the configuration.' },
      { flag: '-config=dir', description: 'Path to configuration directory.' }
    ],
    exampleUsage: 'terraform import aws_s3_bucket.my_bucket my-existing-bucket-name',
    interviewGotcha: 'Interview Question: "What are the limitations of terraform import?" Answer: Legacy CLI import modifies state but does not write HCL code. With Terraform 1.5+, `import {}` combined with `terraform plan -generate-config-out=generated.tf` generates HCL code automatically.',
    runnableCommand: 'terraform import aws_s3_bucket.my_bucket my-test-bucket'
  },
  {
    name: 'terraform refresh',
    command: 'terraform refresh [options]',
    category: 'state',
    level: 'Intermediate',
    shortSummary: 'Updates state with the current real-world cloud state',
    description: 'Queries provider APIs to detect any out-of-band changes or manual console edits made outside Terraform. In modern workflows, use `terraform plan -refresh-only`.',
    commonFlags: [
      { flag: '-compact-warnings', description: 'Shows warnings in a more compact format.' }
    ],
    exampleUsage: 'terraform plan -refresh-only',
    interviewGotcha: 'Interview Question: "How do you detect infrastructure drift without applying code changes?" Answer: Run `terraform plan -refresh-only` in a scheduled cron job.',
    runnableCommand: 'terraform plan -refresh-only'
  },
  {
    name: 'terraform force-unlock',
    command: 'terraform force-unlock LOCK-ID',
    category: 'state',
    level: 'Expert',
    shortSummary: 'Manually releases a stuck state lock on remote backends',
    description: 'When an apply is forcefully aborted or a CI/CD runner crashes, DynamoDB / Azure Blob state locks can remain active, blocking all team operations. This command releases the mutex lock.',
    commonFlags: [
      { flag: '-force', description: 'Skips confirmation prompt.' }
    ],
    exampleUsage: 'terraform force-unlock e97a4358-1f19-4b67-9c60-843b0ce8995a',
    interviewGotcha: 'Interview Danger: Never run `force-unlock` while another engineer or CI pipeline is actually running! Doing so can corrupt state and cause race conditions.',
    runnableCommand: 'terraform force-unlock e97a4358-1f19-4b67-9c60-843b0ce8995a'
  },

  // --- 3. INSPECTION & DEBUGGING ---
  {
    name: 'terraform output',
    command: 'terraform output [options] [NAME]',
    category: 'inspect',
    level: 'Beginner',
    shortSummary: 'Reads and displays output values from state',
    description: 'Extracts values marked as outputs in the configuration, including calculated IPs, hostnames, connection strings, or sensitive passwords.',
    commonFlags: [
      { flag: '-json', description: 'Outputs all values as a structured JSON object.' },
      { flag: '-raw NAME', description: 'Prints the raw string value without quotes (ideal for shell scripts).' }
    ],
    exampleUsage: 'terraform output -raw web_server_public_ip',
    interviewGotcha: 'Sensitive outputs (`sensitive = true`) are masked in terminal stdout by default, but remain readable in plaintext in the `.tfstate` JSON file!',
    runnableCommand: 'terraform output'
  },
  {
    name: 'terraform graph',
    command: 'terraform graph [options]',
    category: 'inspect',
    level: 'Intermediate',
    shortSummary: 'Generates a DOT language representation of the dependency DAG',
    description: 'Visualizes the directed acyclic graph that Terraform builds to determine execution order and parallel execution branches.',
    commonFlags: [
      { flag: '-type=plan', description: 'Selects graph type: plan, apply, plan-destroy, or destroy.' }
    ],
    exampleUsage: 'terraform graph | dot -Tsvg > graph.svg',
    interviewGotcha: 'Helps diagnose cyclical dependency errors (`cycle: aws_security_group.a -> aws_security_group.b -> aws_security_group.a`).',
    runnableCommand: 'terraform graph'
  },
  {
    name: 'terraform providers',
    command: 'terraform providers [subcommand]',
    category: 'inspect',
    level: 'Intermediate',
    shortSummary: 'Prints a tree of providers required by configuration and state',
    description: 'Identifies which providers and versions are required by the root module and every child module, exposing unconstrained legacy provider dependencies.',
    commonFlags: [
      { flag: 'lock', description: 'Updates or writes the .terraform.lock.hcl dependency lock file.' },
      { flag: 'mirror', description: 'Creates a local directory mirror of provider plugins.' }
    ],
    exampleUsage: 'terraform providers lock -platform=linux_amd64 -platform=darwin_arm64',
    interviewGotcha: 'Interview Question: "How do you ensure cross-platform compatibility between macOS developers and Linux CI/CD runners?" Answer: Run `terraform providers lock` specifying both target platforms.',
    runnableCommand: 'terraform providers'
  },

  // --- 4. WORKSPACES & ISOLATION ---
  {
    name: 'terraform workspace',
    command: 'terraform workspace <subcommand> [NAME]',
    category: 'workspace',
    level: 'Intermediate',
    shortSummary: 'Manages multiple named state instances for the same codebase',
    description: 'Allows using a single codebase across different stages (dev, stage, prod) with isolated state storage files.',
    commonFlags: [
      { flag: 'list', description: 'Lists all available workspaces.' },
      { flag: 'new [name]', description: 'Creates and immediately selects a new workspace.' },
      { flag: 'select [name]', description: 'Switches to an existing workspace.' },
      { flag: 'show', description: 'Outputs the name of the currently active workspace.' }
    ],
    exampleUsage: 'terraform workspace new staging && terraform workspace select staging',
    interviewGotcha: 'Staff Engineer Rule: Workspaces share identical configurations. For enterprise isolation between production and staging, use separate directories/repos or Terragrunt rather than relying purely on workspaces.',
    runnableCommand: 'terraform workspace list'
  },

  // --- 5. NATIVE TESTING & POLICY ---
  {
    name: 'terraform test',
    command: 'terraform test [options]',
    category: 'testing',
    level: 'Advanced',
    shortSummary: 'Runs native unit and integration tests defined in .tftest.hcl',
    description: 'Terraform 1.6+ built-in test framework. Executes assertions against planned or applied infrastructure without third-party tools like Terratest, verifying conditions before pushing to production.',
    commonFlags: [
      { flag: '-filter=test_file_name', description: 'Restricts testing to specific test suites.' },
      { flag: '-verbose', description: 'Displays full diagnostic outputs for every test run.' }
    ],
    exampleUsage: 'terraform test -verbose',
    interviewGotcha: 'Interview Question: "How do you test Terraform modules without deploying real cloud resources?" Answer: Use `terraform test` with `command = plan` and test assertions that validate planned output attributes without incurring cloud costs.',
    runnableCommand: 'terraform test'
  }
];
