'use client';

import React from 'react';
import { 
  Mail, 
  Webhook, 
  GitBranch, 
  Clock, 
  Database, 
  Play,
  Zap,
  Plus
} from 'lucide-react';

interface NodeType {
    type: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const nodeTypes: NodeType[] = [
    {
      type: 'trigger',
      name: 'Trigger',
      description: 'Start the workflow',
      icon: <Play className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      type: 'email',
      name: 'Send Email',
      description: 'Send an email message',
      icon: <Mail className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      type: 'webhook',
      name: 'Webhook',
      description: 'Call an external API',
      icon: <Webhook className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    {
      type: 'condition',
      name: 'Condition',
      description: 'Branch based on data',
      icon: <GitBranch className="w-5 h-5" />,
      color: 'text-yellow-600'
    },
    {
      type: 'delay',
      name: 'Delay',
      description: 'Wait for a specified time',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-orange-600'
    },
    {
      type: 'data_transform',
      name: 'Transform Data',
      description: 'Modify or transform data',
      icon: <Database className="w-5 h-5" />,
      color: 'text-indigo-600'
    },
    {
        type: 'action',
        name: 'Custom Action',
        description: 'Execute custom logic',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-red-600'
    }
];

interface NodeSidebarProps {
    onAddNode: (nodeType: string) => void;
}

export function NodeSidebar({ onAddNode }: NodeSidebarProps) {
    const handleDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
      };

      return (
        <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Workflow Nodes
            </h2>
            
            <div className="space-y-2">
              {nodeTypes.map((nodeType) => (
                <div
                  key={nodeType.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
                  onClick={() => onAddNode(nodeType.type)}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${nodeType.color}`}>
                      {nodeType.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">
                        {nodeType.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {nodeType.description}
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
    
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-sm text-blue-900 mb-2">
                How to use:
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Drag nodes onto the canvas</li>
                <li>• Connect nodes by dragging from handles</li>
                <li>• Click nodes to configure them</li>
                <li>• Save and test your workflow</li>
              </ul>
            </div>
          </div>
        </div>
    );
}