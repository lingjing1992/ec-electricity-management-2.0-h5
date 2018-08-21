import React, { Component } from 'react';
import Table from '../../components/table';
import { Input, Button, Popconfirm, Form } from 'antd';
import styles from './GoodsCreate.less';
import { goodsEditorLanguage } from '../../utils/utils';

export default class DefineSpuAttribute extends Component {

  state = {
    dataSource: [{
      id: 0,
    }, {
      id: 1,
    }],
    num: 2,
  };

  //添加spu属性值
  addSpuAttribute = () => {
    let { num, dataSource } = this.state;
    dataSource.push({
      id: num++
    });
    this.setState({
      num
    })
  };

  //删除spu属性值
  removeSpuAttribute = (index) => {
    let { dataSource } = this.state;
    dataSource.splice(index, 1);
    this.setState({
      dataSource
    })
  };

  render() {
    const { form, languageDetails, language } = this.props;
    const { dataSource } = this.state;
    const { getFieldDecorator } = form;
    const languageForProductEdit = languageDetails.goods.productEdit;
    const languageForGlobal = languageDetails.global;
    const languageForMessage = languageDetails.message;
    // 表格列
    let columns = [
      {
        title: languageForProductEdit.Type,
        dataIndex: 'name',
        key: 'name',
        classType: 2,
        render: (text, record, index) => {
          const name = index === 0 ? languageForProductEdit.attributeName : languageForProductEdit.attributeValue;
          return (
            <div>
              {name}
            </div>
          );
        },
      },
      {
        title: languageForProductEdit.Operation,
        key: 'action',
        classType: 2,
        render: (text, record, index) => {
          return (
            <div>
              {
                dataSource.length > 2 && index > 1 ? (
                  <Popconfirm title={languageForMessage.deleteThisLine}
                              onConfirm={() => this.removeSpuAttribute(index)}>
                    <a>{languageForProductEdit.Delete}</a>
                  </Popconfirm>
                ) : (<span>-</span>)
              }
            </div>
          );
        },
      },
    ];
    //创建语言填充栏
    const languageInput = language.map((item) => {
      return {
        title: goodsEditorLanguage(item, languageForGlobal),
        dataIndex: item,
        key: item,
        classType: 4,
        render: (text, record, index) => {
          return (
            <div>
              <Form.Item key={index}>
                {
                  getFieldDecorator(`defineSpu[${index}].lang.${item}`, {
                    initialValue: null,
                  })(
                    <Input/>,
                  )
                }
              </Form.Item>
            </div>
          );
        },
      };
    });
    //把语言填充输入框插入表格列
    columns.splice(1, 0, ...languageInput);
    return (
      <div className={styles.goodsTable}>
        <Table
          columns={columns}
          pagination={false}
          dataSource={dataSource}
          rowKey="id"
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.addSpuAttribute}
          icon="plus"
        >
          {languageForProductEdit.newSPU}
        </Button>
      </div>
    );
  }
}
