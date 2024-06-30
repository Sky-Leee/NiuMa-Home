<template>
  
</template>

<script>
import {useRouter,useRoute} from 'vue-router'
export default {
    created(){
        const router = useRouter()
        const route = useRoute()
        router.push(route.query.redirect)
    }
}
</script>

<style>

</style>