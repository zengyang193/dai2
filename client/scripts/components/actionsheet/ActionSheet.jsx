import React, { Component } from 'react';
import ReactDOM, { unstable_renderSubtreeIntoContainer } from 'react-dom';
import ActionSheetPortal from './ActionSheetPortal';

class ActionSheet extends Component {
  static displayName = 'ActionSheet'

  static defaultProps = {
    closeTimeoutMS: 0,
  }

  componentDidMount () {
    this.node = document.createElement('div');
    this.node.className = 'react-actionsheet-wrapper';
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
      this, React.createFactory(ActionSheetPortal)(props), this.node
    );
  }

  render () {
    return React.DOM.noscript();
  }
}

export default ActionSheet;
