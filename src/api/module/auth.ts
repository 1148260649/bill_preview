import request from '../../utils/request.ts'
import { AUTH } from '../requestUrlConfig.ts'

export interface LoginParams {
  username?: string
  password?: string
  phone?: string
  code?: string
  type: 'username' | 'phone'
}

export interface LoginResponse {
  token: string
  userInfo: any
  menus?: any[]
}

// 用户登录
export function login(params: LoginParams): Promise<LoginResponse> {
  return request.post(AUTH.LOGIN, params)
}

// 用户登出
export function logout() {
  return request.post(AUTH.LOGOUT)
}

// 获取权限信息
export function getPermission() {
  return request.get(AUTH.PERMISSION)
}
