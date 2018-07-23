import React, { Component } from 'react';
import {
  Button,
  Form,
  Input,
  Icon,
  Select,
  Tooltip,
  DatePicker,
  Radio,
  Card,
  Breadcrumb
} from 'antd';

import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import moment from 'moment';
import ruleType from '../../utils/ruleType';
import SpuSelect from '../../components/SpuSelect';
import FooterToolbar from '../../components/FooterToolbar';
import styles from './CouponCreate.less';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
const { TextArea } = Input;

@connect(state => ({
  couponList: state.couponList,
  global: state.global
}))
@Form.create()
export default class MarketingList extends Component {
  state = {
    type: 'couponList',
    spuSlectedList:[],
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const { type, spuSlectedList } = this.state;
        const { couponList } = this.props;
        console.log('this=>', this);

        let spuIds = [];

        if (values.spuIds === '2') {
          spuIds = [];
        } else {
          spuIds = spuSlectedList.map(( item ) => { return item.spuId });
        }


        const commitData = {
          disCodeSeller: values.disCodeSeller,
          spuIds,
          startTime: moment(values.startTime[0]).format('YYYY-MM-DD HH:mm:ss'),
          expireTime: moment(values.startTime[1]).format('YYYY-MM-DD HH:mm:ss'),
          useType: values.useType,
          discountType: values.discountType,
          discountValue: values.discountValue,
          minOrderAmount: values.minOrderAmount,
          thresholdType: 1,
          discountCodeType:1,
        };

        this.props.dispatch({
          type: `couponList/${type}CreateDiscount`,
          payload: commitData,
        });
      }
    });
  }
  handleCancel = () => {
    this.props.dispatch(routerRedux.push('/marketing/couponList'));
  }

  getSelectList = (selectList) => {
    this.setState({
      spuSlectedList: selectList,
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const {couponCode, couponCrate, global, message, header} = this.props.global.languageDetails;
    const formItemLayout = 'horizontal';

    return (
      <div className={styles.CouponCreate}>
        <Card className="breadcrumb-box">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/marketing/couponList">{header.specialOffers}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{header.addNewSpecialDeal}</Breadcrumb.Item>
          </Breadcrumb>
        </Card>
        <Card>
          <Form
            layout="horizontal"
            className="ant-card-900"
            // onSubmit={this.handleSubmit}
          >
            <FormItem
              {...formItemLayout}
              label={couponCode.PromoCodeName}
            >
              {getFieldDecorator('disCodeSeller', {
                rules: [
                  {
                    required: true,
                    message: `${global.PleaseEnter}${couponCode.PromoCodeName}`,
                  },
                  {
                    min: 1,
                    max: 50,
                    message: message.within50characters,
                  },
                ],
              })(
                <Input style={{ width: '97%' }} />
              )}
              <Tooltip
                placement="top"
                title={
                  <div>
                    <p>{couponCrate.name}</p>
                  </div>
                }
              >
              <span style={{ marginLeft: '10px' }}>
                <Icon type="exclamation-circle" />
              </span>
              </Tooltip>
            </FormItem>
            {/* 修改了需求 */}
            <FormItem
              {...formItemLayout}
              label={couponCode.ProductApplicableRange}
            >
              {getFieldDecorator('spuIds', {
                rules: [{ required: true, message: `${global.Pleasechoose}${couponCode.ProductApplicableRange}` }],
                initialValue: '1',
              })(
                <RadioGroup>
                  <Radio value="1">{couponCode.SpecifiedProduct}</Radio>
                  <Radio value="2">{couponCode.AllProduct}</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {
              this.props.form.getFieldValue('spuIds') === '1'
                ?
                <div>
                  <SpuSelect
                    pushSelectList={this.getSelectList}
                  />
                </div>
                :
                null
            }

            <FormItem
              {...formItemLayout}
              label={couponCode.ValidDate}
              style={{marginTop:24}}
            >
              {getFieldDecorator('startTime', {
                rules: [{ type: 'array', required: true, message: `${global.Pleasechoose}${couponCode.ValidDate}` }],
              })(
                <RangePicker
                  showTime
                  disabledDate={(current) => {
                    // console.log(new Date(current).getTime());
                    return new Date(current).getTime()<new Date().getTime()-24*60*60*1000
                  }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={couponCode.UseLimits}
            >
              {getFieldDecorator('useType', {
                rules: [{ required: true, message: `${global.Pleasechoose}${couponCode.UseLimits}` }],
              })(
                <Select style={{ width: '350px' }}>
                  <Option value="1">{couponCode.useduring2}</Option>
                  <Option value="2">{couponCode.useduring3}</Option>
                  <Option value="3">{couponCode.useduring1}</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={couponCrate.PromoType}
            >
              {getFieldDecorator('discountType', {
                rules: [{ required: true, message: `${global.Pleasechoose}${couponCrate.PromoType}`  }],
                initialValue: '1',
              })(
                <RadioGroup>
                  <Radio value="1">{couponCrate.Discount}</Radio>
                  <Radio value="2">{couponCrate.Amount}</Radio>
                </RadioGroup>
              )}
            </FormItem>

            {
              this.props.form.getFieldValue('discountType') === '1'
                ?
                <FormItem
                  {...formItemLayout}
                  label={couponCrate.Percentage}
                  // label="折扣"
                >
                  {getFieldDecorator('discountValue', {
                    rules: [
                      { required: true, message: `${global.PleaseEnter}${couponCrate.Percentage}` },
                      ruleType('discountValue'),
                    ],
                  })(
                    <Input
                      type="number"
                      style={{ width: '350px' }}
                    />
                  )}
                  <span
                    style={{
                      marginLeft: '-20px',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  >
                  %
                </span>
                  <Tooltip
                    placement="top"
                    title={
                      <div>
                        <p>{couponCrate.PercentageTip}</p>
                      </div>
                    }
                  >
                  <span style={{ marginLeft: '18px' }}>
                    <Icon type="exclamation-circle" />
                  </span>
                  </Tooltip>
                </FormItem>
                :
                <FormItem
                  {...formItemLayout}
                  label={couponCrate.Amount}
                  // label="折扣"
                >
                  {getFieldDecorator('discountValue', {
                    rules: [
                      { required: true, message: `${global.PleaseEnter}${couponCrate.Amount}` },
                      ruleType('number-float'),
                    ],
                  })(
                    <Input
                      addonBefore="$"
                      type="number"
                      style={{ width: '350px' }}
                    />
                  )}
                  <span
                    style={{
                      marginLeft: '-20px',
                      zIndex: 1,
                      position: 'relative',
                      color: 'transparent',
                    }}
                  >
                  %
                </span>
                </FormItem>
            }
            <FormItem
              {...formItemLayout}
              label={couponCrate.ConsumedCondition}
            >

              {getFieldDecorator('minOrderAmount', {
                rules: [
                  {
                    required: true,
                    message: `${global.PleaseEnter}${couponCrate.ConsumedCondition}`,
                  },
                  {
                    min: 1,
                    max: 6,
                    message: '可输入长度为6位数字，超出6位时不可继续输入',
                  },
                  ruleType('minOrderAmount'),
                ],
              })(
                <Input
                  addonBefore="$"
                  style={{ width: '350px' }}
                  type="number"
                />
              )}
              <Tooltip
                placement="top"
                title={
                  <div>
                    <p>{couponCrate.ConsumedTip}</p>
                  </div>
                }
              >
              <span style={{ marginLeft: '10px' }}>
                <Icon type="exclamation-circle" />
              </span>
              </Tooltip>
            </FormItem>
            {/*<FormItem*/}
              {/*wrapperCol={{ span: 12, offset: 4 }}*/}
            {/*>*/}
              {/*<Button type="primary" htmlType="submit">*/}
                {/*{couponCrate.Submit}*/}
              {/*</Button>*/}
              {/*<Button style={{ marginLeft: '10px' }} onClick={this.handleCancel}>*/}
                {/*{couponCrate.Cancel}*/}
              {/*</Button>*/}
            {/*</FormItem>*/}
          </Form>
        </Card>
        <FooterToolbar>
          <div style={{float: 'right'}}>
            {/*{getErrorInfo()}*/}
            <Button onClick={this.handleCancel} style={{border: 'none'}}>
              {couponCrate.Cancel}
            </Button>
            <Button type="primary" onClick={this.handleSubmit} style={{marginLeft: 0}}>
              {couponCrate.Submit}
            </Button>
          </div>
        </FooterToolbar>
      </div>
    );
  }
}
