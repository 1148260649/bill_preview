<template>
  <div class="user-container">
    <lay-card :bordered="false">
      <template #title>
        <lay-space :size="16">
          <h2 style="margin: 0; font-size: 18px;">用户管理</h2>
        </lay-space>
      </template>
      <template #extra>
        <lay-button type="normal" @click="showAddUser">
          <i class="layui-icon layui-icon-add-1"></i> 添加用户
        </lay-button>
      </template>

      <div class="filter-bar">
        <lay-space :size="16">
          <lay-input 
            v-model="filters.username" 
            placeholder="用户名" 
            size="sm"
            style="width: 150px"
          />
          <lay-input 
            v-model="filters.phone" 
            placeholder="手机号" 
            size="sm"
            style="width: 150px"
          />
          <lay-select v-model="filters.status" placeholder="状态" size="sm" style="width: 100px">
            <lay-select-option value="" label="全部"></lay-select-option>
            <lay-select-option value="1" label="正常"></lay-select-option>
            <lay-select-option value="0" label="停用"></lay-select-option>
          </lay-select>
          <lay-button type="normal" size="sm" @click="handleSearch">
            <i class="layui-icon layui-icon-search"></i> 查询
          </lay-button>
          <lay-button size="sm" @click="resetFilter">
            <i class="layui-icon layui-icon-refresh"></i> 重置
          </lay-button>
        </lay-space>
      </div>

      <lay-table 
        :columns="columns" 
        :data-source="paginatedUsers" 
        :pagination="false"
      >
        <template #status="{ row }">
          <lay-switch 
            v-model="row.status" 
            :checked-value="'1'" 
            :unchecked-value="'0'"
            :disabled="row.userId === 1"
            @change="toggleStatus(row)"
          />
        </template>
        <template #operator="{ row }">
          <lay-button size="sm" @click="editUser(row)">
            <i class="layui-icon layui-icon-edit"></i>
          </lay-button>
          <lay-button size="sm" type="danger" @click="deleteUser(row)" :disabled="row.userId === 1">
            <i class="layui-icon layui-icon-delete"></i>
          </lay-button>
          <lay-button size="sm" @click="resetPassword(row)">
            <i class="layui-icon layui-icon-refresh-1"></i>
          </lay-button>
        </template>
      </lay-table>

      <div class="pagination">
        <div class="pagination-info">共 {{ totalUsers }} 条，第 {{ currentPage }} 页</div>
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

    <lay-layer v-model="showUserModal" :title="editMode ? '编辑用户' : '添加用户'" :area="['600px', 'auto']">
      <lay-form :model="userForm" :label-width="80" style="padding: 8px 0;">
        <lay-row :gutter="[16, 0]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="用户名" required>
              <lay-input v-model="userForm.userName" placeholder="请输入用户名" :disabled="editMode" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="昵称" required>
              <lay-input v-model="userForm.nickName" placeholder="请输入昵称" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[16, 0]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="手机号" required>
              <lay-input v-model="userForm.phonenumber" placeholder="请输入手机号" type="tel" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="邮箱">
              <lay-input v-model="userForm.email" placeholder="请输入邮箱" type="email" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="性别">
          <lay-radio-group v-model="userForm.sex">
            <lay-radio value="1">男</lay-radio>
            <lay-radio value="0">女</lay-radio>
          </lay-radio-group>
        </lay-form-item>
        <lay-row :gutter="[16, 0]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="部门">
              <lay-select v-model="userForm.deptId" placeholder="请选择部门">
                <lay-select-option value="1" label="研发部"></lay-select-option>
                <lay-select-option value="2" label="市场部"></lay-select-option>
                <lay-select-option value="3" label="销售部"></lay-select-option>
                <lay-select-option value="4" label="财务部"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="角色">
              <lay-select v-model="userForm.roleId" placeholder="请选择角色">
                <lay-select-option value="1" label="管理员"></lay-select-option>
                <lay-select-option value="2" label="普通用户"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="状态">
          <lay-radio-group v-model="userForm.status">
            <lay-radio value="1">正常</lay-radio>
            <lay-radio value="0">停用</lay-radio>
          </lay-radio-group>
        </lay-form-item>
        <lay-form-item label="备注">
          <lay-textarea v-model="userForm.remark" placeholder="请输入备注" :rows="3" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <lay-button @click="showUserModal = false">取消</lay-button>
        <lay-button type="normal" @click="submitUser">确认保存</lay-button>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import {
  LayCard, LaySpace, LayButton, LayTable,
  LayInput, LaySelect, LaySelectOption, LayForm,
  LaySwitch, LayRadioGroup, LayRadio
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = layer.msg

const columns = ref([
  { title: '用户 ID', key: 'userId', width: '100px' },
  { title: '用户名', key: 'userName', width: '120px' },
  { title: '昵称', key: 'nickName', width: '120px' },
  { title: '部门', key: 'deptName', width: '150px' },
  { title: '手机号', key: 'phonenumber', width: '130px' },
  { title: '状态', key: 'status', width: '80px', customSlot: 'status' },
  { title: '创建时间', key: 'createTime', width: '180px' },
  { title: '操作', key: 'operator', width: '180px', fixed: 'right' as const, customSlot: 'operator' }
])

const currentPage = ref(1)
const pageSize = ref(10)
const showUserModal = ref(false)
const editMode = ref(false)

const filters = reactive({
  username: '',
  phone: '',
  status: ''
})

const userForm = reactive({
  userId: undefined,
  userName: '',
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '1',
  deptId: '',
  roleId: '',
  status: '1',
  remark: ''
})

const users = ref([
  { userId: 1, userName: 'admin', nickName: '管理员', phonenumber: '13800138000', deptName: '研发部', status: '1', createTime: '2026-01-01 00:00:00', remark: '' },
  { userId: 2, userName: 'zhangsan', nickName: '张三', phonenumber: '13900139000', deptName: '市场部', status: '1', createTime: '2026-02-15 10:30:00', remark: '' },
  { userId: 3, userName: 'lisi', nickName: '李四', phonenumber: '13700137000', deptName: '销售部', status: '1', createTime: '2026-03-20 14:20:00', remark: '' },
  { userId: 4, userName: 'wangwu', nickName: '王五', phonenumber: '13600136000', deptName: '财务部', status: '0', createTime: '2026-04-10 09:15:00', remark: '已离职' },
])

const totalUsers = computed(() => users.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    if (filters.username && !user.userName.includes(filters.username)) return false
    if (filters.phone && !user.phonenumber.includes(filters.phone)) return false
    if (filters.status && user.status !== filters.status) return false
    return true
})
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showAddUser = () => {
  editMode.value = false
  Object.assign(userForm, { userId: undefined, userName: '', nickName: '', phonenumber: '', email: '', sex: '1', deptId: '', roleId: '', status: '1', remark: '' })
  showUserModal.value = true
}

const editUser = (user: any) => {
  editMode.value = true
  Object.assign(userForm, { ...user })
  showUserModal.value = true
}

const deleteUser = (user: any) => {
  layer.confirm('确定删除该用户吗？', {
    icon: 3,
    yes: (index: number) => {
      const idx = users.value.findIndex(u => u.userId === user.userId)
      if (idx !== -1) users.value.splice(idx, 1)
      layer.close(index)
    }
  })
}

const resetPassword = (user: any) => {
  layer.confirm('确定重置用户密码吗？', {
    icon: 3,
    yes: (index: number) => {
      layer.close(index)
    }
  })
}

const toggleStatus = (user: any) => {
  message(user.status === '1' ? '已启用' : '已停用', { icon: 1 })
}

const submitUser = () => {
  if (!userForm.userName || !userForm.nickName || !userForm.phonenumber) {
    message('请填写必填项', { icon: 2 })
    return
}
  if (editMode.value) {
    const idx = users.value.findIndex(u => u.userId === userForm.userId)
    if (idx !== -1) Object.assign(users.value[idx], userForm)
    message('更新成功', { icon: 1 })
} else {
    users.value.unshift({
      ...userForm, userId: Date.now(),
      deptName: '研发部',
      createTime: new Date().toLocaleString('zh-CN')
})
    message('添加成功', { icon: 1 })
}
  showUserModal.value = false
}

const handleSearch = () => { currentPage.value = 1; message('查询成功', { icon: 1 }) }
const resetFilter = () => { Object.assign(filters, { username: '', phone: '', status: '' }) }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

onMounted(() => {
  nextTick(() => {
    // 页面初始化
})
})
</script>

<style scoped>
.user-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.filter-bar { padding: 16px; background: #f5f6f7; margin-bottom: 16px; border-radius: 8px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
</style>
