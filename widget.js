(function() {
  console.log("Widget script loaded");

  // Create and inject CSS
  const style = document.createElement('style');
  style.textContent = `
    .ai-chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    .ai-chat-icon {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .ai-chat-icon:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    .ai-chat-icon svg {
      width: 30px;
      height: 30px;
      fill: white;
    }
    .ai-chat-dialog {
      display: none;
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background-color: #ffffff;
      border-radius: 15px;
      box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
      flex-direction: column;
      overflow: hidden;
      padding-bottom: 10px; /* Add padding at the bottom */
    }
    .ai-chat-header {
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      color: white;
      padding: 15px 20px;
      font-weight: 600;
      font-size: 18px;
    }
    .ai-chat-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 20px;
      background-color: #f8f9fa;
      margin-bottom: 10px; /* Add margin at the bottom */
    }
    .ai-chat-input {
      display: flex;
      padding: 15px;
      background-color: #ffffff;
      align-items: center;
      border-top: 1px solid #e0e0e0;
      margin-bottom: 10px; /* Add margin at the bottom */
    }
    .ai-chat-input input {
      flex-grow: 1;
      border: none;
      outline: none;
      padding: 10px 15px;
      border-radius: 20px;
      font-size: 14px;
      background-color: #f1f3f4;
    }
    .ai-chat-input button {
      background-color: transparent;
      border: none;
      cursor: pointer;
      padding: 0 10px;
    }
    .ai-chat-input button svg {
      width: 24px;
      height: 24px;
      fill: #6e8efb;
      transition: fill 0.3s ease;
    }
    .ai-chat-input button:hover svg {
      fill: #a777e3;
    }
    .ai-chat-message {
      margin-bottom: 15px;
      padding: 10px 15px;
      border-radius: 18px;
      max-width: 80%;
      line-height: 1.4;
      font-size: 14px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .ai-chat-message.user {
      background-color: #e1f5fe;
      align-self: flex-end;
      margin-left: auto;
    }
    .ai-chat-message.ai {
      background-color: #ffffff;
      align-self: flex-start;
      border: 1px solid #e0e0e0;
    }
    .typing-indicator {
      display: flex;
      padding: 10px 15px;
      border-radius: 18px;
      background-color: #ffffff;
      align-self: flex-start;
      margin-bottom: 15px;
      border: 1px solid #e0e0e0;
    }
    .typing-indicator span {
      height: 8px;
      width: 8px;
      background-color: #6e8efb;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
      animation: typing 1s infinite ease-in-out;
    }
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes typing {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0px); }
    }
    .ai-chat-powered-by {
      position: absolute;
      bottom: 10px; /* Increase distance from bottom */
      right: 15px;
      font-size: 12px; /* Increase font size */
      color: #888;
      font-style: italic;
    }
    .ai-chat-powered-by strong {
      font-weight: 600;
      color: #6e8efb;
    }
  `;
  document.head.appendChild(style);

  // Create chat widget elements
  const widget = document.createElement('div');
  widget.className = 'ai-chat-widget';
  widget.innerHTML = `
    <div class="ai-chat-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    </div>
    <div class="ai-chat-dialog">
      <div class="ai-chat-header">Stealth Chat</div>
      <div class="ai-chat-messages"></div>
      <div class="ai-chat-input">
        <input type="text" placeholder="Type your message...">
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <div class="ai-chat-powered-by">Powered by <strong>Stealth</strong></div>
    </div>
  `;

  document.body.appendChild(widget);

  // Get DOM elements
  const chatIcon = widget.querySelector('.ai-chat-icon');
  const chatDialog = widget.querySelector('.ai-chat-dialog');
  const chatMessages = widget.querySelector('.ai-chat-messages');
  const chatInput = widget.querySelector('.ai-chat-input input');
  const chatSendButton = widget.querySelector('.ai-chat-input button');

  // Chat state
  let isOpen = false;
  let chatTurns = [];

  // Toggle chat dialog
  chatIcon.addEventListener('click', () => {
    isOpen = !isOpen;
    chatDialog.style.display = isOpen ? 'flex' : 'none';
  });

  // Send message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      addMessage('user', message);
      chatInput.value = '';
      chatTurns.push({ type: 'user', text: message });
      sendChatToAPI();
    }
  }

  chatSendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Add message to chat
  function addMessage(type, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `ai-chat-message ${type}`;
    messageElement.innerHTML = formatMessage(text);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Format message with bold text and line breaks
  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // Add typing indicator
  function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  // Remove typing indicator
  function removeTypingIndicator(indicator) {
    chatMessages.removeChild(indicator);
  }

  // Send chat to API
  async function sendChatToAPI() {
    const typingIndicator = addTypingIndicator();
    try {
      const response = await fetch('http://34.100.222.93:1000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ turns: chatTurns }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.response;
      removeTypingIndicator(typingIndicator);
      addMessage('ai', aiResponse);
      chatTurns.push({ type: 'ai', text: aiResponse });
    } catch (error) {
      console.error('Error sending chat to API:', error);
      removeTypingIndicator(typingIndicator);
      addMessage('ai', 'Sorry, there was an error processing your request.');
    }
  }

  console.log("Widget initialization complete");
})();
