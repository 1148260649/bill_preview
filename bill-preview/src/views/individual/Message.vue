<template>
  <div class="page-container">
    <div class="page-header">
      <h2><i class="layui-icon layui-icon-notice"></i> 消息中心</h2>
      <div class="header-actions">
        <button class="layui-btn layui-btn-primary" @click="markAllRead">
          <i class="layui-icon layui-icon-ok"></i> 全部已读
        </button>
      </div>
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
          <div class="message-body">
            {{ msg.content }}
          </div>
          <div class="message-footer">
            <span class="tag" v-if="msg.important">重要</span>
            <span class="read-status" v-if="msg.read">已读</span>
            <span class="read-status unread" v-else>未读</span>
          </div>
        </div>
        <div class="message-action">
          <i class="layui-icon layui-icon-right"></i>
        </div>
      </div>

      <div v-if="filteredMessages.length === 0" class="empty-state">
        <i class="layui-icon layui-icon-notice"></i>
        <p>暂无消息</p>
      </div>
    </div>

    <!-- 消息详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>{{ currentMessage?.title }}</h4>
          <button class="modal-close" @click="showDetailModal = false"><i class="layui-icon layui-icon-close"></i></button>
        </div>
        <div class="modal-body">
          <div class="detail-meta">
            <span class="meta-item">
              <i class="layui-icon layui-icon-time"></i>
              {{ currentMessage?.time }}
            </span>
            <span class="meta-item" v-if="currentMessage?.sender">
              <i class="layui-icon layui-icon-username"></i>
              {{ currentMessage?.sender }}
            </span>
          </div>
          <div class="detail-content">
            {{ currentMessage?.content }}
          </div>
          <div class="detail-actions">
            <button class="layui-btn layui-btn-primary" @click="showDetailModal = false">关闭</button>
            <button class="layui-btn" v-if="!currentMessage?.read" @click="markAsRead">标记为已读</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

declare const layui: any

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
  { 
    id: 1, type: 'system', icon: 'layui-icon-about', title: '系统升级通知',
    content: '尊敬的用户，系统将于今晚 23:00 进行例行维护升级，预计持续 2 小时。升级期间部分功能可能暂时不可用，给您带来不便敬请谅解。',
    time: '2026-05-21 10:30', important: true, read: false
  },
  { 
    id: 2, type: 'system', icon: 'layui-icon-safe', title: '安全提醒',
    content: '检测到您的账户密码强度较弱，建议尽快修改密码以保障账户安全。',
    time: '2026-05-20 14:20', important: false, read: false
  },
  { 
    id: 3, type: 'system', icon: 'layui-icon-ok-circle', title: '数据备份成功',
    content: '您的账单数据已自动备份完成，下次登录将同步最新数据。',
    time: '2026-05-20 00:00', important: false, read: false
  },
  { 
    id: 4, type: 'system', icon: 'layui-icon-chart', title: '月度账单报告已生成',
    content: '您的 5 月份账单分析报告已生成，包含收支对比、消费趋势分析等内容，请前往总账单看板查看。',
    time: '2026-05-01 09:00', important: true, read: true
  },
  { 
    id: 5, type: 'system', icon: 'layui-icon-gift', title: '新功能上线',
    content: '红包/投资管理功能已上线，您可以记录红包往来和投资收益了！',
    time: '2026-04-15 10:00', important: false, read: true
  }
])

const privateMessages = ref([
  { 
    id: 6, type: 'private', icon: 'layui-icon-dialogue', title: '管理员消息',
    content: '您好！您的账户权限已成功升级，现在可以访问更多功能了。如有任何问题，请随时联系客服。感谢您的使用！',
    time: '2026-05-19 16:00', sender: '系统管理员', important: false, read: false
  }
])

const filteredMessages = computed(() => {
  return activeTab.value === 'system' ? systemMessages.value : privateMessages.value
})

const viewDetail = (msg: any) => {
  currentMessage.value = msg
  showDetailModal.value = true
  if (!msg.read) {
    msg.read = true
    if (activeTab.value === 'system') {
      systemUnread.value = Math.max(0, systemUnread.value - 1)
    } else {
      privateUnread.value = Math.max(0, privateUnread.value - 1)
    }
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
.tab-item:hover { color: #16baaa; }
.tab-item.active { color: #16baaa; }
.tab-item.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #16baaa; }
.badge { background: #ff5722; color: #fff; font-size: 12px; padding: 1px 8px; border-radius: 10px; }
.message-list { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.message-item { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: all 0.3s; }
.message-item:hover { background: #f8f8f8; }
.message-item:last-child { border-bottom: none; }
.message-item.unread { background: #f0f9ff; }
.message-item.unread .message-header h3 { font-weight: 600; }
.message-left { flex-shrink: 0; }
.message-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.icon-type-system { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.icon-type-private { background: linear-gradient(135deg, #16baaa 0%, #16b777 100%); color: #fff; }
.message-content { flex: 1; min-width: 0; }
.message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.message-header h3 { font-size: 15px; color: #333; }
.message-time { font-size: 13px; color: #999; }
.message-body { font-size: 14px; color: #666; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.message-footer { display: flex; gap: 8px; }
.tag { background: #ff5722; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.read-status { font-size: 12px; color: #999; }
.read-status.unread { color: #16baaa; }
.message-action { color: #999; }
.empty-state { padding: 60px 20px; text-align: center; color: #999; }
.empty-state i { font-size: 48px; margin-bottom: 16px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-dialog { background: #fff; border-radius: 12px; width: 600px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e6e6e6; }
.modal-header h4 { font-size: 18px; color: #333; }
.modal-close { background: none; border: none; font-size: 20px; color: #999; cursor: pointer; }
.modal-body { padding: 24px; }
.detail-meta { display: flex; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e6e6e6; }
.meta-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #666; }
.meta-item i { color: #999; }
.detail-content { font-size: 15px; color: #333; line-height: 1.8; margin-bottom: 24px; white-space: pre-wrap; }
.detail-actions { display: flex; gap: 12px; justify-content: flex-end; }
</style>
