<template>
  <div class="page-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-about"></i> 个人资料</h2>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-preview" @click="uploadAvatar">
            <i v-if="!form.avatar" class="layui-icon layui-icon-camera"></i>
            <img v-else :src="form.avatar" alt="头像" />
          </div>
          <button class="layui-btn layui-btn-sm layui-btn-primary" @click="uploadAvatar">
            <i class="layui-icon layui-icon-camera"></i> 更换头像
          </button>
        </div>

        <div class="profile-form">
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            <div class="form-row">
              <div class="form-item">
                <label>昵称</label>
                <input type="text" class="layui-input" v-model="form.nickname" placeholder="请输入昵称" />
              </div>
              <div class="form-item">
                <label>真实姓名</label>
                <input type="text" class="layui-input" v-model="form.realName" placeholder="请输入真实姓名" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>性别</label>
                <select class="layui-select" v-model="form.gender">
                  <option value="1">男</option>
                  <option value="2">女</option>
                </select>
              </div>
              <div class="form-item">
                <label>生日</label>
                <input type="date" class="layui-input" v-model="form.birthday" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">联系方式</h3>
            <div class="form-row">
              <div class="form-item">
                <label>手机号</label>
                <input type="tel" class="layui-input" v-model="form.phone" placeholder="请输入手机号" />
              </div>
              <div class="form-item">
                <label>邮箱</label>
                <input type="email" class="layui-input" v-model="form.email" placeholder="请输入邮箱" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">账户信息</h3>
            <div class="form-row">
              <div class="form-item">
                <label>用户名</label>
                <input type="text" class="layui-input" :value="currentUser.username" disabled />
              </div>
              <div class="form-item">
                <label>注册时间</label>
                <input type="text" class="layui-input" value="2026-01-01" disabled />
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>修改密码</label>
                <button class="layui-btn layui-btn-primary" @click="showPasswordModal = true">
                  <i class="layui-icon layui-icon-set"></i> 修改密码
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="layui-btn layui-btn-primary" @click="resetForm">
              <i class="layui-icon layui-icon-refresh"></i> 重置
            </button>
            <button class="layui-btn" @click="saveProfile">
              <i class="layui-icon layui-icon-ok"></i> 保存修改
            </button>
          </div>
        </div>
      </div>

      <div class="info-cards">
        <div class="info-card">
          <div class="info-icon"><i class="layui-icon layui-icon-dialogue"></i></div>
          <div class="info-content">
            <div class="info-value">{{ stats.billsCount }}</div>
            <div class="info-label">记账笔数</div>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon"><i class="layui-icon layui-icon-rmb"></i></div>
          <div class="info-content">
            <div class="info-value">¥ {{ stats.totalAmount }}</div>
            <div class="info-label">累计金额</div>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon"><i class="layui-icon layui-icon-calendar"></i></div>
          <div class="info-content">
            <div class="info-value">{{ stats.daysCount }}</div>
            <div class="info-label">记账天数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>修改密码</h4>
          <button class="modal-close" @click="showPasswordModal = false"><i class="layui-icon layui-icon-close"></i></button>
        </div>
        <div class="modal-body">
          <div class="password-form">
            <div class="form-item">
              <label>当前密码</label>
              <input type="password" class="layui-input" v-model="passwordForm.oldPassword" placeholder="请输入当前密码" />
            </div>
            <div class="form-item">
              <label>新密码</label>
              <input type="password" class="layui-input" v-model="passwordForm.newPassword" placeholder="请输入新密码" />
            </div>
            <div class="form-item">
              <label>确认密码</label>
              <input type="password" class="layui-input" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="layui-btn layui-btn-primary" @click="showPasswordModal = false">取消</button>
          <button class="layui-btn" @click="changePassword">确认修改</button>
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

const showPasswordModal = ref(false)

const form = reactive({
  avatar: '',
  nickname: '管理员',
  realName: '张三',
  gender: '1',
  birthday: '1990-01-01',
  phone: '138****1234',
  email: 'admin@example.com'
})

const currentUser = reactive({
  username: 'admin',
  createTime: '2026-01-01'
})

const stats = reactive({
  billsCount: 1258,
  totalAmount: '256,680.00',
  daysCount: 365
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const uploadAvatar = () => {
  message.info('头像上传功能开发中')
}

const saveProfile = () => {
  message.success('保存成功')
}

const resetForm = () => {
  message.info('已重置')
}

const changePassword = () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    message.warning('请填写完整信息')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning('两次输入的密码不一致')
    return
  }
  message.success('密码修改成功')
  showPasswordModal.value = false
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.profile-content { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
.profile-card { background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; gap: 40px; }
.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.avatar-preview { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
.avatar-preview i { font-size: 48px; color: #fff; }
.profile-form { flex: 1; }
.form-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e6e6e6; }
.form-section:last-of-type { border-bottom: none; }
.section-title { font-size: 16px; color: #333; margin-bottom: 16px; font-weight: 600; }
.form-row { display: flex; gap: 16px; margin-bottom: 16px; }
.form-item { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 14px; color: #666; }
.form-actions { display: flex; gap: 12px; margin-top: 24px; }
.info-cards { display: flex; flex-direction: column; gap: 20px; }
.info-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.info-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.info-card:nth-child(1) .info-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.info-card:nth-child(2) .info-icon { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); color: #fff; }
.info-card:nth-child(3) .info-icon { background: linear-gradient(135deg, #ffb800 0%, #ffc107 100%); color: #fff; }
.info-content { flex: 1; }
.info-value { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 4px; }
.info-label { font-size: 13px; color: #999; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-dialog { background: #fff; border-radius: 12px; width: 450px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e6e6e6; }
.modal-header h4 { font-size: 18px; color: #333; }
.modal-close { background: none; border: none; font-size: 20px; color: #999; cursor: pointer; }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e6e6e6; }
.password-form { display: flex; flex-direction: column; gap: 16px; }
</style>
