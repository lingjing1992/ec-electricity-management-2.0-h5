import React, { PureComponent } from 'react';
import {  Button, Input, message, Popconfirm, Divider, notification } from 'antd';
import Table from '../../components/table';
import { connect } from 'dva';
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
        quantity: '',
        weight: '',
        seller_sku: '',
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
      weight: '',
      name: languageForProductEdit.attributeValue,
      seller_sku: '',
      editable: true,
      isNew: true,
      quantity: '',
    });
    this.index += 1;
    this.setState({ data: newData });
  }
  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  // handleFieldChange(e, fieldName, key) {
  //   const newData = [...this.state.data];
  //   const target = this.getRowByKey(key);
  //   console.log('target',target)
  //   if (target) {
  //     // target[fieldName] = e.target.value;
  //     newData.map((item) => {
  //       item[fieldName] = e.target.value
  //       return item;
  //     });
  //     this.setState({ data: [...newData] });
  //     this.setState({ data: newData });
  //   }
  // }
  handleFieldChange(e, fieldName, key) {
    if (fieldName == 'quantity' || fieldName == 'weight') {
      // if (!(/^[0-9]{0}([0-9]|[.])+$/.test(e.target.value))) {
      const languageForMessage = this.props.global.languageDetails.message;
      if (!(/^\d+(\.\d{1,2})?$/.test(e.target.value))) {
        notification.error({
          message: languageForMessage.KindlyReminder,
          description: languageForMessage.enterValueOfNumber,
        });
        return false;
      }
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
        (!target.weight && target.weight != 0)
        ||
        (!target.quantity && target.quantity != 0)
        ||
        (!target.seller_sku && target.seller_sku != 0)
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
    this.setState({
      handleBatchFilling: Object.assign({ ...handleBatchFilling }, { [target]: e.target.value }),
    });
  }
  handleBatchFilling = () => {
    const newData = [...this.state.data];

    newData.map((item) => {
      if (this.state.handleBatchFilling.quantity) {
        item.quantity = this.state.handleBatchFilling.quantity;
      }
      if (this.state.handleBatchFilling.weight) {
        item.weight = this.state.handleBatchFilling.weight;
      }
      if (this.state.handleBatchFilling.seller_sku) {
        item.seller_sku = this.state.handleBatchFilling.seller_sku;
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
      classType: 2,
      render: (text, record) => {
        const result = record.sku_property_names.split(',') || '';
        return (
          <div>{`${result[0] || ''}${result[1] ? '-' : ''}${result[1] || ''}`}</div>
        );
      },
    }, {
      title: languageForProductEdit.Stock,
      dataIndex: 'quantity',
      key: 'quantity',
      classType: 6,
      render: (text, record) => {
//        if (record.editable) {
//          return (
//            <Input
//              value={text}
//              type='number'
//              autoFocus
//              onChange={e => this.handleFieldChange(e, 'quantity', record.sku_property_ids)}
//              onBlur={e => this.saveRow(e, record.sku_property_ids)}
//              onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
//              placeholder="库存"
//            />
//          );
//        }
//        return text;
        return (
          <Input
            disabled={this.props.disabled}
            value={text}
            type='number'
            onChange={e => this.handleFieldChange(e, 'quantity', record.sku_property_ids)}
            onBlur={e => this.saveRow(e, record.sku_property_ids)}
            onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
            placeholder={languageForProductEdit.Stock}
          />
        );
      },
    }, {
      title: `${languageForProductEdit.Weight}（g）`,
      dataIndex: 'weight',
      key: 'weight',
      classType: 6,
      render: (text, record) => {
//        if (record.editable) {
//          return (
//            <Input
//              value={text}
//              type='number'
//              onChange={e => this.handleFieldChange(e, 'weight', record.sku_property_ids)}
//              onBlur={e => this.saveRow(e, record.sku_property_ids)}
//              onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
//              placeholder="重量（g）"
//            />
//          );
//        }
//        return text;
        return (
          <Input
            disabled={this.props.disabled}
            value={text}
            type='number'
            onChange={e => this.handleFieldChange(e, 'weight', record.sku_property_ids)}
            onBlur={e => this.saveRow(e, record.sku_property_ids)}
            onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
            placeholder={`${languageForProductEdit.Weight}（g）`}
          />
        );
      },
    }, {
      title: languageForProductEdit.SupplierSKU,
      dataIndex: 'seller_sku',
      key: 'seller_sku',
      classType: 6,
      render: (text, record) => {
//        if (record.editable) {
//          return (
//            <Input
//              value={text}
//              onChange={e => this.handleFieldChange(e, 'seller_sku', record.sku_property_ids)}
//              onBlur={e => this.saveRow(e, record.sku_property_ids)}
//              onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
//              placeholder="供应商SKUID"
//            />
//          );
//        }
//        return text;
        return (
          <Input
            disabled={this.props.disabled}
            value={text}
            onChange={e => this.handleFieldChange(e, 'seller_sku', record.sku_property_ids)}
            onBlur={e => this.saveRow(e, record.sku_property_ids)}
            onKeyPress={e => this.handleKeyPress(e, record.sku_property_ids)}
            placeholder={languageForProductEdit.SupplierSKU}
          />
        );
      },
    },
//      {
//      title: '操作',
//      key: 'action',
//      width: '100px',
//      render: (text, record, index) => {
//        if (record.editable) {
//          if (record.isNew) {
//            return (
//              <span>
//                <a>保存</a>
//                {/*
//                <Divider type="vertical" />
//                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
//                  <a>删除</a>
//                </Popconfirm>
//                */}
//              </span>
//            );
//          }
//          return (
//            <span>
//              <a>保存</a>
//              <Divider type="vertical" />
//              <a onClick={e => this.cancel(e, record.sku_property_ids)}>取消</a>
//            </span>
//          );
//        }
//        return (
//          <span>
//            <a onClick={e => this.toggleEditable(e, record.sku_property_ids)}>编辑</a>
//            {/*
//            <Divider type="vertical" />
//            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
//              {
//                record.name !== '属性名称'
//                ?
//                  <a>删除</a>
//                  :
//                  null
//              }
//            </Popconfirm>
//            */}
//          </span>
//        );
//      },
//    }
    ];
    const { handleBatchFilling } = this.state;
    return (
      <div style={{ marginBottom: 40 }} className={styles.skuCommonTableForm}>
        <div>
          <div style={{ margin: '0 0 20px 0' }}>
            <span style={{ width: 200, margin: '0 8px 8px 0' }}>{languageForProductEdit.BatchInput}：</span>
            <Input
              disabled={this.props.disabled}
              value={handleBatchFilling.quantity}
              style={{ width: 200, marginRight: '8px' }}
              onChange={this.handleBatchFillingChange.bind(this, 'quantity')}
              type='number'
              placeholder={languageForProductEdit.Stock}
            />
            <Input
              disabled={this.props.disabled}
              value={handleBatchFilling.weight}
              style={{ width: 200, marginRight: '8px' }}
              onChange={this.handleBatchFillingChange.bind(this, 'weight')}
              type='number'
              placeholder={languageForProductEdit.Weight}
            />
            <Input
              disabled={this.props.disabled}
              value={handleBatchFilling.seller_sku}
              style={{ width: 200, marginRight: '8px' }}
              onChange={this.handleBatchFillingChange.bind(this, 'seller_sku')}
              placeholder={languageForProductEdit.SupplierSKU}
            />
            <Button
              type="primary"
              onClick={this.handleBatchFilling}
              disabled={this.props.disabled}
              style={{float:'right'}}
            >
              {languageForProductEdit.BatchInput}
            </Button>
          </div>
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
