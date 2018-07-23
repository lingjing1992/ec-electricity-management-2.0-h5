import React, { Component } from 'react';
import { Breadcrumb, Card, Tabs, Popconfirm, Button, Tooltip } from 'antd';
import { routerRedux } from 'dva/router';
import { message } from 'antd/lib/index';
import { connect } from 'dva/index';
import styles from './DistributionMarket.less';
import { getQueryString } from '../../utils/utils';
import Table from '../../components/table';
const { TabPane } = Tabs;

@connect(state => ({
  global: state.global,
  distribution: state.distribution,
}))
export default class CommodityChange extends Component {
  state = {
    //商品变更参数
    supplierChangesParams:{
      currentPage: 1,
      pageSize: 20,
      orderBy: 0,
      filter: 1,
      keyword: '',
      tabId: 1
    },
    //商品变更数据
    supplierChangesData:{
      spuUpdateInfos:[],
      pageBean: {

      }
    },
    tabActiveKey: '1',
  }
  componentWillMount(){
    this.supplierChanges();
  }
  //返回上一页
  goBack =() => {
    this.props.dispatch(routerRedux.go(-1));
  }

  //获取商品更改信息
  supplierChanges = () => {
    this.props.dispatch({
      type:'distribution/supplierChanges',
      payload:this.state.supplierChangesParams,
      callback: (data) => {
        if(data.status===200){
          this.setState(Object.assign(this.state.supplierChangesData,data.data))
        }
      }
    })
  }
  //商品更改信息列表排序
  supplierChangesSort = (pagination, filters, sorter) => {
    const { supplierChangesParams } = this.state;
    let orderBy = 0;
    if (sorter.field === 'updateTime'){
      if(sorter.order === 'ascend'){
        orderBy = 1;
      }else {
        orderBy = 0;
      }
      this.setState({
        supplierChangesParams: Object.assign(supplierChangesParams,{
          orderBy: orderBy
        })
      })
      this.supplierChanges();
    }
  }

  //同步确认
  synchronousConfirm =(record, btn) => {
    const languageForMessage = this.props.global.languageDetails.message;
    this.props.dispatch({
      type: 'distribution/syncSupplierChange',
      payload: {
        id: record.id,
        spuId: record.spuId,
      },
      callback: (data) => {
        if(data.status===200){
          if(btn === 'sync') {
            message.success(languageForMessage.SyncSucc);
          }
          this.supplierChanges();
        }

      }
    })
  }
  render(){
    const languageForDistribution = this.props.global.languageDetails.goods.distribution;
    const { supplierChangesParams, supplierChangesData } = this.state;
    const languageForGlobal = this.props.global.languageDetails.global;
    //同步变更列表属性
    const supplierChangesColumns = [
      {
        title: languageForDistribution.Operation,
        dataIndex: 'operation',
        classType: 1,
        render: (text,record)=>{
          // console.log(record.sync)
          return supplierChangesParams.tabId == 1 ? (
            <Button type='primary' onClick={this.synchronousConfirm.bind(this,record, 'ok')}>
              {
                languageForDistribution.Okay
              }
            </Button>
          ) : (
            <Popconfirm placement="topLeft" title={languageForDistribution.ConfirmSync} onConfirm={this.synchronousConfirm.bind(this,record, 'sync')} okText={languageForDistribution.Confirm} cancelText={languageForDistribution.Cancel}>
              <Button type='primary'>
                {
                  languageForDistribution.SyncOperation
                }
              </Button>
            </Popconfirm>
          )
        }
      },
      {
        title: 'ID',
        dataIndex: 'spuId',
        classType: 2,
        render: (text, record) => {
          if (supplierChangesParams.tabId == 1) {
            return (<a target="_blank" href={`/goods/goods-create?spu_id=${record.spuId}&action=edit`}>{text}</a>)
          } else if (supplierChangesParams.tabId == 2) {
            return text
          }
        }
      },
      {
        title: languageForDistribution.Image,
        dataIndex: 'iconUrl',
        classType: 1,
        render: (text,record) => {
          return (
            <div className="tableImage">
              <img style={{width:'100%'}} src={text}/>
            </div>
          )
        }
      },
      {
        title: languageForDistribution.Name,
        dataIndex: 'name',
        classType: 5,
        className: styles.suplieProductName,
        render: (text)=>{
          return (
            <Tooltip placement="top" title={text}>
              <div style={{width:'100%'}} className="ellipsis">
                {text}
              </div>
            </Tooltip>
          )
        }
      },
      {
        title: languageForDistribution.ChangedContent,
        dataIndex: 'content',
        classType: 5,
      },
      {
        title: languageForDistribution.ChangedTime,
        dataIndex: 'updateTime',
        sorter: true,
        classType: 3,
      }
    ];
    //同步变更分页器
    const supplierChangesPagination = {
      pageSize: supplierChangesParams.pageSize,
      total: supplierChangesData.pageBean.totalNum,
      current: supplierChangesParams.currentPage,
      defaultPageSize: supplierChangesParams.pageSize,
      showSizeChanger: true,
      pageSizeOptions: ['10','20','50','100'],
      showTotal: (total) => {
        return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
      },
      onShowSizeChange: (page,pageSize) => {
        this.setState({
          supplierChangesParams: Object.assign(supplierChangesParams,{
            currentPage: page,
            pageSize: pageSize,
          })
        })
        this.supplierChanges();
      },
      onChange: (page) => {
        this.setState({
          supplierChangesParams: Object.assign(supplierChangesParams,{
            currentPage: page,
          })
        })
        this.supplierChanges();
      }
    }
    return (
      <div>
        <Card className="breadcrumb-box">
          <Breadcrumb>
            <Breadcrumb.Item>
              <a onClick={this.goBack}>
                分销市场
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>分销商品变更</Breadcrumb.Item>
          </Breadcrumb>
        </Card>
        <Card>
          <Tabs type="card" defaultActiveKey={supplierChangesParams.tabId.toString()} style={{marginTop: '24px'}} onChange={(key)=>{
            this.setState(Object.assign(supplierChangesParams,{
              currentPage: 1,
              pageSize: 20,
              orderBy: 0,
              filter: 1,
              keyword: '',
              tabId: key
            }))
            this.supplierChanges();
          }}>
            <TabPane tab={languageForDistribution.StatusChanged} key={1}>
              <Table
                style={{marginTop: 20}}
                rowKey='id'
                dataSource={supplierChangesData.spuUpdateInfos}
                columns={supplierChangesColumns}
                pagination={supplierChangesPagination}
                onChange={this.supplierChangesSort}
              />
            </TabPane>
            <TabPane tab={languageForDistribution.InfoChanged} key={2}>
              <Table
                style={{marginTop: 20}}
                rowKey='id'
                dataSource={supplierChangesData.spuUpdateInfos}
                columns={supplierChangesColumns}
                pagination={supplierChangesPagination}
                onChange={this.supplierChangesSort}
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    )
  }
}
