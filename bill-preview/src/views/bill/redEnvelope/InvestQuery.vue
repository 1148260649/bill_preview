<template>
  <div class="page-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-gift"></i> 红包/投资管理</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="layui-card">
        <div class="layui-card-body">
          <div class="stat-item">
            <div class="stat-label">红包收入</div>
            <div class="stat-value text-success">+12,580.00</div>
            <div class="stat-tip">本月累计</div>
          </div>
        </div>
      </div>
      <div class="layui-card">
        <div class="layui-card-body">
          <div class="stat-item">
            <div class="stat-label">红包支出</div>
            <div class="stat-value text-danger">-8,650.00</div>
            <div class="stat-tip">本月累计</div>
          </div>
        </div>
      </div>
      <div class="layui-card">
        <div class="layui-card-body">
          <div class="stat-item">
            <div class="stat-label">投资总额</div>
            <div class="stat-value">125,000.00</div>
            <div class="stat-tip">当前持仓</div>
          </div>
        </div>
      </div>
      <div class="layui-card">
        <div class="layui-card-body">
          <div class="stat-item">
            <div class="stat-label">投资收益</div>
            <div class="stat-value text-success">+15,680.00</div>
            <div class="stat-tip">累计收益</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="filter-bar">
      <div class="layui-form layui-form-pane" style="display: flex; gap: 12px; align-items: center;">
        <div class="layui-form-item" style="margin: 0;">
          <label class="layui-form-label">类型</label>
          <div class="layui-input-block" style="margin-left: 80px; width: 150px;">
            <select v-model="filters.type" lay-filter="type">
              <option value="">全部</option>
              <option value="income">红包收入</option>
              <option value="expense">红包支出</option>
              <option value="investment">投资</option>
            </select>
          </div>
        </div>
        <div class="layui-form-item" style="margin: 0;">
          <label class="layui-form-label">状态</label>
          <div class="layui-input-block" style="margin-left: 80px; width: 150px;">
            <select v-model="filters.status" lay-filter="status">
              <option value="">全部</option>
              <option value="1">已处理</option>
              <option value="0">未处理</option>
            </select>
          </div>
        </div>
        <div class="layui-form-item" style="margin: 0;">
          <div class="layui-input-inline" style="width: 200px;">
            <input type="text" class="layui-input" v-model="filters.dateRange" placeholder="日期范围" />
          </div>
        </div>
        <button class="layui-btn layui-btn-sm" @click="handleFilter">
          <i class="layui-icon layui-icon-search"></i> 查询
        </button>
        <button class="layui-btn layui-btn-sm layui-btn-primary" @click="resetFilter">
          <i class="layui-icon layui-icon-refresh"></i> 重置
        </button>
        <button class="layui-btn layui-btn-sm layui-btn-normal" @click="showAddModal" style="margin-left: auto;">
          <i class="layui-icon layui-icon-add-1"></i> 新增记录
        </button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="layui-card">
      <div class="layui-card-body" style="padding: 0;">
        <table class="layui-table">
          <thead>
            <tr>
              <th width="50"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>日期</th>
              <th>类型</th>
              <th>金额</th>
              <th>来源/去向</th>
              <th>备注</th>
              <th>状态</th>
              <th width="150">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in paginatedRecords" :key="record.id">
              <td><input type="checkbox" v-model="selectedIds" :value="record.id" /></td>
              <td>{{ record.date }}</td>
              <td>
                <span class="layui-badge" :class="getTypeBadge(record.type)">
                  {{ record.typeText }}
                </span>
              </td>
              <td>
                <span :class="record.amount > 0 ? 'text-success' : 'text-danger'">
                  {{ record.amount > 0 ? '+' : '' }}{{ formatMoney(record.amount) }}
                </span>
              </td>
              <td>{{ record.source }}</td>
              <td>{{ record.remark }}</td>
              <td>
                <span class="layui-badge layui-bg-green" v-if="record.status === '1'">已处理</span>
                <span class="layui-badge layui-bg-gray" v-else>未处理</span>
              </td>
              <td>
                <button class="layui-btn layui-btn-xs layui-btn-primary" @click="editRecord(record)">编辑</button>
                <button class="layui-btn layui-btn-xs layui-btn-primary" @click="toggleStatus(record)">状态</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="layui-card-body" style="border-top: 1px solid #e6e6e6; display: flex; justify-content: space-between; align-items: center;">
        <div class="layui-table-info">
          <p class="layui-table-cell">共 {{ totalRecords }} 条，每页 {{ pageSize }} 条，第 {{ currentPage }} 页</p>
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
  { id: 6, date: '2026-05-16', type: 'expense', typeText: '红包支出', amount: -300, source: '赵六', remark: '生日红包', status: '1' },
  { id: 7, date: '2026-05-15', type: 'income', typeText: '红包收入', amount: 800, source: '钱七', remark: '满月红包', status: '1' },
  { id: 8, date: '2026-05-14', type: 'investment', typeText: '投资', amount: -15000, source: '证券账户', remark: '股票投资', status: '1' },
  { id: 9, date: '2026-05-13', type: 'expense', typeText: '红包支出', amount: -500, source: '孙八', remark: '新年红包', status: '1' },
  { id: 10, date: '2026-05-12', type: 'income', typeText: '红包收入', amount: 600, source: '周九', remark: '节日红包', status: '0' },
  { id: 11, date: '2026-05-11', type: 'investment', typeText: '投资', amount: -8000, source: '微信', remark: '理财通', status: '1' },
  { id: 12, date: '2026-05-10', type: 'expense', typeText: '红包支出', amount: -400, source: '吴十', remark: '贺喜红包', status: '1' },
  { id: 13, date: '2026-05-09', type: 'income', typeText: '红包收入', amount: 1200, source: '郑十一', remark: '升迁红包', status: '1' },
  { id: 14, date: '2026-05-08', type: 'investment', typeText: '投资', amount: -20000, source: '支付宝', remark: '黄金积存', status: '1' },
  { id: 15, date: '2026-05-07', type: 'expense', typeText: '红包支出', amount: -350, source: '王十二', remark: '慰问红包', status: '0' },
  { id: 16, date: '2026-05-06', type: 'income', typeText: '红包收入', amount: 700, source: '刘十三', remark: '感谢红包', status: '1' },
  { id: 17, date: '2026-05-05', type: 'investment', typeText: '投资', amount: -6000, source: '银行 APP', remark: '定期存款', status: '1' },
  { id: 18, date: '2026-05-04', type: 'expense', typeText: '红包支出', amount: -250, source: '陈十四', remark: '鼓励红包', status: '1' },
  { id: 19, date: '2026-05-03', type: 'income', typeText: '红包收入', amount: 900, source: '杨十五', remark: '获奖红包', status: '1' },
  { id: 20, date: '2026-05-02', type: 'investment', typeText: '投资', amount: -12000, source: '证券账户', remark: '基金申购', status: '1' },
  { id: 21, date: '2026-05-01', type: 'expense', typeText: '红包支出', amount: -450, source: '赵十六', remark: '节日红包', status: '1' },
  { id: 22, date: '2026-04-30', type: 'income', typeText: '红包收入', amount: 550, source: '钱十七', remark: '日常红包', status: '1' },
  { id: 23, date: '2026-04-29', type: 'investment', typeText: '投资', amount: -9000, source: '支付宝', remark: '余额宝', status: '0' },
  { id: 24, date: '2026-04-28', type: 'expense', typeText: '红包支出', amount: -280, source: '孙十八', remark: '问候红包', status: '1' },
  { id: 25, date: '2026-04-27', type: 'income', typeText: '红包收入', amount: 1100, source: '李十九', remark: '庆祝红包', status: '1' },
  { id: 26, date: '2026-04-26', type: 'investment', typeText: '投资', amount: -7000, source: '微信', remark: '零钱通', status: '1' },
  { id: 27, date: '2026-04-25', type: 'expense', typeText: '红包支出', amount: -320, source: '周二十', remark: '祝福红包', status: '1' },
  { id: 28, date: '2026-04-24', type: 'income', typeText: '红包收入', amount: 650, source: '吴二一', remark: '心意红包', status: '1' },
  { id: 29, date: '2026-04-23', type: 'investment', typeText: '投资', amount: -11000, source: '银行 APP', remark: '理财产品', status: '1' },
  { id: 30, date: '2026-04-22', type: 'expense', typeText: '红包支出', amount: -380, source: '郑二二', remark: '感谢红包', status: '0' },
  { id: 31, date: '2026-04-21', type: 'income', typeText: '红包收入', amount: 750, source: '王二三', remark: '节日红包', status: '1' },
  { id: 32, date: '2026-04-20', type: 'investment', typeText: '投资', amount: -8500, source: '支付宝', remark: '基金定投', status: '1' },
  { id: 33, date: '2026-04-19', type: 'expense', typeText: '红包支出', amount: -290, source: '赵二四', remark: '新婚红包', status: '1' },
  { id: 34, date: '2026-04-18', type: 'income', typeText: '红包收入', amount: 950, source: '钱二五', remark: '生日红包', status: '1' },
  { id: 35, date: '2026-04-17', type: 'investment', typeText: '投资', amount: -13000, source: '证券账户', remark: '股票买卖', status: '1' },
  { id: 36, date: '2026-04-16', type: 'expense', typeText: '红包支出', amount: -410, source: '孙二六', remark: '满月红包', status: '0' },
  { id: 37, date: '2026-04-15', type: 'income', typeText: '红包收入', amount: 850, source: '李二七', remark: '乔迁红包', status: '1' },
  { id: 38, date: '2026-04-14', type: 'investment', typeText: '投资', amount: -9500, source: '微信', remark: '理财通', status: '1' },
  { id: 39, date: '2026-04-13', type: 'expense', typeText: '红包支出', amount: -330, source: '周二八', remark: '祝贺红包', status: '1' },
  { id: 40, date: '2026-04-12', type: 'income', typeText: '红包收入', amount: 720, source: '吴二九', remark: '感谢红包', status: '1' },
  { id: 41, date: '2026-04-11', type: 'investment', typeText: '投资', amount: -10500, source: '银行 APP', remark: '定期理财', status: '1' },
  { id: 42, date: '2026-04-10', type: 'expense', typeText: '红包支出', amount: -360, source: '郑三十', remark: '慰问红包', status: '0' },
  { id: 43, date: '2026-04-09', type: 'income', typeText: '红包收入', amount: 680, source: '王三一', remark: '祝福红包', status: '1' },
  { id: 44, date: '2026-04-08', type: 'investment', typeText: '投资', amount: -7500, source: '支付宝', remark: '黄金积存', status: '1' },
  { id: 45, date: '2026-04-07', type: 'expense', typeText: '红包支出', amount: -270, source: '赵三二', remark: '日常红包', status: '1' },
  { id: 46, date: '2026-04-06', type: 'income', typeText: '红包收入', amount: 820, source: '钱三三', remark: '心意红包', status: '1' },
  { id: 47, date: '2026-04-05', type: 'investment', typeText: '投资', amount: -11500, source: '证券账户', remark: '基金赎回', status: '1' },
  { id: 48, date: '2026-04-04', type: 'expense', typeText: '红包支出', amount: -390, source: '孙三四', remark: '节日红包', status: '1' },
  { id: 49, date: '2026-04-03', type: 'income', typeText: '红包收入', amount: 560, source: '李三五', remark: '鼓励红包', status: '0' },
  { id: 50, date: '2026-04-02', type: 'investment', typeText: '投资', amount: -6500, source: '微信', remark: '零钱通', status: '1' },
])

const totalRecords = computed(() => records.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return records.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages = []
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

const handleFilter = () => {
  message.success('查询成功')
}

const resetFilter = () => {
  filters.type = ''
  filters.status = ''
  filters.dateRange = ''
  message.info('已重置')
}

const showAddModal = () => {
  message.info('新增记录功能开发中')
}

const editRecord = (record: any) => {
  message.info(`编辑记录：${record.id}`)
}

const toggleStatus = (record: any) => {
  record.status = record.status === '1' ? '0' : '1'
  message.success(record.status === '1' ? '已标记为已处理' : '已标记为未处理')
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedRecords.value.map(r => r.id)
  } else {
    selectedIds.value = []
  }
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
.stats-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-item { text-align: center; }
.stat-label { font-size: 14px; color: #999; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 4px; }
.stat-tip { font-size: 12px; color: #bbb; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
.filter-bar { margin-bottom: 20px; }
</style>
