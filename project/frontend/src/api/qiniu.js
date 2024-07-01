import requests from "./ajax";

export const reqGetUploadToken = ()=>{
    return requests({
        url: `/qiniu/upload/gentoken`, // 暂时用所有帖子替代
        method: 'get',
    })
}