// 全局 layui 初始化
import Layui from '@layui/layui-vue'
import '@layui/icons-vue/lib/index.css'

// 在浏览器全局注册 layui
if (typeof window !== 'undefined') {
  ;(window as any).layui = Layui
}

export default Layui
