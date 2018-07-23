import React, { Component } from 'react';
import {
  Input,
  Select,
  Icon,
  Carousel,
  // Table,
  Button,
  Pagination,
  Spin,
  Tabs,
  Popconfirm,
  message,
  Tooltip,
  Form,
  Modal,
} from 'antd';
import Table from '../../components/table';
import { Link } from 'dva/router';
import styles from './DistributionMarket.less';
import { getQueryString } from '../../utils/utils';

import { connect } from 'dva';
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const FormItem = Form.Item;

@connect(state => ({
  distribution: state.distribution,
  global: state.global,
}))

export default class DistributionMarket extends Component {
  state={
//    searchType: [
//      {
//        id:0,
//        text: '商品名称',
//      }
//    ],
    condition:[
      {
        text:'销量',
        id:0,
        sort:1,
        selected: true,
      },
      {
        text:'供货成本',
        id:1,
        sort:0,
        selected: false
      },
      {
        text:'上架时间',
        id:2,
        sort:0,
        selected: false,
      }
    ],
    products: [

    ],
    productsTatal:0,
    //商品详情
    productDetail:{
      images: [],
      spuId:0,
      spuName:'',
      status:0,
      supplyPrice: 0,
      salesCount: 0,
      shipPrice: 0,
      storage: 0,
      skus:[],
    },
    //商品轮播小图box滑动距离
    sliderTranslate:0,
    //跑马灯的react对象
    sliderDom:0,
    sliderIndex: 0,
    //轮播每张的宽度
    sliderItemWidth : 54,
    //每组图片的长度,暂定为4张
    groupImagesLength: 4,
    //当前组的索引
    groupIndex:0,
    timer:[],
    produsctShow: false,
    checkParams:{
      filter: 1,
      keyword: '',
      sort: 0,
      orderBy: 0,
      pageNum: 1,
      pageSize: 10,
    },
    tabActiveKey: '1',
    //领取详情
    shelfStatus: '',
    //是否是自己的商品
    isSelfGoods: 0,
    //商品变更参数
    supplierChangesParams:{
      currentPage: 1,
      pageSize: 20,
      orderBy: 0,
      filter: 1,
      keyword: '',
      tabId: 1
    },
    //商品变更数据
    supplierChangesData:{
      spuUpdateInfos:[],
      pageBean: {

      }
    }
  }

  componentWillMount(){
    const routeQuery = getQueryString();
    if(routeQuery.tab){
      this.setState({
        tabActiveKey: routeQuery.tab
      })
      if(routeQuery.tab === '3'){
        this.setState({
          supplierChangesParams: {
            ...this.state.supplierChangesParams,
            tabId: routeQuery.tabId
          }
        })
        this.supplierChanges();
      }
    }
    this.setPageSize();
    // window.addEventListener('resize',this.setPageSize,false);
  }

  componentWillUnmount(){
    // window.removeEventListener('resize',this.setPageSize);
  }

  loadData = () => {
    const { checkParams, products } = this.state;
    this.setState({
      products: Object.assign(products,{
        images: [],
      })
    })
    this.props.dispatch({
      type:'distribution/getDistributionSpus',
      payload:checkParams,
      callback: (data) => {
        const _this = this;
        if(data.status === 200){
          setTimeout(()=>{
            _this.setState({
              products: data.data.spus,
              productsTatal: data.data.total,
            })
          },0)
        }
      }
    })
  }

  //获取商品详情
  getProductDetail = (spuId,sellerBrandId,isSelfGoods) => {
    const { sliderDom } = this.state;
    this.setState({
      productDetail: {
        images: [],
        spuId:0,
        spuName:'',
        status:0,
        supplyPrice: 0,
        salesCount: 0,
        shipPrice: 0,
        storage: 0,
        skus:[],
      },
    })
    this.props.dispatch({
      type:'distribution/getDistributionSpuDetail',
      payload:{
        spuId: spuId,
        sellerBrandId: sellerBrandId
      },
      callback: (data) => {
        if(data.status === 200){
          data = data.data;
          this.setState({
            productDetail: data,
            sliderTranslate: 0,
            sliderIndex: 0,
            groupIndex:0,
            isSelfGoods: isSelfGoods,
          })
        }else {
          this.handleProductShow(false);
        }
      }
    })
  }

  //领取商品
  applyDistributionSpu = (spuId,sellerBrandId,value) => {
    const { productDetail } = this.state;
    this.props.dispatch({
      type:'distribution/applyDistributionSpu',
      payload:{
        spuId: spuId,
        status: value,
        sellerBrandId: sellerBrandId,
      },
      callback: (data) => {
        if(data.status === 200){
          this.setState({
            productDetail: Object.assign(productDetail,{
              receiveStatus: 1,
              status:value,
            })
          })
          this.setPageSize();
        }else {
          this.handleProductShow(false);
        }
      }
    })
  }

  //根据浏览器的宽度设置每页长度
  setPageSize = () => {
    const { checkParams } = this.state;
    const screenWidth = window.innerWidth;
    const contentWidth = screenWidth - 220 - 48 - 40 -40;//减去侧边栏，灰色边距，内容边距
    const pageSize = parseInt((contentWidth)/230)*3;
    this.setState({
      checkParams: Object.assign(checkParams,{
        pageSize: pageSize,
      })
    })
    this.loadData();
  }

  //搜索
  handleFilterSearch = (value) => {
    const { tabActiveKey, supplierChangesParams } = this.state;
    value = value.trim();
    //商品变更列表
    if(tabActiveKey == 3){
      this.setState(Object.assign(supplierChangesParams,{
        keyword:value,
      }))
      this.supplierChanges();
    }else {
      this.setCheckParams('pageNum',1);
      this.setCheckParams('keyword',value);
      this.setPageSize();
    }
  }
  //设置列表请求参数
  setCheckParams = (key,value) => {
    const { checkParams } = this.state;
    this.setState({
      checkParams: Object.assign(checkParams,{
        [key]: value,
      })
    })
  }

  //条件排序选择判断
  handleConditionSelect = (item) => {
    const { condition } = this.state;
    const arr = condition.map((current) => {
      if(item.id === current.id){
        this.setCheckParams('orderBy',current.id);
        if(current.selected){
          if(current.sort === 1){
            current.sort = 2;
            this.setCheckParams('sort',1);
          }else {
            current.sort = 1
            this.setCheckParams('sort',0);
          }
        }else {
          current.selected = true;
          current.sort = 1;
          this.setCheckParams('sort',0);
        }
        this.setCheckParams('pageNum',1);
        this.setPageSize();
      }else {
        current.sort = 0;
        current.selected = false;
      }
      return current;
    });
    this.setState({
      condition: arr,
    })
  }

  onChange =  (index) => {
//    this.setState({
//      sliderIndex: index,
//    })
  }

  //获取商品更改信息
  supplierChanges = () => {
    this.props.dispatch({
      type:'distribution/supplierChanges',
      payload:this.state.supplierChangesParams,
      callback: (data) => {
        if(data.status===200){
          this.setState(Object.assign(this.state.supplierChangesData,data.data))
        }
      }
    })
  }
  //商品更改信息列表排序
  supplierChangesSort = (pagination, filters, sorter) => {
    const { supplierChangesParams } = this.state;
    let orderBy = 0;
    if (sorter.field === 'updateTime'){
      if(sorter.order === 'ascend'){
        orderBy = 1;
      }else {
        orderBy = 0;
      }
      this.setState({
        supplierChangesParams: Object.assign(supplierChangesParams,{
          orderBy: orderBy
        })
      })
      this.supplierChanges();
    }
  }

  //同步确认
  synchronousConfirm =(record, btn) => {
    const languageForMessage = this.props.global.languageDetails.message;
    this.props.dispatch({
      type: 'distribution/syncSupplierChange',
      payload: {
        id: record.id,
        spuId: record.spuId,
      },
      callback: (data) => {
          if(data.status===200){
            if(btn === 'sync') {
              message.success(languageForMessage.SyncSucc);
            }
             this.supplierChanges();
          }

      }
    })
  }

  handleArrowNext(type,sliderBoxMaxLength){
    const { sliderItemWidth, groupIndex } = this.state;

    let newGroupIndex,newTranslate,groupItemLength;
    groupItemLength = sliderItemWidth * 4-14;
    const maxLength = Math.ceil(sliderBoxMaxLength/(sliderItemWidth*4));
    if(type==='next'){
      newGroupIndex = groupIndex +1;
      if(newGroupIndex>(maxLength-1)){
        newGroupIndex = maxLength-1;
      }
    } else {
      newGroupIndex =  groupIndex -1;
      if(newGroupIndex<0){
        newGroupIndex = 0;
      }
    }
    newTranslate = sliderItemWidth * 4 * newGroupIndex-1;
    if(newTranslate>sliderBoxMaxLength-groupItemLength){
      newTranslate = sliderBoxMaxLength - groupItemLength;
    }else if(newTranslate<0){
      newTranslate = 0;
    }
    this.setState({
      groupIndex: newGroupIndex,
      sliderTranslate: newTranslate,
    })
  }

  handleMouseOver = (index,e) => {
    const { sliderDom,timer } = this.state;
    const _this = this;
    sliderDom.goTo(index);
//    clearInterval(this.state.timer);
    setTimeout(()=>{
      _this.setState({
        sliderIndex: index
      })
    },300);
    e.stopPropagation();
  }

//  handleMouseOut = () => {
//    clearInterval(this.state.timer);
//  }
  handleProductShow = (boolean) => {
    this.setState({
      produsctShow: boolean
    })
  }



  render(){
    const { condition, products, productDetail, sliderTranslate, sizes, sliderItemWidth, sliderIndex, produsctShow, productsTatal, isSelfGoods, supplierChangesData, supplierChangesParams} = this.state;
    const { loading, popLoading } = this.props.distribution;
    const languageForDistribution = this.props.global.languageDetails.goods.distribution;
    const languageForGlobal = this.props.global.languageDetails.global;
    const searchType = [
      {
        id:0,
        text: languageForDistribution.ProductName,
      }
    ]
    const conditionChange = condition.map((item,index)=> {
      switch (index) {
        case 0:
          item.text = languageForDistribution.SalesVolume;
          break;
        case 1:
          item.text = languageForDistribution.SupplyPrice;
          break;
        case 2:
          item.text = languageForDistribution.PublishedTime;
          break;
      }
      return item;
    })
    const status = {
      0: languageForDistribution.CheckforDetails,
      1: languageForDistribution.DistributedProducts,
    }
    //轮播长度
    const sliderLength = productDetail.images.length;
    const sliderBoxMaxLength = sliderLength*sliderItemWidth-14;
    //商品同步更新操作列表属性
    const sizeTableColumns = [
      {
        title: languageForDistribution.SKUAttributeSet,
        dataIndex: 'property',
        classType: 4,
      },
      {
        title: languageForDistribution.SupplyPrice,
        dataIndex: 'supplyPrice',
        classType: 3,
      },
      {
        title: languageForDistribution.Stock,
        dataIndex: 'storage',
        classType: 3,
      },
    ];
    //同步变更列表属性
    const supplierChangesColumns = [
      {
        title: languageForDistribution.Operation,
        dataIndex: 'operation',
        classType: 1,
        render: (text,record)=>{
          console.log(record.sync)
          return !record.sync ? (
            <Button type='primary' onClick={this.synchronousConfirm.bind(this,record, 'ok')}>
              {
                languageForDistribution.Okay
              }
            </Button>
          ) : (
            <Popconfirm placement="topLeft" title={languageForDistribution.ConfirmSync} onConfirm={this.synchronousConfirm.bind(this,record, 'sync')} okText={languageForDistribution.Confirm} cancelText={languageForDistribution.Cancel}>
              <Button type='primary'>
                {
                  languageForDistribution.SyncOperation
                }
              </Button>
            </Popconfirm>
          )
        }
      },
      {
        title: 'ID',
        dataIndex: 'spuId',
        classType: 2,
        render: (text, record) => {
          if (supplierChangesParams.tabId === 1) {
            return (<a target="_blank" href={`/goods/goods-create?spu_id=${record.spuId}&action=edit`}>{text}</a>)
          } else if (supplierChangesParams.tabId === 2) {
            return text
          }
        }
      },
      {
        title: languageForDistribution.Image,
        dataIndex: 'iconUrl',
        classType: 1,
        render: (text,record) => {
          return (
            <div className="tableImage">
              <img style={{width:'100%'}} src={text}/>
            </div>
          )
        }
      },
      {
        title: languageForDistribution.Name,
        dataIndex: 'name',
        classType: 5,
        className: styles.suplieProductName,
        render: (text)=>{
          return (
            <Tooltip placement="top" title={text}>
              <div style={{width:'100%'}} className="ellipsis">
                {text}
              </div>
            </Tooltip>
          )
        }
      },
      {
        title: languageForDistribution.ChangedContent,
        dataIndex: 'content',
        classType: 5,
      },
      {
        title: languageForDistribution.ChangedTime,
        dataIndex: 'updateTime',
        sorter: true,
        classType: 3,
      }
    ];
    //同步变更分页器
    const supplierChangesPagination = {
      pageSize: supplierChangesParams.pageSize,
      total: supplierChangesData.pageBean.totalNum,
      current: supplierChangesParams.currentPage,
      defaultPageSize: supplierChangesParams.pageSize,
      showSizeChanger: true,
      pageSizeOptions: ['10','20','50','100'],
      showTotal: (total) => {
        return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
      },
      onShowSizeChange: (page,pageSize) => {
        this.setState({
          supplierChangesParams: Object.assign(supplierChangesParams,{
            currentPage: page,
            pageSize: pageSize,
          })
        })
        this.supplierChanges();
      },
      onChange: (page) => {
        this.setState({
          supplierChangesParams: Object.assign(supplierChangesParams,{
            currentPage: page,
          })
        })
        this.supplierChanges();
      }
    }

    const productsListDom = () => {
      return (
        <div style={{marginTop:20}}>
          <div className={`clearfix ${styles.conditionBox}`}>
            {
              conditionChange.map((item)=>{
                return (
                  <div key={item.id} onClick={this.handleConditionSelect.bind(this, item)} className={`left ${styles.conditionItem} ${item.selected ? styles.selected : ''}`}>
                    {item.text}
                    <Icon className={`${styles.arrowIcon} ${item.sort==1 ? styles.sortIcon : ''}`} type="arrow-down"></Icon>
                    <Icon className={`${styles.arrowIcon} ${item.sort==2 ? styles.sortIcon : ''}` } type="arrow-up"></Icon>
                  </div>
                )
              })
            }
          </div>
          {
            products.length===0 ?
              (<div className={styles.null}>
                {languageForGlobal.noData}
              </div>)
              :
              (
                <div>
                  <div className={`${styles.products} clearfix`}>
                    {
                      products.map((item,index) => {
                        return (
                          <div onClick={() => {
                            this.handleProductShow(true);
                            this.getProductDetail(item.spuId, item.sellerBrandId, item.isSelfGoods);
                          }} key={index}  className={`${styles.productBox} left`}>
                            <div className={`${styles.productImage}`}>
                              <img src={ item.icon } />
                              <div className={styles.salesCount}>
                                {languageForDistribution.SalesVolume}：{item.salesCount} {languageForDistribution.piece}
                              </div>
                              <div className={styles.productCover}>
                                {/*<div className={styles.productCoverName}>{item.name}</div>*/}
                                <div className={styles.productCoverButton}>{status[item.status]}</div>
                              </div>
                            </div>
                            <div className={`${styles.productName} showregular`} title={item.name}>
                              {item.name}
                            </div>
                            <div className={styles.producPrice}>
                              {languageForDistribution.SupplyPrice} US${item.supplyPrice.toFixed(2)}
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                  <Pagination
                    className={styles.pagination}
                    total={productsTatal}
                    pageSize={this.state.checkParams.pageSize}
                    current={ this.state.checkParams.pageNum}
                    onChange={
                      (page) => {
                        this.setCheckParams('pageNum',page);
                        this.setPageSize();
                      }
                    }
                    showTotal={(total) => {
                      return `${languageForGlobal.total} ${total} ${languageForGlobal.items}`;
                    }}
                  />
                </div>
              )
          }
        </div>
      )
    }

    return (
      <div className={styles.distributionMarket}>
        <div className={styles.condition}>
          <Form layout="inline" className="margin-bottom-24">
            <FormItem className="belong">
              <Select
                className="select-size-small"
                defaultValue={searchType[0].text}
              >
                {
                  searchType.map((item) => {
                    return (
                      <Option value={item.id} key={item.id} title={item.text}>{item.text}</Option>
                    )
                  })
                }
              </Select>
            </FormItem>
            <FormItem>
              <Search
                placeholder={languageForDistribution.Search}
                onSearch={value => this.handleFilterSearch(value)}
                className="select-Input"
                enterButton
              />
            </FormItem>
          </Form>
        </div>

          <div className={styles.content}>
            <Spin spinning={loading}>
              <Tabs
                activeKey={this.state.tabActiveKey}
                onChange={(key)=>{
                const { checkParams } = this.state;
                this.setState({
                  tabActiveKey: key,
                })
                key = parseInt(key);
                if(key !== 3){
                  if(key===1){
                    delete checkParams.status;
                  }else if(key===2){
                    checkParams.status = 1;
                  }
                  this.setCheckParams('pageNum',1);
                  this.setCheckParams('keyword','');
                  this.setState({
                    checkParams: checkParams,
                  })
                  this.setPageSize();
                }else {
                  this.setState(Object.assign(supplierChangesParams,{
                    currentPage: 1,
                    pageSize: 20,
                    orderBy: 0,
                    filter: 1,
                    keyword: ''
                  }))
                  this.supplierChanges();
                }
              }}>
                <TabPane tab={languageForDistribution.Distributing} key="1">{ productsListDom() }</TabPane>
                <TabPane tab={languageForDistribution.MyDistributed} key="2">{ productsListDom() }</TabPane>
                <TabPane tab={languageForDistribution.ProductsChange} key="3">
                  <Tabs type="card" defaultActiveKey={supplierChangesParams.tabId} style={{marginTop: '24px'}} onChange={(key)=>{
                    this.setState(Object.assign(supplierChangesParams,{
                      currentPage: 1,
                      pageSize: 20,
                      orderBy: 0,
                      filter: 1,
                      keyword: '',
                      tabId: Number(key)
                    }))
                    this.supplierChanges();
                  }}>
                    <TabPane tab={languageForDistribution.StatusChanged} key={1}>
                      <Table
                        style={{marginTop: 20}}
                        rowKey='id'
                        dataSource={supplierChangesData.spuUpdateInfos}
                        columns={supplierChangesColumns}
                        pagination={supplierChangesPagination}
                        onChange={this.supplierChangesSort}
                      />
                    </TabPane>
                    <TabPane tab={languageForDistribution.InfoChanged} key={2}>
                      <Table
                        style={{marginTop: 20}}
                        rowKey='id'
                        dataSource={supplierChangesData.spuUpdateInfos}
                        columns={supplierChangesColumns}
                        pagination={supplierChangesPagination}
                        onChange={this.supplierChangesSort}
                      />
                    </TabPane>
                  </Tabs>

                </TabPane>
              </Tabs>
            </Spin>

          </div>
        <Modal
          visible={produsctShow}
          footer={null}
          title={languageForDistribution.productDetails}
          onCancel={this.handleProductShow.bind(this,false)}
          width={684}
        >
          {/* <div className={styles.productDetail}> */}
            {/* <div className={styles.productDetailContent}> */}
              <Spin spinning={popLoading}>
                <div className={`${styles.ctbox} clearfix`}>
                  <div className={`${styles.productDetailSlider} left`}>
                    {
                      produsctShow ? (
                          <Carousel
                            className={styles.carousel}
                            afterChange={this.onChange}
                            easing="linear"
                            dots={false}
                            ref={sliderDom =>  this.state.sliderDom=sliderDom}
                          >
                            {
                              productDetail.images.map((item,index) => {
                                return (
                                  <div key={index}><img src={item}/></div>
                                )
                              })
                            }
                          </Carousel>
                        ) : <div></div>
                    }

                    <div className={`${styles.sliderBottom} clearfix `}>
                      <div onClick={this.handleArrowNext.bind(this,'pre',sliderBoxMaxLength)} className={`${styles.arrow} left`}><Icon type="left"></Icon></div>
                      <div className={`${styles.dotsbox} left`}>
                        <ol
                          className={`${styles.dots} clearfix left`}
                          style={{
                            width:sliderBoxMaxLength,
                            transform: 'translate3d(-'+sliderTranslate+'px,0,0)',
                          }}>
                          {
                            productDetail.images.map((item,index)=>{
                              return (
                                <li
                                  key={index}
                                  onMouseOver={(e)=>{this.handleMouseOver(index,e)}}
                                  className={`${styles.dotsItem} left ${index === sliderIndex ? styles.selected : ''}`}
                                >
                                  <img src={item} />
                                </li>
                              )
                            })
                          }
                        </ol>
                      </div>
                      <div onClick={()=>{this.handleArrowNext('next',sliderBoxMaxLength)}} className={`${styles.arrow} ${styles.arrowRight} left`}><Icon type="right"></Icon></div>
                    </div>

                  </div>
                  <div className={`${styles.productDetailText} left`}>
                    <div className={styles.productDetailName}>
                      { productDetail.spuName }
                    </div>
                    <div className={styles.productDetailNumber}>
                    <span className={styles.productDetailNumberItem}>{languageForDistribution.SupplyPrice}：
                      <span style={{color:'red'}}>US${productDetail.supplyPrice.toFixed(2)}</span>
                    </span>
                      <span className={styles.productDetailNumberItem}>{languageForDistribution.ShippingFee}：
                      <span style={{color:'red'}}>US${productDetail.shipPrice.toFixed(2)}</span>
                    </span><br/>
                      <span className={styles.productDetailNumberItem}>{languageForDistribution.TotalSalesVolume}：{productDetail.salesCount} {languageForDistribution.piece}</span>
                      <span className={styles.productDetailNumberItem}>{languageForDistribution.TotalStock}：{ productDetail.storage } {languageForDistribution.piece}</span>
                    </div>
                    <Table
                      rowKey={ (record,index)=> {
                        return index;
                      }}
                      columns={sizeTableColumns}
                      dataSource={productDetail.skus}
                      className={styles.sizeTable}
                      pagination={false}
                      scroll={{y:200}}
                    ></Table>
                    {
                      productDetail.shelfStatus ? <Button disabled className={styles.hasPick}>{languageForDistribution.cannotDistribute}</Button> :
                      productDetail.receiveStatus===0 ? (
                          <div style={{textAlign:'right'}}>
                            <Button onClick={this.applyDistributionSpu.bind(this,productDetail.spuId,productDetail.sellerBrandId,1)} type="primary" className={styles.productsDetailBt}>{languageForDistribution.PublishToTheStore}</Button>
                            <Button onClick={this.applyDistributionSpu.bind(this,productDetail.spuId,productDetail.sellerBrandId,0)} className={styles.productsDetailBt}>{languageForDistribution.AddToProductList}</Button>
                          </div>
                        ) : (productDetail.status === 0 ?
                          (
                            <div>
                              <Button disabled className={styles.hasPick}>{languageForDistribution.PublishedToProductList}</Button>
                              <br/>
                              <p style={{marginTop:6}}>{languageForDistribution.ListUnpublished[0]}<Link to="/goods/goodsList?tabId=3">{languageForDistribution.ListUnpublished[1]}</Link>{languageForDistribution.ListUnpublished[2]}</p>
                            </div>
                          ) : (
                            <div>
                              <Button disabled className={styles.hasPick}>{languageForDistribution.PublishedToTheStore}</Button>
                              <br/>
                              <p style={{marginTop:6}}>{languageForDistribution.ListPublished[0]}<Link to="/goods/goodsList">{languageForDistribution.ListPublished[1]}</Link>{languageForDistribution.ListPublished[2]}</p>
                            </div>
                          ))
                    }
                  </div>
                </div>
              </Spin>
            {/* </div> */}
          {/* </div> */}
        </Modal>
      </div>
    )
  }
}
