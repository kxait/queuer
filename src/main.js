import fastify from 'fastify';
import websocket from '@fastify/websocket';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import * as process from 'node:process';
import {
  postPubBodySchema,
  postPubHandler,
  postPubParamsSchema,
  postPubResponseSchema,
} from './pub/pub.post.js';
import {
  getInfoSchema,
  getInfoResponseSchema,
  getInfoHandler,
} from './info.get.js';
import { getSubHandler, getSubSchema } from './sub/sub.get.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
      },
    },
    production: true,
  },
};

const fa = fastify({
  logger: envToLogger[process.env.NODE_ENV] ?? true,
  requestIdHeader: 'x-trace-id',
});

await fa.register(websocket);

fa.setSerializerCompiler(serializerCompiler);
fa.setValidatorCompiler(validatorCompiler);

fa.get(
  '/sub/:topic',
  { websocket: true, schema: { params: getSubSchema } },
  getSubHandler,
);

fa.post(
  '/pub/:topic',
  {
    schema: {
      body: postPubBodySchema,
      params: postPubParamsSchema,
      response: { 200: postPubResponseSchema },
    },
  },
  postPubHandler,
);

fa.get('/health', (_, res) => res.send('OK'));

fa.get(
  '/info/:topic',
  {
    schema: {
      params: getInfoSchema,
      response: { 200: getInfoResponseSchema },
    },
  },
  getInfoHandler,
);

fa.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fa.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
