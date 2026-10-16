import { K8sPod, K8sDeployment, K8sService, K8sNode } from '../types/terraform';

export const INITIAL_K8S_PODS: K8sPod[] = [
  {
    namespace: 'production-apps',
    name: 'order-api-7b8f99d6d-2kz8w',
    ready: '1/1',
    status: 'Running',
    restarts: 0,
    cpu: '45m',
    mem: '142Mi',
    age: '3d4h',
    node: 'worker-pool-node-01',
    ip: '10.244.1.42',
    logs: [
      '[2026-10-16 21:00:12] INFO: OrderService initialized on port 8080',
      '[2026-10-16 21:00:15] INFO: Connected to simulated RDS Postgres DB',
      '[2026-10-16 21:05:22] INFO: Processed checkout event #88492 in 42ms',
      '[2026-10-16 21:12:01] INFO: Health probe GET /healthz 200 OK'
    ]
  },
  {
    namespace: 'production-apps',
    name: 'payment-processor-59d4c7b89-9xqlm',
    ready: '1/1',
    status: 'Running',
    restarts: 1,
    cpu: '85m',
    mem: '256Mi',
    age: '18h',
    node: 'worker-pool-node-02',
    ip: '10.244.2.18',
    logs: [
      '[2026-10-16 18:22:01] INFO: Payment gateway token acquired',
      '[2026-10-16 18:30:10] WARN: Retry transaction #301 - idempotency key preserved',
      '[2026-10-16 21:10:00] INFO: Successfully verified HMAC SHA256 webhook'
    ]
  },
  {
    namespace: 'production-apps',
    name: 'inventory-worker-84d77b47b-cr45h',
    ready: '0/1',
    status: 'CrashLoopBackOff',
    restarts: 14,
    cpu: '12m',
    mem: '84Mi',
    age: '2h15m',
    node: 'worker-pool-node-01',
    ip: '10.244.1.99',
    logs: [
      '[2026-10-16 20:55:01] FATAL: Missing required secret: DB_PASSWORD',
      '[2026-10-16 20:55:01] Panic: nil pointer dereference at main.go:84',
      '[2026-10-16 20:55:02] Container exited with code 1',
      '[2026-10-16 20:57:14] Back-off 5m0s restarting failed container inventory-worker'
    ]
  },
  {
    namespace: 'production-apps',
    name: 'analytics-aggregator-66bf875d-oomkd',
    ready: '0/1',
    status: 'OOMKilled',
    restarts: 3,
    cpu: '240m',
    mem: '512Mi',
    age: '4h',
    node: 'worker-pool-node-02',
    ip: '10.244.2.44',
    logs: [
      '[2026-10-16 19:15:30] WARN: Heap memory consumption exceeded 490Mi / 512Mi limit',
      '[2026-10-16 19:16:01] Kubelet terminated container: Out of Memory (OOMKilled)'
    ]
  },
  {
    namespace: 'ingress-nginx',
    name: 'ingress-nginx-controller-76c9c6467c-t9j4x',
    ready: '1/1',
    status: 'Running',
    restarts: 0,
    cpu: '110m',
    mem: '320Mi',
    age: '14d',
    node: 'worker-pool-node-01',
    ip: '10.244.1.5',
    logs: [
      '[2026-10-16 21:00:00] INFO: Configuration successfully reloaded',
      '[2026-10-16 21:11:45] 192.168.1.1 - "GET /api/v1/orders HTTP/1.1" 200 422 "-" "curl/7.88.1"'
    ]
  },
  {
    namespace: 'kube-system',
    name: 'coredns-66f779496c-4822j',
    ready: '1/1',
    status: 'Running',
    restarts: 0,
    cpu: '15m',
    mem: '32Mi',
    age: '14d',
    node: 'control-plane-master-01',
    ip: '10.244.0.2',
    logs: [
      '[INFO] plugin/reload: Running configuration SHA: a5e3c1f',
      '[INFO] CoreDNS-1.11.1 ready for UDP/TCP queries'
    ]
  },
  {
    namespace: 'kube-system',
    name: 'aws-node-c9z82',
    ready: '1/1',
    status: 'Running',
    restarts: 0,
    cpu: '20m',
    mem: '64Mi',
    age: '14d',
    node: 'worker-pool-node-01',
    ip: '192.168.10.12',
    logs: [
      '[INFO] AWS VPC CNI initialized. Allocated 14 secondary ENI IPs for pods'
    ]
  }
];

export const INITIAL_K8S_DEPLOYMENTS: K8sDeployment[] = [
  {
    namespace: 'production-apps',
    name: 'order-api',
    ready: '1/1',
    upToDate: 1,
    available: 1,
    age: '3d4h',
    containers: ['order-api'],
    images: ['registry.enterprise.io/apps/order-api:v2.4.1']
  },
  {
    namespace: 'production-apps',
    name: 'payment-processor',
    ready: '1/1',
    upToDate: 1,
    available: 1,
    age: '18h',
    containers: ['payment-processor'],
    images: ['registry.enterprise.io/apps/payment:v1.9.0']
  },
  {
    namespace: 'production-apps',
    name: 'inventory-worker',
    ready: '0/1',
    upToDate: 1,
    available: 0,
    age: '2h15m',
    containers: ['inventory-worker'],
    images: ['registry.enterprise.io/apps/inventory:v3.0.1']
  },
  {
    namespace: 'ingress-nginx',
    name: 'ingress-nginx-controller',
    ready: '1/1',
    upToDate: 1,
    available: 1,
    age: '14d',
    containers: ['controller'],
    images: ['registry.k8s.io/ingress-nginx/controller:v1.9.4']
  }
];

export const INITIAL_K8S_SERVICES: K8sService[] = [
  {
    namespace: 'production-apps',
    name: 'order-api-svc',
    type: 'ClusterIP',
    clusterIp: '10.96.14.88',
    externalIp: '<none>',
    ports: '80:8080/TCP',
    age: '3d4h'
  },
  {
    namespace: 'production-apps',
    name: 'payment-svc',
    type: 'ClusterIP',
    clusterIp: '10.96.22.105',
    externalIp: '<none>',
    ports: '443:8443/TCP',
    age: '18h'
  },
  {
    namespace: 'ingress-nginx',
    name: 'ingress-nginx-controller',
    type: 'LoadBalancer',
    clusterIp: '10.96.0.10',
    externalIp: '127.0.0.1',
    ports: '80:31245/TCP, 443:31990/TCP',
    age: '14d'
  }
];

export const INITIAL_K8S_NODES: K8sNode[] = [
  {
    name: 'control-plane-master-01',
    status: 'Ready',
    roles: 'control-plane',
    version: 'v1.29.2',
    cpuPercent: '18%',
    memPercent: '34%',
    internalIp: '192.168.10.10',
    osImage: 'Ubuntu 22.04 LTS (Zero-Cloud Kind Cluster)'
  },
  {
    name: 'worker-pool-node-01',
    status: 'Ready',
    roles: 'worker',
    version: 'v1.29.2',
    cpuPercent: '42%',
    memPercent: '61%',
    internalIp: '192.168.10.11',
    osImage: 'Ubuntu 22.04 LTS (Zero-Cloud Kind Cluster)'
  },
  {
    name: 'worker-pool-node-02',
    status: 'Ready',
    roles: 'worker',
    version: 'v1.29.2',
    cpuPercent: '38%',
    memPercent: '55%',
    internalIp: '192.168.10.12',
    osImage: 'Ubuntu 22.04 LTS (Zero-Cloud Kind Cluster)'
  }
];
