import React, {Component} from 'react';
import styles from './SpecialCreate.less';
import {connect} from 'dva';
import {setApiHost, goodsEditorLanguage, getQueryString, getLanguageParams} from '../../utils/utils';
import {routerRedux, Link} from 'dva/router';
import {
  Input,
  Button,
  Form,
  Upload,
  Icon,
  Tooltip,
  Radio,
  message,
  Spin,
  notification,
  Card,
  Breadcrumb
} from 'antd';

const {TextArea} = Input;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
import SpuSelect from '../../components/SpuSelect';
import FooterToolbar from '../../components/FooterToolbar';

@Form.create()
@connect(state => ({
  shop: state.shop,
  special: state.special,
  global: state.global
}))
export default class SpecialCreate extends Component {
  state = {
    bgFileList: [],
    bannerFileList: [],
    groups: [{}],
    specialDetail: {
      backgroundBanner: '',
      banner: '',
      redirectUrl: '',
      mainColor: '',
      title: {},
      likeGoods: [],
      style: '',
    },
    spuSelectList: {},
    query: getQueryString(),
  }

  componentWillMount() {
    this.init();
  }

  init() {
    this.getLanguage();
    this.getTopicViewDetail();
  }

  //获取语言
  getLanguage = () => {
    const props = this.props;
    if (props.shop.language.length === 0) {
      props.dispatch({
        type: 'shop/getLanguage',
      })
    }
  }

  // 获取商品详情
  getTopicViewDetail = () => {
    const {query} = this.state;
    const viewId = query.hasOwnProperty('viewId') ? parseInt(query.viewId) : 0;
    this.props.dispatch({
      type: 'special/getTopicViewDetail',
      payload: {
        viewId: viewId,
        style: parseInt(query.id),
      },
      callback: (data) => {
        if (data.status === 200) {
          this.setState({
            specialDetail: data.data,
          })
          this.imageTofiil(data.data);
          this.groupsInit();
        }
      }
    });
  }

  // 初始化商品组数量
  groupsInit = () => {
    const {specialDetail} = this.state;
    const groups = [];
    for (let i = 0; i < specialDetail.likeGoods.length; i++) {
      groups.push({});
    }
    //如果没有商品组则默认展示一组
    if (specialDetail.likeGoods.length === 0) {
      groups.push({});
    }
    this.setState({
      groups: groups,
    })
  }

  //图片回填
  imageTofiil = (result) => {
    if (result.banner) {
      this.setState({
        bannerFileList: [{
          uid: -1,
          name: '1.png',
          status: 'done',
          url: result.banner,
          thumbUrl: result.banner,
        }]
      })
    }
    if (result.backgroundBanner) {
      this.setState({
        bgFileList: [{
          uid: -1,
          name: '1.png',
          status: 'done',
          url: result.backgroundBanner,
          thumbUrl: result.backgroundBanner,
        }]
      })
    }
  }
  //添加商品组
  addGroup = () => {
    const {groups} = this.state;
    groups.push({})
    this.setState({
      groups: groups,
    })
  }

  //结果提交
  handleSubmit = (e) => {
    e.preventDefault();
    const {bgFileList, bannerFileList, query, spuSelectList} = this.state;
    const _this = this;
    const {shop} = this.props;
    const languageForMessage = this.props.global.languageDetails.message;
    this.props.form.validateFields((err, values) => {
      console.log(err);
      console.log(values);
      if (!err) {
        //获取语言
        const title = getLanguageParams(shop.language, values);
        const viewId = parseInt(query.viewId) || 0;
        const backgroundBanner = bgFileList.length > 0 ? bgFileList[0].url : '';
        const banner = bannerFileList.length > 0 ? bannerFileList[0].url : '';
        const mainColor = values.mainColor ? values.mainColor.trim() : '';
        const redirectUrl = values.redirectUrl ? values.redirectUrl.trim() : '';
        const language = this.props.shop.language;
        const likeGoods = [];
        for (let i = 0; i < values.likeGoods.length; i++) {
          let item = values.likeGoods[i];
          if (!spuSelectList[i] || spuSelectList[i].length === 0) {
            notification.error({
              message: languageForMessage.KindlyReminder,
              description: languageForMessage.addAtLeastOne,
            });
            return;
          }
          likeGoods[i] = {
            status: item.status,
            spuIds: spuSelectList[i].map((item) => {
              return item.spuId
            }),
            title: getLanguageParams(shop.language, item),
          }
        }
        const style = parseInt(query.id) || 0;
        var params = {
          title,
          viewId,
          backgroundBanner,
          banner,
          mainColor,
          redirectUrl,
          language,
          likeGoods,
          style
        }
        this.props.dispatch({
          type: 'special/createUpdateTopicView',
          payload: params,
          callback: (data) => {
            if (data.status === 200) {
              _this.props.dispatch(routerRedux.go(-1));
            }
          }
        })
        console.log(params);
      }
    });
  }

  //取消
  handleCancle = () => {
    this.props.dispatch(routerRedux.go(-1));
  }
  /**
   *
   * @param key 不同图片对象的key
   * @param info 当前上传图片的信息
   */
    // 图片上传
  handleChange = (key, info) => {
    let fileList = info.fileList;
    // if (fileList.length <= 20) {
    // 2. read from response and show file link
    fileList = fileList.map((file) => {
      console.log('file', file);
      // if (info.file.status === 'done') {
      if (file.response && file.response.status === 200) {
        // file.url = info.file.response.data.image_url;
        file.url = file.response.data.image_url;
        file.thumbUrl = file.response.data.image_url;
      }
      // }
      return file;
    });
    if (info.file.status === 'done') {
      if (info.file.response.status === 200) {
        message.success(info.file.response.msg);
        fileList = [fileList[fileList.length - 1]];
        this.setState({
          [key]: fileList,
        });
      } else {
        message.error(info.file.response.msg);
      }
    }
    // 3. filter successfully uploaded files according to response from server
    fileList = fileList.filter((file) => {
      if (file.response) {
        return file.response.status === 200;
      }
      return true;
    });
    this.setState({
      [key]: fileList
    });
    // }
  }

  getSelectList = (selectList, index) => {
    const {spuSelectList} = this.state;
    if (selectList && selectList.length > 0) {
      spuSelectList[index] = selectList;
      this.setState({
        spuSelectList: Object.assign(spuSelectList),
      })
    }
  }


  render() {
    const {getFieldDecorator} = this.props.form;
    const {groups, specialDetail} = this.state;
    const {loading} = this.props.special;
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForMessage = this.props.global.languageDetails.message;
    const languageForMarketing = this.props.global.languageDetails.marketing.specialEdit;//营销多语言
    const languageForMarketingSpecialLists = this.props.global.languageDetails.marketing.specialLists;//营销创建多语言
    const languageForHeader = this.props.global.languageDetails.header;//营销多语言
    //新建和编辑多语言
    const action = {
      add: languageForMarketingSpecialLists.AddaNewFeaturedPage,
      edit: languageForMarketingSpecialLists.editFeaturedPage,
    }
    const query = getQueryString();//url参数
    // banner图片上传配置
    const uploadBgProps = {
      name: 'upload_img',
      action: `${setApiHost()}/api/merchant/v1/goods/uploadImg`,
      accept: 'image/png,image/jpeg',
      listType: 'picture',
      data: {
        img_type: 3,
      },
      onChange: this.handleChange.bind(this, 'bannerFileList'),
      fileList: this.state.bannerFileList
    };
    // 背景图片上传配置
    const uploadBannerProps = {
      ...uploadBgProps,
      onChange: this.handleChange.bind(this, 'bgFileList'),
      fileList: this.state.bgFileList
    };
    //表单行布局
    const formItemLayout = 'horizontal';
    // 创建商品组
    const createGoodGroups = () => {
      const languageForMarketing = this.props.global.languageDetails.marketing.specialEdit;//营销多语言
      return groups.map((item, index) => {
        const hasValue = specialDetail.likeGoods.length > 0 && specialDetail.likeGoods[index];
        return (
          <Card
            type="inner"
            className={styles.productionGroupCard}
            title={languageForMarketing.ProductGroup}
            key={index}
          >
            <Form className={`${styles.form} ${styles.goodsForm}`}>
              <div className="ant-card-900">
                {languageDomBuilt('likeGoods', index)}
              </div>
              <div style={{textAlign:'left',display:'block'}} className="ant-form-item-label ant-form-item-required ant-card-900">{languageForMarketing.Product}</div>
              <div className="ant-card-900">
                {
                  <div>
                    <SpuSelect
                      pushSelectList={this.getSelectList}
                      defaultSpuIds={hasValue ? specialDetail.likeGoods[index].spuIds : []}
                      index={index}
                    />
                  </div>
                }
              </div>
              <div className="ant-card-900">
                <FormItem
                  {...formItemLayout}
                  label={languageForMarketing.Showornot}
                >
                  {getFieldDecorator('likeGoods[' + index + '].status', {
                    rules:
                      [
                        {
                          required: true,
                        },
                      ],
                    initialValue: hasValue ? specialDetail.likeGoods[index].status : 1,
                  })(
                    <RadioGroup>
                      <Radio value={1}>{languageForMarketing.Show}</Radio>
                      <Radio value={0}>{languageForMarketing.Hide}</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </div>
            </Form>
          </Card>

        );
      })
    }
    /**
     *
     * @param group 嵌套数组的名字
     * @returns {Array}
     */
      // 构建语言填充
    const languageDomBuilt = (group, index) => {
        const {shop} = this.props;

        return shop.language.map((item, itemIndex) => {
          const code = item === 'en';
          const label = code ? `${languageForMarketing.Title}: ` : '';
          const className = code ? '' : styles.FormItem;
          const field = group ? group + '[' + index + ']' + '.' + item : item;
          const placeHoder = code ? (group ? languageForMessage.within26characters : languageForMessage.inPageTitle) : '';
          const maxLength = group ? '26' : '';
          let initialValue = '';
          //存在商品组且商品组有默认值时
          if (group && specialDetail[group].length > 0) {
            //索引为index商品组有默认值时
            if (specialDetail[group][index]) {
              initialValue = specialDetail[group][index]['title'][item];
            }
          } else {
            initialValue = specialDetail['title'][item];
          }
          return (
            <FormItem
              {...formItemLayout}
              label={label}
              key={itemIndex}
              className={className}
            >
              {getFieldDecorator(field, {
                rules: [{
                  required: true,
                  validator: (rule, value, callback) => {
                    if (code) {
                      if (value && value.toString().trim()) {
                        callback();
                      } else {
                        callback(placeHoder);
                      }
                    } else {
                      callback();
                    }
                  }
                }],
                initialValue: initialValue,
              })(
                <Input placeholder={placeHoder} maxLength={maxLength}
                       addonBefore={goodsEditorLanguage(item, languageForGlobal)}/>
              )}
            </FormItem>
          )
        })
      }
    return (
      <div className={styles.specialCreate}>
        <Card className="breadcrumb-box">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/marketing/special">
                {/*<Icon className={styles.directIcon} type="left" />*/}
                {languageForHeader.aNewPromoPage}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a onClick={() => {
                this.props.dispatch(routerRedux.go(-1));
              }}>
                {/*<Icon className={styles.directIcon} type="left" />*/}
                {specialDetail.name}
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{action[query.type]}</Breadcrumb.Item>
          </Breadcrumb>
        </Card>
        <Spin spinning={loading}>
          <Card
            title={languageForMarketing.BasicInformation}
            className="ant-card-head-900"
          >
            <div className="ant-card-900">
              {/*<div className={styles.module}>{languageForMarketing.BasicInformation}</div>*/}
              <div className={styles.content}>
                <Form className={styles.form}>
                  {languageDomBuilt()}
                </Form>
              </div>
            </div>
          </Card>

          <Card
            className={`${styles.top} ant-card-head-900`}
            title={languageForMarketing.BannerModule}
          >
            {/*<div className={styles.module}>{languageForMarketing.BannerModule}</div>*/}
            <div className={`${styles.content} ant-card-900`}>
              <Form className={styles.form}>
                <FormItem
                  {...formItemLayout}
                  className={styles.uploadItem}
                  label={`${languageForMarketing.BannerImage}`}
                >
                  {getFieldDecorator('bannerImg', {
                    rules: [{
                      required: false,
                    }],
                    getValueFromEvent: this.normFile,
                  })(
                    <div className={styles.upload}>
                      <div className={styles.imageReg}>{languageForMarketing.ImageFormat}</div>
                      <Upload
                        {...uploadBgProps}
                      >
                        <Button>
                          <Icon type="upload"/> {languageForMarketing.UploadBannerImage}
                        </Button>
                      </Upload>
                    </div>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={languageForMarketing.ClickTheLink}
                >
                  {getFieldDecorator('redirectUrl', {
                    rules: [{
                      required: false,
                    }],
                    initialValue: specialDetail.redirectUrl,
                  })(
                    <Input/>
                  )}
                </FormItem>
              </Form>
            </div>
          </Card>
          <Card
            className={`${styles.top} ant-card-head-900`}
            title={languageForMarketing.ProductGroupModule}
          >
            {/*<div className={styles.module}>{languageForMarketing.ProductGroupModule}</div>*/}
            <div className={`ant-card-900 ${styles.content}`}>
              <Form className={styles.form}>
                <FormItem
                  {...formItemLayout}
                  label={(<span>{languageForMarketing.MainColor}<Tooltip placement="top"
                                                                         title={languageForMarketing.Itwillapply}><Icon
                    style={{marginLeft: '3px',}} type="info-circle-o"/></Tooltip></span>)}
                >
                  {getFieldDecorator('mainColor', {
                    rules: [{
                      message: languageForMessage.inPageTitle,
                    }],
                    initialValue: specialDetail.mainColor,
                  })(
                    <Input placeholder="#ff4962"/>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  className={styles.uploadItem}
                  label={(<span>{languageForMarketing.BannerImage}<Tooltip placement="top"
                                                                           title={languageForMarketing.backgroundImagesShow}><Icon
                    style={{marginLeft: '3px',}} type="info-circle-o"/></Tooltip></span>)}
                >
                  {getFieldDecorator('bgImg', {
                    rules: [{
                      required: false,
                    }],
                    getValueFromEvent: this.normFile,
                  })(
                    <div className={styles.upload}>
                      <div className={styles.imageReg}>{languageForMarketing.ImageFormat}</div>
                      <Upload
                        {...uploadBannerProps}
                      >
                        <Button>
                          <Icon type="upload"/> {languageForMarketing.UploadBackgroundImage}
                        </Button>
                      </Upload>
                    </div>
                  )}
                </FormItem>
              </Form>
            </div>
            <div>
              <div className={styles.goodGroups}>
                {createGoodGroups()}
              </div>
              <div className={`${styles.btnbox} ant-card-900`}>
                <a className={styles.groupsAddBtn}
                   onClick={this.addGroup}>{languageForMarketing.AddaNewProductGroup}</a>
              </div>
            </div>
            {/*<div style={{width:'800px',textAlign:'center'}}>*/}
            {/*<Button type="primary" onClick={this.handleSubmit.bind(this)}>{languageForMarketing.Submit}</Button>*/}
            {/*<Button onClick={this.handleCancle} style={{marginLeft:'20px',marginTop:'30px'}}>{languageForGlobal.cancel}</Button>*/}
            {/*</div>*/}
          </Card>
          <FooterToolbar>
            <div style={{float: 'right'}}>
              {/*{getErrorInfo()}*/}
              <Button onClick={this.handleCancle} style={{border: 'none'}}>
                {languageForGlobal.cancel}
              </Button>
              <Button type="primary" onClick={this.handleSubmit.bind(this)} style={{marginLeft: 0}}>
                {languageForMarketing.Submit}
              </Button>
            </div>
          </FooterToolbar>
        </Spin>
      </div>
    )
  }
}
