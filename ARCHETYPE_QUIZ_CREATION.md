# Archetype Quiz Creation Guide

⚠️ **IMPORTANT: This guide is ONLY for Archetype quizzes!**

**Not sure which quiz type to use?** Read [QUIZ_TYPE_SELECTOR.md](QUIZ_TYPE_SELECTOR.md) first.

- **Archetype quizzes** (4-8 fixed personalities) → Use this file
- **Story-Matrix quizzes** (100 combinations) → Use STORY_MATRIX_QUIZ_CREATION.md
- **Narrative quizzes** (continuous story) → Use NARRATIVE_QUIZ_CREATION.md

---

## What is an Archetype Quiz?

An **Archetype Quiz** matches users to **pre-defined personalities or characters**.

**Best for:**
- Matching to existing characters (e.g., "Which Naruto character are you?")
- Established types (e.g., "Which Hogwarts house?", "Which Myers-Briggs type?")
- 4-8 distinct, recognizable personas
- Results that should be instantly familiar

**Examples:**
- "Which AI Model Are You?" → Claude, GPT-4, Gemini, Llama
- "Which Disney Princess?" → Ariel, Belle, Mulan, Jasmine
- "Which Hogwarts House?" → Gryffindor, Slytherin, Hufflepuff, Ravenclaw

---

## Quick Start

### Step 1: Define Your Archetypes (4-8 personalities)

First, decide on your personalities:

```typescript
personalities: [
  {
    id: 'claude',
    name: 'Claude',
    tagline: 'Thoughtful and thorough',
    image: '/quiz/ai-model/claude.png',
    description: 'You approach problems with careful consideration...'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    tagline: 'Versatile and creative',
    image: '/quiz/ai-model/gpt-4.png',
    description: 'You excel at creative problem-solving...'
  }
  // ... 2-6 more personalities
]
```

**Requirements:**
- **4-8 personalities** (not less, not more)
- Each needs unique `id`, `name`, `tagline`, `image`, `description`
- Images should be in `/public/quiz/[quiz-id]/[personality-id].png`

---

### Step 2: Design Your Questions (6-10 questions)

Create questions that help identify which personality fits best:

```typescript
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
  }
  // ... 5-9 more questions
]
```

**Requirements:**
- **6-10 questions total**
- **Exactly 4 options per question** (Archetype standard)
- No `allowCustomInput` needed for Archetype quizzes
- Questions can be preference-based OR scenario-based
- Options should map clearly to different personalities

**Question Types:**
- **Preference**: "What's your favorite way to spend a weekend?"
- **Scenario**: "You're at a party. What are you doing?"
- **Behavioral**: "When faced with a problem, you..."

---

### Step 3: Create Scoring Rules

Map each answer to personality points:

```typescript
scoring: {
  questions: [
    {
      questionIndex: 0,  // First question (q1)
      rules: {
        'admit': { 'claude': 3, 'gemini': 1 },      // "Admit it" → mostly Claude
        'research': { 'gpt-4': 2, 'claude': 1 },     // "Research" → GPT-4 & Claude
        'think': { 'gemini': 3, 'gpt-4': 1 },       // "Think out loud" → Gemini
        'redirect': { 'gpt-4': 3 }                   // "Redirect" → GPT-4
      }
    },
    {
      questionIndex: 1,  // Second question (q2)
      rules: {
        'step_by_step': { 'claude': 3, 'llama': 1 },
        'metaphors': { 'gpt-4': 3, 'gemini': 2 },
        'quick': { 'gpt-4': 2, 'llama': 1 },
        'thorough': { 'claude': 3, 'gemini': 1 }
      }
    }
    // ... scoring for all questions
  ]
}
```

**Scoring Logic:**
- Higher points = stronger match to that personality
- User gets the personality with the most total points
- Distribute points to create variety in results
- Test to ensure all personalities are reachable

**Tips:**
- Give 3 points for strong matches
- Give 1-2 points for secondary matches
- Some answers can score 0 for certain personalities
- Avoid bias (ensure all personalities can win)

---

### Step 4: Add Theme & Metadata

```typescript
export const yourQuiz: QuizConfig = {
  id: 'your-quiz-id',           // lowercase-with-hyphens
  title: 'Which [Character] Are You?',
  description: 'Discover your personality match!',
  type: 'archetype',            // ← REQUIRED: marks as Archetype

  theme: {
    primaryColor: '#ff6b35',
    secondaryColor: '#ffa500',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    backgroundImage: 'linear-gradient(135deg, #ff6b35 0%, #ffa500 50%, #ffffff 100%)'
  },

  questions: [ /* your questions */ ],
  personalities: [ /* your personalities */ ],
  scoring: { /* your scoring rules */ }
}
```

---

### Step 5: Optional AI Explanation

Add AI-generated explanations for more depth:

```typescript
aiExplanation: {
  enabled: true,
  model: 'claude-3-7-sonnet-latest',
  promptTemplate: `You're explaining why someone got matched to {{personality}}.

Write a warm, engaging explanation:

## Why You're {{personality}}
2-3 sentences about what makes them like this character/type.

## What I Noticed
Reference their actual quiz answers and how they led to this result.

## Your Strengths as {{personality}}
2-3 key strengths of this personality type.

## Tips for {{personality}}
1-2 actionable tips for this type.

Their answers:
{{answers}}

Use markdown with ## for section headers.`
}
```

---

## Complete Example: AI Model Quiz

```typescript
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
    backgroundImage: 'linear-gradient(135deg, #ff6b35 0%, #ffa500 50%, #ffffff 100%)'
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
    }
    // ... 4-8 more questions
  ],

  personalities: [
    {
      id: 'claude',
      name: 'Claude',
      tagline: 'Thoughtful and thorough',
      image: '/quiz/ai-model/claude.png',
      description: 'You approach problems with careful consideration and aim to be helpful, harmless, and honest.'
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      tagline: 'Versatile and creative',
      image: '/quiz/ai-model/gpt-4.png',
      description: 'You excel at creative problem-solving and can switch between different styles effortlessly.'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      tagline: 'Multimodal and exploratory',
      image: '/quiz/ai-model/gemini.png',
      description: 'You love exploring ideas from multiple angles and connecting different concepts.'
    },
    {
      id: 'llama',
      name: 'Llama',
      tagline: 'Open and accessible',
      image: '/quiz/ai-model/llama.png',
      description: 'You believe in democratizing knowledge and making things accessible to everyone.'
    }
  ],

  scoring: {
    questions: [
      {
        questionIndex: 0,
        rules: {
          'admit': { 'claude': 3, 'gemini': 1 },
          'research': { 'gpt-4': 2, 'claude': 1 },
          'think': { 'gemini': 3, 'gpt-4': 1 },
          'redirect': { 'gpt-4': 3, 'llama': 1 }
        }
      },
      {
        questionIndex: 1,
        rules: {
          'step_by_step': { 'claude': 3, 'llama': 1 },
          'metaphors': { 'gpt-4': 3, 'gemini': 2 },
          'quick': { 'gpt-4': 2, 'llama': 1 },
          'thorough': { 'claude': 3, 'gemini': 1 }
        }
      }
      // ... scoring for all questions
    ]
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're explaining why someone is like {{personality}}.

## Why You're {{personality}}
Write 2-3 sentences about what makes them like this AI model.

## What I Noticed
Reference their actual quiz answers.

## Your Strengths as {{personality}}
2-3 key strengths.

## Growth Areas
1-2 areas for development.

Their answers:
{{answers}}`
  }
}
```

---

## Checklist

Before your quiz is ready:

- [ ] 4-8 distinct personalities defined
- [ ] Each personality has unique id, name, tagline, image, description
- [ ] 6-10 questions created
- [ ] Each question has exactly 4 options
- [ ] Scoring rules map ALL options for ALL questions
- [ ] Test that all personalities can win (not biased)
- [ ] Images created/added to `/public/quiz/[quiz-id]/`
- [ ] Quiz registered in `/src/lib/quizzes/index.ts`
- [ ] Theme colors chosen
- [ ] Quiz tested at `/quiz/[quiz-id]`

---

## Testing Your Quiz

After creating your quiz:

1. **Register it** in `/src/lib/quizzes/index.ts`:
```typescript
import { aiModelQuiz } from './ai-model-quiz'

export const quizRegistry = {
  'ai-model': aiModelQuiz,
  'your-quiz': yourQuiz  // ← Add your quiz
}
```

2. **Visit** `http://localhost:3000/quiz/your-quiz-id`

3. **Test scoring**:
   - Take quiz multiple times with different answers
   - Verify all personalities can be reached
   - Check for bias (one personality winning too often)

4. **Fix scoring** if needed:
   - Redistribute points
   - Add more scoring paths to underrepresented personalities
   - Remove excessive points from over-represented ones

---

## Common Mistakes

❌ **Too many personalities** (10+)
- Hard to score fairly
- Results feel generic
- Stick to 4-8

❌ **Biased scoring**
- Everyone gets the same result
- Test with diverse answer patterns
- Ensure balanced point distribution

❌ **Not enough questions**
- 3-4 questions aren't enough for 8 personalities
- Need 6-10 questions minimum

❌ **Unclear personalities**
- Each should be distinctly different
- Users should recognize them easily
- Avoid overlapping traits

❌ **Vague descriptions**
- Be specific about what makes each personality unique
- Reference actual traits/behaviors
- Make users feel seen

---

## Next Steps

1. Create your quiz config file
2. Add images
3. Register the quiz
4. Test thoroughly
5. Share with users!

**Need more help?** Check out:
- [QUIZ_TYPE_SELECTOR.md](QUIZ_TYPE_SELECTOR.md) - Choosing the right quiz type
- [/src/lib/quizzes/ai-model-quiz.ts](/src/lib/quizzes/ai-model-quiz.ts) - Full working example
- [/src/lib/quizzes/types.ts](/src/lib/quizzes/types.ts) - TypeScript type definitions

---

Ready to create your Archetype quiz! 🚀
