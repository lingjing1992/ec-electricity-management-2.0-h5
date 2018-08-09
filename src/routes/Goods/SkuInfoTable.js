import React, { PureComponent } from 'react';
import Table from '../../components/table';
import styles from './GoodsCreate.less';
import { Input, Form } from 'antd';

export default class SkuInfoTable extends PureComponent {
  handleInputValue = () => {

  }
  setRateOfExChangeVisible = () => {

  }
  render(){
    const { permission, languageDetails, form } = this.props;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const { getFieldDecorator } = form;
    const disabled = permission['100042'].disabled;
    return (
      <div>
        <div>
          <span className={styles.skuInfoTableText} style={{marginRight: 8}}>{languageForProductEdit.BatchInput}</span>
          <Form.Item  className={styles.skuInfoTableInput}>
            {
              getFieldDecorator('refPrice')(
                <Input
                  placeholder={languageForProductEdit.OriginalPrice}
                  // value={refPrice}
                  disabled={disabled}
                />
              )
            }
          </Form.Item>
          <Form.Item  className={styles.skuInfoTableInput}>
            {
              getFieldDecorator('supplyPrice')(
                <Input
                  className={styles.skuInfoTableInput}
                  placeholder={languageForProductEdit.SupplyCost}
                  // value={supplyPrice}
                  disabled={disabled}
                />
              )
            }
          </Form.Item>
          <Form.Item  className={styles.skuInfoTableInput}>
            {
              getFieldDecorator('refShipPrice')(
                <Input
                  className={styles.skuInfoTableInput}
                  placeholder={languageForProductEdit.ShippingFee}
                  // value={refShipPrice}
                  disabled={disabled}
                />
              )
            }
          </Form.Item>
          <a onClick={() => {
            this.setRateOfExChangeVisible(true);
          }}>{languageForProductEdit.CurrencyConverter}</a>
          <p style={{fontSize: 12, color: '#ccc'}}>{languageForProductEdit.BatchInputPromit}</p>
        </div>
        <Table

        />
      </div>
    )
  }
}
