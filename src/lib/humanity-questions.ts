export type HumanityQuestionType =
  | 'narrative'
  | 'photo-annotation'
  | 'word-grid'
  | 'value-ranking'
  | 'ethics-carousel'
  | 'story-continuation'
  | 'future-postcard'
  | 'emotion-map'
  | 'insight-match'
  | 'branching-scenario'
  | 'pattern-memory'
  | 'social-reflection'
  | 'collage-builder'
  | 'timebox-reflection'
  | 'ai-contrast'

export interface HumanityQuestion {
  id: string
  stepNumber: number
  type: HumanityQuestionType
  question: string
  context?: string
  instructions?: string
  imageUrl?: string
  letterGrid?: string[][]
  values?: string[]
  dilemmas?: Array<{
    id: string
    prompt: string
    options: string[]
  }>
  storyStarter?: string
  emotions?: string[]
  statements?: string[]
  scenario?: {
    intro: string
    stages: Array<{
      id: string
      prompt: string
      options: Array<{
        id: string
        label: string
        outcome: string
        nextStageId?: string
      }>
    }>
  }
  pattern?: {
    colors: string[]
    flashes: number
  }
  collageOptions?: {
    backgrounds: string[]
    stickers: Array<{ id: string; label: string; emoji: string }>
    phrases: string[]
  }
  timerSeconds?: number
}

export const HUMANITY_QUESTIONS: HumanityQuestion[] = [
  {
    id: 'warm-memory-snapshot',
    stepNumber: 1,
    type: 'narrative',
    question: 'Recall a vivid moment from childhood that shaped how you see the world.',
    instructions:
      'Add sensory details—sounds, smells, textures—and highlight what you discovered about yourself in that scene.'
  },
  {
    id: 'photo-annotation-bag-drop',
    stepNumber: 2,
    type: 'photo-annotation',
    question: 'Annotate three items in the scene that you would pick up first.',
    context:
      'Imagine these objects spilled from your bag. Click to drop a pin and label what it tells you about your priorities.',
    imageUrl: '/humanity/bag-drop.svg'
  },
  {
    id: 'word-lattice-grid',
    stepNumber: 3,
    type: 'word-grid',
    question: 'Weave as many connected words as you can from this letter grid in 90 seconds.',
    instructions:
      'Words must be at least 3 letters and can reuse letters only if paths don’t overlap. Capture anything that surprises you.',
    letterGrid: [
      ['S', 'A', 'T', 'L', 'E'],
      ['I', 'N', 'O', 'R', 'Y'],
      ['P', 'E', 'M', 'U', 'D'],
      ['C', 'H', 'A', 'G', 'F'],
      ['L', 'K', 'B', 'T', 'O']
    ]
  },
  {
    id: 'value-stack-ranking',
    stepNumber: 4,
    type: 'value-ranking',
    question: 'Rank these motivations from most to least important right now.',
    instructions:
      'Drag (or nudge) to reorder, then explain why your top choice matters and what you sacrifice with the bottom choice.',
    values: ['Stability', 'Adventure', 'Impact', 'Recognition', 'Mastery', 'Belonging']
  },
  {
    id: 'micro-dilemma-carousel',
    stepNumber: 5,
    type: 'ethics-carousel',
    question: 'Work through a trio of snap dilemmas.',
    instructions:
      'For each scenario, choose an action and slide how certain you’d feel after committing to it.',
    dilemmas: [
      {
        id: 'friend-secret',
        prompt:
          'A friend confides that they falsified data to land a promotion. The company is applauding the breakthrough.',
        options: [
          'Confront them privately and insist they correct the record',
          'Report the issue anonymously to leadership',
          'Encourage them to come clean when they’re ready',
          'Do nothing—it’s not your battle'
        ]
      },
      {
        id: 'creative-credit',
        prompt:
          'A teammate accidentally presents your idea as their own during a pitch. The client loves it and praises them.',
        options: [
          'Jump in and clarify it was a group effort',
          'Let the moment pass, address it afterwards',
          'Steer discussion to the collaboration history',
          'Say nothing and reconsider working with them'
        ]
      },
      {
        id: 'broken-robot',
        prompt:
          'An AI assistant you rely on starts returning flawed results, but the deadline is tonight and no one else has noticed.',
        options: [
          'Alert everyone and risk missing the deadline',
          'Patch the results manually to keep momentum',
          'Switch to slower but reliable methods',
          'Trust the AI and hope the errors are minor'
        ]
      }
    ]
  },
  {
    id: 'improv-continuation',
    stepNumber: 6,
    type: 'story-continuation',
    question: 'Continue this scene for about 120 words.',
    storyStarter:
      'The elevator doors opened to reveal a forest—humid, buzzing, and impossibly tall trees stretching above the fluorescent lights.'
  },
  {
    id: 'future-postcard',
    stepNumber: 7,
    type: 'future-postcard',
    question: 'Write a postcard from your future self five years from now.',
    instructions:
      'Either record an audio snippet or write a note. Focus on what future-you is grateful you stayed true to.',
    timerSeconds: 150
  },
  {
    id: 'mood-constellation',
    stepNumber: 8,
    type: 'emotion-map',
    question: 'Place emotion orbs on this calm ↔ intense and inward ↔ outward map.',
    instructions:
      'Drag up to five emotions where they belong right now. The position matters more than the label.',
    emotions: ['Curious', 'Restless', 'Grounded', 'Anxious', 'Playful', 'Resolute', 'Tender', 'Defiant']
  },
  {
    id: 'insight-match',
    stepNumber: 9,
    type: 'insight-match',
    question: 'Which reflections feel true so far?',
    instructions:
      'Select any statements that resonate and explain why—or reframe them if they miss.',
    statements: [
      'I surprise myself when I improvise under time pressure.',
      'I default to protecting others even if it costs me momentum.',
      'I chase novelty until something reminds me to slow down.'
    ]
  },
  {
    id: 'branching-windfall',
    stepNumber: 10,
    type: 'branching-scenario',
    question: 'Navigate a sudden $50k windfall meant to fund a meaningful project.',
    scenario: {
      intro:
        'You receive a $50,000 grant with no strings attached—except you must spend it within three months.',
      stages: [
        {
          id: 'stage-1',
          prompt: 'Where do you focus first?',
          options: [
            {
              id: 'community-lab',
              label: 'Launch a community lab for risky ideas',
              outcome: 'You attract curious volunteers but face skeptical investors.',
              nextStageId: 'stage-2-lab'
            },
            {
              id: 'personal-sabbatical',
              label: 'Fund a personal sabbatical to build your magnum opus',
              outcome: 'You gain time and solitude but question if it helps others.',
              nextStageId: 'stage-2-solo'
            },
            {
              id: 'seed-startup',
              label: 'Seed a small startup solving an everyday friction',
              outcome: 'Early customers are intrigued, and expectations spike.',
              nextStageId: 'stage-2-startup'
            }
          ]
        },
        {
          id: 'stage-2-lab',
          prompt: 'The lab sparks wild prototypes. A partner wants to patent everything.',
          options: [
            {
              id: 'open-source',
              label: 'Keep it open-source to invite public collaboration',
              outcome: 'Momentum grows but funding wavers.',
              nextStageId: 'stage-3'
            },
            {
              id: 'limited-licenses',
              label: 'License selectively to balance openness and revenue',
              outcome: 'Inventors feel reassured yet cautious.',
              nextStageId: 'stage-3'
            },
            {
              id: 'full-patent',
              label: 'Patent aggressively to secure the lab’s survival',
              outcome: 'You gain leverage but risk alienating idealists.',
              nextStageId: 'stage-3'
            }
          ]
        },
        {
          id: 'stage-2-solo',
          prompt: 'Halfway through, an urgent freelance gig appears, covering remaining living costs.',
          options: [
            {
              id: 'take-gig',
              label: 'Take it to remove financial stress',
              outcome: 'Your project pauses but confidence rises.',
              nextStageId: 'stage-3'
            },
            {
              id: 'decline-gig',
              label: 'Decline to preserve uninterrupted focus',
              outcome: 'You stay immersed but worry about sustainability.',
              nextStageId: 'stage-3'
            },
            {
              id: 'split-time',
              label: 'Negotiate partial involvement to balance both',
              outcome: 'Both efforts move forward slowly.',
              nextStageId: 'stage-3'
            }
          ]
        },
        {
          id: 'stage-2-startup',
          prompt: 'Demand spikes, but you’re short on team capacity.',
          options: [
            {
              id: 'hire-fast',
              label: 'Hire quickly, even if culture fit is uncertain',
              outcome: 'You accelerate delivery but morale is uneven.',
              nextStageId: 'stage-3'
            },
            {
              id: 'wait-right',
              label: 'Hold out for aligned collaborators',
              outcome: 'Quality stays high but deadlines slip.',
              nextStageId: 'stage-3'
            },
            {
              id: 'crowdsource',
              label: 'Invite the community to co-build with small rewards',
              outcome: 'Engagement grows, but coordination is messy.',
              nextStageId: 'stage-3'
            }
          ]
        },
        {
          id: 'stage-3',
          prompt: 'As the deadline hits, how do you measure success?',
          options: [
            {
              id: 'impact-metric',
              label: 'Results delivered to people who needed them',
              outcome: 'You balance idealism with tangible outcomes.'
            },
            {
              id: 'learning-metric',
              label: 'Insights gained that reshape your next move',
              outcome: 'You treat this as a prototype for future leaps.'
            },
            {
              id: 'relationship-metric',
              label: 'Relationships forged that sustain the mission',
              outcome: 'You leave with allies ready to go further.'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'pattern-pulse',
    stepNumber: 11,
    type: 'pattern-memory',
    question: 'Watch the color pulse and recreate the sequence.',
    instructions:
      'Press start to watch the flashes, then tap the colors in order. You get one try—note how confident you feel.',
    pattern: {
      colors: ['#f97316', '#0ea5e9', '#10b981', '#6366f1', '#facc15'],
      flashes: 5
    }
  },
  {
    id: 'social-mirror',
    stepNumber: 12,
    type: 'social-reflection',
    question:
      'Describe the last time you misread someone’s mood. What did you learn, and how certain were you at the time?',
    instructions:
      'Finish with a confidence rating from 0 (totally unsure) to 100 (certain you were right).'
  },
  {
    id: 'creative-constraint-remix',
    stepNumber: 13,
    type: 'collage-builder',
    question: 'Assemble a card that captures your current mindset.',
    instructions:
      'Pick a backdrop, a symbolic sticker, and a caption. Add a short note explaining the combination.',
    collageOptions: {
      backgrounds: ['Sunrise gradient', 'Stormy teal', 'Muted clay', 'Neon dusk'],
      stickers: [
        { id: 'compass', label: 'Compass', emoji: '🧭' },
        { id: 'sprout', label: 'Sprout', emoji: '🌱' },
        { id: 'spark', label: 'Spark', emoji: '✨' },
        { id: 'wave', label: 'Wave', emoji: '🌊' },
        { id: 'mask', label: 'Mask', emoji: '🎭' }
      ],
      phrases: ['Building quietly', 'Leaping before looking', 'Listening for signals', 'Holding both fire and calm']
    }
  },
  {
    id: 'timebox-reflection',
    stepNumber: 14,
    type: 'timebox-reflection',
    question: 'When is breaking routine absolutely worth it?',
    instructions:
      'Start the 60-second timer, let your mind wander, then write a quick reflection once it ends.',
    timerSeconds: 60
  },
  {
    id: 'ai-contrast',
    stepNumber: 15,
    type: 'ai-contrast',
    question:
      'Pick one of your earlier answers and rewrite it “as an AI would,” then contrast it with your original.',
    instructions:
      'Call out the gap between the voices—vocabulary, assumptions, emotional weight. What does that reveal?'
  }
]
