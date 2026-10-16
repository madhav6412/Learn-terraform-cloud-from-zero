export interface K8sScenario {
  id: string;
  level: 'L1 (0-2 Yrs)' | 'L2 (2-5 Yrs)' | 'L3 (Senior / SRE 5+ Yrs)';
  title: string;
  category: 'Troubleshooting' | 'High Availability & Scaling' | 'Security & RBAC' | 'Networking & DNS' | 'Storage & Stateful';
  cloudContext: 'AWS EKS' | 'Azure AKS' | 'Multi-Cloud / Agnostic' | 'AWS EKS / Azure AKS';
  problemStatement: string;
  symptoms: string[];
  diagnosisCommands: string[];
  rootCause: string;
  terraformFixExplanation: string;
  hclSnippet: string;
  interviewTalkingPoints: string[];
}

export const K8S_INTERVIEW_SCENARIOS: K8sScenario[] = [
  {
    id: 'k8s-crashloop-oomkilled',
    level: 'L2 (2-5 Yrs)',
    title: 'Pod Stuck in CrashLoopBackOff (OOMKilled Exit Code 137)',
    category: 'Troubleshooting',
    cloudContext: 'Multi-Cloud / Agnostic',
    problemStatement: 'Following a new production microservice release, pods repeatedly crash within 20 seconds of traffic arriving. Status shows CrashLoopBackOff and restart count keeps climbing.',
    symptoms: [
      'kubectl get pods displays STATUS: CrashLoopBackOff, RESTARTS: 12',
      'kubectl describe pod shows Last State: Terminated, Reason: OOMKilled, Exit Code: 137',
      'Application logs abruptly stop mid-request processing'
    ],
    diagnosisCommands: [
      'kubectl describe pod <pod-name> -n production',
      'kubectl logs <pod-name> -n production --previous',
      'kubectl top pod <pod-name> -n production',
      'kubectl get events -n production --sort-by=.metadata.creationTimestamp'
    ],
    rootCause: 'The container exceeded its configured memory limit in the spec (Exit Code 137 = 128 + 9 SIGKILL). Linux kernel cgroup OOM Killer terminated the process.',
    terraformFixExplanation: 'In the kubernetes_deployment resource, appropriately right-size the resources.limits.memory and resources.requests.memory. Set JVM/Node max heap flags below the container limit to allow GC to kick in before the OS kills the process.',
    hclSnippet: `resource "kubernetes_deployment" "api" {
  spec {
    template {
      spec {
        container {
          name  = "api"
          image = "corp/api:v2.4"

          resources {
            requests = {
              cpu    = "250m"
              memory = "512Mi"
            }
            limits = {
              cpu    = "1000m"
              memory = "1024Mi" # Increased from 256Mi to stop OOMKilled
            }
          }

          env {
            name  = "JAVA_OPTS"
            value = "-XX:MaxRAMPercentage=75.0" # Keeps JVM below cgroup limit
          }
        }
      }
    }
  }
}`,
    interviewTalkingPoints: [
      'Exit Code 137 is always SIGKILL (128 + 9), most commonly triggered by cgroup OOM Killer.',
      'Explain the difference between QoS classes: Guaranteed (requests == limits), Burstable (requests < limits), and BestEffort (no limits). Guaranteed pods are evicted last by the kubelet under memory pressure.',
      'Mention Vertical Pod Autoscaler (VPA) in recommendation mode to detect real-world memory profiles.'
    ]
  },

  {
    id: 'k8s-pod-stuck-pending',
    level: 'L1 (0-2 Yrs)',
    title: 'Pod Stuck in Pending State (0/3 Nodes Available)',
    category: 'Troubleshooting',
    cloudContext: 'AWS EKS',
    problemStatement: 'A developer deploys a new batch worker, but all pods stay in Pending state indefinitely and are never scheduled onto worker nodes.',
    symptoms: [
      'kubectl get pods shows STATUS: Pending for over 15 minutes',
      'kubectl describe pod shows Events: "0/3 nodes are available: 3 Insufficient cpu, 1 node(s) had untolerated taint"'
    ],
    diagnosisCommands: [
      'kubectl describe pod <pod-name>',
      'kubectl describe nodes | grep -A 8 Allocated',
      'kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints'
    ],
    rootCause: '1) The requested CPU requests exceed the allocatable capacity of any single node in the cluster. 2) Specialized worker nodes have taints (e.g., CriticalAddonsOnly) which the pod does not tolerate.',
    terraformFixExplanation: '1) Reduce resource requests to match actual node sizes. 2) If targeting tainted nodes, add a toleration block in the pod spec. 3) In EKS, ensure the aws_eks_node_group has scaling_config max_size configured to trigger the Cluster Autoscaler / Karpenter.',
    hclSnippet: `resource "kubernetes_deployment" "worker" {
  spec {
    template {
      spec {
        # Toleration for system tainted nodes if intended
        toleration {
          key      = "workload-type"
          operator = "Equal"
          value    = "batch-compute"
          effect   = "NoSchedule"
        }

        container {
          name  = "batch-worker"
          image = "corp/worker:latest"

          resources {
            requests = {
              cpu    = "200m" # Reduced from 4000m to fit within t3.medium allocatable CPU
              memory = "256Mi"
            }
          }
        }
      }
    }
  }
}`,
    interviewTalkingPoints: [
      'Explain how the kube-scheduler filtering and scoring phases work.',
      'Walk through the 4 common reasons for Pending: Insufficient CPU/Memory, PVC pending attachment, NodeAffinity/NodeSelector mismatch, and Taints/Tolerations.',
      'Highlight how AWS Karpenter evaluates Pending pods and dynamically provisions just-in-time EC2 instances.'
    ]
  },

  {
    id: 'k8s-rolling-update-downtime',
    level: 'L3 (Senior / SRE 5+ Yrs)',
    title: 'Zero-Downtime Deployment Failed (502 Bad Gateway During Rollout)',
    category: 'High Availability & Scaling',
    cloudContext: 'Multi-Cloud / Agnostic',
    problemStatement: 'During a rolling update deployment in production, customers experienced 502/503 errors and dropped API requests for 45 seconds, despite using strategy: RollingUpdate.',
    symptoms: [
      'NGINX / ALB ingress logs 502 Bad Gateway during pod termination and startup',
      'Old pods received SIGTERM while still receiving in-flight HTTP connections',
      'New pods accepted traffic before application frameworks (e.g. Spring Boot / Node) finished booting'
    ],
    diagnosisCommands: [
      'kubectl rollout history deployment/<name>',
      'kubectl get events -n production --watch',
      'kubectl describe ingress <ingress-name>'
    ],
    rootCause: '1) Missing or misconfigured readinessProbe allowed kube-proxy / endpoints controller to route traffic to new pods before they were listening. 2) Missing preStop lifecycle hook resulted in instantaneous SIGTERM before endpoints were removed from iptables/IPVS across nodes.',
    terraformFixExplanation: 'Add a robust readinessProbe with initial_delay_seconds and a lifecycle preStop hook with sleep 10 to give kube-proxy time to remove the terminating pod from iptables. Combine with a PodDisruptionBudget.',
    hclSnippet: `resource "kubernetes_deployment" "resilient_api" {
  spec {
    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_surge       = "25%"
        max_unavailable = "0%" # Never take down healthy pods before new ones are ready
      }
    }

    template {
      spec {
        container {
          name  = "api"
          image = "corp/api:v3"

          lifecycle {
            pre_stop {
              exec {
                command = ["/bin/sh", "-c", "sleep 10"] # Wait for endpoint propagation
              }
            }
          }

          readiness_probe {
            http_get {
              path = "/healthz/ready"
              port = 8080
            }
            initial_delay_seconds = 5
            period_seconds        = 3
            failure_threshold     = 3
          }
        }
      }
    }
  }
}

# Enforce Pod Disruption Budget
resource "kubernetes_pod_disruption_budget_v1" "api_pdb" {
  metadata {
    name = "api-pdb"
  }
  spec {
    min_available = "80%"
    selector {
      match_labels = {
        app = "resilient-api"
      }
    }
  }
}`,
    interviewTalkingPoints: [
      'Explain the exact sequence of events when a pod terminates: Endpoints controller removes pod IP, kube-proxy updates iptables/IPVS, kubelet sends SIGTERM, then wait terminationGracePeriodSeconds before SIGKILL.',
      'Explain why preStop sleep 5-15s is essential to avoid race conditions with ingress controllers.',
      'Differentiate between livenessProbe (restarts pod if deadlocked) vs readinessProbe (removes pod from service endpoints if busy).'
    ]
  },

  {
    id: 'k8s-pod-anti-affinity-multiaz',
    level: 'L3 (Senior / SRE 5+ Yrs)',
    title: 'Multi-AZ Resilience & Pod Anti-Affinity',
    category: 'High Availability & Scaling',
    cloudContext: 'AWS EKS / Azure AKS',
    problemStatement: 'An Availability Zone outage in us-east-1a took down all 4 replicas of a critical billing service because Kubernetes scheduled all pods on worker nodes in the same zone.',
    symptoms: [
      'AWS announces degraded AZ in us-east-1a',
      'Billing API goes completely offline because all 4 replicas were placed on nodes in us-east-1a'
    ],
    diagnosisCommands: [
      'kubectl get pods -o wide -L topology.kubernetes.io/zone',
      'kubectl get nodes -L topology.kubernetes.io/zone'
    ],
    rootCause: 'Default kube-scheduler optimizes for packing density unless explicit topologySpreadConstraints or podAntiAffinity rules enforce AZ dispersal.',
    terraformFixExplanation: 'Implement topology_spread_constraints targeting topology.kubernetes.io/zone with max_skew = 1 and when_unsatisfiable = "DoNotSchedule", combined with pod_anti_affinity.',
    hclSnippet: `resource "kubernetes_deployment" "ha_billing" {
  spec {
    replicas = 3

    template {
      spec {
        topology_spread_constraint {
          max_skew           = 1
          topology_key       = "topology.kubernetes.io/zone"
          when_unsatisfiable = "DoNotSchedule"
          label_selector {
            match_labels = {
              app = "billing"
            }
          }
        }

        affinity {
          pod_anti_affinity {
            preferred_during_scheduling_ignored_during_execution {
              weight = 100
              pod_affinity_term {
                label_selector {
                  match_expressions {
                    key      = "app"
                    operator = "In"
                    values   = ["billing"]
                  }
                }
                topology_key = "kubernetes.io/hostname" # Never schedule 2 on same node
              }
            }
          }
        }

        container {
          name  = "billing"
          image = "corp/billing:v1"
        }
      }
    }
  }
}`,
    interviewTalkingPoints: [
      'Explain topologySpreadConstraints vs PodAntiAffinity: topologySpreadConstraints provides granular distribution (max_skew = 1 across zones); PodAntiAffinity is binary.',
      'Explain the difference between DoNotSchedule (hard requirement) vs ScheduleAnyway (soft preference).',
      'Mention how node groups in AWS EKS / Azure AKS should span across at least 3 AZs.'
    ]
  },

  {
    id: 'k8s-network-policy-zero-trust',
    level: 'L2 (2-5 Yrs)',
    title: 'Lateral Movement Prevention with Zero-Trust NetworkPolicies',
    category: 'Security & RBAC',
    cloudContext: 'Multi-Cloud / Agnostic',
    problemStatement: 'Security audit flagged that pods in the frontend namespace can freely reach internal database pods on port 5432 and Redis instances in other namespaces without restriction.',
    symptoms: [
      'Default Kubernetes networking is flat: any pod can talk to any pod across all namespaces',
      'A compromised frontend container can port-scan internal cluster CIDRs and reach internal database ports'
    ],
    diagnosisCommands: [
      'kubectl exec -it <frontend-pod> -- nc -zv <database-ip> 5432',
      'kubectl get networkpolicies -A'
    ],
    rootCause: 'No NetworkPolicies defined in the cluster. CNI plugins (Calico, Cilium, AWS VPC CNI, Azure CNI) default to allow-all until a NetworkPolicy selects the pods.',
    terraformFixExplanation: '1) Apply a default-deny ingress and egress NetworkPolicy per namespace. 2) Create explicit allow rules selecting allowed frontend pods by label and port.',
    hclSnippet: `resource "kubernetes_network_policy" "default_deny_all" {
  metadata {
    name      = "default-deny-ingress"
    namespace = "production-db"
  }

  spec {
    pod_selector {} # Selects all pods in namespace
    policy_types = ["Ingress"]
  }
}

resource "kubernetes_network_policy" "allow_backend_only" {
  metadata {
    name      = "allow-backend-to-postgres"
    namespace = "production-db"
  }

  spec {
    pod_selector {
      match_labels = {
        role = "postgres"
      }
    }

    ingress {
      ports {
        port     = "5432"
        protocol = "TCP"
      }

      from {
        namespace_selector {
          match_labels = {
            environment = "production"
          }
        }
        pod_selector {
          match_labels = {
            app = "backend-api" # Only backend API allowed, NOT frontend
          }
        }
      }
    }

    policy_types = ["Ingress"]
  }
}`,
    interviewTalkingPoints: [
      'Highlight that NetworkPolicies require a CNI that supports them (e.g. Calico, Cilium, Azure NPM, AWS VPC CNI with network policy agent).',
      'Always start with Default Deny in production namespaces.',
      'Explain how namespaceSelector and podSelector work in conjunction (AND vs OR conditions based on list syntax).'
    ]
  },

  {
    id: 'k8s-dns-ndots-latency',
    level: 'L3 (Senior / SRE 5+ Yrs)',
    title: 'CoreDNS Overload & The 5-ndots DNS Latency Trap',
    category: 'Networking & DNS',
    cloudContext: 'Multi-Cloud / Agnostic',
    problemStatement: 'External API calls from pods to "api.stripe.com" or "api.github.com" experience intermittent 5-second connection delays and CoreDNS pods show 100% CPU usage.',
    symptoms: [
      'curl to external FQDN takes 5005ms or fails with DNS timeout',
      'CoreDNS logs show hundreds of queries for: api.stripe.com.default.svc.cluster.local',
      'CoreDNS pod memory and CPU metrics spike during peak application traffic'
    ],
    diagnosisCommands: [
      'kubectl top pod -n kube-system -l k8s-app=kube-dns',
      'kubectl logs -n kube-system -l k8s-app=kube-dns',
      'kubectl exec -it <pod> -- cat /etc/resolv.conf'
    ],
    rootCause: 'Linux resolv.conf in Kubernetes sets options ndots:5 by default. Any hostname with fewer than 5 dots (e.g., api.stripe.com has 2 dots) searches all local search domains (default.svc.cluster.local, svc.cluster.local, cluster.local) before querying the root DNS servers!',
    terraformFixExplanation: '1) Deploy NodeLocal DNSCache via Terraform/Helm. 2) Configure dnsConfig in deployment spec with ndots:2 or append trailing dot (api.stripe.com.) in code.',
    hclSnippet: `resource "kubernetes_deployment" "dns_optimized_service" {
  spec {
    template {
      spec {
        # Optimize DNS resolver behavior
        dns_config {
          options {
            name  = "ndots"
            value = "2" # Bypasses search domain iterations for standard external domains
          }
          options {
            name  = "single-request-reopen"
          }
        }

        container {
          name  = "worker"
          image = "corp/worker:latest"
        }
      }
    }
  }
}`,
    interviewTalkingPoints: [
      'This is an infamous SRE senior interview question. The ndots:5 default causes 4 sequential DNS queries for every single external API request.',
      'Explain NodeLocal DNSCache: runs as a DaemonSet caching DNS queries locally on node loopback IP (169.254.20.10), removing CoreDNS bottlenecks.',
      'Mention appending trailing dots to external hostnames in microservice configs (e.g. api.stripe.com.) to signify an absolute FQDN.'
    ]
  }
];
