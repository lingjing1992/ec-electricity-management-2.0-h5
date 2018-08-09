import React, { Component } from 'react';
import styles from './Update.less';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import { connect } from 'dva';


@connect((state) => ({
  global: state.global
}))
export default class Update extends Component {
  componentWillMount(){
    const isUpdate = this.props.global.systemUpdate.isUpdate;
    console.log(this.props)
    if(!isUpdate){
      this.props.history.goBack();
    }
  }

  refresh = () => {
    this.props.dispatch({
      type: 'global/getUpgradeStatus',
      payload: {},
      callback: (data) => {
        if(data && data.status===200){
          this.props.dispatch({
            type:'global/setSystemUpdate',
            payload: {
              isUpdate: false,
              pathname: `/`
            }
          })
          this.props.dispatch(routerRedux.go(-1));
          window.location.reload();
        }
      }
    })
  }
  render(){
    const languageForUpdate = this.props.global.languageDetails.update;
    return (
      <div className={styles.update}>
        <div className={`${styles.updateContent} clearfix`}>
          <div className={`${styles.icon} left`}></div>
          <div className={`${styles.updatePrimit} right`}>
            <p>{languageForUpdate.text[0]}<br/>{languageForUpdate.text[1]}</p>
            <Button onClick={this.refresh} className={styles.updateButton} type="primary">{languageForUpdate.refresh}</Button>
          </div>
        </div>
      </div>
    )
  }
}
