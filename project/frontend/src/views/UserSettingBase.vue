<template>
    <transition name="fade" appear>
        <div class="setting-base-container">
            <h1>个人资料</h1>
            <div class="info-container">
                <el-form label-position="left" label-width="6rem" :model="userHeaderInfo" style="max-width: 460px">

                    <el-form-item label="头像">
                        <el-upload class="avatar-uploader" :show-file-list="false" :on-success="handleSuccess"
                            :on-error="handleError" :before-upload="beforeUpload" :http-request="handleUpload"
                            :name="'image'">
                            <img v-if="userHeaderInfo.avatar" :src="userHeaderInfo.avatar" class="avatar" />
                            <el-icon v-else>
                                <Plus />
                            </el-icon>
                        </el-upload>
                    </el-form-item>

                    <el-form-item label="用户名">
                        <el-input v-model="userHeaderInfo.username" disabled />
                    </el-form-item>
                    <el-form-item label="昵称">
                        <el-input v-model="userHeaderInfo.nickname" />
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-radio-group v-model="userHeaderInfo.sex" class="ml-4">
                            <el-radio label="1" size="large">男</el-radio>
                            <el-radio label="2" size="large">女</el-radio>
                            <el-radio label="3" size="large">保密</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="个人介绍">
                        <el-input v-model="userHeaderInfo.introduce" type="textarea" autosize />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="submitForm(ruleFormRef)">
                            保存
                        </el-button>

                    </el-form-item>
                </el-form>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { userStore } from '@/stores/userStore.js'
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
const store = userStore()
const router = useRouter()
const { userHeaderInfo } = storeToRefs(store)

import * as qiniu from 'qiniu-js'
import CryptoJS from 'crypto-js'

import { reqGetUploadToken } from '../api/qiniu.js'

async function submitForm() {
    try {
        let form = {
            username: userHeaderInfo.value.nickname,
            gender: Number(userHeaderInfo.value.sex),
            intro: userHeaderInfo.value.introduce,
            avatar: userHeaderInfo.value.avatar
        }
        await store.updateUser(form)
        ElMessage({
            message: '修改成功！',
            type: 'success',
        })
        router.go(0)
    } catch (err) {
        ElMessage({
            message: '修改失败',
            type: 'error',
        })
    }
}

async function handleUpload(opinion) {
    const { file } = opinion;
    const options = {
        quality: 0.50,
        noCompressIfLarger: true,
        maxWidth: 512,
        maxHeight: 512
    }
    const compressedFileBlob = (await qiniu.compressImage(file, options)).dist
    const reqRes = await reqGetUploadToken()
    const uploadToken = reqRes.data

    const currentTimestamp = Date.now().toString();
    const stringToHash = file.name + currentTimestamp;
    const hashValue = CryptoJS.SHA256(stringToHash).toString();
    //七牛信息
    const qiniuUploadInfo = {
        file: compressedFileBlob, //文件对象（压缩后）
        key: 'bluebell/avatar/' + hashValue, //文件资源名称
        token: uploadToken, //从后端获取的updateToken
    }
    const putExtra = {
        fname: file.name, // 文件原文件名
        params: {}, // 用来放置自定义变量
        mimeType: null // 用来限制上传文件类型，为 null 时表示不对文件类型限制；eg: ["image/png", 	  "image/jpeg"]
    }
    const config = {
        useCdnDomain: true,//cdn加速
        region: qiniu.region.z2 //区域
    }
    const observable = qiniu.upload(
        qiniuUploadInfo.file,
        qiniuUploadInfo.key,
        qiniuUploadInfo.token,
        putExtra,
        config
    )
    //上传开始
    observable.subscribe({
        next(res) {
            ElMessage({
                message: '上传已完成 ' + res.total.percent.toFixed(2) + ' %',
                type: 'info'
            })
        },
        error(err) {
            handleError(err)
        },
        complete(res) {//来到这里就是上传成功了。。
            handleSuccess(res)
        }
    })
}

function handleSuccess(response) {
    // 处理上传成功的响应
    const imageUrl = response.data.url;
    userHeaderInfo.value.avatar = imageUrl;
    ElMessage({
        message: '上传成功！',
        type: 'success',
    })
}
function handleError(error) {
    // 处理上传失败的响应
    ElMessage({
        message: '上传失败！' + error,
        type: 'error',
    })
}
function beforeUpload(file) {
    // 对上传的文件进行判断和限制
    const isImage = file.type.startsWith('image/');
    const fileSizeLimit = 5 * 1024 * 1024; // 5MB
    const isSizeValid = file.size <= fileSizeLimit;
    if (!isImage) {
        ElMessage({
            message: '上传失败！请选择正确的图片文件',
            type: 'error',
        })
        return false; // 阻止上传
    }
    if (!isSizeValid) {
        ElMessage({
            message: '上传失败！头像文件大小超过限制',
            type: 'error',
        })
        return false; // 阻止上传
    }
    return true; // 允许上传
}

onMounted(() => {
    document.title = '个人资料'
})

</script>

<style lang="less" scoped>
.setting-base-container {
    display: flex;
    width: 100%;
    margin: 0.5rem;
    flex-direction: column;

    .info-container {
        margin: 1rem 0;
        padding: 1rem;


        .avatar-uploader {
            .avatar {
                width: 8.5rem;
                height: 8.5rem;
                display: block;

            }
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

/* 响应式布局 - 小屏幕手机 */
@media screen and (max-width: 480px) {
    .setting-base-container {
        margin: 1rem 0;

        .info-container {
            .avatar-uploader .avatar {
                width: 5rem;
                height: 5rem;
                display: block;

            }
        }
    }
}
</style>
<style>
.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 8.5rem;
    height: 8.5rem;
    text-align: center;
}
</style>