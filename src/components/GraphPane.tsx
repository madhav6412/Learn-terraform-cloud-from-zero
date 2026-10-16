import React, { useState } from 'react';
import { ResourceNode, TerraformState } from '../types/terraform';
import { Box, Layers, ArrowDownRight, CheckCircle, Clock, ExternalLink } from 'lucide-react';

interface GraphPaneProps {
  nodes: ResourceNode[];
  state: TerraformState;
}

export const GraphPane: React.FC<GraphPaneProps> = ({ nodes, state }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const isApplied = state.resources.length > 0;

  return (
    <div className="flex h-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Visual DAG Nodes View */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">
            Resource Dependency Graph (DAG)
          </h3>
          <p className="text-xs text-slate-400">
            Interactive visualization of execution ordering, module boundaries, and dependency relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const nodeStatus = isApplied ? 'created' : 'planned';

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-slate-800 text-sky-400">
                      {node.type === 'module' ? <Layers className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-100 font-mono block">
                        {node.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        provider: {node.provider}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    {nodeStatus === 'created' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Planned</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Dependencies list */}
                {node.dependencies && node.dependencies.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-1 flex-wrap">
                    <span className="text-slate-500">depends on:</span>
                    {node.dependencies.map((dep) => (
                      <span key={dep} className="text-sky-300">
                        {dep}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Inspector Panel */}
      <div className="w-80 border-l border-slate-800 bg-slate-900/50 p-4 overflow-y-auto shrink-0 font-mono text-xs">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Node Inspector
        </div>

        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <span className="text-slate-500 text-[11px] block">Resource Address:</span>
              <span className="text-sky-400 font-semibold break-all">{selectedNode.id}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Resource Type:</span>
              <span className="text-slate-200">{selectedNode.type}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Provider Domain:</span>
              <span className="text-slate-200">{selectedNode.provider}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Cloud Spend:</span>
              <span className="text-emerald-400 font-medium">$0.00 (Zero-Cloud Mock)</span>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-slate-500 text-[11px] block mb-1">State Attributes:</span>
              <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedNode.attributes, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-xs">Select a node from the graph to inspect.</p>
        )}
      </div>
    </div>
  );
};
