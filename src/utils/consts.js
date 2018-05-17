import sysConfigs from './sys-config';

/**
 * 链接url
 * @param {...String} args
 */
export const joinUrl = (...args) => {
  return args.join('/').replace(/\/+/ig, '/').replace('http:/', 'http://');
};

/**
 * 将url映射为接口对应的地址
 * @param {...String} args
 */
export const mapRootUrl = (...args) => {
  return joinUrl(BASEURL, ...args);
};

/**
 * 获取 webpack 环境变量配置
 */
export const getProcessEnv = () => {
  const env = process.env;
  env.DEBUG = env.NODE_ENV !== 'production';
  // 在开发时用来动态切换子系统
  if (env.DEBUG) {
    const name = sessionStorage.getItem('name');
    name && (env.NAME = name);
  }
  return env;
};

export const ENV = getProcessEnv();

export const BASEURL = window.config.baseUrl || joinUrl((ENV.CROSS ? `http://${ENV.HOST}:${ENV.PORT}/` : '/'), ENV.ROOT);

export const SYSNAME = ENV.NAME;

export const SYSCONFIG = sysConfigs[SYSNAME];

document.title = SYSCONFIG.title;
