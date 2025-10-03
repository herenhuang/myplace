import { NextRequest, NextResponse } from 'next/server'

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
    const { messages, messageCount, lastUserMessage }: ConversationRequest = await request.json()
    
    const userLastMessage = lastUserMessage.toLowerCase()
    let bossResponse = ""
    let shouldEnd = false
    
    // Check if user is agreeing to help
    const agreeingWords = ['sure', 'yes', 'okay', 'ok', 'fine', 'i guess', 'alright']
    const isAgreeing = agreeingWords.some(word => userLastMessage.includes(word))
    
    // Check if user is asking clarifying questions
    const askingQuestions = userLastMessage.includes('?') || 
                           userLastMessage.includes('how long') || 
                           userLastMessage.includes('what') ||
                           userLastMessage.includes('when') ||
                           userLastMessage.includes('phone call')
    
    // Check if user is declining
    const decliningWords = ['no', "can't", 'vacation', 'busy', 'later']
    const isDeclining = decliningWords.some(word => userLastMessage.includes(word)) && !isAgreeing
    
    if (messageCount === 1) {
      // First response - boss responds to what user said
      if (askingQuestions) {
        if (userLastMessage.includes('phone call') || userLastMessage.includes('call')) {
          bossResponse = "yeah just a quick call! sorry to bug you on vacation but this is time sensitive. client is asking questions about the Henderson project"
        } else {
          bossResponse = "sorry to bug you on vacation but this is time sensitive. client is asking questions about the Henderson project"
        }
      } else if (isDeclining) {
        bossResponse = "I totally get it, but this is really important. sorry to bug you on vacation but this is time sensitive. client is asking questions about the Henderson project"
      } else if (isAgreeing) {
        bossResponse = "great! can you hop on a quick call? won't take long and would really help me out here"
      } else {
        bossResponse = "sorry to bug you on vacation but this is time sensitive. client is asking questions about the Henderson project"
      }
    } else if (messageCount === 2) {
      if (askingQuestions && userLastMessage.includes('long')) {
        bossResponse = "can you hop on a quick call? won't take long and would really help me out here"
      } else if (isAgreeing) {
        bossResponse = "perfect! and actually, you'll need your laptop too. can you grab it real quick?"
      } else if (isDeclining) {
        bossResponse = "can you hop on a quick call? won't take long and would really help me out here"
      } else {
        bossResponse = "can you hop on a quick call? won't take long and would really help me out here"
      }
    } else if (messageCount === 3) {
      if (askingQuestions && userLastMessage.includes('long')) {
        bossResponse = "just like 10-15 minutes max! I know you're off but this is pretty urgent and you're the only one who knows this project inside out"
      } else if (isAgreeing) {
        bossResponse = "awesome! oh and you'll need to log into the client portal too. need you to call me back asap. client is escalating"
      } else if (isDeclining) {
        bossResponse = "I know you're off but this is pretty urgent and you're the only one who knows this project inside out"
      } else {
        bossResponse = "I know you're off but this is pretty urgent and you're the only one who knows this project inside out"
      }
    } else if (messageCount === 4) {
      if (isAgreeing) {
        bossResponse = "perfect! need you to call me back asap. client is escalating and I need your input before EOD"
      } else if (isDeclining) {
        bossResponse = "need you to call me back asap. client is escalating and I need your input before EOD"
      } else {
        bossResponse = "need you to call me back asap. client is escalating and I need your input before EOD"
      }
    } else if (messageCount >= 5) {
      if (isAgreeing) {
        bossResponse = "amazing! just hit the call button when you're ready 📞"
      } else if (isDeclining) {
        bossResponse = "I really need your help here. can you please just give me a quick call? 📞"
      } else {
        bossResponse = "going to have to make a decision without you if I don't hear back soon..."
      }
    }
    
    // Never auto-end - let user choose via call button or back button
    
    return NextResponse.json({
      response: bossResponse,
      shouldEnd,
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