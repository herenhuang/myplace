# Story-Matrix Quiz Generator Prompt

*Use this prompt when creating a new story-matrix quiz from a user request*

---

## When User Requests: "Create a [TOPIC] quiz"

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
- Test: "Could someone be BOTH X and Y?" If yes, they're too similar

**Second Words (WHAT they prioritize in the topic):**
- Must be 10 DISTINCTLY different priorities
- Each should represent a clear value/focus
- Should cover diverse interests
- Test: "Are these meaningfully different?" If not, refine

### Step 3: Design 8-10 Strategic Questions

⚠️ **MANDATORY FORMAT:**
- **EXACTLY 3 options per question** (no more, no less)
- **ALWAYS set `allowCustomInput: true`** on every question
- **8-10 total questions** (not more, not less)

Each question must:
1. **Map to specific dimensions** of your word matrix
2. **Present a concrete scenario** showing what someone DOES
3. **Reveal patterns through actions**, not self-assessment

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
- ✅ All 8-10 questions with unique IDs (q1, q2, q3, etc.)
- ✅ EXACTLY 3 options per question (not 4!) + allowCustomInput: true on every question
- ✅ Each question is a concrete SCENARIO with ACTION-based options
- ✅ 10 distinct first words (approaches)
- ✅ 10 distinct second words (priorities)
- ✅ Selection prompt with exact structure
- ✅ Explanation prompt with ⚠️ warnings
- ✅ Theme colors (default to neutral: #8b7355, #c9b8a3, #fafafa, #2c2c2c)
- ✅ `type: 'story-matrix'`

---

## Quality Checklist

Before finalizing, verify:

- [ ] All 10 first words are OBVIOUSLY different
- [ ] All 10 second words are OBVIOUSLY different
- [ ] Each question targets a different dimension
- [ ] All questions have EXACTLY 3 options (not 4!)
- [ ] All questions have `allowCustomInput: true`
- [ ] All questions have unique `id` values (q1, q2, q3, etc.)
- [ ] **All questions are SCENARIO-BASED** (concrete situations, not vague preferences)
- [ ] **All options show ACTIONS** (what they DO, not what they think/prefer)
- [ ] Questions feel REAL and relatable to the topic
- [ ] Selection prompt includes "do NOT make up names"
- [ ] Explanation prompt includes ⚠️ warnings
- [ ] Explanation prompt has all 5 sections
- [ ] Theme colors are appropriate for topic (default to neutral)
- [ ] Quiz ID is lowercase with hyphens

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

❌ **"Explorer" and "Adventurer" in same list** → Too similar
❌ **"Planner" and "Organizer" in same list** → Too similar
❌ **Only 5 questions** → Not enough data (need 8-10)
❌ **4 options per question** → Should be EXACTLY 3 + custom input
❌ **No warnings in explanation prompt** → AI will make up names
❌ **Questions don't map to dimensions** → Results won't be accurate
❌ **Branching on every question** → Too complex
❌ **No custom input** → Misses nuance
❌ **Vague preference questions** → "How do you work?" instead of "It's Monday 9am, your inbox has 47 emails. What do you do first?"
❌ **Self-assessment options** → "I'm very organized" instead of "Color-code my calendar by project"
❌ **Hypothetical scenarios** → "What would you do if..." instead of "You're in [situation]. What happens?"

---

## Success Metrics

A great story-matrix quiz should:
1. Feel personalized (users say "this is so me!")
2. Have distinct outcomes (100 truly different combinations)
3. Ask engaging questions (storytelling, not abstract)
4. Generate consistent names (no "Natural Explorer" confusion)
5. Include alternatives (shows nuance)
6. Be completable in 3-5 minutes (8 questions)

---

Ready to generate! 🚀

