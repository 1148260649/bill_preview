<template>
  <div class="detail-query-container">
    <lay-card :bordered="false">
      <template #title>
        <h2 style="margin: 0; font-size: 18px;">明细查询</h2>
      </template>

      <div class="filter-bar">
        <lay-space :size="16">
          <lay-input 
            v-model="filters.dateRange" 
            placeholder="日期范围" 
            size="sm"
            style="width: 200px"
          />
          <lay-select v-model="filters.account" placeholder="选择账户" size="sm" style="width: 150px">
            <lay-select-option value="" label="全部账户"></lay-select-option>
            <lay-select-option value="1" label="工商银行 ****7890"></lay-select-option>
            <lay-select-option value="2" label="建设银行 ****9012"></lay-select-option>
            <lay-select-option value="3" label="招商银行 ****6789"></lay-select-option>
          </lay-select>
          <lay-select v-model="filters.type" placeholder="交易类型" size="sm" style="width: 120px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="1" label="消费"></lay-select-option>
            <lay-select-option value="2" label="转账"></lay-select-option>
            <lay-select-option value="3" label="存款"></lay-select-option>
            <lay-select-option value="4" label="取款"></lay-select-option>
          </lay-select>
          <lay-input 
            v-model="filters.amount" 
            placeholder="金额范围" 
            size="sm"
            style="width: 150px"
          />
          <lay-button type="normal" size="sm" @click="handleSearch">
            <i class="layui-icon layui-icon-search"></i> 查询
          </lay-button>
          <lay-button size="sm" @click="resetFilter">
            <i class="layui-icon layui-icon-refresh"></i> 重置
          </lay-button>
          <lay-button type="normal" size="sm">
            <i class="layui-icon layui-icon-export"></i> 导出
          </lay-button>
        </lay-space>
      </div>

      <div class="summary-cards">
        <lay-row :gutter="[20, 20]">
          <lay-col lg="8" md="8" sm="6" xs="12">
            <lay-card :bordered="false" class="summary-card income">
              <div class="card-title">总收入</div>
              <div class="card-value">¥ 35,680.00</div>
              <div class="card-trend trend-up">
                <i class="layui-icon layui-icon-up"></i>
                <span>较上月 +12.5%</span>
              </div>
            </lay-card>
          </lay-col>
          <lay-col lg="8" md="8" sm="6" xs="12">
            <lay-card :bordered="false" class="summary-card expense">
              <div class="card-title">总支出</div>
              <div class="card-value">¥ 8,320.50</div>
              <div class="card-trend trend-down">
                <i class="layui-icon layui-icon-down"></i>
                <span>较上月 -3.2%</span>
              </div>
            </lay-card>
          </lay-col>
          <lay-col lg="8" md="8" sm="6" xs="12">
            <lay-card :bordered="false" class="summary-card net">
              <div class="card-title">净收支</div>
              <div class="card-value">¥ 27,359.50</div>
              <div class="card-trend">
                <span>本月结余</span>
              </div>
            </lay-card>
          </lay-col>
        </lay-row>
      </div>

      <lay-table :columns="columns" :data-source="paginatedDetails" :pagination="false"
      </lay-table>

      <div class="pagination">
        <div class="pagination-info">共 {{ totalDetails }} 条，第 {{ currentPage }} 页</div>
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
import { 
  LayCard, LaySpace, LayButton, LayTable,
  LayInput, LaySelect, LaySelectOption, LayTag
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = layer.msg

const columns = ref([
  { title: '交易日期', key: 'transDate', width: '120px' },
  { title: '交易时间', key: 'transTime', width: '100px' },
  { title: '账户', key: 'account', width: '180px' },
  { title: '类型', key: 'type', width: '80px', customSlot: 'type' },
  { title: '金额', key: 'amount', width: '120px', customSlot: 'amount' },
  { title: '余额', key: 'balance', width: '120px' },
  { title: '说明', key: 'description' }
])

const currentPage = ref(1)
const pageSize = ref(10)

const filters = reactive({
  dateRange: '',
  account: '',
  type: '',
  amount: ''
})

const details = ref([
  { transDate: '2026-05-21', transTime: '14:30', account: '工商银行 ****7890', type: '消费', incomeExpense: '支出', amount: 128.00, balance: 156292.80, counterparty: '永辉超市', remark: '' },
  { transDate: '2026-05-20', transTime: '10:15', account: '工商银行 ****7890', type: '转账', incomeExpense: '收入', amount: 8500.00, balance: 156420.80, counterparty: 'XX 科技公司', remark: '工资' },
  { transDate: '2026-05-19', transTime: '18:20', account: '招商银行 ****6789', type: '消费', incomeExpense: '支出', amount: 2680.00, balance: -3250.00, counterparty: '链家租房', remark: '房租' },
  { transDate: '2026-05-18', transTime: '12:30', account: '建设银行 ****9012', type: '消费', incomeExpense: '支出', amount: 56.80, balance: 45223.70, counterparty: '美团外卖', remark: '' },
  { transDate: '2026-05-17', transTime: '08:45', account: '农业银行 ****5432', type: '转账', incomeExpense: '支出', amount: 320.00, balance: 88280.00, counterparty: '中石化', remark: '加油' },
  { transDate: '2026-05-16', transTime: '20:00', account: '招商银行 ****6789', type: '消费', incomeExpense: '支出', amount: 158.00, balance: -570.00, counterparty: '万达影城', remark: '' },
  { transDate: '2026-05-15', transTime: '15:30', account: '工商银行 ****7890', type: '转账', incomeExpense: '收入', amount: 500.00, balance: 147920.80, counterparty: '设计兼职', remark: '设计费' },
])

const totalDetails = computed(() => details.value.length)
const totalPages = computed(() => Math.ceil(totalDetails.value / pageSize.value))

const filteredDetails = computed(() => {
  return details.value.filter(detail => {
    if (filters.type && detail.type !== filters.type) return false
    if (filters.account && !detail.account.includes(filters.account)) return false
    if (filters.amount && !detail.amount.toString().includes(filters.amount)) return false
    return true
  })
})

const paginatedDetails = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDetails.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatMoney = (amount: number) => amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    '消费': '#ff5722',
    '转账': '#1e9fff',
    '存款': '#16baaa',
    '取款': '#ffb800'
  }
  return colors[type] || '#d9d9d9'
}

const handleSearch = () => { currentPage.value = 1; message('查询成功', { icon: 1 }) }
const resetFilter = () => { Object.assign(filters, { dateRange: '', account: '', type: '', amount: '' }) }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

onMounted(() => {
  nextTick(() => {
    // 页面初始化
  })
})
</script>

<style scoped>
.detail-query-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.filter-bar { padding: 16px; background: #f5f6f7; margin-bottom: 16px; border-radius: 8px; }
.summary-cards { margin-bottom: 20px; }
.summary-card { border-radius: 12px; padding: 20px; color: #fff; }
.summary-card.income { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); }
.summary-card.expense { background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%); }
.summary-card.net { background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%); }
.card-title { font-size: 14px; opacity: 0.9; margin-bottom: 12px; }
.card-value { font-size: 28px; font-weight: 600; margin-bottom: 8px; }
.card-trend { font-size: 12px; opacity: 0.8; display: flex; align-items: center; gap: 4px; }
.trend-up { color: #4ecdc4; }
.trend-down { color: #ffeaa7; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
</style>
