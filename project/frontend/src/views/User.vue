<template>
  <div class="user-container">
    <div class="user-top-container" v-show="$route.meta.showLogo">
        <div class="logo">牛马之家</div>
    </div>
    
    <div class="user-bottom-container">
        <router-view></router-view>
    </div>
    
  </div>
  
</template>

<script setup>

</script>

<style lang="less" scoped>

.user-container{
    display: flex;
    flex-direction: column;
    height:100vh;
    .user-top-container{
        background-color: #409eff;
        color: #fff;
        height: 15.625rem;
        .logo{
            text-align: center;
            font-size: 3rem;
            font-weight: 500;
            padding: 3.75rem 0 6.25rem;
        }
        
    }

    .user-bottom-container{
        flex: 1;
    }
}
</style>