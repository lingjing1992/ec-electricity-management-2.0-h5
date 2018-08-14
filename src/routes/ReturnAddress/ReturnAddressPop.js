import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import ReturnAddress from '../../components/modalForm';
import styles from './index.less';
const FormItem = Form.Item;
@connect(state => ({
  global: state.global,
  orders: state.orders,
  shop: state.shop,
}))
@Form.create()
export default class returnAddressInput extends Component {
  static defaultProps = {
    visible: false,
    onShowModal: () => {},
    onGetBackAddr: () => {},
    onSetValue: () => {},
    defaultValue: {},
    onSucceed: () => {}, //成功提交
  };
  state = {
    //    returnAddressVisible: false,
    country: [], //国家列表
    zone: [], //地区列表
    tableResource: [], //表格数据
    hasSelect: true, //是否有选择，没有则变为文本框
    currentCountryName: '', //当前选择的国家code
  };
  componentWillMount() {
    this.init(); //获取国家列表
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.defaultValue.country !== this.state.currentCountryName ||
      this.state.zone.length === 0
    ) {
      this.handleCountrySelect(nextProps.defaultValue.country);
    }
  }

  //初始化
  init = () => {
    this.getLocalsCountry(); //获取国家列表
    this.handleCountrySelect(this.props.defaultValue.country);
  };

  //获取国家列表
  getLocalsCountry = () => {
    const _this = this;
    const { countryList } = this.props.orders;
    if (countryList.length > 0) {
      this.setState({
        country: countryList,
      });
    } else {
      this.props.dispatch({
        type: 'orders/orderPushGetLocals',
        callback: () => {
          this.setState({
            country: _this.props.orders.countryList,
          });
        },
      });
    }
  };

  //保存&更新退货地址
  saveOrUpdateBackAddr = params => {
    const deftType = Number(params.deftType.length === 1);
    delete params.deftType;
    this.props.dispatch({
      type: 'shop/saveOrUpdateBackAddr',
      payload: {
        id: this.props.defaultValue.id,
        ...params,
        deftType: deftType,
      },
      callback: data => {
        if (data.status === 200) {
          this.props.onSucceed(data);
          this.props.onGetBackAddr();
          this.handleCancel();
        }
      },
    });
  };

  //退货地址弹窗关闭
  handleCancel = () => {
    this.props.onSetValue({
      id: 0,
      deftType: true,
      city: undefined,
      region: undefined,
      zip: undefined,
      country: 'China',
      name: undefined,
      addressLine1: undefined,
      addressLine2: undefined,
    });
    this.props.onShowModal(false);
  };

  onOk = params => {
    console.log(params);
    this.saveOrUpdateBackAddr(params);
  };

  handleCountrySelect = (name, callback) => {
    if (this.state.country.length === 0) return;
    const countryValue = this.state.country.filter(item => {
      return item.name === name;
    })[0];
    if (countryValue) {
      const hasSelect = countryValue.name && countryValue.states.length > 0;
      this.setState({
        zone: countryValue.states,
        hasSelect: hasSelect,
        currentCountryName: countryValue.name,
      });
      if (callback) {
        callback(countryValue);
      }
    }
  };

  render() {
    const {
      shop: { loading },
      defaultValue,
    } = this.props;
    const languageForRturnAddr = this.props.global.languageDetails.returnAddress;
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForMessage = this.props.global.languageDetails.message;
    const language = this.props.global.language;
    //表单属性
    const returnAddressSource = [
      {
        type: 1, //文本输入框Input
        title: languageForRturnAddr.ReturnAddressName,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message: languageForMessage.Enter20Characters,
            required: true,
            max: 20,
          },
        ],
        key: 'name',
        initialValue: defaultValue.name,
      },
      {
        type: 1, //文本输入框Input
        title: languageForRturnAddr.Recipient,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message: languageForMessage.Enter20Characters,
            required: false,
            max: 20,
          },
        ],
        key: 'recipient',
        initialValue: defaultValue.recipient,
      },
      {
        type: 2, //文本选择框Select
        title: languageForRturnAddr.Country,
        placeholder: [languageForGlobal.PleaseSelect, languageForGlobal.PleaseEnter],
        rules: [
          {
            message: `${languageForGlobal.PleaseSelect}${languageForRturnAddr.Country}`,
            required: true,
          },
        ],
        key: 'country',
        select: {
          key: 'name',
          name: 'name',
          arr: this.state.country,
        },
        onChange: value => {
          const _this = this;
          this.handleCountrySelect(value, countryValue => {
            _this.props.onSetValue({
              region: undefined,
              country: countryValue.name,
            });
          });
        },
        initialValue: defaultValue.country,
      },
      {
        type: 2, //文本选择框Select
        title: languageForRturnAddr.State,
        placeholder: [languageForGlobal.PleaseSelect, languageForGlobal.PleaseEnter],
        rules: [
          {
            message: `${languageForGlobal.PleaseSelect}${languageForRturnAddr.State}`,
            required: true,
          },
        ],
        key: 'region',
        select: this.state.zone,
        initialValue: defaultValue.region,
        hasSelect: this.state.hasSelect,
      },
      {
        type: 1, //文本输入框Input
        title: languageForRturnAddr.City,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message: languageForMessage.EnterNameOfTheCity,
            required: true,
          },
        ],
        key: 'city',
        initialValue: defaultValue.city,
      },
      {
        type: 1, //文本输入框Input
        title: languageForRturnAddr.AddressLine1,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message: languageForMessage.EnterReturnAddress,
            required: true,
          },
        ],
        key: 'addressLine1',
        initialValue: defaultValue.addressLine1,
      },
      {
        type: 1, //文本输入框Input
        title: languageForRturnAddr.AddressLine2,
        rules: [
          {
            required: false,
          },
        ],
        key: 'addressLine2',
        initialValue: defaultValue.addressLine2,
      },
      {
        type: 1, //文本输入框Input
        title: languageForRturnAddr.ZipPostCode,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message: `${languageForGlobal.PleaseEnter}${languageForRturnAddr.ZipPostCode}`,
            required: true,
          },
        ],
        key: 'zip',
        className: styles.zip,
        initialValue: defaultValue.zip,
      },
      {
        type: 3, //复选按钮checkbox
        text: languageForRturnAddr.SetDefault,
        rules: [
          {
            required: false,
          },
        ],
        key: 'deftType',
        //        onChange: (e) => {
        //          this.props.onSetValue({
        //            deftType: e.target.checked,
        //          })
        //        },
        //        value:this.props.defaultValue.deftType,//绑定值
        initialValue: this.props.defaultValue.deftType, //初始值
      },
    ];

    return (
      <ReturnAddress
        title={languageForRturnAddr.ReturnAddress}
        source={returnAddressSource}
        visible={this.props.visible}
        onCancel={this.handleCancel}
        onOk={this.onOk}
        okText={languageForGlobal.Confirm}
        loading={loading}
        width={520}
      />
    );
  }
}
