import { ProgressCircular } from 'react-onsenui';
import { findDOMNode } from 'react-dom';

class CompatibleProgressCircular extends ProgressCircular {
  componentDidMount () {
    super.componentDidMount();
    this.updateAttributes();
  }

  componentDidUpdate () {
    super.componentDidUpdate();
    this.updateAttributes();
  }

  updateAttributes () {
    const node = findDOMNode(this);
    setTimeout(() => {
      const pCircle = node.querySelector('.progress-circular__primary');
      const sCircle = node.querySelector('.progress-circular__secondary');

      pCircle.setAttribute('cx', '50%');
      pCircle.setAttribute('cy', '50%');
      pCircle.setAttribute('r', '40%');

      sCircle.setAttribute('cx', '50%');
      sCircle.setAttribute('cy', '50%');
      sCircle.setAttribute('r', '40%');
    });
  }
}

export default CompatibleProgressCircular;
