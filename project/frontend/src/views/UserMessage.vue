<template>
    <div class="message-container">
        <el-tabs type="border-card" class="demo-tabs">

            <el-tab-pane>
                <template #label>
                    <span>
                        系统通知
                        <span v-show="userHeaderInfo.unread.length != 0" style="color:red;">new</span>
                    </span>
                </template>

                <div class="notify-container" v-for="notification in userHeaderInfo.unread" :key="notification._id">
                    <span style="color: #1c86f0;min-width: 6rem;">新的通知：</span>
                    <div class="notify-content" style="padding: 1rem;">{{ notification.message }}</div>
                    <div class="other-info">
                        <el-icon class="check" @click="confirmNotify(notification._id)">
                            <Check />
                        </el-icon>
                        <p class="time">{{ notification.date.slice(5) }}</p>
                    </div>

                </div>
            </el-tab-pane>

            <el-tab-pane label="历史通知">
                <div class="readNotify-container" v-for="notification in userHeaderInfo.read" :key="notification._id">
                    <span style="color: #e6c537;min-width: 6rem;">历史通知：</span>{{ notification.message }}
                    <p class="time">{{ notification.date.slice(5) }}</p>
                </div>
            </el-tab-pane>

            <el-tab-pane label="私信">
                <div class="chat-container">
                    <div class="left-container">
                        <el-menu style="height: 100%;" class="el-menu-vertical-demo">
                            <el-menu-item @click="getChats(item._id)" :index="item._id"
                                v-for="item in storeUser.userWhoHasChat" :key="item._id">
                                <el-avatar style="cursor: pointer;" fit="fill" :src="item.avatar">
                                </el-avatar>
                                &nbsp;&nbsp;
                                <span class="nickname">{{ item.nickname }}</span>
                            </el-menu-item>
                        </el-menu>
                    </div>
                    <div class="right-container">
                        <h1 v-show="chatsInfo.length == 0">去找人私信吧~~</h1>
                        <div class="chat-friend" v-for="item in chatsInfo" :key="item._id"
                            :style="item.sender._id === userHeaderInfo._id ? 'flex-direction:row-reverse;' : ''">
                            <el-avatar style="width: 3rem;" :src="item.sender.avatar" :size="50"></el-avatar>
                            <div class="chat-content-container"
                                :style="item.sender._id === userHeaderInfo._id ? 'margin-right:1rem' : ''">
                                <div :class="['chat-content', { 'isMe': item.sender._id === userHeaderInfo._id }]">
                                    {{ item.message }}
                                </div>
                                <div class="time">{{ item.date.slice(5) }}</div>
                            </div>
                        </div>

                        <div class="input-container" v-show="chatsInfo.length !== 0">
                            <el-input type="textarea" v-model="chatForm">
                            </el-input>
                            <el-button @click="submitInput()" type="primary" size="small" class="btn">发表</el-button>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>



<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter()
import { userStore } from '@/stores/userStore.js'
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
const storeUser = userStore()
const { userHeaderInfo, chatsInfo, tempTo } = storeToRefs(storeUser)
const chatForm = ref('')

// 获取私信
async function getChats(senderId) {
    tempTo.value = senderId
    const params = {
        userId: userHeaderInfo.value._id,
        senderId: tempTo.value
    }
    await storeUser.getChats(params)
}

async function submitInput() {
    try {
        const params = {
            message: chatForm.value,
            sender: userHeaderInfo.value._id,
            to: tempTo.value
        }
        let temp = await storeUser.sendChat(params)
        ElMessage({
            type: 'success',
            message: '发送成功'
        })
        chatForm.value = ''
        chatsInfo.value.push(temp)
    } catch (error) {
        ElMessage({
            type: 'error',
            message: '发送失败，请重新尝试'
        })
    }
}

onMounted(async () => {
    await storeUser.getUserInfoByToken()
    setTimeout(() => {
        document.title = '消息'
    }, 100)
})
// 确认已读
async function confirmNotify(notifyId) {
    const params = {
        userId: userHeaderInfo.value._id,
        notifyId,
    }
    try {
        await storeUser.confirmNotify(params)
        ElMessage({
            type: 'success',
            message: '确认成功'
        })
        router.go(0)
    } catch (error) {
        ElMessage({
            type: 'error',
            message: '确认失败'
        })
    }
}

// 用户取消订阅通知事件（如果需要）
// socket.emit('unsubscribe', 'userId');

</script>

<style lang="less" scoped>
.message-container {
    width: 60rem;
    margin: 0 auto;
    margin-top: 1rem;
    background-color: #fff;
    box-shadow: 0 0 0.2rem grey;
    border-radius: 0.25rem;

    .demo-tabs {
        height: 100%;
        border-radius: 0.25rem;

        .notify-container {
            display: flex;
            min-height: 4rem;
            border-bottom: 0.1rem solid #f0f0f0;
            font-size: 1.15rem;
            align-items: center;

            .other-info {
                display: flex;
                min-width: 10rem;
                margin-left: auto;

                .time {
                    margin-left: 1rem;
                    font-size: 0.9rem;
                }
            }

            .check {
                color: #1c86f0;
                cursor: pointer;
            }
        }

        .readNotify-container {
            display: flex;
            min-height: 4rem;
            border-bottom: 0.1rem solid #f0f0f0;
            font-size: 1.15rem;
            color: #6b778c;
            align-items: center;

            .time {
                margin-left: auto;
                font-size: 0.9rem;
                min-width: 10rem;
            }
        }

        .chat-container {
            display: flex;

            .right-container {
                padding: 1rem;
                width: 100%;

                .chat-friend {
                    min-width: 15rem;
                    position: relative;
                    display: flex;

                    margin-top: 1rem;
                    width: 100%;

                    .chat-content-container {
                        max-width: 70%;
                        min-width: 3rem;
                        word-break: break-all;
                        border-radius: 0.25rem;
                    }

                    .chat-content {
                        position: relative;
                        border-radius: 0.25rem;
                        background-color: rgb(87, 231, 87);
                        padding: 0.5rem;
                        margin-left: 1rem;
                    }

                    .isMe {
                        background-color: skyblue;
                    }

                    .time {
                        font-size: 0.5rem;
                        margin-left: 1rem;
                    }

                }

                .input-container {
                    margin-top: 1rem;
                    width: 100%;

                    .btn {
                        margin-top: 0.5rem;
                        float: right;
                    }
                }

            }
        }
    }

    .demo-tabs>.el-tabs__content {
        padding: 32px;
        color: #6b778c;
        font-size: 32px;
        font-weight: 600;
    }

    .demo-tabs .custom-tabs-label .el-icon {
        vertical-align: middle;
    }

    .demo-tabs .custom-tabs-label span {
        vertical-align: middle;
        margin-left: 4px;
    }
}

/* 响应式布局 - 小屏幕手机 */
@media screen and (max-width: 480px) {
    .message-container {
        width: 100%;

        .demo-tabs{
            .notify-container{
                
                .notify-content{
                    flex: 1;
                }
                .other-info{
                    display: block;
                    position: absolute;
                    right: 1rem;
                    min-width: auto;
                    .time{
                        display: none;
                    }
                }
            }
            .readNotify-container{
                .time{
                    display: none;
                }
            }
            .chat-container{
                .left-container{
                    .nickname{
                        display: none;
                    }
                }
            }
        }
    }
}</style>