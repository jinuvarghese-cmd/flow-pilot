export interface WorkflowStep {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'data_transform';
    name: string;
    description?: string;
    config: Record<string, any>;
    position: {
      x: number;
      y: number;
    };
    connections: {
      input?: string[];
      output?: string[];
    };
  }

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    tenantId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    currentStep: number;
    data: Record<string, any>;
    result?: Record<string, any>;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface WorkflowTemplate {
    id: string;
    name: string;
    description?: string;
    category: string;
    steps: WorkflowStep[];
    isPublic: boolean;
    createdBy?: string;
    tenantId?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface JobQueue {
    id: string;
    jobId: string;
    type: string;
    data: Record<string, any>;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    progress: number;
    result?: Record<string, any>;
    error?: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Workflow action types
export interface EmailAction {
    to: string;
    subject: string;
    body: string;
    template?: string;
    variables?: Record<string, any>;
}

export interface WebhookAction {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
  }

export interface DataTransformAction {
    operation: 'map' | 'filter' | 'reduce' | 'merge' | 'split';
    config: Record<string, any>;
}

export interface ConditionAction {
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    field: string;
    value: any;
    truePath: string;
    falsePath: string;
}

// Workflow trigger types
export interface Trigger {
    type: 'webhook' | 'schedule' | 'manual' | 'event';
    config: Record<string, any>;
  }
  
// Workflow state for Zustand
export interface WorkflowState {
    nodes: WorkflowStep[];
    edges: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    selectedNode: string | null;
    isExecuting: boolean;
    executionStatus: Record<string, string>;
}

// Workflow builder actions
export interface WorkflowBuilderActions {
    addNode: (node: WorkflowStep) => void;
    updateNode: (id: string, updates: Partial<WorkflowStep>) => void;
    removeNode: (id: string) => void;
    addEdge: (edge: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) => void;
    removeEdge: (id: string) => void;
    setSelectedNode: (id: string | null) => void;
    setExecutionStatus: (nodeId: string, status: string) => void;
    clearExecutionStatus: () => void;
    setIsExecuting: (executing: boolean) => void;
}