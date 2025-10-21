/**
 * Convert investor-allocation-quiz.md to TypeScript
 */

import * as fs from 'fs'
import * as path from 'path'
import { parseQuizMarkdown } from '../src/lib/quizzes/markdown-to-quiz-config'

const markdownPath = path.join(__dirname, '../src/lib/quizzes/investor-allocation-quiz.md')
const outputPath = path.join(__dirname, '../src/lib/quizzes/investor-allocation-quiz.ts')

try {
  // Read markdown
  const markdown = fs.readFileSync(markdownPath, 'utf-8')

  // Parse to config
  const config = parseQuizMarkdown(markdown)

  // Generate TypeScript file
  const tsContent = `import { QuizConfig } from './types'

export const investorAllocationQuiz: QuizConfig = ${JSON.stringify(config, null, 2)}
`

  // Write to file
  fs.writeFileSync(outputPath, tsContent, 'utf-8')

  console.log('✅ Successfully converted investor-allocation-quiz.md to TypeScript!')
  console.log(`📝 Output: ${outputPath}`)
  console.log(`\n📊 Quiz Summary:`)
  console.log(`   - ID: ${config.id}`)
  console.log(`   - Title: ${config.title}`)
  console.log(`   - Type: ${config.type}`)
  console.log(`   - Questions: ${config.questions.length}`)
  console.log(`   - Word Matrix: ${config.wordMatrix ? 'Yes' : 'No'}`)
  console.log(`   - AI Explanation: ${config.aiExplanation ? 'Yes' : 'No'}`)

} catch (error) {
  console.error('❌ Error converting quiz:', error)
  process.exit(1)
}
