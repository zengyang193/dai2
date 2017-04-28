import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button,Icon } from 'react-onsenui';

@observer
class LoanForm extends Component {
  state = {
    amountIndex: 0, // [1000, 2500]
    frequencyIndex: 0, // [15, 25]
  }

  onAmountSwitched = () => {
    const { products, onFormDataChanged } = this.props;

    let amountIndex = Number(!this.state.amountIndex);
    let frequencyIndex = this.state.frequencyIndex;
    this.setState({amountIndex});

    onFormDataChanged && onFormDataChanged({
      amount: products.amounts[amountIndex],
      frequency: products.frequencies[frequencyIndex],
    });
  }

  onFrequencySwitched = () => {
    const { products, onFormDataChanged } = this.props;

    let frequencyIndex = Number(!this.state.frequencyIndex);
    let amountIndex = this.state.amountIndex;
    this.setState({frequencyIndex});

    onFormDataChanged && onFormDataChanged({
      amount: products.amounts[amountIndex],
      frequency: products.frequencies[frequencyIndex],
    });
  }

  onFormSubmit () {
    const { onFormSubmit, products } = this.props;
    const { amountIndex, frequencyIndex } = this.state;
    onFormSubmit && onFormSubmit({
      amount: products.amounts[amountIndex],
      frequency: products.frequencies[frequencyIndex],
    });
  }

  getFormData () {
    const { products } = this.props;
    const { frequencyIndex, amountIndex } = this.state;
    return {
      amount: products.amounts[amountIndex],
      frequency: products.frequencies[frequencyIndex],
    };
  }

  render () {
    const {products, onFormSubmit, repayedOderInfo} = this.props;
    const { amountIndex, frequencyIndex } = this.state;
    let bankInfo = null;
    if (repayedOderInfo && repayedOderInfo.bankName) {
      bankInfo = (
        <div className="bank-container">
          <div className="bankcardimg">
            <Icon className={`ico-bank-lg bk-logo-${repayedOderInfo.bankId}`}/>
          </div>
              {repayedOderInfo.bankName} 尾号{repayedOderInfo.account}
        </div>
      );

    }
    return (
      <form className="loan-form">
        <div className="form-field-title">借多少</div>
        <div className="form-switch-wrapper">
          <div className={`switch-item ${!amountIndex && 'active'}`}>
            <span className="amount">{products.amounts[0]}</span>元
          </div>
          <div className={`switch-item ${amountIndex && 'active'}`}>
            <span className="amount">{products.amounts[1]}</span>元
          </div>
          <div className="limit-exceeded"></div>
          <div className="switch-item-overlay" style={{left: amountIndex ? '50%' : '-1px'}} />
          <div className="switch-clickable-overlay" style={{left: amountIndex ? '50%' : '-1px'}} />
        </div>
        <div className="form-field-title">借多久</div>
        <div className="form-switch-wrapper">
          <div className={`switch-item ${!frequencyIndex && 'active'}`}>
            <span className="amount">{products.frequencies[0]}</span>天
          </div>
          <div className={`switch-item ${frequencyIndex && 'active'}`}>
            <span className="amount">{products.frequencies[1]}</span>天
          </div>
          <div className="limit-exceeded"></div>
          <div className="switch-item-overlay" style={{left: frequencyIndex ? '50%' : '-1px'}} />
          <div className="switch-clickable-overlay" style={{left: frequencyIndex ? '50%' : '-1px'}}
          />
        </div>
        <Button className="button-apply" onClick={onFormSubmit} modifier="large">马上申请</Button>

        {bankInfo}
      </form>
    );
  }
}

export default LoanForm;
