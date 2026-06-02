(function() {
  // Stylesheets
  const style = document.createElement('style');
  style.textContent = `
    .cc-assistant-trigger {
      position: fixed;
      bottom: 90px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-family: 'Inter', sans-serif;
    }
    @media (min-width: 768px) {
      .cc-assistant-trigger {
        bottom: 32px;
        right: 32px;
      }
    }
    .cc-assistant-btn {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #D4AF37 0%, #F5C75D 100%);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 30px rgba(212, 175, 55, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      position: relative;
    }
    .cc-assistant-btn:hover {
      transform: scale(1.1);
    }
    .cc-assistant-btn svg {
      width: 28px;
      height: 28px;
      color: #001F3F;
    }
    .cc-assistant-sparkle {
      position: absolute;
      top: -6px;
      right: -2px;
      animation: cc-pulse 2s infinite;
      color: #D4AF37;
    }
    .cc-assistant-label {
      font-size: 10px;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(0, 0, 0, 0.85);
      padding: 4px 8px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .cc-assistant-label:hover {
      color: #D4AF37;
    }

    .cc-assistant-window {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 85vh;
      z-index: 10000;
      background: #0a0a0f;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.6);
      font-family: 'Inter', sans-serif;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
      transform: translateY(100%);
      opacity: 0;
      pointer-events: none;
    }
    @media (min-width: 768px) {
      .cc-assistant-window {
        bottom: 24px;
        right: 24px;
        width: 400px;
        height: 600px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        transform: translateY(20px);
      }
    }
    .cc-assistant-window.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .cc-assistant-header {
      background: linear-gradient(to right, #14141d, #0a0a0f);
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .cc-assistant-header-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(to right, #D4AF37, #F5C75D);
    }
    .cc-assistant-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cc-assistant-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37 0%, #b5932a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
    }
    .cc-assistant-avatar svg {
      width: 20px;
      height: 20px;
      color: #001F3F;
    }
    .cc-assistant-title h3 {
      color: #ffffff !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      margin: 0 !important;
      line-height: 1.2 !important;
    }
    .cc-assistant-status {
      font-size: 11px;
      color: #4ade80;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }
    .cc-assistant-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
      animation: cc-pulse-green 1.5s infinite;
    }
    .cc-assistant-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 8px;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cc-assistant-close:hover {
      color: #ffffff;
    }

    .cc-assistant-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #050508;
    }
    .cc-assistant-msg-wrapper {
      display: flex;
      width: 100%;
    }
    .cc-assistant-msg-wrapper.user {
      justify-content: flex-end;
    }
    .cc-assistant-msg-wrapper.assistant {
      justify-content: flex-start;
    }
    .cc-assistant-msg {
      max-width: 85%;
      padding: 12px 16px;
      font-size: 14px;
      line-height: 1.5;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .cc-assistant-msg-wrapper.user .cc-assistant-msg {
      background: linear-gradient(135deg, #D4AF37 0%, #b5932a 100%);
      color: #001F3F;
      border-radius: 16px 16px 0 16px;
      font-weight: 600;
    }
    .cc-assistant-msg-wrapper.assistant .cc-assistant-msg {
      background: #1a1a24;
      color: #ffffff;
      border-radius: 16px 16px 16px 0;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .cc-assistant-typing-box {
      display: flex;
      gap: 4px;
      align-items: center;
      background: #1a1a24;
      padding: 12px 16px;
      border-radius: 16px 16px 16px 0;
      align-self: flex-start;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .cc-assistant-dot {
      width: 8px;
      height: 8px;
      background: #D4AF37;
      border-radius: 50%;
      animation: cc-bounce 1.4s infinite ease-in-out both;
    }
    .cc-assistant-dot:nth-child(1) { animation-delay: -0.32s; }
    .cc-assistant-dot:nth-child(2) { animation-delay: -0.16s; }

    .cc-assistant-input-area {
      padding: 16px;
      background: #0a0a0f;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 24px;
    }
    @media (min-width: 768px) {
      .cc-assistant-input-area {
        padding-bottom: 16px;
      }
    }
    .cc-assistant-form {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1a1a24;
      padding: 4px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: border-color 0.2s ease;
      width: 100%;
    }
    .cc-assistant-form:focus-within {
      border-color: rgba(212, 175, 55, 0.5);
    }
    .cc-assistant-mic-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .cc-assistant-mic-btn:hover {
      color: #D4AF37;
    }
    .cc-assistant-mic-btn.active {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      animation: cc-pulse-red 1.5s infinite;
    }
    .cc-assistant-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 14px;
      outline: none;
      padding: 8px 4px;
    }
    .cc-assistant-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    .cc-assistant-send-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .cc-assistant-send-btn.active {
      background: #D4AF37;
      color: #001F3F;
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
    }
    .cc-assistant-brand {
      text-align: center;
      font-family: monospace;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 2px;
      margin-top: 12px;
      text-transform: uppercase;
    }

    @keyframes cc-pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }
    @keyframes cc-pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
      70% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
      100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
    }
    @keyframes cc-pulse-red {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    @keyframes cc-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
  `;
  document.head.appendChild(style);

  // Generate elements
  const triggerDiv = document.createElement('div');
  triggerDiv.className = 'cc-assistant-trigger';
  triggerDiv.innerHTML = `
    <button class="cc-assistant-btn" id="cc-assistant-open-btn">
      <svg class="cc-assistant-sparkle" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
    <span class="cc-assistant-label" id="cc-assistant-open-lbl">Ask Me a Question</span>
  `;

  const windowDiv = document.createElement('div');
  windowDiv.className = 'cc-assistant-window';
  windowDiv.id = 'cc-assistant-chat-window';
  windowDiv.innerHTML = `
    <div class="cc-assistant-header">
      <div class="cc-assistant-header-bar"></div>
      <div class="cc-assistant-info">
        <div class="cc-assistant-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><polyline points="2 8.5 12 15 22 8.5"/><line x1="12" y1="15" x2="12" y2="22"/></svg>
        </div>
        <div>
          <div class="cc-assistant-title"><h3>CrownCare AI</h3></div>
          <span class="cc-assistant-status">
            <span class="cc-assistant-status-dot"></span> Analyzing Data
          </span>
        </div>
      </div>
      <button class="cc-assistant-close" id="cc-assistant-close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <div class="cc-assistant-messages" id="cc-assistant-messages-container">
      <div class="cc-assistant-msg-wrapper assistant">
        <div class="cc-assistant-msg">
          Hi! I am the CrownCare AI Assistant. We officially launch on Google Play on May 1, 2026! You can secure your exclusive spot by joining the Waitlist at the top of this page. How can I help you transform your hair health today?
        </div>
      </div>
    </div>

    <div class="cc-assistant-input-area">
      <form class="cc-assistant-form" id="cc-assistant-chat-form">
        <button type="button" class="cc-assistant-mic-btn" id="cc-assistant-mic-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </button>
        <input type="text" class="cc-assistant-input" id="cc-assistant-text-input" placeholder="Ask me anything..." autocomplete="off">
        <button type="submit" class="cc-assistant-send-btn" id="cc-assistant-send-btn" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
      <div class="cc-assistant-brand">Powered by CrownCare AI</div>
    </div>
  `;

  document.body.appendChild(triggerDiv);
  document.body.appendChild(windowDiv);

  // References
  const openBtn = document.getElementById('cc-assistant-open-btn');
  const openLbl = document.getElementById('cc-assistant-open-lbl');
  const closeBtn = document.getElementById('cc-assistant-close-btn');
  const chatWindow = document.getElementById('cc-assistant-chat-window');
  const messagesContainer = document.getElementById('cc-assistant-messages-container');
  const chatForm = document.getElementById('cc-assistant-chat-form');
  const textInput = document.getElementById('cc-assistant-text-input');
  const sendBtn = document.getElementById('cc-assistant-send-btn');
  const micBtn = document.getElementById('cc-assistant-mic-btn');

  let messages = [
    { role: 'assistant', text: 'Hi! I am the CrownCare AI Assistant. We officially launch on Google Play on May 1, 2026! You can secure your exclusive spot by joining the Waitlist at the top of this page. How can I help you transform your hair health today?' }
  ];
  let isListening = false;
  let recognition = null;

  // Initialize SpeechRecognition
  if (typeof window !== 'undefined') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        textInput.value = currentTranscript;
        updateSendButtonState();
      };

      recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('active');
      };
    }
  }

  // Pre-load synthesis voices
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  function toggleChat(open) {
    if (open) {
      chatWindow.classList.add('open');
      triggerDiv.style.display = 'none';
      scrollToBottom();
      textInput.focus();
    } else {
      chatWindow.classList.remove('open');
      triggerDiv.style.display = 'flex';
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  openBtn.addEventListener('click', () => toggleChat(true));
  openLbl.addEventListener('click', () => toggleChat(true));
  closeBtn.addEventListener('click', () => toggleChat(false));

  function updateSendButtonState() {
    if (textInput.value.trim()) {
      sendBtn.disabled = false;
      sendBtn.classList.add('active');
    } else {
      sendBtn.disabled = true;
      sendBtn.classList.remove('active');
    }
  }

  textInput.addEventListener('input', updateSendButtonState);

  // Speak Response Out Loud using TTS
  function speak(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      let premiumVoice = voices.find(v => 
        v?.name?.includes('Samantha') || 
        v?.name?.includes('Aria') || 
        v?.name?.includes('Jenny') || 
        v?.name?.includes('Zira') || 
        v?.name?.includes('Victoria') ||
        (v?.name?.includes('Google') && v?.name?.toLowerCase().includes('female'))
      );

      if (!premiumVoice) {
        premiumVoice = voices.find(v => v?.name?.toLowerCase().includes('female') && v?.lang?.startsWith('en'));
      }

      if (!premiumVoice) {
        premiumVoice = voices.find(v => 
          v?.lang?.startsWith('en') && 
          !v?.name?.toLowerCase().includes('male') && 
          !v?.name?.includes('David') && 
          !v?.name?.includes('Mark') && 
          !v?.name?.includes('Arthur')
        );
      }
                           
      if (premiumVoice) utterance.voice = premiumVoice;
      utterance.pitch = 1.15;
      utterance.rate = 1.15;
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Browser TTS error:", e);
    }
  }

  micBtn.addEventListener('click', () => {
    if (!recognition) {
      alert("Your browser does not support voice dictation.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        isListening = true;
        micBtn.classList.add('active');
      } catch (e) {
        console.error(e);
      }
    }
  });

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendMessage(role, text) {
    const msgWrapper = document.createElement('div');
    msgWrapper.className = `cc-assistant-msg-wrapper ${role}`;
    msgWrapper.innerHTML = `
      <div class="cc-assistant-msg">${text}</div>
    `;
    messagesContainer.appendChild(msgWrapper);
    scrollToBottom();
  }

  function appendTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'cc-assistant-typing-box';
    indicator.id = 'cc-assistant-typing-indicator';
    indicator.innerHTML = `
      <span class="cc-assistant-dot"></span>
      <span class="cc-assistant-dot"></span>
      <span class="cc-assistant-dot"></span>
    `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('cc-assistant-typing-indicator');
    if (indicator) indicator.remove();
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = textInput.value.trim();
    if (!query) return;

    textInput.value = '';
    updateSendButtonState();

    messages.push({ role: 'user', text: query });
    appendMessage('user', query);

    appendTypingIndicator();

    const chatHistoryForGemini = messages.filter((msg, index) => {
      if (index === 0 && msg.role === 'assistant') return false; 
      return true;
    }).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    try {
      const response = await fetch('https://us-central1-crowncare-116e4.cloudfunctions.net/marketingAssistantChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: chatHistoryForGemini })
      });

      const data = await response.json();
      removeTypingIndicator();

      if (data.response) {
        const aiText = data.response;
        messages.push({ role: 'assistant', text: aiText });
        appendMessage('assistant', aiText);
        speak(aiText);
      } else {
        throw new Error(data.error || "Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      removeTypingIndicator();
      appendMessage('assistant', "I'm having trouble connecting to my brain right now. Please verify your connection and try again.");
    }
  });

})();
