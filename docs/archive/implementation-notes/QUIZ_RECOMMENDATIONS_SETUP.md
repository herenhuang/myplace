# Quiz Recommendations Setup Guide

## 🎯 What We Built

A personalized quiz recommendation system that appears as a beautiful "ps." footer note after users read their quiz explanation. Uses AI to analyze their answers and suggest the perfect next quiz in a warm, friend-like tone.

## 📋 Setup Steps

### 1. Create Database Table

Run the SQL migration in your Supabase dashboard:

```sql
-- Location: supabase_migrations/quiz_recommendations.sql
```

**To apply:**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase_migrations/quiz_recommendations.sql`
4. Run the query

This creates:
- `quiz_recommendations` table
- Proper indexes for analytics
- Row Level Security policies

### 2. Environment Variables

Make sure you have these in your `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Test the Flow

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Take a quiz:**
   - Navigate to any quiz (e.g., `/quiz/feedback-style`)
   - Complete all questions
   - View your result

3. **Click "See Why":**
   - Read the AI explanation
   - Scroll down to see the "ps." footer appear
   - Watch the loading messages cycle
   - See personalized recommendation

4. **Check database:**
   ```sql
   SELECT * FROM quiz_recommendations ORDER BY created_at DESC LIMIT 10;
   ```

## 🎨 How It Works

### User Flow
```
Complete Quiz → See Result Card → Click "See Why"
→ Read Explanation → Scroll Down
→ See "ps." Footer with Personalized Recommendation
→ Click to Start Next Quiz
```

### Technical Flow
```
1. User scrolls to bottom of explanation
2. QuizRecommendationFooter component loads
3. Shows cycling loading messages (2s intervals)
4. Calls /api/quiz/recommend with sessionId
5. AI analyzes:
   - Their answers
   - Their archetype/result
   - Quiz history (what they've taken)
   - Available quizzes
6. Returns personalized recommendation
7. Saves to database
8. Displays with animations
9. Tracks view when scrolled into view
10. Tracks click when user starts quiz
```

## 📊 Analytics

### View Recommendation Performance

```sql
-- Which quiz pairs have highest click-through rate?
SELECT
  source_quiz_id,
  recommended_quiz_id,
  COUNT(*) as total_shown,
  COUNT(viewed_at) as total_viewed,
  COUNT(clicked_at) as total_clicked,
  ROUND(100.0 * COUNT(clicked_at) / NULLIF(COUNT(viewed_at), 0), 2) as ctr
FROM quiz_recommendations
GROUP BY source_quiz_id, recommended_quiz_id
ORDER BY ctr DESC;
```

### Popular Quiz Journeys

```sql
-- What paths do users take?
SELECT
  r1.source_quiz_id as first_quiz,
  r1.recommended_quiz_id as second_quiz,
  r2.recommended_quiz_id as third_quiz,
  COUNT(*) as journey_count
FROM quiz_recommendations r1
LEFT JOIN quiz_recommendations r2
  ON r1.recommended_quiz_id = r2.source_quiz_id
  AND r1.user_id = r2.user_id
WHERE r1.clicked_at IS NOT NULL
GROUP BY r1.source_quiz_id, r1.recommended_quiz_id, r2.recommended_quiz_id
ORDER BY journey_count DESC;
```

## 🎯 Key Files Created

### API Endpoints
- `/src/app/api/quiz/recommend/route.ts` - Generates personalized recommendations
- `/src/app/api/quiz/recommend/track/route.ts` - Tracks views and clicks

### Components
- `/src/components/quiz/QuizRecommendationFooter.tsx` - The "ps." footer component
- `/src/components/quiz/quiz-recommendation-footer.module.scss` - Beautiful styling

### Utilities
- `/src/lib/quizzes/quiz-metadata.ts` - Quiz context for AI

### Database
- `/supabase_migrations/quiz_recommendations.sql` - Table schema

### Updated Files
- `/src/components/quiz/QuizResults.tsx` - Added footer integration
- `/src/components/quiz/QuizEngine.tsx` - Passes sessionId to results

## 🎨 Customization

### Adjust Loading Messages

Edit in `QuizRecommendationFooter.tsx`:
```typescript
const loadingMessages = [
  "Reading between the lines...",
  "Your message here...",
]
```

### Change AI Tone

Edit the prompt in `/api/quiz/recommend/route.ts`:
```typescript
const prompt = `You're a wise, funny friend...`
```

### Styling

Modify `/components/quiz/quiz-recommendation-footer.module.scss`:
- Colors
- Font (currently using 'Caveat' for handwritten feel)
- Animations
- Spacing

## 🐛 Troubleshooting

### Recommendation not showing?
1. Check console for errors
2. Verify sessionId is being passed to QuizResults
3. Check Supabase table exists
4. Verify ANTHROPIC_API_KEY is set

### AI returning bad format?
- Check `/api/quiz/recommend` logs
- AI should return valid JSON
- Error handling shows in console

### Tracking not working?
- Check browser console for fetch errors
- Verify RLS policies allow updates
- Check if recommendationId exists

## 🚀 Next Steps

### Future Enhancements
1. **"Does My Crush Like Me Back?" Quiz** - Natural progression from crush quiz
2. **Quiz Journey Visualization** - Show user's path through quizzes
3. **Smart History** - Use completion history for better recommendations
4. **A/B Testing** - Test different recommendation tones
5. **Analytics Dashboard** - Visualize recommendation performance

### Add New Quiz

1. Create quiz file in `/src/lib/quizzes/`
2. Add to registry in `/src/lib/quizzes/index.ts`
3. Add metadata in `/src/lib/quizzes/quiz-metadata.ts`
4. AI will automatically start recommending it!

## 💡 Tips

- **Tone matters:** The AI follows the prompt tone - keep it warm and friendly
- **Specificity:** Better recommendations reference actual answers
- **Context:** Quiz metadata helps AI understand when to recommend each quiz
- **Analytics:** Check performance weekly to refine recommendation logic

---

**Built with:** Next.js 15, Supabase, Anthropic Claude, Framer Motion

**Questions?** Check the code comments or console logs for debugging info.
