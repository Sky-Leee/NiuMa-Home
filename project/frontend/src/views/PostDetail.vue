<template>
    <transition name="fade" appear>
    <div class="post-container">
        <!-- 帖子标题和数据 -->
        <div class="post-header-container">
            <div class="post-header-main">
                <div class="post-title">
                    <h1>{{ post.post.title }}</h1>
                </div>
                <div class="post-other">
                    <div><el-tag>{{ post.tag }}</el-tag></div>
                    <div>
                        <el-icon class="icon">
                            <User />
                        </el-icon>
                        {{ post.author.author_name }}
                    </div>
                    <div>
                        <el-icon class="icon">
                            <Clock />
                        </el-icon>
                        {{ post.post.created_at }}
                    </div>
                    <!-- <div>
                        <el-icon class="icon">
                            <ChatLineRound />
                        </el-icon>
                        {{ post.replies.length }}
                    </div> -->
                    <div>
                        <el-icon class="icon">
                            <Top />
                        </el-icon>
                        <!-- {{ post.likes.length }} -->
                        {{ post.post.vote_num }}
                    </div>
                    <!-- <div class="like-btn" style="margin-left: auto;">
                        <el-button @click="likePost(post._id)" :type="userHeaderInfo.likes.includes(post._id) ? 'primary' : 'success'">{{
                            userHeaderInfo.likes.includes(post._id) ? '已收藏' : '收藏' }}</el-button>
                    </div> -->
                </div>
            </div>
        </div>

        <!-- 帖子内容 -->
        <div class="post-content-container">
            <!-- <PostAuthor :author="post.author" /> -->
            <div class="post-right-container">
                <!-- 帖子详细内容 -->
                <v-md-preview :text="post.post.content"></v-md-preview>
                <!-- 帖子详细数据 -->
                <!-- <div class="post-detail-other">
                    <el-link style="color: #37a3f0;" @click="flag = -flag">回复</el-link>
                    <span class="post-time">
                        <span class="louzhu">楼主</span>
                        <span>1楼</span>
                        发表于 {{ post.post.created_at }}
                    </span>
                </div> -->
                <!-- 帖子回复区域 -->
                <!-- <div class="post-replies-container" v-show="flag == 1">
                    <div class="post-replies-input">
                        <el-input type="textarea" v-model="replyContent"></el-input>
                        <el-button @click="submitInput(replyContent)" type="primary" size="small" class="btn">发表</el-button>
                    </div>
                </div> -->
                <!-- 帖子投票区域 -->
                <div class="like-btn">
                    <hr class="divider" />
                    <el-button @click="votePost(post.post.post_id, 1)">赞成</el-button>
                    <el-button @click="votePost(post.post.post_id, -1)">反对</el-button>
                </div>
                <!-- 帖子评论内容 -->
                <div class="replies-content-container">
                    <Comment :obj_id="route.params.id" :obj_type="1" />
                </div>
            </div>
        </div>

        <!-- 回复内容 -->
        <!-- <div class="replies-content-container" v-for="(item, index) in post.replies" :key="item._id">
            <div class="replies-item">
                <PostAuthor :author="item.author" />
                <div class="replies-right-container"> -->
        <!-- 回复详细数据 -->
        <!-- <div class="replies-detail" v-show="item.parentReply">
                        <span style="margin: 0.5rem 0;color: #37a3f0;font-size: 0.8rem;">
                            #{{ item.parentReply ? item.parentReply.floorNumber + 1 : '' }}
                            {{ item.parentReply ? item.parentReply.author.nickname : '' }}:
                            <span style="color: grey;">
                                {{ item.parentReply ? item.parentReply.content : '' }}
                            </span>
                        </span>
                    </div> -->
        <!-- 回复详细内容 -->
        <!-- <div class="replies-content">{{ item.content }}</div>
                    <div class="replies-other">
                        <el-link style="color: #37a3f0;" @click="toggleFlag(index)">回复</el-link>
                        <span class="replies-time">
                            <span v-show="item.author._id == post.author._id" class="louzhu">楼主</span>
                            <span>{{ item.floorNumber + 1 }}楼</span>
                            发表于 {{ item.replyDate }}
                        </span>
                    </div> -->
        <!-- 回复的回复区域 -->
        <!-- <div class="replies-reply-detail" v-show="isFlagOpen(index)">
                        <div class="replies-input">
                            <el-input type="textarea" v-model="replyContents[index]"></el-input>
                            <el-button @click="submitInput(replyContents[index], item._id)" type="primary" size="small"
                                class="btn">发表</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->
    </div>
</transition>
</template>

<script setup>
import PostAuthor from '@/components/PostAuthor.vue';
import Comment from '@/components/Comment.vue'

import { onMounted, ref } from "vue";
import { postStore } from '@/stores/postStore.js'
import { userStore } from '@/stores/userStore.js'
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, Top } from '@element-plus/icons-vue'
const route = useRoute()
const router = useRouter()
const storePost = postStore()
const storeUser = userStore()
const { post } = storeToRefs(storePost)
const { userHeaderInfo } = storeToRefs(storeUser)

let flag = ref(-1)
let flags = ref([])
let replyContent = ref('')
let replyContents = ref([])

const toggleFlag = (index) => {
    flags.value[index] = !flags.value[index];
};

const isFlagOpen = (index) => {
    return flags.value[index];
};

async function submitInput(text, parentReply) {
    let params = {
        post: post.value._id,
        author: userHeaderInfo.value._id,
        content: text,
        parentReply,
    }
    try {
        await storePost.replyPost(params)
        ElMessage({
            message: '回复成功！',
            type: 'success'
        })
        router.go(0)
    } catch (error) {
        ElMessage({
            message: '回复失败！',
            type: 'error'
        })
    }
}

async function votePost(postId, direction) {
    let params = {
        direction: direction,
        post_id: postId
    }
    try {
        await storePost.votePost(params)
        ElMessage({
            message: '操作成功！',
            type: 'success'
        })
        // router.go(0)
    } catch (error) {
        ElMessage({
            message: error,
            type: 'error'
        })
    }
}

onMounted(async () => {
    // 获取帖子数据
    let postId = route.params.id
    let detail = ''
    try {
        detail = await storePost.getPostById(postId)
    } catch (error) {
        if (error.message == 'need login') {
            router.push('/user/login')
        } else {
            ElMessage({
                message: error,
                type: 'error'
            })
        }
        return
    }
    // 初始化flags和回复绑定的数据
    flags.value = post.value.replies.map(() => false);
    replyContents.value = post.value.replies.map(() => '');
    // 修改网页标题
    document.title = detail.post_info.title
})
</script>

<style lang="less" scoped>
/* 定义淡入动画 */
.fade-enter-active, .fade-appear-active {
    transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-appear-from {
    opacity: 0;
}
.fade-enter-to, .fade-appear-to {
    opacity: 1;
}
.post-container {
    padding-bottom: 5rem;
}

.like-btn {
  margin-left: 2rem; /* 调整这里的数值来设置按钮距离左端的宽度 */
}

.divider {
  border: 0.1px solid #ccc; /* 分割线的颜色和样式 */
  margin: 30px 0; /* 控制分割线上下的间距 */
  width: 96.5%;
}

.post-header-container {
    display: flex;
    padding: 1.8rem 0;
    background-color: #fff;

    .post-header-main {
        width: 70rem;
        margin: 0 auto;

        .post-title {
            margin-bottom: 1rem;
        }

        .post-other {
            display: flex;
            color: #616161;
        }

        .post-other>div {
            display: inline-block;
            height: 1.5rem;
            margin-right: 1.5rem;

            .icon {
                vertical-align: middle;
            }
        }
    }

}



.post-content-container {
    display: flex;
    width: 70rem;
    margin: 0 auto;
    margin-top: 1rem;
    border-radius: 0.5rem;
    background-color: #fff;


    .post-right-container {
        display: flex;
        width: 100%;
        flex-direction: column;
        padding: 1rem;

        .post-detail-content {
            width: 100%;
            min-height: 12rem;
            flex: 1;
        }

        .post-detail-other {
            width: 100%;

            .post-time {
                float: right;
                color: #999999;
            }
        }

        .post-replies-container {
            display: flex;
            flex-direction: column;
            margin: 0.5rem 0;
            padding: 0.75rem;
            border-top: 0.1rem solid #f0f0f0;
            background-color: #f2f5fa;

            .post-replies-input {
                margin-top: 0.5rem;
            }
        }
    }
}


.replies-content-container {
    width: 90%;
    margin: 0 auto;
    margin-top: 1rem;

    .replies-item {
        display: flex;
        border-radius: 0.5rem;
        background-color: #fff;

        .replies-right-container {
            display: flex;
            width: 100%;
            flex-direction: column;
            padding: 1rem;

            .replies-content {
                width: 100%;
                min-height: 12rem;
                flex: 1;
            }

            .replies-other {
                width: 100%;

                .replies-time {
                    float: right;
                    color: #999999;
                }
            }

            .replies-reply-detail {
                display: flex;
                flex-direction: column;
                margin: 0.5rem 0;
                padding: 0.75rem;
                border-top: 0.1rem solid #f0f0f0;
                background-color: #f2f5fa;

                .replies-input {
                    margin-top: 0.5rem;
                }
            }
        }

    }
}

.louzhu {
    color: rgb(255, 108, 75);
    border: 0.025rem solid rgb(255, 108, 75);
    margin-right: 0.6rem;
    padding: 0px 0.2rem;
    border-radius: 0.25rem;
    font-size: 0.6rem;
    font-weight: normal;
}

.btn {
    margin-top: 0.5rem;
    float: right;
}

/* 响应式布局 - 小屏幕手机 */
@media screen and (max-width: 480px) {
    .post-container {
        margin: 0;
    }

    .post-header-container {
        border-bottom: 2px #F8F9F9 solid;

        .post-header-main {
            width: 100%;
            padding: 0 1rem;

            .post-other {
                display: block;
            }
        }
    }

    .post-content-container {
        width: 100%;
        margin: 0;
        display: block;
        border-radius: 0;

        // border-bottom: 1px #cfcfcf solid;
        .post-right-container {
            width: auto;
        }
    }

    .replies-content-container {
        width: 100%;
        margin: 0;
        border-top: 1px #cfcfcf solid;

        .replies-item {
            display: block;
            border-radius: 0;

            .replies-right-container {
                width: auto;
            }
        }


    }

}
</style>