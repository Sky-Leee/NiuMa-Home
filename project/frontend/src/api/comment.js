import requests from "./ajax";

export const CreateComment = (params)=>{
    return requests({
        url: `/comment/create`, // 暂时用所有帖子替代
        method: 'post',
        data: params
    })
}

export const LikeComment = (params)=>{
    const queryParams = Object.entries(params||{})//对象转为key-value形式
    .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
    .filter(Boolean)//过滤掉空的
    .join('&')//连接
    const url = `/comment/like${queryParams ? `?${queryParams}`:''}`
    return requests({
        url,
        method: 'post',
    })
}

export const reqGetAllComment = (params)=>{
    const queryParams = Object.entries(params||{})//对象转为key-value形式
    .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
    .filter(Boolean)//过滤掉空的
    .join('&')//连接
    const url = `/comment/list${queryParams ? `?${queryParams}`:''}`
    return requests({
        url,
        method: 'get',
    })
}

export const RemoveComment = (params)=>{
    const queryParams = Object.entries(params||{})//对象转为key-value形式
    .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
    .filter(Boolean)//过滤掉空的
    .join('&')//连接
    const url = `/comment/remove${queryParams ? `?${queryParams}`:''}`
    return requests({
        url,
        method: 'delete',
    })
}

export const GetUserLikeIDs = (params)=>{
    const queryParams = Object.entries(params||{})//对象转为key-value形式
    .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
    .filter(Boolean)//过滤掉空的
    .join('&')//连接
    const url = `/comment/likeOrHateList${queryParams ? `?${queryParams}`:''}`
    return requests({
        url,
        method: 'get',
    })
}