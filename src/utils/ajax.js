import { ajax } from 'cpt-toolkit';
import { BASEURL } from './consts';
ajax.defaults.baseURL = BASEURL;

ajax.interceptors.response.use(function (res) {
  if (res.type === 'INVALID_MODEL') {
    window._vueInstance.$pub('on-invalid-model', res.data);
  }
  return res;
});

export default ajax;
