import { createApp } from 'vue'
import App from './App.vue'
import pinia from '@/stores/pinia'
import router from '@/router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import LakeHeader from './components/LakeHeader.vue'
import LakeFooter from './components/LakeFooter.vue'

import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import UndrawUi from 'undraw-ui'
import 'undraw-ui/dist/style.css'

// commonjs
// import { PicGo } from 'picgo'
// const picgo = new PicGo() // <- 在实例化的时候传入配置文件的路径

// highlightjs
import hljs from 'highlight.js';

VMdEditor.use(githubTheme, {
    Hljs: hljs,
  });

VMdPreview.use(githubTheme, {
    Hljs: hljs,
  });

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(VMdEditor);
app.use(VMdPreview)
app.use(UndrawUi)
// app.use(picgo)
app.component('LakeHeader',LakeHeader)
app.component('LakeFooter',LakeFooter)
app.mount('#app')