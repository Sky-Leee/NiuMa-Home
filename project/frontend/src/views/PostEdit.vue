<template>
  <transition name="fade" appear>
    <div class="edit-container">
      <el-form style="padding: 1rem;" :model="form" label-width="4rem" :rules="rules" ref="ruleFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="标签" prop="community_id">
          <el-select v-model="form.community_id" style="width: 10rem;" placeholder="请选择标签">
            <el-option v-for="item in tagInfo" :key="item.community_id" :value="item.community_id"
              :label="item.community_name" />
          </el-select>
        </el-form-item>
        <el-form-item class="editor-container" label="内容" style="text-align: left;">
          <!-- <wangEditor @getContent="getContent" /> -->
          <!-- <v-md-editor v-model="form.content" /> -->
          <v-md-editor :include-level="[1, 2, 3, 4]" v-model="form.content" :disabled-menus="[]"
            @upload-image="handleUploadImage" height="500px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitFormAdd(ruleFormRef)">立即创建</el-button>
          <el-button @click="$router.push('/')">返回</el-button>
        </el-form-item>
      </el-form>

    </div>
  </transition>
</template>

<script setup>
import { onMounted, ref, reactive, toRaw } from "vue";
// import wangEditor from '@/components/wangEditor.vue'

import { postStore } from '@/stores/postStore.js'
import { userStore } from '@/stores/userStore.js'
import { storeToRefs } from 'pinia';
const storePost = postStore()
const storeUser = userStore()
const { tagInfo } = storeToRefs(storePost)
const { userHeaderInfo } = storeToRefs(storeUser)

import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from "element-plus";
const router = useRouter()
const route = useRoute()

import * as qiniu from 'qiniu-js'
import CryptoJS from 'crypto-js'

import { reqGetUploadToken } from '../api/qiniu.js'

let form = reactive({
  title: '',
  content: '',
  community_id: '',
})

// let editor;

const rules = reactive({
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  community_id: [
    { required: true, message: '请勾选标签', trigger: 'change' }
  ]
})

async function handleUploadImage(event, insertImage, files) {
  // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
  const reqRes = await reqGetUploadToken()
  const uploadToken = reqRes.data
  files.forEach(async i => {
    const options = {
      quality: 0.92,
      noCompressIfLarger: true,
    }
    const compressedFileBlob = (await qiniu.compressImage(i, options)).dist
    const currentTimestamp = Date.now().toString();
    const stringToHash = i.name + currentTimestamp;
    const hashValue = CryptoJS.SHA256(stringToHash).toString();
    //七牛信息
    const qiniuUploadInfo = {
      file: compressedFileBlob, //文件对象（压缩后）
      key: 'bluebell/' + hashValue, //文件资源名称
      token: uploadToken, //从后端获取的updateToken
    }
    const putExtra = {
      fname: i.name, // 文件原文件名
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
        ElMessage({
          message: '上传失败！',
          type: 'error'
        })
      },
      complete(res) {//来到这里就是上传成功了。。
        insertImage({
          url:
            res.data.url,
          desc: res.data.file_name,
          // width: 'auto',
          // height: 'auto',
        });
      }
    })

  })
}

//提交按钮的回调
const ruleFormRef = ref()
const submitFormAdd = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      publish()
    } else {
      return false
    }
  })
}

async function publish() {
  try {
    await storePost.addPost(toRaw(form))
    ElMessage({
      message: '发表成功！',
      type: 'success',
    })
    router.replace(`/blank?redirect=/`)
  } catch (error) {
    ElMessage({
      message: '帖子内容不允许为空！',
      type: 'error',
    })
  }

}

// 自定义事件 用于从editor子组件获取数据
// function getContent(val) {
//   editor = val
//   form.content = editor.getHtml()
// }

onMounted(async () => {
  document.title = '发布新贴'
  await storePost.getAllTag()
})
</script>

<style lang="less" scoped>
.edit-container {
  width: 80rem;
  margin: 0 auto;
  margin-top: 2rem;
  margin-bottom: 7rem;
  border-radius: 1rem;
  padding: 1rem 0;
  background-color: #fff;
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
  .edit-container {
    width: 100%;
    margin: 0;
    border-radius: 0;
  }
}
</style>