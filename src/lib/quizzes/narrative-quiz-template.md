# Narrative Quiz Template

## Meta Information ✅ REQUIRED
- **Quiz ID:** `my-narrative-quiz` (lowercase-hyphenated, used in URLs)
- **Title:** My Narrative Quiz Title
- **Description:** A short description shown on the welcome screen
- **Type:** narrative
- **Total Questions:** 8

---

## Theme Configuration ✅ REQUIRED
- **Primary Color:** `#ec4899` (buttons, progress bar)
- **Secondary Color:** `#fbcfe8` (accents)
- **Background Color:** `#fdf2f8`
- **Text Color:** `#831843`
- **Background Image:** `url(/path/to/background.webp), linear-gradient(135deg, #ec4899 0%, #fbcfe8 100%)`

---

## Personalization Form ⭕ OPTIONAL
*DELETE THIS ENTIRE SECTION if you don't need it. Quiz will skip straight to questions.*
*Shown before the story setup. User inputs become {{placeholders}} you can use throughout the quiz.*

**Instructions:** "Tell me a bit about yourself before we start..."

### Fields:
1. **name** (text, required)
   - Question: "What's your name?"
   - Placeholder: "Your name"

2. **friendName** (text, required)
   - Question: "Who's your best friend?"
   - Placeholder: "Friend's name"

3. **mood** (select, required)
   - Question: "How are you feeling right now?"
   - Options: ["Excited", "Nervous", "Curious", "Ready for anything"]

---

## Story Setup ⭕ OPTIONAL
*DELETE THIS ENTIRE SECTION if you don't need it. Most quizzes don't need this.*
*Shown after personalization, before Q1. Sets the scene for your narrative.*

**Title:** Your Journey Begins *(optional - can be blank)*

**Premise:**
You're a {{role}} trying to {{goal}}. Through a series of {{interaction_type}}, you'll navigate {{challenge}}. Your choices will reveal {{what_it_reveals}}.

**Timeframe:** 48 hours *(OPTIONAL - delete this entire line if time isn't relevant)*

**Characters:** *(OPTIONAL - delete this entire section if no recurring characters)*
- **Alice** (best friend) - Supportive, always has your back, tells it like it is
- **Sam** (mysterious stranger) - Creative, hard to read, makes you curious
- **Jordan** (host) - Organized, welcoming, keeps things running smoothly

---

### Story Setup Examples:

**Example 1: Time-bound party scenario**
```
**Premise:** You're about to experience 48 hours that will test how you handle social situations. Your choices will reveal your communication style.
**Timeframe:** 48 hours
**Characters:** [Alice, Sam, Jordan as above]
```

**Example 2: Investment allocation (no time, no characters)**
```
**Title:** The Allocation Game
**Premise:** You're an investor trying to secure allocation in a hot founder's round. Through a series of text exchanges, you'll navigate the founder's vetting process. Your approach will reveal whether you get in.
(No Timeframe - time passes but isn't the focus)
(No Characters - just you and the founder in questions)
```

**Example 3: Minimal (just premise)**
```
**Premise:** You're trying to convince someone to take a chance on you. How you approach it will reveal your persuasion style.
(No Title, no Timeframe, no Characters - totally fine!)
```

---

## Custom Images ⭕ OPTIONAL
*DELETE THIS ENTIRE SECTION if you don't need custom images. Uses defaults.*

- **Analyzing Screen Image:** `/path/to/analyzing-character.png`
- **Question Bubble Image:** `/path/to/question-character.png`

---

## Analyzing Messages ⭕ OPTIONAL
*DELETE THIS ENTIRE SECTION if you don't need custom messages. Uses defaults.*
*Shown while AI calculates results. 4-6 short messages.*

- "Thinking about your answers..."
- "Analyzing your choices..."
- "Almost there..."
- "Getting your results ready..."

---

# Questions ✅ REQUIRED

*At least 1 question required. Each question must have a Type.*

## Scene-Setting Before First Real Question

Want to build dramatic tension before the first choice? Use **scene-setting questions** with just a "Continue" button:

```markdown
## Q1: opening-scene
**Type:** HARD-CODED

### Narrative:
You're at your desk when the notification comes through. Alex Chen, the founder you've been tracking for months, just accepted your LinkedIn request. Your heart races.

### Options:
- **continue** → Q2
  - "Continue"

---

## Q2: the-message
**Type:** HARD-CODED

### Narrative:
Five minutes later: "Hey. Heard you're interested in the round. It's tight but I'm talking to a few folks. Let's see if we're aligned." You have maybe 48 hours before they close allocation.

### Options:
- **continue** → Q3
  - "Continue"

---

## Q3: first-real-choice
**Type:** OPEN-ENDED

### Narrative:
You decide to respond immediately. What do you write?
```

**This creates a linear story intro** before the first decision point. Users just click "Continue" through Q1 and Q2 to build tension, then Q3 is their first real answer.

---

## Question Types Explained:

### `OPEN-ENDED`
User types their own answer in a text box. No pre-written options.
- **Best for:** Getting genuine, personal responses
- **Example:** "What's going through your mind right now?"

### `HARD-CODED`
Multiple choice with 2-4 fixed options. User clicks one.
- **Best for:** Guiding specific narrative paths or measuring clear choices
- **Example:** "Do you go to the party?" → "Yes" / "No" / "Maybe later"
- **Can branch:** Each option can lead to different next questions

### `HYBRID`
Shows pre-written options AND lets user write their own answer if they want.
- **Best for:** Flexibility - give options but allow creativity
- **Example:** Shows 3 response templates + "Or write your own..."

---

## Q1: arrival-time
**Type:** `OPEN-ENDED` *(required - choose OPEN-ENDED, HARD-CODED, or HYBRID)*
**Dimension:** timing *(optional - internal label for what this tests, not shown to user)*
**Time Marker:** Day 1, 9:00am *(optional - for narrative continuity, not shown to user)*

### Narrative:
Good morning {{name}}! You wake up to a text from {{friendName}}. There's a party tonight at Jordan's place. It starts at 6pm but people will be there until midnight. When are you planning to show up, and why that time?

---

## Q2: social-approach
**Type:** `HARD-CODED`
**Dimension:** social-confidence *(optional - can be blank or deleted)*
**Time Marker:** Day 1, 6:15pm *(optional - can be blank or deleted)*

### Narrative:
You arrive at the party. There are about {{crowd_size}} people scattered around Jordan's apartment. {{friendName}} waves from across the room. What do you do?

*Note: YOU write the full question. For Q2+, AI adds light conversational flavor based on previous answers (e.g., referencing what they said earlier), but your narrative is the foundation. Q1 shows exactly as written since there's no previous context.*

### Options:
- **confident** → Q3
  - "Wave back and walk straight over with a smile"

- **cautious** → Q4
  - "Scan the room first, see who else is here, then slowly make my way over"

- **nervous** → Q3
  - "Pull out my phone and text them 'I'm here!' instead of going over"

*Note: The `value` (e.g., "confident") is used for analysis. The `nextQuestionId` determines branching.*

---

## Q3: conversation-depth
**Type:** `HYBRID`
**Dimension:** vulnerability
**Time Marker:** Day 1, 7:30pm

### Narrative:
You're chatting with {{friendName}} when Sam appears next to you. "Hey! I've heard about you from {{friendName}}," Sam says with a curious smile. How do you respond?

### Options:
- **playful**
  - "Only good things I hope 😏"

- **genuine**
  - "Really? What did they say?"

- **deflect**
  - "Ha, I'm probably not that interesting"

- **[CUSTOM INPUT OPTION]**
  - "Or write your own response..."

*Note: Hybrid questions allow both predefined options AND custom text input. Great for flexibility.*

---

## Q4: conflict-handling
**Type:** `OPEN-ENDED`
**Dimension:** conflict-style
**Time Marker:** Day 1, 8:45pm

### Narrative:
Things are getting lively. Someone just spilled a drink on the couch and two people are arguing about whose fault it was. The energy in the room shifted. What's going through your mind right now, and what do you do?

---

## Q5: decision-point
**Type:** `HARD-CODED`
**Dimension:** spontaneity
**Time Marker:** Day 1, 10:30pm

### Narrative:
Jordan announces that a small group is heading to a late-night diner after this. You have work tomorrow morning. {{friendName}} looks at you expectantly. What do you do?

### Options:
- **adventurous** → Q6
  - "I'm in! One late night won't kill me."

- **practical** → Q6
  - "I should probably head home, but text me how it goes!"

- **conditional** → Q6
  - "How late are we talking? If it's just an hour, I'm down."

---

## Q6: reflection
**Type:** `OPEN-ENDED`
**Dimension:** self-awareness
**Time Marker:** Day 2, 8:00am

### Narrative:
It's the next morning. You're thinking about last night. What stood out to you most about the whole experience?

---

## Q7: follow-up-scenario
**Type:** `HYBRID`
**Dimension:** relationship-building
**Time Marker:** Day 2, 2:00pm

### Narrative:
You get a text from Sam: "Hey, that was fun last night. Want to grab coffee sometime this week?" How do you respond?

### Options:
- **enthusiastic**
  - "Yes! I'm free Thursday or Friday afternoon"

- **interested**
  - "Sure, that could be fun. When works for you?"

- **cautious**
  - "Maybe! I'll check my schedule and let you know"

- **[CUSTOM INPUT OPTION]**
  - "Or write your own response..."

---

## Q8: closing-question
**Type:** `OPEN-ENDED`
**Dimension:** final-reflection
**Time Marker:** Day 2, 11:59pm

### Narrative:
It's been 48 hours since this all started. Looking back, what did this whole experience teach you about yourself?

---

# Word Matrix Configuration ⭕ OPTIONAL
*DELETE THIS ENTIRE SECTION if you're using fixed personalities (archetype type) instead.*
*Used to generate the final archetype. Mix and match for 100 unique combinations.*

## First Words (Energy/Quality - 10 words)
How intense/what flavor their behavior has:

1. Adventurous
2. Thoughtful
3. Confident
4. Cautious
5. Spontaneous
6. Analytical
7. Warm
8. Bold
9. Gentle
10. Dynamic

## Second Words (Role/Style - 10 words)
What type of person they are in social situations:

1. Connector
2. Observer
3. Leader
4. Supporter
5. Explorer
6. Planner
7. Catalyst
8. Mediator
9. Innovator
10. Guardian

## Selection Prompt
*Instructions for AI to pick the best word combination based on quiz answers.*

```
You're analyzing someone's social and decision-making style from their narrative quiz answers. Your job: pick ONE combination that fits them best.

Here are your words:
FIRST WORDS (their energy): {{firstWords}}
SECOND WORDS (their role): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person
2. Look for patterns in how they approach social situations, decisions, and reflection
3. Pick the FIRST WORD that matches their energy/approach
4. Pick the SECOND WORD that matches their role/style
5. Each word means something specific - choose precisely
6. Find 2 alternatives they were close to

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, personal subtitle that captures their specific vibe. Complete sentence. Use 'you' language.",
  "reasoning": "2-3 sentences explaining why this combination fits. Use the exact [FirstWord SecondWord] format.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Why this was close"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Why this was close"}
  ]
}
```

---

# AI Explanation Configuration ⭕ OPTIONAL
*DELETE THIS ENTIRE SECTION if you don't want AI-generated explanations.*
*Final results page content. Uses Claude to generate personalized explanation.*

**Enabled:** Yes
**Model:** `claude-3-5-sonnet-20241022`

## Prompt Template

```
You're talking to someone about their results. They got "{{archetype}}" - {{tagline}}.

TARGET LENGTH: ~1500-2000 words total. Be conversational and warm.

Write like you're having a real conversation - honest, direct, human.

<section>
# {{archetype}}
{{tagline}}

## Your Style Blueprint
Talk about what they demonstrated in their answers. Be specific and reference what they actually said.
</section>

<section>
## What I Noticed
Point out 3 specific patterns from their answers:
- When you said [specific answer], I saw [insight]
- The way you approached [scenario] tells me [observation]
- [Another connection]
</section>

<section>
## You're Also Close To...
{{alternatives}}

For each alternative, explain in 1-2 sentences why they've got some of this energy too.
</section>

<section>
## What This Means For You
Give them practical insights about what this archetype means for how they move through the world. Be real and specific.
</section>

<section>
## Where It Gets Tricky
Share 1-2 ways this style can get complicated. Be kind but honest.
</section>

<section>
## Advice For You
Give 2-3 practical, doable suggestions based on their archetype. Talk like a friend giving real advice.
</section>

<section>
## Bottom Line
One real insight or question that helps them think about themselves. No fluff.
</section>

Their full answers:
{{answers}}

IMPORTANT: Short, punchy sentences. Use contractions. Make every word count. Make them feel seen, not evaluated.
```

---

# Notes & Tips

## What's Required vs Optional:

### ✅ REQUIRED (Quiz won't work without these):
- **Meta Information** - Quiz ID, title, type
- **Theme Configuration** - Colors and styling
- **Questions** - At least 1 question

### ⭕ OPTIONAL (Delete entire sections if not needed):
- **Personalization Form** - Skip if you don't need user input before quiz
- **Story Setup** - Skip if you don't need narrative intro screen
- **Custom Images** - Skip to use defaults
- **Analyzing Messages** - Skip to use defaults
- **Word Matrix** - Skip if using fixed personalities (archetype type)
- **AI Explanation** - Skip for static results

**The converter will only include what you provide - missing sections are automatically skipped!**

---

## Writing Voice: Who Are You Talking To?

### 📝 Story/Narrative Sections (User-Facing)
Write as if speaking **TO the user** - they're the protagonist:
- ✅ "You wake up to a text from {{friendName}}..."
- ✅ "{{name}}, are you ready?"
- ✅ "What do you do?"
- ✅ "You're chatting with Sam when..."

**These appear on screen during the quiz. The user is experiencing the story.**

### 🤖 AI Prompt Sections (System-Facing)
Write as if instructing **the AI about the user** - you're giving analysis instructions:
- ✅ "You're analyzing someone's social style..."
- ✅ "Pick the best combination for **them**..."
- ✅ "Reference specific things **they** said..."
- ✅ "Talk about what **they** demonstrated..."

**These are backend instructions. The AI is analyzing "them" (the quiz taker).**

### 💾 What Gets Saved vs Displayed:
- **User's answers** = Saved and analyzed ✅
- **Your base scenario text** = Saved for context ✅
- **AI-adapted narrative flavor** = Shown to user for immersion, but NOT saved/analyzed ❌

This means the AI only analyzes what the **user actually wrote**, not its own embellishments!

### ✍️ How AI Adaptation Works:
**YOU write the full question every time.** The AI just adds conversational glue.

**Example - What you write for Q3:**
```
You get a text from the founder. They want to know more about your background. What do you say?
```

**What the AI might adapt it to for display:**
```
After you mentioned {{previousAnswer}} in your intro, the founder texts: "Tell me more about your experience with {{topic}}." What do you say?
```

**Key point:** You always write the complete narrative. AI just personalizes the setup slightly based on previous answers. Your question is always the foundation.

---

## Question Type Guide:
- **OPEN-ENDED**: Free text input only, no predefined options
- **HARD-CODED**: Multiple choice only, fixed options with branching
- **HYBRID**: Both predefined options AND custom input field

## Placeholder Variables:
- Use `{{variableName}}` for personalization data (from form)
- Use `{{crowd_size}}` for AI-generated context
- AI will adapt these naturally in Q2+ narrative text

## Branching Logic:
- Use `→ Q3` notation to show which question comes next
- If no branch specified, goes to next question in order
- Custom inputs can be analyzed for branching too

### Branching Example: Different paths converge later

**Scenario:** Q2 asks "Take the call or text instead?" Both lead to different Q3s, then merge at Q4.

```markdown
## Q2: call-decision
**Type:** HARD-CODED

### Narrative:
The founder's calling. Do you pick up?

### Options:
- **take-call** → Q3a-phone-conversation
  - "Pick up the call"
- **text-instead** → Q3b-text-conversation
  - "Let it go to voicemail, text back"

---

## Q3a-phone-conversation
**Type:** OPEN-ENDED

### Narrative:
You pick up. "Hey! Tell me about your background," they say. What do you tell them?

---

## Q3b-text-conversation
**Type:** OPEN-ENDED

### Narrative:
You text: "Sorry, missed your call!" They reply: "No worries. Tell me about your background?" What do you write back?

---

## Q4: investment-thesis
**Type:** OPEN-ENDED

### Narrative:
The founder wants to know your investment thesis. What do you tell them?

*Note: Both Q3a and Q3b lead here. AI will adapt framing based on call vs text.*
```

### Alternative: Same question, AI adapts context

If the question is fundamentally the same (just different medium), you can skip branching:

```markdown
## Q2: call-decision
### Options:
- **take-call** → Q3
- **text-instead** → Q3

## Q3: background-question
### Narrative:
The founder wants to know about your background. What do you tell them?

*AI will adapt: "You pick up..." vs "You text back..." based on Q2.*
```

## Dimensions (Optional Metadata):
Internal labels for what each question tests (e.g., "vulnerability", "conflict-handling").
- **NOT shown to users** - this is just for YOU to organize
- Can help AI understand intent when analyzing answers
- **Can be left blank or deleted** - totally optional

## Time Markers (Optional Metadata):
Tracks narrative time progression (e.g., "Day 1, 9am" → "Day 2, 11pm").
- **NOT shown to users** - this is just for YOU to track story flow
- Useful only if your quiz has time-based continuity
- **Can be left blank or deleted** - not required

---

**Ready to customize? Replace all the placeholder content above with your actual narrative quiz!**
