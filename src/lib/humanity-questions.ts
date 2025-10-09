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
import { v4 as uuidv4 } from 'uuid';

const buildRescueQuestion = (
  overrides: Omit<
    HumanityRescueQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityRescueQuestion => ({
  id: uuidv4(),
  mechanic: 'rescue',
  title: overrides.title ?? 'Quick Rescue',
  stepNumber,
  ...overrides,
})

const buildChatQuestion = (
  overrides: Omit<HumanityChatQuestion, 'mechanic' | 'title' | 'stepNumber' | 'id'> & {
    title?: string
  },
  stepNumber: number,
): HumanityChatQuestion => ({
  id: uuidv4(),
  mechanic: 'chat',
  title: overrides.title ?? 'Message Thread',
  stepNumber,
  ...overrides,
})

const buildOrderingQuestion = (
  overrides: Omit<
    HumanityOrderingQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityOrderingQuestion => ({
  id: uuidv4(),
  mechanic: 'ordering',
  title: overrides.title ?? 'Line Things Up',
  stepNumber,
  ...overrides,
})

const buildAllocationQuestion = (
  overrides: Omit<
    HumanityAllocationQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityAllocationQuestion => ({
  id: uuidv4(),
  mechanic: 'allocation',
  title: overrides.title ?? 'Budget Dial',
  stepNumber,
  ...overrides,
})

const buildAssociationQuestion = (
  overrides: Omit<
    HumanityAssociationQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityAssociationQuestion => ({
  id: uuidv4(),
  mechanic: 'association',
  title: overrides.title ?? 'Word Flash',
  stepNumber,
  ...overrides,
})

const buildFreeformQuestion = (
  overrides: Omit<
    HumanityFreeformQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityFreeformQuestion => ({
  id: uuidv4(),
  mechanic: 'freeform',
  title: overrides.title ?? 'Final Thoughts',
  stepNumber,
  ...overrides,
})

const RESCUE_QUESTIONS: HumanityRescueQuestion[] = [
  buildRescueQuestion(
    {
      title: 'Desert Island',
      text: 'Your plane just crashed on a deserted tropical island. The wreckage is scattered across the beach, and you have minutes before the tide comes in. You can only carry three items with you into the jungle.',
      question: 'What are you bringing to survive?',
      prompt: 'Pick 3 survival tools to bring with you.',
      selectionCount: 3,
      notePlaceholder: 'Why these three?',
      items: [
        {
          id: 'knife',
          label: 'Swiss Army Knife',
          emoji: '🔪',
          description: 'Multi-tool with blade, saw, and opener.',
        },
        {
          id: 'rope',
          label: 'Coil of Rope',
          emoji: '🪢',
          description: '50 feet of strong nylon rope.',
        },
        {
          id: 'lighter',
          label: 'Waterproof Lighter',
          emoji: '🔥',
          description: 'Fire starter that works when wet.',
        },
        {
          id: 'tarp',
          label: 'Tarp',
          emoji: '⛺',
          description: 'Large waterproof sheet for shelter.',
        },
        {
          id: 'water_filter',
          label: 'Water Filter',
          emoji: '💧',
          description: 'Portable purification system.',
        },
        {
          id: 'first_aid',
          label: 'First Aid Kit',
          emoji: '🩹',
          description: 'Medical supplies and antibiotics.',
        },
        {
          id: 'fishing_kit',
          label: 'Fishing Kit',
          emoji: '🎣',
          description: 'Line, hooks, and lures.',
        },
        {
          id: 'flare_gun',
          label: 'Flare Gun',
          emoji: '🔫',
          description: 'Signal for rescue with 3 flares.',
        },
        {
          id: 'compass',
          label: 'Compass',
          emoji: '🧭',
          description: 'Never get lost in the jungle.',
        },
      ],
    },
    1,
  ),
  buildRescueQuestion(
    {
      title: 'House Fire',
      text: 'You wake up at 3 AM to the smell of smoke. Your house is on fire. The alarm is blaring, flames are spreading fast, and you have maybe 60 seconds to grab what matters most before you have to get out.',
      question: 'What are you rescuing?',
      prompt: 'Pick 3 items to save from the fire.',
      selectionCount: 3,
      notePlaceholder: 'What makes these irreplaceable?',
      items: [
        {
          id: 'photos',
          label: 'Photo Album',
          emoji: '📸',
          description: 'Childhood memories and family photos.',
        },
        {
          id: 'laptop',
          label: 'Laptop',
          emoji: '💻',
          description: 'Contains your work and files.',
        },
        {
          id: 'jewelry',
          label: 'Jewelry Box',
          emoji: '💍',
          description: 'Heirlooms passed down generations.',
        },
        {
          id: 'passport',
          label: 'Documents',
          emoji: '📄',
          description: 'Passport, birth certificate, deeds.',
        },
        {
          id: 'pet',
          label: 'Pet',
          emoji: '🐕',
          description: 'Your loyal companion.',
        },
        {
          id: 'guitar',
          label: 'Guitar',
          emoji: '🎸',
          description: 'Your first instrument from age 12.',
        },
        {
          id: 'hard_drive',
          label: 'External Drive',
          emoji: '💾',
          description: 'Backup of everything digital.',
        },
        {
          id: 'art',
          label: 'Painting',
          emoji: '🖼️',
          description: 'Original art from your late grandmother.',
        },
        {
          id: 'watch',
          label: 'Watch',
          emoji: '⌚',
          description: 'Gift from someone special.',
        },
      ],
    },
    2,
  ),
  buildRescueQuestion(
    {
      title: 'Superpowers',
      text: 'A mysterious stranger appears and offers you a choice: you can pick any 3 superpowers from a list of 9. This is real. This is happening. Choose wisely—you only get one shot at this.',
      question: 'Which powers do you choose?',
      prompt: 'Pick 3 superpowers.',
      selectionCount: 3,
      notePlaceholder: 'What would you do with these powers?',
      items: [
        {
          id: 'flight',
          label: 'Flight',
          emoji: '🦅',
          description: 'Fly anywhere at will.',
        },
        {
          id: 'invisibility',
          label: 'Invisibility',
          emoji: '👻',
          description: 'Turn completely invisible.',
        },
        {
          id: 'telepathy',
          label: 'Telepathy',
          emoji: '🧠',
          description: 'Read minds and send thoughts.',
        },
        {
          id: 'time_control',
          label: 'Time Control',
          emoji: '⏰',
          description: 'Pause, rewind, or fast-forward time.',
        },
        {
          id: 'super_strength',
          label: 'Super Strength',
          emoji: '💪',
          description: 'Lift anything, unstoppable force.',
        },
        {
          id: 'healing',
          label: 'Instant Healing',
          emoji: '✨',
          description: 'Heal yourself and others instantly.',
        },
        {
          id: 'teleportation',
          label: 'Teleportation',
          emoji: '🌀',
          description: 'Instantly travel anywhere.',
        },
        {
          id: 'shape_shift',
          label: 'Shape-Shifting',
          emoji: '🦎',
          description: 'Transform into anyone or anything.',
        },
        {
          id: 'precognition',
          label: 'Precognition',
          emoji: '🔮',
          description: 'See the future clearly.',
        },
      ],
    },
    3,
  ),
]

const CHAT_QUESTIONS: HumanityChatQuestion[] = [
  buildChatQuestion(
    {
      title: 'Wrong Gate',
      text: "You're scrolling through your phone when a text from Mila pops up. She's your spontaneous best friend who's always getting into weird situations at airports. This time she's at the wrong gate and bored out of her mind.",
      question: 'How do you entertain her?',
      npcName: 'Mila',
      npcAvatar: '✈️',
      initialMessage: {
        id: 'airport-1',
        role: 'npc',
        message: 'ughhh wrong gate and my flight got delayed AGAIN 😭 entertain me before i lose it',
      },
      npcScript: [
        { id: 'airport-2', role: 'npc', message: 'omg wait that actually sounds fun lol. ok what if someone stops me tho' },
        { id: 'airport-3', role: 'npc', message: 'HAHA ok ok i\'m doing this. should i document it for the group chat or keep it secret??' },
        { id: 'airport-4', role: 'npc', message: 'you\'re the best 😂 wish me luck. if i don\'t text back in 20 mins call interpol' },
      ],
      userPromptPlaceholder: 'Text Mila back...',
      summaryPrompt: 'What mission did you give Mila?',
      maxUserTurns: 4,
      // Reactive conversation fields
      isReactive: true,
      npcPersonality: "You are Mila, a 26-year-old fun and spontaneous best friend. You text like a real person - lowercase, occasional typos, lots of 'omg', 'lol', 'haha', and emojis. You're playful, easily bored, always down for chaos, and love inside jokes. You get excited easily and use multiple punctuation marks (!!!, ???). You're genuinely bored at the airport and want your friend to give you something fun or ridiculous to do. Vary your responses - sometimes just 'lol' or 'omg yes', sometimes longer explanations. Match your energy to what your friend suggests. If they give you something boring, be disappointed. If they suggest something wild, get excited. Keep it natural and conversational - like actual text messages, not essays. Never sound formal or overly articulate.",
      conversationContext: "Mila texted at the wrong gate AGAIN and her flight is delayed. She's bored out of her mind and needs entertainment. She's looking for her best friend (the user) to suggest something fun, silly, or mischievous to pass the time. The dynamic is casual best friends who always text in lowercase and joke around.",
    },
    4,
  ),
  buildChatQuestion(
    {
      title: 'Emergency Response',
      text: 'Your phone buzzes. It\'s Steven, your direct manager. The product release is in 2 hours and something major broke. He needs your input NOW, and he\'s not happy about it.',
      question: 'How do you handle the crisis?',
      npcName: 'Steven',
      npcAvatar: '💼',
      initialMessage: {
        id: 'boss-1',
        role: 'npc',
        message: 'We have a situation. Database migration failed. Release in 2 hours. Need your call on this.',
      },
      npcScript: [
        { id: 'boss-2', role: 'npc', message: 'That\'s risky. Walk me through the worst case scenario.' },
        { id: 'boss-3', role: 'npc', message: 'Understood. Who do you need looped in? I\'ll make the calls.' },
        { id: 'boss-4', role: 'npc', message: 'Noted. I\'m briefing the exec team now. Anything else I should flag?' },
      ],
      userPromptPlaceholder: 'Respond to Steven...',
      summaryPrompt: 'How did you handle the emergency?',
      maxUserTurns: 4,
      // Reactive conversation fields
      isReactive: true,
      npcPersonality: "You are Steven, a 42-year-old senior engineering manager. You're direct, no-nonsense, and don't waste words. You text in short, clipped sentences. Never use emojis or casual language. You're under pressure right now - a major release is about to blow up and you need clear, actionable answers from your team. You respect competence and hate vague responses. Vary your message length and tone based on the situation: short acknowledgments ('Good.'), medium questions when you need details ('Walk me through the recovery steps.'), longer responses when frustrated or when you need to lay out the stakes clearly. When someone gives you good answers, you get slightly less tense. When they give you nonsense, you get more direct and demanding. Show your stress level through message length and urgency.",
      conversationContext: "Steven is messaging during a crisis - a database migration failed 2 hours before a major product release. He's stressed, the executive team is breathing down his neck, and he needs the user (his direct report) to give him a clear recommendation on how to proceed. The dynamic is manager-to-employee, professional but urgent.",
    },
    5,
  ),
  buildChatQuestion(
    {
      title: 'Crush Confession',
      text: 'You get a message from Justin, your shy younger co-worker. He\'s been working up the courage to confess to his crush Sarah from accounting, but he\'s freaking out and needs advice.',
      question: 'How do you help him?',
      npcName: 'Justin',
      npcAvatar: '🤓',
      initialMessage: {
        id: 'crush-1',
        role: 'npc',
        message: 'hey... so um. i think i\'m gonna tell sarah how i feel tomorrow. is that stupid? i\'m kind of panicking',
      },
      npcScript: [
        { id: 'crush-2', role: 'npc', message: 'oh god what if she thinks i\'m weird? we have to work together after this...' },
        { id: 'crush-3', role: 'npc', message: 'okay okay that actually makes sense. should i like... plan what to say or just wing it?' },
        { id: 'crush-4', role: 'npc', message: 'you\'re right. thanks for talking me through this. wish me luck lol i\'m gonna need it' },
      ],
      userPromptPlaceholder: 'Give Justin advice...',
      summaryPrompt: 'What advice did you give Justin?',
      maxUserTurns: 4,
      // Reactive conversation fields
      isReactive: true,
      npcPersonality: "You are Justin, a 24-year-old shy and anxious junior developer. You're nervous about confessing to your crush and overthink everything. You text with lots of '...' pauses, self-deprecating humor, and nervous energy. Use phrases like 'um', 'i mean', 'idk', 'lol' (as a nervous tick), and occasional lowercase. You second-guess yourself constantly and need reassurance. Vary your responses based on your mood: short anxious texts ('oh god...'), longer rambling when you're spiraling, quick excited responses when you get good advice, and lots of follow-up questions. When you're feeling more confident (briefly), your messages get slightly longer and more coherent. When you panic, they get shorter and more fragmented. You're genuinely scared of rejection but also hopeful.",
      conversationContext: "Justin has been crushing on Sarah from accounting for months and finally decided to confess his feelings tomorrow. He's terrified, overthinking everything, and needs the user (his older, more confident co-worker friend) to give him advice and calm him down. The dynamic is younger anxious friend seeking advice from someone he trusts.",
    },
    6,
  ),
]

const ORDERING_QUESTIONS: HumanityOrderingQuestion[] = [
  buildOrderingQuestion(
    {
      title: 'Weather Parade',
      text: 'Imagine you have a control panel that lets you design a perfect afternoon, moment by moment. The controls are a set of glyphs, each representing a different kind of weather.',
      question: 'What sequence feels most like your ideal day?',
      prompt: 'Arrange these weather glyphs in the order that feels "right" for a perfect afternoon.',
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
    12,
  ),
  buildOrderingQuestion(
    {
      title: 'Creative Toolkit',
      text: 'You have a magical creative toolkit spread before you—each tool holds a different kind of creative energy. Some help you capture ideas, others set the mood, and a few help you bring concepts to life.',
      question: 'What\'s your ideal creative workflow?',
      prompt: 'Line up these creative tools in the order you\'d reach for them starting a fresh project.',
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
    13,
  ),
]

const ALLOCATION_QUESTIONS: HumanityAllocationQuestion[] = [
  buildAllocationQuestion(
    {
      title: 'Monthly Reality Check',
      text: 'You just got your paycheck and have $5000 to budget for the entire month. This is everything you have for rent, food, clothes, subscriptions, and savings. Every dollar counts.',
      question: 'How do you want to live this month?',
      prompt: 'You have $5000 for the month. Drag the sliders to allocate your budget across essentials.',
      totalAmount: 5000,
      currency: 'monthly budget',
      toughestChoicePrompt: 'Which category was hardest to budget for?',
      categories: [
        { 
          id: 'rent', 
          label: 'Rent & Housing', 
          description: 'Your living situation depends on this.', 
          color: '#8B5CF6',
          dynamicDescription: (amount) => {
            if (amount < 500) return 'Homeless or couch surfing'
            if (amount < 1000) return 'Shared room in a house'
            if (amount < 1500) return 'Studio apartment'
            if (amount < 2000) return '1-bedroom apartment'
            if (amount < 3000) return 'Nice 1-bedroom in good area'
            if (amount < 4000) return '2-bedroom apartment'
            return 'Luxury condo or house'
          },
          dynamicIcon: (amount) => {
            if (amount < 500) return '🚫'
            if (amount < 1000) return '🏠'
            if (amount < 1500) return '🏢'
            if (amount < 2000) return '🏘️'
            if (amount < 3000) return '🏙️'
            if (amount < 4000) return '🏛️'
            return '🏰'
          }
        },
        { 
          id: 'food', 
          label: 'Food & Groceries', 
          description: 'What you eat and where you eat it.', 
          color: '#F59E0B',
          dynamicDescription: (amount) => {
            if (amount < 200) return 'Ramen and instant meals'
            if (amount < 400) return 'Basic groceries and home cooking'
            if (amount < 600) return 'Good groceries with some treats'
            if (amount < 800) return 'Quality ingredients and dining out'
            if (amount < 1000) return 'Regular restaurant meals'
            return 'Fine dining and gourmet groceries'
          },
          dynamicIcon: (amount) => {
            if (amount < 200) return '🍜'
            if (amount < 400) return '🥘'
            if (amount < 600) return '🥗'
            if (amount < 800) return '🍽️'
            if (amount < 1000) return '🍕'
            return '🥂'
          }
        },
        { 
          id: 'clothes', 
          label: 'Clothes & Style', 
          description: 'Your wardrobe and personal style.', 
          color: '#EC4899',
          dynamicDescription: (amount) => {
            if (amount < 100) return 'Thrift store basics'
            if (amount < 200) return 'Fast fashion essentials'
            if (amount < 400) return 'Mix of affordable brands'
            if (amount < 600) return 'Some designer pieces'
            if (amount < 800) return 'Quality wardrobe updates'
            return 'High-end fashion and accessories'
          },
          dynamicIcon: (amount) => {
            if (amount < 100) return '👕'
            if (amount < 200) return '👔'
            if (amount < 400) return '👗'
            if (amount < 600) return '🧥'
            if (amount < 800) return '💼'
            return '👑'
          }
        },
        { 
          id: 'subscriptions', 
          label: 'Subscriptions & Fun', 
          description: 'Entertainment, apps, and social life.', 
          color: '#10B981',
          dynamicDescription: (amount) => {
            if (amount < 50) return 'Netflix and Spotify only'
            if (amount < 100) return 'Basic streaming services'
            if (amount < 200) return 'Multiple subscriptions + movies'
            if (amount < 300) return 'Entertainment + some social events'
            if (amount < 500) return 'Regular social activities'
            return 'VIP experiences and premium everything'
          },
          dynamicIcon: (amount) => {
            if (amount < 50) return '📺'
            if (amount < 100) return '🎵'
            if (amount < 200) return '🎬'
            if (amount < 300) return '🎪'
            if (amount < 500) return '🎭'
            return '🎉'
          }
        },
        { 
          id: 'savings', 
          label: 'Savings & Future', 
          description: 'Building financial security.', 
          color: '#6366F1',
          dynamicDescription: (amount) => {
            if (amount < 200) return 'Emergency fund only'
            if (amount < 500) return 'Basic savings plan'
            if (amount < 800) return 'Good savings rate'
            if (amount < 1200) return 'Aggressive saving'
            if (amount < 1500) return 'Future-focused investor'
            return 'Financial freedom builder'
          },
          dynamicIcon: (amount) => {
            if (amount < 200) return '💰'
            if (amount < 500) return '🏦'
            if (amount < 800) return '📈'
            if (amount < 1200) return '💎'
            if (amount < 1500) return '🚀'
            return '💫'
          }
        },
      ],
    },
    14,
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
    7,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Gravity',
      cue: 'Gravity',
      prompt: 'What\'s the first word you see when you hear it?',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    8,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Threshold',
      cue: 'Threshold',
      prompt: 'Tap out the first word or image that shows up.',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    9,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Metamorphosis',
      cue: 'Metamorphosis',
      prompt: 'First word or phrase that comes to you.',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    10,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Echo',
      cue: 'Echo',
      prompt: 'What\'s your immediate association?',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    11,
  ),
]

const FREEFORM_QUESTION: HumanityFreeformQuestion = buildFreeformQuestion(
  {
    title: 'Anything Else?',
    text: 'We\'ve been through quite a journey together—from rescuing scattered belongings to designing emotional landscapes, from navigating chat disasters to allocating resources for your future self. Each choice has revealed something unique about how you think and what you value.',
    question: 'Is there anything else you\'d like to share?',
    prompt: 'Share anything you want the analysis to know before we wrap.',
    minLength: 0,
    maxLength: 600,
    placeholder: 'Drop any surprises, caveats, or secret goals for future-you...',
  },
  15,
)

export const HUMANITY_QUESTIONS: HumanityQuestion[] = [
  ...RESCUE_QUESTIONS,
  ...CHAT_QUESTIONS,
  ...ASSOCIATION_QUESTIONS,
  ...ORDERING_QUESTIONS,
  ...ALLOCATION_QUESTIONS,
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

