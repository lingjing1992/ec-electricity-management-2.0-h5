import React, { PureComponent } from 'react';
import { Input, notification, Modal } from 'antd';
import { connect } from 'dva';
// import { toFixed } from '../../utils/utils';
import Table from '../../components/table';
import styles from './GoodsCreate.less';
import cloneDeep from 'lodash/cloneDeep';

@connect(state => ({
  global: state.global,
  setting: state.setting,
  goodsCreate: state.goodsCreate,
}))
export default class ExchangeRate extends PureComponent {

  state = {
    rateOfExChangeVisible: false,
    rateOfExChange: [],
  }

  componentWillMount() {
    this.init();
  }

  init = () => {
    const { rateOfExChange } = this.props.goodsCreate;
    this.setState({
      rateOfExChange: rateOfExChange
    })
  }

  //设置兑换率
  setRateOfExChange = (currencys) => {
    this.props.dispatch({
      type:`goodsCreate/setRateOfExChange`,
      payload:currencys
    })
  }

  setRateOfExChangeVisible = (value) => {
    this.setState({
      rateOfExChangeVisible: value,
    })
  }

  render() {
    const { languageDetails  } = this.props;
    const { rateOfExChangeVisible, rateOfExChange } = this.state;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const languageForMessage = languageDetails.message;
    const {rateLoading} = this.props.setting;
    //兑率表格列属性
    const rateOfExchangeColumn = [
      {
        title: languageForProductEdit.Currency,
        dataIndex: 'currencyCode',
      },
      {
        title: languageForProductEdit.DollarExchangeRate,
        dataIndex: 'exchangeRate',
        render: (text, record, index) => {
          const disabled = record.currencyCode === 'USD';
          return (
            <Input
              type='number'
              value={text}
              disabled={disabled}
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace(/[e]/i, '');
                const newValue = value === '' ? '' : parseFloat(value);
                let arr = cloneDeep(rateOfExChange);
                arr[index].exchangeRate = newValue;
                this.setState({
                  rateOfExChange: arr
                })
                console.log(rateOfExChange);
              }}
            />
          )
        }
      },
    ];
    return (
      <span>
        <a onClick={() => {this.setRateOfExChangeVisible(true)}}>{languageForProductEdit.CurrencyConverter}</a>
        <Modal
          title={languageForProductEdit.CurrencyConverter}
          visible={rateOfExChangeVisible}
          width='400px'
          className={styles.exchangeTool}
          confirmLoading={rateLoading}
          onCancel={() => {
            this.setRateOfExChangeVisible(false);
          }}
          onOk={() => {
            if(JSON.stringify(rateOfExChange) !== JSON.stringify(this.props.goodsCreate.rateOfExChange)){
              for (let i = 0; i < rateOfExChange.length; i++) {
                if (rateOfExChange[i].exchangeRate === '') {
                  notification.error({
                    message: languageForMessage.KindlyReminder,
                    description: languageForMessage.rateisrequired,
                  });
                  return;
                } else if (rateOfExChange[i].exchangeRate <= 0) {
                  notification.error({
                    message: languageForMessage.KindlyReminder,
                    description: languageForMessage.rateShouldBe,
                  });
                  return;
                }
              }
              this.props.dispatch({
                type: 'setting/setExchangeRate',
                payload: {
                  usdRateLists: rateOfExChange.map((item) => {
                    return {
                      currencyCode: item.currencyCode,
                      openStatus: 1,
                      usdRate: item.exchangeRate,
                    };
                  }),
                },
                callback: (data) => {
                  if (data.status === 200) {
                    this.setRateOfExChange(rateOfExChange);
                    this.setRateOfExChangeVisible(false)
                  }
                },
              });
            }else {
              this.setRateOfExChangeVisible(false)
            }
          }}
        >
          <Table
            columns={rateOfExchangeColumn}
            dataSource={rateOfExChange}
            rowKey='currencyCode'
            pagination={false}
            loading={rateLoading}
            isHalfPadding={true}
          />
        </Modal>
      </span>
    );
  }
}
