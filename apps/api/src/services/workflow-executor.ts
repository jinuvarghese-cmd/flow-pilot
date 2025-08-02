import { PrismaClient } from '@prisma/client';
import { workflowQueue, emailQueue, webhookQueue, dataProcessingQueue } from '../config/queues';
import { logger } from '../utils/logger';
import { WorkflowStep, WorkflowExecution } from '@flow-pilot/types';

const prisma = new PrismaClient();

export class WorkflowExecutor {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async executeWorkflow(workflowId: string, tenantId: string, initialData: any = {}) {
        try{
            const workflow = await this.prisma.workflow.findUnique({
                where:{
                    id: workflowId,
                }
            })

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // Create execution record
            const execution = await this.prisma.workflowExecution.create({
                data: {
                    workflowId,
                    tenantId,
                    status: 'PENDING',
                    currentStep: 0,
                    data: initialData,
                }
            });

            logger.info(`Starting workflow execution: ${execution.id}`);

            // Add to job queue
            await workflowQueue.addJob(
                'workflow-execution',
                {
                executionId: execution.id,
                workflowId,
                tenantId,
                steps: workflow.steps as WorkflowStep[],
                data: initialData
                },
                tenantId
            );
            return execution;

        } catch (error) {
            logger.error('Failed to start workflow execution:', error);
            throw error;
        }      
    }
    
    async processWorkflowStep(executionId: string, stepIndex: number, data: any) {
        try {
          const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { workflow: true }
          });

          if (!execution) {
            throw new Error('Execution not found');
          }

          const steps = execution.workflow.steps as WorkflowStep[];
          const currentStep = steps[stepIndex];

          if (!currentStep) {
            // Workflow completed
            await this.completeExecution(executionId, data);
            return { status: 'completed', data };
          }
          
          // Update execution status
            await this.prisma.workflowExecution.update({
                where: { id: executionId },
                data: {
                status: 'RUNNING',
                currentStep: stepIndex,
                data
                }
            });
        
            logger.info(`Processing step ${stepIndex}: ${currentStep.type}`);

            // Execute step based on type
            const result = await this.executeStep(currentStep, data, execution.tenantId);

            // Move to next step
            return await this.processWorkflowStep(executionId, stepIndex + 1, result);
        } catch (error) {
            logger.error(`Error processing step ${stepIndex}:`, error);
            await this.failExecution(executionId, error.message);
            throw error;
        }
    }

    private async executeStep(step: WorkflowStep, data: any, tenantId: string) {
        switch (step.type) {
          case 'email':
            return await this.executeEmailStep(step, data, tenantId);
          case 'webhook':
            return await this.executeWebhookStep(step, data, tenantId);
          case 'condition':
            return await this.executeConditionStep(step, data);
          case 'delay':
            return await this.executeDelayStep(step, data, tenantId);
          case 'data_transform':
            return await this.executeDataTransformStep(step, data);
          case 'action':
            return await this.executeActionStep(step, data, tenantId);
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }
    }

    private async executeEmailStep(step: WorkflowStep, data: any, tenantId: string) {
        const emailConfig = step.config;
        
        // Add to email queue
        await emailQueue.addJob(
          'email-send',
          {
            to: emailConfig.to,
            subject: emailConfig.subject,
            body: emailConfig.body,
            template: emailConfig.template,
            variables: { ...data, ...emailConfig.variables }
          },
          tenantId
        );
    
        return { ...data, emailSent: true, emailTo: emailConfig.to };
    }

    private async executeWebhookStep(step: WorkflowStep, data: any, tenantId: string) {
        const webhookConfig = step.config;
        
        // Add to webhook queue
        await webhookQueue.addJob(
          'webhook-trigger',
          {
            url: webhookConfig.url,
            method: webhookConfig.method || 'POST',
            headers: webhookConfig.headers || {},
            body: { ...data, ...webhookConfig.body }
          },
          tenantId
        );
    
        return { ...data, webhookTriggered: true, webhookUrl: webhookConfig.url };
    }

    private async executeConditionStep(step: WorkflowStep, data: any) {
        const conditionConfig = step.config;
        const fieldValue = this.getNestedValue(data, conditionConfig.field);
        
        let conditionMet = false;
        
        switch (conditionConfig.operator) {
          case 'equals':
            conditionMet = fieldValue === conditionConfig.value;
            break;
          case 'not_equals':
            conditionMet = fieldValue !== conditionConfig.value;
            break;
          case 'contains':
            conditionMet = String(fieldValue).includes(String(conditionConfig.value));
            break;
          case 'greater_than':
            conditionMet = Number(fieldValue) > Number(conditionConfig.value);
            break;
          case 'less_than':
            conditionMet = Number(fieldValue) < Number(conditionConfig.value);
            break;
          default:
            throw new Error(`Unknown condition operator: ${conditionConfig.operator}`);
        }
    
        return { 
          ...data, 
          conditionResult: conditionMet,
          conditionPath: conditionMet ? conditionConfig.truePath : conditionConfig.falsePath
        };
      }

      private async executeDelayStep(step: WorkflowStep, data: any, tenantId: string) {
        const delayConfig = step.config;
        const delayMs = delayConfig.duration || 1000; // Default 1 second
        
        // Add delayed job
        await workflowQueue.addJob(
          'workflow-execution',
          { continueExecution: true, data },
          tenantId,
          { delay: delayMs }
        );
    
        return { ...data, delayed: true, delayMs };
      }

      private async executeDataTransformStep(step: WorkflowStep, data: any) {
        const transformConfig = step.config;
        
        switch (transformConfig.operation) {
          case 'map':
            return this.transformMap(data, transformConfig);
          case 'filter':
            return this.transformFilter(data, transformConfig);
          case 'merge':
            return this.transformMerge(data, transformConfig);
          case 'split':
            return this.transformSplit(data, transformConfig);
          default:
            throw new Error(`Unknown transform operation: ${transformConfig.operation}`);
        }
      }

      private async executeActionStep(step: WorkflowStep, data: any, tenantId: string) {
        const actionConfig = step.config;
        
        // Add to data processing queue
        await dataProcessingQueue.addJob(
          'data-processing',
          {
            action: actionConfig.action,
            data,
            config: actionConfig
          },
          tenantId
        );
    
        return { ...data, actionExecuted: true, action: actionConfig.action };
      }
      
      private transformMap(data: any, config: any) {
        const renameFields = (item: any) => {
          const result = { ...item };
          Object.entries(config.mapping).forEach(([oldKey, newKey]) => {
            if (item.hasOwnProperty(oldKey)) {
              result[newKey as string] = item[oldKey];
              delete result[oldKey];
            }
          });
          return result;
        };
      
        if (Array.isArray(data)) {
          return data.map(renameFields);
        }
        return renameFields(data);
      }
    
      // did not undertstand
      private transformFilter(data: any, config: any) {
        if (Array.isArray(data)) {
          return data.filter(item => {
            const fieldValue = this.getNestedValue(item, config.field);
            return this.evaluateCondition(fieldValue, config.condition);
          });
        }
        return data;
      }

     // did not undertstand
      private getNestedValue(obj: any, path: string) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
      }

      // did not undertstand
      private evaluateCondition(value: any, condition: any) {
        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'not_equals':
            return value !== condition.value;
          case 'contains':
            return String(value).includes(String(condition.value));
          default:
            return false;
        }
      }

      private async completeExecution(executionId: string, finalData: any) {
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: {
            status: 'COMPLETED',
            result: finalData,
            completedAt: new Date()
          }
        });
    
        logger.info(`Workflow execution completed: ${executionId}`);
      }

      private async failExecution(executionId: string, error: string) {
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: {
            status: 'FAILED',
            error,
            completedAt: new Date()
          }
        });
    
        logger.error(`Workflow execution failed: ${executionId} - ${error}`);
      }

      async getExecutionStatus(executionId: string) {
        return await this.prisma.workflowExecution.findUnique({
          where: { id: executionId },
          include: { workflow: true }
        });
      }

      async getExecutionsByWorkflow(workflowId: string) {
        return await this.prisma.workflowExecution.findMany({
          where: { workflowId },
          orderBy: { createdAt: 'desc' }
        });
      }

      async cancelExecution(executionId: string) {
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: {
            status: 'CANCELLED',
            completedAt: new Date()
          }
        });
    
        logger.info(`Workflow execution cancelled: ${executionId}`);
      }
    
}

export const workflowExecutor = new WorkflowExecutor();