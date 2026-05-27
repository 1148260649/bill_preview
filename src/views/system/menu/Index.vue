<template>
  <div class="menu-container">
    <lay-card :bordered="false">
      <template #title>
        <h2 style="margin: 0; font-size: 18px;">菜单管理</h2>
      </template>
      <template #extra>
        <lay-button type="normal" @click="showAddMenu">
          <i class="layui-icon layui-icon-add-1"></i> 添加菜单
        </lay-button>
      </template>

      <div class="filter-bar">
        <lay-space :size="16">
          <lay-input 
            v-model="searchText" 
            placeholder="菜单名称" 
            size="sm"
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <lay-button type="normal" size="sm" @click="handleSearch">
            <i class="layui-icon layui-icon-search"></i> 查询
          </lay-button>
          <lay-button size="sm" @click="resetSearch">
            <i class="layui-icon layui-icon-refresh"></i> 重置
          </lay-button>
        </lay-space>
      </div>

      <div class="menu-content">
        <div class="menu-tree-panel">
          <div class="tree-header">
            <span class="tree-title">菜单树</span>
            <span class="tree-count">共 {{ totalMenuCount }} 个菜单</span>
          </div>
          <div class="tree-container">
            <lay-tree 
              :data="filteredMenuTree" 
              :default-expand-all="true"
              :show-line="true"
              :selected-key="selectedMenuId"
              :replace-fields="{ id: 'menuId', title: 'menuName', children: 'children' }"
              @node-click="handleNodeClick"
            >
              <template #default="{ node }">
                <div class="tree-node-content">
                  <i :class="node.icon || 'layui-icon layui-icon-component'" class="tree-node-icon"></i>
                  <span class="tree-node-title">{{ node.menuName }}</span>
                  <span class="tree-node-type" :class="getTypeClass(node.menuType)">{{ getTypeText(node.menuType) }}</span>
                </div>
              </template>
            </lay-tree>
          </div>
        </div>

        <div class="menu-detail-panel" v-if="selectedMenu">
          <div class="detail-header">
            <h3>菜单详情</h3>
            <div class="detail-actions">
              <lay-button size="sm" type="normal" @click="editMenu(selectedMenu)">
                <i class="layui-icon layui-icon-edit"></i> 编辑
              </lay-button>
              <lay-button size="sm" type="danger" @click="deleteMenu(selectedMenu)">
                <i class="layui-icon layui-icon-delete"></i> 删除
              </lay-button>
            </div>
          </div>
          <lay-descriptions :column="2" bordered size="medium">
            <lay-descriptions-item label="菜单 ID">{{ selectedMenu.menuId }}</lay-descriptions-item>
            <lay-descriptions-item label="菜单名称">{{ selectedMenu.menuName }}</lay-descriptions-item>
            <lay-descriptions-item label="上级菜单">{{ getParentMenuName(selectedMenu.parentId) }}</lay-descriptions-item>
            <lay-descriptions-item label="菜单类型">
              <lay-tag :color="getTypeColor(selectedMenu.menuType)">{{ getTypeText(selectedMenu.menuType) }}</lay-tag>
            </lay-descriptions-item>
            <lay-descriptions-item label="路由地址">{{ selectedMenu.path || '-' }}</lay-descriptions-item>
            <lay-descriptions-item label="组件路径">{{ selectedMenu.component || '-' }}</lay-descriptions-item>
            <lay-descriptions-item label="权限标识">{{ selectedMenu.perms || '-' }}</lay-descriptions-item>
            <lay-descriptions-item label="菜单图标">
              <span style="display: flex; align-items: center; gap: 4px;">
                <i :class="selectedMenu.icon || 'layui-icon layui-icon-component'"></i>
                <span>{{ selectedMenu.icon || '-' }}</span>
              </span>
            </lay-descriptions-item>
            <lay-descriptions-item label="显示顺序">{{ selectedMenu.orderNum }}</lay-descriptions-item>
            <lay-descriptions-item label="是否显示">
              <lay-tag :color="selectedMenu.visible === '0' ? '#16baaa' : '#999'">
                {{ selectedMenu.visible === '0' ? '显示' : '隐藏' }}
              </lay-tag>
            </lay-descriptions-item>
            <lay-descriptions-item label="状态">
              <lay-tag :color="selectedMenu.status === '1' ? '#16baaa' : '#ff5500'">
                {{ selectedMenu.status === '1' ? '正常' : '停用' }}
              </lay-tag>
            </lay-descriptions-item>
            <lay-descriptions-item label="备注" :span="2" v-if="selectedMenu.remark">
              {{ selectedMenu.remark }}
            </lay-descriptions-item>
          </lay-descriptions>
        </div>
        <div class="menu-detail-panel empty-panel" v-else>
          <lay-empty description="点击左侧菜单查看详情"></lay-empty>
        </div>
      </div>
    </lay-card>

    <lay-layer v-model="showMenuModal" :title="editMode ? '编辑菜单' : '添加菜单'" :area="['750px']">
      <lay-form :model="menuForm" :label-width="90" style="padding: 16px;">
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="上级菜单" required>
              <lay-select v-model="menuForm.parentId" placeholder="请选择上级菜单">
                <lay-select-option value="0" label="顶级菜单"></lay-select-option>
                <lay-select-option value="1" label="系统管理"></lay-select-option>
                <lay-select-option value="2" label="账单管理"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="菜单名称" required>
              <lay-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="菜单类型">
              <lay-select v-model="menuForm.menuType" placeholder="请选择类型">
                <lay-select-option value="M" label="目录"></lay-select-option>
                <lay-select-option value="C" label="菜单"></lay-select-option>
                <lay-select-option value="F" label="按钮"></lay-select-option>
              </lay-select>
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="显示顺序">
              <lay-input v-model="menuForm.orderNum" type="number" placeholder="数字越小越靠前" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="路由地址">
              <lay-input v-model="menuForm.path" placeholder="请输入路由地址" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="组件路径">
              <lay-input v-model="menuForm.component" placeholder="请输入组件路径" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="权限标识">
              <lay-input v-model="menuForm.perms" placeholder="例如：system:user:list" />
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="菜单图标">
              <lay-input v-model="menuForm.icon" placeholder="例如：layui-icon-user" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-row :gutter="[20, 16]">
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="是否显示">
              <lay-radio-group v-model="menuForm.visible">
                <lay-radio value="0">显示</lay-radio>
                <lay-radio value="1">隐藏</lay-radio>
              </lay-radio-group>
            </lay-form-item>
          </lay-col>
          <lay-col lg="12" md="12" sm="6" xs="12">
            <lay-form-item label="状态">
              <lay-radio-group v-model="menuForm.status">
                <lay-radio value="1">正常</lay-radio>
                <lay-radio value="0">停用</lay-radio>
              </lay-radio-group>
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="备注">
          <lay-textarea v-model="menuForm.remark" placeholder="请输入备注" :rows="3" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end; padding: 0 16px 16px;">
          <lay-button @click="showMenuModal = false">取消</lay-button>
          <lay-button type="normal" @click="submitMenu">确认保存</lay-button>
        </div>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import {
  LayCard, LaySpace, LayButton, LayInput, LaySelect, LaySelectOption,
  LayForm, LayTextarea, LayRadioGroup, LayRadio, LayTag, LayCol, LayRow, LayTree,
  LayDescriptions, LayDescriptionsItem, LayEmpty
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = layer.msg

const searchText = ref('')
const showMenuModal = ref(false)
const editMode = ref(false)
const selectedMenuId = ref<string | number | undefined>(undefined)
const selectedMenu = ref<any | null>(null)

const menuForm = reactive({
  menuId: undefined,
  parentId: '0',
  menuName: '',
  menuType: 'C',
  orderNum: '1',
  path: '',
  component: '',
  perms: '',
  icon: '',
  visible: '0',
  status: '1',
  remark: ''
})

const menuList = ref([
  { 
    menuId: '1', 
    menuName: '系统管理', 
    menuType: 'M', 
    orderNum: '1', 
    path: '/system', 
    component: 'Layout', 
    perms: 'system:manage', 
    icon: 'layui-icon-set', 
    visible: '0', 
    status: '1',
    remark: '系统管理目录',
    parentId: '0',
    children: [
      { menuId: '10', menuName: '用户管理', menuType: 'C', orderNum: '1', path: '/system/user', component: 'system/user/Index', perms: 'system:user:list', icon: 'layui-icon-username', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '11', menuName: '角色管理', menuType: 'C', orderNum: '2', path: '/system/role', component: 'system/role/Index', perms: 'system:role:list', icon: 'fas fa-user-tag', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '12', menuName: '菜单管理', menuType: 'C', orderNum: '3', path: '/system/menu', component: 'system/menu/Index', perms: 'system:menu:list', icon: 'layui-icon-component', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '13', menuName: '部门管理', menuType: 'C', orderNum: '4', path: '/system/dept', component: 'system/dept/Index', perms: 'system:dept:list', icon: 'layui-icon-group', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '14', menuName: '岗位管理', menuType: 'C', orderNum: '5', path: '/system/post', component: 'system/post/Index', perms: 'system:post:list', icon: 'layui-icon-user', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '15', menuName: '字典管理', menuType: 'C', orderNum: '6', path: '/system/dict', component: 'system/dict/Index', perms: 'system:dict:list', icon: 'layui-icon-read', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '16', menuName: '参数设置', menuType: 'C', orderNum: '7', path: '/system/config', component: 'system/config/Index', perms: 'system:config:list', icon: 'layui-icon-set', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '17', menuName: '通知公告', menuType: 'C', orderNum: '8', path: '/system/notice', component: 'system/notice/Index', perms: 'system:notice:list', icon: 'layui-icon-notice', visible: '0', status: '1', remark: '', parentId: '1' },
      { menuId: '18', menuName: '日志管理', menuType: 'M', orderNum: '9', path: '/system/log', component: 'Layout', perms: 'system:log:list', icon: 'fas fa-history', visible: '0', status: '1', remark: '日志管理目录', parentId: '1', children: [
        { menuId: '180', menuName: '操作日志', menuType: 'C', orderNum: '1', path: '/system/log/operlog', component: 'system/log/Operlog', perms: 'system:log:operlog', icon: 'layui-icon-file', visible: '0', status: '1', remark: '', parentId: '18' },
        { menuId: '181', menuName: '登录日志', menuType: 'C', orderNum: '2', path: '/system/log/logininfor', component: 'system/log/LoginIndex', perms: 'system:log:logininfor', icon: 'layui-icon-login-qq', visible: '0', status: '1', remark: '', parentId: '18' },
      ]},
    ] 
  },
  { 
    menuId: '2', 
    menuName: '账单管理', 
    menuType: 'M', 
    orderNum: '2', 
    path: '/bill', 
    component: 'Layout', 
    perms: 'bill:manage', 
    icon: 'layui-icon-chart', 
    visible: '0', 
    status: '1',
    remark: '账单管理目录',
    parentId: '0',
    children: [
      { menuId: '20', menuName: '总账单', menuType: 'C', orderNum: '1', path: '/bill/bill', component: 'bill/BillPanel', perms: 'bill:bill:list', icon: 'layui-icon-chart', visible: '0', status: '1', remark: '', parentId: '2' },
      { menuId: '21', menuName: '工资管理', menuType: 'C', orderNum: '2', path: '/bill/salary', component: 'bill/salary/SalaryPanel', perms: 'bill:salary:list', icon: 'fas fa-money-bill-wave', visible: '0', status: '1', remark: '', parentId: '2' },
      { menuId: '22', menuName: '家庭成员', menuType: 'C', orderNum: '3', path: '/bill/family', component: 'bill/family/Index', perms: 'bill:family:list', icon: 'fas fa-users', visible: '0', status: '1', remark: '', parentId: '2' },
      { menuId: '23', menuName: '红包投资', menuType: 'C', orderNum: '4', path: '/bill/redEnvelope', component: 'bill/redEnvelope/InvestQuery', perms: 'bill:redEnvelope:list', icon: 'fas fa-envelope-open-text', visible: '0', status: '1', remark: '', parentId: '2' },
    ] 
  },
])

const totalMenuCount = computed(() => {
  const countNodes = (nodes: any[]): number => {
    return nodes.reduce((sum, node) => {
      return sum + 1 + (node.children ? countNodes(node.children) : 0)
    }, 0)
  }
  return countNodes(menuList.value)
})

const getTypeText = (type: string) => {
  const map: Record<string, string> = { M: '目录', C: '菜单', F: '按钮' }
  return map[type] || '未知'
}

const getTypeClass = (type: string) => {
  const map: Record<string, string> = { M: 'tag-directory', C: 'tag-menu', F: 'tag-button' }
  return map[type] || ''
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = { M: '#16baaa', C: '#1e8fff', F: '#ff9900' }
  return map[type] || '#999'
}

const getParentMenuName = (parentId: string) => {
  if (parentId === '0') return '顶级菜单'
  const findParent = (nodes: any[]): string => {
    for (const node of nodes) {
      if (node.menuId === parentId) return node.menuName
      if (node.children) {
        const found = findParent(node.children)
        if (found) return found
      }
    }
    return '未知'
  }
  return findParent(menuList.value)
}

const filteredMenuTree = computed(() => {
  if (!searchText.value) return menuList.value
  
  const filterTree = (nodes: any[]) => {
    return nodes
      .map(node => {
        const matched = node.menuName.includes(searchText.value)
        const filteredChildren = node.children ? filterTree(node.children) : []
        if (matched || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren }
        }
        return null
      })
      .filter(Boolean)
  }
  
  return filterTree(menuList.value)
})

const showAddMenu = () => {
  editMode.value = false
  Object.assign(menuForm, { 
    menuId: undefined, 
    parentId: '0', 
    menuName: '', 
    menuType: 'C', 
    orderNum: '1', 
    path: '', 
    component: '', 
    perms: '', 
    icon: '', 
    visible: '0',
    status: '1',
    remark: '' 
  })
  showMenuModal.value = true
}

const editMenu = (node: any) => {
  editMode.value = true
  Object.assign(menuForm, node)
  showMenuModal.value = true
}

const deleteMenu = (node: any) => {
  layer.confirm(`确定删除菜单 "${node.menuName}" 吗？`, {
    btn: ['确定', '取消']
  }, (index: number) => {
    message('删除成功', { icon: 1 })
    layer.close(index)
  })
}

const handleNodeClick = (node: any) => {
  selectedMenuId.value = node.menuId
  selectedMenu.value = node
}

const submitMenu = () => {
  if (!menuForm.menuName) {
    message('请填写菜单名称', { icon: 2 })
    return
  }
  message(editMode.value ? '更新成功' : '添加成功', { icon: 1 })
  showMenuModal.value = false
}

const handleSearch = () => message('查询成功', { icon: 1 })
const resetSearch = () => { searchText.value = '' }

onMounted(() => {
  nextTick(() => {
    // 页面初始化
  })
})
</script>

<style scoped>
.menu-container {
  padding: 16px;
  background: #f5f6f7;
  min-height: calc(100vh - 120px);
}

.filter-bar {
  padding: 16px;
  background: #fff;
  margin-bottom: 16px;
  border-radius: 8px;
}

.menu-content {
  display: flex;
  gap: 16px;
  height: calc(100vh - 280px);
  min-height: 500px;
}

.menu-tree-panel {
  flex: 0 0 400px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.tree-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.tree-count {
  font-size: 12px;
  color: #999;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tree-container::-webkit-scrollbar {
  width: 6px;
}

.tree-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.tree-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.tree-node-content:hover {
  background-color: #f0f9ff;
}

.tree-node-icon {
  color: #16baaa;
  font-size: 14px;
}

.tree-node-title {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.tree-node-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background-color: #f0f0f0;
}

.tag-directory {
  color: #16baaa;
  background-color: rgba(22, 186, 170, 0.1);
}

.tag-menu {
  color: #1e8fff;
  background-color: rgba(30, 143, 255, 0.1);
}

.tag-button {
  color: #ff9900;
  background-color: rgba(255, 153, 0, 0.1);
}

.menu-detail-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-panel {
  justify-content: center;
  align-items: center;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.detail-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

:deep(.layui-descriptions) {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

:deep(.layui-descriptions-item__label) {
  font-weight: 500;
  color: #666;
}

:deep(.layui-descriptions-item__content) {
  color: #333;
}
</style>
