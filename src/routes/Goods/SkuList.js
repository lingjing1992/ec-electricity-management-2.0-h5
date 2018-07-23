/**
 * Created by xujunchao on 2017/11/2.
 */
import React, { Component } from 'react';
import { Button, Form, Input, Icon, Table, Checkbox, Tooltip } from 'antd';
import { connect } from 'dva';
import styles from './SkuList.less';

const FormItem = Form.Item;
const { Search } = Input;

@connect(state => ({
  sku: state.sku,
}))
@Form.create()
export default class SkuList extends Component {
  state = {
    type: 'sku',
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'sku/clear',
      payload: null,
    });
  }

  loadData() {
    const { type } = this.state;
    const { sku } = this.props;

    // console.log('goods', goods);

    this.props.dispatch({
      type: `sku/${type}GetList`,
      payload: sku.pushData,
    });
  }

  callback = (key) => {
    console.log(key);
  }
  searchData = () => {
    const { getFieldValue } = this.props.form;
    const { type } = this.state;
    // 如果keyword存在，进行搜索。
    this.props.dispatch({
      type: `sku/${type}PushShowNum`,
      payload: {
        page_num: 1,
      },
    });
    this.props.dispatch({
      type: `sku/${type}pushShowSize`,
      payload: {
        page_size: 20,
      },
    });
    this.props.dispatch({
      type: `sku/${type}PushKeyword`,
      payload: getFieldValue('keyword').trim(),
    });
    this.loadData();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { sku: { loading } } = this.props;
    const { sku } = this.props;
    const { type } = this.state;
    console.log('sku', sku);
    const columns = [
      // { title: '操作', dataIndex: 'name', key: 'name' },
      {
        title: 'SKU',
        dataIndex: 'sku_id',
        className: styles.skuListTd1,
        render: (text) => {
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd1}`}>
              {text}
            </div>
          );
        },
      },
      {
        title: 'SPU',
        dataIndex: 'spu_id',
        className: styles.skuListTd2,
        render: (text) => {
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd2}`}>
              {text}
            </div>
          );
        },
      },
      {
        title: '商家SKU',
        dataIndex: 'goods_id',
        className: styles.skuListTd3,
        render: (text) => {
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd3}`}>
              {text}
            </div>
          );
        },
      },
      {
        title: '商品名称',
        dataIndex: 'spu_name',
        className: styles.skuListTd4,
        render: (text) => {
          return (
            <Tooltip placement="top" title={text}>
              <div className={`${styles.shuxing} ${styles.skuListTd4}`}>
                {text}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: '属性集合',
        dataIndex: 'property',
        className: styles.skuListTd5,
        render: (text, record) => {
          console.log('record', record);
          const property = record.property || [];
          const result = property.map((item) => {
            return (
              <div>
                <p>{item.name}:{item.value}</p>
              </div>
            );
          });
          return (
            <Tooltip placement="top" title={result}>
              <div className={`${styles.shuxing} ${styles.skuListTd5}`}>
                {result}
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: '库存量',
        dataIndex: 'storage',
        className: styles.skuListTd6,
        render: (text) => {
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd6}`}>
              {text}
            </div>
          );
        },
      },
      {
        title: '原价',
        dataIndex: 'original_price',
        className: styles.skuListTd8,
        render: (text) => {
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd8}`}>
              {text}
            </div>
          );
        },
      },
      {
        title: '售价',
        dataIndex: 'price',
        className: styles.skuListTd9,
        render: (text) => {
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd9}`}>
              {text}
            </div>
          );
        },
      },
      {
        title: '预估物流费',
        dataIndex: 'estimate_ship',
        className: styles.skuListTd10,
        render: (text) => {
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd10}`}>
              {text}
            </div>
          );
        },
      },
      {
        title: '支持发货仓库',
        dataIndex: 'warehouse',
        className: styles.skuListTd11,
        render: (text, record) => {
          const warehouse = record.warehouse ? record.warehouse : [];
          const result = warehouse.map((item) => {
            return (
              <div key={item.local}>
                <Checkbox disabled defaultChecked={item.isSelected}>{item.local}</Checkbox>
              </div>
            );
          });
          return (
            <div className={`${styles.shuxing} ${styles.skuListTd11}`}>
              {result}
            </div>
          );
        },
      },
    ];
    const pagination = {
      total: sku.data && sku.data.total,
      showSizeChanger: true,
      defaultPageSize: sku.pushData && sku.pushData.page_size,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total) => {
        return (
          <div>{`共 ${total} 条数据`}</div>
        );
      },
      onShowSizeChange: (current, size) => {
        this.props.dispatch({
          type: `sku/${type}PushShowSize`,
          payload: {
            page_num: current,
            page_size: size,
          },
          callback: () => {
            this.loadData();
          },
        });
      },
      onChange: (current) => {
        this.props.dispatch({
          type: `sku/${type}PushShowNum`,
          payload: {
            page_num: current,
          },
          callback: () => {
            this.loadData();
          },
        });
      },
    };
    return (
      <div className={styles.SkuList}>
        <Form layout="inline" onSubmit={this.handleSubmit} className={styles.formList}>
          <FormItem>
            {getFieldDecorator('keyword', {
              rules: [{ required: false, message: '请输入搜索内容!' }],
            })(
              <Search
                placeholder="请输入搜索内容"
                onSearch={this.searchData}
                style={{ width: '200px' }}
                enterButton
              />)}
          </FormItem>
        </Form>
        <div className={styles.tableTop}>
          <Table
            scroll={{ x: 1000 }}
            columns={columns}
            pagination={pagination}
            dataSource={sku.data && sku.data.skus}
            loading={loading}
          />
        </div>
      </div>
    );
  }
}
