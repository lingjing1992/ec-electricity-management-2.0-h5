import React, {PureComponent} from 'react';
import {Select, Button, message} from "antd";
import {connect} from 'dva';
import {addressString, setStateObjectKey} from '../../utils/utils';
import ReturnAddress from '../ReturnAddress/ReturnAddressPop'

const {Option} = Select;
@connect(state => ({
  shop: state.shop,
  global: state.global
}))
export default class ReturnAddrForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data              : props.value,
      returnAddressLists: [],//退货地址列表
      returnAddress     : '',//退货地址
      returnAddressVisible: false,//退货地址弹窗控制
      defaultValue:{
        id:0,
        deftType: true,
        city:undefined,
        region:undefined,
        zip:undefined,
        country:'China',
        name:undefined,
        addressLine1:undefined,
        addressLine2:undefined,
      },//默认值
      permission: this.props.global.rolePower.modules['1001'].moduleSubs['10019'].moduleFunctions['100054'],//权限值
      defaultAddr: {},//默认地址
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.returnAddress.id !== this.props.returnAddress.id) {
      this.setState({
        defaultAddr: nextProps.returnAddress,
      })
      this.getReturnAddress(nextProps.returnAddress.id)
    }
  }

  componentWillMount() {
    //供应商
    if(!this.state.permission.disabled){
      this.getBackAddr(()=>{
        this.getDefaultAddr();
      });
    }else {
      this.setState({
        returnAddress: this.state.data
      })
    }
  }

  //获取默认地址
  getDefaultAddr = () => {
    const { returnAddressLists } = this.state;
    if(returnAddressLists.length>0){
      const id = returnAddressLists.filter((item) => {
        return item.deftType;
      })[0].id;
      this.getReturnAddress(id);
    }
  }

  //退货地址编辑弹窗显示关闭
  showModal  = (boolean) => {
    this.setState({
      returnAddressVisible: boolean
    })
  }
  //操作
  handleMenuClick = (record) => {
    this.showModal(true);
    setStateObjectKey(this,'defaultValue',{
      ...record,
    })
  }

  handleSetValue = (object) => {
    setStateObjectKey(this,'defaultValue',object)
  }

  //获取退货地址
  getBackAddr = (callback) => {
    this.props.dispatch({
      type    : 'shop/getBackAddr',
      callback: (data) => {
        if (data.status === 200) {
          this.setState({
            returnAddressLists: data.data.backAddr
          })
          if(callback){
            callback();
          }
        }
      }
    })
  }
  //提交成功
  hadnleSucceed = (respone) => {
    const languageForMessage = this.props.global.languageDetails.message;
    const backAddr = respone.data.backAddr[0];
    this.handleMenuClick({
      id:0,
      deftType: true,
      city:undefined,
      region:undefined,
      zip:undefined,
      country:'China',
      name:undefined,
      addressLine1:undefined,
      addressLine2:undefined,
    })
    message.success(languageForMessage.SubmittedSuccessfully);
    this.getReturnAddress(backAddr.id,backAddr);
    this.getBackAddr();
  }

  //获取选中地址
  getReturnAddress = (id,backAddr) => {
    setStateObjectKey(this,'data',{
      id: id
    })
    this.props.onSetReturnAddress({
      id: id,
    })
    if(backAddr){
      this.setState({
        returnAddress: backAddr
      })
    }else {
      this.setState({
        returnAddress: this.state.returnAddressLists.filter((item) => {
          return item.id == id
        })[0]
      })
    }
  }

  render() {
    const {returnAddressLists, returnAddress, data, permission, defaultAddr} = this.state;
    const languageForRturnAddr = this.props.global.languageDetails.returnAddress;
    return (
      <div>
        {
          !permission.disabled ? (
            <div>
              <Select
                value={data.id}
                placeholder={languageForRturnAddr.PleaseSelect}
                onChange = {
                  (value) =>{
                    this.getReturnAddress(value);
                  }
                }
                style={{width: 200, marginRight: 10}}>
                {
                  returnAddressLists.map((item) => {
                    return (
                      <Option value={item.id} key={item.id}>{item.name}</Option>
                    )
                  })
                }
              </Select>
              <Button type="primary" onClick={this.showModal.bind(this,true)}>
                {languageForRturnAddr.AddReturnAddress}
              </Button>
            </div>
          ) : ''
        }
        {
          !permission.disabled ? (
            <div>
              {addressString(returnAddress)}
            </div>
          ) : (
            <div>
              {addressString(defaultAddr)}
            </div>
          )
        }
        <ReturnAddress
          visible={this.state.returnAddressVisible}
          onShowModal={this.showModal}
          onSetValue={this.handleSetValue}
          defaultValue={this.state.defaultValue}
          onSucceed={this.hadnleSucceed}
        />
      </div>
    )
  }
}
