import React, { PureComponent } from 'react';
import Table from '../../components/table';
import styles from './GoodsCreate.less';
import { Input, Form, Tabs, Button } from 'antd';
import { skuPricSolve } from '../../utils/utils';
import ExchangeRate from './ExchangeRate';
import { connect } from 'dva/index';

const { TabPane } = Tabs;

@connect(state => ({
  goodsCreate: state.goodsCreate,
}))
export default class SkuInfoTable extends PureComponent {
  static defaultProps = {
    columns: [],
    dataSource: [],
  }

  state = {
    selectedRowKeys:[],//批量选择id
  }

  componentWillReceiveProps(nextprops){
    const { hasTab, dataKey, exchangeRate, batchInput } = this.props;
    //默认全选
    if(nextprops.dataSource.length>0 && JSON.stringify(nextprops.dataSource) !== JSON.stringify(this.props.dataSource)){
      const selectedRowKeys = hasTab ? nextprops.dataSource[0].sku_info.map(item => item[dataKey])  : nextprops.dataSource.map(item => item[dataKey])
      this.setState({
        selectedRowKeys: selectedRowKeys
      })
    }
    //汇率发生变化则更新对应的价格
    if(this.props.goodsCreate.rateOfExChange.length>0 && JSON.stringify(nextprops.goodsCreate.rateOfExChange) !== JSON.stringify(this.props.goodsCreate.rateOfExChange) && exchangeRate){
      const selectedRowKeys = nextprops.dataSource[0].sku_info.map(item => item[dataKey]);
      batchInput(selectedRowKeys, nextprops.goodsCreate.rateOfExChange);
    }
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
  render(){
    const { languageDetails, form, columns, dataKey, currency, disabled, rowSelection, batchInput, inputArr, hasTab, dataSource, exchangeRate, goodsCreate: { rateOfExChange } } = this.props;
    const { selectedRowKeys } = this.state;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const { getFieldDecorator } = form;
    // const { rateOfExChange } = this.props.goodsCreate;
    // 价格选择批量填充，打勾的才填充
    const rowSelectionObject = rowSelection ? {
      selectedRowKeys: selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({
          selectedRowKeys: selectedRowKeys
        })
      },
    } : null;
    return (
      <div>
        {/*批量填充*/}
        <div>
          <span className={styles.skuInfoTableText} style={{marginRight: 8}}>{languageForProductEdit.BatchInput}</span>
          {/*需要填充的输入框*/}
          {
            inputArr.map((item,index)=>{
              return (
                <Form.Item key={index} className={styles.skuInfoTableInput}>
                  {
                    getFieldDecorator(item.key)(
                      <Input
                        placeholder={item.placeholder}
                        // value={refPrice}
                        disabled={disabled}
                      />
                    )
                  }
                </Form.Item>
              )
            })
          }
          {/*汇率*/}
          {
            exchangeRate && rateOfExChange.length>0  ? (
              <ExchangeRate
                languageDetails={languageDetails}
              />
            ) : null
          }
          {/*批量填充*/}
          <Button
            type="primary"
            onClick={()=>{batchInput(selectedRowKeys, rateOfExChange)}}
            disabled={disabled}
            style={{float:'right'}}
          >
            {languageForProductEdit.BatchInput}
          </Button>

          {
            exchangeRate ? (
              <p style={{fontSize: 12, color: '#ccc'}}>{languageForProductEdit.BatchInputPromit}</p>
            ) : ''
          }

        </div>
        {
          !hasTab ? (
            // 无货币
            <Table
              rowKey={dataKey}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowSelection={rowSelectionObject}
              className={styles.goodsTable}
            />
          ) : (
            //货币对应的列表
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
                        rowSelection={rowSelectionObject}
                      />
                    </TabPane>
                  )
                })
              }
            </Tabs>
          )
        }

      </div>
    )
  }
}
