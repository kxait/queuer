/**
 * @param {import('@fastify/websocket').WebSocket} socket
 * @param {import('fastify').FastifyRequest} req
 */
export function getSubHandler(socket: import("@fastify/websocket").WebSocket, req: import("fastify").FastifyRequest): Promise<void>;
export const getSubSchema: z.ZodObject<{
    topic: z.ZodString;
}, z.core.$strip>;
import z from 'zod';
