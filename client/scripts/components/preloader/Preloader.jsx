import React, { Component } from 'react';
import ReactDOM, { unstable_renderSubtreeIntoContainer } from 'react-dom';
import PreloaderPortal from './PreloaderPortal';

class Preloader extends Component {
  static displayName = 'Preloader'

  componentDidMount () {
    this.node = document.createElement('div');
    this.node.className = 'react-preloader';
    document.body.appendChild(this.node);
    this.renderPortal(this.props);
  }

  componentWillReceiveProps (newProps) {
    this.renderPortal(newProps);
  }

  componentWillUnmount () {
    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
  }

  renderPortal (props) {
    this.portal = unstable_renderSubtreeIntoContainer(
      this, React.createFactory(PreloaderPortal)(props), this.node
    );
  }

  render () {
    return React.DOM.noscript();
  }
}

export default Preloader;
