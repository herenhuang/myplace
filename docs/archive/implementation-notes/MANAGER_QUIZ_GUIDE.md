# Manager Style Quiz - Complete Guide

## ✅ What's Been Created

Your "What's Your Manager Style?" quiz is now fully configured and ready to use!

### Files Created/Modified:
1. **`/src/lib/quizzes/manager-style-quiz.ts`** - Complete quiz configuration
2. **`/src/lib/quizzes/index.ts`** - Quiz registered and available
3. **`/public/quiz/manager-style/`** - Image assets directory created

## 🎯 Quiz Features

### Quiz Type: Story-Matrix
- **100 unique combinations** (10 first words × 10 second words)
- **Dynamic AI-generated results** based on actual behavior
- **Personalized explanations** using Claude AI

### Management Dimensions Covered:

#### First Words (HOW they manage):
1. **Decisive** - Makes calls quickly
2. **Collaborative** - Values team input
3. **Flexible** - Adapts to situations
4. **Structured** - Organized & planned
5. **Empowering** - Delegates authority
6. **Hands-On** - Involved in details
7. **Strategic** - Long-term thinker
8. **Supportive** - Nurturing approach
9. **Direct** - Clear & honest
10. **Visionary** - Big picture focused

#### Second Words (WHAT they prioritize):
1. **Coach** - Develops people
2. **Strategist** - Focused on planning
3. **People-First Leader** - Team wellbeing priority
4. **Results Driver** - Outcomes focused
5. **Process Builder** - Systems & efficiency
6. **Innovator** - New ideas & experiments
7. **Facilitator** - Enables team success
8. **Mentor** - Guides & teaches
9. **Accountability Partner** - High standards
10. **Culture Builder** - Team dynamics focus

### Example Results:
- "Collaborative Coach" - *"People leave your 1:1s feeling like they can conquer anything"*
- "Decisive Results Driver" - *"Your team knows exactly where they stand—and they respect it"*
- "Strategic Mentor" - *"You're always thinking three moves ahead while bringing others along"*
- "Supportive Culture Builder" - *"Everyone feels the difference you make in how the team works together"*

## 📝 The 10 Questions

Each question is **scenario-based** (not preference-based) to reveal actual management behavior:

1. **Decision Making** - Team is split 50/50, what do you do?
2. **Monday Morning Priorities** - What do you check first?
3. **Performance Issues** - How do you handle underperformance?
4. **Quarterly Planning** - What's your planning style?
5. **Crisis Management** - Friday 4pm emergency, your move?
6. **Development Approach** - How do you guide team members?
7. **Feedback Timing** - When and how do you give feedback?
8. **Team Culture** - What matters most to you?
9. **Conflict Resolution** - How do you handle team tension?
10. **Success Definition** - What makes you feel successful?

## 🚀 How to Use

### Access the Quiz:
```
http://localhost:3000/quiz/manager-style
```
OR
```
https://your-domain.com/quiz/manager-style
```

### For Development:
```bash
npm run dev
# Navigate to /quiz/manager-style
```

## 🎨 Visual Theme

- **Primary Color**: Indigo `#6366f1`
- **Secondary Color**: Light Indigo `#a5b4fc`
- **Background**: Off-white `#fafafa`
- **Text**: Dark Slate `#1e293b`
- **Style**: Professional yet approachable

## ⚠️ What You Still Need

### Background Image (Optional but Recommended)
The quiz will work without it, but for the best experience:

**File**: `/public/quiz/manager-style/background.png`
**Size**: 1200x1600px (portrait)

**AI Generation Prompt:**
```
A subtle, professional background for a management leadership quiz. 
Soft indigo and lavender gradient (colors: #6366f1 to #a5b4fc), 
abstract geometric shapes suggesting organization and growth, 
minimalist design suitable for text overlay, portrait orientation, 
modern and approachable aesthetic.
```

**Or use a placeholder:**
- Any professional image with blue/purple tones
- Can use an existing image from `/public/elevate/` as temporary solution

## 🤖 AI Features

### Enabled by Default:
- **Model**: Claude 3.7 Sonnet (latest)
- **Personalized explanations** based on specific answers
- **Alternative styles** showing near-matches
- **Growth tips** tailored to management style

### Sections Generated:
1. **Your Management DNA** - Core approach explained
2. **What I Noticed** - Specific answer patterns highlighted
3. **You Were Also Close To...** - Alternative styles explored
4. **Tips for Your Growth** - Actionable advice
5. **Your Leadership Impact** - Inspiring conclusion

## 🧪 Testing Checklist

- [ ] Navigate to `/quiz/manager-style`
- [ ] Complete all 10 questions
- [ ] Try different answer combinations
- [ ] Check that results feel accurate
- [ ] Verify AI explanation generates properly
- [ ] Test custom input on questions
- [ ] Check mobile responsiveness
- [ ] Verify alternative styles show up

## 🔧 Customization Options

### To Modify Questions:
Edit `/src/lib/quizzes/manager-style-quiz.ts` - `questions` array

### To Change Word Matrix:
Edit `/src/lib/quizzes/manager-style-quiz.ts` - `wordMatrix` object

### To Adjust Theme:
Edit `/src/lib/quizzes/manager-style-quiz.ts` - `theme` object

### To Modify AI Prompt:
Edit `/src/lib/quizzes/manager-style-quiz.ts` - `aiExplanation.promptTemplate`

## 📊 How It Works

1. **User takes quiz** - Answers 10 scenario-based questions
2. **Responses collected** - Each answer tagged with behavioral values
3. **AI analyzes patterns** - Claude reviews all answers holistically
4. **Best combination selected** - From 100 possible management styles
5. **Personalized explanation** - Custom writeup connecting answers to style
6. **Alternative styles** - Shows 2 near-matches for nuance
7. **Results saved** - Stored in database for user's profile

## 🎯 Best Practices

### For Users Taking the Quiz:
- Answer based on **actual behavior**, not aspirations
- Use custom input for nuanced situations
- Read the full AI explanation for insights

### For Facilitating with Teams:
- Great for management training sessions
- Use results to discuss diverse leadership styles
- Encourage sharing of alternative styles too
- Focus on strengths, not prescriptive "shoulds"

## 🚢 Deployment

The quiz is automatically available once deployed since it's registered in the quiz registry. No additional configuration needed!

### Environment Variables Required:
```
ANTHROPIC_API_KEY=your_key_here
```

## 📈 Next Steps

1. **Add background image** (optional)
2. **Test the quiz** at `/quiz/manager-style`
3. **Try different answer patterns** to see variety of results
4. **Share with team** for feedback
5. **Iterate on questions** if needed

## 🎉 You're All Set!

Your manager style quiz is production-ready. The story-matrix system will generate nuanced, personalized results that help people understand their unique leadership approach.

**Have questions?** Check `QUIZ_TEMPLATE.md` for full documentation.

