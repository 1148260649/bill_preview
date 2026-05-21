import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      // 首页
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '首页', icon: 'layui-icon-home' }
      },
      // 账单管理模块
      {
        path: 'bill/bill',
        name: 'BillPanel',
        component: () => import('@/views/bill/BillPanel.vue'),
        meta: { title: '总账单看板', icon: 'layui-icon-chart' }
      },
      {
        path: 'bill/card',
        name: 'CardManage',
        component: () => import('@/views/bill/card/CardNumberQuery.vue'),
        meta: { title: '银行卡管理', icon: 'layui-icon-card' }
      },
      {
        path: 'bill/salary',
        name: 'SalaryManage',
        component: () => import('@/views/bill/salary/SalaryPanel.vue'),
        meta: { title: '工资管理', icon: 'layui-icon-dollar' }
      },
      {
        path: 'bill/family',
        name: 'FamilyManage',
        component: () => import('@/views/bill/family/Index.vue'),
        meta: { title: '家庭成员', icon: 'layui-icon-user' }
      },
      {
        path: 'bill/redEnvelope',
        name: 'RedEnvelope',
        component: () => import('@/views/bill/redEnvelope/InvestQuery.vue'),
        meta: { title: '红包/投资', icon: 'layui-icon-gift' }
      },
      {
        path: 'bill/transfer',
        name: 'TransferManage',
        component: () => import('@/views/bill/transfer/DetailQuery.vue'),
        meta: { title: '转账管理', icon: 'layui-icon-transfer' }
      },
      // 系统管理模块
      {
        path: 'system/user',
        name: 'UserManage',
        component: () => import('@/views/system/user/Index.vue'),
        meta: { title: '用户管理', icon: 'layui-icon-username' }
      },
      {
        path: 'system/role',
        name: 'RoleManage',
        component: () => import('@/views/system/role/Index.vue'),
        meta: { title: '角色管理', icon: 'layui-icon-set' }
      },
      {
        path: 'system/menu',
        name: 'MenuManage',
        component: () => import('@/views/system/menu/Index.vue'),
        meta: { title: '菜单管理', icon: 'layui-icon-menu' }
      },
      {
        path: 'system/log',
        name: 'LogManage',
        component: () => import('@/views/system/log/LoginIndex.vue'),
        meta: { title: '日志管理', icon: 'layui-icon-log' }
      },
      // 个人中心
      {
        path: 'individual/profile',
        name: 'Profile',
        component: () => import('@/views/individual/Profile.vue'),
        meta: { title: '个人资料', icon: 'layui-icon-about' }
      },
      {
        path: 'individual/message',
        name: 'Message',
        component: () => import('@/views/individual/Message.vue'),
        meta: { title: '消息中心', icon: 'layui-icon-notice' }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  next()
})

export default router
