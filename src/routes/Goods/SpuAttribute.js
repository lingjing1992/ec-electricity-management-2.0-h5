import React from 'react';
import styles from './GoodsCreate.less'
import { Form, Checkbox } from 'antd';
import CreateAttribute from './CreateAttribute';
const CheckboxGroup = Checkbox.Group;
const SpuAttribute = ({ form, spuAttributesList, languageDetails}) => {
  const { getFieldDecorator } = form;
  const languageForProductEdit = languageDetails.goods.productEdit;
  return (
    <div>
      <Form.Item
        label={languageForProductEdit.SPUAttribute}
        className={styles.spuAttributesForm}
      >
        <CreateAttribute
          form={form}
          spuAttributesList={spuAttributesList}
          type={'spuAttr'}
        />
      </Form.Item>
    </div>
  )
}

export default SpuAttribute
