// 商品列表模块 CardType 303（单纯商品排列，每行两个等宽）
import React, {Component} from "react";
import {setApiHost} from "../../../utils/utils";
import {Icon } from "antd";
import styles from '../StyleTemplatesDetails.less';
import Drag from '../../../components/Drag/Drag';
import Table from '../../../components/table';
import { connect } from 'dva';


@connect(state => ({
  global: state.global
}))
export default class ProductTemplate extends Component {

  //拖拽交换callback
  positionExchange = (startIndex, targetIndex) => {
    const selectedCard = this.props.resource;
    const temp = selectedCard.spus[startIndex]
    // selectedCard.spus[startIndex] = selectedCard.spus[targetIndex]
    // selectedCard.spus[targetIndex] = temp
    selectedCard.spus.splice(startIndex,1)
    selectedCard.spus.splice(targetIndex,0,temp);
    this.props.onSetState('selectedCard',selectedCard);
    this.forceUpdate();
  }
  //删除图片
  delImg = (i,e) => {
    const { resource } = this.props;
    resource.spus.splice(i, 1);
    this.props.onSetState('selectedCard',resource);
    this.forceUpdate();
    e.stopPropagation();
  }

  render(){
    const {editTemplate} = this.props.global.languageDetails;
    const { resource, onSelectGoods } = this.props;
    const selectedGoodsList = resource.spus || [];

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
      }]
    return (
      <div>
        <div className={styles.subTitle}>
          {editTemplate.product}
        </div>
        <div style={{marginLeft: 20,marginTop:14}}>
          <Drag
            boxClassName={styles.selectedGood}
            imageWidth={80}
            imageHeight={80}
            positionExchange={this.positionExchange}
          >
            <div className={styles.imgWrap}>
              <div className={styles.selectGood} onClick={(e) => {onSelectGoods()}}>
                <Icon type="plus" style={{lineHeight: '80px', fontSize: '20px'}}/>
              </div>
              {resource.spus.length > 0 && resource.spus.map((item, index) => {
                return (<div key={index} className={styles.selectedGood}>
                  <img src={item.icon}/>
                  <Icon type="close-circle" className={styles.delImg} onClick={(e) => {
                    this.delImg(index,e)
                  }}/>
                </div>)
              })}
            </div>
          </Drag>
        </div>
        <p>{editTemplate.tips1} </p>
        <p>{editTemplate.tips2} </p>
        <div className="goodsDetailTable" style={{marginTop: 20}}>
          <Table
            columns={columns}
            rowKey='spuId'
            needToGetWidth={true}
            autoGetScroll={true}
            dataSource={selectedGoodsList}
            pagination={{
              pageSize: 3,
              total: selectedGoodsList.length
            }}
          ></Table>
        </div>
      </div>
    )
  }
}
