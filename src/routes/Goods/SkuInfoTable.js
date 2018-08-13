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
  getCurrencyKey = (key, index) => {
    const { dataSource } = this.props;
    if(dataSource.length===0)return [];
    const skuInfo = dataSource.filter( item => item.currency === key)[0].sku_info;
    return skuInfo.map(item => {
      return {
        ...item,
        index: index
      }
    })
  }
  //批量填充
  BatchInput = () => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const inputValue = getFieldsValue(['refPrice','supplyPrice','refShipPrice', 'salesInfo']);
    setFieldsValue({
      salesInfo: {
        skuInfo: inputValue.salesInfo.skuInfo.map(() => {
          return {
            refPrice: inputValue.refPrice,
            supplyPrice: inputValue.supplyPrice,
            refShipPrice: inputValue.refShipPrice,
          }
        })
      }
    })
  }
  render(){
    const { languageDetails, form, columns, dataKey, currency, disabled } = this.props;
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
            onClick={this.BatchInput}
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
                  {/*货币值绑定，隐藏，无法修改*/}
                  {
                    getFieldDecorator(`salesInfo[${index}].currency`,{
                      initialValue: item
                    })(
                      <Input
                        style={{display: 'none'}}
                      />
                    )
                  }
                  <Table
                    rowKey={dataKey}
                    dataSource={this.getCurrencyKey(item,index)}
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
