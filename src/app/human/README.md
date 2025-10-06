# Human Assessment Test

## Overview

The Human Assessment Test (`/human`) is a multi-step interactive experience that measures how "human" user behavior is compared to AI patterns. By analyzing response content, timing, linguistic markers, and creativity, the system assigns a "humanness" metascore from 0-100.

## Architecture

### Frontend (`page.tsx`)
- **Screen Flow**: welcome → confirmation → simulation → analyzing → results (metascore → breakdown → archetypes)
- **State Management**: React hooks for session, step progression, and results
- **UI Components**: Responsive cards with orange branding matching the overall MyPlace design

### Backend

#### Server Actions (`actions.ts`)
- `startHumanSession()` - Initialize database session
- `recordHumanStep()` - Save each step response with timing data
- `saveHumanAnalysis()` - Store final analysis results
- `getPopulationStats()` - Retrieve comparative statistics (optional)

#### API Endpoints
1. **`/api/human/generate-ai-baseline`**
   - Generates 5 AI responses to each question for comparison
   - Uses Claude to simulate different AI response styles
   - Returns baseline responses for similarity analysis

2. **`/api/human/analyze-humanness`**
   - Comprehensive analysis of all user responses
   - Detects linguistic markers (AI vs human patterns)
   - Calculates metascore and assigns archetypes
   - Provides per-question breakdown with percentiles

### Data Layer

#### Question Bank (`/lib/human-questions.ts`)
9 carefully designed questions across multiple types:
- **Scenario**: Open-ended situational responses
- **Word Association**: Quick cognitive reactions
- **Image Description**: Subjective interpretation
- **Forced Choice**: Value-based decisions

#### Types (`/lib/human-types.ts`)
- `HumanStepData` - Individual response data structure
- `HumanSessionData` - Complete session information
- `HumanAnalysisResult` - Analysis output format
- `SurpriseAnalysis` - Per-question metrics

#### Database Schema
Uses existing `sessions` table:
```typescript
{
  game_id: 'human-test',
  session_id: string,
  data: HumanSessionData,
  result: HumanAnalysisResult
}
```

## Scoring Methodology

### Humanness Indicators (Positive)
1. **Spontaneity & Unpredictability**: Unexpected choices, creative interpretations
2. **Emotional Authenticity**: Genuine reactions, humor, sarcasm
3. **Contextual Nuance**: Reading between lines, social awareness
4. **Personal Touch**: Use of "I", subjective opinions, colloquialisms
5. **Imperfection**: Natural typos, incomplete thoughts, casual language
6. **Creativity**: Original metaphors, unusual connections
7. **Response Time Variance**: Natural thinking time variation

### AI-like Indicators (Negative)
1. **Over-formality**: Professional tone, perfect grammar
2. **Comprehensiveness**: Overly thorough, structured responses
3. **Generic Politeness**: "I hope this helps", excessive apologizing
4. **Neutral Tone**: Lack of emotional expression
5. **Consistency**: Too uniform in style
6. **Speed**: Suspiciously fast or mechanically consistent timing
7. **AI Phrases**: "As an AI", "I would suggest"

### Metascore Scale
- **0-30**: Very AI-like (suspicious, overly formal, predictable)
- **31-60**: Borderline (some human traits, some AI patterns)
- **61-85**: Human-like (natural variance, authentic, contextual)
- **86-100**: Exceptionally human (highly creative, emotionally rich)

### Archetypes
8 behavioral archetypes based on response patterns:
- **The Floater** - Spontaneous, unpredictable
- **The Anchor** - Steady, consistent, authentic
- **The Planner** - Structured with human warmth
- **The Creative** - Original, imaginative
- **The Pragmatist** - Practical, context-aware
- **The Comedian** - Humorous, witty
- **The Philosopher** - Reflective, contemplative
- **The Rebel** - Non-conformist, challenging

## Key Features

### 1. AI Baseline Comparison
Every question generates 5 AI baseline responses representing different AI models and styles. User responses are compared against these to measure deviation.

### 2. Linguistic Marker Detection
Automatically detects:
- AI markers: formal language, structured responses, generic phrases
- Human markers: casual language, emotional expressions, colloquialisms

### 3. Response Time Analysis
Tracks millisecond-level timing for each response:
- Too fast (<500ms) = bot-like
- Natural variance = human-like
- Consistent timing = suspicious

### 4. Population Comparison
Shows how unusual each response is compared to other users:
- Percentile rankings
- "79% out of the ordinary" insights
- Rare behavior highlighting

### 5. Multi-dimensional Analysis
Claude-powered comprehensive analysis considering:
- Semantic content
- Emotional tone
- Contextual understanding
- Creativity and originality
- Consistency patterns

## Usage

### For Users
1. Navigate to `/human`
2. Complete 9 questions honestly and naturally
3. Receive metascore, breakdown, and archetype results
4. Share or retake

### For Developers

#### Adding New Questions
Edit `/lib/human-questions.ts`:
```typescript
{
  stepNumber: 10,
  type: 'scenario',
  question: "Your question here",
  context: "Optional context",
  placeholder: "Your Response..."
}
```

#### Modifying Scoring
Edit the prompt in `/api/human/analyze-humanness/route.ts` to adjust:
- Scoring rubric weights
- Archetype definitions
- Analysis criteria

#### Customizing Archetypes
Edit `/lib/human-questions.ts` → `HUMAN_ARCHETYPES` object

## Future Enhancements

### Potential Features
1. **Adaptive Questions**: Dynamically generate questions based on previous responses
2. **Real-time Scoring**: Show running metascore as user progresses
3. **Social Sharing**: Generate shareable result cards
4. **Leaderboards**: Most creative/unexpected responses
5. **Multi-language Support**: Questions in multiple languages
6. **Voice Input**: Analyze speech patterns for additional signals
7. **Advanced Analytics Dashboard**: Admin view of aggregate patterns
8. **A/B Testing**: Experiment with different question types
9. **ML Model Training**: Use collected data to improve detection
10. **Bot Detection**: Flag suspicious sessions for review

### Data Science Opportunities
- Analyze which questions best differentiate humans from AI
- Build predictive models for humanness scoring
- Study population trends over time
- Identify emerging AI linguistic patterns

## Security & Privacy

### Data Protection
- No personally identifiable information required
- Anonymous session tracking
- Optional user association (if authenticated)
- Responses stored securely in Supabase

### Bot Detection
System naturally detects suspicious patterns:
- Too-fast response times
- Perfect grammar across all responses
- Generic, templated answers
- Lack of emotional markers

## Testing

### Manual Testing Checklist
- [ ] Complete full flow as new user
- [ ] Test all 9 question types
- [ ] Verify response time tracking
- [ ] Check AI baseline generation
- [ ] Confirm analysis completion
- [ ] Review all result screens
- [ ] Test mobile responsiveness
- [ ] Verify database recording

### Edge Cases
- Empty/whitespace responses (blocked)
- Very long responses (character limits)
- Network failures during analysis (error handling)
- Missing AI baseline data (graceful degradation)
- Session timeout (state recovery)

## Performance Considerations

### Optimization
- AI baseline generation happens per-question (could be batched)
- Final analysis uses single Claude API call
- Results cached in database for repeat views
- Images lazy-loaded where applicable

### Costs
- ~10 Claude API calls per session (9 baselines + 1 analysis)
- Average cost: $0.05-0.10 per complete session
- Database storage: ~5-10KB per session

## Maintenance

### Monitoring
- Track API call success rates
- Monitor average session completion time
- Review metascore distribution
- Analyze question difficulty/clarity

### Updates
- Refresh question bank seasonally
- Update AI baseline prompts as AI evolves
- Adjust scoring weights based on data
- Add new archetypes as patterns emerge

## Credits

Based on research in:
- Computational linguistics
- Behavioral psychology
- Human-AI interaction patterns
- Cognitive science

Inspired by:
- CAPTCHA evolution
- Turing Test principles
- Personality assessment frameworks

