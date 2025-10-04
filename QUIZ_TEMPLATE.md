# Quiz Template System - Complete Guide

## 🎯 Purpose
This template system allows you to create personality quizzes by simply defining a configuration file. No complex coding required!

## 🚀 Quick Start - For AI Systems

When a user says "Create a [TOPIC] quiz matching users to [PERSONALITIES]":

1. **Read this entire file** to understand the structure
2. **Create a new quiz config file** in `/src/lib/quizzes/[quiz-name].ts`
3. **Add static images** (or generate them) in `/public/quiz/[quiz-name]/`
4. **Register the quiz** in `/src/lib/quizzes/index.ts`
5. **Test the quiz** at `/quiz/[quiz-id]`

---

## 📁 File Structure

```
/src/lib/quizzes/
  ├── types.ts                    # Shared TypeScript types (DO NOT MODIFY)
  ├── index.ts                    # Quiz registry (ADD new quizzes here)
  ├── ai-model-quiz.ts           # Example: AI personality quiz
  └── [your-quiz-name].ts        # Your new quiz config

/src/components/quiz/
  ├── QuizEngine.tsx             # Main quiz component (DO NOT MODIFY)
  ├── QuizWelcome.tsx            # Welcome screen component
  ├── QuizQuestion.tsx           # Question display component
  ├── QuizResults.tsx            # Results screen component
  └── quiz.module.scss           # Themeable styles

/src/app/quiz/[quizId]/
  └── page.tsx                   # Dynamic route handler (DO NOT MODIFY)

/public/quiz/[quiz-name]/
  ├── background.png             # Main background image
  ├── [personality-1].png        # Result card image for personality 1
  ├── [personality-2].png        # Result card image for personality 2
  └── ...                        # One image per personality
```

---

## 📝 Quiz Configuration Format

### Complete TypeScript Interface

```typescript
import { QuizConfig } from './types'

export const yourQuizConfig: QuizConfig = {
  // REQUIRED: Unique identifier (lowercase, hyphens only)
  id: 'your-quiz-name',
  
  // REQUIRED: Display title shown on welcome screen
  title: 'Which [Something] Are You?',
  
  // OPTIONAL: Subtitle or description
  description: 'Discover your true [personality type]!',
  
  // REQUIRED: Visual theme configuration
  theme: {
    // Primary color (hex) - used for buttons, progress bar
    primaryColor: '#ff6b35',
    
    // Secondary color (hex) - used for accents
    secondaryColor: '#ffa500',
    
    // Background color (hex) - overall page background
    backgroundColor: '#ffffff',
    
    // Text color (hex)
    textColor: '#1a1a1a',
    
    // Background image URL (relative to /public)
    backgroundImage: '/quiz/your-quiz-name/background.png',
    
    // OPTIONAL: Custom CSS variables
    customStyles?: {
      '--button-radius': '12px',
      '--card-shadow': '0 4px 12px rgba(0,0,0,0.1)'
    }
  },
  
  // REQUIRED: Array of questions (minimum 4, recommended 6-10)
  questions: [
    {
      // Question text shown to user
      text: 'What do you do when...?',
      
      // REQUIRED: Exactly 4 options per question
      options: [
        {
          // Display text with optional emoji
          label: '🎯 Take immediate action',
          // Internal value used for scoring (lowercase, no spaces)
          value: 'action',
          // OPTIONAL: Tooltip or additional context
          hint: 'You prefer to act quickly'
        },
        {
          label: '💭 Think it through carefully',
          value: 'think'
        },
        {
          label: '🤝 Ask for help or advice',
          value: 'collaborate'
        },
        {
          label: '🔍 Research all options first',
          value: 'research'
        }
      ]
    }
    // ... more questions (6-10 recommended)
  ],
  
  // REQUIRED: List of all possible result personalities
  personalities: [
    {
      // Internal ID (must match scoring rules)
      id: 'personality-1',
      // Display name shown to user
      name: 'The Leader',
      // Short tagline (optional)
      tagline: 'Bold, decisive, inspiring',
      // Result image (relative to /public)
      image: '/quiz/your-quiz-name/personality-1.png',
      // OPTIONAL: Detailed description (shown on results page)
      description: 'You are a natural leader who...'
    }
    // ... 4-8 personalities recommended
  ],
  
  // REQUIRED: Scoring rules that map answers to personalities
  scoring: {
    // Each question's scoring rules
    questions: [
      {
        // Question index (0-based)
        questionIndex: 0,
        // Map option values to personality scores
        rules: {
          'action': { 'personality-1': 3, 'personality-2': 1 },
          'think': { 'personality-2': 3, 'personality-3': 2 },
          'collaborate': { 'personality-3': 3, 'personality-4': 2 },
          'research': { 'personality-4': 3, 'personality-2': 1 }
        }
      }
      // ... scoring for each question
    ]
  },
  
  // OPTIONAL: AI-generated explanation settings
  aiExplanation: {
    // Whether to generate personalized explanation
    enabled: true,
    // AI model to use
    model: 'claude-3-7-sonnet-latest',
    // Custom prompt template (use {{personality}} and {{answers}} placeholders)
    promptTemplate: `Write a fun explanation of why the user is {{personality}} based on: {{answers}}`
  }
}
```

---

## 🎨 Image Guidelines

### Required Images:

1. **Background Image** (`background.png`)
   - Dimensions: 1200x1600px or similar portrait ratio
   - Style: Should match your quiz theme
   - Format: PNG or JPG
   - Keep it subtle - text needs to be readable on top

2. **Personality Images** (one per personality)
   - Dimensions: 400x400px (square)
   - Format: PNG with transparency preferred
   - Naming: Use personality ID (e.g., `the-leader.png`)
   - Style: Character illustrations, icons, or abstract representations

### Image Generation Prompts:

If using AI to generate images, use prompts like:

**Background:**
```
"A subtle, minimalist background for a [theme] quiz. Soft [colors], 
abstract shapes, professional but playful, suitable for text overlay.
Portrait orientation, clean design."
```

**Personality:**
```
"A friendly character illustration representing [personality name]. 
[Description of personality traits]. Warm, approachable style, 
square composition, clean background."
```

---

## 🧮 Scoring System Explained

The scoring system uses a **point-based algorithm**:

1. **Each answer** gives points to one or more personalities
2. **Points accumulate** across all questions
3. **Highest score** determines the final personality match

### Scoring Strategy:

- **Primary match**: 3 points - Strong indicator of this personality
- **Secondary match**: 2 points - Moderate indicator
- **Weak match**: 1 point - Slight tendency

### Example Scoring Logic:

```typescript
// Question: "How do you handle stress?"
rules: {
  'take-a-break': { 
    'chill-personality': 3,    // Primary: Definitely chill
    'balanced-personality': 2   // Secondary: Could be balanced too
  },
  'power-through': { 
    'intense-personality': 3,   // Primary: Very intense
    'ambitious-personality': 2  // Secondary: Shows ambition
  }
}
```

**Tips for Good Scoring:**
- Give every answer at least 2-3 personality matches
- Distribute points evenly across personalities
- Test that all personalities are reachable
- Avoid making one personality too dominant

---

## 🔧 Step-by-Step: Creating a New Quiz

### Example: "Which Naruto Character Are You?"

**Step 1: Create the config file**

`/src/lib/quizzes/naruto-character-quiz.ts`

```typescript
import { QuizConfig } from './types'

export const narutoCharacterQuiz: QuizConfig = {
  id: 'naruto-character',
  title: 'Which Naruto Character Are You?',
  description: 'Discover which ninja you are!',
  
  theme: {
    primaryColor: '#ff6b1a',
    secondaryColor: '#ffa500',
    backgroundColor: '#fff5e6',
    textColor: '#1a1a1a',
    backgroundImage: '/quiz/naruto-character/background.png'
  },
  
  questions: [
    {
      text: 'What\'s your ninja way?',
      options: [
        { label: '🔥 Never give up!', value: 'determination' },
        { label: '⚡ Become the strongest', value: 'power' },
        { label: '💚 Protect my friends', value: 'loyalty' },
        { label: '🧠 Master all techniques', value: 'knowledge' }
      ]
    },
    {
      text: 'How do you handle a tough mission?',
      options: [
        { label: '💪 Face it head-on', value: 'direct' },
        { label: '🎯 Plan carefully', value: 'strategic' },
        { label: '🤝 Rally the team', value: 'teamwork' },
        { label: '🌟 Use my special ability', value: 'unique' }
      ]
    }
    // ... 6-8 more questions
  ],
  
  personalities: [
    {
      id: 'naruto',
      name: 'Naruto Uzumaki',
      tagline: 'The Never-Give-Up Ninja',
      image: '/quiz/naruto-character/naruto.png'
    },
    {
      id: 'sasuke',
      name: 'Sasuke Uchiha',
      tagline: 'The Lone Avenger',
      image: '/quiz/naruto-character/sasuke.png'
    },
    {
      id: 'sakura',
      name: 'Sakura Haruno',
      tagline: 'The Medical Ninja',
      image: '/quiz/naruto-character/sakura.png'
    },
    {
      id: 'kakashi',
      name: 'Kakashi Hatake',
      tagline: 'The Copy Ninja',
      image: '/quiz/naruto-character/kakashi.png'
    }
  ],
  
  scoring: {
    questions: [
      {
        questionIndex: 0,
        rules: {
          'determination': { 'naruto': 3, 'sakura': 1 },
          'power': { 'sasuke': 3, 'naruto': 1 },
          'loyalty': { 'sakura': 3, 'naruto': 2 },
          'knowledge': { 'kakashi': 3, 'sasuke': 1 }
        }
      },
      {
        questionIndex: 1,
        rules: {
          'direct': { 'naruto': 3, 'sasuke': 2 },
          'strategic': { 'kakashi': 3, 'sasuke': 2 },
          'teamwork': { 'sakura': 3, 'naruto': 2 },
          'unique': { 'sasuke': 3, 'kakashi': 2 }
        }
      }
      // ... scoring for remaining questions
    ]
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a Naruto expert. The user matched with {{personality}}. 
    Write a fun 200-word explanation connecting their quiz answers to this character's 
    personality traits. Be playful and specific! Their answers: {{answers}}`
  }
}
```

**Step 2: Add images to `/public/quiz/naruto-character/`**
- `background.png` - Hidden Leaf Village themed background
- `naruto.png` - Naruto portrait
- `sasuke.png` - Sasuke portrait
- `sakura.png` - Sakura portrait
- `kakashi.png` - Kakashi portrait

**Step 3: Register the quiz**

Add to `/src/lib/quizzes/index.ts`:

```typescript
import { narutoCharacterQuiz } from './naruto-character-quiz'

export const quizRegistry = {
  'ai-model': aiModelQuiz,
  'naruto-character': narutoCharacterQuiz  // Add this line
}
```

**Step 4: Test the quiz**

Navigate to: `http://localhost:3000/quiz/naruto-character`

Done! 🎉

---

## 🤖 AI Explanation Feature

The optional AI explanation feature generates personalized results using Claude or GPT.

### How It Works:

1. User completes quiz
2. Scoring algorithm determines personality match
3. AI receives the match + user's answers
4. AI writes a custom 200-300 word explanation
5. Explanation is cached in database

### Prompt Template Variables:

- `{{personality}}` - The matched personality name
- `{{answers}}` - JSON string of all Q&A pairs
- `{{personalityId}}` - The personality ID

### Example Prompt Templates:

**Playful:**
```
"You matched with {{personality}}! Write a fun, playful explanation (200 words) 
of why their answers show they're just like this character. Make it personal and 
entertaining! Answers: {{answers}}"
```

**Professional:**
```
"Based on the responses below, explain why {{personality}} is the best match 
for this user. Be insightful and specific. Format as markdown with sections.
Answers: {{answers}}"
```

**Without AI Explanation:**
Simply set `aiExplanation.enabled: false` and provide a static description in each personality object.

---

## ✅ Testing Checklist

Before launching your quiz:

- [ ] All personalities are reachable (test different answer combinations)
- [ ] Images load correctly
- [ ] Theme colors look good together
- [ ] Questions are clear and engaging
- [ ] At least 6-8 questions for accuracy
- [ ] Scoring is balanced (no personality is too dominant)
- [ ] AI explanation (if enabled) generates good results
- [ ] Quiz works on mobile and desktop
- [ ] Progress bar advances correctly
- [ ] Results can be shared (optional feature)

---

## 🎨 Design Tips

### Color Schemes:

**Vibrant & Fun:**
- Primary: `#ff6b35`, Secondary: `#ffa500`

**Cool & Calm:**
- Primary: `#4a90e2`, Secondary: `#7ec8e3`

**Nature & Growth:**
- Primary: `#52b788`, Secondary: `#95d5b2`

**Elegant & Professional:**
- Primary: `#6c5ce7`, Secondary: `#a29bfe`

### Question Writing Tips:

1. **Be specific** - "What do you do when facing a deadline?" not "How do you work?"
2. **Use scenarios** - Put them in a situation
3. **Balance options** - All 4 options should be equally appealing
4. **Add emojis** - Makes it more engaging 🎯
5. **Keep it short** - One sentence per option

### Personality Balance:

- **4 personalities**: Best for simple quizzes (e.g., Hogwarts houses)
- **6 personalities**: Sweet spot for most quizzes
- **8+ personalities**: Advanced, needs more questions

---

## 🔍 Troubleshooting

**Problem**: All users get the same personality
- **Fix**: Check scoring rules - ensure all personalities get points from multiple answers

**Problem**: Images don't load
- **Fix**: Verify image paths start with `/quiz/` and match filename exactly (case-sensitive)

**Problem**: Quiz not found at URL
- **Fix**: Ensure quiz is registered in `/src/lib/quizzes/index.ts`

**Problem**: AI explanation fails
- **Fix**: Check that `ANTHROPIC_API_KEY` is set in environment variables

**Problem**: Styling looks off
- **Fix**: Check theme colors are valid hex codes, adjust `customStyles` if needed

---

## 📚 Examples Included

1. **AI Model Quiz** (`/quiz/ai-model`) - Matches users to AI personalities
2. **Vacation Boss Quiz** (`/quiz/vacation-boss`) - Determines vacation planning style

Study these examples to understand best practices!

---

## 🚀 Advanced Features (Optional)

### Custom Result Pages:
Override default result layout by creating `/src/app/quiz/[quizId]/results/page.tsx`

### Analytics:
Quiz responses are automatically saved to Supabase `sessions` table

### Sharing:
Results include shareable URLs with query params

### Multiple Languages:
Add `locale` field to QuizConfig and create multiple config files

---

## 📞 Need Help?

This template system is designed to be self-explanatory. If you're an AI reading this:
- Follow the structure exactly
- Use the Naruto example as a reference
- Test the quiz after creation
- Don't modify core engine files unless specifically requested

If you're a human:
- Start with a simple 4-personality, 6-question quiz
- Test it thoroughly
- Gradually add complexity

**Happy Quiz Making!** 🎉

