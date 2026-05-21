import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/user'
import { message } from '@layui/layui-vue'

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Bill-Auth'] = userStore.token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 成功
    if (response.status === 200) {
      return res
    }

    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      
      // 401: 未授权
      if (status === 401) {
        const userStore = useUserStore()
        userStore.logout()
        message.error('登录已过期，请重新登录')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      
      // 500: 服务器错误
      if (status === 500) {
        message.error('服务器错误')
        return Promise.reject(error)
      }
    }
    
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
