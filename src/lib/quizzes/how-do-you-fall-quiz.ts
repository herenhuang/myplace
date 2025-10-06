import { QuizConfig } from './types'

export const howDoYouFallQuiz: QuizConfig = {
  id: 'how-do-you-fall',
  title: 'How Do You Fall In Love?',
  description: 'Journey through your first month together and discover your pattern.',
  type: 'narrative',  // This makes it an immersive story that adapts!
  
  theme: {
    primaryColor: '#FF3D95',
    secondaryColor: '#fda4af',
    backgroundColor: '#fff1f2',
    textColor: '#881337',
    backgroundImage: 'linear-gradient(135deg,rgb(217, 46, 131) 0%, #fda4af 50%, #fff1f2 100%)'
  },
  
  // STORY SETUP - Shows before the quiz starts
  storySetup: {
    title: "How Do You Fall In Love?",
    premise: `You just had an incredible first date. Like, genuinely incredible.

The Situation:
You met three weeks ago through mutual friends. There was immediate chemistry. Last night was your first real date—dinner turned into drinks turned into walking around the city until 1am. You talked about everything. You laughed constantly. When you said goodbye, there was this moment...

This person is:
- **Alex**: Smart, funny, emotionally available (as far as you can tell). Seems genuinely interested in you. Has their life together. Green flags so far.

Now it's the next morning. You're replaying everything. Your phone is next to you. The next four weeks are going to reveal something important: how YOU fall in love.

Not how you think you do. Not how you wish you did. How you actually do.

Let's watch it unfold...`,
    timeframe: "4 weeks",
    characters: [
      {
        name: "Alex",
        role: "The person you're dating",
        personality: "Emotionally available, communicative, seems genuinely interested"
      }
    ]
  },
  
  // 10 SEQUENTIAL SCENES (base scenarios that will be adapted based on choices)
  questions: [
    // WEEK 1 - Initial approach
    {
      id: 'q1-morning-after',
      baseScenario: {
        timeMarker: "Day 1 - Morning after first date",
        dimension: "initial_approach",
        coreSetup: `It's 10:30am. You're still thinking about last night. Your phone is in your hand.

You haven't heard from Alex yet, but the date literally ended 9 hours ago. You could text first. Or you could wait. Or you could... what?

Part of you wants to reach out right now. Part of you is worried about seeming too eager. Part of you is just replaying that goodbye moment over and over.

What do you do?`
      },
      options: [
        { label: 'Text now: "Last night was really great"', value: 'eager_immediate' },
        { label: 'Wait a few hours, see if they text first', value: 'balanced_patient' },
        { label: 'Wait for them to reach out - ball is in their court', value: 'cautious_wait' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q2-text-exchange',
      baseScenario: {
        timeMarker: "Day 2 - Text conversation",
        dimension: "communication_style",
        coreSetup: `You've been texting back and forth. Alex just sent: "I keep thinking about you. When can I see you again?"

Your heart did a little jump when you read that. But now you're staring at your phone trying to figure out how to respond.

You could match their energy. You could play it cooler. You could be completely honest about how you're feeling.

What do you say?`
      },
      options: [
        { label: '"I keep thinking about you too. How about this weekend?"', value: 'vulnerable_matching' },
        { label: '"Same! My schedule is pretty open, what works for you?"', value: 'warm_flexible' },
        { label: '"I had fun too! Let me check my calendar and get back to you"', value: 'measured_cautious' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q3-second-date',
      baseScenario: {
        timeMarker: "Day 5 - Planning second date",
        dimension: "eagerness_level",
        coreSetup: `Second date is set for Saturday. But it's only Tuesday.

Alex texted this morning with a random meme. Then asked how your day was going. Now you're having an actual conversation at 2pm on a Tuesday.

You're enjoying this. But you're also wondering: Is this too much texting before the second date? Should you be more mysterious? Or is this exactly right?

How do you handle the rest of the week?`
      },
      options: [
        { label: 'Keep texting - I like the daily connection', value: 'engaged_eager' },
        { label: 'Respond but keep some mystery for the date', value: 'balanced_strategic' },
        { label: 'Pull back a little - save stuff for in person', value: 'boundaried_reserved' }
      ],
      allowCustomInput: true
    },
    
    // WEEK 2 - Vulnerability and physical intimacy
    {
      id: 'q4-deeper-conversation',
      baseScenario: {
        timeMarker: "Week 2 - Late night conversation",
        dimension: "vulnerability_comfort",
        coreSetup: `You're at Alex's place after your third date. It's midnight. You're on the couch, wine glasses empty, and the conversation just went deeper.

Alex just shared something real - about their last relationship ending, about being nervous to date again, about really liking you but being scared of getting hurt.

They're looking at you, clearly hoping you'll open up too. You could match their vulnerability. Or you could deflect. Or something in between.

How do you respond?`
      },
      options: [
        { label: 'Open up fully - share your own fears and past', value: 'vulnerable_open' },
        { label: 'Share a little but keep some walls up for now', value: 'measured_cautious' },
        { label: 'Acknowledge their sharing, stay mostly surface level', value: 'guarded_protected' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q5-physical-moment',
      baseScenario: {
        timeMarker: "Week 2 - Physical intimacy moment",
        dimension: "physical_vs_emotional",
        coreSetup: `You're still at Alex's place. The conversation is winding down. You're sitting really close now.

There's this tension in the air. Alex's hand is on your knee. You could definitely kiss them right now. Or more.

But you're also feeling a lot of feelings. Like, emotional feelings. And you're not sure if you should slow down physically until you've talked about what this is, or if you should just go with how you feel.

What feels right?`
      },
      options: [
        { label: 'Go with the physical moment - this feels right', value: 'physical_first' },
        { label: 'Pause and talk about what we want this to be', value: 'emotional_clarity' },
        { label: 'Take it slow tonight, see where it goes naturally', value: 'gradual_paced' }
      ],
      allowCustomInput: true
    },
    
    // WEEK 3 - Integration and conflict
    {
      id: 'q6-meeting-friends',
      baseScenario: {
        timeMarker: "Week 3 - Meeting each other's friends",
        dimension: "independence_vs_merging",
        coreSetup: `Alex invited you to their friend's birthday dinner this Saturday. Like, their whole friend group will be there.

It's week three. Meeting the friends feels like a thing. Like a "we're actually dating" thing.

You're excited but also... is this too fast? Are you ready to be introduced as "the person I'm seeing"? Do you want them to meet your friends too?

What's your move?`
      },
      options: [
        { label: 'Yes! And suggest they meet my friends soon too', value: 'merging_integrating' },
        { label: 'Go to their thing but keep my own social life separate for now', value: 'balanced_boundaried' },
        { label: 'Maybe suggest just us for a bit longer first', value: 'cautious_slow' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q7-first-difference',
      baseScenario: {
        timeMarker: "Week 3 - First disagreement",
        dimension: "conflict_handling",
        coreSetup: `You made plans for tonight. But Alex just texted that they're exhausted from work and asked to reschedule.

You're disappointed. You were really looking forward to this. And a small part of you is wondering: are they pulling away? Is this the beginning of them losing interest?

But also maybe they're just tired? It's been an intense few weeks.

How do you handle this?`
      },
      options: [
        { label: 'Tell them honestly that I\'m disappointed but understand', value: 'honest_secure' },
        { label: 'Say it\'s fine but feel anxious about what it means', value: 'anxious_reading_into' },
        { label: 'Pull back emotionally - protect myself just in case', value: 'guarded_protective' }
      ],
      allowCustomInput: true
    },
    
    // WEEK 4 - Feelings getting real
    {
      id: 'q8-feelings-check',
      baseScenario: {
        timeMarker: "Week 4 - Feelings getting real",
        dimension: "emotional_expression",
        coreSetup: `It's been almost a month. You're lying in bed at 11pm, and you just realized something:

You have feelings. Like, real feelings. This isn't just fun dating anymore. You're actually falling for this person.

The question is: what do you do with that information?

Do you tell Alex? Do you wait to see how they feel? Do you pull back because feelings are scary? Do you just let it unfold?

What's your instinct?`
      },
      options: [
        { label: 'Tell them how I\'m feeling - honesty feels important', value: 'vulnerable_expressive' },
        { label: 'Wait for signs they feel the same way first', value: 'cautious_responsive' },
        { label: 'Keep it to myself and see where things go naturally', value: 'guarded_observant' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q9-future-thoughts',
      baseScenario: {
        timeMarker: "Week 4 - Future creeping in",
        dimension: "commitment_readiness",
        coreSetup: `Your friend just asked: "So are you guys, like, together together? Or still figuring it out?"

Good question. You haven't had the "what are we" conversation yet. But you're thinking about Alex a lot. Planning your week around seeing them. Starting to imagine future things together.

Is it too soon to define it? Are you ready for that conversation? Do you even want to?

How do you feel about this?`
      },
      options: [
        { label: 'Ready to define it - I want to know where we stand', value: 'clear_defining' },
        { label: 'Happy with how things are, no rush to label it', value: 'comfortable_flowing' },
        { label: 'Nervous about defining it - what if we want different things?', value: 'anxious_avoiding' }
      ],
      allowCustomInput: true
    },
    
    {
      id: 'q10-month-reflection',
      baseScenario: {
        timeMarker: "End of Week 4 - One month in",
        dimension: "pattern_recognition",
        coreSetup: `It's been exactly one month since that first date. You're getting coffee with your best friend, and they ask:

"So... how are you doing with all this? I know you. How are you ACTUALLY handling it?"

You pause. Because they do know you. They know your patterns. They know how you fall. They know what scares you. They know when you're all-in vs when you're holding back.

What do you tell them?`
      },
      options: [
        { label: 'I\'m all in. This feels different. I\'m letting myself fall.', value: 'all_in_falling' },
        { label: 'I\'m trying to take it slow but it\'s hard - I like them a lot', value: 'balanced_struggling' },
        { label: 'I\'m keeping some walls up. I don\'t want to get hurt.', value: 'protected_cautious' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 ways of falling in love
  wordMatrix: {
    firstWords: [
      'Fast-Falling',       // Quick to develop feelings
      'Slow-Building',      // Takes time to open up
      'Cautious',           // Protective, careful
      'Intense',            // All-consuming when falling
      'Gradual',            // Steady, consistent pace
      'Hesitant',           // Scared of getting hurt
      'Confident',          // Secure in expressing feelings
      'Balanced',           // Neither too fast nor too slow
      'Guarded',            // Keeps emotional walls up
      'All-In'              // Fully commits quickly
    ],
    secondWords: [
      'Heart-First Lover',           // Leads with emotions
      'Mind-Then-Heart',             // Thinks before feeling
      'Physical-First Connector',    // Body leads, feelings follow
      'Emotional Opener',            // Vulnerable and expressive
      'Independent Dater',           // Maintains boundaries/identity
      'Merged Attacher',             // Integrates lives quickly
      'Vulnerable Expresser',        // Shares feelings openly
      'Protective Observer',         // Watches before committing
      'Secure Communicator',         // Clear about needs/feelings
      'Anxious Overthinker'          // Worries and analyzes
    ],
    selectionPrompt: `You are analyzing how someone falls in love based on their journey through the first month of a new relationship.

STORY CONTEXT:
They just met someone they really like. Over four weeks, they navigated: initial contact, vulnerability, physical intimacy, meeting friends, conflict, and defining the relationship. Each choice revealed something about their falling-in-love pattern.

Their journey through the story:
{{answers}}

Your task: Select ONE combination that captures HOW they fall in love.

Available words:
FIRST WORDS (speed/intensity): {{firstWords}}
SECOND WORDS (style/approach): {{secondWords}}

Instructions:
1. Look at the FULL arc of their journey - not just one moment
2. Consider: Speed (fast vs slow), Vulnerability (open vs guarded), Physical vs Emotional timing, Independence vs Merging, Anxiety level, Communication style
3. Choose the FIRST WORD that describes their SPEED/INTENSITY when falling (e.g., Fast-Falling vs Cautious, All-In vs Hesitant)
4. Choose the SECOND WORD that describes their STYLE/APPROACH (e.g., Heart-First Lover, Mind-Then-Heart, Anxious Overthinker)
5. Each word is DISTINCT - clear separation between options
6. All combinations are valid - no judgment about how someone falls
7. Create a tagline that makes them feel deeply SEEN about their pattern
8. Identify 2 alternative combinations they were close to

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A deeply personal subtitle that captures their specific falling pattern. Must be a complete sentence ending with punctuation. Use 'you' language, make it feel like you understand them completely.",
  "reasoning": "2-3 sentences explaining why this combination fits their journey through the month. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Why this was close based on their choices"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Why this was close based on their choices"}
  ]
}

CRITICAL: Do NOT make up names. Only use exact words from the lists provided. The combination is literally [FirstWord] + [SecondWord], nothing else.`,
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a perceptive friend who understands love and relationships deeply. This person is a "{{archetype}}" - {{tagline}}.

You just watched them navigate their first month with someone new. Write a warm, insightful analysis with these sections. IMPORTANT: Do NOT include "{{archetype}}" or "The {{archetype}}" as a header - the name is already displayed above.

<section>
## Your Love Blueprint

Start with "You're a {{archetype}}, and here's what that looked like this month..." Write 2-3 sentences about their falling pattern using "you" language. Make sure it connects to their tagline: "{{tagline}}". Reference their actual journey.
</section>

<section>
## What I Noticed

Highlight 3 specific patterns from their actual answers across the month:
- When you answered [specific moment/choice], that shows [insight about how they fall]
- Your choice in [specific situation] reveals [trait]
- [Another answer-to-trait connection from their journey]
</section>

<section>
## You're Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative explaining why they showed hints of that pattern based on their answers.
</section>

<section>
## The Pattern Behind The Pattern

Explain what's REALLY driving their {{archetype}} pattern. What are they protecting? What do they need? What scares them? Be compassionate and insightful. 2-3 sentences.
</section>

<section>
## What Works For You

Give 2-3 strengths or beautiful aspects of being a {{archetype}}. What's powerful about this way of falling? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy

Share 1-2 honest observations about challenges for a {{archetype}}. What to watch out for. Be supportive, not critical.
</section>

<section>
## Dating Advice For You

Give 2-3 pieces of wisdom about being a {{archetype}} using "you" language:
- What to embrace about this pattern
- How to grow while honoring who they are
- Practical tips for healthier falling
</section>

<section>
## Bottom Line

End with one powerful, affirming truth about their way of falling in love. Make them feel seen and accepted.
</section>

Use "{{archetype}}" consistently throughout (never shorten or modify it). Be warm, insightful, specific to their actual choices, and deeply understanding. Use markdown with ## for headers. This should feel like someone who really gets them.`
  }
}

