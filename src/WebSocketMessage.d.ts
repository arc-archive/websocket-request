export declare interface WebSocketMessageCreate {
  message: string|ArrayBuffer|Blob|File;
  direction: string;
  time: Date;
}

/**
 * A model for a single socket message.
 */
export declare class WebSocketMessage {
  /**
   * If the message is a binnary data this will be set to true.
   */
  isBinary: boolean;
  message: string|ArrayBuffer|Blob|File;
  time: number;
  constructor(opts: WebSocketMessageCreate);
  toJSON(): object;
}
