<template>
  <div class="role-container">
    <lay-card :bordered="false">
      <template #title>
        <h2 style="margin: 0; font-size: 18px;">角色管理</h2>
      </template>
      <template #extra>
        <lay-button type="normal" @click="showAddRole">
          <i class="layui-icon layui-icon-add-1"></i> 添加角色
        </lay-button>
      </template>

      <div class="filter-bar">
        <lay-space :size="16">
          <lay-input 
            v-model="filters.roleName" 
            placeholder="角色名称" 
            size="small"
            style="width: 150px"
          />
          <lay-input 
            v-model="filters.roleKey" 
            placeholder="权限字符" 
            size="small"
            style="width: 150px"
          />
          <lay-button type="normal" size="small" @click="handleSearch">
            <i class="layui-icon layui-icon-search"></i> 查询
          </lay-button>
          <lay-button size="small" @click="resetFilter">
            <i class="layui-icon layui-icon-refresh"></i> 重置
          </lay-button>
        </lay-space>
      </div>

      <lay-table :columns="columns" :data-source="paginatedRoles" :pagination="false">
        <template #status="{ row }">
          <lay-switch v-model="row.status" :checked-value="'1'" :unchecked-value="'0'" @change="toggleStatus(row)" />
        </template>
        <template #operator="{ row }">
          <lay-button size="small" @click="editRole(row)"><i class="layui-icon layui-icon-edit"></i></lay-button>
          <lay-button size="small" type="danger" @click="deleteRole(row)" :disabled="row.roleId === 1"><i class="layui-icon layui-icon-delete"></i></lay-button>
          <lay-button size="small" @click="assignPermissions(row)"><i class="layui-icon layui-icon-set"></i></lay-button>
        </template>
      </lay-table>

      <div class="pagination">
        <div class="pagination-info">共 {{ totalRoles }} 条，第 {{ currentPage }} 页</div>
        <lay-space :size="8">
          <lay-button size="small" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</lay-button>
          <lay-button 
            v-for="page in displayPages" 
            :key="page"
            size="small"
            :type="page === currentPage ? 'normal' : 'default'"
            @click="changePage(page)"
          >
            {{ page }}
          </lay-button>
          <lay-button size="small" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</lay-button>
        </lay-space>
      </div>
    </lay-card>

    <lay-layer v-model="showRoleModal" :title="editMode ? '编辑角色' : '添加角色'" :area="['600px', 'auto']">
      <lay-form :model="roleForm" :label-width="80" style="padding: 8px 0;">
        <lay-row :gutter="[16, 0]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="角色名称" required>
              <lay-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="权限字符" required>
              <lay-input v-model="roleForm.roleKey" placeholder="请输入权限字符" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="显示顺序">
          <lay-input v-model="roleForm.roleSort" type="number" placeholder="数字越小越靠前" />
        </lay-form-item>
        <lay-form-item label="状态">
          <lay-radio-group v-model="roleForm.status">
            <lay-radio value="1">正常</lay-radio>
            <lay-radio value="0">停用</lay-radio>
          </lay-radio-group>
        </lay-form-item>
        <lay-form-item label="备注">
          <lay-textarea v-model="roleForm.remark" placeholder="请输入备注" :rows="3" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <lay-button @click="showRoleModal = false">取消</lay-button>
        <lay-button type="normal" @click="submitRole">确认保存</lay-button>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import {
  LayCard, LaySpace, LayButton, LayTable,
  LayInput, LayTextarea, LayForm, LaySwitch, LayRadioGroup, LayRadio
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = layer.msg

const columns = ref([
  { title: '角色 ID', key: 'roleId', width: '100px' },
  { title: '角色名称', key: 'roleName', width: '150px' },
  { title: '权限字符', key: 'roleKey', width: '150px' },
  { title: '显示顺序', key: 'roleSort', width: '100px' },
  { title: '状态', key: 'status', width: '80px', customSlot: 'status' },
  { title: '创建时间', key: 'createTime', width: '180px' },
  { title: '操作', key: 'operator', width: '220px', fixed: 'right', customSlot: 'operator' }
])

const currentPage = ref(1)
const pageSize = ref(10)
const showRoleModal = ref(false)
const editMode = ref(false)

const filters = reactive({
  roleName: '',
  roleKey: ''
})

const roleForm = reactive({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  roleSort: '1',
  status: '1',
  remark: ''
})

const roles = ref([
  { roleId: 1, roleName: '超级管理员', roleKey: 'admin', roleSort: '1', status: '1', createTime: '2026-01-01 00:00:00', remark: '' },
  { roleId: 2, roleName: '普通用户', roleKey: 'common', roleSort: '2', status: '1', createTime: '2026-01-15 10:00:00', remark: '' },
  { roleId: 3, roleName: '审计员', roleKey: 'auditor', roleSort: '3', status: '1', createTime: '2026-02-20 14:30:00', remark: '' },
  { roleId: 4, roleName: '测试角色', roleKey: 'test', roleSort: '4', status: '0', createTime: '2026-03-10 09:00:00', remark: '已停用' },
])

const totalRoles = computed(() => roles.value.length)
const totalPages = computed(() => Math.ceil(totalRoles.value / pageSize.value))

const filteredRoles = computed(() => {
  return roles.value.filter(role => {
    if (filters.roleName && !role.roleName.includes(filters.roleName)) return false
    if (filters.roleKey && !role.roleKey.includes(filters.roleKey)) return false
    return true
})
})

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRoles.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showAddRole = () => {
  editMode.value = false
  Object.assign(roleForm, { roleId: undefined, roleName: '', roleKey: '', roleSort: '1', status: '1', remark: '' })
  showRoleModal.value = true
}

const editRole = (role: any) => {
  editMode.value = true
  Object.assign(roleForm, { ...role })
  showRoleModal.value = true
}

const deleteRole = (role: any) => {
  layer.confirm('确定删除该角色吗？', { icon: 3 }, (index: number) => {
    const idx = roles.value.findIndex(r => r.roleId === role.roleId)
    if (idx !== -1) roles.value.splice(idx, 1)
    message('删除成功', { icon: 1 })
    layer.close(index)
})
}

const assignPermissions = (role: any) => {
  message('权限分配功能开发中', { icon: 0 })
}

const toggleStatus = (role: any) => {
  message(role.status === '1' ? '已启用' : '已停用', { icon: 1 })
}

const submitRole = () => {
  if (!roleForm.roleName || !roleForm.roleKey) {
    message('请填写必填项', { icon: 2 })
    return
}
  if (editMode.value) {
    const idx = roles.value.findIndex(r => r.roleId === roleForm.roleId)
    if (idx !== -1) Object.assign(roles.value[idx], roleForm)
    message('更新成功', { icon: 1 })
} else {
    roles.value.unshift({
      roleId: Date.now(),
      ...roleForm,
      createTime: new Date().toLocaleString('zh-CN')
})
    message('添加成功', { icon: 1 })
}
  showRoleModal.value = false
}

const handleSearch = () => { currentPage.value = 1; message('查询成功', { icon: 1 }) }
const resetFilter = () => { Object.assign(filters, { roleName: '', roleKey: '' }) }
const changePage = (page: number) => { if (page > 0 && page <= totalPages.value) currentPage.value = page }

onMounted(() => {
  nextTick(() => {
    // 页面初始化
})
})
</script>

<style scoped>
.role-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.filter-bar { padding: 16px; background: #f5f6f7; margin-bottom: 16px; border-radius: 8px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
</style>
