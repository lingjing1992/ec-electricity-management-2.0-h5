import React, { PureComponent } from 'react';
import Table from '../../components/table';
import styles from './GoodsCreate.less';
import { Input, Form, Tabs } from 'antd';

const { TabPane } = Tabs;
export default class SkuInfoTable extends PureComponent {
  static defaultProps = {
    columns: [],
    dataSource: [],
  }

  //获取对应货币的值
  getCurrencyKey = (key) => {
    const { salesInfo } = this.props;
    return salesInfo.filter( item => item.currency === key).sku_info;
  }
  render(){
    const { permission, languageDetails, form, columns, dataSource, dataKey, currency, salesInfo } = this.props;
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
            // this.setRateOfExChangeVisible(true);
          }}>{languageForProductEdit.CurrencyConverter}</a>
          <p style={{fontSize: 12, color: '#ccc'}}>{languageForProductEdit.BatchInputPromit}</p>
        </div>
        <Tabs>
          {
            currency.map((item,index)=>{
              return (
                <TabPane
                  forceRender={true}
                  key={index}
                  tab={item}
                >
                  <Table
                    rowKey={dataKey}
                    dataSource={this.getCurrencyKey[item]}
                    columns={columns}
                  />
                </TabPane>
              )
            })
          }
        </Tabs>
      </div>
    )
  }
}
