import React, { Component } from 'react';
import ProgressCircular from 'scripts/components/ProgressCircular';

import 'styles/components/Preloader.scss';

class PreloaderPortal extends Component {
  static defaultProps = {
    show: false,
  };

  render() {
    const { show } = this.props;
    return (
      <div className={`react-preloader${show ? ' react-preloader-show' : ''}`}>
        <div className='react-preloader-content'>
          <ProgressCircular indeterminate></ProgressCircular>
        </div>
      </div>
    );
  }
}

export default PreloaderPortal;
