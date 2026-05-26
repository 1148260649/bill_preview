<template>
  <div class="page-container">
    <h2><i class="layui-icon layui-icon-about"></i> 个人资料</h2>

    <div class="profile-content">
      <lay-card class="profile-card" :bordered="false">
        <div class="avatar-section">
          <div class="avatar-preview" @click="uploadAvatar">
            <i v-if="!form.avatar" class="layui-icon layui-icon-camera"></i>
            <img v-else :src="form.avatar" alt="头像" />
          </div>
          <lay-button @click="uploadAvatar">
            <i class="layui-icon layui-icon-camera"></i> 更换头像
          </lay-button>
        </div>

        <lay-form :model="form" :label-width="100">
          <h3 class="section-title">基本信息</h3>
          <lay-row :gutter="[16, 0]">
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="昵称">
                <lay-input v-model="form.nickname" placeholder="请输入昵称" />
              </lay-form-item>
            </lay-col>
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="真实姓名">
                <lay-input v-model="form.realName" placeholder="请输入真实姓名" />
              </lay-form-item>
            </lay-col>
          </lay-row>
          <lay-row :gutter="[16, 0]">
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="性别">
                <lay-select v-model="form.gender">
                  <lay-select-option value="1" label="男"></lay-select-option>
                  <lay-select-option value="2" label="女"></lay-select-option>
                </lay-select>
              </lay-form-item>
            </lay-col>
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="生日">
                <lay-input v-model="form.birthday" type="date" />
              </lay-form-item>
            </lay-col>
          </lay-row>

          <h3 class="section-title">联系方式</h3>
          <lay-row :gutter="[16, 0]">
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="手机号">
                <lay-input v-model="form.phone" placeholder="请输入手机号" />
              </lay-form-item>
            </lay-col>
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="邮箱">
                <lay-input v-model="form.email" placeholder="请输入邮箱" />
              </lay-form-item>
            </lay-col>
          </lay-row>

          <h3 class="section-title">账户信息</h3>
          <lay-row :gutter="[16, 0]">
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="用户名">
                <lay-input :value="currentUser.username" disabled />
              </lay-form-item>
            </lay-col>
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="注册时间">
                <lay-input value="2026-01-01" disabled />
              </lay-form-item>
            </lay-col>
          </lay-row>
          <lay-row :gutter="[16, 0]">
            <lay-col lg="12" md="12" sm="6" xs="12">
              <lay-form-item label="修改密码">
                <lay-button @click="showPasswordModal = true">
                  <i class="layui-icon layui-icon-set"></i> 修改密码
                </lay-button>
              </lay-form-item>
            </lay-col>
          </lay-row>

          <div class="form-actions">
            <lay-button @click="resetForm">
              <i class="layui-icon layui-icon-refresh"></i> 重置
            </lay-button>
            <lay-button type="primary" @click="saveProfile">
              <i class="layui-icon layui-icon-ok"></i> 保存修改
            </lay-button>
          </div>
        </lay-form>
      </lay-card>

      <lay-row :gutter="[20, 20]" class="info-cards">
        <lay-col lg="8" md="8" sm="6" xs="12" v-for="(item, index) in statsItems" :key="index">
          <lay-card :bordered="false" class="info-card">
            <lay-space :size="16">
              <div class="info-icon" :class="item.iconClass">
                <i :class="item.icon"></i>
              </div>
              <div class="info-content">
                <div class="info-value">{{ item.value }}</div>
                <div class="info-label">{{ item.label }}</div>
              </div>
            </lay-space>
          </lay-card>
        </lay-col>
      </lay-row>
    </div>

    <lay-layer v-model="showPasswordModal" title="修改密码" :area="['500px', 'auto']">
      <lay-form :model="passwordForm" :label-width="80">
        <lay-form-item label="当前密码">
          <lay-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" />
        </lay-form-item>
        <lay-form-item label="新密码">
          <lay-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </lay-form-item>
        <lay-form-item label="确认密码">
          <lay-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </lay-form-item>
      </lay-form>
      <template #footer>
        <lay-button @click="showPasswordModal = false">取消</lay-button>
        <lay-button type="primary" @click="changePassword">确认修改</lay-button>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { LayCard, LayForm, LayFormItem, LayInput, LaySelect, LaySelectOption, LayButton, LayRow, LayCol, LaySpace } from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const layui = (window as any).layui
const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

const showPasswordModal = ref(false)
const form = reactive({ avatar: '', nickname: '管理员', realName: '张三', gender: '1', birthday: '1990-01-01', phone: '138****1234', email: 'admin@example.com' })
const currentUser = reactive({ username: 'admin', createTime: '2026-01-01' })
const stats = reactive({ billsCount: 1258, totalAmount: '256,680.00', daysCount: 365 })
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const statsItems = [
  { icon: 'layui-icon-dialogue', iconClass: 'icon-blue', value: 1258, label: '记账笔数' },
  { icon: 'layui-icon-rmb', iconClass: 'icon-green', value: '256,680.00', label: '累计金额' },
  { icon: 'layui-icon-calendar', iconClass: 'icon-orange', value: 365, label: '记账天数' }
]

const uploadAvatar = () => message.info('头像上传功能开发中')
const saveProfile = () => message.success('保存成功')
const resetForm = () => message.info('表单已重置')
const changePassword = () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    message.warning('请填写完整密码信息')
    return
}
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning('两次输入密码不一致')
    return
}
  message.success('密码修改成功')
  showPasswordModal.value = false
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.profile-content { display: flex; flex-direction: column; gap: 20px; }
.profile-card { background: #fff; border-radius: 12px; padding: 24px; }
.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; }
.avatar-preview { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; cursor: pointer; }
.avatar-preview i { font-size: 42px; color: #fff; }
.avatar-preview img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.section-title { font-size: 16px; color: #333; margin: 20px 0 16px; padding-bottom: 8px; border-bottom: 1px solid #e6e6e6; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e6e6e6; }
.info-cards { margin-top: 0; }
.info-card { background: #fff; border-radius: 12px; padding: 20px; }
.info-icon { width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.icon-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.icon-green { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); color: #fff; }
.icon-orange { background: linear-gradient(135deg, #ffb800 0%, #ff9f00 100%); color: #fff; }
.info-value { font-size: 20px; font-weight: 600; color: #333; }
.info-label { font-size: 13px; color: #999; margin-top: 4px; }
</style>
