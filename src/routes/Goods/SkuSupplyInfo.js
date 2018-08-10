import React from 'react';
import styles from './GoodsCreate.less';
import SkuInfoTable from './SkuInfoTable';
import { Input } from 'antd';

const SkuSupplyInfo = ({ form, languageDetails, permission, currency, salesInfo }) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
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
      render: (text, record) => {
        return (
          <Input
            disabled={this.props.disabled}
            value={text}
            type='number'
            // onChange={e => this.handleFieldChange(e, 'refPrice', record.sku_property_ids)}
            placeholder={languageForProductEdit.OriginalPrice}
          />
        );
      },
    },
    {
      title: languageForProductEdit.SupplyPrice,
      dataIndex: 'supplyPrice',
      key: 'supplyPrice',
      classType: 6,
      render: (text, record) => {
        return (
          <Input
            disabled={this.props.disabled}
            value={text}
            type='number'
            // onChange={e => this.handleFieldChange(e, 'supplyPrice', record.sku_property_ids)}
            placeholder={languageForProductEdit.SupplyPrice}
          />
        );
      },
    },
    {
      title: languageForProductEdit.ShippingFee,
      dataIndex: 'refShipPrice',
      key: 'refShipPrice',
      classType: 6,
      render: (text, record) => {
        return (
          <Input
            disabled={this.props.disabled}
            value={text}
            type='number'
            // onChange={e => this.handleFieldChange(e, 'refShipPrice', record.sku_property_ids)}
            placeholder={languageForProductEdit.ShippingFee}
          />
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
        salesInfo={salesInfo}
      />
    </div>
  )
}

export default SkuSupplyInfo;
