// My Assistant — Embeddable Chat Widget
// Customizable via data attributes: data-color, data-font, data-name, data-greeting, data-position, data-bg, data-icon.
// Usage: <script src="https://my-assistant-bhre.vercel.app/widget.js" data-color="#7c3aed" data-name="My Bot" data-greeting="Hi!"></script>
(function () {
  'use strict'

  var WIDGET_ID = 'my-assistant-widget'
  if (document.getElementById(WIDGET_ID)) return

  var script = document.currentScript || document.querySelector('script[data-agent-id]')
  function attr(name, fallback) { return (script && script.getAttribute(name)) || fallback }

  var agentId       = attr('data-agent-id', 'demo')
  var primaryColor  = attr('data-color', '#7c3aed')
  var position      = attr('data-position', 'right')
  var greeting      = attr('data-greeting', 'Hi! How can I help you today?')
  var botName       = attr('data-name', 'AI Assistant')
  var extraContext  = attr('data-extra-context', '')
  var businessEmail = attr('data-business-email', '')
  var launcherIcon  = attr('data-icon', '')
  var logoUrl       = attr('data-logo', '')
  var bgColor       = attr('data-bg', '#f0f2f5')

  // Font
  var fontParam = attr('data-font', 'system')
  var FONT_PRESETS = {
    system:  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inter:   '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    rounded: '"Nunito", "Quicksand", -apple-system, BlinkMacSystemFont, sans-serif',
    serif:   'Georgia, "Times New Roman", serif',
    mono:    '"SF Mono", "Roboto Mono", Menlo, Consolas, monospace',
    poppins: '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif'
  }
  var fontFamily = FONT_PRESETS[fontParam.toLowerCase()] || fontParam

  var GOOGLE_FONTS = {
    inter:   'Inter:wght@400;500;600;700',
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

  var scriptSrc = (script && script.src) || ''
  var baseUrl = scriptSrc && scriptSrc.indexOf('http') === 0
    ? new URL(scriptSrc).origin
    : 'https://my-assistant-bhre.vercel.app'

  function hexToRgb(hex) {
    var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : { r:124, g:58, b:237 }
  }
  var rgb = hexToRgb(primaryColor)
  var colorRgb = rgb.r + ',' + rgb.g + ',' + rgb.b

  function isLight(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!m) return true
    return (0.299*parseInt(m[1],16) + 0.587*parseInt(m[2],16) + 0.114*parseInt(m[3],16)) > 150
  }
  var lightBg = isLight(bgColor)

  // Derived colours
  var botBubbleBg     = lightBg ? '#ffffff'                    : 'rgba(255,255,255,0.10)'
  var botBubbleColor  = lightBg ? '#1f2937'                    : '#e5e7eb'
  var botBubbleBorder = lightBg ? '1px solid #dde1e7'         : 'none'
  var dividerBg       = lightBg ? '#ffffff'                    : 'rgba(255,255,255,0.08)'
  var dividerColor    = lightBg ? '#9ca3af'                    : 'rgba(255,255,255,0.5)'
  var inputFieldBg    = lightBg ? '#f3f4f6'                    : 'rgba(255,255,255,0.10)'
  var inputFieldColor = lightBg ? '#1f2937'                    : '#e5e7eb'
  var inputPlaceholder= lightBg ? '#9ca3af'                    : 'rgba(255,255,255,0.4)'
  var inputAreaBg     = lightBg ? '#ffffff'                    : bgColor
  var inputAreaBorder = lightBg ? '#e5e7eb'                    : 'rgba(255,255,255,0.08)'
  var botTimeColor    = lightBg ? '#9ca3af'                    : 'rgba(255,255,255,0.45)'
  var typingDotColor  = lightBg ? 'rgba(0,0,0,0.25)'          : 'rgba(255,255,255,0.4)'

  // Page context scraping
  function scrapeHostPage() {
    try {
      var title    = document.title || ''
      var metaDesc = (document.querySelector('meta[name="description"]')||{}).content || ''
      var clone    = document.body.cloneNode(true)
      var rm = clone.querySelectorAll('script,style,nav,footer,iframe,noscript,svg,#'+WIDGET_ID)
      for (var i=0;i<rm.length;i++) rm[i].remove()
      var bodyText = clone.textContent.replace(/\s+/g,' ').trim().slice(0,12000)
      var ctx = 'Business Name: '+title+'\nDescription: '+metaDesc+'\n\nWebsite Content:\n'+bodyText
      if (extraContext) ctx += '\n\nAdditional Information:\n'+extraContext
      return ctx
    } catch(e) { return extraContext ? 'Additional Information:\n'+extraContext : '' }
  }
  var PAGE_CONTEXT = ''
  if (document.readyState==='complete'||document.readyState==='interactive') {
    PAGE_CONTEXT = scrapeHostPage()
  } else {
    document.addEventListener('DOMContentLoaded', function(){ PAGE_CONTEXT = scrapeHostPage() })
  }

  function nowTime() {
    var d=new Date(), h=d.getHours(), m=d.getMinutes()
    return (h<10?'0':'')+h+':'+(m<10?'0':'')+m
  }

  var avatarLetter = (botName||'A').trim().charAt(0).toUpperCase()

  // Shorthand: W = '#my-assistant-widget '
  var W = '#'+WIDGET_ID+' '

  // ============================================================
  // STYLES — all rules scoped under #my-assistant-widget so the
  // host page's CSS can never bleed in and break layout/sizing.
  // ============================================================
  var css = [
    /* Widget root — isolated from page styles */
    '#'+WIDGET_ID+'{all:initial;font-family:'+fontFamily+';font-size:15px;line-height:1.5;}',
    '#'+WIDGET_ID+' *{box-sizing:border-box!important;margin:0;padding:0;font-family:inherit;}',

    /* FAB */
    W+'.ma-fab{position:fixed!important;bottom:24px;'+position+':24px;z-index:2147483647;width:60px;height:60px;border-radius:50%;background:'+primaryColor+';color:#fff;border:none;cursor:pointer;box-shadow:0 4px 16px rgba('+colorRgb+',0.4);display:flex!important;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;}',
    W+'.ma-fab:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba('+colorRgb+',0.5);}',
    W+'.ma-fab svg{width:26px;height:26px;}',
    W+'.ma-fab-icon{font-size:26px;line-height:1;display:flex;align-items:center;justify-content:center;}',

    /* Chat window */
    W+'.ma-chat{position:fixed!important;bottom:100px;'+position+':24px;z-index:2147483647;width:380px;max-width:calc(100vw - 48px);height:560px;max-height:calc(100vh - 120px);background:#ffffff;border-radius:20px;display:none!important;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.16),0 0 0 1px rgba(0,0,0,0.05);animation:ma-slideUp .25s ease;}',
    W+'.ma-chat.open{display:flex!important;}',
    '@keyframes ma-slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',

    /* Header */
    W+'.ma-header{padding:16px 20px;background:'+primaryColor+';display:flex!important;align-items:center;justify-content:space-between;flex-shrink:0;}',
    W+'.ma-header-left{display:flex!important;align-items:center;gap:12px;}',
    W+'.ma-header-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex!important;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0;}',
    W+'.ma-header-info{display:flex!important;flex-direction:column;}',
    W+'.ma-header-title{color:#fff;font-weight:600;font-size:15px;line-height:1.3;}',
    W+'.ma-header-status{display:flex!important;align-items:center;gap:5px;margin-top:2px;}',
    W+'.ma-header-dot{width:8px;height:8px;border-radius:50%;background:#86efac;flex-shrink:0;}',
    W+'.ma-header-status-text{color:rgba(255,255,255,0.8);font-size:12px;}',
    W+'.ma-close{background:rgba(255,255,255,0.15)!important;border:none!important;color:#fff;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex!important;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;}',
    W+'.ma-close:hover{background:rgba(255,255,255,0.3)!important;}',

    /* Messages area */
    W+'.ma-messages{flex:1;overflow-y:auto;padding:16px;display:flex!important;flex-direction:column;gap:12px;background:'+bgColor+';}',
    W+'.ma-messages::-webkit-scrollbar{width:4px;}',
    W+'.ma-messages::-webkit-scrollbar-track{background:transparent;}',
    W+'.ma-messages::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.10);border-radius:4px;}',

    /* Date divider */
    W+'.ma-divider{text-align:center;margin:4px 0 8px;}',
    W+'.ma-divider span{font-size:11.5px;color:'+dividerColor+';background:'+dividerBg+';padding:4px 14px;border-radius:999px;}',

    /* Message rows — flex row, bubbles auto-size to content */
    W+'.ma-row{display:flex!important;width:100%;align-items:flex-end;}',
    W+'.ma-row.user{justify-content:flex-end;}',
    W+'.ma-row.bot{justify-content:flex-start;}',

    /* Bubbles — KEY FIX: width:fit-content makes them shrink to text, not stretch */
    W+'.ma-bubble{display:block;width:-webkit-fit-content;width:fit-content;max-width:78%;min-width:0;padding:11px 15px;font-size:14.5px;line-height:1.55;border-radius:18px;}',
    W+'.ma-bubble.user{background:'+primaryColor+';color:#fff;border-bottom-right-radius:4px;}',
    W+'.ma-bubble.bot{background:'+botBubbleBg+';color:'+botBubbleColor+';border-bottom-left-radius:4px;border:'+botBubbleBorder+';box-shadow:0 2px 8px rgba(0,0,0,0.10);}',

    /* Text — wraps correctly without forcing bubble width */
    W+'.ma-bubble .ma-text{display:block;overflow-wrap:break-word;word-break:break-word;white-space:pre-wrap;hyphens:auto;}',

    /* Timestamp */
    W+'.ma-time{display:block;font-size:10.5px;margin-top:4px;text-align:right;white-space:nowrap;}',
    W+'.ma-bubble.user .ma-time{color:rgba(255,255,255,0.6);}',
    W+'.ma-bubble.bot .ma-time{color:'+botTimeColor+';}',

    /* Typing dots */
    W+'.ma-bubble.typing{background:'+botBubbleBg+';border:'+botBubbleBorder+';border-radius:18px;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.07);}',
    W+'.ma-typing-dots{display:inline-flex!important;gap:4px;align-items:center;height:20px;padding:0 2px;}',
    W+'.ma-typing-dots span{display:block;width:7px;height:7px;border-radius:50%;background:'+typingDotColor+';animation:ma-bounce 1.4s infinite ease-in-out both;}',
    W+'.ma-typing-dots span:nth-child(2){animation-delay:.16s;}',
    W+'.ma-typing-dots span:nth-child(3){animation-delay:.32s;}',
    '@keyframes ma-bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}',

    /* Input area */
    W+'.ma-input-area{padding:12px 14px;background:'+inputAreaBg+';display:flex!important;gap:10px;align-items:center;border-top:1px solid '+inputAreaBorder+';flex-shrink:0;}',
    W+'.ma-input{flex:1;padding:11px 18px;border-radius:999px;background:'+inputFieldBg+';border:1px solid '+(lightBg?'#e5e7eb':'transparent')+';color:'+inputFieldColor+';font-size:14.5px;outline:none;transition:border-color .2s;-webkit-appearance:none;appearance:none;}',
    W+'.ma-input::placeholder{color:'+inputPlaceholder+';}',
    W+'.ma-input:focus{border-color:'+primaryColor+';}',
    W+'.ma-send{width:40px;height:40px;border-radius:50%;background:'+primaryColor+';color:#fff;border:none;cursor:pointer;display:flex!important;align-items:center;justify-content:center;transition:opacity .2s,transform .1s;flex-shrink:0;box-shadow:0 2px 8px rgba('+colorRgb+',0.35);}',
    W+'.ma-send:hover{transform:scale(1.06);}',
    W+'.ma-send:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}',
    W+'.ma-send svg{width:17px;height:17px;}',

    /* Mobile */
    '@media(max-width:480px){'+W+'.ma-chat{width:calc(100vw - 16px);'+position+':8px;bottom:96px;height:calc(100vh - 112px);max-height:calc(100vh - 112px);border-radius:16px;}'+W+'.ma-fab{bottom:20px;'+position+':16px;width:54px;height:54px;}'+W+'.ma-fab svg{width:22px;height:22px;}'+W+'.ma-bubble{max-width:85%;}}',
  ]

  var style = document.createElement('style')
  style.textContent = css.join('')
  document.head.appendChild(style)

  // ============================================================
  // HTML
  // ============================================================
  var chatIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  var closeIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M18 6L6 18M6 6l12 12"/></svg>'
  var fabOpenContent = launcherIcon
    ? '<span class="ma-fab-icon">'+launcherIcon+'</span>'
    : chatIconSvg

  var container = document.createElement('div')
  container.id = WIDGET_ID
  container.innerHTML =
    '<button class="ma-fab" aria-label="Open chat">'+fabOpenContent+'</button>'+
    '<div class="ma-chat" role="dialog" aria-label="Chat assistant">'+
      '<div class="ma-header">'+
        '<div class="ma-header-left">'+
          '<div class="ma-header-avatar">'+( logoUrl ? '<img src="'+logoUrl+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>' : avatarLetter )+'</div>'+
          '<div class="ma-header-info">'+
            '<span class="ma-header-title">'+botName+'</span>'+
            '<div class="ma-header-status"><span class="ma-header-dot"></span><span class="ma-header-status-text">Online</span></div>'+
          '</div>'+
        '</div>'+
        '<button class="ma-close" aria-label="Close chat">'+closeIconSvg+'</button>'+
      '</div>'+
      '<div class="ma-messages">'+
        '<div class="ma-divider"><span>Today</span></div>'+
      '</div>'+
      '<div class="ma-input-area">'+
        '<input class="ma-input" type="text" placeholder="Type a message..." aria-label="Chat message"/>'+
        '<button class="ma-send" disabled aria-label="Send"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>'+
      '</div>'+
    '</div>'
  document.body.appendChild(container)

  var fab      = container.querySelector('.ma-fab')
  var chat     = container.querySelector('.ma-chat')
  var closeBtn = container.querySelector('.ma-close')
  var messages = container.querySelector('.ma-messages')
  var input    = container.querySelector('.ma-input')
  var sendBtn  = container.querySelector('.ma-send')
  var isOpen   = false

  function addMessage(text, role) {
    var row = document.createElement('div')
    row.className = 'ma-row '+role
    var bubble = document.createElement('div')
    bubble.className = 'ma-bubble '+role
    if (role==='typing') {
      bubble.innerHTML = '<div class="ma-typing-dots"><span></span><span></span><span></span></div>'
    } else {
      var textEl = document.createElement('span')
      textEl.className = 'ma-text'
      textEl.textContent = text
      bubble.appendChild(textEl)
      var t = document.createElement('span')
      t.className = 'ma-time'
      t.textContent = nowTime()
      bubble.appendChild(t)
    }
    row.appendChild(bubble)
    messages.appendChild(row)
    messages.scrollTop = messages.scrollHeight
    return row
  }

  addMessage(greeting, 'bot')

  fab.addEventListener('click', function() {
    isOpen = !isOpen
    chat.classList.toggle('open', isOpen)
    fab.innerHTML = isOpen ? closeIconSvg : fabOpenContent
    if (isOpen) input.focus()
  })
  closeBtn.addEventListener('click', function() {
    isOpen = false
    chat.classList.remove('open')
    fab.innerHTML = fabOpenContent
  })
  input.addEventListener('input', function() { sendBtn.disabled = !input.value.trim() })
  input.addEventListener('keydown', function(e) { if (e.key==='Enter' && !sendBtn.disabled) sendMessage() })
  sendBtn.addEventListener('click', sendMessage)

  function sendMessage() {
    var text = input.value.trim()
    if (!text) return
    addMessage(text, 'user')
    input.value = ''
    sendBtn.disabled = true
    var typingEl = addMessage('', 'typing')
    fetch(baseUrl+'/api/chat', {
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
    .then(function(res){ return res.json() })
    .then(function(data){
      typingEl.remove()
      addMessage(data&&data.reply ? data.reply : 'Sorry, something went wrong. Please try again.', 'bot')
    })
    .catch(function(){
      typingEl.remove()
      addMessage('Unable to connect. Please check your internet and try again.', 'bot')
    })
  }
})()

