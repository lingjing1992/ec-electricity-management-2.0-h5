import React, { Component } from 'react';


import { connect } from 'dva';
import moment from 'moment';
import { Redirect, Switch } from 'dva/router';
import DataFlowAnalysisTabs from './DataFlowAnalysisTabs';
import styles from './DataFlowAnalysis.less';
import {
  Form,
  Input,
  Select,
  Tooltip,
  DatePicker,
  Card
} from 'antd';
import Table from '../../components/table';
const FormItem = Form.Item;
const { Option } = Select;
const { Search } = Input;
const RangePicker = DatePicker.RangePicker;


@connect(state => ({
  dataFlowAnalysis: state.dataFlowAnalysis,
  global:state.global
}))
@Form.create()
export default class DataGoodsSales extends Component {
  state = {
    type: 'dataFlowAnalysis',
  }
  componentDidMount() {
    this.loadData();

    const { type } = this.state;
    // 获取来源
    this.props.dispatch({
      type: `dataFlowAnalysis/${type}GetUtmSource`,
      payload: null,
    });
  }
  componentWillUnmount() {
    this.props.dispatch({
      type: 'dataFlowAnalysis/clear',
      payload: null,
    });
  }
  loadData() {
    const { type } = this.state;
    const { dataFlowAnalysis } = this.props;
    // console.log('this=>', this);

    this.props.dispatch({
      type: `dataFlowAnalysis/${type}GetDataFlowAnalysis`,
      // payload: dataFlowAnalysis.pushData,
      payload: Object.assign(
        dataFlowAnalysis.pushData, {
          demension: 3,
        }),
    });
  }
  // 时间
  changeDealTime = (value) => {
    const { getFieldValue } = this.props.form;
    console.log('value', value);
    // startTime: moment(values.startTime[0]).format('YYYY-MM-DD HH:mm:ss'),
    const { type } = this.state;
    if (value.length > 0) {
      this.props.dispatch({
        type: `dataFlowAnalysis/${type}PushDealTime`,
        payload: {
          startTime: moment(value[0]).format('YYYY-MM-DD'),
          endTime: moment(value[1]).format('YYYY-MM-DD'),
        },
        callback: () => {
          this.loadData();
        },
      });
    } else {
      this.props.dispatch({
        type: `dataFlowAnalysis/${type}PushDealTime`,
        payload: {
          startTime: '',
          endTime: '',
        },
        callback: () => {
          this.loadData();
        },
      });
    }
  }

  // 搜索的时候
  searchData = () => {
    const { getFieldValue } = this.props.form;
    const { type } = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `dataFlowAnalysis/${type}PushShowNum`,
      payload: {
        pageNum: 1,
      },
    });
    this.props.dispatch({
      type: `dataFlowAnalysis/${type}pushShowSize`,
      payload: {
        pageSize: 20,
      },
    });
    this.props.dispatch({
      type: `dataFlowAnalysis/${type}PushKeyword`,
      payload: getFieldValue('keyword') ? getFieldValue('keyword').trim() : '',
      callback: () => {
        this.loadData();
      },
    });
  }

  // 来源
  changeUtmSource = (value) => {
    const { type } = this.state;
    this.props.dispatch({
      type: `dataFlowAnalysis/${type}PushUtmSource`,
      payload: value || 0,
      callback: () => {
        this.loadData();
      },
    });
  }

  // table回掉函数，排序等操作。
  handleTableChange = (pagination, filters, sorter) => {
    console.log('pagination, filters, sorter', pagination, filters, sorter);
    // descend = 0 降序 ascend = 1 升序 => 组件
    // order_by 1-详情页PV 2-下单数 3-成交数 4-销售商品数 5-支付金额 6-下单率 7-销售率 8-成交率 9-客单价 10-日期
    // sort 排序方式：默认0,0 降序,1升序
    // 排序类型
    let orderBy = 0;
    if (sorter.field === 'pv') {
      orderBy = 1;
    } else if (sorter.field === 'orderCount') {
      orderBy = 2;
    } else if (sorter.field === 'orderPayCount') {
      orderBy = 3;
    } else if (sorter.field === 'salesCount') {
      orderBy = 4;
    } else if (sorter.field === 'salesAmount') {
      orderBy = 5;
    } else if (sorter.field === 'orderRate') {
      orderBy = 6;
    } else if (sorter.field === 'salesRate') {
      orderBy = 7;
    } else if (sorter.field === 'conversionRate') {
      orderBy = 8;
    } else if (sorter.field === 'perCustomerTransaction') {
      orderBy = 9;
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
    const { type } = this.state;
    const { dataFlowAnalysis } = this.props;
    console.log('this=>', this);
    this.props.dispatch({
      type: `dataFlowAnalysis/${type}GetDataFlowAnalysis`,
      payload: Object.assign(
        dataFlowAnalysis.pushData, {
          demension: 3,
          sort: sortNum,
          orderBy,
        }),
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { type } = this.state;
    const { dataFlowAnalysis } = this.props;
    const { dataFlowAnalysis: { loading } } = this.props;
    const selectAllowClear = true; // 支持清除选中的select
    const languageForData = this.props.global.languageDetails.data.flowAnalysis;//流量分析多语言
    const languageForGlobal = this.props.global.languageDetails.global;
    const selectSearchDatas = [
      { value: languageForData.AdsCampaign, key: '1' },
      // { value: '关键字', key: '2' },
    ]; // 选择搜索数据
    const columns = [
      {
        title: languageForData.AdsCampaign,
        dataIndex: 'utmCampaign',
        classType:3,
        render: (text, record, index) => {
          let obj = null;
          if (index === 0) {
            obj = {
              children: (
                <span style={{ fontWeight: 700 }}>{languageForData.Summary}</span>
              ),
              props: {},
            };
          } else {
            obj = {
              children: (
                <Tooltip
                  placement="top"
                  title={text}
                >
                  <div className={`${styles.shuxing} ${styles.utmCampaign}`} >
                    {text}
                  </div>
                </Tooltip>
              ),
              props: {},
            };
          }
          if (index === 0) {
            obj.props.colSpan = 2;
          }
          return obj;
          // return (
          //   <Tooltip placement="top" title={text}>
          //     {
          //       index === 0
          //         ?
          //           <span style={{ fontWeight: 700 }}>
          //             {text}
          //           </span>
          //         :
          //           <div className={`${styles.shuxing} ${styles.utmCampaign}`}>
          //             {text}
          //           </div>
          //     }
          //   </Tooltip>
          // );
        },
      },
      {
        title: languageForData.Source,
        dataIndex: 'utmSource',
        classType:3,
        render: (text, record, index) => {
          const obj = {
            children: text,
            props: {},
          };
          if (index === 0) {
            obj.props.colSpan = 0;
            return obj;
          }
          return (
            <div>
              {
                index === 0
                  ?
                    <span style={{ fontWeight: 700 }}>
                      {text}
                    </span>
                  :
                  text
              }
            </div>
          );
        },
      },
      {
        title: languageForData.DetailPageView,
        dataIndex: 'pv',
        classType:3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.PlaceOrders,
        dataIndex: 'orderCount',
        classType:3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.TransactionQuantity,
        dataIndex: 'orderPayCount',
        classType:3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.SalesVolume,
        dataIndex: 'salesCount',
        classType:3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.PaymentAmount,
        dataIndex: 'salesAmount',
        classType:3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.OrderPlacedRate,
        dataIndex: 'orderRate',
        classType:2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.SalesRate,
        dataIndex: 'salesRate',
        classType:2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.TransactionRate,
        dataIndex: 'conversionRate',
        classType:2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: languageForData.PerUnitPrice,
        dataIndex: 'perCustomerTransaction',
        classType:2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
    ];
    const pagination = {
      total: dataFlowAnalysis.data && dataFlowAnalysis.data.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      current: dataFlowAnalysis.pushData && dataFlowAnalysis.pushData.pageNum,
      pageSize: dataFlowAnalysis.pushData && dataFlowAnalysis.pushData.pageSize,
      showTotal: (total) => {
        return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
      },
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `dataFlowAnalysis/${type}PushShowSize`,
          payload: {
            pageNum: current,
            pageSize: size,
          },
        });
        // this.loadData();
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `dataFlowAnalysis/${type}PushShowNum`,
          payload: {
            pageNum: current,
          },
        });
        // this.loadData();
      },
    };
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <div id={styles.DataFlowAnalysis}>
        <DataFlowAnalysisTabs
          defaultActiveKey="3"
          onTabChange={(key) => {
            console.log('onTabChange', key);
          }}
        />
        <Card>
          <div className={styles.DataFlowAnalysis}>
            <Form
              layout="inline"
              onSubmit={this.handleSubmit}
              className="margin-bottom-24"
            >
              <div>
                <FormItem
                  label={languageForData.Source}
                >
                  {getFieldDecorator('utmSource', {
                    rules: [{ required: false }],
                    onChange: (value) => {
                      this.changeUtmSource(value);
                    },
                  })(
                    <Select
                      placeholder={languageForData.Select}
                      allowClear={selectAllowClear}
                      style={{ width: 100, marginTop: '-7px' }}
                    >
                      {
                        dataFlowAnalysis.utmSources ? dataFlowAnalysis.utmSources.map((items) => {
                          return (
                            <Option value={items.id} key={items.id}>
                              {items.name}
                            </Option>);
                        }) : null
                      }
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  className={styles.filter}
                >
                  {getFieldDecorator('filter', {
                    rules: [{ required: false }],
                    initialValue: selectSearchDatas[0].key,
                    onChange: (value) => {
                      this.props.dispatch({
                        type: `dataFlowAnalysis/${type}PushFilter`,
                        payload: value,
                      });
                    },
                  })(
                    <Select
                      style={{ width: 140 }}
                      placeholder={languageForData.AdsCampaign}
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
                    rules: [{ required: false, message: languageForData.Search }],
                  })(
                    <Search
                      placeholder={languageForData.Search}
                      onSearch={this.searchData}
                      className="select-Input"
                      enterButton
                    />)}
                </FormItem>
                <FormItem
                  label={languageForData.Time}
                >
                  {getFieldDecorator('dealTime', {
                    rules: [{ required: false, message: `${languageForGlobal.PleaseEnter} ${languageForData.Time}!` }],
                    initialValue: [moment().subtract(6, 'days'),moment()],
                    onChange: (value) => {
                      this.changeDealTime(value);
                    },
                  })(
                    <RangePicker />
                  )}
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
                // loading={loading}
                dataSource={dataFlowAnalysis.data && dataFlowAnalysis.data.datas}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }
}
