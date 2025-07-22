export class QueuerClient {
    /**
     * @param {string} baseUrl
     * @param {string} topic
     */
    constructor(baseUrl: string, topic: string);
    /**
     * @param {any} data
     * @returns {Promise<{ id: string, timestamp: Date }>}
     */
    pub(data: any): Promise<{
        id: string;
        timestamp: Date;
    }>;
    /**
     * careful now - if the message does not match the schema, it will be dropped
     *
     * @template {import('zod').ZodTypeAny} TSchema
     * @param {(parsed: import('zod').infer<TSchema>) => (void|Promise<void>)} callback
     * @param {TSchema} schema
     */
    sub<TSchema extends import("zod").ZodTypeAny>(callback: (parsed: import("zod").infer<TSchema>) => (void | Promise<void>), schema: TSchema): Promise<void>;
    /**
     * @param {(msg: string) => (void|Promise<void>)} callback
     */
    subRaw(callback: (msg: string) => (void | Promise<void>)): Promise<void>;
    unsub(): void;
    /**
     * @returns {Promise<import('../queue/queue.js').QueueInfo & { subscribed: boolean }>}
     */
    info(): Promise<import("../queue/queue.js").QueueInfo & {
        subscribed: boolean;
    }>;
    #private;
}
