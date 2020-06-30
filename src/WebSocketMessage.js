/* eslint-disable prefer-object-spread */
/** @typedef {import('./WebSocketMessage').WebSocketMessageCreate} WebSocketMessageCreate */
/**
 * A model for a single socket message.
 */
export class WebSocketMessage {
  /**
   * @param {WebSocketMessageCreate} opts
   */
  constructor(opts) {
    /**
     * If the message is a binnary data this will be set to true.
     *
     * @type {Boolean}
     */
    this.isBinary = undefined;
    /**
     * A message sent to / received from the server.
     *
     * @type {String|ArrayBuffer|Blob}
     */
    this.message = opts.message;
    /**
     * A direction of the message. Either "in" or "out".
     */
    this.direction = opts.direction;
    /**
     * An event time.
     */
    this.time = opts.time;
  }

  set message(msg) {
    if ((msg instanceof Blob) || (msg instanceof ArrayBuffer)) {
      this.isBinary = true;
    } else {
      this.isBinary = false;
    }
    this._message = msg || '(empty message)';
  }

  get message() {
    return this._message;
  }

  set time(time) {
    if (time instanceof Date) {
      this._time = time;
    } else {
      const typed = Number(time);
      if (Number.isNaN(typed)) {
        this._time = new Date();
      } else {
        this._time = new Date(time);
      }
    }
  }

  get time() {
    return this._time;
  }

  toJSON() {
    const copy = Object.assign({}, this);
    const keys = Object.keys(copy);
    const under = keys.filter((key) => key.indexOf('_') === 0);
    under.forEach((key) => {
      const realKey = key.substr(1);
      copy[realKey] = copy[key];
      delete copy[key];
    });
    copy.time = copy.time.getTime();
    return copy;
  }
}
