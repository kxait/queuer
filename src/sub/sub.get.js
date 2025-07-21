import { sub, unsub } from '../queue/queue.js';
import z from 'zod';

export const getSubSchema = z.object({ topic: z.string() });

/**
 * @param {import('@fastify/websocket').WebSocket} socket
 * @param {import('fastify').FastifyRequest} req
 */
export async function getSubHandler(socket, req) {
  const { topic } = await getSubSchema.parseAsync(req.params);

  const id = sub(topic, async (msg) => {
    socket.send(msg.data);
  });

  socket.on('close', () => unsub(topic, id));
}
