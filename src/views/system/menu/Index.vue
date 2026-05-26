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

      <lay-tree 
        :data="filteredMenuTree" 
        :props="{ label: 'menuName', children: 'children', value: 'menuId' }"
        show-checkbox
        default-expand-all
      />
    </lay-card>

    <lay-layer v-model="showMenuModal" :title="editMode ? '编辑菜单' : '添加菜单'" :area="['600px', 'auto']">
      <lay-form :model="menuForm" :label-width="80" style="padding: 8px 0;">
        <lay-form-item label="上级菜单" required>
          <lay-select v-model="menuForm.parentId" placeholder="请选择上级菜单">
            <lay-select-option value="0" label="顶级菜单"></lay-select-option>
            <lay-select-option value="1" label="系统管理"></lay-select-option>
            <lay-select-option value="2" label="账单管理"></lay-select-option>
          </lay-select>
        </lay-form-item>
        <lay-form-item label="菜单名称" required>
          <lay-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
        </lay-form-item>
        <lay-row :gutter="[16, 0]">
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
              <lay-input v-model="menuForm.orderNum" type="number" placeholder="数字" />
            </lay-form-item>
          </lay-col>
        </lay-row>
        <lay-form-item label="路由地址">
          <lay-input v-model="menuForm.path" placeholder="请输入路由地址" />
        </lay-form-item>
        <lay-form-item label="组件路径">
          <lay-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </lay-form-item>
        <lay-row :gutter="[16, 0]">
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
        <lay-form-item label="是否显示">
          <lay-radio-group v-model="menuForm.visible">
            <lay-radio value="0">显示</lay-radio>
            <lay-radio value="1">隐藏</lay-radio>
          </lay-radio-group>
        </lay-form-item>
        <lay-form-item label="备注">
          <lay-textarea v-model="menuForm.remark" placeholder="请输入备注" :rows="3" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <lay-button @click="showMenuModal = false">取消</lay-button>
        <lay-button type="normal" @click="submitMenu">确认保存</lay-button>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, onMounted } from 'vue'
import {
  LayCard, LaySpace, LayButton, LayInput, LaySelect, LaySelectOption,
  LayForm, LayTree, LayTextarea, LayRadioGroup, LayRadio
} from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const message = layer.msg

const searchText = ref('')
const showMenuModal = ref(false)
const editMode = ref(false)

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
  remark: ''
})

const menuTree = ref([
  {
    menuId: '1',
    menuName: '系统管理',
    parentId: '0',
    children: [
      { menuId: '10', menuName: '用户管理', parentId: '1' },
      { menuId: '11', menuName: '角色管理', parentId: '1' },
      { menuId: '12', menuName: '菜单管理', parentId: '1' },
      { menuId: '13', menuName: '部门管理', parentId: '1' },
      { menuId: '14', menuName: '岗位管理', parentId: '1' },
      { menuId: '15', menuName: '字典管理', parentId: '1' },
      { menuId: '16', menuName: '参数设置', parentId: '1' },
      { menuId: '17', menuName: '通知公告', parentId: '1' },
      { menuId: '18', menuName: '日志管理', parentId: '1' }
    ]
},
  {
    menuId: '2',
    menuName: '账单管理',
    parentId: '0',
    children: [
      { menuId: '20', menuName: '总账单', parentId: '2' },
      { menuId: '21', menuName: '工资管理', parentId: '2' },
      { menuId: '22', menuName: '家庭成员', parentId: '2' },
      { menuId: '23', menuName: '红包投资', parentId: '2' }
    ]
},
  {
    menuId: '3',
    menuName: '查询统计',
    parentId: '0',
    children: [
      { menuId: '30', menuName: '转账查询', parentId: '3' },
      { menuId: '31', menuName: '卡号查询', parentId: '3' },
      { menuId: '32', menuName: '明细查询', parentId: '3' }
    ]
}
])

const filteredMenuTree = computed(() => {
  if (!searchText.value) return menuTree.value
  
  const filterTree = (nodes: any[]): any[] => {
    return nodes.filter(node => {
      if (node.menuName.includes(searchText.value)) return true
      if (node.children) {
        node.children = filterTree(node.children)
        return node.children.length > 0
}
      return false
})
}
  
  return filterTree(JSON.parse(JSON.stringify(menuTree.value)))
})

const showAddMenu = () => {
  editMode.value = false
  Object.assign(menuForm, { menuId: undefined, parentId: '0', menuName: '', menuType: 'C', orderNum: '1', path: '', component: '', perms: '', icon: '', visible: '0', remark: '' })
  showMenuModal.value = true
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
.menu-container { padding: 20px; background: #f5f6f7; min-height: calc(100vh - 120px); }
.filter-bar { padding: 16px; background: #f5f6f7; margin-bottom: 16px; border-radius: 8px; }
</style>
