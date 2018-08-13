import React, { PureComponent } from 'react';
import { Input, notification } from 'antd';
import Table from '../../components/table';
import { connect } from 'dva';
import { toFixed } from '../../utils/utils';
import styles from './GoodsCreate.less';

@connect(state => ({
  global: state.global,
}))
export default class SkuPriceForm extends PureComponent {
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
      selectedRowKeys: props.selectedRowKeys,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const data = nextProps.value || [];

      this.setState({
        data,
      });
    }

    if ('selectedRowKeys' in nextProps) {
      const selectedRowKeys = nextProps.selectedRowKeys || [];

      this.setState({
        selectedRowKeys,
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
    const { selectedRowKeys } = this.state;
    let exchangeRate = 1;
    //兑率
    for (let i = 0; i < currencys.length; i++) {
      if (currency === currencys[i].currencyCode) {
        exchangeRate = currencys[i].exchangeRate;
        break;
      }
    }
    newData.map((item) => {
      if (selectedRowKeys.indexOf(item.sku_property_ids) >= 0) {
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
      }
      return item;
    });

    this.setState({ data: newData });
  };

  handleFieldChange = (e, fieldName, record) => {
    const key = record.sku_property_ids;
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
    if (!(/^(\d+(\.\d{1,2})?)?$/.test(value))) {
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
        classType: 2,
        render: (text, record) => {
          const result = record.sku_property_names.split(',') || '';
          return (
            <div className={styles.skuPropertyName}>{`${result[0] || ''}${result[1] ? '-' : ''}${result[1] || ''}`}<br/><span>{languageForProductEdit.Stock}：{record.quantity}</span>
            </div>
          );
        },
      },
      {
        title: languageForProductEdit.SupplyCost,
        dataIndex: 'supplyPrice',
        key: 'supplyPrice',
        classType: 3,
        render: (text, record) => {
          return (
            <span>{(text + record.refShipPrice).toFixed(2)}</span>
          );
        },
      },
      {
        title: languageForProductEdit.ReferencePrice,
        dataIndex: 'refPrice',
        key: 'refPrice',
        classType: 2,
      },
      {
        title: languageForProductEdit.OriginalPrice,
        dataIndex: 'price',
        key: 'price',
        classType: 3,
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'price', record)}
              placeholder={languageForProductEdit.OriginalPrice}
            />
          );
        },
      },
      {
        title: languageForProductEdit.salesPrice,
        dataIndex: 'discount_price',
        key: 'discount_price',
        classType: 3,
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'discount_price', record)}
              placeholder={languageForProductEdit.salesPrice}
            />
          );
        },
      },
      {
        title: languageForProductEdit.ShippingFee,
        dataIndex: 'ship_price',
        key: 'ship_price',
        classType: 3,
        render: (text, record) => {
          return (
            <Input
              disabled={this.props.disabled}
              value={text}
              type='number'
              onChange={e => this.handleFieldChange(e, 'ship_price', record)}
              placeholder={languageForProductEdit.ShippingFee}
            />
          );
        },
      },
      {
        title: `${languageForProductEdit.Weight}（g）`,
        dataIndex: 'weight',
        key: 'weight',
        classType: 2,
      },
      {
        title: languageForProductEdit.SupplierSKU,
        dataIndex: 'seller_sku',
        key: 'seller_sku',
        classType: 2,
      },
    ];
    const { handleBatchFilling, data, selectedRowKeys } = this.state;
    const { othersInfo } = this.props;
    let dataSource = [];
    if (data && data.length > 0 && othersInfo.length > 0) {
      dataSource = data.map((item, index) => {
        return {
          ...item,
          ...othersInfo[index],
        };
      });
    }
    // 价格可部分选择
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.selectedKeysChangeHandle(selectedRowKeys);
      },
    };

    return (
      <div>
        <div className={styles.skuTableForm}>
          <Table
            rowKey="sku_property_ids"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowSelection={rowSelection}
            rowClassName={(record) => {
              return record.editable ? styles.editable : '';
            }}
          />
        </div>
      </div>
    );
  }
}

