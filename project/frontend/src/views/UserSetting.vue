<template>
    <div class="back-container">
        <span @click="gotoCenter()">&lt; 返回个人主页</span>
    </div>
    <div class="setting-container">
        <div class="left-container">
            <el-menu style="border-radius: 0.25rem 0 0 0.25rem;height: 100%;" router default-active="/user/setting/base" class="el-menu-vertical-demo">
                <el-menu-item index="/user/setting/base">
                    <el-icon>
                        <CreditCard />
                    </el-icon>
                    <span class="setting-item">个人资料</span>
                </el-menu-item>
                <el-menu-item index="2" disabled>
                    <el-icon>
                        <User />
                    </el-icon>
                    <span class="setting-item">账号设置</span>
                </el-menu-item>
                <el-menu-item index="3" disabled>
                    <el-icon>
                        <bell />
                    </el-icon>
                    <span class="setting-item">消息设置</span>
                </el-menu-item>
                <el-menu-item index="4" disabled>
                    <el-icon>
                        <setting />
                    </el-icon>
                    <span class="setting-item">暂未确定</span>
                </el-menu-item>
            </el-menu>
        </div>

        <div class="right-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import { userStore } from '@/stores/userStore.js'
import { toRaw } from 'vue';
import { useRouter } from 'vue-router';

const store = userStore()
const router = useRouter()
function gotoCenter(){
    router.push(`/user/center/${toRaw(store.userHeaderInfo).user_id}`)
}
</script>

<style lang="less" scoped>
.back-container{
    background-color: #fff;
    width: 55rem;
    margin: 1.8rem auto;
    margin-top: 4rem;
    border-radius: 0.25rem;
    height:3rem;
    display: flex;
    align-items: center;
    span{
        cursor: pointer;
        color: #409eff;
        margin-left: 1rem;
        font-size: 1.25rem;
    }
    span:hover{
        color: #2e74bb;
    }
}
.setting-container {
    background-color: #fff;
    width: 55rem;
    border-radius: 0.25rem;
    margin: 1.8rem auto;
    display: flex;

    .left-container {
        width: 20%;
    }

    .right-container {
        width: 80%;
    }
}

/* 响应式布局 - 小屏幕手机 */
@media screen and (max-width: 480px) {
    .back-container{
        width: 100%;
    }
    .setting-container{
        width: 100%;
        .left-container{
            .setting-item{
                display: none;
            }
        }
    }
}
</style>