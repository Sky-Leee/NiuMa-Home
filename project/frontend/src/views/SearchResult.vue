<template>
  <transition name="fade" appear>
    <div class="home-wrap">
      <div class="middle-container">
        <div class="left-view">
          <div class="post-view">
            <div class="post-header">
              <img src="/logo.svg" alt="logo">
              <router-link class="new-post" to="/postNew">
                <el-button type="primary" icon="EditPen" size="small">发布新帖</el-button>
              </router-link>

              <p @click="orderby = 'correlation'; fetchSearchResults(orderby);"
                :class="{ 'active': orderby == 'correlation' }">相关性</p>
              <p @click="orderby = 'time'; fetchSearchResults(orderby);" :class="{ 'active': orderby == 'time' }">时间</p>
            </div>
            <transition-group name="list" tag="div" class="post-list">
              <div class="post-item" v-for="item in config.postList" :key="item.post_id">
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
            <el-empty :image-size="200" v-show="config.total == 0" description="这里什么也没有😮" />
          </div>
          <div class="pag-view" v-show="config.total">
            <el-pagination background layout="prev, pager, next" :total="config.total" :page-count="pageCount"
              :current-page="page" @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { reactive, onMounted, ref } from "vue";
import { UToast } from "undraw-ui";
import { postStore } from '@/stores/postStore.js'

export default {
  props: {
    keyword: String,
    orderby: String,
    page: Number,
    size: Number,
  },

  setup(props) {
    const config = reactive({
      total: 0,
      postList: []
    });

    const storePost = postStore() // 在这里导入

    let orderby = ref('correlation')
    let page = ref(1)      // 当前在哪一页
    let size = ref(5)      // 页长
    let pageCount = ref(1) // 一共有多少页

    async function fetchSearchResults(orderby) {
      const params = {
        keyword: props.keyword,
        orderby: orderby,
        page: page.value,
        size: size.value,
      }
      try {
        const result = await storePost.getPostsByKeyword(params)
        config.total = result.total;
        config.postList = result.posts;
        pageCount.value = Math.ceil(config.total / size.value);
      } catch (error) {
        UToast({ message: "搜索失败!", type: "error" });
      }
    }

    function handleCurrentChange(currentPage) {
      page.value = currentPage
      fetchSearchResults(orderby.value)
      window.scroll(0, 0)
    }

    onMounted(async () => {
      document.title = '搜索结果'
      try {
        page.value = props.page
        size.value = props.size
        // 从后端获取搜索结果
        await fetchSearchResults(props.orderby);
      } catch (error) {
      }
    });

    return {
      config,
      fetchSearchResults,
      handleCurrentChange,
      orderby,
      page,
      size,
      pageCount,
    };
  },
};
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

  .left-view {
    width: 100%;

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
}
</style>