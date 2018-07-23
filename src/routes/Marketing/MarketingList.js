import React, {Component} from 'react';
import {
  Button,
  Form,
  Input,
  Icon,
  Card,
  Select,
  Tooltip,
  Modal,
  DatePicker,
  Dropdown,
  Menu,
} from 'antd';

import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import styles from './MarketingList.less';
import Table from '../../components/table'

const FormItem = Form.Item;
const {Option} = Select;
const { Search } = Input;
const RangePicker = DatePicker.RangePicker;

@connect(state => ({
  marketing: state.marketing,
  global: state.global
}))
@Form.create()
export default class MarketingList extends Component {
  state = {
    type: 'marketing',
    // startValue: null,
    endOpen: false,
    visibleEditor: false,
    visibleEditorStatus: false,
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'marketing/clear',
      payload: null,
    });
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = (value) => {
    this.onChange('startValue', value);
  }

  onEndChange = (value) => {
    this.onChange('endValue', value);
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({endOpen: true});
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({endOpen: open});
  }
  searchData = () => {
    const {getFieldValue} = this.props.form;
    const {type} = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `marketing/${type}PushShowNum`,
      payload: {
        page_num: 1,
      },
    });
    this.props.dispatch({
      type: `marketing/${type}pushShowSize`,
      payload: {
        page_size: 20,
      },
    });
    this.props.dispatch({
      type: `marketing/${type}PushKeyword`,
      payload: getFieldValue('keyword').trim(),
      callback: () => {
        this.loadData();
      },
    });
  }
  // 成交时间
  changeDealTime = (value) => {
    const {getFieldValue} = this.props.form;

    console.log('value', value);
    // startTime: moment(values.startTime[0]).format('YYYY-MM-DD HH:mm:ss'),
    const {type} = this.state;
    this.props.dispatch({
      type: `marketing/${type}PushDealTime`,
      payload: {
        startTime: moment(value[0]).format('YYYY-MM-DD'),
        endTime: moment(value[1]).format('YYYY-MM-DD'),
      },
      callback: () => {
        this.loadData();
      },
    });
  }

  loadData() {
    const {type} = this.state;
    const {marketing} = this.props;
    console.log('this=>', this);
    this.props.dispatch({
      type: `marketing/${type}GetMarketings`,
      payload: marketing.pushData,
    });
  }

  // 有效期
  showModalEditor = (record) => {
    const {setFieldsValue} = this.props.form;
    setFieldsValue({
      end_date: moment(record.end_date),
    });
    const {type} = this.state;
    this.props.dispatch({
      type: `marketing/${type}OperationItem`,
      payload: record,
    });
    this.setState({
      visibleEditor: true,
    });
  }
  handleOkEditor = (e) => {
    const {type} = this.state;
    const {marketing} = this.props;
    const {getFieldValue} = this.props.form;
    this.props.form.validateFields(['begin_date', 'end_date'], (err) => {
      console.log('err', err);
      if (!err) {
        this.props.dispatch({
          type: `marketing/${type}PushUpdate`,
          payload: {
            id: marketing.operationItem.id,
            end_date: moment(getFieldValue('end_date')).format('YYYY-MM-DD'),
          },
          callback: () => {
            this.loadData();
          },
        });
        console.log(e);
        this.setState({
          visibleEditor: false,
        });
      }
    });
  }
  handleCancelEditor = (e) => {
    console.log(e);
    this.setState({
      visibleEditor: false,
    });
  }

  // 任务状态
  showModalEditorStatus = (record) => {
    const {setFieldsValue} = this.props.form;
    console.log(record.status)
    setFieldsValue({
      status: record.status.toString(),
    });
    const {type} = this.state;
    this.props.dispatch({
      type: `marketing/${type}OperationItem`,
      payload: record,
    });
    this.setState({
      visibleEditorStatus: true,
    });
  }
  handleOkEditorStatus = (e) => {
    const {type} = this.state;
    const {marketing} = this.props;
    const {getFieldValue} = this.props.form;
    this.props.form.validateFields(['status'], (err) => {
      console.log('err', err);
      if (!err) {
        this.props.dispatch({
          type: `marketing/${type}PushUpdate`,
          payload: {
            id: marketing.operationItem.id,
            status: getFieldValue('status'),
          },
          callback: () => {
            this.loadData();
          },
        });
        console.log(e);
        this.setState({
          visibleEditorStatus: false,
        });
      }
    });
  }
  handleCancelEditorStatus = (e) => {
    console.log(e);
    this.setState({
      visibleEditorStatus: false,
    });
  }

  // 日期
  // disabledStartDate = (startValue) => {
  //   const endValue = this.state.endValue;
  //   if (!startValue || !endValue) {
  //     return false;
  //   }
  //   return startValue.valueOf() > endValue.valueOf();
  // }

  disabledEndDate = (endValue) => {
    const {marketing} = this.props;
    // const startValue = this.state.startValue;
    const startValue = moment(marketing.operationItem.end_date).subtract(1, 'days');
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }
  // 点击操作按钮
  handleMenuClick = (record, e) => {
    if (e.key === '1') {
      // 修改
      this.showModalEditor(record);
    } else if (e.key === '2') {
      this.showModalEditorStatus(record);
    }
  }
  // table回掉函数，排序等操作。
  handleTableChange = (pagination, filters, sorter) => {
    console.log('pagination, filters, sorter', pagination, filters, sorter);
    // descend = 0 降序 ascend = 1 升序 => 组件
    // order_by 0默认排序,1 佣金比例 2 库存,3 页面访问量,4成交数,5成交金额,6佣金成本 排序类型
    // sort 0降序 1升序 => 排序状态

    // const items = {
    //   commission_radio: 1, // 佣金比例
    //   stocks: 2, // 库存
    //   pv: 3, // 页面访问量
    //   sales_count: 4, // 成交数
    //   sales_amount: 5, // 成交金额
    //   commission_cost: 6, // 佣金成本
    // };
    // 排序类型
    let orderBy = 0;
    if (sorter.field === 'commission_radio') {
      orderBy = 1;
    } else if (sorter.field === 'stocks') {
      orderBy = 2;
    } else if (sorter.field === 'pv') {
      orderBy = 3;
    } else if (sorter.field === 'sales_count') {
      orderBy = 4;
    } else if (sorter.field === 'sales_amount') {
      orderBy = 5;
    } else if (sorter.field === 'commission_cost') {
      orderBy = 6;
    } else {
      orderBy = 0;
    }
    // 排序状态
    let sortNum = 0;
    if (sorter && sorter.order === 'descend') {
      sortNum = 0;
    } else if (sorter && sorter.order === 'ascend') {
      sortNum = 1;
    }
    const {type} = this.state;
    const {marketing} = this.props;
    console.log('this=>', this);
    this.props.dispatch({
      type: `marketing/${type}GetMarketings`,
      payload: {
        ...marketing.pushData,
        sort: sortNum,
        order_by: orderBy,
        // sort: sortNum,
      },
    });
  }

  render() {
    const marketList = this.props.global.languageDetails.marketList;
    const global = this.props.global.languageDetails.global;
    const {getFieldDecorator} = this.props.form;
    const {type} = this.state;
    const {endOpen} = this.state;
    const {marketing} = this.props;
    const {marketing: {loading}} = this.props;
    const selectSearchDatas = [
      {value: 'SPU', key: '1'},
      {value: marketList.ProductName, key: '2'},
      {value: 'OfferID', key: '3'},
    ]; // 选择搜索数据
    const columns = [
      {
        title: marketList.Operation,
        dataIndex: 'action',
        className: 'tcenter',
        classType: 1,
        render: (text, record) => {
          let result = [];
          if (record.status === 0) {
            result = [];
          } else {
            result = [
              {title: marketList.ValidDate, key: 1},
              {title: marketList.AssignmentStatus, key: 2},
            ];
          }

          return (
            <div>
              {
                result.length > 0
                  ?
                  <Dropdown overlay={(
                    <Menu
                      onClick={this.handleMenuClick.bind(this, record)}
                    >
                      {
                        result.map((items) => {
                          return <Menu.Item key={items.key}>{items.title}</Menu.Item>;
                        })
                      }
                    </Menu>
                  )}
                  >
                    <a className="ant-dropdown-link">
                      <Icon type="laptop" style={{fontSize: 16, paddingTop: 5}}/>
                    </a>
                  </Dropdown>
                  :
                  <span>-</span>
              }
            </div>
          );
        },
      },
      {
        title: 'SPU',
        dataIndex: 'spu_id',
        classType: 2,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: 'OFFER',
        dataIndex: 'id',
        classType: 2,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title:marketList.ProductInformation,
        dataIndex: '',
        classType: 2,
        render: (text, record) => {
          return (
            <div className={`${styles.shuxing} ${styles.goodsTd4}`}>
              <div className={`tableImage`}>
                <Tooltip
                  placement="top"
                  title={
                    <div>
                      <p>{record.spu_name}</p>
                      <p>{record.spu_type}</p>
                    </div>
                  }
                >
                  <img alt="" src={record.icon}/>
                </Tooltip>
              </div>
            </div>
          );
        },
      },
      {
        title:marketList.AssignmentStatus,
        dataIndex: 'status',
        classType: 2,
        render: (text) => {
          let result = null;
          switch (text) {
            case 0:
              result =marketList.Close;
              break;
            case 1:
              result =marketList.Open;
              break;
            default:
              result = '';
              break;
          }
          return (
            <div>
              {result}
            </div>
          );
        },
      },
      {
        title:marketList.CodeName,
        dataIndex: 'isCodeSeller',
        classType: 4,
        render: (text) => {
          return (
            <Tooltip placement="top" title={text}>
              <div className="ellipsis">
                {text || '-'}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: marketList.PublishTime,
        dataIndex: 'createTime',
        classType: 3,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: marketList.ValidDate,
        dataIndex: 'brand',
        classType: 3,
        render: (text, record) => {
          return (
            <div>
              <p>
                {record.begin_date}
              </p>
              <p>
                {record.end_date}
              </p>
            </div>
          );
        },
      },
      {
        title: marketList.CommissionPercentage,
        dataIndex: 'commission_radio',
        sorter: true,
        classType: 3,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: marketList.Country,
        dataIndex: 'extend_countries',
        classType: 3,
        render: (text, record) => {
          const result = record.extend_countries && record.extend_countries.length > 0 ? record.extend_countries.join(',') : '-';
          return (
            <Tooltip placement="top" title={result}>
              <div className="ellipsis">
                {result}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: marketList.Stock,
        dataIndex: 'stocks',
        classType: 2,
        sorter: true,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: marketList.PV,
        dataIndex: 'pv',
        sorter: true,
        classType: 3,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: marketList.TransactionQuantity,
        dataIndex: 'sales_count',
        sorter: true,
        classType: 2,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: marketList.TransactionAmount,
        dataIndex: 'sales_amount',
        sorter: true,
        classType: 3,
      },
      {
        title: marketList.CommissionCost,
        classType: 3,
        sorter: true,
        className: styles.commissionCost,
      },
    ];
    const pagination = {
      total: marketing.data && marketing.data.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      defaultPageSize: marketing.pushData && marketing.pushData.page_size,
      showTotal: (total) => {
        return `${global.total} ${total} ${global.items}`;
      },
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `marketing/${type}PushShowSize`,
          payload: {
            page_num: current,
            page_size: size,
          },
        });
        this.loadData();
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `marketing/${type}PushShowNum`,
          payload: {
            page_num: current,
          },
        });
        this.loadData();
      },
    };
    const formItemLayout = {
      layout:'vertical'
    };
    return (
      <div className={styles.MarketingList}>
        <Card>
          <Form
            layout="inline"
            onSubmit={this.handleSubmit}
            className="margin-bottom-24"
          >
            <div>
              <FormItem
                className="belong"
              >
                {getFieldDecorator('filter', {
                  rules: [{required: false}],
                  initialValue: selectSearchDatas[0].key,
                  onChange: (value) => {
                    this.props.dispatch({
                      type: `marketing/${type}PushFilter`,
                      payload: value,
                    });
                  },
                })(
                  <Select
                    className="select-size-small"
                  >
                    {
                      selectSearchDatas.map((items) => {
                        return <Option value={items.key} key={items.key}>{items.value}</Option>;
                      })
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('keyword', {
                  rules: [{required: false, message: marketList.Search}],
                })(
                  <Search
                    placeholder={marketList.Search}
                    onSearch={this.searchData}
                    className="select-Input"
                    enterButton
                  />)}
              </FormItem>
              <FormItem
                label={marketList.TurnoverTime}
              >
                {getFieldDecorator('dealTime', {
                  rules: [{required: false, message: `${global.PleaseEnter}${marketList.TurnoverTime}`}],
                  onChange: (value) => {
                    this.changeDealTime(value);
                  },
                })(
                  <RangePicker />
                )}
              </FormItem>
              <FormItem>
                <Link to="/marketing/marketingCreate">
                  <Button type="primary">
                    {marketList.Add}
                  </Button>
                </Link>
              </FormItem>
            </div>
          </Form>
          <div className={styles.tableTop}>
            <Table
              loading={loading}
              rowKey="id"
              columns={columns}
              pagination={pagination}
              onChange={this.handleTableChange}
              needToGetWidth={true}
              dataSource={marketing.data && marketing.data.marketings}
            />
          </div>
        </Card>
        <Modal
          title={marketList.EditValidDate}
          visible={this.state.visibleEditor}
          onOk={this.handleOkEditor}
          onCancel={this.handleCancelEditor}
          okText={marketList.Update}
          width={280}
          maskClosable={false}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              label={marketList.StartingTime}
            >
              {getFieldDecorator('begin_date', {
                rules: [{type: 'object', required: true, message: `${global.Pleasechoose}${marketList.StartingTime}`}],
                initialValue: moment(marketing.operationItem.begin_date),
              })(
                <DatePicker
                  // disabledDate={this.disabledStartDate}
                  disabled
                  format="YYYY-MM-DD"
                  placeholder="Start"
                  style={{width:255}}
                  onChange={this.onStartChange}
                  onOpenChange={this.handleStartOpenChange}
                />
              )}
            </FormItem>
            <FormItem
              label={marketList.EndingTime}
            >
              {getFieldDecorator('end_date', {
                rules: [{type: 'object', required: true, message:  `${global.Pleasechoose}${marketList.EndingTime}`}],
                initialValue: moment(marketing.operationItem.end_date),
              })(
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD"
                  placeholder="End"
                  style={{width:255}}
                  onChange={this.onEndChange}
                  open={endOpen}
                  onOpenChange={this.handleEndOpenChange}
                />
              )}
            </FormItem>
          </Form>
        </Modal>

        <Modal
          title={marketList.EditAssignmentStatus}
          visible={this.state.visibleEditorStatus}
          onOk={this.handleOkEditorStatus}
          onCancel={this.handleCancelEditorStatus}
          okText={marketList.Update}
          maskClosable={false}
          width={280}
        >
          <Form>
            <FormItem
              label={marketList.AssignmentStatus}
              {...formItemLayout}
            >
              {getFieldDecorator('status', {
                rules: [{type: 'string', required: true, message: `${global.Pleasechoose}${marketList.AssignmentStatus}`}],
                initialValue: marketing.operationItem.status,
              })(
                <Select >
                  <Option value="0">{marketList.Close}</Option>
                  <Option value="1">{marketList.Open}</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
