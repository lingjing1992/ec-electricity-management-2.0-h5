// 商品选择
import React, {Component} from "react";
import { Form, Input, Select } from "antd";
import { setStateObjectKey } from '../../../utils/utils';
import Table from '../../../components/table';
import styles from '../StyleTemplatesDetails.less';
import { connect } from 'dva';

const FormItem = Form.Item;
const { Option } = Select;

@connect(state => ({
  global: state.global
}))
export default class ProductsSelect extends Component {
  state ={
    searchKey: '',
    payload: {
      pageSize: 5,
      pageNum: 1,
      status: -1,
      sort: -1,
      filter: 2,
      keyword: '',
      selectSpuIds: [],
    },
    basicInfoList: [],
    total: 0,
    // selectRowKey:[],//已选择商品id
    selectGoods: [],//提选择商品对象
  }
  componentWillMount() {
    this.init();
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.visible !== this.props.visible && nextProps.visible){
      this.init();
    }
  }
  init(){
    this.handleSelectGoods({
      pageNum: 1,
      filter: 2,
      keyword: '',
    })
  }
  //选择商品
  handleSelectGoods = (params) => {
    setStateObjectKey(this,'payload',params);
    this.props.dispatch({
      type: 'marketing/getDiscountBriefSpuList',
      payload: this.state.payload,
      callback: (data) => {
        this.setState({
          basicInfoList: data.data.basicInfoList,
          total: data.data.total,
        })
      }
    });
  }

  render(){
    const {  selectedGoodsList, selectedCard, selectRowKey} = this.props;
    const { basicInfoList, total, payload } = this.state;
    // let selectedGoodsList = selectedGoodsList.map(item=>item);
    const {editTemplate} = this.props.global.languageDetails;
    const languageForMessage = this.props.global.languageDetails.message;
    let columns = [
      {
        title: 'SPU',
        dataIndex: 'spuId',
        classType: 2,
      },
      {
        title: editTemplate.Image,
        dataIndex: 'icon',
        classType: 2,
        render: (src) => {
          return <img src={src} style={{width: '50px', height: '50px'}}/>
        }
      },
      {
        title: editTemplate.Title,
        dataIndex: 'name',
        classType: 4,
        render: (text) => {
          return <span className="ellipsis" style={{
            height: 14,
            lineHeight: '14px',
            display: 'block',
          }} title={text}>{text}</span>
        }
      },
      {
        title: editTemplate.Status,
        dataIndex: 'status',
        classType: 2,
        render: (text) => {
          return text === 0 ? editTemplate.Unpublished : editTemplate.Published
        }
      },
      {
        title: editTemplate.SupplyCost,
        dataIndex: 'supplyPriceDesc',
        classType: 2,
      },
      {
        title: editTemplate.SalesPrice,
        dataIndex: 'discountPriceDesc',
        classType: 2,
      },
      {
        title: editTemplate.ShippingFee,
        dataIndex: 'shipingPriceDesc',
        classType: 2,
      },
      {
        title: editTemplate.Stock,
        dataIndex: 'storage',
        classType: 2,
      }
      ];
    const rowSelection = {
      selectedRowKeys: selectRowKey,
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.onSetState('selectRowKey',selectedRowKeys);
      },
    }

    return(
      <div>
        <div className={styles.searchBox} style={{marginBottom: 20}}>
          <Form layout="inline">
            <FormItem
              className="belong"
            >
              <Select
                className="select-size-small"
                // defaultValue={editTemplate.productName}
                value={payload.filter}
                onChange={(value) => {
                  setStateObjectKey(this,'payload',{
                    filter: value
                  });
                }}>
                <Option value={1}>SPU ID</Option>
                <Option value={2} selected>{editTemplate.productName}</Option>
              </Select>
            </FormItem>
            <FormItem>
              <Input.Search
                className="select-Input"
                enterButton
                placeholder={editTemplate.Search}
                onSearch={(val) => {
                  this.handleSelectGoods({
                    keyword: val,
                  })
                }}/>
            </FormItem>
          </Form>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          rowKey='spuId'
          dataSource={basicInfoList}
          pagination={{
            pageSize: payload.pageSize,
            total: total,
            onChange: (page) => {
              this.handleSelectGoods({
                pageNum: page,
              })
            },
            current: payload.pageNum
          }}
        ></Table>
        <div style={{
          position: 'absolute',
          left: 14,
          bottom: 72
        }}>
          {languageForMessage.chosenNproducts[0]}{selectRowKey.length}{languageForMessage.chosenNproducts[1]}</div>
        {/*<div style={{position: 'absolute', bottom: '-40px'}}>*/}
          {/*{`${editTemplate.chosenNproducts1} ${selectRowKey.length} ${editTemplate.chosenNproducts2}`}*/}
        {/*</div>*/}
      </div>
    )
  }
}
