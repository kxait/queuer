/**
 * @param {import('fastify').FastifyRequest} req
 * @param {import('fastify').FastifyReply} res
 */
export function getInfoHandler(req: import("fastify").FastifyRequest, res: import("fastify").FastifyReply): Promise<never>;
export const getInfoSchema: z.ZodObject<{
    topic: z.ZodString;
}, z.core.$strip>;
export const getInfoResponseSchema: z.ZodObject<{
    messages: z.ZodNumber;
    listeners: z.ZodNumber;
}, z.core.$strip>;
import z from 'zod';
