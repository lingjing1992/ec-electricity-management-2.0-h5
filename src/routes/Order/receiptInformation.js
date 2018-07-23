import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import ReceiptInformation from '../../components/modalForm';
// import styles from './index.less';
import {getQueryString} from "../../utils/utils";
@connect(state => ({
  global: state.global,
  orders: state.orders,
}))
@Form.create()
export default class ReceiptInformationInput extends Component {
  static defaultProps = {
    visible: false,
    onShowModal: () => {},
    onGetBackAddr: () => {},
    onSetValue: () => {},
    defaultValue:{},
    onSucceed: ()=>{},//成功提交
  }
  state = {
//    ReceiptInformationVisible: false,
    country: [

    ],//国家列表
    zone: [

    ],//地区列表
    tableResource: [],//表格数据
    hasSelect: true,//是否有选择，没有则变为文本框
    currentCountryName: '',//当前选择的国家code
  }

  componentWillMount(){
    this.init();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.defaultValue.country !== this.props.defaultValue.country || this.state.zone.length===0){
      this.handleCountrySelect(nextProps.defaultValue.country);
    }
  }

  //初始化
  init = () => {
    this.getLocalsCountry();//获取国家列表
    this.handleCountrySelect(this.props.defaultValue.country);
  }

  //获取国家列表
  getLocalsCountry = () => {
    const _this = this;
    const { countryList } = this.props.orders;
    if(countryList.length>0){
      this.setState({
        country: countryList,
      })
    }else {
      this.props.dispatch({
        type: 'orders/orderPushGetLocals',
        callback: () => {
          this.setState({
            country: _this.props.orders.countryList,
          })
        }
      })
    }
  }

  handleCountrySelect = (name,callback) => {
    if(this.state.country.length===0 || !name)return;
    const countryValue = this.state.country.filter((item)=>{return item.name === name})[0];
    if(countryValue){
      const hasSelect = countryValue.name && countryValue.states.length>0;
      this.setState({
        zone: countryValue.states,
        hasSelect: hasSelect,
        currentCountryName: countryValue.name
      })
      if(callback){
        callback(countryValue);
      }
    }
  }

  //保存&更新退货地址
  saveReceiptInformation = (params) => {
    const orderNo = getQueryString().order_no || '';
    this.props.dispatch({
      type: `orders/orderPushUpdateOrderAddress`,
      payload: {
        order_no: orderNo,
        ...params,
      },
      callback: (data) => {
        this.handleCancel();
        this.props.onSucceed(data);
      },
    });
  }

  //退货地址弹窗关闭
  handleCancel = () => {
    this.props.onSetValue({
      id:0,
      deftType: true,
      city:undefined,
      region:undefined,
      zip:undefined,
      country:undefined,
      name:undefined,
      addressLine1:undefined,
      addressLine2:undefined,
    });
    this.props.onShowModal(false);
  }
  onOk = (params) => {
    console.log(params);
    this.saveReceiptInformation(params);
  }
  render(){
    const { orders: {loading}, defaultValue } = this.props;
    const languageForOrder = this.props.global.languageDetails.order.orderDetails;
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForMessage = this.props.global.languageDetails.message;
    const language = this.props.global.language;
    //表单属性
    const ReceiptInformationSource = [
      {
        type:1,//文本输入框Input
        title: languageForOrder.Consignee,
        placeholder: languageForGlobal.PleaseEnter,
        rules:[
          {
            required: true,
            message: `${languageForGlobal.PleaseEnter}${languageForOrder.Consignee}`
          }
        ],
        key:'receiver_name',
        initialValue: defaultValue.receiver_name
      },
      {
        type:1,//不可更改文本输入框Input
        title: languageForOrder.EmailAddress,
        text: '21731028@qq.com',
        key: 'email',
        initialValue: defaultValue.email,
        disabled: true,
      },
      // {
      //   type:4,//纯文本展示
      //   title: languageForOrder.LogisticsCompany,
      //   text: 'xiaoming',
      //   key: 'shipping_name',
      //   initialValue: defaultValue.shipping_name,
      // },
      // {
      //   type:4,//纯文本展示
      //   title: languageForOrder.TrackingNo,
      //   text: '123124124124',
      //   key: 'shipping_no',
      //   initialValue: defaultValue.shipping_no,
      // },
      {
        type:2,//文本选择框Select
        title: languageForOrder.Country,
        placeholder:[languageForGlobal.PleaseSelect,languageForGlobal.PleaseEnter],
        rules: [{
          message: `${languageForGlobal.PleaseSelect}${languageForOrder.Country}`,
          required: true,
        }],
        key: 'country',
        select:{
          key: 'name',
          name: 'name',
          arr: this.state.country
        },
        onChange: (value) => {
          const _this = this;
          this.handleCountrySelect(value,(countryValue)=>{
            _this.props.onSetValue({
              region: undefined,
              country: countryValue.name,
            })
          })
        },
        initialValue: defaultValue.country
      },
      {
        type:2,//文本选择框Select
        title: languageForOrder.StateProvince,
        placeholder:[languageForGlobal.PleaseSelect,languageForGlobal.PleaseEnter],
        rules: [
          {
            message:`${languageForGlobal.PleaseSelect}${languageForOrder.StateProvince}`,
            required: false,
          }
        ],
        key: 'state',
        select: this.state.zone,
        initialValue: defaultValue.state,
        hasSelect: this.state.hasSelect,
      },
      {
        type:1,//文本输入框Input
        title: languageForOrder.City,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message:languageForMessage.EnterNameOfTheCity,
            required: true,
          }
        ],
        key:'city',
        initialValue: defaultValue.city,
      },
      {
        type:1,//文本输入框Input
        title: languageForOrder.Street,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message:`${languageForGlobal.PleaseEnter}${languageForOrder.Street}`,
            required: true,
          }
        ],
        key:'address',
        initialValue: defaultValue.address,
      },
      {
        type:1,//文本输入框Input
        title: languageForOrder.TelephoneNo,
        rules: [
          {
            message:`${languageForGlobal.PleaseEnter}${languageForOrder.TelephoneNo}`,
            required: true,
          }
        ],
        key:'phone_number',
        initialValue: defaultValue.phone_number,
      },
      {
        type:1,//文本输入框Input
        title: languageForOrder.ZipCode,
        placeholder: languageForGlobal.PleaseEnter,
        rules: [
          {
            message:`${languageForGlobal.PleaseEnter}${languageForOrder.ZipCode}`,
            required: true,
          }
        ],
        key:'zip',
        initialValue: defaultValue.zip,
      },
    ];

    return (
      <ReceiptInformation
        title={languageForOrder.ShippingInformation}
        source={ReceiptInformationSource}
        visible={this.props.visible}
        onCancel={this.handleCancel}
        onOk={this.onOk}
        loading={loading}
        okText={languageForGlobal.Confirm}
        width={520}
      />
    )
  }
}


