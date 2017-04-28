import React from 'react';
import ReactDOM from 'react-dom';
import PreloaderPortal from 'scripts/components/preloader/PreloaderPortal';
import ToastPortal from 'scripts/components/preloader/ToastPortal';

class ModalUtil {
  constructor () {
    this.preloaderNode = null;
    this.preloaderPortal = null;
    this.toastNode = null;
    this.toastPortal = null;
    this.toastTimer = null;
  }

  _createPreloaderContainerNode () {
    this.preloaderNode = document.createElement('div');
    this.preloaderNode.className = 'react-preloader-wrapper';
    document.body.appendChild(this.preloaderNode);
  }

  showPreloader (message) {
    if (this.preloaderPortal && this.preloaderNode) {
      return;
    }

    this._createPreloaderContainerNode();
    this.preloaderPortal = ReactDOM.render(
      React.createFactory(PreloaderPortal)({show: true}), this.preloaderNode
    );
  }

  hidePreloader () {
    if (!this.preloaderNode || !this.preloaderPortal) {
      return;
    }

    ReactDOM.unmountComponentAtNode(this.preloaderNode);
    document.body.removeChild(this.preloaderNode);

    this.preloaderPortal = null;
    this.preloaderNode = null;
  }

  _createToastContainerNode () {
    this.toastNode = document.createElement('div');
    this.toastNode.className = 'react-toast-wrapper';
    document.body.appendChild(this.toastNode);
  }

  showToast (message) {
    if (this.toastPortal && this.toastNode) {
      this.hideToast();
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
        this.toastTimer = null;
      }
    }

    this._createToastContainerNode();
    this.toastPortal = ReactDOM.render(
      React.createFactory(ToastPortal)({message}), this.toastNode
    );
    this.toastPortal.show();
  }

  hideToast (message) {
    let tNode = this.toastNode;
    let tPortal = this.toastPortal;

    if (!tNode || !tPortal) {
      return;
    }
    tPortal.hide();

    this.toastPortal = null;
    this.toastNode = null;
    this.toastTimer = null;

    // 等待Animation结束
    setTimeout(() => {
      ReactDOM.unmountComponentAtNode(tNode);
      document.body.removeChild(tNode);
    }, 300);
  }

  toast (message) {
    this.showToast(message);
    this.toastTimer = setTimeout(() => this.hideToast(), 2000);
  }
}

const mu = new ModalUtil();

export default mu;
