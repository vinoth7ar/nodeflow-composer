import React, { useCallback, useMemo } from 'react';
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
  workflow: WorkflowNode,
  action: ActionNode,
  text: TextNode,
  step: StepNode,
};

const WorkflowDiagram = () => {
  // Calculate dynamic positions to avoid overlaps
  const containerWidth = 350;
  const containerHeight = 200;
  const nodeSpacing = 120;
  const verticalSpacing = 80;

  const initialNodes: Node[] = useMemo(() => [
    // LSA Container
    {
      id: 'lsa-container',
      type: 'container',
      position: { x: 50, y: 50 },
      data: { 
        label: 'LSA',
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
    },

    // LSA Workflow nodes
    {
      id: 'lsa-commitment-label',
      type: 'text',
      position: { x: 20, y: 80 },
      data: { label: 'Commitment' },
      parentId: 'lsa-container',
      extent: 'parent',
    },
    {
      id: 'lsa-create-step',
      type: 'step',
      position: { x: 30, y: 105 },
      data: { label: 'Create', icon: '1' },
      parentId: 'lsa-container',
      extent: 'parent',
    },
    {
      id: 'lsa-created',
      type: 'workflow',
      position: { x: 25, y: 140 },
      data: { label: 'created', status: 'created' },
      parentId: 'lsa-container',
      extent: 'parent',
    },
    {
      id: 'lsa-accept',
      type: 'action',
      position: { x: 140, y: 105 },
      data: { label: 'Accept', icon: '✓' },
      parentId: 'lsa-container',
      extent: 'parent',
    },
    {
      id: 'lsa-accept-text',
      type: 'text',
      position: { x: 120, y: 130 },
      data: { label: 'Seller accepts commitment details' },
      parentId: 'lsa-container',
      extent: 'parent',
    },
    {
      id: 'lsa-accepted',
      type: 'workflow',
      position: { x: 255, y: 140 },
      data: { label: 'accepted', status: 'accepted' },
      parentId: 'lsa-container',
      extent: 'parent',
    },

    // CW/PMF Container
    {
      id: 'cwpmf-container',
      type: 'container',
      position: { x: 450, y: 50 },
      data: { 
        label: 'CW/PMF',
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
    },

    // CW/PMF content
    {
      id: 'cwpmf-hypo-label',
      type: 'text',
      position: { x: 20, y: 80 },
      data: { label: 'Hypo Loan F' },
      parentId: 'cwpmf-container',
      extent: 'parent',
    },
    {
      id: 'cwpmf-stage-step',
      type: 'step',
      position: { x: 30, y: 105 },
      data: { label: 'Stage', icon: '3' },
      parentId: 'cwpmf-container',
      extent: 'parent',
    },

    // CW/FLUME Container
    {
      id: 'cwflume-container',
      type: 'container',
      position: { x: 250, y: 300 },
      data: { 
        label: 'CW/FLUME',
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
    },

    // CW/FLUME Workflow nodes
    {
      id: 'cwflume-commitment-label',
      type: 'text',
      position: { x: 20, y: 80 },
      data: { label: 'Commitment' },
      parentId: 'cwflume-container',
      extent: 'parent',
    },
    {
      id: 'cwflume-accept',
      type: 'action',
      position: { x: 30, y: 105 },
      data: { label: 'Accept', icon: '✓' },
      parentId: 'cwflume-container',
      extent: 'parent',
    },
    {
      id: 'cwflume-accept-text',
      type: 'text',
      position: { x: 20, y: 130 },
      data: { label: 'Seller accepts commitment details' },
      parentId: 'cwflume-container',
      extent: 'parent',
    },
    {
      id: 'cwflume-accepted',
      type: 'workflow',
      position: { x: 25, y: 160 },
      data: { label: 'accepted', status: 'accepted' },
      parentId: 'cwflume-container',
      extent: 'parent',
    },
    {
      id: 'cwflume-stage-step',
      type: 'step',
      position: { x: 200, y: 105 },
      data: { label: 'Stage', icon: '3' },
      parentId: 'cwflume-container',
      extent: 'parent',
    },
    {
      id: 'cwflume-staged',
      type: 'workflow',
      position: { x: 200, y: 140 },
      data: { label: 'staged', status: 'staged' },
      parentId: 'cwflume-container',
      extent: 'parent',
    },
  ], []);

  const initialEdges: Edge[] = useMemo(() => [
    // LSA workflow connections
    {
      id: 'lsa-create-to-created',
      source: 'lsa-create-step',
      target: 'lsa-created',
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      animated: false,
    },
    {
      id: 'lsa-created-to-accept',
      source: 'lsa-created',
      target: 'lsa-accept',
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      animated: false,
    },
    {
      id: 'lsa-accept-to-accepted',
      source: 'lsa-accept',
      target: 'lsa-accepted',
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--workflow-action))', strokeWidth: 2 },
      animated: false,
    },

    // CW/FLUME workflow connections
    {
      id: 'cwflume-accept-to-accepted',
      source: 'cwflume-accept',
      target: 'cwflume-accepted',
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--workflow-action))', strokeWidth: 2 },
      animated: false,
    },
    {
      id: 'cwflume-accepted-to-stage',
      source: 'cwflume-accepted',
      target: 'cwflume-stage-step',
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      animated: false,
    },
    {
      id: 'cwflume-stage-to-staged',
      source: 'cwflume-stage-step',
      target: 'cwflume-staged',
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      animated: false,
    },
  ], []);

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