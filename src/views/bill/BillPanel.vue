<template>
  <div class="bill-panel-container">
    <lay-space :size="20" direction="vertical" fill>
      <div class="panel-header">
        <h2>总账单看板</h2>
        <div class="panel-tabs">
          <lay-button 
            v-for="mode in viewModes" 
            :key="mode.value"
            :type="viewMode === mode.value ? 'normal' : undefined"
            @click="switchViewMode(mode.value)"
          >
            {{ mode.label }}
          </lay-button>
        </div>
        <div class="date-picker">
          <lay-date-picker 
            v-model="selectedDate" 
            :type="datePickerType"
            placeholder="选择日期"
            size="sm"
            @change="onDateChange"
            style="width: 200px"
          />
        </div>
      </div>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="8" md="8" sm="6" xs="12" v-for="(item, index) in summaryData" :key="index">
          <lay-card bordered class="summary-card">
            <div class="card-body">
              <div class="card-icon" :class="item.class">
                <i :class="item.icon"></i>
              </div>
              <div class="card-content">
                <div class="card-main">
                  <lay-space :size="8">
                    <span class="card-label">{{ item.label }}</span>
                    <span class="card-value" :class="item.valueClass">¥ {{ item.value }}</span>
                  </lay-space>
                </div>
                <div class="card-trend" :class="item.trendClass">
                  <i v-if="item.trendIcon" :class="item.trendIcon"></i>
                  <span>{{ item.trend }}</span>
                </div>
              </div>
            </div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="16" md="16" sm="12" xs="24">
          <lay-card title="收支对比趋势" :bordered="false">
            <div ref="barChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
        <lay-col lg="8" md="8" sm="12" xs="24">
          <lay-card title="支付方式分布" :bordered="false">
            <div ref="pieChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="12" md="12" sm="12" xs="24">
          <lay-card title="支出分类占比" :bordered="false">
            <div ref="categoryChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
        <lay-col lg="12" md="12" sm="12" xs="24">
          <lay-card title="余额趋势" :bordered="false">
            <div ref="lineChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-card title="账单明细" :bordered="false">
        <template #extra>
          <lay-space :size="12">
            <div class="search-box">
              <lay-input 
                v-model="searchText" 
                placeholder="搜索备注、分类..." 
                size="sm"
                style="width: 240px"
                @keyup.enter="handleSearch"
              />
              <lay-button size="sm" @click="handleSearch">
                <i class="layui-icon layui-icon-search"></i>
              </lay-button>
            </div>
            <lay-button type="normal" @click="showAddBill">
              <i class="layui-icon layui-icon-add-1"></i> 记一笔
            </lay-button>
          </lay-space>
        </template>

        <div class="filter-bar">
          <lay-space :size="16">
            <lay-space :size="8">
              <span>类型:</span>
              <lay-select v-model="filters.type" size="sm" style="width: 120px">
                <lay-select-option value="" label="全部"></lay-select-option>
                <lay-select-option value="收入" label="收入"></lay-select-option>
                <lay-select-option value="支出" label="支出"></lay-select-option>
              </lay-select>
            </lay-space>
            <lay-space :size="8">
              <span>分类:</span>
              <lay-select v-model="filters.category" size="sm" style="width: 120px">
                <lay-select-option value="" label="全部"></lay-select-option>
                <lay-select-option v-for="cat in categories" :key="cat" :value="cat" :label="cat"></lay-select-option>
              </lay-select>
            </lay-space>
            <lay-button type="normal" size="sm" @click="handleFilter">
              <i class="layui-icon layui-icon-search"></i> 查询
            </lay-button>
            <lay-button size="sm" @click="resetFilter">
              <i class="layui-icon layui-icon-refresh"></i> 重置
            </lay-button>
          </lay-space>
        </div>

        <lay-table 
          :columns="columns" 
          :data-source="paginatedBills" 
          :pagination="false"
        >
          <template #type="{ row }">
            <span class="type-tag" :class="row.type === '收入' ? 'tag-income' : 'tag-expense'">
              {{ row.type }}
            </span>
          </template>
          <template #category="{ row }">
            <span class="category-tag">{{ row.category }}</span>
          </template>
          <template #amount="{ row }">
            <span :class="row.type === '支出' ? 'text-danger' : 'text-success'" style="font-weight: 600;">
              {{ row.type === '支出' ? '-' : '+' }}{{ formatMoney(row.amount) }}
            </span>
          </template>
          <template #operator="{ row }">
            <lay-button size="sm" @click="editBill(row)">
              <i class="layui-icon layui-icon-edit"></i>
            </lay-button>
            <lay-button size="sm" type="danger" @click="deleteBill(row)">
              <i class="layui-icon layui-icon-delete"></i>
            </lay-button>
          </template>
        </lay-table>

        <div class="pagination">
          <div class="pagination-info">
            共 {{ totalBills }} 条，第 {{ currentPage }} 页
          </div>
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
    </lay-space>

    <lay-layer v-model="showBillModal" :title="editMode ? '编辑账单' : '记一笔'" :area="['600px', 'auto']">
      <lay-form :model="billForm" :label-width="80" style="padding: 8px 0;">
        <lay-form-item label="类型" required>
          <div class="type-selector">
            <lay-button 
              :type="billForm.type === '支出' ? 'normal' : undefined"
              @click="billForm.type = '支出'"
            >
              支出
            </lay-button>
            <lay-button 
              :type="billForm.type === '收入' ? 'normal' : undefined"
              @click="billForm.type = '收入'"
            >
              收入
            </lay-button>
          </div>
        </lay-form-item>
        <lay-row :gutter="[16, 0]">
          <lay-col lg="12" md="12" sm="12" xs="24">
            <lay-form-item label="金额" required>
              <lay-input v-model="billForm.amount" placeholder="请输入金额" type="number" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="12" xs="24">
            <lay-form-item label="日期">
              <lay-input v-model="billForm.date" type="date" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[16, 0]">
          <lay-col lg="12" md="12" sm="12" xs="24">
            <lay-form-item label="分类" required>
              <lay-select v-model="billForm.category" placeholder="请选择分类">
                <lay-select-option v-for="cat in categories" :key="cat" :value="cat" :label="cat"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="12" xs="24">
            <lay-form-item label="支付方式">
              <lay-select v-model="billForm.paymentMethod" placeholder="请选择">
                <lay-select-option v-for="method in paymentMethods" :key="method" :value="method" :label="method"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="备注">
          <lay-textarea v-model="billForm.remark" placeholder="请输入备注信息" :rows="3" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <lay-button @click="showBillModal = false">取消</lay-button>
        <lay-button type="normal" @click="submitBill">确认记账</lay-button>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted, onUnmounted, watchEffect } from 'vue'
import * as echarts from 'echarts'
import {
  LaySpace, LayRow, LayCol, LayCard, LayButton, LayTable,
  LayInput, LaySelect, LaySelectOption, LayTextarea, LayForm,
  LayDatePicker
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = {
  success: (msg: string) => layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layer.msg(msg, { icon: 3, time: 2000 })
}

const columns = ref([
  { title: '日期', key: 'date', width: '120px' },
  { title: '类型', key: 'type', width: '80px', customSlot: 'type' },
  { title: '分类', key: 'category', width: '100px', customSlot: 'category' },
  { title: '金额', key: 'amount', width: '120px', customSlot: 'amount' },
  { title: '支付方式', key: 'paymentMethod', width: '100px' },
  { title: '备注', key: 'remark' },
  { title: '操作', key: 'operator', width: '120px', fixed: 'right' as const, customSlot: 'operator' }
])

const viewMode = ref<'day' | 'month' | 'year'>('month')
const viewModes = [
  { value: 'day', label: '日视图' },
  { value: 'month', label: '月视图' },
  { value: 'year', label: '年视图' }
]

const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showBillModal = ref(false)
const editMode = ref(false)
const selectedDate = ref<string>('')
const datePickerType = ref<'date' | 'month' | 'year'>('month')

// 根据视图模式动态计算汇总数据
const summaryData = computed(() => {
  const filtered = filteredByViewMode.value
  const totalIncome = filtered
    .filter(b => b.type === '收入')
    .reduce((sum, b) => sum + b.amount, 0)
  const totalExpense = filtered
    .filter(b => b.type === '支出')
    .reduce((sum, b) => sum + b.amount, 0)
  const balance = totalIncome - totalExpense
  
  return [
    { 
      label: '总收入', 
      value: formatMoney(totalIncome), 
      trend: '较上期 +12.5%', 
      trendClass: 'trend-up', 
      trendIcon: 'layui-icon layui-icon-up', 
      icon: 'layui-icon layui-icon-dollar', 
      class: 'income', 
      valueClass: 'text-success' 
    },
    { 
      label: '总支出', 
      value: formatMoney(totalExpense), 
      trend: '较上期 -3.2%', 
      trendClass: 'trend-down', 
      trendIcon: 'layui-icon layui-icon-down', 
      icon: 'layui-icon layui-icon-chart', 
      class: 'expense', 
      valueClass: 'text-danger' 
    },
    { 
      label: '结余', 
      value: formatMoney(balance), 
      trend: `储蓄率 ${((totalIncome > 0 ? (balance / totalIncome) * 100 : 0)).toFixed(1)}%`, 
      trendClass: '', 
      icon: 'layui-icon layui-icon-rmb', 
      class: 'balance', 
      valueClass: 'text-primary' 
    }
  ]
})

const barChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const categoryChartRef = ref<HTMLElement | null>(null)
const lineChartRef = ref<HTMLElement | null>(null)

let barChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null

const billForm = reactive({
  type: '支出',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  category: '',
  paymentMethod: '',
  remark: ''
})

const categories = ['餐饮', '购物', '居住', '交通', '娱乐', '医疗', '教育', '工资', '奖金', '其他']
const paymentMethods = ['支付宝', '微信', '银行卡', '现金', '信用卡']

const bills = ref([
  { id: 1, date: '2026-05-21', type: '支出', amount: 128.00, category: '购物', paymentMethod: '支付宝', remark: '超市购物' },
  { id: 2, date: '2026-05-20', type: '收入', amount: 8500.00, category: '工资', paymentMethod: '银行卡', remark: '5 月工资' },
  { id: 3, date: '2026-05-19', type: '支出', amount: 2680.00, category: '居住', paymentMethod: '信用卡', remark: '房租' },
  { id: 4, date: '2026-05-18', type: '支出', amount: 56.80, category: '餐饮', paymentMethod: '微信', remark: '午餐' },
  { id: 5, date: '2026-05-17', type: '支出', amount: 320.00, category: '交通', paymentMethod: '支付宝', remark: '加油' },
  { id: 6, date: '2026-05-16', type: '支出', amount: 158.00, category: '娱乐', paymentMethod: '微信', remark: '电影票' },
  { id: 7, date: '2026-05-15', type: '收入', amount: 500.00, category: '奖金', paymentMethod: '微信', remark: '兼职设计费' },
  { id: 8, date: '2026-05-14', type: '支出', amount: 89.00, category: '餐饮', paymentMethod: '支付宝', remark: '晚餐' },
  { id: 9, date: '2026-05-13', type: '支出', amount: 256.00, category: '购物', paymentMethod: '信用卡', remark: '衣服' },
  { id: 10, date: '2026-05-12', type: '支出', amount: 45.00, category: '交通', paymentMethod: '微信', remark: '地铁充值' },
])

const filters = reactive({
  type: '',
  category: ''
})

// 根据视图模式过滤数据
const filteredByViewMode = computed(() => {
  if (!selectedDate.value) return bills.value
  
  const selected = new Date(selectedDate.value)
  const selectedYear = selected.getFullYear()
  const selectedMonth = selected.getMonth()
  const selectedDay = selected.getDate()
  
  return bills.value.filter(bill => {
    const billDate = new Date(bill.date)
    if (viewMode.value === 'day') {
      return billDate.getFullYear() === selectedYear &&
             billDate.getMonth() === selectedMonth &&
             billDate.getDate() === selectedDay
    } else if (viewMode.value === 'month') {
      return billDate.getFullYear() === selectedYear &&
             billDate.getMonth() === selectedMonth
    } else { // year
      return billDate.getFullYear() === selectedYear
    }
  })
})

const filteredBills = computed(() => {
  return filteredByViewMode.value.filter(bill => {
    if (filters.type && bill.type !== filters.type) return false
    if (filters.category && bill.category !== filters.category) return false
    if (searchText.value && !bill.remark.toLowerCase().includes(searchText.value.toLowerCase())) return false
    return true
  })
})

const totalBills = computed(() => filteredBills.value.length)
const totalPages = computed(() => Math.ceil(totalBills.value / pageSize.value))

const paginatedBills = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBills.value.slice(start, end)
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

const formatMoney = (amount: number) => amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// 根据视图模式动态计算图表数据
const refreshCharts = () => {
  const filtered = filteredByViewMode.value
  
  // 按日期分组统计数据
  const dailyData: Record<string, { income: number; expense: number }> = {}
  const categoryData: Record<string, number> = {}
  const paymentData: Record<string, number> = {}
  
  filtered.forEach(bill => {
    // 按日统计
    const dateKey = bill.date
    if (!dailyData[dateKey]) dailyData[dateKey] = { income: 0, expense: 0 }
    if (bill.type === '收入') dailyData[dateKey].income += bill.amount
    else dailyData[dateKey].expense += bill.amount
    
    // 分类统计
    if (bill.type === '支出') {
      if (!categoryData[bill.category]) categoryData[bill.category] = 0
      categoryData[bill.category] += bill.amount
    }
    
    // 支付方式统计
    if (!paymentData[bill.paymentMethod]) paymentData[bill.paymentMethod] = 0
    paymentData[bill.paymentMethod] += bill.amount
  })
  
  // 更新柱状图
  if (barChart) {
    const dates = Object.keys(dailyData).sort()
    const incomeData = dates.map(d => dailyData[d].income)
    const expenseData = dates.map(d => dailyData[d].expense)
    
    barChart.setOption({
      xAxis: { data: dates.map(d => {
        const date = new Date(d)
        if (viewMode.value === 'day') return `${date.getHours()}:00`
        else if (viewMode.value === 'month') return `${date.getDate()}日`
        else return `${date.getMonth() + 1}月`
      }) },
      series: [
        { data: incomeData },
        { data: expenseData }
      ]
    })
  }
  
  // 更新支付方式饼图
  if (pieChart) {
    pieChart.setOption({
      series: [{
        data: Object.entries(paymentData).map(([name, value]) => ({ name, value }))
      }]
    })
  }
  
  // 更新分类饼图
  if (categoryChart) {
    categoryChart.setOption({
      series: [{
        data: Object.entries(categoryData).map(([name, value]) => ({ name, value }))
      }]
    })
  }
  
  message.success('数据已更新')
}

// 初始化默认日期为当前月份
selectedDate.value = new Date().toISOString().split('T')[0]

const switchViewMode = (mode: string) => {
  viewMode.value = mode as 'day' | 'month' | 'year'
  
  // 根据视图模式调整日期选择器类型
  if (mode === 'day') {
    datePickerType.value = 'date'
  } else if (mode === 'month') {
    datePickerType.value = 'month'
  } else {
    datePickerType.value = 'year'
  }
  
  const modeText = mode === 'day' ? '日' : mode === 'month' ? '月' : '年'
  message.success(`切换到${modeText}视图`)
  
  // 重置日期为当前选择模式
  const now = new Date()
  if (mode === 'day') {
    selectedDate.value = now.toISOString().split('T')[0]
  } else if (mode === 'month') {
    selectedDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  } else {
    selectedDate.value = `${now.getFullYear()}`
  }
}

const onDateChange = (value: string) => {
  // 日期改变时重新计算汇总数据和图表
  refreshCharts()
}

const showAddBill = () => {
  editMode.value = false
  Object.assign(billForm, {
    type: '支出',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paymentMethod: '',
    remark: ''
})
  showBillModal.value = true
}

const editBill = (bill: any) => {
  editMode.value = true
  Object.assign(billForm, { ...bill })
  showBillModal.value = true
}

const deleteBill = (bill: any) => {
  layer.confirm('确定删除该账单吗？', {
    icon: 3,
    yes: (index: number) => {
      const idx = bills.value.findIndex(b => b.id === bill.id)
      if (idx !== -1) bills.value.splice(idx, 1)
      message.success('删除成功')
      layer.close(index)
    }
  })
}

const submitBill = () => {
  if (!billForm.amount || !billForm.category) {
    message.warning('请填写必填项')
    return
}
  if (editMode.value) {
    const idx = bills.value.findIndex(b => b.id === 1)
    if (idx !== -1) bills.value[idx] = { ...bills.value[idx], ...billForm, amount: parseFloat(billForm.amount) }
    message.success('更新成功')
} else {
    bills.value.unshift({
      id: Date.now(),
      type: billForm.type,
      amount: parseFloat(billForm.amount),
      date: billForm.date,
      category: billForm.category,
      paymentMethod: billForm.paymentMethod || '现金',
      remark: billForm.remark
})
    message.success('记账成功')
}
  showBillModal.value = false
}

const handleSearch = () => { currentPage.value = 1 }
const handleFilter = () => { currentPage.value = 1; message.success('查询成功') }
const resetFilter = () => { Object.assign(filters, { type: '', category: '' }); searchText.value = '' }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

const initCharts = () => {
  // 柱状图 - 收支对比
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
    barChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['收入', '支出'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: ['1 日', '2 日', '3 日', '4 日', '5 日', '6 日', '7 日'] },
      yAxis: { type: 'value' },
      series: [
        { name: '收入', type: 'bar', smooth: true, data: [1200, 2000, 1500, 800, 700, 1100, 1300], itemStyle: { color: '#16baaa' } },
        { name: '支出', type: 'bar', smooth: true, data: [800, 600, 1200, 900, 500, 700, 900], itemStyle: { color: '#ff5722' } }
      ]
})
}

  // 饼图 - 支付方式分布
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      color: ['#16baaa', '#07c160', '#1e9fff', '#ffb800', '#ff5722'],
      series: [{
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        data: [
          { value: 3580, name: '支付宝' },
          { value: 2450, name: '微信' },
          { value: 1820, name: '银行卡' },
          { value: 980, name: '现金' },
          { value: 650, name: '信用卡' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 16,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
}
}
}]
})
}

  // 饼图 - 支出分类
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe'],
      series: [{
        type: 'pie',
        radius: '65%',
        data: [
          { value: 2680, name: '居住' },
          { value: 856, name: '餐饮' },
          { value: 384, name: '购物' },
          { value: 365, name: '交通' },
          { value: 158, name: '娱乐' }
        ]
}]
})
}

  // 折线图 - 余额趋势
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月'] },
      yAxis: { type: 'value' },
      series: [{
        data: [128500, 132800, 141200, 148600, 156420, 163800],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 186, 170, 0.5)' },
            { offset: 1, color: 'rgba(22, 186, 170, 0.05)' }
          ])
},
        itemStyle: { color: '#16baaa' },
        lineStyle: { width: 3 }
}]
})
}
}

const resizeCharts = () => {
  barChart?.resize()
  pieChart?.resize()
  categoryChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', resizeCharts)
  })
  
  // 监听视图模式变化
  watchEffect(() => {
    refreshCharts()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  barChart?.dispose()
  pieChart?.dispose()
  categoryChart?.dispose()
  lineChart?.dispose()
})
</script>

<style scoped>
.bill-panel-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.panel-header h2 { font-size: 20px; color: #333; }
.breadcrumb-bar { padding: 12px 0; }
.breadcrumb-text { font-size: 14px; color: #666; }
.breadcrumb-separator { margin: 0 8px; color: #999; }
.breadcrumb-current { color: #333; font-weight: 500; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.panel-header h2 { font-size: 20px; color: #333; }
.panel-tabs { display: flex; gap: 8px; }
.date-picker { margin-left: 16px; }
.summary-card { 
  border-radius: 12px; 
  border: 1px solid #e8e8e8;
  background: #fff;
}
.summary-card .card-body {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 20px;
}
.card-icon { 
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
.card-icon.income { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); }
.card-icon.expense { background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%); }
.card-icon.balance { background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%); }
.card-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}
.card-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.card-label { font-size: 14px; color: #999; }
.card-value { font-size: 28px; font-weight: 600; color: #333; }
.card-trend { 
  font-size: 13px; 
  color: #999; 
  display: flex; 
  align-items: center; 
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
}
.trend-up { color: #16b777; }
.trend-down { color: #ff5722; }
.chart-container { width: 100%; height: 320px; }
.search-box { display: flex; gap: 8px; }
.filter-bar { padding: 16px; background: #fff; border-radius: 8px; margin-bottom: 16px; }
.type-tag, .category-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.tag-income { background: #e8f6f3; color: #16baaa; }
.tag-expense { background: #ffece6; color: #ff5722; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
.text-primary { color: #1e9fff; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.type-selector { display: flex; gap: 12px; }
</style>
