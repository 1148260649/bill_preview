<template>
  <div class="card-query-container">
    <lay-card :bordered="false">
      <template #title>
        <h2 style="margin: 0; font-size: 18px;">卡号查询</h2>
      </template>

      <div class="account-cards">
        <lay-row :gutter="[20, 20]">
          <lay-col lg="8" md="8" sm="6" xs="12" v-for="card in filteredCards" :key="card.id">
            <lay-card :bordered="false" class="card-item" :class="card.type">
              <div class="card-header">
                <div class="bank-name">{{ card.bankName }}</div>
                <div class="card-type">{{ card.type === 'debit' ? '借记卡' : '信用卡' }}</div>
              </div>
              <div class="card-number">
                <span class="partial">****</span>
                <span class="partial">****</span>
                <span class="partial">****</span>
                <span class="last4">{{ card.cardNumber.slice(-4) }}</span>
              </div>
              <div class="card-footer">
                <div class="card-info">
                  <div class="label">余额</div>
                  <div class="value" :class="card.type === 'credit' ? 'text-danger' : 'text-success'">
                    {{ formatMoney(card.balance) }}
                  </div>
                </div>
                <div class="card-actions">
                  <lay-button size="sm" @click="viewTransactions(card)">
                    <i class="layui-icon layui-icon-chart"></i>
                  </lay-button>
                  <lay-button size="sm" @click="copyCardNumber(card)">
                    <i class="layui-icon layui-icon-file"></i>
                  </lay-button>
                </div>
              </div>
            </lay-card>
          </lay-col>
        </lay-row>
      </div>

      <div class="filter-bar">
        <lay-space :size="16">
          <lay-input 
            v-model="searchText" 
            placeholder="搜索银行名称、卡号" 
            size="sm"
            style="width: 250px"
            @keyup.enter="handleSearch"
          />
          <lay-select v-model="filters.cardType" placeholder="卡片类型" size="sm" style="width: 120px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="debit" label="借记卡"></lay-select-option>
            <lay-select-option value="credit" label="信用卡"></lay-select-option>
          </lay-select>
          <lay-button type="normal" size="sm" @click="handleSearch">
            <i class="layui-icon layui-icon-search"></i> 查询
          </lay-button>
          <lay-button size="sm" @click="resetFilter">
            <i class="layui-icon layui-icon-refresh"></i> 重置
          </lay-button>
        </lay-space>
      </div>

      <lay-table :columns="columns" :data-source="filteredCards" :pagination="false">
        <template #type="{ row }">
          <span class="tag">{{ row.type }}</span>
        </template>
      </lay-table>
    </lay-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import { LayCard, LaySpace, LayButton, LayTable, LayInput, LaySelect, LaySelectOption, LayTag } from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = {
  info: (msg: string) => layer.msg(msg, { icon: 0, time: 2000 }),
  success: (msg: string) => layer.msg(msg, { icon: 1, time: 2000 }),
  error: (msg: string) => layer.msg(msg, { icon: 2, time: 2000 })
}

const columns = ref([
  { title: '银行名称', key: 'bankName', width: '150px' },
  { title: '卡号', key: 'cardNumber', width: '200px' },
  { title: '类型', key: 'type', width: '80px', customSlot: 'type' },
  { title: '余额', key: 'balance', width: '120px' },
  { title: '状态', key: 'status', width: '80px' },
  { title: '备注', key: 'remark' }
])

const searchText = ref('')

const filters = reactive({
  cardType: ''
})

const cards = ref([
  { id: 1, bankName: '工商银行', cardNumber: '6222 0212 3456 7890', type: 'debit', balance: 156420.80, creditLimit: 0, openDate: '2020-05-15', remark: '工资卡' },
  { id: 2, bankName: '建设银行', cardNumber: '6227 0014 5678 9012', type: 'debit', balance: 45280.50, creditLimit: 0, openDate: '2019-08-20', remark: '' },
  { id: 3, bankName: '招商银行', cardNumber: '6225 8801 2345 6789', type: 'credit', balance: -3250.00, creditLimit: 50000, openDate: '2021-03-10', remark: '日常消费' },
  { id: 4, bankName: '农业银行', cardNumber: '6228 4800 9876 5432', type: 'debit', balance: 88600.00, creditLimit: 0, openDate: '2018-12-01', remark: '存款' },
  { id: 5, bankName: '中国银行', cardNumber: '6216 6101 1122 3344', type: 'debit', balance: 25000.00, creditLimit: 0, openDate: '2022-06-15', remark: '备用金' },
])

const filteredCards = computed(() => {
  return cards.value.filter(card => {
    if (filters.cardType && card.type !== filters.cardType) return false
    if (!searchText.value) return true
    const search = searchText.value.toLowerCase()
    return card.bankName.toLowerCase().includes(search) || 
           card.cardNumber.replace(/\s/g, '').includes(search) ||
           card.cardNumber.toLowerCase().includes(search)
  })
})

const formatMoney = (amount: number) => amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const viewTransactions = (card: any) => {
  message.info('查看 ' + card.bankName + ' 交易明细')
}

const copyCardNumber = (card: any) => {
  const cardNum = card.cardNumber.replace(/\s/g, '')
  navigator.clipboard.writeText(cardNum).then(() => {
    message.success('卡号已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}

const handleSearch = () => { message.success('查询成功') }
const resetFilter = () => { Object.assign(filters, { cardType: '' }); searchText.value = '' }

onMounted(() => {
  nextTick(() => {
    // 页面初始化
  })
})
</script>

<style scoped>
.card-query-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.account-cards { margin-bottom: 24px; }
.card-item { border-radius: 12px; overflow: hidden; position: relative; }
.card-item.debit { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); color: #fff; }
.card-item.credit { background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%); color: #fff; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 12px; }
.bank-name { font-size: 18px; font-weight: 600; }
.card-type { font-size: 13px; opacity: 0.9; }
.card-number { display: flex; gap: 12px; padding: 0 20px 16px; font-family: monospace; font-size: 18px; letter-spacing: 2px; }
.partial { opacity: 0.6; }
.last4 { font-weight: 600; }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(0, 0, 0, 0.1); }
.card-info { flex: 1; }
.label { font-size: 12px; opacity: 0.8; margin-bottom: 4px; }
.value { font-size: 22px; font-weight: 600; }
.text-success { color: #4ecdc4; }
.text-danger { color: #ffeaa7; }
.card-actions { display: flex; gap: 8px; }
.card-actions .layui-btn { background: rgba(255, 255, 255, 0.2); border: none; color: #fff; }
.card-actions .layui-btn:hover { background: rgba(255, 255, 255, 0.3); }
.filter-bar { padding: 16px; background: #fff; border-radius: 8px; margin-bottom: 16px; }
</style>
