import React, {PureComponent} from 'react';
import {connect} from 'dva';
import ListSelect from '../ListSelect';

@connect(state => ({
  special: state.special,
  global : state.global
}))
class SpuSelect extends PureComponent {
  static defaultProps = {
    defaultValue  : [],
    defaultSpuIds : [],
    pushSelectList: () => {

    },
    index         : 0,
  }

  state = {
    checkParams    : {
      filter  : 1,
      pageSize: 5,
      keyword : '',
      pageNum : 1,
      status  : -1,
      sort    : -1,
    },
    basicInfoList  : [],
    selectedSpuList: this.props.defaultValue,
    total          : 0,
    spuSelectShow  : false,
  }

  componentWillMount() {
    const {spuLlists}     = this.props.special;
    const {defaultSpuIds} = this.props;
    if (spuLlists && spuLlists.hasOwnProperty('basicInfoList') && defaultSpuIds.length === 0) {
      this.setState({
        basicInfoList: spuLlists.basicInfoList,
        total        : spuLlists.total,
      })
    }
    else {
      this.getAllSpuData(this.props.defaultSpuIds);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultValue !== this.props.defaultValue && nextProps.defaultValue.length > 0) {
      this.setState({
        selectedSpuList: nextProps.defaultValue,
      })
      this.handlePushSelectLists(nextProps.defaultValue);
    }
    if (nextProps.defaultSpuIds !== this.props.defaultSpuIds && nextProps.defaultSpuIds.length > 0) {
      this.getAllSpuData(nextProps.defaultSpuIds);
    }
  }

  componentDidMount() {
    this.handlePushSelectLists(this.state.selectedSpuList);
  }

  handlePushSelectLists = (selectedSpuList) => {
    this.props.pushSelectList(selectedSpuList, this.props.index);
    console.log(selectedSpuList);
  }

  getSpuData = () => {
    this.props.dispatch({
      type    : 'special/getDiscountBriefSpuList',
      payload : this.state.checkParams,
      callback: (data) => {
        if (data.status === 200) {
          this.setState({
            basicInfoList: data.data.basicInfoList,
            total        : data.data.total,
          })
        }
      }
    })
  }

  getAllSpuData = (defaultSpuIds) => {
    //    const { defaultSpuIds } = this.props;
    const params = {
      filter  : 1,
      pageSize: 5,
      keyword : '',
      pageNum : 1,
      status  : -1,
      sort    : -1,
    }
    defaultSpuIds.length > 0 ? params.selectSpuIds = defaultSpuIds : params;
    this.props.dispatch({
      type    : 'special/getAllSpuList',
      payload : params,
      callback: (data) => {
        if (data.status === 200) {
          this.setState({
            basicInfoList: data.data.basicInfoList,
            total        : data.data.total,
          })
          if (data.data.selectInfoList && data.data.selectInfoList.length > 0) {
            this.setState({
              selectedSpuList: data.data.selectInfoList,
            })
            this.handlePushSelectLists(data.data.selectInfoList);
          }
        }
      }
    })
  }

  selectSpu = (selectedRowKeys) => {
    //    console.log(selectedRowKeys);
    this.setState({
      selectedSpuList: selectedRowKeys,
    })
    this.handlePushSelectLists(selectedRowKeys);
  }

  getSpuNewData = (pageNum) => {
    const {checkParams} = this.state;
    checkParams.pageNum = pageNum;
    this.setState({
      checkParams: checkParams,
    })
    this.getSpuData();
  }

  spuSearch = (params) => {
    const {checkParams} = this.state;
    this.setState({
      checkParams: Object.assign({}, {
        ...checkParams,
        filter : params.searchType,
        keyword: params.keyword,
        sort   : params.sort,
        status : params.otherCondition,
        pageNum: 1,
      })
    })
    setTimeout(() => {
      this.getSpuData();
    }, 0);
  }

  render() {
    const {spuLoading}         = this.props.special;
    const languageForMarketing = this.props.global.languageDetails.marketing.specialEdit;//营销多语言
    const filter               = [
      {
        key  : 1,
        value: 'SPUID',
      },
      {
        key  : 2,
        value: languageForMarketing.ProductName,
      },
    ];
    const otherCondition       = [
      {key: -1, value: languageForMarketing.ProductStatus},
      {key: 1, value: languageForMarketing.Published},
      {key: 0, value: languageForMarketing.Unpublished},
    ]
    return (
      <ListSelect
        spuList={this.state.basicInfoList}
        selectSpu={this.selectSpu}
        selectedSpuList={this.state.selectedSpuList}
        total={this.state.total}
        getNewData={this.getSpuNewData}
        pageSize={this.state.checkParams.pageSize}
        seachType={filter}
        onSearch={this.spuSearch.bind(this)}
        tableKey="spuId"
        show={this.state.spuSelectShow}
        pageNum={this.state.checkParams.pageNum}
        otherCondition={otherCondition}
        loading={spuLoading}
        index={this.props.index}
      />
    )
  }
}

export default SpuSelect;
