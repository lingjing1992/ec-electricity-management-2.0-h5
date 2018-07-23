import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { Tabs, Form, Card } from 'antd';
import { connect } from 'dva';
import styles from './DataFlowAnalysis.less';

import DataFlowAnalysisTime from './DataFlowAnalysisTime';
import DataFlowAnalysisSource from './DataFlowAnalysisSource';
import DataFlowAnalysisAdvertising from './DataFlowAnalysisAdvertising';
import DataFlowAnalysisKeyword from './DataFlowAnalysisKeyword';

const TabPane = Tabs.TabPane;

@connect(state => ({
  dataFlowAnalysis: state.dataFlowAnalysis,
  global: state.global
}))
@Form.create()
export default class Home extends Component {
  state = {
    type: 'dataFlowAnalysis',
  }
  // componentDidMount() {
  //   this.loadData(1);
  // }
  // loadData(demension) {
  //   const { type } = this.state;
  //   const { dataFlowAnalysis } = this.props;
  //   // console.log('this=>', this);
  //
  //   this.props.dispatch({
  //     type: `dataFlowAnalysis/${type}GetDataFlowAnalysis`,
  //     payload: Object.assign(
  //       dataFlowAnalysis.pushData, {
  //         demension,
  //       }),
  //   });
  //   // 获取来源
  //   this.props.dispatch({
  //     type: `dataFlowAnalysis/${type}GetUtmSource`,
  //     payload: null,
  //   });
  // }

  onChange = (key) => {
    // 重置所有表单
    this.props.form.resetFields();
    // 清除筛选条件
    this.props.dispatch({
      type: 'dataFlowAnalysis/clear',
      payload: null,
    });
    // loading 数据
    const { dispatch } = this.props;
    switch (key) {
      case '1':
        dispatch(routerRedux.push('/data/dataFlowAnalysisTime'));
        // this.loadData(1);
        break;
      case '2':
        dispatch(routerRedux.push('/data/dataFlowAnalysisSource'));
        // this.loadData(2);
        break;
      case '3':
        dispatch(routerRedux.push('/data/dataFlowAnalysisAdvertising'));
        // this.loadData(3);
        break;
      case '4':
        dispatch(routerRedux.push('/data/dataFlowAnalysisKeyword'));
        // this.loadData(4);
        break;
      default:
        break;
    }
    // this.props.onTabChange(key);
  }

  render() {
    const languageForData = this.props.global.languageDetails.data.flowAnalysis;//流量分析多语言
    const navTapDatas = [
      {
        title: languageForData.Date,
        key: 1,
        tempalte: DataFlowAnalysisTime,
      },
      {
        title: languageForData.Source,
        key: 2,
        tempalte: DataFlowAnalysisSource,
      },
      {
        title: languageForData.AdsCampaign,
        key: 3,
        tempalte: DataFlowAnalysisAdvertising,
      },
      {
        title: languageForData.KeyWords,
        key: 4,
        tempalte: DataFlowAnalysisKeyword,
      },
    ];
    return (
      <div className={styles.flowAnalysisTab}>
        <Tabs
          defaultActiveKey={this.props.defaultActiveKey}
          onChange={this.onChange}
          animated={false}
        >
          {
            navTapDatas.map((items) => {
              return (
                <TabPane tab={items.title} key={items.key} >
                  {
                    items.tempalte
                  }
                </TabPane>
              )
            })
          }
        </Tabs>
        {/*
        <Tabs defaultActiveKey={1} onChange={this.onChange}>
          <TabPane tab="日期" key={1} >
            <DataFlowAnalysisTime {...this.props} {...this.state} />
          </TabPane>
          <TabPane tab="来源" key={2} >
            <DataFlowAnalysisSource {...this.props} />
          </TabPane>
          <TabPane tab="广告系列" key={3} >
            <DataFlowAnalysisAdvertising {...this.props} />
          </TabPane>
          <TabPane tab="关键字" key={4} >
            <DataFlowAnalysisKeyword {...this.props} />
          </TabPane>
        </Tabs>
        */}
      </div>
    );
  }
}
