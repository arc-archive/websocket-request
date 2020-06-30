import { WebsocketRequestElement } from './src/WebsocketRequestElement';

declare global {
  interface HTMLElementTagNameMap {
    "websocket-request": WebsocketRequestElement;
  }
}
