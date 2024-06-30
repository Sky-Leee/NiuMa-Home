<template>
    <transition name="fade" appear>
        <div class="login-container">
            <!-- 登录 -->
            <el-form class="form-container" ref="ruleFormRef" :model="ruleForm" :rules="rules">
                <router-link to="/" style="float: right;color:grey;cursor: pointer;">返回</router-link>

                <div class="title">登录</div>

                <el-form-item prop="username">
                    <el-input type="text" v-model="ruleForm.username" placeholder="用户账号" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" show-password v-model="ruleForm.password" placeholder="用户密码"
                        autocomplete="off"></el-input>
                </el-form-item>

                <el-button color='#409eff' @click="submitForm(ruleFormRef)"><span style="color: #fff;">登录</span></el-button>


                <div style="margin-top: 4rem;">
                    <router-link to="/user/register" style="color: #a3a0a0;text-decoration:none;">没有账号？注册一个！</router-link>
                    <!-- <router-link to="/user/rePwd" style="color: #a3a0a0;float: right;text-decoration:none;">忘记密码？</router-link> -->
                </div>

            </el-form>
        </div>
    </transition>
</template>

<script setup>
import { reactive, ref, toRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus'
import { userStore } from '@/stores/userStore.js'
const store = userStore()
const router = useRouter()
const route = useRoute()
const ruleFormRef = ref()
const ruleForm = reactive({
    username: '',
    password: '',
})

const rules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        // { pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, message: '用户名必须是一个邮箱', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
})

// 登录
async function login() {
    try {
        await store.userLogin(toRaw(ruleForm))
        ElMessage({
            message: '登录成功！',
            type: 'success',
        })
        router.push(`/`)
        await store.getUserInfoByToken()
    } catch (err) {
        ElMessage({
            message: err,
            type: 'error',
        })
    }
}

const submitForm = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            login()
        } else {
            return false
        }
    })
}

</script>

<style lang="less" scoped>
.login-container {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin-top: -3.5rem;

    .form-container {
        border-radius: 0.25rem;
        margin: 0 auto;
        width: 20rem;
        height: 20rem;
        padding: 1.8rem 2rem 1rem 1.8rem;
        background: #fff;
        border: 1px solid #eaeaea;
        text-align: left;
        box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.2);

        .title {
            margin-bottom: 3rem;
            font-size: 2rem;
            font-weight: 600;
            color: #409eff
        }
    }

}

.fade-enter-active,
.fade-appear-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-appear-from {
    opacity: 0;
}

.fade-enter-to,
.fade-appear-to {
    opacity: 1;
}
</style>