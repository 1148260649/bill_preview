<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>数据概览</h2>
      <p class="subtitle">欢迎使用账单管理系统</p>
    </div>

    <!-- 数据卡片 -->
    <div class="data-cards">
      <div class="data-card card-income">
        <div class="card-icon">
          <i class="layui-icon layui-icon-dollar"></i>
        </div>
        <div class="card-content">
          <div class="card-label">本月收入</div>
          <div class="card-value">¥ 25,680.00</div>
          <div class="card-trend trend-up">
            <i class="layui-icon layui-icon-up"></i>
            <span>较上月 +12.5%</span>
          </div>
        </div>
      </div>

      <div class="data-card card-expense">
        <div class="card-icon">
          <i class="layui-icon layui-icon-chart"></i>
        </div>
        <div class="card-content">
          <div class="card-label">本月支出</div>
          <div class="card-value">¥ 8,320.50</div>
          <div class="card-trend trend-down">
            <i class="layui-icon layui-icon-down"></i>
            <span>较上月 -3.2%</span>
          </div>
        </div>
      </div>

      <div class="data-card card-balance">
        <div class="card-icon">
          <i class="layui-icon layui-icon-rmb"></i>
        </div>
        <div class="card-content">
          <div class="card-label">当前余额</div>
          <div class="card-value">¥ 156,420.80</div>
          <div class="card-trend">
            <span>较年初 +18.3%</span>
          </div>
        </div>
      </div>

      <div class="data-card card-saving">
        <div class="card-icon">
          <i class="layui-icon layui-icon-ok-circle"></i>
        </div>
        <div class="card-content">
          <div class="card-label">本月结余</div>
          <div class="card-value">¥ 17,359.50</div>
          <div class="card-trend trend-up">
            <i class="layui-icon layui-icon-up"></i>
            <span>储蓄率 67.6%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="card-header">
          <h3>收支趋势</h3>
        </div>
        <div class="card-body">
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <h3>支出分类</h3>
        </div>
        <div class="card-body">
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 最近账单 -->
    <div class="recent-bills">
      <div class="card-header">
        <h3>最近账单</h3>
        <button class="layui-btn layui-btn-sm layui-btn-primary" @click="$router.push('/bill/bill')">
          查看全部
        </button>
      </div>
      <div class="card-body">
        <table class="layui-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>类型</th>
              <th>金额</th>
              <th>支付方式</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bill in recentBills" :key="bill.id">
              <td>{{ bill.date }}</td>
              <td>
                <span :class="['bill-type', bill.type === '支出' ? 'type-expense' : 'type-income']">
                  {{ bill.type }}
                </span>
              </td>
              <td :class="bill.type === '支出' ? 'text-danger' : 'text-success'">
                {{ bill.type === '支出' ? '-' : '+' }}{{ bill.amount }}
              </td>
              <td>{{ bill.paymentMethod }}</td>
              <td>{{ bill.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const trendChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()

const recentBills = ref([
  { id: 1, date: '2026-05-21', type: '支出', amount: '¥ 128.00', paymentMethod: '支付宝', remark: '超市购物' },
  { id: 2, date: '2026-05-20', type: '收入', amount: '¥ 8,500.00', paymentMethod: '银行卡', remark: '工资收入' },
  { id: 3, date: '2026-05-19', type: '支出', amount: '¥ 2,680.00', paymentMethod: '信用卡', remark: '房租' },
  { id: 4, date: '2026-05-18', type: '支出', amount: '¥ 56.80', paymentMethod: '微信', remark: '外卖' },
  { id: 5, date: '2026-05-17', type: '支出', amount: '¥ 320.00', paymentMethod: '支付宝', remark: '加油' },
])

const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '支出']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
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
        data: [18500, 22000, 19800, 24500, 25680, 0],
        itemStyle: { color: '#16baaa' }
      },
      {
        name: '支出',
        type: 'bar',
        data: [7200, 8500, 6800, 9200, 8320, 0],
        itemStyle: { color: '#ff5722' }
      }
    ]
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 2680, name: '房租' },
          { value: 1200, name: '餐饮' },
          { value: 850, name: '交通' },
          { value: 680, name: '购物' },
          { value: 520, name: '娱乐' },
          { value: 390, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initPieChart()
    
    window.addEventListener('resize', () => {
      trendChartRef.value && echarts.getInstanceByDom(trendChartRef.value)?.resize()
      pieChartRef.value && echarts.getInstanceByDom(pieChartRef.value)?.resize()
    })
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
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
  color: #999;
  font-size: 14px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.data-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.card-income .card-icon {
  background: linear-gradient(135deg, #16baaa 0%, #16b777 100%);
  color: #fff;
}

.card-expense .card-icon {
  background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%);
  color: #fff;
}

.card-balance .card-icon {
  background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%);
  color: #fff;
}

.card-saving .card-icon {
  background: linear-gradient(135deg, #ffb800 0%, #ffc107 100%);
  color: #fff;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #16b777;
}

.trend-down {
  color: #ff5722;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card,
.recent-bills {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  color: #333;
}

.card-body {
  min-height: 300px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.recent-bills {
  margin-bottom: 24px;
}

.text-danger {
  color: #ff5722;
}

.text-success {
  color: #16b777;
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
</style>
