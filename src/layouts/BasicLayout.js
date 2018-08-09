import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, message, Menu, Dropdown, Avatar, LocaleProvider } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import Cookies from 'js-cookie'
import { Route, Redirect, Switch, routerRedux,  } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import groupBy from 'lodash/groupBy';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import { getRoutes, getQueryString, parseArr, googleAnalytics } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import NoticeIcon from '../components/NoticeIcon';
import styles from './BasicLayout.less';
import logo from '../assets/logo.png';
import moment from 'moment';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import enUS from 'antd/lib/locale-provider/en_US';

const { Content, Header, Footer } = Layout;
const { AuthorizedRoute, check } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = item => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach(children => {
        getRedirect(children);
      });
    }
  }
};
getMenuData().forEach(getRedirect);

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData, routerData) => {
  const result = {};
  const childResult = {};
  for (const i of menuData) {
    if (!routerData[i.path]) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  }
  return Object.assign({}, routerData, result, childResult);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  state = {
    isMobile,
    languageText: [
      {
        id: 'zh-cn',
        text: '简体中文'
      },
      {
        id: 'en',
        text: 'English'
      }
    ],
    languageIconUp: false,//语言下来哦图标
    popupVisible: false, // 通知控制弹层显隐
    MenuData:[],//侧边栏
    noticePermission: {},//通知权限控制
  };

  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(getMenuData(), routerData),
    };
  }
  componentWillMount(){
    this.init();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.login.signOutStatus === 200) {
      //退出刷新页面初始化
      window.location.href = '//' + window.location.host + '/user/login';
    }
    // 点击品牌的时候，切换店铺
    if (nextProps.login.errorSwitchBrand === 200) {
      window.location.reload();
    }

  }
  componentDidMount() {
    document.querySelector('#root').addEventListener('click', this.closeNoticePop, false)
    googleAnalytics('UA-99247884-8')
  }

  componentWillUnmount() {
    // unenquireScreen(this.enquireHandler);
    clearTimeout(this.resizeTimeout);
    const {dispatch} = this.props;
    dispatch({
      type: 'login/clear',
    });
    document.querySelector('#root').removeEventListener('click', this.closeNoticePop);
  }

  getPageTitle() {
    const {location} = this.props;
//    console.log(this.props.global)
    const languageForHeader = this.props.global.languageDetails.header;//顶部语言
    const {pathname} = location;
    let title = languageForHeader.pageTitle;
    // const MubuData = getMenuData();
    // if (MubuData) {
    //   MubuData.forEach((item) => {
    //     if (item.path === pathname) {
    //       title = `${item.name} - ${languageForHeader.pageTitle}`;
    //     }
    //   });
    // }
    return title;
  }
  //初始化
  init = () => {
    let language = (window.navigator.browserLanguage || window.navigator.language).toLowerCase();
    const hasLang = ['en', 'zh-cn'];
    //语言设置,若存在设置语言则用设置语言，否则用浏览器默认语言
    if (Cookies.get('lang')) {
      this.props.dispatch({
        type: 'global/setLanguage',
        payload: Cookies.get('lang'),
      })
    } else {
      //若浏览器默认语言不是中文和英文，则默认用英文
      language = hasLang.indexOf(language) > -1 ? language : 'en';
      this.props.dispatch({
        type: 'global/setLanguage',
        payload: language,
      })
      Cookies.set('lang', language, { expires: 99999 })
    }
    //获取权限后的回调
    const getRolePowerCallback = (response) => {
      this.props.dispatch({
        type: 'login/brand',
        payload: null,
      });
      this.props.dispatch({
        type: 'notice/getSummaryInfo',
        payload: null,
      });
      this.setMenuData(response);
    }
    // 没有权限列表则获取权限列表再执行回调
    if (this.props.global.rolePower.hasOwnProperty('role')) {
      getRolePowerCallback(this.props.global.rolePower);
    } else {
      this.getRolePower((response) => {
        getRolePowerCallback(response)
      });
    }
  }

  //获取权限列表
  getRolePower = (callback) => {
    this.props.dispatch({
      type: 'global/rolePower',
      callback: (data) => {
        if (callback) {
          callback(data);
        }
      }
    });
  }

  //设置侧边栏权限
  setMenuData = (rolePower) => {
    // console.log(rolePower);
    const lanuageForNav = this.props.global.languageDetails.nav;
    let newData = getMenuData().map((item)=>{
      item.name = lanuageForNav[item.key];
      if(item.hasOwnProperty('id') && !rolePower.modules[item.id].status || !item.hasOwnProperty('id')){
        item.hideInMenu = true;
        if(item.hasOwnProperty('id')){
          item.disabled = rolePower.modules[item.id].disabled;
        }
      }
      //子列表
      if(item.children){
        item.children = item.children.map((children)=>{
          if(children.hasOwnProperty('id') && !rolePower.modules[item.id].moduleSubs[children.id].status || !children.hasOwnProperty('id')){
            children.hideInMenu = true;
            if(children.hasOwnProperty('id')){
              children.disabled =  rolePower.modules[item.id].moduleSubs[children.id].disabled;
            }
          }
          children.name = lanuageForNav[children.key];
          return children;
        })
      }
      return item;
    })
    this.setState({
      MenuData: newData,
    })
    console.log(newData);
  }

  getBaseRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    // const urlParams = new URL(window.location.href);
    // // console.log(urlParams);
    // const redirect = urlParams.searchParams.get('redirect');
    // // Remove the parameters in the url
    // if (redirect) {
    //   urlParams.searchParams.delete('redirect');
    //   window.history.replaceState(null, 'redirect', urlParams.href);
    // } else {
    //   const { routerData } = this.props;
    //   // get the first authorized route path in routerData
    //   const authorizedPath = Object.keys(routerData).find(
    //     item => check(routerData[item].authority, item) && item !== '/'
    //   );
    //   console.log(authorizedPath);
    //   return authorizedPath;
    // }
    // return redirect;
    return '/goods/goodsList';
  };

  //面包屑标题
  setTitle = () => {
    const {location} = this.props;
    const locationPathname = (location && location.pathname) || '';
    const languageForHeader = this.props.global.languageDetails.header;
    const languageForMarketing = this.props.global.languageDetails.marketing.specialLists;
    const actionType = getQueryString().actionType || '';
    const type = getQueryString().type;
    // getQueryString

    let result = null;

    if (locationPathname === '/goods/goodsList') {
      result = languageForHeader.productManagement;
    }
    else if ((locationPathname === '/goods/goodsCreate') && (location.search.indexOf('spu_id') !== -1)) {
      result = languageForHeader.editProduct;
    }
    else if (locationPathname === '/goods/goodsCreate') {
      result = languageForHeader.addANewProduct;
    }
//    else if (locationPathname === '/goods/sku-list') {
//      result = 'SKU列表';
//    }
    else if (locationPathname === '/order/orderList') {
      result = languageForHeader.orderManagement;
    }
    else if (locationPathname === '/order/orderDetail') {
      result = languageForHeader.orderDetails;
    }
    else if (locationPathname === '/marketing/marketingList') {
      result = languageForHeader.offers;
    }
    else if (locationPathname === '/marketing/marketingCreate') {
      result = languageForHeader.addANewOffer;
    }
    else if (locationPathname === '/marketing/couponList') {
      result = languageForHeader.promoCode;
    }
    else if (locationPathname === '/marketing/couponCreate') {
      result = languageForHeader.addANewPromoCode;
    }
    else if (locationPathname === '/data/dataGoodsSalesList') {
      result = languageForHeader.commoditySales;
    }
    else if (locationPathname === '/data/dataFlowAnalysisTime') {
      result = languageForHeader.flowAnalysis;
    }
    else if (locationPathname === '/data/dataFlowAnalysisSource') {
      result = languageForHeader.flowAnalysis;
    }
    else if (locationPathname === '/data/dataFlowAnalysisAdvertising') {
      result = languageForHeader.flowAnalysis;
    }
    else if (locationPathname === '/data/dataFlowAnalysisKeyword') {
      result = languageForHeader.flowAnalysis;
    }
    else if (locationPathname === '/shop/shopLists') {
      result = languageForHeader.listPages
    }
    else if (locationPathname === '/shop/shopDetails') {
      const action = {
        add: languageForHeader.addANewListPage,
        edit: languageForHeader.EditListPage,
      }
      result = action[type];
    }
    else if (locationPathname === '/marketing/special' || locationPathname === '/marketing/specialList') {
      result = languageForHeader.promoPage
    }
    else if (locationPathname === '/marketing/specialCreate') {
      const action = {
        add: languageForMarketing.AddaNewFeaturedPage,
        edit: languageForMarketing.editFeaturedPage,
      }
      result = action[type];
    }
    else if (locationPathname === '/marketing/couponSubtractionCreate') {
      result = languageForHeader.addNewSpecialDeal
    }
    else if (locationPathname === '/marketing/couponSubtractionList') {
      result = languageForHeader.specialOffers
    }
    else if (['/goods/distributionIndex','/goods/distributionActivity','/goods/distributionSearchList','/goods/distributionCommodityChange'].includes(locationPathname)) {
      result = languageForHeader.distribution
    }
    else if (locationPathname === '/finance/supplierSettlement') {
      result = languageForHeader.financeSettlement
    }
    else if (locationPathname === '/') {
      result = languageForHeader.dashboard;
    }
    else if (locationPathname === '/notice') {
      result = languageForHeader.notificationCenter;
    }
    else if (locationPathname === '/shop/PromoList') {
      result = languageForHeader.template;
    }
    else if (locationPathname === '/shop/StyleTemplatesDetails') {
      result = languageForHeader.templateDetails;
    }
    else if(locationPathname === '/setting/returnAddress'){
      result = languageForHeader.returnAddress;
    }
    else if(locationPathname==='/setting/basicSetting'){
      result = languageForHeader.BasicInformation;
    }
    else {
      result = '';
    }

    return result;
  }

  //获取订单公告数据
  getNoticeData = (notices) => {
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = {...notice};
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{marginRight: 0}}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }
  //公告清除
  noticeClear = (tabTitle) => {
    const { noticeResoureData } = this.props.notice;
    const languageForProductNotice = this.props.global.languageDetails.notice;
    const languageForProductMessage = this.props.global.languageDetails.message;
    const titleJson = {
      [languageForProductNotice.notice]: 'normalNotice',
      [languageForProductNotice.Orders]: 'orderNotice'
    }
    this.props.dispatch({
      type: 'notice/noticeClear',
      payload: {
        tabTitle: tabTitle,
        key: titleJson[tabTitle],
        ids: noticeResoureData[titleJson[tabTitle]].map((item) => {
          return item.id
        }),
      },
      callback:(payload) => {
        message.success(`${languageForProductMessage.Emptied}${tabTitle}`);
      }
    })
  }

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };
  //侧边栏伸缩控制
  toggle = () => {
    const {collapsed} = this.props;
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: !collapsed,
    });
    this.resizeTimeout = setTimeout(() => {
      const event = document.createEvent('HTMLEvents');
      event.initEvent('resize', true, false);
      window.dispatchEvent(event);
    }, 600);
  }
  //角色切换退出登录
  onMenuClick = ({key}) => {
    if (key === 'logout') {
      this.props.dispatch({
        type: 'login/logout',
      });
    }
    else {
      const {login} = this.props;
      const {brandList} = login;
      this.props.dispatch({
        type: 'login/switchBrand',
        payload: {
          sellerBrandId: key,
        },
        callback: (response) => {
          if (response.status === 200) {
            brandList.map((item, index) => {
              if (item.id === parseInt(key, 10)) {
                Cookies.set('ELE_USERNAME_BRAND', item.name, {expires: 30});
                Cookies.set('ELE_JURISDICTION', item, {expires: 30});
              }
            });
          }
        },
      });
    }
  }

  //订单公告点击
  noticeOnItemClick = (item) => {
    const {type} = this.props.notice;
    this.setState({
      popupVisible: false
    })
    if (type === item.type) {
      this.props.dispatch({
        type: 'notice/setIsUpdate',
        payload: true,
      })
    }
    this.props.dispatch({
      type: 'notice/setType',
      payload: item.type,
    })
    this.props.dispatch(routerRedux.push('/notice?tabId=' + item.type));
  }

  render() {
    const {login, routerData, collapsed, match, location,  global: {rolePower, language, languageDetails, contentWidth, systemUpdate}, notice: {noticeTargetData}} = this.props;
    const { isMobile: mb, languageText, languageIconUp, popupVisible, MenuData } = this.state;
    const {brandList = []} = login;
    const languageForHeader = this.props.global.languageDetails.header;//顶部语言
    const languageForProductNotice = this.props.global.languageDetails.notice;
    const permission = rolePower.hasOwnProperty('modules') ? true : false;//权限是都加载完成
    const noticePermission = permission ? rolePower.modules['1010'].moduleSubs : '';
    const bashRedirect = this.getBaseRedirect();
    const languageSlected = this.props.global.language == 'en' ? enUS : zhCN;
    let noticeData = this.getNoticeData(noticeTargetData);
    //公告底部清除文案
    const locale = {
      emptyText: languageDetails.global.noData,
      clear: languageForProductNotice.Clear,
    };
    //通知数量
    const noticeCountNum = noticeTargetData.length;
    //登陆角色切换退出列表
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {
          brandList.map((item, index) => {
            return (
              <Menu.Item key={item.id}>{item.name}</Menu.Item>
            );
          })
        }
        {/*
         <Menu.Item disabled><Icon type="user" />个人中心</Menu.Item>
         <Menu.Item disabled><Icon type="setting" />设置</Menu.Item>
         */}
        <Menu.Divider/>
        <Menu.Item key="logout"><Icon type="logout"/>{languageForHeader.logOut}</Menu.Item>
      </Menu>
    );
    const layout = (
      <Layout id={styles.layout} className={`${collapsed ? styles.collapsed : styles.normal} layout`}>
        {
          permission ? (<div className={styles.basiclayoutContent} style={{minWidth: contentWidth+96}}>
            {
              MenuData.length>0 ? (
                <SiderMenu
                  logo={logo}
                  // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
                  // If you do not have the Authorized parameter
                  // you will be forced to jump to the 403 interface without permission
                  Authorized={Authorized}
                  menuData={MenuData}
                  collapsed={collapsed}
                  location={location}
                  // isMobile={mb}
                  onCollapse={this.handleMenuCollapse}
                  className={styles.slider}
                  systemUpdate={systemUpdate.isUpdate}
                />
              ): null
            }
            <Layout>
              <Header className={styles.header}>
                <Icon
                  className={styles.trigger}
                  type={collapsed ? 'menu-unfold' : 'menu-fold'}
                  onClick={this.toggle}
                />
                {/* 这里设置title */}
                {this.setTitle()}
                <div className={styles.right}>
                  <Dropdown
                    onVisibleChange={(visible) => {
                      this.setState({
                        languageIconUp: visible,
                      });
                    }}
                    overlay={
                      (
                        <Menu onClick={(item) => {
                          this.props.dispatch({
                            type: 'global/setLanguage',
                            payload: item.key,
                          })
                          Cookies.set('lang', item.key, {expires: 99999})
                          window.location.href = window.location.href
                        }}>
                          {
                            languageText.filter((item) => {
                              return item.id !== language
                            }).map((item) => {
                              return (
                                <Menu.Item key={item.id}>
                                  {item.text}
                                </Menu.Item>
                              )
                            })
                          }
                        </Menu>
                      )
                    }>
                    <span className={styles.languageBox}>
                      {
                        parseArr(languageText)[language]
                      }
                      <Icon style={{marginLeft: 14}} type="down"
                            className={`${languageIconUp ? styles.up : ''} ${styles.languageIcon}`}/>
                    </span>
                    {/*<span>*/}
                    {/*asfasf*/}
                    {/*</span>*/}
                  </Dropdown>

                  <NoticeIcon
                    count={noticeCountNum}
                    onItemClick={this.noticeOnItemClick}
                    onClear={this.noticeClear.bind(this)}
                    popupAlign={{offset: [20, -16]}}
                    popupVisible={popupVisible}
                    locale={locale}
                    className={styles.notice}
                    onClick={() => {
                      let tabPermission = {
                        '2': noticePermission['10021'].status,
                        '1': noticePermission['10022'].status
                      }
                      const newArr = Object.keys(tabPermission).filter((item) => {
                        return tabPermission[item];
                      })
                      if (noticeTargetData.length === 0) {
                        const tabId = newArr.length === 1 ? newArr[0] : 2;
                        this.props.dispatch(routerRedux.push('/notice?tabId=' + tabId));
                      }
                      else {
                        this.setState({
                          popupVisible: !popupVisible
                        })
                      }
                    }}
                  >
                    {
                      noticePermission['10021'].status ? (
                        <NoticeIcon.Tab
                          list={noticeData[2]}
                          title={languageForProductNotice.Orders}
                          emptyText={languageForProductNotice.readAllNotification}
                        />
                      ) : ''
                    }
                    {
                      noticePermission['10022'].status ? (
                        <NoticeIcon.Tab
                          list={noticeData[1]}
                          title={languageForProductNotice.notice}
                          emptyText={languageForProductNotice.readAllNotice}
                        />
                      ) : ''
                    }
                  </NoticeIcon>
                  <Dropdown
                    overlay={menu}
                    onVisibleChange={(visible) => {
                      this.setState({
                        accountBrandIcon: visible,
                      });
                    }}
                  >
                    <span className={`${styles.action} ${styles.account}`}>
                      <Avatar size="small" icon="user" className={styles.avatar}/>
                      {Cookies.get('ELE_USERNAME_BRAND') ? Cookies.get('ELE_USERNAME_BRAND') : Cookies.get('ELE_USERNAME')}
                      <Icon
                        type="down"
                        className={`${styles.accountBrand} ${this.state.accountBrandIcon ? styles.up : styles.check}`}
                      />
                    </span>
                  </Dropdown>

                </div>
                <div style={{display: systemUpdate.isUpdate ? 'block' : 'none'}} className={`${styles.headerCover}`}>

                </div>
              </Header>
              <Content style={{padding: '24px', height: '100%'}}>
                <Switch>
                  {
                    redirectData.map(item => (
                    <Redirect key={item.from} exact from={item.from} to={item.to} />
                  ))}
                  {
                    getRoutes(match.path, routerData).map(item => {
                    const authority = item.path === '/update' ? true : !systemUpdate.isUpdate;
                    // console.log(item.path)
                    return (
                      <AuthorizedRoute
                        key={item.key}
                        path={item.path}
                        component={item.component}
                        exact={item.exact}
                        authority={() => {
                          return authority;
                        }}
                        redirectPath="/update"
                      />
                    )
                  })}
                  <Redirect exact from="/" to={bashRedirect} />
                  <Route render={NotFound} />
                </Switch>
              </Content>
            </Layout>
          </div>) : null
        }
      </Layout>
    );

    return (
      <LocaleProvider locale={languageSlected}>
        <DocumentTitle title={this.getPageTitle()}>
          <ContainerQuery query={query}>
            {params => <div className={classNames(params)}>{layout}</div>}
          </ContainerQuery>
        </DocumentTitle>
      </LocaleProvider>
    );
  }
}

export default connect((state) => ({
  currentUser: state.user.currentUser,
  collapsed: state.global.collapsed,
  fetchingNotices: state.global.fetchingNotices,
  notices: state.global.notices,
  login: state.login,
  global: state.global,
  notice: state.notice,
}))(BasicLayout);
