import React, { PureComponent } from 'react';
import Table from '../../components/table';
import styles from './GoodsCreate.less';
import { Input, Button, Icon, Radio, Tooltip, Upload, Divider, Popconfirm, Checkbox, Form } from 'antd';
import { goodsEditorLanguage, setApiHost } from '../../utils/utils';
import { message, notification } from 'antd/lib/index';

const RadioGroup = Radio.Group;

export default class SkuAttributeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingId: '', // 图片load的时候，只loading当前
      impType: props.dataSource[0].imp_type,
    };
  }
  // 图片
  beforeUpload =(file) => {
    const isJPG = file.type === 'image/jpeg' || (file.type === 'image/png');
    const languageForMessage = this.props.languageDetails.message;
    if (!isJPG) {
      message.error(languageForMessage.SKUicons);
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJPG && isLt2M;
  }
  //转换图片格式
  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  render() {
    const { dataSource, languageDetails, isAdd, language, form, permission, _index, onAddNewProperty, onDeleteProperty } = this.props;
    const { impType } = this.state;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const languageForMessage = languageDetails.message;
    const languageForGlobal = languageDetails.global;
    const disabled = permission['100041'].disabled;
    //表格属性
    const columns = [
      {
        title: languageForProductEdit.Type,
        dataIndex: 'name',
        key: 'name',
        classType: 2,
        render: (text, record, index) => {
          const name = text ? text : index === 0 ? languageForProductEdit.attributeName : languageForProductEdit.attributeValue;
          return (
            <div>{name}</div>
          );
        },
      },
      {
        title: (
          <div>
            {languageForProductEdit.DisplayForm}&nbsp;
            <Tooltip
              placement="topLeft"
              title={languageForMessage.SKUicons}
              arrowPointAtCenter
            >
              <Icon type="exclamation-circle"/>
            </Tooltip>
          </div>
        ),
        dataIndex: 'url',
        key: 'url',
        classType: 4,
        render: (text, record, index) => {
          // const initImpType = dataSource[0] ? dataSource[0].imp_type : 1;
          const uploadButton = (
            <div>
              <Icon type={this.state.loading ? 'loading' : 'plus'}/>
              <div className="ant-upload-text">Upload</div>
            </div>
          );
          const uploadButtonNone = (
            <div>
              <Icon type={'plus'}/>
              <div className="ant-upload-text">Upload</div>
            </div>
          );
          const imageUrl = record.image_url; // 使用大图
          return (
            <div>
              {
                index === 0 ? (
                  <Form.Item key={index}>
                    {
                      getFieldDecorator(`propertyConfig[${_index}][${index}].imp_type`, {
                        initialValue: impType,
                        onChange: (e) => {
                          console.log(e.target.value);
                          this.setState({
                            impType: e.target.value,
                          })
                        }
                      })(
                        <RadioGroup
                          disabled={disabled}
                        >
                          <Radio value={1}>{languageForProductEdit.Label}</Radio>
                          <Radio value={2}>{languageForProductEdit.Image}</Radio>
                        </RadioGroup>
                      )
                    }
                  </Form.Item>
                ) : null
              }

              {
                impType === 2 && index > 0 ? (
                  <Form.Item>
                    {
                      getFieldDecorator(`propertyConfig[${_index}][${index}].url`, {
                        initialValue: imageUrl
                      })(
                        <Upload
                          name="upload_img"
                          listType="picture-card"
                          className="avatar-uploader"
                          showUploadList={false}
                          action={setApiHost() + `/api/merchant/v1/goods/uploadImg`}
                          beforeUpload={this.beforeUpload}
                          data={{ img_type: 1 }}
                          disabled={disabled}
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
                                  const newData = [...dataSource];
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
                            imageUrl ? (
                              <img src={imageUrl} alt=""/>
                            ) : (
                              <div>
                                {this.state.loadingId === record.key ? uploadButton : uploadButtonNone}
                              </div>)
                          }
                        </Upload>
                      )
                    }
                    {
                      imageUrl ? (
                        <a target="_blank" href={imageUrl} alt="">{languageForProductEdit.View}</a>
                      ) : null
                    }
                  </Form.Item>
                ) : null
              }
            </div>
          );
        },
      },
      {
        title: languageForProductEdit.Operation,
        key: 'action',
        classType: 3,
        render: (text, record, index) => {
          return (
            <span>
            {
              permission['100059'].status && index !== 0 ? (
                <Form.Item key={index}>
                  {
                    getFieldDecorator(`propertyConfig[${_index}][${index}].status`, {
                      // initialValue: null
                    })(
                      <Checkbox
                        defaultChecked={Number(record.status)}
                      >
                        {
                          languageForProductEdit.Sale
                        }</Checkbox>
                    )
                  }
                </Form.Item>
              ) : (
                <span>
                  {
                    dataSource.length > 2 && index !== 0 ? (
                      <span>{
                        record.name !== languageForProductEdit.attributeName ? (
                          <span>
                            <Popconfirm title={languageForMessage.deleteThisLine} onConfirm={() => {
                              onDeleteProperty(_index);
                              this.forceUpdate();
                            }}>
                              <a>{languageForProductEdit.Delete}</a>
                            </Popconfirm>
                          </span>
                        ) : null
                      }
                      </span>
                    ) : null
                  }
                </span>
              )
            }

          </span>
          );
        },
      },
    ];
    const languageInput = language.map((item) => {
      return {
        title: goodsEditorLanguage(item, languageForGlobal),
        dataIndex: item,
        key: item,
        classType: 3,
        render: (text,record,index) => {
          return (
            <Form.Item key={index}>
              {
                getFieldDecorator(`propertyConfig[${_index}][${index}].lang.${item}`, {
                  initialValue: null
                })(
                  <Input
                    disabled={disabled}
                  />
                )
              }
            </Form.Item>
          );
        },
      };
    });
    // languageInput.unshift(2,0);
    // Array.prototype.splice.apply(columns,languageInput);
    columns.splice(1, 0, ...languageInput);
    return (
      <div className={styles.goodsTable}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={`property_id`}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
        <Button
          className={styles.skuDeleteButton}
          type="dashed"
          onClick={() => {
            onAddNewProperty(_index);
            this.forceUpdate();
          }}
          icon="plus"
          disabled={disabled}
        >
          {languageForProductEdit.AddaNewAttribute}
        </Button>
      </div>
    );
  }
}
