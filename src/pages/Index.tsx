import WorkflowDiagram from '@/components/WorkflowDiagram';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Loan Processing Workflow</h1>
        </div>
        <div style={{ height: 'calc(100vh - 120px)' }}>
          <WorkflowDiagram />
        </div>
      </div>
    </div>
  );
};

export default Index;
