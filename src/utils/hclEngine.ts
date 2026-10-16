import { LabScenario, TerraformState, ResourceNode, TestResult } from '../types/terraform';

export interface CommandExecutionResult {
  output: string;
  exitCode: number;
  newState?: TerraformState;
  updatedNodes?: ResourceNode[];
  triggerK9s?: boolean;
}

export function createInitialState(scenarioId: string): TerraformState {
  return {
    version: 4,
    terraform_version: '1.8.4',
    serial: 1,
    lineage: `tf-lineage-${scenarioId}-${Math.floor(Math.random() * 100000)}`,
    resources: [],
    outputs: {}
  };
}

export function extractNodesFromScenario(scenario: LabScenario, state: TerraformState): ResourceNode[] {
  const nodes: ResourceNode[] = [];

  // If resources are present in state, mark them as 'created'
  if (state.resources.length > 0) {
    state.resources.forEach((r, idx) => {
      nodes.push({
        id: `${r.type}.${r.name}`,
        name: r.name,
        type: r.type,
        provider: r.provider,
        module: r.module,
        status: 'created',
        attributes: r.instances[0]?.attributes || {},
        dependencies: r.instances[0]?.dependencies || []
      });
    });
    return nodes;
  }

  // Otherwise, display planned nodes based on scenario files
  scenario.files.forEach(f => {
    const text = f.content;
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"/g;
    let match;
    while ((match = resourceRegex.exec(text)) !== null) {
      nodes.push({
        id: `${match[1]}.${match[2]}`,
        name: match[2],
        type: match[1],
        provider: match[1].startsWith('aws_') ? 'provider["registry.terraform.io/hashicorp/aws"]' :
                  match[1].startsWith('azurerm_') ? 'provider["registry.terraform.io/hashicorp/azurerm"]' :
                  match[1].startsWith('kubernetes_') ? 'provider["registry.terraform.io/hashicorp/kubernetes"]' :
                  'provider["registry.terraform.io/hashicorp/local"]',
        status: 'planned',
        attributes: {
          managed_by: 'Terraform Zero-Cloud Lab',
          owner: 'Madhav Gupta',
          cost: '$0.00 (Zero-Cloud Simulation)'
        }
      });
    }
  });

  return nodes;
}

export function executeTerraformCommand(
  rawCommand: string,
  scenario: LabScenario,
  currentState: TerraformState,
  isInitialized: boolean
): { result: CommandExecutionResult; initialized: boolean } {
  const cmd = rawCommand.trim();

  // K9s launch shortcut
  if (cmd === 'k9s' || cmd.startsWith('k9s ')) {
    return {
      initialized: isInitialized,
      result: {
        output: `[K9S] Connecting to kind-local-cluster...
Context: kind-localstack-cluster
Cluster: Kubernetes v1.29.2 ($0 Cloud Simulation)
User: Madhav Gupta (Admin)

Opening interactive K9s cluster dashboard view...`,
        exitCode: 0,
        triggerK9s: true
      }
    };
  }

  // Kubectl commands
  if (cmd.startsWith('kubectl')) {
    if (cmd.includes('get pods')) {
      return {
        initialized: isInitialized,
        result: {
          output: `NAME                                                 READY   STATUS             RESTARTS   AGE     IP            NODE
order-api-7b8f99d6d-2kz8w                            1/1     Running            0          3d4h    10.244.1.42   worker-pool-node-01
payment-processor-59d4c7b89-9xqlm                    1/1     Running            1          18h     10.244.2.18   worker-pool-node-02
inventory-worker-84d77b47b-cr45h                     0/1     CrashLoopBackOff   14         2h15m   10.244.1.99   worker-pool-node-01
analytics-aggregator-66bf875d-oomkd                  0/1     OOMKilled          3          4h      10.244.2.44   worker-pool-node-02
ingress-nginx-controller-76c9c6467c-t9j4x            1/1     Running            0          14d     10.244.1.5    worker-pool-node-01`,
          exitCode: 0
        }
      };
    }
    if (cmd.includes('get nodes')) {
      return {
        initialized: isInitialized,
        result: {
          output: `NAME                         STATUS   ROLES           AGE   VERSION   INTERNAL-IP
control-plane-master-01      Ready    control-plane   14d   v1.29.2   192.168.10.10
worker-pool-node-01          Ready    worker          14d   v1.29.2   192.168.10.11
worker-pool-node-02          Ready    worker          14d   v1.29.2   192.168.10.12`,
          exitCode: 0
        }
      };
    }
    if (cmd.includes('get namespaces') || cmd.includes('get ns')) {
      return {
        initialized: isInitialized,
        result: {
          output: `NAME              STATUS   AGE
default           Active   14d
kube-system       Active   14d
ingress-nginx     Active   14d
production-apps   Active   3d4h`,
          exitCode: 0
        }
      };
    }
    if (cmd.includes('describe pod')) {
      return {
        initialized: isInitialized,
        result: {
          output: `Name:         inventory-worker-84d77b47b-cr45h
Namespace:    production-apps
Node:         worker-pool-node-01/192.168.10.11
State:        Waiting
  Reason:     CrashLoopBackOff
Last State:   Terminated
  Reason:     Error
  Exit Code:  1
Events:
  Warning  BackOff  3m (x14 over 2h)  kubelet  Back-off restarting failed container inventory-worker
  Normal   Pulled   2m                kubelet  Container image "registry.enterprise.io/apps/inventory:v3.0.1" already present on machine`,
          exitCode: 0
        }
      };
    }
  }

  // Terraform Init
  if (cmd.startsWith('terraform init')) {
    return {
      initialized: true,
      result: {
        output: `Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.45.0...
- Finding hashicorp/azurerm versions matching "~> 3.90"...
- Installing hashicorp/azurerm v3.98.0...
- Finding hashicorp/kubernetes versions matching "~> 2.25"...
- Installing hashicorp/kubernetes v2.26.0...
- Finding hashicorp/local versions matching ">= 2.0.0"...
- Installing hashicorp/local v2.5.1...

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All AWS calls are
emulated via LocalStack on localhost:4566 ($0.00 cost guarantee).`,
        exitCode: 0
      }
    };
  }

  // Require init for plan/apply
  if (!isInitialized && (cmd.startsWith('terraform plan') || cmd.startsWith('terraform apply'))) {
    return {
      initialized: false,
      result: {
        output: `Error: Could not satisfy plugin requirements

Plugin re-initialization required. Please run "terraform init".
Plugins are missing in the local workspace directory.`,
        exitCode: 1
      }
    };
  }

  // Terraform Validate
  if (cmd.startsWith('terraform validate')) {
    return {
      initialized: isInitialized,
      result: {
        output: `Success! The configuration is valid.
Zero syntax or reference errors found across all files.`,
        exitCode: 0
      }
    };
  }

  // Terraform Format
  if (cmd.startsWith('terraform fmt')) {
    return {
      initialized: isInitialized,
      result: {
        output: `main.tf
variables.tf
outputs.tf
providers.tf
All HCL files canonicalized according to HashiCorp styling standards.`,
        exitCode: 0
      }
    };
  }

  // Terraform Plan
  if (cmd.startsWith('terraform plan')) {
    const plannedCount = scenario.files.reduce((acc, f) => {
      const matches = f.content.match(/resource\s+"[^"]+"\s+"[^"]+"/g);
      return acc + (matches ? matches.length : 0);
    }, 0) || 3;

    return {
      initialized: isInitialized,
      result: {
        output: `Terraform will perform the following actions:

Plan: ${plannedCount} to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + architecture_summary = {
      + cloud_cost      = "$0.00"
      + owner           = "Madhav Gupta"
      + simulated_stack = "${scenario.title}"
    }

─────────────────────────────────────────────────────────────────────────────
Note: You didn't use the -out option to save this plan, so Terraform can't
guarantee to take exactly these actions if you run "terraform apply" now.`,
        exitCode: 0
      }
    };
  }

  // Terraform Apply
  if (cmd.startsWith('terraform apply')) {
    const newState: TerraformState = {
      version: 4,
      terraform_version: '1.8.4',
      serial: currentState.serial + 1,
      lineage: currentState.lineage,
      resources: [
        {
          mode: 'managed',
          type: 'aws_instance',
          name: 'web_server',
          provider: 'provider["registry.terraform.io/hashicorp/aws"]',
          instances: [
            {
              schema_version: 1,
              attributes: {
                id: 'i-0984fa89bc124987',
                instance_type: 't3.medium',
                ami: 'ami-0c55b159cbfafe1f0',
                public_ip: '54.214.88.192',
                private_ip: '10.0.1.42',
                owner: 'Madhav Gupta',
                status: 'running'
              }
            }
          ]
        },
        {
          mode: 'managed',
          type: 'aws_s3_bucket',
          name: 'main',
          provider: 'provider["registry.terraform.io/hashicorp/aws"]',
          instances: [
            {
              schema_version: 0,
              attributes: {
                id: 'my-test-bucket',
                bucket: 'my-test-bucket',
                arn: 'arn:aws:s3:::my-test-bucket',
                owner: 'Madhav Gupta'
              }
            }
          ]
        },
        {
          mode: 'managed',
          type: 'kubernetes_namespace',
          name: 'apps',
          provider: 'provider["registry.terraform.io/hashicorp/kubernetes"]',
          instances: [
            {
              schema_version: 0,
              attributes: {
                id: 'production-apps',
                name: 'production-apps',
                status: 'Active'
              }
            }
          ]
        }
      ],
      outputs: {
        owner: { value: 'Madhav Gupta', type: 'string' },
        cost: { value: '$0.00 (Zero-Cloud Guarantee)', type: 'string' },
        cluster_status: { value: 'Active and healthy', type: 'string' }
      }
    };

    return {
      initialized: isInitialized,
      result: {
        output: `Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:

cluster_status = "Active and healthy"
cost = "$0.00 (Zero-Cloud Guarantee)"
owner = "Madhav Gupta"

State written to terraform.tfstate (serial ${newState.serial}).`,
        exitCode: 0,
        newState
      }
    };
  }

  // Terraform State List
  if (cmd.startsWith('terraform state list')) {
    if (currentState.resources.length === 0) {
      return {
        initialized: isInitialized,
        result: {
          output: `No resources found in current state. Run "terraform apply" first to create resources.`,
          exitCode: 0
        }
      };
    }

    const resList = currentState.resources.map(r => `${r.type}.${r.name}`).join('\n');
    return {
      initialized: isInitialized,
      result: {
        output: resList,
        exitCode: 0
      }
    };
  }

  // Terraform State Show
  if (cmd.startsWith('terraform state show')) {
    return {
      initialized: isInitialized,
      result: {
        output: `# aws_instance.web_server:
resource "aws_instance" "web_server" {
    ami                          = "ami-0c55b159cbfafe1f0"
    arn                          = "arn:aws:ec2:us-east-1:000000000000:instance/i-0984fa89bc124987"
    id                           = "i-0984fa89bc124987"
    instance_type                = "t3.medium"
    private_ip                   = "10.0.1.42"
    public_ip                    = "54.214.88.192"
    tags                         = {
        "Name"  = "production-web-server"
        "Owner" = "Madhav Gupta"
    }
}`,
        exitCode: 0
      }
    };
  }

  // Terraform Output
  if (cmd.startsWith('terraform output')) {
    return {
      initialized: isInitialized,
      result: {
        output: `cluster_status = "Active and healthy"
cost = "$0.00 (Zero-Cloud Guarantee)"
owner = "Madhav Gupta"`,
        exitCode: 0
      }
    };
  }

  // Terraform Test
  if (cmd.startsWith('terraform test')) {
    return {
      initialized: isInitialized,
      result: {
        output: `Running tests in ./tests/...
tests/unit.tftest.hcl...
  run "validate_s3_bucket_naming"... pass
  run "validate_vm_imds_v2_tokens"... pass
  run "validate_least_privilege_iam"... pass

Success! 3 passed, 0 failed.`,
        exitCode: 0
      }
    };
  }

  // Terraform Destroy
  if (cmd.startsWith('terraform destroy')) {
    const emptyState: TerraformState = {
      ...currentState,
      serial: currentState.serial + 1,
      resources: [],
      outputs: {}
    };

    return {
      initialized: isInitialized,
      result: {
        output: `Destroy complete! Resources: ${currentState.resources.length} destroyed.
All simulated zero-cloud infrastructure cleaned up successfully.`,
        exitCode: 0,
        newState: emptyState
      }
    };
  }

  // Generic fallback
  return {
    initialized: isInitialized,
    result: {
      output: `Executed: "${cmd}"
Command completed with exit code 0.
Hint: Type "terraform init", "terraform plan", "terraform apply", "kubectl get pods", or "k9s" to interact with the environment.`,
      exitCode: 0
    }
  };
}
