class AIAssistant {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.currentMode = "chat";

    this.initializeElements();
    this.attachEventListeners();
    this.loadInitialMessage();
  }

  initializeElements() {
    this.chatToggle = document.getElementById("chat-toggle");
    this.chatWidget = document.getElementById("chat-widget");
    this.chatMessages = document.getElementById("chat-messages");
    this.chatInput = document.getElementById("chat-input");
    this.sendBtn = document.getElementById("send-btn");
  }

  attachEventListeners() {
    // Toggle chat widget
    this.chatToggle.addEventListener("click", () => this.toggleChat());

    // Send message on button click
    this.sendBtn.addEventListener("click", () => this.sendMessage());

    // Send message on Enter key (Shift+Enter for new line)
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.chatInput.addEventListener("input", () => this.autoResizeTextarea());

    // Quick action buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("quick-btn")) {
        const message = e.target.getAttribute("data-message");
        this.handleQuickAction(message);
      }

      // Email action buttons
      if (e.target.classList.contains("email-btn")) {
        const action = e.target.getAttribute("data-action");
        this.handleEmailAction(action);
      }

      // Content action buttons
      if (e.target.classList.contains("content-btn")) {
        const action = e.target.getAttribute("data-action");
        this.handleContentAction(action, e.target);
      }
    });
  }

  autoResizeTextarea() {
    this.chatInput.style.height = "auto";
    this.chatInput.style.height =
      Math.min(this.chatInput.scrollHeight, 200) + "px";
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.chatWidget.classList.toggle("active", this.isOpen);
    this.chatToggle.classList.toggle("active", this.isOpen);

    if (this.isOpen) {
      this.chatInput.focus();
    }
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // Check if user wants to write long-form content
    if (this.isLongFormRequest(message)) {
      this.handleLongFormContent(message);
      return;
    }

    // Check if user wants to draft an email
    if (this.isEmailRequest(message)) {
      this.handleEmailDrafting(message);
      return;
    }

    // Add user message
    this.addMessage(message, "user");
    this.chatInput.value = "";
    this.autoResizeTextarea();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Get AI response with no limits
      const response = await this.getUnlimitedAIResponse(message);
      this.hideTypingIndicator();
      this.addMessage(response, "bot");
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I'm having trouble connecting right now. Please try again or contact support.",
        "bot"
      );
      console.error("AI Response Error:", error);
    }
  }

  isLongFormRequest(message) {
    const longFormKeywords = [
      "write essay",
      "write article",
      "write story",
      "write blog",
      "essay about",
      "article about",
      "story about",
      "blog about",
      "write detailed",
      "write comprehensive",
      "write complete",
      "long explanation",
      "detailed analysis",
      "full report",
      "research paper",
      "case study",
      "white paper",
      "thesis",
      "write paragraph",
      "elaborate on",
      "explain in detail",
      "write review",
      "write summary",
      "write description",
    ];

    return (
      longFormKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword.toLowerCase())
      ) || message.length > 100
    ); // Also trigger for long user inputs
  }

  isEmailRequest(message) {
    const emailKeywords = [
      "draft email",
      "write email",
      "compose email",
      "send email",
      "email to",
      "write to",
      "draft a mail",
      "compose mail",
      "write a letter",
      "business email",
      "formal email",
    ];

    return emailKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async handleLongFormContent(userMessage) {
    this.addMessage(userMessage, "user");
    this.chatInput.value = "";
    this.autoResizeTextarea();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Generate long-form content
      const content = await this.generateLongFormContent(userMessage);
      this.hideTypingIndicator();
      this.displayLongFormContent(content, userMessage);
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I couldn't generate the content. Please try again.",
        "bot"
      );
      console.error("Long Form Content Error:", error);
    }
  }

  async generateLongFormContent(userRequest) {
    const longFormPrompt = `You are an expert writer capable of creating high-quality, comprehensive content. 
        
        User request: "${userRequest}"
        
        Instructions:
        - Write detailed, well-structured content
        - Use proper formatting with headings, subheadings, and paragraphs
        - Include relevant examples and explanations
        - Make it engaging and informative
        - Length should be appropriate for the request (can be 500-2000+ words)
        - Use markdown formatting for better readability
        - Be thorough and comprehensive
        
        Create the best possible content for this request without any word limits.`;

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: longFormPrompt },
        { role: "user", content: userRequest },
      ],
      max_tokens: 4000, // Increased from 150 to 4000
      temperature: 0.7,
    };

    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  displayLongFormContent(content, originalRequest) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message long-form-content";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    // Convert markdown-like formatting to HTML
    const formattedContent = this.formatContent(content);

    messageContent.innerHTML = `
            <div class="content-header">
                <h4>📝 Generated Content</h4>
                <span class="content-type">Long-form • ${this.getContentType(
                  originalRequest
                )}</span>
            </div>
            
            <div class="content-body">
                ${formattedContent}
            </div>
            
            <div class="content-actions">
                <button class="content-btn primary" data-action="copy">📋 Copy Content</button>
                <button class="content-btn secondary" data-action="expand">🔍 Expand Further</button>
                <button class="content-btn secondary" data-action="download">💾 Download as Text</button>
                <button class="content-btn secondary" data-action="rewrite">✏️ Rewrite Style</button>
            </div>
        `;

    messageDiv.appendChild(messageContent);
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  formatContent(content) {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/^# (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h4>$1</h4>")
      .replace(/^### (.*$)/gim, "<h5>$1</h5>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(.*)$/gim, function (match) {
        if (
          match.startsWith("<h") ||
          match.startsWith("<ul") ||
          match.startsWith("<li") ||
          match.trim() === ""
        ) {
          return match;
        }
        return `<p>${match}</p>`;
      })
      .replace(/(<p><\/p>)/g, "");
  }

  getContentType(request) {
    const lowerRequest = request.toLowerCase();
    if (lowerRequest.includes("essay")) return "Essay";
    if (lowerRequest.includes("article")) return "Article";
    if (lowerRequest.includes("story")) return "Story";
    if (lowerRequest.includes("blog")) return "Blog Post";
    if (lowerRequest.includes("report")) return "Report";
    if (lowerRequest.includes("analysis")) return "Analysis";
    if (lowerRequest.includes("review")) return "Review";
    return "Content";
  }

  async handleContentAction(action, button) {
    const contentElement = button.closest(".long-form-content");
    if (!contentElement) return;

    const contentBody = contentElement.querySelector(".content-body").innerText;

    switch (action) {
      case "copy":
        this.copyContentToClipboard(contentBody);
        break;
      case "expand":
        this.expandContent(contentBody);
        break;
      case "download":
        this.downloadContent(contentBody);
        break;
      case "rewrite":
        this.rewriteContent(contentBody);
        break;
    }
  }

  copyContentToClipboard(content) {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        this.showNotification("✅ Content copied to clipboard!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        this.showNotification("✅ Content copied to clipboard!");
      });
  }

  async expandContent(content) {
    const expandRequest = `Please expand and add more details to this content:

${content}

Add more examples, explanations, and depth while maintaining the same style and structure.`;

    this.addMessage("Please expand this content with more details", "user");
    this.showTypingIndicator();

    try {
      const expandedContent = await this.generateLongFormContent(expandRequest);
      this.hideTypingIndicator();
      this.displayLongFormContent(expandedContent, "Expanded content");
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I couldn't expand the content. Please try again.",
        "bot"
      );
    }
  }

  downloadContent(content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-generated-content-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.showNotification("📁 Content downloaded successfully!");
  }

  async rewriteContent(content) {
    const rewriteRequest = `Please rewrite this content in a different style while keeping the same information:

${content}

Make it more engaging, use different vocabulary, and improve the flow while maintaining the core message.`;

    this.addMessage("Please rewrite this content in a different style", "user");
    this.showTypingIndicator();

    try {
      const rewrittenContent = await this.generateLongFormContent(
        rewriteRequest
      );
      this.hideTypingIndicator();
      this.displayLongFormContent(rewrittenContent, "Rewritten content");
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I couldn't rewrite the content. Please try again.",
        "bot"
      );
    }
  }

  async handleEmailDrafting(userMessage) {
    this.addMessage(userMessage, "user");
    this.chatInput.value = "";
    this.autoResizeTextarea();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Get email draft from AI
      const emailDraft = await this.generateEmailDraft(userMessage);
      this.hideTypingIndicator();
      this.displayEmailDraft(emailDraft);
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I couldn't generate the email draft. Please try again.",
        "bot"
      );
      console.error("Email Draft Error:", error);
    }
  }

  async generateEmailDraft(userRequest) {
    const emailPrompt = `You are an expert email writer. Based on the user's request, create a professional email draft. 
        
        User request: "${userRequest}"
        
        Please provide the email in this exact JSON format:
        {
            "subject": "Email subject line",
            "recipient": "Suggested recipient or 'To be filled'",
            "body": "Email body content with proper formatting",
            "tone": "professional/casual/formal",
            "type": "business/personal/complaint/inquiry/etc"
        }
        
        Make the email well-structured, clear, and appropriate for the context. Length should be appropriate for the request.`;

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: emailPrompt },
        { role: "user", content: userRequest },
      ],
      max_tokens: 1500, // Increased for longer emails
      temperature: 0.7,
    };

    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      // Try to parse JSON response
      return JSON.parse(aiResponse);
    } catch (e) {
      // If not JSON, create a simple email structure
      return {
        subject: "Email Draft",
        recipient: "To be filled",
        body: aiResponse,
        tone: "professional",
        type: "general",
      };
    }
  }

  displayEmailDraft(emailData) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message email-draft";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    messageContent.innerHTML = `
            <div class="email-header">
                <h4>📧 Email Draft Generated</h4>
                <span class="email-tone">${emailData.tone} • ${emailData.type}</span>
            </div>
            
            <div class="email-fields">
                <div class="email-field">
                    <label><strong>To:</strong></label>
                    <input type="email" class="email-recipient" value="${emailData.recipient}" placeholder="Enter recipient email">
                </div>
                
                <div class="email-field">
                    <label><strong>Subject:</strong></label>
                    <input type="text" class="email-subject" value="${emailData.subject}">
                </div>
                
                <div class="email-field">
                    <label><strong>Message:</strong></label>
                    <textarea class="email-body" rows="12">${emailData.body}</textarea>
                </div>
            </div>
            
            <div class="email-actions">
                <button class="email-btn primary" data-action="copy">📋 Copy Email</button>
                <button class="email-btn secondary" data-action="edit">✏️ Edit & Refine</button>
                <button class="email-btn secondary" data-action="send">📤 Open in Email Client</button>
            </div>
        `;

    messageDiv.appendChild(messageContent);
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  handleEmailAction(action) {
    const emailDraft = document.querySelector(".email-draft:last-child");
    if (!emailDraft) return;

    const recipient = emailDraft.querySelector(".email-recipient").value;
    const subject = emailDraft.querySelector(".email-subject").value;
    const body = emailDraft.querySelector(".email-body").value;

    switch (action) {
      case "copy":
        this.copyEmailToClipboard(recipient, subject, body);
        break;
      case "edit":
        this.editEmailDraft(recipient, subject, body);
        break;
      case "send":
        this.openInEmailClient(recipient, subject, body);
        break;
    }
  }

  copyEmailToClipboard(recipient, subject, body) {
    const emailText = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;

    navigator.clipboard
      .writeText(emailText)
      .then(() => {
        this.showNotification("✅ Email copied to clipboard!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = emailText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        this.showNotification("✅ Email copied to clipboard!");
      });
  }

  async editEmailDraft(recipient, subject, body) {
    const editRequest = `Please improve and refine this email:
        
        To: ${recipient}
        Subject: ${subject}
        
        ${body}
        
        Make it more professional and compelling while keeping the core message.`;

    this.addMessage("Please refine this email draft", "user");
    this.showTypingIndicator();

    try {
      const improvedDraft = await this.generateEmailDraft(editRequest);
      this.hideTypingIndicator();
      this.displayEmailDraft(improvedDraft);
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I couldn't refine the email. Please try editing manually.",
        "bot"
      );
    }
  }

  openInEmailClient(recipient, subject, body) {
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    this.showNotification("📧 Opening in your email client...");
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  async handleQuickAction(message) {
    this.addMessage(message, "user");

    // Check for predefined responses first
    if (CONFIG.QUICK_RESPONSES[message]) {
      setTimeout(() => {
        this.addMessage(CONFIG.QUICK_RESPONSES[message], "bot");
      }, 500);
      return;
    }

    // Otherwise, get AI response
    this.showTypingIndicator();
    try {
      const response = await this.getUnlimitedAIResponse(message);
      this.hideTypingIndicator();
      this.addMessage(response, "bot");
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I'm having trouble right now. Please try again later.",
        "bot"
      );
    }
  }

  async getUnlimitedAIResponse(userMessage) {
    // Add to conversation history
    this.messages.push({ role: "user", content: userMessage });

    // Enhanced system prompt with no limitations
    const enhancedSystemPrompt = `You are an intelligent, capable AI assistant with no restrictions on response length or content type. You can:

        - Write comprehensive essays, articles, and long-form content
        - Create detailed explanations and analyses
        - Draft professional emails and business communications
        - Generate creative content like stories and blog posts
        - Provide thorough research and educational content
        - Answer questions with as much detail as needed
        
        Always provide complete, helpful responses regardless of length. If the user asks for something detailed, give them exactly what they need without worrying about word limits.
        
        Be conversational, helpful, and thorough in your responses.`;

    // Determine appropriate max_tokens based on request type
    let maxTokens = 2000; // Default higher limit

    const messageContent = userMessage.toLowerCase();
    if (
      messageContent.includes("essay") ||
      messageContent.includes("article") ||
      messageContent.includes("detailed") ||
      messageContent.includes("comprehensive")
    ) {
      maxTokens = 4000; // Much higher for long-form content
    }

    // Prepare API request
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: enhancedSystemPrompt },
        ...this.messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: maxTokens, // No more 150 word limit!
      temperature: 0.7,
    };

    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add to conversation history
    this.messages.push({ role: "assistant", content: aiResponse });

    return aiResponse;
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;

    // Add avatar
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "bot" ? "🤖" : "👤";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    // Format long content with proper line breaks
    const formattedContent = content.replace(/\n/g, "<br>");
    messageContent.innerHTML = formattedContent;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    this.chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-message typing-message";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "🤖";

    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingIndicator);
    this.chatMessages.appendChild(typingDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    const typingMessage = this.chatMessages.querySelector(".typing-message");
    if (typingMessage) {
      typingMessage.remove();
    }
  }

  loadInitialMessage() {
    // Enhanced initial greeting with unlimited capabilities
    const greeting = `Hi! 👋 I'm your unlimited AI assistant. I can help you with:

• **Write comprehensive essays and articles** (no word limits!)
• **Create detailed analyses and reports**
• **Draft professional emails and letters**
• **Generate creative stories and content**
• **Provide thorough explanations** on any topic
• **Research and educational content**

Try asking me to:
- "Write a 1000-word essay about climate change"
- "Create a detailed business plan"
- "Draft a comprehensive report on AI"
- "Write a complete story"

**No limits - I can write as much as you need!** 🚀`;

    this.addMessage(greeting, "bot");
    this.messages.push({
      role: "assistant",
      content: greeting,
    });
  }
}

// Initialize the AI Assistant when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AIAssistant();
});
