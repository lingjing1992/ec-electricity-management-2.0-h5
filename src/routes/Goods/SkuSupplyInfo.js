import React from 'react';
import styles from './GoodsCreate.less';
import SkuInfoTable from './SkuInfoTable';

const SkuSupplyInfo = ({ form, languageDetails, permission }) => {
  const languageForProductEdit = languageDetails.goods.productEdit;
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
      />
    </div>
  )
}

export default SkuSupplyInfo;
