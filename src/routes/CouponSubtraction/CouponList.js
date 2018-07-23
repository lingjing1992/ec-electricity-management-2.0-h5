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
  couponSubtraction: state.couponSubtraction,
  global: state.global
}))
@Form.create()
export default class CounponList extends Component {
  state = {
    type: 'couponSubtraction',
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
      type: 'couponSubtraction/clear',
      payload: null,
    });
  }
  loadData() {
    const { type } = this.state;
    const { couponSubtraction } = this.props;
    console.log('this=>', this);
    this.props.dispatch({
      type: `couponSubtraction/${type}GetDiscounts`,
      payload: couponSubtraction.pushData,
    });
  }

  searchData = () => {
    const { getFieldValue } = this.props.form;
    const { type } = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `couponSubtraction/${type}PushShowNum`,
      payload: {
        pageNum: 1,
      },
    });
    this.props.dispatch({
      type: `couponSubtraction/${type}pushShowSize`,
      payload: {
        pageSize: 20,
      },
    });
    this.props.dispatch({
      type: `couponSubtraction/${type}PushDisCodeSeller`,
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
    } else if (e.key === '3') {
      //删除
      this.modalDelete(record);
    }
    console.log(record)
  }

  modalDelete = (record) => {
    const {global} = this.props.global.languageDetails;
    const languageForMessage = this.props.global.languageDetails.message;
    Modal.confirm({
      title: languageForMessage.unrecoverable,
      //      content: 'Bla bla ...',
      okText: global.Confirm,
      onOk: this.delCoupon.bind(this,record),
      cancelText: global.cancel,
    });
  }

  //删除优惠码
  delCoupon = (record) => {
    const languageForMesssge = this.props.global.languageDetails.message;
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
      type: "couponSubtraction/getCouponItem",
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
      type: "couponSubtraction/getCouponItem",
      payload: record,
    });
    this.setState({
      visibleEditorStatus: true,
    });
  }
  //确定更新有效期
  handleOkEditor = (e) => {
    const {type} = this.state;
    const {couponSubtraction} = this.props;
    const {getFieldValue} = this.props.form;
    this.props.form.validateFields(['begin_date', 'end_date'], (err) => {
      if (!err) {
        this.props.dispatch({
          type: `couponSubtraction/${type}UpdateExpireDate`,
          payload: {
            disId: couponSubtraction.couponItem.disId,
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
    const {type, spuSelectList} = this.state;
    const {couponSubtraction} = this.props;
    const {getFieldValue} = this.props.form;
    // const {message, global} = this.props.global.languageDetails;
    const languageForMesssge = this.props.global.languageDetails.message;
    this.props.form.validateFields(['status','spuIdsArr', 'editProductStatus'], (err) => {
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
          type: `couponSubtraction/${type}UpdateEditProduct`,
          payload: {
            disId: couponSubtraction.couponItem.disId,
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
    console.log(e);
    this.setState({
      visibleEditor: false,
    });
  }
  handleCancelEditorStatus = (e) => {
    console.log(e);
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
      type: 'couponSubtraction/getCouponItem',
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
    const {couponSubtraction} = this.props;
    const startValue = moment(couponSubtraction.couponItem.expireTime).subtract(1, 'days');
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }
  // table回掉函数，排序等操作。
  handleTableChange = (pagination, filters, sorter) => {
    console.log('pagination, filters, sorter', pagination, filters, sorter);
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
    const { couponSubtraction } = this.props;
    console.log('this=>', this);
    this.props.dispatch({
      type: `couponSubtraction/${type}GetDiscounts`,
      payload: {
        ...couponSubtraction.pushData,
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
    const { couponSubtraction } = this.props;
    const {endOpen} = this.state;
    const { couponSubtraction: { loading } } = this.props;
    const { type } = this.state;
    const { couponCode, couponSub, global} = this.props.global.languageDetails;

    // 列表描述
    const columns = [
      {
        title: couponSub.Operation,
        dataIndex: 'action',
        className: 'tcenter',
        classType: 1,
        render: (text, record) => {
          let result = [
            {title: couponSub.ValidDate, key: 1},
            {title: couponSub.ApplicableProduct, key: 2},
          ];
          if(record.status === 2){
            result[2] = {
              title: couponSub.Delete,
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
        title: couponSub.SerialNo,
        dataIndex: 'name1',
        classType: 1,
        render: (text, record, index) => {
          const { couponSubtraction } = this.props;
          return (
            <div>
              {((couponSubtraction.pushData.pageNum - 1) * couponSubtraction.pushData.pageSize) + index + 1}
            </div>
          );
        },
      },
      {
        title: couponSub.PromoCodeName,
        dataIndex: 'disCodeSeller',
        classType: 4,
        render: (text) => {
          return (
            <Tooltip placement="top" title={text}>
              <div className={`${styles.shuxing} ${styles.disCodeSeller}`} >
                {text || '-'}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: couponSub.PromoCodeStatus,
        dataIndex: 'status',
        classType: 2,
        render: (text, record) => {
          let result = null;
          switch (text) {
            case 0:
              result = couponSub.Expired;
              break;
            case 1:
              result = couponSub.InUse;
              break;
            case 2:
              result = couponSub.Unused;
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
        title: couponSub.PromoType,
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
        title: couponSub.ConsumedCondition,
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
        title: couponSub.UseLimits,
        dataIndex: 'useType',
        classType: 4,
        render: (text, record) => {
          let reuslt = null;
          switch (text) {
            case 1:
              reuslt = couponSub.useduring2;
              break;
            case 2:
              reuslt = couponSub.useduring3;
              break;
            case 3:
              reuslt = couponSub.useduring1;
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
        title: couponSub.ApplicableProduct,
        dataIndex: 'spus',
        classType: 2,
        render: (text, record) => {
          const rusult = record.spus.length <= 0 ? couponSub.All : <a onClick={this.handleSpus.bind(this, record)}>{couponSub.Some}</a>;
          return (
            <div>
              {rusult}
            </div>
          );
        },
      },
      {
        title: couponSub.ValidDate,
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
        title: couponSub.GeneratedTime,
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
        title: couponSub.OrderQuantity,
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
        title: couponSub.SalesVolume,
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
        title: couponSub.PaymentAmount,
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
        title: couponSub.DiscountAmount,
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
      total: couponSubtraction.data && couponSubtraction.data.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      current: couponSubtraction.pushData && couponSubtraction.pushData.pageNum,
      pageSize: couponSubtraction.pushData && couponSubtraction.pushData.pageSize,
      showTotal: (total) => {
        return `${global.total} ${total} ${global.items}`;
      },
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `couponSubtraction/${type}PushShowSize`,
          payload: {
            pageNum: current,
            pageSize: size,
          },
        });
        this.loadData();
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `couponSubtraction/${type}PushShowNum`,
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
        title: couponSub.ProductName,
        dataIndex: 'name',
        classType: 4,
        render: (text, record) => {
          return (
            <div>{text}</div>
          );
        },
      },
      {
        title: couponSub.ProductImage,
        dataIndex: 'icon',
        classType: 1,
        render: (text, record) => {
          return (
            <div className={`${styles.columnsSpuIconContent} tableImage`}>
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
                // label={ couponCode.PromoCodeName}
              >
                {getFieldDecorator('disCodeSeller', {
                  rules: [{ required: false, message: couponSub.Search }],
                })(
                  <Search
                    placeholder={couponSub.Search}
                    onSearch={this.searchData}
                    className="select-Input"
                    enterButton
                  />)}
              </FormItem>
              <FormItem>
                <Link to="/marketing/couponSubtractionCreate">
                  <Button type="primary">
                    {couponSub.Add}
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
            dataSource={couponSubtraction.data && couponSubtraction.data.discounts}
            onChange={this.handleTableChange}
          />
        </Card>
        {/* 适用商品 */}
        <Modal
          title={couponSub.ApplicableProduct}
          visible={this.state.visibleSpu}
          onOk={this.handleOkSpu}
          onCancel={this.handleCancelSpu}
          footer={false}
        >
          <Table
            columns={columnsSpu}
            dataSource={couponSubtraction.couponItem && couponSubtraction.couponItem.spus}
            pagination={false}
            rowKey='spuId'
          />
        </Modal>
        {/* 编辑有效期 */}
        <Modal
          title={couponSub.EditValidDate}
          visible={this.state.visibleEditor}
          onOk={this.handleOkEditor}
          onCancel={this.handleCancelEditor}
          okText={couponSub.Update}
          width={280}
          maskClosable={false}
        >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              label={couponSub.StartingTime}
            >
              {getFieldDecorator('begin_date', {
                rules: [{type: 'object', required: true, message: `${global.Pleasechoose}${couponSub.StartingTime}`}],
                initialValue: moment(couponSubtraction.couponItem.createTime),
              })(
                <DatePicker
                  disabled
                  format="YYYY-MM-DD"
                  style={{width:255}}
                  placeholder="Start"
                  onChange={this.onStartChange}
                  onOpenChange={this.handleStartOpenChange}
                />
              )}
            </FormItem>
            <FormItem
              label={couponSub.EndingTime}
            >
              {getFieldDecorator('end_date', {
                rules: [{type: 'object', required: true, message: `${global.Pleasechoose}${couponSub.EndingTime}`}],
                initialValue: moment(couponSubtraction.couponItem.expireTime),
              })(
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="End"
                  onChange={this.onEndChange}
                  open={endOpen}
                  style={{width:255}}
                  showTime
                  showToday="false"
                  onOpenChange={this.handleEndOpenChange}
                />
              )}
            </FormItem>
          </Form>
        </Modal>
        {/* 编辑任务状态 */}
        <Modal
          title={couponSub.EditProduct}
          visible={this.state.visibleEditorStatus}
          onOk={this.handleOkEditorStatus}
          onCancel={this.handleCancelEditorStatus}
          okText={couponSub.Update}
          maskClosable={false}
          width={924}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label={couponSub.ProductApplicableRange}
              className={styles.modleLabel}
            >
              {
                getFieldDecorator('editProductStatus', {
                rules: [{ required: true, message: `${global.Pleasechoose}${couponSub.ProductApplicableRange}`}],
              })(
                <RadioGroup>
                  <Radio value="1" style={{margin:'0 25px'}}>{couponSub.SpecifiedProduct}</Radio>
                  <Radio value="2">{couponSub.AllProduct}</Radio>
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
