<template>
  <div class="card-manage-container">

    <div class="page-header">
      <h2><i class="layui-icon layui-icon-card"></i> 银行卡管理</h2>
      <div class="header-actions">
        <lay-button @click="showAddCard">
          <i class="layui-icon layui-icon-add-1"></i> 添加银行卡
        </lay-button>
        <lay-button @click="showCreditStatement">
          <i class="layui-icon layui-icon-dialogue"></i> 信用卡月账单
        </lay-button>
      </div>
    </div>

    <div class="filter-section">
      <lay-space :size="16">
        <lay-space :size="8">
          <label>家庭成员:</label>
          <lay-select v-model="filters.familyMember" style="width: 140px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option v-for="member in familyMembers" :key="member.id" :value="member.name" :label="member.name"></lay-select-option>
          </lay-select>
        </lay-space>
        <lay-space :size="8">
          <label>银行类型:</label>
          <lay-select v-model="filters.bankType" style="width: 140px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option v-for="bank in bankTypes" :key="bank.value" :value="bank.value" :label="bank.label"></lay-select-option>
          </lay-select>
        </lay-space>
        <lay-space :size="8">
          <label>卡片类型:</label>
          <lay-select v-model="filters.cardType" style="width: 120px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="1" label="储蓄卡"></lay-select-option>
            <lay-select-option value="2" label="信用卡"></lay-select-option>
            <lay-select-option value="3" label="信用付"></lay-select-option>
          </lay-select>
        </lay-space>
        <lay-space :size="8">
          <label>状态:</label>
          <lay-select v-model="filters.status" style="width: 120px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="1" label="激活"></lay-select-option>
            <lay-select-option value="2" label="停用"></lay-select-option>
          </lay-select>
        </lay-space>
        <lay-button size="small" @click="handleFilter">
          <i class="layui-icon layui-icon-search"></i> 查询
        </lay-button>
        <lay-button size="small" @click="resetFilter">
          <i class="layui-icon layui-icon-refresh"></i> 重置
        </lay-button>
      </lay-space>
    </div>

    <lay-row :gutter="[20, 20]" class="summary-cards">
      <lay-col lg="6" md="6" sm="6" xs="12">
        <lay-card bordered>
          <div class="summary-label">总卡片数</div>
          <div class="summary-value">{{ cards.length }} 张</div>
        </lay-card>
      </lay-col>
      <lay-col lg="6" md="6" sm="6" xs="12">
        <lay-card bordered>
          <div class="summary-label">储蓄卡</div>
          <div class="summary-value">{{ debitCards }} 张</div>
        </lay-card>
      </lay-col>
      <lay-col lg="6" md="6" sm="6" xs="12">
        <lay-card bordered>
          <div class="summary-label">信用卡</div>
          <div class="summary-value">{{ creditCards }} 张</div>
        </lay-card>
      </lay-col>
      <lay-col lg="6" md="6" sm="6" xs="12">
        <lay-card bordered>
          <div class="summary-label">总余额</div>
          <div class="summary-value text-success">¥ {{ totalBalance }}</div>
        </lay-card>
      </lay-col>
    </lay-row>

    <div class="cards-grid">
      <div 
        v-for="card in paginatedCards" 
        :key="card.id"
        class="bank-card"
        :class="['card-type-' + card.cardType, card.status === '2' ? 'card-disabled' : '']"
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
            <span>****</span><span>****</span><span>****</span><span>{{ card.lastFourDigits }}</span>
          </div>
        </div>
        <div class="card-info">
          <div class="info-item">
            <div class="info-label"><i class="layui-icon layui-icon-username"></i> 持卡人</div>
            <div class="info-value">{{ card.holderName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label"><i class="layui-icon layui-icon-dollar"></i> {{ card.cardType === '2' ? '可用额度' : '余额' }}</div>
            <div class="info-value">{{ card.cardType === '2' ? '¥ ' + card.creditLimit : '¥ ' + card.balance }}</div>
          </div>
          <div class="info-item" v-if="card.cardType === '2'">
            <div class="info-label"><i class="layui-icon layui-icon-rmb"></i> 已用额度</div>
            <div class="info-value text-danger">¥ {{ card.usedLimit }}</div>
          </div>
        </div>
        <div class="card-footer">
          <div class="card-status" :class="card.status === '1' ? 'status-active' : 'status-disabled'">
            <i class="layui-icon" :class="card.status === '1' ? 'layui-icon-ok-circle' : 'layui-icon-close-circle'"></i>
            {{ card.status === '1' ? '激活' : '停用' }}
          </div>
          <div class="card-actions">
            <lay-button size="small" @click="viewDetail(card)">
              <i class="layui-icon layui-icon-eye"></i> 详情
            </lay-button>
            <lay-button size="small" @click="editCard(card)">
              <i class="layui-icon layui-icon-edit"></i> 编辑
            </lay-button>
            <lay-button size="small" :type="card.status === '1' ? 'danger' : 'normal'" @click="toggleStatus(card)">
              {{ card.status === '1' ? '停用' : '启用' }}
            </lay-button>
          </div>
        </div>
      </div>
      <div class="add-card-placeholder" @click="showAddCard">
        <i class="layui-icon layui-icon-add-1"></i>
        <span>添加银行卡</span>
      </div>
    </div>

    <lay-layer v-model="showCardModal" :title="editMode ? '编辑银行卡' : '添加银行卡'" :area="['700px', 'auto']">
      <lay-form :model="cardForm" :label-width="100">
        <lay-form-item label="卡类型" required>
          <div class="type-selector">
            <lay-button :type="cardForm.cardType === '1' ? 'normal' : 'default'" @click="cardForm.cardType = '1'">
              <i class="layui-icon layui-icon-card"></i> 储蓄卡
            </lay-button>
            <lay-button :type="cardForm.cardType === '2' ? 'normal' : 'default'" @click="cardForm.cardType = '2'">
              <i class="layui-icon layui-icon-dollar"></i> 信用卡
            </lay-button>
          </div>
        </lay-form-item>
        <lay-row :gutter="[16, 0]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="银行" required>
              <lay-select v-model="cardForm.bankType" placeholder="请选择银行">
                <lay-select-option v-for="bank in bankTypes" :key="bank.value" :value="bank.value" :label="bank.label"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="持卡人" required>
              <lay-select v-model="cardForm.holderName" placeholder="请选择">
                <lay-select-option v-for="member in familyMembers" :key="member.id" :value="member.name" :label="member.name"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="卡号" required>
          <lay-input v-model="cardForm.cardNumber" placeholder="请输入完整的银行卡号" maxlength="19" />
        </lay-form-item>
        <lay-row :gutter="[16, 0]" v-if="cardForm.cardType === '2'">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="信用额度">
              <lay-input v-model="cardForm.creditLimit" type="number" placeholder="请输入信用额度" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="账单日">
              <lay-select v-model="cardForm.billDay" placeholder="选择账单日">
                <lay-select-option v-for="day in 31" :key="day" :value="day" :label="day + '日'"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="状态">
          <div class="switch-wrapper">
            <input type="checkbox" v-model="cardForm.status" true-value="1" false-value="2" class="layui-switch" />
          </div>
        </lay-form-item>
      </lay-form>
      <template #footer>
        <lay-button @click="closeCardModal">取消</lay-button>
        <lay-button type="danger" @click="deleteCurrentCard" v-if="editMode">
          <i class="layui-icon layui-icon-delete"></i> 删除
        </lay-button>
        <lay-button type="primary" @click="submitCard">
          <i class="layui-icon layui-icon-ok"></i> 确认
        </lay-button>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { LayRow, LayCol, LayCard, LayButton, LayForm, LayFormItem, LayInput, LaySelect, LaySelectOption } from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = {
  success: (msg: string) => layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layer.msg(msg, { icon: 3, time: 2000 })
}

const showCardModal = ref(false)
const editMode = ref(false)
const familyMembers = ref([{ id: 1, name: '张三' }, { id: 2, name: '李四' }, { id: 3, name: '张小明' }])
const bankTypes = ref([
  { value: 'icbc', label: '工商银行' }, { value: 'cmb', label: '招商银行' }, { value: 'ccb', label: '建设银行' },
  { value: 'abc', label: '农业银行' }, { value: 'boc', label: '中国银行' }, { value: 'comm', label: '交通银行' }
])
const filters = reactive({ familyMember: '', bankType: '', cardType: '', status: '' })
const cardForm = reactive({ cardType: '1', bankType: '', holderName: '', cardNumber: '', creditLimit: '', billDay: '', status: '1' })
const currentPage = ref(1)
const pageSize = ref(5)

const cards = ref([
  { id: 1, bankName: '招商银行', bankType: 'cmb', cardType: '1', cardNumber: '6225880100011234', lastFourDigits: '1234', holderName: '张三', balance: '1,500.00', creditLimit: '', usedLimit: '', status: '1' },
  { id: 2, bankName: '工商银行', bankType: 'icbc', cardType: '1', cardNumber: '6222020100021234', lastFourDigits: '1234', holderName: '李四', balance: '2,500.00', creditLimit: '', usedLimit: '', status: '1' },
  { id: 3, bankName: '建设银行', bankType: 'ccb', cardType: '2', cardNumber: '6227020100031234', lastFourDigits: '1234', holderName: '张三', balance: '', creditLimit: '60,000.00', usedLimit: '5,300.00', billDay: '4', status: '1' },
])

const totalCards = computed(() => cards.value.length)
const totalPages = computed(() => Math.ceil(totalCards.value / pageSize.value))
const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return cards.value.slice(start, end)
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
const debitCards = computed(() => cards.value.filter(c => c.cardType === '1').length)
const creditCards = computed(() => cards.value.filter(c => c.cardType === '2').length)
const totalBalance = computed(() => cards.value.filter(c => c.cardType === '1').reduce((sum, c) => sum + parseFloat(c.balance.replace(/,/g, '')) || 0, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 }))

const getBankIcon = (bankType: string) => {
  const icons: Record<string, string> = { icbc: 'layui-icon layui-icon-about', cmb: 'layui-icon layui-icon-about', ccb: 'layui-icon layui-icon-about' }
  return icons[bankType] || 'layui-icon layui-icon-about'
}
const handleFilter = () => message.success('查询成功')
const resetFilter = () => { Object.keys(filters).forEach(k => (filters as any)[k] = '') }
const showAddCard = () => { editMode = false; Object.keys(cardForm).forEach(k => (cardForm as any)[k] = k === 'cardType' ? '1' : k === 'status' ? '1' : ''); showCardModal.value = true }
const editCard = (card: any) => { editMode = true; Object.assign(cardForm, card); showCardModal.value = true }
const closeCardModal = () => { showCardModal.value = false }
const submitCard = () => { message.success(editMode ? '更新成功' : '添加成功'); closeCardModal() }
const deleteCurrentCard = () => { message.success('删除成功'); closeCardModal() }
const viewDetail = (card: any) => { message.info(`查看 ${card.bankName} 卡片详情`) }
const editCardAction = (card: any) => { editCard(card) }
const toggleStatus = (card: any) => { card.status = card.status === '1' ? '2' : '1'; message.success(card.status === '1' ? '已启用' : '已停用') }
const showCreditStatement = () => { message.info('信用卡月账单功能开发中') }
</script>

<style scoped>
.card-manage-container { padding: 20px; }
.breadcrumb-bar { padding: 12px 0; }
.breadcrumb-text { font-size: 14px; color: #666; }
.breadcrumb-separator { margin: 0 8px; color: #999; }
.breadcrumb-current { color: #333; font-weight: 500; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.header-actions { display: flex; gap: 12px; }
.filter-section { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.summary-cards { margin-bottom: 24px; }
.summary-cards .layui-card {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  background: #fff;
}
.summary-label { font-size: 14px; color: #999; margin-bottom: 8px; }
.summary-value { font-size: 28px; font-weight: 600; color: #333; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
.bank-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 20px; color: #fff; position: relative; overflow: hidden; transition: transform 0.3s; }
.bank-card:hover { transform: translateY(-4px); }
.bank-card.card-disabled { opacity: 0.6; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.bank-logo { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; }
.card-type-tag { background: rgba(255,255,255,0.3); padding: 4px 12px; border-radius: 12px; font-size: 12px; }
.card-number { font-size: 22px; letter-spacing: 2px; margin-bottom: 24px; }
.card-info { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.info-item { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.info-label { opacity: 0.8; display: flex; align-items: center; gap: 6px; }
.info-value { font-size: 15px; font-weight: 600; }
.card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 16px; }
.card-status { display: flex; align-items: center; gap: 6px; font-size: 13px; opacity: 0.9; }
.card-actions { display: flex; gap: 8px; }
.add-card-placeholder { background: #fff; border: 2px dashed #d0d0d0; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; cursor: pointer; transition: all 0.3s; color: #999; gap: 12px; }
.add-card-placeholder:hover { border-color: #16baaa; color: #16baaa; background: #f8f8f8; }
.add-card-placeholder i { font-size: 48px; }
.type-selector { display: flex; gap: 12px; }
.switch-wrapper { display: flex; align-items: center; gap: 12px; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
</style>
