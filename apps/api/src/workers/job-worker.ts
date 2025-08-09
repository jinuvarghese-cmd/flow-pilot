import { workflowQueue, emailQueue, webhookQueue, dataProcessingQueue } from '../config/queues';
import { processWorkflowJob, processEmailJob, processWebhookJob, processDataProcessingJob } from '../services/job-processors';
import { logger } from '../utils/logger';

class JobWorker {
    private isRunning =  false;

    private pollingInterval = 1000;

    async start() {
        if(this.isRunning) {
            logger.warn('Job worker is already running');
            return;
        }
        this.isRunning = true;
        logger.info('Job worker started');

        while(this.isRunning) {
            try{
                await this.processQueues();
                await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
            }catch(error){
                logger.error('Job worker error:', error);
                await new Promise(resolve => setTimeout(resolve, this.pollingInterval * 2));
            }
        }
    }

    async stop(){
        this.isRunning = false;
        logger.info('Job worker stopped');
    }

    private async processQueues(){
        await this.processQueue(workflowQueue,  'workflow-execution', processWorkflowJob);
        await this.processQueue(emailQueue, 'email-send', processEmailJob);
        await this.processQueue(webhookQueue, 'webhook-trigger', processWebhookJob);
        await this.processQueue(dataProcessingQueue, 'data-processing', processDataProcessingJob);
    }

    private async processQueue(queue: any, type: string, processor: (data: any) => Promise<any>){
        try{
            const jobs = await queue.getJobsByTenant('*', 'PENDING');

            for(const job of jobs.slice(0, 5)){
                try{
                    logger.info(`Processing ${type} job: ${job.jobId}`);

                    // Update job status to processing
                    await queue.updateJobProgress(job.jobId, 10);

                    // Process the job
                    const result =  await processor(job.data);

                    await queue.completeJob(job.jobId, result);

                    logger.info(`${type} job completed: ${job.jobId}`);
                }catch(error){
                    logger.error(`Failed to process ${type} job: ${job.jobId}`, error);
                    await queue.failJob(job.jobId, error.message);
                }
            }
        }catch(error){
            logger.error(`Error processing ${type} jobs`, error);
        }
    }
}

export const jobWorker = new JobWorker();


if(require.main === module){
    jobWorker.start().catch(error => {
        logger.error('Job worker error:', error);
        process.exit(1);
    });
}