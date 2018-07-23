
import React, { PureComponent } from 'react';
import { Table } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import {connect} from "dva";

@connect((state) => ({
  global: state.global
}))
export default class StandardTable extends PureComponent {
  static defaultProps = {
    bordered: false,
    // childrenColumnName:[],
    columns:[],
    components:{},
    dataSource: [],
    defaultExpandAllRows: false,
    // defaultExpandedRowKeys: [],
    // expandedRowKeys: [],
    expandedRowRender: () => {},
    expandRowByClick: false,
    footer: ()=>{},
    indentSize: 15,
    loading: false,
    locale: {},
    pagination: {},
    rowClassName: () => {},
    rowKey: 'key',
    rowSelection: null,
    scroll: {},
    showHeader: true,
    size: 'default',
    title: ()=>{},
    onChange: () => {},
    onExpand: () => {},
    onExpandedRowsChange: () => {},
    onHeaderRow: () => {},
    onRow: () => {},
    needToGetWidth: false,//是否需要计算长度
    autoGetScroll: false,//是否自动计算表格的滚动
    isHalfPadding: false, //上下内边距
    className: '',
    style: {},//样式
  }

  state = {
    classType: {
      //操作图标
      1: {
        className:styles.columnsChild1,
        width: 90,
      },
      //操作、来源、价格
      2:  {
        className:styles.columnsChild2,
        width: 100,
      },
      //时间、国家
      3:  {
        className:styles.columnsChild3,
        width: 120,
      },
      //订单ID、交易号、账单号
      4:  {
        className:styles.columnsChild4,
        width: 180,
      },
      //邮箱、商品信息
      5:  {
        className:styles.columnsChild5,
        width: 200,
      },
      6:  {
        className:styles.columnsChild6,
        width: 220,
      },
      7:  {
        className:styles.columnsChild7,
        width: 240,
      },
      8:  {
        className:styles.columnsChild8,
        width: 130,
      },
      9:  {
        className:styles.columnsChild8,
        width: 170,
      },
    }
  }

  componentWillReceiveProps(nextProps){
    //如果列发生改变则重新计算长度
    let columnsIsUpdate = false;
    if(nextProps.columns.length !== this.props.columns.length){
      columnsIsUpdate = true;
    }else {
      columnsIsUpdate = nextProps.columns.some((item,index)=>{
        return item.dataIndex !== this.props.columns[index].dataIndex;
      })
    }
    if(columnsIsUpdate){
      this.getTableWidth(nextProps);
    }
  }
  // componentWillReceiveProps(nextProps){
  //   const isUpdate = nextProps.columns.some((item,index)=>{
  //
  //   })
  // }
  componentDidMount(){
    this.getTableWidth(this.props);
  }

  componentWillUnmount(){
    this.props.dispatch({
      type: 'global/setContentWidth',
      payload: 947,
    })
  }

  getTableWidth = (props) => {
    const { classType } = this.state;
    const { columns, needToGetWidth } = props;
    if(needToGetWidth){
      let width = 0;
      columns.forEach((item)=>{
        width +=  classType[item.classType].width;
        // console.log(item.title);
      })
      width += 20;
      this.props.dispatch({
        type: 'global/setContentWidth',
        payload: width,
      })
      console.log(width);
    }
  }

  render(){
    const { bordered, columns, components, dataSource, defaultExpandAllRows, defaultExpandedRowKeys, expandedRowKeys, expandedRowRender, expandRowByClick, footer, indentSize, loading, locale, pagination, rowClassName, rowKey, rowSelection, scroll, showHeader, size, title, onChange, onExpand, onExpandedRowsChange, onHeaderRow, onRow, needToGetWidth, isHalfPadding, className, style, autoGetScroll } = this.props;
    let object = {};
    object  = defaultExpandedRowKeys ? { defaultExpandedRowKeys: defaultExpandedRowKeys } : {};
    object  = expandedRowKeys ? { ...object, expandedRowKeys: expandedRowKeys } : {...object};
    //如果存在翻页，则默认显示跳转页码器
    if(typeof pagination === 'object'){
      pagination.showQuickJumper = pagination.hasOwnProperty('showQuickJumper') ? pagination.showQuickJumper : true
    }
    // object  = expandedRowRender ? { ...object, expandedRowRender: expandedRowRender } : {...object};
    const { classType } = this.state;
    const { contentWidth } = this.props.global;
    const scrollDefault = autoGetScroll ? {x:contentWidth} : {};
    // const scrollDefault = {};
    //classType如果设定则所有的列都要设，否则可能导致自动适应不太美观
    const newColumns = columns.map((item) => {
      if(item.classType){
        item.className = classNames(item.className,classType[item.classType].className);
      }
      item.className = classNames(item.className,isHalfPadding ? styles.halfPadding : '');
      return item;
    })
    return (
      <div className={styles.newTable}>
        <Table
          {
            ...object
          }
          bordered={bordered}
          columns={newColumns}
          components={components}
          dataSource={dataSource}
          defaultExpandAllRows={defaultExpandAllRows}
          expandedRowRender={expandedRowRender}
          expandRowByClick={expandRowByClick}
          footer={footer}
          indentSize={indentSize}
          loading={loading}
          locale={locale}
          pagination={pagination}
          rowClassName={rowClassName}
          rowKey={rowKey}
          rowSelection={rowSelection}
          scroll={Object.assign(scrollDefault,scroll)}
          showHeader={showHeader}
          size={size}
          title={title}
          onChange={onChange}
          onExpand={onExpand}
          onExpandedRowsChange={onExpandedRowsChange}
          onHeaderRow={onHeaderRow}
          onRow={onRow}
          className={classNames(className)}
          style={style}
        />
      </div>
    )
  }
}
