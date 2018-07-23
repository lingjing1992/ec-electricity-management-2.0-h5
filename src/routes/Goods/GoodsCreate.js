//未完成，暂时使用旧版本
// -------------------------------------依赖模块*--------------------------------------
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Input, Icon, Checkbox, Button, Select, Upload, Radio, Tabs, Popover, message, notification, Spin, Popconfirm, Modal } from 'antd';
import { routerRedux, Link } from 'dva/router';
import { goodsEditorLanguage, getLanguageParams, setApiHost } from '../../utils/utils';
import styles from './GoodsCreate.less';

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
      }
    })
  }

  // -------------------------------------基本信息*--------------------------------------

  // @------------------------------------品牌名称*-------------------------------------@





  render(){

    // -------------------------------------变量定义获取*--------------------------------------

    const { loading } = this.props.goodsCreate;
    const { language, goodsType, country } = this.state;
    //表单对象
    const { getFieldDecorator, validateFieldsAndScroll, getFieldsError, getFieldError } = this.props.form;
    // formLayout  短表单布局
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    // 长表单布局
    const longFormItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 1 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
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

    // -------------------------------------dom构建*--------------------------------------

    //构建语言填充
    const languageDomBuilt = () => {
      return language.map((item,index) => {
        const code = item === 'en';
        const label = item === 'en' ? '商品名称：' : '';
        const className = item === 'en' ? '' : styles.otherLanguageInput;
        return(
          <FormItem
            {...formItemLayout}
            label={label}
            key={index}
            className={`${styles.inputFormItem} ${className} ${styles.languageInput}`}
          >
            {getFieldDecorator(item, {
              rules: [{
                required: code,
                message: '请填写页面标题',
              }],
            })(
              <Input addonBefore={goodsEditorLanguage(item)} />
            )}
          </FormItem>
        )
      })
    }

    // -------------------------------------render*--------------------------------------

    return(
      <div className={styles.GoodsCreate} >
        <Spin spinning={loading}>
          <Form layout="horizontal">

            {/*-------------------------------------基本信息*--------------------------------------*/}

            <Card
              title="基本信息"
              className={styles.card}
              bordered={false}
            >
              {/*@------------------------------------品牌名称*-------------------------------------@*/}

              <FormItem
                label="品牌名称"
                {...formItemLayout}
                className={ styles.inputFormItem }
              >
                {getFieldDecorator('brandName', {
                  rules: [
                    { required: false, message: '请输入50个字符以内的品牌名称' },
                  ],
                })(
                  <Input maxLength="50" placeholder="请输入50个字符以内的品牌名称" />
                )}
              </FormItem>

              {/*@------------------------------------商品名称*-------------------------------------@*/}

              {
                languageDomBuilt()
              }

              {/*@------------------------------------商品详情*-------------------------------------@*/}

              <FormItem
                label="商品详情"
                className={styles.inputFormItem}
                {...formItemLayout}
              >
                <Tabs defaultActiveKey="1">
                  {
                    language.map((item) => {
                      return (
                        <TabPane
                          tab={(
                            <div>
                              {goodsEditorLanguage(item)}
                              {getFieldError(`goodsDetail[${item}]`) ? <Icon type="cross-circle-o" className={styles.errorIcon} /> : null}
                            </div>
                          )}
                          key={item}
                        >
                          <FormItem>
                            {
                              getFieldDecorator(`goodsDetail[${item}]`, {
                                rules: [{ required: false, message: `请输入${goodsEditorLanguage(item)}语言的商品详情` }],
                              })(
                                <TextArea
                                  placeholder={`请输入${goodsEditorLanguage(item)}语言的商品详情`}
                                  style={{ minHeight: 60, maxHeight: 120 }}
                                />
                              )
                            }
                          </FormItem>
                        </TabPane>
                      );
                    })
                  }
                </Tabs>
              </FormItem>

              {/*@------------------------------------商品图片*-------------------------------------@*/}

              <FormItem
                label="商品图片"
                {...formItemLayout}
                className={styles.inputFormItem}
              >
                {getFieldDecorator('goodsIcon', {
                  rules: [
                    {
                      required: true,
                      message: '请上传至少6张主图，至多20张主图',
                    },
                  ],
                  getValueFromEvent: this.normFile,
                })(
                  <Upload {...goodsPicProps}>
                    <Button>
                      <Icon type="upload" /> 上传商品图片
                    </Button>
                  </Upload>
                )}
                <div className={styles.gooodsPicDesc}>
                  商品图片上传要求：尺寸：750x625；格式：jpg,png；数量：6≤n≤20
                </div>
              </FormItem>

              {/*@------------------------------------商品类目*-------------------------------------@*/}

              <FormItem
                label="商品类目"
                className={styles.inputFormItem}
                {...formItemLayout}
              >
                {getFieldDecorator('goodsType', {
                  rules: [{ required: true, message: '请选择一个商品类目' }],
                  initialValue: [],
                  onChange: (value) => {
                    {/*this.handleGoodsType(value);*/}
                  },
                })(
                  <Select
                    placeholder="请选择商品类目"
                    notFoundContent="请选择商品类目"
                  >
                    {
                      goodsType.map((item,index) => {
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

              {/*@------------------------------------SPU属性*-------------------------------------@*/}

              <FormItem
                label="SPU属性"
                {...longFormItemLayout}
              >
                <FormItem
                  label="属性名称"
                  {...longFormItemLayout}
                  className={styles.spuTitleName}
                >
                  属性值
                </FormItem>
                {/*{this.templateGoodsTypeAttr(this.props.goodsCreate.spuAttributesList)}*/}
              </FormItem>

              {/*@------------------------------------广告国家*-------------------------------------@*/}

              <FormItem
                label="推广国家"
                className={styles.inputFormItem}
                {...formItemLayout}
              >
                {getFieldDecorator('promotionCountry', {
                  rules: [{ required: true, message: '请选择至少一个推广国家' }],
                })(
                  <Select
                    placeholder="请选择至少一个推广国家"
                    mode="multiple"
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

              {/*@------------------------------------是否分销*-------------------------------------@*/}

              <FormItem
                label="是否分销"
                className={styles.inputFormItem}
                {...formItemLayout}
              >
                {getFieldDecorator('isDistribution', {
                  rules: [{ required: true, message: '请输入是否分销' }],
                })(
                  <RadioGroup>
                    <Radio value="1">是</Radio>
                    <Radio value="0">否</Radio>
                  </RadioGroup>
                )}
              </FormItem>

            </Card>

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
          </Form>
        </Spin>
      </div>
    );
  }
}
