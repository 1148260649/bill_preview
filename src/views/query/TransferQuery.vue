<template>
  <div class="transfer-query-container">
    <lay-card :bordered="false">
      <template #title>
        <h2 style="margin: 0; font-size: 18px;">转账查询</h2>
      </template>

      <div class="filter-bar">
        <lay-space :size="16">
          <lay-input 
            v-model="filters.dateRange" 
            placeholder="日期范围" 
            size="small"
            style="width: 200px"
          />
          <lay-input 
            v-model="filters.amount" 
            placeholder="金额" 
            size="small"
            style="width: 120px"
          />
          <lay-input 
            v-model="filters.counterparty" 
            placeholder="对方户名" 
            size="small"
            style="width: 150px"
          />
          <lay-button type="normal" size="small" @click="handleSearch">
            <i class="layui-icon layui-icon-search"></i> 查询
          </lay-button>
          <lay-button size="small" @click="resetFilter">
            <i class="layui-icon layui-icon-refresh"></i> 重置
          </lay-button>
          <lay-button type="normal" size="small">
            <i class="layui-icon layui-icon-export"></i> 导出 Excel
          </lay-button>
        </lay-space>
      </div>

      <lay-table :columns="columns" :data-source="paginatedRecords" :pagination="false">
        <template #transType="{ row }">
          <span :class="row.transType == '转入' ? 'tag-in' : 'tag-out'">{{ row.transType }}</span>
        </template>
      </lay-table>

      <div class="pagination">
        <div class="pagination-info">共 {{ totalRecords }} 条，第 {{ currentPage }} 页</div>
        <lay-space :size="8">
          <lay-button size="small" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</lay-button>
          <lay-button 
            v-for="page in displayPages" 
            :key="page"
            size="small"
            :type="page === currentPage ? 'normal' : 'default'"
            @click="changePage(page)"
          >
            {{ page }}
          </lay-button>
          <lay-button size="small" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</lay-button>
        </lay-space>
      </div>
    </lay-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import { LayCard, LaySpace, LayButton, LayTable, LayInput } from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = layer.msg

const columns = ref([
  { title: '交易日期', key: 'transDate', width: '120px' },
  { title: '交易时间', key: 'transTime', width: '100px' },
  { title: '交易类型', key: 'transType', width: '100px', customSlot: 'transType' },
  { title: '金额', key: 'amount', width: '120px' },
  { title: '余额', key: 'balance', width: '120px' },
  { title: '对方户名', key: 'counterparty' },
  { title: '对方账号', key: 'counterAcc' },
  { title: '摘要', key: 'summary' }
])

const currentPage = ref(1)
const pageSize = ref(10)

const filters = reactive({
  dateRange: '',
  amount: '',
  counterparty: ''
})

const records = ref([
  { transDate: '2026-05-20', transTime: '14:30:25', transType: '转入', currency: 'CNY', amount: 8500.00, balance: 156420.80, counterparty: '张三', counterAcc: '6222 0212 ****1234', summary: '工资代发' },
  { transDate: '2026-05-19', transTime: '10:15:30', transType: '转出', currency: 'CNY', amount: 2680.00, balance: 147920.80, counterparty: '李四', counterAcc: '6228 4800 ****5678', summary: '房租' },
  { transDate: '2026-05-18', transTime: '18:45:12', transType: '转入', currency: 'CNY', amount: 500.00, balance: 150600.80, counterparty: '王五', counterAcc: '6217 0002 ****9012', summary: '兼职报酬' },
  { transDate: '2026-05-15', transTime: '09:20:00', transType: '转出', currency: 'CNY', amount: 1000.00, balance: 150100.80, counterparty: '赵六', counterAcc: '6225 8800 ****3456', summary: '借款还款' },
  { transDate: '2026-05-10', transTime: '16:30:45', transType: '转入', currency: 'CNY', amount: 2000.00, balance: 151100.80, counterparty: '父母', counterAcc: '6213 8100 ****7890', summary: '生活费' },
])

const totalRecords = computed(() => records.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const filteredRecords = computed(() => {
  return records.value.filter(record => {
    if (filters.counterparty && !record.counterparty.includes(filters.counterparty)) return false
    if (filters.amount && !record.amount.toString().includes(filters.amount)) return false
    return true
  })
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatMoney = (amount: number) => amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const handleSearch = () => { currentPage.value = 1; message('查询成功', { icon: 1 }) }
const resetFilter = () => { Object.assign(filters, { dateRange: '', amount: '', counterparty: '' }) }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

onMounted(() => {
  nextTick(() => {
    // 页面初始化
  })
})
</script>

<style scoped>
.transfer-query-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.filter-bar { padding: 16px; background: #f5f6f7; margin-bottom: 16px; border-radius: 8px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.type-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.tag-income { background: #e8f6f3; color: #16baaa; }
.tag-expense { background: #ffece6; color: #ff5722; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
</style>
