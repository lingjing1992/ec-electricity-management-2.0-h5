import React, { PureComponent } from 'react';
import { Input, notification } from 'antd';
import Table from '../../components/table';
import { connect } from 'dva';
import { toFixed } from '../../utils/utils';
import styles from './GoodsCreate.less';

@connect(state => ({
  global: state.global,
}))
export default class SkuTableForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      handleBatchFilling: {
        price: '',
        discount_price: '',
        ship_price: '',
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value || [],
      });
    }
    if (nextProps.skuOriginPrice !== this.props.skuOriginPrice || nextProps.skuSalePrice !== this.props.skuSalePrice || nextProps.skuShipping !== this.props.skuShipping) {
      this.handleBatchFilling(nextProps);
    }
  }

  componentWillMount() {

  }

  handleBatchFillingChange = () => {

  };

  handleBatchFilling = (nextProps) => {
    // let { handleBatchFilling } = this.state;
    const newData = [...this.state.data];
    const { skuOriginPrice, skuSalePrice, skuShipping, currencys, currency } = nextProps;
    let exchangeRate = 1;
    //兑率
    for (let i = 0; i < currencys.length; i++) {
      if (currency === currencys[i].currencyCode) {
        exchangeRate = currencys[i].exchangeRate;
        break;
      }
    }

    newData.map((item) => {

      if (skuOriginPrice) {
        if (currency === 'TWD') {
          item.refPrice = Math.round(parseFloat(skuOriginPrice) * exchangeRate);
        } else {
          item.refPrice = toFixed(parseFloat(skuOriginPrice) * exchangeRate, 2);
        }
      }
      if (skuSalePrice) {
        if (currency === 'TWD') {
          item.supplyPrice = Math.round(parseFloat(skuSalePrice) * exchangeRate);
        } else {
          item.supplyPrice = toFixed(parseFloat(skuSalePrice) * exchangeRate, 2);
        }
      }
      if (skuShipping) {
        if (currency === 'TWD') {
          item.refShipPrice = Math.round(parseFloat(skuShipping) * exchangeRate);
        } else {
          item.refShipPrice = toFixed(parseFloat(skuShipping) * exchangeRate, 2);
        }
      }

      console.log('newData', item);
      return item;
    });

    this.setState({ data: newData });
  };

  handleFieldChange = (e, fieldName, key) => {
    if (!this.errorPromit(e.target.value)) {
      return false;
    }

    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
  };

  errorPromit = (value) => {
    // const languageForMessage = this.props.global.languageDetails.message;
    // if (!(/^\d+(\.\d{1,2})?$/.test(value))) {
    //   notification.error({
    //     message: languageForMessage.KindlyReminder,
    //     description: languageForMessage.enterValueOfNumber,
    //   });
    //   return false;
    // }else {
    //   return true;
    // }
    return true;
  };

  saveRow = () => {

  };
  getRowByKey = (key) => {
    return this.state.data.filter(item => item.sku_property_ids === key)[0];
  };

  render() {
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const columns = [
      {
        title: languageForProductEdit.SKUAttribute,
        dataIndex: 'name',
        key: 'name',
        classType: 2,
        render: (text, record) => {
          const result = record.sku_property_names.split(',') || '';
          return (
            <div>{`${result[0] || ''}${result[1] ? '-' : ''}${result[1] || ''}`}</div>
          );
        },
      },
      {
        title: languageForProductEdit.OriginalPrice,
        dataIndex: 'refPrice',
        key: 'refPrice',
        classType: 6,
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'refPrice', record.sku_property_ids)}
              placeholder={languageForProductEdit.OriginalPrice}
            />
          );
        },
      },
      {
        title: languageForProductEdit.SupplyPrice,
        dataIndex: 'supplyPrice',
        key: 'supplyPrice',
        classType: 6,
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'supplyPrice', record.sku_property_ids)}
              placeholder={languageForProductEdit.SupplyPrice}
            />
          );
        },
      },
      {
        title: languageForProductEdit.ShippingFee,
        dataIndex: 'refShipPrice',
        key: 'refShipPrice',
        classType: 6,
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'refShipPrice', record.sku_property_ids)}
              placeholder={languageForProductEdit.ShippingFee}
            />
          );
        },
      }];

    return (
      <div>
        <div className={styles.skuTableForm}>
          <Table
            rowKey="sku_property_ids"
            columns={columns}
            dataSource={this.state.data}
            pagination={false}
            rowClassName={(record) => {
              return record.editable ? styles.editable : '';
            }}
          />
        </div>
      </div>
    );
  }
}
