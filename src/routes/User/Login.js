import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import Cookies from 'js-cookie';
// import * as Cookies from "js-cookie";
import { Form, Input, Button, Icon, Alert } from 'antd';
import styles from './Login.less';
import logo from '../../assets/logo5.png';
// import GlobalFooter from './../../components/GlobalFooter';

const FormItem = Form.Item;
// const { TabPane } = Tabs;
// const copyright = <div>Copyright <Icon type="copyright" /> 2017 至真信息技术部出品</div>;
// const links = [];

@connect(state => ({
  login: state.login,
  global: state.global
}))
@Form.create()
export default class Login extends Component {
  state = {
    // count: 0,
    type: 'account',
    lang: Cookies.get('lang'),
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.login.status === 200) {
      /*
      * 设置token
      * 设置cookie
      * 跳转到指定页面 ceshi
      */
      Cookies.set('ELE_TOKEN', nextProps.login.token, { expires: 30 });
      Cookies.set('ELE_USERNAME', nextProps.login.signIn, { expires: 30 });
      this.props.dispatch(routerRedux.push('/'));
      // console.log('componentWillReceiveProps-login');
    }
  }
  componentWillMount(){
    const {lang} = this.state;
    let language = (window.navigator.browserLanguage || window.navigator.language).toLowerCase();
    const  hasLang= ['en','zh-cn'];
    //语言设置,若存在设置语言则用设置语言，否则用浏览器默认语言
    if(lang){
      this.props.dispatch({
        type: 'global/setLanguage',
        payload: lang,
      })
    }else {
      //若浏览器默认语言不是中文和英文，则默认用英文
      language = hasLang.indexOf(language)>-1 ? language : 'en';
      Cookies.set('lang', language, { expires: 99999999 });
      this.props.dispatch({
        type: 'global/setLanguage',
        payload: language,
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    const { dispatch } = this.props;

    dispatch({
      type: 'login/clear',
    });
  }

  onSwitch = (key) => {
    this.setState({
      type: key,
    });
  }

  onGetCaptcha = () => {
    // let count = 59;
    // this.setState({ count });
    // this.interval = setInterval(() => {
    //   count -= 1;
    //   this.setState({ count });
    //   if (count === 0) {
    //     clearInterval(this.interval);
    //   }
    // }, 1000);
  }

  handleSubmit = (e) => {
    // 清除提示
    this.props.dispatch({
      type: 'login/clearSignMsg',
      payload: null,
    });
    e.preventDefault();
    const { type } = this.state;
    this.props.form.validateFields({ force: true },
      (err, values) => {
        // const sendData = {
        //   account_no: 'zhizhen',
        //   password: 'Zhizhen321',
        // };
        const sendData = {
          account_no: values.userName,
          password: values.password,
        };
        if (!err) {
          this.props.dispatch({
            type: `login/${type}Submit`,
            payload: sendData,
            callback: (data) => {

            }
          });
        }
      }
    );
  }

  renderMessage = (message) => {
    return (
      <Alert
        className={styles.errorMessage}
        message={message}
        type="error"
        showIcon
      />
    );
  }

  render() {
    const { form, login } = this.props;
    const { getFieldDecorator } = form;
    const { type } = this.state;
    const languageForHeader = this.props.global.languageDetails.header;
    const languageForLogin = this.props.global.languageDetails.login;
    return (
      <div className={styles.container}>
        <div className={styles.loginWrap}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img
                  alt=""
                  className={styles.logo}
                  src={logo}
                />
              </Link>
            </div>
            {/* <p className={styles.desc}>广告语</p> */}
          </div>
          <div className={styles.main}>
            <Form onSubmit={this.handleSubmit} style={{width: 260}}>
              <FormItem>
                {getFieldDecorator('userName', {
                  rules: [{
                    required: type === 'account', message: languageForLogin.enterYourAccount,
                  }],
                  // initialValue: Cookies.get('ELE_USERNAME'),
                })(
                  <Input
                    size="large"
                    className={styles.loginInput}
                    prefix={<Icon type="lock" className={styles.prefixIcon} />}
                    type="text"
                    placeholder={languageForLogin.enterYourAccount}
                  />

                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{
                    required: type === 'account', message: languageForLogin.enterYourPassword,
                  }],
                })(
                  <Input
                    size="large"
                    className={styles.loginInput}
                    prefix={<Icon type="lock" className={styles.prefixIcon} />}
                    type="password"
                    placeholder={languageForLogin.enterYourPassword}
                  />
                )}
              </FormItem>
              <div style={{position: 'relative'}}>
              {
                login.signMsg
                  ?
                  this.renderMessage(login.signMsg)
                  :
                  ''
              }
              </div>
              <FormItem className={styles.additional}>
                <Button
                  size="large"
                  loading={login.submitting}
                  className={styles.submit}
                  type="primary"
                  htmlType="submit"
                >
                  {languageForLogin.Login}
                </Button>
              </FormItem>
            </Form>
            {/* 需要加到 Icon 中 */}
            {/*
          <div className={styles.other}>
            其他登录方式
            <span className={styles.iconAlipay} />
            <span className={styles.iconTaobao} />
            <span className={styles.iconWeibo} />
            <Link className={styles.register} to="/user/register">注册账户</Link>
          </div>
          */}

            {/* <GlobalFooter className={styles.footer} links={links} copyright={copyright} /> */}

          </div>
        </div>
      </div>
    );
  }
}
