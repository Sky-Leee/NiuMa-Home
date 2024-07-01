// 二次封装axios
import axios from 'axios';
import { getToken } from '@/utils/token'
import { clearToken, getRefreshToken, refreshToken, setToken } from '../utils/token';
import router from '@/router';

const myRequest = axios.create({
    baseURL:'https://skylee.top/api/v1', // product
    // baseURL:'http://127.0.0.1:1145/api/v1', //  dev
    timeout: 5000
})
// 请求拦截器
myRequest.interceptors.request.use((config) => {
    // 是否有token
    if (getToken()) {
        config.headers.Authorization = getToken()
    }
    return config;
})

// 响应拦截器
myRequest.interceptors.response.use((res) => {
    const resp = res.data
    if (resp.code == 1007) {
        // const params = {
        //     refresh_token: getRefreshToken()
        // }
        // const data = refreshToken(params)
        // setToken(data.access_token, data.refresh_token)
        clearToken()
        router.push('/user/login')
    } else if (resp.code == 1011 || resp.code == 1012) {
        clearToken()
        router.push('/user/login')
    }
    return resp;
}, (err) => {
    return err.message;
})

export default myRequest;