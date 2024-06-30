<template>
    <transition name="fade" appear>
        <div class="home-wrap">
            <div class="top-container">
                <PostCarousel />
            </div>
            <div class="middle-container">
                <div class="left-view">
                    <div class="post-view">
                        <div class="post-header">
                            <img src="/logo.svg" alt="logo">
                            <el-select class="select" style="" size="small" v-model="tag" placeholder="Select">
                                <el-option value="全部" @click="getPostsInfo();"></el-option>
                                <el-option v-for="item in tagInfo" :key="item.community_id" :value="item.community_name"
                                    @click="getTagPostsInfo(item.community_id)" />
                            </el-select>
                            <router-link class="new-post" to="/postNew">
                                <el-button type="primary" icon="EditPen" size="small">发布新帖</el-button>
                            </router-link>

                            <p @click="orderby = 'time'; getPostsInfo();" :class="{ 'active': orderby === 'time' }">时间</p>
                            <p @click="orderby = 'score'; getPostsInfo();" :class="{ 'active': orderby === 'score' }">热度</p>
                        </div>
                        <transition-group name="list" tag="div" class="post-list">
                            <div class="post-item" v-for="item in postsInfo.posts" :key="item.post_id">
                                <!-- <el-tag>{{ item.replies.length }}</el-tag> -->
                                <router-link :to="`/post/${item.post_id}`">
                                    <p class="post-title">{{ item.title }}</p>
                                </router-link>
                                <div class="time-and-author">
                                    <p style="color: #686969;">{{ item.author_name }}</p>
                                    <p>{{ item.created_at.slice(5) }}</p>
                                </div>
                            </div>
                        </transition-group>
                        <el-empty :image-size="200" v-show="postsInfo.posts == null" description="这里什么也没有😮" />
                    </div>
                    <!-- 需要修改（后端 total 也需要修改） -->
                    <div class="pag-view" v-show="postsInfo.totalCount">
                        <el-pagination background layout="prev, pager, next" :total="postsInfo.totalCount"
                            :page-count="pageCount" :current-page="page" @current-change="handleCurrentChange" />
                    </div>
                </div>
                <div class="right-view">
                    <div class="user-info">
                        <h4 style="margin-bottom: 1rem;">用户信息</h4>
                        <div v-if="isToken">
                            <div class="user-info-top">
                                <el-avatar shape="square" :size="100" fit='fill' :src="userHeaderInfo.avatar" />
                                <div style="margin-left: 1rem;position: relative;">
                                    <h3 style="margin-bottom: 0.5rem;">{{ getCurUserName() }}</h3>
                                    <!-- <el-tag style="margin-bottom: 0.5rem;">{{ userHeaderInfo.authLevel == 0 ? '普通用户' : '管理员'
                                }}</el-tag> -->
                                </div>
                            </div>
                            <div class="user-info-bottom">
                                <el-row :gutter="10">
                                    <el-col :span="8">
                                        <el-statistic title="帖子" :value="userInfo.postTotal" />
                                    </el-col>
                                    <el-col :span="8">
                                        <el-statistic title="粉丝" :value="userHeaderInfo.followers.length" />
                                    </el-col>
                                    <el-col :span="8">
                                        <el-statistic title="关注" :value="userHeaderInfo.following.length" />
                                    </el-col>
                                </el-row>
                            </div>
                        </div>

                        <el-link v-else @click="$router.push('/user/login')">
                            登录以体验更多功能
                        </el-link>

                    </div>
                    <div class="hot-info">
                        <h4>每周热门</h4>
                        <div class="hot">
                            <h3 style="color: #686969;" v-show="postHot == null">这周还没有热帖哦~~赶紧来当热门吧！！</h3>
                            <ul>
                                <transition-group name="list" tag="div" class="host-list">
                                    <li class="hot-item" v-for="item in postHot" :key="item.post_id">
                                        <a :href="`/#/post/${item.post_id}`">{{ item.title }}</a>
                                        <el-icon style="padding-left: 1rem;">
                                            <Watermelon />
                                        </el-icon>
                                        <span style="color: #63b0ff;">{{ item.popularityScore }}</span>
                                    </li>
                                </transition-group>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </transition>
    <el-backtop :right="200" :bottom="100" />
</template>

<script setup>
import PostCarousel from '@/components/PostCarousel.vue';
import { userStore } from '@/stores/userStore.js'
import { postStore } from '@/stores/postStore.js'
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
const storeUser = userStore()
const storePost = postStore()
const { userHeaderInfo, userInfo, isToken } = storeToRefs(storeUser)
const { postsInfo, tagInfo, postHot } = storeToRefs(storePost)

let orderby = ref('time')
let page = ref(1)      // 当前在哪一页
let size = ref(20)      // 页长
let pageCount = ref(1) // 一共有多少页
let tag = ref('全部')
let tagId = ref('')

function getCurUserName() {
    const tmp = JSON.parse(localStorage.getItem('login result'))
    return tmp.user_name
}

// 获取首页文章
async function getPostsInfo() {
    let params = {
        orderby: orderby.value,
        page: page.value,
        // tagId: tagId.value
        size: size.value,
        community_id: tagId.value
    }
    await storePost.getLatestPosts(params)
    pageCount.value = Math.ceil(postsInfo.value.totalCount / size.value);
}

// 获取全部标签
async function getAllTag() {
    await storePost.getAllTag()
}

// 标签为其他
function getTagPostsInfo(tag) {
    tagId.value = tag
    page.value = 1
    getPostsInfo()
}

// 分页的回调
function handleCurrentChange(currentPage) {
    page.value = currentPage
    getPostsInfo()
    window.scroll(0, 0)
}

onMounted(async () => {
    getPostsInfo(),
        getAllTag(),
        await storePost.getHotPost()
    const params = {
        user_id: userHeaderInfo.value.user_id,
        page: 1,
        size: 1,
    }
    await storeUser.getUserPostInfo(params)
})
</script>


<style lang="less" scoped>
/* 基本样式 */
.home-wrap {
    width: 70rem;
    margin: 0 auto;
    padding: 0.5rem;
}

.top-container {
    margin-bottom: 1rem;
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
}

.middle-container {
    display: flex;
    width: 100%;
    min-height: 30rem;
    flex-direction: row;
    padding-bottom: 5rem;

    .left-view {
        width: 70%;

        .post-view {
            width: 100%;
            background-color: #fff;
            border-radius: 0.5rem 0.5rem 0 0;

            .post-header {
                display: flex;
                align-items: center;
                height: 3rem;
                border-bottom: 1px solid #e4e6eb;

                .select {
                    width: 6rem;
                    margin-left: 0.5rem;
                }

                .new-post {
                    margin-left: auto;
                }

                p {
                    padding-right: 1rem;
                    font-size: 1.15rem;
                    font-weight: 1;
                    color: #409eff;
                    cursor: pointer;
                    margin-left: 1rem;
                    position: relative;
                    /* 添加相对定位，为了使伪元素相对于这个元素定位 */
                }

                p::after {
                    content: '';
                    /* 必须设置 content 属性，否则伪元素不会显示 */
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 75%;
                    height: 2px;
                    /* 下划线的高度 */
                    background-color: transparent;
                    /* 初始状态下是透明的，点击后设置为蓝色 */
                    transition: background-color 0.3s ease;
                    /* 添加过渡效果 */
                }

                p.active::after {
                    background-color: #409eff;
                    /* 用户点击后的状态，显示蓝色下划线 */
                }


                img {
                    width: 1.5rem;
                    margin-left: 1rem;
                }
            }

            .post-item {
                position: relative;
                display: flex;
                width: auto;
                height: 4rem;
                margin: 0 1rem;
                border-bottom: 1px solid #e4e6eb;
                align-items: center;
                cursor: pointer;

                .post-title {
                    width: 30rem;
                    padding-left: 1rem;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }

                a {
                    color: black;
                    text-decoration: none;
                }

                a:visited {
                    color: #8843c0;
                }

                a:hover {
                    color: #1e80ff;
                }

                .time-and-author {
                    position: absolute;
                    right: 0;
                    font-size: small;
                    color: #a1a1a1;
                    text-align: center;
                }
            }

            .post-item:hover {
                color: #409eff;
            }
        }

        .pag-view {
            display: flex;
            justify-content: center;
            margin-top: 0.75rem;
            margin-bottom: 4rem;
            padding: 0.75rem 0;
            background-color: #fff;
            border-radius: 0 0 0.5rem 0.5rem;
        }
    }

    .right-view {
        display: flex;
        flex-direction: column;
        width: 30%;
        padding: 0 0 1rem 1rem;

        .user-info {
            padding: 1rem;
            box-sizing: border-box;
            width: 100%;
            margin-bottom: 1rem;
            background-color: #fff;
            position: relative;
            border-radius: 0.5rem 0.5rem 0 0;

            .user-info-top {
                display: flex;
            }

            .user-info-bottom {
                margin-top: 1rem;
                text-align: center;
            }
        }

        .hot-info {
            padding: 1rem;
            box-sizing: border-box;
            width: 100%;
            background-color: #fff;
            border-radius: 0 0 0.5rem 0.5rem;

            .hot {
                padding: 1rem;
                word-break: break-word;
                overflow-wrap: break-word;
                color: #616161;
                font-size: small;

                .hot-item {
                    cursor: pointer;
                    margin-bottom: 0.5rem;

                    a {
                        color: #616161;
                        text-decoration: none;
                    }

                    a:hover {
                        color: #1e80ff;
                    }
                }

                .hot-item:hover {
                    color: #1e80ff;
                }
            }
        }
    }

}

/* 动画 */
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

/* 列表动画效果 */
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.list-enter-to {
    opacity: 1;
    transform: translateY(0);
}

/* 响应式布局 - 小屏幕手机 */
@media screen and (max-width: 480px) {
    .home-wrap {
        width: 100%;
        padding: 0;
        margin-top: 1rem;
    }

    .top-container {
        display: none;
    }

    .middle-container {
        flex-direction: column;

        .left-view {
            width: 100%;

            .post-view {
                width: 100%;
                border-radius: 0;
                min-height: 100vh;

                .post-header {
                    .select {
                        padding: 0;
                    }

                    .new-post {
                        margin-left: 1rem
                    }

                    img {
                        display: none;
                    }

                    p {
                        margin-left: auto;
                    }
                }

                .post-item {
                    .post-title {
                        width: 100%;
                        padding-left: 1rem;
                        white-space: wrap;
                    }

                    .time-and-author {
                        display: none;
                    }
                }
            }

            .pag-view {
                margin: 0;
            }
        }

        .right-view {
            display: none;
        }
    }
}

/* 响应式布局 - 台式电脑和大屏幕设备 */
@media screen and (min-width: 1025px) {
    /* 保持原样式 */
}</style>