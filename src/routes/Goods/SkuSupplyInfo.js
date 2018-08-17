import React from 'react';
import styles from './GoodsCreate.less';
import SkuInfoTable from './SkuInfoTable';
import { skuPricSolve } from '../../utils/utils';
import { Input, Form } from 'antd';

const SkuSupplyInfo = ({ form, languageDetails, permission, currency, salesInfo }) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
  const { getFieldDecorator } = form;
  const disabled = permission['100042'].disabled;
  //table列表
  const columns = [
    {
      title: languageForProductEdit.SKUAttribute,
      dataIndex: 'name',
      key: 'name',
      classType: 2,
      render: (text, record) => {
        const result = record.sku_property_names.split(',') || '';
        return (
          <div>{`${result[0] || ''}${result[1] ? '-' : ''}${result[1] || ''}`}</div>
        );
      },
    },
    {
      title: languageForProductEdit.OriginalPrice,
      dataIndex: 'refPrice',
      key: 'refPrice',
      classType: 6,
      render: (text, record,index) => {
        return (
          <div>
            <Form.Item style={{display:'none'}}>
              {
                getFieldDecorator(`salesInfo[${record.index}].sku_info[${index}].sku_property_ids`,{
                  initialValue: record.sku_property_ids
                })(
                  <Input
                    disabled={disabled}
                  />
                )
              }
            </Form.Item>
            <Form.Item>
              {
                getFieldDecorator(`salesInfo[${record.index}].sku_info[${index}].refPrice`,{
                  initialValue: text
                })(
                  <Input
                    disabled={disabled}
                    type='number'
                    placeholder={languageForProductEdit.OriginalPrice}
                  />
                )
              }
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: languageForProductEdit.SupplyPrice,
      dataIndex: 'supplyPrice',
      key: 'supplyPrice',
      classType: 6,
      render: (text, record, index) => {
        return (
          <Form.Item>
            {
              getFieldDecorator(`salesInfo[${record.index}].sku_info[${index}].supplyPrice`,{
                initialValue: text
              })(
                <Input
                  disabled={disabled}
                  type='number'
                  placeholder={languageForProductEdit.SupplyPrice}
                />
              )
            }
          </Form.Item>

        );
      },
    },
    {
      title: languageForProductEdit.ShippingFee,
      dataIndex: 'refShipPrice',
      key: 'refShipPrice',
      classType: 6,
      render: (text, record, index) => {
        return (
          <Form.Item>
            {
              getFieldDecorator(`salesInfo[${record.index}].sku_info[${index}].refShipPrice`, {
                initialValue: text
              })(
                <Input
                  disabled={disabled}
                  type='number'
                  placeholder={languageForProductEdit.ShippingFee}
                />
              )
            }
          </Form.Item>
        );
      },
    }
    ];
  const dataKey = 'sku_property_ids';
  //需要填充的数据
  const inputArr = [
    {
      key: 'refPrice',
      placeholder: languageForProductEdit.OriginalPrice,
    },
    {
      key: 'supplyPrice',
      placeholder: languageForProductEdit.SupplyCost,
    },
    {
      key: 'refShipPrice',
      placeholder: languageForProductEdit.ShippingFee
    }
    ];
  //批量填充
  const batchInput = (selectedRowKeys, rateOfExChange) => {
    const { getFieldsValue, setFieldsValue } = form;
    const keysArr = inputArr.map(item => item.key);
    const inputValue = getFieldsValue([...keysArr, 'salesInfo']);
    const result = skuPricSolve(selectedRowKeys, inputValue, rateOfExChange, keysArr, dataKey);
    setFieldsValue({
      salesInfo: result
    })
  }
  return (
    <div
      className={styles.card}
    >
      <div className="ant-card-head-title">{languageForProductEdit.SKUSupplyInformation}</div>

      <SkuInfoTable
        languageDetails={languageDetails}
        permission={permission}
        form={form}
        columns={columns}
        currency={currency}
        dataSource={salesInfo}
        disabled={disabled}
        dataKey={dataKey}
        batchInput={batchInput}
        inputArr={inputArr}
        rowSelection={true}
        exchangeRate={true}
        hasTab={true}
      />
    </div>
  )
}

export default SkuSupplyInfo;
