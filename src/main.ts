import { createApp } from 'vue'
import App from './App.vue'
import 'amfe-flexible'
import moment from "moment";
moment.locale("zh-cn");
import Vant from 'vant';
// 2. 引入组件样式
import 'vant/lib/index.css';
const app = createApp(App);
app.config.globalProperties.$moment = moment;
app.use(Vant);
// app.use(Search);
// app.use(Tab);
// app.use(Tabs);
// app.use(List)
app.mount('#app')
