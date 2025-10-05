# Personalization Template for Narrative Quizzes

## 🎯 What This Is

A complete system for creating **personalized narrative quizzes** where users input their own details (names, timelines, situations) and the entire story adapts to them.

**Use this template to create quizzes about:**
- Relationships (moving in, getting married, dating)
- Career decisions (job changes, starting a business)
- Life transitions (moving cities, having kids, retiring)
- Any narrative where personal context matters!

---

## 📋 The Template Structure

### 1. Add Personalization Form

```typescript
personalizationForm: {
  instructions: "Brief explanation of what you're collecting",
  fields: [
    {
      id: 'fieldName',              // Use as {{fieldName}} in text
      question: "What to ask user",
      type: 'text' | 'select',      // Input type
      placeholder: 'Default value', // For text inputs
      options: ['Option 1', '...'], // For select inputs
      required: true | false        // Default: true
    }
  ]
}
```

### 2. Use Placeholders in Story Setup

```typescript
storySetup: {
  title: "Your Story Title",
  premise: `Use {{placeholders}} anywhere in your text.
  
  You've been dating {{partnerName}} for {{relationshipLength}}.
  {{currentSituation}}.
  
  The {{placeholders}} will be replaced with user's actual inputs!`,
  timeframe: "Duration of story",
  characters: [
    {
      name: "{{partnerName}}",  // Can use placeholders in character names!
      role: "Their role",
      personality: "Description"
    }
  ]
}
```

### 3. Use Placeholders in Questions (Optional)

```typescript
questions: [
  {
    id: 'q1',
    baseScenario: {
      timeMarker: "Day 1",
      dimension: "what_this_tests",
      coreSetup: `{{partnerName}} asks you something...` // Personalized!
    },
    options: [...]
  }
]
```

---

## 🎨 Complete Example: "Should You Get Married?"

```typescript
export const marriageQuiz: QuizConfig = {
  id: 'should-you-get-married',
  title: 'Should You Get Married?',
  description: 'Navigate the engagement decision.',
  type: 'narrative',
  
  theme: {
    primaryColor: '#db2777',
    secondaryColor: '#fbcfe8',
    backgroundColor: '#fdf2f8',
    textColor: '#831843',
    backgroundImage: '/quiz/marriage/background.png'
  },
  
  // STEP 1: Collect personalization data
  personalizationForm: {
    instructions: "Let's make this about YOUR relationship.",
    fields: [
      {
        id: 'partnerName',
        question: "What's your partner's name?",
        type: 'text',
        placeholder: 'Alex',
        required: true
      },
      {
        id: 'relationshipLength',
        question: "How long have you been together?",
        type: 'select',
        options: ['1-2 years', '2-3 years', '3-5 years', '5+ years'],
        required: true
      },
      {
        id: 'whoSuggested',
        question: "Who brought up marriage first?",
        type: 'select',
        options: ['They did', 'I did', 'It came up naturally', 'Not sure'],
        required: true
      },
      {
        id: 'currentPressure',
        question: "How much external pressure are you feeling?",
        type: 'select',
        options: ['A lot (family, friends)', 'Some', 'Very little', 'None'],
        required: false  // Optional field!
      }
    ]
  },
  
  // STEP 2: Use placeholders in story
  storySetup: {
    title: "Should You Get Married?",
    premise: `You've been with {{partnerName}} for {{relationshipLength}}. Things are serious.

{{whoSuggested}}, and now the question is hanging in the air: marriage.

{{currentPressure}} about making this decision.

Over the next few weeks, you'll face moments that reveal how you really feel about forever with {{partnerName}}.

Let's see what you discover...`,
    timeframe: "4 weeks",
    characters: [
      {
        name: "{{partnerName}}",
        role: "Your partner",
        personality: "Loves you, wants to know you're on the same page"
      }
    ]
  },
  
  // STEP 3: Questions can use placeholders too
  questions: [
    {
      id: 'q1',
      baseScenario: {
        timeMarker: "Week 1",
        dimension: "initial_feeling",
        coreSetup: `{{partnerName}} casually mentions marriage during dinner. Your gut reaction is...`
      },
      options: [
        { label: 'Excited - I want this', value: 'excited' },
        { label: 'Nervous - it feels too soon', value: 'nervous' },
        { label: 'Uncertain - I need to think', value: 'uncertain' }
      ],
      allowCustomInput: true
    },
    // ... more questions
  ],
  
  // Word matrix and AI explanation work the same
  wordMatrix: { /* ... */ },
  aiExplanation: { /* ... */ }
}
```

---

## 🔄 How It Works (Behind The Scenes)

### User Flow:
```
1. Welcome Screen → "Should You Get Married?"
2. Personalization Form → User enters partner name, timeline, etc.
3. Story Setup → Shows personalized premise with their inputs
4. Questions → Adapted scenes reference their specific situation
5. Results → Analysis includes their personalized context
```

### Technical Flow:
```
1. User submits form → Data saved to state
2. {{placeholders}} replaced in story setup
3. Each question adaptation receives personalization data
4. AI sees personalized context when adapting scenes
5. Final results reference their specific situation
```

---

## 📝 Personalization Field Types

### Text Input
```typescript
{
  id: 'partnerName',
  question: "What's your partner's name?",
  type: 'text',
  placeholder: 'Jordan',  // Shows in empty field
  required: true
}
```
**Use for:** Names, custom text, open-ended responses

### Select Dropdown
```typescript
{
  id: 'relationshipLength',
  question: "How long together?",
  type: 'select',
  options: ['6 months', '1 year', '2+ years'],  // User picks one
  required: true
}
```
**Use for:** Predefined choices, timelines, categories

### Optional vs Required
```typescript
{
  id: 'optionalField',
  question: "Optional question?",
  type: 'select',
  options: ['Yes', 'No'],
  required: false  // User can skip this
}
```

---

## 💡 Best Practices

### ✅ DO:
- **Collect essentials only** - 3-5 fields max
- **Use placeholders liberally** - Makes it feel personal
- **Make defaults work** - Placeholder values should make sense
- **Test without personalization** - Story should still work with defaults

### ❌ DON'T:
- **Over-collect** - Don't ask for 10 fields
- **Make it awkward** - Test how placeholders read in sentences
- **Assume all filled** - Handle missing optional fields gracefully
- **Forget character names** - {{partnerName}} in characters array!

---

## 🎯 Template Checklist

When creating a personalized narrative quiz:

### Setup
- [ ] Added `personalizationForm` to config
- [ ] 3-5 essential fields defined
- [ ] Clear instructions provided
- [ ] Appropriate input types chosen

### Story Integration  
- [ ] Placeholders in `storySetup.premise`
- [ ] Placeholders in character names where appropriate
- [ ] Placeholders in question `coreSetup` where it makes sense
- [ ] Story reads naturally with placeholders filled

### Testing
- [ ] Test with different name lengths
- [ ] Test with different timeline options
- [ ] Verify all placeholders get replaced
- [ ] Check that adapted text flows naturally

---

## 🚀 Quick Start: Generate Any Quiz

**Want to create "Should You Start a Business With Your Friend?"**

1. **Define the story:**
   - What's the decision? (Starting a business)
   - Who's involved? (Friend/business partner)
   - What context matters? (Friend's name, how long you've known them, type of business)

2. **Create personalization fields:**
   ```typescript
   fields: [
     { id: 'friendName', question: "Friend's name?", type: 'text' },
     { id: 'howLong', question: "How long friends?", type: 'select' },
     { id: 'businessType', question: "What kind of business?", type: 'text' }
   ]
   ```

3. **Write story with placeholders:**
   ```typescript
   premise: `You and {{friendName}} have been friends for {{howLong}}.
   
   Last week over coffee, you both got excited about starting {{businessType}} together.
   
   Now you need to figure out: is this a good idea?`
   ```

4. **Done!** The system handles the rest.

---

## 📚 More Examples

### "Should You Move to a New City?"
```typescript
personalizationForm: {
  fields: [
    { id: 'cityName', question: "Which city?", type: 'text' },
    { id: 'reason', question: "Why moving?", type: 'select',
      options: ['Job', 'Relationship', 'Fresh start', 'Family'] },
    { id: 'currentCity', question: "Where now?", type: 'text' }
  ]
}

premise: `You're considering moving from {{currentCity}} to {{cityName}}.
The reason: {{reason}}.

This is huge. Let's think it through...`
```

### "First Month as a Manager"
```typescript
personalizationForm: {
  fields: [
    { id: 'teamSize', question: "How many direct reports?", type: 'select',
      options: ['2-3', '4-6', '7-10', '10+'] },
    { id: 'industry', question: "What industry?", type: 'text' },
    { id: 'promoted', question: "Promoted internally or new company?",
      type: 'select', options: ['Promoted internally', 'New company'] }
  ]
}

premise: `You just became a manager of {{teamSize}} people in {{industry}}.

{{promoted}}.

First day is Monday. Let's see how you lead...`
```

---

## 🎉 You're Ready!

The personalization template is complete and works with any narrative quiz. Just:

1. Add `personalizationForm` with your fields
2. Use `{{placeholders}}` in story and questions
3. The system automatically:
   - Shows form before quiz
   - Replaces placeholders everywhere
   - Adapts scenes with personalized context
   - Creates truly personal experience

**Every narrative quiz can now be personalized to the user's actual situation!** 🚀

