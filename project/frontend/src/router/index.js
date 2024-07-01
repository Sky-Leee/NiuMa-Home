import { createRouter, createWebHashHistory } from 'vue-router'

import pinia from '@/stores/pinia'
import { userStore } from '@/stores/userStore'
const store = userStore(pinia)
import { getToken, clearToken } from '@/utils/token'
import LakeHome from '@/views/LakeHome.vue'
import LakeBlank from '@/views/LakeBlank.vue'
import User from '@/views/User.vue'
import UserLogin from '@/views/UserLogin.vue'
import UserRegister from '@/views/UserRegister.vue'
import UserRePwd from '@/views/UserRePwd.vue'
import UserCenter from '@/views/UserCenter.vue'
import UserMessage from '@/views/UserMessage.vue'
import UserSetting from '@/views/UserSetting.vue'
import UserSettingBase from '@/views/UserSettingBase.vue'

import PostDetail from '@/views/PostDetail.vue'
import PostEdit from '@/views/PostEdit.vue'

import SearchResult from '@/views/SearchResult.vue'
const router = createRouter({
    history: createWebHashHistory(),
    routes: [

        {
            name: '/',
            path: '/',
            component: LakeHome,
            meta: { show: true }
        },

        {
            name: '/blank',
            path: '/blank',
            component: LakeBlank,
            meta: { show: false }
        },

        {
            name: '/post',
            path: '/post/:id',
            component: PostDetail,
            meta: { show: true }
        },

        {
            name: '/postNew',
            path: '/postNew',
            component: PostEdit,
            meta: { show: true }
        },

        {
            name: 'search',
            path: '/search',
            component: SearchResult,
            meta: { show: true },
            props: (route) => ({
              keyword: route.query.keyword || '',
              orderby: route.query.orderby || 'correlation',
              page: parseInt(route.query.page) || 1,
              size: parseInt(route.query.size) || 10,
            }),
        },
        // 用户
        {
            name: '/user',
            path: '/user',
            component: User,
            meta: { show: false },
            children: [
                // 登录
                {
                    name: 'login',
                    path: 'login',
                    component: UserLogin,
                    meta: { showLogo: true },
                },
                // 注册 
                {
                    name: 'register',
                    path: 'register',
                    component: UserRegister,
                    meta: { showLogo: true },
                },
                // 找回密码
                {
                    name: 'rePwd',
                    path: 'rePwd',
                    component: UserRePwd,
                    meta: { showLogo: true },
                },
                // 用户中心
                {
                    name: 'center',
                    path: 'center/:id',
                    component: UserCenter,
                    meta: { showLogo: false,  show: true },
                },

                // 用户设置
                {
                    name: 'setting',
                    path: 'setting',
                    component: UserSetting,
                    meta: { showLogo: false, show: true },
                    children: [
                        {
                            name: 'base',
                            path: 'base',
                            component: UserSettingBase
                        }
                    ]
                },

                // 用户消息
                {
                    name: 'msg',
                    path: 'msg',
                    component: UserMessage,
                    meta: { showLogo: false,  show: true },
                },

            ],
        },
    ]
})
router.beforeEach(async (to, from, next) => {
    let token = getToken()
    let isToken = store.isToken

    if (token != 'Bearer null') {
        //用户登陆了，且想去登录页的分支
        if (to.path == "/user/login") {
            next("/");
        } else {
            if (isToken) {
                //next代表该去哪里就去哪里 
                next();
            } else {
                try {
                    // await store.verifyToken()
                    store.isToken = token
                    next()
                } catch (error) {
                    clearToken()
                    next('/user/login')
                }
            }
        }

    } else {
        //未登录的判断
        //获取用户未登录想去的路由的路径
        let toPath = to.path;
        //判断未登录
        if (toPath.indexOf('center') != -1 || toPath.indexOf('setting') != -1) {
            //跳转到登录页
            next('/user/login?redirect=' + toPath);
        } else {
            //去的并非上面这些路由,放行
            next();
        }

    }

})
export default router