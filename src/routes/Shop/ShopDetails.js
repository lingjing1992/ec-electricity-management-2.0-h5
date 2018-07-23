import React, {Component} from 'react';
import styles from './ShopDetails.less';
import {connect} from 'dva';
import {setApiHost, getQueryString, goodsEditorLanguage, getLanguageParams} from '../../utils/utils';
import {routerRedux, Link} from 'dva/router';
import {
  Input,
  Button,
  Form,
  Upload,
  Icon,
  message,
  Spin,
  Radio,
  notification,
  Card,
  Breadcrumb
} from 'antd';

const FormItem = Form.Item;
const {TextArea} = Input;
const RadioGroup = Radio.Group;
import SpuSelect from '../../components/SpuSelect';
import FooterToolbar from '../../components/FooterToolbar';

@connect(state => ({
  shop: state.shop,
  global: state.global
}))
@Form.create()
export default class ShopDetails extends Component {
  state = {
    fileList: [],
    loading: false,
    viewId: 0,
    viewDetail: {
      viewId: 0,
      type: 3,
      banner: '',
      title: {
        en: '',
        de: '',
        fr: '',
      },
      spuIds: [],
    },
    selectList: [],
  }

  componentWillMount() {
    this.init();
  }

  init() {
    this.getLanguage();
    this.getSpuViewDetail();
    console.log(1);
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

  //获取商品详情
  getSpuViewDetail = () => {
    const {location} = this.props;
    const id = parseInt(getQueryString(location.search).id);
    if (id) {
      this.setState({
        viewId: id,
      })
      console.log('location', location);
      this.props.dispatch({
        type: 'shop/getSpuViewDetail',
        payload: {
          viewId: id,
        },
        callback: (data) => {
          const result = data.data;
          console.log(result.banner);
          this.setState({
            viewDetail: data.data
          })
          if (result.banner) {
            this.setState({
              fileList: [{
                uid: -1,
                name: '1.png',
                status: 'done',
                url: result.banner,
                thumbUrl: result.banner,
              }]
            })
          }
          ;
        }
      })
    }
  }

  //上传前，返回false则不上传
  /*
   file: 当前图片信息
   fileList: 图片列表信息
   */
  beforeUpload = (file, fileList) => {
    console.log("file", file);
    console.log("fileList", fileList);
    return false;
  }

  // 图片上传
  handleChange = (info) => {
    let fileList = info.fileList;
    console.log(info);
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
          fileList,
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
      fileList
    });
    // }
  }

  //结果提交
  handleSubmit = (e) => {
    const languageMessage = this.props.global.languageDetails.message;
    e.preventDefault();
    const {shop} = this.props;
    const {selectList} = this.state;
    const _this = this;
    if (selectList.length === 0) {
      notification.error({
        message: languageMessage.KindlyReminder,
        description: languageMessage.setatleastone,
      });

      return;
    }
    this.props.form.validateFields((err, values) => {
      console.log(err);
      console.log(values);
      if (!err) {
        const spuIds = selectList.map((item) => {
          return item.spuId
        });
        const title = getLanguageParams(shop.language, values);
        const url = _this.state.fileList.length > 0 ? _this.state.fileList[0].url : '';
        _this.props.dispatch({
          type: 'shop/createUpdateSpuView',
          payload: {
            viewId: _this.state.viewId,
            type: 3,
            banner: url,
            title: title,
            spuIds: spuIds,
            language: shop.language,
          },
          callback: (data) => {
            if (data.status === 200) {
              _this.props.dispatch(routerRedux.go(-1));
            }
          }
        })
      }
    });
  }
  //取消
  handleCancle = () => {
    this.props.dispatch(routerRedux.go(-1));
  }

  getSelectList = (selectList) => {
    this.setState({
      selectList: selectList
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {pageDetails, global, header} = this.props.global.languageDetails;
    const {loading} = this.props.shop;
    const {viewDetail} = this.state;
    const actionType = getQueryString().type;//类型
    const action = {
      add: header.addANewListPage,
      edit: header.EditListPage,
    }
    const formItemLayout = 'horizontal';

    const uploadProps = {
      name: 'upload_img',
      action: `${setApiHost()}/api/merchant/v1/goods/uploadImg`,
      accept: 'image/png,image/jpeg',
      listType: 'picture',
      data: {
        img_type: 2,
      },
      onChange: this.handleChange,
      fileList: this.state.fileList
    };

    //构建语言填充
    const languageDomBuilt = () => {
      const {shop} = this.props;
      return shop.language.map((item, index) => {
        const code = item === 'en';
        const label = item === 'en' ? `${pageDetails.Title}：` : '';
        const className = item === 'en' ? '' : styles.FormItem;
        return (
          <FormItem
            {...formItemLayout}
            label={label}
            key={index}
            className={className}
          >
            {getFieldDecorator(item, {
              rules: [{
                required: code,
                message: `${global.PleaseEnter}${pageDetails.Title}`,
              }],
              initialValue: viewDetail.title[item],
            })(
              <Input addonBefore={goodsEditorLanguage(item, global)}/>
            )}
          </FormItem>
        )
      })
    }

    return (
      <div style={{paddingBottom: 30}}>
        <Spin spinning={loading}>
          <Card className="breadcrumb-box">
            <Breadcrumb>
              <Breadcrumb.Item><Link to="/shop/shopLists">{header.listPages}</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{action[actionType]}</Breadcrumb.Item>
            </Breadcrumb>
          </Card>
          <Card className={styles.shopDetails}>
            <Form className={`ant-card-900 ${styles.form}`}>
              {
                languageDomBuilt()
              }
              <FormItem
                {...formItemLayout}
                label={`${pageDetails.BannerImage}`}
                style={{marginTop: 24}}
              >
                {getFieldDecorator('upload', {
                  rules: [{
                    required: false,
                  }],
                  getValueFromEvent: this.normFile,
                })(
                  <div className={styles.upload}>
                    <div className={styles.imageReg}>{pageDetails.ImageSize}</div>
                    <Upload
                      {...uploadProps}
                    >
                      <Button>
                        <Icon type="upload"/> {pageDetails.BannerImage}
                      </Button>
                    </Upload>
                  </div>
                )}
              </FormItem>
            </Form>

          </Card>
          <Card>

            <div className="ant-card-900">
              <div className="ant-form-item-label ">
                <label className="ant-form-item-required">
                  {pageDetails.Product}
                </label>
                </div>
              <SpuSelect
                pushSelectList={this.getSelectList}
                defaultSpuIds={viewDetail.spuIds}
              />
            </div>
          </Card>
          <FooterToolbar>
            <div style={{float: 'right'}}>
              {/*{getErrorInfo()}*/}
              <Button onClick={this.handleCancle} style={{border: 'none'}}>
                {pageDetails.Cancel}
              </Button>
              <Button type="primary" onClick={this.handleSubmit.bind(this)} style={{marginLeft: 0}}>
                {pageDetails.Submit}
              </Button>
            </div>
          </FooterToolbar>
        </Spin>
      </div>
    );
  }
}
