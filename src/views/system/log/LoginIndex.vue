<template>
  <div class="login-log-container">
    <lay-card :bordered="false">
      <template #title>
        <h2 style="margin: 0; font-size: 18px;">登录日志</h2>
      </template>

      <div class="filter-bar">
        <lay-space :size="16">
          <lay-input 
            v-model="filters.username" 
            placeholder="用户名" 
            size="sm"
            style="width: 150px"
          />
          <lay-input 
            v-model="filters.ip" 
            placeholder="IP 地址" 
            size="sm"
            style="width: 150px"
          />
          <lay-select v-model="filters.status" placeholder="状态" size="sm" style="width: 100px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="1" label="成功"></lay-select-option>
            <lay-select-option value="0" label="失败"></lay-select-option>
          </lay-select>
          <lay-button type="normal" size="sm" @click="handleSearch">
            <i class="layui-icon layui-icon-search"></i> 查询
          </lay-button>
          <lay-button size="sm" @click="resetFilter">
            <i class="layui-icon layui-icon-refresh"></i> 重置
          </lay-button>
        </lay-space>
      </div>

      <lay-table :columns="columns" :data-source="paginatedLogs" :pagination="false" />


      <div class="pagination">
        <div class="pagination-info">共 {{ totalLogs }} 条，第 {{ currentPage }} 页</div>
        <lay-space :size="8">
          <lay-button size="sm" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</lay-button>
          <lay-button 
            v-for="page in displayPages" 
            :key="page"
            size="sm"
            :type="page === currentPage ? 'normal' : undefined"
            @click="changePage(page)"
          >
            {{ page }}
          </lay-button>
          <lay-button size="sm" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</lay-button>
        </lay-space>
      </div>
    </lay-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import { LayCard, LaySpace, LayButton, LayTable, LayInput, LaySelect, LaySelectOption } from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = layer.msg

const columns = ref([
  { title: '日志 ID', key: 'infoId', width: '100px' },
  { title: '用户名', key: 'userName', width: '120px' },
  { title: '登录地址', key: 'ipaddr', width: '150px' },
  { title: '登录地点', key: 'loginLocation', width: '150px' },
  { title: '浏览器', key: 'browser' },
  { title: '操作系统', key: 'os' },
  { title: '状态', key: 'status', width: '80px' },
  { title: '登录时间', key: 'loginTime', width: '180px' }
])

const currentPage = ref(1)
const pageSize = ref(10)

const filters = reactive({
  username: '',
  ip: '',
  status: ''
})

const logs = ref([
  { infoId: 1, userName: 'admin', ipaddr: '192.168.1.100', loginLocation: '浙江省 杭州市', browser: 'Chrome 120.0', os: 'Windows 10', status: '1', msg: '登录成功', loginTime: '2026-05-21 09:30:00' },
  { infoId: 2, userName: 'zhangsan', ipaddr: '192.168.1.101', loginLocation: '北京市', browser: 'Firefox 115.0', os: 'macOS 14.0', status: '1', msg: '登录成功', loginTime: '2026-05-21 10:15:00' },
  { infoId: 3, userName: 'lisi', ipaddr: '192.168.1.102', loginLocation: '上海市', browser: 'Safari 17.0', os: 'iOS 17.0', status: '0', msg: '密码错误', loginTime: '2026-05-21 11:20:00' },
  { infoId: 4, userName: 'wangwu', ipaddr: '192.168.1.103', loginLocation: '广东省 深圳市', browser: 'Edge 120.0', os: 'Windows 11', status: '1', msg: '登录成功', loginTime: '2026-05-21 14:45:00' },
  { infoId: 5, userName: 'admin', ipaddr: '192.168.1.100', loginLocation: '浙江省 杭州市', browser: 'Chrome 120.0', os: 'Windows 10', status: '1', msg: '登录成功', loginTime: '2026-05-20 18:30:00' },
])

const totalLogs = computed(() => logs.value.length)
const totalPages = computed(() => Math.ceil(totalLogs.value / pageSize.value))

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (filters.username && !log.userName.includes(filters.username)) return false
    if (filters.ip && !log.ipaddr.includes(filters.ip)) return false
    if (filters.status && log.status !== filters.status) return false
    return true
  })
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const handleSearch = () => { currentPage.value = 1; message('查询成功', { icon: 1 }) }
const resetFilter = () => { Object.assign(filters, { username: '', ip: '', status: '' }) }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

onMounted(() => {
  nextTick(() => {
    // 页面初始化
  })
})
</script>

<style scoped>
.login-log-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.filter-bar { padding: 16px; background: #f5f6f7; margin-bottom: 16px; border-radius: 8px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status-success { background: #e8f6f3; color: #16baaa; }
.status-error { background: #ffece6; color: #ff5722; }
</style>
