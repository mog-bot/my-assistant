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

  // Determine API base URL from script src (always points to our API, never the host site)
  const scriptSrc = script?.src || ''
  const baseUrl = scriptSrc && scriptSrc.startsWith('http') ? new URL(scriptSrc).origin : 'https://my-assistant-bhre.vercel.app'

  // Auto-scrape the host page for context
  function scrapeHostPage() {
    try {
      const title = document.title || ''
      const metaDesc = document.querySelector('meta[name="description"]')?.content || ''

      // Clone body and remove non-content elements
      const clone = document.body.cloneNode(true)
      const remove = clone.querySelectorAll('script, style, nav, footer, iframe, noscript, svg, #' + WIDGET_ID)
      remove.forEach(el => el.remove())

      // Get clean text content
      const bodyText = clone.textContent.replace(/\s+/g, ' ').trim()

      // Cap at 12000 chars to stay within API limits
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

  // Inject styles — WhatsApp-style design
  const style = document.createElement('style')
  style.textContent = `
    #${WIDGET_ID} { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #${WIDGET_ID} * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit; }

    .ma-fab {
      position: fixed; bottom: 24px; ${position}: 24px; z-index: 2147483647;
      width: 60px; height: 60px; border-radius: 50%;
      background: #25D366; color: white; border: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(37,211,102,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .ma-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(37,211,102,0.5); }

    .ma-chat {
      position: fixed; bottom: 96px; ${position}: 24px; z-index: 2147483647;
      width: 380px; max-width: calc(100vw - 48px); height: 520px; max-height: calc(100vh - 120px);
      background: #ffffff; border-radius: 16px;
      display: none; flex-direction: column; overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04);
    }
    .ma-chat.open { display: flex; }

    .ma-header {
      padding: 12px 16px; background: #075E54;
      display: flex; align-items: center; gap: 12px;
    }
    .ma-avatar {
      width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 16px; flex-shrink: 0;
    }
    .ma-header-info { flex: 1; min-width: 0; }
    .ma-header-title { color: white; font-weight: 600; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ma-header-status { color: rgba(255,255,255,0.8); font-size: 12px; margin-top: 2px; }
    .ma-close { background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 22px; padding: 4px 8px; line-height: 1; border-radius: 4px; flex-shrink: 0; }
    .ma-close:hover { color: white; background: rgba(255,255,255,0.1); }

    .ma-messages {
      flex: 1; overflow-y: auto; padding: 12px 14px;
      display: flex; flex-direction: column; gap: 6px;
      background: #ECE5DD url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-1.3 0-2.4 1-2.4 2.4s1 2.4 2.4 2.4 2.4-1 2.4-2.4S31.3 5 30 5zm-15 15c-1.3 0-2.4 1-2.4 2.4s1 2.4 2.4 2.4 2.4-1 2.4-2.4S16.3 20 15 20zm30 0c-1.3 0-2.4 1-2.4 2.4s1 2.4 2.4 2.4 2.4-1 2.4-2.4S46.3 20 45 20zm-15 15c-1.3 0-2.4 1-2.4 2.4s1 2.4 2.4 2.4 2.4-1 2.4-2.4S31.3 35 30 35z' fill='%23d4cfc6' fill-opacity='0.15'/%3E%3C/svg%3E");
    }
    .ma-messages::-webkit-scrollbar { width: 5px; }
    .ma-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }

    .ma-msg {
      max-width: 85%; padding: 6px 8px 4px 8px; font-size: 14px; line-height: 1.4;
      word-wrap: break-word; overflow-wrap: anywhere; word-break: break-word; white-space: pre-wrap;
      position: relative;
    }
    .ma-msg.user {
      align-self: flex-end; background: #DCF8C6; color: #111;
      border-radius: 8px 8px 0 8px;
      box-shadow: 0 1px 1px rgba(0,0,0,0.08);
    }
    .ma-msg.bot {
      align-self: flex-start; background: #FFFFFF; color: #111;
      border-radius: 8px 8px 8px 0;
      box-shadow: 0 1px 1px rgba(0,0,0,0.08);
    }
    .ma-msg .ma-time {
      font-size: 11px; margin-top: 2px; text-align: right; color: #667781;
      display: flex; align-items: center; justify-content: flex-end; gap: 3px;
    }
    .ma-msg.user .ma-time { color: #667781; }
    .ma-msg.typing { color: #667781; font-style: italic; background: #ffffff; }

    .ma-input-area {
      padding: 8px 10px; background: #F0F2F5;
      display: flex; gap: 8px; align-items: center;
    }
    .ma-input {
      flex: 1; padding: 10px 16px; border-radius: 21px;
      background: #ffffff; border: none;
      color: #111; font-size: 15px; outline: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .ma-input::placeholder { color: #8696a0; }
    .ma-input:focus { box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .ma-send {
      width: 40px; height: 40px; border-radius: 50%; background: #25D366;
      color: white; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s, transform 0.1s;
      flex-shrink: 0;
    }
    .ma-send:hover { transform: scale(1.05); }
    .ma-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    .ma-powered {
      text-align: center; padding: 4px; font-size: 10px; color: #8696a0;
      background: #F0F2F5;
    }
    .ma-powered a { color: #8696a0; text-decoration: none; }
    .ma-powered a:hover { color: #667781; text-decoration: underline; }

    @media (max-width: 480px) {
      .ma-chat { width: calc(100vw - 16px); ${position}: 8px; bottom: 80px; height: calc(100vh - 96px); border-radius: 12px; }
      .ma-fab { bottom: 16px; ${position}: 16px; width: 54px; height: 54px; }
    }
  `
  document.head.appendChild(style)

  // Build widget HTML — clean WhatsApp-style
  const container = document.createElement('div')
  container.id = WIDGET_ID
  container.innerHTML = `
    <button class="ma-fab" aria-label="Open chat">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
    <div class="ma-chat" role="dialog" aria-label="Chat assistant">
      <div class="ma-header">
        <div class="ma-avatar">${botName.charAt(0).toUpperCase()}</div>
        <div class="ma-header-info">
          <div class="ma-header-title">${botName}</div>
          <div class="ma-header-status">● Online</div>
        </div>
        <button class="ma-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="ma-messages">
        <div class="ma-msg bot">${greeting}<div class="ma-time">now</div></div>
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
      ? '<span style="font-size:18px;line-height:1;">✕</span>'
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

  function getTimeStr() {
    const now = new Date()
    return now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0')
  }

  function addMessage(text, role) {
    const div = document.createElement('div')
    div.className = `ma-msg ${role}`
    const textNode = document.createTextNode(text)
    div.appendChild(textNode)
    if (!role.includes('typing')) {
      const time = document.createElement('div')
      time.className = 'ma-time'
      time.textContent = getTimeStr()
      div.appendChild(time)
    }
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
        body: JSON.stringify({
          message: text,
          agentId: agentId,
          context: PAGE_CONTEXT
        }),
      })

      const data = await res.json()
      typingEl.remove()

      if (data.reply) {
        addMessage(data.reply, 'bot')
      } else if (data.error) {
        addMessage('Sorry, something went wrong. Please try again.', 'bot')
      }
    } catch (err) {
      typingEl.remove()
      addMessage('Unable to connect. Please check your internet and try again.', 'bot')
    }
  }
})()
