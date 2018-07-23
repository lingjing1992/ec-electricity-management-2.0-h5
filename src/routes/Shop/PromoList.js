import React, { Component } from 'react';
import styles from './PromoList.less';
import {
  Spin,
  Icon,
  Modal,
  Button,
  Input,
  message,
  notification,
  Card
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {CopyToClipboard} from 'react-copy-to-clipboard';

// @connect(state => ({
//   promo: state.promo,
// }))
@connect((state)=>({
  global: state.global
}))

export default class PromoList extends Component {
  state={
    lists : [],
    loading: true
  }

  componentWillMount() {
    this.init();
  }

  init = () => {
    this.getList();
  }
  //获取模板列表
  getList = () => {
    this.props.dispatch({
      type: 'shop/templateList',
      callback: (data) => {
        if(data.status===200){
          this.setState({
            lists: data.data.modules,
            url: data.data.shopUrl,
            loading: false,
            visible: false
          })
        }
      }
    })
  }

  // 使用模板
  useTemplate (viewId) {
    this.props.dispatch({
      type: 'shop/useTemplate',
      payload: {viewId},
      callback: (data) => {
        if(data.status===200){
          this.setState({
            visible: true
          })
        }
      }
    })
  }

  toSpecialList = (id,name) =>{
    this.props.dispatch(routerRedux.push('/shop/StyleTemplatesDetails?viewId=' + id));
  }

  handleCancel = () => {
    this.getList()
  }

  addTemp = () => {
    const languageForMessage = this.props.global.languageDetails.message;
    notification.info({
      message: languageForMessage.developingPromit
    })
  }

  render(){
    const template = this.props.global.languageDetails.template;
    const { lists, loading, url} = this.state;
    return(
      <div className={ styles.special }>
        <Card>
          <p>{template.openShop}</p>

          <CopyToClipboard
            text={url}
            onCopy={() => {
              message.success(template.copysuccess, 1);
            }}>
            <div style={{display:'inline-block'}}>{template.shopAddres}<Input.Search enterButton={template.copy} onSearch={this.copyUrl} readOnly value={url} style={{marginTop: '10px', width:500}}/></div>
          </CopyToClipboard>

          <Spin spinning={ loading } >
            <ul className="clearfix">
              <li className={ `${styles.imgLi} ${styles.selected} ${styles.addTemp}` }
                  onClick={this.addTemp}>
                <Icon className={styles.addicon} type="plus-square" />
                <p>{template.customTemplate}</p>
              </li>
              {
                lists.map((item, index) => {
                  return (
                    <li key={index} className={ `${styles.imgLi} ${styles.selected}` } style={{backgroundImage:`url(${item.banner})`}} >
                      <div className={ styles.cover }>
                        <p style={{textAlign: 'center'}}>{item.name}</p>
                        <span className={`${styles.caverTextright}`}>
                       {item.status ? <span style={{color: '#80b4ff'}}>{template.inUse}</span> : <span className={styles.isUse} onClick={(e) => {this.useTemplate(item.viewId)}}>{template.UseNow}</span>}
                          <a
                            target="_blank"
                            onClick={(e)=>{
                              e.stopPropagation();
                            }}
                            href={item.previewUrl}
                            className={`${styles.caverPriview}`}
                            style={{textDecoration: 'underline'}}>{template.preview}</a>
                        <span onClick={this.toSpecialList.bind(this,item.viewId)} style={{textDecoration: 'underline'}}>{template.eidtTempalate}</span>
                      </span>
                      </div>
                    </li>
                  );
                })
              }
            </ul>
          </Spin>
        </Card>
        <Modal
          title={template.operationTips}
          visible={this.state.visible}
          onOk={this.handleCancel}
          onCancel={this.handleCancel}
          footer={[<Button key="back" type="primary" onClick={this.handleCancel}>{template.OK}</Button>]}
        >
          <div style={{textAlign: 'center'}}>
            <Icon type="check-circle" style={{fontSize: '40px', color:'#52c41a'}}/>
            <p style={{lineHeight: '20px', paddingTop:'20px'}}>{template.switched}</p>
          </div>

        </Modal>
      </div>
    )
  }
}


