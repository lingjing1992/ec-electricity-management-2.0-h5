import moment from 'moment';
import { parse, stringify } from 'qs';
let returnTopTimer;

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

function accMul(arg1, arg2) {
  let m = 0;
  const s1 = arg1.toString();
  const s2 = arg2.toString();
  m += s1.split('.').length > 1 ? s1.split('.')[1].length : 0;
  m += s2.split('.').length > 1 ? s2.split('.')[1].length : 0;
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / 10 ** m;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟', '万']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(accMul(num, 10 * 10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}


export function getQueryString(url) {
  url = url == null ? window.location.href : url;
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj = {};
  const reg = /([^&=]+)=([^&=#]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}

// 配置商品编辑的英文To中文
export function goodsEditorLanguage(item,languageForGlobal){
//  console.log('配置商品编辑的英文To中文',item)
  let result = null;
  switch (item){
    case 'en':
      result = languageForGlobal.English;
      break;
    case 'de':
      result = languageForGlobal.German;
      break;
    case 'fr':
      result = languageForGlobal.French;
      break;
    case 'zh-tw':
      result = languageForGlobal.Chinese;
      break;
    default:
      result = item;
      break;
  }
  return result;
}

/**
 * 设置API接口
 * 说明：
 *  线上环境：
 *    域名：merchant.pearlgo.com
 *    API：i-merchant.pearlgo.com
 *    是有API[i-]开头，作为加速需求。
 *  测试环境
 *    域名：test.ecmc.batmobi.net
 *    API：test.ecmc.batmobi.net
 *  本地环境
 *    直接走代理。
 * @returns {*}
 */
export function setApiHost() {
  const locationProtocol = '//';
  const locationHost = window.location.host;
  let apiHost = '';
  switch (locationHost) {
    case 'test.ecmc.batmobi.net':
      apiHost = 'test.ecmc.batmobi.net';
      break;
    // case 'pro.ecmc.batmobi.net':
    //   apiHost = 'testapi.ecmc.batmobi.net';
    //   break;
    case 'merchant.pearlgo.com':
      apiHost = 'merchant.pearlgo.com';
      break;
    default:
      return '';
  }
  return locationProtocol + apiHost;
}

/**
 *
 * @param language 所有的语言，类型为Array
 * @param values 对应绑定的值
 * @returns {{}}
 */
// 获取语言请求参数
export function getLanguageParams(language,values) {
  const json = {};
  language.forEach((item) => {
    json[item] = values[item] ? values[item].trim() : '';
  })
  return json;
}

/**
 *
 * @param target 目标数
 * @param num 保留小数位数
 */
//小数四射五入
export function toFixed(target,num) {
  return Math.round(target * Math.pow(10, num)) / Math.pow(10, num);
}

export function appendScript(url) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
//  script.async = 'async';
  document.body.appendChild(script);
}

export function domIsShow(current) {
  if(current.status && !current.hide){
    return true;
  }else {
    return false;
  }
}

//根据字段返回过滤渲染列表
export function tabbleColumnsControl(columns,permission) {
  return columns.filter((item)=>{
    return !item.hasOwnProperty('permission') || permission[item.permission].status;
  })
}
//根据权限返回控制列表渲染
export function tabbleColumnsControlForPemission(dataSource,columns,point,permission) {
  if(dataSource.length>0){
    const keysArr = Object.keys(dataSource[0]);
    const pointKeys = Object.keys(point);
    const keysArrLength = keysArr.length;
    const indexArr = [];
    for(let i=0;i<columns.length;i++){
      for(let j=0;j<keysArrLength;j++){
        if(columns[i].dataIndex === keysArr[j]){
          for(let k=0; k<pointKeys.length;k++){
            if(keysArr[j] === pointKeys[k] && !permission[point[pointKeys[k]]].status){
              indexArr.push(i);
              break;
            }
          }
          break;
        }
      }
    }
    indexArr.reverse();
    indexArr.forEach((item)=>{
      columns.splice(item,1);
    })
  }
}

//把数组对象[{id:1,text:'值'}]解析纯对象{'1':'值'}
export function parseArr(arr) {
  return arr.reduce((item1,item2) => {
    item1 = item1.hasOwnProperty('id') ? { [item1.id] : item1.text} : item1;
    return {
      ...item1,
      [item2.id] : item2.text
    }
  })
}

//修改对象类state子属性的通用方法
/**
 *
 * @param react react当前类实例
 * @param objectName 要修改对象的key
 * @param result 合并进去的新对象
 */
export function setStateObjectKey(react,objectName,result){
  const targetObject = react.state[objectName];
  react.setState({
    [objectName]: Object.assign(targetObject, result),
  })
}
//获取字符长度
/**
 *
 * @param str 目标字符串
 * return 改字符串的实际长度，中文2个，英文1个字符
 */
export function getStrLength(str){
  return str.replace(/[\u0391-\uFFE5]/g,"aa").length;  //先把中文替换成两个字节的英文，在计算长度
}

//地址拼装
export function addressString(addr){
  if(addr && addr.hasOwnProperty('id')){
    return `${addr.addressLine1}${addr.addressLine2 ? ` ${addr.addressLine2}` : `` } ${addr.city} ${addr.region} ${addr.zip} ${addr.country}`
//    return `${addr.addressLine1} `}{`${addr.addressLine2 ? addr.addressLine2+' ' : ''}`}{`${addr.city} `}{`${addr.region} `}{`${addr.zip} `}{`${addr.country}`
  }
  return '';
}

//接入谷歌分析
export function googleAnalytics(id){
  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
  })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
  ga('create', id, 'auto');
  //增强型电子商务插件
  ga('require', 'ec');
  //发送网页跟踪事件
  ga('send', 'pageview');
}
// @param params { eventCategory:通常是用户与之互动的对象（'Video'） eventAction:互动类型（'play'） eventLabel:用于对事件进行分类（'Fall Campaign'）}
export function setGa (param) {
  if (ga) {
    ga('send', {
      hitType: 'event',
      ...param
    });
  }
}

//下载url资源
export function downloadUrl(downloadLink) {
  var elem = document.createElement('a');
  var urlArr = downloadLink.split('/');
  var download = urlArr[urlArr-1];
  elem.href = downloadLink;
  elem.setAttribute('download',download);
  if(document.all) {
    elem.click();
  }
  // 其它浏览器
  else {
    var e = document.createEvent("MouseEvents");
    e.initEvent("click", true, true);
    elem.dispatchEvent(e);
  }
}

/**
 *
 * @param ele dom节点
 * @param offsetTop 滑动向上偏移值
 */
//点击滑动到指定元素模块
export function scrollToEvent(ele,offsetTop){
  let scrollEle = document.querySelector(ele);
  if(!scrollEle)return;
  var target = offset(scrollEle).top-offsetTop;   //目标元素的位置
  var originPosition = document.documentElement.scrollTop || document.body.scrollTop;
  clearInterval(returnTopTimer);
  //设置一个定时器
  returnTopTimer = setInterval(() => {
    //用于设置速度差，产生缓动的效果
    var step = (target - originPosition) / 6;
    step = step>0 ? Math.ceil(step) : Math.floor(step);
    originPosition += step;
    document.documentElement.scrollTop = document.body.scrollTop = originPosition;
    if (Math.abs(target-originPosition) <= Math.abs(step)) {
      clearInterval(returnTopTimer);
    }
  }, 30);
}

//获取元素相对body的左偏移值和上偏移值
export function offset(curEle){
  if(!curEle)return;
  var totalLeft = null;
  var totalTop = null;
  var par = curEle.offsetParent;
  // 首先把自己本身的进行累加：
  totalLeft += curEle.offsetLeft;
  totalTop += curEle.offsetTop;

  // 只要没有找到body，我们就把父级参照物的边框和偏移进行累加
  while (par) {
    if (navigator.userAgent.indexOf("MSIE 8.0") === -1) { //不是标准ie8浏览器才累加边框
      // 累加父级参照物的边框
      totalLeft += par.clientLeft;
      totalTop += par.clientTop;
    }

    // 累加父级参照物的偏移
    totalLeft += par.offsetLeft;
    totalTop += par.offsetTop;

    par = par.offsetParent;
  }
  return {left: totalLeft, top: totalTop};
}


