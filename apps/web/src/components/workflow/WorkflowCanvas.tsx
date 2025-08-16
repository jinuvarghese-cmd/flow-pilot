'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowNode } from './WorkflowNode';
import { useWorkflowBuilder } from '../../stores/workflow-builder';
import { WorkflowStep } from '@flow-pilot/types';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

interface WorkflowCanvasProps {
  onSave?: () => void;
  onExecute?: () => void;
}

function WorkflowCanvasInner({ onSave, onExecute }: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const {
    selectedNode,
    setSelectedNode,
    addNode,
    updateNode,
    removeNode,
    addEdge: addWorkflowEdge,
    removeEdge: removeWorkflowEdge,
    setDirty,
    isExecuting,
    executionStatus,
    // Use store state directly
    nodes: storeNodes,
    edges: storeEdges,
  } = useWorkflowBuilder();

  // Convert store nodes to React Flow format
  const nodes = storeNodes.map(node => ({
    id: node.id,
    type: 'workflowNode',
    position: node.position,
    data: {
      ...node,
      isExecuting: false,
      executionStatus: executionStatus[node.id],
    },
  }));

  // Convert store edges to React Flow format
  const edges = storeEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  // Handle node selection
  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  // Handle canvas click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) => {
      // Add to workflow store
      addWorkflowEdge({
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      });
      
      setDirty(true);
    },
    [addWorkflowEdge, setDirty]
  );

  // Handle edge removal
  const onEdgeClick = useCallback(
    (event: any, edge: Edge) => {
      removeWorkflowEdge(edge.id);
      setDirty(true);
    },
    [removeWorkflowEdge, setDirty]
  );

  // Handle node removal
  const onNodeDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => {
        removeNode(node.id);
      });
      setDirty(true);
    },
    [removeNode, setDirty]
  );

  // Handle node updates (position, etc.)
  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      updateNode(node.id, {
        position: node.position,
      });
      setDirty(true);
    },
    [updateNode, setDirty]
  );

  // Handle node changes (selection, etc.)
  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      // Update workflow store with node changes
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.dragging === false) {
          updateNode(change.id, {
            position: change.position,
          });
        }

        if (change.type === 'remove') {
          removeNode(change.id);
          setDirty(true);
        }
      });
    },
    [updateNode, removeNode, setDirty]
  );

  // Handle edge changes
  const onEdgesChangeHandler = useCallback(
    (changes: any) => {
      // Handle edge changes if needed
    },
    []
  );

  // Handle drag and drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: WorkflowStep = {
        id: uuidv4(),
        type: type as any,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        description: `A ${type} node`,
        config: {},
        position: {
          x: position.x,
          y: position.y,
        },
        connections: {
          input: [],
          output: [],
        },
      };

      // Add to workflow store only
      addNode(newNode);
      setDirty(true);
    },
    [reactFlowInstance, addNode, setDirty]
  );

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'trigger':
                return '#10b981';
              case 'email':
                return '#3b82f6';
              case 'webhook':
                return '#8b5cf6';
              case 'condition':
                return '#f59e0b';
              case 'delay':
                return '#f97316';
              case 'data_transform':
                return '#6366f1';
              case 'action':
                return '#ef4444';
              default:
                return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}