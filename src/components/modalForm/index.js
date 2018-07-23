import React, {PureComponent} from 'react';
import { Modal, Spin } from 'antd';
import FormList from '../formList';
import styles from './index.less';
export default class AddrInfo extends PureComponent {
  static defaultProps = {
    title:'',//弹窗标题
    source: '',//表单源数据
    visible: false, //弹窗控制
    onCancel: () => {}, //取消
    onOk: () => {}, //确定
    loading: false,//动画
    width: 520,
    okText: '',
  }
  state = {
    isSubmit: false,
  }
  //提交
  handleSubmit = (boolean) => {
    this.setState({
      isSubmit: boolean,
    })
  }
  render(){
    const { visible, onCancel, onOk, title, source, loading, width, okText } = this.props;
    const { isSubmit } = this.state;

    return(
      <div>
        {
          visible ? (
            <Modal
            title={title}
            visible={visible}
            onCancel={onCancel}
            className={styles.modalForm}
            onOk={this.handleSubmit.bind(this,true)}
            width={width}
            confirmLoading={loading}
            okText={okText}
          >
            <FormList
              style={{paddingRight:10}}
              source={source}
              onSubmit={this.handleSubmit}
              onOk={onOk}
              isSubmit={isSubmit}
            />
          </Modal>) : ''
        }
      </div>
    )
  }
}
