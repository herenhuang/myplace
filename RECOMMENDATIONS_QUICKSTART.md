# 🚀 Quiz Recommendations - Quick Start

## ⚡ TL;DR

1. Run SQL in Supabase dashboard
2. Test a quiz
3. Watch the "ps." magic happen! ✨

---

## Step 1: Database Setup (2 minutes)

### Go to Supabase Dashboard → SQL Editor

Copy and paste the entire contents of:
```
supabase_migrations/quiz_recommendations.sql
```

Or run this directly:

```sql
CREATE TABLE IF NOT EXISTS quiz_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  source_quiz_id TEXT NOT NULL,
  recommended_quiz_id TEXT NOT NULL,
  source_archetype TEXT,
  reasoning TEXT NOT NULL,
  cta TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_recommendations_session ON quiz_recommendations(session_id);
CREATE INDEX idx_recommendations_source ON quiz_recommendations(source_quiz_id);
CREATE INDEX idx_recommendations_performance ON quiz_recommendations(source_quiz_id, recommended_quiz_id);
CREATE INDEX idx_recommendations_user ON quiz_recommendations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_recommendations_created ON quiz_recommendations(created_at DESC);

ALTER TABLE quiz_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert" ON quiz_recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select" ON quiz_recommendations FOR SELECT USING (true);
CREATE POLICY "Allow update" ON quiz_recommendations FOR UPDATE USING (true);
```

Click **Run** ✅

---

## Step 2: Test It! (1 minute)

```bash
npm run dev
```

1. Go to http://localhost:3000/quiz/feedback-style
2. Take the quiz (answer honestly!)
3. See your result
4. Click **"See Why →"**
5. Read the explanation
6. **Scroll down** 👀

You should see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━
ps.

Reading between the lines...
↓ (cycles through messages)

Based on how you said [specific thing]...
You should try: ✨ Manager Style

[Take This Quiz →]
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 3: Verify It Worked

### In Browser
- No console errors
- Smooth animations
- Personalized message references your answers

### In Supabase
```sql
SELECT * FROM quiz_recommendations ORDER BY created_at DESC LIMIT 1;
```

Should show:
- ✅ `source_quiz_id`: feedback-style
- ✅ `recommended_quiz_id`: manager-style (or whatever AI suggested)
- ✅ `reasoning`: "I noticed you..." (personalized!)
- ✅ `viewed_at`: timestamp when you scrolled to it
- ✅ `clicked_at`: null (until you click)

---

## 🎯 What You Built

### The User Journey
```
Quiz Complete
   ↓
See Result Card
   ↓
Click "See Why"
   ↓
Read AI Explanation
   ↓
Scroll down...
   ↓
"ps." ← Handwritten feel
   ↓
Cycling messages (every 2s)
   ↓
✨ Personalized recommendation!
   ↓
Click → Next quiz starts
```

### The Tech
- **AI-powered**: Claude analyzes answers and suggests perfect next quiz
- **Personalized**: References their specific responses
- **Tracked**: Views and clicks saved for analytics
- **Beautiful**: Handwritten "ps.", smooth animations
- **Smart**: Won't show same quiz twice, handles edge cases

---

## 📊 See Analytics

```sql
-- How's it performing?
SELECT
  source_quiz_id,
  recommended_quiz_id,
  COUNT(*) as shown,
  COUNT(clicked_at) as clicked,
  ROUND(100.0 * COUNT(clicked_at) / COUNT(*), 2) as ctr
FROM quiz_recommendations
GROUP BY source_quiz_id, recommended_quiz_id
ORDER BY ctr DESC;
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Footer not showing | Check console, verify sessionId passed to QuizResults |
| "Failed to generate" | Verify ANTHROPIC_API_KEY in .env.local |
| Database error | Ensure SQL migration ran, check sessions table exists |
| No personalization | AI references quiz answers - check API response |

---

## 🎨 Customize It

### Change Loading Messages
`/src/components/quiz/QuizRecommendationFooter.tsx`:
```typescript
const loadingMessages = [
  "Your custom message...",
  "Another one...",
]
```

### Adjust AI Tone
`/src/app/api/quiz/recommend/route.ts`:
```typescript
const prompt = `You're a [your vibe here]...`
```

### Style It
`/src/components/quiz/quiz-recommendation-footer.module.scss`:
- Colors, fonts, spacing all customizable
- Currently uses 'Caveat' for handwritten feel

---

## 🚀 What's Next?

### Immediate
- [ ] Test with different quizzes
- [ ] Watch recommendations in real-time
- [ ] Check analytics after a few users

### Soon
- [ ] Build "Does My Crush Like Me Back?" quiz (natural follow-up)
- [ ] Refine AI prompts based on quality
- [ ] Add more quiz metadata

### Future
- [ ] Quiz journey visualization
- [ ] Cross-quiz insights
- [ ] A/B test different tones
- [ ] Smart recommendations based on historical data

---

## 📁 What Changed

### New Files
```
✅ supabase_migrations/quiz_recommendations.sql
✅ src/app/api/quiz/recommend/route.ts
✅ src/app/api/quiz/recommend/track/route.ts
✅ src/components/quiz/QuizRecommendationFooter.tsx
✅ src/components/quiz/quiz-recommendation-footer.module.scss
✅ src/lib/quizzes/quiz-metadata.ts
```

### Updated Files
```
✏️ src/components/quiz/QuizResults.tsx (added footer)
✏️ src/components/quiz/QuizEngine.tsx (passes sessionId)
```

---

## ✨ The Magic Moment

When someone scrolls and sees:

> **ps.**
>
> Okay so you lit up at their name and felt that "weird pang" when they mentioned dating someone else...
>
> You're definitely crushing. Try **"Does My Crush Like Me Back?"** and let's decode their signals. 😅

That "OMG they know me" feeling? **You just built it.** 🎉

---

**Full details:** See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

**Setup help:** See [QUIZ_RECOMMENDATIONS_SETUP.md](./QUIZ_RECOMMENDATIONS_SETUP.md)
