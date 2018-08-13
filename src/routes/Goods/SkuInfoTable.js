import React, { PureComponent } from 'react';
import Table from '../../components/table';
import styles from './GoodsCreate.less';
import { Input, Form, Tabs, Button } from 'antd';

const { TabPane } = Tabs;
export default class SkuInfoTable extends PureComponent {
  static defaultProps = {
    columns: [],
    dataSource: [],
  }

  //获取对应货币的值
  getCurrencyKey = (key) => {
    const { salesInfo } = this.props;
    if(salesInfo.length===0)return [];
    return salesInfo.filter( item => item.currency === key)[0].sku_info;
  }
  //批量填充
  BatchInput = () => {
    const { form: { getFieldsValue } } = this.props;
    const inputValue = getFieldsValue(['refPrice','supplyPrice','refShipPrice']);
    
  }
  render(){
    const { permission, languageDetails, form, columns, dataSource, dataKey, currency, salesInfo, disabled } = this.props;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const { getFieldDecorator } = form;
    return (
      <div>
        {/*批量填充*/}
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
          <Button
            type="primary"
            // onClick={}
            disabled={disabled}
            style={{float:'right'}}
          >
            {languageForProductEdit.BatchInput}
          </Button>
          <p style={{fontSize: 12, color: '#ccc'}}>{languageForProductEdit.BatchInputPromit}</p>

        </div>
        {/*货币对应的列表*/}
        <Tabs>
          {
            currency.map((item,index)=>{
              return (
                <TabPane
                  forceRender={true}
                  key={index}
                  tab={item}
                  className={styles.goodsTable}
                >
                  <Table
                    rowKey={dataKey}
                    dataSource={this.getCurrencyKey(item)}
                    columns={columns}
                    pagination={false}
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
