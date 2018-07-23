//列表选择基础组件

import React, {PureComponent} from 'react';
import { Icon, Select, Input, Form, Tooltip} from 'antd';
import Table from '../../components/table';
import { connect } from 'dva';
import styles from './index.less';

const { Option } = Select;
const { Search } = Input;
const FormItem = Form.Item;

@connect(state => ({
  global: state.global
}))
export default class ListSelect extends PureComponent {
  static defaultProps = {
    spuList        : [],
    selectedSpuList: [],
    total          : 0,
    pageSize       : 10,
    seachType      : [],
    otherCondition : [],
    selectSpu      : () => {},
    getNewData     : () => {},
    onSearch       : () => {},
    tableKey       : 'Id',
    loading        : false,
    show           : false,
    onCancel      : () => {},
    onOk           : () => {},
    pageNum        : 1,
  }

  state = {
    selectedRowKeys: [],//已选择的ID
    selectedRows:[],//已选择的商品列表信息
//    currentPage: 1,
    condition:{
      searchType: 1,
      otherCondition: -1,
      sort: -1,
      keyword: '',
    },
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.selectedSpuList.length>0 && this.state.selectedRowKeys.length!==nextProps.selectedSpuList.length){
      this.setState({
        selectedRowKeys: nextProps.selectedSpuList.map((item)=>{return item[this.props.tableKey]}),
        selectedRows: nextProps.selectedSpuList.map((item) => {return item}),
      })
    }
  }

  //选择spu
  selectSpu = (selectedRowKeys) => {
    this.props.selectSpu(selectedRowKeys);
  }

  //删除spu
  spuDelete = (record) => {
    const {selectedRowKeys, selectedRows} = this.state;
    const { selectedSpuList, tableKey } = this.props;
    const ID             = record[tableKey];
    for (let i = 0; i < selectedSpuList.length; i++) {
      if (ID === selectedSpuList[i][tableKey]) {
        selectedRowKeys.splice(i, 1);
        selectedRows.splice(i, 1);
        const arr = selectedRowKeys.map((item)=>{
          return item;
        })
        const arr1 = selectedRows.map((item)=>{
          return item;
        })
        this.setState({
          selectedRowKeys: arr,
          selectedRows: arr1,
        })
        this.selectSpu(arr1);
        return;
      }
    }
  }


  // 切换页面时重新设置选择数组
  // 切换页码时选中的key数组不会变，但是由于源数据发生变化，所以选择的是数据返回只有当前页面，
  // 可根据key数组增删选中的数组数据
  resetSelectedRows = (newSelectedRows) => {
    const { selectedRows } = this.state;
    const { spuList, tableKey } = this.props;
    const IDs = spuList.map((item)=> {return item[tableKey]});
    const selectedSpuIds = newSelectedRows.map((item) => {return item[tableKey]});
    const currentPageSelectRowsArr = [];

    //选择已选择列表中当前页存在的数据
    for(let i=0;i<selectedRows.length;i++){
      if(IDs.indexOf(selectedRows[i][tableKey])>-1){
        currentPageSelectRowsArr.push(selectedRows[i][tableKey]);
      }
    }

    //若当前页已选择的ID不存在新选择的列表中则在总选择列表中删除该数据
    for(let j=0;j<currentPageSelectRowsArr.length;j++){
      const indexOfValue = selectedSpuIds.indexOf(currentPageSelectRowsArr[j]);
      if(indexOfValue===-1){
        for(let k=0; k<selectedRows.length; k++){
          if(currentPageSelectRowsArr[j] === selectedRows[k][tableKey]){
            selectedRows.splice(k,1);
            break;
          }
        }
      }
    }

    //若新选择的列表中的ID跟当前已选择的ID都不同，则新增改数据
    for(let n=0; n< newSelectedRows.length; n++){
      let isNewSelect = true;
      for(let m=0; m<currentPageSelectRowsArr.length; m++){
        if(newSelectedRows[n][tableKey] === currentPageSelectRowsArr[m]){
          isNewSelect = false;
          break;
        }
      }
      if(isNewSelect){
        selectedRows.push(newSelectedRows[n]);
      }
    }

    return selectedRows;
  }

  handleSearchType = (key) => {
    const { condition } = this.state;
    this.setState({
      condition: Object.assign(condition,{
        searchType: key,
      }),
    })
  }

  handleOtherCondition = (key) => {
    const { condition } = this.state;
    this.setState({
      condition: Object.assign(condition,{
        otherCondition: key,
      })
    })
    this.props.onSearch(condition);
  }

  handleSearch = (value) => {
    const { condition } = this.state;
    value = value ? value.trim() : value;
    this.setState({
      condition: Object.assign(condition,{
        keyword: value,
      }),
    })
    this.props.onSearch(condition);
  }

  //升序降序
  sortBy = (sort) => {
    const {condition}  = this.state;
    let mySort;
    if (sort.order === 'ascend') {//升序
      mySort = 1;
    }
    else if (sort.order === 'descend') {//降序
      mySort = 0;
    }else {
      mySort = -1;
    }
    if (condition.sort === mySort)return;
    this.setState({
      condition: Object.assign(condition,{
        sort: mySort,
      })
    })
    this.props.onSearch(condition);
  }

  render() {
    const {spuList, selectedSpuList, total, pageSize, seachType, otherCondition, tableKey, loading, show, pageNum} = this.props;
    const {selectedRowKeys, selectedRows, currentPage}          = this.state;
    const languageForMarketing = this.props.global.languageDetails.marketing.specialEdit;//营销多语言
    const languageForGlobal = this.props.global.languageDetails.global;
    const _this = this;
    const pageDetails = this.props.global.languageDetails.pageDetails;
    const global = this.props.global.languageDetails.global;
    const rowSelection               = {
      onChange       : (selectedRowKeys, selectedRows) => {
        const newSelectedRows = this.resetSelectedRows(selectedRows);
        this.setState({
          selectedRowKeys: selectedRowKeys,
          selectedRows: newSelectedRows,
        })
        this.selectSpu(newSelectedRows);
        console.log(selectedRowKeys);
      },
      selectedRowKeys: selectedRowKeys
    }
    //左边表格的列属性
    const columns                    = [
      {
        title    : 'SPU',
        dataIndex: 'spuId',
      },
      {
        title    : languageForMarketing.ProductImage,
        dataIndex: 'icon',
        render   : (text,record) => {
          return (
            <Tooltip placement="top" title={record.name}>
              <div className={styles.goodImage}>
                <img src={text}/>
              </div>
            </Tooltip>
          )
        }
      },
      // {
      //   title    : languageForMarketing.ProductName,
      //   dataIndex: 'name',
      //   className: 'goodNameTd',
      //   render   : (text) => {
      //     return (
      //       <div className={`${styles.goodName} showregular`}>{text}</div>
      //     )
      //   }
      // },
      {
        title    : languageForMarketing.ProductStatus,
        dataIndex: 'status',
        render   : (text) => {
          const statusText = {
            0: languageForMarketing.Unpublished,
            1: languageForMarketing.Published,
          }
          return (
            <span>{statusText[text]}</span>
          )
        }
      },
      {
        title    : languageForMarketing.Stock,
        dataIndex: 'storage',
        sorter   : true,
      },
    ];
    //右边表格的列属性
    const columnsRight               = columns.map((item,index) => {
      return {
        ...item,
      };
    })
    columnsRight[3].sorter = false;
    columnsRight.push({
      title    : languageForMarketing.Operation,
      dataIndex: 'operation',
      render   : (text, record) => {
        return (
          <a onClick={this.spuDelete.bind(this, record)}>{languageForMarketing.Delete}</a>
        )
      }
    });
    //左边表格的分页配置
    const paginationLeft = {
      total: total,
      defaultPageSize: pageSize,
      current: pageNum,
      showQuickJumper: false,
      simple: true,
      showTotal: (total) => {
        return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
      },
      onChange: (current) => {
        this.props.getNewData(current);
      },
    };
    //右边表格的分页配置
    const paginationRight = {
      total: selectedSpuList.length,
      defaultPageSize: pageSize,
      showQuickJumper: false,
      simple: true,
      showTotal: (total) => {
        return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
      },
    }

    return (
      <div>
        <div className={`${styles.spuSelect} clearfix`}>
          <Form
            layout="inline"
          >
            <FormItem
              className="belong"
            >
              <Select
                className="select-size-small"
                defaultValue={seachType.length>0 ? seachType[0].key : ''}
                onSelect={this.handleSearchType}
              >
                {
                  seachType.map((item)=>{
                    return (
                      <Option key={item.key} value={item.key} title={item.value}>{item.value}</Option>
                    )
                  })
                }
              </Select>
            </FormItem>
            <FormItem>
              <Search
                placeholder={languageForMarketing.Search}
                onSearch={value => this.handleSearch(value)}
                className="select-Input"
                enterButton
              />
            </FormItem>
            <FormItem>
              {
                otherCondition.length>0 && <Select
                  defaultValue={otherCondition.length>0 ? otherCondition[0].key : ''}
                  onSelect={this.handleOtherCondition}
                  className="select-size-small"
                >
                  {
                    otherCondition.map((item)=>{
                      return (
                        <Option key={item.key} value={item.key} title={item.value}>{item.value}</Option>
                      )
                    })
                  }
                </Select>
              }
            </FormItem>
          </Form>
          <Table
            rowKey={tableKey}
            dataSource={ spuList }
            columns={ columns }
            className={ styles.spuTbLeft }
            rowSelection={ rowSelection }
            pagination={paginationLeft}
            loading={loading}
            onChange={(a, b, sort) => {
              this.sortBy(sort);
            }}
          />
          <Icon className={styles.middleIcon} type="arrow-right" />
          <Table
            rowKey={tableKey}
            dataSource={ selectedSpuList }
            columns={ columnsRight }
            className={ styles.spuTbRight }
            pagination={paginationRight}
          />
        </div>
      </div>
    )
  }
}
