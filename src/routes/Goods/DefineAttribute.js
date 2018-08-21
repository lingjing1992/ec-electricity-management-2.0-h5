import React from 'react';
import styles from './GoodsCreate.less'
import { Form, Checkbox, Button } from 'antd';
import CreateAttribute from './CreateAttribute';
const CheckboxGroup = Checkbox.Group;
const DefineAttribute = ({ form, createDefinedAttr, languageDetails, showModalSpuTableForm}) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
  return (
    <div>
      {/*<CreateAttribute*/}
        {/*form={form}*/}
        {/*spuAttributesList={createDefinedAttr}*/}
        {/*type={'definedAttr'}*/}
      {/*/>*/}
      <Form.Item
        className={`${styles.spuTitleName} ${styles.spuNulTitl} ${styles.spuButton}`}
      >
        <Button
          style={{width: '100%', marginBottom: 24}}
          type="dashed"
          onClick={showModalSpuTableForm}
          icon="plus"
        >
          {languageForProductEdit.customSPU}
        </Button>
      </Form.Item>
    </div>
  )
}

export default DefineAttribute
