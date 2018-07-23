import React, { PureComponent } from 'react';
import { Button, Input, message, Popconfirm, Divider, Tooltip, Icon, Upload, Radio, notification } from 'antd';
// import { connect } from 'dva';
// import reqwest from 'reqwest';
import Table from '../../components/table';
import { connect } from 'dva';
import { getQueryString, goodsEditorLanguage, setApiHost } from '../../utils/utils';
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
      loadingId: '', // 图片load的时候，只loading当前
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
      // 永远Input状态
      // target.editable = !target.editable;

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
      editable: true,
      isNew: true,
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

      // if (!target['en']) {
      // 这里去掉校验，只有点击确认的时候才校验
      // if (!target['en'] || !target['zh-tw']) {
      //   message.error('请填写必填-SPU属性');
      //   e.target.focus();
      //   return;
      // }


      const newData = [...this.state.data];
      // delete target.isNew;
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
      title: languageForProductEdit.Operation,
      key: 'action',
      classType: 2,
      render: (text, record, index) => {
        if (record.editable) {
          if (record.isNew) {
            return (
              <span>
                {
                  (!this.state.spuId) || (this.state.spuId === 0)
                    ?
                      <span>
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
              -
            </span>
          );
        }
        return (
          <span>
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
    }];
    // 操作多少个
    const resultLanguage = [];
    for (let i = 0; i < language.length; i++) {

      resultLanguage.push({
        title: `${goodsEditorLanguage(language[i],languageForGlobal)}${language[i] === 'en' ? `(${languageForProductEdit.Required})` : ''}`,
        dataIndex: `${language[i]}`,
        key: `${language[i]}`,
        classType: 4,
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, `${language[i]}`, record.key)}
                onBlur={e => this.saveRow(e, record.key, record)}
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
      columns.splice(1, 0, resultLanguage[j]);
    }


    return (
      <div style={{ marginBottom: 40 }}>
        <Table
          // scroll={{ x: 1200 }}
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
        >
          {languageForProductEdit.newSPU}
        </Button>
      </div>
    );
  }
}
