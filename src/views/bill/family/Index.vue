<template>
  <div class="family-container">
    <lay-space :size="20" direction="vertical" fill>
      <div class="panel-header">
        <h2>家庭成员</h2>
        <lay-button type="normal" @click="showAddMember">
          <i class="layui-icon layui-icon-add-1"></i> 添加成员
        </lay-button>
      </div>

      <lay-row :gutter="[20, 20]">
        <lay-col lg="6" md="6" sm="6" xs="12" v-for="(stat, index) in memberStats" :key="index">
          <lay-card bordered class="stat-card">
            <div class="card-body">
              <div class="stat-icon" :class="stat.class">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value">{{ stat.value }}</div>
              </div>
            </div>
          </lay-card>
        </lay-col>
      </lay-row>

      <lay-card title="成员列表" :bordered="false">
        <template #extra>
          <lay-input 
            v-model="searchText" 
            placeholder="搜索姓名、关系..." 
            size="sm"
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </template>

        <div v-if="filteredMembers.length === 0" class="empty-state">
          <i class="layui-icon layui-icon-user" style="font-size: 48px; color: #d9d9d9;"></i>
          <p style="color: #999; margin-top: 16px;">暂无家庭成员，点击右上角添加</p>
        </div>

        <lay-row v-else :gutter="[20, 20]">
          <lay-col lg="8" md="8" sm="6" xs="12" v-for="member in filteredMembers" :key="member.id">
            <lay-card :bordered="false" class="member-card">
              <lay-space :size="16" direction="vertical" fill>
                <div class="member-header">
                  <div class="member-avatar" :class="getAvatarClass(member.relation)">
                    <i class="layui-icon" :class="getAvatarIcon(member.relation)"></i>
                  </div>
                  <div class="member-actions">
                    <lay-button size="sm" @click="editMember(member)">
                      <i class="layui-icon layui-icon-edit"></i>
                    </lay-button>
                    <lay-button size="sm" type="danger" @click="deleteMember(member)">
                      <i class="layui-icon layui-icon-delete"></i>
                    </lay-button>
                  </div>
                </div>
                <div class="member-info">
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-relation">
                    <lay-tag size="sm">{{ member.relation }}</lay-tag>
                  </div>
                </div>
                <div class="member-details">
                  <div class="detail-item">
                    <i class="layui-icon layui-icon-gift"></i>
                    <span>{{ member.birthday || '未设置' }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="layui-icon layui-icon-cellphone"></i>
                    <span>{{ member.phone || '未设置' }}</span>
                  </div>
                  <div class="detail-item" v-if="member.remark">
                    <i class="layui-icon layui-icon-note"></i>
                    <span>{{ member.remark }}</span>
                  </div>
                </div>
              </lay-space>
            </lay-card>
          </lay-col>
        </lay-row>

        <div v-if="filteredMembers.length > 0" class="pagination">
          <div class="pagination-info">共 {{ totalMembers }} 条，第 {{ currentPage }} 页</div>
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

    <lay-layer v-model="showMemberModal" :title="editMode ? '编辑成员' : '添加成员'" :area="['600px']" >
      <lay-form :model="memberForm" :label-width="70" style="padding: 16px;">
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="姓名" required>
              <lay-input v-model="memberForm.name" placeholder="请输入姓名" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="关系" required>
              <lay-select v-model="memberForm.relation" placeholder="请选择关系">
                <lay-select-option v-for="rel in relations" :key="rel" :value="rel" :label="rel"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="生日">
              <lay-input v-model="memberForm.birthday" type="date" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="性别">
              <lay-select v-model="memberForm.gender" placeholder="请选择">
                <lay-select-option value="男" label="男"></lay-select-option>
                <lay-select-option value="女" label="女"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="手机号">
          <lay-input v-model="memberForm.phone" placeholder="请输入手机号" type="tel" />
        </lay-form-item>
        <lay-form-item label="备注">
          <lay-textarea v-model="memberForm.remark" placeholder="请输入备注信息" :rows="3" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end; padding: 0 16px 16px;">
          <lay-button @click="showMemberModal = false">取消</lay-button>
          <lay-button type="normal" @click="submitMember">确认保存</lay-button>
        </div>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import {
  LaySpace, LayRow, LayCol, LayCard, LayButton, LayInput, 
  LaySelect, LaySelectOption, LayTextarea, LayForm, LayTag
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = {
  success: (msg: string) => layer.msg(msg, { icon: 1, time: 2000 }),
  warning: (msg: string) => layer.msg(msg, { icon: 2, time: 2000 })
}

const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(6)
const showMemberModal = ref(false)
const editMode = ref(false)

const memberStats = [
  { label: '总成员数', value: '5', icon: 'layui-icon layui-icon-user', class: 'total' },
  { label: '长辈', value: '2', icon: 'layui-icon layui-icon-gift', class: 'elder' },
  { label: '同辈', value: '2', icon: 'layui-icon layui-icon-friends', class: 'peer' },
  { label: '晚辈', value: '1', icon: 'layui-icon layui-icon-login-qq', class: 'junior' }
]

const relations = ['父亲', '母亲', '配偶', '本人', '儿子', '女儿', '兄弟', '姐妹', '爷爷', '奶奶', '外公', '外婆']

const memberForm = reactive({
  name: '',
  relation: '',
  birthday: '',
  gender: '',
  phone: '',
  remark: ''
})

const members = ref([
  { id: 1, name: '张三', relation: '父亲', birthday: '1970-05-15', gender: '男', phone: '138****5678', remark: '退休教师' },
  { id: 2, name: '李四', relation: '母亲', birthday: '1972-08-20', gender: '女', phone: '139****1234', remark: '' },
  { id: 3, name: '王五', relation: '配偶', birthday: '1995-03-10', gender: '女', phone: '136****9876', remark: '设计师' },
  { id: 4, name: '本人', relation: '本人', birthday: '1994-06-25', gender: '男', phone: '135****4321', remark: '软件工程师' },
  { id: 5, name: '张小宝', relation: '儿子', birthday: '2020-12-01', gender: '男', phone: '', remark: '幼儿园' },
])

const getAvatarClass = (relation: string) => {
  if (['父亲', '母亲', '爷爷', '奶奶', '外公', '外婆'].includes(relation)) return 'avatar-elder'
  if (['本人', '配偶', '兄弟', '姐妹'].includes(relation)) return 'avatar-peer'
  return 'avatar-junior'
}

const getAvatarIcon = (relation: string) => {
  if (['父亲', '母亲', '爷爷', '奶奶', '外公', '外婆'].includes(relation)) return 'layui-icon-gift'
  if (['本人', '配偶'].includes(relation)) return 'layui-icon-user'
  return 'layui-icon-login-qq'
}

const filteredMembers = computed(() => {
  if (!searchText.value) return members.value
  const search = searchText.value.toLowerCase()
  return members.value.filter(m => 
    m.name.toLowerCase().includes(search) || 
    m.relation.toLowerCase().includes(search)
  )
})

const totalMembers = computed(() => filteredMembers.value.length)
const totalPages = computed(() => Math.ceil(totalMembers.value / pageSize.value))

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMembers.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showAddMember = () => {
  editMode.value = false
  Object.assign(memberForm, { name: '', relation: '', birthday: '', gender: '', phone: '', remark: '' })
  showMemberModal.value = true
}

const editMember = (member: any) => {
  editMode.value = true
  Object.assign(memberForm, { ...member })
  showMemberModal.value = true
}

const deleteMember = (member: any) => {
  layer.confirm('确定删除该家庭成员吗？', {
    icon: 3,
    yes: (index: number) => {
      const idx = members.value.findIndex(m => m.id === member.id)
      if (idx !== -1) members.value.splice(idx, 1)
      message.success('删除成功')
      layer.close(index)
    }
  })
}

const submitMember = () => {
  if (!memberForm.name || !memberForm.relation) {
    message.warning('姓名和关系为必填项')
    return
}
  if (editMode.value) {
    const idx = members.value.findIndex(m => m.id === 1)
    if (idx !== -1) Object.assign(members.value[idx], memberForm)
    message.success('更新成功')
} else {
    members.value.unshift({
      id: Date.now(),
      ...memberForm
})
    message.success('添加成功')
}
  showMemberModal.value = false
}

const handleSearch = () => { currentPage.value = 1 }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

onMounted(() => {
  nextTick(() => {
    // 页面初始化逻辑
})
})
</script>

<style scoped>
.family-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.breadcrumb-bar { padding: 12px 0; }
.breadcrumb-text { font-size: 14px; color: #666; }
.breadcrumb-separator { margin: 0 8px; color: #999; }
.breadcrumb-current { color: #333; font-weight: 500; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-header h2 { font-size: 20px; color: #333; }
.stat-card { 
  border-radius: 12px; 
  border: 1px solid #e8e8e8;
  background: #fff;
}
.stat-card .card-body {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 20px;
}
.stat-icon { 
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
.stat-icon.total { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); }
.stat-icon.elder { background: linear-gradient(135deg, #ffb800 0%, #ff9f43 100%); }
.stat-icon.peer { background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%); }
.stat-icon.junior { background: linear-gradient(135deg, #36d66c 0%, #16b777 100%); }
.stat-content { flex: 1; }
.stat-label { font-size: 14px; color: #666; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: 600; color: #333; }
.member-card { border-radius: 12px; transition: transform 0.3s, box-shadow 0.3s; }
.member-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); }
.member-header { display: flex; justify-content: space-between; align-items: center; }
.member-avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; }
.avatar-elder { background: linear-gradient(135deg, #ffb800 0%, #ff9f43 100%); }
.avatar-peer { background: linear-gradient(135deg, #1e9fff 0%, #33a0ff 100%); }
.avatar-junior { background: linear-gradient(135deg, #36d66c 0%, #16b777 100%); }
.member-actions { display: flex; gap: 4px; }
.member-info { text-align: center; }
.member-name { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 8px; }
.member-relation { display: flex; justify-content: center; }
.member-details { padding-top: 12px; border-top: 1px solid #f0f0f0; }
.detail-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666; margin-top: 8px; }
.detail-item i { color: #999; }
.empty-state { text-align: center; padding: 60px 20px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
</style>
