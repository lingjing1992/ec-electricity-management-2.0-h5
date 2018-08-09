import React, { Component } from 'react';
import styles from './Update.less';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import { connect } from 'dva';


@connect((state) => ({
  global: state.global
}))
export default class Update extends Component {

  refresh = () => {
    const pathname = this.props.global.systemUpdate.pathname;
    this.props.dispatch(routerRedux.push(pathname));
    this.props.dispatch({
      type:'global/setSystemUpdate',
      payload: {
        isUpdate: false,
        pathname: `/`
      }
    })
  }
  render(){
    return (
      <div className={styles.update}>
        <div className={`${styles.updateContent} clearfix`}>
          <div className={`${styles.icon} left`}></div>
          <div className={`${styles.updatePrimit} right`}>
            <p>系统升级中,<br/>请稍后再试。</p>
            <Button onClick={this.refresh} className={styles.updateButton} type="primary">刷新</Button>
          </div>
        </div>
      </div>
    )
  }
}
