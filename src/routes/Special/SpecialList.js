/**
 * Created by dell on 2018/2/6.
 */
import React, { Component } from 'react';
import styles from './SpecialList.less';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { getQueryString } from '../../utils/utils';

import {
  Select,
  Input,
  Button,
  Card,
  Modal,
  Icon,
  message,
  Switch,
  Tooltip,
  Form,
  Breadcrumb
} from 'antd';
import Table from '../../components/table';
const { Option } = Select;
const { Search } = Input;
const FormItem = Form.Item;
//const query = getQueryString();
//const queryId = parseInt(query.id);

@connect(state => ({
 special: state.special,
  global: state.global,
}))
export default class SpecialList extends Component {
  state = {
    lists : [],
    pushData: {
      keyword: '',
      filter: 1,
      type:4,
      pageNum:1,
      pageSize:100,
      style: parseInt(getQueryString().id),
      sort:1,
    },
    query: getQueryString(),
    specialName: '',//专题名称
  }

  componentWillMount() {
    this.init();
  }

  init = () => {
    this.getSpuView();
  }

  //获取列表
  getSpuView = () => {
    const { pushData } = this.state;
    this.props.dispatch({
      type:'special/getSpuView',
      payload: pushData,
      callback: (data) => {
        if(data.status===200){
          this.setState({
            lists: data.data.views,
            specialName: data.data.name
          })
        }
      }
    })
  }
  //搜索条件选择
  handleFilterSelected = (id) => {
    const { pushData } = this.state;
    this.setState({
      pushData: Object.assign(pushData,{
        filter: id,
      })
    })
  }
  //搜索
  handleFilterSearch = (value) => {
    const { pushData } = this.state;
    this.setState({
      pushData: Object.assign(pushData,{
        keyword: value.trim()
      })
    })
    this.getSpuView();
  }
  //去专题创建页面
  toSpecialCreate = () => {
    const languageForMarketing = this.props.global.languageDetails.marketing.specialLists;//营销多语言
    const { query } = this.state;
    this.props.dispatch(routerRedux.push('/marketing/specialCreate?type=add&id='+ query.id));
  }
  //返回上一页
  goBack = () => {
    this.props.dispatch(routerRedux.go(-1));
  }
  //更新页面状态
  updateViewStatus = (viewId,index,status) => {
    const { lists } = this.state;
    status = status ? 1 : 0;
    this.props.dispatch({
      type:'special/updateViewStatus',
      payload: {
        viewId: viewId,
        status: status,
      },
      callback: (data) => {
        if(data.status===200){
          lists[index].status = status;
          this.setState({
            lists: lists,
          })
        }
      }
    })
  }
  //删除弹窗提醒
  modalDelete = (id,index) => {
    const languageForMarketing = this.props.global.languageDetails.marketing.specialLists;//营销多语言
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForMessage = this.props.global.languageDetails.message;
    Modal.confirm({
      title: languageForMarketing.continueToDelete,
      okText: languageForGlobal.Confirm,
      onOk: this.delSpuView.bind(this,id,index),
      cancelText: languageForGlobal.cancel,
    });
  }
  //删除页面
  delSpuView = (id,index) => {
    const { lists } = this.state;
    this.props.dispatch({
      type:'special/delSpuView',
      payload:{
        viewId: id,
      },
      callback: (data) => {
        lists.splice(index,1);
        if(data.status===200){
          this.setState({
            lists: lists,
          })
        }
      }
    });
  }

  render(){
    const { loading } = this.props.special;
    const { query, specialName } = this.state;
    const languageForMarketing = this.props.global.languageDetails.marketing.specialLists;//营销多语言
    const languageForMessage = this.props.global.languageDetails.message;
    const selectType = [
      {
        id: 1,
        text: languageForMarketing.PageID,
      },
      {
        id: 2,
        text: languageForMarketing.PageName,
      },
    ];
    let columns   = [
      {
        title    : languageForMarketing.PageID,
        dataIndex: 'id',
        classType: 1,
      },
      {
        title    : languageForMarketing.PageName,
        dataIndex: 'title',
        classType: 3,
        render: (text) => {
         return(
         <Tooltip placement="top" title={text}>
           <div className="ellipsis">{text}</div>
         </Tooltip>
         )
          // return(
          //   <div className="ellipsis">{text}</div>
          // )
        }
      },
      {
        title    : languageForMarketing.PageURL,
        dataIndex: 'url',
        classType: 7,
        render   : (text) => {
          return (
            <div>
              {text}
              <CopyToClipboard
                text={text}
                onCopy={() => {
                  message.success(languageForMessage.CopiedSuccessfully, 1);
                }}>
                <a className={styles.copy} href="javascript:;">{languageForMarketing.Copy}</a>
              </CopyToClipboard>
            </div>
          )
        }
      },
      {
        title    : languageForMarketing.Status,
        dataIndex: 'status',
        classType: 1,
        render : (text,record,index) => {
          const check = text ? true : false;
          return(
            <div>
              <Switch
                checkedChildren={languageForMarketing.Open}
                unCheckedChildren={languageForMarketing.Close}
                onChange={this.updateViewStatus.bind(this,record.id,index)}
                checked={check}
              />
            </div>
          )
        }
      },
      {
        title    : languageForMarketing.GeneratedTime,
        dataIndex: 'createTime',
        classType: 3,
      },
      {
        title    : languageForMarketing.UpdatedTime,
        dataIndex: 'updateTime',
        classType: 3,
      },
      {
        title    : languageForMarketing.Operation,
        dataIndex: 'operation',
        classType: 2,
        render   : (text, record, index) => {
          return(
            <div>
              <Link to={{ pathname: '/marketing/specialCreate', search: `?id=${query.id}&viewId=${record.id}&type=edit`,}}>{languageForMarketing.Edit}</Link>
              <a onClick={this.modalDelete.bind(this,record.id, index)} className={styles.del}>{languageForMarketing.Delete}</a>
            </div>
          )
        }
      },
    ];
    return(
      <div className={styles.specialList}>
        <Card className="breadcrumb-box">
          <Breadcrumb>
            <Breadcrumb.Item>
              <a onClick={this.goBack}>
                {/*<Icon className={styles.directIcon} type="left" />*/}
                {languageForMarketing.PromoPage}
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{specialName}</Breadcrumb.Item>
          </Breadcrumb>
        </Card>
        {/*<Card className={styles.direct}>*/}
          {/*<Icon onClick={this.goBack} className={styles.directIcon} type="left"></Icon>{languageForMarketing.PromoPage} / {query.name}*/}
        {/*</Card>*/}
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
                    return (<Option value={item.id} key={item.id}>{item.text}</Option>);
                  })
                }
              </Select>
            </FormItem>
            <FormItem>
              <Search
                placeholder={languageForMarketing.Search}
                onSearch={value => this.handleFilterSearch(value)}
                className="select-Input"
                enterButton
              />
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                style={{ marginLeft: '10px' }}
                onClick={this.toSpecialCreate.bind(this)}
              >
                {languageForMarketing.AddaNewFeaturedPage}
              </Button>
            </FormItem>
          </Form>
          <Table
            className={styles.table}
            rowKey="id"
            pagination={false}
            needToGetWidth={true}
            columns={columns}
            loading={loading}
            dataSource={this.state.lists}
          />
        </Card>
      </div>
    )
  }
}
