# Narrative Quiz Type - Implementation Notes

## 📋 What We Created

We've designed a **third quiz type** called `'narrative'` that enables fully immersive story-based quizzes where scenes adapt based on previous choices.

---

## 🎯 The Key Innovation

### Problem We Solved:
**Story-Matrix quizzes** have disconnected scenarios:
- Q1: "You're at a hostel..."
- Q2: "You're at a restaurant..."  
- Q3: "You're at the airport..."

No continuity between questions.

### Narrative Solution:
**ONE continuous story** that adapts:
- Q1: "Monday 9am. You walk in..."
- Q2: "Monday 11am. After [what you did in Q1], Sarah approaches..." ← References Q1!
- Q3: "Tuesday 2pm. Following your [Q1] approach and [Q2] response..." ← References both!

---

## 🏗️ Architecture

### Type Definition Updates Needed

Add to `src/lib/quizzes/types.ts`:

```typescript
// New interfaces
export interface StoryCharacter {
  name: string
  role: string
  personality: string
  image?: string
}

export interface StorySetup {
  title: string
  premise: string
  timeframe: string
  characters?: StoryCharacter[]
}

// Update QuizConfig
export interface QuizConfig {
  // ... existing fields ...
  type: 'archetype' | 'story-matrix' | 'narrative'  // ← Add 'narrative'
  storySetup?: StorySetup  // ← New field
  
  // Update QuizQuestion to support base scenarios
}

// Update QuizQuestion
export interface QuizQuestion {
  id: string
  text: string  // Used for archetype/story-matrix
  baseScenario?: {  // New: for narrative type
    timeMarker: string
    dimension: string
    coreSetup: string
  }
  options: QuizOption[]
  allowCustomInput?: boolean
}
```

### API Route Needed

Create `/src/app/api/quiz/adapt-scene/route.ts`:

**Purpose**: Takes base scenario + previous answers → Returns adapted scene text

**Input**:
```json
{
  "baseScenario": {
    "timeMarker": "Tuesday, 2pm",
    "dimension": "conflict_management",
    "coreSetup": "During standup, Marcus and Jordan start arguing..."
  },
  "previousAnswers": [
    {"question": "Q1...", "selectedOption": "casual approach", "selectedValue": "casual"},
    {"question": "Q2...", "selectedOption": "empathetic listening", "selectedValue": "empathetic"}
  ],
  "storySetup": {
    "premise": "You're a new manager...",
    "characters": [...]
  }
}
```

**Output**:
```json
{
  "adaptedText": "Tuesday, 2pm - Week 1\n\nAfter your casual coffee chats yesterday and the empathetic conversation with Sarah, the team seems more relaxed around you. But now during standup, Marcus interrupts Jordan sharply..."
}
```

**AI Prompt** (inside the API route):
```typescript
const prompt = `You're adapting a scene in a narrative quiz to reference previous choices.

STORY CONTEXT:
${storySetup.premise}

CHARACTERS:
${characters.map(c => `${c.name} (${c.role}): ${c.personality}`).join('\n')}

PREVIOUS CHOICES:
${previousAnswers.map((a, i) => `Q${i+1}: ${a.question} → They chose: "${a.selectedOption}"`).join('\n')}

NEXT SCENE TO ADAPT:
Time: ${baseScenario.timeMarker}
Dimension being tested: ${baseScenario.dimension}
Core scenario: ${baseScenario.coreSetup}

YOUR TASK:
Rewrite this scene to naturally reference their previous choices (1-2 sentences of continuity), then present the core scenario. Keep it 3-4 sentences total, vivid and immediate.

ADAPTED SCENE:`
```

### Component Updates Needed

Update `QuizEngine.tsx`:

```typescript
const loadNextQuestion = async () => {
  const currentQ = quiz.questions[currentQuestionIndex]
  
  if (quiz.type === 'narrative' && currentQ.baseScenario && currentQuestionIndex > 0) {
    // Call API to adapt the scene
    setIsLoadingScene(true)
    
    const response = await fetch('/api/quiz/adapt-scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseScenario: currentQ.baseScenario,
        previousAnswers: responses,
        storySetup: quiz.storySetup,
        characters: quiz.storySetup?.characters || []
      })
    })
    
    const { adaptedText } = await response.json()
    setCurrentQuestionText(adaptedText)
    setIsLoadingScene(false)
  } else {
    // For Q1 or non-narrative, use static text
    setCurrentQuestionText(currentQ.baseScenario?.coreSetup || currentQ.text)
  }
}
```

Update `QuizWelcome.tsx`:

```typescript
// For narrative quizzes, show story setup before starting
if (quiz.type === 'narrative' && quiz.storySetup) {
  return (
    <div className="story-setup">
      <h1>{quiz.storySetup.title}</h1>
      <div className="premise">{quiz.storySetup.premise}</div>
      {quiz.storySetup.characters && (
        <div className="characters">
          <h3>The Characters:</h3>
          {quiz.storySetup.characters.map(char => (
            <div key={char.name}>
              <strong>{char.name}</strong> ({char.role}) - {char.personality}
            </div>
          ))}
        </div>
      )}
      <button onClick={onStart}>Begin Your Story</button>
    </div>
  )
}
```

---

## 📝 How to Create a Narrative Quiz

### Step 1: Read the Template
**File**: `NARRATIVE_QUIZ_CREATION.md` (comprehensive guide we just created)

### Step 2: Structure Your Story
```typescript
// Example: Manager quiz
export const managerFirstWeeksQuiz: QuizConfig = {
  id: 'manager-first-weeks',
  title: 'Your First Two Weeks as Manager',
  type: 'narrative',  // ← Key!
  
  storySetup: {
    title: "Welcome to Your New Team",
    premise: `You've just been promoted... [full story context]`,
    timeframe: "2 weeks",
    characters: [
      { name: "Sarah", role: "Senior Engineer", personality: "Flight risk" },
      // ... more characters
    ]
  },
  
  questions: [
    {
      id: 'q1-monday-9am',
      baseScenario: {
        timeMarker: "Monday, 9am - Week 1",
        dimension: "initial_approach",
        coreSetup: "You walk into the team room. Marcus and Taylor stop talking when you enter..."
      },
      options: [/* 3 specific actions */],
      allowCustomInput: true
    },
    {
      id: 'q2-monday-11am',
      baseScenario: {
        timeMarker: "Monday, 11am - Week 1",
        dimension: "people_management",
        coreSetup: "Sarah sits down for 1:1. She says: 'I'm interviewing elsewhere.'"
        // ↑ AI will add: "After your [Q1 approach] earlier..."
      },
      options: [/* 3 specific actions */],
      allowCustomInput: true
    }
    // ... Q3-Q10 chronologically
  ],
  
  wordMatrix: { /* same as story-matrix */ },
  aiExplanation: { 
    // Prompt references specific story moments
  }
}
```

### Step 3: Follow the Checklist
- Story setup with clear stakes
- 3-5 memorable recurring characters
- 10 base scenarios with 5 immersion elements each
- Chronological time markers
- Arc: intro → challenges → crisis → resolution

---

## 🎯 What Makes It Work

### The User Experience Flow:

1. **Welcome Screen** → See story setup
2. **Q1** → Answer (static scene, no previous context)
3. **Loading...** → 1 sec while AI adapts Q2
4. **Q2** → Answer (scene references Q1!)
5. **Loading...** → AI adapts Q3 based on Q1+Q2
6. **Q3** → Answer (scene references journey so far)
7. ... continues through Q10
8. **Results** → AI analyzes how they navigated THIS SPECIFIC STORY

### Why It Feels Different:

**Story-Matrix**:
"Based on your answers across various scenarios, you're a Bold Foodie."

**Narrative**:
"Through your first two weeks managing this team, from that Monday morning when you called the standup, to Friday when you handled the Sarah situation, to the way you navigated the Marcus-Jordan conflict—your journey revealed you're a Collaborative Coach."

The **specific story context** makes results feel more earned and personal.

---

## 💾 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ User starts quiz → Sees Story Setup                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Q1 displays (static - baseScenario.coreSetup)          │
│ User answers Q1                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ API: /api/quiz/adapt-scene                              │
│ Input: Q2 baseScenario + Q1 answer + story context     │
│ Output: Adapted Q2 text                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Q2 displays (adapted text)                              │
│ User answers Q2                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ API: /api/quiz/adapt-scene                              │
│ Input: Q3 baseScenario + Q1&Q2 answers + story context │
│ Output: Adapted Q3 text                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ... Q4-Q10 ...
                          ↓
┌─────────────────────────────────────────────────────────┐
│ API: /api/quiz/select-archetype                         │
│ Analyzes ALL 10 answers through story journey           │
│ Returns: "Collaborative Coach" + explanation            │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Cost & Performance

### API Calls per Quiz:
- **Archetype**: 0-1 (only result explanation)
- **Story-Matrix**: 1 (only result selection)
- **Narrative**: **10** (9 scene adaptations + 1 result)

### Estimated Cost:
- Scene adaptation: ~300 tokens each = ~2,700 tokens for 9 scenes
- Result selection: ~1,000 tokens
- **Total**: ~3,700 tokens per quiz
- At Claude 3.7 Sonnet rates: ~$0.01-0.02 per quiz

### Speed:
- ~1 second delay between questions for adaptation
- User just made a choice, so 1 sec to next question is acceptable
- Total quiz time: ~10-15 minutes (similar to other types)

---

## ✅ Implementation Checklist

When implementing narrative support:

### Types (types.ts)
- [ ] Add StoryCharacter interface
- [ ] Add StorySetup interface  
- [ ] Update QuizConfig.type to include 'narrative'
- [ ] Add storySetup?: StorySetup to QuizConfig
- [ ] Add baseScenario field to QuizQuestion

### API
- [ ] Create /api/quiz/adapt-scene/route.ts
- [ ] Test with sample base scenario + previous answers
- [ ] Handle edge cases (Q1, custom input, etc.)

### Components
- [ ] Update QuizEngine to detect narrative type
- [ ] Add scene adaptation logic before showing question
- [ ] Add loading state during adaptation
- [ ] Update QuizWelcome to show story setup
- [ ] Style story setup (characters, premise, etc.)

### Testing
- [ ] Create example narrative quiz
- [ ] Test full flow from setup → Q10 → results
- [ ] Verify continuity in adapted scenes
- [ ] Check that AI references previous choices
- [ ] Test with different answer paths

---

## 🎓 Documentation Complete

We've created:

1. **NARRATIVE_QUIZ_CREATION.md** - Complete guide to creating narrative quizzes
2. **Updated QUIZ_TYPE_SELECTOR.md** - Now includes narrative as 3rd option
3. **This file** - Implementation notes for developers

### For Quiz Creators:
→ Read `NARRATIVE_QUIZ_CREATION.md`

### For Developers:
→ Use this file to implement the system

### For Choosing Type:
→ Use `QUIZ_TYPE_SELECTOR.md`

---

## 🚀 Ready to Build!

The template system is designed. When you're ready to implement:

1. Add type definitions to types.ts
2. Create the adapt-scene API route
3. Update QuizEngine and QuizWelcome components
4. Create your first narrative quiz using the template
5. Test and iterate

The beauty: **Same 10 questions for everyone, but the story adapts to feel personal!**
