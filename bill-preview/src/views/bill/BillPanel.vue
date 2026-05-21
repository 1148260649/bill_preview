<template>
  <div class="bill-panel-container">
    <div class="panel-header">
      <h2>总账单看板</h2>
      <div class="panel-tabs">
        <div 
          class="tab-btn"
          :class="{ active: viewMode === 'day' }"
          @click="viewMode = 'day'"
        >
          日视图
        </div>
        <div 
          class="tab-btn"
          :class="{ active: viewMode === 'month' }"
          @click="viewMode = 'month'"
        >
          月视图
        </div>
        <div 
          class="tab-btn"
          :class="{ active: viewMode === 'year' }"
          @click="viewMode = 'year'"
        >
          年视图
        </div>
      </div>
    </div>

    <!-- 汇总数据 -->
    <div class="summary-cards">
      <div class="summary-card income">
        <div class="card-icon"><i class="layui-icon layui-icon-dollar"></i></div>
        <div class="card-content">
          <div class="card-label">总收入</div>
          <div class="card-value text-success">¥ {{ summary.income }}</div>
          <div class="card-trend trend-up">
            <i class="layui-icon layui-icon-up"></i>
            <span>较上期 +{{ summary.incomeTrend }}%</span>
          </div>
        </div>
      </div>
      <div class="summary-card expense">
        <div class="card-icon"><i class="layui-icon layui-icon-chart"></i></div>
        <div class="card-content">
          <div class="card-label">总支出</div>
          <div class="card-value text-danger">¥ {{ summary.expense }}</div>
          <div class="card-trend trend-down">
            <i class="layui-icon layui-icon-down"></i>
            <span>较上期 -{{ summary.expenseTrend }}%</span>
          </div>
        </div>
      </div>
      <div class="summary-card balance">
        <div class="card-icon"><i class="layui-icon layui-icon-rmb"></i></div>
        <div class="card-content">
          <div class="card-label">结余</div>
          <div class="card-value text-primary">¥ {{ summary.balance }}</div>
          <div class="card-trend">
            <span>储蓄率 {{ summary.savingRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <div class="chart-card wide">
        <div class="card-header">
          <h3><i class="layui-icon layui-icon-chart"></i> 收支对比趋势</h3>
        </div>
        <div class="card-body">
          <div ref="barChartRef" class="chart-container"></div>
        </div>
      </div>
      <div class="chart-card">
        <div class="card-header">
          <h3><i class="layui-icon layui-icon-pie"></i> 支付方式分布</h3>
        </div>
        <div class="card-body">
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <div class="card-header">
          <h3><i class="layui-icon layui-icon-template"></i> 支出分类占比</h3>
        </div>
        <div class="card-body">
          <div ref="categoryChartRef" class="chart-container"></div>
        </div>
      </div>
      <div class="chart-card">
        <div class="card-header">
          <h3><i class="layui-icon layui-icon-chart-line"></i> 余额趋势</h3>
        </div>
        <div class="card-body">
          <div ref="lineChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 账单列表 -->
    <div class="bill-list-section">
      <div class="list-header">
        <h3><i class="layui-icon layui-icon-list"></i> 账单明细</h3>
        <div class="list-actions">
          <div class="search-box">
            <input 
              class="layui-input" 
              placeholder="搜索备注、分类..." 
              v-model="searchText"
              @keyup.enter="handleSearch"
            />
            <button class="layui-btn layui-btn-sm layui-btn-primary" @click="handleSearch">
              <i class="layui-icon layui-icon-search"></i>
            </button>
          </div>
          <button class="layui-btn layui-btn-primary" @click="showAddBill">
            <i class="layui-icon layui-icon-add-1"></i> 记一笔
          </button>
          <button class="layui-btn layui-btn-primary" @click="exportData">
            <i class="layui-icon layui-icon-export"></i> 导出
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-item">
          <label>类型:</label>
          <select class="layui-select" v-model="filters.type">
            <option value="">全部</option>
            <option value="收入">收入</option>
            <option value="支出">支出</option>
          </select>
        </div>
        <div class="filter-item">
          <label>分类:</label>
          <select class="layui-select" v-model="filters.category">
            <option value="">全部</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label>支付方式:</label>
          <select class="layui-select" v-model="filters.paymentMethod">
            <option value="">全部</option>
            <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label>日期范围:</label>
          <input type="text" class="layui-input" v-model="filters.startDate" placeholder="选择开始日期" style="width: 140px;" />
          <span>至</span>
          <input type="text" class="layui-input" v-model="filters.endDate" placeholder="选择结束日期" style="width: 140px;" />
        </div>
        <button class="layui-btn layui-btn-sm" @click="handleFilter">查询</button>
        <button class="layui-btn layui-btn-sm layui-btn-primary" @click="resetFilter">重置</button>
      </div>

      <div class="table-wrapper">
        <table class="layui-table">
          <thead>
            <tr>
              <th><input type="checkbox" @change="toggleSelectAll" v-model="selectAll" /></th>
              <th @click="sort('date')" style="cursor: pointer;">
                日期 <i class="layui-icon layui-icon-triangle-d"></i>
              </th>
              <th>类型</th>
              <th>分类</th>
              <th>金额</th>
              <th>支付方式</th>
              <th>账户</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bill in paginatedBills" :key="bill.id">
              <td><input type="checkbox" v-model="selectedBills" :value="bill.id" /></td>
              <td>{{ bill.date }}</td>
              <td>
                <span class="type-tag" :class="bill.type === '收入' ? 'tag-income' : 'tag-expense'">
                  {{ bill.type }}
                </span>
              </td>
              <td>
                <span class="category-tag" :style="{ backgroundColor: categoryColors[bill.category] }">
                  {{ bill.category }}
                </span>
              </td>
              <td :class="bill.type === '支出' ? 'text-danger' : 'text-success'" style="font-weight: 600;">
                {{ bill.type === '支出' ? '-' : '+' }}{{ formatMoney(bill.amount) }}
              </td>
              <td>
                <i :class="getPaymentIcon(bill.paymentMethod)"></i> {{ bill.paymentMethod }}
              </td>
              <td>{{ bill.account }}</td>
              <td>{{ bill.remark }}</td>
              <td>
                <button class="layui-btn layui-btn-xs layui-btn-primary" @click="editBill(bill)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
                <button class="layui-btn layui-btn-xs layui-btn-danger" @click="deleteBill(bill)">
                  <i class="layui-icon layui-icon-delete"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <div class="pagination-info">
          共 {{ totalBills }} 条，每页 {{ pageSize }} 条，第 {{ currentPage }} 页
        </div>
        <div class="pagination-control">
          <button 
            class="layui-btn layui-btn-sm layui-btn-primary" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <button 
            v-for="page in displayPages" 
            :key="page"
            class="layui-btn layui-btn-sm"
            :class="page === currentPage ? '' : 'layui-btn-primary'"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button 
            class="layui-btn layui-btn-sm layui-btn-primary"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 记账弹窗 -->
    <div v-if="showBillModal" class="modal-overlay" @click.self="closeBillModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>{{ editMode ? '编辑账单' : '记一笔' }}</h4>
          <button class="modal-close" @click="closeBillModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="bill-form">
            <div class="form-row">
              <div class="form-item">
                <label>类型 <span class="required">*</span></label>
                <div class="type-selector">
                  <button 
                    class="type-btn" 
                    :class="{ active: billForm.type === '支出' }"
                    @click="billForm.type = '支出'"
                  >
                    <i class="layui-icon layui-icon-chart"></i> 支出
                  </button>
                  <button 
                    class="type-btn" 
                    :class="{ active: billForm.type === '收入' }"
                    @click="billForm.type = '收入'"
                  >
                    <i class="layui-icon layui-icon-dollar"></i> 收入
                  </button>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>金额 <span class="required">*</span></label>
                <input 
                  type="number" 
                  class="layui-input" 
                  v-model="billForm.amount"
                  placeholder="请输入金额"
                />
              </div>
              <div class="form-item">
                <label>日期</label>
                <input 
                  type="text" 
                  class="layui-input" 
                  v-model="billForm.date"
                  placeholder="选择日期"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>分类 <span class="required">*</span></label>
                <select class="layui-select" v-model="billForm.category">
                  <option value="">请选择分类</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-item">
                <label>支付方式</label>
                <select class="layui-select" v-model="billForm.paymentMethod">
                  <option value="">请选择</option>
                  <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item full-width">
                <label>账户</label>
                <select class="layui-select" v-model="billForm.account">
                  <option value="">请选择账户</option>
                  <option v-for="acc in accounts" :key="acc" :value="acc">{{ acc }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item full-width">
                <label>备注</label>
                <textarea 
                  class="layui-textarea" 
                  v-model="billForm.remark"
                  placeholder="请输入备注信息"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="layui-btn layui-btn-primary" @click="closeBillModal">取消</button>
          <button class="layui-btn layui-btn-normal" @click="saveBill">保存草稿</button>
          <button class="layui-btn" @click="submitBill">确认记账</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, reactive, watch } from 'vue'
import * as echarts from 'echarts'
declare const layui: any

const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

const viewMode = ref<'day' | 'month' | 'year'>('month')
const searchText = ref('')
const selectAll = ref(false)
const selectedBills = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const barChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const categoryChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()

const showBillModal = ref(false)
const editMode = ref(false)

const billForm = reactive({
  type: '支出',
  amount: '',
  date: '',
  category: '',
  paymentMethod: '',
  account: '',
  remark: ''
})

const summary = ref({
  income: '25,680.00',
  expense: '8,320.50',
  balance: '17,359.50',
  incomeTrend: 12.5,
  expenseTrend: 3.2,
  savingRate: 67.6
})

const categories = ref(['餐饮', '购物', '居住', '交通', '娱乐', '医疗', '教育', '工资', '奖金', '其他'])

const paymentMethods = ref(['支付宝', '微信', '银行卡', '现金', '信用卡', '花呗', '京东白条'])

const accounts = ref(['招商银行储蓄卡', '工商银行储蓄卡', '信用卡 - 招商', '现金账户', '支付宝余额'])

const categoryColors: Record<string, string> = {
  '餐饮': '#ff6b6b',
  '购物': '#4ecdc4',
  '居住': '#45b7d1',
  '交通': '#96ceb4',
  '娱乐': '#ffeaa7',
  '医疗': '#dfe6e9',
  '教育': '#a29bfe',
  '工资': '#00b894',
  '奖金': '#fdcb6e',
  '其他': '#636e72'
}

const bills = ref([
  { id: 1, date: '2026-05-21', type: '支出', amount: 128.00, category: '购物', paymentMethod: '支付宝', account: '支付宝余额', remark: '超市购物' },
  { id: 2, date: '2026-05-20', type: '收入', amount: 8500.00, category: '工资', paymentMethod: '银行卡', account: '招商银行储蓄卡', remark: '5 月工资' },
  { id: 3, date: '2026-05-19', type: '支出', amount: 2680.00, category: '居住', paymentMethod: '信用卡', account: '信用卡 - 招商', remark: '房租' },
  { id: 4, date: '2026-05-18', type: '支出', amount: 56.80, category: '餐饮', paymentMethod: '微信', account: '微信零钱', remark: '午餐' },
  { id: 5, date: '2026-05-17', type: '支出', amount: 320.00, category: '交通', paymentMethod: '支付宝', account: '支付宝余额', remark: '加油' },
  { id: 6, date: '2026-05-16', type: '支出', amount: 158.00, category: '娱乐', paymentMethod: '微信', account: '微信零钱', remark: '电影票' },
  { id: 7, date: '2026-05-15', type: '收入', amount: 500.00, category: '奖金', paymentMethod: '微信', account: '微信零钱', remark: '兼职设计费' },
  { id: 8, date: '2026-05-14', type: '支出', amount: 89.00, category: '餐饮', paymentMethod: '支付宝', account: '支付宝余额', remark: '晚餐' },
  { id: 9, date: '2026-05-13', type: '支出', amount: 256.00, category: '购物', paymentMethod: '花呗', account: '花呗', remark: '衣服' },
  { id: 10, date: '2026-05-12', type: '支出', amount: 45.00, category: '交通', paymentMethod: '微信', account: '微信零钱', remark: '地铁充值' },
  { id: 11, date: '2026-05-11', type: '支出', amount: 199.00, category: '数码', paymentMethod: '信用卡', account: '信用卡 - 建行', remark: '鼠标' },
  { id: 12, date: '2026-05-10', type: '支出', amount: 78.50, category: '餐饮', paymentMethod: '支付宝', account: '支付宝余额', remark: '朋友聚餐' },
  { id: 13, date: '2026-05-09', type: '支出', amount: 1500.00, category: '医疗', paymentMethod: '医保卡', account: '医疗保险', remark: '体检费用' },
  { id: 14, date: '2026-05-08', type: '支出', amount: 299.00, category: '学习', paymentMethod: '微信', account: '微信零钱', remark: '在线课程' },
  { id: 15, date: '2026-05-07', type: '收入', amount: 200.00, category: '其他', paymentMethod: '支付宝', account: '支付宝余额', remark: '二手物品出售' },
  { id: 16, date: '2026-05-06', type: '支出', amount: 68.00, category: '餐饮', paymentMethod: '微信', account: '微信零钱', remark: '奶茶咖啡' },
  { id: 17, date: '2026-05-05', type: '支出', amount: 420.00, category: '居住', paymentMethod: '支付宝', account: '支付宝余额', remark: '水电费' },
  { id: 18, date: '2026-05-04', type: '支出', amount: 88.00, category: '娱乐', paymentMethod: '花呗', account: '花呗', remark: '视频会员' },
  { id: 19, date: '2026-05-03', type: '支出', amount: 156.00, category: '交通', paymentMethod: '信用卡', account: '信用卡 - 招商', remark: '高铁票' },
  { id: 20, date: '2026-05-02', type: '支出', amount: 358.00, category: '购物', paymentMethod: '京东白条', account: '京东白条', remark: '日用品采购' },
  { id: 21, date: '2026-05-01', type: '收入', amount: 8500.00, category: '工资', paymentMethod: '银行卡', account: '招商银行储蓄卡', remark: '4 月工资' },
  { id: 22, date: '2026-04-30', type: '支出', amount: 1890.00, category: '居住', paymentMethod: '银行卡', account: '招商银行储蓄卡', remark: '季度物业费' },
  { id: 23, date: '2026-04-29', type: '支出', amount: 76.00, category: '餐饮', paymentMethod: '微信', account: '微信零钱', remark: '早餐一周' },
  { id: 24, date: '2026-04-28', type: '支出', amount: 2560.00, category: '数码', paymentMethod: '信用卡', account: '信用卡 - 招商', remark: '耳机' },
  { id: 25, date: '2026-04-27', type: '支出', amount: 45.00, category: '交通', paymentMethod: '支付宝', account: '支付宝余额', remark: '打车' },
  { id: 26, date: '2026-04-26', type: '支出', amount: 320.00, category: '娱乐', paymentMethod: '微信', account: '微信零钱', remark: 'KTV 聚会' },
  { id: 27, date: '2026-04-25', type: '收入', amount: 1000.00, category: '奖金', paymentMethod: '银行卡', account: '招商银行储蓄卡', remark: '项目奖金' },
  { id: 28, date: '2026-04-24', type: '支出', amount: 128.00, category: '餐饮', paymentMethod: '支付宝', account: '支付宝余额', remark: '火锅' },
  { id: 29, date: '2026-04-23', type: '支出', amount: 599.00, category: '购物', paymentMethod: '花呗', account: '花呗', remark: '运动鞋' },
  { id: 30, date: '2026-04-22', type: '支出', amount: 30.00, category: '交通', paymentMethod: '微信', account: '微信零钱', remark: '共享单车月卡' },
  { id: 31, date: '2026-04-21', type: '支出', amount: 168.00, category: '学习', paymentMethod: '支付宝', account: '支付宝余额', remark: '书籍购买' },
  { id: 32, date: '2026-04-20', type: '支出', amount: 88.00, category: '餐饮', paymentMethod: '微信', account: '微信零钱', remark: '午餐聚餐' },
  { id: 33, date: '2026-04-19', type: '支出', amount: 2100.00, category: '医疗', paymentMethod: '银行卡', account: '工商银行储蓄卡', remark: '牙齿治疗' },
  { id: 34, date: '2026-04-18', type: '支出', amount: 150.00, category: '居住', paymentMethod: '支付宝', account: '支付宝余额', remark: '网络费' },
  { id: 35, date: '2026-04-17', type: '收入', amount: 300.00, category: '其他', paymentMethod: '微信', account: '微信零钱', remark: '红包收入' },
  { id: 36, date: '2026-04-16', type: '支出', amount: 58.00, category: '餐饮', paymentMethod: '花呗', account: '花呗', remark: '下午茶' },
  { id: 37, date: '2026-04-15', type: '支出', amount: 890.00, category: '购物', paymentMethod: '信用卡', account: '信用卡 - 建行', remark: '护肤品' },
  { id: 38, date: '2026-04-14', type: '支出', amount: 45.00, category: '娱乐', paymentMethod: '微信', account: '微信零钱', remark: '游戏充值' },
  { id: 39, date: '2026-04-13', type: '支出', amount: 280.00, category: '交通', paymentMethod: '支付宝', account: '支付宝余额', remark: '机场接送' },
  { id: 40, date: '2026-04-12', type: '支出', amount: 198.00, category: '数码', paymentMethod: '京东白条', account: '京东白条', remark: '手机壳' },
  { id: 41, date: '2026-04-11', type: '支出', amount: 66.00, category: '餐饮', paymentMethod: '微信', account: '微信零钱', remark: '外卖' },
  { id: 42, date: '2026-04-10', type: '支出', amount: 1200.00, category: '学习', paymentMethod: '银行卡', account: '招商银行储蓄卡', remark: '培训课程' },
  { id: 43, date: '2026-04-09', type: '支出', amount: 350.00, category: '居住', paymentMethod: '支付宝', account: '支付宝余额', remark: '燃气费' },
  { id: 44, date: '2026-04-08', type: '支出', amount: 79.00, category: '娱乐', paymentMethod: '花呗', account: '花呗', remark: '演出票' },
  { id: 45, date: '2026-04-07', type: '支出', amount: 235.00, category: '购物', paymentMethod: '信用卡', account: '信用卡 - 招商', remark: '背包' },
  { id: 46, date: '2026-04-06', type: '支出', amount: 52.00, category: '交通', paymentMethod: '微信', account: '微信零钱', remark: '公交地铁' },
  { id: 47, date: '2026-04-05', type: '收入', amount: 150.00, category: '其他', paymentMethod: '支付宝', account: '支付宝余额', remark: '废品回收' },
  { id: 48, date: '2026-04-04', type: '支出', amount: 145.00, category: '餐饮', paymentMethod: '支付宝', account: '支付宝余额', remark: '烧烤' },
  { id: 49, date: '2026-04-03', type: '支出', amount: 680.00, category: '医疗', paymentMethod: '医保卡', account: '医疗保险', remark: '药品购买' },
  { id: 50, date: '2026-04-02', type: '支出', amount: 99.00, category: '学习', paymentMethod: '微信', account: '微信零钱', remark: '杂志订阅' },
])

const filters = reactive({
  type: '',
  category: '',
  paymentMethod: '',
  startDate: '',
  endDate: ''
})

const filteredBills = computed(() => {
  return bills.value.filter(bill => {
    if (filters.type && bill.type !== filters.type) return false
    if (filters.category && bill.category !== filters.category) return false
    if (filters.paymentMethod && bill.paymentMethod !== filters.paymentMethod) return false
    if (filters.startDate && bill.date < filters.startDate) return false
    if (filters.endDate && bill.date > filters.endDate) return false
    if (searchText.value && !bill.remark.includes(searchText.value)) return false
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
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const getPaymentIcon = (method: string) => {
  const icons: Record<string, string> = {
    '支付宝': 'layui-icon layui-icon-dialogue',
    '微信': 'layui-icon layui-icon-wechat',
    '银行卡': 'layui-icon layui-icon-card',
    '现金': 'layui-icon layui-icon-rmb',
    '信用卡': 'layui-icon layui-icon-dollar',
    '花呗': 'layui-icon layui-icon-cart',
    '京东白条': 'layui-icon layui-icon-cart'
  }
  return icons[method] || 'layui-icon layui-icon-ok'
}

const formatMoney = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const showAddBill = () => {
  editMode.value = false
  Object.assign(billForm, {
    type: '支出',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paymentMethod: '',
    account: '',
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
  const index = bills.value.findIndex(b => b.id === bill.id)
  if (index !== -1) {
    bills.value.splice(index, 1)
    message.success('删除成功')
  }
}

const closeBillModal = () => {
  showBillModal.value = false
}

const submitBill = () => {
  if (!billForm.amount || !billForm.category) {
    message.warning('请填写必填项')
    return
  }
  
  if (editMode.value) {
    const index = bills.value.findIndex(b => b.id === 1)
    if (index !== -1) {
      bills.value[index] = { ...bills.value[index], ...billForm, amount: parseFloat(billForm.amount) }
    }
    message.success('更新成功')
  } else {
    bills.value.unshift({
      id: Date.now(),
      type: billForm.type,
      amount: parseFloat(billForm.amount),
      date: billForm.date,
      category: billForm.category,
      paymentMethod: billForm.paymentMethod || '现金',
      account: billForm.account || '现金账户',
      remark: billForm.remark
    })
    message.success('记账成功')
  }
  
  closeBillModal()
}

const saveBill = () => {
  message.success('已保存为草稿')
  closeBillModal()
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
  message.success('查询成功')
}

const resetFilter = () => {
  Object.assign(filters, {
    type: '',
    category: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  })
  searchText.value = ''
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedBills.value = filteredBills.value.map(b => b.id)
  } else {
    selectedBills.value = []
  }
}

const changePage = (page: number) => {
  currentPage.value = page
}

const sort = (field: string) => {
  bills.value.sort((a, b) => b.date.localeCompare(a.date))
}

const exportData = () => {
  message.success('导出功能开发中')
}

const initCharts = () => {
  initBarChart()
  initPieChart()
  initCategoryChart()
  initLineChart()
}

const initBarChart = () => {
  if (!barChartRef.value) return
  const chart = echarts.init(barChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['收入', '支出'] },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['1 日', '2 日', '3 日', '4 日', '5 日', '6 日', '7 日'] },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'bar', smooth: true, data: [1200, 2000, 1500, 800, 700, 1100, 1300], itemStyle: { color: '#16baaa' } },
      { name: '支出', type: 'bar', smooth: true, data: [800, 600, 1200, 900, 500, 700, 900], itemStyle: { color: '#ff5722' } }
    ]
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'middle' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['65%', '50%'],
      data: [
        { value: 3580, name: '支付宝', itemStyle: { color: '#16baaa' } },
        { value: 2450, name: '微信', itemStyle: { color: '#07c160' } },
        { value: 1820, name: '银行卡', itemStyle: { color: '#1e9fff' } },
        { value: 980, name: '现金', itemStyle: { color: '#ffb800' } },
        { value: 650, name: '信用卡', itemStyle: { color: '#ff5722' } }
      ]
    }]
  })
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  const chart = echarts.init(categoryChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      data: [
        { value: 2680, name: '居住', itemStyle: { color: '#45b7d1' } },
        { value: 856, name: '餐饮', itemStyle: { color: '#ff6b6b' } },
        { value: 384, name: '购物', itemStyle: { color: '#4ecdc4' } },
        { value: 365, name: '交通', itemStyle: { color: '#96ceb4' } },
        { value: 158, name: '娱乐', itemStyle: { color: '#ffeaa7' } }
      ]
    }]
  })
}

const initLineChart = () => {
  if (!lineChartRef.value) return
  const chart = echarts.init(lineChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
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

watch(viewMode, () => {
  const modeText = viewMode.value === 'day' ? '日' : viewMode.value === 'month' ? '月' : '年'
  message.success(`切换到${modeText}视图`)
  nextTick(() => {
    initCharts()
  })
})

onMounted(() => {
  nextTick(() => {
    initCharts()
    
    window.addEventListener('resize', () => {
      barChartRef.value && echarts.getInstanceByDom(barChartRef.value)?.resize()
      pieChartRef.value && echarts.getInstanceByDom(pieChartRef.value)?.resize()
      categoryChartRef.value && echarts.getInstanceByDom(categoryChartRef.value)?.resize()
      lineChartRef.value && echarts.getInstanceByDom(lineChartRef.value)?.resize()
    })
  })
})
</script>

<style scoped>
.bill-panel-container {
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  background: #fff;
  border: 1px solid #e6e6e6;
}

.tab-btn:hover {
  color: #16baaa;
  border-color: #16baaa;
}

.tab-btn.active {
  background: #16baaa;
  color: #fff;
  border-color: #16baaa;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.income .card-icon { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); }
.expense .card-icon { background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%); }
.balance .card-icon { background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%); }

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

.trend-up { color: #16b777; }
.trend-down { color: #ff5722; }

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

.card-header h3 {
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-body {
  min-height: 300px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.bill-list-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-box input {
  width: 240px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  color: #666;
  font-size: 14px;
}

.filter-item .layui-select {
  width: 120px;
}

.table-wrapper {
  overflow-x: auto;
}

.type-tag, .category-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.tag-income {
  background: #e8f6f3;
  color: #16baaa;
}

.tag-expense {
  background: #ffece6;
  color: #ff5722;
}

.text-success { color: #16b777; }
.text-danger { color: #ff5722; }

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e6e6e6;
}

.pagination-info {
  color: #999;
  font-size: 13px;
}

.pagination-control {
  display: flex;
  gap: 8px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: #fff;
  border-radius: 12px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e6e6e6;
}

.modal-header h4 {
  font-size: 18px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f5f5f5;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e6e6e6;
}

.bill-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  flex-basis: 100%;
}

.form-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.required {
  color: #ff5722;
}

.type-selector {
  display: flex;
  gap: 12px;
}

.type-btn {
  flex: 1;
  padding: 16px;
  border: 2px solid #e6e6e6;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.type-btn:hover {
  border-color: #16baaa;
  color: #16baaa;
}

.type-btn.active {
  border-color: #16baaa;
  background: #e8f6f3;
  color: #16baaa;
}

.type-btn i {
  font-size: 18px;
}
</style>
