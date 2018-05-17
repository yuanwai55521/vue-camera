// 相关业务辅助函数 都放在这里
import _ from 'lodash';
import moment from 'moment';

/**
 *是否授权
 * @param {String | Array} authorities 权限（可以是角色也可以是资源）
 */
export const hasAuth = (authorities) => {
  const account = window._vueInstance.$store.getters[GETTER_ACCOUNT];
  if (account) {
    const userAuthorities = _.map(account.authorities, a => a.authority);
    if (_.some(userAuthorities, a => a === 'ADMIN')) {
      return true;
    }
    const hasAuth = _.some(_.flatten([authorities]), a => _.includes(userAuthorities, a));
    return hasAuth;
  }
  return true;
};


/**
 * 获取与后端认证的token
 */
export const getToken = () => {
  return _.compact(_.map(document.cookie.split(';'), v => {
    if (_.includes(v, 'TOKEN')) { return v.split('=')[1]; } else { return ''; }
  }))[0];
};

/**
 *
 * @param {Date|string} date - 需要格式化的日期
 * @param {string} [format=window.config.dateDisplayFormat] - 日期格式
 */
export const dateFormat = (date, format = window.config.dateDisplayFormat) => {
  const mdate = moment(date);
  if (mdate.isValid()) {
    return moment(date).format(format);
  }
  return '';
};

/**
 * 计算时间差 并用文字表示 如：1年5月，10年，10月
 */
export const calcPeriod = (start, end) => {
  let temp = '';
  if (moment(end).isValid() && moment(start).isValid()) {
    // 这里加了3天：去除了，时间的误差和对应计算方式的问题：2017-1-10到2018-1-9号为一年
    let hm = moment(end).add(3, 'd').toDate() - start;
    let years = moment.duration(hm).years();
    let months = moment.duration(hm).months();
    if (years > 0) {
      temp += `${years}年`;
    }
    if (months > 0) {
      temp += `${months}月`;
    }
  }
  return temp;
};
