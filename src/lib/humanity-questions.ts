import {
  HumanityAllocationQuestion,
  HumanityAssociationQuestion,
  HumanityChatQuestion,
  HumanityFreeformQuestion,
  HumanityMechanic,
  HumanityOrderingQuestion,
  HumanityQuestion,
  HumanityRescueQuestion,
} from './humanity-types'

const buildRescueQuestion = (
  overrides: Omit<
    HumanityRescueQuestion,
    'mechanic' | 'title' | 'stepNumber'
  > & { title?: string },
  stepNumber: number,
): HumanityRescueQuestion => ({
  mechanic: 'rescue',
  title: overrides.title ?? 'Quick Rescue',
  stepNumber,
  ...overrides,
})

const buildChatQuestion = (
  overrides: Omit<HumanityChatQuestion, 'mechanic' | 'title' | 'stepNumber'> & {
    title?: string
  },
  stepNumber: number,
): HumanityChatQuestion => ({
  mechanic: 'chat',
  title: overrides.title ?? 'Message Thread',
  stepNumber,
  ...overrides,
})

const buildOrderingQuestion = (
  overrides: Omit<
    HumanityOrderingQuestion,
    'mechanic' | 'title' | 'stepNumber'
  > & { title?: string },
  stepNumber: number,
): HumanityOrderingQuestion => ({
  mechanic: 'ordering',
  title: overrides.title ?? 'Line Things Up',
  stepNumber,
  ...overrides,
})

const buildAllocationQuestion = (
  overrides: Omit<
    HumanityAllocationQuestion,
    'mechanic' | 'title' | 'stepNumber'
  > & { title?: string },
  stepNumber: number,
): HumanityAllocationQuestion => ({
  mechanic: 'allocation',
  title: overrides.title ?? 'Budget Dial',
  stepNumber,
  ...overrides,
})

const buildAssociationQuestion = (
  overrides: Omit<
    HumanityAssociationQuestion,
    'mechanic' | 'title' | 'stepNumber'
  > & { title?: string },
  stepNumber: number,
): HumanityAssociationQuestion => ({
  mechanic: 'association',
  title: overrides.title ?? 'Word Flash',
  stepNumber,
  ...overrides,
})

const buildFreeformQuestion = (
  overrides: Omit<
    HumanityFreeformQuestion,
    'mechanic' | 'title' | 'stepNumber'
  > & { title?: string },
  stepNumber: number,
): HumanityFreeformQuestion => ({
  mechanic: 'freeform',
  title: overrides.title ?? 'Final Thoughts',
  stepNumber,
  ...overrides,
})

const RESCUE_QUESTIONS: HumanityRescueQuestion[] = [
  buildRescueQuestion(
    {
      title: 'Runaway Tote Rescue',
      prompt: 'Your tote bag bursts open on a subway platform. Tap three treasures you scoop up before the train doors close.',
      selectionCount: 3,
      notePlaceholder: 'Why these three?',
      items: [
        {
          id: 'sketchbook',
          label: 'Ink-splattered sketchbook',
          emoji: '📒',
          description: 'Crinkled pages full of half-formed ideas.',
        },
        {
          id: 'film_roll',
          label: 'Expired film roll',
          emoji: '🎞️',
          description: 'Could still hold last summer’s road trip.',
        },
        {
          id: 'lucky_charm',
          label: 'Lucky subway token',
          emoji: '🪙',
          description: 'Polished smooth from years in your pocket.',
        },
        {
          id: 'novel',
          label: 'Dog-eared novel',
          emoji: '📚',
          description: 'Only three chapters left.',
        },
        {
          id: 'mini_plant',
          label: 'Miniature succulent',
          emoji: '🪴',
          description: 'Sways dangerously with every gust.',
        },
        {
          id: 'voice_recorder',
          label: 'Pocket voice recorder',
          emoji: '🎙️',
          description: 'Filled with late-night brainstorms.',
        },
        {
          id: 'mystery_key',
          label: 'Mystery key',
          emoji: '🗝️',
          description: 'You still haven’t figured out what it unlocks.',
        },
      ],
    },
    1,
  ),
  buildRescueQuestion(
    {
      title: 'Desk Avalanche',
      prompt: 'Your desk collapses mid-zoom. Tap three objects you rescue from the chaos.',
      selectionCount: 3,
      notePlaceholder: 'What ties them together?',
      items: [
        {
          id: 'polaroid',
          label: 'Polaroid strip',
          emoji: '📷',
          description: 'Snapshots from a midnight city walk.',
        },
        {
          id: 'idea_cards',
          label: 'Idea prompt cards',
          emoji: '🃏',
          description: 'Shuffles creativity when you’re stuck.',
        },
        {
          id: 'focus_glasses',
          label: 'Tinted focus glasses',
          emoji: '🕶️',
          description: 'Supposedly block out distractions.',
        },
        {
          id: 'postcard_stack',
          label: 'Blank postcards',
          emoji: '💌',
          description: 'Waiting to be mailed to future selves.',
        },
        {
          id: 'meteorite',
          label: 'Pocket meteorite',
          emoji: '☄️',
          description: 'A rock you swear hums softly.',
        },
        {
          id: 'timer',
          label: 'Sand timer',
          emoji: '⏳',
          description: 'Three-minute bursts of energy.',
        },
        {
          id: 'tea_kit',
          label: 'Loose-leaf tea kit',
          emoji: '🍵',
          description: 'Scoop, steep, breathe.',
        },
      ],
    },
    2,
  ),
  buildRescueQuestion(
    {
      title: 'Strange Picnic',
      prompt: 'A gust of wind scatters your picnic basket in an unfamiliar park. Which three things do you chase down?',
      selectionCount: 3,
      notePlaceholder: 'What story do they tell?',
      items: [
        {
          id: 'map_cloth',
          label: 'Hand-drawn map cloth',
          emoji: '🗺️',
          description: 'Marked with hidden corners to explore.',
        },
        {
          id: 'wind_chime',
          label: 'Pocket wind chime',
          emoji: '🎐',
          description: 'Laughs every time a breeze visits.',
        },
        {
          id: 'recipe_card',
          label: 'Grandma’s recipe card',
          emoji: '📜',
          description: 'Smudged with honey fingerprints.',
        },
        {
          id: 'mood_ring',
          label: 'Mood ring',
          emoji: '💍',
          description: 'Turns indigo when you’re plotting.',
        },
        {
          id: 'story_dice',
          label: 'Story dice',
          emoji: '🎲',
          description: 'Rolls tiny quests every meal.',
        },
        {
          id: 'tiny_projector',
          label: 'Mini projector',
          emoji: '📽️',
          description: 'Projects constellations inside picnic tents.',
        },
        {
          id: 'journal',
          label: 'Micro journal',
          emoji: '📓',
          description: 'Only room for sentence-long observations.',
        },
      ],
    },
    3,
  ),
]

const CHAT_QUESTIONS: HumanityChatQuestion[] = [
  buildChatQuestion(
    {
      title: 'Airport Ping',
      npcName: 'Mila',
      npcAvatar: '🧭',
      initialMessage: {
        id: 'airport-1',
        role: 'npc',
        message: 'Flight delay city. Give me a mission while I’m trapped at Gate 42?',
      },
      npcScript: [
        { id: 'airport-2', role: 'npc', message: 'Ha! That might actually keep me awake. What should I say if security gets curious?' },
        { id: 'airport-3', role: 'npc', message: 'Okay, now I’m picturing this. Wanna raise the stakes or call it good?' },
        { id: 'airport-4', role: 'npc', message: 'Deal. If this works, I owe you a souvenir the size of a keychain. Last words before I go rogue?' },
        { id: 'airport-5', role: 'npc', message: 'Transmission received. Catch you on the other side of this adventure ✈️' },
      ],
      userPromptPlaceholder: 'Type your reply...',
      summaryPrompt: 'Summarize the mission you gave Mila.',
      maxUserTurns: 4,
    },
    4,
  ),
  buildChatQuestion(
    {
      title: 'Studio SOS',
      npcName: 'Jules',
      npcAvatar: '🎛️',
      initialMessage: {
        id: 'studio-1',
        role: 'npc',
        message: 'Soundcheck disaster. Crowd in ten minutes. What’s our emergency plan?',
      },
      npcScript: [
        { id: 'studio-2', role: 'npc', message: 'Bold move. Think they’ll buy it, or do we lean harder into the chaos?' },
        { id: 'studio-3', role: 'npc', message: 'I can swing that. Want a secret flourish to tie it together?' },
        { id: 'studio-4', role: 'npc', message: 'Love it. I’ll loop the band in. Anything I should listen for while we play it off?' },
        { id: 'studio-5', role: 'npc', message: 'Alright, sending it. If we survive, you’re making the toast after.' },
      ],
      userPromptPlaceholder: 'Send guidance...',
      summaryPrompt: 'What vibe did you give Jules to run with?',
      maxUserTurns: 4,
    },
    5,
  ),
  buildChatQuestion(
    {
      title: 'Gig-Gone-Weird',
      npcName: 'Tariq',
      npcAvatar: '🛰️',
      initialMessage: {
        id: 'gig-1',
        role: 'npc',
        message: 'Delivery app glitch sent me to a midnight rooftop puppet show. Bail or improvise?',
      },
      npcScript: [
        { id: 'gig-2', role: 'npc', message: 'That’s chaotic enough to be brilliant. What’s my opening line?' },
        { id: 'gig-3', role: 'npc', message: 'Okay, and if they actually hand me a puppet... what’s my move?' },
        { id: 'gig-4', role: 'npc', message: 'This is escalating quickly. Safe word suggestions?' },
        { id: 'gig-5', role: 'npc', message: 'Copy that. I’ll report back with whatever this becomes.' },
      ],
      userPromptPlaceholder: 'Reply to Tariq...',
      summaryPrompt: 'Sum up the plan you set in motion for Tariq.',
      maxUserTurns: 4,
    },
    6,
  ),
]

const ORDERING_QUESTIONS: HumanityOrderingQuestion[] = [
  buildOrderingQuestion(
    {
      title: 'Weather Parade',
      prompt: 'Arrange these weather glyphs in the order that feels “right” for a perfect afternoon.',
      icons: [
        { id: 'sunrise', label: 'Sunrise shimmer', emoji: '🌅', meaning: 'Early optimism' },
        { id: 'mist', label: 'Soft mist', emoji: '🌫️', meaning: 'Quiet focus' },
        { id: 'rainbow', label: 'Sky arc', emoji: '🌈', meaning: 'Surprise delight' },
        { id: 'storm', label: 'Electric storm', emoji: '🌩️', meaning: 'Bold energy' },
        { id: 'breeze', label: 'Blue breeze', emoji: '🌬️', meaning: 'Gentle motion' },
        { id: 'downpour', label: 'Warm rain', emoji: '🌦️', meaning: 'Cleansing shift' },
        { id: 'zenith', label: 'Noon blaze', emoji: '☀️', meaning: 'Full clarity' },
        { id: 'fogbow', label: 'Fog halo', emoji: '🌁', meaning: 'Mystery mood' },
        { id: 'nightfall', label: 'Nightfall glow', emoji: '🌆', meaning: 'Calm landing' },
      ],
      askForTheme: true,
      themePlaceholder: 'Name your weather story...',
    },
    7,
  ),
  buildOrderingQuestion(
    {
      title: 'Creative Toolkit',
      prompt: 'Line up these creative tools in the order you’d reach for them starting a fresh project.',
      icons: [
        { id: 'notebook', label: 'Blank notebook', emoji: '📓', meaning: 'Idea capture' },
        { id: 'camera', label: 'Instant camera', emoji: '📸', meaning: 'See from new angles' },
        { id: 'lofi', label: 'Lo-fi loop', emoji: '🎧', meaning: 'Set the vibe' },
        { id: 'sticky', label: 'Sticky notes', emoji: '🗒️', meaning: 'Shuffle fragments' },
        { id: 'paint', label: 'Paint palette', emoji: '🎨', meaning: 'Color intuition' },
        { id: 'drum', label: 'Pocket drum', emoji: '🥁', meaning: 'Tap your rhythm' },
        { id: 'code', label: 'Tiny code editor', emoji: '💻', meaning: 'Structure ideas' },
        { id: 'tea', label: 'Steaming tea', emoji: '🍵', meaning: 'Slow down senses' },
        { id: 'projector', label: 'Idea projector', emoji: '📽️', meaning: 'Play it out' },
      ],
      askForTheme: true,
      themePlaceholder: 'Call this ritual...',
    },
    8,
  ),
  buildOrderingQuestion(
    {
      title: 'Emotion Glyphs',
      prompt: 'Arrange these mood glyphs to map the emotional arc of your ideal day.',
      icons: [
        { id: 'spark', label: 'Spark', emoji: '✨', meaning: 'Fresh curiosity' },
        { id: 'focus', label: 'Focus flame', emoji: '🔥', meaning: 'Deep drive' },
        { id: 'laugh', label: 'Unplanned laugh', emoji: '😄', meaning: 'Shared delight' },
        { id: 'wonder', label: 'Wonder window', emoji: '🪟', meaning: 'Looking beyond' },
        { id: 'pause', label: 'Soft pause', emoji: '🫧', meaning: 'Gentle reset' },
        { id: 'stretch', label: 'Stretch', emoji: '🧘', meaning: 'Grounded balance' },
        { id: 'rush', label: 'Electric rush', emoji: '⚡', meaning: 'Momentum spike' },
        { id: 'bloom', label: 'Bloom', emoji: '🌸', meaning: 'Warm connection' },
        { id: 'exhale', label: 'Exhale', emoji: '🌙', meaning: 'Peaceful close' },
      ],
      askForTheme: true,
      themePlaceholder: 'Title this arc...',
    },
    9,
  ),
]

const ALLOCATION_QUESTIONS: HumanityAllocationQuestion[] = [
  buildAllocationQuestion(
    {
      title: 'Weekend Energy Dial',
      prompt: 'You wake up with $1000 worth of weekend energy tokens. Drag the dial to fund the mix that feels right.',
      totalAmount: 1000,
      currency: 'energy credits',
      toughestChoicePrompt: 'Which category felt hardest to fund?',
      categories: [
        { id: 'adventure', label: 'Adventure', description: 'Unplanned sparks, outdoor dares, mini field trips.', color: '#F97316' },
        { id: 'connection', label: 'Connection', description: 'Long calls, people watching, community moments.', color: '#6366F1' },
        { id: 'recovery', label: 'Recovery', description: 'Rest, softness, blank calendar squares.', color: '#10B981' },
        { id: 'craft', label: 'Craft', description: 'Personal projects, studio time, making things.', color: '#EC4899' },
      ],
    },
    10,
  ),
  buildAllocationQuestion(
    {
      title: 'Starter Studio Budget',
      prompt: 'A pop-up studio angel hands you $1000. Balance the essentials to launch in 48 hours.',
      totalAmount: 1000,
      currency: 'studio credits',
      toughestChoicePrompt: 'Which slice tugged at you most?',
      categories: [
        { id: 'tools', label: 'Tools & Tech', description: 'Gear, software, reliable cables.', color: '#0EA5E9' },
        { id: 'people', label: 'People', description: 'Collaborators, mentors, community boosts.', color: '#8B5CF6' },
        { id: 'vibes', label: 'Vibes', description: 'Ambience, snacks, lighting, plants.', color: '#F59E0B' },
        { id: 'experiments', label: 'Experiments', description: 'Prototypes, wild ideas, playful tests.', color: '#22D3EE' },
      ],
    },
    11,
  ),
  buildAllocationQuestion(
    {
      title: 'Wellness Signal Mixer',
      prompt: 'You’re tuning a broadcast for your future self. Spend $1000 to balance the signal.',
      totalAmount: 1000,
      currency: 'signal credits',
      toughestChoicePrompt: 'Which frequency was toughest to dial?',
      categories: [
        { id: 'movement', label: 'Movement', description: 'Body in motion, playful sweat, dance breaks.', color: '#F472B6' },
        { id: 'reflection', label: 'Reflection', description: 'Journals, therapy, quiet corners.', color: '#34D399' },
        { id: 'learning', label: 'Learning', description: 'Courses, books, curiosity rabbit holes.', color: '#60A5FA' },
        { id: 'delight', label: 'Delight', description: 'Treats, art, sensory sparks.', color: '#FB7185' },
      ],
    },
    12,
  ),
]

const ASSOCIATION_QUESTIONS: HumanityAssociationQuestion[] = [
  buildAssociationQuestion(
    {
      title: 'Word Flash · Serendipity',
      cue: 'Serendipity',
      prompt: 'First word or phrase that lands in your mind.',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    13,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Gravity',
      cue: 'Gravity',
      prompt: 'What’s the first word you see when you hear it?',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    14,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Threshold',
      cue: 'Threshold',
      prompt: 'Tap out the first word or image that shows up.',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    15,
  ),
]

const FREEFORM_QUESTION: HumanityFreeformQuestion = buildFreeformQuestion(
  {
    title: 'Anything Else?',
    prompt: 'Share anything you want the analysis to know before we wrap.',
    minLength: 0,
    maxLength: 600,
    placeholder: 'Drop any surprises, caveats, or secret goals for future-you...',
  },
  16,
)

export const HUMANITY_QUESTIONS: HumanityQuestion[] = [
  ...RESCUE_QUESTIONS,
  ...CHAT_QUESTIONS,
  ...ORDERING_QUESTIONS,
  ...ALLOCATION_QUESTIONS,
  ...ASSOCIATION_QUESTIONS,
  FREEFORM_QUESTION,
]

export const HUMANITY_TOTAL_STEPS = HUMANITY_QUESTIONS.length

export const HUMANITY_MECHANICS: HumanityMechanic[] = [
  'rescue',
  'chat',
  'ordering',
  'allocation',
  'association',
  'freeform',
]

