import {Component} from "react";
import { Button, Dropdown, Menu, Icon, Card } from 'antd';
import { connect } from 'dva';
import { setStateObjectKey } from '../../utils/utils';
import styles from './index.less';
import Table from '../../components/table';
import ReturnAddress from './ReturnAddressPop'

@connect(state => ({
  global: state.global,
}))
export default class returnAddress extends Component {
  state = {
    returnAddressVisible: false,//弹窗显示
    tableResource: [],//退货地址列表
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
  }
  componentWillMount(){
    this.hadnleSucceed();//获取退货地址
  }
  //退货地址编辑弹窗显示关闭
  showModal  = (boolean) => {
    this.setState({
      returnAddressVisible: boolean
    })
  }
  //成功提交
  hadnleSucceed = () => {
    this.getBackAddr();
  }
  //获取退货地址
  getBackAddr = () => {
    this.props.dispatch({
      type: 'shop/getBackAddr',
      callback: (data) => {
        if(data.status===200){
          this.setState({
            tableResource: data.data.backAddr
          })
        }
      }
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
  render(){
    const languageForRturnAddr = this.props.global.languageDetails.returnAddress;
    //退货地址表格的列
    const operation = [
      {
        title: languageForRturnAddr.Edit,
        key:1,
      }
    ]
    const columns = [
      {
        title: languageForRturnAddr.Operation,
        dataIndex: 'operation',
        render: (text,record) => {
          return (
            <Dropdown
              overlay={(
                <Menu onClick={this.handleMenuClick.bind(this, record)}>
                  {
                    operation.map((items) => {
                      return <Menu.Item key={items.key}>{items.title}</Menu.Item>;
                    })
                  }
                </Menu>
              )}
              placement="bottomLeft"
            >
              <a className="ant-dropdown-link">
                <Icon type="laptop" style={{ fontSize: 16, paddingTop: 5 }} />
              </a>
            </Dropdown>
          )
        }
      },
      {
        title: languageForRturnAddr.ReturnAddressName,
        dataIndex: 'name',
      },
      {
        title: languageForRturnAddr.Address,
        dataIndex: 'addr',
        render: (text,record) => {
          return (
            <span>{`${record.addressLine1} `}{`${record.addressLine2 ? record.addressLine2+' ' : ''}`}{`${record.city} `}{`${record.region} `}{`${record.zip} `}{`${record.country}`}</span>
          )
        }
      },
    ];
    return (
      <div className={styles.returnAddress}>
        <Card>
          <Button type='primary' onClick={()=>{
            // //新建初始化id为零
            // this.handleSetValue({
            //   id:0,
            //   deftType: true,
            //   city:undefined,
            //   region:undefined,
            //   zip:undefined,
            //   country:'China',
            //   name:undefined,
            //   addressLine1:undefined,
            //   addressLine2:undefined,
            // })
            this.showModal(true)
          }}>
            {languageForRturnAddr.AddReturnAddress}
          </Button>
          <Table
            style={{marginTop: 24}}
            columns={columns}
            dataSource={this.state.tableResource}
            rowKey='id'
          />
        </Card>
        <ReturnAddress
          visible={this.state.returnAddressVisible}
          onShowModal={this.showModal}
          onSucceed={this.hadnleSucceed}
          onSetValue={this.handleSetValue}
          defaultValue={this.state.defaultValue}
        />
      </div>
    )
  }
}
