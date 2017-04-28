function noop () {};

class JSBridgeAdapter {
  _callNativeQueue = [];
  _eventQueue = [];

  constructor () {
    document.addEventListener('JSBridgeReady', this.onJSBridgeReady);
  }

  onJSBridgeReady = () => {
    const callNativeQueue = this._callNativeQueue;
    const eventQueue = this._eventQueue;

    callNativeQueue.forEach((callObj) => {
      JSBridge.callNative(...callObj);
    });
    this._callNativeQueue = [];

    eventQueue.forEach((evt) => {
      JSBridge.registerJSEventHandler(...evt);
    });
    this._eventQueue = [];
  }

  callNative (module, params = {}, callback = noop) {
    if (window.JSBridge) {
      JSBridge.callNative(module, params, callback);
    } else {
      this._callNativeQueue.push([module, params, callback]);
    }
  }

  registerJSEventHandler (eventName, callback = noop) {
    if (window.JSBridge) {
      JSBridge.registerJSEventHandler(eventName, callback);
    } else {
      this._eventQueue.push([eventName, callback]);
    }
  }

  removeJSEventHandler (eventName, callback) {
    if (window.JSBridge) {
      JSBridge.removeJSEventHandler(eventName, callback);
    }
  }
}

const adapter = new JSBridgeAdapter();

export default adapter;
