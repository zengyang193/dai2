import ons from 'onsenui';

const AccountOperationMixin = {
  handleResetPassword: async function (params) {
    const getSeperator = () => {
      let platform = window.__OS_FAMILY__;
      switch (platform) {
      case 'android':
        return '?';
      case 'ios':
        let version = +window.__OS_VERSION__.split('.')[0];
        if (version < 8 && version >= 7) {
          return ';';
        }
        if (version >= 8) {
          return '&';
        }
        break;
      }
    };

    let buttons = [{text: '取消'}];
    switch (params.resetType) {
    case 'WEB':
      buttons.push({
        text: '确定',
        onClick: () => {
          if (this.state.isApp) {
            DS.controller.push({
              type: 'url',
              url: params.resetUrl,
              title: '',
            });
          } else {
            window.open(params.resetUrl, true);
          }
        },
      });
      break;
    case 'SMS':
      buttons.push({
        text: '确定',
        onClick: () => {
          window.location.href = `sms:${params.smsReceiver}${getSeperator()}body=${params.smsBody}`;
        },
      });
      break;
    case 'TEL':
      buttons.push({
        text: '拨打',
        onClick: () => {
          window.open(`tel:${params.telReceiver}`, '_system');
        },
      });
      break;
    }

    let buttonIndex = await ons.notification.confirm({
      title: '提示',
      message: params.tip,
      modifier: 'rowfooter',
      buttonLabels: buttons.map((btn) => (btn.text)),
      primaryButtonIndex: 1,
    });

    let cb = buttons[buttonIndex].onClick;
    cb && cb();
  },
};

export default AccountOperationMixin;
