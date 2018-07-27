import React, { Component } from 'react';
import { connect } from 'dva';
import ExchangeRateEdit from '../../components/ExchangeRateEdit'
import {
  Switch,
  Table,
  Tooltip,
  Icon
} from 'antd';

@connect(state => ({
  setting : state.setting
}))
export default class ExchangeRate extends Component {
  state = {
    lists:[],
    visible: false,
    currentRate:{},
  }
  componentWillMount() {
    this.init();
  }
  init(){
    this.getExchangeRate();
  }
  //获取汇率列表
  getExchangeRate = () => {
    const props = this.props;
    props.dispatch({
      type:'setting/getExchangeRate',
      callback: (data) => {
        this.setState({
          lists: data.data.usdRateList,
        })
      }
    })
  }
  //打开编辑汇率窗口
  openEditPoup = (currentRate) => {
    this.setState({
      visible: true,
      currentRate: currentRate,
    })
  }
  
  //改变汇率状态
  setRateStatus = (record) => {
    this.setExchangeRate(record);
  }
  
  //更新汇率
  setExchangeRate = (values) => {
    console.log(values);
    const openStatus = values.openStatus ? 1 : 0;
    const { lists } = this.state;
    const _this = this;
    this.props.dispatch({
      type:'setting/setExchangeRate',
      payload: {
        currencyCode: values.currencyCode,
        openStatus: openStatus,
        usdRate: values.usdRate,
      },
      callback: (data) => {
        if(data.status === 200){
          this.checkChange(values.currencyCode, (index) => {
            lists[index].currencyCode = values.currencyCode;
            lists[index].openStatus = openStatus;
            lists[index].usdRate = values.usdRate;
            _this.setState({
              lists: lists,
            })
          })
        }
      }
    })
  }
  
  //查询对应的改变数据
  checkChange = (currencyCode,callback) => {
    const { lists } = this.state;
    for(let i=0; i<lists.length; i++){
      if(currencyCode === lists[i].currencyCode){
        callback(i);
      }
    }
  }
  
  render() {
    const { loading } = this.props.setting;
    const { visible, currentRate } = this.state;
    let columns   = [
      {
        title    : '序号',
        dataIndex: 'id',
        render: (text,record,index) => {
          return (<div>{index+1}</div>);
        }
      },
      {
        title    : '货币名称',
        dataIndex: 'currencyCode',
      },
      {
        title    : '符号',
        dataIndex: 'currencySymbol',
      },
      {
        title    : '启用',
        dataIndex: 'openStatus',
        render: (text,record,index) => {
          const check = text==1 ? true : false;
          const disabled = record.currencyCode === 'USD' ? true : false;
          return(
            <Switch
              disabled={disabled}
              checked={check}
              onChange={(status) => {
                record.openStatus = status;
                this.setRateStatus(record);
              }}
            />
          )
        }
      },
      {
        title    : (<div>美元兑换汇率<Tooltip placement="top" title="美元$1对各个货币的汇率"><Icon style={{marginLeft:'3px',}} type="info-circle-o" /></Tooltip></div>),
        dataIndex: 'usdRate',
      },
      {
        title    : (<div>美元参考兑换汇率<Tooltip placement="top" title="平台提供的近期市场汇率，定期更新"><Icon style={{marginLeft:'3px',}} type="info-circle-o" /></Tooltip></div>),
        dataIndex: 'usdRateRef',
      },
      {
        title    : '操作',
        dataIndex: 'operation',
        render: (text,reord) => {
          if(reord.currencyCode !== 'USD'){
            return(<a href="javascript:;" onClick={this.openEditPoup.bind(this,reord)}>编辑</a>)
          }
        }
      },
    ];
    return (
      <div>
        <ExchangeRateEdit
          visible={visible}
          dataSource={currentRate}
          onOk={this.setExchangeRate}
          onCancel={ () => {
            this.setState({
              visible: false,
            })
          }}
        ></ExchangeRateEdit>
        <Table
          rowKey="currencyCode"
          scroll={{x: 1200}}
          columns={columns}
          loading={loading}
          dataSource={this.state.lists}
        />
      </div>
    );
  }
}
