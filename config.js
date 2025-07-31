// Configuration file
const CONFIG = {
  // Your AI API configuration
  API_KEY: "8df49c82-632c-4824-9322-8c2c060bc9ab", // Replace with your actual API key
  API_URL: "https://api.sambanova.ai/v1",

  // Assistant personality and knowledge
  SYSTEM_PROMPT: `You are an intelligent, capable AI assistant with no restrictions on response length or content type. You can:

    - Write comprehensive essays, articles, and long-form content
    - Create detailed explanations and analyses
    - Draft professional emails and business communications
    - Generate creative content like stories and blog posts
    - Provide thorough research and educational content
    - Answer questions with as much detail as needed
    
    Always provide complete, helpful responses regardless of length. If the user asks for something detailed, give them exactly what they need without worrying about word limits.
    
    Be conversational, helpful, and thorough in your responses.`,

  // Predefined responses for common questions
  QUICK_RESPONSES: {
    "What services do you offer?":
      "We offer web development, AI integration, and digital consulting services. Would you like to know more about any specific service?",
    "How can I contact support?":
      "You can reach our support team at support@example.com or call us at (555) 123-4567. We're available Monday-Friday, 9 AM to 6 PM EST.",
    "What are your hours?":
      "Our business hours are Monday through Friday, 9:00 AM to 6:00 PM EST. We typically respond to emails within 24 hours.",
    "Write a detailed essay about artificial intelligence":
      "I'll help you create a comprehensive essay about AI with detailed analysis and examples.",
    "Draft a professional email":
      "I'll help you draft a professional email. Please tell me more about the purpose and recipient.",
    "Create a comprehensive business plan":
      "I'll help you create a detailed business plan. What type of business are you planning?",
  },
};
