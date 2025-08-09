'use client';

import React, { useState, useEffect } from 'react';
import { WorkflowStep } from '@flow-pilot/types';
import { X, Save } from 'lucide-react';

interface PropertiesPanelProps {
  node: WorkflowStep | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: WorkflowStep) => void;
}

export function PropertiesPanel({ node, isOpen, onClose, onSave }: PropertiesPanelProps) {
  const [editingNode, setEditingNode] = useState<WorkflowStep | null>(null);

  useEffect(() => {
    if (node) {
      setEditingNode({ ...node });
    }
  }, [node]);

  if (!isOpen || !editingNode) {
    return null;
  }

  const handleSave = () => {
    if (editingNode) {
      onSave(editingNode);
      onClose();
    }
  };

  const updateConfig = (key: string, value: any) => {
    if (editingNode) {
      setEditingNode({
        ...editingNode,
        config: {
          ...editingNode.config,
          [key]: value
        }
      });
    }
  };

  const updateBasicInfo = (key: string, value: any) => {
    if (editingNode) {
      setEditingNode({
        ...editingNode,
        [key]: value
      });
    }
  };

  const renderConfigForm = () => {
    switch (editingNode.type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Email
              </label>
              <input
                type="email"
                value={editingNode.config.to || ''}
                onChange={(e) => updateConfig('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={editingNode.config.subject || ''}
                onChange={(e) => updateConfig('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <textarea
                value={editingNode.config.body || ''}
                onChange={(e) => updateConfig('body', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email content..."
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={editingNode.config.url || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={editingNode.config.method || 'POST'}
                onChange={(e) => updateConfig('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headers (JSON)
              </label>
              <textarea
                value={JSON.stringify(editingNode.config.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    updateConfig('headers', headers);
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='{"Content-Type": "application/json"}'
              />
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field to Check
              </label>
              <input
                type="text"
                value={editingNode.config.field || ''}
                onChange={(e) => updateConfig('field', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="data.field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                value={editingNode.config.operator || 'equals'}
                onChange={(e) => updateConfig('operator', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="text"
                value={editingNode.config.value || ''}
                onChange={(e) => updateConfig('value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="comparison value"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (milliseconds)
              </label>
              <input
                type="number"
                value={editingNode.config.duration || 1000}
                onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>
          </div>
        );

      case 'data_transform':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={editingNode.config.operation || 'map'}
                onChange={(e) => updateConfig('operation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="map">Map</option>
                <option value="filter">Filter</option>
                <option value="merge">Merge</option>
                <option value="split">Split</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No configuration options available for this node type.
          </div>
        );
    }
  };

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Configure Node
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editingNode.name}
              onChange={(e) => updateBasicInfo('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editingNode.description || ''}
              onChange={(e) => updateBasicInfo('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Node Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Configuration</h4>
          {renderConfigForm()}
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}