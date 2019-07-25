/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import '@advanced-rest-client/web-socket/web-socket.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/file-drop/file-drop.js';
import '@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
import '@advanced-rest-client/arc-models/websocket-url-history-model.js';
/**
 * A model for a single socket message.
 */
export class WebSocketMessage {
  /**
   * @param {Object} opts
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
     *
     * @type {enum:["in","out"]}
     */
    this.direction = opts.direction;
    /**
     * An event time.
     *
     * @type {Date}
     */
    this.time = opts.time;
  }

  set message(msg) {
    /* global ArrayBuffer */
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
    } else if (!isNaN(time)) {
      this._time = new Date(time);
    } else {
      this._time = new Date();
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
/**
 * Web socket request panel
 *
 * Contains an UI and logic to make a connection to a websocket server and
 * send and receive messages.
 *
 * ### Example
 *
 * ```html
 * <websocket-request messages="{{messages}}" connected="{{connected}}">
 * </websocket-request>
 * ```
 *
 * ## Required dependency
 *
 * The element requires to `arc-models/websocket-url-history-model.html`
 * component to be placed in the DOM. It can be any other component that
 * handles `websocket-url-history-read`, `websocket-url-history-changed`
 * and `websocket-url-history-query` events.
 *
 * ### Styling
 *
 * `<websocket-request>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--arc-font-body1-font-size` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-body1-font-weight` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-body1-line-height` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-headline-font-size` | ARC theme. Applied to the title | `initial`
 * `--arc-font-headline-font-weight` | ARC theme. Applied to the title | `initial`
 * `--arc-font-headline-letter-spacing` | ARC theme. Applied to the title | `initial`
 * `--arc-font-headline-line-height` | ARC theme. Applied to the title | `initial`
 * `--action-button-background-color` | ARC theme. Applied to action button | ``
 * `--action-button-background-image` | ARC theme. Applied to action button | ``
 * `--action-button-color` | ARC theme. Applied to action button | ``
 * `--action-button-transition`| ARC theme. Applied to action button | ``
 *
 *
 * @customElement
 * @demo demo/index.html
 * @memberof ApiElements
 */
export class WebsocketRequest extends LitElement {
  static get styles() {
    return css`:host {
      display: block;
      position: relative;
      font-size: var(--arc-font-body1-font-size, inherit);
      font-weight: var(--arc-font-body1-font-weight, inherit);
      line-height: var(--arc-font-body1-line-height, inherit);
    }

    .connection-info,
    .connection-input {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 12px;
    }

    :host([narrow]) .connection-input {
      display: flex;
      flex-direction: column;
      align-items: initial;
    }

    .url-input,
    .connection-info p {
      flex: 1;
      flex-basis: 0.000000001px;
    }

    .connection-info p {
      height: 62px;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .connection-info b {
      margin-left: 4px;
      font-weight: 500;
    }

    :host([narrow]) .connection-info {
      align-items: initial;
      flex-direction: column;
    }

    :host([narrow]) .connection-info p {
      flex-direction: column;
      margin-bottom: 8px;
    }

    .action-button {
      height: 40px;
      background-color: var(--action-button-background-color);
      background-image: var(--action-button-background-image);
      color: var(--action-button-color);
      transition: var(--action-button-transition);
    }

    .action-button:not([disabled]):hover {
      background-color: var(--action-button-hover-background-color);
      color: var(--action-button-hover-color);
    }

    .action-button[disabled] {
      background: var(--action-button-disabled-background-color);
      color: var(--action-button-disabled-color);
      cursor: auto;
      pointer-events: none;
    }

    paper-autocomplete {
      bottom: 0;
    }

    .send-file {
      margin: 20px;
    }`;
  }

  render() {
    const { connected, connecting, retrying, url, _connectDisabled, autoReconnect, _urlInput, selectedTab } = this;
    return html`<div class="connection-status">

      ${connected ?
        html`<div class="connection-info">
          <p>Connected to <b>${url}</b></p>
          <paper-button @click="${this.disconnect}" raised>Disconnect</paper-button>
        <div>` :
        html`<div class="connection-input">
          <paper-input
          id="socketUrl"
          label="Socket URL"
          .value="${url}"
          @keydown="${this._urlKeyDown}"
          @input="${this._urlInputHandler}"
          class="url-input"></paper-input>
        <paper-button raised class="action-button"
          ?disabled="${_connectDisabled}"
          @click="${this.connect}">Connect</paper-button>
        </div>`}
      </div>
      <paper-checkbox
        .checked="${autoReconnect}"
        @checked-changed="${this._autoReconnectHandler}">Reconnect automatically</paper-checkbox>
    </div>

    ${connecting ? html`<div class="connecting-info">
      <p>Connecting to the remote server...</p>
      <paper-progress indeterminate></paper-progress>
    </div>`: undefined}

    ${retrying ? html`<h3>Connection lost</h3>
    <p>Trying to reconnect.</p>` : undefined}

    ${connected ? html`<div class="message-editor">
      <paper-tabs .selected="${selectedTab}" @selected-changed="${this._tabChanged}">
        <paper-tab>Text</paper-tab>
        <paper-tab>File</paper-tab>
      </paper-tabs>
      ${this._renderPageTemplate()}
    </div>` : undefined}

    <web-socket
      id="socket"
      .url="${url}"
      ?noretry="${!autoReconnect}"
      @message="${this._messageReceived}"
      @disconnected="${this._onDisconnected}"
      @connected="${this._onConnected}"
      @error="${this._onError}"
      @retrying-changed="${this._retryingHandler}"></web-socket>
    <paper-autocomplete
      vertical-offset="24"
      horizontal-offset="24"
      .target="${_urlInput}"
      id="autocomplete"
      loader
      open-on-focus
      @query="${this._queryUrlHistoryHandler}"
      @selected="${this._onSuggestionSelected}"
      @opened-chnaged="${this._sugesstionsOpenedHandler}"></paper-autocomplete>
    <websocket-url-history-model></websocket-url-history-model>
    <paper-toast text="Enter remote address first. Eg. ws://echo.websocket.org" id="emptyAddress"></paper-toast>
    <paper-toast duration="7000" id="error"></paper-toast>`;
  }

  _renderPageTemplate() {
    const { _messageSendEnabled, message, hasFile, selectedTab } = this;
    switch (selectedTab) {
      case 0: return html`<section>
        <paper-textarea
          label="Message to send"
          .value="${message}"
          @input="${this._messageInputHandler}"
          @keydown="${this._messageKeydown}"></paper-textarea>
        <paper-button
          raised
          class="action-button"
          @click="${this._sendMessage}"
          ?disabled="${!_messageSendEnabled}">send</paper-button>
      </section>`;
      case 1: return html`<section>
        <file-drop @change="${this._fileAccepted}"></file-drop>
        <paper-button
          raised
          class="action-button send-file"
          @click="${this._sendFileMessage}"
          ?disabled="${!hasFile}">send</paper-button>
      </section>`;
    }
  }

  static get properties() {
    return {
      /**
       * Remote URL to connect to
       */
      url: { type: String },
      /**
       * True if the `web-socket` is connecting to the remote server.
       */
      _connecting: { type: Boolean },
      /**
       * True if the socket is connected.
       */
      _connected: { type: Boolean },
      /**
       * Tru if the socket is disconnected (`connect` is false) but the component is trying to
       * reconnect.
       */
      retrying: { type: Boolean },
      /**
       * If set the socket will automatically retry the connection when it was
       * closed by any reason.
       */
      autoReconnect: { type: Boolean },
      /**
       * Computed value, true when the connect button is disabled.
       */
      _connectDisabled: { type: Boolean },
      /**
       * Currently opened request input tab.
       */
      selectedTab: { type: Number },
      /**
       * An input filed for the URL value.
       * It is used by `paper-autocomplete` element as an input target.
       */
      _urlInput: { type: Object },
      // A message to be send to the server when connected.
      message: { type: String },
      // A file object added to the file editor
      file: { type: Object },
      // Computed value, true when the file is set
      hasFile: { type: Boolean },
      /**
       * List of messages sent and received from the server.
       */
      messages: { type: Array },
      // Computed value, true when send message button is enabled
      _messageSendEnabled: { type: Boolean },
      // True if URL suggestions are opened
      suggesionsOpened: { type: Boolean }
    };
  }

  get url() {
    return this._url;
  }

  set url(value) {
    const old = this._url;
    if (old === value) {
      return;
    }
    this._url = value;
    this.requestUpdate('url', old);
    this._urlChanged(value);
    this.dispatchEvent(new CustomEvent('url-changed', {
      detail: {
        value
      }
    }));
  }

  get connecting() {
    return this._connecting;
  }

  get _connecting() {
    return this.__connecting;
  }

  set _connecting(value) {
    const old = this.__connecting;
    if (old === value) {
      return;
    }
    this.__connecting = value;
    this.requestUpdate('_connecting', old);
    this.dispatchEvent(new CustomEvent('connecting-changed', {
      detail: {
        value
      }
    }));
  }

  get connected() {
    return this.__connected;
  }

  get _connected() {
    return this.__connected;
  }

  set _connected(value) {
    const old = this.__connected;
    if (old === value) {
      return;
    }
    this.__connected = value;
    this.requestUpdate('_connected', old);
    this.dispatchEvent(new CustomEvent('connected-changed', {
      detail: {
        value
      }
    }));
  }

  get messages() {
    return this._messages;
  }

  set messages(value) {
    this._messages = value;
    this.dispatchEvent(new CustomEvent('messages-changed', {
      detail: {
        value
      }
    }));
  }

  get message() {
    return this._message;
  }

  set message(value) {
    const old = this._message;
    if (old === value) {
      return;
    }
    this._message = value;
    this._messageSendEnabled = !!value;
    this.requestUpdate('message', old);
    this.dispatchEvent(new CustomEvent('message-changed', {
      detail: {
        value
      }
    }));
  }

  get _socket() {
    return this.shadowRoot.querySelector('#socket');
  }

  get _autocomplete() {
    return this.shadowRoot.querySelector('paper-autocomplete');
  }

  get _model() {
    return this.shadowRoot.querySelector('websocket-url-history-model');
  }

  constructor() {
    super();
    this._connected = false;
    this._connectDisabled = true;
    this.selectedTab = 0;
    this.hasFile = false;
    this._messageSendEnabled = false;
  }

  firstUpdated() {
    const input = this.shadowRoot.querySelector('#socketUrl');
    this._urlInput = input;
  }
  /**
   * Called when the socket has been disconnected
   * @param {CustomEvent} e
   */
  _onDisconnected(e) {
    e.stopPropagation();
    this._connecting = false;
    this._connected = false;
  }
  /**
   * Called when tghe socket has been connected.
   * @param {CustomEvent} e
   */
  _onConnected(e) {
    e.stopPropagation();
    this._connecting = false;
    this._connected = true;
  }
  /**
   * Handler for the `<web-socket>` error event.
   *
   * @param {CustomEvent} e
   */
  _onError(e) {
    this._connecting = false;
    const toast = this.shadowRoot.querySelector('#error');
    toast.text = e.detail.error.message || 'Unknown error occured';
    toast.opened = true;
  }
  /**
   * Called when the remote URL has changed.
   * Sets a state of `_connectDisabled` attribute.
   */
  _urlChanged() {
    if (String(this.url).trim() === '') {
      this._connectDisabled = true;
    } else {
      this._connectDisabled = false;
    }
  }
  // Connects on enter.
  _urlKeyDown(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      this.connect();
    }
  }

  _urlInputHandler(e) {
    this.url = e.target.value;
  }
  /**
   * Connects to the remove machine.
   */
  connect() {
    if (this.suggesionsOpened) {
      return;
    }
    const url = this.url;
    if (url.trim() === '') {
      this.shadowRoot.querySelector('#emptyAddress').opened = true;
      return;
    }
    this._connecting = true;
    this._socket.open();
    this._dispatchGaEvent('Connect to socket');
    this._updateUrlHistory(url);
  }
  /**
   * Disconnects from the remote machine.
   */
  disconnect() {
    this._socket.close();
  }
  /**
   * Dispatches a CustomEvent of a `type` with `detail` object.
   * @param {String} type Event type
   * @param {Object} detail Object to attach to the event
   * @return {CustomEvent}
   */
  _dispatch(type, detail) {
    const e = new CustomEvent(type, {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Dispatches GA event.
   * The event's category is `Web sockets`.
   * @param {String} action Event action.
   * @return {CustomEvent}
   */
  _dispatchGaEvent(action) {
    return this._dispatch('send-analytics', {
      type: 'event',
      category: 'Web sockets',
      action
    });
  }
  /**
   * Updates the URL object in the history datastore.
   * @param {String} url An URL to store
   * @return {Promise}
   */
  async _updateUrlHistory(url) {
    const model = this._model;
    let doc;
    try {
      doc = await model.read(url);
      doc.cnt++;
      doc.time = Date.now();
    } catch (_) {
      doc = {
        _id: url,
        cnt: 1,
        time: Date.now()
      };
    }
    await model.update(doc);
  }
  /**
   * Handler for `query` event of `paper-autocomplete`.
   * @param {CustomEvent} e Suggestion request event from autocomplete
   */
  _queryUrlHistoryHandler(e) {
    const { value } = e.detail;
    this._requestUrlHistory(value);
  }
  /**
   * Queries for the list of history URLs for autocomplete function.
   * @param {String} query Aquery to search for
   * @return {Promise}
   */
  async _requestUrlHistory(query) {
    const model = this._model;
    try {
      const data = await model.list(query);
      const suggestions = data.map((item) => item._id);
      this._autocomplete.source = suggestions;
    } catch (_) {
      this._autocomplete.source = [];
    }
  }
  // Connects to the server when URL suggestion has been selected.
  _onSuggestionSelected() {
    setTimeout(() => this.connect(), 1);
  }
  /**
   * Sends the message to the server when the user pressed ctrl + enter
   * while typing in the input.
   *
   * @param {KeyboardEvent} e
   */
  _messageKeydown(e) {
    if ((e.key === 'Enter' || e.keyCode === 13) && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      this._sendMessage();
    }
  }
  /**
   * Send a string message.
   */
  _sendMessage() {
    const msg = this.message;
    if ((typeof msg === 'string') && msg.trim() === '') {
      return;
    }
    this._send(msg);
    this._dispatchGaEvent('Send message');
  }
  /**
   * Handler for the `file-accepted` event sent by the `file-drop` element.
   * @param {CustomEvent} e
   */
  _fileAccepted(e) {
    this.file = e.target.file;
    this.hasFile = !!this.file;
  }
  /**
   * Send a file message
   */
  _sendFileMessage() {
    const blob = this.file;
    if (!blob) {
      return;
    }
    this._send(blob);
    this.shadowRoot.querySelector('file-drop').reset();
    this.hasFile = false;
    this._dispatchGaEvent('Send file');
  }
  /**
   * Sends a message to opened socket.
   * Also appends a message to the list of messages.
   *
   * @param {String|Blob} data Data to send.
   */
  _send(data) {
    if (!this.connected) {
      throw new Error('Socket is not connected.');
    }
    this._socket.message = data;
    this._socket.send();
    this.message = '';
    const message = new WebSocketMessage({
      message: data,
      direction: 'out'
    });
    if (this.messages) {
      this.messages = [...this.messages, message];
    } else {
      this.messages = [message];
    }
  }
  /**
   * Message received handler.
   *
   * @param {CustomEvent} e
   */
  _messageReceived(e) {
    const message = new WebSocketMessage({
      message: e.detail.data,
      direction: 'in'
    });
    if (this.messages) {
      this.messages = [...this.messages, message];
    } else {
      this.messages = [message];
    }
  }

  _autoReconnectHandler(e) {
    this.autoReconnect = e.target.checked;
  }

  _sugesstionsOpenedHandler(e) {
    this.suggesionsOpened = e.detail.value;
  }

  _messageInputHandler(e) {
    this.message = e.target.value;
  }

  _tabChanged(e) {
    this.selectedTab = e.detail.value;
  }

  _retryingHandler(e) {
    this.retrying = e.detail.value;
  }
}
window.customElements.define('websocket-request', WebsocketRequest);
