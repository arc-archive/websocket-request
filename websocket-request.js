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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import '../../@advanced-rest-client/web-socket/web-socket.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/paper-input/paper-textarea.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@polymer/paper-checkbox/paper-checkbox.js';
import '../../@polymer/paper-progress/paper-progress.js';
import '../../@polymer/paper-tabs/paper-tabs.js';
import '../../@polymer/paper-tabs/paper-tab.js';
import '../../@polymer/paper-toast/paper-toast.js';
import '../../@polymer/iron-pages/iron-pages.js';
import '../../@advanced-rest-client/file-drop/file-drop.js';
import '../../@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
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
 * `--websocket-request` | Mixin applied to the element | `{}`
 * `--websocket-request-url-input` | Mixin applied to the URL input | `{}`
 * `--websocket-request-connection-info` | Applied to the label when connected | `{}`
 * `--websocket-request-connected-url-label` | Mixin applied to the URL label when connected | `{}`
 * `--websocket-request-file-drop` | Mixin applied to the `<file-drop>` element | `{}`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof ApiElements
 */
export class WebsocketRequest extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      position: relative;
      @apply --websocket-request;
    }

    .connection-info {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    .url-input {
      @apply --websocket-request-url-input;
    }

    .url-input,
    .connection-info p {
      @apply --layout-flex;
    }

    .connection-info p {
      height: 62px;
      padding: 0;
      margin: 0;
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --websocket-request-connection-info;
    }

    .connection-info span {
      margin-left: 4px;
      font-weight: 500;
      @apply --websocket-request-connected-url-label;
    }

    .action-button {
      height: 40px;
      @apply --action-button;
    }

    .action-button:hover {
      @apply --action-button-hover;
    }

    .action-button[disabled] {
      @apply --action-button-disabled;
    }

    paper-autocomplete {
      bottom: 0;
    }

    .send-file {
      margin: 20px;
    }

    file-drop {
      @apply --websocket-request-file-drop;
    }
    </style>
    <div class="connection-info-line">
      <div class="connection-info">
        <template is="dom-if" if="[[!connected]]">
          <paper-input
            id="socketUrl"
            label="Socket URL"
            value="{{url}}"
            on-keydown="_urlKeyDown"
            class="url-input"></paper-input>
          <paper-button raised=""
            class="action-button"
            disabled\$="[[connectDisabled]]"
            on-click="connect">Connect</paper-button>
        </template>
        <template is="dom-if" if="[[connected]]">
          <p>Connected to <span>[[url]]</span></p>
          <paper-button on-click="disconnect" raised="">Disconnect</paper-button>
        </template>
      </div>
      <paper-checkbox checked="{{autoReconnect}}">Reconnect automatically</paper-checkbox>
    </div>
    <template is="dom-if" if="[[connecting]]">
      <div class="connecting-info">
        <p>Connecting to the remote server...</p>
        <paper-progress indeterminate=""></paper-progress>
      </div>
    </template>
    <template is="dom-if" if="[[retrying]]">
      <h3>Connection lost</h3>
      <p>Trying to reconnect.</p>
    </template>
    <template is="dom-if" if="[[connected]]">
      <div class="message-editor">
        <paper-tabs selected="{{selectedTab}}">
          <paper-tab>Text</paper-tab>
          <paper-tab>File</paper-tab>
        </paper-tabs>
        <iron-pages selected="{{selectedTab}}">
          <section>
            <paper-textarea
              label="Message to send"
              value="{{message}}"
              on-keydown="_messageKeydown"></paper-textarea>
            <paper-button
              raised=""
              class="action-button"
              on-click="_sendMessage"
              disabled\$="{{!messageSendEnabled}}">send</paper-button>
          </section>
          <section>
            <file-drop file="{{file}}" on-file-accepted="_fileAccepted"></file-drop>
            <paper-button
              raised=""
              class="action-button send-file"
              on-click="_sendFileMessage"
              disabled\$="{{!hasFile}}">send</paper-button>
          </section>
        </iron-pages>
      </div>
    </template>
    <web-socket
      id="socket"
      url="[[url]]"
      retrying="{{retrying}}"
      no-retry="[[!autoReconnect]]"
      on-message="_messageReceived"
      on-disconnected="_onDisconnected"
      on-connected="_onConnected"
      on-error="_onError"></web-socket>
    <paper-autocomplete
      vertical-offset="24"
      horizontal-offset="24"
      target="[[urlInput]]"
      id="autocomplete"
      loader=""
      open-on-focus=""
      on-query="_queryUrlHistory"
      on-selected="_onSuggestionSelected"
      opened="{{suggesionsOpened}}"></paper-autocomplete>
    <paper-toast text="Enter remote address first. Eg. ws://echo.websocket.org" id="emptyAddress"></paper-toast>
    <paper-toast duration="7000" id="error"></paper-toast>`;
  }

  static get properties() {
    return {
      /**
       * Remote URL to connect to
       */
      url: {
        type: String,
        observer: '_urlChanged',
        notify: true
      },
      /**
       * True if the `web-socket` is connecting to the remote server.
       */
      connecting: {
        type: Boolean,
        readOnly: true,
        notify: true
      },
      /**
       * True if the socket is connected.
       */
      connected: {
        type: Boolean,
        readOnly: true,
        value: false,
        notify: true
      },
      /**
       * Tru if the socket is disconnected (`connect` is false) but the component is trying to
       * reconnect.
       */
      retrying: Boolean,
      /**
       * If set the socket will automatically retry the connection when it was
       * closed by any reason.
       */
      autoReconnect: Boolean,
      /**
       * Computed value, true when the connect button is disabled.
       */
      connectDisabled: {
        type: Boolean,
        value: true,
        readOnly: true
      },
      /**
       * Currently opened request input tab.
       */
      selectedTab: {
        type: Number,
        value: 0
      },
      /**
       * An input filed for the URL value.
       * It is used by `paper-autocomplete` element as an input target.
       */
      urlInput: {
        readOnly: true,
        type: Object
      },
      // A message to be send to the server when connected.
      message: String,
      // A file object added to the file editor
      file: Object,
      // Computed value, true when the file is set
      hasFile: {
        type: Boolean,
        value: false
      },
      /**
       * List of messages sent and received from the server.
       */
      messages: {
        type: Array,
        notify: true
      },
      // Computed value, true when send message button is enabled
      messageSendEnabled: {
        type: Boolean,
        value: false,
        computed: '_computeButtonVisible(message)'
      },
      // True if URL suggestions are opened
      suggesionsOpened: Boolean
    };
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, () => {
      const input = this.shadowRoot.querySelector('#socketUrl');
      this._setUrlInput(input);
    });
  }
  /**
   * Called when the socket has been disconnected
   * @param {CustomEvent} e
   */
  _onDisconnected(e) {
    e.stopPropagation();
    this._setConnecting(false);
    this._setConnected(false);
  }
  /**
   * Called when tghe socket has been connected.
   * @param {CustomEvent} e
   */
  _onConnected(e) {
    e.stopPropagation();
    this._setConnecting(false);
    this._setConnected(true);
  }
  /**
   * Handler for the `<web-socket>` error event.
   *
   * @param {CustomEvent} e
   */
  _onError(e) {
    console.warn(e.detail.error);
    this._setConnecting(false);
    this.$.error.text = e.detail.error.message || 'Unknown error occured';
    this.$.error.opened = true;
  }
  /**
   * Called when the remote URL has changed.
   * Sets a state of `connectDisabled` attribute.
   */
  _urlChanged() {
    if (String(this.url).trim() === '') {
      this._setConnectDisabled(true);
    } else {
      this._setConnectDisabled(false);
    }
  }
  // Connects on enter.
  _urlKeyDown(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      this.connect();
    }
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
      this.$.emptyAddress.opened = true;
      return;
    }
    this._setConnecting(true);
    this._dispatchGaEvent('Connect to socket');
    this._updateUrlHistory(url);
    this.$.socket.open();
  }
  /**
   * Disconnects from the remote machine.
   */
  disconnect() {
    this.$.socket.close();
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
   * Dispatches `websocket-url-history-read` event
   * @param {String} url History object ID.
   * @return {CustomEvent}
   */
  _dispatchReadHistory(url) {
    return this._dispatch('websocket-url-history-read', {
      url
    });
  }
  /**
   * Dispatches `websocket-url-history-read` event
   * @param {Object} item History object to update.
   * @return {CustomEvent}
   */
  _dispatchUpdateHistory(item) {
    return this._dispatch('websocket-url-history-changed', {
      item
    });
  }
  /**
   * Dispatches `websocket-url-history-read` event
   * @param {String} q Value for query event (an URL).
   * @return {CustomEvent}
   */
  _dispatchQueryHistory(q) {
    return this._dispatch('websocket-url-history-query', {
      q
    });
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
  _updateUrlHistory(url) {
    const e = this._dispatchReadHistory(url);
    if (!e.detail.result) {
      console.warn('Websocket model not found');
      return;
    }
    return e.detail.result
    .then((doc) => this._processUrlHistoryUpdateResponse(doc, url));
  }
  /**
   * Processes datastore response about the URL. If exists it updates
   * the object or creates new otherwise.
   * @param {Object} doc Retreived from the data store object. Can be not set if the object do not exists.
   * @param {String} url Request URL to store.
   * @return {Promise}
   */
  _processUrlHistoryUpdateResponse(doc, url) {
    if (!doc) {
      doc = {
        _id: url,
        cnt: 1,
        time: Date.now()
      };
    } else {
      doc.cnt++;
      doc.time = Date.now();
    }
    const e = this._dispatchUpdateHistory(doc);
    if (!e.detail.result) {
      console.warn('Websocket model not found');
      return Promise.resolve();
    }
    return e.detail.result;
  }
  /**
   * Queries for the list of history URLs for autocomplete function.
   * @param {CustomEvent} e Suggestion request event from autocomplete
   * @return {Promise}
   */
  _queryUrlHistory(e) {
    const {value} = e.detail;
    const ev = this._dispatchQueryHistory(value);
    if (!ev.detail.result) {
      console.warn('Websocket model not found');
      return Promise.resolve();
    }
    return ev.detail.result
    .then((data) => {
      const suggestions = data.map((item) => item._id);
      this.$.autocomplete.source = suggestions;
    })
    .catch(() => {
      this.$.autocomplete.source = [];
    });
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
   */
  _fileAccepted() {
    this.hasFile = true;
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
    this.$.socket.message = data;
    this.$.socket.send();
    this.message = '';
    const message = new WebSocketMessage({
      message: data,
      direction: 'out'
    });
    if (this.messages) {
      this.push('messages', message);
    } else {
      this.set('messages', [message]);
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
      this.push('messages', message);
    } else {
      this.set('messages', [message]);
    }
  }
  /**
   * Compute if send button should be visible.
   *
   * @param {Any} obj If anything is passed to the function it should return true.
   * @return {Boolean} True if file is available.
   */
  _computeButtonVisible(obj) {
    return !!obj;
  }
}
window.customElements.define('websocket-request', WebsocketRequest);