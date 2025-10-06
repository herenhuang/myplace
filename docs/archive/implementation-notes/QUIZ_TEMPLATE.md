# Quiz Template System - Complete Guide

## 🎯 Purpose
This template system allows you to create personality quizzes by simply defining a configuration file. No complex coding required!

## 🚀 Quick Start - For AI Systems

When a user says "Create a [TOPIC] quiz":

1. **Decide quiz type**: Read `QUIZ_TYPE_SELECTOR.md` to choose between:
   - **Archetype Quiz**: Fixed personalities (4-8 results)
   - **Story-Matrix Quiz**: Dynamic combinations (100 results)
2. **Read the relevant section** of this file for your chosen type
3. **For Story-Matrix**: Also read `STORY_MATRIX_QUIZ_CREATION.md`
4. **Create a new quiz config file** in `/src/lib/quizzes/[quiz-name].ts`
5. **Add static images** (or generate them) in `/public/quiz/[quiz-name]/`
6. **Register the quiz** in `/src/lib/quizzes/index.ts`
7. **Test the quiz** at `/quiz/[quiz-id]`

### ⚠️ CRITICAL RULES FOR STORY-MATRIX QUIZZES:
- **EXACTLY 3 options per question** (no more, no less)
- **ALWAYS set `allowCustomInput: true`** on every single question
- **8-10 total questions** (not more, not less)
- **Scenario-based questions** that show what someone DOES (not preference questions)

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
    primaryColor: '#8b7355',
    
    // Secondary color (hex) - used for accents
    secondaryColor: '#c9b8a3',
    
    // Background color (hex) - overall page background
    backgroundColor: '#fafafa',
    
    // Text color (hex)
    textColor: '#2c2c2c',
    
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
      
      // REQUIRED: Exactly 4 options per question (ARCHETYPE type only)
      // Note: Story-matrix type uses 3 options + custom input instead
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
    primaryColor: '#8b7355',
    secondaryColor: '#c9b8a3',
    backgroundColor: '#fafafa',
    textColor: '#2c2c2c',
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

**Neutral & Universal (Default):**
- Primary: `#8b7355`, Secondary: `#c9b8a3`, Background: `#fafafa`, Text: `#2c2c2c`

**Minimal Gray:**
- Primary: `#6b7280`, Secondary: `#9ca3af`, Background: `#f9fafb`, Text: `#1f2937`

**Vibrant & Fun:**
- Primary: `#ff6b35`, Secondary: `#ffa500`, Background: `#fff5e6`, Text: `#1a1a1a`

**Cool & Calm:**
- Primary: `#4a90e2`, Secondary: `#7ec8e3`, Background: `#f0f9ff`, Text: `#1e3a8a`

**Nature & Growth:**
- Primary: `#52b788`, Secondary: `#95d5b2`, Background: `#f0fdf4`, Text: `#14532d`

**Elegant & Professional:**
- Primary: `#6c5ce7`, Secondary: `#a29bfe`, Background: `#faf5ff`, Text: `#4c1d95`

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

## 📚 Quiz Types & Examples

### Type 1: **Archetype Quiz** (Fixed Personalities)
- **Example**: AI Model Quiz (`/quiz/ai-model`)
- **Best for**: Matching to predefined characters/types (e.g., Harry Potter houses, Naruto characters)
- **How it works**: 4-8 fixed personalities, point-based scoring
- **Question format**: 4 options per question, no custom input typically
- **Questions**: Can be preference-based or scenario-based

### Type 2: **Story-Matrix Quiz** (Dynamic Combinations)
- **Example**: Vacation Style Quiz (`/quiz/vacation-style`)
- **Best for**: Open-ended personality discovery with 100+ possible outcomes
- **How it works**: 10x10 word matrix = 100 unique combinations generated by AI
- **Question format**: EXACTLY 3 options + custom input on EVERY question
- **Questions**: MUST be scenario-based showing actual ACTIONS (not preferences)

Study these examples to understand best practices!

---

## 🌟 STORY-MATRIX QUIZZES - Complete Guide

*Use this for quizzes where you want dynamic, AI-generated results with hundreds of combinations!*

### What Makes Story-Matrix Different?

Instead of 4-8 fixed personalities, you create:
- **10 First Words** (descriptors: HOW they do things)
- **10 Second Words** (priorities: WHAT matters to them)
- **= 100 possible combinations** (e.g., "Bold Foodie", "Cautious Planner", "Social Nature Lover")

### Story-Matrix Template

```typescript
import { QuizConfig } from './types'

export const yourStoryQuiz: QuizConfig = {
  id: 'your-story-quiz',
  title: 'What\'s Your [Topic] Style?',
  description: 'Discover your unique approach!',
  type: 'story-matrix',  // ← KEY DIFFERENCE
  
  theme: {
    primaryColor: '#8b7355',      // Neutral brown
    secondaryColor: '#c9b8a3',    // Neutral tan
    backgroundColor: '#fafafa',   // Neutral light gray
    textColor: '#2c2c2c',         // Neutral dark gray
    backgroundImage: '/quiz/your-story-quiz/background.png'
  },
  
  // CRITICAL: Design 8-10 questions that map to your word matrix dimensions
  // Each question must be SCENARIO-BASED showing what someone DOES (not preferences)
  // MANDATORY: EXACTLY 3 options + allowCustomInput: true on EVERY question
  questions: [
    {
      id: 'q1',  // ← All questions need IDs for story-matrix
      text: 'You just booked a trip departing in 3 months. What happens next?',  // ← SCENARIO, not "How do you..."
      options: [  // ← EXACTLY 3 OPTIONS (not 2, not 4, EXACTLY 3)
        { label: 'Start a detailed spreadsheet with plans', value: 'structured_planner' },  // ← ACTION they take
        { label: 'Book the flight and wing the rest', value: 'spontaneous_free' },  // ← What they DO
        { label: 'Browse blogs but keep it loose', value: 'flexible_balance' }  // ← Observable behavior
      ],
      allowCustomInput: true  // ← MANDATORY: Must be true on ALL questions
    },
    {
      id: 'q2',
      text: 'It\'s day 2 of your trip, 2pm. Where do we find you?',  // ← Concrete scenario
      options: [
        { label: 'Trying the #1 rated restaurant from my list', value: 'quality' },  // ← Specific action
        { label: 'At a food stall that locals recommended', value: 'authentic' },
        { label: 'Still at the hostel chatting with new friends', value: 'social' }
      ],
      allowCustomInput: true
    }
    // ... 6-8 more SCENARIO questions (8-10 total)
    // Each question = a SITUATION that reveals behavior patterns
  ],
  
  // NO personalities array for story-matrix - it's generated!
  
  // Define your 10x10 word matrix
  wordMatrix: {
    // 10 DISTINCT first words (HOW they do things)
    firstWords: [
      'Spontaneous',    // Wing it, no plans
      'Structured',     // Everything organized
      'Social',         // People-focused
      'Independent',    // Prefers solo
      'Flexible',       // Adapts easily
      'Decisive',       // Quick decisions
      'Relaxed',        // Low-key, chill
      'Energetic',      // High energy, go-go
      'Cautious',       // Safety first
      'Bold'            // Takes risks
    ],
    // 10 DISTINCT second words (WHAT they prioritize)
    secondWords: [
      'Planner',        // Itineraries & lists
      'Free Spirit',    // No schedule
      'Connector',      // Makes friends everywhere
      'Soloist',        // Happy alone
      'Foodie',         // All about eating
      'Culture Seeker', // Museums & history
      'Nature Lover',   // Outdoors & hiking
      'Comfort Seeker', // Nice hotels & spas
      'Budgeteer',      // Frugal & savvy
      'Photographer'    // Documenting everything
    ],
    
    // AI prompt to select best word combination
    selectionPrompt: \`You are analyzing a [topic expert]. 

Your task: Select ONE combination of words that best captures this person.

Available words:
FIRST WORDS (descriptors): {{firstWords}}
SECOND WORDS (priorities): {{secondWords}}

User's answers:
{{answers}}

Instructions:
1. Consider the full story their answers tell
2. Choose the FIRST WORD that describes their approach
3. Choose the SECOND WORD that describes what they prioritize
4. Each word is DISTINCT - there's clear daylight between them
5. All words are positive - find the best match
6. Also identify 2 alternative combinations they were close to

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, evocative subtitle that makes them feel SEEN (e.g., 'You've got 3 backup plans for your backup plans' or 'Everyone knows you before they ask')",
  "reasoning": "2-3 sentence explanation. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason"}
  ]
}

IMPORTANT: Do NOT make up names like "Natural Explorer". Only use exact words from the lists provided.\`
  },
  
  // AI explanation configuration
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: \`You're a [topic] expert analyzing someone's [topic] style. They are a "{{archetype}}" - {{tagline}}.

Write a warm, engaging explanation with these sections:

## Your [Topic] DNA
Start with "As {{archetype}}, you..." and write 2-3 sentences about their core approach. Make sure the description aligns with their tagline: "{{tagline}}". Reference their actual quiz answers.

## What I Noticed
Highlight 2-3 specific patterns from their actual answers that show they're {{archetype}}:
- When they answered [specific answer], that shows [insight about {{archetype}}]
- Their choice of [specific answer] reveals [trait]
- [Another answer-to-trait connection]

## You Were Also Close To...
{{alternatives}}

Write 1 engaging sentence for each alternative style explaining why they showed hints of it.

## Tips for Your Next [Activity]
Give 1-2 practical tips for {{archetype}}. Format: "As {{archetype}}, you should..."

## Where This Takes You
End with an inspiring sentence about their next adventure as {{archetype}}.

Their answers:
{{answers}}

Use "{{archetype}}" consistently throughout. Be personal and energetic. Use markdown with ## for headers.\`
  }
}
```

---

## 🎯 Story-Matrix: Question Design Strategy

**CRITICAL**: Each question must:
1. **Present a SCENARIO** (not ask about preferences)
2. **Show ACTIONS** (what they DO, not what they think)
3. **Map to specific word dimensions**

### Question Structure (8-10 questions):

**Q1: Planning Style**
- Maps to: Planner vs Free Spirit
- ❌ BAD: "How do you prepare for a trip?"
- ✅ GOOD: "You just booked a trip in 3 months. What happens next?"
  - Options: "Start detailed spreadsheet" / "Book flight, wing the rest" / "Browse blogs casually"

**Q2: Core Priority** 
- Maps to: Foodie / Nature Lover / Culture Seeker / Comfort Seeker
- ❌ BAD: "What's most important to you?"
- ✅ GOOD: "It's day 2, 2pm. Where are we finding you?"
  - Options: "At the #1 rated restaurant" / "Hiking trail 10 miles out" / "Museum closing tour"

**Q3: Social Orientation**
- Maps to: Social/Connector vs Independent/Soloist
- ❌ BAD: "Do you like meeting new people?"
- ✅ GOOD: "You're at a hostel common area. Someone's cooking. What do you do?"
  - Options: "Ask if I can help and chat" / "Smile but stay on my phone" / "Join if they invite me"

**Q4: Energy Level**
- Maps to: Energetic vs Relaxed
- ❌ BAD: "What's your ideal pace?"
- ✅ GOOD: "Vacation day 3, 7am. Your alarm goes off. What happens?"
  - Options: "Up and out by 7:30am" / "Snooze until I feel like it" / "Depends on what's planned"

**Q5: Budget Consciousness**
- Maps to: Budgeteer vs Comfort Seeker
- ❌ BAD: "How do you handle money?"
- ✅ GOOD: "Booking lodging: $200 boutique hotel vs $40 hostel. You choose..."
  - Options: "Boutique - treat myself" / "Hostel - save for more trips" / "Depends on the trip"

**Q6: Risk Tolerance**
- Maps to: Bold vs Cautious
- ❌ BAD: "Are you adventurous?"
- ✅ GOOD: "A local offers to take you to their 'secret spot'. Your response?"
  - Options: "Let's go right now!" / "Can I look it up first?" / "Thanks, I'll stick to my plan"

**Q7: Adaptability**
- Maps to: Decisive vs Flexible vs Structured
- ❌ BAD: "How do you handle changes?"
- ✅ GOOD: "Flight cancelled. Stuck here 2 extra days. First reaction?"
  - Options: "Immediately rebook everything" / "Guess I'm exploring more!" / "Annoyed - this wasn't the plan"

**Q8: Success Criteria**
- Maps to: Photographer / Comfort Seeker / Culture Seeker
- ❌ BAD: "What makes a trip successful?"
- ✅ GOOD: "Last day of the trip. What makes you say 'that was perfect'?"
  - Options: "Amazing photos for memories" / "Feeling totally recharged" / "Authentic local experiences"

**The key: SITUATION → WHAT DO YOU DO → reveals who they are**

---

## ⚡ Story-Matrix: Word Selection Rules

### Creating Your 10 First Words:

✅ **GOOD** - Clearly distinct approaches:
- Spontaneous (no plans)
- Structured (everything organized)
- Social (people first)
- Independent (solo preferred)

❌ **BAD** - Too similar:
- Adventurous / Bold / Daring (all mean same thing)
- Explorer / Wanderer / Voyager (no clear difference)

### Creating Your 10 Second Words:

✅ **GOOD** - Clearly distinct priorities:
- Foodie (all about eating)
- Nature Lover (outdoors/hiking)
- Culture Seeker (museums/history)
- Budgeteer (frugal travel)

❌ **BAD** - Overlapping:
- Explorer / Adventurer / Wanderer (same vibe)
- Planner / Organizer / Strategist (too similar)

### The Test:
Ask yourself: "Could someone be BOTH of these at the same time?"
- If YES → they're too similar, pick one
- If NO → perfect, they're distinct!

---

## 🚨 Common Story-Matrix Mistakes

### Mistake #1: AI Makes Up Names
**Problem**: User gets "Energetic Nature Lover" but explanation says "You're a Natural Explorer"

**Fix**: Use our strict prompt template with ⚠️ warnings and penalties

### Mistake #2: Questions Don't Map to Dimensions
**Problem**: All 8 questions about planning, none about social/budget/energy

**Fix**: Ensure each question targets a DIFFERENT dimension from your matrix

### Mistake #3: Words Aren't Distinct Enough
**Problem**: "Explorer" vs "Adventurer" vs "Wanderer" - users can't tell difference

**Fix**: Use the contrast test - they should be OBVIOUSLY different

### Mistake #4: Not Enough Questions
**Problem**: Only 5 questions can't distinguish 100 combinations

**Fix**: Minimum 8 questions, each targeting specific dimensions

---

## 🔀 Story-Matrix: Branching Logic (Optional)

Want questions to adapt based on previous answers? Add branching!

### How Branching Works:

1. Add `nextQuestionId` to specific options
2. Questions flow based on user choices
3. AI analyzes custom inputs to determine next question

### Example with Branching:

```typescript
questions: [
  {
    id: 'q1',
    text: 'You're planning a trip. What's your first move?',
    options: [
      { 
        label: 'Book everything NOW', 
        value: 'early_planner',
        nextQuestionId: 'q_planner_deep'  // ← Go to planner questions
      },
      { 
        label: 'See what happens when I get there', 
        value: 'spontaneous',
        nextQuestionId: 'q_spontaneous_deep'  // ← Go to spontaneous questions
      },
      { 
        label: 'Mix of both', 
        value: 'flexible'
        // No nextQuestionId → continues to next question in array
      }
    ],
    allowCustomInput: true  // Custom answers use AI to determine next question
  },
  {
    id: 'q_planner_deep',  // This is for planners
    text: 'How detailed is your itinerary?',
    options: [
      { label: 'Hour-by-hour schedule', value: 'super_detailed' },
      { label: 'Just the big things', value: 'loose_plan' },
      { label: 'Reservations only', value: 'minimal_plan' }
    ],
    allowCustomInput: true
  },
  {
    id: 'q_spontaneous_deep',  // This is for spontaneous folks
    text: 'No plans - exciting or scary?',
    options: [
      { label: 'Totally exciting!', value: 'loves_chaos' },
      { label: 'Exciting but need a safety net', value: 'flexible_spontaneous' },
      { label: 'A little scary tbh', value: 'cautious_spontaneous' }
    ],
    allowCustomInput: true
  }
  // Continue with more questions...
]
```

### Branching Best Practices:

✅ **DO**:
- Use branching for 2-3 key decision points
- Ensure all paths eventually converge
- Test all possible paths
- Keep branch-specific questions to 2-3 per branch

❌ **DON'T**:
- Create dead-ends (users should always complete quiz)
- Branch too frequently (becomes chaotic)
- Make branches too long (users lose context)
- Forget to handle custom input branching

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

