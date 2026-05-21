<template>
  <div class="layout-container">
    <div class="layout-header">
      <div class="header-left">
        <button class="layui-btn layui-btn-sm layui-btn-primary toggle-btn" @click="toggleSidebar">
          <i class="layui-icon" :class="sidebarCollapsed ? 'layui-icon-shrink-right' : 'layui-icon-spread-left'"></i>
        </button>
        <div class="logo">
          <i class="layui-icon layui-icon-chart"></i>
          <span v-if="!sidebarCollapsed">账单管理系统</span>
        </div>
      </div>
      <div class="header-right">
        <div class="header-action" @click="refreshPage">
          <i class="layui-icon layui-icon-refresh"></i>
        </div>
        <div class="header-action" @click="toggleFullscreen">
          <i class="layui-icon layui-icon-screen-full"></i>
        </div>
        <div class="header-action">
          <i class="layui-icon layui-icon-notice"></i>
          <span class="badge">3</span>
        </div>
        <div class="user-info">
          <div class="avatar">
            <i class="layui-icon layui-icon-username"></i>
          </div>
          <span v-if="!sidebarCollapsed">管理员</span>
          <i class="layui-icon layui-icon-down"></i>
        </div>
      </div>
    </div>

    <div class="layout-body">
      <div class="layout-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-menu">
          <template v-for="group in menuGroups" :key="group.title">
            <div class="menu-group-title" v-if="!sidebarCollapsed">{{ group.title }}</div>
            <div 
              v-for="menu in group.menus" 
              :key="menu.path"
              class="menu-item"
              :class="{ active: $route.path === menu.path }"
              @click="$router.push(menu.path)"
            >
              <i :class="menu.meta.icon"></i>
              <span v-if="!sidebarCollapsed">{{ menu.meta.title }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="layout-content">
        <div class="content-tabs">
          <div class="tab-item active">
            <span>{{ currentTabTitle }}</span>
            <i class="layui-icon layui-icon-close" @click="closeTab"></i>
          </div>
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)

const menuGroups = [
  {
    title: '主要功能',
    menus: [
      { path: '/dashboard', meta: { title: '首页', icon: 'layui-icon-home' } },
      { path: '/bill/bill', meta: { title: '总账单看板', icon: 'layui-icon-chart' } },
    ]
  },
  {
    title: '账单管理',
    menus: [
      { path: '/bill/card', meta: { title: '银行卡管理', icon: 'layui-icon-card' } },
      { path: '/bill/salary', meta: { title: '工资管理', icon: 'layui-icon-dollar' } },
      { path: '/bill/family', meta: { title: '家庭成员', icon: 'layui-icon-user' } },
      { path: '/bill/redEnvelope', meta: { title: '红包/投资', icon: 'layui-icon-gift' } },
      { path: '/bill/transfer', meta: { title: '转账管理', icon: 'layui-icon-transfer' } },
    ]
  },
  {
    title: '系统管理',
    menus: [
      { path: '/system/user', meta: { title: '用户管理', icon: 'layui-icon-username' } },
      { path: '/system/role', meta: { title: '角色管理', icon: 'layui-icon-set' } },
      { path: '/system/menu', meta: { title: '菜单管理', icon: 'layui-icon-menu' } },
      { path: '/system/log', meta: { title: '日志管理', icon: 'layui-icon-log' } },
    ]
  },
  {
    title: '个人中心',
    menus: [
      { path: '/individual/profile', meta: { title: '个人资料', icon: 'layui-icon-about' } },
      { path: '/individual/message', meta: { title: '消息中心', icon: 'layui-icon-notice' } },
    ]
  }
]

const currentTabTitle = computed(() => {
  return route.meta.title as string || '页面'
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const refreshPage = () => {
  router.go(0)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const closeTab = () => {
  router.push('/dashboard')
}

const handleLogout = () => {
  localStorage.removeItem('bill_token')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  padding: 0 8px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #16baaa;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-action {
  position: relative;
  padding: 8px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.header-action:hover {
  color: #16baaa;
}

.header-action .badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff5722;
  color: #fff;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f5f5;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #16baaa;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s;
  overflow: hidden;
}

.layout-sidebar.collapsed {
  width: 64px;
}

.sidebar-menu {
  padding: 16px 0;
  height: 100%;
  overflow-y: auto;
}

.menu-group-title {
  padding: 12px 20px 8px;
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.menu-item:hover {
  background: #f5f5f5;
  color: #16baaa;
}

.menu-item.active {
  background: #e8f6f3;
  color: #16baaa;
  border-right: 3px solid #16baaa;
}

.menu-item i {
  font-size: 18px;
  min-width: 18px;
}

.layout-content {
  flex: 1;
  overflow: auto;
  background: #f5f7f9;
  display: flex;
  flex-direction: column;
}

.content-tabs {
  height: 42px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item.active {
  background: #e8f6f3;
  color: #16baaa;
}

.tab-item .layui-icon-close {
  font-size: 12px;
  opacity: 0.6;
}

.tab-item .layui-icon-close:hover {
  opacity: 1;
}
</style>
