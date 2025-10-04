// Predefined AI baseline responses for each question
// These represent typical AI-generated responses to serve as comparison benchmarks

export interface BaselineResponse {
  model: string // claude, gpt, generic, concise, median
  response: string
}

export interface QuestionBaselines {
  stepNumber: number
  questionType: string
  baselines: BaselineResponse[]
}

export const AI_BASELINE_RESPONSES: QuestionBaselines[] = [
  {
    stepNumber: 1,
    questionType: 'scenario',
    baselines: [
      {
        model: 'claude',
        response: 'My phone, wallet, keys, a water bottle, some pens, a notebook, hand sanitizer, and perhaps some personal items like chapstick or tissues would scatter across the ground.'
      },
      {
        model: 'gpt',
        response: 'The contents would likely include my phone, wallet, water bottle, notebook, pens, headphones, hand sanitizer, keys, and any loose papers or receipts I had stored inside.'
      },
      {
        model: 'generic',
        response: 'Various personal items would fall out including electronic devices, wallet, keys, water bottle, and other everyday essentials that I typically carry with me.'
      },
      {
        model: 'concise',
        response: 'Phone, wallet, keys, water bottle, notebook, pens.'
      },
      {
        model: 'median',
        response: 'My bag would spill out my phone, wallet, keys, a water bottle, notebook, some pens, and other personal items I carry daily.'
      }
    ]
  },
  {
    stepNumber: 2,
    questionType: 'word-association',
    baselines: [
      {
        model: 'claude',
        response: 'concurrent'
      },
      {
        model: 'gpt',
        response: 'together'
      },
      {
        model: 'generic',
        response: 'at the same time'
      },
      {
        model: 'concise',
        response: 'concurrent'
      },
      {
        model: 'median',
        response: 'together'
      }
    ]
  },
  {
    stepNumber: 3,
    questionType: 'word-association',
    baselines: [
      {
        model: 'claude',
        response: 'unpredictable'
      },
      {
        model: 'gpt',
        response: 'spontaneous'
      },
      {
        model: 'generic',
        response: 'unpredictably'
      },
      {
        model: 'concise',
        response: 'chaos'
      },
      {
        model: 'median',
        response: 'spontaneous'
      }
    ]
  },
  {
    stepNumber: 4,
    questionType: 'word-association',
    baselines: [
      {
        model: 'claude',
        response: 'pretentious'
      },
      {
        model: 'gpt',
        response: 'showy'
      },
      {
        model: 'generic',
        response: 'flashy'
      },
      {
        model: 'concise',
        response: 'showy'
      },
      {
        model: 'median',
        response: 'flashy'
      }
    ]
  },
  {
    stepNumber: 5,
    questionType: 'image-description',
    baselines: [
      {
        model: 'claude',
        response: 'An abstract composition featuring overlapping circles and curved lines in warm orange and cool blue-green tones, creating a sense of movement and depth through layered transparency.'
      },
      {
        model: 'gpt',
        response: 'A digital abstract art piece with orange and teal gradients, featuring circular shapes, flowing curves, and geometric elements that create a modern, dynamic composition.'
      },
      {
        model: 'generic',
        response: 'An abstract image showing various colored shapes including circles and curves with gradient backgrounds in orange, blue, and green tones.'
      },
      {
        model: 'concise',
        response: 'Abstract shapes with orange and blue gradients, circles, curves, geometric elements.'
      },
      {
        model: 'median',
        response: 'Abstract art with overlapping circles and curves in orange and blue-green gradients creating a flowing, modern composition.'
      }
    ]
  },
  {
    stepNumber: 6,
    questionType: 'scenario',
    baselines: [
      {
        model: 'claude',
        response: 'I would politely check my phone and tell them the time, while perhaps wondering if their watch is broken or if they might need help with something else.'
      },
      {
        model: 'gpt',
        response: 'I\'d check my phone and tell them the time. They might be asking because their watch battery died or they forgot to set it. I\'d respond helpfully regardless.'
      },
      {
        model: 'generic',
        response: 'I would provide them with the current time from my phone or watch, as they may be asking for various reasons despite wearing a watch themselves.'
      },
      {
        model: 'concise',
        response: 'Tell them the time.'
      },
      {
        model: 'median',
        response: 'I\'d check my phone and tell them the time. Maybe their watch isn\'t working or they want to confirm the time.'
      }
    ]
  },
  {
    stepNumber: 7,
    questionType: 'forced-choice',
    baselines: [
      {
        model: 'claude',
        response: 'Keep your memories but never win anything by chance again'
      },
      {
        model: 'gpt',
        response: 'Keep your memories but never win anything by chance again'
      },
      {
        model: 'generic',
        response: 'Keep your memories but never win anything by chance again'
      },
      {
        model: 'concise',
        response: 'Keep your memories but never win anything by chance again'
      },
      {
        model: 'median',
        response: 'Keep your memories but never win anything by chance again'
      }
    ]
  },
  {
    stepNumber: 8,
    questionType: 'scenario',
    baselines: [
      {
        model: 'claude',
        response: 'I would maintain a neutral expression and continue facing forward, respecting the social convention of collective denial in this awkward situation.'
      },
      {
        model: 'gpt',
        response: 'I\'d pretend nothing happened and look straight ahead or at my phone, following the unspoken rule that we all ignore it to avoid embarrassment.'
      },
      {
        model: 'generic',
        response: 'I would remain quiet and not acknowledge it, as is the common social practice in such situations to maintain everyone\'s comfort.'
      },
      {
        model: 'concise',
        response: 'Ignore it and look at my phone.'
      },
      {
        model: 'median',
        response: 'I\'d act like nothing happened and look at my phone or the floor numbers, following the social norm of pretending it didn\'t occur.'
      }
    ]
  },
  {
    stepNumber: 9,
    questionType: 'open-ended',
    baselines: [
      {
        model: 'claude',
        response: 'The thing about reality is that it\'s fundamentally shaped by our perception and interpretation, existing as both an objective external world and a subjective internal experience.'
      },
      {
        model: 'gpt',
        response: 'The thing about reality is that it\'s often more complex than it appears, and what we perceive is filtered through our own experiences and biases.'
      },
      {
        model: 'generic',
        response: 'The thing about reality is that it can be different from our expectations and is experienced uniquely by each individual based on their perspective.'
      },
      {
        model: 'concise',
        response: 'The thing about reality is that it\'s subjective.'
      },
      {
        model: 'median',
        response: 'The thing about reality is that it\'s complex and often different from how we imagine it, shaped by both objective facts and subjective perception.'
      }
    ]
  }
]

// Helper function to get baselines for a specific question
export function getBaselinesForQuestion(stepNumber: number): string[] {
  const questionBaselines = AI_BASELINE_RESPONSES.find(
    (qb) => qb.stepNumber === stepNumber
  )
  
  if (!questionBaselines) {
    return []
  }
  
  return questionBaselines.baselines.map((b) => b.response)
}

// Helper function to get all baselines as a map
export function getAllBaselinesMap(): Map<number, string[]> {
  const map = new Map<number, string[]>()
  
  AI_BASELINE_RESPONSES.forEach((qb) => {
    map.set(qb.stepNumber, qb.baselines.map((b) => b.response))
  })
  
  return map
}

