<template>
  <u-search :config="config" @submit="submit" />
</template>

<script>
import { reactive, onMounted } from "vue";
import { UToast, createObjectURL } from "undraw-ui";
import { postStore } from '@/stores/postStore.js'
import { useRouter } from 'vue-router';

export default {
  props: {
    // 其他可能的props
  },
  components: {

  },
  // 其他组件配置
  setup(props) {
    const config = reactive({
      search: '',
      keywords: [],
      hotSearchList: [],
    });

    const storePost = postStore(); // 在这里导入
    const router = useRouter()

    // Fetch comments when the component is mounted
    onMounted(async () => {
      try {
        // 从后端获取热词
        // 暂时用热榜代替
        const hotPostList = await storePost.getHotPost()
        for (let index = 0; index < hotPostList.length; index++) {
          const post = hotPostList[index];
          config.hotSearchList[index] = post.title
          config.keywords[index] = post.title
        }
      } catch (error) {
      }
    });

    return {
      config,
      submit: (key) => {

        router.push({
          path: '/search',
          query: {
            page: 1,
            size: 5,
            orderby: 'correlation',
            keyword: key
          }
        });
      },
    };
  },
};

</script>