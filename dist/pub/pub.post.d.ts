/**
 * @param {import('fastify').FastifyRequest} req
 * @param {import('fastify').FastifyReply} res
 */
export function postPubHandler(req: import("fastify").FastifyRequest, res: import("fastify").FastifyReply): Promise<never>;
export const postPubBodySchema: z.ZodObject<{
    data: z.ZodString;
}, z.core.$strip>;
export const postPubParamsSchema: z.ZodObject<{
    topic: z.ZodString;
}, z.core.$strip>;
export const postPubResponseSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodDate;
}, z.core.$strip>;
import z from 'zod';
