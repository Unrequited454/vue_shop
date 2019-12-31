import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TableTree from 'vue-table-with-tree-grid'
// 导入全局初始化样式
import '../src/assets/css/global.css'
// 导入font字体
import '../src/assets/fonts/iconfont'
import '../src/assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入富文本插件
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入进度条插件
import NProgress from 'nprogress'
// 导入进度条样式
import 'nprogress/nprogress.css'
// 全局注册富文本组件
Vue.use(VueQuillEditor)
// 在Vue的原型上添加axios，方便调用
Vue.prototype.$axios = axios
// 设置基地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 添加Authorization字段token令牌
axios.interceptors.request.use(config => {
  // 当进入request拦截器，表示发送了请求，我们就开启进度条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config
});
// 在response拦截器中，隐藏进度条
axios.interceptors.response.use(config => {
  //当进入response拦截器，表示请求已经结束，我们就结束进度条
  NProgress.done()
  return config
})
// 表格插件
Vue.component('table-tree', TableTree)
// 过滤器-设置事件格式
Vue.filter('dateFormat', (originVal) => {
  let dt = new Date(originVal);
  let y = dt.getFullYear(),
    m = (dt.getMonth() + 1 + '').padStart(2, '0'),
    d = (dt.getDate() + '').padStart(2, '0'),
    hh = (dt.getHours() + '').padStart(2, '0'),
    mm = (dt.getMinutes() + '').padStart(2, '0'),
    ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

});
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
