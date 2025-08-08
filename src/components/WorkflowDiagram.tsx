import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Components
const WorkflowContainerNode = ({ data }: { data: any }) => (
  <div className="workflow-container-inner" style={{ 
    width: data.width, 
    height: data.height, 
    border: '2px solid hsl(var(--primary))', 
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--background))',
    padding: '8px'
  }}>
    <div className="workflow-header" style={{ fontSize: '12px', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>
      {data.label}
    </div>
  </div>
);

const ContainerNode = ({ data }: { data: any }) => (
  <div className="workflow-container" style={{ width: data.width, height: data.height, padding: '16px' }}>
    <div className="workflow-header">{data.label}</div>
  </div>
);

const WorkflowNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    <div className={`workflow-node ${data.status || ''}`}>
      {data.label}
    </div>
    <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
  </>
);

const ActionNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    <div className="workflow-action">
      {data.icon && <span>{data.icon}</span>}
      {data.label}
    </div>
    <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
  </>
);

const TextNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
    <div className="workflow-action-text">
      {data.label}
    </div>
    <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
  </>
);

const StepNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    <div className="workflow-step-node">
      {data.icon && <span style={{ marginRight: '4px' }}>{data.icon}</span>}
      {data.label}
    </div>
    <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
  </>
);

const nodeTypes: NodeTypes = {
  container: ContainerNode,
  workflowContainer: WorkflowContainerNode,
  workflow: WorkflowNode,
  action: ActionNode,
  text: TextNode,
  step: StepNode,
};

// Data structures for backend integration
interface SubNode {
  id: string;
  label: string;
}

interface EventNode {
  id: string;
  label: string;
  status: string;
}

interface StatusNode {
  id: string;
  label: string;
  icon: string;
}

interface ApplicationNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  subNodes: SubNode[];
  events: EventNode[];
  statusNodes: StatusNode[];
  descriptiveTexts?: { id: string; label: string }[];
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  style?: 'action' | 'default';
}

interface WorkflowData {
  applications: ApplicationNode[];
  connections: WorkflowConnection[];
}

const WorkflowDiagram = () => {
  // Container configuration
  const containerWidth = 350;
  const containerHeight = 200;
  const workflowContainerWidth = 300;
  const workflowContainerHeight = 100;
  
  // Layout configuration to match Figma design
  const layoutConfig = {
    subNodeY: 70,
    workflowContainerY: 90,  // Position of workflow container
    statusNodeY: 20,         // Relative to workflow container
    eventNodeY: 50,          // Relative to workflow container
    subNodeStartX: 20,
    descriptiveTextX: 120,
    workflowContainerX: 25,  // Position of workflow container
    eventNodeStartX: 15,     // Relative to workflow container
    eventNodeSpacing: 120,   // Reduced spacing for smaller container
    statusNodeOffsetX: 60,   // Offset to center status nodes between events
  };

  // TODO: Replace with actual backend API call
  const fetchWorkflowData = async (): Promise<WorkflowData> => {
    // Placeholder for backend integration
    // return await api.get('/workflow-data');
    
    // Demo data - hardcoded for now
    return {
      applications: [
        {
          id: 'lsa',
          label: 'LSA',
          position: { x: 50, y: 50 },
          subNodes: [
            { id: 'commitment', label: 'Commitment' }
          ],
          descriptiveTexts: [
            { id: 'accept-desc', label: 'Seller accepts commitment details' }
          ],
          statusNodes: [
            { id: 'create', label: 'Create', icon: '1' },
            { id: 'accept', label: 'Accept', icon: '✓' }
          ],
          events: [
            { id: 'created', label: 'created', status: 'created' },
            { id: 'accepted', label: 'accepted', status: 'accepted' }
          ]
        },
        {
          id: 'cwpmf',
          label: 'CW/PMF',
          position: { x: 450, y: 50 },
          subNodes: [
            { id: 'hypo-loan', label: 'Hypo Loan F' }
          ],
          statusNodes: [
            { id: 'stage', label: 'Stage', icon: '3' }
          ],
          events: []
        },
        {
          id: 'cwflume',
          label: 'CW/FLUME',
          position: { x: 250, y: 300 },
          subNodes: [
            { id: 'commitment', label: 'Commitment' }
          ],
          descriptiveTexts: [
            { id: 'accept-desc', label: 'Seller accepts commitment details' }
          ],
          statusNodes: [
            { id: 'accept', label: 'Accept', icon: '✓' },
            { id: 'stage', label: 'Stage', icon: '3' }
          ],
          events: [
            { id: 'accepted', label: 'accepted', status: 'accepted' },
            { id: 'staged', label: 'staged', status: 'staged' }
          ]
        }
      ],
      connections: [
        { id: 'lsa-create-to-created', source: 'lsa-create', target: 'lsa-created' },
        { id: 'lsa-created-to-accept', source: 'lsa-created', target: 'lsa-accept' },
        { id: 'lsa-accept-to-accepted', source: 'lsa-accept', target: 'lsa-accepted', style: 'action' },
        { id: 'cwflume-accept-to-accepted', source: 'cwflume-accept', target: 'cwflume-accepted', style: 'action' },
        { id: 'cwflume-accepted-to-stage', source: 'cwflume-accepted', target: 'cwflume-stage' },
        { id: 'cwflume-stage-to-staged', source: 'cwflume-stage', target: 'cwflume-staged' }
      ]
    };
  };

  // Generate ReactFlow nodes from workflow data
  const generateNodes = (workflowData: WorkflowData): Node[] => {
    const nodes: Node[] = [];

    workflowData.applications.forEach((app) => {
      // Create application container
      nodes.push({
        id: `${app.id}-container`,
        type: 'container',
        position: app.position,
        data: { 
          label: app.label,
          width: containerWidth,
          height: containerHeight
        },
        style: { 
          width: containerWidth, 
          height: containerHeight,
          zIndex: 0
        },
        selectable: false,
        draggable: false,
      });

      // Create sub nodes
      app.subNodes.forEach((subNode, index) => {
        nodes.push({
          id: `${app.id}-${subNode.id}`,
          type: 'text',
          position: { 
            x: layoutConfig.subNodeStartX + (index * 100), 
            y: layoutConfig.subNodeY 
          },
          data: { label: subNode.label },
          parentId: `${app.id}-container`,
          extent: 'parent',
        });
      });

      // Create descriptive texts
      app.descriptiveTexts?.forEach((text, index) => {
        nodes.push({
          id: `${app.id}-${text.id}`,
          type: 'text',
          position: { 
            x: layoutConfig.descriptiveTextX + (index * 100), 
            y: layoutConfig.subNodeY 
          },
          data: { label: text.label },
          parentId: `${app.id}-container`,
          extent: 'parent',
        });
      });

      // Create workflow container only if app has events or status nodes
      if (app.events.length > 0 || app.statusNodes.length > 0) {
        nodes.push({
          id: `${app.id}-workflow-container`,
          type: 'workflowContainer',
          position: { 
            x: layoutConfig.workflowContainerX, 
            y: layoutConfig.workflowContainerY 
          },
          data: { 
            label: 'Workflow',
            width: workflowContainerWidth,
            height: workflowContainerHeight
          },
          style: { 
            width: workflowContainerWidth, 
            height: workflowContainerHeight,
            zIndex: 1
          },
          parentId: `${app.id}-container`,
          extent: 'parent',
          selectable: false,
          draggable: false,
        });
      }

      // Create status nodes - positioned inside workflow container
      app.statusNodes.forEach((statusNode, index) => {
        const nodeType = statusNode.label.toLowerCase() === 'create' ? 'step' : 'action';
        const xPosition = layoutConfig.eventNodeStartX + layoutConfig.statusNodeOffsetX + (index * layoutConfig.eventNodeSpacing);
        
        nodes.push({
          id: `${app.id}-${statusNode.id}`,
          type: nodeType,
          position: { 
            x: xPosition, 
            y: layoutConfig.statusNodeY 
          },
          data: { label: statusNode.label, icon: statusNode.icon },
          parentId: `${app.id}-workflow-container`,
          extent: 'parent',
        });
      });

      // Create event nodes - positioned inside workflow container
      app.events.forEach((event, index) => {
        nodes.push({
          id: `${app.id}-${event.id}`,
          type: 'workflow',
          position: { 
            x: layoutConfig.eventNodeStartX + (index * layoutConfig.eventNodeSpacing), 
            y: layoutConfig.eventNodeY 
          },
          data: { label: event.label, status: event.status },
          parentId: `${app.id}-workflow-container`,
          extent: 'parent',
        });
      });
    });

    return nodes;
  };

  // Generate ReactFlow edges from workflow data
  const generateEdges = (workflowData: WorkflowData): Edge[] => {
    return workflowData.connections.map(connection => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      style: { 
        stroke: connection.style === 'action' 
          ? 'hsl(var(--workflow-action))' 
          : 'hsl(var(--border))', 
        strokeWidth: 2 
      },
      animated: false,
    }));
  };

  // Demo data - in real app this would come from fetchWorkflowData()
  const workflowData: WorkflowData = useMemo(() => ({
    applications: [
      {
        id: 'lsa',
        label: 'LSA',
        position: { x: 50, y: 50 },
        subNodes: [
          { id: 'commitment', label: 'Commitment' }
        ],
        descriptiveTexts: [
          { id: 'accept-desc', label: 'Seller accepts commitment details' }
        ],
        statusNodes: [
          { id: 'create', label: 'Create', icon: '1' },
          { id: 'accept', label: 'Accept', icon: '✓' }
        ],
        events: [
          { id: 'created', label: 'created', status: 'created' },
          { id: 'accepted', label: 'accepted', status: 'accepted' }
        ]
      },
      {
        id: 'cwpmf',
        label: 'CW/PMF',
        position: { x: 450, y: 50 },
        subNodes: [
          { id: 'hypo-loan', label: 'Hypo Loan F' }
        ],
        statusNodes: [
          { id: 'stage', label: 'Stage', icon: '3' }
        ],
        events: []
      },
      {
        id: 'cwflume',
        label: 'CW/FLUME',
        position: { x: 250, y: 300 },
        subNodes: [
          { id: 'commitment', label: 'Commitment' }
        ],
        descriptiveTexts: [
          { id: 'accept-desc', label: 'Seller accepts commitment details' }
        ],
        statusNodes: [
          { id: 'accept', label: 'Accept', icon: '✓' },
          { id: 'stage', label: 'Stage', icon: '3' }
        ],
        events: [
          { id: 'accepted', label: 'accepted', status: 'accepted' },
          { id: 'staged', label: 'staged', status: 'staged' }
        ]
      }
    ],
    connections: [
      // LSA workflow: status -> event -> status -> event
      { id: 'lsa-create-to-created', source: 'lsa-create', target: 'lsa-created' },
      { id: 'lsa-created-to-accept', source: 'lsa-created', target: 'lsa-accept' },
      { id: 'lsa-accept-to-accepted', source: 'lsa-accept', target: 'lsa-accepted', style: 'action' },
      
      // Cross-application connection: LSA created event -> CW/FLUME accept status
      { id: 'lsa-created-to-cwflume-accept', source: 'lsa-created', target: 'cwflume-accept', style: 'action' },
      
      // CW/FLUME workflow: status -> event -> status -> event
      { id: 'cwflume-accept-to-accepted', source: 'cwflume-accept', target: 'cwflume-accepted', style: 'action' },
      { id: 'cwflume-accepted-to-stage', source: 'cwflume-accepted', target: 'cwflume-stage' },
      { id: 'cwflume-stage-to-staged', source: 'cwflume-stage', target: 'cwflume-staged' }
    ]
  }), []);

  const initialNodes: Node[] = useMemo(() => generateNodes(workflowData), [workflowData]);
  const initialEdges: Edge[] = useMemo(() => generateEdges(workflowData), [workflowData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 50 }}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="hsl(var(--border))" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default WorkflowDiagram;