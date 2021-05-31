interface MessageContract {
  channel: string;
  site: string;
  message: string | undefined;
  data: Record<string, any> | Array<any> | undefined;  // eslint-disable-line
  event_class: string | undefined;
  bucket: string | undefined;
}

export { MessageContract }