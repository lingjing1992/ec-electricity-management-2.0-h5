/**
 * Created by xujunchao on 2017/11/2.
 */
import React, { Component } from 'react';
import { Form, Card, Divider, Select, Modal, Input, Icon, Button, notification, Tooltip } from 'antd';
import Table from '../../components/table';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {getQueryString, setStateObjectKey, tabbleColumnsControl} from '../../utils/utils';
import DescriptionList from '../../components/DescriptionList';
import ReceiptInfomation from './receiptInformation';
import styles from './OrderDetail.less';

const { Description } = DescriptionList;
const { Option } = Select;
const FormItem = Form.Item;


@connect(state => ({
  orders: state.orders,
  global: state.global,
}))
@Form.create()
export default class OrderDetail extends Component {
  state = {
    editorReceiving: false, // 导出订单
    type: 'order',
    formLayout: 'horizontal',
    provinceList: [],
    goodsEditor: false,
    visibleRefund: false, // 退款弹出层
    visibleEditorGoods: false, // 修改商品弹出层
    editorGoodsIndex: [], // 修改商品-维护一个动态下标数组
    remarks: '',
    permission: this.props.global.rolePower.modules['1002'].moduleSubs['10014'].moduleFunctions,//权限值
    receiptInfoDefaultValue: {
      receiver_name: undefined,
      country: undefined,
      state: undefined,
      city: undefined,
      address: undefined,
      phone_number: undefined,
      zip: undefined,
      email: undefined,
      shipping_name: undefined,
      shipping_no: undefined,
    },//收货信息的值
    // riskStatus: false,//是否风险订单
  }
  componentDidMount() {
    this.loadData();
  }
  componentWillReceiveProps(nextProps) {
    const { type } = this.state;
    const orderDetail = this.props.orders.orderDetail || {};
    const orderInfo = orderDetail.order_info || {}; // 订单信息
    if (nextProps.orders.reviewProvinceList === true && orderInfo.country) {
      // 回选状态
      this.props.dispatch({
        type: `orders/${type}ReviewProvinceList`,
        payload: null,
      });
      this.getProvinceList(orderInfo.country);
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'orders/clear',
      payload: null,
    });
  }
  // 修改商品
  showModalEditorGoods = (record, e) => {
    const { type } = this.state;
    const { orders } = this.props;

    const orderDetail = this.props.orders.orderDetail || {};
    const receiverInfo = orderDetail.receiver_info || {}; // 收货人信息对象
    const orderInfo = orderDetail.order_info || {}; // 订单信息
    const goodsInfo = orderDetail.goods_info || {}; // 商品信息

    this.props.dispatch({
      type: 'orders/getOrderDetailItem',
      payload: record,
    });
    this.props.dispatch({
      type: `orders/${type}PushModifyOrderGoods`,
      payload: {
        currency_code: goodsInfo.currencyCode,
        sku_id: record.skuId,
      },
    });
    //初始化弹窗信息
    const getFieldsValue = this.props.form.getFieldsValue();
    Object.keys(getFieldsValue).forEach((key) => {
      if(key.indexOf(`editorGoods`)>-1){
        this.props.form.setFieldsValue({
          [key]:record.skuId,
        })
      }
    })
    this.setState({
      visibleEditorGoods: true,
    });
  }
  handleOkEditorGoods = (e) => {
    const { orders } = this.props;
    const originalInfo = orders.modifyOrderGoods && orders.modifyOrderGoods.original_info || {}; // 原sku信息
    const othersInfo = orders.modifyOrderGoods && orders.modifyOrderGoods.others_info || []; // 同价格sku信息

    const orderDetail = this.props.orders.orderDetail || {};
    const receiverInfo = orderDetail.receiver_info || {}; // 收货人信息对象
    const orderInfo = orderDetail.order_info || {}; // 订单信息
    const goodsInfo = orderDetail.goods_info || {}; // 商品信息
    const languageForMessage = this.props.global.languageDetails.message;

    // 获取key做校验。
    // const othersInfoMap = othersInfo.map((item) => {
    //   return `editorGoods${item.sku_id}`;
    // });
    // 自己维护一个动态表
    const othersInfoMap = this.state.editorGoodsIndex.map((item) => {
      return `editorGoods${item}`;
    });

    const { type } = this.state;
    const orderNo = getQueryString().order_no || '';
    this.props.form.validateFields([
      'remark',
      ...othersInfoMap,
    ], (err, values) => {
      if (!err) {
        let i = 0;
        let arr = [];
        var originalInfo = orders.modifyOrderGoods.original_info || {}; // 原sku信息
        Object.keys(values).forEach(function (key) {
          if(key.indexOf('editorGoods')===0){
            arr.push(values[key]);
          }
        })
        //sku没有修改则默认不修改
        for(let j=0;j<arr.length;j++){
          if(originalInfo.sku_id !== arr[j]){
            const resultSkuId = [];
            for (i in values) {
              if (i.indexOf('editorGoods') >= 0) {
                resultSkuId.push(values[i]);
              }
            }
            this.props.dispatch({
              type: `orders/${type}PushModifyOrderSub`,
              payload: {
                operation: 1, // 1-换货,2-退款
                orderNo,
                orderSubId: this.props.orders.orderDetailItem.sub_order_id,
                remark: values.remark,
                // amount: values.amount,
                // count: values.count,
                currencyCode: goodsInfo.currencyCode, // 货币,退款时传
                skuId: resultSkuId, // skuId,退换货都要
              },
              callback: () => {
                this.props.form.setFieldsValue({
                  remark: '',
                })
                this.setState({
                  visibleEditorGoods: false,
                });
                this.loadData();
              },
            });
            return;
          }
        }
        this.handleCancelEditorGoods();
        notification.error({
          message: languageForMessage.KindlyReminder,
          description: languageForMessage.CurrentOperation,
        });
      }
    });
  }
  handleCancelEditorGoods = (e) => {
    this.setState({
      visibleEditorGoods: false,
    });
  }


  // 退款
  showModalRefund = (record, e) => {
    this.props.dispatch({
      type: 'orders/getOrderDetailItem',
      payload: record,
    });
    this.setState({
      visibleRefund: true,
    });
  }
  handleOkRefund = (e) => {
    const { type } = this.state;
    const orderNo = getQueryString().order_no || '';


    const orderDetail = this.props.orders.orderDetail || {};
    const receiverInfo = orderDetail.receiver_info || {}; // 收货人信息对象
    const orderInfo = orderDetail.order_info || {}; // 订单信息
    const goodsInfo = orderDetail.goods_info || {}; // 商品信息
    const languageForMessage = this.props.global.languageDetails.message;

    e.preventDefault();
    this.props.form.validateFields([
      'amount',
      'count',
      'remark',
    ], (err, values) => {
      if (!err) {
        if (Number(values.amount) > this.props.orders.orderDetailItem.grandTotal) {
          notification.error({
            message: languageForMessage.KindlyReminder,
            description: languageForMessage.RefundAmount,
          });
        } else if (Number(values.count) > this.props.orders.orderDetailItem.count) {
          notification.error({
            message: languageForMessage.KindlyReminder,
            description: languageForMessage.SKUreturn,
          });
        } else {
          this.props.dispatch({
            type: `orders/${type}PushModifyOrderSub`,
            payload: {
              operation: 2, // 1-换货,2-退款
              orderNo,
              orderSubId: this.props.orders.orderDetailItem.sub_order_id,
              remark: values.remark,
              amount: Number(values.amount),
              count: Number(values.count),
              currencyCode: goodsInfo.currencyCode, // 货币,退款时传
              skuId: [this.props.orders.orderDetailItem.skuId], // skuId,退换货都要
            },
            callback: () => {
              this.handleCancelRefund();
              this.loadData();
            },
          });
        }
      }
    });
  }
  handleCancelRefund = (e) => {
    this.props.form.setFieldsValue({
      remark: '',
    })
    this.setState({
      visibleRefund: false,
    });
  }
  getProvinceList = (value) => {
    const { orders } = this.props;
    let result = null;
    result = orders.countryList.map((item) => {
      if (item.name === value) {
        this.setState({
          provinceList: item.states,
        });
        return item.states;
      }
      return true;
    });
    return result;
  }
  // 返回上一页
  goBackEvent = () => {
    const tapId = getQueryString().tab_id;
    const pageId = getQueryString().page_num;
    const pageSize = getQueryString().page_size;
    this.props.dispatch(routerRedux.push({
      pathname: '/order/orderList',
      search: `?tab_id=${tapId}&page_num=${pageId}&page_size=${pageSize}`,
    }));
  }
  loadData = () => {
    const { type } = this.state;
    const orderNo = getQueryString().order_no || '';
    const sendData = {
      order_no: orderNo,
    };

    // 详情
    this.props.dispatch({
      type: `orders/${type}PushGetOrderDetail`,
      payload: sendData,
      callback: (data) => {
        if(data.status===200){
          this.setReceivingInfo();
        }
      }
    });
    // 详情日志
    this.props.dispatch({
      type: `orders/${type}PushGetOrderRecord`,
      payload: sendData,
    });
    // 获取国家列表
    this.props.dispatch({
      type: `orders/${type}PushGetLocals`,
    });
    // 物流
    this.props.dispatch({
      type: `orders/${type}PushGetShippingNames`,
    });
    // 回选状态
    this.props.dispatch({
      type: `orders/${type}ReviewProvinceList`,
      payload: true,
    });
  }
  handleOkExport = (e) => {
    e.preventDefault();
    this.props.form.validateFields(
      [
        'receiver_name',
        'zip',
        'email',
        'shipping_name',
        'shipping_no',
        'country',
        'state',
        'city',
        'address',
        'phone_number',
      ], (err, values) => {
        if (!err) {
          const { type } = this.state;
          const orderNo = getQueryString().order_no || '';
          const sendData = {
            order_no: orderNo,
            receiver_name: values.receiver_name,
            country: values.country,
            state: values.state,
            city: values.city,
            address: values.address,
            phone_number: values.phone_number,
            zip: values.zip,
            email: values.email,
            shipping_name: values.shipping_name,
            shipping_no: values.shipping_no,
          };
          this.props.dispatch({
            type: `orders/${type}PushUpdateOrderAddress`,
            payload: sendData,
            callback: () => {
              this.loadData();
            },
          });
          this.setState({
            editorReceiving: false,
          });
        }
      });
  }
  handleCancelExport = (e) => {
    this.setState({
      editorReceiving: false,
    });
  }
  //编辑收货弹出
  editorReceivingEvent = () => {
    this.setReceivingInfo();
    this.setState({
      editorReceiving: true,
    })
  }
  //设置收货信息
  setReceivingInfo = () => {
    const orderDetail = this.props.orders.orderDetail || {};
    const receiverInfo = orderDetail.receiver_info || {}; // 收货人信息对象
    this.setState({
      receiptInfoDefaultValue: {
        receiver_name: receiverInfo.receiver,
        country: receiverInfo.country,
        state: receiverInfo.region,
        city: receiverInfo.city,
        address: receiverInfo.address,
        phone_number: receiverInfo.phone_number,
        zip: receiverInfo.zip,
        email: receiverInfo.email,
        shipping_name: receiverInfo.shipping_name,
        shipping_no: receiverInfo.shipping_no,
      },//收货信息的值
    })
  }
  // 编辑商品信息
  editorGoodsInfo = () => {
    this.setState({
      goodsEditor: true,
    });
  }
  // 取消编辑商品信息
  editorGoodsInfoCannel = () => {
    this.setState({
      goodsEditor: false,
    });
    this.loadData();
  }
  editorGoodsInfoSave = () => {
    const { type } = this.state;
    const { orders } = this.props;
    const pushData = {
      order_no: orders.orderDetail.order_no,
      sub_orders: [],
    };
    orders.orderDetail.goods_info.goods.map((item) => {
      pushData.sub_orders.push({
        sub_order_id: item.sub_order_id,
        order_status: item.status,
      });
      return true;
    });
    this.props.dispatch({
      type: `orders/${type}PushUpdateSubOrderStatus`,
      payload: pushData,
    });
    this.setState({
      goodsEditor: false,
    });
  }

  handleChangeStatus(record, value) {
    const { type } = this.state;
    // 商品信息获取编辑信息
    this.props.dispatch({
      type: `orders/${type}GoodsEditor`,
      payload: {
        record,
        value,
      },
    });
  }

  //发货信息弹窗显示关闭
  showModal  = (boolean) => {
    this.setState({
      editorReceiving: boolean
    })
  }
  //设置
  handleSetValue = (object) => {
    setStateObjectKey(this,'receiptInfoDefaultValue',object)
  }

  // 订单修改商品
  templateOthersInfo() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = { layout: 'vertical',}
    const { orders } = this.props;
    const originalInfo = orders.modifyOrderGoods && orders.modifyOrderGoods.original_info || {}; // 原sku信息
    const othersInfo = orders.modifyOrderGoods && orders.modifyOrderGoods.others_info || []; // 同价格sku信息

    const othersInfoResult = [];
    // 设置多个列表
    othersInfo.map((item,index) => {
      othersInfoResult.push(<Option key={item.sku_id} value={item.sku_id}>{item.property_names}</Option>);
    });

    // const editorGoodsIndex = [];
    const count = orders.orderDetailItem && orders.orderDetailItem.count;
    for (let i = 0; i < count; i++) {
      this.state.editorGoodsIndex.push(i);
    }
    const resultTemplate = [];
    for (let i = 0; i < count; i++) {
      resultTemplate.push(
        <FormItem
          {...formItemLayout}
          label={`SKU`}
        >
          {getFieldDecorator(`editorGoods${i}`, {
              rules: [{ required: true }],
              initialValue: originalInfo.sku_id,
            })(
              <Select style={{ width: '100%' }}>
                {othersInfoResult}
              </Select>
            )}
        </FormItem>
      );
    }
    return resultTemplate;
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { orders: { loading } } = this.props;
    const { orders } = this.props;
    const { permission } = this.state;
    const languageForOrder = this.props.global.languageDetails.order.orderDetails;
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForMessage = this.props.global.languageDetails.message;
    const columnsLog = [{
      title: languageForOrder.Operator,
      // classType: 5,
      dataIndex: 'operator',
    }, {
      title: languageForOrder.Date,
      dataIndex: 'op_datetime',
      // classType: 3,
    }, {
      title: languageForOrder.OrderStatus,
      // classType: 2,
      dataIndex: 'order_status',
    }, {
      title: languageForOrder.Content,
      // classType: 5,
      dataIndex: 'content',
    }];
//    const selectSearchDatas = [
//      { label: '待发货', key: 1 },
//      { label: '已发货', key: 2 },
//      { label: '已取消', key: 3 },
//      // { label: '已收货', key: 4 },
//      { label: '已退款', key: 5 },
//    ]; // 选择搜索数据
    const orderDetail = this.props.orders.orderDetail || {};
    const receiverInfo = orderDetail.receiver_info || {}; // 收货人信息对象
    const orderInfo = orderDetail.order_info || {}; // 订单信息
    const goodsInfo = orderDetail.goods_info || {}; // 商品信息
    const originalInfo = orders.modifyOrderGoods && orders.modifyOrderGoods.original_info || {}; // 原sku信息
    const othersInfo = orders.modifyOrderGoods && orders.modifyOrderGoods.others_info || []; // 同价格sku信息
    const goodsInfoGoods = goodsInfo.hasOwnProperty('goods') ? goodsInfo.goods : [];

    const { formLayout } = this.state;
    // const formItemLayout = formLayout === 'horizontal' ? {
    //   labelCol: { span: 6 },
    //   wrapperCol: { span: 14 },
    // } : null;
    const formItemLayout = { layout: 'vertical',}
    const buttonItemLayout = formLayout === 'horizontal' ? {
      wrapperCol: { span: 14, offset: 4 },
    } : null;
    //适配不同语言弹窗
    const currentLanguage = this.props.global.language;
    // const formItemLayoutRefund = currentLanguage == 'en' ? {
    //   labelCol: { span: 9 },
    //   wrapperCol: { span: 14 },
    // } : {
    //   labelCol: { span: 7 },
    //   wrapperCol: { span: 14 },
    // }
    const formItemLayoutRefund = { layout: 'vertical',}
    let orderListcolumns = [
      {
        title: languageForGlobal.serialNo,
        dataIndex: 'sequence',
        classType: 1,
        render: (text)=>{
          return (
            <div>{text}</div>
          )
        }
      },
      { title: languageForOrder.ProductName,
        dataIndex: 'name',
        classType: 1,
        render: (text, record) => {
          return (
            <Tooltip
              placement="top"
              title={
                <div>
                  <p>{record.name}</p>
                </div>
              }
            >
              <div className="tableImage"><img src={record.icon} /></div>
            </Tooltip>
          );
        },
      },
      {
        title: languageForOrder.MerchantSKU,
        dataIndex: 'sellerSku',
        classType: 6,
      },
      {
        title: languageForOrder.Type,
        dataIndex: 'category',
        classType: 6,
      },
      {
        title: languageForOrder.UnitePrice,
        dataIndex: 'unit_price',
        permission: 100021,
        classType:2,
        render: (text, record) => {
          return (
            <div>{goodsInfo.currencySymbol}{record.unit_price}</div>
          );
        },
      },
      {
        title: languageForOrder.SupplyPrice,
        dataIndex: 'supplyPrice',
        permission: 100022,
        classType:2,
        render: (text, record) => {
          return (
            <div>{goodsInfo.currencySymbol}{text}</div>
          );
        },
      },
      {
        title: languageForOrder.SupplierShippingFee,
        dataIndex: 'referenceShipPrice',
        permission: 100026,
        classType:3,
        render: (text, record) => {
          return (
            <div>{goodsInfo.currencySymbol}{text}</div>
          );
        },
      },
      {
        title: languageForOrder.Quantity,
        dataIndex: 'count',
        classType:2,
      },
      {
        title: languageForOrder.Subtotal,
        dataIndex: 'subtotal',
        permission: 100023,
        classType:1,
        render: (text, record) => {
          return (
            <div>{goodsInfo.currencySymbol}{record.subtotal}</div>
          );
        },
      },
      // {
      //   title: languageForOrder.Warehouse,
      //   dataIndex: 'warehouse',
      //   classType: 3,
      // },
      {
        title: languageForOrder.Status,
        dataIndex: 'status',
        key: 'status',
        classType:2,
        render: (text, record) => {
          let status = '';
          switch (record.status) {
            case 0:
              status = languageForOrder.AwaitingPayment;
              break;
            case 1:
              status = languageForOrder.AwaitingShipping;
              break;
            case 2:
              status = languageForOrder.Shipped;
              break;
            case 3:
              status = languageForOrder.Canceled;
              break;
            case 4:
              status = languageForOrder.Received;
              break;
            case 5:
              status = languageForOrder.Refunded;
              break;
            default:
              status = '-';
              break;
          }
          return (
            <div>
              {status}
            </div>
          );
        },
      },
      {
        title: languageForOrder.Operation,
        dataIndex: 'action',
        className: 'tcenter',
        classType: 2,
        render: (text, record) => {
          let refund = null; // 退款
          let editorGoods = null; // 修改商品

          // <a onClick={this.showModalEditorGoods.bind(this, record)}>修改商品</a>

          if (record.status === 1 || record.status === 2 || record.status === 4) {
            refund = permission['100049'].status ? (
              <div>
                <a onClick={this.showModalRefund.bind(this, record)}>{languageForOrder.Refund}</a>
              </div>
            ) : '';
          }
          if (record.status === 1) {
            editorGoods = permission['100050'].status ? (
              <div>
                <a onClick={this.showModalEditorGoods.bind(this, record)}>{languageForOrder.EditProduct}</a>
              </div>
            ) : '-';
          } else {
            editorGoods = '-';
          }

          const result = !orderDetail.riskStatus ? (
            <div>
              {refund}
              {editorGoods}
            </div>
            ) : '-';

          return (
            <div>
              {result}
            </div>
          );
        },
      },
    ];
    orderListcolumns = tabbleColumnsControl(orderListcolumns,permission)

    return (
      <div className={styles.orderDetail}>
        <Card bordered={false} loading={loading}>
          <div className={styles.orderTitle}>
            <span className={styles.orderCancel} onClick={this.goBackEvent}><Icon type="left" /></span>
            <span>{languageForOrder.OrderNo} : {orderDetail.order_no}</span>
            <span>{languageForOrder.StatusOverview} : {orderDetail.order_status}</span>
          </div>
          <DescriptionList
            size="large"
            title={languageForOrder.ShippingInformation}
            style={{ marginBottom: 32 }}
            editor={permission['100052'].status===0 || orderDetail.riskStatus ? '' : (<a onClick={this.editorReceivingEvent}>{languageForOrder.Edit}</a> )}
          >
            <Description term={languageForOrder.Consignee}>{receiverInfo.receiver}</Description>
            <Description term={languageForOrder.ZipCode}>{receiverInfo.zip}</Description>
            <Description term={languageForOrder.EmailAddress}>{receiverInfo.email}</Description>


            <Description term={languageForOrder.Address}>{`${receiverInfo.address}, ${receiverInfo.city}, ${receiverInfo.region}, ${receiverInfo.country}`}</Description>
            <Description term={languageForOrder.TrackingNo}>{receiverInfo.shipping_no}</Description>
            <Description term={languageForOrder.TelephoneNo}>{receiverInfo.phone_number}</Description>
            <Description term={languageForOrder.TotalWeight}>{receiverInfo.weight}</Description>
            <Description term={languageForOrder.LogisticsType}>{receiverInfo.shipping_name}</Description>
            <Description term={languageForOrder.LogisticsTracking}>{receiverInfo.trackUrl}</Description>
            <Description term={languageForOrder.ShippingTime}>{receiverInfo.deliveryTime}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
          <DescriptionList size="large" title={languageForOrder.OrderInformation} style={{ marginBottom: 32 }}>
            <Description term={languageForOrder.Shopper}>{orderInfo.seller}</Description>
            <Description term={languageForOrder.Country}>{orderInfo.country}</Description>
            <Description term={languageForOrder.PaymentMethod}>{orderInfo.pay_type}</Description>
            <Description term={languageForOrder.TransactionNo}>{orderInfo.transaction_no}</Description>
            <Description term={languageForOrder.OrderTime}>{orderInfo.order_time}</Description>
            <Description term={languageForOrder.PaymentTime}>{orderInfo.pay_time}</Description>
            <Description term={languageForOrder.BillNo}>{orderInfo.paymentNo}</Description>
            {
              permission['100051'].status ? (<Description term={languageForOrder.PromoCode}>{orderInfo.couponCode}</Description>) : <span></span>
            }


          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
          <DescriptionList
            size="large"
            title={languageForOrder.ProductInformation}
            style={{ marginBottom: 32 }}
          >
            <Table
              columns={orderListcolumns}
              dataSource={goodsInfoGoods}
              pagination={false}
              needToGetWidth={true}
              loading={loading}
              rowKey="i"
              rowClassName={(record, index) => {
                if (record.status === 3) {
                  return styles.tableCancel;
                }
              }}
            />
            {
              this.props.global.rolePower.role === 2 ? (
              <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <span style={{ marginRight: 20 }}>{languageForOrder.Quantity}：{goodsInfo.count}</span>
                <span style={{ marginRight: 20 }}>{languageForOrder.ProductAmount}：{goodsInfo.total_price} </span>
                <span style={{ marginRight: 20 }}>{languageForOrder.DiscountAmount}：{goodsInfo.coupon} </span>
                <span style={{ marginRight: 20 }}>{languageForOrder.TotalShippingFee}: {goodsInfo.totalShipPrice}</span>
                <span style={{ marginRight: 20 }}>{languageForOrder.SupplyCost}: {goodsInfo.supplyTotal}</span>
                <span style={{ color: 'red' }}>{languageForOrder.AmountReceivable}: {goodsInfo.account_receivable}</span>
              </div>
                ) : (
                  <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <span style={{ marginRight: 20 }}>{languageForOrder.Quantity}：{goodsInfo.count}</span>
                    <span>{languageForOrder.SupplyCost}: {goodsInfo.supplyTotal}</span>
                  </div>)
            }
          </DescriptionList>

          {/* 详情-日志 */}
          <DescriptionList
            size="large"
            title={languageForOrder.OrderLog}
            style={{ marginBottom: 32 }}
          >
            <Table
              rowKey="i"
              columns={columnsLog}
              dataSource={this.props.orders && this.props.orders.orderDetailLog}
              pagination={false}
            />
          </DescriptionList>
        </Card>
        {/* 退款 */}
        <Modal
          title={languageForOrder.RefundApplication}
          visible={this.state.visibleRefund}
          onOk={this.handleOkRefund}
          onCancel={this.handleCancelRefund}
          className={styles.goodsDetailModal}
          key="refund"
          okText={languageForGlobal.Confirm}
          cancelText={languageForGlobal.Cancel}
        >
          <Form>
            <FormItem
              {...formItemLayoutRefund}
              label={languageForOrder.TransactionAmount}
            >
              {goodsInfo.currencySymbol}{this.props.orders.orderDetailItem && this.props.orders.orderDetailItem.subtotal}
            </FormItem>
            <FormItem
              {...formItemLayoutRefund}
              label={languageForOrder.RefundableAmount}
            >
              {goodsInfo.currencySymbol}{this.props.orders.orderDetailItem && this.props.orders.orderDetailItem.grandTotal}
            </FormItem>
            <FormItem
              {...formItemLayoutRefund}
              label={languageForOrder.ProductQuantity}
            >
              {this.props.orders.orderDetailItem && this.props.orders.orderDetailItem.count}
            </FormItem>
            <FormItem
              {...formItemLayoutRefund}
              label={languageForOrder.AmountRefunded}
            >
              {getFieldDecorator('amount', {
                rules: [
                  { required: true, message: languageForOrder.PleaseInputRefundAmount },
                  {
                    pattern:/^[\d]+\.{0,1}[\d]*$/,message: languageForMessage.enterValueOfNumber
                  }
                  ],
                // initialValue: (
                //   this.props.orders.orderDetailItem && this.props.orders.orderDetailItem.subtotal
                // ),
              })(
                <Input placeholder={languageForOrder.PleaseInputRefundAmount} />
              )}
            </FormItem>
            <FormItem
              {...formItemLayoutRefund}
              label={languageForOrder.SKUQuantity}
            >
              {getFieldDecorator('count', {
                rules: [
                    { required: true, message: languageForOrder.PleaseInputQuantity },
                    { pattern: /^\d+$/g, message: languageForMessage.PleaseInputInteger, }
                  ],
                // initialValue: (
                //   this.props.orders.orderDetailItem && this.props.orders.orderDetailItem.count
                // ),
              })(
                <Input placeholder={languageForOrder.PleaseInputQuantity} />
              )}
            </FormItem>
            <FormItem
              {...formItemLayoutRefund}
              label={languageForOrder.Remarks}
            >
              {getFieldDecorator('remark', {
                rules: [{ required: true, message: languageForOrder.PleaseInputRemarks }],
              })(
                <Input maxLength="50" placeholder={languageForOrder.PleaseInputRemarks} />
              )}
            </FormItem>
            <FormItem
              label={languageForOrder.Kindly}
              {...formItemLayoutRefund}
              className={styles.careful}
            >
              <span>
                {languageForOrder.KindlyReminderRefund}
              </span>
            </FormItem>
          </Form>
        </Modal>


        {/* 修改商品 */}
        <Modal
          title={languageForOrder.EditProduct}
          visible={this.state.visibleEditorGoods}
          onOk={this.handleOkEditorGoods}
          onCancel={this.handleCancelEditorGoods}
          className={styles.goodsDetailModal}
          key="editor"
          okText={languageForGlobal.Confirm}
          cancelText={languageForGlobal.cancel}
        >
          <FormItem
            // label="&nbsp;"
            {...formItemLayout}
            className={styles.careful}
          >
            <span style={{ color: '#999' }}>
              {languageForOrder.OriginalOrder} : ( {originalInfo.property_names} ) * {orders.orderDetailItem && orders.orderDetailItem.count}
            </span>
          </FormItem>
          {this.templateOthersInfo()}
          <FormItem
            {...formItemLayout}
            label={languageForOrder.Remarks}
          >
            {getFieldDecorator('remark', {
              rules: [{ required: true, message: languageForOrder.PleaseInputRemarks }],
            })(
              <Input maxLength="50" placeholder={languageForOrder.PleaseInputRemarks} />
            )}
          </FormItem>
          <FormItem
            // label="&nbsp;"
            {...formItemLayout}
            className={styles.careful}
          >
            <div
              style={{
                color: '#999',
                  fontSize: '12px',
                }}
            >
              <div>{languageForOrder.KindlyReminderPrice[0]}</div>
              <div>{languageForOrder.KindlyReminderPrice[1]}</div>
              <div>{languageForOrder.KindlyReminderPrice[2]}</div>
            </div>
          </FormItem>
        </Modal>
        {/*编辑收货信息*/}
        <ReceiptInfomation
          visible={this.state.editorReceiving}
          onShowModal={this.showModal}
          onSucceed={this.loadData}
          onSetValue={this.handleSetValue}
          defaultValue={this.state.receiptInfoDefaultValue}
        />
      </div>
    );
  }
}
