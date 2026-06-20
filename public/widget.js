// My Assistant — Embeddable Chat Widget
// Usage: <script src="https://my-assistant-bhre.vercel.app/widget.js" data-color="#7c3aed" data-name="My Bot" data-greeting="Hi!"></script>
// This is a STANDALONE widget. It does NOT load or embed the main website.
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
  const botName = script?.getAttribute('data-name') || 'AI Assistant'
  const extraContext = script?.getAttribute('data-extra-context') || ''
  const businessEmail = script?.getAttribute('data-business-email') || ''

  // Determine API base URL from script src
  const scriptSrc = script?.src || ''
  const baseUrl = scriptSrc && scriptSrc.startsWith('http') ? new URL(scriptSrc).origin : 'https://my-assistant-bhre.vercel.app'

  // Auto-scrape the host page for context
  function scrapeHostPage() {
    try {
      const title = document.title || ''
      const metaDesc = document.querySelector('meta[name="description"]')?.content || ''

      const clone = document.body.cloneNode(true)
      const remove = clone.querySelectorAll('script, style, nav, footer, iframe, noscript, svg, #' + WIDGET_ID)
      remove.forEach(el => el.remove())

      const bodyText = clone.textContent.replace(/\s+/g, ' ').trim()
      const content = bodyText.slice(0, 12000)

      let ctx = `Business Name: ${title}\nDescription: ${metaDesc}\n\nWebsite Content:\n${content}`
      if (extraContext) {
        ctx += `\n\nAdditional Information:\n${extraContext}`
      }
      return ctx
    } catch (e) {
      return extraContext ? `Additional Information:\n${extraContext}` : ''
    }
  }

  // Scrape once on load
  let PAGE_CONTEXT = ''
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    PAGE_CONTEXT = scrapeHostPage()
  } else {
    document.addEventListener('DOMContentLoaded', () => { PAGE_CONTEXT = scrapeHostPage() })
  }

  // Helper: hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 124, g: 58, b: 237 }
  }

  const rgb = hexToRgb(primaryColor)
  const colorRgb = `${rgb.r}, ${rgb.g}, ${rgb.b}`

  // Get current time formatted
  function getTimeStr() {
    const now = new Date()
    let h = now.getHours()
    const m = now.getMinutes().toString().padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m} ${ampm}`
  }

  // Inject styles — Clean modern LIGHT design (matches /create preview)
  const style = document.createElement('style')
  style.textContent = `
    #${WIDGET_ID} { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #${WIDGET_ID} * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit; }

    .ma-fab {
      position: fixed; bottom: 24px; ${position}: 24px; z-index: 2147483647;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${primaryColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(${colorRgb}, 0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .ma-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(${colorRgb}, 0.5); }

    .ma-chat {
      position: fixed; bottom: 92px; ${position}: 24px; z-index: 2147483647;
      width: 380px; max-width: calc(100vw - 48px); height: 520px; max-height: calc(100vh - 120px);
      background: #ffffff; border-radius: 16px;
      display: none; flex-direction: column; overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
    }
    .ma-chat.open { display: flex; }

    .ma-header {
      padding: 14px 20px;
      background: ${primaryColor};
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .ma-header-left { display: flex; align-items: center; gap: 10px; }
    .ma-header-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 14px;
    }
    .ma-header-title { color: white; font-weight: 600; font-size: 15px; }
    .ma-header-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    .ma-header-dot { width: 7px; height: 7px; border-radius: 50%; background: #86efac; animation: ma-pulse 2s infinite; }
    .ma-header-status-text { color: rgba(255,255,255,0.75); font-size: 12px; }
    .ma-close { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 20px; padding: 4px 8px; line-height: 1; border-radius: 6px; transition: all 0.15s; }
    .ma-close:hover { color: white; background: rgba(255,255,255,0.15); }

    @keyframes ma-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .ma-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f9fafb;
    }
    .ma-messages::-webkit-scrollbar { width: 4px; }
    .ma-messages::-webkit-scrollbar-track { background: transparent; }
    .ma-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

    .ma-date-divider {
      text-align: center; margin: 4px 0;
    }
    .ma-date-divider span {
      font-size: 11px; color: #9ca3af; background: #ffffff; padding: 3px 12px;
      border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .ma-msg-row { display: flex; }
    .ma-msg-row.user { justify-content: flex-end; }
    .ma-msg-row.bot { justify-content: flex-start; }

    .ma-msg {
      max-width: 75%; padding: 10px 14px; font-size: 14px; line-height: 1.5;
      word-wrap: break-word; overflow-wrap: anywhere; white-space: pre-wrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .ma-msg.user {
      background: ${primaryColor}; color: white;
      border-radius: 18px 18px 4px 18px;
    }
    .ma-msg.bot {
      background: #ffffff; color: #1f2937;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #f3f4f6;
    }
    .ma-msg.typing {
      background: #ffffff; color: #9ca3af;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #f3f4f6;
      font-style: italic;
    }
    .ma-msg-time {
      font-size: 10px; margin-top: 4px; text-align: right;
    }
    .ma-msg.user .ma-msg-time { color: rgba(255,255,255,0.6); }
    .ma-msg.bot .ma-msg-time { color: #9ca3af; }
    .ma-msg.typing .ma-msg-time { display: none; }

    .ma-input-area {
      padding: 12px 16px; background: #ffffff;
      display: flex; gap: 8px; align-items: center;
      border-top: 1px solid #e5e7eb;
      flex-shrink: 0;
    }
    .ma-input {
      flex: 1; padding: 10px 16px; border-radius: 24px;
      background: #f3f4f6; border: 1px solid #e5e7eb;
      color: #1f2937; font-size: 14px; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .ma-input::placeholder { color: #9ca3af; }
    .ma-input:focus { border-color: ${primaryColor}; box-shadow: 0 0 0 2px rgba(${colorRgb}, 0.1); }
    .ma-send {
      width: 36px; height: 36px; border-radius: 50%; background: ${primaryColor};
      color: white; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s, transform 0.1s;
      flex-shrink: 0;
    }
    .ma-send:hover { transform: scale(1.05); }
    .ma-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

    .ma-powered {
      text-align: center; padding: 6px; font-size: 11px; color: #9ca3af;
      background: #ffffff; flex-shrink: 0; border-top: 1px solid #f3f4f6;
    }
    .ma-powered a { color: #9ca3af; text-decoration: none; transition: color 0.2s; }
    .ma-powered a:hover { color: #6b7280; }

    @media (max-width: 480px) {
      .ma-chat { width: calc(100vw - 16px); ${position}: 8px; bottom: 80px; height: calc(100vh - 96px); border-radius: 12px; }
      .ma-fab { bottom: 16px; ${position}: 16px; width: 52px; height: 52px; }
    }
  `
  document.head.appendChild(style)

  // Build widget HTML
  const container = document.createElement('div')
  container.id = WIDGET_ID

  const initial = (botName || 'A').charAt(0).toUpperCase()

  container.innerHTML = `
    <button class="ma-fab" aria-label="Open chat">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
    <div class="ma-chat" role="dialog" aria-label="Chat assistant">
      <div class="ma-header">
        <div class="ma-header-left">
          <div class="ma-header-avatar">${initial}</div>
          <div>
            <div class="ma-header-title">${botName}</div>
            <div class="ma-header-status">
              <span class="ma-header-dot"></span>
              <span class="ma-header-status-text">Online</span>
            </div>
          </div>
        </div>
        <button class="ma-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="ma-messages">
        <div class="ma-date-divider"><span>Today</span></div>
        <div class="ma-msg-row bot">
          <div class="ma-msg bot">${greeting}<div class="ma-msg-time">${getTimeStr()}</div></div>
        </div>
      </div>
      <div class="ma-input-area">
        <input class="ma-input" type="text" placeholder="Type a message..." aria-label="Chat message" />
        <button class="ma-send" disabled aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="ma-powered"><a href="https://my-assistant-bhre.vercel.app" target="_blank" rel="noopener">Powered by My Assistant</a></div>
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

  fab.addEventListener('click', () => {
    isOpen = !isOpen
    chat.classList.toggle('open', isOpen)
    fab.innerHTML = isOpen
      ? '<span style="font-size:16px;line-height:1;">✕</span>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    if (isOpen) input.focus()
  })

  closeBtn.addEventListener('click', () => {
    isOpen = false
    chat.classList.remove('open')
    fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  })

  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim()
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled) sendMessage()
  })

  sendBtn.addEventListener('click', sendMessage)

  function addMessage(text, role) {
    const row = document.createElement('div')
    row.className = `ma-msg-row ${role}`
    const div = document.createElement('div')
    div.className = `ma-msg ${role}`
    const textNode = document.createTextNode(text)
    div.appendChild(textNode)
    if (role !== 'typing') {
      const timeEl = document.createElement('div')
      timeEl.className = 'ma-msg-time'
      timeEl.textContent = getTimeStr()
      div.appendChild(timeEl)
    }
    row.appendChild(div)
    messages.appendChild(row)
    messages.scrollTop = messages.scrollHeight
    return row
  }

  async function sendMessage() {
    const text = input.value.trim()
    if (!text) return

    addMessage(text, 'user')
    input.value = ''
    sendBtn.disabled = true

    const typingRow = addMessage('Typing...', 'typing')

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          agentId: agentId,
          context: PAGE_CONTEXT,
          businessEmail: businessEmail,
          businessName: botName
        }),
      })

      const data = await res.json()
      typingRow.remove()

      if (data.reply) {
        addMessage(data.reply, 'bot')
      } else if (data.error) {
        addMessage('Sorry, something went wrong. Please try again.', 'bot')
      }
    } catch (err) {
      typingRow.remove()
      addMessage('Unable to connect. Please check your internet and try again.', 'bot')
    }
  }
})()
