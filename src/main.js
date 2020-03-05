import Vue from 'vue'
import App from './App.vue'
import './common/css/jsmind.css'
// import './common/css/myTheme.css'
import './common/font/iconfont.css'
import { Pagination, Dialog, Button, Select, Message } from 'element-ui';

Vue.config.productionTip = false

Vue.prototype.$ELEMENT = { size: 'small' };
Vue.prototype.$message = Message;
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Button)
Vue.use(Select)


new Vue({
  render: h => h(App),
}).$mount('#app')
