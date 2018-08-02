//未完成，暂时使用旧版本
// -------------------------------------依赖模块*--------------------------------------
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Input, Icon, Checkbox, Button, Select, Upload, Radio, Tabs, Popover, message, notification, Spin, Popconfirm, Modal, Breadcrumb } from 'antd';
import { routerRedux, Link } from 'dva/router';
import { goodsEditorLanguage, getLanguageParams, setApiHost, getQueryString } from '../../utils/utils';
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
    //商品详情
    GoodsDetail:{},
    //新建信息
    language:[],
    //商品类目
    goodsType:[],
    //国家
    country:[],
    //权限值
    permission: this.props.global.rolePower.modules['1001'].moduleSubs['10019'].moduleFunctions,
    //spu自定义属性编辑弹窗
    visibleSpuTableForm: false,
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
          country: result.country
        })
        this.getProduDetail();
      }
    })
  }
  //获取商品详情
  getProduDetail = () =>{
    const spuId = getQueryString().spu_id;
    if(spuId){
      this.props.dispatch({
        type: `goodsCreate/goodsCreateGetgoods`,
        payload: {
          spu_id: spuId,
        },
        callback: (data) => {
          if(data.status===200){
            const goodsDetail = data.data;
            this.setState(goodsDetail);
          }
        }
      })
    }
  }
  //编辑回选

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


  render(){

    // -------------------------------------变量定义获取*--------------------------------------

    const { loading, spuAttributesList, createDefinedAttr } = this.props.goodsCreate;
    const { goodsType,  permission, language, country } = this.state;
    const form = this.props.form;
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
    // const {
      // language = [], // 语言
      // goods_type = [], // 商品类目
      // currency = [], // 货币
      // country = [], // 国家
    // } = this.props.goodsCreate.createRequest;
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

                  <DefineAttribute
                    form={form}
                    languageDetails={languageDetails}
                    createDefinedAttr={createDefinedAttr}
                    showModalSpuTableForm={this.showModalSpuTableForm}
                  />

                </div>
              </Card>
                {/*@------------------------------------商品图片*-------------------------------------@*/}

                {/*<FormItem*/}
                  {/*label="商品图片"*/}
                  {/*className={styles.inputFormItem}*/}
                {/*>*/}
                  {/*{getFieldDecorator('goodsIcon', {*/}
                    {/*rules: [*/}
                      {/*{*/}
                        {/*required: true,*/}
                        {/*message: '请上传至少6张主图，至多20张主图',*/}
                      {/*},*/}
                    {/*],*/}
                    {/*getValueFromEvent: this.normFile,*/}
                  {/*})(*/}
                    {/*<Upload {...goodsPicProps}>*/}
                      {/*<Button>*/}
                        {/*<Icon type="upload" /> 上传商品图片*/}
                      {/*</Button>*/}
                    {/*</Upload>*/}
                  {/*)}*/}
                  {/*<div className={styles.gooodsPicDesc}>*/}
                    {/*商品图片上传要求：尺寸：750x625；格式：jpg,png；数量：6≤n≤20*/}
                  {/*</div>*/}
                {/*</FormItem>*/}


                {/*@------------------------------------SPU属性*-------------------------------------@*/}

                <FormItem
                  label="SPU属性"
                >
                  <FormItem
                    label="属性名称"
                    className={styles.spuTitleName}
                  >
                    属性值
                  </FormItem>
                  {/*{this.templateGoodsTypeAttr(this.props.goodsCreate.spuAttributesList)}*/}
                </FormItem>






              {/*-------------------------------------SKU信息*--------------------------------------*/}

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
