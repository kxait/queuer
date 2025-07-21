import { pub } from '../queue/queue.js';
import { v4 } from 'uuid';
import z from 'zod';

export const postPubBodySchema = z.object({
  data: z.string(),
});

export const postPubParamsSchema = z.object({
  topic: z.string(),
});

export const postPubResponseSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
});

/**
 * @param {import('fastify').FastifyRequest} req
 * @param {import('fastify').FastifyReply} res
 */
export async function postPubHandler(req, res) {
  const id = v4();
  const timestamp = new Date();

  const { topic } = await postPubParamsSchema.parseAsync(req.params);
  const { data } = await postPubBodySchema.parseAsync(req.body);

  await pub(topic, {
    data,
    metadata: {
      id,
      enqueuedAt: timestamp,
    },
  });

  return res.send({ id, timestamp });
}
