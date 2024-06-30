import { defineStore } from 'pinia'
import {
  CreateComment,
  LikeComment,
  reqGetAllComment,
  RemoveComment,
  GetUserLikeIDs,
} from '../api/comment'

export const commentStore = defineStore('comments', {
  state: () => {
    return {
      commentsInfo: {
        comments: [],
      },
      comment: {
        author_action: {
          liked: true,
          replied: true,
        },
        comment_id: 0,
        content: {
          message: '',
        },
        created_at: '',
        floor: 0,
        like: 0,
        obj_id: 0,
        parent: 0,
        replies: [],
        root: 0,
        type: 0,
        update_at: '',
        user_id: 0,
      },
    };
  },
  getters: {},

  actions: {
    async CreateComment(params) {
      let result = await CreateComment(params)
      if (result.code == 1000) {
        return result;
      } else {
        return Promise.reject(new Error(result.msg));
      }
    },
    async GetCommentList(params) {
      let result = await reqGetAllComment(params)
      if (result.code == 1000) {
        return result;
      } else {
        return Promise.reject(new Error(result.msg));
      }
    },
    async LikeComment(params) {
      let result = await LikeComment(params)
      if (result.code == 1000) {
        return result;
      } else {
        return Promise.reject(new Error(result.msg));
      }
    },
    async RemoveComment(params) {
      let result = await RemoveComment(params)
      if (result.code == 1000) {
        return "ok";
      } else {
        return Promise.reject(new Error(result.msg));
      }
    },
    async GetUserLikeIDs(params) {
      let result = await GetUserLikeIDs(params)
      if (result.code == 1000) {
        return result.data;
      } else {
        return Promise.reject(new Error(result.msg));
      }

    }
  },
});
