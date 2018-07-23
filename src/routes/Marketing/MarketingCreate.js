import React, {Component} from 'react';
import {
  Button,
  Form,
  Input,
  Icon,
  // Table,
  Select,
  Tooltip,
  Row,
  Col,
  Upload,
  Card,
  DatePicker,
  notification,
  Modal,
} from 'antd';

import Table from '../../components/table'
import {connect} from 'dva';
import moment from 'moment';
import styles from './MarketingCreate.less';
import ruleType from './../../utils/ruleType';
import {setApiHost} from './../../utils/utils';

const FormItem = Form.Item;
const {Option} = Select;
const { Search } = Input;

@connect(state => ({
  marketCreate: state.marketCreate,
  global: state.global
}))
@Form.create()
export default class MarketingCreate extends Component {
  state = {
    type: 'marketCreate',
    expandedRowKeysArr: [],
    // fileList: [], // 导入
    visibleCommit: false,
    // startValue: null,
    // endValue: null,
    // endOpen: false,
    getBeginDate: '',
    getEndDate: '',
    infModalShow: false,
    record: {}
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'marketCreate/clear',
      payload: null,
    });
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }
  onStartChange = (value) => {
    this.onChange('startValue', value);
  }
  onEndChange = (value) => {
    this.onChange('endValue', value);
  }
  getExpandedRowKeysArr = (record) => {
    // console.log('record', record);
    const {expandedRowKeysArr} = this.state;
    const result1 = expandedRowKeysArr.indexOf(record.spu_id); // 返回index为
    // console.log('result1', result1);
    if (result1 >= 0) {
      expandedRowKeysArr.map((item, index) => {
        // console.log('index', index);
        if (item === record.spu_id) {
          expandedRowKeysArr.splice(index, 1);
        }
        return true;
      });
    } else {
      expandedRowKeysArr.push(record.spu_id);
    }
    // console.log('expandedRowKeysArr', expandedRowKeysArr);
    this.setState({
      expandedRowKeysArr,
    });
  }

  loadData() {
    const {type} = this.state;
    const {marketCreate} = this.props;
    // console.log('this=>', this);

    this.props.dispatch({
      type: `marketCreate/${type}GetMarketings`,
      payload: marketCreate.pushData,
    });
  }

  pushData = (record) => {
    this.setState({
      infModalShow: true,
      record
    })
    // this.getExpandedRowKeysArr(record);
  }
  searchData = () => {
    // e.preventDefault();
    const {getFieldValue} = this.props.form;
    const {type} = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `marketCreate/${type}PushShowNum`,
      payload: {
        page_num: 1,
      },
    });
    this.props.dispatch({
      type: `marketCreate/${type}pushShowSize`,
      payload: {
        page_size: 20,
      },
    });
    this.props.dispatch({
      type: `marketCreate/${type}PushKeyword`,
      payload: getFieldValue('keyword').trim(),
      callback: () => {
        this.loadData();
      },
    });
  }
  handleSubmit = (record) => {
    // console.log('record', record);
    const {message} = this.props.global.languageDetails;
    const {type} = this.state;
    this.props.form.validateFields(
      [
        `begin_date${record.spu_id}`,
        `end_date${record.spu_id}`,
        `commission_radio${record.spu_id}`,
        `icon${record.spu_id}`,
        `disId${record.spu_id}`,
      ],
      (err, value) => {
        console.log('err', err);
        console.log('value', value);
        console.log(this.props.form.getFieldsValue());
        console.log('moment().millisecond(Number)', moment(this.props.form.getFieldValue(`begin_date${record.spu_id}`)).valueOf());
        const beginDateValueOf = moment(this.props.form.getFieldValue(`begin_date${record.spu_id}`)).valueOf();
        const endDateValueOf = moment(this.props.form.getFieldValue(`end_date${record.spu_id}`)).valueOf();

        if (!err) {
          // 点击发布的时候，开始时间不能大于结束时间
          if (!(endDateValueOf - beginDateValueOf >= 0)) {
            notification.error({
              message: message.operationTips,
              description: message.laterThan,
            });
            return false;
          } else {
            this.setState({
              getBeginDate: moment(this.props.form.getFieldValue(`begin_date${record.spu_id}`)).format('YYYY-MM-DD'),
              getEndDate: moment(this.props.form.getFieldValue(`end_date${record.spu_id}`)).format('YYYY-MM-DD'),
            });
            this.props.dispatch({
              type: `marketCreate/${type}OperationItem`,
              payload: record,
              callback: () => {
                this.setState({
                  visibleCommit: true,
                  infModalShow: false
                });
              },
            });
          }
        }
      });
  }

  // 发布弹出层
  handleOkCommit = (e) => {
    const {operationItem} = this.props.marketCreate;
    e.preventDefault();
    this.props.form.validateFields(
      [
        `begin_date${operationItem.spu_id}`,
        `end_date${operationItem.spu_id}`,
        `commission_radio${operationItem.spu_id}`,
        `icon${operationItem.spu_id}`,
        `coupon${operationItem.spu_id}`,
      ],
      (err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          const {type} = this.state;
          this.props.dispatch({
            type: `marketCreate/${type}PushCreate`,
            payload: {
              spu_id: operationItem.spu_id,
              commission_radio: parseFloat(values[`commission_radio${operationItem.spu_id}`]),
              begin_date: moment(values[`begin_date${operationItem.spu_id}`]).format('YYYY-MM-DD'),
              end_date: moment(values[`end_date${operationItem.spu_id}`]).format('YYYY-MM-DD'),
              disId: parseFloat(values[`coupon${operationItem.spu_id}`]),
              icon: values[`icon${operationItem.spu_id}`] && values[`icon${operationItem.spu_id}`].file.response.data.icon,
              // status: record.status,
            },
          });
        }
      });
    this.setState({
      visibleCommit: false,
      infModalShow:false
    });
  }
  handleCancelCommit = (e) => {
    this.setState({
      visibleCommit: false,
    });
  }

  couponTemplate(obj) {
    const {marketCreate} = this.props;
    const {spuDiscount} = marketCreate;

    let result = null;

    spuDiscount.map((item) => {
      if (item.disId === obj) {
        result = item.disCodeSeller;
      }
    });
    return result;
  }


  render() {
    const {getFieldDecorator, getFieldValue} = this.props.form;
    const {type, infModalShow, record} = this.state;
    const spuId = record.spu_id;
    // console.log('record', record);
    const props = {
      name: 'uploadFile',
      action: `${setApiHost()}/api/merchant/v1/marketing/upload`,
      headers: {
        authorization: 'authorization-text',
      },
      accept: 'aplication/zip',
      onRemove: (file) => {
        console.log('1');
        this.setState(({fileList}) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        // const isZip = file.type === 'application/x-zip-compressed';
        const uploadMax = file.size / 1024 / 1024 < 8;
        if (!uploadMax) {
          notification.error({
            message: message.operationTips,
            description: message.Maximumfiles
          });
        } else {
          // 上传多个
          // this.setState(({ fileList }) => ({
          //   fileList: [...fileList, file],
          // }));
          // 上传单个
          this.setState(() => ({
            fileList: [file],
          }));
        }
        return uploadMax;
      },
      data: {
        spu_id: spuId,
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
      // fileList: this.state.fileList,
    };
    const {marketCreate} = this.props;
    const marketCreateLang = this.props.global.languageDetails.marketCreateLang;
    const message = this.props.global.languageDetails.message;
    const global = this.props.global.languageDetails.global;
    const operationItemSpuId = marketCreate.operationItem
      &&
      marketCreate.operationItem.spu_id; // 每一个的Id
    const {marketCreate: {loading}} = this.props;
    // const { startValue, endValue, endOpen } = this.state;
    const selectSearchDatas = [
      {value: 'SPU', key: '1'},
      {value: marketCreateLang.ProductName, key: '2'},
    ]; // 选择搜索数据
    // 审核、上架、下架、重新上传、SKU属性值
    const columns = [
      {
        title: 'SPU',
        dataIndex: 'spu_id',
        classType: 2,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: marketCreateLang.ProductInformation,
        dataIndex: 'goods',
        classType: 2,
        render: (text, record) => {
          return (
            <div className={`${styles.shuxing} ${styles.goodsTd4}`}>
              <div className={styles.goodsInfoImg}>
                <Tooltip
                  placement="top"
                  title={
                    <div>
                      <p>{record.spu_name}</p>
                      <p>{record.spu_type}</p>
                    </div>
                  }
                >
                  <img alt="" src={record.icon}/>
                </Tooltip>
              </div>
            </div>
          );
        },
      },
      {
        title: marketCreateLang.Stock,
        dataIndex: 'quantity',
        classType: 1,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          );
        },
      },
      {
        title: marketCreateLang.Country,
        classType: 3,
        className: styles.extendCountries,
        render: (text, record) => {
          const result = record.extend_countries && record.extend_countries.length > 0 ? record.extend_countries.join(',') : '-';
          return (
            <Tooltip placement="top" title={result}>
              <div className={`${styles.shuxing} ${styles.extendCountries}`}>
                {result}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: marketCreateLang.Operation,
        classType: 1,
        className: styles.goodsTd9,
        render: (text, record) => {
          const {expandedRowKeysArr} = this.state;
          // 点击的时候，加上特效
          const isCheck = expandedRowKeysArr.filter((item) => {
            return item === record.spu_id;
          });
          return (
            <div>
              {/*
               <Button type="primary" onClick={this.pushData.bind(this, record)}>选择</Button>
               */}
              <Button
                onClick={this.pushData.bind(this, record)}
                type="primary"
              >
                {marketCreateLang.Select}
                {/* <Icon
                  type="down"
                  className={isCheck.length > 0 ? `${styles.check} ${styles.up}` : `${styles.check}`}
                /> */}
              </Button>
            </div>
          );
        },
      },
    ];
    const pagination = {
      total: marketCreate.data && marketCreate.data.total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      defaultPageSize: marketCreate.pushData && marketCreate.pushData.page_size,
      showTotal: (total) => {
        return (
          <div>{`${global.total} ${total} ${global.items}`}</div>
        );
      },
      // pageSizeOptions:["1"],
      // pageSize:1,
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `marketCreate/${type}PushShowSize`,
          payload: {
            page_num: current,
            page_size: size,
          },
        });
        this.loadData();
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `marketCreate/${type}PushShowNum`,
          payload: {
            page_num: current,
          },
        });
        this.loadData();
      },
    };
    const formItemLayout = {
      labelCol: {span: 14},
      wrapperCol: {span: 10},
    };

    const {spuDiscount = []} = this.props.marketCreate;


    return (
      <div className={styles.marketCreate}>
        <Card>
          <Form
            layout="inline"
            className="margin-bottom-24"
          >
            <FormItem
              className="belong"
            >
              {getFieldDecorator('filter', {
                rules: [{required: false}],
                initialValue: selectSearchDatas[0].key,
                onChange: (value) => {
                  this.props.dispatch({
                    type: `marketCreate/${type}PushFilter`,
                    payload: value,
                  });
                },
              })(
                <Select
                  className="select-size-small"
                >
                  {
                    selectSearchDatas.map((items) => {
                      return <Option value={items.key} key={items.key}>{items.value}</Option>;
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('keyword', {
                rules: [{required: false, message: marketCreateLang.Search}],
              })(
                <Search
                  placeholder={marketCreateLang.Search}
                  className="select-Input"
                  onSearch={this.searchData}
                  enterButton
                />)}
            </FormItem>
          </Form>
          <div>
            <Table
              className={`${styles.tableTop} ${styles.marketCreateTable}`}
              rowKey="spu_id"
              loading={loading}
              columns={columns}
              pagination={pagination}
              needToGetWidth={true}
              dataSource={marketCreate.data && marketCreate.data.spus}
              expandedRowKeys={this.state.expandedRowKeysArr}
              expandedRowRender={(record) => {
                const spuId = record.spu_id;
                // console.log('record', record);
                const props = {
                  name: 'uploadFile',
                  action: `${setApiHost()}/api/merchant/v1/marketing/upload`,
                  headers: {
                    authorization: 'authorization-text',
                  },
                  accept: 'aplication/zip',
                  onRemove: (file) => {
                    console.log('1');
                    this.setState(({fileList}) => {
                      const index = fileList.indexOf(file);
                      const newFileList = fileList.slice();
                      newFileList.splice(index, 1);
                      return {
                        fileList: newFileList,
                      };
                    });
                  },
                  beforeUpload: (file) => {
                    // const isZip = file.type === 'application/x-zip-compressed';
                    const uploadMax = file.size / 1024 / 1024 < 8;
                    if (!uploadMax) {
                      notification.error({
                        message: message.operationTips,
                        description: message.Maximumfiles
                      });
                    } else {
                      // 上传多个
                      // this.setState(({ fileList }) => ({
                      //   fileList: [...fileList, file],
                      // }));
                      // 上传单个
                      this.setState(() => ({
                        fileList: [file],
                      }));
                    }
                    return uploadMax;
                  },
                  data: {
                    spu_id: spuId,
                  },
                  onChange(info) {
                    if (info.file.status !== 'uploading') {
                      console.log(info.file, info.fileList);
                    }
                    if (info.file.status === 'done') {
                      message.success(`${info.file.name} file uploaded successfully`);
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} file upload failed.`);
                    }
                  },
                  // fileList: this.state.fileList,
                };
                return (
                  <div className="tcenter">
                    <Form className={styles.publishForm} layout="inline">
                      <Row>
                        <Col span={12} className={styles.publishItem}>
                          <FormItem
                            label={marketCreateLang.StartingTime}
                            {...formItemLayout}
                          >
                            {getFieldDecorator(`begin_date${spuId}`, {
                              rules: [{required: true, message: `${global.PleaseEnter}${marketCreateLang.StartingTime}`}],
                              initialValue: moment(),
                            })(
                              <DatePicker />
                            )}
                          </FormItem>
                        </Col>

                        <Col span={12} className={styles.publishItem}>
                          <FormItem
                            label={marketCreateLang.CommissionPercentage}
                            className={styles.publishItem}
                            labelCol= { {span: 14} }
                            wrapperCol= { {span: 10} }
                          >
                            <Row gutter={24}>
                              <Col span={14}>
                                {getFieldDecorator(`commission_radio${spuId}`, {
                                  rules: [{
                                    required: true,
                                    message: `${global.PleaseEnter}${marketCreateLang.CommissionPercentage}`,
                                  },
                                    ruleType('commissionRadio'),
                                  ],
                                  initialValue: '30',
                                })(
                                  <Input
                                    placeholder={marketCreateLang.CommissionPercentage}
                                    type="number"
                                  />)}
                              </Col>
                              <Col span={2}>
                                %
                              </Col>
                              <Col span={2}>
                                <Tooltip placement="top" title={marketCreateLang.percentage}>
                                  <Icon type="exclamation-circle"/>
                                </Tooltip>
                              </Col>
                            </Row>
                          </FormItem>
                        </Col>

                        <Col span={12} className={styles.publishItem}>
                          <FormItem
                            label={marketCreateLang.EndingTime}
                            {...formItemLayout}
                          >
                            {getFieldDecorator(`end_date${spuId}`, {
                              rules: [{required: true, message: `${global.PleaseEnter}${marketCreateLang.EndingTime}`}],
                              initialValue: moment().add(3, 'months'),
                            })(
                              <DatePicker />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={12} className={styles.publishItem}>
                          {/* 上传图片为非受控组件，太多了。暂时写不赢。 这里用css显示最后一个 */}
                          <FormItem
                            label={marketCreateLang.MarketingMaterials}
                            labelCol= { {span: 14} }
                            wrapperCol= { {span: 10} }
                          >
                            {getFieldDecorator(`icon${spuId}`, {
                              rules: [{
                                required: false,
                                message: `${global.PleaseEnter}${marketCreateLang.MarketingMaterials}`
                              }],
                            })(
                              <Upload {...props}>
                                <Button>
                                  <Icon type="upload"/> {marketCreateLang.Upload}
                                </Button>
                              </Upload>
                            )}
                          </FormItem>
                        </Col>

                        <Col span={12} className={styles.publishItem}>
                          <FormItem
                            label={marketCreateLang.PromoCode}
                            {...formItemLayout}
                          >
                            {getFieldDecorator(`coupon${spuId}`, {
                              rules: [{required: true, message: `${global.PleaseEnter}${marketCreateLang.PromoCode}`}],
                              // validateTrigger: ['onChange','onFocus'],
                              initialValue: '0',

                            })(
                              <Select
                                // className={styles.coupon}
                                className="select-size-middle"
                                onFocus={() => {
                                  console.log('record', record);
                                  const {type} = this.state;
                                  // 优惠码
                                  this.props.dispatch({
                                    type: `marketCreate/${type}SpuDiscount`,
                                    payload: {
                                      spuId,
                                    },
                                    // payload: marketCreate.pushData,
                                  });
                                }}
                              >
                                {/* 无的时候传递0，后端验证约定 */}
                                <Option value="0">{marketCreateLang.NoCode}</Option>
                                {
                                  spuDiscount.map((item) => {
                                    return (
                                      <Option value={item.disId} title={item.disCodeSeller}>{item.disCodeSeller}</Option>
                                    );
                                  })
                                }
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      <FormItem>
                        {
                          record.isPush
                            ?
                            <div>{marketCreateLang.Publishedsuccessfully}</div>
                            :
                            <Button
                              type="primary"
                              onClick={this.handleSubmit.bind(this, record)}
                              style={{margin: 20}}
                            >
                              {marketCreateLang.Publish}
                            </Button>
                        }
                      </FormItem>
                    </Form>
                  </div>
                );
              }}
            />
          </div>
        </Card>

        {/*

         begin_date: moment(values[`begin_date${operationItem.spu_id}`]).format('YYYY-MM-DD'),
         end_date: moment(values[`end_date${operationItem.spu_id}`]).format('YYYY-MM-DD'),
         icon: values[`icon${operationItem.spu_id}`].file.response.data.icon,
         */}
        {/* 发布 */}
        {
          operationItemSpuId
            ?
            <Modal
              title={marketCreateLang.marketingproduct}
              visible={this.state.visibleCommit}
              onOk={this.handleOkCommit}
              onCancel={this.handleCancelCommit}
              okText={marketCreateLang.Sure}
            >
              <Form className={styles.publishConfirm}>
                <FormItem
                  label="SPU"
                  {...formItemLayout}
                >
                  <p>{operationItemSpuId}</p>
                </FormItem>
                <FormItem
                  label={marketCreateLang.StartingTime}
                  {...formItemLayout}
                >
                  <p>{this.state.getBeginDate}</p>
                </FormItem>
                <FormItem
                  label={marketCreateLang.EndingTime}
                  {...formItemLayout}
                >
                  <p>{this.state.getEndDate}</p>
                </FormItem>
                <FormItem
                  label={marketCreateLang.CommissionPercentage}
                  {...formItemLayout}
                >
                  <p>
                    {getFieldValue(`commission_radio${operationItemSpuId}`)}
                    {getFieldValue(`commission_radio${operationItemSpuId}`) && '%'}
                  </p>
                </FormItem>
                <FormItem
                  label={marketCreateLang.MarketingMaterials}
                  {...formItemLayout}
                >
                  <p
                    style={{
                      width: 200,
                      wordBreak: 'break-all',
                    }}
                  >
                    {
                      getFieldValue(`icon${operationItemSpuId}`) &&
                      getFieldValue(`icon${operationItemSpuId}`).file &&
                      getFieldValue(`icon${operationItemSpuId}`).file.response &&
                      getFieldValue(`icon${operationItemSpuId}`).file.response.data && getFieldValue(`icon${operationItemSpuId}`).file.response.data.icon || '无'
                    }
                  </p>
                  {/*getFieldValue(`icon${operationItemSpuId}`).file.response.d*/}
                </FormItem>
                <FormItem
                  label={marketCreateLang.PromoCode}
                  {...formItemLayout}
                >
                  <p>
                    {getFieldValue(`coupon${operationItemSpuId}`) == '0' ? '无' : this.couponTemplate(getFieldValue(`coupon${operationItemSpuId}`))}
                  </p>
                </FormItem>
              </Form>
            </Modal>
            :
            null
        }
        <Modal
          title={marketCreateLang.ProductInformation}
          visible={infModalShow}
          width={460}
          footer={null}
          onCancel={()=>{
            this.setState({
              infModalShow: false
            })
          }}
        >
          <div className={`tcenter ${styles.productInfo}`}>
            <Form className={styles.publishForm} layout="inline">
              <Row>
                <Col span={14} className={styles.publishItem}>
                  <FormItem
                    label={marketCreateLang.StartingTime}
                  >
                    {getFieldDecorator(`begin_date${spuId}`, {
                      rules: [{required: true, message: `${global.PleaseEnter}${marketCreateLang.StartingTime}`}],
                      initialValue: moment(),
                    })(
                      <DatePicker />
                    )}
                  </FormItem>
                </Col>
                <Col span={10} className={styles.publishItem}>
                  <FormItem
                    label={marketCreateLang.EndingTime}
                  >
                    {getFieldDecorator(`end_date${spuId}`, {
                      rules: [{required: true, message: `${global.PleaseEnter}${marketCreateLang.EndingTime}`}],
                      initialValue: moment().add(3, 'months'),
                    })(
                      <DatePicker />
                    )}
                  </FormItem>
                </Col>
                <Col span={14}>
                  <FormItem
                    label={marketCreateLang.CommissionPercentage}
                    className={styles.publishItem}
                  >
                    <Row>
                      <Col span={18}>
                        {getFieldDecorator(`commission_radio${spuId}`, {
                          rules: [{
                            required: true,
                            message: `${global.PleaseEnter}${marketCreateLang.CommissionPercentage}`,
                          },
                            ruleType('commissionRadio'),
                          ],
                          initialValue: '30',
                        })(
                          <Input
                            placeholder={marketCreateLang.CommissionPercentage}
                            type="number"
                          />)}
                      </Col>
                      <Col style={{textAlign:'center'}} span={3}>
                        %
                      </Col>
                      <Col span={3}>
                        <Tooltip placement="top" title={marketCreateLang.percentage}>
                          <Icon type="exclamation-circle"/>
                        </Tooltip>
                      </Col>
                    </Row>
                  </FormItem>
                </Col>

                <Col span={10} className={styles.publishItem}>
                  <FormItem
                    label={marketCreateLang.PromoCode}
                  >
                    {getFieldDecorator(`coupon${spuId}`, {
                      rules: [{required: true, message: `${global.PleaseEnter}${marketCreateLang.PromoCode}`}],
                      // validateTrigger: ['onChange','onFocus'],
                      initialValue: '0',

                    })(
                      <Select
                        // className={styles.coupon}
                        className="select-size-small"
                        style={{width:'174px'}}
                        onFocus={() => {
                          console.log('record', record);
                          const {type} = this.state;
                          // 优惠码
                          this.props.dispatch({
                            type: `marketCreate/${type}SpuDiscount`,
                            payload: {
                              spuId,
                            },
                            // payload: marketCreate.pushData,
                          });
                        }}
                      >
                        {/* 无的时候传递0，后端验证约定 */}
                        <Option value="0">{marketCreateLang.NoCode}</Option>
                        {
                          spuDiscount.map((item) => {
                            return (
                              <Option value={item.disId} title={item.disCodeSeller}>{item.disCodeSeller}</Option>
                            );
                          })
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={14} className={styles.publishItem}>
                  {/* 上传图片为非受控组件，太多了。暂时写不赢。 这里用css显示最后一个 */}
                  <FormItem
                    label={marketCreateLang.MarketingMaterials}
                  >
                    {getFieldDecorator(`icon${spuId}`, {
                      rules: [{
                        required: false,
                        message: `${global.PleaseEnter}${marketCreateLang.MarketingMaterials}`
                      }],
                    })(
                      <Upload {...props}>
                        <Button>
                          <Icon type="upload"/> {marketCreateLang.Upload}
                        </Button>
                      </Upload>
                    )}
                  </FormItem>
                </Col>


              </Row>
              <FormItem className="publish">
                {
                  record.isPush
                    ?
                    <div>{marketCreateLang.Publishedsuccessfully}</div>
                    :
                    <Button
                      type="primary"
                      onClick={this.handleSubmit.bind(this, record)}
                      style={{margin: 20}}
                    >
                      {marketCreateLang.Publish}
                    </Button>
                }
              </FormItem>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}
