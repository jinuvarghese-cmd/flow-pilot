import { FastifyInstance } from 'fastify';
import { logger } from '../utils/logger';


interface ClientConnection{
    id: string;
    tenantId: string;
    userId: string;
    send: (data: any) => void;
}

class RealtimeService {
    private connections: Map<string, ClientConnection> = new Map();

    registerWebSocket(fastify: FastifyInstance){
        fastify.get('/ws', { websocket: true }, (connection, request) => {
            const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Extract tenant ID and user ID from query params
            const tenantId = request.query.tenantId as string;
            const userId = request.query.userId as string;
            
            if (!tenantId || !userId) {
                connection.socket.close(1008, 'Tenant ID and User ID required');
                return;
            }

            const clientConnection: ClientConnection = {
                id: connectionId,
                tenantId,
                userId,
                send: (data) => {
                  try {
                    connection.socket.send(JSON.stringify(data));
                  } catch (error) {
                    logger.error(`Failed to send WebSocket message:`, error);
                  }
                }
              };

              this.connections.set(connectionId, clientConnection);

              logger.info(`WebSocket connected: ${connectionId} (tenant: ${tenantId}, user: ${userId})`);

              connection.socket.on('close', () => {
                this.connections.delete(connectionId);
                logger.info(`WebSocket disconnected: ${connectionId}`);
              });
        
              connection.socket.on('error', (error) => {
                logger.error(`WebSocket error for ${connectionId}:`, error);
                this.connections.delete(connectionId);
              });

            // Send initial connection confirmation
            clientConnection.send({
                type: 'connection_established',
                connectionId,
                timestamp: new Date().toISOString()
            });
        });
    }

    broadcastToTenant(tenantId: string, event: string, data: any) {
        const message = {
          type: event,
          data,
          timestamp: new Date().toISOString()
        };
    
        let sentCount = 0;
        this.connections.forEach((connection) => {
          if (connection.tenantId === tenantId) {
            connection.send(message);
            sentCount++;
          }
        });
    
        logger.info(`Broadcast to tenant ${tenantId}: ${event} (sent to ${sentCount} clients)`);
    }

    broadcastToUser(userId: string, event: string, data: any) {
        const message = {
          type: event,
          data,
          timestamp: new Date().toISOString()
        };
    
        let sentCount = 0;
        this.connections.forEach((connection) => {
          if (connection.userId === userId) {
            connection.send(message);
            sentCount++;
          }
        });
    
        logger.info(`Broadcast to user ${userId}: ${event} (sent to ${sentCount} clients)`);
    }

    getConnectionCount(tenantId?: string) {
        if (tenantId) {
          return Array.from(this.connections.values()).filter(c => c.tenantId === tenantId).length;
        }
        return this.connections.size;
    }

    getConnectedUsers(tenantId: string) {
        const users = new Set<string>();
        this.connections.forEach((connection) => {
          if (connection.tenantId === tenantId) {
            users.add(connection.userId);
          }
        });
        return Array.from(users);
    }
}
export const realtimeService = new RealtimeService();