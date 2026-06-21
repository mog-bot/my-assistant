// My Assistant — Embeddable Chat Widget
// Matches the My Assistant "/create" page live preview (light theme).
// Usage: <script src="https://my-assistant-bhre.vercel.app/widget.js" data-color="#16a34a" data-name="My Bot" data-greeting="Hi!"></script>
(function () {
  'use strict'

  var WIDGET_ID = 'my-assistant-widget'
  if (document.getElementById(WIDGET_ID)) return

  var script = document.currentScript || document.querySelector('script[data-agent-id]')
  function attr(name, fallback) { return (script && script.getAttribute(name)) || fallback }

  var agentId = attr('data-agent-id', 'demo')
  var primaryColor = attr('data-color', '#16a34a')
  var position = attr('data-position', 'right')
  var greeting = attr('data-greeting', 'Hi! How can I help you today?')
  var botName = attr('data-name', 'AI Assistant')
  var extraContext = attr('data-extra-context', '')
  var businessEmail = attr('data-business-email', '')

  // Background customization (default light gray to match preview)
  var bgColor = attr('data-bg', '#f9fafb')

  // Font customization
  var fontParam = attr('data-font', 'system')
  var FONT_PRESETS = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    rounded: '"Nunito", "Quicksand", -apple-system, BlinkMacSystemFont, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"SF Mono", "Roboto Mono", Menlo, Consolas, monospace',
    poppins: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif'
  }
  var fontFamily = FONT_PRESETS[fontParam.toLowerCase()] || fontParam

  // Load Google Font for web-font presets
  var GOOGLE_FONTS = {
    inter: 'Inter:wght@400;500;600;700',
    rounded: 'Nunito:wght@400;600;700',
    poppins: 'Poppins:wght@400;500;600;700'
  }
  var gFont = GOOGLE_FONTS[fontParam.toLowerCase()]
  if (gFont) {
    var fl = document.createElement('link')
    fl.rel = 'stylesheet'
    fl.href = 'https://fonts.googleapis.com/css2?family=' + gFont + '&display=swap'
    document.head.appendChild(fl)
  }

  // API base URL from script src
  var scriptSrc = (script && script.src) || ''
  var baseUrl = scriptSrc && scriptSrc.indexOf('http') === 0 ? new URL(scriptSrc).origin : 'https://my-assistant-bhre.vercel.app'

  // Detect light vs dark background to keep things readable
  function isLightColor(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!m) return true
    var r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150
  }
  var lightBg = isLightColor(bgColor)

  // Adaptive palette
  var botBubbleBg = lightBg ? '#ffffff' : 'rgba(255,255,255,0.10)'
  var botTextColor = lightBg ? '#1f2937' : '#e5e7eb'
  var botBubbleBorder = lightBg ? '1px solid #f0f0f0' : '1px solid transparent'
  var timeColorBot = lightBg ? '#9ca3af' : 'rgba(255,255,255,0.45)'
  var dividerText = lightBg ? '#9ca3af' : 'rgba(255,255,255,0.5)'
  var dividerBg = lightBg ? '#ffffff' : 'rgba(255,255,255,0.08)'
  var inputBarBg = lightBg ? '#ffffff' : bgColor
  var inputPillBg = lightBg ? '#f3f4f6' : 'rgba(255,255,255,0.10)'
  var inputText = lightBg ? '#1f2937' : '#ffffff'
  var placeholderColor = lightBg ? '#9ca3af' : 'rgba(255,255,255,0.4)'
  var topBorder = lightBg ? '#e5e7eb' : 'rgba(255,255,255,0.08)'
  var poweredColor = lightBg ? '#9ca3af' : 'rgba(255,255,255,0.35)'
  var scrollThumb = lightBg ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'

  // hex -> rgb for shadows
  function hexToRgb(hex) {
    var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 22, g: 163, b: 74 }
  }
  var rgb = hexToRgb(primaryColor)
  var colorRgb = rgb.r + ', ' + rgb.g + ', ' + rgb.b

  // Auto-scrape host page for context
  function scrapeHostPage() {
    try {
      var title = document.title || ''
      var metaDesc = (document.querySelector('meta[name="description"]') || {}).content || ''
      var clone = document.body.cloneNode(true)
      var rm = clone.querySelectorAll('script, style, nav, footer, iframe, noscript, svg, #' + WIDGET_ID)
      for (var i = 0; i < rm.length; i++) rm[i].remove()
      var bodyText = clone.textContent.replace(/\s+/g, ' ').trim().slice(0, 12000)
      var ctx = 'Business Name: ' + title + '\nDescription: ' + metaDesc + '\n\nWebsite Content:\n' + bodyText
      if (extraContext) ctx += '\n\nAdditional Information:\n' + extraContext
      return ctx
    } catch (e) {
      return extraContext ? 'Additional Information:\n' + extraContext : ''
    }
  }
  var PAGE_CONTEXT = ''
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    PAGE_CONTEXT = scrapeHostPage()
  } else {
    document.addEventListener('DOMContentLoaded', function () { PAGE_CONTEXT = scrapeHostPage() })
  }

  // Current time HH:MM
  function nowTime() {
    var d = new Date()
    var h = d.getHours(), m = d.getMinutes()
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m
  }

  var avatarLetter = (botName || 'A').trim().charAt(0).toUpperCase()

  // Styles
  var style = document.createElement('style')
  style.textContent =
    '#' + WIDGET_ID + '{all:initial;font-family:' + fontFamily + ';font-size:14px;line-height:1.5;}' +
    '#' + WIDGET_ID + ' *{box-sizing:border-box;margin:0;padding:0;font-family:inherit;}' +

    '.ma-fab{position:fixed;bottom:24px;' + position + ':24px;z-index:2147483647;width:60px;height:60px;border-radius:50%;background:' + primaryColor + ';color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(' + colorRgb + ',0.4);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;}' +
    '.ma-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(' + colorRgb + ',0.5);}' +
    '.ma-fab svg{width:26px;height:26px;}' +

    '.ma-chat{position:fixed;bottom:100px;' + position + ':24px;z-index:2147483647;width:380px;max-width:calc(100vw - 48px);height:540px;max-height:calc(100vh - 120px);background:' + bgColor + ';border-radius:16px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.04);animation:ma-slideUp .3s ease;}' +
    '.ma-chat.open{display:flex;}' +
    '@keyframes ma-slideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}' +

    '.ma-header{padding:16px 20px;background:' + primaryColor + ';display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}' +
    '.ma-header-left{display:flex;align-items:center;gap:12px;}' +
    '.ma-header-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;}' +
    '.ma-header-info{display:flex;flex-direction:column;}' +
    '.ma-header-title{color:#fff;font-weight:600;font-size:14px;}' +
    '.ma-header-status{display:flex;align-items:center;gap:6px;margin-top:1px;}' +
    '.ma-header-dot{width:8px;height:8px;border-radius:50%;background:#86efac;}' +
    '.ma-header-status-text{color:rgba(255,255,255,0.85);font-size:12px;}' +
    '.ma-close{background:rgba(255,255,255,0.2);border:none;color:#fff;cursor:pointer;width:30px;height:30px;border-radius:50%;font-size:17px;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;}' +
    '.ma-close:hover{background:rgba(255,255,255,0.32);}' +

    '.ma-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:' + bgColor + ';}' +
    '.ma-messages::-webkit-scrollbar{width:5px;}' +
    '.ma-messages::-webkit-scrollbar-track{background:transparent;}' +
    '.ma-messages::-webkit-scrollbar-thumb{background:' + scrollThumb + ';border-radius:4px;}' +

    '.ma-divider{text-align:center;margin:2px 0;}' +
    '.ma-divider span{font-size:11px;color:' + dividerText + ';background:' + dividerBg + ';padding:4px 12px;border-radius:999px;box-shadow:0 1px 2px rgba(0,0,0,0.06);}' +

    '.ma-row{display:flex;width:100%;}' +
    '.ma-row.user{justify-content:flex-end;}' +
    '.ma-row.bot{justify-content:flex-start;}' +

    '.ma-msg{max-width:80%;min-width:0;padding:11px 15px;font-size:14px;line-height:1.5;box-shadow:0 1px 2px rgba(0,0,0,0.05);}' +
    '.ma-msg.user{background:' + primaryColor + ';color:#fff;border-radius:18px 18px 4px 18px;}' +
    '.ma-msg.bot{background:' + botBubbleBg + ';color:' + botTextColor + ';border:' + botBubbleBorder + ';border-radius:18px 18px 18px 4px;}' +
    '.ma-text{display:block;white-space:pre-wrap;overflow-wrap:break-word;word-break:break-word;word-wrap:break-word;}' +
    '.ma-time{display:block;font-size:10.5px;margin-top:4px;text-align:right;opacity:0.85;}' +
    '.ma-msg.user .ma-time{color:rgba(255,255,255,0.6);}' +
    '.ma-msg.bot .ma-time{color:' + timeColorBot + ';}' +

    '.ma-msg.typing{background:' + botBubbleBg + ';border:' + botBubbleBorder + ';border-radius:18px 18px 18px 4px;}' +
    '.ma-typing-dots{display:inline-flex;gap:4px;align-items:center;height:18px;}' +
    '.ma-typing-dots span{width:6px;height:6px;border-radius:50%;background:' + (lightBg ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)') + ';animation:ma-bounce 1.4s infinite ease-in-out both;}' +
    '.ma-typing-dots span:nth-child(2){animation-delay:.16s;}' +
    '.ma-typing-dots span:nth-child(3){animation-delay:.32s;}' +
    '@keyframes ma-bounce{0%,80%,100%{transform:scale(.6);opacity:.4;}40%{transform:scale(1);opacity:1;}}' +

    '.ma-suggestions{display:none;}' +

    '.ma-input-area{padding:12px 16px;background:' + inputBarBg + ';display:flex;gap:8px;align-items:center;border-top:1px solid ' + topBorder + ';flex-shrink:0;}' +
    '.ma-input{flex:1;padding:10px 16px;border-radius:999px;background:' + inputPillBg + ';border:1px solid transparent;color:' + inputText + ';font-size:14px;outline:none;transition:border-color .2s;}' +
    '.ma-input::placeholder{color:' + placeholderColor + ';}' +
    '.ma-input:focus{border-color:' + primaryColor + ';}' +
    '.ma-send{width:36px;height:36px;border-radius:50%;background:' + primaryColor + ';color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .2s,transform .1s;flex-shrink:0;}' +
    '.ma-send:hover{transform:scale(1.06);}' +
    '.ma-send:disabled{opacity:.35;cursor:not-allowed;transform:none;}' +
    '.ma-send svg{width:16px;height:16px;}' +

    '.ma-powered{display:none;}' +

    '@media (max-width:480px){.ma-chat{width:calc(100vw - 16px);' + position + ':8px;bottom:96px;height:calc(100vh - 112px);max-height:calc(100vh - 112px);}.ma-fab{bottom:20px;' + position + ':16px;width:54px;height:54px;}.ma-fab svg{width:22px;height:22px;}.ma-msg{max-width:82%;}}'
  document.head.appendChild(style)

  // HTML
  var container = document.createElement('div')
  container.id = WIDGET_ID
  var chatIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  container.innerHTML =
    '<button class="ma-fab" aria-label="Open chat">' + chatIcon + '</button>' +
    '<div class="ma-chat" role="dialog" aria-label="Chat assistant">' +
      '<div class="ma-header">' +
        '<div class="ma-header-left">' +
          '<div class="ma-header-avatar">' + avatarLetter + '</div>' +
          '<div class="ma-header-info">' +
            '<span class="ma-header-title">' + botName + '</span>' +
            '<div class="ma-header-status"><span class="ma-header-dot"></span><span class="ma-header-status-text">Online</span></div>' +
          '</div>' +
        '</div>' +
        '<button class="ma-close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="ma-messages">' +
        '<div class="ma-divider"><span>Today</span></div>' +
      '</div>' +
      '<div class="ma-input-area">' +
        '<input class="ma-input" type="text" placeholder="Type a message..." aria-label="Chat message" />' +
        '<button class="ma-send" disabled aria-label="Send"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
      '</div>' +
    '</div>'
  document.body.appendChild(container)

  var fab = container.querySelector('.ma-fab')
  var chat = container.querySelector('.ma-chat')
  var closeBtn = container.querySelector('.ma-close')
  var messages = container.querySelector('.ma-messages')
  var input = container.querySelector('.ma-input')
  var sendBtn = container.querySelector('.ma-send')

  var isOpen = false
  var messageCount = 0
  var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><path d="M18 6L6 18M6 6l12 12"/></svg>'

  function addMessage(text, role, withTime) {
    var row = document.createElement('div')
    row.className = 'ma-row ' + role
    var bubble = document.createElement('div')
    bubble.className = 'ma-msg ' + role
    if (role === 'typing') {
      bubble.innerHTML = '<div class="ma-typing-dots"><span></span><span></span><span></span></div>'
    } else {
      var textEl = document.createElement('span')
      textEl.className = 'ma-text'
      textEl.textContent = text
      bubble.appendChild(textEl)
      if (withTime !== false) {
        var t = document.createElement('span')
        t.className = 'ma-time'
        t.textContent = nowTime()
        bubble.appendChild(t)
      }
    }
    row.appendChild(bubble)
    messages.appendChild(row)
    messages.scrollTop = messages.scrollHeight
    return row
  }

  // Greeting message
  addMessage(greeting, 'bot')

  fab.addEventListener('click', function () {
    isOpen = !isOpen
    chat.classList.toggle('open', isOpen)
    fab.innerHTML = isOpen ? closeIcon : chatIcon
    if (isOpen) input.focus()
  })
  closeBtn.addEventListener('click', function () {
    isOpen = false
    chat.classList.remove('open')
    fab.innerHTML = chatIcon
  })
  input.addEventListener('input', function () { sendBtn.disabled = !input.value.trim() })
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !sendBtn.disabled) sendMessage() })
  sendBtn.addEventListener('click', sendMessage)

  function sendMessage() {
    var text = input.value.trim()
    if (!text) return
    addMessage(text, 'user')
    input.value = ''
    sendBtn.disabled = true
    messageCount++

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
      })
    })
      .then(function (res) { return res.json() })
      .then(function (data) {
        typingEl.remove()
        addMessage(data && data.reply ? data.reply : 'Sorry, something went wrong. Please try again.', 'bot')
      })
      .catch(function () {
        typingEl.remove()
        addMessage('Unable to connect. Please check your internet and try again.', 'bot')
      })
  }
})()
