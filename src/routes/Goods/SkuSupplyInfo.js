import React from 'react';
import styles from './GoodsCreate.less';
import SkuInfoTable from './SkuInfoTable';
import { Input, Form } from 'antd';

const SkuSupplyInfo = ({ form, languageDetails, permission, currency, salesInfo }) => {
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
  return (
    <div
      // title={languageForProductEdit.SKUSupplyInformation}
      className={styles.card}
      // bordered={false}
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
        dataKey={'sku_property_ids'}
      />
    </div>
  )
}

export default SkuSupplyInfo;
