# queuer

A simple pub/sub service that uses a queue to store messages.

If no listeners are present, messages are stored in memory until a listener is added.

Listeners receive messages in round-robin order.

## Endpoints

### POST /pub/:topic

Publishes a message to the given topic.

#### Request

```json
{
  "data": "some data"
}
```

#### Response

```json
{
  "id": "some id",
  "timestamp": "2023-09-06T14:00:00.000Z"
}
```

### GET /sub/:topic (websocket)

Subscribes to the given topic.

#### Incoming Messages

Plaintext messages verbatim as sent by the publisher

### GET /info/:topic

Returns information about the given topic.

#### Response

```json
{
  "messages": 0,
  "listeners": 0
}
```

## Usage

```bash
$ npm install
$ npm start
```

## Development

```bash
$ npm install
$ npm run dev
```

## Docker compose

```yaml
queuer:
  build:
    context: https://github.com/kxait/queuer.git
    dockerfile: Dockerfile
  restart: unless-stopped
  ports:
    - "3001:3001"
```

## Api usage

```bash
$ npm i github:kxait/queuer
```

```js
/**
 * client declaration
 */
import { QueuerClient } from 'queuer';

const client = new QueuerClient('http://localhost:3001', 'test');

/**
 * pub
 */
await client.pub('hello');

/**
 * sub (zod)
 */

const schema = z.object({ date: z.string() });

// predicate is typesafe via jsdoc
await client.sub((d) => console.log(d.date), schema);

/**
 * sub (raw)
 */

// raw data as string
await client.subRaw((d) => console.log(d));

/**
 * unsub
 */

client.unsub();

/**
 * info (# of messages, # of listeners, if currently subscribed)
 */

console.log(await client.info());
```
