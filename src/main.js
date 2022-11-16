import Vue from 'vue'
import Element from 'element-ui'
import uploader from 'vue-simple-uploader'
import App from '@/App'
import i18n from '@/i18n'
import router from '@/router'
import store from '@/store'
import '@/icons'
import '@/element-ui/theme/index.css'
import '@/assets/scss/aui.scss'
import http from '@/utils/request'
import unitedRadioGroup from '@/components/united-radio-group'
import unitedSelect from '@/components/united-select'
import unitedProcessMultiple from '@/components/united-process-multiple'
import unitedProcessStart from '@/components/united-process-start'
import unitedProcessRunning from '@/components/united-process-running'
import unitedProcessDetail from '@/components/united-process-detail'
import unitedDeptTree from '@/components/united-dept-tree'
import unitedRegionTree from '@/components/united-region-tree'
import unitedUpload from '@/components/united-upload';
import { hasPermission, getDictLabel } from '@/utils'
import cloneDeep from 'lodash/cloneDeep'
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/index.css'
Vue.use(VXETable)
Vue.use(uploader)
Vue.config.productionTip = false
Vue.use(Element, {
  size: 'default',
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(unitedRadioGroup)
Vue.use(unitedSelect)
Vue.use(unitedUpload)
Vue.use(unitedDeptTree)
Vue.use(unitedRegionTree)
Vue.use(unitedProcessMultiple)
Vue.use(unitedProcessStart)
Vue.use(unitedProcessRunning)
Vue.use(unitedProcessDetail)

// 挂载全局
Vue.prototype.$http = http
Vue.prototype.$hasPermission = hasPermission
Vue.prototype.$getDictLabel = getDictLabel

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG['storeState'] = cloneDeep(store.state)

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
