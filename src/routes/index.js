import VueRouter from 'vue-router';

let routes = [];
// 动态引入router 遍历该文件夹下所有的非index.js文件
let contexts = require.context('./', true, /\.js$/);
contexts.keys().forEach((key) => {
  let modRoutes = contexts(key).default;
  if (key !== 'index.js' && Object.prototype.toString.apply(modRoutes) === '[object Array]') {
    routes = routes.concat(modRoutes);
  }
});
const router = new VueRouter({ routes });
router.beforeEach((to, from, next) => {
  router.app.$Message.loading('页面加载中...', 0);
  next();
});
router.afterEach(() => {
  router.app.$Message.destroy();
});
export default router;
