# Investor Allocation Quiz

## Meta Information ✅ REQUIRED
- **Quiz ID:** `investor-allocation-quiz`
- **Title:** Can You Get Allocation?
- **Description:** You're an early-stage investor trying to secure a spot in one of the hottest rounds in town. Can you convince the founder to let you in?
- **Type:** narrative
- **Total Questions:** 8

---

## Theme Configuration ✅ REQUIRED
- **Primary Color:** `#10b981` (emerald green - money/success)
- **Secondary Color:** `#34d399` (lighter emerald)
- **Background Color:** `#f0fdf4` (very light green)
- **Text Color:** `#064e3b` (dark emerald)
- **Background Image:** `linear-gradient(135deg, #10b981 0%, #34d399 50%, #f0fdf4 100%)`

---

## Personalization Form ⭕ OPTIONAL
*Delete if not needed*

**Instructions:** "First, tell us a bit about yourself..."

### Fields:
1. **name** (text, required)
   - Question: "What's your name?"
   - Placeholder: "Your name"

2. **fundName** (text, required)
   - Question: "What fund are you with?"
   - Placeholder: "Fund name"

---

## Story Setup ⭕ OPTIONAL

**Title:** The Allocation Game

**Premise:**
You're an early-stage startup investor trying to get allocation in one of the hottest new startups in town. Through a series of interactions with the founder, you'll try to secure your spot. Your choices will reveal what kind of investor you are — and whether you get in.

**Characters:**
- **Alex Chen** (Founder, Expo) - You've had a few brief interactions. Alex is generally neutral but busy and slightly standoffish. Not rude, just has a lot going on and wants to close the round quickly.
- **Sam** (Your Partner) - Your peer in making investment decisions. Organized, trustworthy, and keeps you grounded.

---

## Analyzing Messages ⭕ OPTIONAL

- "Reviewing your interactions..."
- "Alex is making a decision..."
- "Considering the outcome..."
- "Almost there..."
- "Getting your results ready..."

---

# Questions ✅ REQUIRED

## Q1: opening-scene
**Type:** HARD-CODED
**Dimension:** intro
**Time Marker:** Day 1

### Story Narrative:
You're at your desk when the notification comes through. Alex Chen, the founder you've been trying to get connected with for months, just emailed you back. Your heart races.

### Options:
- **continue** → meeting-schedule
  - "Continue"

---

## Q2: meeting-schedule
**Type:** OPEN-ENDED
**Dimension:** flexibility
**Time Marker:** Day 1, 10:15am

### Story Narrative:
Their email reads: "Hey! It's been a busy few weeks closing this round though we're finally at the end. Free for a quick call at 3PM?"

The issue is that you have a conflict at that time already. How do you respond?

### AI Prompt:
This tests flexibility. Categorize their response:
- HIGH flexibility: They reschedule their conflict to accommodate Alex
- MEDIUM flexibility: They propose alternative times respectfully
- LOW flexibility: They decline or say they can't make it work

Save this evaluation for final decision.

---

## Q3: meeting-outcome
**Type:** HARD-CODED
**Dimension:** transition
**Time Marker:** Day 1, 10:45am

### Story Narrative:
You hit send. A few minutes later, Alex replies.

### AI Prompt:
Adapt this based on Q2 response:
- If HIGH/MEDIUM flexibility (rescheduled or proposed alternatives):
  "Perfect, see you at [their proposed time]!"
  Brief pause, then: "Actually wait — crazy day just got crazier. Let's pivot to text instead? Easier for both of us."

- If LOW flexibility (declined or couldn't make it):
  "No worries, totally understand."
  Then: "Actually, let's just handle this over text. Easier anyway."

Show the consequence of their Q2 choice, then transition everyone to text conversation.

### Options:
- **continue** → text-convo
  - "Continue"

---

## Q4: text-convo
**Type:** OPEN-ENDED
**Dimension:** speed
**Time Marker:** Day 1, 2:30pm

### Story Narrative:
Later that afternoon, you get a text from Alex: "Hey sorry — crazy day. Just got Sequoia to lead. Could maybe squeeze you in for a small allocation if you're quick. How fast can you make a decision?"

### AI Prompt:
Adapt the opening based on Q3 outcome:
- If there was a scheduled call that got cancelled: "Sorry to bail on our call earlier, but crazy day. Just got Sequoia to lead..."
- If there was never a call scheduled: Keep as written above

Categorize their response:
- FAST: 24-48 hours
- MEDIUM: 3-5 days
- SLOW: Week+ or vague

Save for final evaluation.

---

## Q5: check-size
**Type:** OPEN-ENDED
**Dimension:** commitment
**Time Marker:** Day 1, 3:15pm

### Story Narrative:
Alex texts back about your timeline. Then: "Makes sense. What check size do you normally write?"

### AI Prompt:
Adapt the first sentence to acknowledge their Q4 answer:
- If FAST (24-48 hours): "That's quick, I like it."
- If MEDIUM (3-5 days): "Alright, that could work."
- If SLOW (week+ or vague): "Hmm, might be tight but let's see."

Then always ask about check size.

Evaluate their response:
- GOOD: >$25k, specific and confident
- ACCEPTABLE: >$25k but vague or hesitant
- RED FLAG: <$25k or evasive

Save for final evaluation.

---

## Q6: reference-check
**Type:** OPEN-ENDED
**Dimension:** relationships
**Time Marker:** Day 1, 4:00pm

### Story Narrative:
Alex responds to your check size info. Then: "One last thing — what do you think your founders would say about working with you?"

### AI Prompt:
Adapt the first sentence based on their Q5 answer:
- If GOOD check size: "Great, that works."
- If ACCEPTABLE check size: "Got it, thanks."
- If RED FLAG check size: "Okay." (neutral/slightly cold)

Then always ask the reference question.

Evaluate their response:
- STRONG: Shows humility, specific value-add, real examples
- MEDIUM: Generic but positive, somewhat self-aware
- WEAK: Overly promotional, generic platitudes, or evasive

Save for final evaluation.

---

## Q7: alex-decision
**Type:** HARD-CODED
**Dimension:** outcome
**Time Marker:** Day 1, 5:30pm

### Story Narrative:
You send your answer about what founders would say. A few moments later, Alex replies: "OK, cool, appreciate the context."

Then another message comes through.

### AI Prompt:
Analyze all previous answers to make a binary decision.

**APPROVAL CRITERIA (need 3+ to approve):**
1. Q2 (Flexibility): HIGH or MEDIUM (NOT low)
2. Q4 (Speed): FAST or MEDIUM (NOT slow/vague)
3. Q5 (Check Size): GOOD or ACCEPTABLE (NOT red flag)
4. Q6 (References): STRONG or MEDIUM (NOT weak)

**Decision Logic:**
- If 3+ criteria met: APPROVED
- If 2 or fewer met: REJECTED

Generate Alex's response:
- **APPROVED**: "Let's do it. Looping in legal tonight."
- **REJECTED**: "I think we're full this round, but really appreciate you reaching out."

Save the decision (APPROVED or REJECTED) for Q8 and results.

### Options:
- **continue** → sam-twist
  - "Continue"

---

## Q8: sam-twist
**Type:** HARD-CODED
**Dimension:** cliffhanger
**Time Marker:** Day 1, 5:35pm

### Story Narrative:
You stare at Alex's message, processing what just happened. Before you can respond, your phone buzzes. It's Sam, your partner.

### AI Prompt:
Generate Sam's text based on Alex's decision from Q7:

**If APPROVED:**
Sam's text: "WAIT — just saw something on the cap table. There's a major red flag with their existing investors. We should NOT do this deal. Call me ASAP."

**If REJECTED:**
Sam's text: "Did you see?? Alex just announced their $20M seed on Twitter. I thought we had an in here? We totally missed out on this one."

This creates dramatic irony:
- Got in? But should you have? (Warning about red flags)
- Rejected? But you should've gotten in! (Missed opportunity)

### Options:
- **continue** → [Results Page]
  - "See Results"

---

# Word Matrix Configuration ✅ REQUIRED

## First Words (Investor Energy - 10 words)
How they approach deals and decisions:

1. Aggressive
2. Thoughtful
3. Strategic
4. Impulsive
5. Calculated
6. Persistent
7. Cautious
8. Bold
9. Flexible
10. Demanding

## Second Words (Investor Style - 10 words)
What type of investor they are:

1. Dealmaker
2. Partner
3. Operator
4. Opportunist
5. Strategist
6. Supporter
7. Closer
8. Negotiator
9. Collaborator
10. Executor

## Selection Prompt

You're Alex Chen, the founder, and you just finished evaluating this investor through your text exchanges. You've already made your APPROVED or REJECTED decision in Q7. Now you need to give them an investor archetype that describes their approach.

Here are your words:
FIRST WORDS (their energy): {{firstWords}}
SECOND WORDS (their style): {{secondWords}}

What they did:
{{answers}}

Your decision from Q7: {{decision}} (APPROVED or REJECTED)

EVALUATION CRITERIA:

**Flexibility (Q2):**
- Did they reschedule their conflict? (Flexible)
- Propose alternatives? (Strategic)
- Decline? (Demanding/Cautious)

**Speed (Q4):**
- 24-48 hours? (Aggressive/Bold)
- 3-5 days? (Thoughtful/Strategic)
- Week+ or vague? (Cautious/Slow)

**Check Size (Q5):**
- >$50k confident? (Bold/Aggressive)
- $25-50k? (Strategic/Calculated)
- <$25k or vague? (Cautious/Opportunist)

**References (Q6):**
- Humble + specific value? (Partner/Collaborator)
- Generic but positive? (Supporter/Dealmaker)
- Promotional or vague? (Opportunist)

Pick the archetype that best matches their OVERALL pattern, not just one answer.

Respond in JSON:
{
  "decision": "APPROVED" or "REJECTED" (use the decision from Q7),
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy sentence about their investor style. Use 'you' language.",
  "reasoning": "2-3 sentences explaining why they got approved/rejected and why this archetype fits.",
  "specificObservations": [
    "One specific thing you noticed about their approach",
    "Another observation about how they handled the process",
    "A third detail that stood out (positive or negative)"
  ]
}

IMPORTANT: The decision (APPROVED/REJECTED) should match what you already decided in Q7. Don't change it here.

---

# AI Explanation Configuration ✅ REQUIRED

**Enabled:** Yes
**Model:** `claude-3-5-sonnet-20241022`

## Prompt Template

You're delivering the results as Alex Chen, the founder. You've decided whether to give them allocation ({{decision}}) and identified their investor archetype.

TARGET LENGTH: ~800-1200 words total. Be direct and honest.

Write like a founder giving candid feedback - professional but real, no BS.

**CONTEXT FROM EVALUATION:**
- Decision: {{decision}}
- Archetype: {{archetype}}
- Tagline: {{tagline}}
- Reasoning: {{reasoning}}
- Specific Observations: {{specificObservations}}

Their full responses:
{{answers}}

**FORMAT FOR APPROVED:**

{{tagline}}

{{reasoning}}

---

## What I Noticed

Here's what stood out during our exchanges:

[Reference 2-3 specific things from their answers - their flexibility in Q2, their speed in Q4, their check size in Q5, or their self-awareness in Q6. Be specific: "When you said X..." or "The way you handled Y..."]

---

## Your Investor Style: {{archetype}}

[2-3 sentences about what this archetype means. How do they approach deals? What makes them this type? Reference their actual behavior.]

---

## What This Means

[1-2 paragraphs: What does being a {{archetype}} investor mean for how they operate? What are the strengths? Where might they need to watch out?]

---

## The Sam Situation

[Address the cliffhanger: Sam just warned about red flags on the cap table. Write 1-2 sentences acknowledging this creates a tough situation for them. Something like: "Sam's not wrong to be cautious, but sometimes the best deals come with noise. What you do next matters."]

---

**FORMAT FOR REJECTED:**

## Why This Didn't Work Out

{{reasoning}}

[2-3 sentences being direct about what didn't work. Reference specific moments from their answers. Be honest but not harsh.]

---

## Your Investor Style: {{archetype}}

[Even though they got rejected, they still have an archetype. 2-3 sentences about what kind of investor they are based on how they approached this.]

---

## What This Reveals

[1-2 paragraphs about what their {{archetype}} style means. Even in rejection, there are insights about their approach.]

---

## The Sam Situation

[Address the cliffhanger: Sam just said they missed out on a $20M announcement. Write 1-2 sentences like: "Sam's right that timing matters in this game. Sometimes you miss the ones that get away. The question is what you learn from it."]

---

IMPORTANT:
- Keep it real and direct - you're Alex giving honest feedback
- Reference specific moments from their answers
- Make them feel like they learned something regardless of outcome
- Short, punchy sentences
- No fluff or generic advice
