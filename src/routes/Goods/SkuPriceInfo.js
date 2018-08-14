import React from 'react';
import styles from './GoodsCreate.less';
import SkuInfoTable from './SkuInfoTable';
import { Input, Form } from 'antd';

const SkuPriceInfo = ({ form, languageDetails, permission, currency, skuPriceInfo }) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
  const { getFieldDecorator } = form;
  const disabled = permission['100042'].disabled;
  const columns = [
    {
      title: languageForProductEdit.SKUAttribute,
      dataIndex: 'name',
      key: 'name',
      classType: 2,
      render: (text, record) => {
        const result = record.sku_property_names.split(',') || '';
        return (
          <div className={styles.skuPropertyName}>]
            {`${result[0] || ''}${result[1] ? '-' : ''}${result[1] || ''}`}<br/>
            <span>{languageForProductEdit.Stock}：{record.quantity}</span>
          </div>
        );
      },
    },
    {
      title: languageForProductEdit.SupplyCost,
      dataIndex: 'supplyPrice',
      key: 'supplyPrice',
      classType: 2,
      render: (text, record) => {
        return (
          <span>{(text + record.refShipPrice).toFixed(2)}</span>
        );
      },
    },
    {
      title: languageForProductEdit.ReferencePrice,
      dataIndex: 'refPrice',
      key: 'refPrice',
      classType: 2,
    },
    {
      title: languageForProductEdit.OriginalPrice,
      dataIndex: 'price',
      key: 'price',
      classType: 2,
      render: (text, record, index) => {
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
                getFieldDecorator(`salesInfo[${record.index}].sku_info[${index}].price`,{
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
      title: languageForProductEdit.salesPrice,
      dataIndex: 'discount_price',
      key: 'discount_price',
      classType: 2,
      render: (text, record, index) => {
        return (
          <Form.Item>
            {
              getFieldDecorator(`salesInfo[${record.index}].sku_info[${index}].discount_price`,{
                initialValue: text
              })(
                <Input
                  disabled={disabled}
                  type='number'
                  placeholder={languageForProductEdit.salesPrice}
                />
              )
            }
          </Form.Item>
        );
      },
    },
    {
      title: languageForProductEdit.ShippingFee,
      dataIndex: 'ship_price',
      key: 'ship_price',
      classType: 2,
      render: (text, record, index) => {
        return (
          <Form.Item>
            {
              getFieldDecorator(`salesInfo[${record.index}].sku_info[${index}].ship_price`,{
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
    },
    {
      title: `${languageForProductEdit.Weight}（g）`,
      dataIndex: 'weight',
      key: 'weight',
      classType: 2,
    },
    {
      title: languageForProductEdit.SupplierSKU,
      dataIndex: 'seller_sku',
      key: 'seller_sku',
      classType: 2,
    },
  ];
  return (
    <div
      // title={languageForProductEdit.SKUSupplyInformation}
      className={styles.card}
      // bordered={false}
    >
      <div className="ant-card-head-title">{languageForProductEdit.SKUPrice}</div>

      <SkuInfoTable
        languageDetails={languageDetails}
        permission={permission}
        form={form}
        columns={columns}
        currency={currency}
        disabled={disabled}
        dataSource={skuPriceInfo}
        dataKey={'sku_property_ids'}
        rowSelection={true}
      />
    </div>
  )
}

export default SkuPriceInfo;
