import React from 'react';
import { Button, Popconfirm } from 'antd';
import { getQueryString } from '../../utils/utils';
import styles from './GoodsCreate.less';
import SkuAttributeTable from './SkuAttributeTable';

const SkuAttribute = ({ form, languageDetails, permission, onCreateAttribute, onCreateValue, goodsDetail, language }) => {

  const languageForProductEdit = languageDetails.goods.productEdit;
  const languageForMessage = languageDetails.message;
  const propertyConfig =  goodsDetail.property_config || [];
  const isAdd = getQueryString().action == 'create';
  return (
    <div
      className={styles.card}
    >
      <div className="ant-card-head-title" style={{ display: 'block' }}>
        { languageForProductEdit.SKUAttribute }
        <div style={{ float: 'right', marginTop: -8 }}>
          <Button
            type="primary"
            onClick={ onCreateAttribute }
            disabled={ permission['100041'].disabled }
            style={{ marginRight: 8 }}
          >
            { languageForProductEdit.GeneratedData }
          </Button>
          {/*新增页面才能新增SKU*/}
          {
            isAdd ? (
              <Button
                type="primary"
                onClick={ onCreateAttribute }
                style={{ marginRight: 8 }}
              >
                { languageForProductEdit.newSKU }
              </Button>
            ) : null
          }
          <span>
            {
              isAdd ? (
                <span>
                  {
                    //sku属性的长度大于1才能删除
                    propertyConfig.length > 1 ? (
                      <Popconfirm
                        title={ languageForMessage.deleteTheTast }
                        onConfirm={ onCreateValue }
                      >
                        <Button
                        >
                          { languageForProductEdit.Delete }
                        </Button>
                      </Popconfirm>
                    ) : null
                  }
                </span>
              ) : null
            }
          </span>
        </div>
      </div>
      <div>
      </div>
      {
        propertyConfig.map((item, index) => {
          return (
            <div key={ index }>{
              <SkuAttributeTable
                dataSource={item}
                languageDetails={languageDetails}
                isAdd={isAdd}
                language={language}
                form={form}
              />
            }</div>
          );
        })
      }
    </div>
  );
};

export default SkuAttribute
