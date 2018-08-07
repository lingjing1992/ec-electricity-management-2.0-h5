import React, { PureComponent } from 'react';
import {  Button, Input, message, Popconfirm, Divider, Tooltip, Icon, Upload, Radio, notification, Checkbox } from 'antd';
// import { connect } from 'dva';
import Table from '../../components/table';
import reqwest from 'reqwest';
import { connect } from 'dva';
import { getQueryString,goodsEditorLanguage,setApiHost } from '../../utils/utils';
import styles from './GoodsCreate.less';

const RadioGroup = Radio.Group;

 @connect(state => ({
   global: state.global,
 }))
export default class TableForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      type: 'goodsCreate',
      loading: false,
      spuId: getQueryString().spu_id || 0,
      loadingId:'', // 图片load的时候，只loading当前
    };
  }
  // componentDidMount() {
  //
  // }
  // loadData() {
  //   const { type } = this.state;
  //   this.props.dispatch({
  //     type: `goodsCreate/${type}CreateRequest`,
  //   });
  // }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        data: nextProps.value,
      });
    }
  }
  getRowByKey(key) {
    return this.state.data.filter(item => item.key === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'form/submit',
          payload: values,
        });
      }
    });
  }
  toggleEditable(e, key) {
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;

      this.setState({ data: [...this.state.data] });
    }
  }
  remove(key) {
    const newData = this.state.data.filter(item => item.key !== key);
    this.setState({ data: newData });
    this.props.onChange(newData);
  }
  newMember = () => {
    const newData = [...this.state.data];
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    newData.push({
      key: `NEW_TEMP_ID_${this.index}`,
      name: languageForProductEdit.attributeValue,
      url: '',
      editable: true,
      isNew: true,
      imp_type: this.state.data[0].imp_type || 1,
      image_url: '',
      small_url: '',
      isDelete: true, // 新增item的时候，我这边做下标记。编辑的时候 有isDelete 才可以删除
    });
    this.index += 1;
    this.setState({ data: newData });
  }
  handleKeyPress(e, key, record) {
    if (e.key === 'Enter') {
      this.saveRow(e, key, record);
    }
  }
  handleFieldChange(e, fieldName, key) {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
  }
  saveRow(e, key, record) {
    e.persist();
    const languageForMessage = this.props.global.languageDetails.message;
    // save field when blur input
    setTimeout(() => {
      if (document.activeElement.tagName === 'INPUT' &&
          document.activeElement !== e.target) {
        return;
      }
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};


      const { goodsCreate } = this.props;
      const {
        language = [], // 语言
        goods_type = [], // 商品类目
        currency = [], // 货币
        country = [], // 国家
      } = goodsCreate.createRequest;
      // for (let i = 0; i < language.length; i++) {
      //   if (!target[language[i]]) {
      //     message.error('请填写完整成员信息。');
      //     e.target.focus();
      //     return;
      //   }
      // }

      if (!target['en']) {
        message.error(languageForMessage.fillInSKU);
        e.target.focus();
        return;
      }


      const newData = [...this.state.data];


      if (!record.property_id) {
        reqwest({
          url: setApiHost()+'/api/merchant/v1/goods/createProperty',
          method: 'post',
          data: JSON.stringify({
            name: record.en,
          }),
          crossOrigin: true,
          withCredentials: true,
          type: 'json',
          contentType: 'application/json',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          success: (res) => {
            newData.map((item) => {
              if (item.key === key) {
                item.property_id = res.data.property_id;
              }
              return item;
            });
            // res.data.property_id

            this.setState({ data: [...newData] });
          },
          error: (res) => {
            notification.error({
              message: `${languageForMessage.RespondError}${res.status}`,
              description: res.msg,
            });
          },
        });
      }


      // if (!target.french || !target.english) {
      //   message.error('请填写完整成员信息。');
      //   e.target.focus();
      //   return;
      // }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.props.onChange(this.state.data);
    }, 10);
  }
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: [...this.state.data] });
  }
  handleShowType =(record, e) => {

    const newData = [...this.state.data];
    newData.map((item, index) => {
      if (item.imp_type == 1 || item.imp_type == 0) {
        item.imp_type = 2;
      } else if (item.imp_type == 2) {
        item.imp_type = 1;
      }
      return item;
    });
    this.setState({ data: [...newData] });
  }
  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  // 图片
  // handleChange = (info,record) => {
  //   console.log('record',record)
  //   if (info.file.status === 'uploading') {
  //     this.setState({ loading: true });
  //     return;
  //   }
  //   if (info.file.status === 'done') {
  //     // Get this url from response in real world.
  //     console.log('info',info)
  //     this.getBase64(info.file.originFileObj, (imageUrl) => {
  //
  //       const newData = [...this.state.data];
  //       newData.map((item) => {
  //         if (item.key == record.key) {
  //           item.image_url = 2;
  //           item.small_url = 2;
  //         }
  //
  //         return item;
  //       });
  //       this.setState({
  //         imageUrl,
  //         loading: false,
  //         data: [...newData]
  //       })
  //     });
  //   }
  // }
  // 图片
  beforeUpload =(file) => {
    const isJPG = file.type === 'image/jpeg' || (file.type === 'image/png');
    const languageForMessage = this.props.global.languageDetails.message;
    if (!isJPG) {
      message.error(languageForMessage.SKUicons);
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJPG && isLt2M;
  }
  //是否销售
  ifSale = (e,key) => {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if(target){
      target.status = Number(e.target.checked);
      this.setState({ data: newData });
    }
  }
  render() {
    // const props2 = {
    //   action: '//jsonplaceholder.typicode.com/posts/',
    //   listType: 'picture',
    //   defaultFileList: [...fileList],
    //   className: 'upload-list-inline',
    // };
    const imageUrl = this.state.imageUrl;
    const languageForProductEdit = this.props.global.languageDetails.goods.productEdit;
    const languageForMessage = this.props.global.languageDetails.message;
    const languageForGlobal = this.props.global.languageDetails.global;

    const { goodsCreate } = this.props;
    const {
      language = [], // 语言
      goods_type = [], // 商品类目
      currency = [], // 货币
      country = [], // 国家
    } = goodsCreate.createRequest;
    const columns = [{
      title: 'ID',
      dataIndex: 'property_id',
      key: 'property_id',
      classType: 1,
      render: (text) => {
        return (
          <div>{text}</div>
        );
      },
    }, {
      title: languageForProductEdit.Type,
      dataIndex: 'name',
      key: 'name',
      classType: 2,
      render: (text) => {
        return (
          <div>{text}</div>
        );
      },
    }, {
      title: (
        <div>
          {languageForProductEdit.DisplayForm}&nbsp;
          <Tooltip placement="topLeft" title={languageForMessage.SKUicons} arrowPointAtCenter>
            <Icon type="exclamation-circle" />
          </Tooltip>
        </div>
      ),
      dataIndex: 'url',
      key: 'url',
      classType: 9,
      render: (text, record, index) => {

        const uploadButton = (
          <div>
            <Icon type={this.state.loading ? 'loading' : 'plus'} />
            <div className="ant-upload-text">Upload</div>
          </div>
        );
        const uploadButtonNone = (
          <div>
            <Icon type={'plus'} />
            <div className="ant-upload-text">Upload</div>
          </div>
        );
        const imageUrl = record.image_url; // 使用大图
        return (
          <div>
            {
              record.name == languageForProductEdit.attributeName
              ?
                <RadioGroup disabled={this.props.disabled} onChange={this.handleShowType.bind(this, record)} value={`${record.imp_type}`}>
                  <Radio value="1">{languageForProductEdit.Label}</Radio>
                  <Radio value="2">{languageForProductEdit.Image}</Radio>
                </RadioGroup>
                :
                null
            }

            {
              this.state.data[0].imp_type == 2 && record.name == languageForProductEdit.attributeValue
                ?
                  <div>
                    <Upload
                      name="upload_img"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      action={setApiHost()+`/api/merchant/v1/goods/uploadImg`}
                      beforeUpload={this.beforeUpload}
                      data={{ img_type: 1 }}
                      disabled={this.props.disabled}
                      onChange={(info) => {
                    if (info.file.status === 'uploading') {
                      this.setState({
                        loading: true,
                        loadingId: record.key,
                      });
                      return;
                    }
                    if (info.file.status === 'done') {
                      // Get this url from response in real world.
                      if (info.file.response.status === 200) {
                        this.getBase64(info.file.originFileObj, (imageUrl) => {
                          const newData = [...this.state.data];
                          newData.map((item) => {
                            if (item.key == record.key) {
                              item.image_url = info.file.response.data.image_url;
                              item.small_url = info.file.response.data.small_url;
                            }
                            return item;
                          });
                          this.setState({
                            imageUrl,
                            loading: false,
                            data: [...newData],
                          });
                        });
                        notification.success({
                          message: languageForMessage.KindlyReminder,
                          description: info.file.response.msg,
                        });
                        this.setState({ loading: false });
                      } else {
                        notification.error({
                          message: languageForMessage.KindlyReminder,
                          description: info.file.response.msg,
                        });
                        this.setState({ loading: false });
                      }
                    }
                  }}
                    >
                      {
                        imageUrl
                          ?
                          <img src={imageUrl} alt="" />
                          :
                          <div>
                            {this.state.loadingId === record.key?uploadButton:uploadButtonNone}
                          </div>

                      }
                    </Upload>
                    {
                    imageUrl
                      ?
                        <a target="_blank" href={imageUrl} alt="" >{languageForProductEdit.View}</a>
                      :
                      null
                  }
                  </div>
                :
                null
            }

          </div>
        );
      },
    }, {
      title: languageForProductEdit.Operation,
      key: 'action',
      classType:3,
      render: (text, record, index) => {
        if (record.editable) {
          if (record.isNew) {
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.key, record)}>{languageForProductEdit.Save}</a>
                {
                  (!this.state.spuId) || (this.state.spuId === 0)
                    ?
                    <span>
                        <Divider type="vertical" />
                        <Popconfirm title={languageForMessage.deleteThisLine} onConfirm={() => this.remove(record.key)}>
                          <a>{languageForProductEdit.Delete}</a>
                        </Popconfirm>
                      </span>
                    :
                    <span>
                        {
                          record.isDelete
                            ?
                            <span>
                            <Divider type="vertical" />
                            <Popconfirm title={languageForMessage.deleteThisLine} onConfirm={() => this.remove(record.key)}>
                              <a>{languageForProductEdit.Delete}</a>
                            </Popconfirm>
                          </span>
                            :
                            null
                        }
                      </span>
                }
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.saveRow(e, record.key, record)}>{languageForProductEdit.Save}</a>
              <Divider type="vertical" />
              <a onClick={e => this.cancel(e, record.key)}>{languageForProductEdit.Cancel}</a>
            </span>
          );
        }
        return (
          <span>

            {
              this.props.disabled ? index!==0 ? (
                  <Checkbox checked={Boolean(Number(record.status))} onChange={e => this.ifSale(e,record.key)}>{languageForProductEdit.Sale}</Checkbox>
                ) : null
                :
                (
                  <a onClick={e => this.toggleEditable(e, record.key)}>{languageForProductEdit.Edit}</a>
                )
            }
            {
              (!this.state.spuId) || (this.state.spuId === 0)
                ?
                <span>
                    {
                      this.state.data.length <= 2
                        ?
                        null
                        :
                        <span>
                        {
                          record.name !== languageForProductEdit.attributeName
                            ?
                            <span>
                                <Divider type="vertical" />
                                <Popconfirm title={languageForMessage.deleteThisLine} onConfirm={() => this.remove(record.key)}>
                                  <a>{languageForProductEdit.Delete}</a>
                                </Popconfirm>
                              </span>
                            :
                            null
                        }
                      </span>
                    }
                  </span>
                :
                <span>
                    {
                      record.isDelete
                        ?
                        <span>
                          <Divider type="vertical" />
                          <Popconfirm title={languageForMessage.deleteThisLine} onConfirm={() => this.remove(record.key)}>
                            <a>{languageForProductEdit.Delete}</a>
                          </Popconfirm>
                        </span>
                        :
                        null
                    }
                  </span>
            }
          </span>
        );
      },
    }
    ];
    // 操作多少个
    const resultLanguage = [];
    for (let i = 0; i < language.length; i++) {

      resultLanguage.push({
        title: goodsEditorLanguage(language[i],languageForGlobal),
        dataIndex: `${language[i]}`,
        key: `${language[i]}`,
        classType: 3,
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, `${language[i]}`, record.key)}
                // onBlur={e => this.saveRow(e, record.key, record)}
                onKeyPress={e => this.handleKeyPress(e, record.key, record)}
                placeholder={`${language[i]}`}
              />
            );
          }
          return text;
        },
      });
    }
    resultLanguage.reverse(); // 反转
    for (let j = 0; j < resultLanguage.length; j++) {
      columns.splice(2, 0, resultLanguage[j]);
    }

    return (
      <div style={{ marginBottom: 40, marginTop: 10 }}>
        <Table
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
          disabled={this.props.disabled}
        >
          {languageForProductEdit.AddaNewAttribute}
        </Button>
      </div>
    );
  }
}
