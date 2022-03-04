import Centrifuge from 'centrifuge';
import { MessageContract } from './interfaces';
import Message from './message';

export default class Instant {
  csrfToken = "";
  client: Centrifuge;
  backendUri: string;
  websocketsUri: string;
  channels = new Set<Record<string, string>>();
  verbose: boolean;
  _onMessage: ((message: Message) => void) = (message) => console.log(JSON.stringify(message, null, "  ")); // eslint-disable-line

  constructor(backendUri: string, websocketsUri: string, verbose = false) {
    this.backendUri = backendUri;
    this.websocketsUri = websocketsUri;
    this.verbose = verbose;
    this.client = new Centrifuge(`${this.websocketsUri}/connection/websocket`, {
      subscribeEndpoint: `${this.backendUri}/instant/subscribe/`,
      debug: verbose
    });
  }

  set onMessage(func: (message: Message) => void) { // eslint-disable-line
    this._onMessage = func;
  }

  async connect(autosub = true): Promise<void> {
    if (autosub) {
      this._subscribeToAllChannels();
    }
    let end: (value: boolean | PromiseLike<boolean>) => void;
    const connected = new Promise<boolean>(resolve => {
      end = resolve;
    });
    this.client.on("connect", function () {
      end(true)
    });
    this.client.connect()
    await connected
  }

  _subscribeToAllChannels(): void {
    this.channels.forEach((c) => {
      this.client.subscribe(c.name, (message: Record<string, any>) => {// eslint-disable-line
        if (this.verbose) {
          console.log(message)
        }
        const msg = this._process_raw_message(JSON.parse(message.data))
        this._onMessage(msg);
      })
    });
  }

  async login(username: string, password: string): Promise<void> {
    console.log("Login")
    const payload = {
      username: username,
      password: password
    }
    const opts = this.postHeader(payload);
    const uri = this.backendUri + "/instant/login/";
    const response = await fetch(uri, opts);
    if (!response.ok) {
      console.log("Response not ok", response);
      throw new Error(response.statusText);
    }
    const data = (await response.json()) as Record<string, any>;// eslint-disable-line
    this._process_response(data)
  }

  async get_token(): Promise<void> {
    const opts = this.postHeader({});
    const uri = this.backendUri + "/instant/get_token/";
    const response = await fetch(uri, opts);
    if (!response.ok) {
      console.log("Response not ok", response);
      throw new Error(response.statusText);
    }
    const data = (await response.json()) as Record<string, any>;// eslint-disable-line
    this._process_response(data)
  }

  postHeader(payload: Array<any> | Record<string, any>): RequestInit { // eslint-disable-line
    const header = {
      method: "post",
      credentials: "include",
      mode: "cors",
      body: JSON.stringify(payload)
    } as RequestInit;
    header.headers = {
      "Content-Type": "application/json",
    } as HeadersInit;
    if (this.csrfToken !== "") {
      header.headers = {
        "Content-Type": "application/json",
        "X-CSRFToken": this.csrfToken
      } as HeadersInit
    }
    return header;
  }

  _process_response(data: Record<string, any>): void {// eslint-disable-line
    console.log("Tokens", JSON.stringify(data, null, "  "));
    this.csrfToken = data.csrf_token;
    this.client.setToken(data.ws_token);
    data.channels.forEach((c: Record<string, string>) => {
      this.channels.add(c);
    });
  }

  _process_raw_message(message: Record<string, any>): Message {// eslint-disable-line
    let msg: Message;
    try {
      msg = new Message(message as MessageContract)
    } catch (e) {
      throw new Error(`Can not process message ${message} ${e}`)
    }
    return msg;
  }
}