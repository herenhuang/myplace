import { QuizConfig } from './types'

export const aiModelQuiz: QuizConfig = {
  id: 'ai-model',
  title: 'Which AI Model Are You?',
  description: 'Discover which AI personality matches yours!',
  type: 'archetype',
  
  theme: {
    primaryColor: '#ff6b35',
    secondaryColor: '#ffa500',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    backgroundImage: '/elevate/orange.png'
  },
  
  questions: [
    {
      id: 'q1',
      text: "Someone asks you a question you don't know the answer to. What do you do?",
      options: [
        { label: "🤔 Admit it right away", value: "admit" },
        { label: "🔍 Research it immediately", value: "research" },
        { label: "💭 Think out loud and explore possibilities", value: "think" },
        { label: "🎯 Redirect to what I DO know", value: "redirect" }
      ]
    },
    {
      id: 'q2',
      text: "You're explaining something complex. How do you approach it?",
      options: [
        { label: "📊 Break it into clear steps", value: "step-by-step" },
        { label: "🎨 Use metaphors and stories", value: "metaphors" },
        { label: "⚡ Get to the point fast", value: "quick" },
        { label: "🔬 Cover every detail thoroughly", value: "thorough" }
      ]
    },
    {
      id: 'q3',
      text: "Someone disagrees with you. Your instinct?",
      options: [
        { label: "🤝 Find common ground first", value: "common ground" },
        { label: "📚 Cite sources and facts", value: "cite facts" },
        { label: "💡 Explore why they see it differently", value: "explore" },
        { label: "⚖️ Acknowledge both sides have merit", value: "both sides" }
      ]
    },
    {
      id: 'q4',
      text: "You have a creative project. Where do you start?",
      options: [
        { label: "🎯 Define the goal clearly", value: "define" },
        { label: "🌊 Just dive in and see what happens", value: "just start" },
        { label: "📋 Make a plan first", value: "plan" },
        { label: "🔄 Try multiple approaches at once", value: "multiple" }
      ]
    },
    {
      id: 'q5',
      text: "How do you handle mistakes?",
      options: [
        { label: "🔍 Analyze what went wrong", value: "analyze" },
        { label: "⚡ Fix it and move on quickly", value: "fix" },
        { label: "💬 Explain what happened transparently", value: "explain" },
        { label: "🎓 Turn it into a learning moment", value: "learn" }
      ]
    },
    {
      id: 'q6',
      text: "Someone needs help at midnight. What's your response?",
      options: [
        { label: "🌙 I'm always available", value: "always" },
        { label: "⏰ Set boundaries - tomorrow works", value: "boundaries" },
        { label: "🤔 Depends on the urgency", value: "depends" },
        { label: "📝 Send resources they can use now", value: "resources" }
      ]
    },
    {
      id: 'q7',
      text: "You're given an impossible deadline. How do you react?",
      options: [
        { label: "🏃 Push hard to meet it anyway", value: "push" },
        { label: "💬 Negotiate for more time", value: "negotiate" },
        { label: "🎯 Prioritize what matters most", value: "prioritize" },
        { label: "🤝 Ask for help or resources", value: "help" }
      ]
    },
    {
      id: 'q8',
      text: "What's most important to you in your work?",
      options: [
        { label: "✨ Being creative and innovative", value: "creativity" },
        { label: "🎯 Being accurate and reliable", value: "accuracy" },
        { label: "⚡ Being fast and efficient", value: "speed" },
        { label: "🤝 Being helpful and accessible", value: "helpfulness" }
      ]
    }
  ],
  
  personalities: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      tagline: 'Creative, versatile, and diplomatic',
      image: '/quiz/ai-model/gpt-4.png'
    },
    {
      id: 'claude',
      name: 'Claude',
      tagline: 'Thoughtful, detailed, and methodical',
      image: '/quiz/ai-model/claude.png'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      tagline: 'Multimodal, flexible, and curious',
      image: '/quiz/ai-model/gemini.png'
    },
    {
      id: 'llama',
      name: 'Llama',
      tagline: 'Community-oriented and collaborative',
      image: '/quiz/ai-model/llama.png'
    },
    {
      id: 'mistral',
      name: 'Mistral',
      tagline: 'Fast, efficient, and focused',
      image: '/quiz/ai-model/mistral.png'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      tagline: 'Research-focused and fact-driven',
      image: '/quiz/ai-model/perplexity.png'
    },
    {
      id: 'grok',
      name: 'Grok',
      tagline: 'Witty, spontaneous, and bold',
      image: '/quiz/ai-model/grok.png'
    },
    {
      id: 'gpt-3.5',
      name: 'GPT-3.5',
      tagline: 'Helpful, accessible, and reliable',
      image: '/quiz/ai-model/gpt-3-5.png'
    }
  ],
  
  scoring: {
    questions: [
      {
        questionIndex: 0,
        rules: {
          'admit': { 'claude': 3, 'gpt-4': 2 },
          'research': { 'perplexity': 3, 'claude': 2 },
          'think': { 'gpt-4': 3, 'gemini': 2 },
          'redirect': { 'grok': 3, 'gpt-3.5': 2 }
        }
      },
      {
        questionIndex: 1,
        rules: {
          'step-by-step': { 'claude': 3, 'gpt-4': 2 },
          'metaphors': { 'gpt-4': 3, 'gemini': 2 },
          'quick': { 'mistral': 3, 'gpt-3.5': 2 },
          'thorough': { 'claude': 3, 'perplexity': 2 }
        }
      },
      {
        questionIndex: 2,
        rules: {
          'common ground': { 'gpt-4': 3, 'gemini': 2 },
          'cite facts': { 'perplexity': 3, 'claude': 2 },
          'explore': { 'gpt-4': 3, 'gemini': 2 },
          'both sides': { 'claude': 3, 'gpt-4': 2 }
        }
      },
      {
        questionIndex: 3,
        rules: {
          'define': { 'claude': 3, 'mistral': 2 },
          'just start': { 'grok': 3, 'llama': 2 },
          'plan': { 'claude': 3, 'gpt-4': 2 },
          'multiple': { 'gemini': 3, 'gpt-4': 2 }
        }
      },
      {
        questionIndex: 4,
        rules: {
          'analyze': { 'claude': 3, 'perplexity': 2 },
          'fix': { 'mistral': 3, 'gpt-3.5': 2 },
          'explain': { 'claude': 3, 'gpt-4': 2 },
          'learn': { 'gpt-4': 3, 'llama': 2 }
        }
      },
      {
        questionIndex: 5,
        rules: {
          'always': { 'gpt-3.5': 3, 'llama': 2 },
          'boundaries': { 'claude': 3, 'mistral': 2 },
          'depends': { 'gpt-4': 3, 'gemini': 2 },
          'resources': { 'perplexity': 3, 'gpt-4': 2 }
        }
      },
      {
        questionIndex: 6,
        rules: {
          'push': { 'mistral': 3, 'gpt-3.5': 2 },
          'negotiate': { 'gpt-4': 3, 'claude': 2 },
          'prioritize': { 'claude': 3, 'gpt-4': 2 },
          'help': { 'llama': 3, 'gemini': 2 }
        }
      },
      {
        questionIndex: 7,
        rules: {
          'creativity': { 'gpt-4': 3, 'gemini': 2 },
          'accuracy': { 'claude': 3, 'perplexity': 2 },
          'speed': { 'mistral': 3, 'gpt-3.5': 2 },
          'helpfulness': { 'gpt-4': 3, 'llama': 2 }
        }
      }
    ]
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're an expert in AI models. The user has been matched to {{personality}} based on their behavioral patterns. Write a personalized explanation of why they match this specific model.

# User's Responses:
{{answers}}

# Matched Model: {{personality}}

# Instructions:
Write a 200-300 word explanation connecting their specific choices to {{personality}}'s personality and characteristics.

Structure:
# Why You're {{personality}}

[2-3 sentences connecting their choices to {{personality}}'s core traits]

## Your Style Matches {{personality}}

- When you [specific choice they made], that's {{personality}} energy because [why]
- You [another specific choice], which matches how {{personality}} works: [insight]
- [Another choice-to-model connection]

## What This Means

[2-3 sentences about what this reveals - positive and insightful]

**Fun Fact**: [One interesting {{personality}} trait that matches their answers]

Make it personal, playful, and specific to their actual choices!`
  }
}

