import io from 'socket.io-client';
import { ElNotification } from 'element-plus'
import { userStore } from '@/stores/userStore.js'
const store = userStore()
export function connectSocket(url,user) {
    // 连接到Socket.io服务器
    const socket = io(url);

    // 用户订阅通知事件
    socket.emit('subscribe', user); // 将userId替换为当前用户的唯一标识符

    // 监听新通知事件
    socket.on('newNotification', async (notification) => {
        ElNotification({
            title:'新消息',
            type: 'info',
            message: '收到了新的通知！'
        })

        await store.getUserInfoByToken()
    });

    socket.on('newChat', async (chat) => {
        ElNotification({
            title:'新消息',
            type: 'info',
            message: '收到了新的私信！'
        })
    });
}
