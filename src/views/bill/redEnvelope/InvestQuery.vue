<template>
  <div class="page-container">
    <lay-space :size="20" direction="vertical" fill>
      <div class="page-header">
        <h2><i class="layui-icon layui-icon-gift"></i> 红包/投资管理</h2>
        <div class="header-actions">
          <lay-button type="normal" @click="showAddModal">
            <i class="layui-icon layui-icon-add-1"></i> 新增记录
          </lay-button>
        </div>
      </div>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="6" md="6" sm="6" xs="12" v-for="(stat, index) in statsData" :key="index">
          <lay-card bordered class="stat-card">
            <div class="stat-body">
              <div class="stat-icon" :class="stat.valueClass">
                <i :class="stat.icon || 'layui-icon layui-icon-rmb'"></i>
              </div>
              <div class="stat-content">
                <div class="stat-main">
                  <lay-space :size="8">
                    <span class="stat-label">{{ stat.label }}</span>
                    <span class="stat-value" :class="stat.valueClass">{{ stat.value }}</span>
                  </lay-space>
                </div>
                <div class="stat-tip">{{ stat.tip }}</div>
              </div>
            </div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-card :bordered="false">
        <template #title>
          <lay-space :size="16">
            <lay-space :size="8">
              <label>类型:</label>
              <lay-select v-model="filters.type" style="width: 140px">
                <lay-select-option value="" label="全部"></lay-select-option>
                <lay-select-option value="income" label="红包收入"></lay-select-option>
                <lay-select-option value="expense" label="红包支出"></lay-select-option>
                <lay-select-option value="investment" label="投资"></lay-select-option>
              </lay-select>
            </lay-space>
            <lay-space :size="8">
              <label>状态:</label>
              <lay-select v-model="filters.status" style="width: 120px">
                <lay-select-option value="" label="全部"></lay-select-option>
                <lay-select-option value="1" label="已处理"></lay-select-option>
                <lay-select-option value="0" label="未处理"></lay-select-option>
              </lay-select>
            </lay-space>
            <lay-space :size="8">
              <label>日期:</label>
              <lay-input v-model="filters.dateRange" placeholder="日期范围" style="width: 200px" />
            </lay-space>
            <lay-button size="small" @click="handleFilter">
              <i class="layui-icon layui-icon-search"></i> 查询
            </lay-button>
            <lay-button size="small" @click="resetFilter">
              <i class="layui-icon layui-icon-refresh"></i> 重置
            </lay-button>
          </lay-space>
        </template>

        <lay-table :columns="columns" :data-source="paginatedRecords" :pagination="false"
        </lay-table>

        <div class="pagination">
          <div class="pagination-info">
            共 {{ totalRecords }} 条，每页 {{ pageSize }} 条，第 {{ currentPage }} 页
          </div>
          <lay-space :size="8">
            <lay-button size="small" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</lay-button>
            <lay-button 
              v-for="page in displayPages" 
              :key="page"
              size="small"
              :type="page === currentPage ? 'primary' : 'default'"
              @click="changePage(page)"
            >
              {{ page }}
            </lay-button>
            <lay-button size="small" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</lay-button>
          </lay-space>
        </div>
      </lay-card>
    </lay-space>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { LaySpace, LayRow, LayCol, LayCard, LayButton, LayTable, LaySelect, LaySelectOption, LayInput } from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = {
  success: (msg: string) => layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layer.msg(msg, { icon: 3, time: 2000 })
}

const columns = ref([
  { title: '日期', key: 'date', width: '120px' },
  { title: '类型', key: 'type', width: '100px', customSlot: 'type' },
  { title: '金额', key: 'amount', width: '120px', customSlot: 'amount' },
  { title: '来源/去向', key: 'source', width: '150px' },
  { title: '备注', key: 'remark' },
  { title: '状态', key: 'status', width: '100px' },
  { title: '操作', key: 'operator', width: '150px', fixed: 'right', customSlot: 'operator' }
])

const statsData = [
  { label: '红包收入', value: '+12,580.00', tip: '本月累计', valueClass: 'text-success' },
  { label: '红包支出', value: '-8,650.00', tip: '本月累计', valueClass: 'text-danger' },
  { label: '投资总额', value: '125,000.00', tip: '当前持仓', valueClass: '' },
  { label: '投资收益', value: '+15,680.00', tip: '累计收益', valueClass: 'text-success' }
]

const filters = reactive({
  type: '',
  status: '',
  dateRange: ''
})

const selectAll = ref(false)
const selectedIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const records = ref([
  { id: 1, date: '2026-05-21', type: 'income', typeText: '红包收入', amount: 500, source: '张三', remark: '春节红包', status: '1' },
  { id: 2, date: '2026-05-20', type: 'expense', typeText: '红包支出', amount: -200, source: '李四', remark: '结婚红包', status: '1' },
  { id: 3, date: '2026-05-19', type: 'investment', typeText: '投资', amount: -10000, source: '支付宝', remark: '基金定投', status: '1' },
  { id: 4, date: '2026-05-18', type: 'income', typeText: '红包收入', amount: 1000, source: '王五', remark: '乔迁红包', status: '1' },
  { id: 5, date: '2026-05-17', type: 'investment', typeText: '投资', amount: -5000, source: '银行 APP', remark: '银行理财', status: '0' },
])

const totalRecords = computed(() => records.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return records.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const formatMoney = (amount: number) => {
  return Math.abs(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getTypeBadge = (type: string) => {
  const badges: Record<string, string> = {
    income: 'layui-bg-red',
    expense: 'layui-bg-orange',
    investment: 'layui-bg-blue'
  }
  return badges[type] || 'layui-bg-gray'
}

const handleFilter = () => message.success('查询成功')
const resetFilter = () => {
  filters.type = ''
  filters.status = ''
  filters.dateRange = ''
  message.info('已重置')
}
const showAddModal = () => message.info('新增记录功能开发中')
const editRecord = (record: any) => message.info(`编辑记录：${record.id}`)
const toggleStatus = (record: any) => {
  record.status = record.status === '1' ? '0' : '1'
  message.success(record.status === '1' ? '已标记为已处理' : '已标记为未处理')
}
const toggleSelectAll = () => {
  selectedIds.value = selectAll.value ? paginatedRecords.value.map(r => r.id) : []
}
const changePage = (page: number) => { if (page > 0) currentPage.value = page }
</script>

<style scoped>
.page-container { padding: 20px; }
.breadcrumb-bar { padding: 12px 0; }
.breadcrumb-text { font-size: 14px; color: #666; }
.breadcrumb-separator { margin: 0 8px; color: #999; }
.breadcrumb-current { color: #333; font-weight: 500; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.header-actions { display: flex; gap: 12px; }
.stat-card { 
  background: #fff; 
  border-radius: 12px; 
  border: 1px solid #e8e8e8;
}
.stat-card .stat-body {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 20px;
}
.stat-icon { 
  width: 64px; 
  height: 64px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 32px; 
  color: #fff; 
  flex-shrink: 0; 
}
.stat-icon.text-success { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); }
.stat-icon.text-danger { background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%); }
.stat-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.stat-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.stat-label { font-size: 14px; color: #999; }
.stat-value { font-size: 28px; font-weight: 600; color: #333; }
.stat-tip { 
  font-size: 13px; 
  color: #999; 
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
}
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
</style>
