import { defineStore } from 'pinia'
import { reqDeletePost,reqAddPost, reqGetHotPost, reqGetAllPost, reqGetPostsByKeyword, reqGetAllTag, reqGetPostById, reqReplyPost, reqVotePost } from '../api/posts'
export const postStore = defineStore('posts', {
    state: () => {
        return {
            postsInfo: {
                posts: []
            },
            post: {
                tag: { name: '' },
                author: { nickname: '', following: [], followers: [] },
                post: {},
                replies: [],
                likes: [],
            },
            tagInfo: {},
            postHot: []
        }
    },
    getters: {

    },

    actions: {
        // 获取20条帖子
        async getLatestPosts(params) {
            let result = await reqGetAllPost(params)
            if (result.code == 1000) {
                this.postsInfo.posts = result.data.posts
                this.postsInfo.totalCount = result.data.total
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        async getPostsByKeyword(params) {
            let result = await reqGetPostsByKeyword(params)
            if (result.code == 1000) {
                return result.data
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        //根据id获取帖子
        async getPostById(id) {
            let result = await reqGetPostById(id)
            if (result.code == 1000) {
                // this.post = result.data
                this.post.tag = result.data.community_info.community_name
                this.post.author = result.data.author_info
                this.post.post = result.data.post_info
                return result.data
            } else if (result.code == 1006 || result.code == 1007) {
                return Promise.reject(new Error('need login'))
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        //获取全部标签
        async getAllTag() {
            let result = await reqGetAllTag()
            if (result.code == 1000) {
                this.tagInfo = result.data
                return 'ok'
            } else {
                // return Promise.reject(new Error(result.msg))
            }
        },

        //回复帖子
        async replyPost(params) {
            let result = await reqReplyPost(params)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        //点赞帖子
        async votePost(params) {
            let result = await reqVotePost(params)
            if (result.code == 1000) {
                return 'ok'
            } else if (result.code == 1014) {
                return Promise.reject(new Error('不允许对过期的帖子投票'))
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        //获取每周热门帖子
        async getHotPost() {
            let result = await reqGetHotPost()
            if (result.code == 1000) {
                this.postHot = result.data.posts
                return this.postHot
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        //新建帖子
        async addPost(params) {
            let result = await reqAddPost(params)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },

        //删除帖子
        async deletePost(params) {
            let result = await reqDeletePost(params)
            if (result.code == 1000) {
                return 'ok'
            } else {
                return Promise.reject(new Error(result.msg))
            }
        },


    }
})