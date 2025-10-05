# Story-Matrix Quiz Generator Prompt

⚠️ **IMPORTANT: This prompt is ONLY for Story-Matrix quizzes!**

**Not sure which quiz type to use?** Read [QUIZ_TYPE_SELECTOR.md](QUIZ_TYPE_SELECTOR.md) first.

- **Archetype quizzes** (fixed personalities) → Use [QUIZ_ARCHETYPE_CREATION.md](QUIZ_ARCHETYPE_CREATION.md)
- **Narrative quizzes** (continuous story) → Use [QUIZ_NARRATIVE_CREATION.md](QUIZ_NARRATIVE_CREATION.md)
- **Story-Matrix quizzes** (100 combinations from independent scenarios) → Use this file

---

## When User Requests: "Create a [TOPIC] story-matrix quiz"

Follow this exact process:

### Step 1: Understand the Topic
Ask yourself:
- What are the core dimensions of this topic?
- What are the different APPROACHES people take? (first words)
- What are the different PRIORITIES people have? (second words)
- Are there 10 truly distinct options for each?

### Step 2: Create the 10x10 Word Matrix

**First Words (HOW they approach the topic):**
- Must be 10 DISTINCTLY different approaches
- Each should be recognizable and clear
- Should span a spectrum of possibilities
- **Distinctness Test**: "Could someone be BOTH X and Y?" If yes, they're too similar
  - ❌ BAD: "Explorer" and "Adventurer" (too similar)
  - ✅ GOOD: "Spontaneous" and "Structured" (clear opposites)

**Second Words (WHAT they prioritize in the topic):**
- Must be 10 DISTINCTLY different priorities
- Each should represent a clear value/focus
- Should cover diverse interests
- **Distinctness Test**: "Are these meaningfully different?" If not, refine
- **Grammar Test**: Does [secondWord] grammatically complete the quiz title/question?
  - ✅ "What's your feedback style?" → "Coach" (works naturally)
  - ✅ "What's your feedback style?" → "Truth-Teller" (works naturally)
  - ❌ "What's your feedback style?" → "Behavior-Focused" (awkward, doesn't answer the question)
  - ❌ "What's your feedback style?" → "Growth-Pusher" (broken grammar)

**Critical Rule for secondWords:**
Each word must answer the implicit question in your quiz title when spoken aloud.
- Quiz: "What's your manager style?" → secondWord should answer: "What's your style? [X]"
- Quiz: "Do I have a crush?" → secondWord should answer: "What kind? [X]"
- Quiz: "What's your vacation style?" → secondWord should answer: "What's your style? [X]"

Avoid:
- Adjective phrases ending in "-Focused" (e.g., "Detail-Focused")
- Role titles (e.g., "Process Builder", "Culture Builder")
- Made-up compound words (e.g., "Budgeteer")

Use:
- Clear nouns (e.g., "Coach", "Mentor", "Strategist")
- Recognizable archetypes (e.g., "Perfectionist", "Innovator")
- Natural descriptors (e.g., "Truth-Teller", "Problem-Solver")

### Step 3: Design 8 Strategic Questions

⚠️ **MANDATORY FORMAT:**
- **EXACTLY 8 questions** (no more, no less)
- **EXACTLY 3 options per question** (no more, no less)
- **ALWAYS set `allowCustomInput: true`** on every question

⚠️ **VISCERAL QUALITY REQUIREMENTS:**

Each question MUST be visceral (gut-feel, not academic):

1. **Immediate, Present-Tense Scenario**
   - Use "You're at...", "Your teammate just...", "You see..."
   - Happening RIGHT NOW, not hypothetical
   - ❌ "What would you do if..." or "How do you approach..."
   - ✅ "You're in a meeting. Your colleague just said..."

2. **Specific, Engaging Details**
   - Include vivid details that make it feel REAL
   - "Show don't tell" approach
   - ❌ "Someone asks for feedback"
   - ✅ "Your teammate just presented work that completely missed the mark. They ask what you think."

3. **Triggers Gut Reaction (Not Analytical Thinking)**
   - Should create emotional response: pressure, discomfort, excitement
   - Force instinctive choice, not logical analysis
   - ❌ "What's your preferred approach?"
   - ✅ "Your manager made a decision you think is wrong. You..."

4. **Clear Conflict/Decision Point**
   - Options represent genuinely different gut responses
   - No "middle ground" cop-out options
   - Each option shows distinct behavioral pattern

5. **No "Should" Language**
   - Use "do" language: "What do you do?", "You...", "Your response?"
   - Focus on what they ACTUALLY do, not what they think they should do
   - ❌ "How should you handle this?"
   - ✅ "What happens next?"

Each question must also:
- **Map to specific dimensions** of your word matrix
- **Reveal patterns through actions**, not self-assessment
- Be **relatable** - situations people have experienced or can easily imagine

**Example Question Structure:**

**Q1**: Primary approach/style (maps to 3-4 first words)
- ❌ "How do you approach planning?"
- ✅ "You just got invited to a destination wedding in 3 months. What happens next?"

**Q2**: Core value/priority (maps to 3-4 second words)
- ❌ "What matters most to you?"
- ✅ "It's day 2 of your trip. Where do we find you at 2pm?"

**Q3**: Social dimension (maps to social/independent spectrum)
- ❌ "Are you social or independent?"
- ✅ "You're at a hostel common area. Someone's making dinner. What do you do?"

**Q4**: Energy/pace dimension (maps to energetic/relaxed spectrum)
- ❌ "What's your ideal pace?"
- ✅ "It's 7am on vacation day 3. Your alarm goes off. What happens?"

**Q5**: Resource allocation (maps to budget/comfort/etc)
- ❌ "How do you spend money?"
- ✅ "You see a $200/night boutique hotel and a $40 hostel. Which do you book?"

**Q6**: Risk tolerance (maps to bold/cautious spectrum)
- ❌ "Are you adventurous?"
- ✅ "A local offers to take you to their 'secret spot' off the tourist map. Your response?"

**Q7**: Adaptability (maps to structured/flexible spectrum)
- ❌ "How do you handle changes?"
- ✅ "Your flight gets cancelled. You're now stuck in this city for 2 extra days. First reaction?"

**Q8**: Success definition (maps to outcome priorities)
- ❌ "What makes a trip successful?"
- ✅ "Last day of the trip. What would make you say 'that was perfect'?"

**The pattern: SITUATION → WHAT DO YOU DO → reveals who they are**

**Question Format - CRITICAL:**
- **SCENARIO-BASED**: Put them in a SPECIFIC SITUATION showing what they actually DO
  - ❌ BAD: "What's your approach to decisions?" (vague preference)
  - ✅ GOOD: "Your team missed a deadline. You walk into the office Monday morning. What do you do first?"
- **ACTION-ORIENTED**: Focus on observable ACTIONS, not self-reported preferences
  - ❌ BAD: "I prefer to plan ahead" (what they think they do)
  - ✅ GOOD: "Pull up my detailed calendar and reschedule everything" (what they actually do)
- **EXACTLY 3 options** (not 4!) - each showing a distinct behavior pattern
- **Enable custom input on ALL questions** - `allowCustomInput: true`
- **Use storytelling**: "You're at [place]. [Event happens]. What do you do?"
- **Make it REAL**: Use concrete, relatable workplace/life situations people can actually picture

### Step 4: Write the AI Prompts

**Selection Prompt Structure:**
```
You are analyzing a [TOPIC] personality.

Your task: Select ONE combination that best captures this person.

Available words:
FIRST WORDS: [list]
SECOND WORDS: [list]

User's answers:
{{answers}}

Instructions:
1. Consider the full story their answers tell
2. Choose FIRST WORD describing their approach
3. Choose SECOND WORD describing their priority
4. Each word is DISTINCT
5. Identify 2 alternatives they were close to

Respond in JSON:
{
  "firstWord": "...",
  "secondWord": "...",
  "reasoning": "ONLY use exact combination - no other names",
  "alternatives": [
    {"firstWord": "...", "secondWord": "...", "reason": "..."},
    {"firstWord": "...", "secondWord": "...", "reason": "..."}
  ]
}

IMPORTANT: Do NOT make up new names.
```

**Explanation Prompt Structure:**
```
You're a [TOPIC] expert. They are a "{{archetype}}".

⚠️ CRITICAL RULES:
1. ONLY use "{{archetype}}" - no other names
2. Do NOT create variations
3. Do NOT add "The" or "A"
4. You will be penalized for making up names

Write with these sections:

## Your [Topic] DNA
Start with "As an {{archetype}}, you..."

## What I Noticed
Highlight patterns from their answers.

## You Were Also Close To...
{{alternatives}}

## Tips for Your Next [Activity]
Actionable tips for {{archetype}}.

## Where This Takes You
Inspiring closing using {{archetype}}.

Their answers:
{{answers}}
```

### Step 5: Choose Theme Colors

**Default: Always start with neutral tones**
- Primary: `#8b7355`, Secondary: `#c9b8a3`, Background: `#fafafa`, Text: `#2c2c2c`

**Only customize if topic has strong color association:**
- **Adventure/Travel**: Blues, aquas (`#4a90e2`, `#7ec8e3`)
- **Nature/Wellness**: Greens (`#52b788`, `#95d5b2`)
- **Food/Lifestyle**: Warm tones (`#ff6b35`, `#ffa500`)
- **Professional/Work**: Grays, blues (`#6b7280`, `#9ca3af`)

**When in doubt, use neutral!**

### Step 6: Generate Complete Config File

Output the complete TypeScript config file with:
- ✅ Exactly 8 questions with sequential IDs (q1, q2, q3, q4, q5, q6, q7, q8)
- ✅ EXACTLY 3 options per question + allowCustomInput: true on every question
- ✅ Each question is a VISCERAL scenario (immediate, present-tense, gut-feel)
- ✅ Each question has ACTION-based options (what they DO, not what they think/prefer)
- ✅ 10 distinct first words (approaches) that pass distinctness test
- ✅ 10 distinct second words (priorities) that pass grammar test
- ✅ Selection prompt with exact structure
- ✅ Explanation prompt with ⚠️ warnings
- ✅ Theme colors (default to neutral: #8b7355, #c9b8a3, #fafafa, #2c2c2c)
- ✅ `type: 'story-matrix'`

### Step 7: Run Quality Validation

⚠️ **IMPORTANT: Quiz is NOT complete until it passes quality validation!**

**Why Two Phases?**
- **Phase 1 (This file)**: Generate quiz with strong initial quality
- **Phase 2 (Quality Checker)**: Rigorous validation to catch any issues

The quality checker validates that:
- Questions meet ALL 5 visceral quality criteria
- Word matrix secondWords grammatically complete the quiz title
- All 100 combinations (10×10) make sense when spoken aloud
- firstWords and secondWords are truly distinct
- No edge cases or issues slipped through

**Process:**
1. **Run [QUIZ_STORY_MATRIX_VALIDATOR.md](QUIZ_STORY_MATRIX_VALIDATOR.md)** on the generated quiz
2. **If PASS (9/9 criteria)** → Quiz is complete and ready to use ✅
3. **If FAIL** → Review specific issues flagged, fix them, then re-validate
4. **Repeat until PASS** → No exceptions

**Do not skip this step.** A quiz that passes the validator:
- Will engage users with gut-feel, visceral questions
- Will generate grammatically correct, natural-sounding results
- Will create 100 truly distinct and meaningful archetypes
- Is production-ready

---

## Quality Checklist (Before Running Quality Checker)

Pre-validation checks:

- [ ] Exactly 8 questions with IDs q1-q8
- [ ] All 10 first words pass distinctness test (can't be BOTH)
- [ ] All 10 second words pass distinctness test (meaningfully different)
- [ ] All 10 second words pass grammar test (complete quiz title)
- [ ] Each question targets a different dimension
- [ ] All questions have EXACTLY 3 options (not 4!)
- [ ] All questions have `allowCustomInput: true`
- [ ] **All questions are VISCERAL** (immediate, present-tense, gut-feel)
- [ ] **All questions trigger emotional response** (not analytical thinking)
- [ ] **All options show ACTIONS** (what they DO, not what they think/prefer)
- [ ] **No "should", "would", or "how do you" language** in questions
- [ ] Questions feel REAL and relatable to the topic
- [ ] Selection prompt includes "do NOT make up names"
- [ ] Explanation prompt includes ⚠️ warnings about archetype naming
- [ ] Explanation prompt has all required sections
- [ ] Theme colors are appropriate for topic (default to neutral)
- [ ] Quiz ID is lowercase with hyphens

**Then proceed to Step 7: Run [QUIZ_STORY_MATRIX_VALIDATOR.md](QUIZ_STORY_MATRIX_VALIDATOR.md)**

---

## Example Topics & Word Matrices

### Topic: "What's Your Learning Style?"

**First Words (HOW they learn):**
- Visual, Auditory, Kinesthetic, Social, Independent, Structured, Exploratory, Methodical, Intuitive, Analytical

**Second Words (WHAT they learn):**
- Theorist, Practitioner, Memorizer, Connector, Creator, Researcher, Synthesizer, Experimenter, Teacher, Collector

### Topic: "What's Your Conflict Resolution Style?"

**First Words (HOW they approach conflict):**
- Direct, Diplomatic, Avoidant, Analytical, Emotional, Collaborative, Competitive, Compromising, Accommodating, Strategic

**Second Words (WHAT they prioritize):**
- Harmony Keeper, Truth Seeker, Win Maximizer, Relationship Builder, Problem Solver, Peace Maker, Justice Advocate, Efficiency Expert, Growth Catalyst, Bridge Builder

### Topic: "What's Your Productivity Style?"

**First Words (HOW they work):**
- Sprinter, Marathoner, Multitasker, Deep Focuser, Flexible, Scheduled, Reactive, Proactive, Collaborative, Solo

**Second Words (WHAT drives them):**
- Goal Crusher, Process Lover, Creative Thinker, Impact Maker, Perfectionist, Pragmatist, Innovator, Maintainer, Connector, Specialist

---

## Red Flags to Avoid

### Word Matrix Issues:
❌ **Similar words in same list** → "Explorer" and "Adventurer" (both seek new experiences)
❌ **Words that fail grammar test** → "Behavior-Focused" doesn't answer "What's your style?"
❌ **Role titles as secondWords** → "Process Builder", "Culture Builder" (awkward)
❌ **Made-up compounds** → "Budgeteer", "Growth-Pusher" (unnatural)
❌ **Adjective phrases** → "Detail-Focused" (not a noun archetype)

### Question Issues:
❌ **Wrong number of questions** → Need EXACTLY 8 (not 6, not 10)
❌ **4 options per question** → Should be EXACTLY 3 + custom input
❌ **Hypothetical scenarios** → "What would you do if..." (triggers analytical thinking)
❌ **Abstract preferences** → "How do you work?" (not immediate/visceral)
❌ **Self-assessment options** → "I'm very organized" (what they think, not what they DO)
❌ **"Should" language** → "How should you handle this?" (not gut response)
❌ **Vague scenarios** → "Someone asks for feedback" (lacks specificity)
❌ **No emotional hook** → Questions that don't create pressure/discomfort/excitement

### Structure Issues:
❌ **No warnings in explanation prompt** → AI will make up names
❌ **Questions don't map to dimensions** → Results won't be accurate
❌ **Branching on every question** → Too complex for story-matrix
❌ **No custom input enabled** → Misses nuance

### Examples of Fixes:
❌ → ✅
- "How do you work?" → "It's Monday 9am. Your inbox has 47 emails. What do you do first?"
- "I'm very organized" → "Color-code my calendar by project and set 3 alarms"
- "What would you do if someone disagreed?" → "Your manager just said you're wrong in front of the team. You..."
- "Growth-Pusher" → "Growth Catalyst" or "Developer"
- "Behavior-Focused" → "Pragmatist" or "Analyst"

---

## Success Metrics

A great story-matrix quiz should:
1. **Trigger gut reactions** - Users respond instinctively, not analytically
2. **Feel visceral** - Questions create immediate emotional responses
3. **Feel personalized** - Users say "this is so me!" or "how did this know?"
4. **Have 100 distinct outcomes** - Every combination makes sense when spoken aloud
5. **Generate natural names** - "Direct Coach" sounds right, not forced
6. **Include meaningful alternatives** - Shows nuance in results
7. **Be completable in 3-4 minutes** - 8 questions, each takes 20-30 seconds
8. **Pass quality validation** - Achieves 9/9 on [QUIZ_STORY_MATRIX_VALIDATOR.md](QUIZ_STORY_MATRIX_VALIDATOR.md)

**If your quiz meets these metrics, it's ready for production!** 🎉

---

Ready to generate! 🚀

