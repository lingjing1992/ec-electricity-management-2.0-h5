/**
 * 你好，你已经进入雷区：
 * 模块过于复杂，小改动可以，大改动必须重做。
 */
import React, {Component} from 'react';
import {
  Form,
  Card,
  Input,
  Icon,
  Checkbox,
  Button,
  Select,
  Upload,
  Radio,
  Tabs,
  Popover,
  message,
  notification,
  Spin,
  Popconfirm,
  Modal,
  Breadcrumb,
  Switch
} from 'antd';
import Table from '../../components/table';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import {getQueryString, goodsEditorLanguage, toFixed} from '../../utils/utils';
import FooterToolbar from '../../components/FooterToolbar';
import styles from './GoodsCreate.less';
import SpuTableForm from './SpuTableForm'; // SPU自定义属性
import TableForm from './TableForm'; // SKU属性
import SkuTableForm from './SkuSaleTable'; // SKU销售信息
import SkuPriceForm from './SkuPriceForm'; // SKU价格信息
import SkuSupplyTable from './SkuSupplyTable'; // SKU销售信息
import SkuCommonTableForm from './SkuCommonTableForm'; // SKU其他（公共）信息
import {setApiHost} from '../../utils/utils';
import GoodImage from './GoodImage';
import Ueditor from '../../components/ueditor';
import cloneDeep from 'lodash/cloneDeep';
import ReturnAddrForm from './returnAddrForm';
import Cookies from 'js-cookie';

const FormItem = Form.Item;
// const Option = Select.Option;
const {TextArea} = Input;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const TabPane = Tabs.TabPane;
const {Option, OptGroup} = Select;


let goodsI = 1;

@connect(state => ({
  goodsCreate: state.goodsCreate,
  global: state.global,
  setting: state.setting,
  shop: state.shop
}))
@Form.create()
export default class GoodsCreate extends Component {
  state = {
    type: 'goodsCreate',
    formLayout: 'horizontal',
    // 图片默认值
    fileList: [
      //   {
      //   uid: -1,
      //   name: 'xxx.png',
      //   status: 'done',
      //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      //   thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      // },
    ],
    // 商品详情
    createSkuAttributesArr: [],
    // 缓存生成数据
    resultBuildData2DArrItemArr: [],
    // 缓存sku_id
    spuId: getQueryString().spu_id || 0,
    //  SPU-Table
    visibleSpuTableForm: false,
    //sku原价
    skuOriginPrice: '',
    //sku售价
    skuSalePrice: '',
    //邮费
    skuShipping: '',
    //供货价
    supplyPrice: '',
    //参考价
    refPrice: '',
    //参考运费
    refShipPrice: '',
    //SKU价格批量修改选择的id
    selectedRowKeys: [],
    imageAddSuccess: false,
    resultGoodsDetail: {},
    resultSizeDesc: {},
    othersInfo: [],
    ELE_ROLE: this.props.global.rolePower.role,
    permission: this.props.global.rolePower.modules['1001'].moduleSubs['10019'].moduleFunctions,//权限值
    //兑换率
    rateOfExChange: [],
    rateOfExChangeVisible: false,
    returnAddress: {},//选择退货地址Id
    supplyPriceModal: false,
    refPriceModal: false,
    checkPrice: true,
    productDetailTabKey: 'en',//商品详情tab key
    sizeTableTabKey: 'en',//尺码表tab key
    publishToShopify: false,//同步到shopify
  }

  componentDidMount() {
    this.loadData();
    // console.log(this.state.permission)
    this.setState({
      checkPrice: !!this.state.permission['100058'].status
    })
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'goodsCreate/clear',
      payload: null,
    });
  }

  // SPU 操作
  showModalSpuTableForm = () => {
    const {setFieldsValue} = this.props.form;
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    setFieldsValue({
      spuTableForm: [{
        key: 'spuTableForm1',
        name: languageForProductEdit.attributeName,
        en: '',
        'zh-tw': '',
        editable: true,
      }, {
        key: 'spuTableForm2',
        name: languageForProductEdit.attributeValue,
        en: '',
        'zh-tw': '',
        editable: true,
      }],
    });

    this.setState({
      visibleSpuTableForm: true,
    });
  }
  handleOkSpuTableForm = (e) => {
    const {getFieldValue} = this.props.form;
    const {type} = this.state;
    const languageForMessage = this.props.global.languageDetails.message;
    const {goodsCreate} = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;

    // 获取modal的值
    const spuTableForm = getFieldValue('spuTableForm');
    let result = true;
    const definedAttrs = spuTableForm.map((item) => {
      const langItem = item;
      // if (!item.en && !item['zh-tw']) {
      if (!item.en) {
        result = false;
      }
      return {
        lang: {
          ...langItem,
        },
      };
    });


    if (result) {
      this.props.dispatch({
        type: `goodsCreate/${type}CreateDefinedAttr`,
        payload: {
          definedAttrs,
          language,
        },
        callback: () => {
          this.setState({
            visibleSpuTableForm: false,
          });
        },
      });
    } else {
      notification.error({
        message: languageForMessage.KindlyReminder,
        description: languageForMessage.required,
      });
    }

  }
  handleCancelSpuTableForm = (e) => {
    this.setState({
      visibleSpuTableForm: false,
    });
  }
  // 设置默认值
  setInit = () => {
    const {
      getFieldDecorator,
    } = this.props.form;
    const data = [];
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const {goodsCreate} = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    const {getgoods} = goodsCreate;
    //是否是商家
    const isSeller = getgoods.getting_distribution === 2;
    let initValue = [];
    let initForm = null;
    for (let j = 0; j < 1; j++) {
      initValue = [{
        key: `members${j}1`,
        name: languageForProductEdit.attributeName,
        url: '',
        imp_type: 1,
        small_url: '',
        image_url: '',
        // editable: true,
      }, {
        key: `members${j}2`,
        name: languageForProductEdit.attributeValue,
        url: '',
        imp_type: 1,
        small_url: '',
        image_url: '',
        // editable: true,
      }];
      language.map((languageItem) => {
        for (let i = 0; i < initValue.length; i++) {
          initValue[i][languageItem] = '';
        }
      });
      initForm = getFieldDecorator(`members${j}`, {
        initialValue: initValue,
      })(<TableForm key={j} disabled={isSeller} goodsCreate={this.props.goodsCreate}/>);
      data.push(initForm);
    }

    this.setState({
      createSkuAttributesArr: [...data],
    });
  }
  // 设置默认值
  setInitSpu = () => {

    const {
      getFieldDecorator,
    } = this.props.form;
    const data = [];
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const {goodsCreate} = this.props;
    const {getgoods} = goodsCreate;
    const {property_config = []} = getgoods;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    //是否是商家
    const disabled = this.state.permission['100041'].disabled;

    let initForm = null;

    let skuInitDataMap = [];


    skuInitDataMap = property_config.map((propertyConfigItem, propertyConfigIndex) => {
      let result = null;
      result = propertyConfigItem.map((item, index) => {
        let isHeader = null;

        if (index === 0) {
          isHeader = languageForProductEdit.attributeName;
        } else {
          isHeader = languageForProductEdit.attributeValue;
        }

        const langItem = item.lang;

        return {
          property_id: item.property_id,
          imp_type: item.imp_type,
          small_url: item.small_url,
          image_url: item.image_url,
          status: item.status,
          name: isHeader,
          key: `members${propertyConfigIndex}${index}`,
          ...langItem,
        };
      });
      return result;
    });


    for (let i = 0; i < skuInitDataMap.length; i++) {
      const initValueArr = skuInitDataMap[i];

      initForm = getFieldDecorator(`members${i}`, {
        initialValue: initValueArr,
      })(<TableForm key={i} disabled={disabled} goodsCreate={this.props.goodsCreate}/>);

      data.push(initForm);
    }

    this.setState({
      createSkuAttributesArr: [...data],
    });
  }
  // 编辑回选的时候
  reLoadData = () => {
    const {type} = this.state;
    const {goodsCreate} = this.props;
    const {getgoods} = goodsCreate;
    const { setFieldsValue } = this.props.form;
    const spuId = getQueryString().spu_id;

    this.props.dispatch({
      type: `goodsCreate/${type}Getgoods`,
      payload: {
        spu_id: spuId,
      },
      callback: () => {
        this.setState({
          fileList: getgoods.goods_icons,
          publishToShopify: goodsCreate.getgoods.publishToShopify,
        }, () => {
          // 设置
          // this.handleGoodsType(getgoods.goods_type_id);
          if (goodsCreate.getgoods.backAddr.length > 0) {
            this.setState({
              returnAddress: goodsCreate.getgoods.backAddr[0],
            })
          }
          console.log(goodsCreate);
          // console.log(goodsCreate.getgoods.backAddrId);
          // 设置SPU回选
          this.setInitSpu();
          // 自定义SPU回选
          this.templateCreateDefinedAttr(goodsCreate.createDefinedAttr);
          // 生成数据
          this.handleCreateSkuAttributesBuildData();
        });
      },
    });
  }
  loadData = () => {
    const {type} = this.state;
    const spuId = getQueryString().spu_id;
    this.props.dispatch({
      type: `goodsCreate/${type}CreateRequest`,
      callback: (data) => {
        if (data.status === 200) {
          if (spuId) {
            this.reLoadData();
          } else {
            this.setInit();
          }
          this.setState({
            rateOfExChange: data.data.currencys
          })
        }
      },
    });
  }
  // 图片上传设置
  normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  // 算法A
  doExchange = (doubleArrays) => {
    const len = doubleArrays.length;
    if (len >= 2) {
      const len1 = doubleArrays[0].length;
      const len2 = doubleArrays[1].length;
      const newlen = len1 * len2;
      const temp = new Array(newlen);
      let index = 0;
      for (var i = 0; i < len1; i++) {
        for (let j = 0; j < len2; j++) {
          temp[index] = doubleArrays[0][i] +
            doubleArrays[1][j];
          index++;
        }
      }
      const newArray = new Array(len - 1);
      for (var i = 2; i < len; i++) {
        newArray[i - 1] = doubleArrays[i];
      }
      newArray[0] = temp;
      return this.doExchange(newArray);
    } else {
      return doubleArrays[0];
    }
  }
  // 算法B
  abc = (oldArr) => {
    const currenArr = [];
    const current = oldArr[0];
    for (let i = 0; i < (oldArr.length - 1); i++) {
      const second = oldArr[i + 1];
      for (let j = 0; j < current.length; j++) {
        for (let k = 0; k < second.length; k++) {
          currenArr.push(`${current[j]}-${second[k]}`);
        }
      }
    }
    if (oldArr.length > 2) {
      oldArr.splice(0, 1);
      this.abc(oldArr);
    }
    return currenArr;
  }
  // 算法执行，现在交由后端处理
  test = (arr) => {
    const languageForMessage = this.props.global.languageDetails.message;
    if (arr.length <= 0) {
      message.error(languageForMessage.checkdata);
      return;
    }
    const ret = this.abc(arr);
    return ret;
  }
  // 图片上传
  handleChange = (info) => {
    const languageForMessage = this.props.global.languageDetails.message;
    let fileList = info.fileList;
    // if (fileList.length <= 20) {
    // 2. read from response and show file link
    fileList = fileList.map((file) => {
      // if (info.file.status === 'done') {
      if (file.response && file.response.status === 200) {
        // file.url = info.file.response.data.image_url;
        file.url = file.response.data.image_url;
        '' +
        this.setState({
          imageAddSuccess: true,
        })
      }
      // }
      return file;
    });
    if (info.file.status === 'done') {
      if (info.file.response.status === 200) {
        notification.success({
          message: languageForMessage.KindlyReminder,
          description: info.file.response.msg,
        });
      } else {
        notification.error({
          message: languageForMessage.KindlyReminder,
          description: info.file.response.msg,
        });
      }
    }
    // 3. filter successfully uploaded files according to response from server
    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.status === 200;
      }
      return true;
    });
    this.setState({fileList});
    // }
  }

  closeAddStatus = () => {
    this.setState({
      imageAddSuccess: false,
    })
  }

  // SPU属性 映射
  handleSpuAttributesList = (values, attrNmae) => {
    const {type} = this.state;
    let result = [];
    this.props.goodsCreate.spuAttributesList.map((item) => {
      if (item.attr_name == attrNmae) {
        result = item.attr_value.map((attrValueItem) => {
          if (values.indexOf(attrValueItem.id) >= 0) {
            attrValueItem.selected = true;
          } else {
            attrValueItem.selected = false;
          }
          return attrValueItem;
        });
      }
      return result;
    });


    this.props.dispatch({
      type: 'goodsCreate/changgeSpuAttributesList',
      payload: this.props.goodsCreate.spuAttributesList,
    });

  }
  // 添加一个
  handleCreateSkuAttributes = () => {
    const {
      getFieldDecorator,
    } = this.props.form;
    const {goodsCreate} = this.props;
    const {getgoods} = goodsCreate;
    const disabled = this.state.permission['100041'].disabled;
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    goodsI++;
    const tableData = [
      {
        key: `members${goodsI}1`,
        name: languageForProductEdit.attributeName,
        url: '',
        imp_type: 1,
        // editable: true,
      },
      {
        key: `members${goodsI}2`,
        name: languageForProductEdit.attributeValue,
        url: '',
        imp_type: 1,
        // editable: true,
      },
    ];
    const handleCreateSku = getFieldDecorator(`members${goodsI}`, {
      initialValue: tableData,
    })(<TableForm disabled={disabled} goodsCreate={this.props.goodsCreate}/>);
    this.state.createSkuAttributesArr.push(handleCreateSku);
    this.setState({
      createSkuAttributesArr: this.state.createSkuAttributesArr,
    });
  }
  // 删除一个
  handleEditorSkuAttributes = () => {
    if (this.state.createSkuAttributesArr.length >= 2) {
      this.state.createSkuAttributesArr.pop();
      this.setState({
        createSkuAttributesArr: this.state.createSkuAttributesArr,
      });
    }
  }
  /*
  *  生成数据判断是否为空
  *  true 通过
  *  false 为空
  * */
  isBuildData = (obj) => {

    const {goodsCreate} = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;

    let resultItem = null;
    let result = true;

    obj.map((item) => {
      item.map((nextItem) => {
        resultItem = language.map((languageItem) => {
          if ((!nextItem.lang.en) || (!nextItem.property_id)) {
            result = false;
          }
        });
      });
    });
    return result;
  }

  handleCreateSkuAttributesBuildData = () => {

    const {goodsCreate} = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    const {propertyAssemble} = goodsCreate; // SKU信息列表
    const languageForMessage = this.props.global.languageDetails.message;


    // this.props.goodsCreate.propertyAssemble
    const {
      getFieldsValue,
      setFieldsValue,
    } = this.props.form;
    const {type} = this.state;

    // 获取表单数据
    const createSkuAttributesBuildData = getFieldsValue();
    // 生成二维数组
    const createSkuAttributesBuildData2DArr = [];
    // 生成一维数组
    const createSkuAttributesBuildData1DArr = [];
    // 生成数据数组
    const createSkuAttributesBuildDataArr = [];

    // 实践，生成二维数组
    for (const i in createSkuAttributesBuildData) {
      if (i.indexOf('members') >= 0) {
        createSkuAttributesBuildData2DArr.push(createSkuAttributesBuildData[i]);
      }
    }

    let resultBuildData2DArrItem = [];
    const resultBuildData2DArrItemArr = [];
    createSkuAttributesBuildData2DArr.map((buildData2DArrItem) => {
      const merge = {};
      language.map((languageItem) => {
        resultBuildData2DArrItem = buildData2DArrItem.map((buildData1DArrItem) => {
          const image_url = buildData1DArrItem.imp_type === 1 ? '' : buildData1DArrItem.image_url;
          const small_url = buildData1DArrItem.imp_type === 1 ? '' : buildData1DArrItem.small_url;
          return {
            property_id: buildData1DArrItem.property_id,
            imp_type: buildData1DArrItem.imp_type,
            image_url: image_url,
            small_url: small_url,
            lang: {...buildData1DArrItem},
          };
        });
      });
      resultBuildData2DArrItemArr.push(resultBuildData2DArrItem);
    });


    const commitData = {
      spu_id: getQueryString().spu_id || 0,
      language,
      currency,
      property_config: resultBuildData2DArrItemArr,
    };


    // 生成数据判断值是否为空
    const isBuildData = this.isBuildData(resultBuildData2DArrItemArr);

    // 设置
    if (isBuildData) {
      this.props.dispatch({
        type: `goodsCreate/${type}PropertyAssemble`,
        payload: commitData,
        callback: () => {
          // 回选默认值
          const salesInfo = propertyAssemble.sales_info || [];
          const othersInfo = propertyAssemble.others_info || [];

          const selectedRowKeys = othersInfo.map(item => {
            return item.sku_property_ids
          })
          // 设置多个货币
          salesInfo.map((item) => {
            currency.map((currencyItem, index) => {
              if (item.currency === currencyItem) {
                setFieldsValue({
                  [`saleInfo${currencyItem}`]: item.sku_info,
                });
              }
            });
          });
          // 设置公共
          setFieldsValue({
            skuCommom: othersInfo,
          });
          this.setState({
            othersInfo: othersInfo,
            selectedRowKeys
          })
        },
      });
    } else {
      notification.error({
        message: languageForMessage.Errorindata,
        description: languageForMessage.PleaseFillPleaseCompleted,
      });
    }

    this.setState({
      resultBuildData2DArrItemArr,
    });
  }

  // 生成数据回选
  reLoadCreateSkuAttributesBuildData = () => {

    const {goodsCreate} = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    const {propertyAssemble} = goodsCreate; // SKU信息列表
    // this.props.goodsCreate.propertyAssemble
    const {
      getFieldsValue,
      setFieldsValue,
    } = this.props.form;
    const {type} = this.state;

    // 获取表单数据
    const createSkuAttributesBuildData = getFieldsValue();
    // 生成二维数组
    const createSkuAttributesBuildData2DArr = [];
    // 生成一维数组
    const createSkuAttributesBuildData1DArr = [];
    // 生成数据数组
    const createSkuAttributesBuildDataArr = [];

    // 实践，生成二维数组
    for (const i in createSkuAttributesBuildData) {
      if (i.indexOf('members') >= 0) {
        createSkuAttributesBuildData2DArr.push(createSkuAttributesBuildData[i]);
      }
    }

    let resultBuildData2DArrItem = [];
    const resultBuildData2DArrItemArr = [];
    createSkuAttributesBuildData2DArr.map((buildData2DArrItem) => {
      const merge = {};
      language.map((languageItem) => {
        resultBuildData2DArrItem = buildData2DArrItem.map((buildData1DArrItem) => {
          return {
            property_id: buildData1DArrItem.property_id,
            imp_type: buildData1DArrItem.imp_type,
            image_url: buildData1DArrItem.image_url,
            small_url: buildData1DArrItem.small_url,
            lang: {...buildData1DArrItem},
          };
        });
      });
      resultBuildData2DArrItemArr.push(resultBuildData2DArrItem);
    });


    const commitData = {
      language,
      property_config: resultBuildData2DArrItemArr,
    };


    return resultBuildData2DArrItemArr;
  }

  // 提交的时候，判断是否为空
  isValidate = (obj) => {
    const {goodsCreate} = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    let result = true;
    // currency.map((currencyItem) => {
    //   const objCurrencyItem = obj.saleInfo;
    //   objCurrencyItem.map((objItem) => {
    //     if (objItem.currency === currencyItem) {
    //       objItem.sku_info.map((skuInfoItem) => {
    //         if (
    //           (!skuInfoItem.discount_price && skuInfoItem.discount_price != 0)
    //           ||
    //           (!skuInfoItem.price && skuInfoItem.price != 0)
    //           ||
    //           (!skuInfoItem.ship_price && skuInfoItem.ship_price != 0)
    //         ) {
    //           result = false;
    //         }
    //       });
    //     }
    //   });
    // });

    const objCurrencyItem = obj.saleInfo;
    objCurrencyItem.map((objItem) => {
      let skuInfo = objItem.sku_info
      skuInfo.map((item) => {
        if (item.price === '' || item.discount_price === '' || item.ship_price === '') {
          result = false
        }
      })
    })
    return result;
  }
  // 提交的时候，判断是否为空
  isValidateSkuCommon = (obj) => {
    const {goodsCreate} = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    let result = true;
    const objCurrencyItem = obj.skuCommom;
    objCurrencyItem.map((objItem) => {
      if (
        (!objItem.quantity && objItem.quantity != 0)
        ||
        (!objItem.seller_sku && objItem.quantity != 0)
        ||
        (!objItem.weight && objItem.quantity != 0)
      ) {
        result = false;
      }
    });
    return result;
  }
  // *SPU属性
  templateGoodsTypeAttr = (goods_type_attr) => {
    const {
      getFieldDecorator,
      setFieldsValue,
    } = this.props.form;
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const {formLayout} = this.state;
    const formItemSkuInfoLayout = 'horizontal';
    const resultTemplate = [];
    const resultAttrValue = {};
    for (let i = 0; i < goods_type_attr.length; i++) {
      const current = goods_type_attr[i].attr_value;
      const currentAttrName = goods_type_attr[i].attr_name;


      if (!resultAttrValue[currentAttrName]) {
        resultAttrValue[currentAttrName] = {};
        resultAttrValue[currentAttrName].initialValue = [];
        resultAttrValue[currentAttrName].initOption = [];
      }

      for (let j = 0; j < current.length; j++) {
        const currentItem = current[j];
        // 这里是单选，所以判断一个true
        if (currentItem.selected === true) {
          resultAttrValue[currentAttrName].initialValue.push(currentItem.id);
        }
        resultAttrValue[currentAttrName].initOption.push({
          value: currentItem.id,
          label: currentItem.value,
          selected: currentItem.selected,
        });
      }
    }


    for (let p = 0; p < goods_type_attr.length; p++) {
      const attr_name = goods_type_attr[p].attr_name;
      let initOption = resultAttrValue[attr_name].initOption;
      const initialValue = resultAttrValue[attr_name].initialValue;
      // console.log(initOption);
      initOption = initOption.map((item) => {
        item.label = item.label ? item.label : ' ';
        return item;
      })
      resultTemplate.push(
        <div>
          <FormItem
            label={attr_name}
            {...formItemSkuInfoLayout}
            key={attr_name}
            className={styles.spuTableForm}
          >
            {getFieldDecorator(`spuAttributesList${attr_name}`, {
              rules: [{required: false, message: `${languageForProductEdit.selectSPUAttribute}-${attr_name}`}],
              initialValue,
              onChange: (value) => {
                this.handleSpuAttributesList(value, attr_name);
              },
            })(
              // <RadioGroup
              <CheckboxGroup
                options={initOption}
                // disabled={this.state.spuId}
              />
            )}
          </FormItem>
        </div>
      );
    }
    return resultTemplate;
  }
  // 回选SPU属性
  reLoadGoodsTypeAttr = (goods_type_attr) => {
    const {
      getFieldDecorator,
      setFieldsValue,
    } = this.props.form;


    const {formLayout} = this.state;
    const formItemSkuInfoLayout = 'horizontal';
    const resultTemplate = [];
    const resultAttrValue = {};
    for (let i = 0; i < goods_type_attr.length; i++) {
      const current = goods_type_attr[i].attr_value;
      const currentAttrName = goods_type_attr[i].attr_name;


      if (!resultAttrValue[currentAttrName]) {
        resultAttrValue[currentAttrName] = {};
        resultAttrValue[currentAttrName].initialValue = null;
        resultAttrValue[currentAttrName].initOption = [];
      }

      for (let j = 0; j < current.length; j++) {
        const currentItem = current[j];
        // 这里是单选，所以判断一个true
        if (currentItem.selected === true) {
          resultAttrValue[currentAttrName].initialValue = currentItem.id;
        }
        resultAttrValue[currentAttrName].initOption.push({
          value: currentItem.id,
          label: currentItem.value,
          selected: currentItem.selected,
        });
      }
    }


    for (let p = 0; p < goods_type_attr.length; p++) {
      const attr_name = goods_type_attr[p].attr_name;
      const initOption = resultAttrValue[attr_name].initOption;
      const initialValue = resultAttrValue[attr_name].initialValue;
      setFieldsValue({
        [`spuAttributesList${attr_name}`]: initialValue,
      });
    }
  }

  // SPU自定义属性
  templateCreateDefinedAttr = (createDefinedAttr) => {
    const {
      getFieldDecorator,
      setFieldsValue,
    } = this.props.form;

    const {type} = this.state;
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;

    const resultTemplate = [];

    const {formLayout} = this.state;
    const formItemSkuInfoLayout = 'horizontal';
    if (createDefinedAttr.length > 0) {
      createDefinedAttr.map((item, index) => {
        resultTemplate.push(
          <div key={index}>
            <FormItem
              {...formItemSkuInfoLayout}
              label={item.attrName}
              className={styles.spuAttrTableForm}
            >
              {getFieldDecorator(`${item.attrName}`, {
                rules: [{required: true, message: `请输入SPU属性-${item.attrName}`}],
                initialValue: item.initialValue,
              })(
                <CheckboxGroup
                  options={item.attrValue}
                  onChange={this.onChange}
                />
              )}
              <div className={styles.spuActive}>
                <Popconfirm
                  title="是否要删除此行？"
                  onConfirm={() => {
                    this.props.dispatch({
                      type: `goodsCreate/${type}DeleteDefinedAttr`,
                      payload: {
                        spuId: this.state.spuId,
                        definedAttrId: item.id,
                      },
                    });
                  }}
                >
                  <a>{languageForProductEdit.Delete}</a>
                </Popconfirm>
              </div>
            </FormItem>
          </div>
        );
      });
    }
    return resultTemplate;
  }

  // 设置商品类目
  handleGoodsType = (value) => {
    const {type} = this.state;
    this.props.dispatch({
      type: `goodsCreate/${type}SpuAttributesList`,
      payload: {
        goods_type_id: value,
      },
      callback: () => {
        const goods_type_attr = this.props.goodsCreate.spuAttributesList || [];

        this.reLoadGoodsTypeAttr(goods_type_attr);
      },
    });
  }
  // 取消的时候，返回列表页面
  handleLinkList = () => {
    this.props.dispatch(routerRedux.go(-1));
  }

  //state中参数设置绑定input的值
  handleInputValue = (key, e) => {
    const value = e.target.value.trim();
    if (!this.errorPromit(value)) {
      return false;
    }
    this.setState({
      [key]: value,
    })
  }
  //SKU价格信息选择项修改handle
  selectedKeysChangeHandle = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys
    })
  }
  errorPromit = (value) => {
    const languageForMessage = this.props.global.languageDetails.message;
    value = value.trim();
    if (!(/[\d.\s]/g.test(value))) {
      if (value === '') {
        return true;
      } else {
        notification.error({
          message: languageForMessage.KindlyReminder,
          description: languageForMessage.enterValueOfNumber,
        });
        return false;
      }
    } else {
      return true;
    }
  }

  //图片切换位置
  imagePositionExchange = (startIndex, finishIndex) => {
    const {fileList} = this.state;
    const preImage = fileList[startIndex];
    const currentImage = fileList[finishIndex];
    if (preImage && currentImage) {
      // fileList.splice(startIndex, 1, currentImage);
      // fileList.splice(finishIndex, 1, preImage);
      fileList.splice(startIndex,1)
      fileList.splice(finishIndex,0,preImage);
      this.setState({
        fileList: fileList,
      })
    }
  }

  getContent = (editor, key) => {
    const {resultGoodsDetail} = this.state;
    resultGoodsDetail[key] = editor.getContent();
    this.setState({
      resultGoodsDetail: resultGoodsDetail,
    });
    console.log(resultGoodsDetail);
  }

  sizeGetContent = (editor, key) => {
    const {resultSizeDesc} = this.state;
    resultSizeDesc[key] = editor.getContent();
    this.setState({
      resultSizeDesc: resultSizeDesc,
    });
    console.log(resultSizeDesc);
  }

  setRateOfExChangeVisible = (value) => {
    this.setState({
      rateOfExChangeVisible: value,
    })
  }

  setReturnAddress = (value) => {
    this.setState({
      returnAddress: value
    })
  }

  render() {
    // sku 其他信息
    const SkuCommombleData = [];
    // formDesc
    const {
      getFieldDecorator,
      validateFieldsAndScroll,
      getFieldsError,
      getFieldError,
    } = this.props.form;

    const fieldLabels = {
      goodsCategory: languageForProductEdit.productType,
    };
    // goodsCreate
    const {goodsCreate} = this.props;
    const {goodsCreate: {loading, createRequest}} = this.props;
    const {rateLoading} = this.props.setting;
    //多语言
    const languageDetails = this.props.global.languageDetails;
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const languageForProductMessage = this.props.global.languageDetails.goods.message;
    const languageForMessage = this.props.global.languageDetails.message;
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForNav = this.props.global.languageDetails.nav;
    const languageForHeader = this.props.global.languageDetails.header;
    const languageForRturnAddr = this.props.global.languageDetails.returnAddress;

    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    const {spuAttributesList = []} = goodsCreate;
    const {getgoods} = goodsCreate;
    const {spu_attr = []} = getgoods;
    const {skuOriginPrice, skuSalePrice, skuShipping, imageAddSuccess, supplyPrice, refPrice, refShipPrice, ELE_ROLE, permission, rateOfExChange, selectedRowKeys} = this.state;//供货价
    // spu默认值
    const spuTableFormInitValue = [{
      key: 'spuTableForm1',
      name: languageForProductEdit.attributeName,
      en: '',
      'zh-tw': '',
      editable: true,
    }, {
      key: 'spuTableForm2',
      name: languageForProductEdit.attributeValue,
      en: '',
      'zh-tw': '',
      editable: true,
    }]


    // formLayout
    const {formLayout} = this.state;
    const formItemLayout = formLayout === 'horizontal';
    const formItemSkuInfoLayout = formLayout === 'horizontal';

    // 商品图片
    const goodsPicProps = {
      name: 'upload_img',
      accept: 'image/png,image/jpeg',
      action: `${setApiHost()}/api/merchant/v1/goods/uploadImg`,
      listType: 'picture',
      className: 'upload-list-inline',
      fileList: this.state.fileList,
      multiple: true,
      onChange: this.handleChange,
      data: {
        img_type: 0,
      },
    };

    //基础信息数据
    const skuBaseData = [];

    //兑率表格列属性
    const rateOfExchangeColumn = [
      {
        title: languageForProductEdit.Currency,
        dataIndex: 'currencyCode',
      },
      {
        title: languageForProductEdit.DollarExchangeRate,
        dataIndex: 'exchangeRate',
        render: (text, record, index) => {
          const disabled = record.currencyCode === 'USD';
          return (
            <Input
              type='number'
              value={text}
              disabled={disabled}
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace(/[e]/i, '');
                const newValue = value === '' ? '' : parseFloat(value);
                let arr = cloneDeep(rateOfExChange);
                arr[index].exchangeRate = newValue;
                this.setState({
                  rateOfExChange: arr
                })
                console.log(rateOfExChange);
              }}
            />
          )
        }
      },
    ];
    // 滚动校验
    const validate = () => {
      const {goodsCreate} = this.props;
      const {fileList, returnAddress, permission, checkPrice} = this.state;
      const {
        language = [], // 语言
        goods_type = [], // 商品类目
        currency = [], // 货币
        country = [], // 国家
      } = goodsCreate.createRequest;
      const {type} = this.state;
      validateFieldsAndScroll((error, values) => {
        // 去掉校验
        if (!error) {
          // submit the values
          let i = 0;
          // 上传的数据进行转换
          const commitDataValue = {
            goodsDetail: [], // 详情
            goodsName: [], // 商品名称
            sizeDesc: [], // sizeDesc
            goodsIcon: [], // 主图
            spuAttributesList: [], // spu属性
            definedAttr: [], // spu自定义属性
            saleInfo: [],
            // saleInfo: {
            //   skuAttr: [],
            //   salesInfo: [],
            //   quantity: values.skuCommom[0].quantity,
            //   weight: values.skuCommom[0].weight,
            //   seller_sku: values.skuCommom[0].seller_sku,
            // }, // SKU销售信息
            members: [], // sku多语言属性
            skuCommom: [], // SKU其它信息
            promotionCountry: [], // 推广国家全球处理
          };
          // 临时数据
          const temporaryDataValue = {
            goodsDetail: [],
            goodsName: [],
            members: [],
            membersHeader: [], // 保存属性名称
            membersValue: [], // 保存属性值
            sizeDesc: [], // 尺码表
            saleInfo: [], // SKU销售信息
            skuCommom: [], // SKU其它信息
          };

          for (i in values) {
            // 临时变量商品名称
            if (i.indexOf('goodsName') >= 0) {
              const language = i.substr(9);
              temporaryDataValue.goodsName.push({
                [language]: values[i],
              });
            }
            //            // 临时变量商品详情
            //            if (i.indexOf('goodsDetail') >= 0) {
            //              const language = i.substr(11);
            //              temporaryDataValue.goodsDetail.push({
            //                [language]: values[i],
            //              });
            //            }
            // 临时变量尺码表
            if (i.indexOf('sizeDesc') >= 0) {
              const language = i.substr(8);
              temporaryDataValue.sizeDesc.push({
                [language]: values[i],
              });
            }
            // 商品图片
            if (i.indexOf('goodsIcon') >= 0) {
              //const fileList = values[i].hasOwnProperty('fileList') ? values[i].fileList : values[i];
              fileList.map((item) => {
                commitDataValue.goodsIcon.push(item.url);
              });
            }
            // SPU属性
            if (i.indexOf('spuAttributesList') >= 0) {
              commitDataValue.spuAttributesList.push({
                attr_name: i.substr(17),
                attr_value: values[i],
              });
            }
            // 添加新的SPU属性
            if (i.indexOf('members') >= 0) {
              temporaryDataValue.members.push(values[i]);

              const lang_attr = [];
              const attr_name = {};
              let membersI;
              let membersJ;
              const temporaryDataValueMembers = temporaryDataValue.members;
              for (membersI = 0; membersI < temporaryDataValueMembers.length; membersI++) {
                const temporaryDataValueMembersJ = temporaryDataValueMembers[membersI];

                // 获取头部信息
                const attr_nameHeader = language.map((languageItem) => {
                  return {
                    [languageItem]: temporaryDataValueMembersJ[0][languageItem],
                  };
                });
                const attr_nameHeaderJson = {};
                let attr_nameHeaderJsonI = null;
                let attr_nameHeaderJsonJ = null;
                for (attr_nameHeaderJsonI in attr_nameHeader) {
                  const attr_nameHeaderJ = attr_nameHeader[attr_nameHeaderJsonI];
                  for (attr_nameHeaderJsonJ in attr_nameHeaderJ) {
                    attr_nameHeaderJson[attr_nameHeaderJsonJ] = attr_nameHeaderJ[attr_nameHeaderJsonJ];
                  }
                }


                // 获取value信息
                const attr_nameValueArr = [];
                const attr_nameHeaderJson2Arr = [];

                for (membersJ = 1; membersJ < temporaryDataValueMembersJ.length; membersJ++) {
                  const attr_nameValue = language.map((languageItem) => {
                    const result = {
                      attr_val: {
                        [languageItem]: temporaryDataValueMembersJ[membersJ][languageItem],
                      },
                      attr_icon: [temporaryDataValueMembersJ[membersJ].url],
                    };
                    return result;
                  });
                  attr_nameValueArr.push(attr_nameValue);
                }

                const resultNewArr = [];

                const newArr = [];
                for (let newArri = 0; newArri < attr_nameValueArr.length; newArri++) {
                  const current = attr_nameValueArr[newArri];
                  const json = {};
                  for (let newArrj = 0; newArrj < current.length; newArrj++) {
                    if (!json.attr_val) {
                      json.attr_val = {};
                    }
                    json.attr_icon = current[newArrj].attr_icon;
                    Object.assign(json.attr_val, current[newArrj].attr_val);
                  }
                  newArr.push(json);
                }

                lang_attr.push({
                  attr_name: attr_nameHeaderJson,
                  show_type: temporaryDataValueMembersJ[0].imp_type,
                  attr_value: newArr,
                });
              }
              commitDataValue.members = lang_attr;
            }

            // SKU销售信息 TODO:
            currency.map((currencyItem) => {
              if (i.indexOf(`saleInfo${currencyItem}`) >= 0) {
                // if (!temporaryDataValue.saleInfo[currencyItem]) {
                //   temporaryDataValue.saleInfo[currencyItem] = [];
                // }

                // 之前的格式不对
                // temporaryDataValue.saleInfo[currencyItem] = values[i];
                commitDataValue.saleInfo.push({
                  currency: currencyItem,
                  sku_info: values[i],
                });
              }
            });

            if (i.indexOf('promotionCountry') >= 0) {
              if (values[i].indexOf('Global') >= 0) {
                commitDataValue.promotionCountry = ['Global'];
              } else {
                commitDataValue.promotionCountry = values[i];
              }
            }

            if (i.indexOf('skuCommom') >= 0) {
              // 之前的格式不对
              commitDataValue.skuCommom = values[i];
            }
          }

          // 商品名称
          const resultGoodsName = Object.assign({}, ...temporaryDataValue.goodsName);
          commitDataValue.goodsName = resultGoodsName;


          // 商品详情
          commitDataValue.goodsDetail = this.state.resultGoodsDetail;

          // 尺码表
          commitDataValue.sizeDesc = this.state.resultSizeDesc;

          // spu自定义属性获取ID数组
          this.props.goodsCreate.createDefinedAttr.map((item) => {
            commitDataValue.definedAttr.push(item.id);
          });


          const spuId = getQueryString().spu_id;
          const commitData = {
            spu_id: spuId || 0,
            brand_name: values.brandName, // 品牌名称
            language, // 语言
            goods_name: commitDataValue.goodsName, // 商品名称
            goods_details: commitDataValue.goodsDetail, // 商品详情
            size_desc: commitDataValue.sizeDesc, // 尺码表
            goods_type_id: values.goodsType, // 商品类目
            goods_icons: commitDataValue.goodsIcon, // 商品图片
            spu_attr: this.props.goodsCreate.spuAttributesList, // spu属性
            definedAttr: commitDataValue.definedAttr, // spu自定义属性
            promote_country: commitDataValue.promotionCountry, // 推广国家二字码
            is_distribution: values.isDistribution || 1, // 是否分销，1-不分销，0-分销  默认分销
            others_info: commitDataValue.skuCommom, // 公共SKU设置
            sales_info: commitDataValue.saleInfo, // 多货币设置
            property_config: this.reLoadCreateSkuAttributesBuildData(), // 缓存生成时候的数据
            back_addr_id: returnAddress.id || 0,
            publishToShopify: this.state.publishToShopify,
          };
          const isValidate = this.isValidate(commitDataValue);
          const isValidateSkuCommon = this.isValidateSkuCommon(commitDataValue);


          if (!(commitDataValue.goodsIcon.length >= 6)) {
            notification.error({
              message: languageForMessage.KindlyReminder,
              description: languageForMessage.mainImages,
            });
          } else if (!isValidate) {
            notification.error({
              message: languageForMessage.KindlyReminder,
              description: languageForMessage.completedSKUsales,
            });
          } else if (!isValidateSkuCommon) {
            notification.error({
              message: languageForMessage.KindlyReminder,
              description: languageForMessage.completedSKUother,
            });
          } else if (!commitData.back_addr_id && !permission['100054'].disabled) {
            notification.error({
              message: languageForMessage.KindlyReminder,
              description: languageForMessage.EnterReturnAddress,
            });
          } else {
            if (checkPrice) {
              // SKU售价小于成本校验
              for (let i = 0, len = commitData.sales_info.length; i < len; i++) {
                let item = commitData.sales_info[i].sku_info
                for (let i = 0, len = item.length; i < len; i++) {
                  if (item[i].discount_price < item[i].supplyPrice) {
                    //售价小于供货成本
                    this.setState({
                      supplyPriceModal: true
                    })
                    return
                  } else if (item[i].discount_price < item[i].refPrice) {
                    //售价小于参考价
                    this.setState({
                      refPriceModal: true
                    })
                    return
                  }
                }
              }
            }
            this.props.dispatch({
              type: `goodsCreate/${type}CreateGoods`,
              payload: commitData,
              callback: () => {
                const action = getQueryString().action;
                if (commitData.spu_id) {
                  notification.success({
                    message: languageForMessage.KindlyReminder,
                    description: languageForMessage.Productedited,
                  });
                } else {
                  notification.success({
                    message: languageForMessage.KindlyReminder,
                    description: languageForMessage.productAdded,
                  });
                }
                if (action === 'create') {
                  this.props.dispatch(routerRedux.push('/goods/goodsList?tabId=3'));
                } else {
                  this.props.dispatch(routerRedux.go(-1));
                }
              }
            });
          }
        }
      });
    };
    // 校验信息
    const errors = getFieldsError();
    const getErrorInfo = () => {
      const errorCount = Object.keys(errors).filter(key => errors[key]).length;
      if (!errors || errorCount === 0) {
        return null;
      }
      const scrollToField = (fieldKey) => {
        const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
        if (labelNode) {
          labelNode.scrollIntoView(true);
        }
      };
      const errorList = Object.keys(errors).map((key) => {
        if (!errors[key]) {
          return null;
        }
        return (
          <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
            <Icon type="cross-circle-o" className={styles.errorIcon}/>
            <div className={styles.errorMessage}>{errors[key][0]}</div>
            <div className={styles.errorField}>{fieldLabels[key]}</div>
          </li>
        );
      });
      return (
        <span className={styles.errorIcon}>
          <Popover
            title={languageForProductMessage.FormVerification}
            content={errorList}
            overlayClassName={styles.errorPopover}
            trigger="click"
            getPopupContainer={trigger => trigger.parentNode}
          >
            <Icon type="exclamation-circle"/>
          </Popover>
          {errorCount}
        </span>
      );
    };

    return (
      <div id={styles.GoodsCreate}>
        <Card className="breadcrumb-box">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/goods/goodsList">{languageForNav.productManagement}</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{languageForHeader.editProduct}</Breadcrumb.Item>
          </Breadcrumb>
        </Card>
        <div className={styles.GoodsCreate}>
          <Spin spinning={loading}>
            <Form layout="horizontal">
              <Card
                title={languageForProductEdit.basicInformation}
                className={`${styles.card} ${styles.basicInformation}`}
                bordered={false}
              >
                <div className={styles.basicInfoCard}>
                  {
                    permission['100032'].status ? (
                      <FormItem
                        label={languageForProductEdit.brand}
                        {...formItemLayout}
                      >
                        {getFieldDecorator('brandName', {
                          rules: [
                            {required: false, message: languageForMessage.inputbrandname},
                            {
                              min: 1,
                              max: 50,
                              message: languageForMessage.morethan50,
                            },
                          ],
                          initialValue: getgoods.brand_name && getgoods.brand_name,
                        })(
                          <Input/>
                        )}
                      </FormItem>
                    ) : ''
                  }
                  {
                    permission['100033'].status ? (
                      <FormItem
                        label={languageForProductEdit.productName}
                        {...formItemLayout}
                        className={styles.goodsNameForm}
                      >
                        {/* 多语言 */}
                        {
                          language.map((item, index) => {
                            return (
                              <FormItem
                                key={item}
                              >
                                {getFieldDecorator(`goodsName${item}`, {
                                  rules: [
                                    {
                                      required: item === 'en',
                                      message: `${languageForGlobal.PleaseEnter} ${languageForGlobal.English}`,
                                    },
                                    {
                                      min: 1,
                                      max: 100,
                                      message: languageForMessage.morethan100,
                                    },
                                  ],
                                  initialValue: getgoods.goods_name && getgoods.goods_name[item],
                                })(
                                  <Input addonBefore={goodsEditorLanguage(item, languageForGlobal)}/>
                                )}
                              </FormItem>
                            );
                          })
                        }
                      </FormItem>
                    ) : ''
                  }
                  {
                    permission['100034'].status ? (
                      <FormItem
                        label={languageForProductEdit.productDetails}
                        className={styles.goodsDetailForm}
                        {...formItemLayout}
                      >
                        <RadioGroup
                          defaultValue={language[0]}
                          value={this.state.productDetailTabKey}
                          style={{marginTop: 4, marginBottom: 10}}
                          onChange={(e) => {
                            this.setState({
                              productDetailTabKey: e.target.value
                            })
                          }}>
                          {
                            language.map((item) => {
                              return (
                                <RadioButton value={item} key={item}>{goodsEditorLanguage(item, languageForGlobal)}</RadioButton>
                              )
                            })
                          }
                        </RadioGroup>
                        {
                          language.map((item) => {
                            return (
                              <div style={{display: item === this.state.productDetailTabKey ? 'block' : 'none'}}>
                                <Ueditor
                                  getContent={this.getContent}
                                  language={item}
                                  id={`${item}GoodsDetail`}
                                  height="400"
                                  value={getgoods.goods_details && getgoods.goods_details[item]}
                                />
                              </div>
                            )
                          })
                        }
                      </FormItem>
                    ) : ''
                  }
                  {
                    permission['100039'].status ? (
                      <FormItem
                        label={languageForProductEdit.Country}
                        {...formItemLayout}
                      >
                        {getFieldDecorator('promotionCountry', {
                          rules: [
                              {
                                required: true,
                                message:
                                languageForProductEdit.selectCountry
                              }],
                          initialValue: (
                            (this.state.spuId === 0)
                              ?
                              ['FR', 'GB', 'US', 'AU', 'CA', 'DE']
                              :
                              getgoods.promote_country && getgoods.promote_country),
                        })(
                          <Select
                            placeholder={languageForProductEdit.selectCountry}
                            mode="multiple"
                            disabled={permission['100039'].disabled
                            }
                          >
                            {
                              country.map((item) => {
                                return (
                                  <Option
                                    key={item.code}
                                  >
                                    {item.name}
                                  </Option>
                                );
                              })
                            }
                          </Select>
                        )}
                      </FormItem>
                    ) : ''
                  }
                  {
                    permission['100040'].status ? (
                      <FormItem
                        label={languageForProductEdit.distributionOrNot}
                        {...formItemLayout}
                      >
                        {getFieldDecorator('isDistribution', {
                          rules: [{required: true}],
                          initialValue: `${getgoods.is_distribution}`,
                        })(
                          <RadioGroup disabled={permission['100040'].disabled}>
                            <Radio value="1">{languageForProductEdit.Yes}</Radio>
                            <Radio value="0">{languageForProductEdit.No}</Radio>
                          </RadioGroup>
                        )}
                      </FormItem>
                    ) : ''
                  }
                </div>
              </Card>
              <Card
                className="ant-card-head-900"
                title={languageForProductEdit.ProductAttribute}
              >
                <div className="ant-card-900">
                  {
                    permission['100036'].status ? (
                      <FormItem
                        label={languageForProductEdit.productType}
                        {...formItemLayout}
                      >
                        {getFieldDecorator('goodsType', {
                          rules: [{required: true, message: languageForMessage.selectProductType}],
                          initialValue: this.state.spuId ? `${getgoods.goods_type_id && getgoods.goods_type_id}` : undefined,
                          onChange: (value) => {
                            this.handleGoodsType(value);
                          },
                        })(
                          <Select
                            placeholder={languageForMessage.chooseCountry}
                            notFoundContent={languageForMessage.chooseCountry}
                            disabled={permission['100036'].disabled}
                          >
                            {
                              goods_type.map((item, index) => {
                                return (
                                  <OptGroup key={index} label={item.name_zh}>
                                    {
                                      item.child_type.map((childTypeItem) => {
                                        return (
                                          <Option
                                            key={childTypeItem.id}
                                          >
                                            {childTypeItem.name_zh}
                                          </Option>
                                        );
                                      })
                                    }
                                  </OptGroup>
                                );
                              })
                            }
                          </Select>
                        )}
                      </FormItem>
                    ) : ''
                  }
                  {
                    permission['100037'].status ? (
                      <FormItem
                        label={languageForProductEdit.SPUAttribute}
                        {...formItemLayout}
                        className={styles.spuAttributesForm}
                      >
                        {this.templateGoodsTypeAttr(this.props.goodsCreate.spuAttributesList)}
                      </FormItem>
                    ) : ''
                  }
                  {
                    permission['100038'].status ? (
                      <div>
                        {
                          this.props.goodsCreate.createDefinedAttr.length > 0 ? (<FormItem
                            // label="SPU自定义属性属性"
                            {...formItemLayout}
                            className={`${styles.spuTitleName} ${styles.spuNulTitl}`}
                          >
                            {this.templateCreateDefinedAttr(this.props.goodsCreate.createDefinedAttr)}
                          </FormItem>) : null
                        }

                        <FormItem
                          // label="SPU自定义属性属性"
                          {...formItemLayout}
                          className={`${styles.spuTitleName} ${styles.spuNulTitl} ${styles.spuButton}`}
                        >
                          <Button
                            style={{width: '100%', marginBottom: 24}}
                            type="dashed"
                            onClick={this.showModalSpuTableForm}
                            icon="plus"
                          >
                            {languageForProductEdit.customSPU}
                          </Button>
                        </FormItem>
                      </div>
                    ) : ''
                  }
                </div>
              </Card>
              {
                permission['100035'].status ? (
                  <Card
                    title={languageForProductEdit.productImage}
                    className="ant-card-head-900"
                  >
                    <div className="ant-card-900">
                      <GoodImage
                        formItemLayout={formItemLayout}
                        initialValue={getgoods.goods_icons && getgoods.goods_icons}
                        goodsPicProps={goodsPicProps}
                        positionExchange={this.imagePositionExchange}
                        getFieldDecorator={getFieldDecorator}
                        imageAddSuccess={imageAddSuccess}
                        closeAddStatus={this.closeAddStatus}
                        styles={styles}
                      >
                      </GoodImage>
                    </div>
                  </Card>
                ) : ''
              }

              <Card
                title={languageForProductEdit.SKUInformation}
                className={`${styles.card} ${styles.skuInfoCard}`}
                bordered={false}
              >
                <div className={styles.skuInfo}>
                  {
                    permission['100041'].status ? (
                      <div
                        // title={languageForProductEdit.SKUAttribute}
                        className={styles.card}
                        // bordered={false}
                        // style={{ marginTop: '1px' }}
                      >
                        <div className="ant-card-head-title" style={{display: 'block'}}>
                          {languageForProductEdit.SKUAttribute}
                          <div style={{float: 'right', marginTop: -8}}>
                            <Button
                              type="primary"
                              onClick={this.handleCreateSkuAttributesBuildData}
                              disabled={permission['100041'].disabled}
                              style={{marginRight: 8}}
                            >
                              {languageForProductEdit.GeneratedData}
                            </Button>
                            {
                              (!this.state.spuId) || (this.state.spuId === 0)
                                ?
                                <Button
                                  type="primary"
                                  onClick={this.handleCreateSkuAttributes}
                                  style={{marginRight: 8}}
                                >
                                  {languageForProductEdit.newSKU}
                                </Button>
                                :
                                null
                            }
                            <span>
                    {
                      (!this.state.spuId) || (this.state.spuId === 0)
                        ?
                        <span>
                        {
                          (this.state.createSkuAttributesArr.length > 1)
                            ?
                            <Popconfirm
                              title={languageForMessage.deleteTheTast}
                              onConfirm={this.handleEditorSkuAttributes}
                            >
                              <Button
                                // type="primary"
                              >
                                {languageForProductEdit.Delete}
                              </Button>
                            </Popconfirm>
                            :
                            null
                        }
                      </span>
                        :
                        null
                    }
                  </span>
                          </div>
                        </div>
                        <div>


                        </div>
                        {
                          this.state.createSkuAttributesArr.map((item, index) => {
                            return (
                              <div key={index}>{item}</div>
                            );
                          })
                        }
                      </div>
                    ) : ''
                  }

                  {
                    permission['100042'].status ? (
                      <div
                        // title={languageForProductEdit.SKUSupplyInformation}
                        className={styles.card}
                        // bordered={false}
                      >
                        <div className="ant-card-head-title">{languageForProductEdit.SKUSupplyInformation}</div>
                        <div>
                          <span style={{width: 200, margin: '0 8px 8px 0'}}>{languageForProductEdit.BatchInput}</span>
                          <Input
                            style={{width: 200, margin: '0 8px 8px 0'}}
                            placeholder={languageForProductEdit.OriginalPrice}
                            value={refPrice}
                            disabled={permission['100042'].disabled}
                            onChange={(e) => {
                              this.handleInputValue('refPrice', e)
                            }}
                          />
                          <Input
                            style={{width: 200, margin: '0 8px 8px 0'}}
                            placeholder={languageForProductEdit.SupplyCost}
                            value={supplyPrice}
                            disabled={permission['100042'].disabled}
                            onChange={(e) => {
                              this.handleInputValue('supplyPrice', e)
                            }}
                          />
                          <Input
                            style={{width: 200, margin: '0 8px 8px 0'}}
                            placeholder={languageForProductEdit.ShippingFee}
                            value={refShipPrice}
                            disabled={permission['100042'].disabled}
                            onChange={(e) => {
                              this.handleInputValue('refShipPrice', e)
                            }}
                          />
                          <a onClick={() => {
                            this.setRateOfExChangeVisible(true);
                          }}>{languageForProductEdit.CurrencyConverter}</a>
                          <p style={{fontSize: 12, color: '#ccc'}}>{languageForProductEdit.BatchInputPromit}</p>
                        </div>
                        <Tabs defaultActiveKey="1" style={{marginTop: '1px'}}>
                          {
                            currency.map((item, index) => {
                              const SkutableData = [];
                              return (
                                <TabPane
                                  forceRender={true}
                                  tab={(
                                    <div>
                                      {item}
                                      {getFieldError(`saleInfo${item}`) ?
                                        <Icon type="cross-circle-o" className={styles.errorIcon}/> : null}
                                    </div>
                                  )}
                                  key={index}
                                >
                                  {getFieldDecorator(`saleInfo${item}`, {
                                    rules: [{
                                      required: true,
                                      message: `${item}-${languageForProductEdit.SKUSupplyInformation}`
                                    }],
                                  })(
                                    <SkuSupplyTable
                                      disabled={permission['100042'].disabled}
                                      skuOriginPrice={refPrice}
                                      skuSalePrice={supplyPrice}
                                      skuShipping={refShipPrice}
                                      currency={item}
                                      currencys={createRequest.currencys}
                                    />
                                  )}
                                </TabPane>
                              );
                            })
                          }
                        </Tabs>
                      </div>
                    ) : ''
                  }

                  {/* SKU价格信息 */}
                  {
                    permission['100045'].status ? (<div>
                      {
                        <div
                          // title={languageForProductEdit.SKUPrice}
                          className={styles.card}
                          // bordered={false}
                        >
                          <div className="ant-card-head-title">{languageForProductEdit.SKUPrice}</div>
                          <div>
                            <span
                              style={{width: 200, margin: '0 8px 8px 0'}}>{languageForProductEdit.BatchInput}：</span>
                            <Input
                              style={{width: 200, margin: '0 8px 8px 0'}}
                              placeholder={languageForProductEdit.OriginalPrice}
                              value={skuOriginPrice}
                              onChange={(e) => {
                                this.handleInputValue('skuOriginPrice', e)
                              }}
                            />
                            <Input
                              style={{width: 200, margin: '0 8px 8px 0'}}
                              placeholder={languageForProductEdit.salesPrice}
                              value={skuSalePrice}
                              onChange={(e) => {
                                this.handleInputValue('skuSalePrice', e)
                              }}

                            />
                            <Input
                              style={{width: 200, margin: '0 8px 8px 0'}}
                              placeholder={languageForProductEdit.ShippingFee}
                              value={skuShipping}
                              onChange={(e) => {
                                this.handleInputValue('skuShipping', e)
                              }}
                            />
                            <a onClick={() => {
                              this.setRateOfExChangeVisible(true);
                            }}>{languageForProductEdit.CurrencyConverter}</a>
                            <p style={{fontSize: 12, color: '#ccc'}}>{languageForProductEdit.BatchInputPromit}</p>
                          </div>

                          <Tabs defaultActiveKey="1" style={{marginTop: '1px'}}>
                            {
                              currency.map((item, index) => {
                                const SkutableData = [];
                                return (
                                  <TabPane
                                    forceRender={true}
                                    tab={(
                                      <div>
                                        {item}
                                        {getFieldError(`saleInfo${item}`) ?
                                          <Icon type="cross-circle-o" className={styles.errorIcon}/> : null}
                                      </div>
                                    )}
                                    key={index}
                                  >
                                    {getFieldDecorator(`saleInfo${item}`, {
                                      rules: [{required: true, message: `${item}-${languageForProductEdit.SKUPrice}`}],
                                    })(
                                      <SkuPriceForm
                                        refPrice={refPrice}
                                        supplyPrice={supplyPrice}
                                        refShipPrice={refShipPrice}
                                        skuOriginPrice={skuOriginPrice}
                                        skuSalePrice={skuSalePrice}
                                        skuShipping={skuShipping}
                                        selectedRowKeys={selectedRowKeys}
                                        selectedKeysChangeHandle={this.selectedKeysChangeHandle}
                                        currency={item}
                                        currencys={createRequest.currencys}
                                        othersInfo={this.state.othersInfo}
                                      />
                                    )}
                                  </TabPane>
                                );
                              })
                            }
                          </Tabs>
                        </div>
                      }

                    </div>) : <div></div>
                  }
                </div>

              </Card>
              <Card
                className={styles.basicInformation}
                title={languageForProductEdit.otherInfomation}
              >
                <div className={styles.basicInfoCard}>
                  {/* SKU其它信息 */}
                  {
                    permission['100043'].status ? (<div>
                      <div
                        className={styles.card}
                      >
                        <div className={`ant-card-head-title ${styles.otherInfo}`}>
                          {languageForProductEdit.OtherInformation}
                          {
                            getFieldError('skuCommom') ?
                              <Icon type="cross-circle-o" className={styles.errorIcon}/> : null}
                        </div>
                        <div>
                          {getFieldDecorator('skuCommom', {
                            initialValue: SkuCommombleData,
                            rules: [{required: true, message: 'languageForProductEdit.OtherInformation'}],
                          })(<SkuCommonTableForm disabled={permission['100043'].disabled}/>)}
                        </div>
                      </div>
                    </div>) : (<div>{getFieldDecorator('skuCommom', {})(<div></div>)}</div>)
                  }
                  {/* 尺码表 */}
                  {
                    permission['100046'].status ? (
                      <FormItem
                        label={languageForProductEdit.SizeTable}
                        className={styles.sizeDescForm}
                        {...formItemLayout}
                      >
                        <RadioGroup
                          defaultValue={language[0]}
                          value={this.state.sizeTableTabKey}
                          style={{marginTop: 4, marginBottom: 10}}
                          onChange={(e) => {
                            this.setState({
                              sizeTableTabKey: e.target.value
                            })
                          }}>
                          {
                            language.map((item) => {
                              return (
                                <RadioButton value={item}
                                             key={item}>{goodsEditorLanguage(item, languageForGlobal)}</RadioButton>
                              )
                            })
                          }
                        </RadioGroup>
                        {
                          language.map((item) => {
                            return (
                              <div style={{display: item === this.state.sizeTableTabKey ? 'block' : 'none'}}>
                                <Ueditor
                                  getContent={this.sizeGetContent}
                                  language={item}
                                  id={`${item}sizeDesc`}
                                  height="400"
                                  value={getgoods.size_desc && getgoods.size_desc[item]}
                                />
                              </div>
                            )
                          })
                        }
                      </FormItem>
                    ) : ''
                  }
                  <FormItem
                    label={languageForRturnAddr.ReturnAddress}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('returnAddr', {
                      initialValue: {},
                      rules: [{required: !permission['100054'].disabled ? true : false}],
                    })(
                      <ReturnAddrForm returnAddress={this.state.returnAddress}
                                      onSetReturnAddress={this.setReturnAddress}/>
                    )}
                  </FormItem>
                  {
                    permission['100060'].status ? (
                      <FormItem label={languageForProductEdit.publishToShopify}>
                        <Switch
                          checkedChildren={languageForProductEdit.yes}
                          unCheckedChildren={languageForProductEdit.no}
                          checked={this.state.publishToShopify}
                          onChange={(boolean) => {
                            this.setState({
                              publishToShopify: boolean,
                            })
                          }}
                        />
                      </FormItem>
                    ) : null
                  }
                </div>
              </Card>
            </Form>


            <FooterToolbar>
              <div style={{float: 'right'}}>
                {/*{getErrorInfo()}*/}
                <Button onClick={this.handleLinkList} style={{border: 'none'}}>
                  {languageForProductEdit.Cancel}
                </Button>
                <Button type="primary" onClick={validate} style={{marginLeft: 0}}>
                  {languageForProductEdit.Submit}
                </Button>
              </div>
            </FooterToolbar>
          </Spin>

          {/* 自定义SPU属性 */}
          <Modal
            title={languageForProductEdit.customSPU}
            visible={this.state.visibleSpuTableForm}
            onOk={this.handleOkSpuTableForm}
            onCancel={this.handleCancelSpuTableForm}
            width="972px"
            className={styles.spuTableFormModal}
          >
            <FormItem>
              {
                getFieldDecorator('spuTableForm', {
                  initialValue: spuTableFormInitValue,
                })(<SpuTableForm goodsCreate={this.props.goodsCreate}/>)
              }
            </FormItem>
          </Modal>
          {/*汇率工具*/}
          <Modal
            title={languageForProductEdit.CurrencyConverter}
            visible={this.state.rateOfExChangeVisible}
            width='400px'
            className={styles.exchangeTool}
            confirmLoading={rateLoading}
            onCancel={() => {
              this.setRateOfExChangeVisible(false);
              console.log(createRequest.currencys);
              this.setState({
                rateOfExChange: createRequest.currencys,
              })
            }}
            onOk={() => {
              for (let i = 0; i < rateOfExChange.length; i++) {
                if (rateOfExChange[i].exchangeRate === '') {
                  notification.error({
                    message: languageForMessage.KindlyReminder,
                    description: languageForMessage.rateisrequired,
                  });
                  return;
                } else if (rateOfExChange[i].exchangeRate <= 0) {
                  notification.error({
                    message: languageForMessage.KindlyReminder,
                    description: languageForMessage.rateShouldBe,
                  });
                  return;
                }
              }
              this.props.dispatch({
                type: 'setting/setExchangeRate',
                payload: {
                  usdRateLists: rateOfExChange.map((item) => {
                    return {
                      currencyCode: item.currencyCode,
                      openStatus: 1,
                      usdRate: item.exchangeRate,
                    }
                  })
                },
                callback: (data) => {
                  if (data.status === 200) {
                    this.props.dispatch({
                      type: 'goodsCreate/setCurrencys',
                      payload: rateOfExChange
                    })
                    this.setState({
                      rateOfExChangeVisible: false,
                    })
                  }
                }
              })
            }}
          >
            <Table
              columns={rateOfExchangeColumn}
              dataSource={rateOfExChange}
              rowKey='currencyCode'
              pagination={false}
              loading={rateLoading}
              isHalfPadding={true}
            />
          </Modal>
          {/* 售价大于供货成本检测弹窗 */}
          <Modal
            title={languageForMessage.operationTips}
            visible={this.state.supplyPriceModal}
            onOk={() => {
              this.setState({
                checkPrice: false
              })
              setTimeout(() => {
                validate()
              }, 20)
            }}
            onCancel={() => {
              this.setState({
                supplyPriceModal: false
              })
            }}
          >
            <p>{languageForMessage.lowerthanthesupplycost}</p>
          </Modal>
          {/* 售价大于参考价检测弹窗 */}
          <Modal
            title={languageForMessage.operationTips}
            visible={this.state.refPriceModal}
            onOk={() => {
              this.setState({
                checkPrice: false
              })
              setTimeout(() => {
                validate()
              }, 20)
            }}
            onCancel={() => {
              this.setState({
                refPriceModal: false
              })
            }}
          >
            <p>{languageForMessage.lowerthanthereferenceprice}</p>
          </Modal>

        </div>
      </div>
    );
  }
}
