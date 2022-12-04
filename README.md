# Django Instant client

[![pub package](https://img.shields.io/npm/v/djangoinstant)](https://www.npmjs.com/package/djangoinstant)

Client for the [django-instant](https://github.com/synw/django-instant) websockets backend

```
npm install djangoinstant
// or
yarn add djangoinstant
```

## Usage

Initialize the client

```typescript
import { useInstant } from "./packages/djangoinstant/client";

const instant = useInstant();

await instant.init(
    "http://localhost:8000", // backend url
    "ws://localhost:8427", // websockets url
    true // verbosity
)
```

`init` structure:

```typescript
(backendUrl: string, websocketsUrl: string, verbose?: boolean) => Promise<void>
```

### Get a websockets connection authorization

Login with Django and get credentials for websockets:

```typescript
await instant.login("some_username", "some_password");
```

If the user is already logged in just get the websockets connection credentials:

```typescript
await instant.get_token();
```

### Define handlers for messages

Define a handler function and use it for all incoming messages:

```typescript
import { Message } from "djangoinstant";

function onMessage(msg: Message): void {
  switch (msg.channelName) {
    case "public":
      // process msg
      break;
    case "$users":
      // process msg
      break;
    case "$group1":
      // process msg
      break;
    default:
      throw new Error(`Unknown channel ${msg.channelName}`)
  }
}

instant.onMessage(onMessage);
```

Message structure:

```typescript
class Message {
  channelName: string;
  msg: string;
  data: Record<string, any> | Array<any>;
  eventClass: string;
  site: string;
  bucket: string | null;
  date: Date;
}
```

### Connect to the websockets server

```typescript
await instant.connect();
console.log("Websockets connected");
```

By default the `connect` function will subscribe to all the authorized channels
for the user provided by the backend. To avoid this use `await instant.connect(false)`. To
subscribe later to all channels:

```typescript
instant.subscribe();
```

Note: a classic [centrifuge-js](https://github.com/centrifugal/centrifuge-js) client is 
accessible with `instant.getClient()`

## Example

An [example](https://github.com/synw/django-instant-example) with a backend and a frontend is available
