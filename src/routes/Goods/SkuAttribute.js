import React from 'react';
import { Button, Popconfirm } from 'antd';
import { getQueryString } from '../../utils/utils';
import styles from './GoodsCreate.less';

const SkuAttribute = ({ form, languageDetails, permission, createSkuAttributesArr, onCreateAttribute, onCreateValue,  }) => {
  const { getFieldDecorator } = form;
  const languageForProductEdit = languageDetails.goods.productEdit;
  const languageForMessage = languageDetails.message;
  const isAdd = getQueryString().action == 'add';
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
                    createSkuAttributesArr.length > 1 ? (
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
        createSkuAttributesArr.map((item, index) => {
          return (
            <div key={ index }>{ item }</div>
          );
        })
      }
    </div>
  );
};

export default SkuAttribute
