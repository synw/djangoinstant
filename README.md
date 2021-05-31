# Instantjs

Client for the [django-instant](https://github.com/synw/django-instant) websockets backend

```
npm install instantjs
// or
yarn add instantjs
```

## Usage

Initialize the client

```typescript
import { Instant } from "instantjs";

const instant = new Instant(
  "http://localhost:8000", // Django backend's address
  "ws://localhost:8001", // Centrifugo server's address
  true, // verbosity (optional, default: false)
);
```

A classic [centrifuge-js](https://github.com/centrifugal/centrifuge-js) client is 
accessible with `instant.client`

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
import { Message } from "instantjs";

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

instant.onMessage = onMessage;
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
for the user provided by the backend. To avoid this use `await instant.connect(false)`