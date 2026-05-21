<template>
  <div class="page-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-username"></i> 用户管理</h2>
      <div class="header-actions">
        <button class="layui-btn layui-btn-primary" @click="showAddUser">
          <i class="layui-icon layui-icon-add-1"></i> 添加用户
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>手机号:</label>
          <input type="text" class="layui-input" v-model="filters.phone" placeholder="请输入手机号" />
        </div>
        <div class="filter-item">
          <label>姓名:</label>
          <input type="text" class="layui-input" v-model="filters.name" placeholder="请输入姓名" />
        </div>
        <div class="filter-item">
          <label>状态:</label>
          <select class="layui-select" v-model="filters.status">
            <option value="">全部</option>
            <option value="1">正常</option>
            <option value="2">禁用</option>
          </select>
        </div>
        <button class="layui-btn layui-btn-sm" @click="handleFilter">
          <i class="layui-icon layui-icon-search"></i> 查询
        </button>
        <button class="layui-btn layui-btn-sm layui-btn-primary" @click="resetFilter">
          <i class="layui-icon layui-icon-refresh"></i> 重置
        </button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <table class="layui-table">
        <thead>
          <tr>
            <th width="50"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>用户 ID</th>
            <th>姓名</th>
            <th>手机号</th>
            <th>邮箱</th>
            <th>性别</th>
            <th>部门</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td><input type="checkbox" v-model="selectedIds" :value="user.id" /></td>
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="user.gender === '1' ? 'text-primary' : 'text-danger'">
                {{ user.gender === '1' ? '男' : '女' }}
              </span>
            </td>
            <td>{{ user.department }}</td>
            <td>
              <span v-for="role in user.roles" :key="role" class="role-tag">{{ role }}</span>
            </td>
            <td>
              <span :class="user.status === '1' ? 'status-normal' : 'status-disabled'">
                {{ user.status === '1' ? '正常' : '禁用' }}
              </span>
            </td>
            <td>{{ user.createTime }}</td>
            <td>
              <button class="layui-btn layui-btn-xs layui-btn-primary" @click="editUser(user)">
                <i class="layui-icon layui-icon-edit"></i>
              </button>
              <button class="layui-btn layui-btn-xs layui-btn-primary" @click="assignRole(user)">
                <i class="layui-icon layui-icon-set"></i>
              </button>
              <button class="layui-btn layui-btn-xs" :class="user.status === '1' ? 'layui-btn-danger' : 'layui-btn-normal'" @click="toggleStatus(user)">
                {{ user.status === '1' ? '禁用' : '启用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <div class="pagination-info">共 {{ total }} 条</div>
        <div class="pagination-control">
          <button class="layui-btn layui-btn-sm layui-btn-primary" disabled>上一页</button>
          <button class="layui-btn layui-btn-sm">1</button>
          <button class="layui-btn layui-btn-sm layui-btn-primary">2</button>
          <button class="layui-btn layui-btn-sm layui-btn-primary">3</button>
          <button class="layui-btn layui-btn-sm layui-btn-primary">下一页</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>{{ editMode ? '编辑用户' : '添加用户' }}</h4>
          <button class="modal-close" @click="closeModal"><i class="layui-icon layui-icon-close"></i></button>
        </div>
        <div class="modal-body">
          <div class="user-form">
            <div class="form-row">
              <div class="form-item">
                <label>登录账号 <span class="required">*</span></label>
                <input type="text" class="layui-input" v-model="form.username" placeholder="请输入登录账号" />
              </div>
              <div class="form-item">
                <label>密码 <span class="required" v-if="!editMode">*</span></label>
                <input type="password" class="layui-input" v-model="form.password" placeholder="请输入密码" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>姓名 <span class="required">*</span></label>
                <input type="text" class="layui-input" v-model="form.name" placeholder="请输入姓名" />
              </div>
              <div class="form-item">
                <label>手机号 <span class="required">*</span></label>
                <input type="tel" class="layui-input" v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>邮箱</label>
                <input type="email" class="layui-input" v-model="form.email" placeholder="请输入邮箱" />
              </div>
              <div class="form-item">
                <label>性别</label>
                <select class="layui-select" v-model="form.gender">
                  <option value="1">男</option>
                  <option value="2">女</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>部门</label>
                <select class="layui-select" v-model="form.department">
                  <option value="">请选择部门</option>
                  <option value="技术部">技术部</option>
                  <option value="市场部">市场部</option>
                  <option value="财务部">财务部</option>
                  <option value="人事部">人事部</option>
                </select>
              </div>
              <div class="form-item">
                <label>状态</label>
                <select class="layui-select" v-model="form.status">
                  <option value="1">正常</option>
                  <option value="2">禁用</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="layui-btn layui-btn-primary" @click="closeModal">取消</button>
          <button class="layui-btn" @click="submitForm">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
declare const layui: any

const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

const showModal = ref(false)
const editMode = ref(false)
const selectAll = ref(false)
const selectedIds = ref<number[]>([])

const filters = reactive({
  phone: '',
  name: '',
  status: ''
})

const form = reactive({
  username: '',
  password: '',
  name: '',
  phone: '',
  email: '',
  gender: '1',
  department: '',
  status: '1'
})

const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
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

const users = ref([
  { 
    id: 1, 
    username: 'user001',
    name: '用户1',
    email: 'user001@example.com',
    phone: '1380000001',
    role: '普通用户',
    department: '产品部',
    status: '1',
    createTime: '2025-02-02 01:00:00'
  },
  { 
    id: 2, 
    username: 'user002',
    name: '用户2',
    email: 'user002@example.com',
    phone: '1380000002',
    role: '财务人员',
    department: '财务部',
    status: '1',
    createTime: '2025-03-03 02:00:00'
  },
  { 
    id: 3, 
    username: 'user003',
    name: '用户3',
    email: 'user003@example.com',
    phone: '1380000003',
    role: '审计人员',
    department: '人事部',
    status: '1',
    createTime: '2025-04-04 03:00:00'
  },
  { 
    id: 4, 
    username: 'user004',
    name: '用户4',
    email: 'user004@example.com',
    phone: '1380000004',
    role: '管理员',
    department: '运营部',
    status: '1',
    createTime: '2025-05-05 04:00:00'
  },
  { 
    id: 5, 
    username: 'user005',
    name: '用户5',
    email: 'user005@example.com',
    phone: '1380000005',
    role: '普通用户',
    department: '技术部',
    status: '1',
    createTime: '2025-06-06 05:00:00'
  },
  { 
    id: 6, 
    username: 'user006',
    name: '用户6',
    email: 'user006@example.com',
    phone: '1380000006',
    role: '财务人员',
    department: '产品部',
    status: '1',
    createTime: '2025-07-07 06:00:00'
  },
  { 
    id: 7, 
    username: 'user007',
    name: '用户7',
    email: 'user007@example.com',
    phone: '1380000007',
    role: '审计人员',
    department: '财务部',
    status: '1',
    createTime: '2025-08-08 07:00:00'
  },
  { 
    id: 8, 
    username: 'user008',
    name: '用户8',
    email: 'user008@example.com',
    phone: '1380000008',
    role: '管理员',
    department: '人事部',
    status: '0',
    createTime: '2025-09-09 08:00:00'
  },
  { 
    id: 9, 
    username: 'user009',
    name: '用户9',
    email: 'user009@example.com',
    phone: '1380000009',
    role: '普通用户',
    department: '运营部',
    status: '1',
    createTime: '2025-10-10 09:00:00'
  },
  { 
    id: 10, 
    username: 'user010',
    name: '用户10',
    email: 'user010@example.com',
    phone: '1380000010',
    role: '财务人员',
    department: '技术部',
    status: '1',
    createTime: '2025-11-11 10:00:00'
  },
  { 
    id: 11, 
    username: 'user011',
    name: '用户11',
    email: 'user011@example.com',
    phone: '1380000011',
    role: '审计人员',
    department: '产品部',
    status: '1',
    createTime: '2025-12-12 11:00:00'
  },
  { 
    id: 12, 
    username: 'user012',
    name: '用户12',
    email: 'user012@example.com',
    phone: '1380000012',
    role: '管理员',
    department: '财务部',
    status: '1',
    createTime: '2025-01-13 12:00:00'
  },
  { 
    id: 13, 
    username: 'user013',
    name: '用户13',
    email: 'user013@example.com',
    phone: '1380000013',
    role: '普通用户',
    department: '人事部',
    status: '1',
    createTime: '2025-02-14 13:00:00'
  },
  { 
    id: 14, 
    username: 'user014',
    name: '用户14',
    email: 'user014@example.com',
    phone: '1380000014',
    role: '财务人员',
    department: '运营部',
    status: '1',
    createTime: '2025-03-15 14:00:00'
  },
  { 
    id: 15, 
    username: 'user015',
    name: '用户15',
    email: 'user015@example.com',
    phone: '1380000015',
    role: '审计人员',
    department: '技术部',
    status: '1',
    createTime: '2025-04-16 15:00:00'
  },
  { 
    id: 16, 
    username: 'user016',
    name: '用户16',
    email: 'user016@example.com',
    phone: '1380000016',
    role: '管理员',
    department: '产品部',
    status: '0',
    createTime: '2025-05-17 16:00:00'
  },
  { 
    id: 17, 
    username: 'user017',
    name: '用户17',
    email: 'user017@example.com',
    phone: '1380000017',
    role: '普通用户',
    department: '财务部',
    status: '1',
    createTime: '2025-06-18 17:00:00'
  },
  { 
    id: 18, 
    username: 'user018',
    name: '用户18',
    email: 'user018@example.com',
    phone: '1380000018',
    role: '财务人员',
    department: '人事部',
    status: '1',
    createTime: '2025-07-19 18:00:00'
  },
  { 
    id: 19, 
    username: 'user019',
    name: '用户19',
    email: 'user019@example.com',
    phone: '1380000019',
    role: '审计人员',
    department: '运营部',
    status: '1',
    createTime: '2025-08-20 19:00:00'
  },
  { 
    id: 20, 
    username: 'user020',
    name: '用户20',
    email: 'user020@example.com',
    phone: '1380000020',
    role: '管理员',
    department: '技术部',
    status: '1',
    createTime: '2025-09-21 20:00:00'
  },
  { 
    id: 21, 
    username: 'user021',
    name: '用户21',
    email: 'user021@example.com',
    phone: '1380000021',
    role: '普通用户',
    department: '产品部',
    status: '1',
    createTime: '2025-10-22 21:00:00'
  },
  { 
    id: 22, 
    username: 'user022',
    name: '用户22',
    email: 'user022@example.com',
    phone: '1380000022',
    role: '财务人员',
    department: '财务部',
    status: '1',
    createTime: '2025-11-23 22:00:00'
  },
  { 
    id: 23, 
    username: 'user023',
    name: '用户23',
    email: 'user023@example.com',
    phone: '1380000023',
    role: '审计人员',
    department: '人事部',
    status: '1',
    createTime: '2025-12-24 23:00:00'
  },
  { 
    id: 24, 
    username: 'user024',
    name: '用户24',
    email: 'user024@example.com',
    phone: '1380000024',
    role: '管理员',
    department: '运营部',
    status: '0',
    createTime: '2025-01-25 00:00:00'
  },
  { 
    id: 25, 
    username: 'user025',
    name: '用户25',
    email: 'user025@example.com',
    phone: '1380000025',
    role: '普通用户',
    department: '技术部',
    status: '1',
    createTime: '2025-02-26 01:00:00'
  },
  { 
    id: 26, 
    username: 'user026',
    name: '用户26',
    email: 'user026@example.com',
    phone: '1380000026',
    role: '财务人员',
    department: '产品部',
    status: '1',
    createTime: '2025-03-27 02:00:00'
  },
  { 
    id: 27, 
    username: 'user027',
    name: '用户27',
    email: 'user027@example.com',
    phone: '1380000027',
    role: '审计人员',
    department: '财务部',
    status: '1',
    createTime: '2025-04-28 03:00:00'
  },
  { 
    id: 28, 
    username: 'user028',
    name: '用户28',
    email: 'user028@example.com',
    phone: '1380000028',
    role: '管理员',
    department: '人事部',
    status: '1',
    createTime: '2025-05-01 04:00:00'
  },
  { 
    id: 29, 
    username: 'user029',
    name: '用户29',
    email: 'user029@example.com',
    phone: '1380000029',
    role: '普通用户',
    department: '运营部',
    status: '1',
    createTime: '2025-06-02 05:00:00'
  },
  { 
    id: 30, 
    username: 'user030',
    name: '用户30',
    email: 'user030@example.com',
    phone: '1380000030',
    role: '财务人员',
    department: '技术部',
    status: '1',
    createTime: '2025-07-03 06:00:00'
  },
  { 
    id: 31, 
    username: 'user031',
    name: '用户31',
    email: 'user031@example.com',
    phone: '1380000031',
    role: '审计人员',
    department: '产品部',
    status: '1',
    createTime: '2025-08-04 07:00:00'
  },
  { 
    id: 32, 
    username: 'user032',
    name: '用户32',
    email: 'user032@example.com',
    phone: '1380000032',
    role: '管理员',
    department: '财务部',
    status: '0',
    createTime: '2025-09-05 08:00:00'
  },
  { 
    id: 33, 
    username: 'user033',
    name: '用户33',
    email: 'user033@example.com',
    phone: '1380000033',
    role: '普通用户',
    department: '人事部',
    status: '1',
    createTime: '2025-10-06 09:00:00'
  },
  { 
    id: 34, 
    username: 'user034',
    name: '用户34',
    email: 'user034@example.com',
    phone: '1380000034',
    role: '财务人员',
    department: '运营部',
    status: '1',
    createTime: '2025-11-07 10:00:00'
  },
  { 
    id: 35, 
    username: 'user035',
    name: '用户35',
    email: 'user035@example.com',
    phone: '1380000035',
    role: '审计人员',
    department: '技术部',
    status: '1',
    createTime: '2025-12-08 11:00:00'
  },
  { 
    id: 36, 
    username: 'user036',
    name: '用户36',
    email: 'user036@example.com',
    phone: '1380000036',
    role: '管理员',
    department: '产品部',
    status: '1',
    createTime: '2025-01-09 12:00:00'
  },
  { 
    id: 37, 
    username: 'user037',
    name: '用户37',
    email: 'user037@example.com',
    phone: '1380000037',
    role: '普通用户',
    department: '财务部',
    status: '1',
    createTime: '2025-02-10 13:00:00'
  },
  { 
    id: 38, 
    username: 'user038',
    name: '用户38',
    email: 'user038@example.com',
    phone: '1380000038',
    role: '财务人员',
    department: '人事部',
    status: '1',
    createTime: '2025-03-11 14:00:00'
  },
  { 
    id: 39, 
    username: 'user039',
    name: '用户39',
    email: 'user039@example.com',
    phone: '1380000039',
    role: '审计人员',
    department: '运营部',
    status: '1',
    createTime: '2025-04-12 15:00:00'
  },
  { 
    id: 40, 
    username: 'user040',
    name: '用户40',
    email: 'user040@example.com',
    phone: '1380000040',
    role: '管理员',
    department: '技术部',
    status: '0',
    createTime: '2025-05-13 16:00:00'
  },
  { 
    id: 41, 
    username: 'user041',
    name: '用户41',
    email: 'user041@example.com',
    phone: '1380000041',
    role: '普通用户',
    department: '产品部',
    status: '1',
    createTime: '2025-06-14 17:00:00'
  },
  { 
    id: 42, 
    username: 'user042',
    name: '用户42',
    email: 'user042@example.com',
    phone: '1380000042',
    role: '财务人员',
    department: '财务部',
    status: '1',
    createTime: '2025-07-15 18:00:00'
  },
  { 
    id: 43, 
    username: 'user043',
    name: '用户43',
    email: 'user043@example.com',
    phone: '1380000043',
    role: '审计人员',
    department: '人事部',
    status: '1',
    createTime: '2025-08-16 19:00:00'
  },
  { 
    id: 44, 
    username: 'user044',
    name: '用户44',
    email: 'user044@example.com',
    phone: '1380000044',
    role: '管理员',
    department: '运营部',
    status: '1',
    createTime: '2025-09-17 20:00:00'
  },
  { 
    id: 45, 
    username: 'user045',
    name: '用户45',
    email: 'user045@example.com',
    phone: '1380000045',
    role: '普通用户',
    department: '技术部',
    status: '1',
    createTime: '2025-10-18 21:00:00'
  },
  { 
    id: 46, 
    username: 'user046',
    name: '用户46',
    email: 'user046@example.com',
    phone: '1380000046',
    role: '财务人员',
    department: '产品部',
    status: '1',
    createTime: '2025-11-19 22:00:00'
  },
  { 
    id: 47, 
    username: 'user047',
    name: '用户47',
    email: 'user047@example.com',
    phone: '1380000047',
    role: '审计人员',
    department: '财务部',
    status: '1',
    createTime: '2025-12-20 23:00:00'
  },
  { 
    id: 48, 
    username: 'user048',
    name: '用户48',
    email: 'user048@example.com',
    phone: '1380000048',
    role: '管理员',
    department: '人事部',
    status: '0',
    createTime: '2025-01-21 00:00:00'
  },
  { 
    id: 49, 
    username: 'user049',
    name: '用户49',
    email: 'user049@example.com',
    phone: '1380000049',
    role: '普通用户',
    department: '运营部',
    status: '1',
    createTime: '2025-02-22 01:00:00'
  },
  { 
    id: 50, 
    username: 'user050',
    name: '用户50',
    email: 'user050@example.com',
    phone: '1380000050',
    role: '财务人员',
    department: '技术部',
    status: '1',
    createTime: '2025-03-23 02:00:00'
  }
])

const total = users.value.length

const showAddUser = () => {
  editMode.value = false
  Object.keys(form).forEach(key => (form as any)[key] = '')
  form.gender = '1'
  form.status = '1'
  showModal.value = true
}

const editUser = (user: any) => {
  editMode.value = true
  Object.assign(form, {
    username: user.username,
    password: '',
    name: user.name,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    department: user.department,
    status: user.status
  })
  showModal.value = true
}

const assignRole = (user: any) => {
  message.info(`为 ${user.name} 分配角色`)
}

const toggleStatus = (user: any) => {
  user.status = user.status === '1' ? '2' : '1'
  message.success(user.status === '1' ? '已启用' : '已禁用')
}

const handleFilter = () => {
  message.success('查询成功')
}

const resetFilter = () => {
  Object.assign(filters, { phone: '', name: '', status: '' })
}

const toggleSelectAll = () => {
  selectedIds.value = selectAll.value ? users.value.map(u => u.id) : []
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = () => {
  if (!form.username || !form.name || !form.phone) {
    message.warning('请填写必填项')
    return
  }
  message.success(editMode.value ? '更新成功' : '添加成功')
  closeModal()
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.header-actions { display: flex; gap: 12px; }
.filter-section { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.filter-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-item label { color: #666; font-size: 14px; }
.filter-item input { width: 200px; }
.filter-item .layui-select { width: 140px; }
.table-section { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.role-tag { display: inline-block; background: #e8f6f3; color: #16baaa; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px; }
.status-normal { color: #16b777; }
.status-disabled { color: #999; }
.text-primary { color: #1e9fff; }
.text-danger { color: #ff5722; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e6e6e6; }
.pagination-info { color: #999; font-size: 13px; }
.pagination-control { display: flex; gap: 8px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-dialog { background: #fff; border-radius: 12px; width: 600px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e6e6e6; }
.modal-header h4 { font-size: 18px; color: #333; }
.modal-close { background: none; border: none; font-size: 20px; color: #999; cursor: pointer; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e6e6e6; }
.user-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; gap: 16px; }
.form-item { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 14px; color: #666; font-weight: 500; }
.required { color: #ff5722; }
</style>
