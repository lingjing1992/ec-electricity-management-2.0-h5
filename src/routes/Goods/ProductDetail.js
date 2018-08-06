import React from 'react';
import { Form, Radio, Input } from 'antd';
import styles from './GoodsCreate.less';
import { goodsEditorLanguage } from '../../utils/utils';
import Ueditor from '../../components/ueditor';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
class ProductDetail extends React.Component {
  state = {
    productDetailTabKey: 'en',//商品详情tab key
  }
  render(){
    const { language, languageDetails, getContent, value } = this.props;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const languageForGlobal = languageDetails.global;
    return (
      <Form.Item
        label={languageForProductEdit.productDetails}
        className={styles.goodsDetailForm}
      >
        <RadioGroup
          defaultValue={language[0]}
          value={this.state.productDetailTabKey}
          style={{marginTop: 4, marginBottom: 10}}
          onChange={(e) => {
            this.setState({
              productDetailTabKey: e.target.value
            })
          }}>
          {
            language.map((item,index) => {
              return (
                <RadioButton value={item} key={index}>{goodsEditorLanguage(item, languageForGlobal)}</RadioButton>
              )
            })
          }
        </RadioGroup>
        {
          language.map((item,index) => {
            return (
              <div key={index} style={{display: item === this.state.productDetailTabKey ? 'block' : 'none'}}>
                <Ueditor
                  getContent={getContent}
                  language={item}
                  id={`${item}GoodsDetail`}
                  height="400"
                  value={value.goods_details && value.goods_details[item]}
                />
              </div>
            )
          })
        }
      </Form.Item>
    )
  }
}
export default ProductDetail;
