<template>
  <div class="salary-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-dollar"></i> 工资管理</h2>
      <div class="header-actions">
        <button class="layui-btn layui-btn-primary" @click="showAddModal">
          <i class="layui-icon layui-icon-add-1"></i> 添加工资记录
        </button>
        <button class="layui-btn layui-btn-primary" @click="exportSalary">
          <i class="layui-icon layui-icon-export"></i> 导出
        </button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>月份:</label>
        <input type="month" class="layui-input" v-model="filters.month" style="width: 160px;" />
      </div>
      <div class="filter-item">
        <label>家庭成员:</label>
        <select class="layui-select" v-model="filters.member">
          <option value="">全部</option>
          <option v-for="m in familyMembers" :key="m.id" :value="m.name">{{ m.name }}</option>
        </select>
      </div>
      <div class="filter-item">
        <label>公司:</label>
        <select class="layui-select" v-model="filters.company">
          <option value="">全部</option>
          <option v-for="c in companies" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
      </div>
      <button class="layui-btn layui-btn-sm" @click="handleFilter">
        <i class="layui-icon layui-icon-search"></i> 查询
      </button>
      <button class="layui-btn layui-btn-sm layui-btn-primary" @click="resetFilter">
        <i class="layui-icon layui-icon-refresh"></i> 重置
      </button>
    </div>

    <!-- 汇总卡片 -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">税前工资总额</div>
        <div class="summary-value text-primary">¥ {{ summary.grossTotal }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">税后工资总额</div>
        <div class="summary-value text-success">¥ {{ summary.netTotal }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">公积金总额</div>
        <div class="summary-value text-warning">¥ {{ summary.housingFundTotal }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">社保总额</div>
        <div class="summary-value text-danger">¥ {{ summary.socialSecurityTotal }}</div>
      </div>
    </div>

    <!-- 图表面板 -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="card-header">
          <h3><i class="layui-icon layui-icon-chart"></i> 工资收入趋势</h3>
        </div>
        <div class="card-body">
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </div>
      <div class="chart-card">
        <div class="card-header">
          <h3><i class="layui-icon layui-icon-pie"></i> 工资构成分析</h3>
        </div>
        <div class="card-body">
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 工资明细表格 -->
    <div class="salary-table-wrapper">
      <div class="table-header">
        <h3><i class="layui-icon layui-icon-list"></i> 工资明细</h3>
        <div class="table-actions">
          <button class="layui-btn layui-btn-sm layui-btn-primary" @click="viewSecurityDetail">
            <i class="layui-icon layui-icon-set"></i> 社保明细
          </button>
          <button class="layui-btn layui-btn-sm layui-btn-primary" @click="viewSumReport">
            <i class="layui-icon layui-icon-chart"></i> 汇总报表
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="layui-table">
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>月份</th>
              <th>姓名</th>
              <th>公司</th>
              <th>基本工资</th>
              <th>绩效奖金</th>
              <th>补贴</th>
              <th>加班费</th>
              <th>应发工资</th>
              <th>社保扣款</th>
              <th>公积金</th>
              <th>个税</th>
              <th>实发工资</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="salary in paginatedSalaries" :key="salary.id">
              <td><input type="checkbox" v-model="selectedIds" :value="salary.id" /></td>
              <td>{{ salary.month }}</td>
              <td>{{ salary.name }}</td>
              <td>{{ salary.company }}</td>
              <td>¥ {{ formatNumber(salary.baseSalary) }}</td>
              <td>¥ {{ formatNumber(salary.performance) }}</td>
              <td>¥ {{ formatNumber(salary.allowance) }}</td>
              <td>¥ {{ formatNumber(salary.overtime) }}</td>
              <td class="text-primary font-weight">¥ {{ formatNumber(salary.gross) }}</td>
              <td class="text-danger">-¥ {{ formatNumber(salary.socialSecurity) }}</td>
              <td class="text-warning">-¥ {{ formatNumber(salary.housingFund) }}</td>
              <td class="text-danger">-¥ {{ formatNumber(salary.tax) }}</td>
              <td class="text-success font-weight">¥ {{ formatNumber(salary.net) }}</td>
              <td>
                <button class="layui-btn layui-btn-xs layui-btn-primary" @click="viewDetail(salary)">
                  <i class="layui-icon layui-icon-eye"></i>
                </button>
                <button class="layui-btn layui-btn-xs layui-btn-primary" @click="editSalary(salary)">
                  <i class="layui-icon layui-icon-edit"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <div class="pagination-info">
          共 {{ totalRecords }} 条，第 {{ currentPage }} 页
        </div>
        <div class="pagination-control">
          <button class="layui-btn layui-btn-sm layui-btn-primary" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
          <button class="layui-btn layui-btn-sm" :class="currentPage === 1 ? '' : 'layui-btn-primary'">1</button>
          <button class="layui-btn layui-btn-sm layui-btn-primary" @click="changePage(currentPage + 1)">下一页</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>{{ editMode ? '编辑工资记录' : '添加工资记录' }}</h4>
          <button class="modal-close" @click="closeModal"><i class="layui-icon layui-icon-close"></i></button>
        </div>
        <div class="modal-body">
          <div class="salary-form">
            <div class="form-row">
              <div class="form-item">
                <label>月份 <span class="required">*</span></label>
                <input type="month" class="layui-input" v-model="form.month" />
              </div>
              <div class="form-item">
                <label>姓名 <span class="required">*</span></label>
                <select class="layui-select" v-model="form.name">
                  <option value="">请选择</option>
                  <option v-for="m in familyMembers" :key="m.id" :value="m.name">{{ m.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>公司</label>
                <select class="layui-select" v-model="form.company">
                  <option value="">请选择</option>
                  <option v-for="c in companies" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </div>
              <div class="form-item">
                <label>部门</label>
                <input type="text" class="layui-input" v-model="form.department" />
              </div>
            </div>
            <div class="form-section">
              <h5 class="section-title">收入项</h5>
              <div class="form-row">
                <div class="form-item">
                  <label>基本工资</label>
                  <input type="number" class="layui-input" v-model="form.baseSalary" @input="calculateTotal" />
                </div>
                <div class="form-item">
                  <label>绩效奖金</label>
                  <input type="number" class="layui-input" v-model="form.performance" @input="calculateTotal" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-item">
                  <label>补贴</label>
                  <input type="number" class="layui-input" v-model="form.allowance" @input="calculateTotal" />
                </div>
                <div class="form-item">
                  <label>加班费</label>
                  <input type="number" class="layui-input" v-model="form.overtime" @input="calculateTotal" />
                </div>
              </div>
            </div>
            <div class="form-section">
              <h5 class="section-title">扣款项</h5>
              <div class="form-row">
                <div class="form-item">
                  <label>社保个人部分</label>
                  <input type="number" class="layui-input" v-model="form.socialSecurity" @input="calculateTotal" />
                </div>
                <div class="form-item">
                  <label>公积金个人部分</label>
                  <input type="number" class="layui-input" v-model="form.housingFund" @input="calculateTotal" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-item">
                  <label>个人所得税</label>
                  <input type="number" class="layui-input" v-model="form.tax" @input="calculateTotal" />
                </div>
                <div class="form-item">
                  <label>其他扣款</label>
                  <input type="number" class="layui-input" v-model="form.otherDeduction" @input="calculateTotal" />
                </div>
              </div>
            </div>
            <div class="form-result">
              <div class="result-item">
                <span>应发工资：</span>
                <span class="result-value text-primary">¥ {{ formatNumber(calculateGross()) }}</span>
              </div>
              <div class="result-item">
                <span>实发工资：</span>
                <span class="result-value text-success">¥ {{ formatNumber(calculateNet()) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="layui-btn layui-btn-primary" @click="closeModal">取消</button>
          <button class="layui-btn layui-btn-normal" @click="saveDraft">保存草稿</button>
          <button class="layui-btn" @click="submitForm">确认提交</button>
        </div>
      </div>
    </div>

    <!-- 社保明细弹窗 -->
    <div v-if="showSecurityModal" class="modal-overlay" @click.self="showSecurityModal = false">
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <h4>社保明细</h4>
          <button class="modal-close" @click="showSecurityModal = false"><i class="layui-icon layui-icon-close"></i></button>
        </div>
        <div class="modal-body">
          <table class="layui-table">
            <thead>
              <tr>
                <th>月份</th>
                <th>姓名</th>
                <th>养老保险</th>
                <th>医疗保险</th>
                <th>失业保险</th>
                <th>工伤保险</th>
                <th>生育保险</th>
                <th>合计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in securityData" :key="item.id">
                <td>{{ item.month }}</td>
                <td>{{ item.name }}</td>
                <td>¥ {{ item.pension }}</td>
                <td>¥ {{ item.medical }}</td>
                <td>¥ {{ item.unemployment }}</td>
                <td>¥ {{ item.injury }}</td>
                <td>¥ {{ item.maternity }}</td>
                <td class="text-danger">¥ {{ item.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import * as echarts from 'echarts'
declare const layui: any

const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

const showModal = ref(false)
const showSecurityModal = ref(false)
const editMode = ref(false)
const selectAll = ref(false)
const selectedIds = ref<number[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

const trendChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()

const familyMembers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '张小明' }
])

const companies = ref([
  { id: 1, name: 'XX 科技有限公司' },
  { id: 2, name: 'XX 咨询有限公司' },
  { id: 3, name: '自由职业' }
])

const filters = reactive({
  month: '',
  member: '',
  company: ''
})

const form = reactive({
  month: '',
  name: '',
  company: '',
  department: '',
  baseSalary: '',
  performance: '',
  allowance: '',
  overtime: '',
  socialSecurity: '',
  housingFund: '',
  tax: '',
  otherDeduction: ''
})

const salaries = ref([
  { 
    id: 1, 
    name: '张三2', 
    month: '2026-01',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 8500,
    performance: 700,
    subsidy: 400,
    overtime: 200,
    grossTotal: 9800,
    socialSecurity: 850,
    housingFund: 1100,
    tax: 85,
    totalDeduction: 2035,
    netSalary: 7764,
    status: '已发布',
    publishDate: '2026-01-15'
  },
  { 
    id: 2, 
    name: '张三3', 
    month: '2026-02',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 9000,
    performance: 900,
    subsidy: 500,
    overtime: 400,
    grossTotal: 10800,
    socialSecurity: 900,
    housingFund: 1200,
    tax: 111,
    totalDeduction: 2211,
    netSalary: 8589,
    status: '已发布',
    publishDate: '2026-02-15'
  },
  { 
    id: 3, 
    name: '张三1', 
    month: '2026-03',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 9500,
    performance: 1100,
    subsidy: 300,
    overtime: 600,
    grossTotal: 11500,
    socialSecurity: 950,
    housingFund: 1000,
    tax: 136,
    totalDeduction: 2086,
    netSalary: 9413,
    status: '已发布',
    publishDate: '2026-03-15'
  },
  { 
    id: 4, 
    name: '张三2', 
    month: '2026-04',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 10000,
    performance: 1300,
    subsidy: 400,
    overtime: 0,
    grossTotal: 11700,
    socialSecurity: 1000,
    housingFund: 1100,
    tax: 138,
    totalDeduction: 2238,
    netSalary: 9462,
    status: '已发布',
    publishDate: '2026-04-15'
  },
  { 
    id: 5, 
    name: '张三3', 
    month: '2026-05',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 10500,
    performance: 500,
    subsidy: 500,
    overtime: 200,
    grossTotal: 11700,
    socialSecurity: 800,
    housingFund: 1200,
    tax: 141,
    totalDeduction: 2141,
    netSalary: 9559,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 6, 
    name: '张三1', 
    month: '2026-06',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 11000,
    performance: 700,
    subsidy: 300,
    overtime: 400,
    grossTotal: 12400,
    socialSecurity: 850,
    housingFund: 1000,
    tax: 166,
    totalDeduction: 2016,
    netSalary: 10383,
    status: '已发布',
    publishDate: '2026-06-15'
  },
  { 
    id: 7, 
    name: '张三2', 
    month: '2026-07',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 11500,
    performance: 900,
    subsidy: 400,
    overtime: 600,
    grossTotal: 13400,
    socialSecurity: 900,
    housingFund: 1100,
    tax: 192,
    totalDeduction: 2192,
    netSalary: 11208,
    status: '已发布',
    publishDate: '2026-07-15'
  },
  { 
    id: 8, 
    name: '张三3', 
    month: '2026-08',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 12000,
    performance: 1100,
    subsidy: 500,
    overtime: 0,
    grossTotal: 13600,
    socialSecurity: 950,
    housingFund: 1200,
    tax: 193,
    totalDeduction: 2343,
    netSalary: 11256,
    status: '已发布',
    publishDate: '2026-08-15'
  },
  { 
    id: 9, 
    name: '张三1', 
    month: '2026-09',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 12500,
    performance: 1300,
    subsidy: 300,
    overtime: 200,
    grossTotal: 14300,
    socialSecurity: 1000,
    housingFund: 1000,
    tax: 219,
    totalDeduction: 2219,
    netSalary: 12081,
    status: '已发布',
    publishDate: '2026-09-15'
  },
  { 
    id: 10, 
    name: '张三2', 
    month: '2026-10',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 8000,
    performance: 500,
    subsidy: 400,
    overtime: 400,
    grossTotal: 9300,
    socialSecurity: 800,
    housingFund: 1100,
    tax: 72,
    totalDeduction: 1972,
    netSalary: 7328,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 11, 
    name: '张三3', 
    month: '2026-11',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 8500,
    performance: 700,
    subsidy: 500,
    overtime: 600,
    grossTotal: 10300,
    socialSecurity: 850,
    housingFund: 1200,
    tax: 97,
    totalDeduction: 2147,
    netSalary: 8152,
    status: '已发布',
    publishDate: '2026-11-15'
  },
  { 
    id: 12, 
    name: '张三1', 
    month: '2026-12',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 9000,
    performance: 900,
    subsidy: 300,
    overtime: 0,
    grossTotal: 10200,
    socialSecurity: 900,
    housingFund: 1000,
    tax: 99,
    totalDeduction: 1999,
    netSalary: 8201,
    status: '已发布',
    publishDate: '2026-12-15'
  },
  { 
    id: 13, 
    name: '员工13', 
    month: '2026-01',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 9500,
    performance: 1100,
    subsidy: 400,
    overtime: 200,
    grossTotal: 11200,
    socialSecurity: 950,
    housingFund: 1100,
    tax: 124,
    totalDeduction: 2174,
    netSalary: 9025,
    status: '已发布',
    publishDate: '2026-01-15'
  },
  { 
    id: 14, 
    name: '员工14', 
    month: '2026-02',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 10000,
    performance: 1300,
    subsidy: 500,
    overtime: 400,
    grossTotal: 12200,
    socialSecurity: 1000,
    housingFund: 1200,
    tax: 150,
    totalDeduction: 2350,
    netSalary: 9850,
    status: '已发布',
    publishDate: '2026-02-15'
  },
  { 
    id: 15, 
    name: '员工15', 
    month: '2026-03',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 10500,
    performance: 500,
    subsidy: 300,
    overtime: 600,
    grossTotal: 11900,
    socialSecurity: 800,
    housingFund: 1000,
    tax: 153,
    totalDeduction: 1953,
    netSalary: 9947,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 16, 
    name: '员工16', 
    month: '2026-04',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 11000,
    performance: 700,
    subsidy: 400,
    overtime: 0,
    grossTotal: 12100,
    socialSecurity: 850,
    housingFund: 1100,
    tax: 154,
    totalDeduction: 2104,
    netSalary: 9995,
    status: '已发布',
    publishDate: '2026-04-15'
  },
  { 
    id: 17, 
    name: '员工17', 
    month: '2026-05',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 11500,
    performance: 900,
    subsidy: 500,
    overtime: 200,
    grossTotal: 13100,
    socialSecurity: 900,
    housingFund: 1200,
    tax: 180,
    totalDeduction: 2280,
    netSalary: 10820,
    status: '已发布',
    publishDate: '2026-05-15'
  },
  { 
    id: 18, 
    name: '员工18', 
    month: '2026-06',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 12000,
    performance: 1100,
    subsidy: 300,
    overtime: 400,
    grossTotal: 13800,
    socialSecurity: 950,
    housingFund: 1000,
    tax: 205,
    totalDeduction: 2155,
    netSalary: 11644,
    status: '已发布',
    publishDate: '2026-06-15'
  },
  { 
    id: 19, 
    name: '员工19', 
    month: '2026-07',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 12500,
    performance: 1300,
    subsidy: 400,
    overtime: 600,
    grossTotal: 14800,
    socialSecurity: 1000,
    housingFund: 1100,
    tax: 231,
    totalDeduction: 2331,
    netSalary: 12469,
    status: '已发布',
    publishDate: '2026-07-15'
  },
  { 
    id: 20, 
    name: '员工20', 
    month: '2026-08',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 8000,
    performance: 500,
    subsidy: 500,
    overtime: 0,
    grossTotal: 9000,
    socialSecurity: 800,
    housingFund: 1200,
    tax: 60,
    totalDeduction: 2060,
    netSalary: 6940,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 21, 
    name: '员工21', 
    month: '2026-09',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 8500,
    performance: 700,
    subsidy: 300,
    overtime: 200,
    grossTotal: 9700,
    socialSecurity: 850,
    housingFund: 1000,
    tax: 85,
    totalDeduction: 1935,
    netSalary: 7764,
    status: '已发布',
    publishDate: '2026-09-15'
  },
  { 
    id: 22, 
    name: '员工22', 
    month: '2026-10',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 9000,
    performance: 900,
    subsidy: 400,
    overtime: 400,
    grossTotal: 10700,
    socialSecurity: 900,
    housingFund: 1100,
    tax: 111,
    totalDeduction: 2111,
    netSalary: 8589,
    status: '已发布',
    publishDate: '2026-10-15'
  },
  { 
    id: 23, 
    name: '员工23', 
    month: '2026-11',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 9500,
    performance: 1100,
    subsidy: 500,
    overtime: 600,
    grossTotal: 11700,
    socialSecurity: 950,
    housingFund: 1200,
    tax: 136,
    totalDeduction: 2286,
    netSalary: 9413,
    status: '已发布',
    publishDate: '2026-11-15'
  },
  { 
    id: 24, 
    name: '员工24', 
    month: '2026-12',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 10000,
    performance: 1300,
    subsidy: 300,
    overtime: 0,
    grossTotal: 11600,
    socialSecurity: 1000,
    housingFund: 1000,
    tax: 138,
    totalDeduction: 2138,
    netSalary: 9462,
    status: '已发布',
    publishDate: '2026-12-15'
  },
  { 
    id: 25, 
    name: '员工25', 
    month: '2026-01',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 10500,
    performance: 500,
    subsidy: 400,
    overtime: 200,
    grossTotal: 11600,
    socialSecurity: 800,
    housingFund: 1100,
    tax: 141,
    totalDeduction: 2041,
    netSalary: 9559,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 26, 
    name: '员工26', 
    month: '2026-02',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 11000,
    performance: 700,
    subsidy: 500,
    overtime: 400,
    grossTotal: 12600,
    socialSecurity: 850,
    housingFund: 1200,
    tax: 166,
    totalDeduction: 2216,
    netSalary: 10383,
    status: '已发布',
    publishDate: '2026-02-15'
  },
  { 
    id: 27, 
    name: '员工27', 
    month: '2026-03',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 11500,
    performance: 900,
    subsidy: 300,
    overtime: 600,
    grossTotal: 13300,
    socialSecurity: 900,
    housingFund: 1000,
    tax: 192,
    totalDeduction: 2092,
    netSalary: 11208,
    status: '已发布',
    publishDate: '2026-03-15'
  },
  { 
    id: 28, 
    name: '员工28', 
    month: '2026-04',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 12000,
    performance: 1100,
    subsidy: 400,
    overtime: 0,
    grossTotal: 13500,
    socialSecurity: 950,
    housingFund: 1100,
    tax: 193,
    totalDeduction: 2243,
    netSalary: 11256,
    status: '已发布',
    publishDate: '2026-04-15'
  },
  { 
    id: 29, 
    name: '员工29', 
    month: '2026-05',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 12500,
    performance: 1300,
    subsidy: 500,
    overtime: 200,
    grossTotal: 14500,
    socialSecurity: 1000,
    housingFund: 1200,
    tax: 219,
    totalDeduction: 2419,
    netSalary: 12081,
    status: '已发布',
    publishDate: '2026-05-15'
  },
  { 
    id: 30, 
    name: '员工30', 
    month: '2026-06',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 8000,
    performance: 500,
    subsidy: 300,
    overtime: 400,
    grossTotal: 9200,
    socialSecurity: 800,
    housingFund: 1000,
    tax: 72,
    totalDeduction: 1872,
    netSalary: 7328,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 31, 
    name: '员工31', 
    month: '2026-07',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 8500,
    performance: 700,
    subsidy: 400,
    overtime: 600,
    grossTotal: 10200,
    socialSecurity: 850,
    housingFund: 1100,
    tax: 97,
    totalDeduction: 2047,
    netSalary: 8152,
    status: '已发布',
    publishDate: '2026-07-15'
  },
  { 
    id: 32, 
    name: '员工32', 
    month: '2026-08',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 9000,
    performance: 900,
    subsidy: 500,
    overtime: 0,
    grossTotal: 10400,
    socialSecurity: 900,
    housingFund: 1200,
    tax: 99,
    totalDeduction: 2199,
    netSalary: 8201,
    status: '已发布',
    publishDate: '2026-08-15'
  },
  { 
    id: 33, 
    name: '员工33', 
    month: '2026-09',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 9500,
    performance: 1100,
    subsidy: 300,
    overtime: 200,
    grossTotal: 11100,
    socialSecurity: 950,
    housingFund: 1000,
    tax: 124,
    totalDeduction: 2074,
    netSalary: 9025,
    status: '已发布',
    publishDate: '2026-09-15'
  },
  { 
    id: 34, 
    name: '员工34', 
    month: '2026-10',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 10000,
    performance: 1300,
    subsidy: 400,
    overtime: 400,
    grossTotal: 12100,
    socialSecurity: 1000,
    housingFund: 1100,
    tax: 150,
    totalDeduction: 2250,
    netSalary: 9850,
    status: '已发布',
    publishDate: '2026-10-15'
  },
  { 
    id: 35, 
    name: '员工35', 
    month: '2026-11',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 10500,
    performance: 500,
    subsidy: 500,
    overtime: 600,
    grossTotal: 12100,
    socialSecurity: 800,
    housingFund: 1200,
    tax: 153,
    totalDeduction: 2153,
    netSalary: 9947,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 36, 
    name: '员工36', 
    month: '2026-12',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 11000,
    performance: 700,
    subsidy: 300,
    overtime: 0,
    grossTotal: 12000,
    socialSecurity: 850,
    housingFund: 1000,
    tax: 154,
    totalDeduction: 2004,
    netSalary: 9995,
    status: '已发布',
    publishDate: '2026-12-15'
  },
  { 
    id: 37, 
    name: '员工37', 
    month: '2026-01',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 11500,
    performance: 900,
    subsidy: 400,
    overtime: 200,
    grossTotal: 13000,
    socialSecurity: 900,
    housingFund: 1100,
    tax: 180,
    totalDeduction: 2180,
    netSalary: 10820,
    status: '已发布',
    publishDate: '2026-01-15'
  },
  { 
    id: 38, 
    name: '员工38', 
    month: '2026-02',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 12000,
    performance: 1100,
    subsidy: 500,
    overtime: 400,
    grossTotal: 14000,
    socialSecurity: 950,
    housingFund: 1200,
    tax: 205,
    totalDeduction: 2355,
    netSalary: 11644,
    status: '已发布',
    publishDate: '2026-02-15'
  },
  { 
    id: 39, 
    name: '员工39', 
    month: '2026-03',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 12500,
    performance: 1300,
    subsidy: 300,
    overtime: 600,
    grossTotal: 14700,
    socialSecurity: 1000,
    housingFund: 1000,
    tax: 231,
    totalDeduction: 2231,
    netSalary: 12469,
    status: '已发布',
    publishDate: '2026-03-15'
  },
  { 
    id: 40, 
    name: '员工40', 
    month: '2026-04',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 8000,
    performance: 500,
    subsidy: 400,
    overtime: 0,
    grossTotal: 8900,
    socialSecurity: 800,
    housingFund: 1100,
    tax: 60,
    totalDeduction: 1960,
    netSalary: 6940,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 41, 
    name: '员工41', 
    month: '2026-05',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 8500,
    performance: 700,
    subsidy: 500,
    overtime: 200,
    grossTotal: 9900,
    socialSecurity: 850,
    housingFund: 1200,
    tax: 85,
    totalDeduction: 2135,
    netSalary: 7764,
    status: '已发布',
    publishDate: '2026-05-15'
  },
  { 
    id: 42, 
    name: '员工42', 
    month: '2026-06',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 9000,
    performance: 900,
    subsidy: 300,
    overtime: 400,
    grossTotal: 10600,
    socialSecurity: 900,
    housingFund: 1000,
    tax: 111,
    totalDeduction: 2011,
    netSalary: 8589,
    status: '已发布',
    publishDate: '2026-06-15'
  },
  { 
    id: 43, 
    name: '员工43', 
    month: '2026-07',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 9500,
    performance: 1100,
    subsidy: 400,
    overtime: 600,
    grossTotal: 11600,
    socialSecurity: 950,
    housingFund: 1100,
    tax: 136,
    totalDeduction: 2186,
    netSalary: 9413,
    status: '已发布',
    publishDate: '2026-07-15'
  },
  { 
    id: 44, 
    name: '员工44', 
    month: '2026-08',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 10000,
    performance: 1300,
    subsidy: 500,
    overtime: 0,
    grossTotal: 11800,
    socialSecurity: 1000,
    housingFund: 1200,
    tax: 138,
    totalDeduction: 2338,
    netSalary: 9462,
    status: '已发布',
    publishDate: '2026-08-15'
  },
  { 
    id: 45, 
    name: '员工45', 
    month: '2026-09',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 10500,
    performance: 500,
    subsidy: 300,
    overtime: 200,
    grossTotal: 11500,
    socialSecurity: 800,
    housingFund: 1000,
    tax: 141,
    totalDeduction: 1941,
    netSalary: 9559,
    status: '草稿',
    publishDate: ''
  },
  { 
    id: 46, 
    name: '员工46', 
    month: '2026-10',
    company: '北京2信息技术公司',
    position: '产品经理',
    baseSalary: 11000,
    performance: 700,
    subsidy: 400,
    overtime: 400,
    grossTotal: 12500,
    socialSecurity: 850,
    housingFund: 1100,
    tax: 166,
    totalDeduction: 2116,
    netSalary: 10383,
    status: '已发布',
    publishDate: '2026-10-15'
  },
  { 
    id: 47, 
    name: '员工47', 
    month: '2026-11',
    company: '北京3软件开发公司',
    position: '设计师',
    baseSalary: 11500,
    performance: 900,
    subsidy: 500,
    overtime: 600,
    grossTotal: 13500,
    socialSecurity: 900,
    housingFund: 1200,
    tax: 192,
    totalDeduction: 2292,
    netSalary: 11208,
    status: '已发布',
    publishDate: '2026-11-15'
  },
  { 
    id: 48, 
    name: '员工48', 
    month: '2026-12',
    company: '北京4网络服务公司',
    position: '运营专员',
    baseSalary: 12000,
    performance: 1100,
    subsidy: 300,
    overtime: 0,
    grossTotal: 13400,
    socialSecurity: 950,
    housingFund: 1000,
    tax: 193,
    totalDeduction: 2143,
    netSalary: 11256,
    status: '已发布',
    publishDate: '2026-12-15'
  },
  { 
    id: 49, 
    name: '员工49', 
    month: '2026-01',
    company: '北京5数据服务公司',
    position: '测试工程师',
    baseSalary: 12500,
    performance: 1300,
    subsidy: 400,
    overtime: 200,
    grossTotal: 14400,
    socialSecurity: 1000,
    housingFund: 1100,
    tax: 219,
    totalDeduction: 2319,
    netSalary: 12081,
    status: '已发布',
    publishDate: '2026-01-15'
  },
  { 
    id: 50, 
    name: '员工50', 
    month: '2026-02',
    company: '北京1科技有限公司',
    position: '软件工程师',
    baseSalary: 8000,
    performance: 500,
    subsidy: 500,
    overtime: 400,
    grossTotal: 9400,
    socialSecurity: 800,
    housingFund: 1200,
    tax: 72,
    totalDeduction: 2072,
    netSalary: 7328,
    status: '草稿',
    publishDate: ''
  }
])

const securityData = ref([
  { id: 1, month: '2026-05', name: '张三', pension: 640, medical: 160, unemployment: 40, injury: 0, maternity: 0, total: 840 },
  { id: 2, month: '2026-05', name: '李四', pension: 320, medical: 130, unemployment: 40, injury: 0, maternity: 40, total: 530 }
])

const filteredSalaries = computed(() => {
  return salaries.value.filter(s => {
    if (filters.month && s.month !== filters.month) return false
    if (filters.member && s.name !== filters.member) return false
    if (filters.company && s.company !== filters.company) return false
    return true
  })
})

const totalRecords = computed(() => filteredSalaries.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const paginatedSalaries = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSalaries.value.slice(start, end)
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

const summary = computed(() => {
  const list = filteredSalaries.value
  return {
    grossTotal: list.reduce((sum, s) => sum + s.gross, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
    netTotal: list.reduce((sum, s) => sum + s.net, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
    housingFundTotal: list.reduce((sum, s) => sum + s.housingFund, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
    socialSecurityTotal: list.reduce((sum, s) => sum + s.socialSecurity, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
  }
})

const calculateGross = () => {
  return (parseFloat(form.baseSalary || 0) + parseFloat(form.performance || 0) + 
          parseFloat(form.allowance || 0) + parseFloat(form.overtime || 0))
}

const calculateNet = () => {
  const gross = calculateGross()
  const deductions = (parseFloat(form.socialSecurity || 0) + parseFloat(form.housingFund || 0) + 
                      parseFloat(form.tax || 0) + parseFloat(form.otherDeduction || 0))
  return gross - deductions
}

const calculateTotal = () => {
  form.gross = calculateGross()
  form.net = calculateNet()
}

const formatNumber = (num: number | string) => {
  return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const showAddModal = () => {
  editMode.value = false
  Object.keys(form).forEach(key => (form as any)[key] = '')
  form.month = new Date().toISOString().slice(0, 7)
  showModal.value = true
}

const editSalary = (salary: any) => {
  editMode.value = true
  Object.assign(form, {
    month: salary.month,
    name: salary.name,
    company: salary.company,
    department: salary.department,
    baseSalary: salary.baseSalary,
    performance: salary.performance,
    allowance: salary.allowance,
    overtime: salary.overtime,
    socialSecurity: salary.socialSecurity,
    housingFund: salary.housingFund,
    tax: salary.tax,
    otherDeduction: salary.otherDeduction
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = () => {
  if (!form.month || !form.name) {
    message.warning('请填写必填项')
    return
  }
  message.success(editMode.value ? '更新成功' : '添加成功')
  closeModal()
}

const saveDraft = () => {
  message.success('已保存为草稿')
  closeModal()
}

const viewDetail = (salary: any) => {
  message.info(`查看 ${salary.name} ${salary.month} 工资详情`)
}

const viewSecurityDetail = () => {
  showSecurityModal.value = true
}

const viewSumReport = () => {
  message.info('汇总报表功能开发中')
}

const handleFilter = () => {
  message.success('查询成功')
}

const resetFilter = () => {
  Object.assign(filters, { month: '', member: '', company: '' })
}

const toggleSelectAll = () => {
  selectedIds.value = selectAll.value ? filteredSalaries.value.map(s => s.id) : []
}

const changePage = (page: number) => {
  if (page > 0) currentPage.value = page
}

const exportSalary = () => {
  message.success('导出功能开发中')
}

const initCharts = () => {
  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月'] },
      yAxis: { type: 'value' },
      series: [{ data: [18500, 19200, 18800, 19500, 19700, 0], type: 'line', smooth: true, itemStyle: { color: '#16baaa' } }]
    })
  }
  if (pieChartRef.value) {
    const chart = echarts.init(pieChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie', radius: '60%',
        data: [
          { value: 15000, name: '基本工资' },
          { value: 3000, name: '绩效奖金' },
          { value: 1200, name: '补贴' },
          { value: 500, name: '加班费' }
        ]
      }]
    })
  }
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', () => {
      trendChartRef.value && echarts.getInstanceByDom(trendChartRef.value)?.resize()
      pieChartRef.value && echarts.getInstanceByDom(pieChartRef.value)?.resize()
    })
  })
})
</script>

<style scoped>
.salary-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.header-actions { display: flex; gap: 12px; }
.filter-section { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-item label { color: #666; font-size: 14px; }
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.summary-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.summary-label { font-size: 14px; color: #999; margin-bottom: 8px; }
.summary-value { font-size: 24px; font-weight: 600; }
.charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }
.chart-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-header { display: flex; align-items: center; margin-bottom: 16px; gap: 8px; }
.card-header h3 { font-size: 16px; color: #333; }
.card-body { min-height: 300px; }
.chart-container { width: 100%; height: 300px; }
.salary-table-wrapper { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.table-header h3 { font-size: 16px; color: #333; display: flex; align-items: center; gap: 8px; }
.table-actions { display: flex; gap: 12px; }
.table-wrapper { overflow-x: auto; }
.font-weight { font-weight: 600; }
.text-primary { color: #1e9fff; }
.text-success { color: #16b777; }
.text-warning { color: #ffb800; }
.text-danger { color: #ff5722; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.pagination-control { display: flex; gap: 8px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-dialog { background: #fff; border-radius: 12px; width: 700px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
.modal-dialog.modal-lg { width: 900px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e6e6e6; }
.modal-header h4 { font-size: 18px; color: #333; }
.modal-close { background: none; border: none; font-size: 20px; color: #999; cursor: pointer; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e6e6e6; }
.salary-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; gap: 16px; }
.form-item { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 14px; color: #666; font-weight: 500; }
.required { color: #ff5722; }
.form-section { border: 1px solid #e6e6e6; border-radius: 8px; padding: 16px; background: #f8f8f8; }
.section-title { font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 600; }
.form-result { background: #e8f6f3; border-radius: 8px; padding: 16px; margin-top: 16px; }
.result-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
.result-item:last-child { margin-bottom: 0; }
.result-value { font-size: 18px; font-weight: 600; }
</style>
