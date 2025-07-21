/**
 * @typedef {Object} _QueueMessageMetadataProps
 * @property {Date} enqueuedAt
 * @property {string} id
 *
 * @typedef {_QueueMessageMetadataProps & { [key: string]: any }} QueueMessageMetadata
 *
 * @typedef {Object} QueueMessage
 * @property {string} data
 * @property {QueueMessageMetadata} metadata
 *
 * @typedef {(msg: QueueMessage) => Promise<void>} QueueListenerCb Function that returns true if the message should not be removed from the queue
 *
 * @typedef {Object} QueueListener
 * @property {QueueListenerCb} cb
 * @property {string} id
 *
 * @typedef {Object} Queue
 * @property {QueueMessage[]} messages
 * @property {QueueListener[]} listeners
 * @property {number} pointer
 */

/**
 * @type {Record<string, Queue>}
 */
const queuesByTopic = {};

/**
 *
 * @param {string} topic
 * @param {QueueMessage} msg
 */
export async function pub(topic, msg) {
  if (!queuesByTopic[topic]) {
    queuesByTopic[topic] = newQueue();
  }

  const queue = queuesByTopic[topic];

  const succeeded = await deliver(queue, msg);

  if (!succeeded) {
    queue.messages.push(msg);
  }
}

/**
 * @param {Queue} queue
 * @param {QueueMessage} msg
 *
 * @returns {Promise<boolean>} true if the message was delivered
 */
async function deliver(queue, msg) {
  if (queue.listeners.length === 0) {
    return false;
  }

  if (queue.pointer >= queue.listeners.length) {
    queue.pointer = 0;
  }

  const listener = queue.listeners[queue.pointer++];
  try {
    await listener.cb(msg);
  } catch (e) {
    console.error(
      `delivery of message ${msg.metadata.id} to listener id ${listener.id} resulted in exception caught, this message will not be redelivered`,
      e,
    );
  }

  return true;
}

/**
 * @param {string} topic
 * @returns {QueueMessage | undefined}
 */
export function pop(topic) {
  const queue = queuesByTopic[topic];
  if (!queue) {
    return;
  }
  return queue.messages.shift();
}

/**
 *
 * @param {string} topic
 * @param {QueueListenerCb} cb
 *
 * @returns {string} id The ID of the subscriber to refer to later
 */
export function sub(topic, cb) {
  if (!queuesByTopic[topic]) {
    queuesByTopic[topic] = newQueue();
  }

  const queue = queuesByTopic[topic];

  const id = Math.random().toString(36).slice(2);
  queue.listeners.push({ id, cb });

  /**
   * if this is the first listener, deliver all messages
   *
   * @type {QueueMessage|undefined}
   */
  let message;
  while ((message = pop(topic))) {
    deliver(queue, message);
  }

  return id;
}

/**
 * @param {string} topic
 * @param {string} id
 */
export function unsub(topic, id) {
  const queue = queuesByTopic[topic];
  if (!queue) {
    throw new Error(
      `Cannot unsubscribe: queue for topic ${topic} does not exist`,
    );
  }

  queue.listeners = queue.listeners.filter((listener) => listener.id !== id);
}

/**
 * @param {string} topic
 *
 * @typedef {Object} QueueInfo
 * @property {number} QueueInfo.messages
 * @property {number} QueueInfo.listeners
 *
 * @returns {QueueInfo|undefined}
 */
export function info(topic) {
  const queue = queuesByTopic[topic];
  if (!queue) {
    return;
  }

  return {
    messages: queue.messages.length,
    listeners: queue.listeners.length,
  };
}

function newQueue() {
  return {
    messages: [],
    listeners: [],
    pointer: 0,
  };
}
