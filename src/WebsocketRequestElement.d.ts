import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { AnypointInput } from '@anypoint-web-components/anypoint-input';
import { WebSocketMessage } from './WebSocketMessage';
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
 */
export declare class WebsocketRequestElement extends LitElement {
  readonly styles: CSSResult;

  /**
   * Remote URL to connect to
   */
  url: string;

  /**
   * True if the `web-socket` is connecting to the remote server.
   */
  readonly connecting: boolean;
  _connecting: boolean;

  /**
   * True if the socket is connected.
   */
  readonly connected: boolean;
  _connected: boolean;

  /**
   * Tru if the socket is disconnected (`connect` is false) but the component is trying to
   * reconnect.
   */
  retrying: boolean;

  /**
   * If set the socket will automatically retry the connection when it was
   * closed by any reason.
   */
  autoReconnect: boolean;

  /**
   * Computed value, true when the connect button is disabled.
   */
  readonly connectDisabled: boolean;
  _connectDisabled: boolean;

  /**
   * Currently opened request input tab.
   */
  selectedTab: number;

  /**
   * An input filed for the URL value.
   * It is used by `paper-autocomplete` element as an input target.
   */
  readonly urlInput: AnypointInput;

  /**
   * A message to be send to the server when connected.
   */
  message: string;

  /**
   * A file object added to the file editor
   */
  file: File|Blob;

  /**
   * Computed value, true when the file is set
   */
  hasFile: boolean;

  /**
   * List of messages sent and received from the server.
   */
  messages: WebSocketMessage[];

  /**
   * Computed value, true when send message button is enabled
   */
  readonly messageSendEnabled: boolean;

  /**
   * True if URL suggestions are opened
   */
  suggesionsOpened: boolean;
  connectedCallback(): void;

  render(): TemplateResult;
  _renderPageTemplate(): TemplateResult;

  /**
   * Called when the socket has been disconnected
   */
  _onDisconnected(e: CustomEvent): void;

  /**
   * Called when tghe socket has been connected.
   */
  _onConnected(e: CustomEvent): void;

  /**
   * Handler for the `<web-socket>` error event.
   */
  _onError(e: CustomEvent): void;

  /**
   * Called when the remote URL has changed.
   * Sets a state of `connectDisabled` attribute.
   */
  _urlChanged(): void;

  /**
   * Connects on enter.
   */
  _urlKeyDown(e: KeyboardEvent): void;

  /**
   * Connects to the remove machine.
   */
  connect(): void;

  /**
   * Disconnects from the remote machine.
   */
  disconnect(): void;

  /**
   * Dispatches a CustomEvent of a `type` with `detail` object.
   *
   * @param type Event type
   * @param detail Object to attach to the event
   */
  _dispatch(type: string, detail: object): CustomEvent;

  /**
   * Dispatches GA event.
   * The event's category is `Web sockets`.
   *
   * @param action Event action.
   */
  _dispatchGaEvent(action: String|null): CustomEvent|null;

  /**
   * Updates the URL object in the history datastore.
   *
   * @param url An URL to store
   */
  _updateUrlHistory(url: string): Promise<void>;

  /**
   * Handler for `query` event of `anypoint-autocomplete`.
   * @param e Suggestion request event from autocomplete
   */
  _queryUrlHistoryHandler(e: CustomEvent): void;

  /**
   * Queries for the list of history URLs for autocomplete function.
   * @param query Aquery to search for
   */
  _requestUrlHistory(query: string): Promise<void>;


  /**
   * Connects to the server when URL suggestion has been selected.
   */
  _onSuggestionSelected(): void;

  /**
   * Sends the message to the server when the user pressed ctrl + enter
   * while typing in the input.
   */
  _messageKeydown(e: KeyboardEvent): void;

  /**
   * Send a string message.
   */
  _sendMessage(): void;

  /**
   * Handler for the `file-accepted` event sent by the `file-drop` element.
   */
  _fileAccepted(e: CustomEvent): void;

  /**
   * Send a file message
   */
  _sendFileMessage(): void;

  /**
   * Sends a message to opened socket.
   * Also appends a message to the list of messages.
   *
   * @param data Data to send.
   */
  _send(data: string|Blob|File): void;

  /**
   * Message received handler.
   */
  _messageReceived(e: CustomEvent): void;

  _autoReconnectHandler(e: CustomEvent): void;
  _sugesstionsOpenedHandler(e: CustomEvent): void;
  _messageInputHandler(e: CustomEvent): void;
  _tabChanged(e: CustomEvent): void;
  _retryingHandler(e: CustomEvent): void;
}
