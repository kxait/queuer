/**
 *
 * @param {string} topic
 * @param {QueueMessage} msg
 */
export function pub(topic: string, msg: QueueMessage): Promise<void>;
/**
 * @param {string} topic
 * @returns {QueueMessage | undefined}
 */
export function pop(topic: string): QueueMessage | undefined;
/**
 *
 * @param {string} topic
 * @param {QueueListenerCb} cb
 *
 * @returns {string} id The ID of the subscriber to refer to later
 */
export function sub(topic: string, cb: QueueListenerCb): string;
/**
 * @param {string} topic
 * @param {string} id
 */
export function unsub(topic: string, id: string): void;
/**
 * @param {string} topic
 *
 * @typedef {Object} QueueInfo
 * @property {number} QueueInfo.messages
 * @property {number} QueueInfo.listeners
 *
 * @returns {QueueInfo|undefined}
 */
export function info(topic: string): QueueInfo | undefined;
export type QueueInfo = {
    messages: number;
    listeners: number;
};
export type _QueueMessageMetadataProps = {
    enqueuedAt: Date;
    id: string;
};
export type QueueMessageMetadata = _QueueMessageMetadataProps & {
    [key: string]: any;
};
export type QueueMessage = {
    data: string;
    metadata: QueueMessageMetadata;
};
/**
 * Function that returns true if the message should not be removed from the queue
 */
export type QueueListenerCb = (msg: QueueMessage) => Promise<void>;
export type QueueListener = {
    cb: QueueListenerCb;
    id: string;
};
export type Queue = {
    messages: QueueMessage[];
    listeners: QueueListener[];
    pointer: number;
};
