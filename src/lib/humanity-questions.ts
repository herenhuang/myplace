import {
  HumanityAllocationQuestion,
  HumanityAssociationQuestion,
  HumanityChatQuestion,
  HumanityFreeformQuestion,
  HumanityMechanic,
  HumanityOrderingQuestion,
  HumanityQuestion,
  HumanityRescueQuestion,
  HumanityDivergentAssociationQuestion,
  HumanityAlternativeUsesQuestion,
  HumanityThreeWordsQuestion,
  HumanityBubblePopperQuestion,
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

const buildDivergentAssociationQuestion = (
  overrides: Omit<
    HumanityDivergentAssociationQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityDivergentAssociationQuestion => ({
  id: uuidv4(),
  mechanic: 'divergent-association',
  title: overrides.title ?? 'Divergent Words',
  stepNumber,
  ...overrides,
})

const buildAlternativeUsesQuestion = (
  overrides: Omit<
    HumanityAlternativeUsesQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityAlternativeUsesQuestion => ({
  id: uuidv4(),
  mechanic: 'alternative-uses',
  title: overrides.title ?? 'Alternative Uses',
  stepNumber,
  ...overrides,
})

const buildThreeWordsQuestion = (
  overrides: Omit<
    HumanityThreeWordsQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityThreeWordsQuestion => ({
  id: uuidv4(),
  mechanic: 'three-words',
  title: overrides.title ?? 'Three Words',
  stepNumber,
  ...overrides,
})

const buildBubblePopperQuestion = (
  overrides: Omit<
    HumanityBubblePopperQuestion,
    'mechanic' | 'title' | 'stepNumber' | 'id'
  > & { title?: string },
  stepNumber: number,
): HumanityBubblePopperQuestion => ({
  id: uuidv4(),
  mechanic: 'bubble-popper',
  title: overrides.title ?? 'Bubble Pop',
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
          label: 'Rope',
          emoji: '🪢',
          description: '50 feet of strong nylon rope.',
        },
        {
          id: 'lighter',
          label: 'Lighter',
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
]

const CHAT_QUESTIONS: HumanityChatQuestion[] = [
  buildChatQuestion(
    {
      title: 'Wrong Gate',
      text: "You're scrolling through your phone when a text from Mila pops up. She's your spontaneous best friend who's always getting into weird situations at airports. This time she's at the wrong gate and bored out of her mind.",
      question: 'How do you entertain her?',
      npcName: 'Mila',
      npcAvatar: '✈️',
      requiresMobilePopup: true, // Phone UI needs full screen on mobile
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
      npcPersonality: "You are Mila, a 26-year-old fun and spontaneous best friend. Text like a real person - lowercase, occasional typos, lots of 'omg', 'lol', 'haha', and emojis. Keep responses SHORT - 1-2 sentences MAX, usually just 10-15 words each. ",
      conversationContext: "Mila texted at the wrong gate AGAIN and her flight is delayed. She's bored out of her mind and needs entertainment. She's looking for her best friend (the user) to suggest something fun, silly, or mischievous to pass the time. The dynamic is casual best friends who always text in lowercase and joke around.",
    },
    3,
  ),
  buildChatQuestion(
    {
      title: 'Emergency Response',
      text: 'Your phone buzzes. It\'s Steven, your direct manager. The product release is in 2 hours and something major broke. He needs your input NOW, and he\'s not happy about it.',
      question: 'How do you handle the crisis?',
      npcName: 'Steven',
      npcAvatar: '💼',
      requiresMobilePopup: true, // Phone UI needs full screen on mobile
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
      npcPersonality: "You are Steven, a 42-year-old senior engineering manager under pressure. Direct, no-nonsense, no emojis. Keep responses SHORT - usually 10-15 words. Examples: 'Good.', 'Understood.', 'Walk me through it.', 'Time's ticking.', 'That won't work.'. Occasionally 2 short sentences when urgent (10-15 words max). Never write paragraphs. Text efficiently like a busy manager in a crisis. Show stress through brevity and directness, not length.",
      conversationContext: "Steven is messaging during a crisis - a database migration failed 2 hours before a major product release. He's stressed, the executive team is breathing down his neck, and he needs the user (his direct report) to give him a clear recommendation on how to proceed. The dynamic is manager-to-employee, professional but urgent.",
    },
    4,
  ),
  buildChatQuestion(
    {
      title: 'Crush Confession',
      text: 'You get a message from Justin, your shy younger co-worker. He\'s been working up the courage to confess to his crush Sarah from accounting, but he\'s freaking out and needs advice.',
      question: 'How do you help him?',
      npcName: 'Justin',
      npcAvatar: '🤓',
      requiresMobilePopup: true, // Phone UI needs full screen on mobile
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
      npcPersonality: "You are Justin, a 24-year-old shy and anxious junior developer. Keep responses under 2 sentences each.",
      conversationContext: "Justin has been crushing on Sarah from accounting for months and finally decided to confess his feelings tomorrow. He's terrified, overthinking everything, and needs the user (his older, more confident co-worker friend) to give him advice and calm him down. The dynamic is younger anxious friend seeking advice from someone he trusts.",
    },
    5,
  ),
]

const ORDERING_QUESTIONS: HumanityOrderingQuestion[] = []

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
    15,
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
    6,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Gravity',
      cue: 'Gravity',
      prompt: 'What\'s the first word you see when you hear it?',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    7,
  ),
  buildAssociationQuestion(
    {
      title: 'Word Flash · Threshold',
      cue: 'Threshold',
      prompt: 'Tap out the first word or image that shows up.',
      characterLimit: 40,
      allowSentimentTag: true,
    },
    8,
  ),
]

const DIVERGENT_ASSOCIATION_QUESTION: HumanityDivergentAssociationQuestion = buildDivergentAssociationQuestion(
  {
    title: 'Divergent Thinking',
    text: 'Your task is to think of 7 words that are <b>as different from each other as possible </b>. The more unrelated the words, the better.',
    question: 'What 7 words come to mind?',
    prompt: 'List 7 words that are maximally different from each other.',
    wordCount: 7,
    characterLimit: 30,
  },
    6, // Renumbered from 9 to 6
)

const ALTERNATIVE_USES_QUESTIONS: HumanityAlternativeUsesQuestion[] = [
  buildAlternativeUsesQuestion(
    {
      title: 'Alternative Uses · Brick',
      text: 'Creativity often comes from seeing familiar objects in new ways. Think beyond the obvious.',
      question: 'How many different uses can you think of for a brick?',
      prompt: 'List as many uses as you can think of for a brick.',
      objectName: 'a brick',
      minUses: 3,
      maxUses: 20,
      initialUses: ['Build a wall', 'Use as a doorstop'],
      contextImage: '/brick.png',
      requiresMobilePopup: true, // Needs full screen on mobile for list management
    },
    7, // Renumbered from 10 to 7
  ),
  buildAlternativeUsesQuestion(
    {
      title: 'Alternative Uses · T-Shirt',
      text: 'Keep the creative energy going. What else could this everyday item become?',
      question: 'What are all the different ways you could use a t-shirt?',
      prompt: 'List as many uses as you can think of for a t-shirt.',
      objectName: 'a t-shirt',
      minUses: 3,
      maxUses: 20,
      initialUses: ['Wear it', 'Use as a rag'],
      contextImage: '/shirt.png',
      requiresMobilePopup: true, // Needs full screen on mobile for list management
    },
    8, // Renumbered from 11 to 8
  ),
]

const THREE_WORDS_QUESTIONS: HumanityThreeWordsQuestion[] = [
  buildThreeWordsQuestion(
    {
      title: 'Three Words Story',
      text: 'Time to weave a narrative. You\'ll be given three random words. Your challenge is to create a sentence that naturally includes all three.',
      question: 'Craft a sentence using these three words.',
      prompt: 'Write a sentence that incorporates all three words.',
      words: ['telescope', 'umbrella', 'midnight'],
      characterLimit: 300,
      minSentences: 1,
      maxSentences: 3,
    },
    9, // Renumbered from 12 to 9
  ),
  buildThreeWordsQuestion(
    {
      title: 'Three Words Story',
      text: 'One more! Let\'s see how you connect these unexpected elements.',
      question: 'Create a sentence with these three words.',
      prompt: 'Write a sentence that incorporates all three words.',
      words: ['library', 'thunder', 'chocolate'],
      characterLimit: 300,
      minSentences: 1,
      maxSentences: 3,
    },
    10, // Renumbered from 13 to 10
  ),
]

const BUBBLE_POPPER_QUESTION: HumanityBubblePopperQuestion = buildBubblePopperQuestion(
  {
    title: 'Bubble Pop',
    text: 'Here\'s a grid of 100 bubbles. You have 20 seconds. Pop as many or as few as you want—there\'s no right answer. Just do what feels natural.',
    question: 'How do you approach this?',
    prompt: 'Pop bubbles for 20 seconds.',
    timeLimit: 20,
  },
  14,
)

const FREEFORM_QUESTION: HumanityFreeformQuestion = buildFreeformQuestion(
  {
    title: 'Anything Else?',
    text: 'We\'ve been through quite a journey together—from rescuing scattered belongings to creative challenges, from navigating chat disasters to popping bubbles. Each choice has revealed something unique about how you think and what you value.',
    question: 'Is there anything else you\'d like to share?',
    prompt: 'Share anything you want the analysis to know before we wrap.',
    minLength: 0,
    maxLength: 600,
    placeholder: 'Drop any surprises, caveats, or secret goals for future-you...',
  },
  11, // Renumbered from 15 to 11
)

export const HUMANITY_QUESTIONS: HumanityQuestion[] = [
  ...RESCUE_QUESTIONS,
  ...CHAT_QUESTIONS,
  // ...ASSOCIATION_QUESTIONS, // Temporarily removed word association slides
  DIVERGENT_ASSOCIATION_QUESTION,
  ...ALTERNATIVE_USES_QUESTIONS,
  ...THREE_WORDS_QUESTIONS,
  // BUBBLE_POPPER_QUESTION, // Temporarily removed bubble popper
  ...ORDERING_QUESTIONS,
  // ...ALLOCATION_QUESTIONS, // Temporarily removed
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
  'divergent-association',
  'alternative-uses',
  'three-words',
  'bubble-popper',
]

