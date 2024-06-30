<template>
    <div class="post-author-container">
        <el-popover placement="right" :width="300" trigger="hover">
            <template #reference>
                <a :href="`/#/user/center/${post.author.author_id}`" target="_blank">
                    <el-avatar class="big-avatar" :src="author.avatar" shape="square" :size="125"></el-avatar>
                    <el-avatar class="small-avatar" :src="author.avatar" shape="square" :size="55"></el-avatar>
                </a>
            </template>
            <!-- <div class="hover-info">
                <div style="display: flex;">
                    <el-avatar :src="author.avatar" shape="square" :size="80"></el-avatar>
                    <div style="padding-left: 1rem;">
                        <span style="font-size: 1.2rem;font-weight: 600;">{{ author.nickname }}</span>
                        <div>
                            <el-tag style="width: 50%;">lv {{ author.level }}</el-tag>
                        </div>
                        <div style="margin-top: 0.5rem;color: rgb(136, 136, 136);">
                            关注：{{ author.following.length }}
                            粉丝：{{ author.followers.length }}
                        </div>
                    </div>
                </div>

                <div style="margin-top: 1rem;width: 100%;">
                    <el-button @click="chatWithPeople(author._id)" style="width: 100%;" type="primary">私信</el-button>
                </div>

            </div> -->
        </el-popover>
        <!-- <h3 class="author-nickname">{{ author.nickname }}</h3> -->
        <h3 class="author-nickname">{{ author.author_name }}</h3>
        <!-- <el-tag class="author-level">Lv {{ author.level }}</el-tag> -->
    </div>
</template>

<script setup>
import { postStore } from '@/stores/postStore.js'
import { userStore } from '@/stores/userStore.js'
import { storeToRefs } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus'
const storePost = postStore()
const storeUser = userStore()
const { userHeaderInfo } = storeToRefs(storeUser)
const { post } = storeToRefs(storePost)
const props = defineProps({
    author: Object
});

function chatWithPeople(toId) {
    ElMessageBox.prompt('输入你要发送的内容', '私信', {
        confirmButtonText: '发送',
        cancelButtonText: '取消',
    })
        .then(async ({ value }) => {
            const params = {
                message: value,
                sender: userHeaderInfo.value._id,
                to: toId
            }
            await storeUser.sendChat(params)
            ElMessage({
                type: 'success',
                message: `发送成功`,
            })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '取消了操作',
            })
        })
}
</script>

<style lang="less" scoped>
.post-author-container {
    padding: 1rem;
    border-radius: 0.5rem 0 0 0.5rem;
    text-align: center;
    background-color: #f2f5fa;

    .small-avatar {
        display: none;
    }

    .hover-info {
        display: flex;
    }

    .author-level {
        width: 9.375rem;
        margin-top: 1rem;
    }
}

/* 响应式布局 - 小屏幕手机 */
@media screen and (max-width: 480px) {
    .post-author-container {
        padding: 0.5rem;
        display: flex;
        background-color: #fff;
        border-bottom: 1px #f0f0f0 dashed;

        .big-avatar {
            display: none;
        }

        .small-avatar {
            display: block;
        }

        .author-nickname {
            padding: 1rem;
        }

        .author-level {
            width: 3rem;
        }
    }
}</style>
