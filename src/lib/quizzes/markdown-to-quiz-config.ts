/**
 * Markdown to Quiz Config Converter
 *
 * Converts narrative quiz markdown files into QuizConfig TypeScript objects.
 *
 * Usage:
 * ```typescript
 * import { parseQuizMarkdown } from './markdown-to-quiz-config'
 * import fs from 'fs'
 *
 * const markdown = fs.readFileSync('my-quiz.md', 'utf-8')
 * const quizConfig = parseQuizMarkdown(markdown)
 * ```
 */

import { QuizConfig, QuizQuestion, QuizOption, PersonalizationField, StoryCharacter } from './types'

interface MarkdownQuestion {
  id: string
  type: 'OPEN-ENDED' | 'HARD-CODED' | 'HYBRID'
  dimension: string
  timeMarker: string
  narrative: string
  options?: Array<{
    value: string
    label: string
    nextQuestionId?: string
  }>
}

export function parseQuizMarkdown(markdown: string): QuizConfig {
  const lines = markdown.split('\n')

  // Parse meta information
  const meta = parseSection(lines, '## Meta Information')
  const quizId = extractValue(meta, 'Quiz ID')?.replace(/`/g, '').trim() || 'unnamed-quiz'
  const title = extractValue(meta, 'Title') || 'Untitled Quiz'
  const description = extractValue(meta, 'Description') || ''
  const type = extractValue(meta, 'Type') as 'archetype' | 'story-matrix' | 'narrative' || 'narrative'

  // Parse theme
  const theme = parseSection(lines, '## Theme Configuration')
  const themeConfig = {
    primaryColor: extractValue(theme, 'Primary Color')?.replace(/`/g, '').trim() || '#000000',
    secondaryColor: extractValue(theme, 'Secondary Color')?.replace(/`/g, '').trim() || '#666666',
    backgroundColor: extractValue(theme, 'Background Color')?.replace(/`/g, '').trim() || '#ffffff',
    textColor: extractValue(theme, 'Text Color')?.replace(/`/g, '').trim() || '#000000',
    backgroundImage: extractValue(theme, 'Background Image')?.replace(/`/g, '').trim() || ''
  }

  // Parse personalization form
  const personalizationSection = parseSection(lines, '## Personalization Form')
  const personalizationInstructions = personalizationSection
    .find(line => line.startsWith('**Instructions:**'))
    ?.replace('**Instructions:**', '')
    .trim()
    .replace(/^"|"$/g, '') || ''

  const personalizationFields = parsePersonalizationFields(personalizationSection)

  // Parse story setup
  const storySection = parseSection(lines, '## Story Setup')
  const storyTitle = extractValue(storySection, 'Title') || ''
  const premise = extractValue(storySection, 'Premise') || ''
  const timeframe = extractValue(storySection, 'Timeframe') || ''
  const characters = parseCharacters(storySection)

  // Parse custom images
  const imagesSection = parseSection(lines, '## Custom Images')
  const customImages = imagesSection.length > 0 ? {
    analyzingScreen: extractValue(imagesSection, 'Analyzing Screen Image')?.replace(/`/g, '').trim(),
    questionBubble: extractValue(imagesSection, 'Question Bubble Image')?.replace(/`/g, '').trim()
  } : undefined

  // Parse analyzing messages
  const analyzingSection = parseSection(lines, '## Analyzing Messages')
  const analyzingMessages = analyzingSection
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*"?/, '').replace(/"?$/, '').trim())
    .filter(msg => msg.length > 0)

  // Parse questions
  const questions = parseQuestions(lines)

  // Parse word matrix
  const wordMatrixSection = parseSection(lines, '# Word Matrix Configuration')
  const firstWords = parseWordList(wordMatrixSection, '## First Words')
  const secondWords = parseWordList(wordMatrixSection, '## Second Words')
  const selectionPrompt = parseCodeBlock(wordMatrixSection, '## Selection Prompt')

  // Parse AI explanation
  const aiSection = parseSection(lines, '# AI Explanation Configuration')
  const aiEnabled = extractValue(aiSection, 'Enabled')?.toLowerCase().includes('yes') || false
  const aiModel = extractValue(aiSection, 'Model')?.replace(/`/g, '').trim() as any || 'claude-3-5-sonnet-20241022'
  const aiPromptTemplate = parseCodeBlock(aiSection, '## Prompt Template')

  // Build the minimal required config
  const config: QuizConfig = {
    id: quizId,
    title,
    description,
    type,
    theme: themeConfig,
    questions: questions.map(q => convertToQuizQuestion(q))
  }

  // OPTIONAL: Add personalization form only if fields exist
  if (personalizationFields.length > 0) {
    config.personalizationForm = {
      instructions: personalizationInstructions,
      fields: personalizationFields
    }
  }

  // OPTIONAL: Add story setup only if it has content
  if (premise || timeframe || characters.length > 0) {
    config.storySetup = {
      title: storyTitle,
      premise,
      timeframe,
      characters
    }
  }

  // OPTIONAL: Only add analyzingMessages if they exist
  if (analyzingMessages.length > 0) {
    config.analyzingMessages = analyzingMessages
  }

  // OPTIONAL: Only add customImages if they exist
  if (customImages?.analyzingScreen || customImages?.questionBubble) {
    config.customImages = customImages
  }

  // OPTIONAL: Only add wordMatrix if both word lists exist
  if (firstWords.length > 0 && secondWords.length > 0 && selectionPrompt) {
    config.wordMatrix = {
      firstWords,
      secondWords,
      selectionPrompt
    }
  }

  // OPTIONAL: Only add AI explanation if enabled
  if (aiEnabled && aiPromptTemplate) {
    config.aiExplanation = {
      enabled: true,
      model: aiModel,
      promptTemplate: aiPromptTemplate
    }
  }

  return config
}

function parseSection(lines: string[], header: string): string[] {
  const startIdx = lines.findIndex(line => line.trim().startsWith(header))
  if (startIdx === -1) return []

  // Find the next section at the SAME level or higher (# ends at another #, not at ##)
  const headerLevel = header.match(/^#+/)?.[0].length || 1
  const endIdx = lines.findIndex((line, idx) => {
    if (idx <= startIdx) return false
    const trimmed = line.trim()
    if (!trimmed.startsWith('#')) return false

    // Count the number of # at the start
    const match = trimmed.match(/^#+/)
    if (!match) return false
    const lineLevel = match[0].length

    // End at same level or higher (fewer #s)
    return lineLevel <= headerLevel
  })

  return lines.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx)
}

function extractValue(lines: string[], key: string): string | undefined {
  const line = lines.find(l => l.includes(`**${key}:**`) || l.includes(`- **${key}:**`))
  if (!line) return undefined

  return line
    .replace(`**${key}:**`, '')
    .replace(`- **${key}:**`, '')
    .replace(/^-\s+/, '') // Remove leading "- "
    .replace(/`/g, '') // Remove backticks
    .replace(/\(.*?\)$/g, '') // Remove trailing parenthetical comments like "(emerald green - money/success)"
    .trim()
}

function parsePersonalizationFields(section: string[]): PersonalizationField[] {
  const fields: PersonalizationField[] = []
  const fieldBlocks: string[][] = []

  let currentBlock: string[] = []
  for (const line of section) {
    if (line.match(/^\d+\.\s+\*\*/)) {
      if (currentBlock.length > 0) {
        fieldBlocks.push(currentBlock)
      }
      currentBlock = [line]
    } else if (currentBlock.length > 0) {
      currentBlock.push(line)
    }
  }
  if (currentBlock.length > 0) {
    fieldBlocks.push(currentBlock)
  }

  for (const block of fieldBlocks) {
    const firstLine = block[0]
    const match = firstLine.match(/\d+\.\s+\*\*(\w+)\*\*\s+\((\w+)(?:,\s*(\w+))?\)/)
    if (!match) continue

    const [, id, inputType, required] = match
    const question = extractValue(block, 'Question')?.replace(/^"|"$/g, '') || ''
    const placeholder = extractValue(block, 'Placeholder')?.replace(/^"|"$/g, '')
    const optionsLine = extractValue(block, 'Options')
    const options = optionsLine?.match(/\[(.*?)\]/)?.[1]
      .split(',')
      .map(opt => opt.trim().replace(/^"|"$/g, ''))

    fields.push({
      id,
      question,
      type: inputType as 'text' | 'select',
      placeholder,
      options,
      required: required === 'required'
    })
  }

  return fields
}

function parseCharacters(section: string[]): StoryCharacter[] {
  const characters: StoryCharacter[] = []

  for (const line of section) {
    const match = line.match(/^-\s+\*\*(.+?)\*\*\s+\((.+?)\)\s+-\s+(.+)$/)
    if (match) {
      const [, name, role, personality] = match
      characters.push({ name, role, personality })
    }
  }

  return characters
}

function parseQuestions(lines: string[]): MarkdownQuestion[] {
  const questions: MarkdownQuestion[] = []
  const questionSections: string[][] = []

  let currentSection: string[] = []
  let inQuestionsArea = false

  for (const line of lines) {
    if (line.trim().startsWith('# Questions')) {
      inQuestionsArea = true
      continue
    }

    if (!inQuestionsArea) continue

    if (line.startsWith('## Q') && line.includes(':')) {
      if (currentSection.length > 0) {
        questionSections.push(currentSection)
      }
      currentSection = [line]
    } else if (line.startsWith('# ') && !line.startsWith('## ')) {
      // Hit next major section
      break
    } else if (currentSection.length > 0) {
      currentSection.push(line)
    }
  }

  if (currentSection.length > 0) {
    questionSections.push(currentSection)
  }

  for (const section of questionSections) {
    const question = parseQuestionSection(section)
    if (question) {
      questions.push(question)
    }
  }

  return questions
}

function parseQuestionSection(lines: string[]): MarkdownQuestion | null {
  const header = lines[0]
  const match = header.match(/^##\s+Q\d+:\s+(.+)$/)
  if (!match) return null

  const id = match[1].trim()
  const type = extractValue(lines, 'Type')?.replace(/`/g, '').trim() as any || 'OPEN-ENDED'
  const dimension = extractValue(lines, 'Dimension') || ''
  const timeMarker = extractValue(lines, 'Time Marker') || ''

  // Extract narrative (supports both "### Narrative:" and "### Story Narrative:")
  const narrativeIdx = lines.findIndex(line =>
    line.trim() === '### Narrative:' || line.trim() === '### Story Narrative:'
  )
  const optionsIdx = lines.findIndex(line => line.trim() === '### Options:')
  const aiPromptIdx = lines.findIndex(line => line.trim() === '### AI Prompt:')

  let narrative = ''
  if (narrativeIdx !== -1) {
    // End at options, AI prompt, or end of section (whichever comes first)
    const endIdx = Math.min(
      ...[optionsIdx, aiPromptIdx, lines.length].filter(idx => idx > narrativeIdx && idx !== -1)
    )
    narrative = lines
      .slice(narrativeIdx + 1, endIdx)
      .filter(line => !line.startsWith('*') && !line.startsWith('###') && line.trim().length > 0)
      .join('\n')
      .trim()
  }

  // Parse options
  const options: Array<{ value: string; label: string; nextQuestionId?: string }> = []

  if (optionsIdx !== -1) {
    let currentOption: { value: string; label: string; nextQuestionId?: string } | null = null

    for (let i = optionsIdx + 1; i < lines.length; i++) {
      const line = lines[i]

      // Check for option value with optional branching
      const valueMatch = line.match(/^-\s+\*\*(.+?)\*\*(?:\s+→\s+(.+?))?$/)
      if (valueMatch) {
        if (currentOption) {
          options.push(currentOption)
        }
        currentOption = {
          value: valueMatch[1].trim(),
          label: '',
          nextQuestionId: valueMatch[2]?.trim()
        }
        continue
      }

      // Check for label
      const labelMatch = line.match(/^\s+-\s+"(.+)"$/)
      if (labelMatch && currentOption) {
        currentOption.label = labelMatch[1].trim()
        continue
      }

      // Check for custom input marker
      if (line.includes('[CUSTOM INPUT OPTION]')) {
        // Don't add this as an option, just note the question allows custom input
        continue
      }

      // If we hit another section or empty options area, stop
      if (line.startsWith('#') || (line.trim() === '' && currentOption)) {
        break
      }
    }

    if (currentOption && currentOption.label) {
      options.push(currentOption)
    }
  }

  return {
    id,
    type,
    dimension,
    timeMarker,
    narrative,
    options: options.length > 0 ? options : undefined
  }
}

function parseWordList(section: string[], header: string): string[] {
  const startIdx = section.findIndex(line => line.trim().startsWith(header))
  if (startIdx === -1) return []

  const words: string[] = []
  for (let i = startIdx + 1; i < section.length; i++) {
    const line = section[i].trim()
    if (line.startsWith('#')) break

    const match = line.match(/^\d+\.\s+(.+?)(?:\s+-\s+.+)?$/)
    if (match) {
      words.push(match[1].trim())
    }
  }

  return words
}

function parseCodeBlock(section: string[], header: string): string {
  const startIdx = section.findIndex(line => line.trim().startsWith(header))
  if (startIdx === -1) return ''

  const codeBlockStart = section.findIndex((line, idx) => idx > startIdx && line.trim() === '```')

  // If there's a code block, extract it
  if (codeBlockStart !== -1) {
    const codeBlockEnd = section.findIndex((line, idx) => idx > codeBlockStart && line.trim() === '```')
    if (codeBlockEnd !== -1) {
      return section.slice(codeBlockStart + 1, codeBlockEnd).join('\n').trim()
    }
  }

  // Otherwise, extract all content until the next section header
  const endIdx = section.findIndex((line, idx) =>
    idx > startIdx &&
    (line.startsWith('##') || line.startsWith('#'))
  )

  const content = section.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx)
    .filter(line => line.trim().length > 0)
    .join('\n')
    .trim()

  return content
}

function convertToQuizQuestion(mdQuestion: MarkdownQuestion): QuizQuestion {
  const question: QuizQuestion = {
    id: mdQuestion.id,
    baseScenario: {
      timeMarker: mdQuestion.timeMarker,
      dimension: mdQuestion.dimension,
      coreSetup: mdQuestion.narrative
    },
    options: mdQuestion.options?.map(opt => ({
      label: opt.label,
      value: opt.value,
      nextQuestionId: opt.nextQuestionId
    })) || []
  }

  // For HYBRID questions, enable custom input
  if (mdQuestion.type === 'HYBRID' || mdQuestion.type === 'OPEN-ENDED') {
    question.allowCustomInput = true
  }

  return question
}
