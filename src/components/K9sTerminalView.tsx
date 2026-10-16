import React, { useState } from 'react';
import {
  INITIAL_K8S_PODS,
  INITIAL_K8S_DEPLOYMENTS,
  INITIAL_K8S_SERVICES,
  INITIAL_K8S_NODES
} from '../data/k8sData';
import { K8sPod, K8sDeployment, K8sService, K8sNode } from '../types/terraform';
import {
  Terminal,
  RotateCcw,
  FileText,
  Trash2,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Box,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

interface K9sTerminalViewProps {
  onClose?: () => void;
  onAskAI?: (prompt: string) => void;
}

export const K9sTerminalView: React.FC<K9sTerminalViewProps> = ({
  onClose,
  onAskAI
}) => {
  const [activeResource, setActiveResource] = useState<'pods' | 'deployments' | 'services' | 'nodes'>('pods');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [pods, setPods] = useState<K8sPod[]>(INITIAL_K8S_PODS);
  const [selectedPod, setSelectedPod] = useState<K8sPod | null>(INITIAL_K8S_PODS[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [viewingLogsFor, setViewingLogsFor] = useState<K8sPod | null>(null);
  const [viewingDescribeFor, setViewingDescribeFor] = useState<K8sPod | null>(null);
  const [copiedLog, setCopiedLog] = useState(false);

  // Filter pods
  const filteredPods = pods.filter(p => {
    const nsMatch = selectedNamespace === 'all' || p.namespace === selectedNamespace;
    const searchMatch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        p.status.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        p.node.toLowerCase().includes(searchFilter.toLowerCase());
    return nsMatch && searchMatch;
  });

  const filteredDeployments = INITIAL_K8S_DEPLOYMENTS.filter(d => {
    const nsMatch = selectedNamespace === 'all' || d.namespace === selectedNamespace;
    return nsMatch && d.name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const filteredServices = INITIAL_K8S_SERVICES.filter(s => {
    const nsMatch = selectedNamespace === 'all' || s.namespace === selectedNamespace;
    return nsMatch && s.name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const handleRestartPod = (podName: string) => {
    setPods(prev =>
      prev.map(p => {
        if (p.name === podName) {
          return {
            ...p,
            status: 'Running',
            ready: '1/1',
            restarts: p.restarts + 1,
            logs: [
              ...p.logs,
              `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] SIGTERM received, restarting pod container...`,
              `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] Container started successfully. Health checks: OK (1/1)`
            ]
          };
        }
        return p;
      })
    );
  };

  const getStatusColor = (status: K8sPod['status']) => {
    switch (status) {
      case 'Running':
        return 'text-emerald-400';
      case 'CrashLoopBackOff':
        return 'text-rose-400 font-bold animate-pulse';
      case 'OOMKilled':
        return 'text-amber-400 font-bold';
      case 'Pending':
        return 'text-sky-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05080f] text-slate-100 font-mono text-xs select-text overflow-hidden">
      {/* K9s Header / Top Status Bar */}
      <div className="bg-[#0c121e] border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>K9s (v0.32.4)</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Context:</span>
            <span className="text-emerald-400 font-bold">kind-localstack-cluster</span>
            <span>·</span>
            <span>Cluster:</span>
            <span className="text-sky-300">k8s-v1.29.2 ($0 Cloud)</span>
            <span>·</span>
            <span>User:</span>
            <span className="text-amber-300 font-semibold">Madhav Gupta (Admin)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAskAI && (
            <button
              onClick={() => onAskAI('How do I troubleshoot Kubernetes pods in CrashLoopBackOff and OOMKilled in production with k9s?')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800 text-[11px] font-sans font-semibold cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Ask AI K8s Help</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
              title="Close K9s"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* K9s Command & Shortcut Ribbon */}
      <div className="bg-[#090e17] border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-300 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold select-none">&lt;View&gt;</span>
          {[
            { id: 'pods', label: ':pod Pods', count: filteredPods.length },
            { id: 'deployments', label: ':deploy Deployments', count: filteredDeployments.length },
            { id: 'services', label: ':svc Services', count: filteredServices.length },
            { id: 'nodes', label: ':node Nodes', count: INITIAL_K8S_NODES.length }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setActiveResource(r.id as any)}
              className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-colors ${
                activeResource === r.id
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
            >
              {r.label} ({r.count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-500 font-bold select-none">&lt;Namespace&gt;</span>
          {['all', 'production-apps', 'ingress-nginx', 'kube-system'].map(ns => (
            <button
              key={ns}
              onClick={() => setSelectedNamespace(ns)}
              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                selectedNamespace === ns
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ns}
            </button>
          ))}
        </div>
      </div>

      {/* Filter / Search input */}
      <div className="bg-[#070b12] border-b border-slate-800/60 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 w-full max-w-md">
          <span className="text-cyan-400 select-none">&gt;</span>
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Type to filter resources (e.g. order, CrashLoop, node-01)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs"
          />
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-3 shrink-0">
          <span><kbd className="text-cyan-300">l</kbd> View Logs</span>
          <span><kbd className="text-cyan-300">d</kbd> Describe</span>
          <span><kbd className="text-amber-300">r</kbd> Restart</span>
        </div>
      </div>

      {/* Main Table View */}
      <div className="flex-1 overflow-auto p-2">
        {activeResource === 'pods' && (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-[#0d1424] text-[11px] uppercase">
                <th className="py-2 px-3">Namespace</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Ready</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Restarts</th>
                <th className="py-2 px-3">CPU</th>
                <th className="py-2 px-3">Mem</th>
                <th className="py-2 px-3">IP</th>
                <th className="py-2 px-3">Node</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredPods.map(pod => {
                const isSelected = selectedPod?.name === pod.name;
                return (
                  <tr
                    key={pod.name}
                    onClick={() => setSelectedPod(pod)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/30' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-400">{pod.namespace}</td>
                    <td className="py-2 px-3 font-bold text-slate-100 flex items-center gap-1.5">
                      {pod.status === 'Running' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      )}
                      <span>{pod.name}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{pod.ready}</td>
                    <td className={`py-2 px-3 ${getStatusColor(pod.status)}`}>
                      {pod.status}
                    </td>
                    <td className="py-2 px-3 text-slate-300 tabular-nums">{pod.restarts}</td>
                    <td className="py-2 px-3 text-slate-400 tabular-nums">{pod.cpu}</td>
                    <td className="py-2 px-3 text-slate-400 tabular-nums">{pod.mem}</td>
                    <td className="py-2 px-3 text-slate-400">{pod.ip}</td>
                    <td className="py-2 px-3 text-slate-400">{pod.node}</td>
                    <td className="py-2 px-3 text-right space-x-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingLogsFor(pod);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] cursor-pointer"
                        title="View Pod Logs (l)"
                      >
                        Logs
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDescribeFor(pod);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                        title="Describe Pod (d)"
                      >
                        Describe
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestartPod(pod.name);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950 text-rose-300 text-[10px] cursor-pointer"
                        title="Restart Pod"
                      >
                        Restart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeResource === 'deployments' && (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-[#0d1424] text-[11px] uppercase">
                <th className="py-2 px-3">Namespace</th>
                <th className="py-2 px-3">Deployment</th>
                <th className="py-2 px-3">Ready</th>
                <th className="py-2 px-3">Up-to-Date</th>
                <th className="py-2 px-3">Available</th>
                <th className="py-2 px-3">Age</th>
                <th className="py-2 px-3">Containers</th>
                <th className="py-2 px-3">Images</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredDeployments.map(dep => (
                <tr key={dep.name} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-400">{dep.namespace}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">{dep.name}</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">{dep.ready}</td>
                  <td className="py-2 px-3 text-slate-300">{dep.upToDate}</td>
                  <td className="py-2 px-3 text-slate-300">{dep.available}</td>
                  <td className="py-2 px-3 text-slate-400">{dep.age}</td>
                  <td className="py-2 px-3 text-slate-300">{dep.containers.join(', ')}</td>
                  <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-xs">{dep.images.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeResource === 'services' && (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-[#0d1424] text-[11px] uppercase">
                <th className="py-2 px-3">Namespace</th>
                <th className="py-2 px-3">Service Name</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Cluster-IP</th>
                <th className="py-2 px-3">External-IP</th>
                <th className="py-2 px-3">Ports</th>
                <th className="py-2 px-3">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredServices.map(svc => (
                <tr key={svc.name} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-400">{svc.namespace}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">{svc.name}</td>
                  <td className="py-2 px-3 text-amber-400">{svc.type}</td>
                  <td className="py-2 px-3 text-slate-300">{svc.clusterIp}</td>
                  <td className="py-2 px-3 text-slate-300">{svc.externalIp}</td>
                  <td className="py-2 px-3 text-slate-400">{svc.ports}</td>
                  <td className="py-2 px-3 text-slate-400">{svc.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeResource === 'nodes' && (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 bg-[#0d1424] text-[11px] uppercase">
                <th className="py-2 px-3">Node Name</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Roles</th>
                <th className="py-2 px-3">Version</th>
                <th className="py-2 px-3">CPU%</th>
                <th className="py-2 px-3">Mem%</th>
                <th className="py-2 px-3">Internal-IP</th>
                <th className="py-2 px-3">OS / Environment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {INITIAL_K8S_NODES.map(node => (
                <tr key={node.name} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">{node.name}</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">{node.status}</td>
                  <td className="py-2 px-3 text-cyan-400">{node.roles}</td>
                  <td className="py-2 px-3 text-slate-300">{node.version}</td>
                  <td className="py-2 px-3 text-slate-300">{node.cpuPercent}</td>
                  <td className="py-2 px-3 text-slate-300">{node.memPercent}</td>
                  <td className="py-2 px-3 text-slate-400">{node.internalIp}</td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">{node.osImage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log Modal */}
      {viewingLogsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-[#080d17] border border-cyan-800/80 rounded-xl shadow-2xl max-w-4xl w-full h-[70vh] flex flex-col overflow-hidden text-slate-200">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">Logs:</span>
                <span className="text-white font-bold">{viewingLogsFor.name}</span>
                <span className="text-slate-500">({viewingLogsFor.namespace})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingLogsFor.logs.join('\n'));
                    setCopiedLog(true);
                    setTimeout(() => setCopiedLog(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer flex items-center gap-1"
                >
                  {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLog ? 'Copied' : 'Copy Logs'}</span>
                </button>
                <button
                  onClick={() => setViewingLogsFor(null)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-1.5 font-mono text-xs leading-relaxed bg-[#05080f]">
              {viewingLogsFor.logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('FATAL') || log.includes('Panic') || log.includes('error')
                      ? 'text-rose-400 font-semibold'
                      : log.includes('WARN')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Describe Modal */}
      {viewingDescribeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-[#080d17] border border-cyan-800/80 rounded-xl shadow-2xl max-w-4xl w-full h-[70vh] flex flex-col overflow-hidden text-slate-200">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">Describe Pod:</span>
                <span className="text-white font-bold">{viewingDescribeFor.name}</span>
              </div>
              <button
                onClick={() => setViewingDescribeFor(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#05080f]">
{`Name:         ${viewingDescribeFor.name}
Namespace:    ${viewingDescribeFor.namespace}
Priority:     0
Node:         ${viewingDescribeFor.node}/${viewingDescribeFor.ip}
Start Time:   Fri, 16 Oct 2026 18:00:00 GMT
Labels:       app=${viewingDescribeFor.name.split('-')[0]}
              curated_by=madhav_gupta
              cloud=zero_cost_simulation
Status:       ${viewingDescribeFor.status}
IP:           ${viewingDescribeFor.ip}
Containers:
  app-container:
    Container ID:   containerd://e984fa89b21
    Image:          registry.enterprise.io/apps/${viewingDescribeFor.name.split('-')[0]}:v1.0.0
    Port:           8080/TCP
    Host Port:      0/TCP
    State:          ${viewingDescribeFor.status}
    Ready:          ${viewingDescribeFor.ready}
    Restart Count:  ${viewingDescribeFor.restarts}
    Limits:
      cpu:     ${viewingDescribeFor.cpu}
      memory:  ${viewingDescribeFor.mem}
Events:
  Type     Reason     Age                   From               Message
  ----     ------     ----                  ----               -------
  Normal   Scheduled  ${viewingDescribeFor.age}                  default-scheduler  Successfully assigned ${viewingDescribeFor.namespace}/${viewingDescribeFor.name} to ${viewingDescribeFor.node}
  Normal   Pulled     ${viewingDescribeFor.age}                  kubelet            Container image pulled successfully
  ${viewingDescribeFor.status === 'CrashLoopBackOff' ? 'Warning  BackOff    5m (x14 over 2h)      kubelet            Back-off restarting failed container' : 'Normal   Started    10m                   kubelet            Started container app-container'}
`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
