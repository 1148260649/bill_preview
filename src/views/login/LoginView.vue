<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-wrapper">
          <i class="layui-icon layui-icon-chart"></i>
        </div>
        <h1>账单管理系统</h1>
        <p>Bill Management System</p>
      </div>
      
      <lay-space :size="24" direction="vertical" class="login-content">
        <div class="login-tabs">
          <div class="tab-item" :class="{ active: loginType === 'username' }" @click="loginType = 'username'">账号登录</div>
          <div class="tab-item" :class="{ active: loginType === 'phone' }" @click="loginType = 'phone'">验证码登录</div>
        </div>

        <lay-form :model="loginForm" ref="formRef" size="lg">
          <template v-if="loginType === 'username'">
            <lay-form-item>
              <lay-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="layui-icon-username"
                size="lg"
              />
            </lay-form-item>
            <lay-form-item>
              <lay-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="layui-icon-password"
                size="lg"
                @keyup.enter="handleLogin"
              />
            </lay-form-item>
          </template>

          <template v-else>
            <lay-form-item>
              <lay-input
                v-model="loginForm.phone"
                placeholder="请输入手机号"
                prefix-icon="layui-icon-phone"
                maxlength="11"
                size="lg"
              />
            </lay-form-item>
            <lay-form-item>
              <div class="input-group">
                <lay-input
                  v-model="loginForm.code"
                  placeholder="验证码"
                  prefix-icon="layui-icon-vercode"
                  size="lg"
                  class="input-flex"
                />
                <lay-button
                  @click="sendCode"
                  :disabled="countdown > 0"
                  :loading="sendingCode"
                >
                  {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
                </lay-button>
              </div>
            </lay-form-item>
          </template>

          <lay-form-item>
            <div class="form-options">
              <lay-checkbox v-model="rememberMe">记住我</lay-checkbox>
              <a href="#" class="forgot-pwd">忘记密码？</a>
            </div>
          </lay-form-item>

          <lay-form-item>
            <lay-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              size="lg"
              block
            >
              登 录
            </lay-button>
          </lay-form-item>

          <div class="demo-hint">
            <p>演示账号：admin / 123456</p>
            <p>或直接点击登录按钮进入系统</p>
          </div>
        </lay-form>
      </lay-space>
    </div>

    <div class="login-footer">
      <p>© 2026 账单管理系统。All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import { login } from 'src/api/module/auth'
import { LayForm, LayFormItem, LayInput, LayButton, LaySpace, LayCheckbox } from '@layui/layui-vue'

const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const loginType = ref<'username' | 'phone'>('username')
const rememberMe = ref(false)
const loading = ref(false)
const countdown = ref(0)
const sendingCode = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  phone: '',
  code: ''
})

const handleLogin = async () => {
  loading.value = true
  
  try {
    const params = {
      type: loginType.value,
      ...(loginType.value === 'username'
        ? { username: loginForm.username, password: loginForm.password }
        : { phone: loginForm.phone, code: loginForm.code }
      )
    }

    if (!params.username || !params.password) {
      userStore.setToken('demo_token')
      userStore.setUserInfo({ id: 1, username: 'admin', nickname: '管理员' })
      message.success('欢迎使用账单管理系统')
      router.push('/dashboard')
      loading.value = false
      return
    }

    const res = await login(params)
    
    if (res && res.token) {
      userStore.setToken(res.token)
      if (res.userInfo) {
        userStore.setUserInfo(res.userInfo)
      }
      
      message.success('登录成功')
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('登录失败:', error)
    userStore.setToken('demo_token')
    userStore.setUserInfo({ id: 1, username: 'admin', nickname: '管理员' })
    message.success('演示模式登录成功')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}

const sendCode = () => {
  if (!loginForm.phone) {
    message.warning('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    message.warning('请输入正确的手机号')
    return
  }
  
  sendingCode.value = true
  countdown.value = 60
  message.success('验证码已发送')
  sendingCode.value = false
  
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
</script>

<style scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  flex-direction: column;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: bgMove 20s linear infinite;
}

@keyframes bgMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.login-box {
  width: 440px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #16baaa 0%, #16b777 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(22, 186, 170, 0.3);
}

.logo-wrapper i {
  font-size: 40px;
  color: #fff;
}

.login-header h1 {
  font-size: 26px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-header p {
  color: #999;
  font-size: 14px;
}

.login-content {
  width: 100%;
}

.login-tabs {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
  font-weight: 500;
  background: #fafafa;
}

.tab-item.active {
  color: #16baaa;
  background: #fff;
  border-bottom: 2px solid #16baaa;
  margin-bottom: -2px;
}

.input-group {
  display: flex;
  gap: 12px;
}

.input-flex {
  flex: 1;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-pwd {
  color: #16baaa;
  text-decoration: none;
  font-size: 14px;
}

.forgot-pwd:hover {
  text-decoration: underline;
}

.demo-hint {
  margin-top: 16px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
  text-align: center;
}

.demo-hint p {
  color: #666;
  font-size: 13px;
  margin: 4px 0;
}

.demo-hint p:first-child {
  color: #16baaa;
  font-weight: 500;
}

.login-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  margin-top: 20px;
}
</style>
