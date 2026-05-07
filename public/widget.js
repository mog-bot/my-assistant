// My Assistant — Embeddable Chat Widget
// Usage: <script src="https://my-assistant-bhre.vercel.app/widget.js" data-agent-id="demo"></script>
(function () {
  'use strict'

  const WIDGET_ID = 'my-assistant-widget'
  if (document.getElementById(WIDGET_ID)) return // prevent double-load

  // Find the script tag to get config
  const script = document.currentScript || document.querySelector('script[data-agent-id]')
  const agentId = script?.getAttribute('data-agent-id') || 'demo'
  const primaryColor = script?.getAttribute('data-color') || '#7c3aed'
  const position = script?.getAttribute('data-position') || 'right' // right | left
  const greeting = script?.getAttribute('data-greeting') || 'Welcome. How can I help you today?'

  // Determine API base URL from script src
  const scriptSrc = script?.src || ''
  const baseUrl = scriptSrc && scriptSrc.startsWith('http') ? new URL(scriptSrc).origin : window.location.origin

  // Demo mode context — full product + setup knowledge
  const DEMO_CONTEXT = agentId === 'demo'
    ? `You are the AI assistant for My Assistant. You help with product questions AND guide users on adding the chatbot to their website.

PRODUCT INFO:
My Assistant is an AI-powered platform that gives businesses their own custom AI chatbot trained on their data. Setup takes minutes — just paste your website URL, we scrape it, and your AI agent is ready. Embed it with one line of code.

How it works: Sign up > Go to Dashboard > Paste website URL > Test your agent > Copy embed code > Paste on your site. Done.

Pricing: One simple plan at $20.50/week. Includes your own custom AI agent trained on your business data, unlimited messages, unlimited conversations, one-click install, lead capture, custom branding, and priority support.

Currently in early access.

SETUP GUIDE:
The embed code: <script src="https://my-assistant-bhre.vercel.app/widget.js" data-agent-id="demo"></script>
Paste it before </body> on any website.

Customization: data-color (hex), data-position (right/left), data-greeting (custom message).

WordPress: Appearance > Theme Editor > footer.php, or use "Insert Headers and Footers" plugin.
Shopify: Online Store > Themes > Edit Code > theme.liquid.
Wix: Settings > Custom Code > Body (end).
Squarespace: Settings > Advanced > Code Injection > Footer.

Be professional, helpful, and concise. Do NOT use emojis. Demonstrate value through clear, knowledgeable responses.`
    : null

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
    .ma-header-sub { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 2px; }
    .ma-close { background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 4px; }
    
    .ma-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
    }
    
    .ma-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; }
    .ma-msg.user { align-self: flex-end; background: ${primaryColor}; color: white; border-bottom-right-radius: 4px; }
    .ma-msg.bot { align-self: flex-start; background: rgba(255,255,255,0.1); color: #e2e0ea; border-bottom-left-radius: 4px; }
    .ma-msg.typing { color: #888; font-style: italic; }
    
    .ma-suggestions { padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 8px; }
    .ma-suggestion {
      font-size: 12px; padding: 6px 12px; border-radius: 999px;
      background: transparent; border: 1px solid ${primaryColor}; color: ${primaryColor};
      cursor: pointer; transition: all 0.2s;
    }
    .ma-suggestion:hover { background: ${primaryColor}; color: white; }
    
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
    <button class="ma-fab" aria-label="Open chat assistant"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
    <div class="ma-chat" role="dialog" aria-label="Chat with AI assistant">
      <div class="ma-header">
        <div>
          <div class="ma-header-title">My Assistant</div>
          <div class="ma-header-sub">Ask about the product or how to set up</div>
        </div>
        <button class="ma-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="ma-messages">
        <div class="ma-msg bot">${greeting}</div>
      </div>
      <div class="ma-suggestions">
        <button class="ma-suggestion">How does it work?</button>
        <button class="ma-suggestion">How do I add this to my site?</button>
        <button class="ma-suggestion">What does it cost?</button>
      </div>
      <div class="ma-input-area">
        <input class="ma-input" type="text" placeholder="Ask me anything..." aria-label="Chat message" />
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
  const suggestionsEl = container.querySelector('.ma-suggestions')

  let isOpen = false
  let context = null
  let messageCount = 0

  fab.addEventListener('click', () => {
    isOpen = !isOpen
    chat.classList.toggle('open', isOpen)
    fab.innerHTML = isOpen ? '✕' : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    if (isOpen) input.focus()
  })

  closeBtn.addEventListener('click', () => {
    isOpen = false
    chat.classList.remove('open')
    fab.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
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

  // Handle suggestion clicks
  suggestionsEl.querySelectorAll('.ma-suggestion').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent
      sendMessage()
    })
  })

  function addMessage(text, role) {
    const div = document.createElement('div')
    div.className = `ma-msg ${role}`
    div.textContent = text
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
    return div
  }

  function hideSuggestions() {
    if (suggestionsEl) suggestionsEl.style.display = 'none'
  }

  async function sendMessage() {
    const text = input.value.trim()
    if (!text) return

    messageCount++
    if (messageCount >= 1) hideSuggestions()

    addMessage(text, 'user')
    input.value = ''
    sendBtn.disabled = true

    const typingEl = addMessage('Thinking...', 'bot typing')

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: DEMO_CONTEXT || context || '' }),
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
      context = ''
      observer.disconnect()
    }
  })
  observer.observe(chat, { attributes: true, attributeFilter: ['class'] })
})()
