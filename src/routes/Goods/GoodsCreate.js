//未完成，暂时使用旧版本
// -------------------------------------依赖模块*--------------------------------------
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Input, Icon, Checkbox, Button, Select, Upload, Radio, Tabs, Popover, message, notification, Spin, Popconfirm, Modal, Breadcrumb } from 'antd';
import { routerRedux, Link } from 'dva/router';
import { goodsEditorLanguage, getLanguageParams, setApiHost, getQueryString } from '../../utils/utils';
import Cookie from 'js-cookie';
import styles from './GoodsCreate.less';
import BrandName from './BrandName';
import ProductName from './ProductName';
import ProductDetail from './ProductDetail';
import Country from './Country';
import Distribution from './Distribution';
import ProductCategory from './ProductCategory';
import SpuAttribute from './SpuAttribute';
import DefineAttribute from './DefineAttribute';
import SpuTableForm from './SpuTableForm'; // SPU自定义属性
import ProductImages from './ProductImages';
import SkuAttribute from './SkuAttribute';
import SkuSupplyInfo from './SkuSupplyInfo';
import FooterToolbar from '../../components/FooterToolbar';


// -------------------------------------ant子组件*--------------------------------------
const FormItem = Form.Item;
// const Option = Select.Option;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const TabPane = Tabs.TabPane;
const { Option, OptGroup } = Select;

// -------------------------------------ant高阶函数*--------------------------------------
@connect(state => ({
  goodsCreate: state.goodsCreate,
  global: state.global,
  setting: state.setting,
  shop: state.shop
}))
@Form.create()

// -------------------------------------页面构建开始*--------------------------------------

export default class GoodsCreate extends Component {

  // -------------------------------------state*--------------------------------------
  state = {
    //spuId
    spuId: getQueryString().spu_id || 0,
    //商品详情
    goodsDetail:{
      property_config: [],
    },
    //新建信息
    language:[],
    //商品类目
    goodsType:[],
    //国家
    country:[],
    //货币
    currency:[],
    //权限值
    permission: this.props.global.rolePower.modules['1001'].moduleSubs['10019'].moduleFunctions,
    //spu自定义属性编辑弹窗
    visibleSpuTableForm: false,
    //商品介绍详情
    productIntroDetails: {},
    //销售信息
    salesInfo: [],
    //图片上传成功标记
    imageAddSuccess: false,
    //图片列表
    fileList: [],
    //sku属性列表组
    createSkuAttributesArr: [],
    //sku属性自增id
    num:0,
  }

  // ------------------------------------react周期*-------------------------------------

  componentWillMount() {
    this.init();
  }

  // -------------------------------------页面初始化*--------------------------------------

  //初始化
  init = () => {
    this.createRequest();
  }

  //获取新建信息
  createRequest = () => {
    this.props.dispatch({
      type: 'goodsCreate/goodsCreateCreateRequest',
      callback: (data) => {
        const result = data.data;
        this.setState({
          language: result.language,
          goodsType: result.goods_type,
          country: result.country,
          currency: result.currency
        })
        this.getProduDetail();
      }
    })
  }
  //获取商品详情
  getProduDetail = () =>{
    const { spuId } = this.state;
    if(spuId){
      this.props.dispatch({
        type: `goodsCreate/goodsCreateGetgoods`,
        payload: {
          spu_id: spuId,
        },
        callback: (data) => {
          if(data.status===200){
            const goodsDetail = data.data;
            //图片回选
            this.setState({
              goodsDetail: goodsDetail,
              fileList: goodsDetail.goods_icons.map((item,index) => {
                return {
                  uid: -(index + 1),
                  name: `${index + 1}`,
                  status: 'done',
                  url: item,
                  thumbUrl: item,
                }
              }),
            });
            this.editReselection();
            this.getPriceInfo();
          }
        }
      })
    }else {
      //如果是新建则需要初始化
      this.addNewPropertyGroup();
    }
  }
  //获取价格信息
  getPriceInfo = () => {
    const { goodsDetail, currency, language, spuId } = this.state;
    this.props.dispatch({
      type: 'goodsCreate/goodsCreatePropertyAssemble',
      payload: {
        currency,
        language,
        spu_Id: spuId,
        property_config: goodsDetail.property_config
      },
      callback: (data) => {
        if(data.status === 200){
          this.setState({
            salesInfo: data.data.sales_info
          })
        }
      }
    })
  }
  //编辑回选
  editReselection = () => {
    const { goodsDetail } = this.state;
    const { setFieldsValue } = this.props.form;

    setFieldsValue({
      brandName: goodsDetail.brand_name,
      goodsName: goodsDetail.goods_name,
      promotionCountry: goodsDetail.promote_country,
      goodsType: goodsDetail.goods_type_id,
      spuAttributesList: this.getSpuReselectionArray(goodsDetail.spu_attr),
      isDistribution: goodsDetail.is_distribution,
      propertyConfig: goodsDetail.property_config
    })
  }
  // 设置商品类目详情
  handleGoodsType = (value) => {
    const {type} = this.state;
    this.props.dispatch({
      type: `goodsCreate/goodsCreateSpuAttributesList`,
      payload: {
        goods_type_id: value,
      },
      callback: () => {

      },
    });
  }
  //获取商品详情编辑的结果
  getProductContent = (editor, key) => {
    const { productIntroDetails } = this.state;
    productIntroDetails[key] = editor.getContent();
    this.setState({
      productIntroDetails: productIntroDetails,
    });

  }
  // 添加自定仪SPU属性
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
  //spu自定义属性编辑提交
  handleOkSpuTableForm = (e) => {
    const {getFieldValue} = this.props.form;
    const {type, language} = this.state;
    const languageForMessage = this.props.global.languageDetails.message;
    const {goodsCreate} = this.props;

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
        type: `goodsCreate/goodsCreateCreateDefinedAttr`,
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
  //spu自定义属性编辑关闭
  handleCancelSpuTableForm = (e) => {
    this.setState({
      visibleSpuTableForm: false,
    });
  }
  //spu属性回选处理成数组
  getSpuReselectionArray = (spuAttr) => {
    return spuAttr.map((item) => {
      return item.attr_value.filter((attrValue)=>{
        return attrValue.selected
      }).map(result => result.id);
    })
  }
  // 图片上传
  handleUpload = (info) => {
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
  //关闭上传状态
  closeUploadStatus = () => {
    this.setState({
      imageAddSuccess: false,
    })
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
  // 取消的时候，返回列表页面
  handleLinkList = () => {
    this.props.dispatch(routerRedux.go(-1));
  }

  //提交结果
  submit = () => {
    const { getFieldsValue } = this.props.form;
    const result = getFieldsValue();
    console.log(result);
  }

  //编辑sku
  handleEditorSkuAttributes = () => {

  }
  //创建sku属性
  handleCreateSkuAttributes = () => {

  }
  //创建新的sku
  handleCreateSkuAttributesBuildData = () => {

  }
  //新增属性组
  addNewPropertyGroup = () => {
    let { num, goodsDetail, language } = this.state;
    const lang = this.parseArr(language);
    // goodsDetail.property_config = goodsDetail.hasOwnProperty('property_config') ?  goodsDetail.property_config : [];
    const group = [
      {
        imp_type: 1,
        property_id: num++,
        lang: lang,
      },
      {
        status: 1,
        property_id: num++,
        lang: lang,
      }
    ]
    goodsDetail.property_config.push(group);
    this.setState({
      goodsDetail: Object.assign({}, goodsDetail),
      num: num
    })
  }
  //删除属性组
  deletePropertyGroup = (index) => {
    let { goodsDetail } = this.state;'' +
    goodsDetail.property_config.splice(index,1);
    this.setState({
      goodsDetail: Object.assign({}, goodsDetail),
    })
  }
  //新增属性
  addNewProperty = (index) => {
    let { num, goodsDetail, language } = this.state;
    const item = {
      status: 1,
      property_id: num++,
      lang: this.parseArr(language),
    }
    goodsDetail.property_config[index].push(item)

    this.setState({
      goodsDetail: Object.assign({},goodsDetail),
      num: num
    })
    console.log(this.state.goodsDetail)
  }
  //语言数组解析成对象
  parseArr = (array) => {
    return array.reduce((item1,item2) => {
      const object = {};
      if(typeof item1 === 'string'){
        Object.assign(object,{
          [item1]: ''
        })
        if(item2){
          Object.assign(object,{
            [item2]: ''
          })
        }
        return object;
      }else {
        if(item2){
          return Object.assign(item1,{
            [item2]: ''
          })
        }
      }
    })
  }
  //删除属性
  deleteProperty = (index) => {
    let { goodsDetail } = this.state;
    goodsDetail.property_config[index].splice(index,1);
    this.setState({
      goodsDetail: Object.assign({}, goodsDetail),
    })
  }
  render(){

    // -------------------------------------变量定义获取*--------------------------------------

    const { loading, spuAttributesList, createDefinedAttr } = this.props.goodsCreate;
    const { goodsType,  permission, language, country, goodsDetail, imageAddSuccess, createSkuAttributesArr, currency, salesInfo } = this.state;
    const form = this.props.form;
    const { property_config } = goodsDetail
    //表单对象
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldError } = this.props.form;
    //多语言
    const languageDetails = this.props.global.languageDetails;
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const languageForProductMessage = this.props.global.languageDetails.goods.message;
    const languageForMessage = this.props.global.languageDetails.message;
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForNav = this.props.global.languageDetails.nav;
    const languageForHeader = this.props.global.languageDetails.header;
    const languageForRturnAddr = this.props.global.languageDetails.returnAddress;
    // 商品图片
    const goodsPicProps = {
      name: 'upload_img',
      accept: 'image/png,image/jpeg',
      action: `${setApiHost()}/api/merchant/v1/goods/uploadImg`,
      listType: 'picture',
      className: 'upload-list-inline',
      fileList: this.state.fileList,
      multiple: true,
      onChange: this.handleUpload,
      data: {
        img_type: 0,
      },
    };


    // -------------------------------------render*--------------------------------------

    return(
      <div id={styles.GoodsCreate}>
        <Card className="breadcrumb-box">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/goods/goodsList">{languageForNav.productManagement}</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{languageForHeader.editProduct}</Breadcrumb.Item>
          </Breadcrumb>
        </Card>
        <div className={styles.GoodsCreate} >
          <Spin spinning={loading}>
            <Form layout="horizontal">

              {/*-------------------------------------基本信息*--------------------------------------*/}

              <Card
                title={languageForProductEdit.basicInformation}
                className={`${styles.card} ${styles.basicInformation}`}
                bordered={false}
              >
                <div className={styles.basicInfoCard}>
                  {/*@------------------------------------品牌名称*-------------------------------------@*/}
                  {
                    permission['100032'].status ? (
                      <BrandName
                        form={form}
                        languageDetails={languageDetails}
                      />
                    ) : ''
                  }
                  {/*@------------------------------------商品名称*-------------------------------------@*/}

                  {
                    permission['100033'].status ? (
                      <ProductName
                        form={form}
                        language={language}
                        languageDetails={languageDetails}
                      />
                    ) : null
                  }

                  {/*@------------------------------------商品详情*-------------------------------------@*/}

                  {
                    permission['100034'].status ? (
                      <ProductDetail
                        form={form}
                        language={language}
                        languageDetails={languageDetails}
                        getContent={this.getProductContent}
                        value={goodsDetail}
                      />
                    ) : null
                  }

                  {/*@------------------------------------广告国家*-------------------------------------@*/}

                  {
                    permission['100039'].status ? (
                      <Country
                        form={form}
                        languageDetails={languageDetails}
                        country={country}
                        spuId={this.state.spuId}
                        permission={permission}
                      />
                    ) : null
                  }

                  {/*@------------------------------------是否分销*-------------------------------------@*/}

                  {
                    permission['100040'].status ? (
                      <Distribution
                        form={form}
                        languageDetails={languageDetails}
                        permission={permission}
                      />
                    ) : null
                  }

                </div>
              </Card>
              {/*-------------------------------------商品属性*--------------------------------------*/}
              <Card
                className="ant-card-head-900"
                title={languageForProductEdit.ProductAttribute}
              >
                <div className="ant-card-900">

                  {/*@------------------------------------商品类目*-------------------------------------@*/}

                  {
                    permission['100036'].status ? (
                      <ProductCategory
                        form={form}
                        languageDetails={languageDetails}
                        permission={permission}
                        goodsType={goodsType}
                        onGoodsType={this.handleGoodsType}
                      />
                    ) : null
                  }

                  {/*@------------------------------------SPU属性*-------------------------------------@*/}

                  {
                    permission['100037'].status ? (
                      <SpuAttribute
                        form={form}
                        languageDetails={languageDetails}
                        spuAttributesList={spuAttributesList}
                      />
                    ) : null
                  }

                  {/*@------------------------------------自定义属性*-------------------------------------@*/}

                  {
                    permission['100038'].status ? (
                      <DefineAttribute
                        form={form}
                        languageDetails={languageDetails}
                        createDefinedAttr={createDefinedAttr}
                        showModalSpuTableForm={this.showModalSpuTableForm}
                      />
                    ) : null
                  }

                </div>
              </Card>
              {
                permission['100035'].status ? (
                  <Card
                    title={languageForProductEdit.productImage}
                    className="ant-card-head-900"
                  >
                    {/*@------------------------------------商品图片*-------------------------------------@*/}

                    <div className="ant-card-900">
                      <ProductImages
                        goodsPicProps={goodsPicProps}
                        positionExchange={this.imagePositionExchange}
                        getFieldDecorator={getFieldDecorator}
                        imageAddSuccess={imageAddSuccess}
                        closeAddStatus={this.closeUploadStatus}
                        styles={styles}
                      />

                    </div>
                  </Card>
                ) : ''
              }

              {/*-------------------------------------SKU信息*--------------------------------------*/}

              <Card
                title={languageForProductEdit.SKUInformation}
                className={`${styles.card} ant-card-head-900`}
                bordered={false}
              >
                <div className={`ant-card-900 ${styles.skuInfo}`}>

                  {/*@------------------------------------SKU属性*-------------------------------------@*/}
                  {
                    permission['100041'].status ? (
                      <SkuAttribute
                        form={form}
                        languageDetails={languageDetails}
                        onEdit={this.handleEditorSkuAttributes}
                        onCreateValue={this.handleEditorSkuAttributes}
                        onCreateAttribute={this.handleEditorSkuAttributes}
                        propertyConfig={property_config}
                        permission={permission}
                        language={language}
                        onAddNewProperty={this.addNewProperty}
                        onDeleteProperty={this.deleteProperty}
                        onAddNewPropertyGroup={this.addNewPropertyGroup}
                        onDeletePropertyGroup={this.deletePropertyGroup}
                      />
                    ) : null
                  }

                  {/*@------------------------------------SKU供货信息*-------------------------------------@*/}

                  <SkuSupplyInfo
                    form={form}
                    languageDetails={languageDetails}
                    permission={permission}
                    currency={currency}
                    salesInfo={salesInfo}
                  />


                </div>
              </Card>
              <Card
                title="SKU信息"
                className={styles.card}
                bordered={false}
              >

                {/*@------------------------------------SKU属性*-------------------------------------@*/}
                <Card
                  title="SKU属性"
                  className={styles.card}
                  bordered={false}
                  style={{ marginTop: '1px' }}
                >

                </Card>
              </Card>
              <FooterToolbar>
                <div style={{float: 'right'}}>
                  {/*{getErrorInfo()}*/}
                  <Button onClick={this.handleLinkList} style={{border: 'none'}}>
                    {languageForProductEdit.Cancel}
                  </Button>
                  <Button type="primary" onClick={this.submit} style={{marginLeft: 0}}>
                    {languageForProductEdit.Submit}
                  </Button>
                </div>
              </FooterToolbar>
            </Form>
          </Spin>
        </div>
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
                // initialValue: spuTableFormInitValue,
              })(<SpuTableForm goodsCreate={this.props.goodsCreate}/>)
            }
          </FormItem>
        </Modal>
      </div>
    );
  }
}
