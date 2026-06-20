// My Assistant — Embeddable Chat Widget
// Usage: <script src="https://my-assistant-bhre.vercel.app/widget.js" data-color="#7c3aed" data-name="My Bot" data-greeting="Hi!"></script>
// This is a STANDALONE widget. It does NOT load or embed the main website.
(function () {
  'use strict'

  const WIDGET_ID = 'my-assistant-widget'
  if (document.getElementById(WIDGET_ID)) return

  // Find the script tag to get config
  const script = document.currentScript || document.querySelector('script[data-agent-id]')
  const agentId = script?.getAttribute('data-agent-id') || 'demo'
  const primaryColor = script?.getAttribute('data-color') || '#7c3aed'
  const position = script?.getAttribute('data-position') || 'right'
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
      let ctx = 'Business Name: ' + title + '\nDescription: ' + metaDesc + '\n\nWebsite Content:\n' + content
      if (extraContext) ctx += '\n\nAdditional Information:\n' + extraContext
      return ctx
    } catch (e) {
      return extraContext ? 'Additional Information:\n' + extraContext : ''
    }
  }

  let PAGE_CONTEXT = ''
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    PAGE_CONTEXT = scrapeHostPage()
  } else {
    document.addEventListener('DOMContentLoaded', function () { PAGE_CONTEXT = scrapeHostPage() })
  }

  // Helper: convert hex to rgb
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 124, g: 58, b: 237 }
  }

  const rgb = hexToRgb(primaryColor)
  const colorRgb = rgb.r + ', ' + rgb.g + ', ' + rgb.b

  // Inject styles
  const style = document.createElement('style')
  style.textContent = '\
    #' + WIDGET_ID + ' { all: initial; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; line-height: 1.5; }\
    #' + WIDGET_ID + ' * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit; line-height: inherit; }\
    \
    .ma-fab {\
      position: fixed; bottom: 24px; ' + position + ': 24px; z-index: 2147483647;\
      width: 60px; height: 60px; border-radius: 50%;\
      background: ' + primaryColor + '; color: white; border: none; cursor: pointer;\
      box-shadow: 0 4px 20px rgba(' + colorRgb + ', 0.4);\
      display: flex; align-items: center; justify-content: center;\
      transition: transform 0.2s ease, box-shadow 0.2s ease;\
    }\
    .ma-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(' + colorRgb + ', 0.5); }\
    .ma-fab svg { width: 26px; height: 26px; }\
    \
    .ma-chat {\
      position: fixed; bottom: 100px; ' + position + ': 24px; z-index: 2147483647;\
      width: 380px; max-width: calc(100vw - 32px); height: 560px; max-height: calc(100vh - 120px);\
      background: #0f0d1a; border-radius: 20px;\
      display: none; flex-direction: column; overflow: hidden;\
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);\
      animation: ma-slideUp 0.3s ease;\
    }\
    .ma-chat.open { display: flex; }\
    @keyframes ma-slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }\
    \
    .ma-header {\
      padding: 18px 20px;\
      background: ' + primaryColor + ';\
      display: flex; align-items: center; justify-content: space-between;\
      flex-shrink: 0;\
    }\
    .ma-header-left { display: flex; align-items: center; gap: 12px; }\
    .ma-header-avatar {\
      width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2);\
      display: flex; align-items: center; justify-content: center;\
    }\
    .ma-header-avatar svg { width: 18px; height: 18px; color: white; }\
    .ma-header-info { display: flex; flex-direction: column; }\
    .ma-header-title { color: white; font-weight: 600; font-size: 15px; }\
    .ma-header-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }\
    .ma-header-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: ma-pulse 2s infinite; }\
    .ma-header-status-text { color: rgba(255,255,255,0.75); font-size: 12px; }\
    .ma-close {\
      background: rgba(255,255,255,0.15); border: none; color: white; cursor: pointer;\
      width: 32px; height: 32px; border-radius: 50%; font-size: 18px;\
      display: flex; align-items: center; justify-content: center;\
      transition: background 0.15s;\
    }\
    .ma-close:hover { background: rgba(255,255,255,0.25); }\
    @keyframes ma-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }\
    \
    .ma-messages {\
      flex: 1; overflow-y: auto; padding: 20px 16px;\
      display: flex; flex-direction: column; gap: 10px;\
      background: #0f0d1a;\
    }\
    .ma-messages::-webkit-scrollbar { width: 4px; }\
    .ma-messages::-webkit-scrollbar-track { background: transparent; }\
    .ma-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }\
    \
    .ma-msg {\
      max-width: 82%; padding: 12px 16px; font-size: 14px; line-height: 1.55;\
      word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;\
      white-space: pre-wrap;\
    }\
    .ma-msg.user {\
      align-self: flex-end; background: ' + primaryColor + '; color: white;\
      border-radius: 18px 18px 4px 18px;\
    }\
    .ma-msg.bot {\
      align-self: flex-start; background: rgba(255,255,255,0.07); color: #e8e8e8;\
      border-radius: 18px 18px 18px 4px;\
    }\
    .ma-msg.typing {\
      align-self: flex-start; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4);\
      border-radius: 18px 18px 18px 4px;\
    }\
    .ma-typing-dots { display: inline-flex; gap: 4px; align-items: center; height: 20px; }\
    .ma-typing-dots span {\
      width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4);\
      animation: ma-bounce 1.4s infinite ease-in-out both;\
    }\
    .ma-typing-dots span:nth-child(1) { animation-delay: 0s; }\
    .ma-typing-dots span:nth-child(2) { animation-delay: 0.16s; }\
    .ma-typing-dots span:nth-child(3) { animation-delay: 0.32s; }\
    @keyframes ma-bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }\
    \
    .ma-suggestions {\
      padding: 8px 16px 4px; display: flex; flex-wrap: wrap; gap: 6px;\
      background: #0f0d1a; flex-shrink: 0;\
    }\
    .ma-suggestion {\
      font-size: 12px; padding: 6px 12px; border-radius: 16px;\
      background: transparent; border: 1px solid rgba(' + colorRgb + ', 0.4);\
      color: rgb(' + colorRgb + '); cursor: pointer;\
      transition: background 0.15s, color 0.15s;\
    }\
    .ma-suggestion:hover { background: ' + primaryColor + '; color: white; border-color: ' + primaryColor + '; }\
    \
    .ma-input-area {\
      padding: 14px 16px; background: #0f0d1a;\
      display: flex; gap: 10px; align-items: center;\
      border-top: 1px solid rgba(255,255,255,0.06);\
      flex-shrink: 0;\
    }\
    .ma-input {\
      flex: 1; padding: 12px 16px; border-radius: 12px;\
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);\
      color: #ffffff; font-size: 14px; outline: none;\
      transition: border-color 0.2s, background 0.2s;\
    }\
    .ma-input::placeholder { color: rgba(255,255,255,0.3); }\
    .ma-input:focus { border-color: ' + primaryColor + '; background: rgba(255,255,255,0.09); }\
    .ma-send {\
      width: 40px; height: 40px; border-radius: 12px; background: ' + primaryColor + ';\
      color: white; border: none; cursor: pointer;\
      display: flex; align-items: center; justify-content: center;\
      transition: opacity 0.2s, transform 0.1s;\
      flex-shrink: 0;\
    }\
    .ma-send:hover { transform: scale(1.05); }\
    .ma-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }\
    .ma-send svg { width: 18px; height: 18px; }\
    \
    .ma-powered {\
      text-align: center; padding: 8px; font-size: 11px; color: rgba(255,255,255,0.25);\
      background: #0f0d1a; flex-shrink: 0;\
    }\
    .ma-powered a { color: rgba(255,255,255,0.25); text-decoration: none; }\
    .ma-powered a:hover { color: rgba(255,255,255,0.45); }\
    \
    @media (max-width: 480px) {\
      .ma-chat {\
        width: calc(100vw - 16px); ' + position + ': 8px; bottom: 96px;\
        height: calc(100vh - 112px); max-height: calc(100vh - 112px); border-radius: 16px;\
      }\
      .ma-fab { bottom: 20px; ' + position + ': 16px; width: 54px; height: 54px; }\
      .ma-fab svg { width: 22px; height: 22px; }\
      .ma-msg { max-width: 88%; font-size: 14px; }\
    }\
  '
  document.head.appendChild(style)

  // Build widget HTML
  var container = document.createElement('div')
  container.id = WIDGET_ID
  container.innerHTML = '\
    <button class="ma-fab" aria-label="Open chat">\
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\
    </button>\
    <div class="ma-chat" role="dialog" aria-label="Chat assistant">\
      <div class="ma-header">\
        <div class="ma-header-left">\
          <div class="ma-header-avatar">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>\
          </div>\
          <div class="ma-header-info">\
            <span class="ma-header-title">' + botName + '</span>\
            <div class="ma-header-status">\
              <span class="ma-header-dot"></span>\
              <span class="ma-header-status-text">Online</span>\
            </div>\
          </div>\
        </div>\
        <button class="ma-close" aria-label="Close chat">&times;</button>\
      </div>\
      <div class="ma-messages">\
        <div class="ma-msg bot">' + greeting + '</div>\
      </div>\
      <div class="ma-suggestions"></div>\
      <div class="ma-input-area">\
        <input class="ma-input" type="text" placeholder="Type a message..." aria-label="Chat message" />\
        <button class="ma-send" disabled aria-label="Send">\
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>\
        </button>\
      </div>\
      <div class="ma-powered"><a href="https://my-assistant-bhre.vercel.app" target="_blank" rel="noopener">Powered by My Assistant</a></div>\
    </div>\
  '
  document.body.appendChild(container)

  // Widget logic
  var fab = container.querySelector('.ma-fab')
  var chat = container.querySelector('.ma-chat')
  var closeBtn = container.querySelector('.ma-close')
  var messages = container.querySelector('.ma-messages')
  var suggestionsArea = container.querySelector('.ma-suggestions')
  var input = container.querySelector('.ma-input')
  var sendBtn = container.querySelector('.ma-send')

  var isOpen = false
  var messageCount = 0

  // Show suggestions only at start
  var defaultSuggestions = ['What do you do?', 'How can you help me?', 'Tell me more']
  function showSuggestions(suggestions) {
    suggestionsArea.innerHTML = ''
    suggestions.forEach(function (text) {
      var btn = document.createElement('button')
      btn.className = 'ma-suggestion'
      btn.textContent = text
      btn.addEventListener('click', function () {
        input.value = text
        sendMessage()
      })
      suggestionsArea.appendChild(btn)
    })
  }

  function hideSuggestions() {
    suggestionsArea.innerHTML = ''
  }

  showSuggestions(defaultSuggestions)

  fab.addEventListener('click', function () {
    isOpen = !isOpen
    chat.classList.toggle('open', isOpen)
    fab.innerHTML = isOpen
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><path d="M18 6L6 18M6 6l12 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    if (isOpen) input.focus()
  })

  closeBtn.addEventListener('click', function () {
    isOpen = false
    chat.classList.remove('open')
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  })

  input.addEventListener('input', function () {
    sendBtn.disabled = !input.value.trim()
  })

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !sendBtn.disabled) sendMessage()
  })

  sendBtn.addEventListener('click', sendMessage)

  function addMessage(text, role) {
    var div = document.createElement('div')
    div.className = 'ma-msg ' + role
    if (role === 'typing') {
      div.innerHTML = '<div class="ma-typing-dots"><span></span><span></span><span></span></div>'
    } else {
      div.textContent = text
    }
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
    return div
  }

  function sendMessage() {
    var text = input.value.trim()
    if (!text) return

    addMessage(text, 'user')
    input.value = ''
    sendBtn.disabled = true
    messageCount++

    // Hide suggestions after first message
    if (messageCount === 1) hideSuggestions()

    var typingEl = addMessage('', 'typing')

    fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        agentId: agentId,
        context: PAGE_CONTEXT,
        businessEmail: businessEmail,
        businessName: botName,
        enableSearch: true
      }),
    })
      .then(function (res) { return res.json() })
      .then(function (data) {
        typingEl.remove()
        if (data.reply) {
          addMessage(data.reply, 'bot')
        } else {
          addMessage('Sorry, something went wrong. Please try again.', 'bot')
        }
      })
      .catch(function () {
        typingEl.remove()
        addMessage('Unable to connect. Please check your internet and try again.', 'bot')
      })
  }
})()
