import React, { Component } from 'react';
import styles from './Goods.less';
import { Link } from 'dva/router';
import { Modal, Spin, Carousel,  Table, Icon, Button } from 'antd';
import { connect } from 'dva';

@connect(state => ({
  global: state.global,
  distribution: state.distribution
}))

export default class Goods extends Component {
  static defaultProps = {
    getHopmeData: () => {},
  }
  state = {
    produsctShow: false,
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
    //轮播每张的宽度
    sliderItemWidth : 54,
    //每组图片的长度,暂定为4张
    groupImagesLength: 4,
    //当前组的索引
    groupIndex:0,
    //跑马灯的react对象
    sliderDom:0,
    sliderIndex: 0,
    //显示按钮
    buttonShow: false,
  }
  componentWillMount () {
  }
  init () {
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
      sliderTranslate: 0,
      //显示按钮
      buttonShow: false,
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
            buttonShow: true,
          })
        }else {
          this.handleProductShow(false);
        }
      }
    })
  }

  handleArrowNext = (type,sliderBoxMaxLength) =>{
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
          this.props.getHopmeData();
        }else {
          this.handleProductShow(false);
        }
      }
    })
  }

  handleProductShow = (boolean) => {
    this.setState({
      produsctShow: boolean
    })
  }

  render() {
    const { spus } = this.props;
    const { produsctShow, productDetail, sliderItemWidth, groupImagesLength, groupIndex, sliderTranslate, sliderIndex } = this.state;
    const {  popLoading } = this.props.distribution;
    const languageForDistribution = this.props.global.languageDetails.goods.distribution;
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
    return (
      <div className={styles.goodsWrap}>
        {
          spus.map((item, index) => {
            const margin = index%4 === 0 ? '0' : '20';
            const marginTop = index>3 ? '24px' : '0';
            return (
              <div className="goods-item" key={item.spuId} style={{marginLeft: margin,marginTop:marginTop}} onClick={()=>{
                this.handleProductShow(true);
                this.getProductDetail(item.spuId, item.sellerBrandId, item.isSelfGoods);
              }}>
                <img src={item.icon}/>
                <p className="goods-title">利润：<span style={{color:'#f74d4d'}}>US${item.profit}</span></p>
                <p className="goods-price">供货成本：{`US\$${item.supplyPrice}`}</p>
                <span className="view-more">查看更多</span>
                {item.status ? (<span className="distributed">已领取</span>) : ''}
              </div>
            )
          })
        }
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
                      // afterChange={this.onChange}
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
                  this.state.buttonShow ? (
                    <div>
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
                  ) : null
                }

              </div>
            </div>
          </Spin>
          {/* </div> */}
          {/* </div> */}
        </Modal>
      </div>)
  }
}
