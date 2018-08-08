import React from 'react';
import { Button, Popconfirm } from 'antd';
import { getQueryString } from '../../utils/utils';
import styles from './GoodsCreate.less';
import SkuAttributeTable from './SkuAttributeTable';

const SkuAttribute = ({
    form,
    languageDetails,
    permission,
    onCreateAttribute,
    onCreateValue,
    propertyConfig,
    language,
    onAddNewProperty,
    onDeleteProperty,
    onAddNewPropertyGroup,
    onDeletePropertyGroup
  }) => {

  const languageForProductEdit = languageDetails.goods.productEdit;
  const languageForMessage = languageDetails.message;
  // propertyConfig =  propertyConfig || [];
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
                onClick={ onAddNewPropertyGroup }
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
                        onConfirm={ onDeletePropertyGroup }
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
                _index={index}
                languageDetails={languageDetails}
                isAdd={isAdd}
                language={language}
                form={form}
                permission={permission}
                onAddNewProperty={onAddNewProperty}
                onDeleteProperty={onDeleteProperty}
              />
            }</div>
          );
        })
      }
    </div>
  );
};

export default SkuAttribute
