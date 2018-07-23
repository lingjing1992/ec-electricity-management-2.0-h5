import React, { Component } from 'react';
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
  Radio,
  notification,
  message
} from 'antd';

import Table from '../../components/table';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import styles from './CouponList.less';
import ruleType from '../../utils/ruleType';
import SpuSelect from '../../components/SpuSelect';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
const { Search } = Input;

@connect(state => ({
  couponList: state.couponList,
  global: state.global
}))
@Form.create()
export default class MarketingList extends Component {
  state = {
    type: 'couponList',
    visibleSpu: false,
    endOpen: false,
    visibleEditor: false,
    visibleEditorStatus: false,
    spuDefaultList:[],
    spuSelectList:[],
  }

  componentDidMount() {
    this.loadData();
  }
  componentWillUnmount() {
    this.props.dispatch({
      type: 'couponList/clear',
      payload: null,
    });
  }
  loadData() {
    const { type } = this.state;
    const { couponList } = this.props;
//    console.log('this=>', this);
    this.props.dispatch({
      type: `couponList/${type}GetDiscounts`,
      payload: couponList.pushData,
    });
  }

  searchData = () => {
    const { getFieldValue } = this.props.form;
    const { type } = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `couponList/${type}PushShowNum`,
      payload: {
        pageNum: 1,
      },
    });
    this.props.dispatch({
      type: `couponList/${type}pushShowSize`,
      payload: {
        pageSize: 20,
      },
    });
    this.props.dispatch({
      type: `couponList/${type}PushDisCodeSeller`,
      payload: getFieldValue('disCodeSeller').trim(),
      callback: () => {
        this.loadData();
      },
    });
  }
  // 点击操作按钮
  handleMenuClick = (record, e) => {
    if (e.key === '1') {
      // 修改
      this.showModalEditor(record);
    } else if (e.key === '2') {
      this.showModalEditorStatus(record);
    } else if(e.key === '3'){
      this.modalDelete(record);
    }
//    console.log(record)
  }

  modalDelete = (record) => {
    const { global} = this.props.global.languageDetails;
    const languageForMesssge = this.props.global.languageDetails.message;
    Modal.confirm({
      title: languageForMesssge.unrecoverable,
      //      content: 'Bla bla ...',
      okText: global.Confirm,
      onOk: this.delCoupon.bind(this,record),
      cancelText: global.cancel,
    });
  }

  //删除优惠码
  delCoupon = (record) => {
    const languageForMesssge = this.props.global.languageDetails.message;
    // console.log(message);
    this.props.dispatch({
      type: 'couponSubtraction/deleteDiscount',
      payload: {
        disId : record.disId
      },
      callback: (data) => {
        if(data.status===200){
          this.loadData();
          message.success(languageForMesssge.DeletedSuccessfully);
        }
      }
    })
  }
  // 有效期
  showModalEditor = (record) => {
    const {setFieldsValue} = this.props.form;
    setFieldsValue({
      end_date: moment(record.expireTime),
    });
    const {type} = this.state;
    this.props.dispatch({
      type: "couponList/getCouponItem",
      payload: record,
    });
    this.setState({
      visibleEditor: true,
    });
  }
  // 适用商品编辑
  showModalEditorStatus = (record) => {
    const {setFieldsValue} = this.props.form;
    if(record.spus.length>0){
      //指定spu
      setFieldsValue({
        editProductStatus: "1",
      });
      this.setState({
        spuDefaultList: record.spus,
      })
    }else{
      //全部商品
      setFieldsValue({
        editProductStatus: "2",
      });
    }

    const {type} = this.state;
    this.props.dispatch({
      type: "couponList/getCouponItem",
      payload: record,
    });
    this.setState({
      visibleEditorStatus: true,
    });
  }
  //确定更新有效期
  handleOkEditor = (e) => {
    const {type} = this.state;
    const {couponList} = this.props;
    const {getFieldValue} = this.props.form;
    this.props.form.validateFields(['begin_date', 'end_date'], (err) => {
      if (!err) {
        this.props.dispatch({
          type: `couponList/${type}UpdateExpireDate`,
          payload: {
            disId: couponList.couponItem.disId,
            startTime: moment(getFieldValue('begin_date')).format('YYYY-MM-DD HH:mm:ss'),
            expireTime: moment(getFieldValue('end_date')).format('YYYY-MM-DD HH:mm:ss'),
          },
          callback: () => {
            this.loadData();
          },
        });
        // console.log(e);
        this.setState({
          visibleEditor: false,
        });
      }
    });
  }
  //确定更新适应商品状态
  handleOkEditorStatus = (e) => {
    const languageForMesssge = this.props.global.languageDetails.message;
    const {type, spuSelectList} = this.state;
    const {couponList} = this.props;
    const {getFieldValue} = this.props.form;
    this.props.form.validateFields(['status','spuIdsArr'], (err) => {
      var editProductStatus = getFieldValue('editProductStatus');
      var tmepSpuIdsArr = spuSelectList.map((item)=>{ return item.spuId });
      if(editProductStatus==1 && spuSelectList.length===0){
        notification.error({
          message: languageForMesssge.KindlyReminder,
          description: languageForMesssge.setatleastone,
        });
        return;
      }

      if (!err) {
        //所有商品清空spu数组
        if(editProductStatus==2){
          tmepSpuIdsArr = [];
        }
        this.props.dispatch({
          type: `couponList/${type}UpdateEditProduct`,
          payload: {
            disId: couponList.couponItem.disId,
            spuIds: tmepSpuIdsArr,
          },
          callback: () => {
            this.loadData();
          },
        });

        this.setState({
          visibleEditorStatus: false,
        });
      }
    });
  }

  handleCancelEditor = (e) => {
//    console.log(e);
    this.setState({
      visibleEditor: false,
    });
  }
  handleCancelEditorStatus = (e) => {
//    console.log(e);
    this.setState({
      visibleEditorStatus: false,
      spuDefaultList: [],
    });
  }
  handleEndOpenChange = (open) => {
    this.setState({endOpen: open});
  }

  // 如果是部分的时候，点击弹出
  handleSpus = (record) => {
    this.setState({
      visibleSpu: true,
    });
    this.props.dispatch({
      type: 'couponList/getCouponItem',
      payload: record,
    });
  }
  handleOkSpu = (e) => {
    // console.log(e);
    e.preventDefault();
    this.setState({
      visibleSpu: false,
    });
  }
  handleCancelSpu = () => {
    // console.log(e);
    this.setState({
      visibleSpu: false,
    });
  }
  disabledEndDate = (endValue) => {
    const {couponList} = this.props;
    const startValue = moment(couponList.couponItem.expireTime).subtract(1, 'days');
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }
  // table回掉函数，排序等操作。
  handleTableChange = (pagination, filters, sorter) => {
//    console.log('pagination, filters, sorter', pagination, filters, sorter);
    // descend = 0 降序 ascend = 1 升序 => 组件
    // order_by 排序的字段：0默认排序,1 创建时间 2 销售商品数,3 支付金额,4成交订单量
    // sort 排序方式：默认0,0 降序,1升序
    // 排序类型
    let orderBy = 0;
    if (sorter.field === 'createTime') {
      orderBy = 1;
    } else if (sorter.field === 'tradeGoodsCount') {
      orderBy = 2;
    } else if (sorter.field === 'tradeAmount') {
      orderBy = 3;
    } else if (sorter.field === 'tradeCount') {
      orderBy = 4;
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
    const { couponList } = this.props;
//    console.log('this=>', this);
    this.props.dispatch({
      type: `couponList/${type}GetDiscounts`,
      payload: {
        ...couponList.pushData,
        sort: sortNum,
        orderBy,
        // sort: sortNum,
      },
    });
  }

  getSelectList = (selectList) => {
    this.setState({
      spuSelectList: selectList,
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { couponList } = this.props;
    const {endOpen} = this.state;
    const { couponList: { loading } } = this.props;
    const { type } = this.state;
    const {couponCode, global, massage} = this.props.global.languageDetails;
    console.log(couponCode)
    // 列表描述
    const columns = [
      {
        title: couponCode.Operation,
        dataIndex: 'action',
        className: 'tcenter',
        classType: 1,
        render: (text, record) => {
          let result = [
            {title: couponCode.ValidDate, key: 1},
            {title: couponCode.ApplicableProduct, key: 2},
          ];
          if(record.status === 2){
            result[2] = {
              title: couponCode.Delete,
              key: 3,
            }
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
        title: couponCode.SerialNo,
        dataIndex: 'name1',
        // className: 'tcenter',
        classType: 1,
        render: (text, record, index) => {
          const { couponList } = this.props;
          return (
            <div>
              {((couponList.pushData.pageNum - 1) * couponList.pushData.pageSize) + index + 1}
            </div>
          );
        },
      },
      {
        title: couponCode.PromoCodeName,
        dataIndex: 'disCodeSeller',
        classType: 4,
        render: (text) => {
          return (
            <Tooltip placement="top" title={text}>
              <div className="ellipsis" >
                {text || '-'}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: couponCode.PromoCodeStatus,
        dataIndex: 'status',
        classType: 2,
        render: (text, record) => {
          let result = null;
          switch (text) {
            case 0:
              result = couponCode.Expired;
              break;
            case 1:
              result = couponCode.InUse;
              break;
            case 2:
              result = couponCode.Unused;
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
        title: couponCode.PromoType,
        dataIndex: 'discountType',
        classType: 2,
        render: (text, record) => {
          return (
            <div>
              <p>{text}</p>
              <p>({record.discountValue})</p>
            </div>
          );
        },
      },
      {
        title: couponCode.ConsumedCondition,
        dataIndex: 'minOrderAmount',
        classType: 2,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: couponCode.UseLimits,
        dataIndex: 'useType',
        classType: 4,
        render: (text, record) => {
          let reuslt = null;
          switch (text) {
            case 1:
              reuslt = couponCode.useduring2;
              break;
            case 2:
              reuslt = couponCode.useduring3;
              break;
            case 3:
              reuslt = couponCode.useduring1;
              break;
          }
          return (
            <div>
              {reuslt}
            </div>
          );
        },
      },
      {
        title: couponCode.ApplicableProduct,
        dataIndex: 'spus',
        classType: 3,
        render: (text, record) => {
          const rusult = record.spus.length <= 0 ? couponCode.All : <a onClick={this.handleSpus.bind(this, record)}>{couponCode.Some}</a>;
          return (
            <div>
              {rusult}
            </div>
          );
        },
      },
      {
        title: couponCode.ValidDate,
        dataIndex: 'expireTime',
        classType: 3,
        render: (text, record) => {
          return (
            <div
              className={styles.expireTime}
              style={{ display: 'inline-block' }}
            >
              <p>{record.startTime}</p>
              <p>{record.expireTime}</p>
            </div>
          );
        },
      },
      {
        title: couponCode.GeneratedTime,
        dataIndex: 'createTime',
        classType: 3,
        sorter: true,
        render: (text, record) => {
          return (
            <div
              className={styles.createTime}
              style={{ display: 'inline-block' }}
            >
              {text}
            </div>
          );
        },
      },
      {
        title: couponCode.OrderQuantity,
        dataIndex: 'tradeCount',
        classType: 2,
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
        title: couponCode.SalesVolume,
        dataIndex: 'tradeGoodsCount',
        classType: 3,
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
        title: couponCode.PaymentAmount,
        dataIndex: 'tradeAmount',
        classType: 3,
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
        title: couponCode.DiscountAmount,
        dataIndex: 'discountAmount',
        classType: 2,
        render: (text, record) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      // {
      //   title: '操作',
      //   dataIndex: 'name12',
      //   render: (text, record) => {
      //     return (
      //       <div>
      //         &nbsp;
      //       </div>
      //     );
      //   },
      // },
    ];
    // 页码
    const pagination = {
      total: couponList.data && couponList.data.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      current: couponList.pushData && couponList.pushData.pageNum,
      pageSize: couponList.pushData && couponList.pushData.pageSize,
      showTotal: (total) => {
        return `${global.total} ${total} ${global.items}`;
      },
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `couponList/${type}PushShowSize`,
          payload: {
            pageNum: current,
            pageSize: size,
          },
        });
        this.loadData();
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `couponList/${type}PushShowNum`,
          payload: {
            pageNum: current,
          },
        });
        this.loadData();
      },
    };

    const columnsSpu = [
      {
        title: 'SPUID',
        dataIndex: 'spuId',
        classType: 1,
        render: (text, record) => {
          return (
            <div>{text}</div>
          );
        },
      },
      {
        title: couponCode.ProductName,
        dataIndex: 'name',
        classType: 4,
        render: (text, record) => {
          return (
            <div>{text}</div>
          );
        },
      },
      {
        title: couponCode.ProductImage,
        dataIndex: 'icon',
        classType: 1,
        render: (text, record) => {
          return (
            <div className={styles.columnsSpuIconContent}>
              <img alt="" src={record.icon} />
            </div>
          );
        },
      },
    ];
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };
    return (
      <div className={styles.CouponList}>
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
                <Select
                  className="select-size-small"
                  defaultValue={couponCode.PromoCodeName}
                  disabled={true}
                >
                  <Option value={couponCode.PromoCodeName}>{couponCode.PromoCodeName}</Option>
                </Select>
              </FormItem>
              <FormItem
              >
                {getFieldDecorator('disCodeSeller', {
                  rules: [{ required: false, message: couponCode.Search }],
                })(
                  <Search
                    placeholder={couponCode.Search}
                    onSearch={this.searchData}
                    className="select-Input"
                    enterButton
                  />)}
              </FormItem>
              <FormItem>
                <Link to="/marketing/couponCreate">
                  <Button type="primary">
                    {couponCode.Add}
                  </Button>
                </Link>
              </FormItem>
            </div>
          </Form>
          <Table
            loading={loading}
            needToGetWidth={true}
            rowKey="disCodeSeller"
            columns={columns}
            pagination={pagination}
            // loading={loading}
            dataSource={couponList.data && couponList.data.discounts}
            onChange={this.handleTableChange}
          />
        </Card>

        {/* 适用商品 */}
        <Modal
          title={couponCode.ApplicableProduct}
          visible={this.state.visibleSpu}
          onOk={this.handleOkSpu}
          onCancel={this.handleCancelSpu}
          footer={false}
        >
          <Table
            columns={columnsSpu}
            dataSource={couponList.couponItem && couponList.couponItem.spus}
            pagination={false}
            rowKey='spuId'
          />
        </Modal>
        {/* 编辑有效期 */}
        <Modal
          title={couponCode.EditValidDate}
          visible={this.state.visibleEditor}
          onOk={this.handleOkEditor}
          onCancel={this.handleCancelEditor}
          okText={couponCode.Update}
          width={280}
          maskClosable={false}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              label={couponCode.StartingTime}
            >
              {getFieldDecorator('begin_date', {
                rules: [{type: 'object', required: true, message: `${global.Pleasechoose}${couponCode.StartingTime}`}],
                initialValue: moment(couponList.couponItem.createTime),
              })(
                <DatePicker
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
              label={couponCode.EndingTime}
            >
              {getFieldDecorator('end_date', {
                rules: [{type: 'object', required: true, message: `${global.Pleasechoose}${couponCode.EndingTime}`}],
                initialValue: moment(couponList.couponItem.expireTime),
              })(
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{width:255}}
                  placeholder="End"
                  onChange={this.onEndChange}
                  open={endOpen}
                  showTime
                  onOpenChange={this.handleEndOpenChange}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 编辑任务状态 */}
        <Modal
          title={couponCode.EditProduct}
          visible={this.state.visibleEditorStatus}
          onOk={this.handleOkEditorStatus}
          onCancel={this.handleCancelEditorStatus}
          okText={couponCode.Update}
          maskClosable={false}
          width={924}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label={couponCode.ProductApplicableRange}
              className={styles.modleLabel}
            >
              {
                getFieldDecorator('editProductStatus', {
                rules: [{ required: true, message: `${global.Pleasechoose}${couponCode.EndingTime}` }],
              })(
                <RadioGroup>
                  <Radio value="1" style={{margin:'0 25px'}}>{couponCode.SpecifiedProduct}</Radio>
                  <Radio value="2">{couponCode.AllProduct}</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {
              this.props.form.getFieldValue('editProductStatus') === '1'
                ?
                <SpuSelect
                  pushSelectList={this.getSelectList}
                  defaultValue={this.state.spuDefaultList}
                />
                :
                null
            }
          </Form>
        </Modal>
      </div>
    );
  }
}
