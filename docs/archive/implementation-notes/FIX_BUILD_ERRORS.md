# Build Error Fixes

## Errors to Fix:

### 1. Type Definitions Needed
Add to `src/lib/quizzes/types.ts` (if not already there):
- QuizResponse interface already exists

### 2. Files to Fix:

#### A. src/app/api/quiz/select-archetype/route.ts
**Line 21:** Change `(r: any, i: number)` to `(r: QuizResponse, i: number)`
**Line 25:** Change `let prompt =` to `const prompt =`
**Line 69:** Change `(alt: any)` to `(alt: { firstWord: string; secondWord: string; reason: string })`
**Line 10:** Remove unused `sessionId` or prefix with underscore: `_sessionId`
**Line 52:** Remove unused `parseError` or prefix with underscore: `_parseError`

#### B. src/app/api/quiz/explain/route.ts
**Line 34:** Change `(r: any)` to `(r: QuizResponse)`

#### C. src/app/api/quiz/stats/route.ts
**Line 45:** Change `(r: any)` to `(r: QuizResponse)`

#### D. src/components/quiz/QuizEngine.tsx
**Line 383:** Change `(alt: any)` to `(alt: { fullArchetype: string; reason: string })`

#### E. src/components/quiz/ResultsComparison.tsx
**Line 95:** Change `You're` to `You&apos;re`
**Line 97:** Change `You're` to `You&apos;re`

#### F. src/app/annoyedatcoworker/actions.ts
**Line 129:** Change `(p as any)` to proper typing with interface

Let me create the fixes:
