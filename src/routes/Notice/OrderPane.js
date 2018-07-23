import React, { PureComponent } from 'react';
import styles from './Notice.less';
import { Link } from 'dva/router';

export default class OrderPane extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }
  render(){
    const {resource} = this.props;
    return (
      <div>
        {
          resource.map((item)=>{
            return (
              <div key={`${item.id}-order`} className={`${styles.orderPaneList} ${item.isRead ? styles.invalid : ''}`}>
                <div className={styles.orderPaneTop}>
                  <span className={styles.noticeTitle}>{item.title}</span>
                  <Link to="/order/orderDetail" >查看订单</Link>
                </div>
                <p className={styles.noticeContent}>{item.content}</p>
                <p className={styles.noticeTime}>{item.dateTime}</p>
              </div>
            )
          })
        }
      </div>
    )
  }
}