'use strcit';

import React, { Component } from 'react';
import Formsy, { HOC } from 'formsy-react';

class Select extends Component {
  onChange = (e) => {
    let { onChange } = this.props;
    onChange && onChange(e);
    this.props.setValue(e.target.value);
  }

  render () {
    let {getValue, options, name, className} = this.props;
    let optionElements = options.map(function (item, idx) {
      return (<option key={idx} {...item}>{item.label}</option>);
    });
    return (
      <select
        ref="element"
        name={name}
        className={className}
        value={getValue()}
        onChange={this.onChange}>
        {optionElements}
      </select>
      );
  }
}

export default HOC(Select);
