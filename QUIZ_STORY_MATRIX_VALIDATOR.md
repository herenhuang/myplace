# Story-Matrix Quiz Validator

⚠️ **IMPORTANT: This validator is ONLY for Story-Matrix quizzes!**

*Run this AFTER generating a quiz with [QUIZ_STORY_MATRIX_CREATION.md](QUIZ_STORY_MATRIX_CREATION.md) to ensure quality standards are met*

**For other quiz types:**
- **Archetype quizzes** → No validator needed (use manual testing)
- **Narrative quizzes** → See [QUIZ_NARRATIVE_CREATION.md](QUIZ_NARRATIVE_CREATION.md) for validation guidance

---

## Purpose

This is a **quality gate** that validates:
1. Questions are **visceral** (gut-feel, not academic)
2. Word matrix combinations are **grammatically correct**

**Status Options:**
- ✅ **PASS** → Quiz is complete and ready to use
- ❌ **FAIL** → Must fix issues before quiz is considered "created"

---

## Validation Process

You are a quiz quality validator. Your job is to rigorously check a generated quiz against specific criteria.

### INPUT: Complete quiz configuration

Review the entire quiz config, then run these checks:

---

## Section A: Question Visceral Quality Check

For **EACH question**, validate these criteria:

### ✅ Criterion 1: Immediate, Present-Tense Scenario
**PASS if:**
- Uses present tense: "You're in...", "Your teammate just...", "You see..."
- Happening RIGHT NOW (not "If you were to..." or "Imagine you...")
- Participant is IN the moment, not observing from outside

**FAIL if:**
- Hypothetical: "What would you do if..."
- Past tense: "How did you handle..."
- Abstract preference: "What's your approach to..."

**Examples:**

❌ FAIL: "How do you approach giving feedback?"
✅ PASS: "Your teammate just presented work that completely missed the mark. They ask what you think. You say..."

❌ FAIL: "What would you do if someone disagreed with you?"
✅ PASS: "Your manager just told you your communication has been unclear lately. Your first reaction?"

---

### ✅ Criterion 2: Specific, Engaging Details
**PASS if:**
- Includes vivid details that make it feel REAL
- "Show don't tell" approach
- Creates a mini-story participants can visualize
- Details add emotional texture (e.g., "proudly shows you", "everyone else is nodding")

**FAIL if:**
- Generic scenario: "Someone asks for feedback"
- No context: "You need to make a decision"
- Too abstract: "You face a challenge"

**Examples:**

❌ FAIL: "You need to give feedback. What do you do?"
✅ PASS: "You're in a meeting. Your colleague just said something inaccurate. Everyone else is nodding. You..."

❌ FAIL: "Someone is late. How do you handle it?"
✅ PASS: "Someone on your team has been showing up late to everything. You need to address it. You..."

---

### ✅ Criterion 3: Triggers Gut Reaction (Not Analytical Thinking)
**PASS if:**
- Creates emotional response: pressure, discomfort, surprise, eagerness
- Forces instinctive choice (not "what SHOULD I do?")
- Participants know immediately what they'd do
- No "right answer" - just different gut responses

**FAIL if:**
- Feels like a test with a right answer
- Requires logical analysis to decide
- Too neutral/no emotional stakes
- Options are just slight variations of same response

**Examples:**

❌ FAIL: "What's your preferred feedback style?" (requires thinking about preferences)
✅ PASS: "Be honest with yourself: If they wanted to kiss you right now, you'd..." (immediate gut response)

❌ FAIL: "How do you prioritize tasks?" (analytical)
✅ PASS: "It's Monday 9am. Your inbox has 47 unread emails. You..." (immediate pressure)

---

### ✅ Criterion 4: Clear Conflict/Decision Point
**PASS if:**
- Distinct choice with slightly uncomfortable implications
- Options represent genuinely different internal frameworks
- Each option is a different instinctive behavior pattern
- No "middle ground" options that hedge

**FAIL if:**
- Options are too similar (all variations of same approach)
- One option is obviously "better"
- Options don't span a meaningful spectrum
- Includes cop-out options like "It depends"

**Examples:**

❌ FAIL:
```
Options:
- "I give feedback carefully"
- "I give feedback thoughtfully"
- "I give feedback considerately"
```
(All basically the same)

✅ PASS:
```
Options:
- "Be honest: 'This isn't quite there yet, here's why...'"
- "Start with what worked, then share the gaps"
- "Ask questions to help them see it themselves"
```
(Three distinct behavioral approaches)

---

### ✅ Criterion 5: No "Should" Language
**PASS if:**
- Uses "do" language: "What do you do?", "You say...", "Your response?"
- Action-oriented: "You..." (followed by action verb)
- Focuses on what they ACTUALLY do (not what they think they should do)

**FAIL if:**
- Contains "should": "What should you do?"
- Contains "would": "What would you do?"
- Contains "prefer": "How do you prefer to..."
- Abstract: "What's your approach?"

**Examples:**

❌ FAIL: "How should you give feedback to someone who's struggling?"
✅ PASS: "Your team member's work isn't meeting expectations. Your approach?"

❌ FAIL: "What would be your ideal response?"
✅ PASS: "Your immediate response?"

---

## Section B: Word Matrix Grammar Validation

### ✅ Criterion 6: Quiz Title Completion Test

**The Rule:**
Each `secondWord` must grammatically complete the quiz title/description question.

**Test Format:**
- Quiz asks: "[Quiz topic/question]?"
- Answer: "[secondWord]"
- Does it make grammatical sense when spoken aloud?

**PASS Examples:**

Quiz: "What kind of crush do you have?"
- "Physical Attraction" ✅ (makes sense: "What kind of crush? Physical Attraction")
- "Romantic Crush" ✅
- "Emotional Connection" ✅

Quiz: "Which AI model are you?"
- "Claude" ✅ (makes sense: "Which AI model? Claude")
- "GPT-4" ✅

Quiz: "What's your manager style?"
- "Coach" ✅ (makes sense: "What's your style? Coach")
- "Strategist" ✅
- "Mentor" ✅

**FAIL Examples:**

Quiz: "What's your feedback style?"
- "Behavior-Focused" ❌ (awkward: "What's your style? Behavior-Focused")
- "Growth-Pusher" ❌ (doesn't complete naturally)
- "Standards-Holder" ❌ (grammatically broken)

Quiz: "What's your vacation style?"
- "Budgeteer" ❌ (awkward word)
- "Photographer" ❌ (doesn't answer "what's your style?")

**How to Fix:**
If a secondWord fails, ask:
- What TYPE/ROLE does this represent?
- How would someone naturally answer this quiz's main question?
- Can I make this a clear noun/archetype?

Fixes:
- "Behavior-Focused" → "Analyst" or "Observer"
- "Growth-Pusher" → "Growth Catalyst" or "Developer"
- "Standards-Holder" → "Perfectionist" or "Quality Guardian"

---

### ✅ Criterion 7: All Combinations Make Sense

**Test:**
For each combination of `firstWord + secondWord`, does it create a meaningful archetype name?

**Sample Test (test at least 10 random combinations):**
- "Direct Coach" - makes sense? ✅
- "Empowering Mentor" - makes sense? ✅
- "Structured Growth-Pusher" - makes sense? ❌ (awkward)

**PASS if:**
- 100% of combinations create grammatically correct phrases
- Each combination is distinct and meaningful
- They sound natural when spoken aloud

**FAIL if:**
- Any combination sounds awkward/broken
- Combinations are too similar to each other
- Grammar breaks down (e.g., "Decisive Behavior-Focused")

---

## Section C: Word Matrix Distinctness Check

### ✅ Criterion 8: First Words Are Truly Distinct

**Test:**
Ask for each pair of firstWords: "Could someone be BOTH X and Y?"
- If YES → They're too similar
- If NO → They're distinct enough

**PASS Examples:**
- "Direct" vs "Diplomatic" ✅ (opposite approaches)
- "Spontaneous" vs "Structured" ✅ (clearly different)
- "Bold" vs "Cautious" ✅ (distinct spectrum)

**FAIL Examples:**
- "Explorer" vs "Adventurer" ❌ (basically the same)
- "Planner" vs "Organizer" ❌ (too similar)
- "Thoughtful" vs "Reflective" ❌ (synonyms)

---

### ✅ Criterion 9: Second Words Are Truly Distinct

**Test:**
Ask for each pair of secondWords: "Are these meaningfully different?"
- If NO → They're too similar
- If YES → They're distinct enough

**PASS Examples:**
- "Coach" vs "Mentor" ✅ (different approaches)
- "Truth-Teller" vs "Harmony-Keeper" ✅ (opposite priorities)
- "Innovator" vs "Maintainer" ✅ (distinct roles)

**FAIL Examples:**
- "Teacher" vs "Educator" ❌ (synonyms)
- "Leader" vs "Manager" ❌ (too much overlap)
- "Supporter" vs "Encourager" ❌ (basically same)

---

## Output Format

After validation, respond in this EXACT JSON format:

```json
{
  "status": "PASS" | "FAIL",
  "overallScore": "[X]/9 criteria passed",
  "questionIssues": [
    {
      "questionId": "q3",
      "questionText": "[the question text]",
      "failedCriteria": ["not_visceral", "no_emotional_hook", "uses_should_language"],
      "problem": "Question uses 'What should you do?' and presents a hypothetical scenario instead of an immediate, present-tense situation.",
      "suggestion": "Change to: 'You're in a meeting. Your colleague just said something inaccurate. Everyone else is nodding. You...' with action-based options showing what they DO, not what they think they should do."
    }
  ],
  "wordMatrixIssues": [
    {
      "type": "grammar_failure",
      "location": "secondWords[3]",
      "word": "Behavior-Focused",
      "problem": "Does not grammatically complete the quiz title 'What's your feedback style?'. Saying 'What's your style? Behavior-Focused' sounds awkward and incomplete.",
      "suggestion": "Replace with noun that answers the question directly, like 'Analyst', 'Observer', or 'Pattern-Spotter'"
    },
    {
      "type": "similarity_issue",
      "location": "firstWords",
      "words": ["Explorer", "Adventurer"],
      "problem": "These words are too similar - someone could easily be both. They don't represent distinct approaches.",
      "suggestion": "Replace one with a more distinct word like 'Bold', 'Spontaneous', or 'Cautious'"
    }
  ],
  "summary": "Brief overall assessment: what passed, what failed, severity of issues",
  "readyToUse": true | false
}
```

---

## Validation Strictness Levels

Use **STRICT MODE** by default:

**STRICT MODE:**
- Even one criterion failure = overall FAIL status
- All 9 criteria must pass
- No exceptions or "close enough"
- `readyToUse: false` if any issues exist

**Why Strict?**
Because quality issues compound:
- One non-visceral question reduces engagement
- One grammatically broken word appears in 10 different archetypes
- Better to catch issues now than after users take quiz

---

## Common Fixes Quick Reference

### For Non-Visceral Questions:

| Problem | Fix |
|---------|-----|
| "What's your approach to...?" | → "You're in [situation]. [Event happens]. You..." |
| "How do you handle...?" | → "[Specific scenario unfolding]. Your immediate reaction?" |
| "If you were to..." | → "You just..." (make it present tense) |
| Generic scenario | → Add specific, emotional details |
| 4 options | → Cut to exactly 3 + allowCustomInput: true |

### For Word Matrix Grammar:

| Problem | Fix |
|---------|-----|
| Adjective + "Focused" | → Turn into noun (e.g., "Detail-Focused" → "Analyst") |
| Verb + "er" that sounds weird | → Find the archetype it represents |
| Multi-word phrases | → Keep if grammatical, simplify if not |
| Too similar words | → Replace with opposite end of spectrum |

---

## Example Validation Run

### INPUT QUIZ:
```
Title: "What's Your Feedback Style?"
Questions:
  q1: "How do you approach giving feedback?"
  ...
wordMatrix:
  secondWords: ["Behavior-Focused", "Growth-Pusher", "Coach"]
```

### OUTPUT:
```json
{
  "status": "FAIL",
  "overallScore": "6/9 criteria passed",
  "questionIssues": [
    {
      "questionId": "q1",
      "questionText": "How do you approach giving feedback?",
      "failedCriteria": ["not_immediate", "not_visceral", "uses_approach_language"],
      "problem": "This is an abstract preference question, not a visceral scenario. Uses 'How do you approach' which invites analytical thinking, not gut response.",
      "suggestion": "Your teammate just presented work that completely missed the mark. They ask what you think. You say..."
    }
  ],
  "wordMatrixIssues": [
    {
      "type": "grammar_failure",
      "location": "secondWords[0]",
      "word": "Behavior-Focused",
      "problem": "Doesn't complete 'What's your feedback style?' naturally.",
      "suggestion": "Replace with 'Analyst', 'Observer', or 'Pattern-Reader'"
    },
    {
      "type": "grammar_failure",
      "location": "secondWords[1]",
      "word": "Growth-Pusher",
      "problem": "Awkward construction. 'What's your style? Growth-Pusher' sounds broken.",
      "suggestion": "Replace with 'Growth Catalyst', 'Developer', or 'Mentor'"
    }
  ],
  "summary": "Quiz has strong foundation but needs refinement. Question 1 is too abstract. Two secondWords fail grammar test. Fix these 3 issues and re-validate.",
  "readyToUse": false
}
```

---

## Ready to Validate

**To use this checker:**

1. Paste the complete quiz configuration
2. Run validation against all 9 criteria
3. Output JSON with specific, actionable feedback
4. If FAIL, creator fixes issues and re-runs validation
5. Repeat until PASS

**Remember:** This is a quality gate. Be rigorous. The goal is to ensure every quiz that passes this check will genuinely engage users and feel professional.

---

**Validation complete.** 🎯
