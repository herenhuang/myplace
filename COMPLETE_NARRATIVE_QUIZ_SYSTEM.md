# Complete Narrative Quiz System

## 🎉 What Was Built

A **complete, reusable template system** for creating personalized, adaptive narrative quizzes. Not just one quiz - an entire framework for generating any narrative quiz you want!

---

## 📦 The Complete System

### 1. **Core Types** (`/src/lib/quizzes/types.ts`)
- ✅ `PersonalizationForm` - Collect user inputs before quiz
- ✅ `PersonalizationField` - Text or select inputs
- ✅ `StorySetup` - Story premise with placeholder support
- ✅ `StoryCharacter` - Characters with personalized names
- ✅ `BaseScenario` - Scene templates for adaptation
- ✅ `'narrative'` quiz type added

### 2. **Personalization Form Component** (`/src/components/quiz/QuizPersonalization.tsx`)
- ✅ Renders form fields before quiz starts
- ✅ Validates required fields
- ✅ Supports text and select inputs
- ✅ Beautiful, accessible UI
- ✅ Passes data to quiz engine

### 3. **Updated Quiz Engine** (`/src/components/quiz/QuizEngine.tsx`)
- ✅ New screen state: `'personalization'`
- ✅ Stores personalization data in state
- ✅ Helper function to replace `{{placeholders}}`
- ✅ Passes personalization data to all components
- ✅ Sends personalization to adaptation API

### 4. **Updated Welcome Screen** (`/src/components/quiz/QuizWelcome.tsx`)
- ✅ Shows personalized story setup
- ✅ Replaces placeholders in premise
- ✅ Different button text for narrative quizzes
- ✅ Displays story AFTER personalization

### 5. **Updated Adaptation API** (`/src/app/api/quiz/adapt-narrative-scene/route.ts`)
- ✅ Accepts personalization data
- ✅ Replaces placeholders in story context
- ✅ Replaces placeholders in character names
- ✅ AI sees personalized context when adapting
- ✅ Scenes reference user's specific situation

### 6. **Styling** (`/src/components/quiz/quiz.module.scss`)
- ✅ Complete personalization form styles
- ✅ Form fields, labels, errors
- ✅ Input focus states
- ✅ Submit button with hover effects
- ✅ Responsive design

---

## 🎯 How To Use The Template

### For Any New Narrative Quiz:

```typescript
export const yourQuiz: QuizConfig = {
  id: 'your-quiz-id',
  title: 'Your Quiz Title',
  type: 'narrative',
  
  // 1. ADD PERSONALIZATION FORM
  personalizationForm: {
    instructions: "Let's personalize this for you",
    fields: [
      {
        id: 'fieldName',           // Use as {{fieldName}}
        question: "What to ask?",
        type: 'text' | 'select',
        placeholder: 'Default',    // For text
        options: ['A', 'B'],       // For select
        required: true
      }
    ]
  },
  
  // 2. USE {{PLACEHOLDERS}} IN STORY
  storySetup: {
    title: "Story Title",
    premise: `Your story with {{fieldName}} and {{otherField}}.
    
    Use placeholders anywhere - they'll be replaced!`,
    characters: [
      {
        name: "{{fieldName}}",     // Personalized character names!
        role: "Their role",
        personality: "Description"
      }
    ]
  },
  
  // 3. USE {{PLACEHOLDERS}} IN QUESTIONS (OPTIONAL)
  questions: [
    {
      id: 'q1',
      baseScenario: {
        timeMarker: "Day 1",
        dimension: "dimension_name",
        coreSetup: `{{fieldName}} does something...`
      },
      options: [...]
    }
  ],
  
  // 4. REST IS SAME AS BEFORE
  wordMatrix: { /* ... */ },
  aiExplanation: { /* ... */ }
}
```

---

## 🚀 What This Enables

### Before (Generic):
```
"You've been dating Jordan for 14 months..."
```
❌ Feels generic and disconnected

### After (Personalized):
```
User enters: Alex, 2+ years, living together
Result: "You've been dating Alex for 2+ years. You're living together..."
```
✅ Feels personal and relevant!

---

## 📋 The Flow

```
1. User clicks "Start Quiz"
   ↓
2. Personalization Form appears
   - "What's your partner's name?" → User enters "Sam"
   - "How long together?" → User selects "1-2 years"
   - "Current situation?" → User selects "Long distance"
   ↓
3. Story Setup shows (personalized!)
   "You've been with Sam for 1-2 years. You're long distance..."
   ↓
4. Q1 appears (base scenario)
   "Sam calls you..."
   ↓
5. User answers Q1
   ↓
6. AI adapts Q2 with:
   - Previous choice
   - Personalization data
   Result: "After you [Q1 choice], Sam texts..."
   ↓
7. Continue through all questions (all personalized!)
   ↓
8. Results analyze their journey with Sam specifically
```

---

## 🎨 What You Can Build Now

### Relationships:
- "Should You Move In Together?" ✅ (example included)
- "Should You Get Married?"
- "Should You Have Kids?"
- "Should You Break Up?"
- "Long Distance: Will It Work?"

### Career:
- "Should You Quit Your Job?"
- "Should You Start a Business?"
- "Should You Go Back to School?"
- "Your First Month as a Manager"

### Life Transitions:
- "Should You Move Cities?"
- "Should You Buy a House?"
- "Planning Your Gap Year"
- "Your First Year Retired"

### Friendships:
- "Should You Go Into Business With Your Friend?"
- "Should You Move In With Roommates?"
- "Navigating a Friendship Conflict"

---

## 📁 Files Reference

### Core System:
- `/src/lib/quizzes/types.ts` - Type definitions
- `/src/components/quiz/QuizPersonalization.tsx` - Form component
- `/src/components/quiz/QuizEngine.tsx` - Main engine
- `/src/components/quiz/QuizWelcome.tsx` - Welcome/story screen
- `/src/components/quiz/QuizQuestion.tsx` - Question display
- `/src/components/quiz/quiz.module.scss` - Styles
- `/src/app/api/quiz/adapt-narrative-scene/route.ts` - Adaptation API

### Documentation:
- `/PERSONALIZATION_TEMPLATE.md` - How to use personalization
- `/NARRATIVE_QUIZ_TEMPLATE.md` - How to create narrative quizzes
- `/NARRATIVE_ADAPTATION_SYSTEM.md` - How adaptation works
- `/QUIZ_SYSTEM_SUMMARY.md` - Overview of all quiz types

### Example Quiz:
- `/src/lib/quizzes/moving-in-together-quiz.ts` - Complete example

---

## ✅ Features Checklist

### Personalization System:
- [x] Form component with validation
- [x] Text and select input types
- [x] Required vs optional fields
- [x] Placeholder replacement throughout
- [x] Personalized story setup
- [x] Personalized character names
- [x] Personalized scene adaptation
- [x] Beautiful, accessible UI

### Narrative System:
- [x] Story setup screen
- [x] Base scenarios
- [x] AI adaptation of scenes
- [x] Continuous story flow
- [x] Time markers
- [x] Recurring characters
- [x] Scene adaptation references previous choices
- [x] Base scenarios saved (not adapted text)

### Integration:
- [x] Works with existing quiz types
- [x] Backward compatible
- [x] Clean separation of concerns
- [x] Fully typed with TypeScript
- [x] No linter errors
- [x] Documented thoroughly

---

## 🎓 Key Concepts

### 1. **Placeholders**
Use `{{fieldId}}` anywhere in text:
- Story setup premise
- Character names
- Question text (base scenarios)
- Automatically replaced with user input

### 2. **Base vs Adapted Text**
- **Base scenario**: What YOU write
- **Adapted text**: What AI generates for display
- **Saved for analysis**: Base scenario + user choice
- **Shown to user**: Adapted text (personalized + continuous)

### 3. **Personalization vs Adaptation**
- **Personalization**: User's context (names, timelines)
- **Adaptation**: Making scenes reference previous choices
- **Together**: Personalized + continuous story

---

## 💡 Pro Tips

### Placeholder Naming:
- Use clear IDs: `partnerName`, `cityName`, `relationshipLength`
- Test in sentences: "{{partnerName}} asks you..." (reads well)
- Avoid: `p1`, `name`, `x` (unclear)

### Field Design:
- Keep forms short (3-5 fields max)
- Make defaults sensible (placeholders that work)
- Use select for standardized data
- Use text for names/custom content

### Story Integration:
- Use placeholders early in premise
- Reference them multiple times
- Test how different inputs read
- Make sure grammar works with all options

---

## 🚀 You're Ready!

You now have a **complete template system** for creating personalized narrative quizzes about ANY topic!

Just:
1. Pick a decision/journey to explore
2. Identify what personal context matters
3. Add personalization form with those fields
4. Use `{{placeholders}}` throughout your story
5. Write 10 base scenarios
6. Done! System handles the rest

**Every narrative quiz can now be deeply personal to each user's actual situation!** 🎉

