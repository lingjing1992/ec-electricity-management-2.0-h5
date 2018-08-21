import React from 'react';
import styles from './GoodsCreate.less';
import SkuInfoTable from './SkuInfoTable';
import { Input, Form } from 'antd';

const SkuOtherInfo = ({ form, languageDetails, permission, currency, skuOtherInfo }) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
  const { getFieldDecorator } = form;
  const disabled = permission['100042'].disabled;
  const dataKey = 'sku_property_ids';
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
      title: languageForProductEdit.Stock,
      dataIndex: 'quantity',
      key: 'quantity',
      classType: 6,
      render: (text, record,index) => {
        return (
          <div>
            <Form.Item style={{display:'none'}}>
              {
                getFieldDecorator(`otherInfo[${index}].sku_property_ids`,{
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
                getFieldDecorator(`otherInfo[${index}].quantity`,{
                  initialValue: text
                })(
                  <Input
                    disabled={disabled}
                    type='number'
                    placeholder={languageForProductEdit.Stock}
                  />
                )
              }
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: `${languageForProductEdit.Weight}（g）`,
      dataIndex: 'weight',
      key: 'weight',
      classType: 6,
      render: (text, record, index) => {
        return (
          <Form.Item>
            {
              getFieldDecorator(`otherInfo[${index}].weight`,{
                initialValue: text
              })(
                <Input
                  disabled={disabled}
                  type='number'
                  placeholder={`${languageForProductEdit.Weight}（g）`}
                />
              )
            }
          </Form.Item>
        );
      },
    }, {
      title: languageForProductEdit.SupplierSKU,
      dataIndex: 'seller_sku',
      key: 'seller_sku',
      classType: 6,
      render: (text, record, index) => {
        return (
          <Form.Item>
            {
              getFieldDecorator(`otherInfo[${index}].seller_sku`,{
                initialValue: text || null
              })(
                <Input
                  disabled={disabled}
                  type='number'
                  placeholder={languageForProductEdit.SupplierSKU}
                />
              )
            }
          </Form.Item>
        );
      },
    },
  ];
  const inputArr = [
    {
      key: 'quantity',
      placeholder: languageForProductEdit.Stock
    },
    {
      key: 'weight',
      placeholder: languageForProductEdit.Weight
    },
    {
      key: 'seller_sku',
      placeholder: languageForProductEdit.SupplierSKU
    }
  ]
  const batchInput = (selectedRowKeys) => {
    const { getFieldsValue, setFieldsValue } = form;
    const keysArr = inputArr.map(item => item.key);
    const inputValue = getFieldsValue([...keysArr, 'otherInfo']);
    const result = inputValue.otherInfo.map((item) => {
      if(selectedRowKeys.indexOf(item[dataKey])>-1) {
        const obj = {};
        keysArr.forEach((item) => {
          inputValue[item] ? obj[item] = inputValue[item] : null;
        })
        return {
          ...item,
          ...obj
        }
      }else {
        return item
      }
    })
    console.log(result);
    // return;
    setFieldsValue({
      otherInfo: result
    })
  }
  return (
    <div
      className={styles.card}
    >
      <div className={`ant-card-head-title ${styles.otherInfo}`}>
        {languageForProductEdit.OtherInformation}
      </div>
      <SkuInfoTable
        languageDetails={languageDetails}
        permission={permission}
        form={form}
        columns={columns}
        currency={currency}
        dataSource={skuOtherInfo}
        disabled={disabled}
        dataKey={dataKey}
        batchInput={batchInput}
        inputArr={inputArr}
        hasTab={false}
        rowSelection={true}
        exchangeRate={false}
      />
    </div>
  )
}

export default SkuOtherInfo
