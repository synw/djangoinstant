import { Centrifuge } from 'centrifuge';
import { MessageContract } from './interfaces';
import Message from './message';

const useInstant = () => {
  let csrfToken = "";
  let client: Centrifuge;
  let backendUri: string;
  let websocketsUri: string;
  const channels = new Set<Record<string, string>>();
  let verbose: boolean;
  let _onMessage: ((message: Message) => void) = (message) => console.log(JSON.stringify(message, null, "  "));
  let _setReady: (value: boolean | PromiseLike<boolean>) => void;
  const onReady = new Promise<boolean>(resolve => { _setReady = resolve; });

  const onMessage = (func: (message: Message) => void) => {
    _onMessage = func;
  }

  const getClient = () => client;

  const init = async (backendUrl: string, websocketsUrl: string, verbose = false) => {
    websocketsUri = websocketsUrl;
    backendUri = backendUrl;
    const wsToken = await _get_token();
    client = new Centrifuge(`${websocketsUri}/connection/websocket`, {
      token: wsToken,
      debug: verbose,
    });
    _setReady(true)
  }

  const connect = async (autosub = true): Promise<void> => {
    let end: (value: boolean | PromiseLike<boolean>) => void;
    const connected = new Promise<boolean>(resolve => {
      end = resolve;
    });
    client.on("connected", function () {
      end(true)
    });
    client.connect()
    await connected
    if (autosub) {
      _subscribeToAllChannels();
    }
  }

  const subscribe = () => {
    _subscribeToAllChannels();
  }

  const login = async (username: string, password: string): Promise<void> => {
    console.log("Login")
    const payload = {
      username: username,
      password: password
    }
    const opts = _postHeader(payload);
    const uri = backendUri + "/instant/login/";
    const response = await fetch(uri, opts);
    if (!response.ok) {
      console.log("Response not ok", response);
      throw new Error(response.statusText);
    }
    //const data = (await response.json()) as Record<string, any>;
  }

  const _get_token = async (): Promise<string> => {
    const opts = _postHeader({});
    const uri = backendUri + "/instant/get_token/";
    const response = await fetch(uri, opts);
    if (!response.ok) {
      console.log("Response not ok", response);
      throw new Error(response.statusText);
    }
    const data = (await response.json()) as Record<string, any>;
    _process_response(data)
    csrfToken = data.csrf_token;
    return data.ws_token
  }

  const _subscribeToAllChannels = (): void => {
    channels.forEach((c) => {
      console.log("Subscribing to", c);
      const sub = client.newSubscription(c.name, {
        token: c.token
      });
      sub.on('error', function (ctx) {
        console.log("subscription error", ctx);
      });
      if (verbose) {
        sub.on('subscribing', function (ctx) {
          console.log('------- subscribing', ctx);
        });

        sub.on('subscribed', function (ctx) {
          console.log('------- subscribed', ctx);
        });

        sub.on('unsubscribed', function (ctx) {
          console.log('------- unsubscribed', ctx);
        });
      }
      sub.on('publication', function (ctx) {
        if (verbose) {
          console.log("received publication", ctx);
          console.log(ctx)
        }
        const msg = _process_raw_message(JSON.parse(ctx.data))
        _onMessage(msg);
      });
      sub.subscribe();
    });
  }

  const _postHeader = (payload: Array<any> | Record<string, any>): RequestInit => {
    const header = {
      method: "post",
      credentials: "include",
      mode: "cors",
      body: JSON.stringify(payload)
    } as RequestInit;
    header.headers = {
      "Content-Type": "application/json",
    } as HeadersInit;
    if (csrfToken !== "") {
      header.headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      } as HeadersInit
    }
    return header;
  }

  const _process_response = (data: Record<string, any>): void => {
    console.log("Tokens", JSON.stringify(data, null, "  "));
    csrfToken = data.csrf_token;
    //client.setToken(data.ws_token);
    data.channels.forEach((c: Record<string, string>) => {
      channels.add(c);
    });
    //console.log("CHANS", channels)
  }

  const _process_raw_message = (message: Record<string, any>): Message => {
    let msg: Message;
    try {
      msg = new Message(message as MessageContract)
    } catch (e) {
      throw new Error(`Can not process message ${message} ${e}`)
    }
    return msg;
  }

  return {
    init,
    connect,
    onMessage,
    login,
    subscribe,
    getClient,
    onReady,
    channels,
  }
}

export { useInstant }