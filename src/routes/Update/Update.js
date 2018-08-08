import React, { Component } from 'react';
import styles from './Update.less';
import { Button } from 'antd';

export default class Update extends Component {
  render(){
    return (
      <div className={styles.update}>
        <div className={`${styles.updateContent} clearfix`}>
          <div className={`${styles.icon} left`}></div>
          <div className={`${styles.updatePrimit} right`}>
            <p>系统升级中,<br/>请稍后再试。</p>
            <Button className={styles.updateButton} type="primary">刷新</Button>
          </div>
        </div>
      </div>
    )
  }
}
