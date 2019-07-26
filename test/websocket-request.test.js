import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import { WebSocketMessage } from '../websocket-request.js';

describe('<websocket-request>', () => {
  async function basicFixture() {
    return (await fixture(`<websocket-request></websocket-request>`));
  }

  describe('basic', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('_connectDisabled is true', function() {
      assert.isTrue(element._connectDisabled);
    });

    it('_connectDisabled is false when URL is set', function() {
      element.url = 'wss://echo.websocket.org';
      assert.isFalse(element._connectDisabled);
    });

    it('Default tab is 0', function() {
      assert.equal(element.selectedTab, 0);
    });

    it('_urlInput is computed', async () => {
      await aTimeout();
      const node = element.shadowRoot.querySelector('#socketUrl');
      assert.isTrue(element._urlInput === node);
    });

    it('Message editor is not in the DOM', function() {
      const node = element.shadowRoot.querySelector('.message-editor');
      assert.notOk(node);
    });

    it('Connect button is disabled', function() {
      const node = element.shadowRoot.querySelector('.connection-input .action-button');
      assert.isTrue(node.disabled);
    });
  });

  describe('_onDisconnected()', () => {
    let element;
    let ev;
    beforeEach(async () => {
      element = await basicFixture();
      ev = new CustomEvent('test', { cancelable: true });
    });

    it('Stops the event', () => {
      const spy = sinon.spy(ev, 'stopPropagation');
      element._onDisconnected(ev);
      assert.isTrue(spy.called);
    });

    it('Resets connecting state', () => {
      element._connecting = true;
      element._onDisconnected(ev);
      assert.isFalse(element.connected);
    });

    it('Resets connected state', () => {
      element._connected = true;
      element._onDisconnected(ev);
      assert.isFalse(element.connected);
    });
  });

  describe('_onConnected()', () => {
    let element;
    let ev;
    beforeEach(async () => {
      element = await basicFixture();
      ev = new CustomEvent('test', { cancelable: true });
    });

    it('Stops the event', () => {
      const spy = sinon.spy(ev, 'stopPropagation');
      element._onConnected(ev);
      assert.isTrue(spy.called);
    });

    it('Resets connecting state', () => {
      element._connecting = (true);
      element._onConnected(ev);
      assert.isFalse(element.connecting);
    });

    it('Sets connected state', () => {
      element._connected = (false);
      element._onConnected(ev);
      assert.isTrue(element.connected);
    });
  });

  describe('_urlKeyDown()', () => {
    let element;
    let ev;
    beforeEach(async () => {
      element = await basicFixture();
      element.url = '';
      ev = new CustomEvent('keydown');
      await nextFrame();
    });

    it('Calls connect() when keyCode is 13', () => {
      const spy = sinon.spy(element, 'connect');
      ev.keyCode = 13;
      element._urlKeyDown(ev);
      assert.isTrue(spy.called);
    });

    it('Calls connect() when key is Enter', () => {
      const spy = sinon.spy(element, 'connect');
      ev.key = 'Enter';
      element._urlKeyDown(ev);
      assert.isTrue(spy.called);
    });

    it('Does nothing for other types', () => {
      const spy = sinon.spy(element, 'connect');
      ev.key = 'E';
      element._urlKeyDown(ev);
      assert.isFalse(spy.called);
    });
  });

  describe('_onError()', () => {
    let element;
    let ev;
    beforeEach(async () => {
      element = await basicFixture();
      ev = new CustomEvent('error', {
        detail: {
          error: {}
        }
      });
      await nextFrame();
    });

    it('Resets connecting state', () => {
      element._connecting = (true);
      element._onError(ev);
      assert.isFalse(element.connected);
    });

    it('Opens the error toast', () => {
      element._onError(ev);
      const toast = element.shadowRoot.querySelector('#error');
      assert.isTrue(toast.opened);
    });

    it('Renders default message', () => {
      element._onError(ev);
      const toast = element.shadowRoot.querySelector('#error');
      assert.equal(toast.text, 'Unknown error occured');
    });

    it('Renders passed message', () => {
      ev.detail.error.message = 'test-message';
      element._onError(ev);
      const toast = element.shadowRoot.querySelector('#error');
      assert.equal(toast.text, 'test-message');
    });
  });

  describe('connect()', () => {
    const wss = 'wss://echo.websocket.org';
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Does nothing when suggestions are opened', async () => {
      element.url = '';
      await nextFrame();
      element.suggesionsOpened = true;
      element.connect();
      assert.isUndefined(element.connecting);
    });

    it('Opens info toast when no URL', async () => {
      element.url = '';
      await nextFrame();
      element.connect();
      const toast = element.shadowRoot.querySelector('#emptyAddress');
      assert.isTrue(toast.opened);
    });

    it('Sets connecting property', async () => {
      element.url = wss;
      await nextFrame();
      element.connect();
      assert.isTrue(element.connecting);
      element.disconnect();
    });

    it('Calls _dispatchGaEvent()', async () => {
      element.url = wss;
      await nextFrame();
      const spy = sinon.spy(element, '_dispatchGaEvent');
      element.connect();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Connect to socket');
      element.disconnect();
    });

    it('Calls _updateUrlHistory()', async () => {
      element.url = wss;
      await nextFrame();
      const spy = sinon.spy(element, '_updateUrlHistory');
      element.connect();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], wss);
      element.disconnect();
    });
  });

  describe('_dispatch()', () => {
    const type = 'ev-type';
    const eventDetail = 'ev-detail';
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches an event', () => {
      const spy = sinon.spy();
      element.addEventListener(type, spy);
      element._dispatch(type, eventDetail);
      assert.isTrue(spy.called);
    });

    it('Returns the event', () => {
      const result = element._dispatch(type, eventDetail);
      assert.typeOf(result, 'customevent');
      assert.equal(result.type, type);
    });

    it('Event is cancelable', () => {
      const e = element._dispatch(type, eventDetail);
      assert.isTrue(e.cancelable);
    });

    it('Event bubbles', () => {
      const e = element._dispatch(type, eventDetail);
      assert.isTrue(e.bubbles);
    });

    it('Event is composed', () => {
      const e = element._dispatch(type, eventDetail);
      if (e.composed !== undefined) { // Edge
        assert.isTrue(e.composed);
      }
    });

    it('Event has detail', () => {
      const e = element._dispatch(type, eventDetail);
      assert.equal(e.detail, eventDetail);
    });
  });

  describe('_dispatchGaEvent()', () => {
    const action = 'test-action';
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _dispatch() with type', () => {
      const spy = sinon.spy(element, '_dispatch');
      element._dispatchGaEvent(action);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'send-analytics');
    });

    it('Detail is set', () => {
      const spy = sinon.spy(element, '_dispatch');
      element._dispatchGaEvent(action);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][1], {
        type: 'event',
        category: 'Web sockets',
        action
      });
    });
  });

  describe('_updateUrlHistory()', () => {
    let element;
    let url;
    before(() => {
      url = `https://test-${Date.now()}/`;
    });

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('creates new item', async () => {
      await element._updateUrlHistory(url);
      const data = await element._model.list(url);
      const item = data[0];
      assert.typeOf(item.time, 'number');
      assert.equal(item.cnt, 1);
      assert.equal(item._id, url);
    });

    it('updates existing item', async () => {
      await element._updateUrlHistory(url);
      const data = await element._model.list(url);
      const item = data[0];
      assert.equal(item.cnt, 2);
      assert.equal(item._id, url);
    });
  });

  describe('_requestUrlHistory()', () => {
    let element;
    let url;
    before(() => {
      url = `https://test-${Date.now()}/`;
    });

    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Sets suggestions on autocomplete', async () => {
      element._model.list = () => {
        /* global Promise */
        return Promise.resolve([{
          _id: url
        }]);
      };
      await element._requestUrlHistory(url);
      assert.deepEqual(element._autocomplete.source, [url]);
    });

    it('Clears suggestions when model error', async () => {
      element._autocomplete.source = [url];
      element._model.list = () => {
        return Promise.reject(new Error(''));
      };
      await element._requestUrlHistory(url);
      assert.deepEqual(element._autocomplete.source, []);
    });
  });

  describe('_onSuggestionSelected()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.url = '';
      await nextFrame();
    });

    it('Calls connect() in a timeout', (done) => {
      const spy = sinon.spy(element, 'connect');
      element._onSuggestionSelected({
        target: {
          selected: 'wss://echo.websocket.org'
        }
      });
      setTimeout(() => {
        assert.isTrue(spy.called);
        done();
      });
    });
  });

  describe('_send()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._socket.send = () => {};
      element._connected = true;
    });

    it('Throws when not connected', () => {
      element._connected = false;
      assert.throws(() => {
        element._send('test');
      });
    });

    it('Sets message on the socket', () => {
      element._send('test');
      assert.equal(element._socket.message, 'test');
    });

    it('Calls socket send function', () => {
      const spy = sinon.spy(element._socket, 'send');
      element._send('test');
      assert.isTrue(spy.called);
    });

    it('Creates messages array', () => {
      element._send('test');
      assert.typeOf(element.messages, 'array');
      assert.lengthOf(element.messages, 1);
    });

    it('Appends to messages array', () => {
      element.messages = [{}];
      element._send('test');
      assert.typeOf(element.messages, 'array');
      assert.lengthOf(element.messages, 2);
    });

    it('Message is instance of WebSocketMessage', () => {
      element._send('test');
      assert.isTrue(element.messages[0] instanceof WebSocketMessage);
    });

    it('Message direction is "out"', () => {
      element._send('test');
      assert.equal(element.messages[0].direction, 'out');
    });

    it('Message has passed message', () => {
      element._send('test');
      assert.equal(element.messages[0].message, 'test');
    });
  });

  describe('_messageReceived()', () => {
    let ev;
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      ev = {
        detail: {
          data: 'test-data'
        }
      };
      await nextFrame();
    });

    it('Creates messages array', () => {
      element._messageReceived(ev);
      assert.typeOf(element.messages, 'array');
      assert.lengthOf(element.messages, 1);
    });

    it('Appends to messages array', () => {
      element.messages = [{}];
      element._messageReceived(ev);
      assert.typeOf(element.messages, 'array');
      assert.lengthOf(element.messages, 2);
    });

    it('Message is instance of WebSocketMessage', () => {
      element._messageReceived(ev);
      assert.isTrue(element.messages[0] instanceof WebSocketMessage);
    });

    it('Message direction is "in"', () => {
      element._messageReceived(ev);
      assert.equal(element.messages[0].direction, 'in');
    });

    it('Message has passed message', () => {
      element._messageReceived(ev);
      assert.equal(element.messages[0].message, 'test-data');
    });
  });

  describe('_sendMessage()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._socket.send = () => {};
      element._connected = true;
      await nextFrame();
    });

    it('Calls _send() with the argument', () => {
      const spy = sinon.spy(element, '_send');
      element.message = 'test-msg';
      element._sendMessage();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'test-msg');
    });

    it('Ignores action when no message', () => {
      const spy = sinon.spy(element, '_send');
      element.message = '';
      element._sendMessage();
      assert.isFalse(spy.called);
    });

    it('Calls _dispatchGaEvent() with argument', () => {
      const spy = sinon.spy(element, '_dispatchGaEvent');
      element._sendMessage();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Send message');
    });
  });

  describe('_fileAccepted()', () => {
    it('Sets hasFile', async () => {
      const element = await basicFixture();
      element._fileAccepted({
        target: {
          file: {}
        }
      });
      assert.isTrue(element.hasFile);
    });
  });

  describe('_sendFileMessage()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._socket.send = () => {};
      element._connected = true;
      element.selectedTab = 1;
      element.file = new Blob(['test']);
      await nextFrame();
    });

    it('Calls _send() with argument', () => {
      const spy = sinon.spy(element, '_send');
      element._sendFileMessage();
      assert.isTrue(spy.called);
      assert.typeOf(spy.args[0][0], 'blob');
    });

    it('Ignores the call when no file', () => {
      const spy = sinon.spy(element, '_send');
      element.file = undefined;
      element._sendFileMessage();
      assert.isFalse(spy.called);
    });

    it('Restes hasFile', () => {
      element._sendFileMessage();
      assert.isFalse(element.hasFile);
    });

    it('Calls _dispatchGaEvent() with argument', () => {
      const spy = sinon.spy(element, '_dispatchGaEvent');
      element._sendFileMessage();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'Send file');
    });
  });

  describe('_messageKeydown()', () => {
    let element;
    let ev;
    beforeEach(async () => {
      element = await basicFixture();
      element._socket.send = () => {};
      element._connected = true;
      ev = new CustomEvent('keydown');
      ev.ctrlKey = true;
      await nextFrame();
    });

    it('Calls _sendMessage() when keyCode is 13', () => {
      const spy = sinon.spy(element, '_sendMessage');
      ev.keyCode = 13;
      element._messageKeydown(ev);
      assert.isTrue(spy.called);
    });

    it('Calls _sendMessage() when key is Enter', () => {
      const spy = sinon.spy(element, '_sendMessage');
      ev.key = 'Enter';
      element._messageKeydown(ev);
      assert.isTrue(spy.called);
    });

    it('Ignores event when no ctrlKey', () => {
      const spy = sinon.spy(element, '_sendMessage');
      ev.key = 'Enter';
      ev.ctrlKey = false;
      element._messageKeydown(ev);
      assert.isFalse(spy.called);
    });

    it('Ignores event when other key', () => {
      const spy = sinon.spy(element, '_sendMessage');
      ev.key = 'S';
      element._messageKeydown(ev);
      assert.isFalse(spy.called);
    });
  });

  describe('WebSocketMessage', () => {
    describe('constructor()', () => {
      it('Sets message value', () => {
        const instance = new WebSocketMessage({
          message: 'test'
        });
        assert.equal(instance.message, 'test');
      });

      it('Sets empty message', () => {
        const instance = new WebSocketMessage({
          message: ''
        });
        assert.equal(instance.message, '(empty message)');
      });

      it('Sets isBinary to false when message is string', () => {
        const instance = new WebSocketMessage({
          message: 'test'
        });
        assert.isFalse(instance.isBinary);
      });

      it('Sets isBinary to true when message is Blob', () => {
        const instance = new WebSocketMessage({
          message: new Blob(['test'])
        });
        assert.isTrue(instance.isBinary);
      });

      it('Sets isBinary to true when message is ArrayBuffer', () => {
        /* global ArrayBuffer */
        const instance = new WebSocketMessage({
          message: new ArrayBuffer(8)
        });
        assert.isTrue(instance.isBinary);
      });

      it('Sets default time', () => {
        const instance = new WebSocketMessage({});
        assert.typeOf(instance.time, 'date');
      });

      it('Sets default time', () => {
        const instance = new WebSocketMessage({});
        assert.typeOf(instance.time, 'date');
      });

      it('Sets time from Date object', () => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 1);
        const instance = new WebSocketMessage({
          time: d
        });
        assert.equal(instance.time.getTime(), d.getTime());
      });

      it('Sets time from time', () => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 1);
        const instance = new WebSocketMessage({
          time: d.getTime()
        });
        assert.equal(instance.time.getTime(), d.getTime());
      });
    });
  });

  describe('a11y', () => {
    it('passes accessibility test', async () => {
      const el = await fixture(html`<websocket-request></websocket-request>`);
      await assert.isAccessible(el, {
        ignoredRules: ['tabindex']
      });
    });
  });
});
