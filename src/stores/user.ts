import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  phone?: string
  email?: string
  gender?: number
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  menus: any[]
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const menus = ref<any[]>([])
  const permissions = ref<string[]>([])

  // 登录
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('bill_token', newToken)
  }

  // 设置用户信息
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  // 设置菜单
  function setMenus(newMenus: any[]) {
    menus.value = newMenus
  }

  // 退出登录
  function logout() {
    token.value = null
    userInfo.value = null
    menus.value = []
    permissions.value = []
    localStorage.removeItem('bill_token')
  }

  // 初始化
  function initFromStorage() {
    const savedToken = localStorage.getItem('bill_token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return {
    token,
    userInfo,
    menus,
    permissions,
    setToken,
    setUserInfo,
    setMenus,
    logout,
    initFromStorage
  }
})
