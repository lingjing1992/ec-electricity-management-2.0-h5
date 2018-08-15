import React, { PureComponent } from 'react';
import { Table, Input, notification } from 'antd';
import { toFixed } from '../../utils/utils';
import { connect } from 'dva';
import styles from './GoodsCreate.less';

@connect(state => ({
  global: state.global,
}))
export default class SkuTableForm extends PureComponent {
  static defaultProps = {
    disabled: false,
  };

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
          item.price = Math.round(parseFloat(skuOriginPrice) * exchangeRate);
        } else {
          item.price = toFixed(parseFloat(skuOriginPrice) * exchangeRate, 2);
        }
      }
      if (skuSalePrice) {
        if (currency === 'TWD') {
          item.discount_price = Math.round(parseFloat(skuSalePrice) * exchangeRate);
        } else {
          item.discount_price = toFixed(parseFloat(skuSalePrice) * exchangeRate, 2);
        }
      }
      if (skuShipping) {
        if (currency === 'TWD') {
          item.ship_price = Math.round(parseFloat(skuShipping) * exchangeRate);
        } else {
          item.ship_price = toFixed(parseFloat(skuShipping) * exchangeRate, 2);
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
    const languageForMessage = this.props.global.languageDetails.message;
    if (!(/^\d+(\.\d{1,2})?$/.test(value))) {
      notification.error({
        message: languageForMessage.KindlyReminder,
        description: languageForMessage.enterValueOfNumber,
      });
      return false;
    } else {
      return true;
    }
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
        width: '20%',
        render: (text, record) => {
          const result = record.sku_property_names.split(',') || '';
          return (
            <div>{`${result[0] || ''}${result[1] ? '-' : ''}${result[1] || ''}`}</div>
          );
        },
      },
      {
        title: languageForProductEdit.OriginalPrice,
        dataIndex: 'price',
        key: 'price',
        width: '20%',
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'price', record.sku_property_ids)}
              placeholder={languageForProductEdit.OriginalPrice}
            />
          );
        },
      },
      {
        title: languageForProductEdit.salesPrice,
        dataIndex: 'discount_price',
        key: 'discount_price',
        width: '20%',
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'discount_price', record.sku_property_ids)}
              placeholder={languageForProductEdit.salesPrice}
            />
          );
        },
      },
      {
        title: languageForProductEdit.ShippingFee,
        dataIndex: 'ship_price',
        key: 'ship_price',
        width: '30%',
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'ship_price', record.sku_property_ids)}
              placeholder={languageForProductEdit.ShippingFee}
            />
          );
        },
      },
    ];
    const { handleBatchFilling } = this.state;

    return (
      <div>
        <div style={{ marginBottom: 40 }} className={styles.skuTableForm}>
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
