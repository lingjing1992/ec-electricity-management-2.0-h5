import React from 'react';
import { Form} from 'antd';
import styles from './GoodsCreate.less';
import UeDitorContent from './UeDitorContent';
const ProductDetail = ({ language, languageDetails, getContent, value }) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
  return (
    <Form.Item
      label={languageForProductEdit.productDetails}
      className={styles.goodsDetailForm}
    >
      <UeDitorContent
        language={language}
        languageDetails={languageDetails}
        getContent={getContent}
        value={value}
        valueKey={`size_desc`}
        id={`sizeDesc`}
      />
    </Form.Item>
  )
}
export default ProductDetail;
