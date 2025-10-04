# Narrative Quiz Type - Quick Summary

## 🎉 What We Created

A **new quiz type** that enables fully immersive story-based experiences where the narrative adapts to user choices in real-time.

---

## 📚 Three Quiz Types Now Available

### 1. **Archetype** (Existing)
- 4-8 fixed personalities
- Simple point-based scoring
- Example: "Which AI Model Are You?"

### 2. **Story-Matrix** (Existing)
- 100 dynamic combinations  
- 10 disconnected scenarios
- Example: "What's Your Vacation Style?"

### 3. **Narrative** (NEW!)
- 100 dynamic combinations
- **ONE continuous story that adapts**
- Example: "Your First 2 Weeks as Manager"

---

## 🎯 The Key Innovation

### Instead of this (Story-Matrix):
```
Q1: You're at a hostel. What do you do?
Q2: You're at a restaurant. What do you do?
Q3: Plans change. What do you do?
```
→ Disconnected scenarios

### You get this (Narrative):
```
Story Setup: "You're starting a 7-day solo trip to Tokyo..."

Q1: Day 1, 9am. You land at Narita Airport, jet-lagged...
User chooses: "Find a quiet café to collect my thoughts"

Q2: Day 1, 11am. After that peaceful coffee break where you 
     journaled for an hour, you're feeling more grounded. Now 
     you're at your Airbnb. Your host says...
```
→ Story adapts based on Q1 choice!

---

## 💡 How It Works

### You Write:
**Base Scenarios** - The core scene without personalization

```typescript
{
  id: 'q5-crisis',
  baseScenario: {
    timeMarker: "Thursday 4pm",
    dimension: "crisis_management",
    coreSetup: "Production goes down. Deploy failed. Team Slack exploding. What do you do?"
  },
  options: [/* 3 actions */]
}
```

### AI Adapts:
Before showing each question, AI adds continuity:

**If user was hands-on in Q1-4:**
```
"Thursday 4pm - Week 1

You've been pretty hands-on this week, reviewing code and checking in constantly. 
Now the deploy fails and Sarah posts: 'System's down. I told you we needed more 
time.' You can sense frustration with how involved you've been. What do you do?"
```

**If user was delegating in Q1-4:**
```
"Thursday 4pm - Week 1

You've been giving the team space to self-organize. Now Sam calls: 'The deploy 
failed and everyone's looking at each other wondering who's in charge. What do 
you want us to do?'"
```

**Same base scenario, adapted to their journey!**

---

## 📖 Documentation Created

### For Quiz Creators:
**`NARRATIVE_QUIZ_TEMPLATE.md`** - Complete guide
- What is narrative type
- When to use it
- How to structure stories
- Writing immersive scenes
- Complete template with examples
- Checklist and pro tips

### For Choosing Type:
**`QUIZ_TYPE_SELECTOR.md`** - Updated with 3 types
- When to use each type
- Feature comparison table
- Decision tree
- Real-world examples

### For Developers:
**`NARRATIVE_IMPLEMENTATION_NOTES.md`** - Technical guide
- Architecture overview
- Type definitions needed
- API route structure
- Component updates
- Data flow diagrams

---

## ✨ What Makes Narrative Quizzes Special

### Story-Matrix Results:
"Based on various scenarios, you're a **Collaborative Coach**."

### Narrative Results:
"Through your first two weeks leading this team—from that Monday morning standup you called, to how you handled Sarah's confession, to navigating the Marcus-Jordan conflict on Tuesday—your journey revealed you're a **Collaborative Coach**."

**The specific story context makes it feel earned and deeply personal.**

---

## 🎯 Perfect Use Cases

✅ **Management Simulations**
- "Your first 2 weeks as manager"
- "90 days leading a remote team"
- "Handling a team crisis"

✅ **Relationship Journeys**
- "First month dating"
- "Navigating a difficult conversation"
- "Your roommate compatibility journey"

✅ **Travel Narratives**
- "7 days solo in Tokyo"
- "Road trip with friends"
- "Backpacking Southeast Asia"

✅ **Crisis Scenarios**
- "48 hours - system outage"
- "Product launch week"
- "Handling a PR crisis"

✅ **Career Transitions**
- "First 90 days at new company"
- "Launching your side project"
- "Career pivot decision"

---

## 🏗️ Implementation Status

### ✅ Complete:
- Full documentation and templates
- Design and architecture 
- User experience flow
- Example structures

### 📋 To Implement:
- Update `types.ts` with new interfaces
- Create `/api/quiz/adapt-scene` route
- Update QuizEngine component
- Update QuizWelcome component
- Create first example narrative quiz

**Estimated implementation**: 2-3 hours for a developer

---

## 🎨 Example Structure

```typescript
export const managerFirstWeeksQuiz: QuizConfig = {
  id: 'manager-first-weeks',
  type: 'narrative',  // ← New type!
  
  storySetup: {
    title: "Your First Two Weeks as Manager",
    premise: `[Full story context with characters and stakes]`,
    timeframe: "2 weeks",
    characters: [
      { name: "Sarah", role: "Senior Engineer", personality: "Flight risk" }
      // 3-5 recurring characters
    ]
  },
  
  questions: [
    {
      id: 'q1-monday-9am',
      baseScenario: {
        timeMarker: "Monday, 9am - Week 1",
        dimension: "initial_approach",
        coreSetup: "[Immersive scene]"
      },
      options: [/* 3 specific actions */],
      allowCustomInput: true
    }
    // Q2-Q10 continue chronologically
  ],
  
  wordMatrix: { /* 10x10 matrix */ },
  aiExplanation: { /* References story moments */ }
}
```

---

## 💰 Costs & Performance

**API Calls**: 9 scene adaptations + 1 result = 10 total

**Per Quiz**: ~$0.01-0.02 (Claude 3.7 Sonnet)

**Speed**: ~1 second between questions (acceptable)

**User Experience**: Feels seamless and natural

---

## 🚀 Next Steps

### To Create a Narrative Quiz:
1. Read `NARRATIVE_QUIZ_TEMPLATE.md`
2. Design your story arc
3. Create 3-5 memorable characters
4. Write 10 base scenarios chronologically
5. Follow the immersion checklist

### To Implement the System:
1. Read `NARRATIVE_IMPLEMENTATION_NOTES.md`
2. Update type definitions
3. Create adapt-scene API route
4. Update components
5. Test with example quiz

---

## 🎭 The Vision

Users don't just take a quiz—they **LIVE THROUGH a story** and discover who they are by how they navigated it.

Every choice matters. Every scene connects. Every result feels deeply personal.

**That's the power of narrative quizzes.** 🚀

---

## 📁 Files Created

1. **NARRATIVE_QUIZ_TEMPLATE.md** - Complete creation guide (10+ pages)
2. **QUIZ_TYPE_SELECTOR.md** - Updated with narrative type
3. **NARRATIVE_IMPLEMENTATION_NOTES.md** - Technical architecture
4. **This file** - Quick reference summary

Everything is ready for implementation! 🎉
