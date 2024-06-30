<template>
  <transition name="fade" appear>
    <u-comment :config="config" @submit="submit" @like="like" @remove="remove">
      <!-- <template>导航栏卡槽</template> -->
      <!-- <template #info>用户信息卡槽</template> -->
      <!-- <template #card>用户信息卡片卡槽</template> -->
      <!-- <u-comment-nav /> -->
      <template #operate="commentItem">
        <Operate :comment="commentItem" @remove="remove" />
      </template>
    </u-comment>
  </transition>
</template>

<script>
import Operate from '@/components/Operate.vue'
import { reactive, onMounted, watchEffect } from "vue";
import { UToast, createObjectURL } from "undraw-ui";
import { storeToRefs } from "pinia";
import { commentStore } from "@/stores/commentStore.js";
import { userStore } from "@/stores/userStore.js";
import emoji from "@/assets/emoji";

// const storeComment = commentStore()

export default {
  props: {
    obj_id: {
      type: String, // 根据您的实际数据类型进行调整
      required: true,
    },
    obj_type: {
      type: Number,
      required: true,
    },
    // 其他可能的props
  },
  components: {
    Operate,
  },
  // 其他组件配置
  setup(props) {
    const config = reactive({
      user: {
        id: 1,
        username: "unknown",
        avatar:
          "http://images.bluebell.skylee.top/bluebell/avatar/default/bluebell_default.png",
        likeIds: [1, 2, 3],
      },
      emoji: emoji,
      comments: [],
      total: 10,
      showLevel: false
    });

    const storeComment = commentStore(); // 在这里导入
    const storeUser = userStore();
    const { userHeaderInfo } = storeToRefs(storeUser);

    watchEffect(() => {
      if (userHeaderInfo.value.nickname && userHeaderInfo.value.avatar) {
        // 检测到userHeaderInfo的必要属性非空
        config.user.username = userHeaderInfo.value.nickname;
        config.user.avatar = userHeaderInfo.value.avatar;
        config.user.id = userHeaderInfo.value.user_id;
      }
    });

    // Fetch comments when the component is mounted
    onMounted(async () => {
      try {
        const result = await storeComment.GetCommentList({
          obj_id: props.obj_id,
          obj_type: props.obj_type,
          orderby: "floor",
          page: 1,
          size: 20,
        });

        // 假设后端返回的数据为 response.data
        const backendCommentList = result.data.comments;
        if (backendCommentList === null) {
          return
        }

        // 映射和转换数据
        const frontendCommentList = backendCommentList.map((backendComment) => {
          // 处理单个评论对象
          const frontendComment = {
            id: backendComment.comment_id.toString(), // 转换为字符串
            parentId: backendComment.parent.toString(),
            uid: backendComment.user_id.toString(), // 转换为字符串
            address: "来自地球",
            content: backendComment.content.message,
            likes: backendComment.like,
            contentImg: null, // 需要根据后端数据结构调整
            createTime:
              backendComment.created_at +
              " " +
              backendComment.floor.toString() +
              "楼",
            user: {
              username: backendComment.user_name,
              avatar:
                backendComment.avatar,
              level: 6,
              homeLink: `/#/user/center/${backendComment.user_id}`, // 需要根据后端数据结构调整
            },
            reply: {
              total: 0,
              list: [],
            },
            isSelf: backendComment.user_id == config.user.id
          };

          if (backendComment.replies && backendComment.replies.length > 0) {
            const replyList = backendComment.replies.map((reply) => {
              // 处理单个回复对象
              const replyComment = {
                id: reply.comment_id.toString(),
                parentId: reply.parent.toString(), // 设置为当前评论的 id
                uid: reply.user_id.toString(),
                address: "来自地球",
                content: reply.content.message,
                likes: reply.like,
                contentImg: null, // 需要根据后端数据结构调整
                createTime:
                  reply.created_at + " " + reply.floor.toString() + "楼",
                user: {
                  username: reply.user_name,
                  avatar:
                    reply.avatar,
                  level: 6,
                  homeLink: `/#/user/center/${reply.user_id}`, // 需要根据后端数据结构调整
                },
                isSelf: reply.user_id == config.user.id
              };

              return replyComment;
            });
            frontendComment.reply.total = replyList.length;
            frontendComment.reply.list = replyList;
          }

          return frontendComment;
        });

        // 将转换后的评论列表设置到前端的 config 对象中
        config.comments = config.comments.concat(frontendCommentList);
      } catch (error) {
        UToast({ message: "获取评论列表失败!", type: "error" });
      }

      // 需要从后端获取
      const params = {
        like: true,
        obj_id: props.obj_id,
        obj_type: props.obj_type
      }
      try {
        const likeIds = await storeComment.GetUserLikeIDs(params)
        if (likeIds == null) {
          config.user.likeIds = []
        } else {
          config.user.likeIds = likeIds
        }
      } catch (error) {
        UToast({ message: "获取评论列表失败!", type: "error" });
      }
    });

    return {
      config,
      submit: async ({ content, parentId, files, finish, reply }) => {
        let str =
          "提交评论:" +
          content +
          ";\t父id: " +
          parentId +
          ";\t图片:" +
          files +
          ";\t被回复评论:";

        const params = {
          obj_id: props.obj_id,
          obj_type: props.obj_type,
          root: parentId === null ? '0' : parentId,
          parent: parentId === null ? '0' : parentId,
          message: content,
        };
        const comment = {
          //   id: String((temp_id += 1)),
          parentId: parentId,
          //   uid: config.user.id,
          address: "来自地球",
          content: content,
          likes: 0,
          //   createTime: "刚刚",
          user: {
            // username: config.user.username,
            avatar: config.user.avatar,
            level: 6,
            // homeLink: `/${(temp_id += 1)}`,
          },
          reply: null,
          isSelf: true,
        };
        try {
          const result = await storeComment.CreateComment(params);
          comment.id = result.data.comment_id;
          comment.uid = result.data.user_id;
          comment.user.username = config.user.username;
          comment.user.homeLink = `/#/user/center/${result.data.user_id}`;
          comment.createTime = '';
          finish(comment);
        } catch (error) {
          UToast({ message: "评论失败!", type: "error" });
        }
      },
      like: async (id, finish) => {
        try {
          const params = {
            comment_id: id,
            obj_id: props.obj_id,
            obj_type: props.obj_type
          }
          const res = await storeComment.LikeComment(params);
          finish();
        } catch (error) {
          UToast({ message: "点赞失败!", type: "error" });
        }
      },
      remove: async (id, finish) => {
        const params = {
          comment_id: id,
          obj_id: props.obj_id,
          obj_type: props.obj_type
        }
        try {
          await storeComment.RemoveComment(params)
          // finish()
          UToast({ message: "删除成功", type: "info" });
        } catch (error) {
          UToast({ message: "删除失败!", type: "error" });
        }
      }
    };
  },
};

</script>

<style lang="less" scoped>
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
</style>