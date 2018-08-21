import React from 'react';
import { Form } from 'antd';
import ReturnAddrForm from './returnAddrForm';
const ReturnAddr = ({ languageDetails, form, permission, returnAddress, onSetReturnAddress }) => {
  const { getFieldDecorator } = form;
  const languageForRturnAddr = languageDetails.returnAddress;
  return (
    <Form.Item
      label={languageForRturnAddr.ReturnAddress}
    >
      {getFieldDecorator('returnAddr', {
        initialValue: {},
        rules: [{required: !permission['100054'].disabled ? true : false}],
      })(
        <ReturnAddrForm
          returnAddress={returnAddress}
          onSetReturnAddress={onSetReturnAddress}/>
      )}
    </Form.Item>
  )
}

export default ReturnAddr;
