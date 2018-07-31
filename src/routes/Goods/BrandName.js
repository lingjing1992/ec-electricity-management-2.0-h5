import React from 'react';
import { Form, Input } from 'antd'
const BrandName = ({ form, languageDetails }) => {
  const { getFieldDecorator } = form;
  const languageForProductEdit = languageDetails.goods.productEdit;
  const languageForMessage = languageDetails.message;
  return (
    <Form.Item
      label={languageForProductEdit.brand}
    >
      {getFieldDecorator('brandName', {
        rules: [
          {required: false, message: languageForMessage.inputbrandname},
          {
            min: 1,
            max: 50,
            message: languageForMessage.morethan50,
          },
        ],
        // initialValue: getgoods.brand_name && getgoods.brand_name,
      })(
        <Input/>
      )}
    </Form.Item>
  )
}

export default BrandName
