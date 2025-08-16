'use client';

import React, { useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { NodeSidebar } from '@/components/workflow/NodeSidebar';
import { PropertiesPanel } from '@/components/workflow/PropertiesPanel';
import { useWorkflowBuilder } from '@/stores/workflow-builder';
import { 
  Save, 
  Play, 
  Plus, 
  Download, 
  Upload, 
  Trash2,
  Settings,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [showProperties, setShowProperties] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const {
    nodes,
    edges,
    selectedNode,
    isDirty,
    lastSaved,
    resetWorkflow,
    setDirty,
    setLastSaved,
    loadWorkflow,
  } = useWorkflowBuilder();

  // Get selected node for properties panel
  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  // Handle save workflow
  const handleSave = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to save the workflow');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement actual save to API
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastSaved(new Date());
      setDirty(false);
      
      // Show success message
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  }, [nodes, setLastSaved, setDirty]);

  // Handle execute workflow
  const handleExecute = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to execute the workflow');
      return;
    }

    setIsExecuting(true);
    try {
      // TODO: Implement actual workflow execution
      // For now, just simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Workflow executed successfully!');
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  }, [nodes]);

  // Handle new workflow
  const handleNew = useCallback(() => {
    if (isDirty) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to create a new workflow?');
      if (!confirmed) return;
    }
    resetWorkflow();
  }, [isDirty, resetWorkflow]);

  // Handle export workflow
  const handleExport = useCallback(() => {
    const workflowData = {
      nodes,
      edges,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Handle import workflow
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.nodes && data.edges) {
              loadWorkflow(data.nodes, data.edges);
              alert('Workflow imported successfully!');
            } else {
              alert('Invalid workflow file format');
            }
          } catch (error) {
            alert('Failed to parse workflow file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [loadWorkflow]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Builder</h1>
              {isDirty && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Unsaved Changes
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNew}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </button>
              
              <button
                onClick={handleImport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                onClick={handleExecute}
                disabled={isExecuting || nodes.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 mr-2" />
                {isExecuting ? 'Executing...' : 'Execute'}
              </button>
            </div>
          </div>
          
          {/* Status bar */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Nodes: {nodes.length}</span>
              <span>Edges: {edges.length}</span>
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProperties(!showProperties)}
                className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-3 h-3 mr-1" />
                Properties
              </button>
              
              <button
                onClick={() => setShowProperties(!showProperties)}
                className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left sidebar */}
          <NodeSidebar onAddNode={(type) => {
            // This will be handled by drag and drop, but we can add a click handler too
            console.log('Add node type:', type);
          }} />
          
          {/* Canvas */}
          <div className="flex-1 relative">
            <WorkflowCanvas
              onSave={handleSave}
              onExecute={handleExecute}
            />
          </div>
          
          {/* Right properties panel */}
          {showProperties && selectedNodeData && (
            <PropertiesPanel
              node={selectedNodeData}
              isOpen={showProperties}
              onClose={() => setShowProperties(false)}
              onSave={(updatedNode) => {
                // Update the node in the store
                // This will be handled by the PropertiesPanel component
                setShowProperties(false);
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}