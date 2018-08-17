// Banner模块， CardType  103
import React, { Component } from "react";
import { setApiHost } from "../../../utils/utils";
import { Upload, message, Button, Icon, Input, Radio, Form, Spin } from "antd";
import styles from '../StyleTemplatesDetails.less';
import { connect } from 'dva';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

@connect(state => ({
    global: state.global,
    shop: state.shop,
}))
export default class Banner103 extends Component {
    state = {
        selectedCard: {},
    }

    shouldComponentUpdate() {
        return true;
    }
    //处理输入数据
    handleBannerInput = (key,e) => {
        const { resource } = this.props;
        const val = e.target.value;
        resource.info[key] = val;
        this.props.onSetState('selectedCard', resource);
    }
    //更换banner
    onChangeBanner = ({ file }) => {
        if (file.status === 'uploading') {
            this.changeBannerLoading(true);
        } else {
            this.changeBannerLoading(false);
        }
        if (file.status === 'done') {
            const url = file.response.data.image_url
            const selectedCard = this.props.resource
            selectedCard.info.banner = url
            this.props.onSetState('selectedCard', selectedCard);
            message.success(this.props.global.languageDetails.editTemplate.uploadSuccess, 1);
        }
    }

    //加载动画控制
    changeBannerLoading(boolean) {
        this.props.dispatch({
            type: 'shop/changeBannerLoading',
            payload: boolean,
        })
    }
    //修改url单选框
    changeBannerUrlRadio = (e) => {
        let selectedCard = this.props.resource
        const val = e.target.value
        this.props.onSetState('selectedCard',
            {
                info: {
                    ...selectedCard.info,
                    type: val
                }
            });
        this.forceUpdate();
    }

    render() {
        const { resource } = this.props;
        const bannerUploadProp = {
            name: 'upload_img',
            accept: 'image/png,image/jpeg',
            showUploadList: false,
            action: `${setApiHost()}/api/merchant/v1/goods/uploadImg`,
            onChange: this.onChangeBanner
        }
        const { editTemplate } = this.props.global.languageDetails
        return (
            <Form>
                <div className={styles.subTitle}>
                    Banner
        </div>
                <div>
                    <FormItem
                        label="Banner"
                    >
                        {/*<span style={{verticalAlign: 'top', lineHeight: '30px'}}>Banner: </span>*/}
                        <Upload {...bannerUploadProp}>
                            <Button>
                                <Icon type="upload" /> {editTemplate.uploadFiles}
                            </Button>
                            <p style={{ color: '#999' }}>{editTemplate.availableImage}</p>
                        </Upload>
                    </FormItem>
                    <FormItem
                        label="URL"
                    >
                        {/*<span style={{verticalAlign: 'top', lineHeight: '30px'}}>URL: </span>*/}
                        <div style={{ display: 'inline-block' }}>
                            <RadioGroup onChange={(e) => { this.changeBannerUrlRadio(e) }} style={{ lineHeight: '30px' }} value={resource.info.type}>
                                <Radio value={1}>{editTemplate.Shop}</Radio>
                                <Radio value={2}>{editTemplate.listPages}</Radio>
                                <Radio value={3}>{editTemplate.externalLink}</Radio>
                                <Radio value={0}>{editTemplate.noLink}</Radio>
                            </RadioGroup>
                            {resource.info.type === 1 && <Input
                                placeholder={editTemplate.spuSuch}
                                className={styles.bannerInput}
                                defaultValue={resource.info.spuId}
                                onBlur={this.handleBannerInput.bind(this,'spuId')} />
                            }
                            {
                                resource.info.type === 2 && <Input
                                    placeholder={editTemplate.pleaseenterlistpageID}
                                    className={styles.bannerInput}
                                    defaultValue={resource.info.viewId}
                                    onBlur={this.handleBannerInput.bind(this,'viewId')} />
                            }
                            {
                                resource.info.type === 3 && <Input
                                    placeholder={editTemplate.enterthelink}
                                    className={styles.bannerInput}
                                    defaultValue={resource.info.url}
                                    onBlur={this.handleBannerInput.bind(this,'url')} />
                            }
                        </div>
                    </FormItem>
                </div>
            </Form>
        )
    }
}
