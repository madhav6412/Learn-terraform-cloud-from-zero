import { TerraformState, TerraformFile, LabScenario } from '../types/terraform';

export interface GraphNode {
  id: string; // e.g. "aws_instance.web_vm"
  name: string; // e.g. "web_vm"
  type: string; // e.g. "aws_instance"
  provider: 'aws' | 'azure' | 'kubernetes' | 'local';
  providerRaw: string;
  status: 'created' | 'planned' | 'modified';
  attributes: Record<string, any>;
  dependencies: string[]; // array of node IDs this node depends on
  dependents: string[]; // array of node IDs that depend on this node
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string; // e.g. "references", "attaches_to", "vpc_security_group", "network_interface"
}

export interface DependencyGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Detect provider category from resource type or provider string
 */
export function getProviderCategory(type: string, providerStr?: string): 'aws' | 'azure' | 'kubernetes' | 'local' {
  if (type.startsWith('aws_') || (providerStr && providerStr.includes('aws'))) return 'aws';
  if (type.startsWith('azurerm_') || (providerStr && providerStr.includes('azurerm'))) return 'azure';
  if (type.startsWith('kubernetes_') || (providerStr && providerStr.includes('kubernetes'))) return 'kubernetes';
  return 'local';
}

/**
 * Infer resource dependencies and build graph nodes and links from state and scenario files
 */
export function buildDependencyGraph(
  state: TerraformState,
  scenario: LabScenario,
  files: TerraformFile[]
): DependencyGraphData {
  const nodeMap = new Map<string, GraphNode>();
  const linkSet = new Set<string>();
  const links: GraphLink[] = [];

  // 1. Gather all resources defined in HCL files
  const fileResourceNames = new Set<string>();

  files.forEach((file) => {
    const content = file.content;
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
    let match;

    while ((match = resourceRegex.exec(content)) !== null) {
      const type = match[1];
      const name = match[2];
      const blockBody = match[3];
      const id = `${type}.${name}`;
      fileResourceNames.add(id);

      const provider = getProviderCategory(type);
      const providerRaw = `provider["registry.terraform.io/hashicorp/${provider === 'local' ? 'local' : provider}"]`;

      // Check if resource is already in state
      const stateResource = state.resources.find((r) => r.type === type && r.name === name);
      const isCreated = !!stateResource;
      const attributes = stateResource?.instances[0]?.attributes || {
        managed_by: 'Terraform Zero-Cloud Lab',
        owner: 'Madhav Gupta',
        environment: 'production',
        status: isCreated ? 'created' : 'planned',
        cost: '$0.00 (Zero-Cost Emulation)'
      };

      nodeMap.set(id, {
        id,
        name,
        type,
        provider,
        providerRaw,
        status: isCreated ? 'created' : 'planned',
        attributes,
        dependencies: [],
        dependents: []
      });
    }
  });

  // 2. Add any additional resources that exist in state but might not be in the current active file
  state.resources.forEach((sr) => {
    const id = `${sr.type}.${sr.name}`;
    if (!nodeMap.has(id)) {
      const provider = getProviderCategory(sr.type, sr.provider);
      nodeMap.set(id, {
        id,
        name: sr.name,
        type: sr.type,
        provider,
        providerRaw: sr.provider,
        status: 'created',
        attributes: sr.instances[0]?.attributes || {},
        dependencies: sr.instances[0]?.dependencies || [],
        dependents: []
      });
    } else {
      // Mark as created
      const existing = nodeMap.get(id)!;
      existing.status = 'created';
      if (sr.instances[0]?.attributes) {
        existing.attributes = { ...existing.attributes, ...sr.instances[0].attributes };
      }
    }
  });

  // 3. Infer relationship links between resources:
  // We scan the HCL text of each resource block for references to other resources
  const allKnownIds = Array.from(nodeMap.keys());

  files.forEach((file) => {
    const content = file.content;
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([\s\S]*?)\n\}/g;
    let match;

    while ((match = resourceRegex.exec(content)) !== null) {
      const sourceId = `${match[1]}.${match[2]}`;
      const blockBody = match[3];

      // For every other known resource, check if source references target
      allKnownIds.forEach((targetId) => {
        if (sourceId === targetId) return;

        // Check if targetId is referenced in source blockBody (e.g. "aws_security_group.web_sg.id")
        const targetEscaped = targetId.replace('.', '\\.');
        const refPattern = new RegExp(`\\b${targetEscaped}(\\b|\\.[a-zA-Z0-9_]+)`, 'g');

        if (refPattern.test(blockBody)) {
          const linkKey = `${sourceId}->${targetId}`;
          if (!linkSet.has(linkKey)) {
            linkSet.add(linkKey);

            // Infer relation name
            let relation = 'references';
            if (sourceId.includes('attachment') || targetId.includes('volume') || targetId.includes('disk')) {
              relation = 'attaches_to';
            } else if (targetId.includes('security_group') || targetId.includes('nsg')) {
              relation = 'secures';
            } else if (targetId.includes('subnet') || targetId.includes('vnet') || targetId.includes('vpc')) {
              relation = 'networked_in';
            } else if (sourceId.includes('node_group') || sourceId.includes('node_pool')) {
              relation = 'part_of_cluster';
            }

            links.push({
              source: sourceId,
              target: targetId,
              relation
            });

            // Update dependency arrays
            const sourceNode = nodeMap.get(sourceId);
            const targetNode = nodeMap.get(targetId);
            if (sourceNode && !sourceNode.dependencies.includes(targetId)) {
              sourceNode.dependencies.push(targetId);
            }
            if (targetNode && !targetNode.dependents.includes(sourceId)) {
              targetNode.dependents.push(sourceId);
            }
          }
        }
      });
    }
  });

  // 4. Also check explicit dependencies declared in state
  state.resources.forEach((sr) => {
    const sourceId = `${sr.type}.${sr.name}`;
    const explicitDeps = sr.instances[0]?.dependencies || [];

    explicitDeps.forEach((dep) => {
      // dep can be "aws_security_group.web_sg" or full address
      allKnownIds.forEach((targetId) => {
        if (targetId === sourceId) return;
        if (dep.includes(targetId) || targetId.includes(dep)) {
          const linkKey = `${sourceId}->${targetId}`;
          if (!linkSet.has(linkKey)) {
            linkSet.add(linkKey);
            links.push({
              source: sourceId,
              target: targetId,
              relation: 'state_dependency'
            });

            const sourceNode = nodeMap.get(sourceId);
            const targetNode = nodeMap.get(targetId);
            if (sourceNode && !sourceNode.dependencies.includes(targetId)) {
              sourceNode.dependencies.push(targetId);
            }
            if (targetNode && !targetNode.dependents.includes(sourceId)) {
              targetNode.dependents.push(sourceId);
            }
          }
        }
      });
    });
  });

  // Fallback: If no links exist (e.g. standalone scenario with implicit logical hierarchy), infer sensible hierarchy
  if (links.length === 0 && nodeMap.size > 1) {
    const nodes = Array.from(nodeMap.values());
    const compute = nodes.find((n) => n.type.includes('instance') || n.type.includes('cluster') || n.type.includes('virtual_machine'));
    if (compute) {
      nodes.forEach((n) => {
        if (n.id !== compute.id) {
          links.push({
            source: compute.id,
            target: n.id,
            relation: 'depends_on'
          });
          compute.dependencies.push(n.id);
          n.dependents.push(compute.id);
        }
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links
  };
}
