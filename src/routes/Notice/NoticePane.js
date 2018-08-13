import React, { PureComponent } from 'react';
import { Link, routerRedux } from 'dva/router';
import { Select, Form, Input } from 'antd';
import { connect } from 'dva';
import styles from './Notice.less';

const { Option } = Select;
const { Search } = Input;
const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  global: state.global,
}))
export default class NoticePane extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  //搜索
  handleSearch = () => {
    const { getFieldsValue } = this.props.form;
    const params = getFieldsValue(['searchType', 'searchValue', 'searchStatus']);
    this.props.onSearch(params);
  };

  //查看订单
  checkOrder = (item, e) => {
    this.props.dispatch(routerRedux.push(`/order/order-detail?order_no=${item.orderNo}`));
    this.props.onClick(item.id);
    e.stopPropagation();
  };

  render() {
    const { resource, type } = this.props;
    const { getFieldDecorator } = this.props.form;
    const languageForProductNotice = this.props.global.languageDetails.notice;
    const searchType = {
      3: [
        {
          id: 'product',
          text: 'SPU',
        },
      ],
      2: [
        {
          id: 'orderNo',
          text: languageForProductNotice.OrderNo,
        },
      ],
      1: [
        {
          id: 'noticeTitle',
          text: languageForProductNotice.NoticeTitle,
        },
      ],
    };
    const searchStatus = [
      {
        id: 2,
        text: languageForProductNotice.All,
      },
      {
        id: 0,
        text: languageForProductNotice.Unread,
      },
      {
        id: 1,
        text: languageForProductNotice.Read,
      },
    ];
    return (
      <div>
        <Form layout="inline" className={styles.noticeForm}>
          <FormItem>
            {getFieldDecorator('searchType', {
              initialValue: searchType[type][0].id,
              rules: [{ required: false }],
            })(
              <Select className="select-size-small" disabled={searchType[type].length <= 1}>
                {searchType[type].map(items => {
                  return (
                    <Option value={items.id} key={items.id}>
                      {items.text}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('searchValue', {
              rules: [{ required: false }],
            })(
              <Search
                placeholder={languageForProductNotice.Search}
                className="select-Input"
                onSearch={this.handleSearch}
                autocomplete="off"
                enterButton
              />
            )}
          </FormItem>
          <FormItem label={languageForProductNotice.Status}>
            {getFieldDecorator('searchStatus', {
              initialValue: searchStatus[0].id,
              rules: [{ required: false }],
            })(
              <Select
                className="select-size-small"
                disabled={searchStatus.length <= 1}
                onSelect={status => {
                  this.props.onStatusChange(status);
                }}
              >
                {searchStatus.map(items => {
                  return (
                    <Option value={items.id} key={items.id}>
                      {items.text}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        </Form>

        {resource.length > 0 ? (
          resource.map(item => {
            return (
              <div key={`${item.id}-notice`}>
                <div
                  className={`${styles.orderPaneList} ${item.isRead == 1 ? styles.invalid : ''}`}
                  onClick={() => {
                    if (item.isRead == 0) {
                      this.props.onClick(item.id);
                    }
                  }}
                >
                  <div className={styles.orderPaneTop}>
                    <span className={styles.noticeTitle}>{item.title}</span>
                    <a
                      style={{ display: type == 2 ? 'inline' : 'none' }}
                      onClick={this.checkOrder.bind(this, item)}
                    >
                      {languageForProductNotice.CheckOrders}
                    </a>
                  </div>
                  <p className={styles.noticeContent}>{item.content}</p>
                  <p className={styles.noticeTime}>{item.dateTime}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              textAlign: 'center',
              height: 100,
              lineHeight: '100px',
              marginTop: 54,
            }}
          >
            {languageForProductNotice.NoNotificationNow}
          </div>
        )}
      </div>
    );
  }
}
