import { getCurrentInstance } from 'vue'

export interface LayuiMessage {
  success: (msg: string) => void
  info: (msg: string) => void
  warning: (msg: string) => void
  error: (msg: string) => void
}

export interface LayuiLayer {
  confirm: (content: string, title: string, callback: () => void) => void
  alert: (content: string) => void
}

export interface LayuiLoading {
  show: () => number
  hide: (loadingIndex: number) => void
}

export interface LayuiAPI {
  layui: any
  message: LayuiMessage
  layer: LayuiLayer
  $: any
  loading: LayuiLoading
}

export const useLayui = (): LayuiAPI => {
  const instance = getCurrentInstance()
  const layui = (instance?.appContext.app as any)._context.config.globalProperties.$layui || window.layui
  
  const message: LayuiMessage = {
    success: (msg: string) => {
      layui?.layer?.msg(msg, { icon: 1, time: 2000 })
    },
    info: (msg: string) => {
      layui?.layer?.msg(msg, { icon: 0, time: 2000 })
    },
    warning: (msg: string) => {
      layui?.layer?.msg(msg, { icon: 2, time: 2000 })
    },
    error: (msg: string) => {
      layui?.layer?.msg(msg, { icon: 3, time: 2000 })
    }
  }
  
  const layer: LayuiLayer = {
    confirm: (content: string, title: string, callback: () => void) => {
      layui?.layer?.confirm(content, {
        title: title,
        icon: 3
      }, (index: number) => {
        callback()
        layui?.layer?.close(index)
      })
    },
    alert: (content: string) => {
      layui?.layer?.alert(content)
    }
  }
  
  const $ = layui
  
  const loading: LayuiLoading = {
    show: () => {
      return layui?.layer?.load?.(2, { shade: 0.5 }) || 0
    },
    hide: (loadingIndex: number) => {
      layui?.layer?.close?.(loadingIndex)
    }
  }
  
  return { layui, message, layer, $, loading }
}
