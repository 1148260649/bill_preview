<template>
  <div class="salary-panel-container">
    <lay-space :size="20" direction="vertical" fill>
      <div class="panel-header">
        <h2>工资管理</h2>
        <lay-button type="normal" @click="showAddSalary">
          <i class="layui-icon layui-icon-add-1"></i> 添加工资
        </lay-button>
      </div>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="8" md="8" sm="6" xs="12">
          <lay-card bordered class="summary-card">
            <div class="card-body">
              <div class="card-icon income">
                <i class="layui-icon layui-icon-dollar"></i>
              </div>
              <div class="card-content">
                <div class="card-main">
                  <lay-space :size="8">
                    <span class="card-label">本月工资</span>
                    <span class="card-value text-success">¥ 8,500.00</span>
                  </lay-space>
                </div>
                <div class="card-trend trend-up">
                  <i class="layui-icon layui-icon-up"></i>
                  <span>准时发放</span>
                </div>
              </div>
            </div>
          </lay-card>
        </lay-col>
        <lay-col lg="8" md="8" sm="6" xs="12">
          <lay-card :bordered="false" class="summary-card">
            <div class="card-body">
              <div class="card-icon bonus">
                <i class="layui-icon layui-icon-gift"></i>
              </div>
              <div class="card-content">
                <div class="card-main">
                  <lay-space :size="8">
                    <span class="card-label">年度奖金</span>
                    <span class="card-value text-primary">¥ 45,000.00</span>
                  </lay-space>
                </div>
                <div class="card-trend">
                  已入账 ¥ 20,000
                </div>
              </div>
            </div>
          </lay-card>
        </lay-col>
        <lay-col lg="8" md="8" sm="6" xs="12">
          <lay-card :bordered="false" class="summary-card">
            <div class="card-body">
              <div class="card-icon total">
                <i class="layui-icon layui-icon-rmb"></i>
              </div>
              <div class="card-content">
                <div class="card-main">
                  <lay-space :size="8">
                    <span class="card-label">年度总收入</span>
                    <span class="card-value">¥ 122,000.00</span>
                  </lay-space>
                </div>
                <div class="card-trend trend-up">
                  <i class="layui-icon layui-icon-up"></i>
                  <span>同比增长 8.5%</span>
                </div>
              </div>
            </div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="16" md="16" sm="12" xs="24">
          <lay-card title="工资趋势" :bordered="false">
            <div ref="trendChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
        <lay-col lg="8" md="8" sm="6" xs="12">
          <lay-card title="收入构成" :bordered="false">
            <div ref="pieChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-card title="工资记录" :bordered="false">
        <template #extra>
          <lay-space :size="12">
            <lay-input 
              v-model="searchText" 
              placeholder="搜索月份、备注..." 
              size="sm"
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
            <lay-button size="sm" @click="handleSearch">
              <i class="layui-icon layui-icon-search"></i>
            </lay-button>
          </lay-space>
        </template>

        <lay-table 
          :columns="columns" 
          :data-source="paginatedSalaries" 
          :pagination="false"
        >
          <template #baseSalary="{ row }">
            <span class="text-success">¥{{ formatMoney(row.baseSalary) }}</span>
          </template>
          <template #bonus="{ row }">
            <span class="text-success">¥{{ formatMoney(row.bonus) }}</span>
          </template>
          <template #deduction="{ row }">
            <span class="text-danger">-¥{{ formatMoney(row.deduction) }}</span>
          </template>
          <template #netSalary="{ row }">
            <span class="text-primary" style="font-weight: bold;">¥{{ formatMoney(row.netSalary) }}</span>
          </template>
          <template #operator="{ row }">
            <lay-button size="sm" @click="editSalary(row)">
              <i class="layui-icon layui-icon-edit"></i>
            </lay-button>
            <lay-button size="sm" type="danger" @click="deleteSalary(row)">
              <i class="layui-icon layui-icon-delete"></i>
            </lay-button>
          </template>
        </lay-table>

        <div class="pagination">
          <div class="pagination-info">共 {{ totalSalaries }} 条，第 {{ currentPage }} 页</div>
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

    <lay-layer v-model="showSalaryModal" :title="editMode ? '编辑工资' : '添加工资'" :area="['700px']" >
      <lay-form :model="salaryForm" :label-width="90" style="padding: 16px;">
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="月份" required>
              <lay-input v-model="salaryForm.month" type="month" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="发放日期">
              <lay-input v-model="salaryForm.payDate" type="date" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[20, 16]">
          <lay-col lg="8" md="8" sm="6" xs="12">
            <lay-form-item label="基本工资" required>
              <lay-input v-model="salaryForm.baseSalary" type="number" placeholder="0.00" prefix="¥" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="8" md="8" sm="6" xs="12">
            <lay-form-item label="绩效奖金">
              <lay-input v-model="salaryForm.bonus" type="number" placeholder="0.00" prefix="¥" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="8" md="8" sm="6" xs="12">
            <lay-form-item label="扣款">
              <lay-input v-model="salaryForm.deduction" type="number" placeholder="0.00" prefix="¥" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="实发工资">
          <lay-input 
            :value="formatMoney(calculateActualSalary)" 
            disabled 
            style="background: #f5f5f5; font-weight: 600;"
          />
        </lay-form-item>
        <lay-form-item label="备注">
          <lay-textarea v-model="salaryForm.remark" placeholder="请输入备注信息" :rows="3" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end; padding: 0 16px 16px;">
          <lay-button @click="showSalaryModal = false">取消</lay-button>
          <lay-button type="normal" @click="submitSalary">确认保存</lay-button>
        </div>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  LaySpace, LayRow, LayCol, LayCard, LayButton, LayTable,
  LayInput, LayTextarea, LayForm
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = {
  success: (msg: string) => layer.msg(msg, { icon: 1, time: 2000 }),
  warning: (msg: string) => layer.msg(msg, { icon: 2, time: 2000 })
}

const columns = ref([
  { title: '月份', key: 'month', width: '120px' },
  { title: '基本工资', key: 'baseSalary', width: '100px', customSlot: 'baseSalary' },
  { title: '绩效奖金', key: 'bonus', width: '100px', customSlot: 'bonus' },
  { title: '补贴', key: 'allowance', width: '100px' },
  { title: '扣除', key: 'deduction', width: '100px', customSlot: 'deduction' },
  { title: '实发工资', key: 'netSalary', width: '120px', customSlot: 'netSalary' },
  { title: '发放状态', key: 'status', width: '100px' },
  { title: '操作', key: 'operator', width: '150px', fixed: 'right' as const, customSlot: 'operator' }
])

const trendChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showSalaryModal = ref(false)
const editMode = ref(false)

const salaryForm = reactive({
  month: '',
  payDate: '',
  baseSalary: '',
  bonus: '0',
  deduction: '0',
  remark: ''
})

const salaries = ref([
  { id: 1, month: '2026-05', baseSalary: 8500, bonus: 0, deduction: 0, actualSalary: 8500, payDate: '2026-05-20', remark: '正常发放' },
  { id: 2, month: '2026-04', baseSalary: 8500, bonus: 500, deduction: 0, actualSalary: 9000, payDate: '2026-04-20', remark: '季度绩效' },
  { id: 3, month: '2026-03', baseSalary: 8500, bonus: 0, deduction: 100, actualSalary: 8400, payDate: '2026-03-20', remark: '事假扣款' },
  { id: 4, month: '2026-02', baseSalary: 8500, bonus: 0, deduction: 0, actualSalary: 8500, payDate: '2026-02-20', remark: '' },
  { id: 5, month: '2026-01', baseSalary: 8500, bonus: 2000, deduction: 0, actualSalary: 10500, payDate: '2026-01-25', remark: '年终奖' },
  { id: 6, month: '2025-12', baseSalary: 8500, bonus: 0, deduction: 0, actualSalary: 8500, payDate: '2025-12-20', remark: '' },
  { id: 7, month: '2025-11', baseSalary: 8500, bonus: 0, deduction: 0, actualSalary: 8500, payDate: '2025-11-20', remark: '' },
  { id: 8, month: '2025-10', baseSalary: 8500, bonus: 800, deduction: 0, actualSalary: 9300, payDate: '2025-10-20', remark: '项目奖金' },
])

const calculateActualSalary = computed(() => {
  const base = parseFloat(salaryForm.baseSalary) || 0
  const bonus = parseFloat(salaryForm.bonus) || 0
  const deduction = parseFloat(salaryForm.deduction) || 0
  return base + bonus - deduction
})

const filteredSalaries = computed(() => {
  return salaries.value.filter(salary => {
    if (!searchText.value) return true
    const search = searchText.value.toLowerCase()
    return salary.month.toLowerCase().includes(search) || 
           (salary.remark && salary.remark.toLowerCase().includes(search))
})
})

const totalSalaries = computed(() => filteredSalaries.value.length)
const totalPages = computed(() => Math.ceil(totalSalaries.value / pageSize.value))

const paginatedSalaries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSalaries.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatMoney = (amount: number | string | undefined | null) => {
  if (amount === undefined || amount === null || amount === '') return '0.00'
  return Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const showAddSalary = () => {
  editMode.value = false
  Object.assign(salaryForm, {
    month: new Date().toISOString().slice(0, 7),
    payDate: new Date().toISOString().split('T')[0],
    baseSalary: '',
    bonus: '0',
    deduction: '0',
    remark: ''
})
  showSalaryModal.value = true
}

const editSalary = (salary: any) => {
  editMode.value = true
  Object.assign(salaryForm, { ...salary })
  showSalaryModal.value = true
}

const deleteSalary = (salary: any) => {
  layer.confirm('确定删除该工资记录吗？', {
    icon: 3,
    yes: (index: number) => {
      const idx = salaries.value.findIndex(s => s.id === salary.id)
      if (idx !== -1) salaries.value.splice(idx, 1)
      message.success('删除成功')
      layer.close(index)
    }
  })
}

const submitSalary = () => {
  if (!salaryForm.month || !salaryForm.baseSalary) {
    message.warning('请填写必填项')
    return
}
  if (editMode.value) {
    const idx = salaries.value.findIndex(s => s.id === 1)
    if (idx !== -1) {
      salaries.value[idx] = {
        ...salaries.value[idx], 
        ...salaryForm, 
        baseSalary: parseFloat(salaryForm.baseSalary),
        bonus: parseFloat(salaryForm.bonus) || 0,
        deduction: parseFloat(salaryForm.deduction) || 0,
        actualSalary: calculateActualSalary.value
}
}
    message.success('更新成功')
} else {
    salaries.value.unshift({
      id: Date.now(),
      month: salaryForm.month,
      baseSalary: parseFloat(salaryForm.baseSalary),
      bonus: parseFloat(salaryForm.bonus) || 0,
      deduction: parseFloat(salaryForm.deduction) || 0,
      actualSalary: calculateActualSalary.value,
      payDate: salaryForm.payDate || new Date().toISOString().split('T')[0],
      remark: salaryForm.remark
})
    message.success('添加成功')
}
  showSalaryModal.value = false
}

const handleSearch = () => { currentPage.value = 1 }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月'] },
      yAxis: { type: 'value' },
      series: [{
        name: '实发工资',
        type: 'line',
        smooth: true,
        data: [10500, 8500, 8500, 8400, 9000, 8500],
        itemStyle: { color: '#16baaa' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 186, 170, 0.3)' },
            { offset: 1, color: 'rgba(22, 186, 170, 0.05)' }
          ])
}
}]
})
}

  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      color: ['#16baaa', '#1e9fff', '#ffb800'],
      series: [{
        type: 'pie',
        radius: ['50%', '75%'],
        data: [
          { value: 102000, name: '基本工资' },
          { value: 15000, name: '绩效奖金' },
          { value: 5000, name: '年终奖' }
        ]
}]
})
}
}

const resizeCharts = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', resizeCharts)
})
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.salary-panel-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.breadcrumb-bar { padding: 12px 0; }
.breadcrumb-text { font-size: 14px; color: #666; }
.breadcrumb-separator { margin: 0 8px; color: #999; }
.breadcrumb-current { color: #333; font-weight: 500; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-header h2 { font-size: 20px; color: #333; }
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
.card-icon.bonus { background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%); }
.card-icon.total { background: linear-gradient(135deg, #ffb800 0%, #ff9f43 100%); }
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
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
.text-primary { color: #1e9fff; }
.chart-container { width: 100%; height: 320px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
</style>
