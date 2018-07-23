import React, { PureComponent } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, notification } from 'antd';
import styles from './GoodsCreate.less';
import { connect } from 'dva';

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
        data: nextProps.value,
      });
    }
  }
  getRowByKey(key) {
    return this.state.data.filter(item => item.sku_property_ids === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'form/submit',
          payload: values,
        });
      }
    });
  }
  toggleEditable(e, key) {
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: [...this.state.data] });
    }
  }
  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    this.props.onChange(newData);
  }
  newMember = () => {
    const newData = [...this.state.data];
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    newData.push({
      key: `NEW_TEMP_ID_${this.index}`,
      discount_price: '',
      name: languageForProductEdit.attributeValue,
      ship_price: '',
      editable: true,
      isNew: true,
      price: '',
    });
    this.index += 1;
    this.setState({ data: newData });
  }
  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  handleFieldChange(e, fieldName, key) {
    // if (!(/^[0-9]{0}([0-9]|[.])+$/.test(e.target.value))) {
    const languageForMessage = this.props.global.languageDetails.message;
    if (!(/^\d+(\.\d{1,2})?$/.test(e.target.value))) {
      notification.error({
        message: languageForMessage.KindlyReminder,
        description: languageForMessage.enterValueOfNumber,
      });
      return false;
    }

    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
  }
  saveRow(e, key) {
    e.persist();
    // save field when blur input
    const languageForMessage = this.props.global.languageDetails.message;
    setTimeout(() => {
      if (document.activeElement.tagName === 'INPUT' &&
          document.activeElement !== e.target) {
        return;
      }
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      if (
        (!target.discount_price && target.discount_price != 0)
        ||
        (!target.price && target.price != 0)
        ||
        (!target.ship_price && target.ship_price != 0)
      ) {
        message.error(languageForMessage.PleaseFill);
        e.target.focus();
        return;
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.props.onChange(this.state.data);
    }, 10);
  }
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: [...this.state.data] });
  }
  handleBatchFillingChange = (target, e) => {
    const { handleBatchFilling } = this.state;
    const newData = [...this.state.handleBatchFilling];

    console.log('e,target==>', target);
    console.log('e,e.target.value==>', e.target.value);

    // this.state.handleBatchFilling[target]=e.target.value

    // console.log('this.state.handleBatchFilling',this.state.handleBatchFilling)
    this.setState({
      handleBatchFilling: Object.assign({ ...handleBatchFilling }, { [target]: e.target.value }),
    });
  }
  handleBatchFilling = () => {
    // let { handleBatchFilling } = this.state;
    const newData = [...this.state.data];
    const { handleBatchFilling } = this.state;

    newData.map((item) => {
      // price: '',
      //   discount_price: '',
      //   ship_price: '',
      if (this.state.handleBatchFilling.price) {
        item.price = this.state.handleBatchFilling.price;
      }
      if (this.state.handleBatchFilling.discount_price) {
        item.discount_price = this.state.handleBatchFilling.discount_price;
      }
      if (this.state.handleBatchFilling.ship_price) {
        item.ship_price = this.state.handleBatchFilling.ship_price;
      }

      console.log('newData', item);
      return item;
    });

    this.setState({ data: newData });
  }
  render() {
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const columns = [{
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
    }, {
      title: languageForProductEdit.OriginalPrice,
      dataIndex: 'price',
      key: 'price',
      width: '20%',
      render: (text, record) => {
        return (
          <Input
            value={text}
            type='number'
            onChange={e => this.handleFieldChange(e, 'price', record.sku_property_ids)}
            onBlur={e => this.saveRow(e, record.sku_property_ids)}
            onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
            placeholder={languageForProductEdit.Operation}
          />
        );
      },
    }, {
      title: languageForProductEdit.salesPrice,
      dataIndex: 'discount_price',
      key: 'discount_price',
      width: '20%',
      render: (text, record) => {
        return (
          <Input
            value={text}
            type='number'
            onChange={e => this.handleFieldChange(e, 'discount_price', record.sku_property_ids)}
            onBlur={e => this.saveRow(e, record.sku_property_ids)}
            onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
            placeholder={languageForProductEdit.salesPrice}
          />
        );
      },
    }, {
      title: languageForProductEdit.ShippingFee,
      dataIndex: 'ship_price',
      key: 'ship_price',
      width: '30%',
      render: (text, record) => {
        return (
          <Input
            value={text}
            type='number'
            onChange={e => this.handleFieldChange(e, 'ship_price', record.sku_property_ids)}
            onBlur={e => this.saveRow(e, record.sku_property_ids)}
            onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
            placeholder={languageForProductEdit.ShippingFee}
          />
        );
      },
    },
    ];
    console.log('this=>', this);

    console.log('props', this.props.value);
    const { handleBatchFilling } = this.state;

    return (
      <div style={{ marginBottom: 40 }} className={styles.skuTableForm}>
        <div style={{ margin: '20px 0' }}>
          <span style={{ width: 200, margin: '0 8px 8px 0' }}>{languageForProductEdit.BatchInput}：</span>
          <Input
            value={handleBatchFilling.price}
            style={{ width: 200, margin: '0 8px 8px 0' }}
            onChange={this.handleBatchFillingChange.bind(this, 'price')}
            placeholder={languageForProductEdit.OriginalPrice}
            type='number'
          />
          <Input
            value={handleBatchFilling.discount_price}
            style={{ width: 200, margin: '0 8px 8px 0' }}
            onChange={this.handleBatchFillingChange.bind(this, 'discount_price')}
            placeholder={languageForProductEdit.salesPrice}
            type='number'
          />
          <Input
            value={handleBatchFilling.ship_price}
            style={{ width: 200, margin: '0 8px 8px 0' }}
            onChange={this.handleBatchFillingChange.bind(this, 'ship_price')}
            placeholder={languageForProductEdit.ShippingFee}
            type='number'
          />
          <Button
            type="primary"
            onClick={this.handleBatchFilling}
          >
            {languageForProductEdit.BatchInput}
          </Button>
        </div>
        <Table
          rowKey="sku_property_ids"
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
        {/*
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增成员
        </Button>
        */}
      </div>
    );
  }
}
