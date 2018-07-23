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
import SpuSelect from '../../components/SpuSelect';

import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import moment from 'moment';
import ruleType from '../../utils/ruleType';

import styles from './CouponCreate.less';

const { Option } = Select;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
import FooterToolbar from '../../components/FooterToolbar';

@connect(state => ({
  couponSubtraction: state.couponSubtraction,
  global: state.global
}))
@Form.create()
export default class CouponCreate extends Component {
  state = {
    type: 'couponSubtraction',
    couponType: 2,
    couponTypePromit:this.props.global.languageDetails.message.positiveinteger,
    spuSlectedList: [],
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }



  handleSubmit = (e) => {
    const { couponType, spuSlectedList } = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        const { type } = this.state;
        const { couponSubtraction } = this.props;
        console.log('this=>', this);

        let spuIds = [];

        if (values.spuIds === '2') {
          spuIds = [];
        } else {
          spuIds = spuSlectedList.map(item => item.spuId);
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
          thresholdType: couponType,
          discountCodeType:2,
        };

        this.props.dispatch({
          type: `couponSubtraction/${type}CreateDiscount`,
          payload: commitData,
        });
      }
    });
  }
  handleCancel = () => {
    this.props.dispatch(routerRedux.go(-1));
  }

  couponTypeSlect = (value) => {
    const {message} = this.props.global.languageDetails;
    const couponTypePromit  = value == 2 ? message.positiveinteger : message.demicalnumber;
    const { setFieldsValue } = this.props.form;
    setFieldsValue({
      minOrderAmount: '',
    })
    this.setState({
      couponType: parseInt(value),
      couponTypePromit: couponTypePromit
    })
  }

  getSelectList = (selectList) => {
    this.setState({
      spuSlectedList: selectList,
    })
  }



  render() {
    const { getFieldDecorator } = this.props.form;
    const { couponType, couponTypePromit } = this.state;
    const {couponSub, couponSubCreate, global, message, header} = this.props.global.languageDetails;
    const action = {
      add: header.addNewSpecialDeal,
      edit: "编辑满减送"
    }
    const formItemLayout = 'horizontal';

    return (
      <div className={styles.CouponCreate}>
        <Card className="breadcrumb-box">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/marketing/couponSubtractionList">{header.specialOffers}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{header.addNewSpecialDeal}</Breadcrumb.Item>
          </Breadcrumb>
        </Card>
        <Card>
          <Form
            layout="horizontal"
            onSubmit={this.handleSubmit}
            className="ant-card-900"
          >
            <FormItem
              {...formItemLayout}
              label={couponSub.PromoCodeName}
            >
              {getFieldDecorator('disCodeSeller', {
                rules: [
                  {
                    required: true,
                    message: `${global.PleaseEnter}${couponSub.PromoCodeName}`,
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
                    <p>{couponSubCreate.name}</p>
                  </div>
                }
              >
              <span style={{ marginLeft: '10px' }}>
                <Icon type="exclamation-circle" />
              </span>
              </Tooltip>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={couponSub.ProductApplicableRange}
            >
              {getFieldDecorator('spuIds', {
                rules: [{ required: true, message: `${global.PleaseEnter}${couponSub.ProductApplicableRange}` }],
                initialValue: '1',
              })(
                <RadioGroup>
                  <Radio value="1">{couponSub.SpecifiedProduct}</Radio>
                  <Radio value="2">{couponSub.AllProduct}</Radio>
                </RadioGroup>
              )}
            </FormItem>
            {
              this.props.form.getFieldValue('spuIds') === '1'
                ?
                <SpuSelect
                  pushSelectList={this.getSelectList}
                />
                :
                null
            }

            <FormItem
              {...formItemLayout}
              label={couponSub.ValidDate}
              style={{marginTop: 24}}
            >
              {getFieldDecorator('startTime', {
                rules: [{ type: 'array', required: true, message: `${global.PleaseEnter}${couponSub.ValidDate}` }],
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
              label={couponSub.UseLimits}
            >
              {getFieldDecorator('useType', {
                rules: [{ required: true, message: `${global.PleaseEnter}${couponSub.UseLimits}` }],
              })(
                <Select style={{ width: '350px' }}>
                  <Option value="1">{couponSub.useduring2}</Option>
                  <Option value="2">{couponSub.useduring3}</Option>
                  <Option value="3">{couponSub.useduring1}</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={couponSub.SalesAmountLimit}
            >
              {
                couponType==2 ?
                  getFieldDecorator('minOrderAmount', {
                    rules: [
                      {
                        required: true,
                        message: message.positiveinteger,
                        pattern: /^[\d]+$/g,
                      },
                    ],
                  })(
                    <Input style={{ width: '100px' }} />
                  ) : getFieldDecorator('minOrderAmount', {
                    rules: [
                      {
                        required: true,
                        message:  message.demicalnumberaccurate,
                        pattern: /^\d+(\.\d{1,2})?$/g,
                      },
                    ],
                  })(
                  <Input prefix="$" style={{ width: '100px' }} />
                  )
              }

              <Select
                style={{ width: '100px',marginLeft: '10px' }}
                defaultValue={couponType.toString()}
                onSelect={this.couponTypeSlect}
              >
                <Option value="1">{couponSubCreate.Amount}</Option>
                <Option value="2">{couponSubCreate.pcs}</Option>
              </Select>
              <Tooltip
                placement="top"
                title={
                  <div>
                    <p>{couponSubCreate.limitTip}</p>
                  </div>
                }
              >
              <span style={{ marginLeft: '10px' }}>
                <Icon type="exclamation-circle" />
              </span>
              </Tooltip>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={couponSubCreate.PromoType}
            >
              {getFieldDecorator('discountType', {
                rules: [{ required: true, message: `${global.PleaseEnter}${couponSubCreate.PromoType}` }],
                initialValue: '1',
              })(
                <RadioGroup>
                  <Radio value="1">{couponSubCreate.Discount}</Radio>
                  <Radio value="2">{couponSubCreate.Amount}</Radio>
                </RadioGroup>
              )}
            </FormItem>

            {
              this.props.form.getFieldValue('discountType') === '1'
                ?
                <FormItem
                  {...formItemLayout}
                  label={couponSubCreate.Discount}
                  // label="折扣"
                >
                  {getFieldDecorator('discountValue', {
                    rules: [
                      { required: true, message: `${global.PleaseEnter}${couponSubCreate.Discount}` },
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
                        <p>{couponSubCreate.PercentageTip}</p>
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
                  label={couponSubCreate.Amount}
                  // label="折扣"
                >
                  {getFieldDecorator('discountValue', {
                    rules: [
                      { required: true, message: `${global.PleaseEnter}${couponSubCreate.Amount}` },
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
          </Form>
        </Card>
        <FooterToolbar>
          <div style={{float: 'right'}}>
            {/*{getErrorInfo()}*/}
            <Button onClick={this.handleCancel} style={{border: 'none'}}>
              {couponSubCreate.Cancel}
            </Button>
            <Button type="primary" onClick={this.handleSubmit} style={{marginLeft: 0}}>
              {couponSubCreate.Submit}
            </Button>
          </div>
        </FooterToolbar>
      </div>

    );
  }
}
