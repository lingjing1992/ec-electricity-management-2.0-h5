import React from 'react';
import {Avatar, List} from 'antd';
import classNames from 'classnames';
import styles from './NoticeList.less';

export default function NoticeList({
                                     data = [],
                                     onClick,
                                     onClear,
                                     onEditProduct,
                                     title,
                                     noticeLanguage,
                                     emptyText,
                                     emptyImage,
                                   }) {
  if (data.length === 0) {
    return (
      <div className={styles.notFound}>
        {emptyImage ? <img src={emptyImage} alt="not found"/> : null}
        <div>{emptyText || noticeLanguage.emptyText}</div>
      </div>
    );
  }
  return (
    <div>
      <List className={styles.list}>
        {data.map((item, i) => {
          const itemCls = classNames(styles.item, {
            [styles.read]: item.read,
          });
          return (
            <List.Item className={itemCls} key={item.key || i} onClick={() => onClick(item)}>
              <List.Item.Meta
                className={styles.meta}
                avatar={item.avatar ? <Avatar className={styles.avatar} src={item.avatar}/> : null}
                title={
                  <div className={styles.title}>
                    {item.title}
                    <a className={styles.editProduct} style={{display: item.type == 3 ? 'inline' : 'none'}}
                       onClick={(e) => {
                         onEditProduct(item);
                         e.stopPropagation();
                       }}
                    > {noticeLanguage.editProduct}</a>
                    <div className={styles.extra}>{item.extra}</div>
                  </div>
                }
                description={
                  <div>
                    <div className={styles.description} title={item.description}>
                      {item.description}
                    </div>
                    <div className={styles.datetime}>{item.datetime}</div>
                  </div>
                }
              />
            </List.Item>
          );
        })}
      </List>
      <div className={styles.clear} onClick={onClear}>
        {noticeLanguage.clear}
        {noticeLanguage.title}
        {/*产品改为每个tap的清空文案一样*/}
      </div>
    </div>
  );
}
