# Quiz Template System - Quick Start 🚀

## What This Is

A complete quiz template system that lets you create personality quizzes by just writing a config file. No complex coding!

## Try It Now

```bash
# Start the dev server
npm run dev

# Visit these URLs:
http://localhost:3000/quiz/ai-model
http://localhost:3000/quiz/vacation-style
```

## Create Your Own Quiz (2 Minutes!)

**Example: "Which Avatar Element Are You?"**

1. **Create the config** - `/src/lib/quizzes/avatar-element-quiz.ts`:

```typescript
import { QuizConfig } from './types'

export const avatarElementQuiz: QuizConfig = {
  id: 'avatar-element',
  title: 'Which Avatar Element Are You?',
  description: 'Water, Earth, Fire, or Air?',
  
  theme: {
    primaryColor: '#4A90E2',  // Blue
    secondaryColor: '#7EC8E3',
    backgroundColor: '#f0f8ff',
    textColor: '#1a1a1a',
    backgroundImage: '/quiz/avatar-element/background.png'
  },
  
  questions: [
    {
      text: 'How do you handle conflict?',
      options: [
        { label: '🌊 Go with the flow', value: 'flow' },
        { label: '🗻 Stand your ground', value: 'stand' },
        { label: '🔥 Face it head-on', value: 'confront' },
        { label: '💨 Avoid and move on', value: 'avoid' }
      ]
    },
    // ... 5-7 more questions
  ],
  
  personalities: [
    { id: 'water', name: 'Water', tagline: 'Adaptable and healing', image: '/quiz/avatar-element/water.png' },
    { id: 'earth', name: 'Earth', tagline: 'Grounded and strong', image: '/quiz/avatar-element/earth.png' },
    { id: 'fire', name: 'Fire', tagline: 'Passionate and driven', image: '/quiz/avatar-element/fire.png' },
    { id: 'air', name: 'Air', tagline: 'Free and peaceful', image: '/quiz/avatar-element/air.png' }
  ],
  
  scoring: {
    questions: [
      {
        questionIndex: 0,
        rules: {
          'flow': { 'water': 3, 'air': 2 },
          'stand': { 'earth': 3, 'water': 1 },
          'confront': { 'fire': 3, 'earth': 2 },
          'avoid': { 'air': 3, 'water': 2 }
        }
      }
      // ... more scoring
    ]
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest'
  }
}
```

2. **Register it** - Add to `/src/lib/quizzes/index.ts`:

```typescript
import { avatarElementQuiz } from './avatar-element-quiz'

export const quizRegistry = {
  'ai-model': aiModelQuiz,
  'vacation-style': vacationStyleQuiz,
  'avatar-element': avatarElementQuiz  // ← Add this
}
```

3. **Add images** - Create folder `/public/quiz/avatar-element/` with:
   - `background.png`
   - `water.png`, `earth.png`, `fire.png`, `air.png`

4. **Test it** - Visit: `http://localhost:3000/quiz/avatar-element`

Done! 🎉

## AI-Assisted Creation

Want AI to do the work? Just say:

> "Create a [topic] quiz matching users to [personalities]"

For example:
- "Create a Star Wars character quiz"
- "Create a coding language personality quiz"  
- "Create a pizza topping quiz"

The AI will read `QUIZ_TEMPLATE.md` and generate everything for you!

## Full Documentation

- **📖 Complete Guide**: `QUIZ_TEMPLATE.md` (comprehensive instructions)
- **📋 System Summary**: `QUIZ_SYSTEM_SUMMARY.md` (what was built)
- **🔧 Type Definitions**: `/src/lib/quizzes/types.ts`

## File Structure

```
src/lib/quizzes/          ← Your quiz configs go here
src/components/quiz/      ← Core engine (don't modify)
src/app/quiz/[quizId]/    ← Dynamic route (don't modify)
public/quiz/[quiz-id]/    ← Your images go here
```

## Features

✅ **Themeable** - Colors, backgrounds, styles per quiz
✅ **Rule-Based Matching** - Fair, deterministic results
✅ **AI Explanations** - Optional personalized results with Claude
✅ **Auto-Save** - Resumes on page refresh
✅ **Analytics** - All responses saved to Supabase
✅ **Beautiful** - Smooth animations and transitions

## What's Different from the Old System?

| Old (`/annoyedatcoworker`) | New (`/quiz/[id]`) |
|---|---|
| 500+ lines per quiz | 100-line config |
| Fixed orange theme | Any theme |
| Dynamic images (slow) | Static images (fast) |
| Claude bias in results | Fair rule-based matching |
| Duplicate code | One reusable engine |

## Next Steps

1. ✅ Test the two example quizzes
2. 🎨 Add images for personality results
3. 🚀 Create your first quiz
4. 📱 Test on mobile
5. 🎉 Share with users!

**Questions?** Read `QUIZ_TEMPLATE.md` - it has everything!

