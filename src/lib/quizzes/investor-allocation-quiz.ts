import { QuizConfig } from './types'

export const investorAllocationQuiz: QuizConfig = {
  "id": "investor-allocation-quiz",
  "title": "Can You Get Allocation?",
  "description": "You're an early-stage investor trying to secure a spot in one of the hottest rounds in town. Can you convince the founder to let you in?",
  "type": "narrative",
  "theme": {
    "primaryColor": "#10b981",
    "secondaryColor": "#34d399",
    "backgroundColor": "#f0fdf4",
    "textColor": "#064e3b",
    "backgroundImage": "linear-gradient"
  },
  "questions": [
    {
      "id": "opening-scene",
      "baseScenario": {
        "timeMarker": "Day 1",
        "dimension": "intro",
        "coreSetup": "You're at your desk when the notification comes through. Alex Chen, the founder you've been trying to get connected with for months, just emailed you back. Your heart races."
      },
      "options": [
        {
          "label": "Continue",
          "value": "continue",
          "nextQuestionId": "meeting-schedule"
        }
      ]
    },
    {
      "id": "meeting-schedule",
      "baseScenario": {
        "timeMarker": "Day 1, 10:15am",
        "dimension": "flexibility",
        "coreSetup": "Their email reads: \"Hey! It's been a busy few weeks closing this round though we're finally at the end. Free for a quick call at 3PM?\"\nThe issue is that you have a conflict at that time already. How do you respond?"
      },
      "options": [],
      "uiConfig": {
        "useMessageUI": true
      },
      "allowCustomInput": true
    },
    {
      "id": "meeting-outcome",
      "baseScenario": {
        "timeMarker": "Day 1, 10:45am",
        "dimension": "transition",
        "coreSetup": "You hit send. A few minutes later, Alex replies."
      },
      "options": [
        {
          "label": "Continue",
          "value": "continue",
          "nextQuestionId": "text-convo"
        }
      ],
      "uiConfig": {
        "useMessageUI": true
      },
    },
    {
      "id": "text-convo",
      "baseScenario": {
        "timeMarker": "Day 1, 2:30pm",
        "dimension": "speed",
        "coreSetup": "Later that afternoon, you get a text from Alex: \"Hey sorry — crazy day. Just got Sequoia to lead. Could maybe squeeze you in for a small allocation if you're quick. How fast can you make a decision?\""
      },
      "options": [],
      "uiConfig": {
        "useMessageUI": true
      },
      "allowCustomInput": true
    },
    {
      "id": "check-size",
      "baseScenario": {
        "timeMarker": "Day 1, 3:15pm",
        "dimension": "commitment",
        "coreSetup": "Alex texts back about your timeline. Then: \"Makes sense. What check size do you normally write?\""
      },
      "options": [],
      "uiConfig": {
        "useMessageUI": true
      },
      "allowCustomInput": true
    },
    {
      "id": "reference-check",
      "baseScenario": {
        "timeMarker": "Day 1, 4:00pm",
        "dimension": "relationships",
        "coreSetup": "Alex responds to your check size info. Then: \"One last thing — what do you think your founders would say about working with you?\""
      },
      "options": [],
      "uiConfig": {
        "useMessageUI": true
      },
      "allowCustomInput": true
    },
    {
      "id": "alex-decision",
      "baseScenario": {
        "timeMarker": "Day 1, 5:30pm",
        "dimension": "outcome",
        "coreSetup": "You send your answer about what founders would say. A few moments later, Alex replies: \"OK, cool, appreciate the context.\"\nThen another message comes through."
      },
      "options": [
        {
          "label": "Continue",
          "value": "continue",
          "nextQuestionId": "sam-twist"
        }
      ],
      "uiConfig": {
        "useMessageUI": true
      },
    },
    {
      "id": "sam-twist",
      "baseScenario": {
        "timeMarker": "Day 1, 5:35pm",
        "dimension": "cliffhanger",
        "coreSetup": "You stare at Alex's message, processing what just happened. Before you can respond, your phone buzzes. It's Sam, your partner."
      },
      "options": [
        {
          "label": "See Results",
          "value": "continue",
          "nextQuestionId": "[Results Page]"
        }
      ]
    }
  ],
  "personalizationForm": {
    "instructions": "First, tell us a bit about yourself...",
    "fields": [
      {
        "id": "name",
        "question": "",
        "type": "text",
        "required": true
      },
      {
        "id": "fundName",
        "question": "",
        "type": "text",
        "required": true
      }
    ]
  },
  "storySetup": {
    "title": "The Allocation Game",
    "premise": "",
    "timeframe": "",
    "characters": [
      {
        "name": "Alex Chen",
        "role": "Founder, Expo",
        "personality": "You've had a few brief interactions. Alex is generally neutral but busy and slightly standoffish. Not rude, just has a lot going on and wants to close the round quickly."
      },
      {
        "name": "Sam",
        "role": "Your Partner",
        "personality": "Your peer in making investment decisions. Organized, trustworthy, and keeps you grounded."
      }
    ]
  },
  "analyzingMessages": [
    "Reviewing your interactions...",
    "Alex is making a decision...",
    "Considering the outcome...",
    "Almost there...",
    "Getting your results ready...",
    "--"
  ],
  "wordMatrix": {
    "firstWords": [
      "Aggressive",
      "Thoughtful",
      "Strategic",
      "Impulsive",
      "Calculated",
      "Persistent",
      "Cautious",
      "Bold",
      "Flexible",
      "Demanding"
    ],
    "secondWords": [
      "Dealmaker",
      "Partner",
      "Operator",
      "Opportunist",
      "Strategist",
      "Supporter",
      "Closer",
      "Negotiator",
      "Collaborator",
      "Executor"
    ],
    "selectionPrompt": "You're Alex Chen, the founder, and you just finished evaluating this investor through your text exchanges. You've already made your APPROVED or REJECTED decision in Q7. Now you need to give them an investor archetype that describes their approach.\nHere are your words:\nFIRST WORDS (their energy): {{firstWords}}\nSECOND WORDS (their style): {{secondWords}}\nWhat they did:\n{{answers}}\nYour decision from Q7: {{decision}} (APPROVED or REJECTED)\nEVALUATION CRITERIA:\n**Flexibility (Q2):**\n- Did they reschedule their conflict? (Flexible)\n- Propose alternatives? (Strategic)\n- Decline? (Demanding/Cautious)\n**Speed (Q4):**\n- 24-48 hours? (Aggressive/Bold)\n- 3-5 days? (Thoughtful/Strategic)\n- Week+ or vague? (Cautious/Slow)\n**Check Size (Q5):**\n- >$50k confident? (Bold/Aggressive)\n- $25-50k? (Strategic/Calculated)\n- <$25k or vague? (Cautious/Opportunist)\n**References (Q6):**\n- Humble + specific value? (Partner/Collaborator)\n- Generic but positive? (Supporter/Dealmaker)\n- Promotional or vague? (Opportunist)\nPick the archetype that best matches their OVERALL pattern, not just one answer.\nRespond in JSON:\n{\n  \"decision\": \"APPROVED\" or \"REJECTED\" (use the decision from Q7),\n  \"firstWord\": \"chosen word from first list\",\n  \"secondWord\": \"chosen word from second list\",\n  \"tagline\": \"A punchy sentence about their investor style. Use 'you' language.\",\n  \"reasoning\": \"2-3 sentences explaining why they got approved/rejected and why this archetype fits.\",\n  \"specificObservations\": [\n    \"One specific thing you noticed about their approach\",\n    \"Another observation about how they handled the process\",\n    \"A third detail that stood out (positive or negative)\"\n  ]\n}\nIMPORTANT: The decision (APPROVED/REJECTED) should match what you already decided in Q7. Don't change it here.\n---"
  },
  "aiExplanation": {
    "enabled": true,
    "model": "claude-3-5-sonnet-20241022",
    "promptTemplate": "You're delivering the results as Alex Chen, the founder. You've decided whether to give them allocation ({{decision}}) and identified their investor archetype.\nTARGET LENGTH: ~800-1200 words total. Be direct and honest.\nWrite like a founder giving candid feedback - professional but real, no BS.\n**CONTEXT FROM EVALUATION:**\n- Decision: {{decision}}\n- Archetype: {{archetype}}\n- Tagline: {{tagline}}\n- Reasoning: {{reasoning}}\n- Specific Observations: {{specificObservations}}\nTheir full responses:\n{{answers}}\n**FORMAT FOR APPROVED:**\n{{tagline}}\n{{reasoning}}\n---"
  }
}
