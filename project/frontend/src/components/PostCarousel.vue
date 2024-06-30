<template>
  <el-carousel height="200px" indicator-position="none">
    <el-carousel-item  v-for="(item, index) in announcementList" :key="index">
      <div class="slide">
        <img class="slide-image" :src="item.image" alt="公告图片">
        <div class="slide-overlay">
          <h2>{{ item.title }}</h2>
        </div>
      </div>
    </el-carousel-item>
  </el-carousel>
</template>

<script setup>

let announcementList = [
  { title: '公告标题1', image: '1.svg' },
  { title: '公告标题2', image: '2.svg' },
  { title: '公告标题3', image: '3.svg' },
]


</script>

<style lang="less" scoped>
.slide {
  position: relative;
  width: 100%;
  height: 100%;

  .slide-image {
    display: block;
    width: 100%;
    height: 100%;
  }

  .slide-overlay {
    position: absolute;
    height: 10rem;
    background-color: rgba(0, 0, 0, 0.35);
    top: 15rem;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }
}





h2 {
  font-size: 20px;
}
</style>