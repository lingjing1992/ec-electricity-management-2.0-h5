import React from 'react';
import { Switch, Form } from 'antd';

const PublishToShopify = ({ form, languageDetails, publishToShopify }) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
  const { getFieldDecorator } = form;
  return (
    <Form.Item label={languageForProductEdit.publishToShopify}>
      {
        getFieldDecorator('publishToShopify',{

        })(
          <Switch
            checkedChildren={languageForProductEdit.yes}
            unCheckedChildren={languageForProductEdit.no}
            defaultChecked = { publishToShopify }
          />
        )
      }
    </Form.Item>
  )
}

export default PublishToShopify;
