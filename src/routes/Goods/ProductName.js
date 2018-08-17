import React from 'react';
import { goodsEditorLanguage } from '../../utils/utils';
import styles from './GoodsCreate.less'
import { Form, Input } from 'antd';

const ProductName = ({form, language, languageDetails}) => {
  const { getFieldDecorator } = form;
  const languageForGlobal = languageDetails.global;
  const languageForMessage = languageDetails.message;
  const languageForProductEdit = languageDetails.goods.productEdit;
  return (
    <Form.Item
      label={languageForProductEdit.productName}
      className={styles.goodsNameForm}
    >
      {
        language.map((item) => {
          const isEnglish = item === 'en';
          return (

            <Form.Item
              key={item}
            >
              {getFieldDecorator(`goodsName.${item}`, {
                rules: [
                  {
                    required: isEnglish,
                    message: `${languageForGlobal.PleaseEnter}${languageForGlobal.English}`,
                  },
                  {
                    min: 1,
                    max: 100,
                    message: languageForMessage.morethan100,
                  },
                ],
                placeholder: `${languageForGlobal.PleaseEnter}${languageForGlobal.English}`,
                initialValue: null,
              })(
                <Input
                  placeholder={isEnglish ? `${languageForGlobal.PleaseEnter}${languageForGlobal.English}` : null}
                  addonBefore={goodsEditorLanguage(item, languageForGlobal)}
                />
              )}
            </Form.Item>
          );
        })
      }
    </Form.Item>
  )
}

export default ProductName;
