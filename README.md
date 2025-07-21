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
