import { LabScenario, TerraformFile, TerraformState, ResourceNode } from '../types/terraform';
import { DriftItem } from '../data/driftScenarios';

export interface CommandResult {
  output: string;
  exitCode: number;
  newFiles?: TerraformFile[];
  newState?: TerraformState;
  newIsApplied?: boolean;
  newStepIndex?: number;
  newDrift?: DriftItem | null;
  newActiveSection?: string;
  newStudioView?: 'editor' | 'd3-graph' | 'state-json';
}

export interface DispatchContext {
  command: string;
  scenario: LabScenario;
  files: TerraformFile[];
  state: TerraformState;
  isApplied: boolean;
  currentStepIndex: number;
  activeDrift: DriftItem | null;
  currentDir?: string;
}

export function dispatchTerminalCommand(ctx: DispatchContext): CommandResult {
  const raw = ctx.command.trim();
  const lower = raw.toLowerCase();
  const tokens = raw.split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);
  const currentDir = ctx.currentDir || '/workspace/terraform-zero-cost-lab';

  // 1. K9s Launcher
  if (cmd === 'k9s') {
    return {
      output: `[SUCCESS] Launching K9s Visual Kubernetes Terminal simulator...
Connecting to context: kind-localstack-cluster
Cluster: Kubernetes v1.29.2 ($0.00 Expense Guarantee)
User: Madhav Gupta (Admin)
Switching display to K9s Terminal UI...`,
      exitCode: 0,
      newActiveSection: 'kubernetes-k9s'
    };
  }

  // 2. Clear
  if (cmd === 'clear') {
    return {
      output: '__CLEAR_TERMINAL__',
      exitCode: 0
    };
  }

  // 3. Help / Man commands
  if (cmd === 'help' || cmd === 'man') {
    const topic = args[0]?.toLowerCase();
    if (topic === 'k8s' || topic === 'kubernetes' || topic === 'kubectl') {
      return {
        output: `=== KUBERNETES COMMAND CHEATSHEET ===
Core Workloads:
  kubectl get pods -A                 List all pods across namespaces
  kubectl get pods -n <namespace>     List pods in specific namespace
  kubectl describe pod <name>         Detailed pod spec & event log
  kubectl logs <name> [-f]            Stream container logs
  kubectl logs <name> --previous      Inspect crashed container logs
  kubectl delete pod <name>           Restart / re-schedule pod

Cluster & Networking:
  kubectl get nodes                   Display cluster nodes (Ready)
  kubectl get svc,ep                  List services and endpoints
  kubectl get deploy                  List deployments and replicas
  kubectl get ingress                 List Ingress routing rules
  kubectl get ns                      List namespaces

Diagnostics & TUI:
  k9s                                 Launch full interactive visual terminal
  kubectl cluster-info                Control plane status
  kubectl top nodes / top pods        Resource CPU/Memory metrics
  helm list -A                        List installed Helm charts`,
        exitCode: 0
      };
    }

    if (topic === 'terraform' || topic === 'tf') {
      return {
        output: `=== TERRAFORM COMMAND CHEATSHEET ===
Lifecycle Workflow:
  terraform init                      Initialize providers & backend ($0 LocalStack)
  terraform plan [-out=tfplan]        Preview execution delta
  terraform apply [-auto-approve]     Build resources into state
  terraform destroy [-auto-approve]   Decommission managed infrastructure
  terraform validate                  Syntax & schema validation
  terraform fmt [-check]              Format HCL according to standards

State Management:
  terraform state list                Enumerate all resources in tfstate
  terraform state show <addr>         Inspect exact HCL attributes of resource
  terraform state mv <src> <dest>     State surgery without infrastructure outage
  terraform state rm <addr>           Detach resource from state
  terraform import <addr> <id>        Import existing cloud resource
  terraform output [-json]            Display output variables
  terraform graph                     Render dependency graph (or open D3 DAG)
  terraform version                   CLI and provider version audit`,
        exitCode: 0
      };
    }

    if (topic === 'linux' || topic === 'bash' || topic === 'shell') {
      return {
        output: `=== LINUX SHELL & SYSTEM COMMANDS ===
Filesystem:
  ls [-la]                            List files with permissions
  pwd                                 Print working directory
  cd <dir>                            Change directory
  cat <file>                          Concatenate and view file
  head / tail [-n 20] <file>          View start/end of file
  touch <file>                        Create empty file in workspace
  rm [-f] <file>                      Remove file from workspace
  cp <src> <dest>                     Copy file
  mv <src> <dest>                     Rename/move file
  grep [-i] <pattern> <file>          Search text patterns
  find [path] -name <pattern>         Search files

System & Hardware:
  date                                Display current system timestamp
  whoami / id                         Current user identity
  uname -a / hostname                 Kernel and host architecture
  uptime                              System uptime & load average
  env / export                        Environment variables
  df -h / du -sh                      Disk space diagnostics
  free -m                             RAM memory usage
  top / htop / ps aux                 Running processes
  which <binary>                      Binary search path

Networking:
  curl <url>                          HTTP probe (try curl http://localhost:4566)
  ping <host>                         ICMP probe
  ip a / ifconfig                     Network interface addresses
  netstat -tulpn / ss -tulpn          Open socket listeners`,
        exitCode: 0
      };
    }

    return {
      output: `=== TERRAFORM & K8S STUDIO: COMPLETE CLI REFERENCE ===
Owner & Architect: Madhav Gupta · Zero-Cloud Sandbox ($0.00 Cost)

1. Terraform Lifecycle:
   terraform init · terraform plan · terraform apply -auto-approve
   terraform destroy · terraform validate · terraform fmt · terraform output
   terraform state list · terraform state show <addr> · terraform version

2. Kubernetes:
   kubectl get pods -A · kubectl get nodes · kubectl get svc · kubectl get ns
   kubectl describe pod <name> · kubectl logs <name> · kubectl delete pod <name>
   k9s (Visual interactive terminal) · helm list

3. Linux & System Commands:
   date · whoami · uname -a · uptime · env · echo <text> · history · clear
   ls -la · pwd · cat <file> · touch <file> · rm <file> · cp <src> <dest>
   grep <pattern> <file> · df -h · free -m · ps aux · top · which <bin>
   curl <url> · ping <host> · ip a · netstat -tulpn

4. Cloud & Docker:
   docker ps · aws sts get-caller-identity · aws ec2 describe-instances · aws s3 ls
   git status · git log · git branch

Type "help k8s", "help terraform", or "help linux" for specialized topics.
Or click Ayushi (A.I.) for automated execution!`,
      exitCode: 0
    };
  }

  // 4. Date command (Real dynamic timestamp)
  if (cmd === 'date') {
    return {
      output: new Date().toString(),
      exitCode: 0
    };
  }

  // 5. Whoami & Identity
  if (cmd === 'whoami') {
    return {
      output: 'madhav-gupta (Lead Cloud Architect · Studio Owner)',
      exitCode: 0
    };
  }

  if (cmd === 'id') {
    return {
      output: 'uid=1000(madhav-gupta) gid=1000(madhav-gupta) groups=1000(madhav-gupta),4(adm),27(sudo),999(docker)',
      exitCode: 0
    };
  }

  if (cmd === 'groups') {
    return {
      output: 'madhav-gupta adm sudo docker devops-admins',
      exitCode: 0
    };
  }

  // 6. Uptime & Hostname
  if (cmd === 'uptime') {
    return {
      output: `${new Date().toLocaleTimeString()} up 14 days, 3:42, 1 user, load average: 0.08, 0.05, 0.01`,
      exitCode: 0
    };
  }

  if (cmd === 'hostname') {
    return {
      output: 'zero-cloud-sandbox',
      exitCode: 0
    };
  }

  // 7. Uname
  if (cmd === 'uname') {
    if (args.includes('-a') || args.includes('-m')) {
      return {
        output: 'Linux zero-cloud-sandbox 6.6.0-generic #2026-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
        exitCode: 0
      };
    }
    return {
      output: 'Linux',
      exitCode: 0
    };
  }

  // 8. Pwd & Cd
  if (cmd === 'pwd') {
    return {
      output: currentDir,
      exitCode: 0
    };
  }

  if (cmd === 'cd') {
    const target = args[0];
    if (!target || target === '~' || target === '/workspace' || target === '.') {
      return {
        output: '',
        exitCode: 0
      };
    }
    return {
      output: `cd: ${target}: Navigated in virtual sandbox`,
      exitCode: 0
    };
  }

  // 9. Ls & Dir
  if (cmd === 'ls' || cmd === 'dir') {
    const isLong = args.some((a) => a.includes('l'));
    const isAll = args.some((a) => a.includes('a'));

    if (isLong) {
      const now = new Date();
      const dateStr = now.toLocaleDateString([], { month: 'short', day: '2-digit' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let lines = [
        'total 48',
        isAll ? 'drwxr-xr-x  4 madhav-gupta madhav-gupta 4096 ' + dateStr + ' .' : '',
        isAll ? 'drwxr-xr-x 12 madhav-gupta madhav-gupta 4096 ' + dateStr + ' ..' : '',
        isAll ? '-rw-r--r--  1 madhav-gupta madhav-gupta  320 ' + dateStr + ' .terraform.lock.hcl' : ''
      ].filter(Boolean);

      ctx.files.forEach((f) => {
        const size = f.content.length;
        lines.push(`-rw-r--r--  1 madhav-gupta madhav-gupta ${String(size).padStart(5, ' ')} ${dateStr} ${f.name}`);
      });

      if (ctx.isApplied) {
        lines.push(`-rw-r--r--  1 madhav-gupta madhav-gupta  3840 ${dateStr} terraform.tfstate`);
      }

      return {
        output: lines.join('\n'),
        exitCode: 0
      };
    }

    const fileNames = ctx.files.map((f) => f.name);
    if (ctx.isApplied) fileNames.push('terraform.tfstate');
    if (isAll) fileNames.unshift('.terraform', '.terraform.lock.hcl');

    return {
      output: fileNames.join('  '),
      exitCode: 0
    };
  }

  // 10. Cat, Head, Tail, More, Less
  if (cmd === 'cat' || cmd === 'head' || cmd === 'tail' || cmd === 'more' || cmd === 'less') {
    const filename = args[args.length - 1];
    if (!filename) {
      return {
        output: `Usage: ${cmd} <filename>`,
        exitCode: 1
      };
    }

    if (filename === 'terraform.tfstate') {
      return {
        output: JSON.stringify(ctx.state, null, 2),
        exitCode: 0
      };
    }

    const matched = ctx.files.find((f) => f.name === filename || f.name.endsWith(filename));
    if (!matched) {
      return {
        output: `${cmd}: ${filename}: No such file or directory`,
        exitCode: 1
      };
    }

    const lines = matched.content.split('\n');
    if (cmd === 'head') {
      return {
        output: lines.slice(0, 15).join('\n'),
        exitCode: 0
      };
    }
    if (cmd === 'tail') {
      return {
        output: lines.slice(-15).join('\n'),
        exitCode: 0
      };
    }

    return {
      output: matched.content,
      exitCode: 0
    };
  }

  // 11. Touch file (Actually creates file in active workspace!)
  if (cmd === 'touch') {
    const filename = args[0];
    if (!filename) {
      return { output: 'touch: missing file operand', exitCode: 1 };
    }
    const existing = ctx.files.find((f) => f.name === filename);
    if (existing) {
      return { output: '', exitCode: 0 };
    }
    const newFile: TerraformFile = {
      name: filename,
      path: filename,
      language: filename.endsWith('.json') ? 'json' : filename.endsWith('.yaml') || filename.endsWith('.yml') ? 'yaml' : 'hcl',
      content: `# ${filename} - Created via Terminal\n# Owner: Madhav Gupta\n`
    };
    return {
      output: `[CREATED] ${filename} added to workspace files.`,
      exitCode: 0,
      newFiles: [...ctx.files, newFile]
    };
  }

  // 12. Rm file (Actually removes file from active workspace!)
  if (cmd === 'rm') {
    const filename = args.find((a) => !a.startsWith('-'));
    if (!filename) {
      return { output: 'rm: missing operand', exitCode: 1 };
    }
    if (ctx.files.length <= 1) {
      return { output: `rm: cannot remove '${filename}': at least one file must remain in workspace`, exitCode: 1 };
    }
    const remaining = ctx.files.filter((f) => f.name !== filename);
    if (remaining.length === ctx.files.length) {
      return { output: `rm: cannot remove '${filename}': No such file or directory`, exitCode: 1 };
    }
    return {
      output: `[REMOVED] ${filename} deleted from workspace.`,
      exitCode: 0,
      newFiles: remaining
    };
  }

  // 13. Cp file (Duplicates file in workspace)
  if (cmd === 'cp') {
    const src = args[0];
    const dest = args[1];
    if (!src || !dest) {
      return { output: 'cp: missing destination file operand after source', exitCode: 1 };
    }
    const srcFile = ctx.files.find((f) => f.name === src);
    if (!srcFile) {
      return { output: `cp: cannot stat '${src}': No such file or directory`, exitCode: 1 };
    }
    const copied: TerraformFile = {
      name: dest,
      path: dest,
      language: srcFile.language,
      content: srcFile.content
    };
    return {
      output: `[COPIED] ${src} -> ${dest} in workspace files.`,
      exitCode: 0,
      newFiles: [...ctx.files.filter((f) => f.name !== dest), copied]
    };
  }

  // 14. Mv file (Renames file in workspace)
  if (cmd === 'mv') {
    const src = args[0];
    const dest = args[1];
    if (!src || !dest) {
      return { output: 'mv: missing destination file operand after source', exitCode: 1 };
    }
    const srcFile = ctx.files.find((f) => f.name === src);
    if (!srcFile) {
      return { output: `mv: cannot stat '${src}': No such file or directory`, exitCode: 1 };
    }
    const renamed: TerraformFile = {
      ...srcFile,
      name: dest,
      path: dest
    };
    return {
      output: `[RENAMED] ${src} -> ${dest}`,
      exitCode: 0,
      newFiles: [...ctx.files.filter((f) => f.name !== src && f.name !== dest), renamed]
    };
  }

  // 15. Grep pattern in files
  if (cmd === 'grep') {
    const isCaseInsensitive = args.includes('-i');
    const cleanArgs = args.filter((a) => !a.startsWith('-'));
    const pattern = cleanArgs[0];
    const targetFile = cleanArgs[1];

    if (!pattern) {
      return { output: 'Usage: grep [-i] <pattern> [filename]', exitCode: 1 };
    }

    const reg = new RegExp(pattern, isCaseInsensitive ? 'i' : '');
    const results: string[] = [];

    const searchFiles = targetFile
      ? ctx.files.filter((f) => f.name === targetFile)
      : ctx.files;

    searchFiles.forEach((f) => {
      f.content.split('\n').forEach((line, lineNum) => {
        if (reg.test(line)) {
          results.push(`${f.name}:${lineNum + 1}: ${line.trim()}`);
        }
      });
    });

    if (results.length === 0) {
      return { output: `grep: pattern "${pattern}" not found`, exitCode: 1 };
    }

    return {
      output: results.join('\n'),
      exitCode: 0
    };
  }

  // 16. Wc (Word & Line count)
  if (cmd === 'wc') {
    const target = args.find((a) => !a.startsWith('-'));
    const matched = ctx.files.find((f) => f.name === target);
    if (matched) {
      const lines = matched.content.split('\n').length;
      const words = matched.content.split(/\s+/).length;
      const bytes = matched.content.length;
      return {
        output: `  ${lines}  ${words} ${bytes} ${matched.name}`,
        exitCode: 0
      };
    }
    return { output: `wc: ${target}: No such file or directory`, exitCode: 1 };
  }

  // 17. Find
  if (cmd === 'find') {
    return {
      output: ctx.files.map((f) => `./${f.name}`).join('\n') + (ctx.isApplied ? '\n./terraform.tfstate' : ''),
      exitCode: 0
    };
  }

  // 18. Echo
  if (cmd === 'echo') {
    let text = args.join(' ');
    text = text.replace(/["']/g, '');
    text = text.replace(/\$USER/g, 'madhav-gupta');
    text = text.replace(/\$HOME/g, '/home/madhav-gupta');
    text = text.replace(/\$AWS_DEFAULT_REGION/g, 'us-east-1');
    text = text.replace(/\$CLOUD_COST_ESTIMATE/g, '$0.00');
    text = text.replace(/\$AI_ASSISTANT/g, 'Ayushi (J.A.R.V.I.S./E.D.I.T.H.)');
    text = text.replace(/\$PWD/g, currentDir);
    return {
      output: text,
      exitCode: 0
    };
  }

  // 19. Env / Printenv / Export
  if (cmd === 'env' || cmd === 'printenv' || cmd === 'export') {
    return {
      output: `USER=madhav-gupta
LOGNAME=madhav-gupta
HOME=/home/madhav-gupta
PWD=${currentDir}
SHELL=/bin/bash
TERM=xterm-256color
AWS_DEFAULT_REGION=us-east-1
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=mock_access_key
AWS_SECRET_ACCESS_KEY=mock_secret_key
KUBECONFIG=/home/madhav-gupta/.kube/config
TERRAFORM_VERSION=1.8.4
LOCALSTACK_SIMULATION=ACTIVE
CLOUD_COST_ESTIMATE=$0.00
AI_ASSISTANT=Ayushi (J.A.R.V.I.S./E.D.I.T.H. Protocol)`,
      exitCode: 0
    };
  }

  // 20. Process Diagnostics (ps, top, htop, kill)
  if (cmd === 'ps') {
    return {
      output: `  PID TTY          TIME CMD
 1042 pts/0    00:00:01 bash
 2419 pts/0    00:00:04 localstack-entrypoint
 2984 pts/0    00:00:12 kind-control-plane
 3541 pts/0    00:00:00 terraform
 4120 pts/0    00:00:00 ps`,
      exitCode: 0
    };
  }

  if (cmd === 'top' || cmd === 'htop') {
    return {
      output: `top - ${new Date().toLocaleTimeString()} up 14 days,  1 user,  load average: 0.08, 0.04, 0.01
Tasks: 142 total,   1 running, 141 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.2 us,  0.4 sy,  0.0 ni, 98.4 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  16000.0 total,  11200.0 free,   2450.0 used,   2350.0 buff/cache
MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  13200.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 2419 madhav    20   0  842100 214500  42100 S   0.8   1.3   0:14.28 localstack
 2984 madhav    20   0 1245800 482100  51200 S   0.5   2.9   0:32.40 kube-apiserver
 1042 madhav    20   0   24500   5400   3200 S   0.0   0.0   0:01.12 bash`,
      exitCode: 0
    };
  }

  if (cmd === 'kill') {
    const pid = args[args.length - 1];
    return {
      output: `kill: (${pid || '0'}): Process terminated cleanly`,
      exitCode: 0
    };
  }

  // 21. Disk & Memory (df, du, free)
  if (cmd === 'df') {
    return {
      output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/root        50G   12G   38G  24% /
tmpfs           3.9G  1.2M  3.9G   1% /dev/shm
/dev/nvme0n1    100G   24G   76G  24% /workspace`,
      exitCode: 0
    };
  }

  if (cmd === 'du') {
    return {
      output: `4.0K\t./variables.tf
8.0K\t./outputs.tf
16K\t./main.tf
32K\t.`,
      exitCode: 0
    };
  }

  if (cmd === 'free') {
    return {
      output: `               total        used        free      shared  buff/cache   available
Mem:        16384000     2508800    11468800      131072     2406400    13516800
Swap:        4194304           0     4194304`,
      exitCode: 0
    };
  }

  // 22. Systemctl & Journalctl
  if (cmd === 'systemctl') {
    const target = args[args.length - 1] || 'docker';
    return {
      output: `● ${target}.service - Zero-Cloud Container & Orchestration Service
     Loaded: loaded (/lib/systemd/system/${target}.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2026-10-15 08:00:00 UTC; 14h ago
       Docs: https://localstack.cloud / https://kubernetes.io
   Main PID: 2419 (${target})
      Tasks: 28
     Memory: 214.5M
     CGroup: /system.slice/${target}.service
             └─2419 /usr/local/bin/${target} --emulation=zero-cost`,
      exitCode: 0
    };
  }

  if (cmd === 'journalctl') {
    return {
      output: `-- Logs begin at Thu 2026-10-15 08:00:00 UTC. --
Oct 16 14:00:01 zero-cloud systemd[1]: Started Docker Application Container Engine.
Oct 16 14:00:02 zero-cloud localstack[2419]: Ready on http://0.0.0.0:4566 ($0.00 Expense)
Oct 16 14:00:04 zero-cloud kubelet[2984]: Syncing pods for kind-control-plane...
Oct 16 14:00:05 zero-cloud kubelet[2984]: Pod production-apps/order-api running (1/1)`,
      exitCode: 0
    };
  }

  // 23. Networking (ip, ifconfig, ping, curl, wget, netstat, ss, nslookup, dig)
  if (cmd === 'ip') {
    return {
      output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth0
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0`,
      exitCode: 0
    };
  }

  if (cmd === 'ifconfig') {
    return {
      output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.18.0.2  netmask 255.255.0.0  broadcast 172.18.255.255
        RX packets 421098  bytes 184920144 (184.9 MB)
        TX packets 392011  bytes 142109840 (142.1 MB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`,
      exitCode: 0
    };
  }

  if (cmd === 'ping') {
    const host = args[args.length - 1] || 'localhost';
    return {
      output: `PING ${host} (${host === 'localhost' ? '127.0.0.1' : '172.18.0.2'}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.042 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.038 ms
64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.041 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2048ms
rtt min/avg/max/mdev = 0.038/0.040/0.042/0.002 ms`,
      exitCode: 0
    };
  }

  if (cmd === 'curl' || cmd === 'wget') {
    const url = args.find((a) => !a.startsWith('-')) || 'http://localhost:4566';
    if (url.includes('4566') || url.includes('localstack')) {
      return {
        output: `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: LocalStack/3.2.0 (Zero-Cost Local Emulator)
Content-Type: application/json

{"status": "running", "version": "3.2.0", "services": {"ec2": "running", "s3": "running", "iam": "running", "sts": "running"}}`,
        exitCode: 0
      };
    }
    return {
      output: `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: nginx/1.25.4 (Hardened Zero-Cost Alpine)
Content-Type: text/html

<!DOCTYPE html>
<html>
<head><title>Production Web Service (Zero-Cost)</title></head>
<body>
<h1>Welcome to Secured Cloud Architecture</h1>
<p>Owner: Madhav Gupta · IMDSv2 Hardened · $0.00 Cloud Cost</p>
</body>
</html>`,
      exitCode: 0
    };
  }

  if (cmd === 'netstat' || cmd === 'ss') {
    return {
      output: `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:4566            0.0.0.0:*               LISTEN      2419/localstack
tcp        0      0 0.0.0.0:6443            0.0.0.0:*               LISTEN      2984/kube-apiserver
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1042/nginx
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1042/nginx`,
      exitCode: 0
    };
  }

  if (cmd === 'nslookup' || cmd === 'dig') {
    const domain = args.find((a) => !a.startsWith('-')) || 'localstack.localhost';
    return {
      output: `Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
Name:   ${domain}
Address: 127.0.0.1`,
      exitCode: 0
    };
  }

  // 24. Which & Whereis
  if (cmd === 'which' || cmd === 'whereis') {
    const bin = args[0];
    const known = ['terraform', 'kubectl', 'docker', 'docker-compose', 'k9s', 'aws', 'git', 'bash', 'curl', 'helm', 'date', 'pwd', 'cat', 'ls', 'grep', 'rm', 'touch', 'cp', 'mv'];
    if (known.includes(bin)) {
      return {
        output: `/usr/local/bin/${bin}`,
        exitCode: 0
      };
    }
    return {
      output: `${bin} not found in PATH (/usr/local/bin:/usr/bin:/bin)`,
      exitCode: 1
    };
  }

  // 25. Chmod & Chown
  if (cmd === 'chmod' || cmd === 'chown') {
    return {
      output: '',
      exitCode: 0
    };
  }

  // 26. Tar, Zip, Gzip
  if (cmd === 'tar' || cmd === 'zip' || cmd === 'gzip') {
    return {
      output: `Archive protocol processed for workspace files.`,
      exitCode: 0
    };
  }

  // 27. Git Commands
  if (cmd === 'git') {
    const sub = args[0];
    if (sub === 'status') {
      return {
        output: `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
\tmodified:   main.tf
\tmodified:   variables.tf
\tmodified:   outputs.tf

no changes added to commit (use "git add" and "git commit -m")`,
        exitCode: 0
      };
    }
    if (sub === 'log') {
      return {
        output: `commit 4f9e8a71d2b3c4e5 (HEAD -> main, origin/main)
Author: Madhav Gupta <madhavgupta0594@gmail.com>
Date:   ${new Date().toDateString()}

    feat: hardened AWS EC2 and EBS topology with IMDSv2 defense and $0 LocalStack matrix

commit 1a2b3c4d5e6f7a8b
Author: Madhav Gupta <madhavgupta0594@gmail.com>
Date:   Thu Oct 15 10:15:22 2026

    chore: initialize Zero-Cloud Studio with D3 DAG and Ayushi AI assistant`,
        exitCode: 0
      };
    }
    if (sub === 'branch') {
      return {
        output: '* main',
        exitCode: 0
      };
    }
    if (sub === 'diff') {
      return {
        output: `diff --git a/main.tf b/main.tf
--- a/main.tf
+++ b/main.tf
@@ -35,3 +35,4 @@
+  # IMDSv2 strictly enforced for SSRF defense
+  metadata_options { http_tokens = "required" }`,
        exitCode: 0
      };
    }
    if (sub === 'add' || sub === 'commit' || sub === 'push') {
      return {
        output: `[main 5c8a1e2] Changes codified successfully.\n 3 files changed, 42 insertions(+), 0 deletions(-) (Owner: Madhav Gupta)`,
        exitCode: 0
      };
    }
    return {
      output: `git: '${sub}' is a valid git command. (Working directory is clean)`,
      exitCode: 0
    };
  }

  // 28. AWS CLI Commands
  if (cmd === 'aws') {
    const sub = args[0];
    if (sub === '--version') {
      return {
        output: 'aws-cli/2.15.30 Python/3.11.8 Linux/6.6.0-generic exe/x86_64.ubuntu.22',
        exitCode: 0
      };
    }
    if (raw.includes('sts get-caller-identity')) {
      return {
        output: `{
    "UserId": "AKIAIOSFODNN7EXAMPLE",
    "Account": "000000000000",
    "Arn": "arn:aws:iam::000000000000:root",
    "Owner": "Madhav Gupta",
    "ZeroCost": "LocalStack localhost:4566"
}`,
        exitCode: 0
      };
    }
    if (raw.includes('s3 ls')) {
      return {
        output: `2026-10-16 08:00:00 tfstate-production-bucket\n2026-10-16 08:00:00 app-assets-zero-cost`,
        exitCode: 0
      };
    }
    if (raw.includes('ec2 describe-instances')) {
      return {
        output: JSON.stringify(
          {
            Reservations: [
              {
                Instances: [
                  {
                    InstanceId: ctx.isApplied ? 'i-09f8e4381b0a92d' : '(none - run terraform apply)',
                    InstanceType: 't3.medium',
                    State: { Name: ctx.isApplied ? 'running' : 'terminated' },
                    Tags: [{ Key: 'Owner', Value: 'Madhav Gupta' }],
                    MetadataOptions: { HttpTokens: 'required' }
                  }
                ]
              }
            ]
          },
          null,
          2
        ),
        exitCode: 0
      };
    }
    return {
      output: `AWS CLI connected to LocalStack endpoint http://localhost:4566 ($0.00 cost)`,
      exitCode: 0
    };
  }

  // 29. Azure CLI Commands
  if (cmd === 'az') {
    if (raw.includes('account show')) {
      return {
        output: `{
  "environmentName": "AzureCloud",
  "id": "00000000-0000-0000-0000-000000000000",
  "name": "Zero-Cost Sandbox Subscription",
  "user": { "name": "madhavgupta0594@gmail.com", "type": "user" }
}`,
        exitCode: 0
      };
    }
    if (raw.includes('vm list')) {
      return {
        output: JSON.stringify(
          ctx.isApplied && ctx.scenario.category.includes('azure')
            ? [
                {
                  id: '/subscriptions/00000000/virtualMachines/vm-prod-linux-01',
                  name: 'vm-prod-linux-01',
                  resourceGroup: 'rg-production-eastus',
                  vmSize: 'Standard_B2s',
                  powerState: 'VM running'
                }
              ]
            : [],
          null,
          2
        ),
        exitCode: 0
      };
    }
    return {
      output: `azure-cli 2.58.0 (AzureRM Sandbox Ready)`,
      exitCode: 0
    };
  }

  // 30. Docker & Docker-Compose
  if (cmd === 'docker' || cmd === 'docker-compose') {
    if (raw.includes('ps')) {
      return {
        output: `CONTAINER ID   IMAGE                          COMMAND                  STATUS         PORTS
a1b2c3d4e5f6   localstack/localstack:latest   "docker-entrypoint.sh"   Up 4 hours     0.0.0.0:4566->4566/tcp
f6e5d4c3b2a1   kindest/node:v1.29.2           "/usr/local/bin/entr…"   Up 14 hours    127.0.0.1:32768->6443/tcp`,
        exitCode: 0
      };
    }
    if (raw.includes('images')) {
      return {
        output: `REPOSITORY              TAG       IMAGE ID       CREATED        SIZE
localstack/localstack   latest    7f8a9b0c1d2e   2 weeks ago    840MB
kindest/node            v1.29.2   3a4b5c6d7e8f   3 weeks ago    1.12GB
hashicorp/terraform     1.8.4     9f8e7d6c5b4a   1 month ago    120MB`,
        exitCode: 0
      };
    }
    if (raw.includes('up')) {
      return {
        output: `Creating network "local_zero_cost_default" with the default driver
Creating localstack_zero_cost ... done
Creating kind_control_plane   ... done
LocalStack ready on http://localhost:4566 ($0.00 Expense Guarantee)`,
        exitCode: 0
      };
    }
    return {
      output: `Docker daemon running version 24.0.7 (Client API 1.43)`,
      exitCode: 0
    };
  }

  // 31. Helm Commands
  if (cmd === 'helm') {
    if (raw.includes('list') || raw.includes('ls')) {
      return {
        output: `NAME           \tNAMESPACE     \tREVISION\tUPDATED                                	STATUS  \tCHART             \tAPP VERSION
ingress-nginx  \tingress-nginx \t1       \t2026-10-10 12:00:00.000000000 +0000 UTC\tdeployed\tingress-nginx-4.9.0\t1.9.4
cert-manager   \tcert-manager  \t1       \t2026-10-10 12:05:00.000000000 +0000 UTC\tdeployed\tcert-manager-v1.13.3\tv1.13.3`,
        exitCode: 0
      };
    }
    if (raw.includes('repo list')) {
      return {
        output: `NAME           \tURL
ingress-nginx  \thttps://kubernetes.github.io/ingress-nginx
jetstack       \thttps://charts.jetstack.io
hashicorp      \thttps://helm.releases.hashicorp.com`,
        exitCode: 0
      };
    }
    return {
      output: `version.BuildInfo{Version:"v3.14.2", GitCommit:"c309b6f", GitTreeState:"clean"}`,
      exitCode: 0
    };
  }

  // 32. Kubectl Commands
  if (cmd === 'kubectl') {
    const sub = args[0]?.toLowerCase();
    const sub2 = args[1]?.toLowerCase();

    if (sub === 'get') {
      if (sub2?.startsWith('pod') || sub2?.startsWith('po')) {
        return {
          output: `NAMESPACE          NAME                                 READY   STATUS             RESTARTS   AGE
production-apps    order-api-7b8f99d6d-2kz8w            1/1     Running            0          3d4h
production-apps    payment-processor-59d4c7b89-9xqlm    1/1     Running            1          18h
production-apps    inventory-worker-84d77b47b-cr45h     0/1     CrashLoopBackOff   14         2h15m
production-apps    analytics-aggregator-66bf875d-oomkd  0/1     OOMKilled          6          45m

Tip: Run "k9s" to launch the visual interactive terminal!`,
          exitCode: 0
        };
      }

      if (sub2?.startsWith('node') || sub2?.startsWith('no')) {
        return {
          output: `NAME                         STATUS   ROLES           AGE   VERSION
control-plane-master-01      Ready    control-plane   14d   v1.29.2
worker-pool-node-01          Ready    worker          14d   v1.29.2
worker-pool-node-02          Ready    worker          14d   v1.29.2`,
          exitCode: 0
        };
      }

      if (sub2?.startsWith('svc') || sub2?.startsWith('service')) {
        return {
          output: `NAME               TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)
kubernetes         ClusterIP      10.96.0.1       <none>          443/TCP
order-api-svc      ClusterIP      10.96.42.18     <none>          8080/TCP
payment-svc        ClusterIP      10.96.99.201    <none>          8443/TCP
ingress-nginx-lb   LoadBalancer   10.96.110.5     20.52.14.88     80:30080/TCP,443:30443/TCP`,
          exitCode: 0
        };
      }

      if (sub2?.startsWith('deploy') || sub2?.startsWith('deployment')) {
        return {
          output: `NAME                   READY   UP-TO-DATE   AVAILABLE   AGE
order-api              1/1     1            1           3d4h
payment-processor      1/1     1            1           18h
inventory-worker       0/1     1            0           2h15m
analytics-aggregator   0/1     1            0           45m`,
          exitCode: 0
        };
      }

      if (sub2?.startsWith('ns') || sub2?.startsWith('namespace')) {
        return {
          output: `NAME              STATUS   AGE
default           Active   14d
kube-system       Active   14d
ingress-nginx     Active   14d
production-apps   Active   3d4h`,
          exitCode: 0
        };
      }

      if (sub2?.startsWith('all')) {
        return {
          output: `pod/order-api-7b8f99d6d-2kz8w            1/1     Running            0          3d4h
pod/payment-processor-59d4c7b89-9xqlm    1/1     Running            1          18h
pod/inventory-worker-84d77b47b-cr45h     0/1     CrashLoopBackOff   14         2h15m

service/order-api-svc                    ClusterIP   10.96.42.18   <none>   8080/TCP
service/payment-svc                      ClusterIP   10.96.99.201  <none>   8443/TCP

deployment.apps/order-api                1/1     1            1           3d4h
deployment.apps/payment-processor        1/1     1            1           18h`,
          exitCode: 0
        };
      }
    }

    if (sub === 'describe') {
      const target = args[2] || args[1] || 'inventory-worker';
      return {
        output: `Name:         ${target}
Namespace:    production-apps
Priority:     0
Node:         worker-pool-node-01/192.168.10.11
Start Time:   ${new Date().toUTCString()}
Labels:       app=inventory-worker, environment=production
Status:       Running
IP:           10.244.1.99
Containers:
  worker:
    Container ID:  containerd://8f4a123bc45d6e7f
    Image:         registry.enterprise.io/apps/inventory:v3.0.1
    State:         Waiting (CrashLoopBackOff)
    Last State:    Terminated (Exit Code 1)
Events:
  Type     Reason   Age                From     Message
  ----     ------   ----               ----     -------
  Warning  BackOff  2m (x14 over 2h)   kubelet  Back-off restarting failed container inventory-worker`,
        exitCode: 0
      };
    }

    if (sub === 'logs') {
      const target = args[1] || 'inventory-worker';
      return {
        output: `[2026-10-16T14:40:01.120Z] [INFO] Starting inventory-worker service v3.0.1...
[2026-10-16T14:40:02.450Z] [INFO] Connecting to RabbitMQ amqp://guest:guest@rabbitmq:5672...
[2026-10-16T14:40:05.890Z] [ERROR] Unhandled Exception: Database connection refused (db-cluster.internal:5432).
[2026-10-16T14:40:05.892Z] [FATAL] Process exiting with exit code 1.`,
        exitCode: 0
      };
    }

    if (sub === 'cluster-info') {
      return {
        output: `Kubernetes control plane is running at https://127.0.0.1:6443
CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
LocalStack emulation link: http://localhost:4566 ($0.00 Expense)`,
        exitCode: 0
      };
    }

    if (sub === 'version') {
      return {
        output: `Client Version: v1.29.2
Kustomize Version: v5.0.4-0.20230601165947-6ce0bd390ce3
Server Version: v1.29.2 (kindest/node:v1.29.2)`,
        exitCode: 0
      };
    }

    if (sub === 'delete') {
      const target = args[2] || args[1] || 'pod';
      return {
        output: `pod "${target}" deleted (re-scheduling container replica)`,
        exitCode: 0
      };
    }

    return {
      output: `kubectl: '${args.join(' ')}' executed successfully against kind-cluster.`,
      exitCode: 0
    };
  }

  // 33. Terraform Commands
  if (cmd === 'terraform') {
    const sub = args[0]?.toLowerCase();

    // terraform init
    if (sub === 'init') {
      const isAws = ctx.scenario.category === 'vm-aws' || ctx.scenario.category === 'kubernetes-aws';
      const isAzure = ctx.scenario.category === 'vm-azure' || ctx.scenario.category === 'kubernetes-azure';

      return {
        output: `Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.42.0 (signed by HashiCorp)...
- Finding hashicorp/azurerm versions matching "~> 3.90"...
- Installing hashicorp/azurerm v3.95.0 (signed by HashiCorp)...
- Finding hashicorp/kubernetes versions matching "~> 2.25"...
- Installing hashicorp/kubernetes v2.26.0 (signed by HashiCorp)...

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure.

[AYUSHI A.I.]: "Providers primed for ${isAws ? 'LocalStack AWS' : isAzure ? 'AzureRM Sandbox' : 'Zero-Cost Simulation'}, Sir. Next directive: Step 2 (terraform plan)."`,
        exitCode: 0,
        newStepIndex: Math.max(ctx.currentStepIndex, 1)
      };
    }

    // terraform plan
    if (sub === 'plan') {
      if (ctx.activeDrift) {
        return {
          output: ctx.activeDrift.planOutput,
          exitCode: 2,
          newStepIndex: Math.max(ctx.currentStepIndex, 2)
        };
      }

      if (ctx.isApplied) {
        return {
          output: `No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration
and found no differences, so no changes are needed.

[AYUSHI A.I.]: "State is in 100% equilibrium with codified HCL2 specifications, Sir."`,
          exitCode: 0,
          newStepIndex: Math.max(ctx.currentStepIndex, 2)
        };
      }

      let planDetails = '';
      if (ctx.scenario.id === 'azure-vm-linux-production') {
        planDetails = `Terraform will perform the following actions:

  # azurerm_resource_group.rg will be created
  + resource "azurerm_resource_group" "rg" {
      + id       = (known after apply)
      + location = "eastus"
      + name     = "rg-production-eastus"
    }

  # azurerm_linux_virtual_machine.main_vm will be created
  + resource "azurerm_linux_virtual_machine" "main_vm" {
      + admin_username        = "azureuser"
      + disable_password_auth = true
      + id                    = (known after apply)
      + name                  = "vm-prod-linux-01"
      + size                  = "Standard_B2s"
    }

  # azurerm_managed_disk.data_disk will be created
  + resource "azurerm_managed_disk" "data_disk" {
      + create_option        = "Empty"
      + disk_size_gb         = 64
      + id                   = (known after apply)
      + storage_account_type = "Premium_LRS"
    }

Plan: 3 to add, 0 to change, 0 to destroy.`;
      } else if (ctx.scenario.id === 'aws-eks-production-cluster') {
        planDetails = `Terraform will perform the following actions:

  # aws_eks_cluster.main will be created
  + resource "aws_eks_cluster" "main" {
      + arn      = (known after apply)
      + endpoint = (known after apply)
      + id       = (known after apply)
      + name     = "production-k8s-us-east-1"
      + version  = "1.29"
    }

  # aws_eks_node_group.workers will be created
  + resource "aws_eks_node_group" "workers" {
      + id             = (known after apply)
      + instance_types = ["t3.xlarge"]
      + scaling_config {
          + desired_size = 3
          + max_size     = 6
          + min_size     = 1
        }
    }

Plan: 4 to add, 0 to change, 0 to destroy.`;
      } else {
        planDetails = `Terraform will perform the following actions:

  # aws_security_group.web_sg will be created
  + resource "aws_security_group" "web_sg" {
      + arn    = (known after apply)
      + id     = (known after apply)
      + name   = "production-web-sg"
      + vpc_id = "vpc-0a1b2c3d4e5f6g7h8"
    }

  # aws_instance.web_vm will be created
  + resource "aws_instance" "web_vm" {
      + ami           = "ami-0c55b159cbfafe1f0"
      + arn           = (known after apply)
      + id            = (known after apply)
      + instance_type = "t3.medium"
      + metadata_options {
          + http_endpoint = "enabled"
          + http_tokens   = "required" # IMDSv2 Enforced
        }
      + tags          = { "Owner" = "Madhav Gupta", "Environment" = "production" }
    }

  # aws_ebs_volume.data_disk will be created
  + resource "aws_ebs_volume" "data_disk" {
      + encrypted = true
      + id        = (known after apply)
      + size      = 50
      + type      = "gp3"
    }

Plan: 3 to add, 0 to change, 0 to destroy.`;
      }

      return {
        output: `${planDetails}

─────────────────────────────────────────────────────────────────────────────
Note: You didn't use the -out option to save this plan.
[AYUSHI A.I.]: "Plan generated, Sir. Ready for Step 3: terraform apply."`,
        exitCode: 0,
        newStepIndex: Math.max(ctx.currentStepIndex, 2)
      };
    }

    // terraform apply
    if (sub === 'apply') {
      if (ctx.activeDrift) {
        const resolvedTitle = ctx.activeDrift.title;
        const targetRes = ctx.activeDrift.targetResource;

        return {
          output: `[RECONCILING OUT-OF-BAND DRIFT: "${resolvedTitle}"]
${targetRes}: Modifying...
${targetRes}: Stripping out-of-band console changes and enforcing codified HCL configuration...
${targetRes}: Modifications complete after 2s

Apply complete! Resources: 0 added, 1 changed, 0 destroyed.

[SUCCESS] Out-of-band cloud drift has been reconciled. Infrastructure matches codified Terraform state baseline (Owner: Madhav Gupta).
[AYUSHI A.I.]: "Compliance restored, Sir. Security perimeter is 100% verified."`,
          exitCode: 0,
          newIsApplied: true,
          newDrift: null,
          newStepIndex: Math.max(ctx.currentStepIndex, 3)
        };
      }

      let newResources: any[] = [];
      let newOutputs: any = {};
      let applyLogOutput = '';

      if (ctx.scenario.id === 'azure-vm-linux-production') {
        newResources = [
          {
            mode: 'managed',
            type: 'azurerm_resource_group',
            name: 'rg',
            provider: 'provider["registry.terraform.io/hashicorp/azurerm"]',
            instances: [{ schema_version: 0, attributes: { id: '/subscriptions/00000000/resourceGroups/rg-prod', name: 'rg-production-eastus', location: 'eastus' } }]
          },
          {
            mode: 'managed',
            type: 'azurerm_linux_virtual_machine',
            name: 'main_vm',
            provider: 'provider["registry.terraform.io/hashicorp/azurerm"]',
            instances: [{ schema_version: 0, attributes: { id: '/subscriptions/00000000/virtualMachines/vm-prod-linux-01', name: 'vm-prod-linux-01', size: 'Standard_B2s', private_ip: '10.0.1.4', public_ip: '20.52.14.88', owner: 'Madhav Gupta' } }]
          },
          {
            mode: 'managed',
            type: 'azurerm_managed_disk',
            name: 'data_disk',
            provider: 'provider["registry.terraform.io/hashicorp/azurerm"]',
            instances: [{ schema_version: 0, attributes: { id: '/subscriptions/00000000/disks/disk-prod-data', disk_size_gb: 64, storage_account_type: 'Premium_LRS' } }]
          }
        ];
        newOutputs = {
          vm_id: { value: '/subscriptions/00000000/virtualMachines/vm-prod-linux-01', type: 'string' },
          public_ip_address: { value: '20.52.14.88', type: 'string' },
          admin_username: { value: 'azureuser', type: 'string' },
          owner: { value: 'Madhav Gupta', type: 'string' }
        };
        applyLogOutput = `azurerm_resource_group.rg: Creating...
azurerm_resource_group.rg: Creation complete after 1s
azurerm_managed_disk.data_disk: Creating...
azurerm_managed_disk.data_disk: Creation complete after 2s [id=/subscriptions/00000000/disks/disk-prod-data]
azurerm_linux_virtual_machine.main_vm: Creating...
azurerm_linux_virtual_machine.main_vm: Creation complete after 6s [id=/subscriptions/00000000/virtualMachines/vm-prod-linux-01]

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:
admin_username = "azureuser"
public_ip_address = "20.52.14.88"
vm_id = "/subscriptions/00000000/virtualMachines/vm-prod-linux-01"
owner = "Madhav Gupta"
cost = "$0.00 (Zero-Cost Sandbox Emulation)"`;
      } else if (ctx.scenario.id === 'aws-eks-production-cluster') {
        newResources = [
          {
            mode: 'managed',
            type: 'aws_eks_cluster',
            name: 'main',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [{ schema_version: 0, attributes: { id: 'production-k8s-us-east-1', arn: 'arn:aws:eks:us-east-1:123456789012:cluster/production-k8s-us-east-1', endpoint: 'https://A1B2C3D4E5.gr7.us-east-1.eks.amazonaws.com', version: '1.29' } }]
          },
          {
            mode: 'managed',
            type: 'aws_eks_node_group',
            name: 'workers',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [{ schema_version: 0, attributes: { id: 'eks-workers-node-group', instance_types: ['t3.xlarge'], desired_size: 3, owner: 'Madhav Gupta' } }]
          }
        ];
        newOutputs = {
          cluster_name: { value: 'production-k8s-us-east-1', type: 'string' },
          cluster_endpoint: { value: 'https://A1B2C3D4E5.gr7.us-east-1.eks.amazonaws.com', type: 'string' },
          kubeconfig_command: { value: 'aws eks update-kubeconfig --name production-k8s-us-east-1 --region us-east-1', type: 'string' },
          owner: { value: 'Madhav Gupta', type: 'string' }
        };
        applyLogOutput = `aws_eks_cluster.main: Creating...
aws_eks_cluster.main: Creation complete after 8s [id=production-k8s-us-east-1]
aws_eks_node_group.workers: Creating...
aws_eks_node_group.workers: Creation complete after 5s [id=eks-workers-node-group]

Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:
cluster_name = "production-k8s-us-east-1"
cluster_endpoint = "https://A1B2C3D4E5.gr7.us-east-1.eks.amazonaws.com"
kubeconfig_command = "aws eks update-kubeconfig --name production-k8s-us-east-1 --region us-east-1"
owner = "Madhav Gupta"
cost = "$0.00 (Zero-Cost LocalStack/Kind Emulation)"`;
      } else {
        newResources = [
          {
            mode: 'managed',
            type: 'aws_security_group',
            name: 'web_sg',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [{ schema_version: 1, attributes: { id: 'sg-0a1b2c3d4e5f6g7h8', name: 'production-web-sg', vpc_id: 'vpc-0a1b2c3d4e5f6g7h8' } }]
          },
          {
            mode: 'managed',
            type: 'aws_instance',
            name: 'web_vm',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [{ schema_version: 1, attributes: { id: 'i-09f8e4381b0a92d', instance_type: 't3.medium', private_ip: '10.0.1.42', owner: 'Madhav Gupta', imds_tokens: 'required' } }]
          },
          {
            mode: 'managed',
            type: 'aws_ebs_volume',
            name: 'data_disk',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [{ schema_version: 0, attributes: { id: 'vol-0a1b2c3d4e5f6g7h8', size: 50, encrypted: true } }]
          },
          {
            mode: 'managed',
            type: 'aws_volume_attachment',
            name: 'ebs_att',
            provider: 'provider["registry.terraform.io/hashicorp/aws"]',
            instances: [{ schema_version: 0, attributes: { id: 'vai-3829104', instance_id: 'i-09f8e4381b0a92d', volume_id: 'vol-0a1b2c3d4e5f6g7h8' } }]
          }
        ];
        newOutputs = {
          instance_id: { value: 'i-09f8e4381b0a92d', type: 'string' },
          data_volume_id: { value: 'vol-0a1b2c3d4e5f6g7h8', type: 'string' },
          imds_token_policy: { value: 'required', type: 'string' },
          owner: { value: 'Madhav Gupta', type: 'string' }
        };
        applyLogOutput = `aws_security_group.web_sg: Creating...
aws_security_group.web_sg: Creation complete after 1s [id=sg-0a1b2c3d4e5f6g7h8]
aws_ebs_volume.data_disk: Creating...
aws_ebs_volume.data_disk: Creation complete after 2s [id=vol-0a1b2c3d4e5f6g7h8]
aws_instance.web_vm: Creating...
aws_instance.web_vm: Still creating... [4s elapsed]
aws_instance.web_vm: Creation complete after 5s [id=i-09f8e4381b0a92d]
aws_volume_attachment.ebs_att: Creating...
aws_volume_attachment.ebs_att: Creation complete after 1s [id=vai-3829104]

Apply complete! Resources: 4 added, 0 changed, 0 destroyed.

Outputs:
data_volume_id = "vol-0a1b2c3d4e5f6g7h8"
imds_token_policy = "required"
instance_id = "i-09f8e4381b0a92d"
owner = "Madhav Gupta"
cost = "$0.00 (Zero-Cost LocalStack Emulation)"`;
      }

      const updatedState: TerraformState = {
        ...ctx.state,
        serial: ctx.state.serial + 1,
        resources: newResources,
        outputs: newOutputs
      };

      return {
        output: `${applyLogOutput}

[AYUSHI A.I.]: "Deployment protocol verified, Sir. Next directive: Open D3 Resource DAG to inspect topology."`,
        exitCode: 0,
        newIsApplied: true,
        newState: updatedState,
        newStepIndex: Math.max(ctx.currentStepIndex, 3)
      };
    }

    // terraform destroy
    if (sub === 'destroy') {
      const clearedState: TerraformState = {
        ...ctx.state,
        serial: ctx.state.serial + 1,
        resources: [],
        outputs: {}
      };
      return {
        output: `Destroying all managed resources...
aws_volume_attachment.ebs_att: Destruction complete after 1s
aws_instance.web_vm: Destruction complete after 2s
aws_ebs_volume.data_disk: Destruction complete after 1s
aws_security_group.web_sg: Destruction complete after 1s

Destroy complete! Resources: 4 destroyed.
[AYUSHI A.I.]: "All virtual infrastructure decommissioned. State is clean, Sir."`,
        exitCode: 0,
        newIsApplied: false,
        newState: clearedState,
        newStepIndex: 0
      };
    }

    // terraform state list
    if (sub === 'state' && args[1] === 'list') {
      const resList = ctx.state.resources.map((r) => `${r.type}.${r.name}`).join('\n');
      return {
        output:
          ctx.state.resources.length > 0
            ? resList
            : 'No resources found in state file.\n(Hint: Run "terraform apply" to provision infrastructure first)',
        exitCode: 0
      };
    }

    // terraform state show
    if (sub === 'state' && args[1] === 'show') {
      const targetAddr = args[2];
      const matched = ctx.state.resources.find(
        (r) => !targetAddr || `${r.type}.${r.name}` === targetAddr || r.name === targetAddr
      );
      if (matched) {
        const hclOutput = `# ${matched.type}.${matched.name}:
resource "${matched.type}" "${matched.name}" {
${Object.entries(matched.instances[0]?.attributes || {})
  .map(([k, v]) => `    ${k} = ${JSON.stringify(v)}`)
  .join('\n')}
}`;
        return {
          output: hclOutput,
          exitCode: 0
        };
      }
      return {
        output: `No instance(s) found for resource "${targetAddr || 'unknown'}".\nRun "terraform state list" to view active resources.`,
        exitCode: 1
      };
    }

    // terraform validate
    if (sub === 'validate') {
      return {
        output: `Success! The configuration is valid.
0 syntax or reference errors found across ${ctx.files.length} workspace files.`,
        exitCode: 0
      };
    }

    // terraform fmt
    if (sub === 'fmt') {
      return {
        output: `${ctx.files.map((f) => f.name).join('\n')}\nAll files canonically styled according to HashiCorp HCL2 guidelines.`,
        exitCode: 0
      };
    }

    // terraform output
    if (sub === 'output') {
      const outputEntries = Object.entries(ctx.state.outputs);
      const outText =
        outputEntries.length > 0
          ? outputEntries.map(([k, v]) => `${k} = ${JSON.stringify(v.value)}`).join('\n')
          : 'No outputs found in current state file.';
      return {
        output: outText,
        exitCode: 0
      };
    }

    // terraform version
    if (sub === 'version' || sub === '-v' || sub === '--version') {
      return {
        output: `Terraform v1.8.4
on linux_amd64
+ provider registry.terraform.io/hashicorp/aws v5.42.0
+ provider registry.terraform.io/hashicorp/azurerm v3.95.0
+ provider registry.terraform.io/hashicorp/kubernetes v2.26.0`,
        exitCode: 0
      };
    }

    // terraform graph
    if (sub === 'graph') {
      return {
        output: `digraph G {
  compound = "true"
  newrank = "true"
  subgraph "root" {
    "[root] aws_instance.web_vm (expand)" [label = "aws_instance.web_vm", shape = "box"]
    "[root] aws_security_group.web_sg (expand)" [label = "aws_security_group.web_sg", shape = "box"]
    "[root] aws_ebs_volume.data_disk (expand)" [label = "aws_ebs_volume.data_disk", shape = "box"]
    "[root] aws_volume_attachment.ebs_att (expand)" [label = "aws_volume_attachment.ebs_att", shape = "box"]
    "[root] aws_instance.web_vm (expand)" -> "[root] aws_security_group.web_sg (expand)"
    "[root] aws_volume_attachment.ebs_att (expand)" -> "[root] aws_instance.web_vm (expand)"
    "[root] aws_volume_attachment.ebs_att (expand)" -> "[root] aws_ebs_volume.data_disk (expand)"
  }
}
[AYUSHI A.I.]: "DOT graph compiled, Sir. Switching to holographic D3 DAG."`,
        exitCode: 0,
        newStudioView: 'd3-graph'
      };
    }

    return {
      output: `Terraform CLI processed "${args.join(' ')}". (Type "terraform -help" for subcommands)`,
      exitCode: 0
    };
  }

  // Authentic bash fallback for unrecognized command
  return {
    output: `bash: ${cmd}: command not found

(Tip: Type "help" to see all available Terraform, Kubectl, Linux, and Cloud commands, or ask Ayushi A.I.)`,
    exitCode: 127
  };
}
