# Narrative Quiz Creation Guide

*Create immersive, story-driven quizzes where users live through a continuous narrative.*

**Not sure if Narrative is right for your quiz?** See [QUIZ_TYPE_SELECTOR.md](QUIZ_TYPE_SELECTOR.md) - Narrative is for quizzes with natural timelines and recurring characters.

---

## 🎬 What is a Narrative Quiz?

A **narrative quiz** presents ONE continuous story that unfolds chronologically. Users don't just answer disconnected scenarios—they LIVE THROUGH a specific journey with recurring characters, building stakes, and sequential scenes that adapt to their previous choices.

## 📊 Three Quiz Types at a Glance

| Type | Questions | Results | Story Arc |
|------|-----------|---------|-----------|
| **Archetype** | Disconnected scenarios or preferences | 4-8 fixed personalities | No story |
| **Story-Matrix** | 10 disconnected scenarios | 100 dynamic combinations | No story |
| **Narrative** | 1 continuous story (10 scenes) | 100 dynamic combinations | **Full story arc** |

---

## 🎯 When to Use Narrative Type

### ✅ Perfect For:
- **Management/leadership simulations** - "Your first 2 weeks as manager"
- **Relationship journeys** - "First month dating someone new"  
- **Crisis scenarios** - "48 hours handling a major incident"
- **Travel narratives** - "7 days in a new country"
- **Career transitions** - "Your first 90 days in a new role"
- **Life decisions** - "Planning your wedding over 6 months"

### ❌ Not Good For:
- Topics with no natural timeline (e.g., "Which food are you?")
- Independent preferences (e.g., "Pick your favorite hobby")
- Simple either/or personality tests

---

## 🎨 The Magic: Adaptive Story Scenes

### How It's Different from Story-Matrix:

**Story-Matrix** (Disconnected):
```
Q1: You're at a hostel. What do you do?
Q2: You're at a restaurant. What do you do?
Q3: You're at the airport. What do you do?
```
→ No connection between scenes

**Narrative** (Connected):
```
Q1: Monday 9am. You walk into your new team's office...
Q2: Monday 11am. After [what you did in Q1], Sarah approaches you...
Q3: Tuesday 2pm. Following [your Q1 approach] and [your Q2 response], the team meeting feels...
```
→ Story adapts based on previous choices!

---

## 📝 Core Components

### 1. Story Setup (Required)

Shows BEFORE Q1 to set the scene:

```typescript
storySetup: {
  title: "Your First Two Weeks as Manager",
  premise: `You've just been promoted to lead a product team of 5 people.
  
  The Situation:
  The previous manager left suddenly a month ago. The team is behind on a 
  critical product launch that ships in 3 weeks. Your boss said this morning: 
  "Turn this around in 90 days or we're restructuring."
  
  The Team:
  - **Sarah** (Senior Engineer, 4 years): Talented but openly interviewing elsewhere
  - **Marcus** (Designer, 2 years): Creative but clashes with the PM constantly
  - **Jordan** (Product Manager, 1 year): Overwhelmed and defensive  
  - **Sam** (Junior Engineer, 6 months): Eager but drowning in tasks
  - **Taylor** (Engineer, 3 years): Quiet observer, hard to read
  
  It's Monday, 9am. Week 1. Let's see how you lead...`,
  timeframe: "2 weeks",
  characters: [
    { name: "Sarah", role: "Senior Engineer", personality: "Flight risk, talented" },
    { name: "Marcus", role: "Designer", personality: "Creative but confrontational" },
    { name: "Jordan", role: "Product Manager", personality: "Stressed and defensive" },
    { name: "Sam", role: "Junior Engineer", personality: "Eager but overwhelmed" },
    { name: "Taylor", role: "Engineer", personality: "Quiet observer" }
  ]
}
```

**Key Elements:**
- **Title** - Sets expectations
- **Premise** - WHO you are, WHAT's happening, WHERE, WHEN, WHY it matters
- **Characters** - Named people who recur throughout
- **Stakes** - What's at risk
- **Timeframe** - How long the story spans

---

### 2. Base Scenarios (10 Sequential Questions)

Each question has TWO parts:

#### Part A: Base Scenario (You Write This)

The core scene WITHOUT personalization:

```typescript
{
  id: 'q2-first-1on1',
  baseScenario: {
    timeMarker: "Monday, 11am - Week 1",
    dimension: "people_management",  // What this tests
    coreSetup: `First 1:1 with Sarah, the senior engineer who is interviewing elsewhere. 
    She sits down and immediately says: "I need to be honest. I've been here 4 years. 
    This team used to be incredible. Now? I'm interviewing at other companies." 
    She crosses her arms, waiting for your response.`
  },
  options: [
    { label: 'Ask: "What would it take for you to want to stay?"', value: 'empathetic_inquiry' },
    { label: 'Say: "Give me 30 days to show you it can be different"', value: 'confident_commitment' },
    { label: 'Ask: "Help me understand what broke down?"', value: 'diagnostic_approach' }
  ],
  allowCustomInput: true
}
```

#### Part B: AI Adapts It (Happens Automatically)

Before showing Q2, the system calls AI:

**Input to AI:**
- Base scenario for Q2
- What user chose in Q1
- Story setup + characters

**AI Output:**
```
"Monday, 11am - Week 1

After you gathered everyone for that quick standup earlier (Marcus looked 
surprised you jumped right in), Sarah walks into your office and closes 
the door. Before you can say anything, she says: 'I need to be honest. 
I've been here 4 years. This team used to be incredible. Now? I'm 
interviewing at other companies.' She crosses her arms, watching to see 
if you're like the last manager. What do you say?"
```

The scene now **references Q1** and feels continuous!

---

### 3. Question Structure Requirements

**For Narrative Quizzes, Each Question Needs:**

```typescript
{
  id: 'q3-tuesday-standup',  // Include timing in ID
  
  // BASE SCENARIO (not adapted yet)
  baseScenario: {
    timeMarker: "Tuesday, 2pm - Week 1",  // REQUIRED: When this happens
    dimension: "conflict_management",      // REQUIRED: What dimension this tests
    coreSetup: "During standup, Marcus interrupts Jordan..."  // REQUIRED: The scene
  },
  
  // OPTIONS (same for everyone)
  options: [
    { label: 'Immediate action 1', value: 'approach_1' },
    { label: 'Immediate action 2', value: 'approach_2' },
    { label: 'Immediate action 3', value: 'approach_3' }
  ],
  
  // ALWAYS true for narrative
  allowCustomInput: true
}
```

---

## 🎭 The 10-Scene Story Arc

### Recommended Structure:

**Opening (Q1-2): Introduction**
- Q1: First impression/initial approach
- Q2: First real challenge/conversation

**Rising Action (Q3-5): Challenges Emerge**  
- Q3: First conflict or obstacle
- Q4: Pressure increases
- Q5: Complication/competing priorities

**Climax (Q6-7): Crisis Point**
- Q6: Major decision or crisis
- Q7: High-stakes moment

**Falling Action (Q8-9): Resolution**
- Q8: Dealing with aftermath
- Q9: New pattern/direction

**Conclusion (Q10): Reflection**
- Q10: Success definition or looking forward

---

## 📐 Writing Immersive Base Scenarios

### The 5 Immersion Elements (MUST HAVE):

1. **SPECIFIC TIME/PLACE**
   ❌ "Monday morning"
   ✅ "Monday 9:30am, you're in the conference room"

2. **SENSORY/VISUAL DETAILS**
   ❌ "Someone looks upset"  
   ✅ "You see Sarah's jaw clenched, staring at her screen"

3. **SOMETHING HAPPENING RIGHT NOW**
   ❌ "How do you handle conflict?"
   ✅ "Marcus just raised his voice at Jordan during standup"

4. **NAMED PEOPLE & STAKES**
   ❌ "A team member missed a deadline"
   ✅ "Sam's missed the 3rd deadline this month. The client called your boss"

5. **FEEL THE TENSION**
   ❌ "Plans changed"
   ✅ "Everyone's worked nights for Friday's launch. Thursday evening: 'Wait 2 weeks'"

### Before & After Examples:

**❌ TOO VAGUE:**
```typescript
coreSetup: "How do you give feedback to your team?"
```

**✅ IMMERSIVE:**
```typescript
coreSetup: "Friday, 4pm - Week 1

You just watched Jordan present to the exec team. It wasn't great. They 
fumbled key numbers and got defensive when questioned. Jordan's walking 
back to their desk now, shoulders slumped, looking defeated. What's your move?"
```

---

**❌ TOO VAGUE:**
```typescript
coreSetup: "A team member needs guidance on a project."
```

**✅ IMMERSIVE:**
```typescript
coreSetup: "Wednesday, 2pm - Week 1

Taylor knocks on your door (you're mid-email). 'Hey, got a sec? I'm totally 
stuck on this API redesign. REST or GraphQL? Loop in the frontend team now 
or later?' They're clearly anxious about making the wrong call. You can see 
their laptop open with 3 tabs of documentation. What do you say?"
```

---

## 🔄 How AI Adaptation Works

### The Flow:

```
USER STARTS QUIZ
↓
Sees Story Setup (static)
↓
Q1 appears (static - no previous choices yet)
User answers Q1
↓
[API CALL]
Input: Q2 base scenario + Q1 answer + story context
Output: Adapted Q2 text that references Q1
↓
User sees adapted Q2 (feels continuous)
User answers Q2
↓
[API CALL]  
Input: Q3 base scenario + Q1&Q2 answers + story context
Output: Adapted Q3 text that references Q1 and Q2
↓
... continues for Q4-Q10 ...
↓
RESULTS: AI analyzes full journey through THIS SPECIFIC STORY
```

### Example Adaptation:

**Base Q5 (what you write):**
```typescript
baseScenario: {
  timeMarker: "Thursday, 4pm - Week 1",
  dimension: "crisis_management",
  coreSetup: "Production goes down. The deploy failed. Customers are impacted. 
  The team Slack channel is exploding with messages. What do you do?"
}
```

**Adapted Q5 (if user was hands-on in Q1-4):**
```
"Thursday, 4pm - Week 1

You've been pretty hands-on this week—reviewing code, joining standups, 
checking in constantly. Now the deploy fails and production goes down. 
Sarah posts in Slack: 'The system is down. I told you we needed more time 
to test.' You can sense the team's frustration with how involved you've been. 
What do you do?"
```

**Adapted Q5 (if user was delegating in Q1-4):**
```
"Thursday, 4pm - Week 1

You've been giving the team space to self-organize this week. Now your phone 
rings—it's Sam: 'Hey, uh, the deploy failed and production is down. Everyone's 
looking at each other wondering who's in charge of fixing it. What do you 
want us to do?' What do you do?"
```

**Same base scenario, adapted to their journey!**

---

## 🎯 Complete Narrative Quiz Template

```typescript
import { QuizConfig } from './types'

export const yourNarrativeQuiz: QuizConfig = {
  id: 'your-narrative-quiz',
  title: 'Your Story Title',
  description: 'A compelling hook (e.g., "Navigate your first 2 weeks as a manager")',
  type: 'narrative',  // ← KEY: This enables adaptive scenes
  
  theme: {
    primaryColor: '#6366f1',
    secondaryColor: '#a5b4fc',
    backgroundColor: '#fafafa',
    textColor: '#1e293b',
    backgroundImage: '/quiz/your-quiz/background.png'
  },
  
  // STORY SETUP - Shows before Q1
  storySetup: {
    title: "Your Story Title",
    premise: `Multi-paragraph story setup.
    
    Introduce:
    - WHO you are in this story
    - WHAT the situation is
    - WHERE it's happening  
    - WHEN (timeframe)
    - WHY it matters (stakes)
    - THE CHARACTERS (named, with roles and personalities)
    
    Make it vivid. Make it real. Make them FEEL it.`,
    timeframe: "2 weeks",  // or "7 days", "48 hours", "3 months"
    characters: [
      {
        name: "Character Name",
        role: "Their role",
        personality: "Brief personality trait"
      }
      // 3-5 memorable characters
    ]
  },
  
  // QUESTIONS - 10 sequential scenes (base scenarios that will be adapted)
  questions: [
    {
      id: 'q1-day1-morning',
      baseScenario: {
        timeMarker: "Day 1, 9am",
        dimension: "initial_approach",  // What this question tests
        coreSetup: `[IMMERSIVE SCENE with 5 elements:
        1. Specific time/place
        2. Sensory details
        3. Something happening right now
        4. Named characters
        5. Emotional tension/stakes]`
      },
      options: [
        { label: 'Specific action (not general approach)', value: 'approach_1' },
        { label: 'Specific action 2', value: 'approach_2' },
        { label: 'Specific action 3', value: 'approach_3' }
      ],
      allowCustomInput: true  // ALWAYS true for narrative
    },
    
    {
      id: 'q2-day1-afternoon',
      baseScenario: {
        timeMarker: "Day 1, 2pm",
        dimension: "people_skills",
        coreSetup: `[Scene continues chronologically from Q1...
        AI will add reference to Q1 choice when adapting this]`
      },
      options: [/* ... */],
      allowCustomInput: true
    },
    
    {
      id: 'q3-day2-morning',
      baseScenario: {
        timeMarker: "Day 2, 9am",
        dimension: "conflict_management",
        coreSetup: `[Conflict emerges...]`
      },
      options: [/* ... */],
      allowCustomInput: true
    },
    
    // ... Q4-Q7: Rising tension and crisis point
    
    {
      id: 'q8-final-week-resolution',
      baseScenario: {
        timeMarker: "Week 2, Monday",
        dimension: "recovery_pattern",
        coreSetup: `[Dealing with aftermath...]`
      },
      options: [/* ... */],
      allowCustomInput: true
    },
    
    {
      id: 'q9-final-week-direction',
      baseScenario: {
        timeMarker: "Week 2, Thursday",
        dimension: "future_direction",
        coreSetup: `[Setting new patterns...]`
      },
      options: [/* ... */],
      allowCustomInput: true
    },
    
    {
      id: 'q10-reflection',
      baseScenario: {
        timeMarker: "Week 2, Friday - End",
        dimension: "success_definition",
        coreSetup: `[Looking back/forward...]`
      },
      options: [/* ... */],
      allowCustomInput: true
    }
  ],
  
  // WORD MATRIX - Same as story-matrix
  wordMatrix: {
    firstWords: [
      'Decisive', 'Collaborative', 'Flexible', 'Structured',
      'Empowering', 'Hands-On', 'Strategic', 'Supportive',
      'Direct', 'Visionary'
    ],
    secondWords: [
      'Coach', 'Strategist', 'People-First Leader', 'Results Driver',
      'Process Builder', 'Innovator', 'Facilitator', 'Mentor',
      'Accountability Partner', 'Culture Builder'
    ],
    selectionPrompt: `You are analyzing how someone navigated a specific leadership challenge.

STORY CONTEXT:
[Include brief story summary so AI knows what happened]

Their journey through the story:
{{answers}}

Your task: Select ONE combination that best captures their approach IN THIS STORY.

[Rest of standard selection prompt...]`
  },
  
  // AI EXPLANATION - References the specific story
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're analyzing how someone led through a specific challenge.

THE STORY THEY NAVIGATED:
[Brief recap of the story premise]

THEIR STYLE: "{{archetype}}" - {{tagline}}

Write a warm explanation that references SPECIFIC moments from their journey:

## How You Led as {{archetype}}

When [specific story moment], you chose to [their choice]. That's pure {{archetype}} energy.

## Your Defining Moments

- **Monday morning**: When you [Q1 choice], that showed [trait]
- **Sarah's confession**: When she said she was leaving and you [Q2 choice], you revealed [insight]
- **The standup conflict**: Your choice to [Q3 choice] demonstrated [characteristic]

[Continue referencing actual story moments...]

Their full journey:
{{answers}}

Use markdown ## headers. Be personal and specific to THIS story.`
  }
}
```

---

## ✅ Narrative Quiz Checklist

Before launching your narrative quiz:

### Story Setup
- [ ] Compelling premise with clear stakes
- [ ] 3-5 distinct, memorable characters
- [ ] WHO/WHAT/WHERE/WHEN/WHY all clear
- [ ] Timeframe is specific and realistic
- [ ] Makes user think "I can picture this"

### Questions (Base Scenarios)
- [ ] 10 questions follow chronological order
- [ ] Each has specific time marker
- [ ] Each includes 5 immersion elements
- [ ] Each tests a different dimension
- [ ] Arc builds: intro → challenges → crisis → resolution
- [ ] Named characters recur throughout
- [ ] Same characters stay consistent

### Options
- [ ] 3 options per question
- [ ] All options are ACTIONS (not general approaches)
- [ ] All options are equally viable
- [ ] allowCustomInput: true on every question

### Word Matrix
- [ ] 10 distinct first words (HOW they approach)
- [ ] 10 distinct second words (WHAT they prioritize)
- [ ] Selection prompt references story context
- [ ] AI explanation template references story moments

---

## 💡 Example Story Arcs for Different Domains

### Management: "First 2 Weeks Leading a Team"
- Q1-2: Meeting team, first impressions
- Q3-5: Conflicts and challenges emerge
- Q6-7: Crisis hits (deadline, person quits, project fails)
- Q8-10: Recovery and new direction

### Vacation: "7 Days Solo in Tokyo"
- Day 1: Arrival, jet lag, first impressions
- Day 2-3: Exploring, making choices (food, people, activities)
- Day 4: Something goes wrong (lost, sick, conflict)
- Day 5-6: Peak experiences
- Day 7: Reflection and going home

### Relationship: "First Month Dating"
- Week 1: After first date, text exchange
- Week 2: First real conversation, learning about them
- Week 3: First disagreement or awkward moment
- Week 4: Meeting their friends, making it official?

### Crisis: "48 Hours - System Outage"
- Hour 1: Discovery and initial response
- Hour 6: Coordinating team, stakeholders panicking
- Hour 12: Major decision under pressure
- Hour 24: Working toward resolution
- Hour 48: Post-mortem and learning

### Career: "First 90 Days at New Company"
- Week 1: Onboarding, first impressions
- Week 4: First project, first feedback
- Week 8: Challenge or setback
- Week 12: Proving yourself, finding your groove

---

## 🚨 Common Narrative Quiz Mistakes

### ❌ Mistake #1: Vague Base Scenarios
```typescript
coreSetup: "How do you handle conflict?"
```
**Fix**: Make it specific and vivid!
```typescript
coreSetup: "Tuesday standup. Marcus cuts off Jordan mid-sentence: 
'We can't keep doing it this way.' Jordan snaps back: 'Then what's YOUR plan?' 
The room goes silent. Everyone's looking at you."
```

### ❌ Mistake #2: No Continuity
Writing each scene independently without thinking about flow.

**Fix**: Read all 10 scenes in order. Does it feel like ONE story?

### ❌ Mistake #3: Generic Time Markers
"Later that day" or "The next week"

**Fix**: Be specific! "Tuesday, 2pm" not "Later"

### ❌ Mistake #4: Characters Appear Once
Introducing new people in every question.

**Fix**: 3-5 recurring characters who show up across scenes

### ❌ Mistake #5: Flat Stakes
Nothing at risk, no tension building.

**Fix**: Escalate! Q1 should be lower stakes than Q7.

### ❌ Mistake #6: Missing Emotional Beats
Just describing events without emotional context.

**Fix**: Show how people FEEL. "Sarah's jaw tightens" "You can sense the team's frustration"

---

## 🎬 Pro Tips for Great Narrative Quizzes

1. **Write the story first** - Before creating the quiz, write out what happens as if it's a short story
2. **Name your characters** - "Sarah" beats "a team member"
3. **Use dialogue** - Direct quotes make it real
4. **Show body language** - "crosses arms" "looks down" "jaw clenches"
5. **Track time carefully** - Make sure timeline makes sense
6. **Build to a climax** - Q6-7 should be most intense
7. **End with reflection** - Q10 looks back or forward
8. **Test the flow** - Read all 10 base scenarios in order
9. **Stay in the moment** - Always write in present tense
10. **Trust the adaptation** - Your base scenario just needs the core; AI adds continuity

---

## 🚀 You're Ready to Create!

Narrative quizzes are the most immersive type. Users don't just answer questions—they LIVE THROUGH a story and discover who they are by how they navigated it.

**The key insight**: You write the core scenes. AI makes them feel connected. Together, you create an experience that feels completely personalized.

Happy storytelling! 🎭
