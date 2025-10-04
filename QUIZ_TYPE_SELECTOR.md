# Quiz Type Selector - Which Should I Use?

Quick guide to help you choose between **Archetype Quiz** and **Story-Matrix Quiz**.

---

## 🎯 Archetype Quiz (Fixed Personalities)

### Use When:
- ✅ Matching to **existing characters** (e.g., "Which Naruto character are you?")
- ✅ Matching to **established types** (e.g., "Which Hogwarts house?")
- ✅ You have **4-8 distinct, pre-defined personas**
- ✅ Results should be **instantly recognizable** (e.g., Myers-Briggs types)
- ✅ You want **simple scoring** (point-based system)

### Characteristics:
- **Outcomes**: 4-8 fixed results
- **Questions**: 6-10 questions, 4 options each
- **Scoring**: Manual point assignment per answer
- **AI Role**: Optional, only for explanation text
- **Custom Input**: Not typically used
- **Branching**: Not typically used

### Examples:
- "Which AI Model Are You?" → Claude, GPT-4, Gemini, etc.
- "Which Disney Princess Are You?" → Ariel, Belle, Mulan, etc.
- "What's Your Leadership Style?" → Visionary, Coach, Democrat, Pacesetter

### Setup Complexity: ⭐⭐ (Medium)
- Need to manually design scoring rules for each question

---

## 🌟 Story-Matrix Quiz (Dynamic Combinations)

### Use When:
- ✅ Exploring **open-ended personality traits** (e.g., "What's your travel style?")
- ✅ You want **100+ unique outcomes** (10×10 matrix)
- ✅ Results should be **personalized combinations** (e.g., "Bold Foodie")
- ✅ Users should feel **uniquely seen** (not bucketed)
- ✅ You want **AI-driven results** (Claude selects best match)

### Characteristics:
- **Outcomes**: 100 possible combinations (10 first words × 10 second words)
- **Questions**: 8+ questions, 3 options + custom input each
- **Scoring**: AI analyzes all answers to select best combination
- **AI Role**: Critical - selects archetype AND writes explanation
- **Custom Input**: Yes, on every question
- **Branching**: Optional, for deeper personalization

### Examples:
- "What's Your Vacation Style?" → Spontaneous Foodie, Structured Nature Lover, etc.
- "What's Your Learning Style?" → Visual Practitioner, Auditory Theorist, etc.
- "What's Your Conflict Style?" → Direct Harmony Keeper, Diplomatic Truth Seeker, etc.

### Setup Complexity: ⭐⭐⭐⭐ (High)
- Need to create distinct 10×10 word matrix
- Questions must map to specific dimensions
- Requires careful AI prompt engineering

---

## 🤔 Decision Tree

```
START: What kind of quiz do I want?

Q1: Are the possible results pre-defined characters or types?
├─ YES → Archetype Quiz
└─ NO → Continue to Q2

Q2: Do I want 100+ unique, personalized combinations?
├─ YES → Story-Matrix Quiz
└─ NO → Continue to Q3

Q3: Should every user get a truly unique result?
├─ YES → Story-Matrix Quiz
└─ NO → Archetype Quiz

Q4: Am I comfortable with AI selecting the final result?
├─ YES → Either works! (lean Story-Matrix for variety)
└─ NO → Archetype Quiz
```

---

## 📊 Feature Comparison

| Feature | Archetype | Story-Matrix |
|---------|-----------|--------------|
| **Total Outcomes** | 4-8 | 100 |
| **Personalization** | Medium | Very High |
| **AI Dependency** | Optional | Required |
| **Setup Time** | ~30 min | ~1-2 hours |
| **Question Count** | 6-10 | 8+ |
| **Options per Q** | 4 | 3 + custom |
| **Custom Input** | Rare | Every question |
| **Branching Logic** | Rare | Common |
| **Scoring** | Manual rules | AI-driven |
| **Result Variety** | Low | Very High |

---

## 💡 Real-World Scenarios

### Scenario 1: "Create a Pokémon type quiz"
**Choose**: Archetype Quiz
**Why**: There are 18 Pokémon types - perfect for fixed personalities. Users expect to get "Fire" or "Water", not "Energetic Fire Lover"

### Scenario 2: "Create a career path quiz"
**Choose**: Story-Matrix Quiz
**Why**: Careers are nuanced. "Strategic Analyst" vs "Creative Problem Solver" vs "Social Connector" - 100 combinations better capture real career styles

### Scenario 3: "Which Marvel superhero are you?"
**Choose**: Archetype Quiz
**Why**: Users want to BE Iron Man or Captain America, not "Bold Tech Enthusiast"

### Scenario 4: "What's your communication style?"
**Choose**: Story-Matrix Quiz
**Why**: Communication is multi-dimensional. "Direct Truth Seeker" vs "Diplomatic Harmony Keeper" - combinations reveal nuance

### Scenario 5: "Which Friends character are you?"
**Choose**: Archetype Quiz
**Why**: 6 pre-defined characters (Ross, Rachel, Monica, Chandler, Joey, Phoebe)

### Scenario 6: "What's your creative process?"
**Choose**: Story-Matrix Quiz
**Why**: Creativity is personal. "Methodical Perfectionist" vs "Chaotic Innovator" - unique combinations feel more authentic

---

## 🎨 Quick Creation Guide

### For Archetype Quiz:
1. List your 4-8 personalities/characters
2. Find/create images for each
3. Write 6-10 questions with 4 options each
4. Design scoring rules (which answer → which personality)
5. Test to ensure all personalities are reachable

**Time**: 30-60 minutes

### For Story-Matrix Quiz:
1. Identify core dimensions of your topic
2. Create 10 distinct "first words" (approaches)
3. Create 10 distinct "second words" (priorities)
4. Design 8 questions that map to these dimensions
5. Write selection prompt with strict rules
6. Write explanation prompt with ⚠️ warnings
7. Test to ensure variety and accuracy

**Time**: 1-2 hours

---

## 🚨 Common Mistakes

### Archetype Quiz Mistakes:
- ❌ Too many personalities (10+) → hard to differentiate
- ❌ Biased scoring → everyone gets same result
- ❌ Abstract questions → unclear which answer maps to who
- ❌ No AI explanation → results feel flat

### Story-Matrix Quiz Mistakes:
- ❌ Similar words in matrix → "Explorer" and "Adventurer"
- ❌ Questions don't map to dimensions → AI guesses randomly
- ❌ Weak AI prompts → makes up names like "Natural Explorer"
- ❌ Too few questions → not enough data for 100 combinations

---

## 🎯 Final Recommendation

**Start with Archetype** if:
- This is your first quiz
- You have clear, pre-defined results in mind
- You want something simple and fast

**Start with Story-Matrix** if:
- You want to push boundaries
- You're exploring personality/behavior
- You want users to feel uniquely understood
- You have time to craft a nuanced experience

**Both are great!** Choose based on your topic, goals, and available time. 🚀

