import React from 'react';
import { Form, Select } from 'antd'
const { Option, OptGroup } = Select;
const ProductCategory = ({form, languageDetails, goodsType, permission, onGoodsType}) => {
  const { getFieldDecorator } = form;
  const languageForMessage = languageDetails.message;
  const languageForProductEdit = languageDetails.goods.productEdit;
  return (
    <Form.Item
      label={languageForProductEdit.productType}
    >
      {getFieldDecorator('goodsTypeId', {
        rules: [{required: true, message: languageForMessage.selectProductType}],
        // initialValue: this.state.spuId ? `${getgoods.goodsType_id && getgoods.goodsType_id}` : undefined,
        onChange: (value) => {
          onGoodsType(value);
        },
      })(
        <Select
          placeholder={languageForMessage.chooseCountry}
          notFoundContent={languageForMessage.chooseCountry}
          disabled={permission['100036'].disabled}
        >
          {
            goodsType.map((item, index) => {
              return (
                <OptGroup key={index} label={item.name_zh}>
                  {
                    item.child_type.map((childTypeItem) => {
                      return (
                        <Option
                          key={childTypeItem.id}
                          value={childTypeItem.id}
                        >
                          {childTypeItem.name_zh}
                        </Option>
                      );
                    })
                  }
                </OptGroup>
              );
            })
          }
        </Select>
      )}
    </Form.Item>
  )
}
export default ProductCategory
