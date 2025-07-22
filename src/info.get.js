import { info } from './queue/queue.js';
import z from 'zod';

export const getInfoSchema = z.object({ topic: z.string() });

export const getInfoResponseSchema = z.object({
  messages: z.number(),
  listeners: z.number(),
});

/**
 * @param {import('fastify').FastifyRequest} req
 * @param {import('fastify').FastifyReply} res
 */
export async function getInfoHandler(req, res) {
  const { topic } = await getInfoSchema.parseAsync(req.params);

  const inf = info(topic);

  if (!inf) {
    res.status(404).send();
    return;
  }

  return res.send(inf);
}
