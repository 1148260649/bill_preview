export const BASE_API = '/api'

// 认证接口
export const AUTH = {
  LOGIN: '/sysUser/user/login',
  LOGOUT: '/sysUser/user/logout',
  PERMISSION: '/sysUser/permission',
}

// 用户管理
export const USER = {
  QUERY_PAGE: '/sysUser/queryByPageMp',
  ADD: '/sysUser/add',
  EDIT: '/sysUser/edit',
  DELETE: '/sysUser/deleteByIdList',
}

// 账单相关
export const BILL = {
  DAY_DETAIL_QUERY: '/billDayPayDetail/queryByPageMp',
  DAY_DETAIL_ADD: '/billDayPayDetail/add',
  DAY_DETAIL_EDIT: '/billDayPayDetail/edit',
  DAY_DETAIL_DELETE: '/billDayPayDetail/deleteByIdList',
}

// 银行卡
export const CARD = {
  QUERY: '/bankCard/queryByPageMp',
  ADD: '/bankCard/add',
  EDIT: '/bankCard/edit',
}

// 家庭成员
export const FAMILY = {
  QUERY: '/familyMember/queryByPageMp',
  ADD: '/familyMember/add',
  EDIT: '/familyMember/edit',
  DELETE: '/familyMember/deleteByIdList',
}

// 工资
export const SALARY = {
  DETAIL_QUERY: '/salaryDetail/queryByPageMp',
  SUM_QUERY: '/salaryDetail/sumQuery',
}
