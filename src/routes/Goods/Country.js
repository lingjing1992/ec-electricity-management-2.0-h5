import React from 'react';
import { Form, Select } from 'antd';
const { Option } = Select;
const Country = ({form, languageDetails, country, spuId, permission}) => {
  const { getFieldDecorator } = form;
  const languageForProductEdit = languageDetails.goods.productEdit;
  return (
    <Form.Item
      label={languageForProductEdit.Country}
    >
      {getFieldDecorator('promotionCountry', {
        rules: [
          {
            required: true,
            message:
            languageForProductEdit.selectCountry
          }],
        // initialValue:
        //   (
        //     (this.state.spuId === 0)
        //     ?
        //     ['FR', 'GB', 'US', 'AU', 'CA', 'DE']
        //     :
        //     getgoods.promote_country && getgoods.promote_country
        //   ),
      })(
        <Select
          placeholder={languageForProductEdit.selectCountry}
          mode="multiple"
          disabled={permission['100039'].disabled
          }
        >
          {
            country.map((item) => {
              return (
                <Option
                  key={item.code}
                >
                  {item.name}
                </Option>
              );
            })
          }
        </Select>
      )}
    </Form.Item>
  )
}

export default Country
