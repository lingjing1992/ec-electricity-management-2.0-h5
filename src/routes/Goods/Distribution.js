import React from 'react';
import { Form, Radio } from 'antd';
const RadioGroup = Radio.Group;
const Distribution = ({form, languageDetails, permission}) => {
  const { getFieldDecorator } = form;
  const languageForProductEdit = languageDetails.goods.productEdit;
  return (
    <Form.Item
      label={languageForProductEdit.distributionOrNot}
    >
      {getFieldDecorator('isDistribution', {
        rules: [{required: true}],
        initialValue: 1,
      })(
        <RadioGroup disabled={permission['100040'].disabled}>
          <Radio value={1}>{languageForProductEdit.Yes}</Radio>
          <Radio value={0}>{languageForProductEdit.No}</Radio>
        </RadioGroup>
      )}
    </Form.Item>
  )
}

export default Distribution
