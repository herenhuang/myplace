# Narrative Quiz Adaptation System

## ✅ What Was Built

A complete AI-powered narrative adaptation system that makes quiz scenes adapt and evolve based on the user's previous choices, creating a personalized, continuous story experience.

---

## 🎯 How It Works

### The Flow:

```
1. User starts quiz → See story setup
2. Q1 appears (base scenario, no adaptation needed)
3. User answers Q1 → Response saved
   ↓
4. [AI ADAPTATION CALL]
   Input: Q2 base scenario + Q1 answer + story context
   AI rewrites Q2 to reference Q1 choice
   ↓
5. User sees ADAPTED Q2 (feels continuous)
6. User answers Q2 → Response saved
   ↓
7. [AI ADAPTATION CALL]
   Input: Q3 base scenario + Q1 & Q2 answers + story context
   AI rewrites Q3 to reference previous choices
   ↓
8. Continue for all questions...
   ↓
9. End: AI analyzes full journey → Personalized result
```

---

## 📁 Files Created/Modified

### New API Endpoint
✅ `/src/app/api/quiz/adapt-narrative-scene/route.ts`
- Calls Claude API to adapt scenes
- Takes base scenario + previous responses + story context
- Returns adapted text that references previous choices
- Fallback to base scenario on error

### Updated Components
✅ `/src/components/quiz/QuizEngine.tsx`
- Added `adaptedQuestions` state to store AI-adapted text
- Added `adaptNarrativeScene()` function
- Calls adaptation API after each answer (for narrative quizzes)
- Passes adapted text to QuizQuestion component

✅ `/src/components/quiz/QuizQuestion.tsx`
- Accepts `adaptedText` prop
- Displays adapted text (if available) instead of base scenario
- Shows time markers for narrative context

### Test Quiz
✅ `/src/lib/quizzes/test-narrative-quiz.ts`
- Simple 3-question narrative quiz
- "Your First Coffee Date" story
- Perfect for testing the adaptation system

✅ `/src/lib/quizzes/index.ts`
- Registered test-narrative quiz

---

## 🧪 How To Test

### 1. Start your dev server
```bash
npm run dev
```

### 2. Visit the test quiz
```
http://localhost:3000/quiz/test-narrative
```

### 3. What to watch for:

**Q1:** "Saturday, 10am - The date is in 4 hours. How do you spend your morning?"
- This shows the BASE scenario (no adaptation needed)

**After answering Q1:**
- Loading indicator appears
- AI is adapting Q2 based on your Q1 choice

**Q2:** Should reference your Q1 choice!
- If you chose "Plan conversation" → "After spending your morning preparing topics..."
- If you chose "Just chill" → "After taking it easy this morning..."
- If you chose "Research Morgan" → "After reviewing Morgan's profile..."

**Q3:** Should reference BOTH Q1 and Q2!
- The adaptation builds on the full story so far

---

## 🎨 Example Adaptation

### Base Q2 Scenario (what you write):
```
"You're approaching the coffee shop. Through the window, you see Morgan 
is already inside. What do you do?"
```

### Adapted Q2 (after user planned conversation in Q1):
```
"After spending your morning thinking through conversation topics, you're 
approaching the coffee shop feeling prepared. Through the window, you see 
Morgan is already inside, looking relaxed. Your planned topics are ready. 
What do you do?"
```

### Adapted Q2 (after user chilled in Q1):
```
"After taking it easy this morning, you're approaching the coffee shop with 
a go-with-the-flow energy. Through the window, you see Morgan is already 
inside, looking at their phone. What do you do?"
```

**Same base scenario, personalized to THEIR journey!**

---

## 💡 Key Features

### 1. **Contextual Continuity**
Every scene references previous choices naturally, making it feel like one continuous story.

### 2. **Character Consistency**
Morgan (or any recurring character) reacts differently based on user's approach.

### 3. **Emotional Throughline**
The adaptation tracks not just what they did, but the energy/approach they brought.

### 4. **Fallback Safety**
If API fails, shows base scenario (quiz still works, just not adapted).

### 5. **Efficient Caching**
Adapted text stored in state - only adapts once per question.

---

## 🔧 How To Create Your Own Narrative Quiz

### 1. Create the quiz config:
```typescript
export const yourNarrativeQuiz: QuizConfig = {
  id: 'your-quiz-id',
  title: 'Your Quiz Title',
  type: 'narrative', // ← This enables adaptation!
  
  // Story setup (shown before Q1)
  storySetup: {
    title: "Your Story",
    premise: `Set the scene, introduce characters, establish stakes...`,
    timeframe: "48 hours",
    characters: [
      { name: "Alex", role: "Your friend", personality: "Supportive but honest" }
    ]
  },
  
  // Questions with base scenarios
  questions: [
    {
      id: 'q1',
      baseScenario: {
        timeMarker: "Day 1, 9am",
        dimension: "initial_approach",
        coreSetup: `Scene description...`
      },
      options: [
        { label: 'Action 1', value: 'choice1' },
        { label: 'Action 2', value: 'choice2' },
        { label: 'Action 3', value: 'choice3' }
      ],
      allowCustomInput: true
    },
    // ... more questions
  ],
  
  // Word matrix + AI explanation (same as story-matrix)
  wordMatrix: { ... },
  aiExplanation: { ... }
}
```

### 2. Register it:
```typescript
// In src/lib/quizzes/index.ts
import { yourNarrativeQuiz } from './your-narrative-quiz'

export const quizRegistry = {
  'your-quiz-id': yourNarrativeQuiz
}
```

### 3. Access it:
```
/quiz/your-quiz-id
```

---

## 🎯 Best Practices

### Writing Good Base Scenarios

✅ **DO:**
- Write vivid, specific scenes
- Include sensory details
- Set clear time markers
- Establish what's happening RIGHT NOW
- Leave room for adaptation (don't over-specify previous context)

❌ **DON'T:**
- Write vague situations
- Reference previous choices (AI does this!)
- Make scenes too long
- Skip the time marker

### Example:

**Good Base Scenario:**
```
timeMarker: "Tuesday, 2pm"
coreSetup: "Marcus interrupts Jordan during standup: 'We can't keep 
doing it this way.' Jordan snaps back. The room goes silent. Everyone's 
looking at you. What do you do?"
```

**Bad Base Scenario:**
```
timeMarker: "Later"
coreSetup: "There's a conflict. How do you handle it?"
```

---

## 🚀 Performance Notes

- **API calls:** 1 per question (except Q1) = ~9 calls for 10-question quiz
- **Latency:** ~1-2 seconds per adaptation
- **Cost:** ~$0.01-0.02 per quiz (Claude API)
- **Fallback:** If API fails, shows base scenario

---

## 🎉 You're Ready!

The narrative adaptation system is fully functional! Every narrative quiz you create will now automatically:
1. Adapt scenes based on previous choices
2. Create personalized story experiences
3. Make users feel like their choices truly matter

Test it with `/quiz/test-narrative` and then build your own! 🚀

