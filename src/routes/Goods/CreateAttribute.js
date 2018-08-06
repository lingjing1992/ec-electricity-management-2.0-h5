import React from 'react';
import styles from './GoodsCreate.less'
import { Form, Checkbox } from 'antd';
const CheckboxGroup = Checkbox.Group;
const CreateAttribute = ({form, spuAttributesList, type}) => {
  const { getFieldDecorator } = form;
  // console.log(spuAttributesList);
  return (
    <div>
      {
        spuAttributesList.length>0 && spuAttributesList.map((item,index) =>{
          //为了兼容驼峰和下划线,下版本删除
          const attrValue = item.attr_value || item.attrValue;
          const attrName = item.attr_name || item.attrName;
          //如果是spu属性则特殊处理
          const fieldKey = type==='spuAttr' ? `spuAttributesList[${index}]` : type;
          const options = attrValue.map(attr => {
            return {
              label: attr.value,
              value: attr.id
            }
          })
          return (
            <Form.Item
              label={attrName}
              key={index}
              className={styles.spuTableForm}
            >
              {
                getFieldDecorator(fieldKey, {
                  // initialValue,
                  onChange: (value) => {
                    // this.handleSpuAttributesList(value, attr_name);
                  },
                })(
                  // <RadioGroup
                  <CheckboxGroup
                    options={options}
                    // disabled={this.state.spuId}
                  />
                )}
            </Form.Item>
          )
        })
      }
    </div>
  )
}

export default CreateAttribute
