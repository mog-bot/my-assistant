// My Assistant — Embeddable Chat Widget
// Usage: <script src="https://your-domain.com/widget.js" data-agent-id="demo"></script>
(function () {
  'use strict'

  const WIDGET_ID = 'my-assistant-widget'
  if (document.getElementById(WIDGET_ID)) return // prevent double-load

  // Find the script tag to get config
  const script = document.currentScript || document.querySelector('script[data-agent-id]')
  const agentId = script?.getAttribute('data-agent-id') || 'demo'
  const primaryColor = script?.getAttribute('data-color') || '#7c3aed'
  const position = script?.getAttribute('data-position') || 'right' // right | left
  const greeting = script?.getAttribute('data-greeting') || 'Hi! How can I help you today?'

  // Determine API base URL from script src
  const scriptSrc = script?.src || ''
  const baseUrl = scriptSrc ? new URL(scriptSrc).origin : window.location.origin

  // Inject styles
  const style = document.createElement('style')
  style.textContent = `
    #${WIDGET_ID} * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    
    .ma-fab {
      position: fixed; bottom: 24px; ${position}: 24px; z-index: 99999;
      width: 60px; height: 60px; border-radius: 50%;
      background: ${primaryColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 24px;
    }
    .ma-fab:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(0,0,0,0.4); }
    
    .ma-chat {
      position: fixed; bottom: 96px; ${position}: 24px; z-index: 99999;
      width: 380px; max-width: calc(100vw - 48px); height: 500px; max-height: calc(100vh - 120px);
      background: #1e1b2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
      display: none; flex-direction: column; overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    }
    .ma-chat.open { display: flex; }
    
    .ma-header {
      padding: 16px 20px; background: ${primaryColor};
      display: flex; align-items: center; justify-content: space-between;
    }
    .ma-header-title { color: white; font-weight: 600; font-size: 16px; }
    .ma-close { background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 4px; }
    
    .ma-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
    }
    
    .ma-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
    .ma-msg.user { align-self: flex-end; background: ${primaryColor}; color: white; border-bottom-right-radius: 4px; }
    .ma-msg.bot { align-self: flex-start; background: rgba(255,255,255,0.1); color: #e2e0ea; border-bottom-left-radius: 4px; }
    .ma-msg.typing { color: #888; font-style: italic; }
    
    .ma-input-area {
      padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.1);
      display: flex; gap: 8px;
    }
    .ma-input {
      flex: 1; padding: 10px 14px; border-radius: 8px;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
      color: white; font-size: 14px; outline: none;
    }
    .ma-input::placeholder { color: #888; }
    .ma-input:focus { border-color: ${primaryColor}; }
    .ma-send {
      padding: 10px 16px; border-radius: 8px; background: ${primaryColor};
      color: white; border: none; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: opacity 0.2s;
    }
    .ma-send:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .ma-badge {
      text-align: center; padding: 8px; font-size: 11px; color: #666;
    }
    .ma-badge a { color: #888; text-decoration: none; }
    .ma-badge a:hover { color: #aaa; }
  `
  document.head.appendChild(style)

  // Build widget HTML
  const container = document.createElement('div')
  container.id = WIDGET_ID
  container.innerHTML = `
    <button class="ma-fab" aria-label="Open chat assistant">💬</button>
    <div class="ma-chat" role="dialog" aria-label="Chat with AI assistant">
      <div class="ma-header">
        <span class="ma-header-title">My Assistant</span>
        <button class="ma-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="ma-messages">
        <div class="ma-msg bot">${greeting}</div>
      </div>
      <div class="ma-input-area">
        <input class="ma-input" type="text" placeholder="Type a message..." aria-label="Chat message" />
        <button class="ma-send" disabled>Send</button>
      </div>
      <div class="ma-badge"><a href="${baseUrl}" target="_blank" rel="noopener">Powered by My Assistant</a></div>
    </div>
  `
  document.body.appendChild(container)

  // Widget logic
  const fab = container.querySelector('.ma-fab')
  const chat = container.querySelector('.ma-chat')
  const closeBtn = container.querySelector('.ma-close')
  const messages = container.querySelector('.ma-messages')
  const input = container.querySelector('.ma-input')
  const sendBtn = container.querySelector('.ma-send')

  let isOpen = false
  let context = null // loaded on first open

  fab.addEventListener('click', () => {
    isOpen = !isOpen
    chat.classList.toggle('open', isOpen)
    fab.textContent = isOpen ? '✕' : '💬'
    if (isOpen) input.focus()
  })

  closeBtn.addEventListener('click', () => {
    isOpen = false
    chat.classList.remove('open')
    fab.textContent = '💬'
  })

  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim()
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled) {
      sendMessage()
    }
  })

  sendBtn.addEventListener('click', sendMessage)

  function addMessage(text, role) {
    const div = document.createElement('div')
    div.className = `ma-msg ${role}`
    div.textContent = text
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
    return div
  }

  async function sendMessage() {
    const text = input.value.trim()
    if (!text) return

    addMessage(text, 'user')
    input.value = ''
    sendBtn.disabled = true

    const typingEl = addMessage('Thinking...', 'bot typing')

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: context || '' }),
      })

      const data = await res.json()
      typingEl.remove()
      addMessage(data.reply || data.error || 'Sorry, something went wrong.', 'bot')
    } catch {
      typingEl.remove()
      addMessage('Sorry, I couldn\'t connect. Please try again.', 'bot')
    }
  }

  // Load business context on first open (lazy)
  const observer = new MutationObserver(() => {
    if (chat.classList.contains('open') && !context) {
      // Context would be loaded from the agent's stored data
      // For now, it's passed via the chat API from stored scrape data
      context = ''
      observer.disconnect()
    }
  })
  observer.observe(chat, { attributes: true, attributeFilter: ['class'] })
})()
