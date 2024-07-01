<template>
        <div :class="['lake-header', { 'has-shadow': isScrolled }]">
            <span style="font-size: x-large;color: #409eff;line-height: 3.6rem;min-width: 7rem">牛马之家</span>

            <el-button @click="$router.push('/')" text class="btn">首页</el-button>

            <Search />
            <el-button v-show="!isLogin" text class="btn" @click="$router.push('/user/login')">登录
            </el-button>

            <el-button v-show="!isLogin" text class="btn" @click="$router.push('/user/register')">注册
            </el-button>

            <el-badge :value="userHeaderInfo.unread.length" :hidden="userHeaderInfo.unread.length==0">
                <!-- <el-button v-show="isLogin" text class="btn" @click="$router.push('/user/msg')">
                    消息
                </el-button> -->
            </el-badge>


            <div v-show="isLogin" style="display: flex;align-items: center;">
                <el-dropdown>
                    <el-avatar style="cursor: pointer;display: flex;margin-left: 2rem;" fit="fill"
                        :src="userHeaderInfo.avatar || ''">
                    </el-avatar>

                    <template #dropdown>
                        <el-dropdown-menu>
                            <a :href="`/#/user/center/${userHeaderInfo.user_id}`" style="text-decoration: none;">
                                <el-dropdown-item>个人中心</el-dropdown-item>
                            </a>
                            <el-dropdown-item @click="logout()">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
</template>


<script setup>
import 'element-plus/theme-chalk/display.css'
import { connectSocket } from '../utils/socketIO';
import { ref, computed, onMounted, onUnmounted, toRaw } from 'vue'
// import { Search } from '@element-plus/icons-vue'
import Search from '@/components/Search.vue'
import { useRouter } from 'vue-router';
import { userStore } from '@/stores/userStore.js'
import { storeToRefs } from 'pinia';
import { getToken } from '../utils/token';
const store = userStore()
const router = useRouter()

// 用户信息
const { userHeaderInfo } = storeToRefs(store)

// 登出
function logout() {
    store.logout()
    router.push('/user/login')
}

// 是否登录
let isLogin = computed(() => {
    return store.userHeaderInfo.username
})

// 给header添加阴影
const isScrolled = ref(false);
const handleScroll = () => {
    isScrolled.value = window.pageYOffset > 0;
};

onMounted(async () => {
    await store.getUserInfoByToken()
    window.addEventListener('scroll', handleScroll);

    // 禁用消息订阅
    // if (isLogin) {
    //     connectSocket('http://localhost:3000', userHeaderInfo.value.username)
    // }

})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});


</script>

<style lang="less" scoped>
.lake-header {
    position: fixed;
    width: 100%;
    height: 4rem;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    background-color: #fff;

    .btn {
        margin-left: 1rem;
    }
}

/* 在小屏幕手机上的媒体查询 */
@media screen and (max-width: 480px) {
    .lake-header {
        .input {
            display: none; /* 在小屏幕手机上隐藏搜索框 */
        }

        .btn {
            margin-left: 1rem;
        }
    }
}

/* 在普通手机和平板电脑上的媒体查询 */
@media screen and (min-width: 481px) and (max-width: 1024px) {
    .el-menu-demo {
        .flex-grow {
            flex-grow: 1;
        }

        .input {
            display: flex;
            width: 20rem;
            height: 2rem;
        }

        .btn {
            margin-left: 1rem;
        }
    }
}

/* 在台式电脑和大屏幕设备上的媒体查询 */
@media screen and (min-width: 1025px) {
    .el-menu-demo {
        .flex-grow {
            flex-grow: 0.5;
        }

        .input {
            display: flex;
            width: 20rem;
            height: 2rem;
        }

        .btn {
            margin-left: 1.5rem;
        }
    }
}
</style>