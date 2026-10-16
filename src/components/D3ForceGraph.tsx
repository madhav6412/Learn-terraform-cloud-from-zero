import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TerraformState, TerraformFile, LabScenario } from '../types/terraform';
import { buildDependencyGraph, GraphNode, GraphLink } from '../utils/dependencyExtractor';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Shield,
  Layers,
  Sparkles,
  Search,
  Filter,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  Server,
  Cloud,
  Box,
  Cpu
} from 'lucide-react';

interface D3ForceGraphProps {
  state: TerraformState;
  scenario: LabScenario;
  files: TerraformFile[];
  activeDriftResourceId?: string;
  onOpenDrift?: () => void;
  onSelectNode?: (nodeId: string) => void;
  onAskAI?: (prompt: string) => void;
}

// Provider color styling
const PROVIDER_COLORS: Record<string, { fill: string; stroke: string; halo: string; label: string; text: string }> = {
  aws: {
    fill: '#ea580c',
    stroke: '#f97316',
    halo: 'rgba(249, 115, 22, 0.25)',
    label: 'AWS',
    text: '#fdba74'
  },
  azure: {
    fill: '#0284c7',
    stroke: '#38bdf8',
    halo: 'rgba(56, 189, 248, 0.25)',
    label: 'Azure',
    text: '#7dd3fc'
  },
  kubernetes: {
    fill: '#4338ca',
    stroke: '#6366f1',
    halo: 'rgba(99, 102, 241, 0.25)',
    label: 'Kubernetes',
    text: '#a5b4fc'
  },
  local: {
    fill: '#059669',
    stroke: '#10b981',
    halo: 'rgba(16, 185, 129, 0.25)',
    label: 'Local/Null',
    text: '#6ee7b7'
  }
};

export const D3ForceGraph: React.FC<D3ForceGraphProps> = ({
  state,
  scenario,
  files,
  activeDriftResourceId,
  onOpenDrift,
  onSelectNode,
  onAskAI
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'created' | 'planned'>('all');
  const [showRelations, setShowRelations] = useState(true);

  // Extract graph data
  const rawData = useMemo(() => {
    return buildDependencyGraph(state, scenario, files);
  }, [state, scenario, files]);

  // Filtered graph data
  const graphData = useMemo(() => {
    let nodes = rawData.nodes;
    if (statusFilter !== 'all') {
      nodes = nodes.filter((n) => n.status === statusFilter);
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      nodes = nodes.filter((n) => n.id.toLowerCase().includes(q) || n.type.toLowerCase().includes(q));
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    // Filter links where both source and target exist in filtered nodes
    const links = rawData.links.filter((l) => {
      const s = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return nodeIds.has(s) && nodeIds.has(t);
    });

    return { nodes, links };
  }, [rawData, statusFilter, filterQuery]);

  // Keep selected node in sync
  useEffect(() => {
    if (selectedNode) {
      const current = graphData.nodes.find((n) => n.id === selectedNode.id);
      if (current) setSelectedNode(current);
    } else if (graphData.nodes.length > 0) {
      setSelectedNode(graphData.nodes[0]);
    }
  }, [graphData]);

  // D3 Rendering & Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // Definitions for markers and filters
    const defs = svg.append('defs');

    // Arrowhead marker for directed dependency edges
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28) // Offset away from node center
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#64748b');

    defs
      .append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#38bdf8');

    // Main graph container group
    const g = svg.append('g').attr('class', 'graph-container');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial centering
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 4, height / 6).scale(0.95));

    // Deep copy nodes and links for simulation
    const simNodes: (GraphNode & d3.SimulationNodeDatum)[] = graphData.nodes.map((d) => ({ ...d }));
    const simLinks: (d3.SimulationLinkDatum<any> & { relation: string })[] = graphData.links.map((d) => ({
      source: typeof d.source === 'object' ? (d.source as GraphNode).id : d.source,
      target: typeof d.target === 'object' ? (d.target as GraphNode).id : d.target,
      relation: d.relation
    }));

    // Setup force simulation
    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        'link',
        d3
          .forceLink(simLinks)
          .id((d: any) => d.id)
          .distance(140)
          .strength(0.7)
      )
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(width / 2.5, height / 2.2))
      .force('collision', d3.forceCollide().radius(50));

    // Render Links (edges)
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup
      .selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', (d: any) => (d.relation === 'depends_on' ? '4,4' : 'none'))
      .attr('marker-end', 'url(#arrow)');

    // Optional link relation labels
    let linkLabel: any = null;
    if (showRelations) {
      const linkLabelGroup = g.append('g').attr('class', 'link-labels');
      linkLabel = linkLabelGroup
        .selectAll('text')
        .data(simLinks)
        .enter()
        .append('text')
        .attr('class', 'text-[9px] fill-slate-500 font-mono select-none pointer-events-none')
        .attr('text-anchor', 'middle')
        .text((d: any) => d.relation);
    }

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup
      .selectAll('.node')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node cursor-pointer')
      .call(
        d3
          .drag<any, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Outer Glow / Halo
    node
      .append('circle')
      .attr('r', 26)
      .attr('fill', (d) => {
        const prov = PROVIDER_COLORS[d.provider] || PROVIDER_COLORS.local;
        return prov.halo;
      })
      .attr('stroke', (d) => {
        if (activeDriftResourceId && d.id === activeDriftResourceId) return '#f43f5e';
        const prov = PROVIDER_COLORS[d.provider] || PROVIDER_COLORS.local;
        return prov.stroke;
      })
      .attr('stroke-width', (d) => (d.id === activeDriftResourceId ? 3 : d.status === 'created' ? 2 : 1.2))
      .attr('stroke-dasharray', (d) => (d.status === 'created' ? 'none' : '4,3'));

    // Additional outer pulsing ring if drifted
    if (activeDriftResourceId) {
      node
        .filter((d) => d.id === activeDriftResourceId)
        .append('circle')
        .attr('r', 33)
        .attr('fill', 'none')
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,3');
    }

    // Node Inner Center Circle
    node
      .append('circle')
      .attr('r', 18)
      .attr('fill', '#0f172a')
      .attr('stroke', (d) => {
        const prov = PROVIDER_COLORS[d.provider] || PROVIDER_COLORS.local;
        return prov.stroke;
      })
      .attr('stroke-width', 2);

    // Node Provider Icon / Monogram
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('class', 'text-[10px] font-bold font-mono select-none pointer-events-none')
      .attr('fill', (d) => {
        const prov = PROVIDER_COLORS[d.provider] || PROVIDER_COLORS.local;
        return prov.text;
      })
      .text((d) => {
        if (d.provider === 'aws') return 'AWS';
        if (d.provider === 'azure') return 'AZ';
        if (d.provider === 'kubernetes') return 'K8S';
        return 'TF';
      });

    // Node Label (Resource Name)
    node
      .append('text')
      .attr('y', 36)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[11px] font-semibold fill-slate-200 select-none pointer-events-none font-mono')
      .text((d) => d.name);

    // Node Sub-label (Resource Type)
    node
      .append('text')
      .attr('y', 48)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[9.5px] fill-slate-500 select-none pointer-events-none font-mono')
      .text((d) => (d.type.length > 20 ? `${d.type.slice(0, 18)}...` : d.type));

    // Status indicator dot
    node
      .append('circle')
      .attr('cx', 14)
      .attr('cy', -14)
      .attr('r', 4.5)
      .attr('fill', (d) => (d.status === 'created' ? '#10b981' : '#f59e0b'))
      .attr('stroke', '#090e18')
      .attr('stroke-width', 1.5);

    // Interactive Hover & Click
    node
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);

        // Highlight connected links and nodes
        const connectedIds = new Set<string>([d.id, ...d.dependencies, ...d.dependents]);

        link
          .attr('stroke', (l: any) => {
            const isConnected = l.source.id === d.id || l.target.id === d.id;
            return isConnected ? '#38bdf8' : '#1e293b';
          })
          .attr('stroke-width', (l: any) => (l.source.id === d.id || l.target.id === d.id ? 2.5 : 1))
          .attr('marker-end', (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? 'url(#arrow-active)' : 'url(#arrow)'
          );

        node.attr('opacity', (n: any) => (connectedIds.has(n.id) ? 1 : 0.35));
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        link
          .attr('stroke', '#334155')
          .attr('stroke-width', 1.8)
          .attr('marker-end', 'url(#arrow)');
        node.attr('opacity', 1);
      })
      .on('click', (event, d) => {
        setSelectedNode(d);
        if (onSelectNode) onSelectNode(d.id);
      });

    // Simulation tick update
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      if (linkLabel) {
        linkLabel
          .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
          .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4);
      }

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, showRelations]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.translate(width / 4, height / 6).scale(0.95)
      );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b12] text-slate-200 select-none overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="h-10 px-4 bg-[#0a0f18] border-b border-slate-800 flex items-center justify-between shrink-0 z-10 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-xs text-white">Terraform Resource Dependency DAG</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/30 rounded font-mono">
            D3 Force Simulation
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            ({graphData.nodes.length} nodes · {graphData.links.length} dependencies inferred)
          </span>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5 text-[11px]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 rounded transition-colors ${
                statusFilter === 'all' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({rawData.nodes.length})
            </button>
            <button
              onClick={() => setStatusFilter('created')}
              className={`px-2 py-0.5 rounded transition-colors ${
                statusFilter === 'created' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Created ({rawData.nodes.filter((n) => n.status === 'created').length})
            </button>
            <button
              onClick={() => setStatusFilter('planned')}
              className={`px-2 py-0.5 rounded transition-colors ${
                statusFilter === 'planned' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Planned ({rawData.nodes.filter((n) => n.status === 'planned').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter node..."
              className="w-28 sm:w-36 bg-slate-900 border border-slate-800 rounded-md pl-6 pr-2 py-1 text-[11px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Toggle relations */}
          <button
            onClick={() => setShowRelations(!showRelations)}
            title="Toggle relationship labels"
            className={`px-2 py-1 border rounded text-[11px] font-mono transition-colors ${
              showRelations
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            Labels
          </button>

          {/* Zoom buttons */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset View"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas + Right Inspector Split */}
      <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
        {/* SVG Canvas */}
        <div className="flex-1 h-full w-full relative">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing bg-radial from-slate-900/30 to-[#070b12]"
          />

          {/* Bottom Left Legend */}
          <div className="absolute bottom-3 left-3 bg-[#0a0f18]/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] space-y-1.5 z-10 font-mono">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px]">Provider Legend</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                <span className="text-slate-400">AWS</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                <span className="text-slate-400">Azure</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                <span className="text-slate-400">Kubernetes</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-400">Created (In State)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-400">Planned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Resource Inspector Drawer/Card */}
        {selectedNode && (
          <aside className="w-72 md:w-80 border-l border-slate-800 bg-[#090e17] flex flex-col shrink-0 z-20 shadow-2xl overflow-y-auto">
            {/* Inspector Header */}
            <div className="p-3.5 bg-[#0d1422] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      PROVIDER_COLORS[selectedNode.provider]?.stroke || PROVIDER_COLORS.local.stroke
                  }}
                />
                <span className="text-xs font-bold text-white font-mono truncate max-w-[180px]">
                  {selectedNode.name}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                  selectedNode.status === 'created'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            {/* Inspector Body */}
            <div className="p-4 space-y-4 text-xs select-text">
              {/* Type and Provider */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Resource Address</div>
                <div className="font-mono text-xs text-sky-300 bg-slate-950 p-2 rounded border border-slate-800 break-all">
                  {selectedNode.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-[9.5px] text-slate-500 uppercase">Provider</div>
                  <div className="text-slate-200 font-bold uppercase">{selectedNode.provider}</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-[9.5px] text-slate-500 uppercase">Type</div>
                  <div className="text-slate-200 font-bold truncate">{selectedNode.type}</div>
                </div>
              </div>

              {/* Drift Warning Banner if this resource has active drift */}
              {activeDriftResourceId && selectedNode.id === activeDriftResourceId && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/60 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>Out-of-Band Drift Detected!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Live cloud configuration diverges from the Terraform state baseline.
                  </p>
                  {onOpenDrift && (
                    <button
                      onClick={onOpenDrift}
                      className="text-[11px] font-semibold text-rose-200 underline hover:text-white cursor-pointer pt-0.5 inline-block"
                    >
                      Inspect Drift & "terraform plan" Diff →
                    </button>
                  )}
                </div>
              )}

              {/* Dependencies (Upstream) */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                  <span>Upstream Dependencies</span>
                  <span className="text-slate-400">({selectedNode.dependencies.length})</span>
                </div>
                {selectedNode.dependencies.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic p-2 bg-slate-950/40 rounded border border-slate-800/60">
                    No upstream dependencies (Root Node)
                  </div>
                ) : (
                  <div className="space-y-1 font-mono text-[11px]">
                    {selectedNode.dependencies.map((dep) => (
                      <div
                        key={dep}
                        onClick={() => {
                          const n = graphData.nodes.find((item) => item.id === dep);
                          if (n) setSelectedNode(n);
                        }}
                        className="p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded border border-slate-800 text-sky-300 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="truncate">{dep}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependents (Downstream) */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                  <span>Downstream Dependents</span>
                  <span className="text-slate-400">({selectedNode.dependents.length})</span>
                </div>
                {selectedNode.dependents.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic p-2 bg-slate-950/40 rounded border border-slate-800/60">
                    No downstream resources depend on this
                  </div>
                ) : (
                  <div className="space-y-1 font-mono text-[11px]">
                    {selectedNode.dependents.map((dep) => (
                      <div
                        key={dep}
                        onClick={() => {
                          const n = graphData.nodes.find((item) => item.id === dep);
                          if (n) setSelectedNode(n);
                        }}
                        className="p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded border border-slate-800 text-amber-300 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="truncate">{dep}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attributes in State */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  State Attributes ({selectedNode.status === 'created' ? 'Real in State' : 'Planned'})
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[10.5px] max-h-48 overflow-y-auto space-y-1">
                  {Object.entries(selectedNode.attributes).map(([key, val]) => (
                    <div key={key} className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 shrink-0">{key}:</span>
                      <span className="text-emerald-300 font-semibold truncate text-right">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ask AI about this resource */}
              {onAskAI && (
                <button
                  onClick={() =>
                    onAskAI(
                      `Explain the dependency relationship and security requirements of ${selectedNode.id} in this architecture.`
                    )
                  }
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ask AI about {selectedNode.name}</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
