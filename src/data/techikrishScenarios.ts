export interface TechikrishScenario {
  id: string;
  category: 'kubernetes' | 'terraform';
  number: number;
  title: string;
  sourceUrl: string;
  symptom: string;
  rootCause: string;
  realWorldImpact: string;
  interviewQuestion: string;
  investigationSteps: string[];
  remediationCommands: string[];
  codeFix: {
    language: 'yaml' | 'hcl' | 'bash';
    filename: string;
    badCode: string;
    goodCode: string;
    explanation: string;
  };
  seniorTips: string[];
}

export const TECHIKRISH_SCENARIOS: TechikrishScenario[] = [
  // KUBERNETES SCENARIOS (From Techikrish repo)
  {
    id: 'k8s-sc-1-crashloopbackoff',
    category: 'kubernetes',
    number: 1,
    title: 'Pod in CrashLoopBackOff: Missing ConfigMap/Secret & Application Panic',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/kubernetes/scenarios.md',
    symptom: 'Pod restarts continuously with 0/1 containers ready and status showing CrashLoopBackOff with restart count steadily incrementing.',
    rootCause: 'Application attempts to read environment variables (e.g. DB_HOST, DB_PASSWORD) sourced from a non-existent ConfigMap or Secret, or binary throws an unhandled exception upon startup.',
    realWorldImpact: 'Outage for downstream services dependent on this microservice; Kubernetes probes fail repeatedly.',
    interviewQuestion: 'Walk me through step-by-step how you diagnose and permanently resolve a CrashLoopBackOff error in production.',
    investigationSteps: [
      'Run kubectl get pods -n <namespace> to check restart count and container status',
      'Run kubectl logs <pod-name> -n <namespace> --previous to examine the logs of the container right before it crashed',
      'Run kubectl describe pod <pod-name> -n <namespace> and inspect Last State: Terminated, Exit Code, and Events table',
      'If Exit Code is 137 (OOM) vs 1 (Application Error) vs 127 (Command not found), tailor your next troubleshooting steps',
      'Inspect pod spec envFrom: configMapRef or secretRef to verify if the referenced resource exists'
    ],
    remediationCommands: [
      'kubectl get configmap,secret -n production-apps',
      'kubectl logs -f pod/inventory-worker-84d77b47b-cr45h -n production-apps --previous',
      'kubectl describe pod inventory-worker-84d77b47b-cr45h -n production-apps',
      'kubectl rollout restart deployment/inventory-worker -n production-apps'
    ],
    codeFix: {
      language: 'yaml',
      filename: 'deployment.yaml',
      badCode: `env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: missing-production-secrets # Does not exist!
        key: db-pass`,
      goodCode: `env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: production-secrets
        key: db-pass
        optional: false # Fail-fast or provide fallback`,
      explanation: 'Ensure the referenced Secret exists before deploying, or utilize optional: true if application provides sensible defaults.'
    },
    seniorTips: [
      'Always check kubectl logs --previous: standard kubectl logs only queries the current dying container which might be empty.',
      'Check exit code: Exit code 0 means container ran command and finished (need long-running foreground daemon).'
    ]
  },

  {
    id: 'k8s-sc-2-oomkilled',
    category: 'kubernetes',
    number: 2,
    title: 'Pod OOMKilled (Exit Code 137) Under Memory Pressure',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/kubernetes/scenarios.md',
    symptom: 'Pod terminates intermittently during traffic spikes. kubectl describe shows Terminated: OOMKilled (Exit Code 137).',
    rootCause: 'The process exceeded its spec.containers[].resources.limits.memory value, triggering the Linux kernel cgroup OOM-killer.',
    realWorldImpact: 'Silent drops in active user websocket connections or batch job timeouts mid-processing.',
    interviewQuestion: 'What does Exit Code 137 mean in Kubernetes, and what is the difference between QoS classes Guaranteed, Burstable, and BestEffort?',
    investigationSteps: [
      'Run kubectl describe pod and inspect Last State: Exit Code: 137 (128 + SIGKILL 9)',
      'Check container memory limits vs actual working set in Prometheus / Grafana / Metrics Server (kubectl top pod)',
      'Analyze heap dumps or memory profiling (e.g. JVM heap params -Xmx or Node.js --max-old-space-size)',
      'Inspect node dmesg or /var/log/messages for invoked oom-killer kernel messages'
    ],
    remediationCommands: [
      'kubectl top pod -n production-apps --containers',
      'kubectl describe pod analytics-aggregator-66bf875d-oomkd -n production-apps',
      'kubectl patch deployment analytics-aggregator -n production-apps -p \'{"spec":{"template":{"spec":{"containers":[{"name":"analytics","resources":{"limits":{"memory":"1Gi"}}}]}}}}\''
    ],
    codeFix: {
      language: 'yaml',
      filename: 'resources.yaml',
      badCode: `resources:
  requests:
    memory: "64Mi"
  limits:
    memory: "128Mi" # JVM or Node requires 300MB heap!`,
      goodCode: `resources:
  requests:
    cpu: "200m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "1Gi"
# Ensure JVM flag -XX:MaxRAMPercentage=75.0 is passed to container`,
      explanation: 'Align memory limits with realistic JVM/v8 heap headroom and configure MaxRAMPercentage so runtime honors container cgroup memory limits.'
    },
    seniorTips: [
      'Exit Code 137 = 128 + 9 (SIGKILL from Linux kernel). Kubernetes does not gently SIGTERM an OOM container; it kills it instantly.',
      'For mission-critical production workloads, set requests == limits for both CPU and memory to achieve Guaranteed QoS Class.'
    ]
  },

  {
    id: 'k8s-sc-3-pod-pending',
    category: 'kubernetes',
    number: 3,
    title: 'Pod Stuck in Pending State (Insufficient CPU/Memory or Taint Mismatch)',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/kubernetes/scenarios.md',
    symptom: 'Pod remains in Pending status indefinitely. No node is assigned (Node: <none>).',
    rootCause: 'Kubernetes kube-scheduler is unable to find any worker node that satisfies resource requests, nodeAffinity, or tolerations (e.g., untolerated node taints).',
    realWorldImpact: 'New deployments fail to scale up; autoscaling delays cause cascading service degradation.',
    interviewQuestion: 'When a Pod is Pending, what internal component of Kubernetes is responsible, and how do you triage it?',
    investigationSteps: [
      'Run kubectl describe pod and check the Events section at the bottom',
      'Look for 0/X nodes are available: X Insufficient cpu, X node(s) had untolerated taint',
      'Run kubectl get nodes to verify node health (NotReady vs Ready)',
      'Run kubectl describe node to view Allocatable vs Requested capacity across all nodes'
    ],
    remediationCommands: [
      'kubectl describe pod payment-processor-pending -n production-apps',
      'kubectl describe nodes | grep -A 8 "Allocated resources"',
      'kubectl get nodes -o wide --show-labels',
      'kubectl get events -n production-apps --sort-by=.metadata.creationTimestamp'
    ],
    codeFix: {
      language: 'yaml',
      filename: 'pod-tolerations.yaml',
      badCode: `spec:
  nodeSelector:
    disktype: ssd # No nodes labeled with disktype=ssd!
  resources:
    requests:
      cpu: "16" # Node only has 4 vCPUs`,
      goodCode: `spec:
  tolerations:
  - key: "workload"
    operator: "Equal"
    value: "payment"
    effect: "NoSchedule"
  resources:
    requests:
      cpu: "500m"
      memory: "512Mi"`,
      explanation: 'Ensure requested CPU/memory matches available node capacity and add matching tolerations for dedicated node taints.'
    },
    seniorTips: [
      'Always run kubectl get events --sort-by=.metadata.creationTimestamp to see scheduler rejection reasons.'
    ]
  },

  {
    id: 'k8s-sc-4-imagepullbackoff',
    category: 'kubernetes',
    number: 4,
    title: 'ImagePullBackOff & ErrImagePull: Private Registry Auth or Wrong Tag',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/kubernetes/scenarios.md',
    symptom: 'Pod fails to launch. Status shows ErrImagePull then ImagePullBackOff.',
    rootCause: 'Docker image tag typo, non-existent tag in registry, or missing imagePullSecrets for private registry (ECR, ACR, DockerHub).',
    realWorldImpact: 'Release pipeline stalls; newly deployed canary or production version fails to boot.',
    interviewQuestion: 'How does kubelet authenticate to private container registries, and what is the difference between node-level IAM credentials and imagePullSecrets?',
    investigationSteps: [
      'Run kubectl describe pod and check the Failed to pull image event message',
      'Check if 401 Unauthorized (Auth failure) vs 404 Not Found (image does not exist)',
      'Verify image name and tag with docker pull <image> on local terminal',
      'Verify imagePullSecrets exists in the target namespace and is referenced in ServiceAccount or Pod spec'
    ],
    remediationCommands: [
      'kubectl describe pod web-frontend-7c989 -n production-apps',
      'kubectl get secret regcred -n production-apps -o yaml',
      'kubectl create secret docker-registry regcred --docker-server=ghcr.io --docker-username=madhav --docker-password=$TOKEN -n production-apps'
    ],
    codeFix: {
      language: 'yaml',
      filename: 'imagepull.yaml',
      badCode: `spec:
  containers:
  - name: web
    image: private-repo.ecr.aws/madhav/api:latset # Typo in tag!`,
      goodCode: `spec:
  imagePullSecrets:
  - name: regcred
  containers:
  - name: web
    image: private-repo.ecr.aws/madhav/api:v1.4.2`,
      explanation: 'Fix image tag typo, avoid using mutable :latest tags, and attach valid imagePullSecrets.'
    },
    seniorTips: [
      'Avoid using :latest in production: it causes image caching ambiguity and breaks rolling rollback determinism.'
    ]
  },

  // TERRAFORM SCENARIOS (From Techikrish repo)
  {
    id: 'tf-sc-1-state-lock',
    category: 'terraform',
    number: 1,
    title: 'Terraform State Lock: DynamoDB LockID Stuck Mid-Apply',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/terraform/scenarios.md',
    symptom: 'terraform apply fails immediately with "Error acquiring the state lock: ConditionalCheckFailedException: The conditional request failed".',
    rootCause: 'A previous CI/CD pipeline or engineer was abruptly killed (Ctrl+C, runner timeout, or SIGKILL) while holding the distributed DynamoDB state lock.',
    realWorldImpact: 'All team deployments are completely blocked; continuous integration pipelines fail on every PR.',
    interviewQuestion: 'What causes Terraform state locks, what risks exist with force-unlock, and how do you safely release a stuck lock?',
    investigationSteps: [
      'Read the Lock Info printed in the error output: Lock ID, Info (Path), Who (username/IP), and Created timestamp',
      'Verify if the process or CI/CD job mentioned in "Who" is genuinely dead or still actively modifying infrastructure',
      'Check AWS DynamoDB table or Azure Blob lease state',
      'If confirmed dead, run terraform force-unlock <LOCK_ID> with extreme caution'
    ],
    remediationCommands: [
      'terraform plan',
      '# Inspect the Lock ID string: e.g. 7c3f81ab-2e11-4df0-9411-90a1bc34e819',
      'terraform force-unlock 7c3f81ab-2e11-4df0-9411-90a1bc34e819',
      'terraform plan -refresh=true'
    ],
    codeFix: {
      language: 'hcl',
      filename: 'backend.tf',
      badCode: `terraform {
  backend "s3" {
    bucket = "terraform-state-prod"
    key    = "prod/terraform.tfstate"
    # dynamodb_table is missing! Multiple applies will corrupt state!
  }
}`,
      goodCode: `terraform {
  backend "s3" {
    bucket         = "terraform-state-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}`,
      explanation: 'Always enable distributed state locking with dynamodb_table to prevent catastrophic concurrent state file race conditions.'
    },
    seniorTips: [
      'NEVER force-unlock without checking CI/CD logs first. If two applies run simultaneously, state corruption is almost guaranteed.'
    ]
  },

  {
    id: 'tf-sc-2-drift-detection',
    category: 'terraform',
    number: 2,
    title: 'Production State Drift: Out-of-Band Console Changes & Auto-Remediation',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/terraform/scenarios.md',
    symptom: 'terraform plan shows unexpected resource modifications or destructions that nobody committed to Git.',
    rootCause: 'An engineer modified security groups, tags, or replica counts manually via the AWS/Azure web console during an incident (ClickOps).',
    realWorldImpact: 'Running terraform apply might overwrite manual hotfixes or destroy resources unintentionally.',
    interviewQuestion: 'How do you detect, audit, and reconcile drift between your cloud infrastructure and Terraform state?',
    investigationSteps: [
      'Run terraform plan -refresh-only to inspect real cloud infrastructure without scheduling destructive updates',
      'Run terraform apply -refresh-only to update terraform.tfstate with out-of-band changes safely',
      'Review AWS CloudTrail / Azure Activity Log to identify who made the manual change and why',
      'Codify the manual changes back into HCL code in Git, or revert cloud drift to match code'
    ],
    remediationCommands: [
      'terraform plan -refresh-only',
      'terraform apply -refresh-only',
      'terraform plan -detailed-exitcode'
    ],
    codeFix: {
      language: 'hcl',
      filename: 'lifecycle.tf',
      badCode: `resource "aws_autoscaling_group" "app_asg" {
  desired_capacity = 3 # Overrides autoscaling actions during apply!
}`,
      goodCode: `resource "aws_autoscaling_group" "app_asg" {
  desired_capacity = 3

  # Ignore attributes actively managed by external controllers
  lifecycle {
    ignore_changes = [
      desired_capacity,
      tags
    ]
  }
}`,
      explanation: 'Use lifecycle { ignore_changes = [...] } for attributes legitimately managed by dynamic cloud autoscalers or external tools.'
    },
    seniorTips: [
      'Integrate scheduled daily terraform plan -refresh-only in CI with Slack/Discord webhook alerts to catch drift early.'
    ]
  },

  {
    id: 'tf-sc-3-cyclic-dependencies',
    category: 'terraform',
    number: 3,
    title: 'Cyclic Dependency Graph: Resource A depends on B and B depends on A',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/terraform/scenarios.md',
    symptom: 'terraform plan fails with "Error: Cycle: aws_security_group.app, aws_security_group.db".',
    rootCause: 'Security group A references security group B in its ingress rule, while security group B references security group A in its ingress rule within the same resource block.',
    realWorldImpact: 'Terraform DAG (Directed Acyclic Graph) cannot resolve the execution order; deployment halted completely.',
    interviewQuestion: 'Why does Terraform create dependency cycles between security groups, and how do you resolve circular references?',
    investigationSteps: [
      'Generate dependency graph: terraform graph | dot -Tpng > graph.png',
      'Identify the circular mutual dependency in ingress/egress blocks',
      'Extract inline ingress/egress rules into standalone aws_security_group_rule resources'
    ],
    remediationCommands: [
      'terraform graph',
      'terraform validate',
      'terraform plan'
    ],
    codeFix: {
      language: 'hcl',
      filename: 'security_groups.tf',
      badCode: `# Circular inline rules
resource "aws_security_group" "app" {
  name = "app-sg"
  ingress {
    security_groups = [aws_security_group.db.id] # Points to DB
  }
}
resource "aws_security_group" "db" {
  name = "db-sg"
  ingress {
    security_groups = [aws_security_group.app.id] # Points to App
  }
}`,
      goodCode: `# Decoupled with standalone rule resources
resource "aws_security_group" "app" { name = "app-sg" }
resource "aws_security_group" "db"  { name = "db-sg" }

resource "aws_security_group_rule" "app_to_db" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.app.id
  security_group_id        = aws_security_group.db.id
}`,
      explanation: 'Decouple mutual references by defining standalone rule resources (aws_security_group_rule or azurerm_network_security_rule).'
    },
    seniorTips: [
      'Always prefer standalone aws_security_group_rule resources over inline ingress/egress blocks for complex microservice topologies.'
    ]
  },

  {
    id: 'tf-sc-4-zero-downtime-replacement',
    category: 'terraform',
    number: 4,
    title: 'Zero-Downtime Infrastructure Replacement: create_before_destroy',
    sourceUrl: 'https://github.com/Techikrish/devops-cloud-interview-scenarios/blob/main/terraform/scenarios.md',
    symptom: 'Applying a change to an EC2 instance, SSL certificate, or Launch Template destroys the existing resource before creating the replacement, causing 5-10 minutes of complete outage.',
    rootCause: 'Default Terraform lifecycle behavior is Destroy-then-Create (-/+).',
    realWorldImpact: 'High-severity customer-facing production outage during scheduled maintenance windows.',
    interviewQuestion: 'How does create_before_destroy work in Terraform, and what are the gotchas with resource name collisions?',
    investigationSteps: [
      'Inspect terraform plan output for prefix "-/+": signifies replacement',
      'Check if resource has unique name requirements (e.g. name = "prod-lb" will fail if new one created before old is destroyed)',
      'Add name_prefix instead of fixed name when using create_before_destroy'
    ],
    remediationCommands: [
      'terraform plan | grep -E "(\\-\\+|\\~|\\+)"',
      'terraform apply'
    ],
    codeFix: {
      language: 'hcl',
      filename: 'lifecycle.tf',
      badCode: `resource "aws_instance" "app" {
  name = "web-prod"
  # Default destroy-then-create causes downtime!
}`,
      goodCode: `resource "aws_instance" "app" {
  # Use name_prefix to avoid unique name collision
  name_prefix = "web-prod-"

  lifecycle {
    create_before_destroy = true
  }
}`,
      explanation: 'create_before_destroy provisions the new resource and validates health checks before terminating the old one.'
    },
    seniorTips: [
      'If you enable create_before_destroy on a resource, any dependency that references its ID must also have create_before_destroy = true, otherwise a cycle error occurs.'
    ]
  }
];
