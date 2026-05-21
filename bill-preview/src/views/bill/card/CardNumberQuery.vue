<template>
  <div class="card-manage-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-card"></i> 银行卡管理</h2>
      <div class="header-actions">
        <button class="layui-btn layui-btn-primary" @click="showAddCard">
          <i class="layui-icon layui-icon-add-1"></i> 添加银行卡
        </button>
        <button class="layui-btn layui-btn-primary" @click="showCreditStatement">
          <i class="layui-icon layui-icon-dialogue"></i> 信用卡月账单
        </button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>家庭成员:</label>
        <select class="layui-select" v-model="filters.familyMember">
          <option value="">全部</option>
          <option v-for="member in familyMembers" :key="member.id" :value="member.name">{{ member.name }}</option>
        </select>
      </div>
      <div class="filter-item">
        <label>银行类型:</label>
        <select class="layui-select" v-model="filters.bankType">
          <option value="">全部</option>
          <option v-for="bank in bankTypes" :key="bank.value" :value="bank.value">{{ bank.label }}</option>
        </select>
      </div>
      <div class="filter-item">
        <label>卡片类型:</label>
        <select class="layui-select" v-model="filters.cardType">
          <option value="">全部</option>
          <option value="1">储蓄卡</option>
          <option value="2">信用卡</option>
          <option value="3">信用付</option>
        </select>
      </div>
      <div class="filter-item">
        <label>状态:</label>
        <select class="layui-select" v-model="filters.status">
          <option value="">全部</option>
          <option value="1">激活</option>
          <option value="2">停用</option>
        </select>
      </div>
      <button class="layui-btn layui-btn-sm" @click="handleFilter">
        <i class="layui-icon layui-icon-search"></i> 查询
      </button>
      <button class="layui-btn layui-btn-sm layui-btn-primary" @click="resetFilter">
        <i class="layui-icon layui-icon-refresh"></i> 重置
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">总卡片数</div>
        <div class="summary-value">{{ cards.length }} 张</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">储蓄卡</div>
        <div class="summary-value">{{ debitCards }} 张</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">信用卡</div>
        <div class="summary-value">{{ creditCards }} 张</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">总余额</div>
        <div class="summary-value text-success">¥ {{ totalBalance }}</div>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="cards-grid">
      <div 
        v-for="card in paginatedCards" 
        :key="card.id"
        class="bank-card"
        :class="['card-type-' + card.cardType, card.status === '2' ? 'card-disabled' : '']"
        :style="{ background: getCardGradient(card.bankType) }"
      >
        <div class="card-top">
          <div class="bank-logo">
            <i :class="getBankIcon(card.bankType)"></i>
            <span>{{ card.bankName }}</span>
          </div>
          <span class="card-type-tag" :class="card.cardType === '1' ? 'tag-debit' : 'tag-credit'">
            {{ card.cardType === '1' ? '储蓄卡' : card.cardType === '2' ? '信用卡' : '信用付' }}
          </span>
        </div>
        
        <div class="card-middle">
          <div class="card-number">
            <span>****</span>
            <span>****</span>
            <span>****</span>
            <span>{{ card.lastFourDigits }}</span>
          </div>
        </div>

        <div class="card-info">
          <div class="info-item">
            <div class="info-label">
              <i class="layui-icon layui-icon-username"></i> 持卡人
            </div>
            <div class="info-value">{{ card.holderName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <i class="layui-icon layui-icon-dollar"></i> 
              {{ card.cardType === '2' ? '可用额度' : '余额' }}
            </div>
            <div class="info-value">
              {{ card.cardType === '2' ? '¥ ' + card.creditLimit : '¥ ' + card.balance }}
            </div>
          </div>
          <div class="info-item" v-if="card.cardType === '2'">
            <div class="info-label">
              <i class="layui-icon layui-icon-rmb"></i> 已用额度
            </div>
            <div class="info-value text-danger">¥ {{ card.usedLimit }}</div>
          </div>
        </div>

        <div class="card-footer">
          <div class="card-status" :class="card.status === '1' ? 'status-active' : 'status-disabled'">
            <i class="layui-icon" :class="card.status === '1' ? 'layui-icon-ok-circle' : 'layui-icon-close-circle'"></i>
            {{ card.status === '1' ? '激活' : '停用' }}
          </div>
          <div class="card-actions">
            <button class="layui-btn layui-btn-xs layui-btn-primary" @click="viewDetail(card)">
              <i class="layui-icon layui-icon-eye"></i> 详情
            </button>
            <button class="layui-btn layui-btn-xs layui-btn-primary" @click="editCard(card)">
              <i class="layui-icon layui-icon-edit"></i> 编辑
            </button>
            <button 
              class="layui-btn layui-btn-xs"
              :class="card.status === '1' ? 'layui-btn-danger' : 'layui-btn-normal'"
              @click="toggleStatus(card)"
            >
              <i :class="card.status === '1' ? 'layui-icon-close' : 'layui-icon-ok'"></i>
              {{ card.status === '1' ? '停用' : '启用' }}
            </button>
          </div>
        </div>

        <div class="card-background">
          <i class="layui-icon layui-icon-card"></i>
        </div>
      </div>

      <div class="add-card-placeholder" @click="showAddCard">
        <i class="layui-icon layui-icon-add-1"></i>
        <span>添加银行卡</span>
      </div>
    </div>

    <!-- 添加/编辑卡片弹窗 -->
    <div v-if="showCardModal" class="modal-overlay" @click.self="closeCardModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>{{ editMode ? '编辑银行卡' : '添加银行卡' }}</h4>
          <button class="modal-close" @click="closeCardModal">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="card-form">
            <div class="form-row">
              <div class="form-item">
                <label>卡类型 <span class="required">*</span></label>
                <div class="type-selector">
                  <button 
                    class="type-btn" 
                    :class="{ active: cardForm.cardType === '1' }"
                    @click="cardForm.cardType = '1'"
                  >
                    <i class="layui-icon layui-icon-card"></i> 储蓄卡
                  </button>
                  <button 
                    class="type-btn" 
                    :class="{ active: cardForm.cardType === '2' }"
                    @click="cardForm.cardType = '2'"
                  >
                    <i class="layui-icon layui-icon-dollar"></i> 信用卡
                  </button>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>银行 <span class="required">*</span></label>
                <select class="layui-select" v-model="cardForm.bankType">
                  <option value="">请选择银行</option>
                  <option v-for="bank in bankTypes" :key="bank.value" :value="bank.value">{{ bank.label }}</option>
                </select>
              </div>
              <div class="form-item">
                <label>持卡人 <span class="required">*</span></label>
                <select class="layui-select" v-model="cardForm.holderName">
                  <option value="">请选择</option>
                  <option v-for="member in familyMembers" :key="member.id" :value="member.name">{{ member.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>卡号 <span class="required">*</span></label>
                <input 
                  type="text" 
                  class="layui-input" 
                  v-model="cardForm.cardNumber"
                  placeholder="请输入完整的银行卡号"
                  maxlength="19"
                />
              </div>
            </div>
            <div class="form-row" v-if="cardForm.cardType === '2'">
              <div class="form-item">
                <label>信用额度</label>
                <input 
                  type="number" 
                  class="layui-input" 
                  v-model="cardForm.creditLimit"
                  placeholder="请输入信用额度"
                />
              </div>
              <div class="form-item">
                <label>账单日</label>
                <select class="layui-select" v-model="cardForm.billDay">
                  <option value="">选择账单日</option>
                  <option v-for="day in 31" :key="day" :value="day">{{ day }}日</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>状态</label>
                <div class="switch-wrapper">
                  <input type="checkbox" v-model="cardForm.status" true-value="1" false-value="2" class="layui-switch" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="layui-btn layui-btn-primary" @click="closeCardModal">取消</button>
          <button class="layui-btn layui-btn-danger" @click="deleteCurrentCard" v-if="editMode">
            <i class="layui-icon layui-icon-delete"></i> 删除
          </button>
          <button class="layui-btn" @click="submitCard">
            <i class="layui-icon layui-icon-ok"></i> 确认
          </button>
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

const layerConfirm = (content: string, title: string, callback: () => void) => {
  layui.layer.confirm(content, { title, icon: 3 }, (index: number) => {
    callback()
    layui.layer.close(index)
  })
}

const showCardModal = ref(false)
const editMode = ref(false)

const familyMembers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '张小明' }
])

const bankTypes = ref([
  { value: 'icbc', label: '工商银行' },
  { value: 'cmb', label: '招商银行' },
  { value: 'ccb', label: '建设银行' },
  { value: 'abc', label: '农业银行' },
  { value: 'boc', label: '中国银行' },
  { value: 'comm', label: '交通银行' },
  { value: 'psbc', label: '邮储银行' },
  { value: 'citic', label: '中信银行' },
  { value: 'spdb', label: '浦发银行' },
  { value: 'cmbc', label: '民生银行' }
])

const filters = reactive({
  familyMember: '',
  bankType: '',
  cardType: '',
  status: ''
})

const cardForm = reactive({
  cardType: '1',
  bankType: '',
  holderName: '',
  cardNumber: '',
  creditLimit: '',
  billDay: '',
  status: '1'
})

const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(totalCards.value / pageSize.value))

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCards.value.slice(start, end)
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
const pageSize = ref(10)

const cards = ref([
  { 
    id: 1, 
    bankName: '招商银行',
    bankType: 'cmb',
    cardType: '1', 
    cardNumber: '6225880100011234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '1,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 2, 
    bankName: '工商银行',
    bankType: 'icbc',
    cardType: '1', 
    cardNumber: '6222020100021234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '2,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 3, 
    bankName: '建设银行',
    bankType: 'ccb',
    cardType: '2', 
    cardNumber: '6227020100031234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '60.00',
    usedLimit: '5,300.00',
    billDay: '4',
    status: '1'
  },
  { 
    id: 4, 
    bankName: '农业银行',
    bankType: 'abc',
    cardType: '1', 
    cardNumber: '6228480100041234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '4,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 5, 
    bankName: '中国银行',
    bankType: 'boc',
    cardType: '1', 
    cardNumber: '6227520100051234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '5,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 6, 
    bankName: '交通银行',
    bankType: 'bcm',
    cardType: '2', 
    cardNumber: '6213020100061234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '40.00',
    usedLimit: '5,600.00',
    billDay: '7',
    status: '1'
  },
  { 
    id: 7, 
    bankName: '民生银行',
    bankType: 'cmbc',
    cardType: '1', 
    cardNumber: '6226880100071234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '7,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 8, 
    bankName: '光大银行',
    bankType: 'cebbank',
    cardType: '1', 
    cardNumber: '6226680100081234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '8,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 9, 
    bankName: '平安银行',
    bankType: 'pingan',
    cardType: '2', 
    cardNumber: '6215010200091234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '70.00',
    usedLimit: '5,900.00',
    billDay: '10',
    status: '1'
  },
  { 
    id: 10, 
    bankName: '中信银行',
    bankType: 'citic',
    cardType: '1', 
    cardNumber: '6226780100101234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '10,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '0'
  },
  { 
    id: 11, 
    bankName: '招商银行',
    bankType: 'cmb',
    cardType: '1', 
    cardNumber: '6225880100111234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '11,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 12, 
    bankName: '工商银行',
    bankType: 'icbc',
    cardType: '2', 
    cardNumber: '6212010200121234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '50.00',
    usedLimit: '6,200.00',
    billDay: '13',
    status: '1'
  },
  { 
    id: 13, 
    bankName: '建设银行',
    bankType: 'ccb',
    cardType: '1', 
    cardNumber: '4367420100131234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '13,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 14, 
    bankName: '农业银行',
    bankType: 'abc',
    cardType: '1', 
    cardNumber: '6228480100141234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '14,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 15, 
    bankName: '中国银行',
    bankType: 'boc',
    cardType: '2', 
    cardNumber: '6216010200151234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '30.00',
    usedLimit: '6,500.00',
    billDay: '16',
    status: '1'
  },
  { 
    id: 16, 
    bankName: '交通银行',
    bankType: 'bcm',
    cardType: '1', 
    cardNumber: '6222620100161234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '16,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 17, 
    bankName: '民生银行',
    bankType: 'cmbc',
    cardType: '1', 
    cardNumber: '6226880100171234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '17,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 18, 
    bankName: '光大银行',
    bankType: 'cebbank',
    cardType: '2', 
    cardNumber: '6214010200181234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '60.00',
    usedLimit: '6,800.00',
    billDay: '19',
    status: '1'
  },
  { 
    id: 19, 
    bankName: '平安银行',
    bankType: 'pingan',
    cardType: '1', 
    cardNumber: '6221550100191234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '19,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 20, 
    bankName: '中信银行',
    bankType: 'citic',
    cardType: '1', 
    cardNumber: '6226780100201234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '20,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '0'
  },
  { 
    id: 21, 
    bankName: '招商银行',
    bankType: 'cmb',
    cardType: '2', 
    cardNumber: '4687123400211234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '40.00',
    usedLimit: '7,100.00',
    billDay: '22',
    status: '1'
  },
  { 
    id: 22, 
    bankName: '工商银行',
    bankType: 'icbc',
    cardType: '1', 
    cardNumber: '6222020100221234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '22,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 23, 
    bankName: '建设银行',
    bankType: 'ccb',
    cardType: '1', 
    cardNumber: '4367420100231234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '23,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 24, 
    bankName: '农业银行',
    bankType: 'abc',
    cardType: '2', 
    cardNumber: '6213010200241234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '70.00',
    usedLimit: '7,400.00',
    billDay: '25',
    status: '1'
  },
  { 
    id: 25, 
    bankName: '中国银行',
    bankType: 'boc',
    cardType: '1', 
    cardNumber: '6227520100251234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '25,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 26, 
    bankName: '交通银行',
    bankType: 'bcm',
    cardType: '1', 
    cardNumber: '6222620100261234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '26,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 27, 
    bankName: '民生银行',
    bankType: 'cmbc',
    cardType: '2', 
    cardNumber: '6213210200271234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '50.00',
    usedLimit: '7,700.00',
    billDay: '28',
    status: '1'
  },
  { 
    id: 28, 
    bankName: '光大银行',
    bankType: 'cebbank',
    cardType: '1', 
    cardNumber: '6226680100281234',
    lastFourDigits: '1234',
    holderName: '张三2',
    balance: '28,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 29, 
    bankName: '平安银行',
    bankType: 'pingan',
    cardType: '1', 
    cardNumber: '6221550100291234',
    lastFourDigits: '1234',
    holderName: '张三3',
    balance: '29,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 30, 
    bankName: '中信银行',
    bankType: 'citic',
    cardType: '2', 
    cardNumber: '6217010200301234',
    lastFourDigits: '1234',
    holderName: '张三1',
    balance: '',
    creditLimit: '30.00',
    usedLimit: '8,000.00',
    billDay: '3',
    status: '0'
  },
  { 
    id: 31, 
    bankName: '招商银行',
    bankType: 'cmb',
    cardType: '1', 
    cardNumber: '6225880100311234',
    lastFourDigits: '1234',
    holderName: '用户31',
    balance: '31,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 32, 
    bankName: '工商银行',
    bankType: 'icbc',
    cardType: '1', 
    cardNumber: '6222020100321234',
    lastFourDigits: '1234',
    holderName: '用户32',
    balance: '32,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 33, 
    bankName: '建设银行',
    bankType: 'ccb',
    cardType: '2', 
    cardNumber: '6227020100331234',
    lastFourDigits: '1234',
    holderName: '用户33',
    balance: '',
    creditLimit: '60.00',
    usedLimit: '8,300.00',
    billDay: '6',
    status: '1'
  },
  { 
    id: 34, 
    bankName: '农业银行',
    bankType: 'abc',
    cardType: '1', 
    cardNumber: '6228480100341234',
    lastFourDigits: '1234',
    holderName: '用户34',
    balance: '34,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 35, 
    bankName: '中国银行',
    bankType: 'boc',
    cardType: '1', 
    cardNumber: '6227520100351234',
    lastFourDigits: '1234',
    holderName: '用户35',
    balance: '35,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 36, 
    bankName: '交通银行',
    bankType: 'bcm',
    cardType: '2', 
    cardNumber: '6213020100361234',
    lastFourDigits: '1234',
    holderName: '用户36',
    balance: '',
    creditLimit: '40.00',
    usedLimit: '8,600.00',
    billDay: '9',
    status: '1'
  },
  { 
    id: 37, 
    bankName: '民生银行',
    bankType: 'cmbc',
    cardType: '1', 
    cardNumber: '6226880100371234',
    lastFourDigits: '1234',
    holderName: '用户37',
    balance: '37,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 38, 
    bankName: '光大银行',
    bankType: 'cebbank',
    cardType: '1', 
    cardNumber: '6226680100381234',
    lastFourDigits: '1234',
    holderName: '用户38',
    balance: '38,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 39, 
    bankName: '平安银行',
    bankType: 'pingan',
    cardType: '2', 
    cardNumber: '6215010200391234',
    lastFourDigits: '1234',
    holderName: '用户39',
    balance: '',
    creditLimit: '70.00',
    usedLimit: '8,900.00',
    billDay: '12',
    status: '1'
  },
  { 
    id: 40, 
    bankName: '中信银行',
    bankType: 'citic',
    cardType: '1', 
    cardNumber: '6226780100401234',
    lastFourDigits: '1234',
    holderName: '用户40',
    balance: '40,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '0'
  },
  { 
    id: 41, 
    bankName: '招商银行',
    bankType: 'cmb',
    cardType: '1', 
    cardNumber: '6225880100411234',
    lastFourDigits: '1234',
    holderName: '用户41',
    balance: '41,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 42, 
    bankName: '工商银行',
    bankType: 'icbc',
    cardType: '2', 
    cardNumber: '6212010200421234',
    lastFourDigits: '1234',
    holderName: '用户42',
    balance: '',
    creditLimit: '50.00',
    usedLimit: '9,200.00',
    billDay: '15',
    status: '1'
  },
  { 
    id: 43, 
    bankName: '建设银行',
    bankType: 'ccb',
    cardType: '1', 
    cardNumber: '4367420100431234',
    lastFourDigits: '1234',
    holderName: '用户43',
    balance: '43,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 44, 
    bankName: '农业银行',
    bankType: 'abc',
    cardType: '1', 
    cardNumber: '6228480100441234',
    lastFourDigits: '1234',
    holderName: '用户44',
    balance: '44,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 45, 
    bankName: '中国银行',
    bankType: 'boc',
    cardType: '2', 
    cardNumber: '6216010200451234',
    lastFourDigits: '1234',
    holderName: '用户45',
    balance: '',
    creditLimit: '30.00',
    usedLimit: '9,500.00',
    billDay: '18',
    status: '1'
  },
  { 
    id: 46, 
    bankName: '交通银行',
    bankType: 'bcm',
    cardType: '1', 
    cardNumber: '6222620100461234',
    lastFourDigits: '1234',
    holderName: '用户46',
    balance: '46,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 47, 
    bankName: '民生银行',
    bankType: 'cmbc',
    cardType: '1', 
    cardNumber: '6226880100471234',
    lastFourDigits: '1234',
    holderName: '用户47',
    balance: '47,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 48, 
    bankName: '光大银行',
    bankType: 'cebbank',
    cardType: '2', 
    cardNumber: '6214010200481234',
    lastFourDigits: '1234',
    holderName: '用户48',
    balance: '',
    creditLimit: '60.00',
    usedLimit: '9,800.00',
    billDay: '21',
    status: '1'
  },
  { 
    id: 49, 
    bankName: '平安银行',
    bankType: 'pingan',
    cardType: '1', 
    cardNumber: '6221550100491234',
    lastFourDigits: '1234',
    holderName: '用户49',
    balance: '49,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '1'
  },
  { 
    id: 50, 
    bankName: '中信银行',
    bankType: 'citic',
    cardType: '1', 
    cardNumber: '6226780100501234',
    lastFourDigits: '1234',
    holderName: '用户50',
    balance: '50,500.00',
    creditLimit: '',
    usedLimit: '',
    billDay: '',
    status: '0'
  }
])

const filteredCards = computed(() => {
  return cards.value.filter(card => {
    if (filters.familyMember && card.holderName !== filters.familyMember) return false
    if (filters.bankType && card.bankType !== filters.bankType) return false
    if (filters.cardType && card.cardType !== filters.cardType) return false
    if (filters.status && card.status !== filters.status) return false
    return true
  })
})

const debitCards = computed(() => cards.value.filter(c => c.cardType === '1').length)
const creditCards = computed(() => cards.value.filter(c => c.cardType === '2').length)

const totalBalance = computed(() => {
  const total = cards.value
    .filter(c => c.cardType === '1' && c.balance)
    .reduce((sum, c) => sum + parseFloat(c.balance.replace(/,/g, '')), 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const getCardGradient = (bankType: string) => {
  const gradients: Record<string, string> = {
    'icbc': 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
    'cmb': 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
    'ccb': 'linear-gradient(135deg, #003366 0%, #001f3f 100%)',
    'abc': 'linear-gradient(135deg, #00b050 0%, #008000 100%)',
    'boc': 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
    'comm': 'linear-gradient(135deg, #ff6600 0%, #cc5200 100%)'
  }
  return gradients[bankType] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}

const getBankIcon = (bankType: string) => {
  return 'layui-icon layui-icon-card'
}

const showAddCard = () => {
  editMode.value = false
  Object.assign(cardForm, {
    cardType: '1',
    bankType: '',
    holderName: '',
    cardNumber: '',
    creditLimit: '',
    billDay: '',
    status: '1'
  })
  showCardModal.value = true
}

const editCard = (card: any) => {
  editMode.value = true
  Object.assign(cardForm, {
    cardType: card.cardType,
    bankType: card.bankType,
    holderName: card.holderName,
    cardNumber: card.cardNumber,
    creditLimit: card.creditLimit || '',
    billDay: card.billDay || '',
    status: card.status
  })
  showCardModal.value = true
}

const closeCardModal = () => {
  showCardModal.value = false
}

const submitCard = () => {
  if (!cardForm.bankType || !cardForm.holderName || !cardForm.cardNumber) {
    message.warning('请填写必填项')
    return
  }
  
  if (editMode.value) {
    message.success('更新成功')
  } else {
    cards.value.push({
      id: Date.now(),
      bankName: bankTypes.value.find(b => b.value === cardForm.bankType)?.label || '',
      bankType: cardForm.bankType,
      cardType: cardForm.cardType,
      cardNumber: cardForm.cardNumber,
      lastFourDigits: cardForm.cardNumber.slice(-4),
      holderName: cardForm.holderName,
      balance: cardForm.cardType === '1' ? '0.00' : '',
      creditLimit: cardForm.creditLimit || '',
      usedLimit: '',
      billDay: cardForm.billDay || '',
      status: cardForm.status
    })
    message.success('添加成功')
  }
  closeCardModal()
}

const deleteCurrentCard = () => {
  layerConfirm('确定要删除这张银行卡吗？', '确认删除', () => {
    cards.value = cards.value.filter(c => c.id !== 1)
    message('删除成功')
    closeCardModal()
  })
}

const toggleStatus = (card: any) => {
  card.status = card.status === '1' ? '2' : '1'
  message.success(card.status === '1' ? '已启用' : '已停用')
}

const viewDetail = (card: any) => {
  message.info(`查看 ${card.bankName} ***${card.lastFourDigits} 详情`)
}

const handleFilter = () => {
  message.success('查询成功')
}

const resetFilter = () => {
  Object.assign(filters, {
    familyMember: '',
    bankType: '',
    cardType: '',
    status: ''
  })
}

const showCreditStatement = () => {
  message.info('信用卡月账单功能开发中')
}
</script>

<style scoped>
.card-manage-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
  width: 140px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.summary-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.text-success { color: #16b777; }
.text-danger { color: #ff5722; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.bank-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s, box-shadow 0.3s;
}

.bank-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.bank-card.card-disabled {
  opacity: 0.7;
  filter: grayscale(0.5);
}

.card-type-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag-debit {
  background: rgba(255, 255, 255, 0.2);
}

.tag-credit {
  background: rgba(255, 255, 255, 0.3);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bank-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.bank-logo i {
  font-size: 24px;
}

.card-middle {
  margin: 20px 0;
}

.card-number {
  font-size: 22px;
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.card-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  flex: 1;
}

.info-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.status-active {
  color: #00ff88;
}

.status-disabled {
  color: #ff5722;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions .layui-btn {
  background: rgba(255, 255, 255, 0.2);
  border-color: transparent;
  color: #fff;
}

.card-actions .layui-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.card-background {
  position: absolute;
  bottom: -30px;
  right: -30px;
  font-size: 180px;
  opacity: 0.1;
  transform: rotate(-15deg);
}

.add-card-placeholder {
  background: #fff;
  border: 2px dashed #d0d0d0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  cursor: pointer;
  transition: all 0.3s;
  color: #999;
  gap: 12px;
}

.add-card-placeholder:hover {
  border-color: #16baaa;
  color: #16baaa;
  background: #f8f8f8;
}

.add-card-placeholder i {
  font-size: 48px;
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

.card-form {
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
</style>
