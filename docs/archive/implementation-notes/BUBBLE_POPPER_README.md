# Bubble Popper Game

## Overview
A simple yet insightful personality assessment game disguised as bubble wrap popping. Players pop 100 bubbles while the game measures their behavior patterns to determine their personality archetype.

## Location
- **Route**: `/bubble-popper`
- **Main Component**: `src/app/bubble-popper/page.tsx`
- **Styles**: `src/app/bubble-popper/page.module.scss`

## Game Flow

### 1. Welcome Screen
- Simple intro: "Bubble Popper Game --> just pop the bubbles, you dont need to know anything else."
- Start button to begin game

### 2. Game Screen
- **Layout**: 10x10 grid of 100 bubbles
- **Header**: 
  - Bubble counter (X / 100)
  - Timer (MM:SS format)
  - End Game button
- **Interaction**: Click bubbles to pop them
- **Visual Feedback**: Bubbles animate and disappear when popped

### 3. Archetype Screen
- Shows personality type based on gameplay
- Displays stats: bubbles popped and time elapsed
- Option to see full analysis

### 4. Assessment Screen
- Detailed AI-generated personality analysis
- Full gameplay statistics
- Option to play again

## Personality Archetypes

The game determines one of 7 personality types based on:
- **Completion rate**: Did they pop all 100 bubbles?
- **Time taken**: How fast/slow were they?
- **Quit behavior**: When did they end the game?

### Archetypes:

1. **The Speedrunner** (Completed, < 60s)
   - "You came, you saw, you conquered—fast"
   - Highly efficient and competitive

2. **The Methodical Completionist** (Completed, 60-180s)
   - "Slow and steady wins the race"
   - Thorough and consistent

3. **The Determined Finisher** (Completed, > 180s)
   - "Patience is your superpower"
   - Persistent even when tedious

4. **The Strategic Quitter** (75-99 bubbles)
   - "You know when good enough is good enough"
   - Understands diminishing returns

5. **The Skeptical Rebel** (40-74 bubbles)
   - "You question the point of pointless tasks"
   - Needs to see value in activities

6. **The Efficient Minimalist** (10-39 bubbles)
   - "Why pop 100 when 10 proves the point?"
   - Samples before committing

7. **The Instant Rebel** (< 10 bubbles)
   - "You saw through this immediately"
   - Refuses to waste time

## Technical Details

### State Management
- Tracks bubble states (popped/unpopped)
- Real-time timer updates
- Game data (bubbles popped, time, completion status)

### AI Integration
- Uses Claude 3.7 Sonnet for personality analysis
- Generates personalized insights based on gameplay
- API endpoint: `/api/quiz/explain`

### Responsive Design
- iPhone container UI (matches other simulations)
- Mobile-first approach
- Smooth animations and transitions

## Metrics Tracked

1. **Bubbles Popped**: Count of bubbles clicked
2. **Time Elapsed**: Total time from start to end
3. **Completion Status**: Boolean (all 100 vs. quit early)
4. **Completion Rate**: Percentage of bubbles popped

## Design Philosophy

The game is intentionally simple and somewhat pointless—this is by design! It reveals personality through:
- **Rule Following**: Do they complete all 100 even if it's tedious?
- **Patience**: How long will they persist?
- **Critical Thinking**: Do they question the value of the task?
- **Efficiency**: Do they optimize or just execute?

## Future Enhancements

Potential improvements:
- [ ] Sound effects for bubble pops
- [ ] Different bubble patterns/sizes
- [ ] Difficulty levels
- [ ] Multiplayer mode
- [ ] Save/share results
- [ ] Compare with other players' stats

## Testing

To test the game:
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click on "Bubble Popper" card
4. Play through the game
5. Check archetype and assessment screens

## Notes

- Game is on the `bubblesgame` branch
- Uses existing iPhone container pattern from other simulations
- Integrates with existing quiz/assessment infrastructure
- Added to home page games section with voting capability

