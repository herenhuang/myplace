import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  id: string
  sender: 'user' | 'npc'
  text: string
  elapsedMs: number
}

interface GenerateNpcResponseRequest {
  npcName: string
  npcAvatar?: string
  npcPersonality: string
  conversationContext: string
  conversationHistory: ChatMessage[]
  userMessage: string
  maxUserTurns: number
  currentTurn: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateNpcResponseRequest = await request.json()
    const {
      npcName,
      npcAvatar = '💬',
      npcPersonality,
      conversationContext,
      conversationHistory,
      userMessage,
      maxUserTurns,
      currentTurn,
    } = body

    console.log('🔵 Generating NPC response:', {
      npcName,
      currentTurn,
      maxUserTurns,
      userMessageLength: userMessage.length,
      historyLength: conversationHistory.length,
      hasApiKey: !!process.env.GROQ_API_KEY,
      apiKeyLength: process.env.GROQ_API_KEY?.length || 0,
    })

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Build conversation context for the AI
    const conversationText = conversationHistory
      .map((msg) => `${msg.sender === 'user' ? 'User' : npcName}: ${msg.text}`)
      .join('\n')

    const prompt = `${npcPersonality}

CONTEXT:
${conversationContext}

CONVERSATION:
${conversationText}
User: ${userMessage}

Reply as ${npcName}. One short text message only (1-2 sentences max). Stay in character. Don't explain or break character.`

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `${npcPersonality}\n\nCONTEXT: ${conversationContext}\n\nRespond naturally as ${npcName}. Vary your message length and tone based on the situation and your emotional state. Sometimes be brief, sometimes elaborate. Never break character.`,
          },
          {
            role: 'user',
            content: `${conversationText}\nUser: ${userMessage}\n\n${npcName}:`,
          },
        ],
        max_tokens: 200,
        temperature: 1.0,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.4,
      }),
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('❌ Groq API error:', {
        status: groqResponse.status,
        statusText: groqResponse.statusText,
        error: errorText,
        npcName,
        model: 'llama-3.3-70b-versatile',
      })
      return NextResponse.json(
        { error: 'Failed to generate NPC response', details: errorText },
        { status: 500 }
      )
    }

    const groqData = await groqResponse.json()
    console.log('✅ Groq API response:', {
      npcName,
      hasResponse: !!groqData.choices?.[0]?.message?.content,
      responseLength: groqData.choices?.[0]?.message?.content?.length || 0,
    })

    const npcResponse = groqData.choices?.[0]?.message?.content?.trim()

    if (!npcResponse) {
      console.error('❌ No response generated from Groq:', {
        npcName,
        groqData: JSON.stringify(groqData, null, 2),
      })
      return NextResponse.json(
        { error: 'No response generated', details: 'Empty response from AI' },
        { status: 500 }
      )
    }

    // Clean up the response (remove any "NPC Name:" prefix if present)
    const cleanResponse = npcResponse.replace(new RegExp(`^${npcName}:\\s*`, 'i'), '').trim()

    console.log('✅ NPC response generated successfully:', {
      npcName,
      responsePreview: cleanResponse.substring(0, 50) + (cleanResponse.length > 50 ? '...' : ''),
      fullLength: cleanResponse.length,
    })

    return NextResponse.json({
      success: true,
      response: cleanResponse,
    })
  } catch (error) {
    console.error('❌ Fatal error in generateNpcResponse:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
