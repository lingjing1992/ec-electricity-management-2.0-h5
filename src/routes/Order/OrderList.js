/**
 * Created by xujunchao on 2017/11/2.
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { routerRedux, Link } from 'dva/router';
import Cookies from "js-cookie";
import { getQueryString, setApiHost, tabbleColumnsControl, downloadUrl } from '../../utils/utils';

import {
    Button,
    Form,
    Input,
    Icon,
    Select,
    Tabs,
    DatePicker,
    Menu,
    Dropdown,
    Modal,
    Radio,
    Upload,
    Progress, 
    notification,
    message,
    Tooltip,
    Card
} from 'antd';
import Result from '../../components/Result';
import styles from './OrderList.less';
import reqwest from 'reqwest';
import Table from '../../components/table';
import ModalForm from '../../components/modalForm';
//import Charts from 'ant-design-pro/lib/Charts';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search, TextArea } = Input;
const RadioGroup = Radio.Group;
moment.locale('zh-cn');

@connect(state => ({
    login: state.login,
    orders: state.orders,
    global: state.global,
}))
@Form.create()
export default class OrderList extends Component {
    state = {
        exportOrder: false, // 导出订单
        type: 'order',
        downloadOrderDatas: [],
        handerFlag: true,
        visibleImportFile: false,
        exporType: '0',//导入类型
        fileList: [], // 导入
        uploadSize: 0,
        uploading: false, // 导入
        uploadMsg: null, // 导入错误信息
        visibleUploadMsg: null, // 导入信息
        errorUploadSpus: [], // 错误信息
        errorShipErrors: [], // 错误物流信息
        uploadTime: null, // 开启3秒定时器，返回成功的时候关闭成功窗口
        percent: 0,//进度条的值
        showAdvancedSearch: false, // 展示高级搜索
        query: getQueryString(this.props.location.search) || '',
        visibleEditorStatus: false,  //填写发货信息
        visibleShipNosTip: false,  //物流单号出错提示
        isCheckShip: 1,  //是否检查物流单号  0-不检查, 1-检查
        orderNo: '', //订单号
        payTime: '',//订单支付时间
        shippingTypes: [],//物流类型
        permission: this.props.global.rolePower.modules['1002'].moduleSubs['10004'].moduleFunctions,//权限值
        remarkOrderVisble: false,//标记风险订单弹窗控制
        RiskOrderParams: {},//需要标记或者删除的风险订单参数
        riskOrderPromit: '',//风订单标记或者取消的提示
        modifyShippingVisble: false,//修改物流信息弹窗控制
        modifyShippingParams: {
            shippingType: '',
            shippingNo: '',
        },
        shippingPromit: [],//发货日期
        order_status: -1,//订单状态
        importOrderVisile: false,//导出订单弹窗
        importOrders: [],//需要导出订单的信息
    }

    componentWillMount() {
        const { type, query } = this.state;
        this.downloadOrdersType();
        this.getOrderSellers();
        this.getOrderFupplier();
        this.getPayTypes();
        this.getLocals();
        this.getOrderSourceType();
        this.getShippingNames();
        this.props.dispatch({
            type: `orders/${type}PushTabId`,
            payload: parseInt(query.tab_id) || -1,
            callback: () => {
                this.loadData();
            },
        });
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'orders/clear',
            payload: null,
        });
    }

    // 搜索条件---获得商家列表
    getOrderFupplier = () => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}GetOrderFupplier`,
            payload: { tab_id: 1 },
        });
    }
    // 搜索条件---获得商家列表
    getOrderSellers = () => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}GetOrderSellers`,
            payload: { tab_id: 2 },
        });
    }
    // 搜索条件---获得国家列表
    getLocals = () => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}GetLocals`,
        });
    }
    // 搜索条件---获得国家列表
    getOrderSourceType = () => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}GetOrderSourceType`,
        });
    }
    // 搜索条件---获得支付方式
    getPayTypes = () => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}GetPayTypes`,
        });
    }
    // 导出订单类型
    downloadOrdersType = () => {
        this.props.dispatch({
            type: "orders/downloadOrdersType",
        })
    }
    //订单导出弹窗控制
    handleImportOrderVisile = (boolean) => {
        this.setState({
            importOrderVisile: boolean
        })
    }
    // 订单批量导出
    downloadOrders = () => {
        const { downloadOrderDatas } = this.state;
        if (downloadOrderDatas.length === 0) {
            notification.error({
                message: this.props.global.languageDetails.order.OrderManagement.leastoneorder,
            });
        } else {
            // this.commonDownloadOrders(downloadOrderDatas);
            this.handleImportOrderVisile(true);
        }
    }
    // 公用的订单导出方法
    commonDownloadOrders = (params) => {
        const { type, downloadOrderDatas } = this.state;
        const { orders } = this.props;
        Cookies.set('ImportType', params.type);
        if (downloadOrderDatas.length > 0) {
            this.props.dispatch({
                type: `orders/${type}DownloadOrders`,
                payload: {
                    type: params.type,
                    order_nos: downloadOrderDatas,
                    status: parseInt(orders.pushData.tab_id),
                },
                callback: (response) => {
                    const downloadLink = response.data.url;
                    this.handleImportOrderVisile(false);
                    downloadUrl(downloadLink)
                },
            });
        }
    }
    // 加载数据
    loadData = (loadType) => {
        const { type } = this.state;
        const { orders } = this.props;
        const { keyword, supplier, seller, country } = orders.pushData;
        const payType = orders.pushData.pay_type;
        const startTime = orders.pushData.start_time;
        const endTime = orders.pushData.end_time;

        console.log('loadType', loadType);

        // const tepObj = {};
        // 搜索功能时，重置页码为1 暂时用这种比较挫的方法，后面要改
        switch (loadType) {
            case 'search':
                if (keyword || supplier || seller || country || startTime || endTime || payType) {
                    orders.pushData.page_num = 1;
                }
                break;
            case 'fiterChange':
                orders.pushData.page_num = 1;
                break;
            default:
        }
        this.props.dispatch({
            type: `orders/${type}GetList`,
            payload: orders.pushData,
        });
    }
    //获取物流信息
    getShippingNames = () => {
        this.props.dispatch({
            type: `orders/orderPushGetShippingNames`,
            callback: (data) => {
                if (data.status === 200) {
                    this.setState({
                        shippingTypes: data.data.shippingTypes,
                    })
                }
            }
        });
    }
    // 搜索
    searchEvent = () => {
        this.loadData('search');
    }
    // 高级搜索
    advancedSearchEvent = () => {
        const { showAdvancedSearch } = this.state;
        this.setState({
            showAdvancedSearch: !showAdvancedSearch,
        });
    }
    // 查询
    commitQuery = () => {
        this.loadData('search');
    }
    // 重置
    handleReset = () => {
        const { type } = this.state;
        this.props.form.resetFields();
        this.props.dispatch({
            type: `orders/${type}Reset`,
            callback: () => {
                this.loadData();
            },
        });
    }
    // 国家改变
    changeLocal = (value) => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}PushLocal`,
            payload: value,
            callback: () => {
                this.loadData('fiterChange');
            },
        });
    }
    // 支付类型改变
    changePayType = (value) => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}PushPayType`,
            payload: value,
            callback: () => {
                this.loadData('fiterChange');
            },
        });
    }
    // 支付时间改变
    changePayTime = (value) => {
        const { type } = this.state;
        if (value.length > 0) {
            this.props.dispatch({
                type: `orders/${type}PushStartTime`,
                payload: moment(value[0]).format('YYYY-MM-DD hh:mm:ss'),
            });
            this.props.dispatch({
                type: `orders/${type}PushEndTime`,
                payload: moment(value[1]).format('YYYY-MM-DD hh:mm:ss'),
            });
        } else {''
            this.props.dispatch({
                type: `orders/${type}PushStartTime`,
                payload: '',
            });
            this.props.dispatch({
                type: `orders/${type}PushEndTime`,
                payload: '',
            });
        }
        this.loadData('fiterChange');
    }
    // 商家改变
    changeSeller = (value) => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}PushSeller`,
            payload: value,
            callback: () => {
                this.loadData('fiterChange');
            },
        });
    }
    // 供应商改变
    changeSupplier = (value) => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}PushFupplier`,
            payload: value,
            callback: () => {
                this.loadData('fiterChange');
            },
        });
    }
    // 订单来源
    changeSourceType = (value) => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}PushSourceType`,
            payload: value,
            callback: () => {
                this.loadData('fiterChange');
            },
        });
    }
    // 重置页码
    handleResetPages = () => {
        const { type } = this.state;
        this.props.dispatch({
            type: `orders/${type}ResetPages`,
        });
    }
    // 处理操作
    handleMenuClick = (record, e) => {
        const { type } = this.state;
        const { orders } = this.props;
        const { setFieldsValue } = this.props.form;
        const languageForMessage = this.props.global.languageDetails.message;
        const languageForOrder = this.props.global.languageDetails.order.OrderManagement;
        this.props.dispatch({
            type: `orders/${type}OperationItem`,
            payload: record,
        });
        switch (e.key) {
            case '1':
                // 详情
                this.props.dispatch(routerRedux.push({
                    pathname: '/order/orderDetail',
                    search: `?order_no=${record.order_no}&tab_id=${orders.pushData.tab_id}&page_num=${orders.pushData.page_num}&page_size=${orders.pushData.page_size}`,
                }));
                break;
            case '2':
                // 编辑
                this.props.dispatch(routerRedux.push({
                    pathname: '/order/orderDetail',
                    query: {
                        order_no: record.order_no,
                    },
                }));
                break;
            case '3':
                // 导出
                this.showModalExport(record);
                break;
            case '4':
                this.clearDeliveryInfo();
                // 发货
                this.setState({
                    isCheckShip: 1,
                    visibleEditorStatus: true,
                    orderNo: record.order_no,
                    payTime: record.pay_time,
                    shippingPromit: [
                        languageForOrder.WhenTheTracking,
                    ],
                    orderStatus: record.order_status,
                });
                // this.orderSendGoods(record);
                break;
            case '5':
                // 取消
                this.orderCannal(record);
                break;
            case '6':
                // 退货
                this.orderReturnGoods(record);
                break;
            case '7':
                // 标记为风险订单
                this.setState({
                    remarkOrderVisble: true,
                    RiskOrderParams: {
                        orderNo: record.order_no,
                        riskStatus: true,
                    },
                    riskOrderPromit: `${languageForMessage.MarkAsRiskOrder[0]}${record.order_no}${languageForMessage.MarkAsRiskOrder[1]}`,
                })
                break;
            case '8':
                // 取消标记为风险订单
                this.setState({
                    remarkOrderVisble: true,
                    RiskOrderParams: {
                        orderNo: record.order_no,
                        riskStatus: false,
                    },
                    riskOrderPromit: `${languageForMessage.UnmarkAsRiskOrder[0]}${record.order_no}${languageForMessage.UnmarkAsRiskOrder[1]}`,
                })
                break;
            case '9':
                this.props.dispatch({
                    type: 'orders/getOrderShippingNo',
                    payload: {
                        orderNo: record.order_no,
                    },
                    callback: (data) => {
                        if (data.status === 200) {
                            this.clearDeliveryInfo();
                            // 修改发货信息
                            this.setState({
                                isCheckShip:1,
                                visibleEditorStatus: true,
                                orderNo: record.order_no,
                                payTime: record.pay_time,
                                shippingPromit: languageForOrder.shippingPromit,
                                orderStatus: record.order_status,
                            });
                            // console.log(moment(data.data.deliveryTime).format('YYYY-MM-DD'))
                            setFieldsValue({
                                type: data.data.type,
                                oddNumbers: data.data.shipNo || '',
                                links: data.data.trackLink,
                                deliveryTime: moment(data.data.deliveryTime),
                            })
                        }
                    }
                })

            default:
        }
    }
    // 标记或取消风险订单
    operationToRiskOrder = () => {
        const languageForOrder = this.props.global.languageDetails.order.OrderManagement;
        const { RiskOrderParams } = this.state;
        this.props.dispatch({
            type: 'orders/updateRisk',
            payload: RiskOrderParams,
            callback: (data) => {
                if (data.status === 200) {
                    this.loadData();
                    this.setState({
                        remarkOrderVisble: false
                    })
                    if (RiskOrderParams.riskStatus) {
                        message.success(`${RiskOrderParams.orderNo}${languageForOrder.HasBeenMarked}`);
                    } else {
                        message.success(`${RiskOrderParams.orderNo}${languageForOrder.OrderIsBackToNormal}`);
                    }
                }
            }
        })
    }
    //取消发货地址弹窗
    handleCancelEditorStatus = (e) => {
        this.setState({
            visibleEditorStatus: false,
        });
    }
    //确认发货
    handleOkEditorStatus = (e) => {
        const { type, orderNo, payTime, isCheckShip, orderStatus } = this.state;
        const { orders } = this.props;
        const { getFieldValue } = this.props.form;
        const languageForMessage = this.props.global.languageDetails.message;
        const languageForOrder = this.props.global.languageDetails.order.OrderManagement;
        this.props.form.validateFields(['type', 'oddNumbers', 'links', 'deliveryTime'], (err) => {
            const deliveryTime = getFieldValue('deliveryTime');
            // console.log(deliveryTime);
            // return;
            if (!err) {
                var oddNumbers = getFieldValue('oddNumbers').trim();
                if (oddNumbers.indexOf("，") > -1) {
                    this.props.form.setFields({
                        oddNumbers: {
                            value: getFieldValue('oddNumbers'),
                            errors: [new Error(languageForMessage.beSeparatedWithCommas)],
                        },
                    });
                    return;
                }
                if (new Date(deliveryTime).getTime() + 86400000 < new Date(payTime).getTime()) {
                    notification.error({
                        message: languageForMessage.KindlyReminder,
                        description: languageForOrder.shippingTime,
                    });
                    return;
                }
                console.log(orderStatus);
                if (orderStatus == 1) {
                    var record = {
                        isCheckShip: isCheckShip,
                        order_no: orderNo,
                        type: getFieldValue('type').trim(),
                        shipNo: oddNumbers,
                        trackLink: getFieldValue('links').trim(),
                        order_status: 2,
                        deliveryTime: moment(deliveryTime).format('YYYY-MM-DD'),
                    }
                    var dispatchType = `orders/${type}PushUpdateSpuStatus`;
                } else {
                    var record = {
                        isCheckShip: isCheckShip,
                        orderNo: orderNo,
                        type: getFieldValue('type').trim(),
                        shipNo: oddNumbers,
                        trackLink: getFieldValue('links').trim(),
                        deliveryTime: moment(deliveryTime).format('YYYY-MM-DD'),
                    }
                    var dispatchType = 'orders/updateShippingNo';
                }

                this.orderSendGoods(record, dispatchType);
                // console.log(record)
            }
        });
    }
    //清空发货信息
    clearDeliveryInfo = () => {
        const { setFieldsValue } = this.props.form;
        setFieldsValue({
            type: '',
            oddNumbers: '',
            links: '',
            deliveryTime: '',
            payTime: '',
        })
    }
    //物流单号出错忽略并提交
    handleOkShipNosTip = (e) => {
        this.setState({
            isCheckShip: 0,
            visibleShipNosTip: false,
            visibleEditorStatus: false,
        });
        setTimeout(() => {
            this.handleOkEditorStatus();
        })
    }
    //物流单号出错取消
    handleCanceShipNosTip = (e) => {
        this.setState({
            visibleShipNosTip: false,
        });
    }
    // 发货
    orderSendGoods(record, dispatchType) {
        // const { type, orderStatus} = this.state;
        const languageForOrder = this.props.global.languageDetails.order.OrderManagement;
        this.props.dispatch({
            type: dispatchType,
            payload: record,
            callback: (response) => {
                let responseData = response.data;
                if (responseData && responseData.hasOwnProperty('errorShipNos')) {
                    this.setState({
                        visibleShipNosTip: true,
                    });
                    this.props.form.setFields({
                        oddNumbers: {
                            value: record.shipNo,
                            errors: [new Error(languageForOrder.PleaseCheck + responseData.errorShipNos)],
                        },
                    });
                } else {
                    this.setState({
                        isCheckShip: 1,
                        visibleEditorStatus: false,
                    });
                    this.loadData();
                }
            },
        });
    }
    // 取消
    orderCannal(record) {
        const { type } = this.state;
        const pushData = {
            order_no: record.order_no,
            order_status: 3,
        };
        this.props.dispatch({
            type: `orders/${type}PushUpdateSpuStatus`,
            payload: pushData,
            callback: () => {
                this.loadData();
            },
        });
    }
    // 退款
    orderReturnGoods(record) {
        const { type } = this.state;
        const pushData = {
            order_no: record.order_no,
            order_status: 5,
        };
        this.props.dispatch({
            type: `orders/${type}PushUpdateSpuStatus`,
            payload: pushData,
            callback: () => {
                this.loadData();
            },
        });
    }
    // 导出
    showModalExport = (orders) => {
        const orderNos = [];
        orderNos.push(orders.order_no);
        this.setState({
            downloadOrderDatas: orderNos,
        })
        this.handleImportOrderVisile(true);

        // this.commonDownloadOrders(orderNos);
    }
    // 选择模板后导出，一期废除
    //  handleOkExport = (e) => {
    //    e.preventDefault();
    //    this.props.form.validateFields((err, values) => {
    //      if (!err) {
    //        console.log('Received values of form: ', values);
    //        this.setState({
    //          exportOrder: false,
    //        });
    //        this.downloadOrders();
    //      }
    //    });
    //  }
    handleCancelExport = () => {
        this.setState({
            exportOrder: false,
        });
    }
    // 导入发货信息
    showModalImportFile = () => {
        this.setState({
            visibleImportFile: true,
            errorUploadSpus: [],
            errorShipErrors: [],
            percent: 0,
            isCheckShip: 1,
        });
    }
    //下载发货信息模板
    downloadGoods = () => {
        const downloadLink = 'http://cdn.batmobi.net/ec/common/20180412/1523522325579_PxySL.xlsx';
        downloadUrl(downloadLink);
    }
    //上传
    handleOkExamine = (e) => {
        // console.log(e);
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const { getFieldValue } = this.props.form;
                const { type } = this.state;
                const { goods } = this.props;
                // goods.operationItem.spu_id;
                const pushData = {
                    data: {
                        spu_id: goods.operationItem.spu_id,
                        result: getFieldValue('auditingResult'),
                        reason: getFieldValue('auditingReason'),
                    },
                };
                this.props.dispatch({
                    type: `goods/${type}PushAuditing`,
                    payload: pushData,
                });
                this.setState({
                    visibleExamine: false,
                });
            }
        });
    }
    //上传取消
    handleCancelExamine = () => {
        // console.log(e);
        this.setState({
            visibleExamine: false,
        });
    }
    //上传
    handleUpload = () => {
        const { fileList, exporType, uploadSize, isCheckShip } = this.state;
        const formData = new FormData();
        const languageForMessage = this.props.global.languageDetails.message;
        // const uploadMax = 1024 * 1024 * 8; // 8M
        // let isUploadMax = false; // 是否大于8M

        // console.log('fileList', fileList);
        // if(fileList.)

        // 这里返回大于 uploadMax 的数量。[File(739595), File(7198965), File(739595)]
        // const filtered = fileList.filter((item) => {
        //   return item.size > uploadMax;
        // });
        // console.log('filtered', filtered);
        // if (filtered.length <= 0) {
        this.setState({
            progressShow: true,
        })
        this.setProgress(parseInt(100 * uploadSize));
        fileList.forEach((file) => {
            formData.append('uploadFile', file);
        });
        this.setState({
            uploading: true,
        });
        // You can use any AJAX library you like
        reqwest({
            url: `${setApiHost()}/api/merchant/v1/order/uploadShipNos?isCheckShip=${isCheckShip}`,
            method: 'post',
            processData: false,
            data: formData,
            success: (res) => {
                const _this = this;
                _this.setState({
                    percent: 100,
                })
                clearInterval(_this.state.mytimer);
                setTimeout(() => {
                    _this.setState({
                        progressShow: false,
                    })
                    if (res.status !== 200) {
                        if (res.data && res.data.errors.length > 0) {
                            _this.setState({
                                fileList: [],
                                uploading: false,
                                errorUploadSpus: res.data.errors,
                            });
                        } else {
                            _this.setState({
                                fileList: [],
                                uploading: false,
                            });
                        }
                        //有物流号错误信息
                        if (res.data && res.data.shipErrors.length > 0) {
                            _this.setState({
                                errorShipErrors: res.data.shipErrors,
                            });
                            //没有必改errors
                            if (res.data.errors.length == 0) {
                                //改变btn可点击状态
                                _this.setState({
                                    fileList: fileList,
                                    isCheckShip: 0,
                                });
                            } else {
                                // _this.setState({
                                //   errorShipErrors: res.data.shipErrors,
                                // });
                            }
                        } else {

                        }
                        notification.error({
                            message: languageForMessage.KindlyReminder,
                            description: res.msg,
                        });

                    } else {
                        console.log('res', res);
                        _this.setState({
                            fileList: [],
                            uploading: false,
                            uploadMsg: res.msg,
                            visibleUploadMsg: true, // 成功的时候，成功弹出层跳出来。
                            visibleImportFile: false, // 导入的弹出层关闭。
                        });
                        _this.state.uploadTime = setTimeout(() => {
                            _this.setState({
                                visibleUploadMsg: false,
                            });
                            _this.loadData();
                        }, 3000);
                        // notification.success({
                        //   message: '提示',
                        //   description: res.msg,
                        // });
                        // message.success('upload successfully.');
                    }
                }, 200)

            },
            error: (res) => {
                const _this = this;
                _this.setState({
                    percent: 100,
                });
                clearInterval(_this.state.mytimer);
                setTimeout(() => {
                    _this.setState({
                        uploading: false,
                        progressShow: false,
                    })
                    // message.error('upload failed.');
                    notification.error({
                        message: languageForMessage.KindlyReminder,
                        description: res.msg,
                    })
                }, 200)
            },
        });
        // } else {
        //   notification.error({
        //     message: '提示',
        //     description: '文件大小不能超过8M',
        //   });
        // }
    }
    //上传成功提醒
    handleOkUploadMsg = (e) => {
        // 如果点击了，直接去掉定时器
        clearTimeout(this.state.uploadTime);
        this.loadData();
        this.setState({
            visibleUploadMsg: false,
        });
    }
    //关闭上传成功提示
    handleCancelUploadMsg = (e) => {
        clearTimeout(this.state.uploadTime);
        this.loadData();
        this.setState({
            visibleUploadMsg: false,
        });
    }
    handleOkImportFile = (e) => {
        // console.log(e);
        e.preventDefault();
        this.setState({
            visibleImportFile: false,
        });
    }
    //导入弹窗取消
    handleCancelImportFile = () => {
        // console.log(e);
        this.setState({
            visibleImportFile: false,
        });
    }
    //设置进度条
    setProgress = (time) => {
        const { mytimer } = this.state;
        const _this = this;
        clearInterval(this.state.mytimer);
        const newTimer = setInterval(() => {
            const cuurentPercent = _this.state.percent;
            let addNum;
            if (cuurentPercent == 99) {
                clearInterval(_this.state.mytimer);
                return;
            }
            if (cuurentPercent < 70) {
                addNum = parseInt((100 - cuurentPercent) * Math.random() / 10);
            } else if (cuurentPercent < 90) {
                addNum = parseInt((100 - cuurentPercent) * Math.random() / 3);
            } else {
                addNum = parseInt((100 - cuurentPercent) * Math.random());
            }
            if (addNum > 5) {
                addNum = 5;
            }
            let newPercent = cuurentPercent + addNum;
            _this.setState({
                percent: newPercent,
            })
        }, time)

        this.setState({
            mytimer: newTimer,
        })
    }
    //修改物流信息
    modifyShippingInfo = () => {
        const { modifyShippingParams } = this.state;
        const { getFieldsValue } = this.props.form;
        const shippingParams = getFieldsValue(['shippingNo', 'shippingType'])
        if (modifyShippingParams.shippingNo == shippingParams.shippingNo && modifyShippingParams.shippingType == shippingParams.shippingType && shippingParams.shippingNo && shippingParams.shippingType) {
            this.setState({
                modifyShippingVisble: true,
            })
        } else {

        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { type, uploading, permission, query, riskOrderPromit, modifyShippingParams, errorUploadSpus, errorShipErrors, } = this.state;
        const { orders: { loading, ordersType } } = this.props;
        const { orders } = this.props;
        const selectAllowClear = true; // 支持清除选中的select
        const languageForMessage = this.props.global.languageDetails.message;
        const languageForGlobal = this.props.global.languageDetails.global;
        const languageForOrder = this.props.global.languageDetails.order.OrderManagement;
        const operation = {
            details: {
                title: languageForOrder.Details,
                key: 1
            },
            cancel: {
                title: languageForGlobal.cancel,
                key: 5
            },
            riskOrder: {
                title: languageForOrder.MarkAsRiskOrder,
                key: 7
            },
            modifyShipping: {
                title: languageForOrder.ModifyDeliveryinfo,
                key: 9
            }
        }
        const orderListStatus = {
            title: languageForOrder.Status,
            dataIndex: 'order_status',
            classType: 1,
            render: (text, record) => {
                let result = '';
                switch (record.order_status) {
                    case '0':
                        // 待支付
                        result = languageForOrder.Unpaid;
                        break;
                    case '1':
                        // 待发货
                        result = languageForOrder.AwaitingShipping;
                        break;
                    case '2':
                        // 已发货
                        result = languageForOrder.Shipped;
                        break;
                    case '3':
                        // 已取消
                        result = languageForOrder.Canceled;
                        break;
                    case '4':
                        // 已收货
                        result = languageForOrder.Received;
                        break;
                    case '5':
                        // 已退款
                        result = languageForOrder.Refunded;
                        break;
                    case '6':
                        // 标记风险订单
                        result = languageForOrder.RiskOrder;
                        break;
                }
                return (
                    <div>{result}</div>
                );
            },
        };
        let orderListcolumns = [
            {
                title: languageForOrder.Operation,
                dataIndex: 'operation',
                className: 'tcenter',
                classType: 1,
                render: (text, record) => {
                    let result = [];
                    //          const { permission } = this.state;
                    switch (record.order_status) {
                        case '-1':
                            // 所有订单
                            result = [
                                operation.details,
                                // { title: '编辑', key: 2 },
                                operation.cancel,
                                // { title: '退款', key: 6 },
                            ];
                            permission['100013'].status ? result.splice(1, 0, { title: languageForOrder.Shipping, key: 4 }) : ''
                            break;
                        case '0':
                            // 待支付
                            result = [
                                operation.details,
                                // { title: '编辑', key: 2 },
                                // operation.cancel,
                            ];
                            break;
                        case '1':
                            // 待发货
                            result = [
                                operation.details,
                                // { title: '编辑', key: 2 },
                                // { title: '退款', key: 6 },
                            ];
                            //发货信息填写
                            permission['100013'].status && !record.riskStatus ? result.splice(1, 0, {
                                title: languageForOrder.Shipping,
                                key: 4
                            }) : '';
                            //标记为风险订单
                            permission['100053'].status ? result.push(operation.riskOrder) : '';
                            break;
                        case '2':
                            // 已发货
                            result = [
                                operation.details,
                                // { title: '退款', key: 6 },
                            ];
                            permission['100013'].status ? result.push(operation.modifyShipping) : '';
                            break;
                        case '3':
                            // 已取消
                            result = [
                                operation.details,
                            ];
                            break;
                        case '4':
                            // 已收货
                            result = [
                                operation.details,
                                // { title: languageForOrder.Refundeding, key: 6 },
                            ];
                            break;
                        case '5':
                            // 已退款
                            result = [
                                { title: languageForOrder.Details, key: 1 },
                            ];
                            break;
                        default:
                    }
                    if (record.riskStatus) {
                        // 取消标记风险订单
                        permission['100053'].status ? result = [
                            {
                                title: languageForOrder.UmmarkRiskOrder,
                                key: 8
                            },
                        ] : ''
                    }
                    permission['100020'].status ? result.push({ title: languageForOrder.Export, key: 3 }) : '';
                    return (
                        <div>
                            <Dropdown
                                overlay={(
                                    <Menu onClick={this.handleMenuClick.bind(this, record)}>
                                        {
                                            result.map((items) => {
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
                        </div>
                    );
                },
            },
            {
                title: languageForOrder.OrderID,
                dataIndex: 'order_no',
                classType: 4,
                render: (text, record) => {
                    const { orders } = this.props;
                    return (
                        <div>
                            <Link style={{ position: 'relative', }} to={{
                                pathname: '/order/orderDetail',
                                search: `?order_no=${record.order_no}&tab_id=${orders.pushData.tab_id}&page_num=${orders.pushData.page_num}&page_size=${orders.pushData.page_size}`,
                            }}
                            >{text}<br />
                                {record.riskStatus ? (<span className={styles.riskStatus}>{languageForOrder.Risk}</span>) : ''}
                            </Link>
                        </div>
                    );
                },
            },
            {
                title: languageForOrder.Source,
                dataIndex: 'source',
                classType: 2,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.UserEmail,
                dataIndex: 'email',
                classType: 5,
                render: (text) => {
                    return (
                        <Tooltip placement="top" title={text}>
                            <div className="ellipsis">{text}</div>
                        </Tooltip>
                    )
                }
            },
            {
                title: languageForOrder.SupplyCost,
                dataIndex: 'supplyTotal',
                permission: 100015,
                classType: 2,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.TotalAmount,
                dataIndex: 'total_price',
                permission: 100016,
                classType: 2,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.PaymentAmount,
                dataIndex: 'payment',
                permission: 100017,
                classType: 2,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.ActualShippingCost,
                dataIndex: 'ship_price',
                permission: 100048,
                classType: 2,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.Shopper,
                dataIndex: 'seller',
                classType: 3,
                permission: 100018,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.Supplier,
                dataIndex: 'supplier',
                permission: 100019,
                classType: 3,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.Country,
                dataIndex: 'local',
                classType: 3,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.OrderTime,
                dataIndex: 'order_time',
                classType: 3,
                render: (text) => {
                    return (
                        <div>{text}</div>
                    )
                }
            },
            {
                title: languageForOrder.PaymentTime,
                dataIndex: 'pay_time',
                classType: 3,
                render: (text) => {
                    return (
                        <div>{text || '-'}</div>
                    );
                },
            },
            { title: languageForOrder.PaymentMethod, dataIndex: 'pay_type_name', classType: 4, },
            {
                title: languageForOrder.TransactionNo,
                dataIndex: 'transaction_no',
                classType: 4,
                render: (text) => {
                    return (
                        <div>{text || '-'}</div>
                    );
                },
            },
            {
                title: languageForOrder.BillNo,
                dataIndex: 'paymentNo',
                classType: 4,
                render: (text) => {
                    return (
                        <div>{text || '-'}</div>
                    );
                },
            },
        ];
        const tab_id = query.tab_id || orders.pushData.tab_id;
        // 所有订单列表新增状态栏
        if (tab_id == -1) {
            orderListcolumns.splice(2, 0, orderListStatus);
        }
        //上一次订单导出类型获取
        const ImportType = Cookies.get('ImportType') ? Number(Cookies.get('ImportType')) : undefined;
        //订单参数
        const orderResoure = [
            {
                type: 2,//文本选择框Select
                title: languageForOrder.TypesOfERP,
                placeholder: [languageForOrder.selectType],
                rules: [{
                    message: languageForOrder.selectType,
                    required: true,
                }],
                key: "type",
                select: {
                    key: 'id',
                    name: 'name',
                    arr: ordersType
                },
                initialValue: ImportType,
            },
            {
                type: 5,//复选按钮checkbox
                title: languageForOrder.Tips,
                key: "text",
                text: (
                    <span>
                        {languageForOrder.tipsText[0]}<br />
                        {languageForOrder.tipsText[1]}<br />
                        {languageForOrder.tipsText[2]}
                    </span>),
            }
        ]
        // 顶部导航条事件处理
        const handerTabsCallback = (key) => {
            const { type, handerFlag, orderListStatus } = this.state;
            this.handleResetPages(); // 点击导航栏重置页码
            if (key === '-1') {
                this.state.handerFlag = true;
                // orderListcolumns.splice(2, 0, orderListStatus);
            } else if (handerFlag) {
                // orderListcolumns.splice(2, 1);
                this.state.handerFlag = false;
            }
            //清空选择
            this.setState({
                downloadOrderDatas: [],
            })
            this.props.dispatch({
                type: `orders/${type}PushTabId`,
                payload: key,
                callback: () => {
                    this.loadData();
                },
            });
        }
        const importDeliveryinfoProps = {
            name: 'uploadFile',
            action: `${setApiHost()}/api/merchant/v1/spu/uploadSpus`,
            accept: 'aplication/zip',
            onRemove: (file) => {
                this.setState(({ fileList }) => {
                    const index = fileList.indexOf(file);
                    const newFileList = fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            onChange: (info) => {
                if (info.file.status === 'error') {
                    this.setState({
                        progressShow: false,
                        percent: 0,
                    })
                } else if (info.file.status === 'done') {
                    this.setState({
                        percent: 100,
                    })
                } else if (info.file.status === 'removed') {
                    this.setState({
                        progressShow: false,
                        percent: 0,
                    })
                }
                //上传完成提交服务器
                setTimeout(() => {
                    this.handleUpload();
                }, 10)
            },
            beforeUpload: (file, fileList) => {
                // const isZip = file.type === 'application/x-zip-compressed';
                const uploadSize = file.size / 1024 / 1024;
                const uploadMax = uploadSize < 8;
                if (!uploadMax) {
                    notification.error({
                        message: languageForMessage.KindlyReminder,
                        description: languageForMessage.Maximumfiles,
                    });
                } else {
                    // 上传多个
                    // this.setState(({ fileList }) => ({
                    //   fileList: [...fileList, file],
                    // }));
                    // 上传单个
                    this.setState(() => ({
                        fileList: [file],
                    }));
                    this.setState({
                        uploadSize: uploadSize,
                    })
                    return false;
                }
                return uploadMax;
            },
            fileList: this.state.fileList,
            data: {
                siteType: 1,
            },
        };
        //导入发货信息出错提示表格
        const columnsErrorUploadSpusTable = [
            {
                title: languageForGlobal.serialNo,
                dataIndex: 'xuhao',
                render: (text, record, index) => {
                    console.log('record', record);
                    return (
                        <div>{index + 1}</div>
                    );
                },
            },
            {
                title: languageForGlobal.locationError,
                dataIndex: 'errorPath',
            },
            {
                title: languageForGlobal.errorReason,
                dataIndex: 'errorMsg',
            },
        ];
        //导入发货信息物流单号出错提示表格
        const columnsErrorShipErrorsTable = [
            {
                title: languageForGlobal.serialNo,
                dataIndex: 'xuhao',
                render: (text, record, index) => {
                    console.log('record', record);
                    return (
                        <div>{index + 1}</div>
                    );
                },
            },
            {
                title: languageForGlobal.locationError,
                dataIndex: 'errorPath',
            },
            {
                title: languageForOrder.LogisticsType,
                dataIndex: 'logisticsCompany',
            },
            {
                title: languageForOrder.TrackingNo,
                dataIndex: 'logisticeNo',
            },
        ];
        const dataSource = orders.data.hasOwnProperty('orders') ? orders.data.orders : [];

        orderListcolumns = tabbleColumnsControl(orderListcolumns, permission)
        // 导航tap数据
        const navTapDatas = [
            { title: languageForOrder.AllOrders, key: -1 },
            { title: languageForOrder.Unpaid, key: 0 },
            { title: languageForOrder.AwaitingShipping, key: 1 },
            { title: languageForOrder.Shipped, key: 2 },
            // { title: '已收货', key: 4 },
            { title: languageForOrder.Canceled, key: 3 },
            { title: languageForOrder.Refunded, key: 5 },
            { title: languageForOrder.RiskOrder, key: 6 },
        ];
        // 搜索数据
        const selectSearchDatas = [
            { value: languageForOrder.OrderID, key: '1' },
            { value: languageForOrder.UserEmail, key: '2' },
            { value: languageForOrder.TransactionNo, key: '3' },
            { value: languageForOrder.TrackingNo, key: '4' },
            { value: 'SPUID', key: '5' },
            { value: languageForOrder.BillNo, key: '6' },
        ];
        // 分页器
        const pagination = {
            total: orders.data && orders.data.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            current: orders.pushData && orders.pushData.page_num,
            pageSize: orders.pushData && orders.pushData.page_size,
            showTotal: (total) => {
                return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
            },
            onShowSizeChange: (current, size) => {
                this.props.dispatch({
                    type: `orders/${type}PushShowSize`,
                    payload: {
                        page_num: 1,
                        page_size: size,
                    },
                    callback: () => {
                        this.loadData('pageChange');
                    },
                });
            },
            onChange: (current) => {
                this.props.dispatch({
                    type: `orders/${type}PushShowNum`,
                    payload: {
                        page_num: current,
                    },
                    callback: () => {
                        this.loadData('pageChange');
                    },
                });
            },
        };
        //设置物流单号出错提交按钮文案
        let languageStartToUploadFiles = languageForGlobal.Submit;
        if (errorUploadSpus.length == 0 && errorShipErrors.length != 0) {
            languageStartToUploadFiles = languageForOrder.IgnoreSubmit;
        }

        const formItemLayout = { layout: 'vertical', }
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                this.setState({
                    downloadOrderDatas: selectedRowKeys,
                })
                //        this.state.downloadOrderDatas = selectedRowKeys;
                // this.state.downloadOrderDatas = selectedRows;
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
            selectedRowKeys: this.state.downloadOrderDatas
        };
        return (
            <div id={styles.orderListBox}>
                <Tabs
                    onChange={handerTabsCallback}
                    activeKey={orders.pushData.tab_id.toString()}
                    tabBarGutter="68"
                    className={styles.orderListTab}
                >
                    {
                        navTapDatas.map((items) => {
                            return <TabPane tab={items.title} key={items.key} />;
                        })
                    }
                </Tabs>
                <div className={styles.orderListTable}>
                    <Card>
                        <Form layout="inline"
                            onSubmit={this.handleSubmit}
                            className="margin-bottom-24">
                            <div className={styles.searchBox}>
                                <div>
                                    <FormItem
                                        className="belong"
                                    >
                                        {getFieldDecorator('filter', {
                                            rules: [{ required: false }],
                                            initialValue: selectSearchDatas[0].key,
                                            onChange: (value) => {
                                                this.props.dispatch({
                                                    type: `orders/${type}PushFilter`,
                                                    payload: value,
                                                });
                                            },
                                        })(
                                            <Select
                                                className="select-size-small"
                                            >
                                                {
                                                    selectSearchDatas.map((items) => {
                                                        return (
                                                            <Option
                                                                value={items.key}
                                                                key={items.key}
                                                                title={items.value}
                                                            >
                                                                {items.value}
                                                            </Option>
                                                        );
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem>
                                        {getFieldDecorator('keyword', {
                                            rules: [{ required: false }],
                                            onChange: (e) => {
                                                this.props.dispatch({
                                                    type: `orders/${type}PushKeyword`,
                                                    payload: (e.target.value).trim(),
                                                });
                                            },
                                        })(
                                            <Search
                                                placeholder={languageForOrder.Search}
                                                onSearch={this.searchEvent}
                                                className="select-Input"
                                                enterButton
                                            />)}
                                    </FormItem>
                                    <FormItem>
                                        <Button style={{ minWidth: 105 }} onClick={this.advancedSearchEvent}>
                                            {languageForOrder.AdvancedSearch}
                                        </Button>
                                    </FormItem>
                                    {
                                        permission['100020'].status ? (
                                            <FormItem>
                                                <Button type="primary" style={{ minWidth: 105 }} onClick={this.downloadOrders}>
                                                    {languageForOrder.BatchExport}
                                                </Button>
                                            </FormItem>
                                        ) : ''
                                    }
                                    {
                                        permission['100014'].status && ['-1', '6'].indexOf(orders.pushData.tab_id.toString()) === -1 ? (
                                            <FormItem>
                                                <Button type="primary" onClick={this.showModalImportFile} className={styles.formItemBoxButton}>
                                                    {languageForOrder.ImportDeliveryinfo}
                                                </Button>
                                            </FormItem>) : ''
                                    }
                                </div>
                            </div>
                            <div
                                className="margin-top-24"
                                style={
                                    this.state.showAdvancedSearch
                                        ?
                                        { display: 'block' }
                                        :
                                        { display: 'none' }
                                }
                            >
                                <div className={styles.filterBoxItems}>
                                    <FormItem
                                        label={languageForOrder.Country}
                                    >
                                        {getFieldDecorator('country', {
                                            rules: [{ required: false }],
                                            onChange: (value) => {
                                                this.changeLocal(value);
                                            },
                                        })(
                                            <Select
                                                className="select-size-middle"
                                                placeholder={languageForOrder.Select}
                                                allowClear={selectAllowClear}
                                            >
                                                {
                                                    orders.orderLocalsData
                                                        ?
                                                        orders.orderLocalsData.countryInfos.map((items) => {
                                                            return (
                                                                <Option
                                                                    value={items.code}
                                                                    key={items.code}
                                                                    title={items.name}
                                                                >
                                                                    {items.name}
                                                                </Option>);
                                                        }) : null
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={languageForOrder.PaymentMethod}
                                    >
                                        {getFieldDecorator('payType', {
                                            rules: [{ required: false }],
                                            onChange: (value) => {
                                                this.changePayType(value);
                                            },
                                        })(
                                            <Select
                                                className="select-size-middle"
                                                placeholder={languageForOrder.Search}
                                                allowClear={selectAllowClear}
                                            >
                                                {
                                                    orders.orderpayTypes ? orders.orderpayTypes.map((items) => {
                                                        return <Option value={items.code} key={items.code} title={items.name}>{items.name}</Option>;
                                                    }) : null
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={languageForOrder.PaymentTime}
                                        style={{ marginRight: 40 }}
                                    >
                                        {getFieldDecorator('payTime', {
                                            rules: [{
                                                type: 'array',
                                            }],
                                            onChange: (value) => {
                                                this.changePayTime(value);
                                            },
                                        })(
                                            <RangePicker format="YYYY-MM-DD" />
                                        )}
                                    </FormItem>
                                </div>
                                <div className={styles.filterBoxItems}>
                                    {
                                        permission['100012'].status ? (<FormItem
                                            label={languageForOrder.Shopper}
                                        >
                                            {
                                                getFieldDecorator('seller', {
                                                    rules: [{ required: false }],
                                                    onChange: (value) => {
                                                        this.changeSeller(value);
                                                    },
                                                })(
                                                    <Select
                                                        className="select-size-small"
                                                        placeholder={languageForOrder.Select}
                                                        allowClear={selectAllowClear}
                                                    >
                                                        {
                                                            orders.orderSellersData ? orders.orderSellersData.sellers.map((items) => {
                                                                return (
                                                                    <Option value={items.sellerId} key={items.sellerId} title={items.sellerName}>
                                                                        {items.sellerName}
                                                                    </Option>
                                                                );
                                                            }) : null
                                                        }
                                                    </Select>
                                                )}
                                        </FormItem>) : ''
                                    }

                                    {
                                        permission['100011'].status ? (<FormItem
                                            label={languageForOrder.Supplier}
                                        >
                                            {
                                                getFieldDecorator('supplier', {
                                                    rules: [{ required: false }],
                                                    onChange: (value) => {
                                                        this.changeSupplier(value);
                                                    },
                                                })(
                                                    <Select
                                                        className="select-size-small"
                                                        placeholder={languageForOrder.Select}
                                                        allowClear={selectAllowClear}
                                                    >
                                                        {
                                                            orders.orderFupplier ? orders.orderFupplier.sellers.map((items) => {
                                                                return (
                                                                    <Option value={items.sellerId} key={items.sellerId} title={items.sellerName}>
                                                                        {items.sellerName}
                                                                    </Option>);
                                                            }) : null
                                                        }
                                                    </Select>
                                                )}
                                        </FormItem>) : ''
                                    }

                                    <FormItem
                                        label={languageForOrder.Source}
                                    >
                                        {
                                            getFieldDecorator('sourceType', {
                                                rules: [{ required: false }],
                                                onChange: (value) => {
                                                    this.changeSourceType(value);
                                                },
                                            })(
                                                <Select
                                                    className={`select-size-small ${styles.selectStyleWidth}`}
                                                    placeholder={languageForOrder.Select}
                                                    allowClear={selectAllowClear}
                                                >
                                                    {
                                                        orders.orderSourceTypeList ? orders.orderSourceTypeList.map((items) => {
                                                            return (
                                                                <Option value={items.id} key={items.id} title={items.name}>
                                                                    {items.name}
                                                                </Option>);
                                                        }) : null
                                                    }
                                                </Select>
                                            )}
                                    </FormItem>
                                    {/* <FormItem style={{ marginRight: 10 }}> */}
                                    {/* <Button onClick={this.commitQuery}>查询</Button> */}
                                    {/* </FormItem> */}
                                    <FormItem style={{ marginRight: 10 }}>
                                        <Button onClick={this.handleReset}>{languageForOrder.Reset}</Button>
                                    </FormItem>
                                </div>
                            </div>
                        </Form>
                        <div className={styles.tableTop}>
                            <Table
                                needToGetWidth={true}
                                className={styles.textAlign}
                                rowKey="order_no"
                                columns={orderListcolumns}
                                pagination={pagination}
                                dataSource={dataSource}
                                rowSelection={rowSelection}
                                loading={loading}
                            />
                        </div>
                    </Card>
                    {/*修改发货信息*/}
                    <Modal
                        title={languageForOrder.ShippingInformation}
                        visible={this.state.visibleEditorStatus}
                        onOk={this.handleOkEditorStatus}
                        onCancel={this.handleCancelEditorStatus}
                        okText={languageForOrder.ShippingConfirmation}
                        confirmLoading={loading}
                        maskClosable={false}
                        width={470}
                        key="3"
                    >
                        <Form>
                            <FormItem
                                label={languageForOrder.OrderNo}
                                className={styles.pushInfoInput}
                                {...formItemLayout}
                            >
                                {this.state.orderNo}
                            </FormItem>
                            <FormItem
                                label={languageForOrder.LogisticsType}
                                className={styles.pushInfoInput}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('type', {
                                    rules: [{
                                        type: 'string',
                                        required: true,
                                        message: `${languageForGlobal.PleaseEnter}${languageForOrder.ShipopingInfomation}`,
                                        whitespace: true
                                    }],
                                    initialValue: "",
                                })(
                                    <Select>
                                        {
                                            this.state.shippingTypes.map((item) => {
                                                return (
                                                    <Option value={item.code} key={item.code}>{item.displayName}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                label={languageForOrder.TrackingNo}
                                className={styles.pushInfoInput}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('oddNumbers', {
                                    rules: [
                                        {
                                            type: 'string',
                                            required: true,
                                            message: languageForMessage.beSeparatedWithCommas,
                                            whitespace: true
                                        }
                                    ],
                                    initialValue: "",
                                })(
                                    <TextArea name="" id="" placeholder={languageForMessage.MultipleNumbers}
                                        className={styles.logisticsInp}></TextArea>
                                )}
                            </FormItem>
                            <FormItem
                                label={languageForOrder.LogisticsTrackingURL}
                                className={styles.pushInfoInput}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('links', {
                                    rules: [{
                                        type: 'string',
                                        required: true,
                                        message: `${languageForGlobal.PleaseEnter}${languageForOrder.LogisticsTrackingURL}`,
                                        whitespace: true
                                    }],
                                    initialValue: "",
                                })(
                                    <Input type="text" className={styles.logisticsInp} placeholder="" />
                                )}
                            </FormItem>
                            <FormItem
                                label={languageForOrder.ShippingTime}
                                className={styles.pushInfoInput}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('deliveryTime', {
                                    rules: [{
                                        required: true,
                                        message: `${languageForGlobal.PleaseEnter}${languageForOrder.ShippingTime}`
                                    }],
                                    // initialValue: this.state.deliveryTime,
                                    // value: this.state.deliveryTime,
                                })(
                                    <DatePicker />
                                )}
                            </FormItem>
                            <p style={{ fontSize: 12 }}>
                                {this.state.shippingPromit[0]}<br />
                                {this.state.shippingPromit[1]}
                            </p>
                        </Form>
                    </Modal>
                    {/*物流单号可能出错提示*/}
                    <Modal
                        title={languageForOrder.Tips}
                        visible={this.state.visibleShipNosTip}
                        onOk={this.handleOkShipNosTip}
                        onCancel={this.handleCanceShipNosTip}
                        okText={languageForOrder.IgnoreSubmit}
                        cancelText={languageForOrder.BackModify}
                        width={470}
                        key="4"
                    >
                        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 10 }}>{languageForOrder.IsCheckShip}</div>
                        <div> {languageForOrder.ShipNnlike}</div>
                    </Modal>

                    {/* 批量导入发货信息 */}
                    <Modal
                        title={languageForOrder.ImportDeliveryinfo}
                        visible={this.state.visibleImportFile}
                        // onOk={this.handleOkImportFile}
                        onCancel={this.handleCancelImportFile}
                        okText={languageForGlobal.UploadFiles}
                        maskClosable={false}
                        className={styles.GoodsListImportFileModal}
                        key="2"
                        footer={[
                            <Button key="back" size="large" onClick={this.handleCancelImportFile}>{languageForGlobal.cancel}</Button>,
                            <Button
                                className="upload-demo-start"
                                type="primary"
                                onClick={this.handleUpload}
                                disabled={this.state.fileList.length === 0}
                                loading={uploading}
                            >
                                {
                                    uploading ? languageForGlobal.UploadFiles : languageStartToUploadFiles
                                }
                            </Button>,
                        ]}
                    >
                        <div style={{ marginBottom: 10, marginTop: 20 }}>
                            <Upload {...importDeliveryinfoProps} >
                                <Button type="primary">
                                    <Icon type="upload" /> {languageForGlobal.selectDocuments}
                                </Button>
                            </Upload>
                            <Progress
                                percent={this.state.percent}
                                style={{ display: this.state.progressShow ? 'block' : 'none' }}
                                status="active">
                            </Progress>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <a onClick={this.downloadGoods}>{languageForGlobal.downloadTemplate}</a>

                            <p style={{ fontSize: 12, marginTop: 10, }}>
                                {languageForOrder.WhenTheTracking[0]}<br />
                                {languageForOrder.WhenTheTracking[1]}
                            </p>
                        </div>
                        {/* <Checkbox>覆盖SKU相同的现有商品</Checkbox> */}
                        <div style={
                            this.state.errorUploadSpus.length > 0
                                ?
                                { display: 'block', color: 'red' }
                                :
                                { display: 'none' }}
                        >
                            <div>{languageForGlobal.errorReason}：</div>
                            <Table
                                style={{ marginBottom: 20 }}
                                rowKey='errorPath'
                                columns={columnsErrorUploadSpusTable}
                                dataSource={this.state.errorUploadSpus}
                            />
                        </div>

                        {/*可能有错误物流号*/}
                        <div style={
                            this.state.errorShipErrors.length > 0
                                ?
                                { display: 'block', }
                                :
                                { display: 'none' }}
                        >
                            <div style={{ color: 'red' }}>{languageForGlobal.trackingTips}：</div>
                            <div style={{ fontSize: 12 }}>{languageForOrder.FollowingCheck[0]}</div>
                            <div style={{ fontSize: 12, marginBottom: 10 }}>{languageForOrder.FollowingCheck[1]}</div>
                            <Table
                                rowKey='errorPath'
                                columns={columnsErrorShipErrorsTable}
                                dataSource={this.state.errorShipErrors}
                            />
                        </div>
                    </Modal>

                    {/* 导入发信息成功提示框 */}
                    <Modal
                        title={languageForOrder.ImportDeliveryinfo}
                        visible={this.state.visibleUploadMsg}
                        onOk={this.handleOkUploadMsg}
                        onCancel={this.handleCancelUploadMsg}
                        footer={false}
                        loading={loading}
                        key="1"
                    >
                        <Result
                            type="success"
                            title={languageForGlobal.Uploaded}
                            description={(<p style={{ fontSize: 12 }}>{languageForOrder.checkFrom[0]} <a onClick={() => {
                                this.handleCancelUploadMsg();
                                handerTabsCallback(2);
                            }}>{languageForOrder.checkFrom[1]}</a> {languageForOrder.checkFrom[2]}</p>)}
                            style={{ marginTop: 48, marginBottom: 16 }}
                        />
                    </Modal>

                    {/*标记为风险订单*/}
                    <Modal
                        title={languageForMessage.KindlyReminder}
                        visible={this.state.remarkOrderVisble}
                        onOk={this.operationToRiskOrder}
                        confirmLoading={loading}
                        onCancel={() => {
                            this.setState({
                                remarkOrderVisble: false
                            })
                        }}
                    >
                        <p>{riskOrderPromit}</p>
                    </Modal>

                    {/*导出订单*/}
                    <ModalForm
                        visible={this.state.importOrderVisile}
                        source={orderResoure}
                        title={languageForOrder.OrderExport}
                        loading={loading}
                        okText={languageForOrder.ExportButton}
                        onCancel={() => {
                            this.handleImportOrderVisile(false);
                        }}
                        onOk={(params) => {
                            this.commonDownloadOrders(params);
                        }}
                    />
                </div>
            </div>
        );
    }
}

