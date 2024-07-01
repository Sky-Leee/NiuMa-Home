<template>
    <LakeHeader v-show="$route.meta.show" />
    <div class="wrap" style="padding-top: 4rem;">
      <router-view></router-view>
    </div>
    <LakeFooter />
</template>

<script setup>
import 'element-plus/theme-chalk/display.css'
</script>

<style lang="less">
*{
    margin: 0;
    padding: 0;
}
/* 响应式布局 - 小屏幕手机 */
@media screen and (max-width: 480px) {
  .wrap{
    height: 100vh;
    background-color: #fff;
  }
}
</style>
