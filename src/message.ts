import { MessageContract } from "./interfaces";

export default class Message {
  channelName: string;
  msg: string;
  data: Record<string, any> | Array<any>;  // eslint-disable-line
  eventClass: string;
  site: string;
  bucket: string;
  date: Date;

  constructor(message: MessageContract) {  // eslint-disable-line
    this.channelName = message.channel;
    this.site = message.site;
    this.msg = message.message === undefined ? "" : message.message;
    this.data = message.data === undefined ? {} : message.data;
    this.eventClass = message.event_class === undefined ? "" : message.event_class;
    this.bucket = message.bucket === undefined ? "" : message.bucket;
    this.date = new Date();
  }
}