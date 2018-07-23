/**
 * Created by dell on 2018/2/6.
 */
import React, { Component } from 'react';
import styles from './Special.less';
import {
  Spin,
  Card
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

@connect(state => ({
  special: state.special,
  global: state.global
}))
export default class Special extends Component {
  state={
    lists : [],
  }

  componentWillMount() {
    this.init();
  }

  init = () => {
    this.getViewStyle();
  }
  //获取模板列表
  getViewStyle = () => {
    this.props.dispatch({
      type: 'special/getViewStyle',
      payload: {
        viewType: 4,
      },
      callback: (data) => {
        if(data.status===200){
          this.setState({
            lists: data.data.viewStyles
          })
        }
      }
    })
  }

  toSpecialList = (id,name) =>{
    this.props.dispatch(routerRedux.push('/marketing/specialList?id=' + id));
  }

  render(){
    const { lists } = this.state;
    const { loading } = this.props.special;
    const languageForMarketing = this.props.global.languageDetails.marketing.special;//营销多语言
    return(
      <div className={ styles.special }>
        <Card>
          <Spin spinning={ loading } >
            <ul className="clearfix">
              {
                lists.map((item) => {
                  return (
                    <li key={ item.id } className={ styles.imgLi } style={{backgroundImage:`url(${item.banner})`}} onClick={this.toSpecialList.bind(this,item.id,item.name)}>
                      <div className={ styles.cover }>
                        <span className={styles.coverText} style={{textAlign: 'left'}}>{ item.name }</span>
                        <a
                          target="_blank"
                          onClick={(e)=>{
                            e.stopPropagation();
                          }}
                          href={item.preview}
                          className={`${styles.coverText} ${styles.caverTextright}`}
                          style={{}}>{languageForMarketing.Preview}</a>
                      </div>
                    </li>
                  );
                })
              }
            </ul>
          </Spin>
        </Card>
      </div>
    )
  }
}
