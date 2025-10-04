import { QuizConfig } from './types'

export const movingInTogetherQuiz: QuizConfig = {
  id: 'moving-in-together',
  title: 'Should You Move In Together?',
  description: 'Navigate the decision to cohabitate and discover your relationship style.',
  type: 'narrative',
  
  theme: {
    primaryColor: '#7c3aed',
    secondaryColor: '#c4b5fd',
    backgroundColor: '#faf5ff',
    textColor: '#5b21b6',
    backgroundImage: '/quiz/moving-in-together/background.png'
  },
  
  storySetup: {
    title: "Should You Move In Together?",
    premise: `You've been dating Jordan for 14 months. Things are good—really good. You're basically living together already, bouncing between apartments. 

Last night, Jordan's lease renewal notice arrived. They turned to you and said: "What if we just... got a place together?"

Now it's real. This isn't hypothetical anymore.

The Timeline:
You have 6 weeks to decide before Jordan's lease is up.

The Stakes:
This could be amazing. Or it could expose cracks you haven't seen. Your friends have opinions. Your families will have opinions. But ultimately, this is about you two and what you're ready for.

Let's see how you navigate this together...`,
    timeframe: "6 weeks",
    characters: [
      {
        name: "Jordan",
        role: "Your partner",
        personality: "Thoughtful, communicative, ready for this step but wants you to be ready too"
      }
    ]
  },
  
  questions: [
    // Week 1 - Initial reaction and communication
    {
      id: 'q1-initial-response',
      baseScenario: {
        timeMarker: "Week 1, Day 1 - Morning after",
        dimension: "initial_reaction",
        coreSetup: `Jordan's at work. You're thinking about what they asked last night. Your honest gut reaction is...`
      },
      options: [
        { label: 'Yes! I\'ve been hoping they\'d ask', value: 'enthusiastic' },
        { label: 'I want to, but I need to think it through', value: 'cautious_yes' },
        { label: 'I\'m genuinely unsure if I\'m ready', value: 'uncertain' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q2-first-conversation',
      baseScenario: {
        timeMarker: "Week 1, Day 3 - Evening",
        dimension: "communication_style",
        coreSetup: `Jordan asks: "So... what are you thinking about the living together thing?" How do you respond?`
      },
      options: [
        { label: 'Share my honest concerns and excitement', value: 'open_honest' },
        { label: 'Ask them what they\'re thinking first', value: 'reciprocal' },
        { label: 'Say I need more time to process', value: 'need_space' }
      ],
      allowCustomInput: true
    },
    
    // Week 2 - Practical considerations
    {
      id: 'q3-apartment-hunting',
      baseScenario: {
        timeMarker: "Week 2, Saturday",
        dimension: "practical_approach",
        coreSetup: `Jordan suggests looking at apartments online just to see what's out there. You...`
      },
      options: [
        { label: 'Jump in - start making a list of must-haves', value: 'proactive' },
        { label: 'Look but stay noncommittal about specifics', value: 'exploratory' },
        { label: 'Suggest we nail down finances first', value: 'practical_first' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q4-money-talk',
      baseScenario: {
        timeMarker: "Week 2, Wednesday - Money conversation",
        dimension: "financial_transparency",
        coreSetup: `Jordan says: "We should probably talk about money. How do you want to split rent and bills?"`
      },
      options: [
        { label: 'Share my budget openly, ask about theirs', value: 'transparent' },
        { label: 'Suggest 50/50 to keep it simple', value: 'equal_split' },
        { label: 'Propose splitting based on our incomes', value: 'proportional' }
      ],
      allowCustomInput: true
    },
    
    // Week 3-4 - Complications and doubts
    {
      id: 'q5-friends-opinions',
      baseScenario: {
        timeMarker: "Week 3, Friday - Friends weigh in",
        dimension: "external_influence",
        coreSetup: `Your friend says: "Are you sure? You've only been together 14 months." You feel...`
      },
      options: [
        { label: 'Defensive - we know what we\'re doing', value: 'confident_defensive' },
        { label: 'It plants a seed of doubt', value: 'influenced' },
        { label: 'Appreciative but clear in my choice', value: 'boundaried' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q6-habit-clash',
      baseScenario: {
        timeMarker: "Week 3, Tuesday - First tension",
        dimension: "conflict_navigation",
        coreSetup: `Staying at Jordan's. They comment on how you leave dishes in the sink. It stings.`
      },
      options: [
        { label: 'Bring it up: "Is this going to be a thing?"', value: 'address_directly' },
        { label: 'Take note, adjust my behavior', value: 'accommodate' },
        { label: 'Make a joke but feel a bit defensive', value: 'deflect' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q7-independence-worry',
      baseScenario: {
        timeMarker: "Week 4, Sunday - Alone time",
        dimension: "autonomy_needs",
        coreSetup: `You're at your place. Jordan texts they're coming over. You realize you wanted tonight alone.`
      },
      options: [
        { label: 'Tell them I need tonight to myself', value: 'assert_needs' },
        { label: 'Let them come but feel a little trapped', value: 'accommodate_resentful' },
        { label: 'Excited - I always want to see them', value: 'merged' }
      ],
      allowCustomInput: true
    },
    
    // Week 5-6 - Decision time
    {
      id: 'q8-lease-deadline',
      baseScenario: {
        timeMarker: "Week 5, Monday - Crunch time",
        dimension: "decision_pressure",
        coreSetup: `Jordan's lease office called. They need an answer this week. Jordan looks at you.`
      },
      options: [
        { label: 'I\'m ready - let\'s do this', value: 'committed' },
        { label: 'I need one more real conversation first', value: 'need_clarity' },
        { label: 'Can we push the timeline? I\'m not ready', value: 'need_time' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q9-final-conversation',
      baseScenario: {
        timeMarker: "Week 5, Thursday - The talk",
        dimension: "commitment_clarity",
        coreSetup: `Jordan says: "I love you and I want this. But only if you're actually ready. Are you?"`
      },
      options: [
        { label: 'Yes, I\'m ready. Let\'s find a place.', value: 'ready_yes' },
        { label: 'I want to but I need a bit more time', value: 'hesitant_yes' },
        { label: 'I don\'t think I\'m ready yet', value: 'not_ready' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q10-reflection',
      baseScenario: {
        timeMarker: "Week 6 - Looking back",
        dimension: "self_awareness",
        coreSetup: `Whatever you decided, what mattered most to you in making this choice?`
      },
      options: [
        { label: 'How we communicate and handle conflict', value: 'communication_priority' },
        { label: 'Practical alignment on life and money', value: 'practical_priority' },
        { label: 'Gut feeling about our readiness', value: 'intuition_priority' }
      ],
      allowCustomInput: true
    }
  ],
  
  wordMatrix: {
    firstWords: [
      'Decisive',           // Quick to commit
      'Thoughtful',         // Careful consideration
      'Enthusiastic',       // Eager and excited
      'Cautious',           // Protective of self
      'Practical',          // Logistics-focused
      'Communicative',      // Talk it through
      'Independent',        // Values autonomy
      'Merged',             // Already feels like one unit
      'Anxious',            // Worried about outcomes
      'Intuitive'           // Goes with gut
    ],
    secondWords: [
      'Partner',            // Equal relationship approach
      'Planner',            // Needs structure
      'Romantic',           // Heart-led
      'Realist',            // Practical lens
      'Boundary-Keeper',    // Protects independence  
      'Adapter',            // Flexible and compromising
      'Communicator',       // Talk through everything
      'Space-Needer',       // Needs alone time
      'Commitment-Ready',   // Fully ready for this
      'Slow-Mover'          // Takes time with big steps
    ],
    selectionPrompt: `You are analyzing how someone navigated the decision to move in with their partner.

Their 6-week journey:
{{answers}}

Your task: Select ONE combination that captures their cohabitation readiness and relationship style.

Available words:
FIRST WORDS (approach): {{firstWords}}
SECOND WORDS (relationship style): {{secondWords}}

Instructions:
1. Consider their full arc: initial reaction, communication, practical handling, conflict, autonomy, and final decision
2. Look for patterns in HOW they approached this vs WHAT they decided
3. Choose FIRST WORD: their decision-making approach (Decisive vs Cautious, Practical vs Intuitive)
4. Choose SECOND WORD: their relationship style (Partner, Boundary-Keeper, Merger, etc.)
5. All combinations are valid - no judgment
6. Create a tagline that captures their specific cohabitation approach

Respond in JSON:
{
  "firstWord": "chosen word",
  "secondWord": "chosen word",
  "tagline": "A personal insight about their moving-in-together style (use 'you')",
  "reasoning": "2-3 sentences why this fits their journey. Only use [FirstWord SecondWord].",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Why close"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Why close"}
  ]
}

CRITICAL: Only use exact words from the lists.`,
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're analyzing how someone navigated the decision to move in with their partner. They're a "{{archetype}}" - {{tagline}}.

Write a warm, insightful analysis:

## Your Cohabitation Style: {{archetype}}

Explain what it means to be a {{archetype}} when considering moving in together. Reference their tagline: "{{tagline}}".

## What Your Journey Revealed

Highlight 3-4 specific moments from their 6-week journey:
- **Week 1**: When you [specific choice], that showed [insight]
- **Week 2-3**: Your approach to [specific situation] revealed [pattern]
- **Week 4**: How you handled [specific moment] demonstrated [trait]
- **Your decision**: [Reference their final choice and what it means]

## You Were Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative based on their journey.

## What This Means for Your Relationship

Offer 2-3 insights about being a {{archetype}} in cohabitation:
- What to watch out for
- What to embrace
- How to thrive

## The Real Question

End with one reflective insight about what matters most for {{archetype}} in moving in together.

Their full journey:
{{answers}}

Use "{{archetype}}" consistently. Be warm, specific to their choices, and insightful about relationships. Use markdown ## headers.`
  }
}

