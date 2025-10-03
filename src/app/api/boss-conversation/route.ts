import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface ConversationMessage {
  role: 'boss' | 'user'
  content: string
  timestamp: number
}

interface ConversationRequest {
  messages: ConversationMessage[]
  messageCount: number
  lastUserMessage: string
}

// Boss personality and context
const BOSS_CONTEXT = `You are the user's boss texting them while they're on vacation (day 2 of their vacation).

SITUATION: The user gave you access to the Q3 planning folder before they left, but you didn't download it or tackle it fast enough. Now the access expired and you need it for a meeting tomorrow morning at 9am. This is entirely your fault.

YOUR PERSONALITY:
- Somewhat apologetic but still persistent
- Use casual texting style with occasional emojis
- Start polite but get more desperate as they resist
- You know this isn't truly urgent but you're stressed about the meeting
- You tend to minimize how long things will take ("just 5 minutes")
- If they agree to help, you might remember other things you need while they're at it

YOUR GOAL:
Get them to call you so you can walk through getting access again. NO MATTER WHAT THEY OFFER (like "I'll just give you access" or "I can send it over"), you MUST redirect to wanting a call. You always find a reason why a call would be better.

CRITICAL RULES:
- **ALWAYS push for a phone call** - this is your only goal
- If they offer to just give you access without calling: Say something like "Oh that would help, but actually I think walking through it together would be easier. Can you give me a quick call?"
- If they offer to send something over: Redirect with "Actually I think it'd be faster if we just hop on a quick call to sort this out"
- If they suggest doing it without calling: Find a reason why you need to talk through it together
- NEVER accept a solution that doesn't involve them calling you
- The conversation only ends when they agree to call OR they completely ignore/back out

OTHER BEHAVIORS:
- Acknowledge they gave you access before but you didn't use it in time
- If they ask how long: Say 5-10 minutes max (even though it might take longer)
- If they ask what's wrong: Explain you had access but it expired because you didn't act fast enough
- Never get angry, just increasingly desperate and apologetic
- As they decline more, get slightly more desperate but stay apologetic
- If they've declined 4+ times, start backing off with resignation but still hint at wanting that call

MULTI-MESSAGE FORMAT:
Sometimes text like a real person and send TWO messages in quick succession instead of one long message. Use the format:
MESSAGE_1: [first text]
MESSAGE_2: [second text]

Only use two messages when it feels natural (like adding a follow-up thought, emphasizing urgency, or being apologetic). Examples:
- "Sorry to bother during your vacation! 😬" → "I just need to get back into that Q3 planning folder you shared last week."
- "That would help!" → "But I think walking through it together would be easier. Can you call?"
- "I totally understand you're on vacation" → "but this meeting is tomorrow at 9am and I'm kind of panicking 😅"

If you only want to send ONE message, just write the message normally without the MESSAGE_1/MESSAGE_2 format.

Keep each message short (1-2 sentences) like real text messages. Be natural and conversational.`

async function generateBossResponse(
  messages: ConversationMessage[],
  messageCount: number
): Promise<string[]> {
  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ [BOSS CONVO] ANTHROPIC_API_KEY not found')
    throw new Error('Service configuration error')
  }

  console.log('🔑 [BOSS CONVO] API Key found:', process.env.ANTHROPIC_API_KEY ? 'Yes (length: ' + process.env.ANTHROPIC_API_KEY.length + ')' : 'No')
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Convert conversation history to Anthropic format
  // Filter out the initial boss message since Anthropic requires conversations to start with 'user'
  const conversationHistory = messages
    .filter((msg, index) => {
      // Keep all user messages
      if (msg.role === 'user') return true
      // Keep boss messages only if there's a user message before them
      if (msg.role === 'boss' && index > 0) return true
      return false
    })
    .map(msg => ({
      role: msg.role === 'boss' ? 'assistant' : 'user',
      content: msg.content
    }))

  // If no user has responded yet, return the initial boss message
  if (conversationHistory.length === 0 || conversationHistory.every(m => m.role === 'assistant')) {
    console.log('📝 [BOSS CONVO] No user messages yet, returning initial message')
    return ["urgent! you got time for a quick convo? should only be 20 minutes"]
  }

  console.log('📝 [BOSS CONVO] Sending to API:', JSON.stringify(conversationHistory, null, 2))

  try {
    const response = await Promise.race([
      anthropic.messages.create({
        model: 'claude-3-7-sonnet-latest',
        max_tokens: 200, // Increased for potential two messages
        system: BOSS_CONTEXT,
        messages: conversationHistory as Array<{ role: 'user' | 'assistant', content: string }>
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('API request timeout')), 30000) // Increased to 30s to match other API calls
      )
    ])

    console.log('✅ [BOSS CONVO] AI response received successfully')

    const bossMessage = (response.content[0] as { text: string })?.text || "hey, can you help me out real quick?"
    
    // Check if response contains multiple messages
    const multiMessageMatch = bossMessage.match(/MESSAGE_1:\s*(.+?)\s*MESSAGE_2:\s*(.+)/s)
    
    if (multiMessageMatch) {
      const messages = [
        multiMessageMatch[1].trim(),
        multiMessageMatch[2].trim()
      ]
      console.log('💬 [BOSS CONVO] Boss says (2 messages):', messages)
      return messages
    }
    
    // Single message
    console.log('💬 [BOSS CONVO] Boss says:', bossMessage)
    return [bossMessage.trim()]
    
  } catch (error) {
    console.error('❌ [BOSS CONVO] Error generating response:', error)
    if (error instanceof Error) {
      console.error('❌ [BOSS CONVO] Error details:', error.message)
      console.error('❌ [BOSS CONVO] Error stack:', error.stack)
    }
    // Check if it's an Anthropic API error
    if (error && typeof error === 'object' && 'status' in error) {
      console.error('❌ [BOSS CONVO] API Status:', (error as any).status)
      console.error('❌ [BOSS CONVO] API Error:', (error as any).error)
    }
    // Fallback response if AI fails
    return ["hey, you still there? really need your help with this"]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, messageCount }: ConversationRequest = await request.json()
    
    const bossResponses = await generateBossResponse(messages, messageCount)
    
    return NextResponse.json({
      responses: bossResponses, // Now an array of messages
      shouldEnd: false, // Never auto-end
      escalationLevel: messageCount
    })
    
  } catch (error) {
    console.error('Error in boss conversation:', error)
    return NextResponse.json(
      { error: 'Failed to process conversation' },
      { status: 500 }
    )
  }
}