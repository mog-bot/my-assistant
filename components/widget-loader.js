'use client'

import { useEffect } from 'react'

export function WidgetLoader() {
  useEffect(() => {
    // Don't double-load
    if (document.getElementById('my-assistant-widget')) return

    const script = document.createElement('script')
    script.src = '/widget.js'
    script.setAttribute('data-agent-id', 'demo')
    script.setAttribute('data-greeting', "Hey! 👋 I'm a demo of My Assistant. Ask me anything about the product!")
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      const widget = document.getElementById('my-assistant-widget')
      if (widget) widget.remove()
      script.remove()
    }
  }, [])

  return null
}
