<template>
  <div class="page-container">
    <h2><i class="layui-icon layui-icon-transfer"></i> 转账管理</h2>

    <div class="filter-bar">
      <lay-space :size="16">
        <lay-space :size="8">
          <label>转出账户:</label>
          <lay-select v-model="filters.fromAccount" style="width: 160px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="招商银行储蓄卡" label="招商银行储蓄卡"></lay-select-option>
            <lay-select-option value="工商银行储蓄卡" label="工商银行储蓄卡"></lay-select-option>
            <lay-select-option value="支付宝" label="支付宝"></lay-select-option>
            <lay-select-option value="微信" label="微信"></lay-select-option>
          </lay-select>
        </lay-space>
        <lay-space :size="8">
          <label>转入账户:</label>
          <lay-select v-model="filters.toAccount" style="width: 160px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="招商银行储蓄卡" label="招商银行储蓄卡"></lay-select-option>
            <lay-select-option value="工商银行储蓄卡" label="工商银行储蓄卡"></lay-select-option>
            <lay-select-option value="支付宝" label="支付宝"></lay-select-option>
            <lay-select-option value="微信" label="微信"></lay-select-option>
          </lay-select>
        </lay-space>
        <lay-space :size="8">
          <label>日期:</label>
          <lay-input v-model="filters.dateRange" placeholder="日期范围" style="width: 200px" />
        </lay-space>
        <lay-button @click="handleFilter">
          <i class="layui-icon layui-icon-search"></i> 查询
        </lay-button>
      </lay-space>
    </div>

    <lay-row :gutter="[16, 16]">
      <lay-col lg="8" md="8" sm="6" xs="12">
        <lay-card title="本月转入总额" :bordered="false">
          <div class="stat-value text-success">¥85,600.00</div>
        </lay-card>
      </lay-col>
      <lay-col lg="8" md="8" sm="6" xs="12">
        <lay-card title="本月转出总额" :bordered="false">
          <div class="stat-value text-danger">¥72,300.00</div>
        </lay-card>
      </lay-col>
      <lay-col lg="8" md="8" sm="6" xs="12">
        <lay-card title="净转入" :bordered="false">
          <div class="stat-value">¥13,300.00</div>
        </lay-card>
      </lay-col>
    </lay-row>

    <lay-card title="转账记录" :bordered="false">
      <lay-table :columns="columns" :data-source="paginatedTransfers" :pagination="false"
      </lay-table>

      <div class="pagination">
        <div class="pagination-info">
          共 {{ totalTransfers }} 条，每页 {{ pageSize }} 条，第 {{ currentPage }} 页
        </div>
        <lay-space :size="8">
          <lay-button size="sm" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</lay-button>
          <lay-button 
            v-for="page in displayPages" 
            :key="page"
            size="sm"
            :type="page === currentPage ? 'primary' : undefined"
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
import { ref, computed, reactive } from 'vue'
import { LayRow, LayCol, LayCard, LayButton, LayTable, LaySelect, LaySelectOption, LayInput } from '@layui/layui-vue'
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
  { title: '对方信息', key: 'counterparty' },
  { title: '摘要', key: 'summary' },
  { title: '操作', key: 'operator', width: '150px', fixed: 'right' as const, customSlot: 'operator' }
])

const filters = reactive({
  fromAccount: '',
  toAccount: '',
  dateRange: ''
})

const selectAll = ref(false)
const selectedIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const transfers = ref([
  { id: 1, date: '2026-05-21', fromAccount: '支付宝余额', toAccount: '招商银行储蓄卡', amount: 5000, remark: '资金归集', status: 'success', statusText: '成功' },
  { id: 2, date: '2026-05-20', fromAccount: '微信零钱', toAccount: '支付宝余额', amount: 3000, remark: '转账到支付宝', status: 'success', statusText: '成功' },
  { id: 3, date: '2026-05-19', fromAccount: '招商银行储蓄卡', toAccount: '工商银行储蓄卡', amount: 10000, remark: '银行卡互转', status: 'success', statusText: '成功' },
])

const totalTransfers = computed(() => transfers.value.length)
const totalPages = computed(() => Math.ceil(totalTransfers.value / pageSize.value))
const paginatedTransfers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return transfers.value.slice(start, end)
})
const displayPages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatMoney = (amount: number) => amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
const handleFilter = () => message.success('查询成功')
const toggleSelectAll = () => { selectedIds.value = selectAll.value ? paginatedTransfers.value.map(t => t.id) : [] }
const viewDetail = (transfer: any) => message.info(`查看转账详情：${transfer.id}`)
const changePage = (page: number) => { if (page > 0) currentPage.value = page }
</script>

<style scoped>
.page-container { padding: 20px; }
.breadcrumb-bar { padding: 12px 0; }
.breadcrumb-text { font-size: 14px; color: #666; }
.breadcrumb-separator { margin: 0 8px; color: #999; }
.breadcrumb-current { color: #333; font-weight: 500; }
.filter-bar { margin-bottom: 20px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.stat-value { font-size: 24px; font-weight: 600; color: #333; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
</style>
