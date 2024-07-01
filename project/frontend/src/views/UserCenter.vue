<template>
    <transition name="fade" appear>
        <div class="user-center-container">
            <div class="back" v-show="!isSelf">
                <span @click="gotoCenter()">&lt; 返回个人主页</span>
            </div>
            <div class="user-top">
                <div class="user-left-container">
                    <el-avatar shape="square" :size="113" fit='fill' :src="userInfo.avatar" />
                    <div class="user-info">
                        <h1>{{ userInfo.nickname ? userInfo.nickname : userInfo.username }}</h1>
                        <div class="level"><el-tag>{{ userInfo.nickname == 'root' ? '管理员' : '普通用户' }}</el-tag></div>
                        <el-button v-if="isSelf" type="primary" @click="$router.push('/user/setting/base')">修改资料</el-button>
                        <p v-else>{{ userInfo.introduce || '还没有自我介绍哦~~' }}</p>
                    </div>
                </div>
                <div class="user-right-container">
                    <el-button style="float: right;margin-right: 1rem;" v-show="!isSelf" @click="followUser(userInfo._id)"
                        :type="userHeaderInfo.following.includes(userInfo._id) ? 'primary' : 'success'" :disabled="true"
                        class="btn">
                        {{ userHeaderInfo.following.includes(userInfo._id) ? '已关注' : '关注' }}
                    </el-button>
                    <div class="user-data">
                        <el-row :gutter="50">
                            <el-col :span="8">
                                <el-statistic title="帖子" :value="total" />
                            </el-col>
                            <el-col :span="8">
                                <el-statistic title="粉丝" :value="store.followers.length" />
                            </el-col>
                            <el-col :span="8">
                                <el-statistic title="关注" :value="store.following.length" />
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </div>
            <div class="user-bottom">
                <el-tabs type="border-card" class="tabs-container">
                    <el-tab-pane label="帖子">
                        <transition-group name="list" tag="div" class="post-list">
                            <div class="posts-container" v-for="item in userInfo.posts" :key="item.post_id">
                                <div class="post-title">
                                    <router-link :to="`/post/${item.post_id}`" target="_blank">
                                        <p class="post-title">{{ item.title }}</p>
                                    </router-link>
                                </div>
                                <div class="post-content">
                                    <blockquote>
                                        <p>{{ strippedContent(item.content) }}</p>
                                    </blockquote>
                                </div>
                                <div
                                    style="position: absolute;right: 0.8rem;bottom: 0.1rem;color: #868788;text-align: right;">
                                    <el-popconfirm title="是否确认删除?" @confirm="deletePost(item.post_id)">
                                        <template #reference>
                                            <el-button v-if="isSelf" text size="small"
                                                style="margin-right: 1rem;color: #b2b2b2;">删除</el-button>
                                        </template>
                                    </el-popconfirm>

                                    <el-tag :type="item.status === 0 ? 'success' : 'warning'" class="tag-class">
                                        {{ item.status === 0 ? 'active' : 'inactive' }}
                                    </el-tag>
                                    <p id="time">{{ item.created_at }}</p>

                                </div>
                            </div>
                        </transition-group>
                        <div class="pag-view" v-show="page">
                            <el-pagination background layout="prev, pager, next" :total="total" :page-count="pageCount"
                                :current-page="page" @current-change="handleCurrentChange" />
                        </div>
                    </el-tab-pane>
                    <!-- <el-tab-pane label="收藏">
                    <div class="posts-container" v-for="item in userInfo.likes" :key="item._id">
                        <div class="post-title">
                            <router-link :to="`/post/${item._id}`" target="_blank">
                                <p class="post-title">{{ item.title }}</p>
                            </router-link>
                        </div>

                        <div style="position: absolute;right: 1rem;color: #868788;text-align: right;">

                            <el-popconfirm title="是否取消收藏?" @confirm="cancelLikePost(item._id)">
                                <template #reference>
                                    <el-button v-if="isSelf" text size="small"
                                        style="margin-right: 1rem;color: #b2b2b2;">取消收藏</el-button>
                                </template>
                            </el-popconfirm>

                            <el-tag>{{ item.tag.name }}</el-tag>
                            <p id="time">{{ item.publishDate }}</p>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="粉丝">
                    <div class="following-container" v-for="item in followersInfo" :key="item._id">
                        <el-avatar style="cursor: pointer;" @click="goToOtherCenter(item._id)" :src="item.avatar"
                            :size="60"></el-avatar>
                        <h3>{{ item.nickname || item.username }}</h3>
                        <el-button :disabled="item._id === userHeaderInfo._id" @click="followUser(item._id)"
                            :type="item.isFollowing ? 'primary' : 'success'" class="btn">
                            {{ item.isFollowing ? '已关注' : '关注' }}
                        </el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="关注">
                    <div class="following-container" v-for="item in followingInfo" :key="item._id">
                        <el-avatar style="cursor: pointer;" @click="goToOtherCenter(item._id)" :src="item.avatar"
                            :size="60"></el-avatar>
                        <h3>{{ item.nickname || item.username }}</h3>
                        <el-button :disabled="item._id === userHeaderInfo._id" @click="followUser(item._id)"
                            :type="item.isFollowing ? 'primary' : 'success'" class="btn">
                            {{ item.isFollowing ? '已关注' : '关注' }}
                        </el-button>
                    </div>
                </el-tab-pane> -->
                </el-tabs>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { userStore } from '@/stores/userStore.js'
import { postStore } from '@/stores/postStore.js'

import { storeToRefs } from 'pinia';
import { onMounted, toRaw, ref, watchEffect } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter()
const route = useRoute()
const store = userStore()
const { userInfo, userHeaderInfo, followingInfo, followersInfo } = storeToRefs(store)
let isSelf = ref(false)
let page = ref(1)      // 当前在哪一页
let size = ref(20)      // 页长
let pageCount = ref(1) // 一共有多少页
let total = ref(0) // 一共有多少帖子

//根据用户id获取用户信息
async function getUserInfoById() {
    await store.getUserInfoById(route.params.id)
}

async function getPostsInfo() {
    let params = {
        user_id: route.params.id,
        page: page.value,
        size: size.value,
    }
    await store.getUserPostInfo(params)
    total.value = userInfo.value.postTotal
    pageCount.value = Math.ceil(userInfo.value.postTotal / size.value);
}

// 分页的回调
function handleCurrentChange(currentPage) {
    page.value = currentPage
    getPostsInfo()
    window.scroll(0, 0)
}

//获取粉丝和关注
async function getFollowingInfo() {
    try {
        await new Promise((resolve) => {
            setTimeout(resolve, 200);
        });
        let following = toRaw(store.userInfo).following;
        let followers = toRaw(store.userInfo).followers;
        let followingHeader = toRaw(store.userHeaderInfo).following;
        let followersHeader = toRaw(store.userHeaderInfo).followers;
        await store.getFollowingInfo({ userIds: following });
        await store.getFollowersInfo({ userIds: followers });
        await store.getFollowingHeaderInfo({ userIds: followingHeader });
        await store.getFollowersHeaderInfo({ userIds: followersHeader });

        const followingIds = followingHeader.map((item) => item);

        followingInfo.value.forEach((item) => {
            item.isFollowing = followingIds.includes(item._id);
        });

        followersInfo.value.forEach((item) => {
            item.isFollowing = followingIds.includes(item._id);
        });

    } catch (error) {
        ElMessage({
            message: error,
            type: 'error'
        });
    }
}

//关注，取关他人
async function followUser(followerId) {
    let userId = toRaw(store.userHeaderInfo)._id;
    try {
        await store.followUser(userId, { followerId });
        ElMessage({
            message: "操作成功！",
            type: 'success'
        });
        // 刷新页面数据
        router.go(0)
    } catch (error) {
        ElMessage({
            message: error,
            type: 'error'
        });
    }
}

// 去其他人主页
function goToOtherCenter(id) {
    router.push(`/user/center/${id}`)
}

// 回到个人主页
function gotoCenter() {
    router.push(`/user/center/${toRaw(store.userHeaderInfo).user_id}`)
}

// 删除帖子
async function deletePost(id) {
    try {
        const params = {
            post_id: id
        }
        await postStore().deletePost(params)
        ElMessage({
            type: 'success',
            message: '删除成功'
        })
        getUserInfoById()
        // getFollowingInfo()
    } catch (error) {
        ElMessage({
            type: 'error',
            message: error
        })
    }
}

// 取消收藏帖子
async function cancelLikePost(postId) {
    let params = {
        userId: userHeaderInfo.value._id,
        postId
    }
    try {
        await postStore().likePost(params)
        ElMessage({
            message: '操作成功！',
            type: 'success'
        })
        getUserInfoById()
        getFollowingInfo()
    } catch (error) {
        ElMessage({
            message: '操作失败！',
            type: 'error'
        })
    }
}
onMounted(() => {
    // getUserInfoById()
    getPostsInfo()
    // getFollowingInfo()
    // 修改网页标题
    setTimeout(() => {
        document.title = (userInfo.value.nickname) + ' 的个人主页'
    }, 1000)
})

function strippedContent(rawContent) {
    // Remove Markdown image syntax
    let stripped = rawContent.replace(/!\[.*?\]\(.*?\)/g, '');
    // 移除图片: ![...](...)
    stripped = stripped.replace(/!\[(.*?)\]\((.*?)\)/g, '');
    // 移除链接: [...](...)
    stripped = stripped.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
    // 移除加粗: **...** 或 __...__
    stripped = stripped.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '$1$2');
    // 移除斜体: *...* 或 _..._
    stripped = stripped.replace(/\*(.*?)\*|_(.*?)_/g, '$1$2');
    // 移除删除线: ~~...~~
    stripped = stripped.replace(/~~(.*?)~~/g, '$1');
    // 移除代码块: ```...``` 或 `...`
    stripped = stripped.replace(/```(.*?)```|`(.*?)`/gs, '$1$2');
    // 移除块引用: > ...
    stripped = stripped.replace(/^>\s?/gm, '');
    // 移除无序列表符号: -* 或 - 或 * 或 +
    stripped = stripped.replace(/^\s*[*\-+]\s/gm, '');
    // 移除有序列表符号: 1. ...
    stripped = stripped.replace(/^\s*\d+\.\s/gm, '');
    // 移除标题标记: # ...
    stripped = stripped.replace(/^#+\s?/gm, '');

    return stripped;
}

watchEffect(() => {
    if (route.params.id) {
        getUserInfoById()
        // getFollowingInfo()
    }
    if (route.params.id == store.userHeaderInfo.user_id) {
        isSelf.value = true
    } else {
        isSelf.value = false
    }
})

</script>

<style lang="less" scoped>
.user-center-container {
    width: 70rem;
    border-radius: 0.25rem;
    margin: 0 auto;
    margin-top: 1rem;
    margin-bottom: 5rem;
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.2);

    .back {
        background-color: #fff;
        width: 55rem;
        padding: 1.8rem auto;
        border-radius: 0.25rem;
        border-bottom: 0.1rem solid #f0f0f0;
        height: 3rem;
        display: flex;
        align-items: center;
        box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.2);

        span {
            cursor: pointer;
            color: #409eff;
            margin-left: 1rem;
            font-size: 1.25rem;
        }

        span:hover {
            color: #2e74bb;
        }
    }

    .user-top {
        display: flex;
        height: 7rem;
        flex-direction: row;
        padding: 1.25rem 0;
        background-color: #fff;
        border-radius: 0.25rem;

        .user-left-container {
            width: 100%;
            flex: 1 1 0%;
            display: flex;
            margin: 0 1.25rem;

            .user-info {
                flex: 1 1 0%;
                margin-left: 1rem;

                h1 {
                    margin-bottom: 0.5rem;
                }

                .level {
                    margin-bottom: 10px;
                }
            }
        }

        .user-right-container {
            width: 18rem;
            height: 100%;
            position: relative;

            .user-data {
                position: absolute;
                bottom: 0;
                right: 2rem;
            }
        }
    }

    .user-bottom {
        width: 100%;
        background-color: #fff;
        border-radius: 0.25rem;

        .tabs-container {
            height: 100%;

            .following-container {
                display: flex;
                align-items: center;
                height: 5rem;
                border-bottom: 0.05rem solid #f0f0f0;

                .btn {
                    position: absolute;
                    right: 1rem;
                }

                h3 {
                    padding-left: 1rem;
                    line-height: 4rem;
                }
            }

            .posts-container {
                position: relative;
                /* 这将成为下面绝对定位元素的参考点 */
                display: block;
                border-bottom: 0.05rem solid #f0f0f0;
                padding: 1rem 0;
            }

            .post-title,
            .post-content {
                margin-bottom: 0.5rem;
                /* 为标题和内容添加底部边距 */
            }

            .post-title a {
                color: black;
                text-decoration: none;
                font-size: 1.25rem;
                /* 可以根据你的设计调整 */
            }

            .post-title:hover a {
                cursor: pointer;
                color: #409eff;
            }

            .post-title:visited a {
                cursor: pointer;
                color: #f0f0f0;
            }

            .post-content blockquote {
                padding: 0.5rem 1rem;
                margin: 1rem 0 3rem;
                /* 调整第三个值以设置底部间距 */
                border-left: 4px solid #dfe2e5;
                /* Markdown样式的左边框 */
                background-color: #f8f8f8;
                /* 轻微背景色 */
                color: #666;
                /* 修改字体颜色 */
            }

            /* 你可以进一步调整块引用p标签的样式，如果需要的话 */
            .post-content blockquote p {
                margin: 0.2rem;
                color: inherit;
                /* 这将使p标签继承blockquote的字体颜色 */
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

        .tabs-container>.el-tabs__content {
            padding: 32px;
            color: #6b778c;
            font-size: 32px;
            font-weight: 600;
        }

        .tabs-container .custom-tabs-label .el-icon {
            vertical-align: middle;
        }

        .tabs-container .custom-tabs-label span {
            vertical-align: middle;
            margin-left: 4px;
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
    .user-center-container {
        width: 100%;
        margin: 0;
        box-shadow: none;

        .user-top {
            .user-right-container {
                .user-data {
                    display: none;
                }
            }
        }
    }

    #time {
        display: none;
    }
}
</style>