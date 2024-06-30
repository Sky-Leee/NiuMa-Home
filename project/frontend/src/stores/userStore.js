import { defineStore } from 'pinia'
import { setToken, getToken, clearToken } from '@/utils/token'
import { reqLogin, reqRegister, reqSendMail, reqRePwd, reqGetUserByToken } from '@/api/user.js'
import { reqSendChat, reqGetChat, reqConfirmNotify, reqToken, reqUpdateUser, reqGetPostInfo, reqGetFollowingInfo, reqFollowing, reqGetUserById } from '@/api/user.js'
export const userStore = defineStore('user', {
    state: () => {
        return {
            userInfo: { user_id: '', username: '', nickname: '', sex: '', likes: [], posts: [], postTotal: '', followers: [], following: [] },
            userHeaderInfo: { user_id: '', username: '', nickname: '', likes: [], posts: [], postTotal: '', followers: [], following: [], unread: [], read: [], chatSend: [], chatReceive: [] },
            token: getToken(),
            isToken: false,
            followingInfo: {},
            followersInfo: {},
            followingHeaderInfo: {},
            followersHeaderInfo: {},
            chatsInfo: [],
            tempTo: '',
        }
    },
    getters: {
        posts: (state) => state.userInfo.posts || [],
        followers: (state) => state.userInfo.followers || [],
        following: (state) => state.userInfo.following || [],

        userWhoHasChat: (state) => {
            // 合并
            const allChats = [
                ...state.userHeaderInfo.chatSend,
                ...state.userHeaderInfo.chatReceive,
            ];

            // 使用 Set uniqueIdsSet 来跟踪已经出现过的用户 ID，确保不重复添加相同的用户 ID
            const uniqueIdsSet = new Set();
            const uniqueChats = [];

            // 将唯一的用户对象添加到 uniqueChats 数组中
            for (const chat of allChats) {
                if (!uniqueIdsSet.has(chat.sender._id)) {
                    uniqueIdsSet.add(chat.sender._id);
                    uniqueChats.push(chat.sender);
                }

                if (!uniqueIdsSet.has(chat.to._id)) {
                    uniqueIdsSet.add(chat.to._id);
                    uniqueChats.push(chat.to);
                }
            }

            //  过滤掉与当前用户 ID 相同的对象
            // const filteredChats = uniqueChats.filter((chat) => chat._id !== state.userHeaderInfo._id);

            return uniqueChats;
        },
    },

    actions: {
        // 登录
        async userLogin(data) {
            let result = await reqLogin(data)
            if (result.code == 1000) {
                this.userInfo.user_id = result.data.user_id
                this.userInfo.username = result.data.email
                this.userInfo.nickname = result.data.user_name
                this.userInfo.avatar = result.data.avatar
                this.userInfo.sex = result.data.gender
                
                this.userHeaderInfo.user_id = result.data.user_id
                this.userHeaderInfo.username = result.data.email
                this.userHeaderInfo.nickname = result.data.user_name
                this.userHeaderInfo.avatar = result.data.avatar
                this.userHeaderInfo.sex = result.data.gender
                this.userHeaderInfo.introduce = result.data.intro
                localStorage.setItem('login result', JSON.stringify(result.data));
                setToken(result.data.access_token, result.data.refresh_token);
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 注册
        async userRegister(data) {
            let result = await reqRegister(data)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 退出登录
        logout() {
            clearToken()
            localStorage.removeItem('login result')
        },

        // 发送邮件
        async userSendMail(data) {
            let result = await reqSendMail(data)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 找回密码
        async userRePwd(data) {
            let result = await reqRePwd(data)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 获取用户信息
        async getUserInfoByToken() {
            // this.userHeaderInfo = { likes: [], posts: [], followers: [], following: [], unread: [], read: [], chatSend: [], chatReceive: [], username: 'default' }
            let result = await reqGetUserByToken()
            if (result.code == 1000) {
                this.userHeaderInfo.user_id = result.data.user_id
                this.userHeaderInfo.username = result.data.email
                this.userHeaderInfo.nickname = result.data.username
                this.userHeaderInfo.avatar = result.data.avatar
                this.userHeaderInfo.sex = result.data.gender
                this.userHeaderInfo.introduce = result.data.intro

                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        async verifyToken() {
            let result = await reqToken()
            if (result.code == 1000) {
                this.isToken = result.data
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        async getUserInfoById(id) {
            let result = await reqGetUserById(id)
            if (result.code == 1000) {
                this.userInfo.user_id = result.data.user_id
                this.userInfo.username = result.data.email
                this.userInfo.nickname = result.data.username
                this.userInfo.avatar = result.data.avatar
                this.userInfo.sex = result.data.gender
                this.userInfo.introduce = result.data.intro

                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        async getUserPostInfo(params) {
            let result = await reqGetPostInfo(params)
            if (result.code == 1000) {
                this.userInfo.posts = result.data.posts
                this.userInfo.postTotal = result.data.total
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        //  更新用户信息
        async updateUser(data) {
            let result = await reqUpdateUser(data)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 获取关注列表
        async getFollowingInfo(data) {
            let result = await reqGetFollowingInfo(data)
            if (result.code == 1000) {
                this.followingInfo = result.data
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 获取粉丝列表
        async getFollowersInfo(data) {
            let result = await reqGetFollowingInfo(data)
            if (result.code == 1000) {
                this.followersInfo = result.data
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 获取本人关注列表
        async getFollowingHeaderInfo(data) {
            let result = await reqGetFollowingInfo(data)
            if (result.code == 1000) {
                this.followingHeaderInfo = result.data
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 获取本人粉丝列表
        async getFollowersHeaderInfo(data) {
            let result = await reqGetFollowingInfo(data)
            if (result.code == 1000) {
                this.followersHeaderInfo = result.data
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 关注/取关
        async followUser(userId, followerId) {
            let result = await reqFollowing(userId, followerId)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 确认通知
        async confirmNotify(params) {
            let result = await reqConfirmNotify(params)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 获取私信
        async getChats(params) {
            let result = await reqGetChat(params)
            if (result.code == 1000) {
                this.chatsInfo = result.data
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        // 发送私信
        async sendChat(params) {
            let result = await reqSendChat(params)
            if (result.code == 1000) {
                return result.data
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },
    }
})