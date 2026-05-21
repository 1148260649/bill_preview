<template>
  <div class="family-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-user"></i> 家庭成员管理</h2>
      <div class="header-actions">
        <button class="layui-btn layui-btn-primary" @click="showAddMember">
          <i class="layui-icon layui-icon-add-1"></i> 添加成员
        </button>
        <button class="layui-btn layui-btn-primary" @click="importExcel">
          <i class="layui-icon layui-icon-import"></i> 导入
        </button>
        <button class="layui-btn layui-btn-primary" @click="exportExcel">
          <i class="layui-icon layui-icon-export"></i> 导出
        </button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>状态:</label>
        <select class="layui-select" v-model="filters.status">
          <option value="">全部</option>
          <option value="1">激活</option>
          <option value="2">禁用</option>
        </select>
      </div>
      <div class="filter-item">
        <label>性别:</label>
        <select class="layui-select" v-model="filters.gender">
          <option value="">全部</option>
          <option value="1">男</option>
          <option value="2">女</option>
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
        <div class="summary-label">总成员数</div>
        <div class="summary-value">{{ members.length }} 人</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">激活成员</div>
        <div class="summary-value text-success">{{ activeMembers }} 人</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">男性</div>
        <div class="summary-value text-primary">{{ maleMembers }} 人</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">女性</div>
        <div class="summary-value text-danger">{{ femaleMembers }} 人</div>
      </div>
    </div>

    <!-- 成员列表 -->
    <div class="members-grid">
      <div v-for="member in paginatedMembers" :key="member.id" class="member-card" :class="member.status === '2' ? 'card-disabled' : ''">
        <div class="member-avatar">
          <img v-if="member.avatar" :src="member.avatar" :alt="member.name" />
          <i v-else class="layui-icon" :class="member.gender === '1' ? 'layui-icon-username' : 'layui-icon-female'"></i>
        </div>
        <div class="member-info">
          <div class="member-header">
            <h3>{{ member.name }}</h3>
            <span class="relation-tag">{{ member.relation }}</span>
          </div>
          <div class="member-details">
            <div class="detail-item">
              <i class="layui-icon layui-icon-gender"></i>
              <span>{{ member.gender === '1' ? '男' : '女' }}</span>
            </div>
            <div class="detail-item">
              <i class="layui-icon layui-icon-phone"></i>
              <span>{{ member.phone }}</span>
            </div>
            <div class="detail-item" v-if="member.email">
              <i class="layui-icon layui-icon-email"></i>
              <span>{{ member.email }}</span>
            </div>
          </div>
          <div class="member-status" :class="member.status === '1' ? 'status-active' : 'status-disabled'">
            <i class="layui-icon" :class="member.status === '1' ? 'layui-icon-ok-circle' : 'layui-icon-close-circle'"></i>
            {{ member.status === '1' ? '激活' : '禁用' }}
          </div>
        </div>
        <div class="member-actions">
          <button class="layui-btn layui-btn-sm layui-btn-primary" @click="viewDetail(member)">
            <i class="layui-icon layui-icon-eye"></i> 详情
          </button>
          <button class="layui-btn layui-btn-sm layui-btn-primary" @click="editMember(member)">
            <i class="layui-icon layui-icon-edit"></i> 编辑
          </button>
          <button class="layui-btn layui-btn-sm" :class="member.status === '1' ? 'layui-btn-danger' : 'layui-btn-normal'" @click="toggleStatus(member)">
            {{ member.status === '1' ? '禁用' : '启用' }}
          </button>
        </div>
      </div>

      <div class="add-member-placeholder" @click="showAddMember">
        <i class="layui-icon layui-icon-add-1"></i>
        <span>添加成员</span>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>{{ editMode ? '编辑成员' : '添加成员' }}</h4>
          <button class="modal-close" @click="closeModal"><i class="layui-icon layui-icon-close"></i></button>
        </div>
        <div class="modal-body">
          <div class="member-form">
            <div class="form-row">
              <div class="form-item avatar-upload">
                <label>头像</label>
                <div class="avatar-uploader" @click="uploadAvatar">
                  <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" />
                  <div v-else class="avatar-placeholder">
                    <i class="layui-icon layui-icon-camera"></i>
                    <span>点击上传</span>
                  </div>
                </div>
              </div>
              <div class="form-item">
                <label>关系 <span class="required">*</span></label>
                <select class="layui-select" v-model="form.relation">
                  <option value="">请选择</option>
                  <option value="我">我</option>
                  <option value="配偶">配偶</option>
                  <option value="父亲">父亲</option>
                  <option value="母亲">母亲</option>
                  <option value="儿子">儿子</option>
                  <option value="女儿">女儿</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>姓名 <span class="required">*</span></label>
                <input type="text" class="layui-input" v-model="form.name" placeholder="请输入姓名" />
              </div>
              <div class="form-item">
                <label>性别 <span class="required">*</span></label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="form.gender" value="1" /> 男
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.gender" value="2" /> 女
                  </label>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>手机号</label>
                <input type="tel" class="layui-input" v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
              </div>
              <div class="form-item">
                <label>邮箱</label>
                <input type="email" class="layui-input" v-model="form.email" placeholder="请输入邮箱" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>生日</label>
                <input type="date" class="layui-input" v-model="form.birthday" />
              </div>
              <div class="form-item">
                <label>身份证号</label>
                <input type="text" class="layui-input" v-model="form.idCard" placeholder="请输入身份证号" maxlength="18" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>状态</label>
                <div class="switch-wrapper">
                  <input type="checkbox" v-model="form.status" true-value="1" false-value="2" class="layui-switch" />
                  <span class="switch-label">{{ form.status === '1' ? '激活' : '禁用' }}</span>
                </div>
              </div>
              <div class="form-item">
                <label>备注</label>
                <input type="text" class="layui-input" v-model="form.remark" placeholder="备注信息" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="layui-btn layui-btn-primary" @click="closeModal">取消</button>
          <button class="layui-btn layui-btn-danger" @click="deleteMember" v-if="editMode">
            <i class="layui-icon layui-icon-delete"></i> 删除
          </button>
          <button class="layui-btn" @click="submitForm">
            <i class="layui-icon layui-icon-ok"></i> 确认
          </button>
        </div>
      </div>
    </div>

    <!-- 成员详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>成员详情</h4>
          <button class="modal-close" @click="showDetailModal = false"><i class="layui-icon layui-icon-close"></i></button>
        </div>
        <div class="modal-body">
          <div class="detail-content" v-if="currentMember">
            <div class="detail-avatar">
              <i v-if="!currentMember.avatar" class="layui-icon" :class="currentMember.gender === '1' ? 'layui-icon-username' : 'layui-icon-female'"></i>
              <img v-else :src="currentMember.avatar" :alt="currentMember.name" />
            </div>
            <div class="detail-info">
              <h3>{{ currentMember.name }}</h3>
              <span class="relation-tag">{{ currentMember.relation }}</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <label>性别:</label>
                <span>{{ currentMember.gender === '1' ? '男' : '女' }}</span>
              </div>
              <div class="detail-item">
                <label>手机号:</label>
                <span>{{ currentMember.phone }}</span>
              </div>
              <div class="detail-item">
                <label>邮箱:</label>
                <span>{{ currentMember.email || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>生日:</label>
                <span>{{ currentMember.birthday || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>身份证:</label>
                <span>{{ currentMember.idCard ? maskIdCard(currentMember.idCard) : '-' }}</span>
              </div>
              <div class="detail-item">
                <label>状态:</label>
                <span :class="currentMember.status === '1' ? 'text-success' : 'text-danger'">
                  {{ currentMember.status === '1' ? '激活' : '禁用' }}
                </span>
              </div>
              <div class="detail-item full-width">
                <label>备注:</label>
                <span>{{ currentMember.remark || '-' }}</span>
              </div>
            </div>
          </div>
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

const showModal = ref(false)
const showDetailModal = ref(false)
const editMode = ref(false)
const currentMember = ref<any>(null)

const filters = reactive({
  status: '',
  gender: ''
})

const form = reactive({
  id: null as number | null,
  avatar: '',
  name: '',
  relation: '',
  gender: '1',
  phone: '',
  email: '',
  birthday: '',
  idCard: '',
  status: '1',
  remark: ''
})

const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(totalMembers.value / pageSize.value))

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMembers.value.slice(start, end)
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

const members = ref([
  { id: 1, avatar: '', name: '张三', relation: '我', gender: '1', phone: '138****1234', email: 'zhangsan@example.com', birthday: '1990-01-01', idCard: '110101199001011234', status: '1', remark: '' },
  { id: 2, avatar: '', name: '李四', relation: '配偶', gender: '2', phone: '139****5678', email: 'lisi@example.com', birthday: '1992-06-15', idCard: '110101199206151234', status: '1', remark: '' },
  { id: 3, avatar: '', name: '张小明', relation: '儿子', gender: '1', phone: '-', email: '', birthday: '2018-08-20', idCard: '', status: '1', remark: '' },
  { id: 4, avatar: '', name: '张小美', relation: '女儿', gender: '2', phone: '-', email: '', birthday: '2020-03-15', idCard: '', status: '1', remark: '' },
  { id: 5, avatar: '', name: '张国强', relation: '父亲', gender: '1', phone: '137****9876', email: '', birthday: '1965-05-20', idCard: '110101196505201234', status: '1', remark: '' },
  { id: 6, avatar: '', name: '王芳', relation: '母亲', gender: '2', phone: '136****5432', email: '', birthday: '1967-08-10', idCard: '110101196708101234', status: '1', remark: '' },
  { id: 7, avatar: '', name: '李强', relation: '岳父', gender: '1', phone: '135****1111', email: '', birthday: '1968-12-05', idCard: '110101196812051234', status: '1', remark: '' },
  { id: 8, avatar: '', name: '刘梅', relation: '岳母', gender: '2', phone: '134****2222', email: '', birthday: '1970-03-18', idCard: '110101197003181234', status: '1', remark: '' },
  { id: 9, avatar: '', name: '张磊', relation: '弟弟', gender: '1', phone: '133****3333', email: 'zhanglei@example.com', birthday: '1995-07-22', idCard: '110101199507221234', status: '1', remark: '' },
  { id: 10, avatar: '', name: '张丽', relation: '妹妹', gender: '2', phone: '132****4444', email: 'zhangli@example.com', birthday: '1998-11-30', idCard: '110101199811301234', status: '1', remark: '' },
  { id: 11, avatar: '', name: '李娜', relation: '姐姐', gender: '2', phone: '131****5555', email: 'lina@example.com', birthday: '1988-04-12', idCard: '110101198804121234', status: '1', remark: '' },
  { id: 12, avatar: '', name: '王大伟', relation: '哥哥', gender: '1', phone: '130****6666', email: 'wangdawei@example.com', birthday: '1986-09-08', idCard: '110101198609081234', status: '1', remark: '' },
  { id: 13, avatar: '', name: '赵敏', relation: '嫂子', gender: '2', phone: '159****7777', email: 'zhaomin@example.com', birthday: '1989-02-14', idCard: '110101198902141234', status: '1', remark: '' },
  { id: 14, avatar: '', name: '刘强', relation: '姐夫', gender: '1', phone: '158****8888', email: 'liuqiang@example.com', birthday: '1987-06-25', idCard: '110101198706251234', status: '1', remark: '' },
  { id: 15, avatar: '', name: '陈小杰', relation: '侄子', gender: '1', phone: '-', email: '', birthday: '2015-10-10', idCard: '', status: '1', remark: '' },
  { id: 16, avatar: '', name: '陈小雨', relation: '侄女', gender: '2', phone: '-', email: '', birthday: '2017-05-05', idCard: '', status: '1', remark: '' },
  { id: 17, avatar: '', name: '林峰', relation: '外甥', gender: '1', phone: '-', email: '', birthday: '2016-08-18', idCard: '', status: '1', remark: '' },
  { id: 18, avatar: '', name: '林雪', relation: '外甥女', gender: '2', phone: '-', email: '', birthday: '2019-01-20', idCard: '', status: '1', remark: '' },
  { id: 19, avatar: '', name: '周建华', relation: '叔叔', gender: '1', phone: '157****9999', email: '', birthday: '1972-04-30', idCard: '110101197204301234', status: '1', remark: '' },
  { id: 20, avatar: '', name: '周秀英', relation: '婶婶', gender: '2', phone: '156****0000', email: '', birthday: '1974-07-15', idCard: '110101197407151234', status: '1', remark: '' },
  { id: 21, avatar: '', name: '吴刚', relation: '舅舅', gender: '1', phone: '155****1111', email: '', birthday: '1975-11-22', idCard: '110101197511221234', status: '1', remark: '' },
  { id: 22, avatar: '', name: '吴娟', relation: '舅妈', gender: '2', phone: '154****2222', email: '', birthday: '1977-03-08', idCard: '110101197703081234', status: '1', remark: '' },
  { id: 23, avatar: '', name: '郑浩', relation: '堂哥', gender: '1', phone: '153****3333', email: 'zhenghao@example.com', birthday: '1991-12-12', idCard: '110101199112121234', status: '1', remark: '' },
  { id: 24, avatar: '', name: '郑婷', relation: '堂妹', gender: '2', phone: '152****4444', email: 'zhengting@example.com', birthday: '1994-06-18', idCard: '110101199406181234', status: '1', remark: '' },
  { id: 25, avatar: '', name: '孙磊', relation: '表哥', gender: '1', phone: '151****5555', email: 'sunlei@example.com', birthday: '1990-08-25', idCard: '110101199008251234', status: '1', remark: '' },
  { id: 26, avatar: '', name: '孙燕', relation: '表姐', gender: '2', phone: '150****6666', email: 'sunyan@example.com', birthday: '1989-05-10', idCard: '110101198905101234', status: '1', remark: '' },
  { id: 27, avatar: '', name: '马超', relation: '朋友', gender: '1', phone: '149****7777', email: 'machao@example.com', birthday: '1991-03-15', idCard: '110101199103151234', status: '1', remark: '' },
  { id: 28, avatar: '', name: '马丽', relation: '朋友', gender: '2', phone: '148****8888', email: 'mali@example.com', birthday: '1992-07-20', idCard: '110101199207201234', status: '1', remark: '' },
  { id: 29, avatar: '', name: '朱勇', relation: '同事', gender: '1', phone: '147****9999', email: 'zhuyong@example.com', birthday: '1988-11-05', idCard: '110101198811051234', status: '1', remark: '' },
  { id: 30, avatar: '', name: '朱静', relation: '同事', gender: '2', phone: '146****0000', email: 'zhujing@example.com', birthday: '1990-02-28', idCard: '110101199002281234', status: '1', remark: '' },
  { id: 31, avatar: '', name: '胡军', relation: '邻居', gender: '1', phone: '145****1111', email: '', birthday: '1985-09-12', idCard: '110101198509121234', status: '1', remark: '' },
  { id: 32, avatar: '', name: '胡丽', relation: '邻居', gender: '2', phone: '144****2222', email: '', birthday: '1987-04-18', idCard: '110101198704181234', status: '1', remark: '' },
  { id: 33, avatar: '', name: '高远', relation: '同学', gender: '1', phone: '143****3333', email: 'gaoyuan@example.com', birthday: '1989-10-30', idCard: '110101198910301234', status: '1', remark: '' },
  { id: 34, avatar: '', name: '高珊', relation: '同学', gender: '2', phone: '142****4444', email: 'gaoshan@example.com', birthday: '1990-06-22', idCard: '110101199006221234', status: '1', remark: '' },
  { id: 35, avatar: '', name: '罗汉', relation: '朋友', gender: '1', phone: '141****5555', email: 'luohan@example.com', birthday: '1993-01-08', idCard: '110101199301081234', status: '1', remark: '' },
  { id: 36, avatar: '', name: '罗琳', relation: '朋友', gender: '2', phone: '140****6666', email: 'luolin@example.com', birthday: '1994-05-15', idCard: '110101199405151234', status: '1', remark: '' },
  { id: 37, avatar: '', name: '钱伟', relation: '同事', gender: '1', phone: '139****7777', email: 'qianwei@example.com', birthday: '1987-08-28', idCard: '110101198708281234', status: '1', remark: '' },
  { id: 38, avatar: '', name: '钱芳', relation: '同事', gender: '2', phone: '138****8888', email: 'qianfang@example.com', birthday: '1989-12-10', idCard: '110101198912101234', status: '1', remark: '' },
  { id: 39, avatar: '', name: '冯杰', relation: '朋友', gender: '1', phone: '137****9999', email: 'fengjie@example.com', birthday: '1991-04-05', idCard: '110101199104051234', status: '1', remark: '' },
  { id: 40, avatar: '', name: '冯雪', relation: '朋友', gender: '2', phone: '136****0000', email: 'fengxue@example.com', birthday: '1992-09-18', idCard: '110101199209181234', status: '1', remark: '' },
  { id: 41, avatar: '', name: '蒋敏', relation: '同学', gender: '1', phone: '135****1111', email: 'jiangmin@example.com', birthday: '1988-03-22', idCard: '110101198803221234', status: '1', remark: '' },
  { id: 42, avatar: '', name: '蒋丽', relation: '同学', gender: '2', phone: '134****2222', email: 'jiangli@example.com', birthday: '1989-07-14', idCard: '110101198907141234', status: '1', remark: '' },
  { id: 43, avatar: '', name: '沈强', relation: '邻居', gender: '1', phone: '133****3333', email: '', birthday: '1986-11-28', idCard: '110101198611281234', status: '1', remark: '' },
  { id: 44, avatar: '', name: '沈娟', relation: '邻居', gender: '2', phone: '132****4444', email: '', birthday: '1988-06-05', idCard: '110101198806051234', status: '1', remark: '' },
  { id: 45, avatar: '', name: '韩磊', relation: '朋友', gender: '1', phone: '131****5555', email: 'hanlei@example.com', birthday: '1990-10-15', idCard: '110101199010151234', status: '1', remark: '' },
  { id: 46, avatar: '', name: '韩燕', relation: '朋友', gender: '2', phone: '130****6666', email: 'hanyan@example.com', birthday: '1991-02-20', idCard: '110101199102201234', status: '1', remark: '' },
  { id: 47, avatar: '', name: '杨勇', relation: '同事', gender: '1', phone: '159****7777', email: 'yangyong@example.com', birthday: '1985-05-08', idCard: '110101198505081234', status: '1', remark: '' },
  { id: 48, avatar: '', name: '杨静', relation: '同事', gender: '2', phone: '158****8888', email: 'yangjing@example.com', birthday: '1987-09-25', idCard: '110101198709251234', status: '1', remark: '' },
  { id: 49, avatar: '', name: '秦浩', relation: '同学', gender: '1', phone: '157****9999', email: 'qinhao@example.com', birthday: '1989-01-12', idCard: '110101198901121234', status: '1', remark: '' },
  { id: 50, avatar: '', name: '秦雪', relation: '同学', gender: '2', phone: '156****0000', email: 'qinxue@example.com', birthday: '1990-04-30', idCard: '110101199004301234', status: '1', remark: '' },
])

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    if (filters.status && m.status !== filters.status) return false
    if (filters.gender && m.gender !== filters.gender) return false
    return true
  })
})

const activeMembers = computed(() => members.value.filter(m => m.status === '1').length)
const maleMembers = computed(() => members.value.filter(m => m.gender === '1').length)
const femaleMembers = computed(() => members.value.filter(m => m.gender === '2').length)

const showAddMember = () => {
  editMode.value = false
  currentMember.value = null
  Object.keys(form).forEach(key => (form as any)[key] = key === 'gender' ? '1' : key === 'status' ? '1' : key === 'id' ? null : '')
  showModal.value = true
}

const editMember = (member: any) => {
  editMode.value = true
  currentMember.value = member
  Object.assign(form, { ...member })
  showModal.value = true
}

const viewDetail = (member: any) => {
  currentMember.value = member
  showDetailModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = () => {
  if (!form.name || !form.relation || !form.gender) {
    message.warning('请填写必填项')
    return
  }
  
  if (editMode.value && currentMember.value) {
    Object.assign(currentMember.value, form)
    message.success('更新成功')
  } else {
    members.value.push({
      id: Date.now(),
      ...form,
      phone: form.phone || '-',
      email: form.email || ''
    })
    message.success('添加成功')
  }
  closeModal()
}

const deleteMember = () => {
  layerConfirm('确定要删除该成员吗？删除后关联的数据也将被清除！', '确认删除', () => {
    if (currentMember.value) {
      members.value = members.value.filter(m => m.id !== currentMember.value!.id)
      message('删除成功')
      closeModal()
    }
  })
}

const toggleStatus = (member: any) => {
  member.status = member.status === '1' ? '2' : '1'
  message.success(member.status === '1' ? '已启用' : '已禁用')
}

const uploadAvatar = () => {
  message.info('头像上传功能开发中')
}

const handleFilter = () => {
  message.success('查询成功')
}

const resetFilter = () => {
  Object.assign(filters, { status: '', gender: '' })
}

const importExcel = () => {
  message.info('导入功能开发中')
}

const exportExcel = () => {
  message.info('导出功能开发中')
}

const maskIdCard = (idCard: string) => {
  return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3')
}
</script>

<style scoped>
.family-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.header-actions { display: flex; gap: 12px; }
.filter-section { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 16px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.filter-item { display: flex; align-items: center; gap: 8px; }
.filter-item label { color: #666; font-size: 14px; }
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.summary-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.summary-label { font-size: 14px; color: #999; margin-bottom: 8px; }
.summary-value { font-size: 24px; font-weight: 600; }
.members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.member-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.3s; }
.member-card:hover { transform: translateY(-4px); }
.member-card.card-disabled { opacity: 0.6; }
.member-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; overflow: hidden; }
.member-avatar img { width: 100%; height: 100%; object-fit: cover; }
.member-avatar i { font-size: 36px; color: #fff; }
.member-info { text-align: center; margin-bottom: 16px; }
.member-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }
.member-header h3 { font-size: 18px; color: #333; }
.relation-tag { background: #e8f6f3; color: #16baaa; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
.member-details { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.detail-item { display: flex; align-items: center; justify-content: center; gap: 6px; color: #666; font-size: 13px; }
.detail-item i { color: #999; }
.member-status { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e6e6e6; }
.status-active { color: #16b777; }
.status-disabled { color: #ff5722; }
.member-actions { display: flex; gap: 8px; justify-content: center; }
.add-member-placeholder { background: #fff; border: 2px dashed #d0d0d0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; cursor: pointer; transition: all 0.3s; color: #999; gap: 12px; }
.add-member-placeholder:hover { border-color: #16baaa; color: #16baaa; background: #f8f8f8; }
.add-member-placeholder i { font-size: 48px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-dialog { background: #fff; border-radius: 12px; width: 600px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e6e6e6; }
.modal-header h4 { font-size: 18px; color: #333; }
.modal-close { background: none; border: none; font-size: 20px; color: #999; cursor: pointer; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e6e6e6; }
.member-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; gap: 16px; }
.form-item { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 14px; color: #666; font-weight: 500; }
.required { color: #ff5722; }
.avatar-upload .form-item { flex: none; }
.avatar-uploader { width: 120px; height: 120px; border: 2px dashed #d0d0d0; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
.avatar-uploader:hover { border-color: #16baaa; }
.avatar-preview { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.avatar-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #999; }
.avatar-placeholder i { font-size: 32px; }
.radio-group { display: flex; gap: 24px; }
.radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.switch-wrapper { display: flex; align-items: center; gap: 12px; }
.switch-label { color: #666; font-size: 14px; }
.detail-content { display: flex; flex-direction: column; align-items: center; }
.detail-avatar { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; overflow: hidden; }
.detail-avatar img { width: 100%; height: 100%; object-fit: cover; }
.detail-avatar i { font-size: 42px; color: #fff; }
.detail-info { text-align: center; margin-bottom: 24px; }
.detail-info h3 { font-size: 20px; color: #333; margin-bottom: 8px; }
.detail-grid { width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: #f8f8f8; border-radius: 8px; }
.detail-item.full-width { grid-column: 1 / -1; }
.detail-item label { font-size: 12px; color: #999; }
.detail-item span { font-size: 14px; color: #333; }
.text-success { color: #16b777; }
.text-danger { color: #ff5722; }
</style>
