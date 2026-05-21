<template>
  <div class="page-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-transfer"></i> 转账管理</h2>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="layui-form layui-form-pane">
        <div class="layui-row">
          <div class="layui-col-md3">
            <div class="layui-form-item">
              <label class="layui-form-label">转出账户</label>
              <div class="layui-input-block">
                <select v-model="filters.fromAccount">
                  <option value="">全部</option>
                  <option value="招商银行储蓄卡">招商银行储蓄卡</option>
                  <option value="工商银行储蓄卡">工商银行储蓄卡</option>
                  <option value="支付宝">支付宝</option>
                  <option value="微信">微信</option>
                </select>
              </div>
            </div>
          </div>
          <div class="layui-col-md3">
            <div class="layui-form-item">
              <label class="layui-form-label">转入账户</label>
              <div class="layui-input-block">
                <select v-model="filters.toAccount">
                  <option value="">全部</option>
                  <option value="招商银行储蓄卡">招商银行储蓄卡</option>
                  <option value="工商银行储蓄卡">工商银行储蓄卡</option>
                  <option value="支付宝">支付宝</option>
                  <option value="微信">微信</option>
                </select>
              </div>
            </div>
          </div>
          <div class="layui-col-md3">
            <div class="layui-form-item">
              <label class="layui-form-label">日期</label>
              <div class="layui-input-block">
                <input type="text" class="layui-input" v-model="filters.dateRange" placeholder="日期范围" />
              </div>
            </div>
          </div>
          <div class="layui-col-md3">
            <button class="layui-btn layui-btn-fluid" @click="handleFilter">
              <i class="layui-icon layui-icon-search"></i> 查询
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="layui-card">
      <div class="layui-card-body">
        <div class="layui-row">
          <div class="layui-col-md4">
            <div class="stat-box">
              <div class="stat-title">本月转入总额</div>
              <div class="stat-value text-success">¥85,600.00</div>
            </div>
          </div>
          <div class="layui-col-md4">
            <div class="stat-box">
              <div class="stat-title">本月转出总额</div>
              <div class="stat-value text-danger">¥72,300.00</div>
            </div>
          </div>
          <div class="layui-col-md4">
            <div class="stat-box">
              <div class="stat-title">净转入</div>
              <div class="stat-value">¥13,300.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 转账记录表格 -->
    <div class="layui-card">
      <div class="layui-card-body" style="padding: 0;">
        <table class="layui-table">
          <thead>
            <tr>
              <th width="50"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th width="80">ID</th>
              <th width="120">日期</th>
              <th width="150">转出账户</th>
              <th width="150">转入账户</th>
              <th width="100">金额</th>
              <th>备注</th>
              <th width="80">状态</th>
              <th width="120">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transfer in paginatedTransfers" :key="transfer.id">
              <td><input type="checkbox" v-model="selectedIds" :value="transfer.id" /></td>
              <td>{{ transfer.id }}</td>
              <td>{{ transfer.date }}</td>
              <td><i class="layui-icon layui-icon-about"></i> {{ transfer.fromAccount }}</td>
              <td><i class="layui-icon layui-icon-about"></i> {{ transfer.toAccount }}</td>
              <td class="text-danger">-{{ formatMoney(transfer.amount) }}</td>
              <td>{{ transfer.remark }}</td>
              <td>
                <span :class="transfer.status === 'success' ? 'layui-badge layui-bg-green' : 'layui-badge layui-bg-orange'">
                  {{ transfer.statusText }}
                </span>
              </td>
              <td>
                <button class="layui-btn layui-btn-xs layui-btn-primary" @click="viewDetail(transfer)">详情</button>
              </td>
            </tr>
            <tr v-if="paginatedTransfers.length === 0">
              <td colspan="9" style="text-align: center; padding: 40px; color: #999;">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="layui-card-body" style="border-top: 1px solid #e6e6e6; display: flex; justify-content: space-between; align-items: center;">
        <div class="layui-table-info">
          <p class="layui-table-cell">共 {{ totalTransfers }} 条，每页 {{ pageSize }} 条，第 {{ currentPage }} 页</p>
        </div>
        <div class="layui-table-page">
          <button class="layui-btn layui-btn-sm layui-btn-primary" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
          <button 
            v-for="page in displayPages" 
            :key="page"
            class="layui-btn layui-btn-sm" 
            :class="page === currentPage ? '' : 'layui-btn-primary'"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button class="layui-btn layui-btn-sm layui-btn-primary" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

declare const layui: any

const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

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
  { id: 4, date: '2026-05-18', fromAccount: '支付宝余额', toAccount: '微信零钱', amount: 2000, remark: '日常转账', status: 'success', statusText: '成功' },
  { id: 5, date: '2026-05-17', fromAccount: '工商银行储蓄卡', toAccount: '支付宝余额', amount: 8000, remark: '充值', status: 'success', statusText: '成功' },
  { id: 6, date: '2026-05-16', fromAccount: '微信零钱', toAccount: '招商银行储蓄卡', amount: 1500, remark: '提现', status: 'success', statusText: '成功' },
  { id: 7, date: '2026-05-15', fromAccount: '招商银行储蓄卡', toAccount: '微信零钱', amount: 4000, remark: '零钱备用', status: 'success', statusText: '成功' },
  { id: 8, date: '2026-05-14', fromAccount: '支付宝余额', toAccount: '工商银行储蓄卡', amount: 6000, remark: '资金周转', status: 'success', statusText: '成功' },
  { id: 9, date: '2026-05-13', fromAccount: '微信零钱', toAccount: '支付宝余额', amount: 2500, remark: '还款', status: 'success', statusText: '成功' },
  { id: 10, date: '2026-05-12', fromAccount: '工商银行储蓄卡', toAccount: '招商银行储蓄卡', amount: 15000, remark: '大额转账', status: 'success', statusText: '成功' },
  { id: 11, date: '2026-05-11', fromAccount: '支付宝余额', toAccount: '微信零钱', amount: 1800, remark: '日常使用', status: 'success', statusText: '成功' },
  { id: 12, date: '2026-05-10', fromAccount: '招商银行储蓄卡', toAccount: '支付宝余额', amount: 7000, remark: '理财转入', status: 'success', statusText: '成功' },
  { id: 13, date: '2026-05-09', fromAccount: '微信零钱', toAccount: '工商银行储蓄卡', amount: 3200, remark: '工资转入', status: 'success', statusText: '成功' },
  { id: 14, date: '2026-05-08', fromAccount: '支付宝余额', toAccount: '招商银行储蓄卡', amount: 9000, remark: '备用金', status: 'success', statusText: '成功' },
  { id: 15, date: '2026-05-07', fromAccount: '工商银行储蓄卡', toAccount: '微信零钱', amount: 2800, remark: '生活费', status: 'success', statusText: '成功' },
  { id: 16, date: '2026-05-06', fromAccount: '微信零钱', toAccount: '支付宝余额', amount: 4500, remark: '资金归拢', status: 'success', statusText: '成功' },
  { id: 17, date: '2026-05-05', fromAccount: '招商银行储蓄卡', toAccount: '工商银行储蓄卡', amount: 12000, remark: '银行卡转账', status: 'success', statusText: '成功' },
  { id: 18, date: '2026-05-04', fromAccount: '支付宝余额', toAccount: '微信零钱', amount: 1600, remark: '日常转账', status: 'success', statusText: '成功' },
  { id: 19, date: '2026-05-03', fromAccount: '工商银行储蓄卡', toAccount: '招商银行储蓄卡', amount: 8500, remark: '资金调度', status: 'success', statusText: '成功' },
  { id: 20, date: '2026-05-02', fromAccount: '微信零钱', toAccount: '支付宝余额', amount: 3500, remark: '还款备用', status: 'success', statusText: '成功' },
  { id: 21, date: '2026-05-01', fromAccount: '支付宝余额', toAccount: '工商银行储蓄卡', amount: 5500, remark: '资金归集', status: 'success', statusText: '成功' },
  { id: 22, date: '2026-04-30', fromAccount: '招商银行储蓄卡', toAccount: '微信零钱', amount: 2200, remark: '零钱使用', status: 'success', statusText: '成功' },
  { id: 23, date: '2026-04-29', fromAccount: '微信零钱', toAccount: '工商银行储蓄卡', amount: 4200, remark: '储蓄', status: 'success', statusText: '成功' },
  { id: 24, date: '2026-04-28', fromAccount: '支付宝余额', toAccount: '招商银行储蓄卡', amount: 7500, remark: '大额存入', status: 'success', statusText: '成功' },
  { id: 25, date: '2026-04-27', fromAccount: '工商银行储蓄卡', toAccount: '支付宝余额', amount: 3800, remark: '理财资金', status: 'success', statusText: '成功' },
  { id: 26, date: '2026-04-26', fromAccount: '微信零钱', toAccount: '招商银行储蓄卡', amount: 1900, remark: '提现到卡', status: 'success', statusText: '成功' },
  { id: 27, date: '2026-04-25', fromAccount: '招商银行储蓄卡', toAccount: '支付宝余额', amount: 6500, remark: '充值', status: 'success', statusText: '成功' },
  { id: 28, date: '2026-04-24', fromAccount: '支付宝余额', toAccount: '微信零钱', amount: 2700, remark: '日常使用', status: 'success', statusText: '成功' },
  { id: 29, date: '2026-04-23', fromAccount: '工商银行储蓄卡', toAccount: '微信零钱', amount: 4800, remark: '生活费', status: 'success', statusText: '成功' },
  { id: 30, date: '2026-04-22', fromAccount: '微信零钱', toAccount: '支付宝余额', amount: 3100, remark: '资金周转', status: 'success', statusText: '成功' },
  { id: 31, date: '2026-04-21', fromAccount: '招商银行储蓄卡', toAccount: '工商银行储蓄卡', amount: 9500, remark: '银行卡互转', status: 'success', statusText: '成功' },
  { id: 32, date: '2026-04-20', fromAccount: '支付宝余额', toAccount: '招商银行储蓄卡', amount: 5200, remark: '资金归集', status: 'success', statusText: '成功' },
  { id: 33, date: '2026-04-19', fromAccount: '微信零钱', toAccount: '工商银行储蓄卡', amount: 2400, remark: '储蓄', status: 'success', statusText: '成功' },
  { id: 34, date: '2026-04-18', fromAccount: '工商银行储蓄卡', toAccount: '支付宝余额', amount: 7800, remark: '理财', status: 'success', statusText: '成功' },
  { id: 35, date: '2026-04-17', fromAccount: '支付宝余额', toAccount: '微信零钱', amount: 1700, remark: '日常', status: 'success', statusText: '成功' },
  { id: 36, date: '2026-04-16', fromAccount: '招商银行储蓄卡', toAccount: '微信零钱', amount: 3600, remark: '备用金', status: 'success', statusText: '成功' },
  { id: 37, date: '2026-04-15', fromAccount: '微信零钱', toAccount: '支付宝余额', amount: 4100, remark: '还款', status: 'success', statusText: '成功' },
  { id: 38, date: '2026-04-14', fromAccount: '工商银行储蓄卡', toAccount: '招商银行储蓄卡', amount: 11000, remark: '大额转账', status: 'success', statusText: '成功' },
  { id: 39, date: '2026-04-13', fromAccount: '支付宝余额', toAccount: '工商银行储蓄卡', amount: 2900, remark: '资金调度', status: 'success', statusText: '成功' },
  { id: 40, date: '2026-04-12', fromAccount: '微信零钱', toAccount: '招商银行储蓄卡', amount: 5800, remark: '提现', status: 'success', statusText: '成功' },
  { id: 41, date: '2026-04-11', fromAccount: '招商银行储蓄卡', toAccount: '支付宝余额', amount: 3300, remark: '充值', status: 'success', statusText: '成功' },
  { id: 42, date: '2026-04-10', fromAccount: '支付宝余额', toAccount: '微信零钱', amount: 2100, remark: '日常', status: 'success', statusText: '成功' },
  { id: 43, date: '2026-04-09', fromAccount: '工商银行储蓄卡', toAccount: '微信零钱', amount: 4600, remark: '生活费', status: 'success', statusText: '成功' },
  { id: 44, date: '2026-04-08', fromAccount: '微信零钱', toAccount: '工商银行储蓄卡', amount: 6200, remark: '储蓄', status: 'success', statusText: '成功' },
  { id: 45, date: '2026-04-07', fromAccount: '招商银行储蓄卡', toAccount: '支付宝余额', amount: 8800, remark: '理财', status: 'success', statusText: '成功' },
  { id: 46, date: '2026-04-06', fromAccount: '支付宝余额', toAccount: '招商银行储蓄卡', amount: 3400, remark: '归集', status: 'success', statusText: '成功' },
  { id: 47, date: '2026-04-05', fromAccount: '微信零钱', toAccount: '支付宝余额', amount: 2600, remark: '资金周转', status: 'success', statusText: '成功' },
  { id: 48, date: '2026-04-04', fromAccount: '工商银行储蓄卡', toAccount: '招商银行储蓄卡', amount: 7200, remark: '转账', status: 'success', statusText: '成功' },
  { id: 49, date: '2026-04-03', fromAccount: '招商银行储蓄卡', toAccount: '微信零钱', amount: 1800, remark: '零钱', status: 'success', statusText: '成功' },
  { id: 50, date: '2026-04-02', fromAccount: '支付宝余额', toAccount: '工商银行储蓄卡', amount: 5100, remark: '存入', status: 'processing', statusText: '处理中' },
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
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const formatMoney = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handleFilter = () => {
  message.success('查询成功')
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedTransfers.value.map(t => t.id)
  } else {
    selectedIds.value = []
  }
}

const viewDetail = (transfer: any) => {
  message.info(`查看转账详情：${transfer.id}`)
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.filter-bar { margin-bottom: 20px; }
.stat-box { text-align: center; padding: 20px; background: #f8f8f8; border-radius: 8px; }
.stat-title { font-size: 14px; color: #999; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
</style>
