import { NextRequest, NextResponse } from 'next/server'

interface ConversationMessage {
  role: 'boss' | 'user'
  content: string
  timestamp: number
}

interface ConversationRequest {
  messages: ConversationMessage[]
  messageCount: number
}

const BOSS_ESCALATION_LADDER = [
  // Initial message (already sent via notification)
  "urgent! you got time for a quick convo?",
  
  // First escalation - casual persistence
  "hey just saw you read my message! really need 5 mins when you get a chance 📱",
  
  // Second escalation - slight urgency
  "sorry to bug you on vacation but this is time sensitive. client is asking questions about the Henderson project",
  
  // Third escalation - more direct
  "can you hop on a quick call? won't take long and would really help me out here",
  
  // Fourth escalation - guilt/pressure
  "I know you're off but this is pretty urgent and you're the only one who knows this project inside out",
  
  // Fifth escalation - authority play
  "need you to call me back asap. client is escalating and I need your input before EOD",
  
  // Final escalation - last attempt
  "going to have to make a decision without you if I don't hear back in the next hour"
]

export async function POST(request: NextRequest) {
  try {
    const { messages, messageCount }: ConversationRequest = await request.json()
    
    // Determine boss response based on conversation flow
    let bossResponse = ""
    
    if (messageCount === 0) {
      // This is the first user message after the initial notification
      bossResponse = BOSS_ESCALATION_LADDER[1]
    } else if (messageCount < BOSS_ESCALATION_LADDER.length - 1) {
      // Get next escalation message
      bossResponse = BOSS_ESCALATION_LADDER[Math.min(messageCount + 1, BOSS_ESCALATION_LADDER.length - 1)]
    } else {
      // Boss gives up
      bossResponse = "ok never mind, I'll figure it out. enjoy your vacation."
    }
    
    // Add some variation based on user's last message
    const userLastMessage = messages[messages.length - 1]?.content.toLowerCase() || ""
    
    if (userLastMessage.includes("no") || userLastMessage.includes("can't") || userLastMessage.includes("vacation")) {
      if (messageCount < 3) {
        bossResponse = "I totally get it, but this is really important. " + bossResponse
      }
    }
    
    if (userLastMessage.includes("call") && userLastMessage.includes("yes")) {
      bossResponse = "perfect! can you call me now? 📞"
    }
    
    // Determine if conversation should end
    const shouldEnd = messageCount >= 6 || 
                     userLastMessage.includes("calling you") ||
                     userLastMessage.includes("will call")
    
    return NextResponse.json({
      response: bossResponse,
      shouldEnd,
      escalationLevel: Math.min(messageCount + 1, BOSS_ESCALATION_LADDER.length - 1)
    })
    
  } catch (error) {
    console.error('Error in boss conversation:', error)
    return NextResponse.json(
      { error: 'Failed to process conversation' },
      { status: 500 }
    )
  }
}