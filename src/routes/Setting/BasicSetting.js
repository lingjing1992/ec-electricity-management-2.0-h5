import React, { Component } from 'react';
import { Card, Form, Select, Input, Checkbox, Button, message, Spin } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;
import FooterToolbar from '../../components/FooterToolbar';
import { connect } from 'dva/index';
import { routerRedux } from 'dva/router';
import styles from './BasicSetting.less';

@connect(state => ({
  global: state.global,
  setting: state.setting,
}))
@Form.create()
export default class BasicSetting extends Component {
  componentDidMount() {
    setTimeout(() => {}, 100);
    this.getWarning();
  }

  //预警获取
  getWarning = () => {
    const { setFieldsValue } = this.props.form;

    this.props.dispatch({
      type: 'setting/getWarning',
      callback: data => {
        if (data.status === 200) {
          setFieldsValue({
            minStorage: data.data.minStorage,
            noticeType: data.data.noticeType,
            noticeRate: data.data.noticeRate,
          });
        }
      },
    });
  };
  //取消
  handleCancle = () => {
    this.props.dispatch(routerRedux.go(-1));
  };
  //确定
  handleSubmit = () => {
    const languageForMessage = this.props.global.languageDetails.message;
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'setting/setWarning',
          payload: {
            minStorage: values.minStorage,
            noticeType: values.noticeType,
            noticeRate: values.noticeRate,
          },
          callback: data => {
            if (data.status === 200) {
              message.success(languageForMessage.SubmittedSuccessfully);
            }
          },
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const noticeStyleOptions = [
      {
        label: '系统通知',
        value: 50,
      },
      {
        label: 'Email',
        value: 100,
      },
    ];
    const languageForGlobal = this.props.global.languageDetails.global;
    const languageForBasicSetting = this.props.global.languageDetails.basicSetting;
    const {
      setting: { loading },
    } = this.props;
    return (
      <Card
        className={styles.basicSetting}
        style={{ minHeight: 780, marginBottom: 56 }}
        title={languageForBasicSetting.StockAlert}
      >
        <Spin spinning={loading}>
          <Form>
            <div className={`ant-form-item-label`}>{languageForBasicSetting.QuantityInStock}</div>
            <div className={`clearfix`}>
              <FormItem className={`left`}>
                {getFieldDecorator('stock', {
                  initialValue: 1,
                })(
                  <Select className={`select-size-small`}>
                    <Option key={1} value={1}>
                      SPU
                    </Option>
                    <Option key={2} value={2}>
                      SKU
                    </Option>
                  </Select>
                )}
              </FormItem>
              <div style={{ margin: '0 8px' }} className={`left ant-form-item-label`}>
                ≤
              </div>
              <FormItem className={`left`}>
                {getFieldDecorator('minStorage', {
                  rules: [
                    {
                      required: true,
                      message: languageForBasicSetting.QuantityNotBeEmpty,
                    },
                  ],
                })(<Input style={{ width: 100 }} />)}
              </FormItem>
            </div>
            <FormItem
              className={styles.notificationForm}
              label={languageForBasicSetting.NotificationForm}
            >
              {getFieldDecorator('noticeType', {
                initialValue: [100],
              })(<CheckboxGroup options={noticeStyleOptions} />)}
            </FormItem>
            <FormItem label={languageForBasicSetting.InformTheFrequency}>
              {getFieldDecorator('noticeRate', {
                initialValue: 1,
              })(
                <Select className={`select-size-small`}>
                  <Option key={1} value={1}>
                    {languageForBasicSetting.OnlyOnce}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Form>
          <FooterToolbar>
            <div style={{ float: 'right' }}>
              {/*{getErrorInfo()}*/}
              <Button onClick={this.handleCancle} style={{ border: 'none' }}>
                {languageForGlobal.cancel}
              </Button>
              <Button type="primary" onClick={this.handleSubmit} style={{ marginLeft: 0 }}>
                {languageForGlobal.Confirm}
              </Button>
            </div>
          </FooterToolbar>
        </Spin>
      </Card>
    );
  }
}
