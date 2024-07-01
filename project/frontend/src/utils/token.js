import requests from "../api/ajax";
//暴露函数
//本地存储持家化存储token
export const setToken = (access_token, refresh_token)=>{
    localStorage.setItem('access_token',access_token);
    localStorage.setItem('refresh_token',refresh_token);
 }
 
 //清除token
 export const clearToken =()=>{
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
 }
 
 
 export const getToken = ()=>{
    return 'Bearer ' + localStorage.getItem('access_token');
 }

 export const getRefreshToken = ()=>{
   return localStorage.getItem('refresh_token');
 }

 export const refreshToken = (params) => {
   const queryParams = Object.entries(params||{})//对象转为key-value形式
   .map(([key,value])=>value&&`${key}=${encodeURIComponent(value)}`)//字符转义
   .filter(Boolean)//过滤掉空的
   .join('&')//连接
   const url = `/token/refresh${queryParams ? `?${queryParams}`:''}`
   return requests({
       url,
       method: 'get',
   })
}