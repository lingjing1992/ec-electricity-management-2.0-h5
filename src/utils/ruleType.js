/**
 * 表单验证规则（for Ant）
 *
 * by koen
 * 2016/9/28
 */

// Ant 验证中默认可用的 type 类型有：
//
// string: Must be of type string. This is the default type.
// number: Must be of type number.
// boolean: Must be of type boolean.
// method: Must be of type function.
// regexp: Must be an instance of RegExp or a string
//   that does not generate an exception when creating a new RegExp.
// integer: Must be of type number and an integer.
// float: Must be of type number and a floating point number.
// array: Must be an array as determined by Array.isArray.
// object: Must be of type object and not Array.isArray.
// enum: Value must exist in the enum.
// date: Value must be valid as determined by Date
// url: Must be of type url.
// hex: Must be of type hex.
// email: Must be of type email.

// 自定义数据类型
const dataType = {
  // 任意字符
  any: {
    reg: /[\w\W]+/,
  },
  // 正则表达式输入1~100范围内的数字，最多保留2位小数
  /*
  已验证：
  方法一：/^(100|[1-9]\d|\d)(.\d{1,2})$/
  方法二：/^100$|^(\d|[1-9]\d)(\.\d{1,4})*$/
  可输入例子： 23.99、34、2.0000、23.09、34
   */
  commissionRadio: {
    reg: /^100$|^([3-9]\d)(\.\d{1,2})*$/,
    errMsg: '输入30~100范围内的数字，最多保留2位小数',
  },
  // 新建优惠码-折扣
  discountValue: {
    reg: /^0(\.\d{1,2})$|^([1-9]|[1-9]\d)(\.\d{1,2})*$/,
    errMsg: '输入0~100范围内的数字，最多保留2位小数',
  },
  // 新建优惠码-消费条件
  minOrderAmount: {
    reg: /^[0-9]{0}([0-9]|[.])+$/,
    errMsg: '可输入长度为6位数字，超出6位时不可继续输入',
  },
  // 商品适用范围-指定商品
  spuIdsArr: {
    reg: /^(\d|,)+$/,
    errMsg: '请输入指定SPU，多个SPU用英文 , 隔开',
  },
  // 4-20任意字符
  // "*4-20": /^[\w\W]{4,20}$/,
  // 数字
  number: {
    reg: /^\d+$/,
    errMsg: '只能是数字',
  },
  //
  'number-float': {
    reg: /^[0-9]+([.]{1}[0-9]+){0,1}$/,
    errMsg: '只能是数字',
  },
  // 中文
  cn: {
    reg: /^[\u4E00-\u9FA5\uf900-\ufa2d]+$/,
    errMsg: '只能是中文',
  },
  // 英文/数字组合
  'en-num': {
    reg: {
      // 自定义 test 方法
      test: (value) => {
        return /[a-zA-Z]+(?=[0-9]+)|[0-9]+(?=[a-zA-Z]+)/.test(value) && value.replace(/[a-zA-Z]/g, '').replace(/[0-9]/g, '') === '';
      },
    },
    errMsg: '必须是英文字母、数字组合',
  },
  // 邮政编码
  post: {
    reg: /^[0-9]{6}$/,
    errMsg: '邮政编码格式不正确',
  },
  // 手机
  mobile: {
    reg: /^13[0-9]{9}$|^14[579]\d{8}$|^15[0-9]{9}$|^17[0135678]\d{8}$|^18[0-9]{9}$/,
    errMsg: '手机格式不正确',
  },
  // email
  email: {
    reg: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    errMsg: '邮箱格式不正确',
  },
  // url
  url: {
    reg: /^(\w+:\/\/)?\w+(\.\w+)+.*$/,
    errMsg: 'url格式不正确',
  },
  // idcard
  'id-card': {
    reg: /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
    errMsg: '身份证号码格式不正确',
  },
  // num+bigStr
  'num+bigStr': {
    reg: /^[0-9A-Z]+$/,
    errMsg: '只能是阿拉伯数字或大写英文字母',
  },
  // 中英文字符、半角标点符号•.,-_~ *()
  'cn+en+str': {
    reg: /^[\u4e00-\u9fa5_\-~*().·`,a-zA-Z]+$/,
    errMsg: '中英文字符、半角标点符号·.,-_~ *()',
  },
  // 多email
  'more+email': {
    reg: /^(\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*,)*(\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)$/,
    errMsg: '邮箱格式不正确',
  },
  // 座机号码
  telephone: {
    reg: /^(\d|-){1,30}$/,
    errMsg: '数字和符号-',
  },
  // 英文字母（区分大小写）、数字，可含半角标点符号·.,-_~*()
  'en+num+str': {
    reg: /^[a-zA-Z0-9·`.,\-_~*()]+$/,
    errMsg: '英文字母（区分大小写）、数字，可含半角标点符号·.,-_~*()',
  },
};

// 生成 Ant 验证规则 rule
export default function getRule(type, errMsg) {
  const validate = dataType[type];
  if (validate) {
    return {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
        } else if (!validate.reg.test(value)) {
          callback([new Error(errMsg || validate.errMsg)]);
        } else {
          callback();
        }
      },
    };
  }
}
