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
    questionType: 'word-combination',
    baselines: [
      {
        model: 'claude',
        response: 'Through the telescope, I observed the distant stars while eating my sandwich, feeling a profound melancholy about the vastness of space.'
      },
      {
        model: 'gpt',
        response: 'The astronomer gazed through his telescope, pausing to eat his sandwich as melancholy thoughts about the universe filled his mind.'
      },
      {
        model: 'generic',
        response: 'I used the telescope to look at the moon while enjoying my sandwich, experiencing a sense of melancholy about being alone.'
      },
      {
        model: 'concise',
        response: 'My telescope revealed distant galaxies as I ate my sandwich with melancholy.'
      },
      {
        model: 'median',
        response: 'Looking through the telescope at the night sky, I ate my sandwich with a feeling of melancholy about the infinite cosmos.'
      }
    ]
  },
  {
    stepNumber: 7,
    questionType: 'word-combination',
    baselines: [
      {
        model: 'claude',
        response: 'Riding my bicycle through the thunderstorm brought back waves of nostalgia for childhood adventures in the rain.'
      },
      {
        model: 'gpt',
        response: 'The thunderstorm caught me on my bicycle, triggering nostalgia for similar stormy rides from my youth.'
      },
      {
        model: 'generic',
        response: 'I pedaled my bicycle faster as the thunderstorm approached, feeling nostalgia for simpler times when rain was just fun.'
      },
      {
        model: 'concise',
        response: 'My bicycle ride in the thunderstorm sparked childhood nostalgia.'
      },
      {
        model: 'median',
        response: 'As the thunderstorm began, I rode my bicycle home feeling nostalgia for carefree days of playing in the rain.'
      }
    ]
  },
  {
    stepNumber: 8,
    questionType: 'word-combination',
    baselines: [
      {
        model: 'claude',
        response: 'The library\'s old clockwork mechanism created a whimsical atmosphere as it chimed every hour among the ancient books.'
      },
      {
        model: 'gpt',
        response: 'In the quiet library, the antique clockwork clock added a whimsical charm to the scholarly atmosphere.'
      },
      {
        model: 'generic',
        response: 'The library featured a beautiful clockwork clock that gave the reading room a whimsical, old-world character.'
      },
      {
        model: 'concise',
        response: 'The library\'s clockwork clock created a whimsical ambiance.'
      },
      {
        model: 'median',
        response: 'The old library\'s clockwork timepiece added a whimsical touch to the studious environment.'
      }
    ]
  },
  {
    stepNumber: 9,
    questionType: 'scenario',
    baselines: [
      {
        model: 'claude',
        response: 'I would discreetly move to a different area of the coffee shop to give them privacy while avoiding the uncomfortable situation for other patrons.'
      },
      {
        model: 'gpt',
        response: 'I\'d probably put on headphones or move to another table if possible, trying to give them privacy while making myself more comfortable.'
      },
      {
        model: 'generic',
        response: 'I would either move to a different location in the coffee shop or use headphones to avoid hearing the personal conversation and reduce the discomfort.'
      },
      {
        model: 'concise',
        response: 'Move to another table or put in headphones.'
      },
      {
        model: 'median',
        response: 'I\'d try to move away from them or put on headphones to give them privacy and make the situation less awkward for everyone.'
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

