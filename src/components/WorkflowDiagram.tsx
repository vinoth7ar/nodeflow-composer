// TEST
import React, { useCallback, useMemo, useState, useRef } from 'react';
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
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import EventExplorer from './EventExplorer';

// Unified Node Components matching Figma design
const WorkflowContainerNode = ({ data }: { data: any }) => (
  <div 
    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-2"
    style={{ 
      width: data.width, 
      height: data.height,
    }}
  >
  </div>
);

const ContainerNode = ({ data }: { data: any }) => (
  <div 
    className="bg-white border-2 border-gray-300 rounded-xl shadow-sm"
    style={{ width: data.width, height: data.height, padding: '16px' }}
  >
    <div className="absolute -top-3 left-3 bg-gray-900 text-white px-3 py-1 rounded text-sm font-semibold">
      {data.label}
    </div>
  </div>
);

const WorkflowNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    <div 
      className={`
        w-24 h-24 rounded-full flex items-center justify-center text-sm font-medium
        transition-all duration-300 border-2 shadow-lg
        ${data.selected 
          ? 'scale-125 shadow-lg' 
          : 'hover:scale-105'
        }
        ${data.status === 'accepted' || data.status === 'validated' || data.status === 'analyzed' || data.status === 'verified' || data.status === 'approved' || data.status === 'finalized' || data.status === 'closed'
          ? 'bg-green-500 border-green-600 text-white'
          : 'bg-gray-400 border-gray-500 text-white'
        }
      `}
    >
      {data.label}
    </div>
    <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
  </>
);

const ActionNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    <div 
      className={`
        px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-semibold
        transition-all duration-300 border-2 min-w-max
        ${data.selected 
          ? 'scale-110 shadow-lg bg-green-500 border-green-600 text-white' 
          : 'bg-green-400 border-green-500 text-white hover:bg-green-500'
        }
      `}
    >
      {data.icon && (
        <span className="w-7 h-7 bg-white text-green-500 rounded-full flex items-center justify-center text-sm font-bold">
          {data.icon}
        </span>
      )}
      {data.label}
    </div>
    <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
  </>
);

const TextNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
    <div className="text-gray-700 text-sm font-medium text-left px-2 leading-tight">
      {data.label}
    </div>
    <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
  </>
);

const StepNode = ({ data }: { data: any }) => (
  <>
    <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    <div 
      className={`
        px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-semibold
        transition-all duration-300 border-2 min-w-max
        ${data.selected 
          ? 'scale-110 shadow-lg bg-blue-600 border-blue-700 text-white' 
          : 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600'
        }
      `}
    >
      {data.icon && (
        <span className="w-7 h-7 bg-white text-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
          {data.icon}
        </span>
      )}
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
  const [showEventExplorer, setShowEventExplorer] = useState(true);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  
  // Container configuration - larger sizes to match Figma design
  const containerWidth = 400;
  const containerHeight = 280;
  const workflowContainerWidth = 350;
  const workflowContainerHeight = 140;
  
  // Dynamic layout configuration - positioned to match Figma exactly
  const calculateDynamicLayout = (totalApps: number) => {
    const baseSpacing = 450;
    const containerStartX = 50;
    
    return {
      subNodeY: 35,               // Title positioning 
      workflowContainerY: 85,     // Workflow container positioning
      statusNodeY: 15,            // Status nodes (action buttons) in upper area
      eventNodeY: 80,             // Event nodes (status circles) in lower area
      subNodeStartX: 25,          // Left margin for titles
      descriptiveTextX: 25,       // Left margin for descriptions  
      workflowContainerX: 25,     // Workflow container left margin
      eventNodeStartX: 25,        // Event nodes left margin
      eventNodeSpacing: 180,      // Horizontal spacing between event nodes
      statusNodeOffsetX: 25,      // Status nodes left offset from container
      statusNodeSpacing: 180,     // Horizontal spacing between status nodes
      containerSpacing: baseSpacing,
      containerStartX: containerStartX,
    };
  };

  // Generate dynamic demo data without hardcoded positions
  const fetchWorkflowData = async (): Promise<WorkflowData> => {
    // Placeholder for backend integration
    // return await api.get('/workflow-data');
    
    // Demo data - 8 applications representing complete loan workflow
    const apps = [
      {
        id: 'lsa',
        label: 'LSA',
        subNodes: [{ id: 'commitment', label: 'Commitment' }],
        descriptiveTexts: [{ id: 'accept-desc', label: 'Seller accepts commitment details' }],
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
        subNodes: [{ id: 'application', label: 'Application' }],
        descriptiveTexts: [{ id: 'submit-desc', label: 'Borrower submits loan application' }],
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
        subNodes: [{ id: 'credit-check', label: 'Credit Check' }],
        descriptiveTexts: [{ id: 'pull-desc', label: 'Pull credit report and score' }],
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
        subNodes: [{ id: 'documents', label: 'Documents' }],
        descriptiveTexts: [{ id: 'collect-desc', label: 'Collect required documents' }],
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
        subNodes: [{ id: 'risk-assessment', label: 'Risk Assessment' }],
        descriptiveTexts: [{ id: 'review-desc', label: 'Review loan application risk' }],
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
        subNodes: [{ id: 'hypo-loan', label: 'Hypo Loan F' }],
        statusNodes: [{ id: 'stage', label: 'Stage', icon: '6' }],
        events: [{ id: 'staged', label: 'staged', status: 'staged' }]
      },
      {
        id: 'cwflume',
        label: 'CW/FLUME',
        subNodes: [{ id: 'commitment', label: 'Commitment' }],
        descriptiveTexts: [{ id: 'accept-desc', label: 'Seller accepts commitment details' }],
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
        subNodes: [{ id: 'settlement', label: 'Settlement' }],
        descriptiveTexts: [{ id: 'close-desc', label: 'Complete loan closing process' }],
        statusNodes: [
          { id: 'prepare', label: 'Prepare', icon: '8' },
          { id: 'close', label: 'Close', icon: '✓' }
        ],
        events: [
          { id: 'prepared', label: 'prepared', status: 'prepared' },
          { id: 'closed', label: 'closed', status: 'closed' }
        ]
      }
    ];

    // Calculate dynamic positions - alternating row pattern (1,3,5,7 in row 1; 2,4,6,8 in row 2)
    const layoutConfig = calculateDynamicLayout(apps.length);
    const applicationsWithPositions = apps.map((app, index) => {
      const row = index % 2; // 0 for odd positions (1,3,5,7), 1 for even positions (2,4,6,8)
      const col = Math.floor(index / 2); // Column based on pairs
      
      return {
        ...app,
        position: {
          x: layoutConfig.containerStartX + (col * layoutConfig.containerSpacing),
          y: layoutConfig.containerStartX + (row * 250) // 250px spacing between rows
        }
      };
    });

    return {
      applications: applicationsWithPositions,
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

  // Generate ReactFlow nodes from workflow data with dynamic positioning
  const generateNodes = (workflowData: WorkflowData): Node[] => {
    const nodes: Node[] = [];
    const layoutConfig = calculateDynamicLayout(workflowData.applications.length);

    workflowData.applications.forEach((app, appIndex) => {
      // Use the already calculated dynamic position from workflowData
      const dynamicPosition = app.position;

      // Create application container with dynamic position
      nodes.push({
        id: `${app.id}-container`,
        type: 'container',
        position: dynamicPosition,
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

      // Helper function to determine node type based on label
      const getNodeTypeFromLabel = (label: string): string => {
        // Based on your Figma design:
        // - Green nodes (action): Accept, Stage, Finalize, Close, Approve, Verify, Analyze, Validate
        // - Blue nodes (step): Create, Submit, Pull, Collect, Review, Prepare, Enrich
        const actionLabels = ['accept', 'stage', 'finalize', 'close', 'approve', 'verify', 'analyze', 'validate'];
        const stepLabels = ['create', 'submit', 'pull', 'collect', 'review', 'prepare', 'enrich'];
        
        const lowerLabel = label.toLowerCase();
        
        if (actionLabels.includes(lowerLabel)) {
          return 'action';
        } else if (stepLabels.includes(lowerLabel)) {
          return 'step';
        }
        
        return 'action'; // Default fallback
      };

      // Create status nodes - positioned inside workflow container
      app.statusNodes.forEach((statusNode, index) => {
        // Map specific labels to node types based on Figma design
        const nodeType = getNodeTypeFromLabel(statusNode.label);
        const xPosition = layoutConfig.statusNodeOffsetX + (index * layoutConfig.statusNodeSpacing);
        
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

  // Use the data from fetchWorkflowData function with dynamic positioning
  const workflowData: WorkflowData = useMemo(() => {
    // For demo, we'll generate the data synchronously
    const apps = [
      {
        id: 'lsa',
        label: 'LSA',
        subNodes: [{ id: 'commitment', label: 'Commitment' }],
        descriptiveTexts: [{ id: 'accept-desc', label: 'Seller accepts commitment details' }],
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
        subNodes: [{ id: 'application', label: 'Application' }],
        descriptiveTexts: [{ id: 'submit-desc', label: 'Borrower submits loan application' }],
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
        subNodes: [{ id: 'credit-check', label: 'Credit Check' }],
        descriptiveTexts: [{ id: 'pull-desc', label: 'Pull credit report and score' }],
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
        subNodes: [{ id: 'documents', label: 'Documents' }],
        descriptiveTexts: [{ id: 'collect-desc', label: 'Collect required documents' }],
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
        subNodes: [{ id: 'risk-assessment', label: 'Risk Assessment' }],
        descriptiveTexts: [{ id: 'review-desc', label: 'Review loan application risk' }],
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
        subNodes: [{ id: 'hypo-loan', label: 'Hypo Loan F' }],
        statusNodes: [{ id: 'stage', label: 'Stage', icon: '6' }],
        events: [{ id: 'staged', label: 'staged', status: 'staged' }]
      },
      {
        id: 'cwflume',
        label: 'CW/FLUME',
        subNodes: [{ id: 'commitment', label: 'Commitment' }],
        descriptiveTexts: [{ id: 'accept-desc', label: 'Seller accepts commitment details' }],
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
        subNodes: [{ id: 'settlement', label: 'Settlement' }],
        descriptiveTexts: [{ id: 'close-desc', label: 'Complete loan closing process' }],
        statusNodes: [
          { id: 'prepare', label: 'Prepare', icon: '8' },
          { id: 'close', label: 'Close', icon: '✓' }
        ],
        events: [
          { id: 'prepared', label: 'prepared', status: 'prepared' },
          { id: 'closed', label: 'closed', status: 'closed' }
        ]
      }
    ];

    // Calculate dynamic positions - alternating row pattern (1,3,5,7 in row 1; 2,4,6,8 in row 2)
    const layoutConfig = calculateDynamicLayout(apps.length);
    const applicationsWithPositions = apps.map((app, index) => {
      const row = index % 2; // 0 for odd positions (1,3,5,7), 1 for even positions (2,4,6,8)
      const col = Math.floor(index / 2); // Column based on pairs
      
      return {
        ...app,
        position: {
          x: layoutConfig.containerStartX + (col * layoutConfig.containerSpacing),
          y: layoutConfig.containerStartX + (row * 250) // 250px spacing between rows
        }
      };
    });

    return {
      applications: applicationsWithPositions,
      connections: [
        // Row 1 connections (LSA -> LOS -> Credit -> DMS)
        { id: 'lsa-accepted-to-los-submit', source: 'lsa-accepted', target: 'los-submit', style: 'action' as const },
        { id: 'los-validated-to-credit-pull', source: 'los-validated', target: 'credit-pull', style: 'action' as const },
        { id: 'credit-analyzed-to-dms-collect', source: 'credit-analyzed', target: 'dms-collect', style: 'action' as const },
        
        // Row 2 connections (Underwriting -> CW/PMF -> CW/FLUME -> Closing)
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
  }, []);

  const initialNodes: Node[] = useMemo(() => generateNodes(workflowData), [workflowData]);
  const initialEdges: Edge[] = useMemo(() => generateEdges(workflowData), [workflowData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const handleStepClick = useCallback((nodeId: string) => {
    console.log('=== STEP CLICK DEBUG ===');
    console.log('Requested nodeId:', nodeId);
    setCurrentStep(nodeId);
    
    // Enhanced selection logic to highlight related steps across applications
    setNodes((prevNodes) => 
      prevNodes.map((node) => {
        // Clear all selections first
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            selected: false
          }
        };
        
        // Highlight the selected node
        if (node.id === nodeId) {
          updatedNode.data.selected = true;
        } else {
          // Highlight common steps across applications
          const stepNumber = extractStepNumber(nodeId);
          const nodeStepNumber = extractStepNumber(node.id);
          
          if (stepNumber && nodeStepNumber && stepNumber === nodeStepNumber) {
            updatedNode.data.selected = true;
          }
        }
        
        return updatedNode;
      })
    );
    
    if (reactFlowInstance) {
      // Find the target node
      const targetNode = nodes.find(node => node.id === nodeId);
      console.log('Found target node:', targetNode ? targetNode.id : 'NOT FOUND');
      
      if (targetNode) {
        console.log('Target node details:', {
          id: targetNode.id,
          position: targetNode.position,
          parentId: targetNode.parentId,
          type: targetNode.type
        });
        
        // Calculate absolute position for nested nodes
        let absoluteX = targetNode.position.x;
        let absoluteY = targetNode.position.y;
        
        // If node has a parent, add parent's position
        if (targetNode.parentId) {
          const parentNode = nodes.find(node => node.id === targetNode.parentId);
          if (parentNode) {
            absoluteX += parentNode.position.x;
            absoluteY += parentNode.position.y;
            console.log('Parent node found:', {
              parentId: parentNode.id,
              parentPosition: parentNode.position,
              finalAbsolutePosition: { x: absoluteX, y: absoluteY }
            });
          }
        }
        
        console.log('Centering on position:', { x: absoluteX + 25, y: absoluteY + 25 });
        
        // Center the view on the specific node with better positioning
        reactFlowInstance.setCenter(
          absoluteX + 25,
          absoluteY + 25,
          { zoom: 1.2, duration: 1000 }
        );
      } else {
        console.error('❌ Node not found:', nodeId);
        console.log('Possible matches:', nodes.filter(n => 
          n.id.includes(nodeId) || 
          nodeId.includes(n.id.split('-')[0]) ||
          n.id.split('-').some(part => nodeId.includes(part))
        ).map(n => n.id));
      }
    }
    console.log('=== END DEBUG ===');
  }, [reactFlowInstance, nodes, setCurrentStep, setNodes]);

  // Helper function to extract step number from node ID
  const extractStepNumber = (nodeId: string): string | null => {
    const stepPatterns = [
      /create/i, /submit/i, /pull/i, /collect/i, /review/i, /stage/i, /finalize/i, /prepare/i,
      /accept/i, /validate/i, /analyze/i, /verify/i, /approve/i, /close/i
    ];
    
    const stepNumbers = ['1', '2', '3', '4', '5', '6', '7', '8'];
    
    for (let i = 0; i < stepPatterns.length; i++) {
      if (stepPatterns[i].test(nodeId)) {
        return stepNumbers[Math.floor(i / 2)]; // Map pairs to numbers
      }
    }
    
    return null;
  };


  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      position: 'relative'
    }}>
      <div style={{ 
        flex: 1, 
        marginRight: showEventExplorer ? '380px' : '0',
        transition: 'margin-right 0.3s ease'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
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
      
      {showEventExplorer && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          zIndex: 1000
        }}>
          <EventExplorer 
            onStepClick={handleStepClick}
            onClose={() => setShowEventExplorer(false)}
            currentStep={currentStep}
          />
        </div>
      )}
      
      {!showEventExplorer && (
        <button
          onClick={() => setShowEventExplorer(true)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px 16px',
            background: 'hsl(var(--primary))',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            zIndex: 1000,
            fontSize: '14px'
          }}
        >
          Show Explorer
        </button>
      )}
    </div>
  );
};

export default WorkflowDiagram;
