import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface WorkflowStep {
  id: string;
  number: number;
  title: string;
  description: string;
  nodeId: string;
  status: 'completed' | 'active' | 'pending';
}

interface EventExplorerProps {
  onStepClick: (nodeId: string) => void;
  onClose?: () => void;
  currentStep?: string;
}

const EventExplorer: React.FC<EventExplorerProps> = ({ onStepClick, onClose, currentStep }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStepNumber, setCurrentStepNumber] = useState(1);
  const [showLegend, setShowLegend] = useState(true);
  const [showModifiedEntities, setShowModifiedEntities] = useState(false);

  // Complete workflow steps data matching the exact node IDs in WorkflowDiagram
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'create-lsa',
      number: 1,
      title: 'Create - LSA - Loan Commitment',
      description: 'Seller enters commitment details in contract takeout screen. Five hypo loans are created with base prices',
      nodeId: 'lsa-create',
      status: 'completed'
    },
    {
      id: 'accept-lsa',
      number: 2,
      title: 'Accept - LSA - Loan Commitment',
      description: 'Seller accepts commitment details and finalizes loan parameters',
      nodeId: 'lsa-accept',
      status: 'completed'
    },
    {
      id: 'submit-los',
      number: 3,
      title: 'Submit - LOS - Application',
      description: 'Borrower submits comprehensive loan application with personal and financial information',
      nodeId: 'los-submit',
      status: 'active'
    },
    {
      id: 'validate-los',
      number: 4,
      title: 'Validate - LOS - Application',
      description: 'System validates loan application data for completeness and accuracy',
      nodeId: 'los-validate',
      status: 'pending'
    },
    {
      id: 'pull-credit',
      number: 5,
      title: 'Pull - Credit Bureau - Credit Report',
      description: 'Retrieve comprehensive credit report and credit score from bureau',
      nodeId: 'credit-pull',
      status: 'pending'
    },
    {
      id: 'analyze-credit',
      number: 6,
      title: 'Analyze - Credit Bureau - Risk Assessment',
      description: 'Analyze credit report, calculate risk score, and determine creditworthiness',
      nodeId: 'credit-analyze',
      status: 'pending'
    },
    {
      id: 'collect-docs',
      number: 7,
      title: 'Collect - Document Mgmt - Required Documents',
      description: 'Collect and upload required documents including income verification, tax returns, and bank statements',
      nodeId: 'dms-collect',
      status: 'pending'
    },
    {
      id: 'verify-docs',
      number: 8,
      title: 'Verify - Document Mgmt - Document Authentication',
      description: 'Verify authenticity, completeness, and accuracy of all submitted documents',
      nodeId: 'dms-verify',
      status: 'pending'
    },
    {
      id: 'review-underwriting',
      number: 9,
      title: 'Review - Underwriting - Comprehensive Risk Analysis',
      description: 'Comprehensive review of loan application, credit profile, and risk assessment',
      nodeId: 'underwriting-review',
      status: 'pending'
    },
    {
      id: 'approve-underwriting',
      number: 10,
      title: 'Approve - Underwriting - Final Decision',
      description: 'Final approval or denial decision based on comprehensive risk analysis',
      nodeId: 'underwriting-approve',
      status: 'pending'
    },
    {
      id: 'stage-cwpmf',
      number: 11,
      title: 'Stage - CW/PMF - Hypo Loan Preparation',
      description: 'Stage and prepare hypothetical loan for secondary market pricing',
      nodeId: 'cwpmf-stage',
      status: 'pending'
    },
    {
      id: 'accept-cwflume',
      number: 12,
      title: 'Accept - CW/FLUME - Commitment Processing',
      description: 'Accept and process loan commitment through CW/FLUME system',
      nodeId: 'cwflume-accept',
      status: 'pending'
    },
    {
      id: 'finalize-cwflume',
      number: 13,
      title: 'Finalize - CW/FLUME - Loan Commitment',
      description: 'Finalize loan commitment and prepare for closing process',
      nodeId: 'cwflume-finalize',
      status: 'pending'
    },
    {
      id: 'prepare-closing',
      number: 14,
      title: 'Prepare - Closing System - Settlement Preparation',
      description: 'Prepare all closing documents and coordinate settlement process',
      nodeId: 'closing-prepare',
      status: 'pending'
    },
    {
      id: 'close-loan',
      number: 15,
      title: 'Close - Closing System - Final Settlement',
      description: 'Complete final loan closing and settlement process with all parties',
      nodeId: 'closing-close',
      status: 'pending'
    }
  ];

  const totalSteps = workflowSteps.length;
  const maxVisibleSteps = 5;

  const filteredSteps = workflowSteps.filter(step =>
    step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStepIcon = (status: string, number: number) => {
    switch (status) {
      case 'completed':
        return <div className="step-icon completed">✓</div>;
      case 'active':
        return <div className="step-icon active">{number}</div>;
      default:
        return <div className="step-icon pending">{number}</div>;
    }
  };

  const handleStepClick = (step: WorkflowStep) => {
    onStepClick(step.nodeId);
    setCurrentStepNumber(step.number);
  };

  const handleNext = () => {
    if (currentStepNumber < totalSteps) {
      const nextStep = workflowSteps.find(s => s.number === currentStepNumber + 1);
      if (nextStep) {
        setCurrentStepNumber(currentStepNumber + 1);
        onStepClick(nextStep.nodeId);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepNumber > 1) {
      const prevStep = workflowSteps.find(s => s.number === currentStepNumber - 1);
      if (prevStep) {
        setCurrentStepNumber(currentStepNumber - 1);
        onStepClick(prevStep.nodeId);
      }
    }
  };

  return (
    <div className="event-explorer">
      <Card className="event-explorer-card">
        <CardHeader className="event-explorer-header">
          <div className="header-top">
            <CardTitle className="explorer-title">Event Explorer</CardTitle>
            <div className="header-actions">
              <Maximize2 className="action-icon" size={16} />
              {onClose && <X className="action-icon close-icon" size={16} onClick={onClose} />}
            </div>
          </div>
        </CardHeader>

        <CardContent className="event-explorer-content">
          {/* Search */}
          <div className="search-section">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <Input
                placeholder="Search this journey"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Step List */}
          <div className="steps-section">
            {filteredSteps.slice(0, maxVisibleSteps).map((step) => (
              <div
                key={step.id}
                className={`step-item ${step.status} ${currentStep === step.nodeId ? 'current' : ''}`}
                onClick={() => handleStepClick(step)}
              >
                <div className="step-content">
                  {getStepIcon(step.status, step.number)}
                  <div className="step-details">
                    <div className="step-title">{step.title}</div>
                    <div className="step-description">{step.description}</div>
                  </div>
                </div>
                {step.number < totalSteps && <div className="step-connector"></div>}
              </div>
            ))}

            {filteredSteps.length > maxVisibleSteps && (
              <div className="more-steps">
                <span>{filteredSteps.length - maxVisibleSteps} more steps...</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="navigation-section">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStepNumber === 1}
              className="nav-button"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              disabled={currentStepNumber === totalSteps}
              className="nav-button next"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Customize View */}
          <div className="customize-section">
            <h4 className="section-title">Customize View</h4>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={showModifiedEntities}
                  onChange={(e) => setShowModifiedEntities(e.target.checked)}
                />
                <span>See all modified data entities</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                />
                <span>See Legend</span>
              </label>
            </div>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="legend-section">
              <div className="legend-header">
                <h4 className="section-title">Legend</h4>
                <X className="legend-close" size={16} onClick={() => setShowLegend(false)} />
              </div>
              <div className="legend-content">
                <div className="legend-item application">
                  <div className="legend-box">Application</div>
                </div>
                <div className="legend-item workflow">
                  <div className="legend-box workflow-box">
                    <div className="workflow-inner">
                      <div className="legend-circle business-event">Business Event</div>
                      <div className="legend-arrow">→</div>
                      <div className="legend-circle state">state</div>
                    </div>
                  </div>
                </div>
                <div className="legend-item data-entity">
                  <div className="legend-box">Data Entity</div>
                </div>
              </div>
            </div>
          )}

          {/* Journey Tracker */}
          <div className="journey-tracker">
            <div className="tracker-header">
              <h4 className="section-title">Journey Tracker</h4>
            </div>
            <div className="tracker-content">
              <div className="progress-info">Event {currentStepNumber} of {totalSteps}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventExplorer;