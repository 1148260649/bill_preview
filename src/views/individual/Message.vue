<template>
  <div class="page-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-notice"></i> 消息中心</h2>
      <lay-button @click="markAllRead">
        <i class="layui-icon layui-icon-ok"></i> 全部已读
      </lay-button>
    </div>

    <div class="message-tabs">
      <div class="tabs-wrapper">
        <div class="tab-item" :class="{ active: activeTab === 'system' }" @click="activeTab = 'system'">
          <i class="layui-icon layui-icon-notice"></i>
          系统通知
          <span class="badge" v-if="systemUnread > 0">{{ systemUnread }}</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'private' }" @click="activeTab = 'private'">
          <i class="layui-icon layui-icon-dialogue"></i>
          用户私信
          <span class="badge" v-if="privateUnread > 0">{{ privateUnread }}</span>
        </div>
      </div>
    </div>

    <div class="message-list">
      <div v-for="msg in filteredMessages" :key="msg.id" class="message-item" :class="{ unread: !msg.read }" @click="viewDetail(msg)">
        <div class="message-left">
          <div class="message-icon" :class="'icon-type-' + msg.type">
            <i :class="msg.icon"></i>
          </div>
        </div>
        <div class="message-content">
          <div class="message-header">
            <h3>{{ msg.title }}</h3>
            <span class="message-time">{{ msg.time }}</span>
          </div>
          <div class="message-body">{{ msg.content }}</div>
          <div class="message-footer">
            <span class="tag" v-if="msg.important">重要</span>
            <span class="read-status" v-if="msg.read">已读</span>
            <span class="read-status unread" v-else>未读</span>
          </div>
        </div>
        <div class="message-action"><i class="layui-icon layui-icon-right"></i></div>
      </div>
      <div v-if="filteredMessages.length === 0" class="empty-state">
        <i class="layui-icon layui-icon-notice"></i>
        <p>暂无消息</p>
      </div>
    </div>

    <lay-layer v-model="showDetailModal" :title="currentMessage?.title || ''" :area="['650px']" >
      <div class="detail-content" v-if="currentMessage" style="padding: 16px;">
        <div class="detail-meta" style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e6e6e6;">
          <span class="meta-item" style="margin-right: 20px; color: #666;">
            <i class="layui-icon layui-icon-time" style="margin-right: 4px;"></i> {{ currentMessage.time }}
          </span>
          <span class="meta-item" v-if="currentMessage.sender" style="color: #666;">
            <i class="layui-icon layui-icon-username" style="margin-right: 4px;"></i> {{ currentMessage.sender }}
          </span>
        </div>
        <div class="detail-body" style="line-height: 1.8; color: #333;">{{ currentMessage.content }}</div>
      </div>
      <template #footer>
        <div style="display: flex; gap: 12px; justify-content: flex-end; padding: 0 16px 16px;">
          <lay-button @click="showDetailModal = false">关闭</lay-button>
          <lay-button v-if="!currentMessage?.read" @click="markAsRead">标记为已读</lay-button>
        </div>
      </template>
    </lay-layer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { LayButton } from '@layui/layui-vue'
import { LayLayer, layer } from '@layui/layer-vue'

const layui = (window as any).layui
const message = {
  success: (msg: string) => layui.layer.msg(msg, { icon: 1, time: 2000 }),
  info: (msg: string) => layui.layer.msg(msg, { icon: 0, time: 2000 }),
  warning: (msg: string) => layui.layer.msg(msg, { icon: 2, time: 2000 }),
  error: (msg: string) => layui.layer.msg(msg, { icon: 3, time: 2000 })
}

const activeTab = ref('system')
const showDetailModal = ref(false)
const currentMessage = ref<any>(null)
const systemUnread = ref(3)
const privateUnread = ref(1)

const systemMessages = ref([
  { id: 1, type: 'system', icon: 'layui-icon-about', title: '系统升级通知', content: '尊敬的用户，系统将于今晚 23:00 进行例行维护升级，预计持续 2 小时。', time: '2026-05-21 10:30', important: true, read: false },
  { id: 2, type: 'system', icon: 'layui-icon-safe', title: '安全提醒', content: '检测到您的账户密码强度较弱，建议尽快修改密码以保障账户安全。', time: '2026-05-20 14:20', important: false, read: false },
  { id: 3, type: 'system', icon: 'layui-icon-ok-circle', title: '数据备份成功', content: '您的账单数据已自动备份完成，下次登录将同步最新数据。', time: '2026-05-20 00:00', important: false, read: false },
])

const privateMessages = ref([
  { id: 6, type: 'private', icon: 'layui-icon-dialogue', title: '管理员消息', content: '您好！您的账户权限已成功升级，现在可以访问更多功能了。', time: '2026-05-19 16:00', sender: '系统管理员', important: false, read: false }
])

const filteredMessages = computed(() => activeTab.value === 'system' ? systemMessages.value : privateMessages.value)

const viewDetail = (msg: any) => {
  currentMessage.value = msg
  showDetailModal.value = true
  if (!msg.read) {
    msg.read = true
    if (activeTab.value === 'system') systemUnread.value = Math.max(0, systemUnread.value - 1)
    else privateUnread.value = Math.max(0, privateUnread.value - 1)
}
}

const markAsRead = () => {
  if (currentMessage.value) {
    currentMessage.value.read = true
    message.success('已标记为已读')
}
}

const markAllRead = () => {
  if (activeTab.value === 'system') {
    systemMessages.value.forEach(m => m.read = true)
    systemUnread.value = 0
} else {
    privateMessages.value.forEach(m => m.read = true)
    privateUnread.value = 0
}
  message.success('全部标记为已读')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; color: #333; display: flex; align-items: center; gap: 8px; }
.message-tabs { margin-bottom: 20px; }
.tabs-wrapper { display: flex; border-bottom: 2px solid #f0f0f0; }
.tab-item { position: relative; padding: 14px 24px; cursor: pointer; color: #666; display: flex; align-items: center; gap: 8px; font-weight: 500; transition: all 0.3s; }
.tab-item:hover, .tab-item.active { color: #16baaa; }
.tab-item.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #16baaa; }
.badge { background: #ff5722; color: #fff; font-size: 12px; padding: 1px 8px; border-radius: 10px; }
.message-list { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.message-item { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: all 0.3s; }
.message-item:hover { background: #f8f8f8; }
.message-item:last-child { border-bottom: none; }
.message-item.unread { background: #f0f9ff; }
.message-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.icon-type-system { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.icon-type-private { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; }
.message-content { flex: 1; }
.message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.message-header h3 { font-size: 16px; color: #333; }
.message-time { color: #999; font-size: 13px; }
.message-body { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 8px; }
.message-footer { display: flex; gap: 8px; align-items: center; }
.tag { background: #ff5722; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.read-status { color: #999; font-size: 12px; }
.read-status.unread { color: #16baaa; font-weight: 500; }
.message-action { color: #999; }
.empty-state { text-align: center; padding: 60px 20px; color: #999; }
.empty-state i { font-size: 48px; margin-bottom: 16px; }
.detail-content { padding: 16px 0; }
.detail-meta { display: flex; gap: 16px; margin-bottom: 16px; color: #999; font-size: 13px; }
.detail-body { line-height: 1.8; color: #333; font-size: 14px; white-space: pre-wrap; }
</style>
