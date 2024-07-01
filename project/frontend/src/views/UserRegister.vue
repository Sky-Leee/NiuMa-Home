<template>
    <transition name="fade" appear>
        <div class="register-container">
            <!-- 注册 -->
            <el-form class="form-container" ref="ruleFormRef" :model="ruleForm" :rules="rules">
                <router-link to="/" style="float: right;color:grey;cursor: pointer;">返回</router-link>
                <div class="title">注册</div>
                <el-form-item prop="username">
                    <el-input type="text" v-model="ruleForm.username" placeholder="用户账号 邮箱" autocomplete="off"></el-input>
                </el-form-item>

                <el-form-item prop="nickname">
                    <el-input type="text" v-model="ruleForm.nickname" placeholder="用户昵称"></el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input type="password" show-password v-model="ruleForm.password" placeholder="用户密码"
                        autocomplete="off"></el-input>
                </el-form-item>

                <el-form-item prop="checkPass">
                    <el-input type="password" show-password v-model="ruleForm.checkPass" placeholder="确认密码"
                        autocomplete="off"></el-input>
                </el-form-item>


                <el-form-item prop="code">
                    <el-input style="width:10rem" maxlength="6" type="text" v-model="ruleForm.code" placeholder="验证码"
                        autocomplete="off">
                    </el-input>
                    <el-button :disabled="isDisabled" style="margin-left:2rem ;" @click="sendMail()">
                        <span v-if="!isDisabled">发送</span>
                        <span v-else style="color: rgb(174, 174, 174);">{{ countdown }}s</span>
                    </el-button>
                </el-form-item>

                <el-form-item>
                    <el-button color='#409eff' @click="submitForm(ruleFormRef)"><span
                            style="color: #fff;">注册</span></el-button>
                </el-form-item>


                <div style="margin-top: 1rem;">
                    <router-link to="/user/login" style="color: #a3a0a0;text-decoration:none;">已经有帐号了？赶紧登录！</router-link>
                </div>
            </el-form>
        </div>
    </transition>
</template>

<script setup>
import { reactive, ref, toRaw } from 'vue'
import { useRouter } from 'vue-router';
import { ElMessage, avatarEmits } from 'element-plus'
import { userStore } from '@/stores/userStore.js'
const store = userStore()
const router = useRouter()

let isDisabled = ref(false)
let countdown = ref(120)
const ruleFormRef = ref()
const ruleForm = reactive({
    username: '',
    password: '',
    checkPass: '',
    code: '',
    nickname: ''
})

const checkPass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码！'))
    } else if (value !== ruleForm.password) {
        callback(new Error("密码不一致！"))
    } else {
        callback()
    }
}

const rules = reactive({
    username: [
        { required: true, message: '请输入邮箱账号', trigger: 'blur' },
        { pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, message: '用户名必须是一个邮箱', trigger: 'blur' }
    ],
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    checkPass: [
        { validator: checkPass, trigger: 'blur' }
    ],
    code: [
        { required: true, message: '验证码不能为空！', trigger: 'blur' },
        { min: 6, max: 6, message: '长度为六位字符', trigger: 'blur' }
    ]

})

// 发送验证码
async function sendMail() {
    let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
    if (!reg.test(ruleForm.username)) {
        ElMessage({
            message: '邮箱格式错误',
            type: 'error',
        })
        return
    }
    try {
        const params = {
            email: ruleForm.username
        }
        await store.userSendMail(params)

        if (!isDisabled.value) {
            isDisabled.value = true
            startCountdown()
            countdown.value = 120
        }
        ElMessage({
            message: '发送成功！',
            type: 'success',
        })
    } catch (err) {
        ElMessage({
            message: err,
            type: 'error',
        })
    }
}

//验证码倒计时
function startCountdown() {
    const timer = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--;
        } else {
            isDisabled.value = false;
            clearInterval(timer);
        }
    }, 1000);
}

//注册
async function register() {
    try {
        // 先验证一下验证码
        const params = {
            username: ruleForm.nickname,
            password: ruleForm.password,
            re_password: ruleForm.checkPass,
            email: ruleForm.username,
            avatar: 'http://images.bluebell.skylee.top/bluebell/avatar/default/bluebell_default.png',
            code: ruleForm.code
        }
        await store.userRegister(toRaw(params))
        ElMessage({
            message: '注册成功！',
            type: 'success',
        })
        router.push('/user/login')
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
            register()
        } else {
            return false
        }
    })
}


</script>

<style lang="less" scoped>
.register-container {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin-top: -3.5rem;

    .form-container {
        border-radius: 0.25rem;
        margin: 0 auto;
        width: 20rem;
        height: 26rem;
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