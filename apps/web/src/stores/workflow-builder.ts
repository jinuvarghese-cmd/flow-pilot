import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { WorkflowStep, WorkflowState, WorkflowBuilderActions } from '@flow-pilot/types';

interface WorkflowBuilderStore extends WorkflowState, WorkflowBuilderActions {
      // Additional UI state
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  zoom: number;

    // Actions
    setLoading: (loading: boolean) => void;
    setDirty: (dirty: boolean) => void;
    setLastSaved: (date: Date) => void;
    setZoom: (zoom: number) => void;
    resetWorkflow: () => void;
    loadWorkflow: (nodes: WorkflowStep[], edges: any[]) => void;
}

//curry function, call one function and call the function which gets returned
export const useWorkflowBuilder = create<WorkflowBuilderStore>()(
    immer((set, get) => ({
        // Initial state
        nodes: [],
        edges: [],
        selectedNode: null,
        isExecuting: false,
        executionStatus: {},
        isLoading: false,
        isDirty: false,
        lastSaved: null,
        zoom: 1,

        addNode: (node: WorkflowStep) => 
            set((state) => {
              state.nodes.push(node);
              state.isDirty = true;
        }),

        updateNode: (id: string, updates: Partial<WorkflowStep>) =>
            set((state) => {
              const nodeIndex = state.nodes.findIndex(n => n.id === id);
              if (nodeIndex !== -1) {
                Object.assign(state.nodes[nodeIndex], updates);
                state.isDirty = true;
              }
        }),

        removeNode: (id: string) =>
            set((state) => {
              state.nodes = state.nodes.filter(n => n.id !== id);
              state.edges = state.edges.filter(e => e.source !== id && e.target !== id);
              if (state.selectedNode === id) {
                state.selectedNode = null;
              }
              state.isDirty = true;
        }),

            // Edge operations
        addEdge: (edge) =>
            set((state) => {
            const edgeId = `edge_${edge.source}_${edge.target}`;
            const existingEdge = state.edges.find(e => e.id === edgeId);
            if (!existingEdge) {
                state.edges.push({ id: edgeId, ...edge });
                state.isDirty = true;
            }
        }),

        removeEdge: (id: string) =>
            set((state) => {
              state.edges = state.edges.filter(e => e.id !== id);
              state.isDirty = true;
        }),

        // Selection
        setSelectedNode: (id: string | null) =>
            set((state) => {
            state.selectedNode = id;
        }),

        // Execution status
        setExecutionStatus: (nodeId: string, status: string) =>
            set((state) => {
            state.executionStatus[nodeId] = status;
        }),

        clearExecutionStatus: () =>
            set((state) => {
              state.executionStatus = {};
              state.isExecuting = false;
        }),

        setIsExecuting: (executing: boolean) =>
            set((state) => {
              state.isExecuting = executing;
        }),

        // UI state
        setLoading: (loading: boolean) =>
            set((state) => {
              state.isLoading = loading;
        }),

        setDirty: (dirty: boolean) =>
            set((state) => {
                state.isDirty = dirty;
        }),

        setLastSaved: (date: Date) =>
            set((state) => {
              state.lastSaved = date;
              state.isDirty = false;
        }),

        setZoom: (zoom: number) =>
            set((state) => {
              state.zoom = zoom;
        }),

        // Workflow operations
        resetWorkflow: () =>
            set((state) => {
                state.nodes = [];
                state.edges = [];
                state.selectedNode = null;
                state.isExecuting = false;
                state.executionStatus = {};
                state.isDirty = false;
                state.lastSaved = null;
          
        }),

        loadWorkflow: (nodes: WorkflowStep[], edges: any[]) =>
            set((state) => {
              state.nodes = nodes;
              state.edges = edges;
              state.selectedNode = null;
              state.isExecuting = false;
              state.executionStatus = {};
              state.isDirty = false;
              state.lastSaved = new Date();
            }),
        }))
);