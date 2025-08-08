import WorkflowDiagram from '@/components/WorkflowDiagram';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Loan Processing Workflow</h1>
        <WorkflowDiagram />
      </div>
    </div>
  );
};

export default Index;
