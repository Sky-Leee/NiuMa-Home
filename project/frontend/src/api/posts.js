import requests from "./ajax";

export const reqGetAllPost = (params) => {
    const queryParams = Object.entries(params||{})//对象转为key-value形式
    .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
    .filter(Boolean)//过滤掉空的
    .join('&')//连接
    const url = `/post/list${queryParams ? `?${queryParams}`:''}`
    return requests({
        url,
        method: 'get',
    })
}

export const reqGetPostsByKeyword = (params) => {
    const queryParams = Object.entries(params||{})//对象转为key-value形式
    .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
    .filter(Boolean)//过滤掉空的
    .join('&')//连接
    const url = `/post/search${queryParams ? `?${queryParams}`:''}`
    return requests({
        url,
        method: 'get',
    })
}

export const reqGetHotPost = ()=>{
    return requests({
        url: `/post/hot`,
        method: 'get',
    })
}

export const reqGetPostById = (id) => {
    return requests({
        url: `/post/${id}`,
        method: 'get',
    })
}

export const reqReplyPost = (params)=>{
    return requests({
        url:'/replies',
        method:'post',
        data:params
    })
}

export const reqVotePost = (params)=>{
    return requests({
        url:'/post/vote',
        method:'post',
        data:params
    })
}

export const reqGetAllTag = () => {
    return requests({
        url: '/community/list',
        method: 'get',
    })
}

export const reqAddPost = (params) => {
    return requests({
        url: '/post/create',
        method: 'post',
        data:params
    })
}

export const reqDeletePost = (params) => {
    const queryParams = Object.entries(params||{})//对象转为key-value形式
    .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
    .filter(Boolean)//过滤掉空的
    .join('&')//连接
    const url = `/post/remove${queryParams ? `?${queryParams}`:''}`
    return requests({
        url: url,
        method:'delete'
    })
}
