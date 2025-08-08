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

// Unified Node Components
const WorkflowContainerNode = ({ data }: { data: any }) => (
  <div className="workflow-container-inner" style={{ 
    width: data.width, 
    height: data.height, 
    border: '2px solid hsl(var(--primary))', 
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--background))',
    padding: '8px'
  }}>
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
  
  // Dynamic positioning configuration
  const gridConfig = {
    cols: 4,              // 4 columns per row
    containerSpacingX: 400, // Horizontal spacing between containers
    containerSpacingY: 250, // Vertical spacing between rows
    startX: 50,           // Starting X position
    startY: 50,           // Starting Y position
  };
  
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

  // Dynamic position calculation function
  const calculatePosition = (index: number) => {
    const row = Math.floor(index / gridConfig.cols);
    const col = index % gridConfig.cols;
    
    return {
      x: gridConfig.startX + (col * gridConfig.containerSpacingX),
      y: gridConfig.startY + (row * gridConfig.containerSpacingY)
    };
  };

  // TODO: Replace with actual backend API call
  const fetchWorkflowData = async (): Promise<WorkflowData> => {
    // Placeholder for backend integration
    // return await api.get('/workflow-data');
    
    // Demo data - 8 applications representing complete loan workflow
    // Note: No hardcoded positions - they will be calculated dynamically
    return {
      applications: [
        {
          id: 'lsa',
          label: 'LSA',
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
          id: 'los',
          label: 'LOS',
          subNodes: [
            { id: 'application', label: 'Application' }
          ],
          descriptiveTexts: [
            { id: 'submit-desc', label: 'Borrower submits loan application' }
          ],
          statusNodes: [
            { id: 'submit', label: 'Submit', icon: '2' },
            { id: 'validate', label: 'Validate', icon: '✓' }
          ],
          events: [
            { id: 'submitted', label: 'submitted', status: 'submitted' },
            { id: 'validated', label: 'validated', status: 'validated' }
          ]
        },
        {
          id: 'credit',
          label: 'Credit Bureau',
          subNodes: [
            { id: 'credit-check', label: 'Credit Check' }
          ],
          descriptiveTexts: [
            { id: 'pull-desc', label: 'Pull credit report and score' }
          ],
          statusNodes: [
            { id: 'pull', label: 'Pull', icon: '3' },
            { id: 'analyze', label: 'Analyze', icon: '✓' }
          ],
          events: [
            { id: 'pulled', label: 'pulled', status: 'pulled' },
            { id: 'analyzed', label: 'analyzed', status: 'analyzed' }
          ]
        },
        {
          id: 'dms',
          label: 'Document Mgmt',
          subNodes: [
            { id: 'documents', label: 'Documents' }
          ],
          descriptiveTexts: [
            { id: 'collect-desc', label: 'Collect required documents' }
          ],
          statusNodes: [
            { id: 'collect', label: 'Collect', icon: '4' },
            { id: 'verify', label: 'Verify', icon: '✓' }
          ],
          events: [
            { id: 'collected', label: 'collected', status: 'collected' },
            { id: 'verified', label: 'verified', status: 'verified' }
          ]
        },
        {
          id: 'underwriting',
          label: 'Underwriting',
          subNodes: [
            { id: 'risk-assessment', label: 'Risk Assessment' }
          ],
          descriptiveTexts: [
            { id: 'review-desc', label: 'Review loan application risk' }
          ],
          statusNodes: [
            { id: 'review', label: 'Review', icon: '5' },
            { id: 'approve', label: 'Approve', icon: '✓' }
          ],
          events: [
            { id: 'reviewed', label: 'reviewed', status: 'reviewed' },
            { id: 'approved', label: 'approved', status: 'approved' }
          ]
        },
        {
          id: 'cwpmf',
          label: 'CW/PMF',
          subNodes: [
            { id: 'hypo-loan', label: 'Hypo Loan F' }
          ],
          statusNodes: [
            { id: 'stage', label: 'Stage', icon: '6' }
          ],
          events: [
            { id: 'staged', label: 'staged', status: 'staged' }
          ]
        },
        {
          id: 'cwflume',
          label: 'CW/FLUME',
          subNodes: [
            { id: 'commitment', label: 'Commitment' }
          ],
          descriptiveTexts: [
            { id: 'accept-desc', label: 'Seller accepts commitment details' }
          ],
          statusNodes: [
            { id: 'accept', label: 'Accept', icon: '✓' },
            { id: 'finalize', label: 'Finalize', icon: '7' }
          ],
          events: [
            { id: 'accepted', label: 'accepted', status: 'accepted' },
            { id: 'finalized', label: 'finalized', status: 'finalized' }
          ]
        },
        {
          id: 'closing',
          label: 'Closing System',
          subNodes: [
            { id: 'settlement', label: 'Settlement' }
          ],
          descriptiveTexts: [
            { id: 'close-desc', label: 'Complete loan closing process' }
          ],
          statusNodes: [
            { id: 'prepare', label: 'Prepare', icon: '8' },
            { id: 'close', label: 'Close', icon: '✓' }
          ],
          events: [
            { id: 'prepared', label: 'prepared', status: 'prepared' },
            { id: 'closed', label: 'closed', status: 'closed' }
          ]
        }
      ],
      connections: [
        // Row 1 connections (LSA -> LOS -> Credit -> DMS)
        { id: 'lsa-accepted-to-los-submit', source: 'lsa-accepted', target: 'los-submit', style: 'action' },
        { id: 'los-validated-to-credit-pull', source: 'los-validated', target: 'credit-pull', style: 'action' },
        { id: 'credit-analyzed-to-dms-collect', source: 'credit-analyzed', target: 'dms-collect', style: 'action' },
        
        // Row 2 connections (Underwriting -> CW/PMF -> CW/FLUME -> Closing)
        { id: 'dms-verified-to-underwriting-review', source: 'dms-verified', target: 'underwriting-review', style: 'action' },
        { id: 'underwriting-approved-to-cwpmf-stage', source: 'underwriting-approved', target: 'cwpmf-stage', style: 'action' },
        { id: 'cwpmf-staged-to-cwflume-accept', source: 'cwpmf-staged', target: 'cwflume-accept', style: 'action' },
        { id: 'cwflume-finalized-to-closing-prepare', source: 'cwflume-finalized', target: 'closing-prepare', style: 'action' },
        
        // Internal workflow connections for each application
        // LSA
        { id: 'lsa-create-to-created', source: 'lsa-create', target: 'lsa-created' },
        { id: 'lsa-created-to-accept', source: 'lsa-created', target: 'lsa-accept' },
        { id: 'lsa-accept-to-accepted', source: 'lsa-accept', target: 'lsa-accepted', style: 'action' },
        
        // LOS
        { id: 'los-submit-to-submitted', source: 'los-submit', target: 'los-submitted' },
        { id: 'los-submitted-to-validate', source: 'los-submitted', target: 'los-validate' },
        { id: 'los-validate-to-validated', source: 'los-validate', target: 'los-validated', style: 'action' },
        
        // Credit Bureau
        { id: 'credit-pull-to-pulled', source: 'credit-pull', target: 'credit-pulled' },
        { id: 'credit-pulled-to-analyze', source: 'credit-pulled', target: 'credit-analyze' },
        { id: 'credit-analyze-to-analyzed', source: 'credit-analyze', target: 'credit-analyzed', style: 'action' },
        
        // Document Management
        { id: 'dms-collect-to-collected', source: 'dms-collect', target: 'dms-collected' },
        { id: 'dms-collected-to-verify', source: 'dms-collected', target: 'dms-verify' },
        { id: 'dms-verify-to-verified', source: 'dms-verify', target: 'dms-verified', style: 'action' },
        
        // Underwriting
        { id: 'underwriting-review-to-reviewed', source: 'underwriting-review', target: 'underwriting-reviewed' },
        { id: 'underwriting-reviewed-to-approve', source: 'underwriting-reviewed', target: 'underwriting-approve' },
        { id: 'underwriting-approve-to-approved', source: 'underwriting-approve', target: 'underwriting-approved', style: 'action' },
        
        // CW/PMF
        { id: 'cwpmf-stage-to-staged', source: 'cwpmf-stage', target: 'cwpmf-staged' },
        
        // CW/FLUME
        { id: 'cwflume-accept-to-accepted', source: 'cwflume-accept', target: 'cwflume-accepted', style: 'action' },
        { id: 'cwflume-accepted-to-finalize', source: 'cwflume-accepted', target: 'cwflume-finalize' },
        { id: 'cwflume-finalize-to-finalized', source: 'cwflume-finalize', target: 'cwflume-finalized', style: 'action' },
        
        // Closing
        { id: 'closing-prepare-to-prepared', source: 'closing-prepare', target: 'closing-prepared' },
        { id: 'closing-prepared-to-close', source: 'closing-prepared', target: 'closing-close' },
        { id: 'closing-close-to-closed', source: 'closing-close', target: 'closing-closed', style: 'action' }
      ]
    };
  };

  // Generate ReactFlow nodes from workflow data
  const generateNodes = (workflowData: WorkflowData): Node[] => {
    const nodes: Node[] = [];

    workflowData.applications.forEach((app, index) => {
      // Calculate dynamic position based on index
      const position = calculatePosition(index);
      
      // Create application container
      nodes.push({
        id: `${app.id}-container`,
        type: 'container',
        position: position,
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
        selectable: true,
        draggable: true,  // Make parent containers draggable
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

  // Use the data from fetchWorkflowData function
  const workflowData: WorkflowData = useMemo(() => {
    // In production, this would be: await fetchWorkflowData()
    // For demo, we'll use the function's return value directly
    const demoData = {
      applications: [
        {
          id: 'lsa',
          label: 'LSA',
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
          id: 'los',
          label: 'LOS',
          subNodes: [
            { id: 'application', label: 'Application' }
          ],
          descriptiveTexts: [
            { id: 'submit-desc', label: 'Borrower submits loan application' }
          ],
          statusNodes: [
            { id: 'submit', label: 'Submit', icon: '2' },
            { id: 'validate', label: 'Validate', icon: '✓' }
          ],
          events: [
            { id: 'submitted', label: 'submitted', status: 'submitted' },
            { id: 'validated', label: 'validated', status: 'validated' }
          ]
        },
        {
          id: 'credit',
          label: 'Credit Bureau',
          subNodes: [
            { id: 'credit-check', label: 'Credit Check' }
          ],
          descriptiveTexts: [
            { id: 'pull-desc', label: 'Pull credit report and score' }
          ],
          statusNodes: [
            { id: 'pull', label: 'Pull', icon: '3' },
            { id: 'analyze', label: 'Analyze', icon: '✓' }
          ],
          events: [
            { id: 'pulled', label: 'pulled', status: 'pulled' },
            { id: 'analyzed', label: 'analyzed', status: 'analyzed' }
          ]
        },
        {
          id: 'dms',
          label: 'Document Mgmt',
          subNodes: [
            { id: 'documents', label: 'Documents' }
          ],
          descriptiveTexts: [
            { id: 'collect-desc', label: 'Collect required documents' }
          ],
          statusNodes: [
            { id: 'collect', label: 'Collect', icon: '4' },
            { id: 'verify', label: 'Verify', icon: '✓' }
          ],
          events: [
            { id: 'collected', label: 'collected', status: 'collected' },
            { id: 'verified', label: 'verified', status: 'verified' }
          ]
        },
        {
          id: 'underwriting',
          label: 'Underwriting',
          subNodes: [
            { id: 'risk-assessment', label: 'Risk Assessment' }
          ],
          descriptiveTexts: [
            { id: 'review-desc', label: 'Review loan application risk' }
          ],
          statusNodes: [
            { id: 'review', label: 'Review', icon: '5' },
            { id: 'approve', label: 'Approve', icon: '✓' }
          ],
          events: [
            { id: 'reviewed', label: 'reviewed', status: 'reviewed' },
            { id: 'approved', label: 'approved', status: 'approved' }
          ]
        },
        {
          id: 'cwpmf',
          label: 'CW/PMF',
          subNodes: [
            { id: 'hypo-loan', label: 'Hypo Loan F' }
          ],
          statusNodes: [
            { id: 'stage', label: 'Stage', icon: '6' }
          ],
          events: [
            { id: 'staged', label: 'staged', status: 'staged' }
          ]
        },
        {
          id: 'cwflume',
          label: 'CW/FLUME',
          subNodes: [
            { id: 'commitment', label: 'Commitment' }
          ],
          descriptiveTexts: [
            { id: 'accept-desc', label: 'Seller accepts commitment details' }
          ],
          statusNodes: [
            { id: 'accept', label: 'Accept', icon: '✓' },
            { id: 'finalize', label: 'Finalize', icon: '7' }
          ],
          events: [
            { id: 'accepted', label: 'accepted', status: 'accepted' },
            { id: 'finalized', label: 'finalized', status: 'finalized' }
          ]
        },
        {
          id: 'closing',
          label: 'Closing System',
          subNodes: [
            { id: 'settlement', label: 'Settlement' }
          ],
          descriptiveTexts: [
            { id: 'close-desc', label: 'Complete loan closing process' }
          ],
          statusNodes: [
            { id: 'prepare', label: 'Prepare', icon: '8' },
            { id: 'close', label: 'Close', icon: '✓' }
          ],
          events: [
            { id: 'prepared', label: 'prepared', status: 'prepared' },
            { id: 'closed', label: 'closed', status: 'closed' }
          ]
        }
      ],
      connections: [
        // Zig-zag pattern connections: 1->2->3->4->5->6->7->8
        { id: 'lsa-accepted-to-los-submit', source: 'lsa-accepted', target: 'los-submit', style: 'action' as const },
        { id: 'los-validated-to-credit-pull', source: 'los-validated', target: 'credit-pull', style: 'action' as const },
        { id: 'credit-analyzed-to-dms-collect', source: 'credit-analyzed', target: 'dms-collect', style: 'action' as const },
        { id: 'dms-verified-to-underwriting-review', source: 'dms-verified', target: 'underwriting-review', style: 'action' as const },
        { id: 'underwriting-approved-to-cwpmf-stage', source: 'underwriting-approved', target: 'cwpmf-stage', style: 'action' as const },
        { id: 'cwpmf-staged-to-cwflume-accept', source: 'cwpmf-staged', target: 'cwflume-accept', style: 'action' as const },
        { id: 'cwflume-finalized-to-closing-prepare', source: 'cwflume-finalized', target: 'closing-prepare', style: 'action' as const },
        
        // Internal workflow connections for each application
        // LSA
        { id: 'lsa-create-to-created', source: 'lsa-create', target: 'lsa-created' },
        { id: 'lsa-created-to-accept', source: 'lsa-created', target: 'lsa-accept' },
        { id: 'lsa-accept-to-accepted', source: 'lsa-accept', target: 'lsa-accepted', style: 'action' as const },
        
        // LOS
        { id: 'los-submit-to-submitted', source: 'los-submit', target: 'los-submitted' },
        { id: 'los-submitted-to-validate', source: 'los-submitted', target: 'los-validate' },
        { id: 'los-validate-to-validated', source: 'los-validate', target: 'los-validated', style: 'action' as const },
        
        // Credit Bureau
        { id: 'credit-pull-to-pulled', source: 'credit-pull', target: 'credit-pulled' },
        { id: 'credit-pulled-to-analyze', source: 'credit-pulled', target: 'credit-analyze' },
        { id: 'credit-analyze-to-analyzed', source: 'credit-analyze', target: 'credit-analyzed', style: 'action' as const },
        
        // Document Management
        { id: 'dms-collect-to-collected', source: 'dms-collect', target: 'dms-collected' },
        { id: 'dms-collected-to-verify', source: 'dms-collected', target: 'dms-verify' },
        { id: 'dms-verify-to-verified', source: 'dms-verify', target: 'dms-verified', style: 'action' as const },
        
        // Underwriting
        { id: 'underwriting-review-to-reviewed', source: 'underwriting-review', target: 'underwriting-reviewed' },
        { id: 'underwriting-reviewed-to-approve', source: 'underwriting-reviewed', target: 'underwriting-approve' },
        { id: 'underwriting-approve-to-approved', source: 'underwriting-approve', target: 'underwriting-approved', style: 'action' as const },
        
        // CW/PMF
        { id: 'cwpmf-stage-to-staged', source: 'cwpmf-stage', target: 'cwpmf-staged' },
        
        // CW/FLUME
        { id: 'cwflume-accept-to-accepted', source: 'cwflume-accept', target: 'cwflume-accepted', style: 'action' as const },
        { id: 'cwflume-accepted-to-finalize', source: 'cwflume-accepted', target: 'cwflume-finalize' },
        { id: 'cwflume-finalize-to-finalized', source: 'cwflume-finalize', target: 'cwflume-finalized', style: 'action' as const },
        
        // Closing
        { id: 'closing-prepare-to-prepared', source: 'closing-prepare', target: 'closing-prepared' },
        { id: 'closing-prepared-to-close', source: 'closing-prepared', target: 'closing-close' },
        { id: 'closing-close-to-closed', source: 'closing-close', target: 'closing-closed', style: 'action' as const }
      ]
    };
    return demoData;
  }, []);

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