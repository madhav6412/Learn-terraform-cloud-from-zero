export interface TerraformFile {
  name: string;
  path: string;
  language: 'hcl' | 'json' | 'yaml' | 'markdown' | 'rego';
  content: string;
  isReadOnly?: boolean;
}

export interface ResourceNode {
  id: string;
  name: string;
  type: string;
  provider: string;
  module?: string;
  status: 'planned' | 'created' | 'modified' | 'destroyed';
  attributes: Record<string, any>;
  dependencies?: string[];
}

export interface TerraformState {
  version: number;
  terraform_version: string;
  serial: number;
  lineage: string;
  resources: Array<{
    module?: string;
    mode: 'managed' | 'data';
    type: string;
    name: string;
    provider: string;
    instances: Array<{
      schema_version: number;
      attributes: Record<string, any>;
      dependencies?: string[];
    }>;
  }>;
  outputs: Record<string, { value: any; type: string }>;
}

export interface InterviewPrep {
  coreQuestion: string;
  interviewerIntent: string;
  juniorMistake: string;
  staffSolution: string;
  trapQuestions: string[];
  productionChecklist: string[];
}

export type ScenarioDomain = 'terraform-core' | 'cloud-vms' | 'kubernetes';

export interface LabScenario {
  id: string;
  title: string;
  tagline: string;
  domain: ScenarioDomain;
  category: 'localstack' | 'modules' | 'docker' | 'state-surgery' | 'testing' | 'policy' | 'networking' | 'iam-security' | 'zero-downtime' | 'kubernetes-aws' | 'kubernetes-azure' | 'vm-aws' | 'vm-azure';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  costRequirement: string;
  description: string;
  learningObjectives: string[];
  interviewPrep: InterviewPrep;
  files: TerraformFile[];
  activeFile: string;
  expectedOutputs?: Record<string, any>;
  localRunGuide: {
    prerequisites: string[];
    dockerCompose?: string;
    runScript: string[];
    verificationCommands: string[];
    notes: string;
  };
}

export interface CommandLog {
  id: string;
  timestamp: string;
  command: string;
  output: string;
  exitCode: number;
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  description: string;
  errorMessage?: string;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  scenarioDescription: string;
  initialCode: string;
  filename: string;
  hint: string;
  solutionExplanation: string;
  validate: (code: string) => { passed: boolean; message: string };
}

// K9s Simulator Types
export interface K8sPod {
  namespace: string;
  name: string;
  ready: string;
  status: 'Running' | 'CrashLoopBackOff' | 'Pending' | 'Error' | 'Completed' | 'OOMKilled';
  restarts: number;
  cpu: string;
  mem: string;
  age: string;
  node: string;
  ip: string;
  logs: string[];
}

export interface K8sDeployment {
  namespace: string;
  name: string;
  ready: string;
  upToDate: number;
  available: number;
  age: string;
  containers: string[];
  images: string[];
}

export interface K8sService {
  namespace: string;
  name: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  clusterIp: string;
  externalIp: string;
  ports: string;
  age: string;
}

export interface K8sNode {
  name: string;
  status: 'Ready' | 'NotReady';
  roles: string;
  version: string;
  cpuPercent: string;
  memPercent: string;
  internalIp: string;
  osImage: string;
}
