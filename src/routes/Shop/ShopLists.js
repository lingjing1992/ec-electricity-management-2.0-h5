import React, { Component } from 'react';
import styles from './ShopLists.less';
import { routerRedux, Link } from 'dva/router';
import { connect } from 'dva';
import {
  Select,
  Input,
  Button,
  Card,
  Modal,
  Form
  // Modal
} from 'antd';

import Table from '../../components/table';
const { Option } = Select;
const { Search } = Input;
const FormItem = Form.Item;
@connect(state => ({
  shop: state.shop,
  global: state.global
}))
export default class ShopLists extends Component {
  state = {
    pushData:{
      keyword:'',
      filter:1,
      type: 3,
      pageNum: 1,
      pageSize: 100,
      sort:1,
    },
    data:[],
  }

  componentWillMount() {
    this.init();
  }

  init = () => {
    this.loadData();
  }
  //加载列表数据
  loadData = () => {
    this.props.dispatch({
      type:'shop/getSpuView',
      payload:this.state.pushData,
      callback: (data) => {
        this.setState({
          data: data.data.views,
        })
      }
    });
  }

  //删除页面
  delSpuView = (id) => {
    this.props.dispatch({
      type:'shop/delSpuView',
      payload:{
        viewId: id,
      },
      callback: (data) => {
        if(data.status===200){
          this.loadData();
        }
      }
    });
  }

  handleFilterSelected = (id) => {
    const { pushData } = this.state;
    this.setState({
      pushData: Object.assign(pushData,{
        filter: id,
      })
    })
  }

  handleFilterSearch = (value) => {
    const { pushData } = this.state;
    this.setState({
      pushData: Object.assign(pushData,{
        keyword: value.trim()
      })
    })
    this.loadData();
  }

  //去列表详情
  toShopDetails = () => {
    this.props.dispatch(routerRedux.push('/shop/shopDetails?type=add'));
  }

  modalDelete = (id) => {
    const pageList = this.props.global.languageDetails.pageList;
    Modal.confirm({
      title: pageList.continue,
//      content: 'Bla bla ...',
      okText:pageList.Confirm,
      onOk: this.delSpuView.bind(this,id),
      cancelText:pageList.Cancel,
    });
  }



  render() {
    const { loading } = this.props;
    const pageList = this.props.global.languageDetails.pageList;
    const selectType = [
      {
        id: 1,
        text: pageList.PageID,
      },
      {
        id: 2,
        text: pageList.PageName,
      },
    ];
    let columns   = [
      {
        title    : pageList.PageID,
        dataIndex: 'id',
      },
      {
        title    : pageList.PageName,
        dataIndex: 'title',
      },
      {
        title    : pageList.GeneratedTime,
        dataIndex: 'createTime',
      },
      {
        title    : pageList.UpdatedTime,
        dataIndex: 'updateTime',
      },
      {
        title    : pageList.Operation,
        dataIndex: 'operation',
        render   : (text, record) => {
          return(
            <div>
              <Link to={{ pathname: '/shop/shopDetails', search: `?id=${record.id}&type=edit`,}}>{pageList.Edit}</Link>
              <a onClick={this.modalDelete.bind(this,record.id)} className={styles.del}>{pageList.Delete}</a>
            </div>
          )
        }
      },
    ];
    return (
      <div className={styles.shopLists}>
        <Card>
          <Form layout="inline" className="margin-bottom-24">
            <FormItem
              className="belong"
            >
              <Select
                onSelect={this.handleFilterSelected.bind(this)}
                defaultValue={selectType[0].text}
                className="select-size-small"
                >
                {
                  selectType.map((item) => {
                    return (<Option value={item.id} key={item.id} title={item.text}>{item.text}</Option>);
                  })
                }
              </Select>
            </FormItem>
            <FormItem>
              <Search
                placeholder={pageList.Search}
                onSearch={value => this.handleFilterSearch(value)}
                className="select-Input"
                enterButton
              />
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                onClick={this.toShopDetails.bind(this)}
              >
                {pageList.AddaNewList}
              </Button>
            </FormItem>
          </Form>
          <Table
            className={styles.table}
            rowKey="id"
            pagination={false}
            columns={columns}
            loading={loading}
            dataSource={this.state.data}
          />
        </Card>
      </div>
    );
  }
}
