/* eslint-disable react/no-unused-state */
/**
 * Created by xujunchao on 2017/11/2.
 */
import React, { Component } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
  Tabs,
  Button,
  Form,
  Input,
  Icon,
  // Table,
  Tooltip,
  Menu,
  Dropdown,
  Modal,
  Select,
  Upload,
  notification,
  Spin,
  Radio,
  Progress,
  Popover,
  message,
  Card
} from 'antd';
import Table from '../../components/table';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import reqwest from 'reqwest';
import styles from './GoodsList.less';
import Result from '../../components/Result';
import { setApiHost, getQueryString, tabbleColumnsControl, downloadUrl } from '../../utils/utils';

const FormItem = Form.Item;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
@connect(state => ({
  goods: state.goods,
  global: state.global
}))
@Form.create()
export default class GoodsList extends Component {
  state = {
    visibleExamine: false, // 审核
    visibleSku: false, // Sku属性值
    visibleImportFile: false, // 导入商品
    type: 'goods',
    fileList: [], // 导入
    uploading: false, // 导入
    uploadMsg: null, // 导入错误信息
    visibleUploadMsg: null, // 导入信息
    errorUploadSpus: [], // 错误信息
    uploadTime: null, // 开启3秒定时器，返回成功的时候关闭成功窗口
    expandedRowKeysArr: [], // Table 展开子集
    exporType:'0',//导入类型
    percent: 0,//进度条的值
    mytimer:'',
    progressShow: false,
    uploadSize: 0,
    permission: this.props.global.rolePower.modules['1001'].moduleSubs['10001'].moduleFunctions,//权限值
    suppliersList:[],
    promoteModle: false,
    promoteData: {
      utm_campaign: '',
      utm_term: '',
      url: ''
    },
    promoteBasicUrl: ''
  }

  componentWillMount() {
    let tabId = getQueryString().tabId || this.props.goods.pushData.tab_id;
    console.log(tabId);
    if(this.state.permission['100010'].status){
      tabId = '5';
    }
    this.callback(tabId);
    this.init();
//    this.loadData();
  }

  componentWillUnmount() {
    clearTimeout(this.state.uploadTime);
    this.props.dispatch({
      type: 'goods/clear',
      payload: null,
    });
  }

  //初始化
  init = () => {
    this.props.dispatch({
      type: 'goods/getSpusSuppliers',
      callback: (data) => {
        if(data.status===200){
          this.setState({
            suppliersList: data.data.suppliers
          })
        }
      }
    });
  }

  getExpandedRowKeysArr = (record) => {
    console.log('record', record);
    const { expandedRowKeysArr } = this.state;
    const result1 = expandedRowKeysArr.indexOf(record.spu_id); // 返回index为
    console.log('result1', result1);
    if (result1 >= 0) {
      expandedRowKeysArr.map((item, index) => {
        console.log('index', index);
        if (item === record.spu_id) {
          expandedRowKeysArr.splice(index, 1);
        }
        return true;
      });
    } else {
      expandedRowKeysArr.push(record.spu_id);
    }
    console.log('expandedRowKeysArr', expandedRowKeysArr);
    this.setState({
      expandedRowKeysArr,
    });
  }
  loadData() {
    const { type } = this.state;
    const { goods } = this.props;

    // console.log('goods', goods);
    this.props.dispatch({
      type: `goods/${type}GetList`,
      payload: goods.pushData,
    });
  }

  callback = (key) => {
    const { type } = this.state;
    const _this = this;
    // const { goods } = this.props;
    // console.log('goods---111', goods);
    if(key==3){
      this.props.dispatch(routerRedux.replace({
        pathname: '/goods/goodsList',
        search: `?tabId=${key}`,
      }));
    }else {
      this.props.dispatch(routerRedux.replace({
        pathname: '/goods/goodsList',
      }));
    }
    console.log(key);
    this.props.dispatch({
      type: `goods/${type}PushTabId`,
      payload: key,
      callback: () => {
        setTimeout(()=>{
          _this.loadData();
        },0)
      },
    });
    // this.loadData();
    // console.log(key);
  }
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
  handleCancelExamine = () => {
    // console.log(e);
    this.setState({
      visibleExamine: false,
    });
  }


  // SKU属性值
  showModalSku = (record) => {
    this.setState({
      visibleSku: true,
    });
    const { type } = this.state;

    const pushData = {
      spu_id: record.spu_id,
    };

    console.log('pushData', pushData);
    this.props.dispatch({
      type: `goods/${type}PushSkuProperty`,
      payload: pushData,
    });
  }
  handleOkSku = (e) => {
    // console.log(e);
    e.preventDefault();
    this.setState({
      visibleSku: false,
    });
  }
  handleCancelSku = () => {
    // console.log(e);
    this.setState({
      visibleSku: false,
    });
  }

  // 导入商品
  showModalImportFile = () => {
    this.setState({
      visibleImportFile: true,
      errorUploadSpus: [],
      percent: 0,
    });
  }
  handleOkImportFile = (e) => {
    // console.log(e);
    e.preventDefault();
    this.setState({
      visibleImportFile: false,
    });
  }
  handleCancelImportFile = () => {
    // console.log(e);
    this.setState({
      visibleImportFile: false,
    });
  }

  // 上架
  shelfUp = (record) => {
    const { type } = this.state;
    const languageForMessage = this.props.global.languageDetails.message;
    const pushData = {
      spu_id: record.spu_id,
      status: 1,
    };

    this.props.dispatch({
      type: `goods/${type}PushUpdateSpuStatus`,
      payload: pushData,
      callback: () => {
        notification.success({
          message: languageForMessage.KindlyReminder,
          description: languageForMessage.Publishedsuccessfully,
        });
        this.loadData();
      },
    });
    console.log('shelfUp');
  }
  // 下架
  shelfDown = (record) => {
    const { type } = this.state;
    const languageForMessage = this.props.global.languageDetails.message;
    const pushData = {
      spu_id: record.spu_id,
      status: 0,
    };

    this.props.dispatch({
      type: `goods/${type}PushUpdateSpuStatus`,
      payload: pushData,
      callback: () => {
        notification.success({
          message: languageForMessage.KindlyReminder,
          description: languageForMessage.Unpublishedsuccessfully,
        });
        this.loadData();
      },
    });
    console.log('shelfDown');
  }
  // 点击操作按钮
  handleMenuClick = (record, e) => {
    const { type } = this.state;

    console.log('e=>record', record);

    this.props.dispatch({
      type: `goods/${type}OperationItem`,
      payload: record,
    });

    // console.log('click', e);
    if (e.key === '1') {
      // 审核
      this.showModalExamine();
    } else if (e.key === '2') {
      // 上架
      this.shelfUp(record);
    } else if (e.key === '3') {
      // 下架
      this.shelfDown(record);
    } else if (e.key === '4') {
      // 重新上传
      this.showModalImportFile(record);
    } else if (e.key === '5') {
      // SKU属性值
      this.showModalSku(record);
    } else if (e.key === '6') {
      // 编辑
      this.goodsEditor(record);
    } else if (e.key === '7'){
      this.downloadSpuInfo(record.spu_id);
    }
    e.domEvent.stopPropagation();
  }

  //导出商品
  downloadSpuInfo = (spuId) => {
    this.props.dispatch({
      type: 'goods/downloadSpuInfo',
      payload:{
        spuId: spuId,
      },
      callback: (data) => {
        if(data.status===200){
          downloadUrl(data.data.url)
          // window.open(data.data.url);
        }
      }
    })
  }

  handleUpload = () => {
    const { fileList, exporType , uploadSize, } = this.state;
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
    this.setProgress(parseInt(100*uploadSize));
    fileList.forEach((file) => {
      formData.append('uploadFile', file);
      formData.append('siteType',parseInt(exporType));
    });
    this.setState({
      uploading: true,
    });
    // You can use any AJAX library you like
    reqwest({
      url: `${setApiHost()}/api/merchant/v1/spu/uploadSpus`,
      method: 'post',
      processData: false,
      data: formData,
      success: (res) => {

        const _this = this;
        _this.setState({
          percent: 100,
        })
        clearInterval(_this.state.mytimer);
        setTimeout(()=> {
          _this.setState({
            progressShow: false,
          })
          if (res.status !== 200) {
            if (res.data && res.data.errors) {
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
            notification.error({
              message: languageForMessage.KindlyReminder,
              description: res.msg,
            });

          } else {
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
          if (res.status === 10001) {
            window.location.href = `//${window.location.host}/user/login`;
          }
        },200)

      },
      error: (res) => {
        const _this = this;
        _this.setState({
          percent: 100,
        });
        clearInterval(_this.state.mytimer);
        setTimeout(()=> {
          _this.setState({
            uploading   : false,
            progressShow: false,
          })
          // message.error('upload failed.');
          notification.error({
            message: languageForMessage.KindlyReminder,
            description: res.msg,
          })
        },200)
      },
    });
    // } else {
    //   notification.error({
    //     message: '提示',
    //     description: '文件大小不能超过8M',
    //   });
    // }
  }
  downloadGoods = () => {
    // const downloadLink = 'http://cdn.batmobi.net/ecres/down/20171122/iqPc1ypqcwo36lPojWgIRjXQ5BApoBXz/%E5%95%86%E5%93%81%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.zip';
    // const downloadLink = 'http://cdn.batmobi.net/ecres/down/20171221/upload-spu-demo.zip';
    // const downloadLink = 'http://cdn.batmobi.net/ecres/down/20171228/1514455926635-upload-spu-demo.zip';
    const { exporType } = this.state;
    const downloadLink = exporType == 1 ? 'http://cdn.batmobi.net/ec/common/20180323/1521807455474_TFHaB.xlsx' : 'http://cdn.batmobi.net/ecres/down/20180329/uploadSpuDemo.zip';
    // window.open(downloadLink);
    downloadUrl(downloadLink);
  }

  handleOkUploadMsg = (e) => {
    // 如果点击了，直接去掉定时器
    clearTimeout(this.state.uploadTime);
    this.loadData();
    this.setState({
      visibleUploadMsg: false,
    });
  }
  handleCancelUploadMsg = (e) => {
    clearTimeout(this.state.uploadTime);
    this.loadData();
    this.setState({
      visibleUploadMsg: false,
    });
  }

  // 打开子集
  handleOpen = (record) => {
    this.getExpandedRowKeysArr(record);
  }

  searchData = () => {
    const { getFieldValue } = this.props.form;
    const { type } = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `goods/${type}PushShowNum`,
      payload: {
        page_num: 1,
      },
    });
    this.props.dispatch({
      type: `goods/${type}pushShowSize`,
      payload: {
        page_size: 20,
      },
    });
    this.props.dispatch({
      type: `goods/${type}PushKeyword`,
      payload: getFieldValue('keyword').trim(),
    });
    this.loadData();
  }

  // 审核
  showModalExamine = () => {
    this.setState({
      visibleExamine: true,
    });
  }
  // 编辑
  goodsEditor = (record) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/goods/goodsCreate',
      search: `?spu_id=${record.spu_id}&action=edit`,
    }));
  }
  // 新建
  handleGooodsCreate = () => {
    this.props.dispatch(routerRedux.push({
      pathname: '/goods/goodsCreate',
      search: `?action=create`,
    }));
  }
  //设置进度条
  setProgress = (time) => {
    const { mytimer } = this.state;
    const _this = this;
    clearInterval(this.state.mytimer);
    const newTimer = setInterval(() => {
      const cuurentPercent = _this.state.percent;
      let addNum;
      if(cuurentPercent==99){
        clearInterval(_this.state.mytimer);
        return;
      }
      if(cuurentPercent<70){
        addNum = parseInt((100 - cuurentPercent)*Math.random()/10);
      }else if(cuurentPercent<90) {
        addNum = parseInt((100 - cuurentPercent)*Math.random()/3);
      }else {
        addNum = parseInt((100 - cuurentPercent)*Math.random());
      }
      if(addNum>5){
        addNum = 5;
      }
      let newPercent = cuurentPercent+addNum;
      _this.setState({
        percent: newPercent,
      })
    },time)

    this.setState({
      mytimer: newTimer,
    })
  }
  //阻止冒泡事件
  stopProgation = (e) => {
    e.stopPropagation();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { goods } = this.props;
    const { goods: { loading, pushData } } = this.props;
    const { type, permission, suppliersList } = this.state;
    const langusgeForProduct = this.props.global.languageDetails.goods.productManagement;
    const langusgeForGlobal = this.props.global.languageDetails.global;
    const languageForMessage = this.props.global.languageDetails.message;
    const dataSource=goods.data&&goods.data.hasOwnProperty('goods') ?  goods.data.goods : [];
    const role = this.props.global.rolePower.role;
    const selectSearchDatas = [
      { value: langusgeForProduct.spu, key: '1' },
      { value: langusgeForProduct.sku, key: '2' },
      { value: langusgeForProduct.productName, key: '3' },
      { value: langusgeForProduct.productType, key: '4' },
    ]; // 选择搜索数据
    // 导入
    const { uploading } = this.state;
    const props = {
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
        console.log(info.file.status)
        if(info.file.status ==='error'){
          this.setState({
            progressShow: false,
            percent: 0,
          })
        }else if(info.file.status==='done'){
          this.setState({
            percent: 100,
          })
        }else if(info.file.status==='removed'){
          this.setState({
            progressShow: false,
            percent: 0,
          })
        }
      },
      beforeUpload: (file,fileList) => {
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
      data:{
        siteType: 1,
      },
    };
    // 审核、上架、下架、重新上传、SKU属性值
    let columns = [
      {
        title: langusgeForProduct.operation,
        dataIndex: 'name',
        className: 'tcenter',
        classType: 1,
        render: (text, record) => {
          // 业务逻辑：
          // 已经上架包含 下架，SKU属性值
          // 已经下架包含 上架，SKU属性值
          // 后端逻辑
          // 商品状态：0-下架 1-上架
          let result = [];
          switch (record.status) {
            case 0:
              // 下架
              permission['100003'].status ? result.push({title: langusgeForProduct.publishedMenu, key: 2}): '';
              break;
            case 1:
              // 上架
              permission['100004'].status ? result.push({title: langusgeForProduct.unpublishedMenu, key: 3}): '';
              break;
            default:
          }
          permission['100005'].status ? result.push({ title: langusgeForProduct.SKUAttribute, key: 5 }): '';
          permission['100006'].status ? result.push({ title: langusgeForProduct.edit, key: 6 }): '';
          permission['100007'].status ? result.push({ title: langusgeForProduct.export, key: 7 }): '';
          return (
            <div className={`${styles.shuxing}`} >
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
                  <Icon type="laptop" style={{ fontSize: 16, paddingTop: 5 }} />
                </a>
              </Dropdown>

            </div>
          );
        },
      },
      {
        title: langusgeForProduct.Supplier,
        dataIndex: 'supplierName',
        // className: styles.extendCountries,
        permission: 100056,
        classType: 3,
        render: (text) => {
          return (
            <Tooltip
              title={text}
            >
              <div className="ellipsis" >
                <span onClick={this.stopProgation}>{text}</span>
              </div>
            </Tooltip>
          )
        }
      },
      {
        title: 'ID',
        dataIndex: 'spu_id',
        // className: styles.goodsTd3,
        classType: 8,
        render: (text,record) => {
          return (
            <div className={`${styles.shuxing} ${styles.goodsTd3}`} >
              <div>
                {
                  record.belong === 0 ? (<div onClick={this.stopProgation} className={styles.distribution}>{record.effective ? langusgeForProduct.distribution : langusgeForProduct.Invalid}</div>) : ''
                }
                <span onClick={this.stopProgation}>SPU:{text}</span>
              </div>
              {
                record.extraState ? (
                    <div className={styles.supplierChangesPromit}>
                      <Popover content={(
                        <p>
                          {langusgeForProduct.supplierChangedBefore}{` '${record.syncContent}' `}{langusgeForProduct.supplierChangedAfter} <Link to={`/goods/distributionIndex?tab=3&tabId=${record.syncTabId}`}>{langusgeForProduct.check}</Link>
                        </p>)} trigger="hover">
                        <Icon className={styles.icon} type="exclamation-circle" />
                      </Popover>
                      <span onClick={this.stopProgation}>{langusgeForProduct.supplierProductChange}</span>

                    </div>
                  ) : ''
              }
            </div>
          );
        },
      },
      {
        title: langusgeForProduct.productInformation,
        dataIndex: '',
        className: styles.specialGoodsTd4,
        classType: 7,
        render: (text, record) => {
          return (
            <Tooltip
              placement="top"
              title={
                <div>
                  <p>{record.spu_name}</p>
                  <p>{record.spu_type}</p>
                </div>
              }
            >
              <div>
                <img className="tableImage" alt="" src={record.icon} />
                <span onClick={this.stopProgation} style={{display: 'inline-block',width:150,lineHeight:'50px',verticalAlign:'middle',marginLeft:5}} className="ellipsis">
                      {record.spu_name}
                    </span>
              </div>

            </Tooltip>
          );
        },
      },
      // {
      //   title: langusgeForProduct.productName,
      //   dataIndex: 'spu_name',
      //   // className: styles.goodsTd5,
      //   classType: 5,
      //   render: (text) => {
      //     return (
      //       <Tooltip placement="top" title={text}>
      //         <span className="ellipsis" >
      //           {text}
      //         </span>
      //       </Tooltip>
      //     );
      //   },
      // },
      {
        title: langusgeForProduct.price,
        dataIndex: 'address',
        // className: styles.goodsTd8,
        classType: 3,
        render: (text) => {
          const result = text || '-';
          return (
            <div className={`${styles.shuxing} ${styles.goodsTd8}`} >
              <span onClick={this.stopProgation}>{result}</span>
            </div>
          );
        },
      },
      {
        title: langusgeForProduct.stock,
        dataIndex: 'storage',
        // className: styles.goodsTd9,
        classType: 1,
        render: (text,record) => {
          return (
            <div className={`${styles.shuxing} ${styles.goodsTd9}`} >
              <span onClick={this.stopProgation}>
                {text}
                {
                  record.isWarning ? (
                    <span className={styles.isWarning}>!</span>
                  ) : null
                }
              </span>
            </div>
          );
        },
      },
      {
        title: langusgeForProduct.country,
        dataIndex: 'extend_countries',
        // className: styles.extendCountries,
        classType: 3,
        render: (text, record) => {
          const result = record.extend_countries && record.extend_countries.length > 0 ? record.extend_countries.join(',') : '-';
          return (
            <Tooltip placement="top" title={result}>
              <div className="ellipsis" >
                <span onClick={this.stopProgation}>{result}</span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: langusgeForProduct.updatedTime,
        dataIndex: 'update_time',
        // className: styles.goodsTd11,
        classType: 3,
        render: (text) => {
          return (
            <div className={`${styles.goodsTd11}`} >
              <span onClick={this.stopProgation}>{text}</span>
            </div>
          );
        },
      },
    ];
    columns = tabbleColumnsControl(columns,permission);
    //推广商品
    if (permission['100057'].status) {
      columns.unshift({
        title: '',
        dataIndex: 'test',
        // className: styles.goodsTd9,
        classType: 1,
        render: (text, record) => {
          return (
            <div onClick={
              (e) => {
                e.stopPropagation()
                this.setState({
                  promoteModle: true,
                  promoteBasicUrl: record.utmLink,
                  promoteData: {
                    utm_campaign: '',
                    utm_term: '',
                    url: `${record.utmLink}&utm_campaign=&utm_term=`
                  }
                })
              }
            } style={{
              color:'#4291f7',
              cursor: 'pointer'
            }}>
              {langusgeForProduct.PromoteProduct}
            </div>
          );
        },
      })
    }
    // if(role===2){
    //   columns.splice(2,0,)
    // }
    const pagination = {
      total: goods.data && goods.data.total,
      showSizeChanger: true,
      current: goods.pushData.page_num,
      pageSize: goods.pushData.page_size,
      defaultPageSize: goods.pushData && goods.pushData.page_size,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total) => {
        return `${langusgeForGlobal.total} ${total} ${langusgeForGlobal.items}`;
      },
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `goods/${type}PushShowSize`,
          payload: {
            page_num: current,
            page_size: size,
          },
        });
        this.loadData();
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `goods/${type}PushShowNum`,
          payload: {
            page_num: current,
          },
        });
        this.loadData();
      },
    };
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    let columnsSku = [
      {
        title: langusgeForProduct.attributeName,
        dataIndex: 'name',
        // width: '100px',
        classType: 2,
        render: (text, record) => {
          // console.log('属性名称',record)
          // const result = record.properties.map((item) => {
          //   return (
          //     <div key={item.name}>{item.name}</div>
          //   );
          // });
          return (
            <div>{record.name}</div>
          );
        },
      },
      {
        title: langusgeForProduct.value,
        dataIndex: 'value',
        classType: 1,
        render: (text, record) => {
          const result = record.values.map((item,index) => {
            return (
              <div key={index} className={styles.skuTableItem}>{item.value}</div>
            );
          });
          return (
            <div>{result}</div>
          );
        },
      },
      {
        title: langusgeForProduct.displayForm,
        dataIndex: 'show_type',
        classType: 1,
        render: (text, record) => {
          const result = record.values.map((item,index) => {
            let showType = null;
            switch (item.show_type) {
              case 1:
                showType = langusgeForProduct.Label;
                break;
              case 2:
                showType = langusgeForProduct.Image;
                break;
              default:
                showType = '-';
                break;
            }
            return (
              <div key={index} className={styles.skuTableItem}>{showType}</div>
            );
          });
          return (
            <div>{result}</div>
          );
        },
      },
      {
        title: 'icon',
        dataIndex: 'icon',
        classType: 1,
        render: (text, record) => {
          const result = record.values.map((item) => {
            return (
              <div key={item.icon} className={styles.skuTableItem}>
                <img alt="" src={item.icon} />
              </div>
            );
          });
          return (
            <div>{result}</div>
          );
        },
      },
    ];
//    tabbleColumnsControl(dataSource,columnsSku);

    const columnsErrorUploadSpusTable = [
      {
        title: langusgeForGlobal.serialNo,
        dataIndex: 'xuhao',
        render: (text, record, index) => {
          console.log('record', record);
          return (
            <div>{index + 1}</div>
          );
        },
      },
      {
        title: langusgeForGlobal.locationError,
        dataIndex: 'errorPath',
      },
      {
        title: langusgeForGlobal.errorReason,
        dataIndex: 'errorMsg',
      },
    ];

//    tabbleColumnsControl(this.state.errorUploadSpus,columnsErrorUploadSpusTable);

    const utmCampaignChange = (e) => {
      const {promoteData, promoteBasicUrl} = this.state
      this.setState({
        promoteData: {
          ...promoteData,
          utm_campaign: e.target.value,
          url: `${promoteBasicUrl}&utm_campaign=${e.target.value}&utm_term=${promoteData.utm_term}`
        }
      })
    }
    const utmTermChange = (e) => {
      const {promoteData, promoteBasicUrl} = this.state
      this.setState({
        promoteData: {
          ...promoteData,
          utm_term: e.target.value,
          url: `${promoteBasicUrl}&utm_campaign=${promoteData.utm_campaign}&utm_term=${e.target.value}`
        }
      })
    }
    return (
      <div id={styles.GoodsList}>
        <Spin spinning={loading}>
          {
            permission['100010'].status ? '' : (
              <Tabs
                activeKey={pushData.tab_id.toString()}
                className={styles.GoodsListTab}
                onChange={this.callback}
              >
                { permission['100008'].status ? (<TabPane tab={langusgeForProduct.published} key="4" />) : ''}
                { permission['100009'].status ? (<TabPane tab={langusgeForProduct.unpublished} key="3" />) : ''}
              </Tabs>
              )
          }
          <div className={styles.GoodsListTable}>
            <Card>
              <Form layout="inline" onSubmit={this.handleSubmit} className={`${styles.formList} margin-bottom-24`}>
                <div className={styles.formItemBox}>
                  <FormItem
                    className="belong"
                  >
                    {getFieldDecorator('filter', {
                      rules: [{ required: false }],
                      initialValue: selectSearchDatas[0].key,
                      onChange: (value) => {
                        this.props.dispatch({
                          type: `goods/${type}PushFilter`,
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
                      rules: [{ required: false, message: langusgeForProduct.search }],
                    })(
                      <Search
                        placeholder={langusgeForProduct.search}
                        onSearch={this.searchData}
                        className="select-Input"
                        enterButton
                      />)}
                  </FormItem>
                  {
                    permission['100056'].status ? (<FormItem
                      label={langusgeForProduct.Supplier}
                    >
                      {getFieldDecorator('supplier', {
                        rules: [{ required: false }],
                        initialValue: 0,
                        onChange: (value) => {
                          this.props.dispatch({
                            type: `goods/pushSupplierId`,
                            payload: value,
                          });
                          this.loadData();
                        },
                      })(
                        <Select
                          placeholder={langusgeForProduct.Select}
                          className="select-size-bigger"
                        >
                          <Option value={0} key={0}>{langusgeForProduct.Select}</Option>
                          {
                            suppliersList.map((items) => {
                              return <Option value={items.supplierId} key={items.supplierId} title={items.supplierName}>{items.supplierName}</Option>;
                            })
                          }
                        </Select>
                      )}
                    </FormItem>) : ''
                  }
                  {
                    permission['100001'].status ? (
                      <Button type="primary" onClick={this.showModalImportFile} className={styles.formItemBoxButton}>
                        {langusgeForProduct.import}
                      </Button>
                    ) : ''
                  }
                  {
                    permission['100002'].status? (
                      <Button type="primary" onClick={this.handleGooodsCreate} className={styles.formItemBoxButton}>
                        {langusgeForProduct.addANewProduct}
                      </Button>
                    ) : ''
                  }
                </div>
              </Form>
              <div className={styles.tableTop}>
                <Table
                  rowKey="spu_id"
                  // scroll={{ x: 1082 }}
                  columns={columns}
                  pagination={pagination}
                  // expandedRowKeys={this.state.expandedRowKeysArr}
                  expandRowByClick={true}
                  needToGetWidth={true}
                  expandedRowRender={(record) => {
                    let expandColumns = [
                      {
                        dataIndex: 'text',
                        classType: 1,
                        render: () => {
                          return (
                            <div></div>
                          );
                        }
                      },
                      {
                        dataIndex: 'operation',
                        classType: 1,
                        render: () => {
                          return (
                            <div></div>
                          );
                        }
                      },
                      {
                        dataIndex: 'sku_id',
                        classType: 7,
                        render:(text,record) =>{
                          return (
                            <div>
                              <p>SKU：{record.sku_id}</p>
                              <p>{langusgeForProduct.itemNo}：{record.article_num}</p>
                              <p>{langusgeForProduct.merchantSKU}：{record.seller_sku}</p>
                            </div>
                          )
                        }
                      },
                      // {
                      //   dataIndex: 'suplier',
                      //   classType: 1,
                      // },
                      {
                        dataIndex: 'property',
                        classType: 3,
                        render: (text) => {
                          return (
                            <div>
                              {
                                text.map((item)=>{
                                  return (
                                    <div key={item.name}>
                                      <span>{item.name}</span>
                                      :
                                      <span>{item.value}</span>
                                    </div>
                                  )
                                })
                              }
                            </div>
                          )
                        }
                      },
                      {
                        dataIndex: 'supplierName',
                        classType: 3,
                        permission: 100056,
                        render: () => {
                          return (
                            <div></div>
                          );
                        }
                      },
                      // {
                      //   dataIndex: 'info',
                      //   classType: 1,
                      //   render: () => {
                      //     return (
                      //       <div></div>
                      //     );
                      //   }
                      // },
                      {
                        dataIndex: 'price',
                        classType: 3,
                        className:styles.expandTablePrice,
                        render: (text,record) => {
                          return (
                            <div>
                              <p>{langusgeForProduct.originalPrice}：{record.original_price}</p>
                              <p>{langusgeForProduct.salesPrice}：{record.price}</p>
                            </div>
                          )
                        }
                      },
                      {
                        dataIndex: 'storage',
                        classType: 1,
                        className: styles.expandTableStorage
                        // render: () => {
                        //   return (
                        //     <div></div>
                        //   );
                        // }
                      },
                      {
                        dataIndex: 'contry',
                        classType: 3,
                        className: styles.expandTableCountry,
                        render: ()=>{
                          return (
                            <div>-</div>
                          )
                        }
                      },
                      {
                        dataIndex: 'update_time',
                        classType: 3,
                        render: (text) => {
                          return (
                            <div>{text}</div>
                          );
                        }
                      },
                    ];
                    expandColumns = tabbleColumnsControl(expandColumns,permission);
                    return (
                      <div className={styles.expandTable}>
                        <Table
                          dataSource={record.skus}
                          pagination={false}
                          showHeader={false}
                          rowKey='sku_id'
                          columns={expandColumns}
                        />
                      </div>
                    )
                  }}
                  dataSource={dataSource}
                />
              </div>
            </Card>
            <Modal
              title={langusgeForProduct.ImportProducts}
              visible={this.state.visibleImportFile}
              onOk={this.handleOkImportFile}
              onCancel={this.handleCancelImportFile}
              okText={langusgeForProduct.uploadFiles}
              maskClosable={false}
              className={styles.GoodsListImportFileModal}
              footer={[
                <Button key="back" size="large" onClick={this.handleCancelImportFile}>{langusgeForGlobal.cancel}</Button>,
                <Button
                  className="upload-demo-start"
                  key="sure"
                  type="primary"
                  onClick={this.handleUpload}
                  disabled={this.state.fileList.length === 0}
                  loading={uploading}
                >
                  {uploading ? langusgeForGlobal.UploadFiles : langusgeForGlobal.StartToUploadFiles}
                </Button>,
              ]}
            >
              <div>
                {langusgeForProduct.ItemImportSource}：
                <RadioGroup defaultValue={this.state.exporType} onChange={ (e) => {
                  this.setState({
                    exporType: e.target.value
                  })
                }}>
                  <Radio value="0">{langusgeForProduct.SelfBrandedProduct}</Radio>
                  <Radio value="1">{langusgeForProduct.Aliexpress}</Radio>
                </RadioGroup>
              </div>

              <div style={{ marginBottom: 10,marginTop: 20 }}>
                <Upload {...props} >
                  <Button type="primary">
                    <Icon type="upload" /> {langusgeForGlobal.selectDocuments}
                  </Button>
                </Upload>
                <Progress
                  percent={this.state.percent}
                  style={{display:this.state.progressShow ? 'block' : 'none'}}
                  status="active" >
                </Progress>
              </div>
              <div style={{ marginBottom: 10 }}>
                <a onClick={this.downloadGoods}>{langusgeForGlobal.downloadTemplate}</a>
              </div>
              {/* <Checkbox>覆盖SKU相同的现有商品</Checkbox> */}
              <div style={
                this.state.errorUploadSpus.length > 0
                  ?
                  { display: 'block', color: 'red' }
                  :
                  { display: 'none' }}
              >
                <div>{langusgeForGlobal.errorReason}：</div>
                <Table
                  rowKey='id'
                  columns={columnsErrorUploadSpusTable}
                  dataSource={this.state.errorUploadSpus}
                />
              </div>
            </Modal>
            {/* SKU属性值 */}
            <Modal
              title={langusgeForProduct.SKUAttribute}
              visible={this.state.visibleSku}
              onOk={this.handleOkSku}
              onCancel={this.handleCancelSku}
              footer={false}
            >
              <Table
                columns={columnsSku}
                dataSource={goods && goods.skuPropertyList}
                pagination={false}
                loading={loading}
                rowKey="name"
              />
            </Modal>

            <Modal
              title={langusgeForProduct.ImportProducts}
              visible={this.state.visibleUploadMsg}
              onOk={this.handleOkUploadMsg}
              onCancel={this.handleCancelUploadMsg}
              footer={false}
              loading={loading}
            >
              <Result
                type="success"
                title={langusgeForGlobal.Uploaded}
                style={{ marginTop: 48, marginBottom: 16 }}
              />
            </Modal>
          </div>

        </Spin>
        <Modal
          title={langusgeForProduct.ProductURL}
          visible={this.state.promoteModle}
          footer={false}
          maskClosable={true}
          onCancel={()=>{
            this.setState({
              promoteModle: false
            })
          }}
        >
          <p>
          {langusgeForProduct.utm_campaign}
          </p>
          <p>
          {langusgeForProduct.utm_term}
          </p>
          <div className="clearfix" style={{margin:'24px 0'}}>
            <div className={styles.utmCampaign}>
              <label>
              {langusgeForProduct.Campaign}
                <Input placeholder="utm_campaign" onChange={(e) => {utmCampaignChange(e)}} />
              </label>
            </div>
            <div className={styles.utmTerm}>
              <label>
              {langusgeForProduct.Term}
                <Input placeholder="utm_term" onChange={(e) => {utmTermChange(e)}}/>
              </label>
            </div>
          </div>

          <div>
            <p>{langusgeForProduct.ProductURL}</p>

              <div style={{marginTop:'10px'}}>
                <label className="clearfix">
                  <TextArea style={{width:'80%', float:'left', height:'68px', borderRadius:'3px 0 0 3px'}} value={this.state.promoteData.url} readOnly rows={3} />
                    <CopyToClipboard
                      text={this.state.promoteData.url}
                      style={{width:'20%', float:'left', height:'68px', borderRadius:'0 3px 3px 0'}}
                      onCopy={() => {
                      message.success(langusgeForProduct.copysuccess, 1);
                    }}>
                      <Button type="primary" style={{float:'left', height:'68px'}}>{langusgeForProduct.copy}</Button>
                    </CopyToClipboard>
                </label>
              </div>

          </div>
        </Modal>
      </div>
    );
  }
}
