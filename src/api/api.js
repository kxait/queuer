import z from 'zod';

class QueuerClient {
  /**
   * @type {string}
   */
  #baseUrl;

  /**
   * @type {string}
   */
  #topic;

  /**
   * @type {WebSocket | undefined}
   */
  #subWs;

  /**
   * @param {string} baseUrl
   * @param {string} topic
   */
  constructor(baseUrl, topic) {
    this.#baseUrl = baseUrl;
    this.#topic = topic;
  }

  /**
   * @param {any} data
   * @returns {Promise<{ id: string, timestamp: Date }>}
   */
  async pub(data) {
    const body = (() => {
      if (typeof data === 'object') {
        return JSON.stringify(data);
      }
      return data;
    })();

    const response = await fetch(`${this.#baseUrl}/pub/${this.#topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: body }),
    });

    const json = await response.json();

    const parsed = z
      .object({
        id: z.string(),
        timestamp: z.string(),
      })
      .parse(json);

    return {
      id: parsed.id,
      timestamp: new Date(parsed.timestamp),
    };
  }

  /**
   * careful now - if the message does not match the schema, it will be dropped
   *
   * @template {import('zod').ZodTypeAny} TSchema
   * @param {(parsed: import('zod').infer<TSchema>) => (void|Promise<void>)} callback
   * @param {TSchema} schema
   */
  async sub(callback, schema) {
    if (this.#subWs) {
      throw new Error(
        `Cannot subscribe to topic ${this.#topic}: already subscribed`,
      );
    }

    const { promise, resolve } = Promise.withResolvers();

    const wsGen = this.#wsFactory();
    (async () => {
      resolve('');
      for await (const ws of wsGen) {
        ws.onmessage = (msg) => {
          try {
            const parsed = schema.parse(JSON.parse(msg.data));
            // fire and forget if this is async
            callback(parsed);
          } catch (e) {
            console.error(
              `Queuer client for topic ${
                this.#topic
              } received invalid message from server, dropping message`,
              e,
            );
          }
        };
        this.#subWs = ws;
        await new Promise((res) => {
          ws.onclose = res;
        });
      }
    })();

    await promise;
  }

  /**
   * @param {(msg: string) => (void|Promise<void>)} callback
   */
  async subRaw(callback) {
    if (this.#subWs) {
      throw new Error(
        `Cannot subscribe to topic ${this.#topic}: already subscribed`,
      );
    }

    const { promise, resolve } = Promise.withResolvers();

    const wsGen = this.#wsFactory();
    (async () => {
      resolve('');
      for await (const ws of wsGen) {
        ws.onmessage = (msg) => {
          try {
            // fire and forget if this is async
            callback(msg.data);
          } catch (e) {
            console.error(
              `Queuer client for topic ${
                this.#topic
              } received invalid message from server, dropping message`,
              e,
            );
          }
        };
        this.#subWs = ws;

        await new Promise((res) => {
          ws.onclose = res;
        });
      }
    })();

    await promise;
  }

  unsub() {
    this.#subWs?.close();
    this.#subWs = undefined;
  }

  /**
   * @returns {Promise<import('../queue/queue.js').QueueInfo & { subscribed: boolean }>}
   */
  async info() {
    const res = await fetch(`${this.#baseUrl}/info/${this.#topic}`);
    const data = res.json();
    const parsed = z
      .object({
        messages: z.number(),
        listeners: z.number(),
      })
      .parse(data);

    return {
      ...parsed,
      subscribed: this.#subWs !== undefined,
    };
  }

  async *#wsFactory() {
    let shouldStop = false;
    while (!shouldStop) {
      const ws = new WebSocket(`${this.#baseUrl}/sub/${this.#topic}`);

      const { promise: onopenPromise, resolve: onopenResolve } =
        Promise.withResolvers();
      const { promise: onerrorPromise, resolve: onerrorResolve } =
        Promise.withResolvers();

      ws.onerror = (err) => {
        console.error(
          `Queuer client for topic ${this.#topic} encountered error`,
          err,
        );
        onerrorResolve(err);
      };
      ws.onopen = () => onopenResolve(ws);
      await Promise.race([onopenPromise, onerrorPromise]);

      if (ws.readyState !== WebSocket.OPEN) {
        await new Promise((res) => setTimeout(res, 5000));
        continue;
      }

      const actualClose = ws.close;
      ws.close = () => {
        shouldStop = true;
        actualClose();
      };

      yield ws;
    }
  }
}

export { QueuerClient };
