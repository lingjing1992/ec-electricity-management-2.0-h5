// 店铺信息， CardType  701
import React, {Component} from "react";
import {getStrLength, setApiHost} from "../../../utils/utils";
import {Upload, message, Button, Icon, Input, Form } from "antd";
import styles from '../StyleTemplatesDetails.less';
import { connect } from 'dva';
import {notification} from "antd/lib/index";
const FormItem = Form.Item;

@connect(state => ({
  global: state.global
}))
export default class StoreInfo701 extends Component {
  //logo变化
  onChangeLogo = ({file}) => {
    if(file.status==='uploading'){
      this.changeStoreLogoLoing(true);
    }else {
      this.changeStoreLogoLoing(false);
    }
    if (file.status === 'done') {
      const url = file.response.data.image_url
      const selectedCard = this.props.resource
      selectedCard.info.banner = url
      this.props.onSetState('selectedCard',selectedCard);
      message.success(this.props.global.languageDetails.editTemplate.uploadSuccess, 1);
      this.forceUpdate();
    }
  }
  //名字变化
  nameInputHandle = (e) => {
    let selectedCard = this.props.resource;
    const {editTemplate} = this.props.global.languageDetails;
    let targetValue = e.target.value;
    selectedCard.info.name = targetValue;
    if (getStrLength(targetValue) > 50) {
      notification.success({
        message: editTemplate.Enter50Str,
      })
    } else {
      this.props.onSetState('selectedCard',selectedCard);
    }
  }
  //加载动画控制
  changeStoreLogoLoing(boolean){
    this.props.dispatch({
      type: 'shop/changeStoreLogoLoing',
      payload: boolean,
    })
  }
  render() {
    const { resource } = this.props;
    const {editTemplate} = this.props.global.languageDetails
    const logoUploadProp = {
      name: 'upload_img',
      showUploadList: false,
      accept: 'image/png,image/jpeg',
      action: `${setApiHost()}/api/merchant/v1/goods/uploadImg`,
      onChange: this.onChangeLogo
    }

    return (
      <Form>
        <div className={styles.subTitle}>
          {editTemplate.shopInformation}
        </div>
        <div>
          <div>
            {/*<span style={{verticalAlign: 'top', lineHeight: '30px'}}>{editTemplate.shopLogo}：</span>*/}
            <FormItem
              label={editTemplate.shopLogo}
            >
              <Upload {...logoUploadProp}>
                <Button>
                  <Icon type="upload"/>{editTemplate.uploadFiles}
                </Button>
                <p style={{color: '#999'}}>{editTemplate.imageRatio}</p>
              </Upload>
            </FormItem>
          </div>
          <FormItem
            label={editTemplate.shopName}
          >
            {/*<span>{editTemplate.shopName}：</span>*/}
            <Input placeholder={editTemplate.enterShopName} className={styles.inputBox}
                   defaultValue={resource.info.name} onInput={this.nameInputHandle}/>
          </FormItem>
        </div>
      </Form>
    )
  }
}
