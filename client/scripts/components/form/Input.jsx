import React, { Component } from 'react';
import Formsy, { HOC } from 'formsy-react';
import ModalUtil from 'scripts/utils/modal';

class Input extends Component {
  onChange = (e) => {
    this.props.setValue(e.target.value);
    this.props.onChange && this.props.onChange(e);
  }

  onBlur = (e) => {
    let { getValue, showError, getErrorMessage } = this.props;
    let value = getValue();
    if (value && showError()) {
      ModalUtil.toast(getErrorMessage());
    }
    this.props.onBlur && this.props.onBlur(e);
  }

  render () {
    let { getValue, setValue } = this.props;
    const value = getValue();
    return (
      <input
        className={`text-input ${this.props.className || ''}`}
        type={this.props.type}
        ref="element"
        placeholder={value ? '' : this.props.placeholder}
        value={value}
        onChange={this.onChange}
        onBlur={this.onBlur}
        readOnly={this.props.readOnly || false}
        disabled={this.props.disabled || false}
        maxLength={this.props.maxLength || ''}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
      />
    );
  }
}
export default HOC(Input);

