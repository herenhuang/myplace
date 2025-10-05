# Quiz Type Selector - Which Should I Use?

Quick guide to help you choose between **Archetype**, **Story-Matrix**, and **Narrative** quizzes.

---

## 🎯 Archetype Quiz (Fixed Personalities)

### Use When:
- ✅ Matching to **existing characters** (e.g., "Which Naruto character are you?")
- ✅ Matching to **established types** (e.g., "Which Hogwarts house?")
- ✅ You have **4-8 distinct, pre-defined personas**
- ✅ Results should be **instantly recognizable** (e.g., Myers-Briggs types)

### Characteristics:
- **Outcomes**: 4-8 fixed results
- **Questions**: 6-10, can be preferences or scenarios
- **Story Arc**: None - questions are independent
- **Scoring**: Manual point assignment per answer
- **AI Role**: Optional explanation only
- **Setup Time**: ⭐⭐ 30-60 minutes

### Examples:
- "Which AI Model Are You?" → Claude, GPT-4, Gemini
- "Which Disney Princess?" → Ariel, Belle, Mulan
- "Which Hogwarts House?" → Gryffindor, Slytherin, etc.

---

## 🌟 Story-Matrix Quiz (Disconnected Scenarios)

### Use When:
- ✅ Exploring **open-ended traits** (e.g., "What's your travel style?")
- ✅ You want **100+ unique outcomes** (10×10 matrix)
- ✅ Results should be **personalized combinations** (e.g., "Bold Foodie")
- ✅ Users should feel **uniquely seen** (not bucketed)

### Characteristics:
- **Outcomes**: 100 combinations (10 first × 10 second words)
- **Questions**: 8+, each is independent scenario
- **Story Arc**: None - each question standalone
- **Scoring**: AI analyzes all answers
- **AI Role**: Critical - selects result AND writes explanation
- **Setup Time**: ⭐⭐⭐ 1-2 hours

### Examples:
- "What's Your Vacation Style?" → Spontaneous Foodie, Structured Planner
- "What's Your Learning Style?" → Visual Practitioner, Auditory Theorist

---

## 🎬 Narrative Quiz (Continuous Story)

### Use When:
- ✅ You want users to **LIVE THROUGH a story**
- ✅ Natural **timeline exists** (days, weeks, phases)
- ✅ **Recurring characters** add depth
- ✅ Context builds over time (management, relationships, crises)
- ✅ Choices should feel **consequential** within a journey

### Characteristics:
- **Outcomes**: 100 combinations (same as story-matrix)
- **Questions**: 10 sequential scenes in ONE story
- **Story Arc**: Full narrative arc with beginning/middle/end
- **Scoring**: AI analyzes journey through specific story
- **AI Role**: Adapts each scene based on previous choices
- **Setup Time**: ⭐⭐⭐⭐ 2-3 hours

### Examples:
- "Your First 2 Weeks as Manager" → Story adapts to your choices
- "7 Days Solo in Tokyo" → Trip unfolds based on decisions
- "First Month Dating" → Relationship evolves with your actions

---

## 🤔 Decision Tree

```
START: What kind of quiz do I want?

Q1: Are the results pre-defined characters/types (e.g., Harry Potter houses)?
├─ YES → Archetype Quiz
└─ NO → Continue to Q2

Q2: Do I want users to experience a continuous story with recurring characters?
├─ YES → Continue to Q3
└─ NO → Continue to Q4

Q3: Is there a natural timeline (days/weeks/phases)?
├─ YES → Narrative Quiz
└─ NO → Story-Matrix Quiz (disconnected scenarios work better)

Q4: Do I want 100+ unique, personalized combinations?
├─ YES → Story-Matrix Quiz
└─ NO → Archetype Quiz
```

---

## 📊 Feature Comparison

| Feature | Archetype | Story-Matrix | Narrative |
|---------|-----------|--------------|-----------|
| **Outcomes** | 4-8 | 100 | 100 |
| **Personalization** | Medium | Very High | **Extremely High** |
| **Story Arc** | None | None | **Full narrative** |
| **Scene Adaptation** | No | No | **Yes - AI adapts** |
| **Continuity** | None | None | **Recurring characters** |
| **AI During Quiz** | No | No | **Yes - 9 calls** |
| **AI at End** | Optional | Required | Required |
| **Setup Time** | 30-60 min | 1-2 hours | 2-3 hours |
| **Immersion Level** | Low | Medium | **Very High** |
| **Question Type** | Any | Scenarios | **Sequential scenes** |

---

## 💡 Real-World Scenarios

### Scenario 1: "Which Pokémon type are you?"
**Choose**: Archetype
**Why**: 18 pre-defined types. Users expect "Fire" not "Energetic Fire Lover"

### Scenario 2: "What's your vacation style?"
**Choose**: Story-Matrix
**Why**: Travel is nuanced. "Spontaneous Foodie" vs "Structured Nature Lover" - but no natural single narrative

### Scenario 3: "Your first week managing a team"
**Choose**: Narrative
**Why**: Perfect timeline (7 days), recurring team members, decisions build on each other

### Scenario 4: "Which Marvel superhero are you?"
**Choose**: Archetype  
**Why**: Users want to BE Iron Man, not "Bold Tech Enthusiast"

### Scenario 5: "What's your communication style?"
**Choose**: Story-Matrix
**Why**: Multi-dimensional but no single story - "Direct Truth Seeker" from various scenarios

### Scenario 6: "48 hours handling a crisis"
**Choose**: Narrative
**Why**: Clear timeline, building stakes, your choices affect next moments

### Scenario 7: "What's your creative process?"
**Choose**: Story-Matrix
**Why**: Creative process is situational, doesn't need one continuous story

### Scenario 8: "Your first month dating someone new"
**Choose**: Narrative
**Why**: Clear progression (first date → texting → meeting friends), recurring person

---

## 🎨 Quick Start Guide by Type

### Archetype Quiz:
1. List 4-8 personalities
2. Create/find images
3. Write 6-10 questions (4 options each)
4. Design scoring rules
**Time**: 30-60 minutes

### Story-Matrix Quiz:
1. Identify core dimensions
2. Create 10 first words (approaches)
3. Create 10 second words (priorities)  
4. Write 8 disconnected scenarios
5. Craft AI prompts
**Time**: 1-2 hours

### Narrative Quiz:
1. **READ NARRATIVE_QUIZ_CREATION.md**
2. Design your story arc
3. Create 3-5 recurring characters
4. Write story setup (premise, stakes)
5. Write 10 base scenarios (chronological)
6. Create word matrix
7. Craft AI prompts for adaptation + results
**Time**: 2-3 hours

---

## 🎯 When to Choose Narrative Over Story-Matrix

Both give 100 combinations, so how to choose?

### Choose Story-Matrix If:
- ❌ No natural timeline (e.g., "creative style" has no chronology)
- ❌ Questions are naturally independent
- ❌ No recurring characters make sense
- ❌ You want simpler implementation
- ❌ Faster quiz (no AI calls during)

### Choose Narrative If:
- ✅ Clear timeline (days, weeks, phases)
- ✅ Recurring characters add depth
- ✅ Context builds meaningfully
- ✅ Decisions should feel connected
- ✅ You want maximum immersion
- ✅ Story enriches the insights

**Example**: 
- "What's your work style?" → **Story-Matrix** (no single story needed)
- "Your first 90 days at a new job" → **Narrative** (perfect timeline)

---

## 🚨 Common Mistakes by Type

### Archetype Mistakes:
- ❌ Too many personalities (10+)
- ❌ Biased scoring (everyone gets same result)
- ❌ No variety in results

### Story-Matrix Mistakes:
- ❌ Words too similar ("Explorer" and "Adventurer")
- ❌ Questions don't map to dimensions
- ❌ Too few questions for 100 combinations

### Narrative Mistakes:
- ❌ Vague scenes without immersion
- ❌ Timeline doesn't make sense
- ❌ Characters inconsistent or forgettable
- ❌ No story arc (just 10 random scenes)
- ❌ Base scenarios not adaptable

---

## 🎯 Final Recommendation

**Start with Archetype** if:
- First quiz ever
- Clear pre-defined results
- Want something simple

**Use Story-Matrix** when:
- Exploring personality/behavior
- Want 100+ outcomes
- Scenarios are naturally independent

**Use Narrative** when:
- Natural timeline exists
- Story enhances the experience
- Ready for advanced immersion
- Worth the extra effort

All three are powerful! Choose based on your topic and how much time you have. 🚀

---

## 📚 Next Steps

### For Archetype Quizzes:
1. Read **[ARCHETYPE_QUIZ_CREATION.md](ARCHETYPE_QUIZ_CREATION.md)** (Complete Archetype guide)
2. Create your quiz config file with 4-8 personalities
3. Set up scoring rules
4. Test it!

### For Story-Matrix Quizzes:
1. Read **[STORY_MATRIX_QUIZ_CREATION.md](STORY_MATRIX_QUIZ_CREATION.md)** (Complete Story-Matrix guide)
2. Generate your quiz following the 7 steps
3. **IMPORTANT**: Run **[STORY_MATRIX_QUIZ_VALIDATOR.md](STORY_MATRIX_QUIZ_VALIDATOR.md)** for validation
4. Fix any issues until you get PASS (9/9)
5. Quiz is ready!

### For Narrative Quizzes:
1. Read **[NARRATIVE_QUIZ_CREATION.md](NARRATIVE_QUIZ_CREATION.md)** (Complete Narrative guide)
2. Create your story arc and characters
3. Build the quiz config with timeline
4. Test the narrative flow

---

## ⚠️ Story-Matrix Quiz Quality Process

**Story-Matrix quizzes require a TWO-PHASE process:**

**Phase 1: Generate**
- Use **[STORY_MATRIX_QUIZ_CREATION.md](STORY_MATRIX_QUIZ_CREATION.md)**
- Follow all 7 steps
- Generate complete quiz config

**Phase 2: Validate** ← **DO NOT SKIP**
- Run **[STORY_MATRIX_QUIZ_VALIDATOR.md](STORY_MATRIX_QUIZ_VALIDATOR.md)**
- Must achieve 9/9 criteria
- Fix issues and re-validate until PASS

**Why?** The validator ensures:
- Questions are visceral (gut-feel, not academic)
- Word matrices are grammatically correct
- All 100 combinations make sense
- Quiz is production-ready

Only quizzes that pass 9/9 validation should go live!
