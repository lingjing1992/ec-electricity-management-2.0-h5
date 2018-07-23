import React, {Component} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import styles from './SupplierSettlement.less';
import {
  Icon,
  Button,
  Select,
  Radio,
  Modal,
  DatePicker,
  Card,
  Row,
  Col,
  Dropdown,
  Menu,
  Form
} from 'antd';
import {downloadUrl, parseArr, setStateObjectKey} from '../../utils/utils';
import Table from '../../components/table';

const {Option, OptGroup} = Select;
const RadioGroup         = Radio.Group;
const RangePicker        = DatePicker.RangePicker;
const FormItem           = Form.Item;

@connect(state => ({
  finance: state.finance,
  global: state.global
}))


export default class SupplierSettlement extends Component {
  state = {
    //查询条件参数
    supplierSettlementParams: {
      pageNum        : 1,
      pageSize       : 20,
      settlementEnd  : '',
      settlementStart: '',
      status         : -1,
      moneyStatus    : -1,
    },
    //商品变更数据
    supplierSettlementData  : {
      reports: [],
    },
    //提现参数
    withdrawCashParams      : {
      id:0,
      moneyStatus: 1,
      status:1,
    },
    withdrawCashInfo : {

    },
    //提现弹窗控制
    withdrawCashVisible     : false,
    //长度
    totalPage               : 0,
    //总余额
    moneyTotal: '',
  }

  componentWillMount() {
    this.supplierSettlement();
  }

  supplierSettlementParamsChange = (keyName, key) => {
    setStateObjectKey(this,'supplierSettlementParams',{[keyName]: key});
  }

  datePick = (values) => {
    if(values.length>0){
      this.supplierSettlementParamsChange('settlementStart', moment(values[0]).format('YYYY-MM-DD'));
      this.supplierSettlementParamsChange('settlementEnd', moment(values[1]).format('YYYY-MM-DD'));
    }else {
      this.supplierSettlementParamsChange('settlementStart', '');
      this.supplierSettlementParamsChange('settlementEnd', '');
    }
    this.supplierSettlementChange();
  }

  //获取商品更改信息
  supplierSettlement       = () => {
    this.props.dispatch({
      type    : 'finance/getSupplierTradeReport',
      payload : this.state.supplierSettlementParams,
      callback: (data) => {
        if (data.status === 200) {
          this.setState(Object.assign(this.state.supplierSettlementData, data.data))
          this.setState({
            totalPage: data.data.total,
            moneyTotal: data.data.moneyTotal,
          })
        }
      }
    })
  }
  //条件变化再次获取信息
  supplierSettlementChange = () => {
    this.supplierSettlementParamsChange('pageNum', 1);
    this.supplierSettlement();
  }

  //设置提现参数
  setWithdrawCashParams  = (keyName, e) => {
    const {withdrawCashParams} = this.state;
    const key                  = e.hasOwnProperty('target') ? e.target.value : e;
    setStateObjectKey(this,'withdrawCashParams',{[keyName]: key});
  }
  //设置提现弹窗与否
  setWithdrawCashVisible = value => {
    this.setState({
      withdrawCashVisible: value
    })
  }
  //确认提现
  updateSupplierTradeReport = () => {
    this.props.dispatch({
      type: 'finance/updateSupplierTradeReport',
      payload: this.state.withdrawCashParams,
      callback: (data) => {
        if(data.status===200){
          this.setWithdrawCashVisible(false);
          this.supplierSettlement();
        }
      }
    })
  }
  //明细下载
  downloadDetails = (id) => {
    this.props.dispatch({
      type:'finance/downloadDetails',
      payload: {
        id: id,
      },
      callback:(data)=>{
        if(data.status===200){
          downloadUrl(data.data.url);
          // setTimeout(()=>{
          //   window.open(data.data.url);
          // },500)
        }
      }
    })
  }
  //对账单下载
  downloadSupplierStatement = (params) => {
    this.props.dispatch({
      type:'finance/downloadSupplierStatement',
      payload: params,
      callback:(data)=>{
        if(data.status===200){
          downloadUrl(data.data.url);
          // setTimeout(()=>{
          //   window.open(data.data.url);
          // },500)
        }
      }
    })
  }

  render() {
    const {supplierSettlementParams, supplierSettlementData, withdrawCashParams, withdrawCashInfo, moneyTotal} = this.state;
    const {supplierSettlement, global} = this.props.global.languageDetails
    const {loading} = this.props.finance;
    //同步变更列表属性
    const supplierSettlementColumns = [
      {
        title    : supplierSettlement.Operation,
        dataIndex: 'operation',
        className: 'tcenter',
        classType: 1,
        render   : (text, record) => {
          const operation = [
            {
              id:2,
              text: supplierSettlement.DownloadDetails
            },
            {
              id:3,
              text: supplierSettlement.Statement
            }
          ]
          record.status<1 ? operation.unshift({
              id:1,
              text: supplierSettlement.ApplyforWithdrawal
            }) : ''
          return (
            <div>
              <Dropdown overlay={(
                <Menu
                  onClick={(e) => {
                    const key = e.key;
                    //申请提现
                    if(key==1){
                      this.setState(Object.assign(withdrawCashInfo,record));
                      this.setWithdrawCashParams('id',record.id);
                      this.setWithdrawCashParams('moneyStatus',1);
                      this.setWithdrawCashParams('status',1);
                      this.setWithdrawCashVisible(true);
                    }else if(key==2){
                      this.downloadDetails(record.id);
                    } else if (key == 3) {
                      this.downloadSupplierStatement({
                        id: record.id,
                        settlementStart: record.settlementStart,
                        settlementEnd: record.settlementEnd
                      })
                    }
                  }}
                >
                  {
                    operation.map((items) => {
                      return <Menu.Item key={items.id}>{items.text}</Menu.Item>;
                    })
                  }
                </Menu>
              )}
              >
                <a className="ant-dropdown-link">
                  <Icon type="laptop" style={{fontSize: 16, paddingTop: 5}}/>
                </a>
              </Dropdown>
            </div>
          )
        }
      },
      {
        title    : supplierSettlement.SettlementPeriod,
        dataIndex: 'settlement',
        classType: 4,
        render   : (text, record) => {
          return (
            <div>{record.settlementStart}~{record.settlementEnd}</div>
          )
        }
      },
      {
        title    : supplierSettlement.CollectionTrusted,
        dataIndex: 'platformTotal',
        classType: 3,
      },
      {
        title    : supplierSettlement.AwaitingRefund,
        dataIndex: 'refundTotal',
        classType: 3,
      },
      {
        title    : supplierSettlement.ServiceCharge,
        dataIndex: 'platformServiceTotal',
        classType: 3,
      },
      {
        title    : supplierSettlement.WithdrawableNetAmount,
        dataIndex: 'profitsTotal',
        classType: 3,
      },
      {
        title    : supplierSettlement.Confirmation,
        dataIndex: 'moneyStatus',
        classType: 4,
        render   : (text) => {
          const presentStatusJson = parseArr(result);
          const color             = text === 2 ? '#de5567' : '';
          return (<span style={{color: color}}>{presentStatusJson[text]}</span>)
        }
      },
      {
        title    : supplierSettlement.WithdrawalStatus,
        dataIndex: 'status',
        classType: 2,
        render   : (text) => {
          const presentStatusJson = parseArr(presentStatus);
          const color             = text === 3 ? '#59bfc0' : '';
          return (<span style={ {color: color}}>{presentStatusJson[text]}</span>)
        }
      },
      {
        title    : supplierSettlement.ApplyforWithdrawalDate,
        dataIndex: 'applicationTime',
        classType: 8,
      },
      {
        title    : supplierSettlement.AuditDate,
        dataIndex: 'auditingTime',
        classType: 3,
      },
      {
        title    : supplierSettlement.RemitDate,
        dataIndex: 'successTime',
        classType: 3,
      },
      {
        title    : supplierSettlement.Balance,
        dataIndex: 'money',
        classType: 3,
      }
    ];
    //同步变更分页器
    const supplierSettlementPagination                                           = {
      pageSize        : supplierSettlementParams.pageSize,
      total           : this.state.totalPage,
      current         : supplierSettlementParams.pageNum,
      defaultPageSize : supplierSettlementParams.pageSize,
      showSizeChanger : true,
      pageSizeOptions : ['10', '20', '50', '100'],
      showTotal       : (total) => {
        return `${global.total} ${total} ${global.items}`;
      },
      onShowSizeChange: (page, pageSize) => {
        this.supplierSettlementParamsChange('pageNum', page);
        this.supplierSettlementParamsChange('pageSize', pageSize);
        this.supplierSettlement();
      },
      onChange        : (page) => {
        this.supplierSettlementParamsChange('pageNum', page);
        this.supplierSettlement();
      }
    }
    const presentStatus= [
      {
        id  : -1,
        text: supplierSettlement.All,
      },
      {
        id  : 0,
        text: supplierSettlement.Unapplied,
      },
      {
        id  : 1,
        text: supplierSettlement.Applied,
      },
      {
        id  : 2,
        text: supplierSettlement.Audited,
      },
      {
        id  : 3,
        text: supplierSettlement.Remitted,
      }
    ]
    const result= [
      {
        id  : -1,
        text: supplierSettlement.All,
      },
      {
        id  : 0,
        text: supplierSettlement.Unconfirmed,
      },
      {
        id  : 1,
        text: supplierSettlement.Yes,
      },
      {
        id  : 2,
        text: supplierSettlement.No,
      },
    ]
    const formItemLayout = {
      labelCol: 10 ,
      wrapperCol: 14,
    }
    return (
      <div className={styles.supplierSettlement}>
        <Card>
          <div style={{fontSize: 24, fontWeight: 'bold'}}>{supplierSettlement.TotalBalance}：{moneyTotal}</div>
          <p style={{fontSize: 12, color: '#ccc'}}>{supplierSettlement.WithdrawalSteps}</p>
          <div style={{minWidth: 868, marginTop: 20}}>
            <div>

              <Form layout="inline">
                <FormItem
                  label={supplierSettlement.WithdrawalStatus}
                >
                  <Select
                    // className={styles.presentStatusSelect}
                    className="select-size-small"
                    value={supplierSettlementParams.status}
                    onChange={
                      (key) => {
                        this.supplierSettlementParamsChange('status', parseInt(key));
                        this.supplierSettlementChange();
                      }
                    }>
                    {
                      presentStatus.map((item) => {
                        return (
                          <Option value={item.id} key={item.id} title={item.text}>{item.text}</Option>
                        )
                      })
                    }
                  </Select>
                </FormItem>
                <FormItem
                  label={supplierSettlement.Confirmation}
                >
                  <Select
                    // className={styles.presentStatusSelect}
                    className="select-size-small"
                    value={supplierSettlementParams.moneyStatus}
                    onChange={(key) => {
                      this.supplierSettlementParamsChange('moneyStatus', parseInt(key));
                      this.supplierSettlementChange();
                    }}>
                    {
                      result.map((item) => {
                        return (
                          <Option value={item.id} key={item.id}>{item.text}</Option>
                        )
                      })
                    }
                  </Select>
                </FormItem>
                <FormItem
                  label={supplierSettlement.SettlementPeriod}
                >
                  <RangePicker onChange={this.datePick}/>
                </FormItem>
              </Form>
            </div>
          </div>
          <Table
            style={{marginTop: 20}}
            rowKey='id'
            dataSource={supplierSettlementData.reports}
            needToGetWidth={true}
            columns={supplierSettlementColumns}
            pagination={supplierSettlementPagination}
            loading={loading}
          />
        </Card>
        <Modal
          title={supplierSettlement.ApplyforWithdrawal}
          onOk={this.updateSupplierTradeReport}
          onCancel={() => {
            this.setWithdrawCashVisible()
          }}
          visible={this.state.withdrawCashVisible}
          confirmLoading={this.state.confirmLoading}
          className={styles.withdrawCashModal}
          width={480}
          footer={(
            <div style={{textAlign:'center',paddingBottom:15}}>
              <Button type='primary'
                      style={{marginRight:15}}
                      onClick={this.updateSupplierTradeReport}
                      disabled={withdrawCashInfo.moneyF===0} >{supplierSettlement.Confirm}

              </Button>
              <Button onClick={() => {
                this.setWithdrawCashVisible()
              }}>{supplierSettlement.Cancel}</Button>
            </div>)}
        >
          <Row>
            <Col span={formItemLayout.labelCol} style={{textAlign: 'right'}}>{supplierSettlement.SettlementPeriod}：</Col>
            <Col span={formItemLayout.wrapperCol}>{withdrawCashInfo.settlementStart}~{withdrawCashInfo.settlementEnd}</Col>
          </Row>
          <Row className={styles.modalTop}>
            <Col span={formItemLayout.labelCol} style={{textAlign: 'right'}}>{supplierSettlement.CollectionTrusted}：</Col>
            <Col span={formItemLayout.wrapperCol}>{withdrawCashInfo.platformTotal}</Col>
          </Row>
          <Row className={styles.modalTop}>
            <Col span={formItemLayout.labelCol} style={{textAlign: 'right'}}>{supplierSettlement.AwaitingRefund}：</Col>
            <Col span={formItemLayout.wrapperCol}>{withdrawCashInfo.refundTotal}</Col>
          </Row>
          <Row className={styles.modalTop}>
            <Col span={formItemLayout.labelCol} style={{textAlign: 'right'}}>{supplierSettlement.WithdrawableNetAmount}：</Col>
            <Col span={formItemLayout.wrapperCol}>{withdrawCashInfo.profitsTotal}</Col>
          </Row>
          <Row className={styles.modalTop}>
            <Col span={formItemLayout.labelCol} style={{textAlign: 'right'}}>{supplierSettlement.AmountConfirm}：</Col>
            <Col span={formItemLayout.wrapperCol}>
              <RadioGroup
                onChange={(e) => {
                  const value = e.target.value;
                  this.setWithdrawCashParams('moneyStatus',e);
                  if( value === 2 ){
                    this.setWithdrawCashParams('status',0);
                  }else {
                    this.setWithdrawCashParams('status',1);
                  }
                }}
                value={withdrawCashParams.moneyStatus}>
                <Radio value={1}>{supplierSettlement.Yes}</Radio>
                <Radio value={2}>{supplierSettlement.No}</Radio>
              </RadioGroup>
            </Col>
          </Row>
          <Row className={styles.modalTop}>
            <Col span={formItemLayout.labelCol} style={{textAlign: 'right'}}>{supplierSettlement.WithdrawalApplication}：</Col>
            <Col span={formItemLayout.wrapperCol}>
              <RadioGroup
                onChange={this.setWithdrawCashParams.bind(this, 'status')}
                disabled={withdrawCashParams.moneyStatus === 2}
                value={withdrawCashParams.status}>
                <Radio value={1}>{supplierSettlement.ApplyNow}</Radio>
                <Radio value={0}>{supplierSettlement.NotApply}</Radio>
              </RadioGroup>
            </Col>
          </Row>
        </Modal>
      </div>
    )
  }
}
