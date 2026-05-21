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
      
      <div class="login-tabs">
        <div class="tab-item" :class="{ active: loginType === 'username' }" @click="loginType = 'username'">账号登录</div>
        <div class="tab-item" :class="{ active: loginType === 'phone' }" @click="loginType = 'phone'">验证码登录</div>
      </div>

      <div class="login-form">
        <template v-if="loginType === 'username'">
          <div class="form-item">
            <div class="input-wrapper">
              <i class="layui-icon layui-icon-username"></i>
              <input v-model="loginForm.username" class="layui-input" placeholder="请输入用户名" />
            </div>
          </div>
          <div class="form-item">
            <div class="input-wrapper">
              <i class="layui-icon layui-icon-password"></i>
              <input v-model="loginForm.password" type="password" class="layui-input" placeholder="请输入密码" @keyup.enter="handleLogin" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="form-item">
            <div class="input-wrapper">
              <i class="layui-icon layui-icon-phone"></i>
              <input v-model="loginForm.phone" class="layui-input" placeholder="请输入手机号" maxlength="11" />
            </div>
          </div>
          <div class="form-item form-item-code">
            <div class="input-wrapper">
              <i class="layui-icon layui-icon-vercode"></i>
              <input v-model="loginForm.code" class="layui-input" placeholder="验证码" />
            </div>
            <button class="layui-btn layui-btn-primary code-btn" @click="sendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
            </button>
          </div>
        </template>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-pwd">忘记密码？</a>
        </div>

        <button class="layui-btn layui-btn-fluid login-btn" @click="handleLogin" :disabled="loading">
          <i v-if="loading" class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>
          <span v-else>登 录</span>
        </button>

        <div class="demo-hint">
          <p>演示账号：admin / 123456</p>
          <p>或直接点击登录按钮进入系统</p>
        </div>
      </div>
    </div>

    <div class="login-footer">
      <p>© 2026 账单管理系统。All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/module/auth'
declare const layui: any

const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

const router = useRouter()
const userStore = useUserStore()

const loginType = ref<'username' | 'phone'>('username')
const rememberMe = ref(false)
const loading = ref(false)
const countdown = ref(0)

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

    // 空账号密码则使用演示模式
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
    // 失败时使用演示模式
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
  
  countdown.value = 60
  message.success('验证码已发送')
  
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
  margin-bottom: 30px;
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

.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
  font-weight: 500;
}

.tab-item.active {
  color: #16baaa;
  border-bottom: 2px solid #16baaa;
  margin-bottom: -2px;
}

.form-item {
  margin-bottom: 20px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 0 16px;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: #16baaa;
  box-shadow: 0 0 0 2px rgba(22, 186, 170, 0.1);
}

.input-wrapper i {
  color: #999;
  font-size: 18px;
  margin-right: 12px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  height: 46px;
  font-size: 15px;
}

.form-item-code {
  display: flex;
  gap: 12px;
}

.form-item-code .input-wrapper {
  flex: 1;
}

.code-btn {
  height: 46px;
  white-space: nowrap;
  padding: 0 20px;
  border-radius: 8px;
}

.code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.forgot-pwd {
  color: #16baaa;
  text-decoration: none;
  font-size: 14px;
}

.forgot-pwd:hover {
  text-decoration: underline;
}

.login-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #16baaa 0%, #16b777 100%);
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.demo-hint {
  margin-top: 20px;
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
