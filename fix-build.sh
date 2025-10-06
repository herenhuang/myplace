#!/bin/bash

echo "🔧 Fixing build errors..."

# Fix 1: src/app/api/quiz/select-archetype/route.ts
echo "Fixing select-archetype route..."
sed -i '' 's/.map((r: any, i: number)/.map((r: { question: string; selectedOption: string }, i: number)/' src/app/api/quiz/select-archetype/route.ts
sed -i '' 's/let prompt = wordMatrix/const prompt = wordMatrix/' src/app/api/quiz/select-archetype/route.ts
sed -i '' 's/.map((alt: any)/.map((alt: { firstWord: string; secondWord: string; reason?: string })/' src/app/api/quiz/select-archetype/route.ts
sed -i '' 's/const { sessionId, quizId/const { sessionId: _sessionId, quizId/' src/app/api/quiz/select-archetype/route.ts
sed -i '' 's/} catch (parseError) {/} catch (_parseError) {/' src/app/api/quiz/select-archetype/route.ts

# Fix 2: src/app/api/quiz/explain/route.ts  
echo "Fixing explain route..."
sed -i '' 's/.map((r: any)/.map((r: { question: string; selectedOption: string })/' src/app/api/quiz/explain/route.ts

# Fix 3: src/app/api/quiz/stats/route.ts
echo "Fixing stats route..."
sed -i '' 's/responses.find((r: any)/responses.find((r: { questionIndex: number; selectedValue?: string })/' src/app/api/quiz/stats/route.ts

# Fix 4: src/components/quiz/QuizEngine.tsx
echo "Fixing QuizEngine..."
sed -i '' 's/.map((alt: any)/.map((alt: { fullArchetype: string; reason: string })/' src/components/quiz/QuizEngine.tsx

# Fix 5: src/components/quiz/ResultsComparison.tsx
echo "Fixing ResultsComparison..."
sed -i '' "s/You're in good company!/You\&apos;re in good company!/" src/components/quiz/ResultsComparison.tsx
sed -i '' "s/You're more unique/You\&apos;re more unique/" src/components/quiz/ResultsComparison.tsx

# Fix 6: src/app/annoyedatcoworker/actions.ts
echo "Fixing annoyedatcoworker actions..."
sed -i '' 's/(p as any)/(p as { inlineData?: { data: string; mimeType?: string } })/' src/app/annoyedatcoworker/actions.ts

echo "✅ All fixes applied! Try running 'npm run build' again."
