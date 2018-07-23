import React, {PureComponent} from 'react';
import {Input, Form, Select, Checkbox} from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const FormItem = Form.Item;
const {Option} = Select;
const CheckboxGroup = Checkbox.Group;
@Form.create()
export default class AddrInfo extends PureComponent {
  static defaultProps = {
    title: '',//表单标题
    source: [],//表单源数据
    formLayout: { //表单布局
      // labelCol  : {span: 6},
      // wrapperCol: {span: 18},
      layout: 'vertical',
    },
    style: {},//样式
    onSubmit: () => {
    }, //提交
    isSubmit: false,//是否触发提交
    onOk: () => {
    },//确定返回参数
  }

  componentWillReceiveProps(nextProps) {
    const {setFieldsValue, validateFieldsAndScroll, getFieldsValue} = this.props.form;
    const _this = this;
    //触发提交
    if (nextProps.isSubmit !== this.props.isSubmit && nextProps.isSubmit) {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          Object.keys(values).map((item) => {
            values[item] = typeof values[item] === 'undefined' ? '' : values[item];
          })
          this.props.onOk(values);
        }
      })
      this.props.onSubmit(false);
    }
    //判断初始值是否更新，如果更新则改变绑定的值
    const isUpdate = nextProps.source.some((item, index) => {
      return item.initialValue !== _this.props.source[index].initialValue;
    })
    if (isUpdate) {
      nextProps.source.forEach((item, index) => {
        if ((item.hasOwnProperty('hasSelect') && item.hasOwnProperty('initialValue')) || (item.initialValue !== _this.props.source[index].initialValue))
          if (item.type === 3) {
            setFieldsValue({
              [item.key]: item.initialValue ? ['select'] : [],
            })
          } else {
            setFieldsValue({
              [item.key]: item.initialValue,
            })
          }
      })
    }
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {style, source, formLayout} = this.props;
    const Item = (item, elem) => {
      const initialValue = item.type === 3 ? ( item.initialValue ? ['select'] : []) : item.initialValue;
      return (
        <FormItem
          label={item.title} //用空格避免不对齐现象
          //合并类
          className={classNames(item.className, item.title ? '' : styles.noTitle)}
          {
            ...formLayout
          }
        >
          {
            getFieldDecorator(item.key, {
              rules: item.rules || [],
              onChange: (e) => {
                item.hasOwnProperty('onChange') && item.onChange(e);
              },
              initialValue: initialValue
            })(
              elem
            )
          }
        </FormItem>
      )
    }
    return (
      <div style={style} className={styles.formList}>
        <Form>
          {
            source.map((item) => {
              return (
                <div key={item.key}>
                  {
                    //文本输入框
                    item.type === 1 ? Item(item, (
                      <Input disabled={item.disabled} placeholder={item.placeholder}/>
                    )) : ''
                  }
                  {
                    //文本选择输入框
                    //如果是选择关联模式，已hasSelect判断是否关联的部分有选择的数据，没有则用输入框
                    item.type === 2 ? item.hasOwnProperty('hasSelect') && !item.hasSelect ? Item(item, (
                      <Input placeholder={item.placeholder[1]}/>
                    )) : Item(item, (
                      <Select placeholder={item.placeholder[0]}>
                        {
                          (() => {
                            //若选择项为纯数组则直接使用数组成员，否则根据具体的key和name绑定
                            const selectArr = item.select.hasOwnProperty('arr') ? item.select.arr : item.select;
                            return selectArr.map((selectItem) => {
                              const key = item.select.hasOwnProperty('key') ? selectItem[item.select.key] : selectItem;
                              const name = item.select.hasOwnProperty('name') ? selectItem[item.select.name] : selectItem;
                              return (
                                <Option key={key} value={key}>{name}</Option>
                              )
                            })
                          })()
                        }
                      </Select>
                    )) : ''
                  }
                  {
                    //复选框
                    item.type === 3 ? Item(item, ((
                      <CheckboxGroup
                        options={
                          [
                            {
                              label: item.text,
                              value: 'select',
                            },
                          ]
                        }
                      />
//                      <span>
//                        <Checkbox
//                          checked={Boolean(item.value)}
//                          defaultChecked={Boolean(item.initialValue)}
//                          onChange={item.onChange}
//                          style={{marginRight: 4}}/>
//                        {item.text}
//                      </span>
                    ))) : ''
                  }
                  {
                    //纯文本展示,需要绑定值
                    item.type === 4 ? Item(item, (
                      <span>{item.initialValue}</span>
                    )) : ''
                  }
                  {
                    //纯文本展示，不需要绑定值
                    item.type === 5 ? (
                      <div>
                        <h3 className={styles.h3Title}>{item.title}</h3>
                        <p className={styles.text}>{item.text}</p>
                      </div>
                    ) : ''
                  }
                </div>
              )
            })
          }
        </Form>
      </div>
    )
  }
}
