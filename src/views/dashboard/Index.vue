<template>
  <div class="dashboard-container">
    <lay-space :size="20" direction="vertical" fill>
      <div class="dashboard-header">
        <h2>数据概览</h2>
      </div>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="6" md="6" sm="6" xs="12" v-for="(card, index) in dataCards" :key="index">
          <lay-card bordered class="data-card" :class="card.class">
            <div class="card-body">
              <div class="card-icon">
                <i :class="card.icon"></i>
              </div>
              <div class="card-content">
                <div class="card-main">
                  <lay-space :size="8">
                    <span class="card-label">{{ card.label }}</span>
                    <span class="card-value">{{ card.value }}</span>
                  </lay-space>
                </div>
                <div class="card-trend" :class="card.trendClass">
                  <i v-if="card.trendIcon" :class="card.trendIcon"></i>
                  <span>{{ card.trend }}</span>
                </div>
              </div>
            </div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="16" md="16" sm="12" xs="24">
          <lay-card title="收支趋势" :bordered="false">
            <div ref="trendChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
        <lay-col lg="8" md="8" sm="12" xs="24">
          <lay-card title="支出分类" :bordered="false">
            <div ref="pieChartRef" class="chart-container"></div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-card title="最近账单" :bordered="false">
        <template #extra>
          <lay-button size="small" @click="$router.push('/bill/bill')">
            查看全部
          </lay-button>
        </template>
        <lay-table 
          :columns="columns" 
          :data-source="recentBills" 
          :pagination="false"
        >
          <template #type="{ row }">
            <span :class="['bill-type', row.type === '支出' ? 'type-expense' : 'type-income']">
              {{ row.type }}
            </span>
          </template>
          <template #amount="{ row }">
            <span :class="row.type === '支出' ? 'text-danger' : 'text-success'">
              {{ row.type === '支出' ? '-' : '' }}{{ row.amount }}
            </span>
          </template>
        </lay-table>
      </lay-card>
    </lay-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { LaySpace, LayRow, LayCol, LayCard, LayButton, LayTable } from '@layui/layui-vue'

const trendChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const columns = ref([
  { title: '日期', key: 'date', width: '120px' },
  { title: '类型', key: 'type', width: '100px', customSlot: 'type' },
  { title: '金额', key: 'amount', width: '120px', customSlot: 'amount' },
  { title: '支付方式', key: 'paymentMethod' },
  { title: '备注', key: 'remark' }
])

const dataCards = reactive([
  { label: '本月收入', value: '¥ 25,680.00', trend: '较上月 +12.5%', trendClass: 'trend-up', trendIcon: 'layui-icon layui-icon-up', icon: 'layui-icon layui-icon-dollar', class: 'card-income' },
  { label: '本月支出', value: '¥ 8,320.50', trend: '较上月 -3.2%', trendClass: 'trend-down', trendIcon: 'layui-icon layui-icon-down', icon: 'layui-icon layui-icon-chart', class: 'card-expense' },
  { label: '当前余额', value: '¥ 156,420.80', trend: '较年初 +18.3%', trendClass: '', icon: 'layui-icon layui-icon-rmb', class: 'card-balance' },
  { label: '本月结余', value: '¥ 17,359.50', trend: '储蓄率 67.6%', trendClass: 'trend-up', trendIcon: 'layui-icon layui-icon-up', icon: 'layui-icon layui-icon-ok-circle', class: 'card-saving' }
])

const recentBills = ref([
  { id: 1, date: '2026-05-21', type: '支出', amount: '¥ 128.00', paymentMethod: '支付宝', remark: '超市购物' },
  { id: 2, date: '2026-05-20', type: '收入', amount: '¥ 8,500.00', paymentMethod: '银行卡', remark: '工资收入' },
  { id: 3, date: '2026-05-19', type: '支出', amount: '¥ 2,680.00', paymentMethod: '信用卡', remark: '房租' },
  { id: 4, date: '2026-05-18', type: '支出', amount: '¥ 56.80', paymentMethod: '微信', remark: '外卖' },
  { id: 5, date: '2026-05-17', type: '支出', amount: '¥ 320.00', paymentMethod: '支付宝', remark: '加油' },
])

const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        smooth: true,
        data: [15800, 18200, 16500, 19800, 23500, 25680],
        itemStyle: { color: '#16baaa' }
      },
      {
        name: '支出',
        type: 'bar',
        smooth: true,
        data: [12300, 10500, 11800, 9200, 8320, 7500],
        itemStyle: { color: '#ff5722' }
      }
    ]
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe'],
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 2680, name: '居住' },
          { value: 856, name: '餐饮' },
          { value: 384, name: '购物' },
          { value: 365, name: '交通' },
          { value: 158, name: '娱乐' },
          { value: 120, name: '医疗' },
          { value: 85, name: '其他' }
        ]
      }
    ]
  })
}

const resizeCharts = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initPieChart()
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
.dashboard-container {
  padding: 20px;
  background: #f5f6f7;
  min-height: calc(100vh - 120px);
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}
.breadcrumb-bar { padding: 12px 0; }
.breadcrumb-text { font-size: 14px; color: #666; }
.breadcrumb-separator { margin: 0 8px; color: #999; }
.breadcrumb-current { color: #333; font-weight: 500; }
.data-card {
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  background: #fff;
  transition: transform 0.3s, box-shadow 0.3s;
}
.data-card .card-body {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 20px;
}
.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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

.card-income .card-icon {
  background: linear-gradient(135deg, #16baaa 0%, #16b777 100%);
}

.card-expense .card-icon {
  background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%);
}

.card-balance .card-icon {
  background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%);
}

.card-saving .card-icon {
  background: linear-gradient(135deg, #36d66c 0%, #16b777 100%);
}

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

.trend-up {
  color: #16b777;
}

.trend-down {
  color: #ff5722;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.bill-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-income {
  background: #e8f6f3;
  color: #16baaa;
}

.type-expense {
  background: #ffece6;
  color: #ff5722;
}

.text-success {
  color: #16b777;
}

.text-danger {
  color: #ff5722;
}
</style>
