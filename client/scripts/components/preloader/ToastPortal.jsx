import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

import 'styles/components/Toast.scss';

class ToastPortal extends Component {
  show () {
    let node = findDOMNode(this);
    node.style.display = 'block';
    node.style.marginLeft = - Math.round(node.offsetWidth / 2) + 'px';
    node.style.left = '50%';
    node.classList.add('react-toast-in');
  }

  hide () {
    let node = findDOMNode(this);
    node.classList.remove('react-toast-in');
    node.classList.add('react-toast-out');
  }

  render() {
    const { message } = this.props;
    return (
      <div className='react-toast'>
        <div className="react-toast-content">{message}</div>
      </div>
    );
  }
}

export default ToastPortal;

