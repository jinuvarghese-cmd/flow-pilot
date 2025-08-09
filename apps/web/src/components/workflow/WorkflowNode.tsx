'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowStep } from '@flow-pilot/types';
import { 
  Mail, 
  Webhook, 
  GitBranch, 
  Clock, 
  Database, 
  Play,
  Zap
} from 'lucide-react';

interface WorkflowNodeProps {
    data: WorkflowStep & {
      isSelected?: boolean;
      isExecuting?: boolean;
      executionStatus?: string;
    };
    isConnectable: boolean;
  }

const getNodeIcon = (type: string) => {
    switch (type) {
        case 'trigger':
        return <Play className="w-4 h-4" />;
        case 'email':
        return <Mail className="w-4 h-4" />;
        case 'webhook':
        return <Webhook className="w-4 h-4" />;
        case 'condition':
        return <GitBranch className="w-4 h-4" />;
        case 'delay':
        return <Clock className="w-4 h-4" />;
        case 'data_transform':
        return <Database className="w-4 h-4" />;
        case 'action':
        return <Zap className="w-4 h-4" />;
        default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
};

const getNodeColor = (type: string) => {
    switch (type) {
        case 'trigger':
        return 'bg-green-100 border-green-300 text-green-800';
        case 'email':
        return 'bg-blue-100 border-blue-300 text-blue-800';
        case 'webhook':
        return 'bg-purple-100 border-purple-300 text-purple-800';
        case 'condition':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        case 'delay':
        return 'bg-orange-100 border-orange-300 text-orange-800';
        case 'data_transform':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
        case 'action':
        return 'bg-red-100 border-red-300 text-red-800';
        default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
};

const getExecutionStatusColor = (status?: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 shadow-lg animate-pulse';
      case 'completed':
        return 'border-green-500 shadow-lg';
      case 'failed':
        return 'border-red-500 shadow-lg';
      default:
        return '';
    }
};

export const WorkflowNode = memo(({ data, isConnectable }: WorkflowNodeProps) => {
    const nodeColorClass = getNodeColor(data.type);
    const executionClass = getExecutionStatusColor(data.executionStatus);
    const selectedClass = data.isSelected ? 'ring-2 ring-blue-500' : '';

    return(<div className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[150px] max-w-[200px] 
        ${nodeColorClass} ${executionClass} ${selectedClass}
        shadow-sm hover:shadow-md transition-all duration-200
        ${data.isExecuting ? 'animate-pulse' : ''}
    `}>
        {/* Input Handle */}
        {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
        )}

        {/* Node Content */}
      <div className="flex items-center space-x-2">
        {getNodeIcon(data.type)}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {data.name}
          </div>
          {data.description && (
            <div className="text-xs opacity-70 truncate">
              {data.description}
            </div>
          )}
        </div>
      </div>

      {/* Execution Status Indicator */}
      {data.executionStatus && (
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white">
          {data.executionStatus === 'running' && (
            <div className="w-full h-full bg-blue-500 rounded-full animate-pulse" />
          )}
          {data.executionStatus === 'completed' && (
            <div className="w-full h-full bg-green-500 rounded-full" />
          )}
          {data.executionStatus === 'failed' && (
            <div className="w-full h-full bg-red-500 rounded-full" />
          )}
        </div>
      )}

      {/* Output Handle */}
      {data.type !== 'action' && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
      )}

      {/* Condition node has multiple outputs */}
      {data.type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            isConnectable={isConnectable}
            className="w-3 h-3 !bg-green-500 border-2 border-white"
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            isConnectable={isConnectable}
            className="w-3 h-3 !bg-red-500 border-2 border-white"
            style={{ top: '70%' }}
          />
        </>
      )}

    </div>)
})

WorkflowNode.displayName = 'WorkflowNode';