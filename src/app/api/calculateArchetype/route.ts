import { NextRequest, NextResponse } from 'next/server'

interface ArchetypeRequest {
  scores: {
    organization: number
    perfectionism: number
    prudence: number
    diligence: number
  }
}

interface ArchetypeResponse {
  archetype: number
  archetypeName: string
  rationale: string
}

const ARCHETYPE_NAMES = {
  9: "Record Player",
  8: "Gaming Headset", 
  7: "Airpods Pro",
  6: "Bluetooth Speaker",
  5: "Aux Cord",
  4: "Googly-Eyed Boombox",
  3: "Foam Earplugs",
  2: "Dog with Headset",
  1: "Single Earbud"
}

function buildArchetypePrompt(scores: ArchetypeRequest['scores']): string {
  return `You are **Dr. Kibeom Lee**, co-author of the HEXACO-PI-R, analyzing conscientiousness patterns to assign one of 9 music-themed archetypes.

**CONSCIENTIOUSNESS SCORES (1-9 scale):**
- Organization: ${scores.organization}/9 (tendency to seek order and structure)
- Perfectionism: ${scores.perfectionism}/9 (thoroughness and attention to detail)  
- Prudence: ${scores.prudence}/9 (deliberation and impulse control)
- Diligence: ${scores.diligence}/9 (work ethic and motivation to achieve)

**ARCHETYPE SCALE (1-9):**
9 = Record Player (Highest conscientiousness - extremely organized, perfectionistic, prudent, diligent)
8 = Gaming Headset (Very high conscientiousness)
7 = Airpods Pro (High conscientiousness)
6 = Bluetooth Speaker (Moderately high conscientiousness)
5 = Aux Cord (Average conscientiousness - balanced approach)
4 = Googly-Eyed Boombox (Moderately low conscientiousness)
3 = Foam Earplugs (Low conscientiousness)
2 = Dog with Headset (Very low conscientiousness)
1 = Single Earbud (Lowest conscientiousness - very disorganized, careless, impulsive, unmotivated)

**DISTRIBUTION TARGET:**
- Most people (70%) should fall in 4-6 range (moderate conscientiousness)
- Allow ~15% in 7-8 range (high), ~15% in 2-3 range (low)
- Reserve 1 and 9 for truly extreme patterns (~3% chance each)

**PATTERN ANALYSIS GUIDELINES:**
- Now that subtraits are scored 1-9, calculate archetype using **DIRECT AVERAGING**
- Average the 4 subtrait scores and round to nearest integer for initial archetype
- Look for consistency vs. inconsistency across domains to fine-tune
- High scores (7-9) in 3+ domains suggest upper range (7-9)
- Low scores (1-3) in 3+ domains suggest lower range (1-3)  
- Mixed patterns typically fall in middle (4-6)
- The 1-9 subtrait scale now directly maps to the 1-9 archetype scale

**INSTRUCTIONS:**
Analyze this specific pattern and assign ONE archetype number (1-9). Consider how these four traits work together to create an overall conscientiousness profile.

**Output only** this JSON:
\`\`\`json
{
  "archetype": 5,
  "rationale": "This pattern shows... [brief analysis of how the four scores combine to suggest this archetype level]"
}
\`\`\``
}

export async function POST(request: NextRequest) {
  console.log('\n=== ARCHETYPE CALCULATION START ===')
  try {
    const body: ArchetypeRequest = await request.json()
    const { scores } = body
    
    console.log('🎵 [Archetype] Calculating archetype from scores:')
    console.log('  Organization:', scores.organization + '/9')
    console.log('  Perfectionism:', scores.perfectionism + '/9')
    console.log('  Prudence:', scores.prudence + '/9')
    console.log('  Diligence:', scores.diligence + '/9')
    const average = (scores.organization + scores.perfectionism + scores.prudence + scores.diligence) / 4
    console.log('  Average:', average.toFixed(2))

    // Validate input
    if (!scores || typeof scores !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid scores object' },
        { status: 400 }
      )
    }

    const requiredFields = ['organization', 'perfectionism', 'prudence', 'diligence']
    for (const field of requiredFields) {
      const score = scores[field as keyof typeof scores]
      if (!score || score < 1 || score > 9 || !Number.isInteger(score)) {
        return NextResponse.json(
          { error: `Invalid ${field} score: ${score}. Must be integer 1-9.` },
          { status: 400 }
        )
      }
    }

    console.log('\n🎨 [Archetype] Building expert prompt...')
    
    // Build the archetype assignment prompt
    const prompt = buildArchetypePrompt(scores)
    
    console.log('🤖 [Archetype] Calling Claude API for expert analysis...')

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.content[0].text

    console.log('✅ [Archetype] Claude API response:', content)

    // Extract JSON from the response - handle both code block and direct JSON formats
    let jsonString: string
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    
    if (codeBlockMatch) {
      // Found JSON in code block
      jsonString = codeBlockMatch[1]
    } else {
      // Try to parse the content directly as JSON
      jsonString = content.trim()
    }

    const archetypeData: { archetype: number; rationale: string } = JSON.parse(jsonString)

    // Validate archetype is 1-9
    if (archetypeData.archetype < 1 || archetypeData.archetype > 9 || !Number.isInteger(archetypeData.archetype)) {
      throw new Error(`Invalid archetype: ${archetypeData.archetype}. Must be integer 1-9.`)
    }

    const archetypeName = ARCHETYPE_NAMES[archetypeData.archetype as keyof typeof ARCHETYPE_NAMES]
    
    console.log('🏆 [Archetype] Final result:')
    console.log('  Archetype:', archetypeData.archetype + '/9 -', archetypeName)
    console.log('  Rationale:', archetypeData.rationale)
    console.log('=== ARCHETYPE CALCULATION END ===\n')

    return NextResponse.json({
      success: true,
      archetype: archetypeData.archetype,
      archetypeName,
      rationale: archetypeData.rationale,
      scores // Return the input scores for reference
    })

  } catch (error) {
    console.error('❌ [Archetype] Error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.log('=== ARCHETYPE CALCULATION ERROR END ===\n')
    return NextResponse.json(
      { 
        error: 'Failed to calculate archetype',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}