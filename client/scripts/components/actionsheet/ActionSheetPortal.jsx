import 'styles/components/Actionsheet.scss';

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

function noop() {}

class ActionSheetPortal extends Component {

  static defaultProps = {
    onRequestClose: noop,
    onCancel: noop,
    show: false,
    menus: [],
  };

  state = {
    menuContainerStyle: {},
  };

  componentDidMount () {
    //FIXME: 临时解决Android设备上无法滚动的问题
    const acWrapNode = findDOMNode(this.refs.acWrap);
    acWrapNode.addEventListener('transitionend', () => {
      this.setState({menuContainerStyle: { maxHeight: '371px' }});
    });
  }

  render() {
    const {
      onRequestClose,
      onCancel,
      menus,
      show,
    } = this.props

    return (
      <div className={`react-actionsheet${show ? ' react-actionsheet-show' : ''}`}
        onClick={onRequestClose}>
        <div className='react-actionsheet-mask'>
        </div>
        <div ref="acWrap" className='react-actionsheet-wrap'>
          <div style={this.state.menuContainerStyle}className='react-actionsheet-menu'>
            {menus.map((menu, i) => {
              const { content, onClick = noop } = menu
              return (
                <div key={i} className='react-actionsheet-menu-item' onClick={onClick}>
                  {content}
                </div>
              )
            })}
          </div>
          <div className='react-actionsheet-action'>
            <div className='react-actionsheet-action-item' onClick={onCancel}>取消</div>
          </div>
        </div>
      </div>
    );
  }
}

export default ActionSheetPortal;
