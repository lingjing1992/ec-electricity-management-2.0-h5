import React, {Component} from 'react';


import {connect} from 'dva';
import moment from 'moment';
import {Redirect, Switch} from 'dva/router';
import styles from './DataGoodsSalesList.less';
import { tabbleColumnsControl, tabbleColumnsControlForPemission } from '../../utils/utils';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Card
} from 'antd';
import Table from '../../components/table';

const FormItem = Form.Item;
const {Option} = Select;
const { Search } = Input;
const RangePicker = DatePicker.RangePicker;
import Cookies from 'js-cookie';


@connect(state => ({
  dataGoodsSales: state.dataGoodsSales,
  global: state.global
}))
@Form.create()
export default class DataGoodsSales extends Component {
  state = {
    type: 'dataGoodsSales',
    expandedRowKeysArr: [], // Table 展开子集
    permission: this.props.global.rolePower.modules['1004'].moduleSubs['10005'].moduleFunctions,//权限值
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'dataGoodsSales/clear',
      payload: null,
    });
  }

  loadData() {
    const {type} = this.state;
    const {dataGoodsSales} = this.props;
    // console.log('this=>', this);

    this.props.dispatch({
      type: `dataGoodsSales/${type}GetDataGoodsSales`,
      payload: dataGoodsSales.pushData,
    });
  }

  // 时间
  changeDealTime = (value) => {
    const {getFieldValue} = this.props.form;

    console.log('value', value);
    // startTime: moment(values.startTime[0]).format('YYYY-MM-DD HH:mm:ss'),
    const {type} = this.state;
    if (value.length > 0) {
      this.props.dispatch({
        type: `dataGoodsSales/${type}PushDealTime`,
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
        type: `dataGoodsSales/${type}PushDealTime`,
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
    const {getFieldValue} = this.props.form;
    const {type} = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `dataGoodsSales/${type}PushShowNum`,
      payload: {
        pageNum: 1,
      },
    });
    this.props.dispatch({
      type: `dataGoodsSales/${type}pushShowSize`,
      payload: {
        pageSize: 20,
      },
    });
    this.props.dispatch({
      type: `dataGoodsSales/${type}PushKeyword`,
      payload: getFieldValue('keyword').trim(),
      callback: () => {
        this.loadData();
      },
    });
  }


  // table回掉函数，排序等操作。
  handleTableChange = (pagination, filters, sorter) => {
    console.log('pagination, filters, sorter', pagination, filters, sorter);
    // descend = 0 降序 ascend = 1 升序 => 组件
    // order_by 1-详情页PV 2-下单数 3-成交数 4-销售商品数 5-支付金额 6-下单率 7-销售率 8-成交率 9-客单价 10-日期 11-供货成本
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
    } else if(sorter.field === 'buyingAmount'){
      orderBy = 11;
    }
    else {
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
    const {dataGoodsSales} = this.props;
    console.log('this=>', this);
    this.props.dispatch({
      type: `dataGoodsSales/${type}GetDataGoodsSales`,
      payload: {
        ...dataGoodsSales.pushData,
        sort: sortNum,
        orderBy,
        // sort: sortNum,
      },
    });
  }

  getExpandedRowKeysArr = (record) => {
    console.log('record', record);
    const {expandedRowKeysArr} = this.state;
    const result1 = expandedRowKeysArr.indexOf(record.spuId); // 返回index为
    console.log('result1', result1);
    if (result1 >= 0) {
      expandedRowKeysArr.map((item, index) => {
        console.log('index', index);
        if (item === record.spuId) {
          expandedRowKeysArr.splice(index, 1);
        }
        return true;
      });
    } else {
      expandedRowKeysArr.push(record.spuId);
    }
    console.log('expandedRowKeysArr', expandedRowKeysArr);
    this.setState({
      expandedRowKeysArr,
    });
  }

  // 打开子集
  handleOpen = (record) => {
    this.getExpandedRowKeysArr(record);
  }

  //阻止冒泡事件
  stopProgation = (e) => {
    e.stopPropagation();
  }


  render() {
    const {getFieldDecorator} = this.props.form;
    const {type, permission} = this.state;
    const {dataGoodsSales} = this.props;
    const {dataGoodsSales: {loading}} = this.props;
    const ELE_ROLE = Cookies.get('ELE_ROLE');
    const languageForData = this.props.global.languageDetails.data.dataGoodsSalesList;
    const languageForGlobal = this.props.global.languageDetails.global;
    //是否是商家
    const isSeller = ELE_ROLE === 1;
    const selectSearchDatas = [
      {value: 'SPU', key: '1'},
      // { value: 'SKU', key: '2' },
    ]; // 选择搜索数据
    const dataSource = dataGoodsSales.data.hasOwnProperty('datas') ? dataGoodsSales.data.datas : [];
    const columns = [
      {
        title: 'ID',
        dataIndex: 'spuId',
        classType: 2,
        render: (value, row, index) => {
          let obj = null;
          if (index === 0) {
            obj = {
              children: (
                <div className="tcenter">
                  <span onClick={this.stopProgation}  style={{fontWeight: 700}}>{value}</span>
                </div>
              ),
              props: {},
            };
          } else {
            obj = {
              children: (<span onClick={this.stopProgation}>{value}</span>),
              props: {},
            };
          }
          if (index === 0) {
            obj.props.colSpan = 3;
          }
          return obj;
          // return (
          //   <div>
          //     {
          //       index === 0
          //         ?
          //         <span style={{ fontWeight: 700 }}>
          //             {text}
          //           </span>
          //         :
          //         text
          //     }
          //   </div>
          // );
        },
      },
      {
        title: languageForData.ProductInformation,
        dataIndex: 'spuIcon',
        classType: 3,
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
            <div className={`${styles.shuxing}`}>
              <div className={styles.goodsInfoImg}>
                {/*
                 <Tooltip
                 placement="top"
                 title={
                 <div>
                 <p>{record.spu_name}</p>
                 <p>{record.spu_type}</p>
                 </div>
                 }
                 >
                 <img alt="" src={record.spuIcon} />
                 </Tooltip>
                 */}
                {
                  index === 0
                    ?
                    null
                    :
                    <img alt="" src={record.spuIcon}/>
                }
              </div>
            </div>
          );
        },
      },
      {
        title: languageForData.PublishedTime,
        dataIndex: 'onSaleDate',
        classType: 3,
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
            <div className={styles.onSaleDate}>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.DetailPageView,
        dataIndex: 'pv',
        classType: 3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.Orders,
        dataIndex: 'orderCount',
        classType: 2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.TransactionQuantity,
        dataIndex: 'orderPayCount',
        classType: 2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.SalesVolume,
        dataIndex: 'salesCount',
        classType: 3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        // title: '支付金额', 产品临时改字段
        title: languageForData.TotalPrice,
        dataIndex: 'salesAmount',
        classType: 3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.SupplyCost,
        dataIndex: 'buyingAmount',
        classType: 3,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.OrderPlacedRate,
        dataIndex: 'orderRate',
        classType: 2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.SalesRate,
        dataIndex: 'salesRate',
        classType: 2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
      {
        title: languageForData.TransactionRate,
        dataIndex: 'conversionRate',
        classType: 2,
        sorter: true,
        render: (text, record) => {
          return (
            <div>
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
    ];
    const point = {
      salesAmount:100030,
      buyingAmount: 100031,
    };
//    tabbleColumnsControl(dataSource,columns)
    tabbleColumnsControlForPemission(dataSource,columns,point,permission);
    const pagination = {
      total: dataGoodsSales.data && dataGoodsSales.data.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      current: dataGoodsSales.pushData && dataGoodsSales.pushData.pageNum,
      pageSize: dataGoodsSales.pushData && dataGoodsSales.pushData.pageSize,
      showTotal: (total) => {
        return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
      },
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `dataGoodsSales/${type}PushShowSize`,
          payload: {
            pageNum: current,
            pageSize: size,
          },
        });
        // this.loadData();
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `dataGoodsSales/${type}PushShowNum`,
          payload: {
            pageNum: current,
          },
        });
        // this.loadData();
      },
    };
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };

    console.log('this=>', this);

    return (
      <div className={styles.DataGoodsSalesList}>
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
                      type: `dataGoodsSales/${type}PushFilter`,
                      payload: value,
                    });
                  },
                })(
                  <Select
                    style={{width: 100}}
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
                  rules: [{required: false, message: languageForData.Search}],
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
                  rules: [{required: false, message: languageForGlobal.PleaseEnter+languageForData.Time}],
                  onChange: (value) => {
                    this.changeDealTime(value);
                  },
                })(
                  <RangePicker  />
                )}
              </FormItem>
            </div>
          </Form>
          <div className={styles.tableTop}>
            <Table
              loading={loading}
              rowKey="spuId"
              columns={columns}
              expandRowByClick={true}
              pagination={pagination}
              onChange={this.handleTableChange}
              needToGetWidth={true}
              dataSource={dataSource}
              // expandedRowKeys={this.state.expandedRowKeysArr}
              expandedRowRender={(record,index) => {
                console.log('record-data', record);
                const skus = record.skus || [];
                const expandColumns = [
                  // {
                  //   dataIndex: 'total',
                  //   classType: 2,
                  //   render: () => {
                  //     return (
                  //       <div></div>
                  //     )
                  //   }
                  // },
                  {
                    dataIndex: 'skuId',
                    classType: 2,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'skuProperties',
                    classType: 3,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'onSaleDate',
                    classType: 3,
                    // render: (text) => {
                    //   return (
                    //     <div>{text}</div>
                    //   )
                    // }
                  },
                  {
                    dataIndex: 'pv',
                    classType: 3,
                    className: styles.tablepv
                  },
                  {
                    dataIndex: 'orderCount',
                    classType: 2,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'orderPayCount',
                    classType: 2,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'salesCount',
                    classType: 3,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'salesAmount',
                    classType: 3,
                    permission: 100030,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'buyingAmount',
                    classType: 3,
                    permission: 100031,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'orderRate',
                    classType: 2,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'salesRate',
                    classType: 2,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                  {
                    dataIndex: 'conversionRate',
                    classType: 2,
                    render: (text) => {
                      return (
                        <div>{text}</div>
                      )
                    }
                  },
                ];
                const newExpandColumes = expandColumns.filter((item)=>{
                  return !item.hasOwnProperty('permission') || !!permission[item.permission].status;
                })
                // if(!isSeller){
                //   expandColumns.splice(9,0,{
                //     dataIndex: 'buyingAmount',
                //     classType: 3,
                //     render: (text) => {
                //       return (
                //         <div>{text}</div>
                //       )
                //     }
                //   })
                // }
                return (
                  <div className={`${'expandTable'+index} expandTable`}>
                    <Table
                      dataSource={skus}
                      pagination={false}
                      showHeader={false}
                      rowKey='skuId'
                      columns={newExpandColumes}
                    />
                  </div>
                );
              }}
            />
          </div>
        </Card>
      </div>
    );
  }
}
