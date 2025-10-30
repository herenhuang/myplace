import { NextResponse } from 'next/server';
import { NegotiationState, ChatMessage, KeyMoment } from '@/app/investor/types';

interface ConversationMetrics {
  totalDuration: number;
  userMessageCount: number;
  npcMessageCount: number;
  responseTimes: number[];
  avgResponseTime: number;
  fastestResponse: number;
  slowestResponse: number;
  firstAmountAskIndex: number;
  firstCounterOfferIndex: number;
  firstAmountAskTime: number | null;
  startTime: number;
  endTime: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { negotiationState, transcript, conversationMetrics } = body as {
      negotiationState: NegotiationState;
      transcript: ChatMessage[];
      conversationMetrics?: ConversationMetrics;
    };

    if (!negotiationState || !transcript) {
      return NextResponse.json({ success: false, error: 'Missing negotiation data' }, { status: 400 });
    }

    const analysis = await generateNegotiationAnalysis(negotiationState, transcript, conversationMetrics);

    return NextResponse.json({ success: true, analysis });

  } catch (error) {
    console.error('Error analyzing negotiation:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function generateNegotiationAnalysis(
  negotiationState: NegotiationState, 
  transcript: ChatMessage[],
  conversationMetrics?: ConversationMetrics
) {
  const { userAskAmount, davidOfferAmount, dealClosed, dealReached, negotiationCount } = negotiationState;
  
  const finalAgreedAmount = (dealClosed && dealReached) ? (davidOfferAmount || 0) : 0;
  
  const conversationForAI = transcript.map((msg, idx) => {
    const timestamp = msg.elapsedMs ? `${Math.round(msg.elapsedMs / 1000)}s` : '';
    return `[${timestamp}] ${msg.sender === 'user' ? 'Investor' : 'David'}: ${msg.text}`;
  }).join('\n');

  // Build metrics context
  const metricsContext = conversationMetrics ? `
Conversation Metrics:
- Total conversation duration: ${Math.round(conversationMetrics.totalDuration / 1000)}s
- Total messages: ${conversationMetrics.userMessageCount + conversationMetrics.npcMessageCount}
- Average response time: ${Math.round(conversationMetrics.avgResponseTime / 1000)}s
- Fastest response: ${Math.round(conversationMetrics.fastestResponse / 1000)}s
- Slowest response: ${Math.round(conversationMetrics.slowestResponse / 1000)}s
- Time to first ask: ${conversationMetrics.firstAmountAskTime ? `${Math.round((conversationMetrics.firstAmountAskTime - conversationMetrics.startTime) / 1000)}s` : 'Never asked'}
` : '';

  const systemPrompt = `You are a negotiation analysis expert. Analyze the following conversation between an investor and a startup founder named David. Based on the transcript, timing data, and final outcome, provide a detailed analysis of the investor's negotiation style.

Conversation Transcript:
---
${conversationForAI}
---
${metricsContext}
Final Negotiation State:
- Investor's initial ask: ${userAskAmount ? `$${userAskAmount.toLocaleString()}` : 'Not specified'}
- David's final offer: ${davidOfferAmount ? `$${davidOfferAmount.toLocaleString()}` : 'Not specified'}
- Number of negotiations: ${negotiationCount}
- Was a deal reached? ${dealReached ? 'Yes - Deal was agreed' : 'No - Investor walked away or conversation ended without agreement'}
- Final Agreed Amount: $${finalAgreedAmount.toLocaleString()}

Your task is to return a JSON object with the following keys:
1. "archetype": A short, positive, and empowering title for the investor's negotiation style. Always frame it positively (e.g., "The Agile Negotiator", "The Relationship Builder", "The Strategic Collaborator"). Avoid negative connotations like "conceder" or "eager" that might imply weakness. Focus on strengths like adaptability, decisiveness, relationship-building, strategic thinking, etc.

2. "summary": A concise 1-2 sentence analysis written in SECOND-PERSON ("you", "your") that highlights the positive aspects of the investor's negotiation approach. Always emphasize strengths, not weaknesses. Be direct and impactful. Examples:
   - "You demonstrated remarkable flexibility and relationship-building skills by quickly finding common ground with David."
   - "Your strategic approach shows you value both the opportunity and the long-term partnership."

3. "keyMoments": An array of exactly 3 objects, each with "title" and "description" keys. All descriptions must use SECOND-PERSON ("you", "your"). These should highlight positive, notable moments from the conversation. Focus on:
   - Notable positive response patterns (e.g., "You responded instantly, showing readiness and engagement")
   - Pivotal negotiation moments that demonstrate strength (e.g., "Your quick decision to agree shows confidence in the opportunity")
   - Unique communication styles that worked well
   - Behavioral insights that frame actions positively (e.g., "You responded in just 5 seconds, demonstrating eagerness and engagement")
   - Moments that celebrate the investor's specific positive actions

4. "mbtiType": A 4-letter MBTI type (E/I + N/S + T/F + J/P) based on the investor's negotiation behavior. Analyze:
   - E vs I: Fast responses, eager engagement = E; Thoughtful pauses, reserved = I
   - N vs S: Big picture focus, strategic vision = N; Concrete details, practical focus = S
   - T vs F: Logic-driven decisions, objective analysis = T; Relationship-oriented, value-based = F
   - J vs P: Decisive closure, structured approach = J; Flexible, exploratory, keeps options open = P

5. "personality": An object with four keys (each 0-100):
   - "extraversion_introversion": 0 = strong Introvert, 50 = balanced, 100 = strong Extravert
   - "intuition_sensing": 0 = strong Sensing, 50 = balanced, 100 = strong Intuition
   - "thinking_feeling": 0 = strong Thinking, 50 = balanced, 100 = strong Feeling
   - "judging_perceiving": 0 = strong Judging, 50 = balanced, 100 = strong Perceiving

Make each moment specific, personal, and revealing. Avoid generic observations.`;

  try {
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please provide the analysis based on the conversation.' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`OpenRouter API call failed with status: ${apiResponse.status}`);
    }

    const jsonResponse = await apiResponse.json();
    const aiAnalysis = JSON.parse(jsonResponse.choices[0].message.content);

    const pentagonScores = calculatePentagonScores(negotiationState, transcript);
    const pentagonLabels = ['Assertiveness', 'Patience', 'Clarity', 'Compromise', 'Efficiency'];

    // Ensure keyMoments is an array of 3 items
    let keyMoments: KeyMoment[] = [];
    if (aiAnalysis.keyMoments && Array.isArray(aiAnalysis.keyMoments)) {
      keyMoments = aiAnalysis.keyMoments.slice(0, 3).map((moment: any) => ({
        title: moment.title || 'Notable Moment',
        description: moment.description || '',
      }));
    }
    
    // If AI didn't generate enough moments, generate programmatic ones
    if (keyMoments.length < 3) {
      const programmaticMoments = generateKeyMoments(negotiationState, transcript, conversationMetrics);
      keyMoments = [...keyMoments, ...programmaticMoments].slice(0, 3);
    }

    // Extract MBTI data from AI response or calculate programmatically
    let mbtiType: string | undefined;
    let personality: {
      extraversion_introversion: number;
      intuition_sensing: number;
      thinking_feeling: number;
      judging_perceiving: number;
    } | undefined;

    if (aiAnalysis.mbtiType && aiAnalysis.personality) {
      mbtiType = aiAnalysis.mbtiType;
      personality = {
        extraversion_introversion: Math.max(0, Math.min(100, aiAnalysis.personality.extraversion_introversion || 50)),
        intuition_sensing: Math.max(0, Math.min(100, aiAnalysis.personality.intuition_sensing || 50)),
        thinking_feeling: Math.max(0, Math.min(100, aiAnalysis.personality.thinking_feeling || 50)),
        judging_perceiving: Math.max(0, Math.min(100, aiAnalysis.personality.judging_perceiving || 50)),
      };
    } else {
      // Calculate programmatically if AI didn't provide
      personality = calculatePersonalityDimensions(negotiationState, transcript, conversationMetrics);
      mbtiType = deriveMBTIType(personality);
    }

    return {
      archetype: aiAnalysis.archetype,
      summary: aiAnalysis.summary,
      pentagonScores,
      pentagonLabels,
      finalAgreedAmount,
      keyMoments,
      mbtiType,
      personality,
    };

  } catch (error) {
    console.error("Failed to get AI analysis from OpenRouter:", error);
    // Fallback to programmatic analysis if AI fails
    return generateProgrammaticAnalysis(negotiationState, transcript, conversationMetrics);
  }
}

// This is the old function, now serving as a fallback.
function generateProgrammaticAnalysis(
  negotiationState: NegotiationState, 
  transcript: ChatMessage[],
  conversationMetrics?: ConversationMetrics
) {
  const { userAskAmount, davidOfferAmount, negotiationCount, dealClosed, dealReached } = negotiationState;
  const finalOffer = davidOfferAmount || 0;
  const initialAsk = userAskAmount || 0;
  const finalAgreedAmount = (dealClosed && dealReached) ? finalOffer : 0;

  let archetype = 'The Relationship Builder';
  let summary = "You demonstrated strong relationship-building skills by finding common ground quickly and valuing the partnership. Your ability to move decisively when you see value shows confidence and trust in your judgment.";

  if (dealClosed && !dealReached) {
    archetype = "The Principled Investor";
    summary = "You walked away when the terms didn't align with your expectations. Knowing when to say no demonstrates strong principles and strategic judgment. Sometimes the best deal is the one you don't make.";
  } else if (!dealClosed) {
    archetype = "The Strategic Evaluator";
    summary = "You took time to carefully consider the opportunity. Your thoughtful approach shows you evaluate investments thoroughly before committing, demonstrating prudence and strategic thinking.";
  } else if (!userAskAmount) {
    archetype = 'The Relationship-Focused Investor';
    summary = "You prioritized building rapport and understanding before diving into numbers. Your focus on relationship over immediate transaction shows strong strategic relationship-building skills.";
  } else if (negotiationCount === 0) {
    if (finalOffer * 2 === initialAsk) {
      archetype = 'The Agile Decision-Maker';
      summary = "You recognized value quickly and moved decisively to secure the opportunity. Your ability to make confident decisions without unnecessary back-and-forth shows strong judgment and confidence in your choices.";
    } else {
      archetype = 'The Efficient Negotiator';
      summary = "You found common ground efficiently and demonstrated your ability to recognize value quickly. Your decisiveness shows confidence and strong relationship-building skills.";
    }
  } else if (negotiationCount > 0) {
    const initialOffer = Math.floor(initialAsk / 2);
    if (finalOffer > initialOffer) {
      const increase = finalOffer - initialOffer;
      const percentageIncrease = initialOffer > 0 ? ((increase / initialOffer) * 100).toFixed(0) : 0;
      if (negotiationCount >= 2) {
        archetype = 'The Tenacious Negotiator';
        summary = `You demonstrated exceptional persistence and strategic thinking by securing ${percentageIncrease}% more than the initial offer. Your ability to advocate for yourself while maintaining the relationship shows sophisticated negotiation skills.`;
      } else {
        archetype = 'The Strategic Negotiator';
        summary = `You successfully negotiated a better deal, increasing your allocation by ${percentageIncrease}%. This demonstrates your ability to balance assertiveness with relationship-building, showing you're both strategic and relationship-focused.`;
      }
    }
  }
  
  const pentagonScores = calculatePentagonScores(negotiationState, transcript);
  const pentagonLabels = ['Assertiveness', 'Patience', 'Clarity', 'Compromise', 'Efficiency'];
  const keyMoments = generateKeyMoments(negotiationState, transcript, conversationMetrics);
  const personality = calculatePersonalityDimensions(negotiationState, transcript, conversationMetrics);
  const mbtiType = deriveMBTIType(personality);

  return { archetype, summary, pentagonScores, pentagonLabels, finalAgreedAmount, keyMoments, mbtiType, personality };
}


function generateKeyMoments(
  negotiationState: NegotiationState,
  transcript: ChatMessage[],
  conversationMetrics?: ConversationMetrics
): KeyMoment[] {
  const moments: KeyMoment[] = [];
  const { userAskAmount, davidOfferAmount, negotiationCount, dealClosed, dealReached, userExpressedDisinterest } = negotiationState;
  
  // Moment 1: Response timing or first ask
  if (conversationMetrics) {
    if (conversationMetrics.firstAmountAskTime !== null && conversationMetrics.startTime !== null) {
      const timeToFirstAsk = conversationMetrics.firstAmountAskTime - conversationMetrics.startTime;
      const timeToAskSeconds = Math.round(timeToFirstAsk / 1000);
      
      if (timeToAskSeconds < 30) {
        moments.push({
          title: 'Ready and Prepared',
          description: `You stated your investment amount within ${timeToAskSeconds} seconds, demonstrating that you came prepared and knew exactly what you wanted. Your clarity and readiness show strong strategic thinking.`,
        });
      } else if (timeToAskSeconds > 120) {
        moments.push({
          title: 'Thoughtful Consideration',
          description: `You took over ${Math.round(timeToAskSeconds / 60)} minutes before stating your investment amount, showing careful consideration and strategic evaluation of the opportunity. Your thoughtful approach demonstrates prudence.`,
        });
      }
      
      // Response time insights
      if (conversationMetrics.avgResponseTime > 0) {
        const avgSeconds = Math.round(conversationMetrics.avgResponseTime / 1000);
        const fastestSeconds = Math.round(conversationMetrics.fastestResponse / 1000);
        
        if (fastestSeconds < 5 && avgSeconds < 10) {
          moments.push({
            title: 'Highly Engaged',
            description: `Your fastest response was just ${fastestSeconds} seconds, with an average of ${avgSeconds} seconds—you were exceptionally engaged throughout the conversation, showing eagerness and commitment.`,
          });
        } else if (avgSeconds > 60) {
          moments.push({
            title: 'Thoughtful Communication',
            description: `You averaged ${Math.round(avgSeconds / 60)} minute${Math.round(avgSeconds / 60) > 1 ? 's' : ''} per response, demonstrating that you carefully considered each message. Your thoughtful approach shows strategic thinking and attention to detail.`,
          });
        }
      }
    } else if (!userAskAmount) {
      moments.push({
        title: 'Relationship-First Approach',
        description: `You prioritized building rapport and understanding the opportunity before discussing specific numbers. Your focus on relationship over transaction shows strong strategic relationship-building skills.`,
      });
    }
  }
  
  // Moment 2: Negotiation behavior
  if (negotiationCount === 0 && userAskAmount && davidOfferAmount) {
    const gap = userAskAmount - davidOfferAmount;
    const gapPercent = davidOfferAmount > 0 ? Math.round((gap / userAskAmount) * 100) : 0;
    
    if (gapPercent <= 5) {
      moments.push({
        title: 'Efficient Decision-Making',
        description: `You recognized value quickly and accepted David's offer with minimal gap, demonstrating strong judgment and efficiency. Your ability to move decisively shows confidence in your evaluation.`,
      });
    } else if (gapPercent > 50) {
      moments.push({
        title: 'Relationship Builder',
        description: `Despite a ${gapPercent}% difference between your ask and David's offer, you prioritized the relationship over pure terms. Your focus on partnership demonstrates sophisticated understanding of long-term value.`,
      });
    }
  } else if (negotiationCount > 0) {
    const initialOffer = davidOfferAmount && userAskAmount ? Math.floor(userAskAmount / 2) : 0;
    if (davidOfferAmount && initialOffer > 0) {
      const increase = davidOfferAmount - initialOffer;
      const increasePercent = Math.round((increase / initialOffer) * 100);
      
      if (negotiationCount >= 2) {
        moments.push({
          title: 'Persistent Negotiator',
          description: `You negotiated ${negotiationCount} times and increased the offer by ${increasePercent}%, showing you're willing to push for what you believe is fair.`,
        });
      } else {
        moments.push({
          title: 'Strategic Counter-Offer',
          description: `You didn't accept the first offer and successfully negotiated a ${increasePercent}% increase in your allocation.`,
        });
      }
    }
  }
  
  // Moment 3: Deal outcome and behavior
  if (dealClosed && dealReached) {
    moments.push({
      title: 'Deal Sealed',
      description: `You successfully closed the deal at $${(davidOfferAmount || 0).toLocaleString()}, showing you can follow through on negotiations.`,
    });
  } else if (dealClosed && !dealReached) {
    moments.push({
      title: 'Principled Walk-Away',
      description: `You walked away from the deal when terms didn't align, demonstrating strong principles and knowing when not to proceed.`,
    });
  } else if (userExpressedDisinterest) {
    moments.push({
      title: 'Clear Communication',
      description: `You clearly expressed disinterest in proceeding, showing you won't waste time on deals that don't fit.`,
    });
  } else if (!dealClosed) {
    moments.push({
      title: 'Strategic Pause',
      description: `You took time to consider the opportunity fully. Your careful evaluation shows you make investment decisions thoughtfully and strategically, rather than rushing into commitments.`,
    });
  }
  
  // Ensure we have exactly 3 moments, pad with generic ones if needed
  while (moments.length < 3) {
    if (moments.length === 0 || !moments.some(m => m.title.includes('First'))) {
      if (userAskAmount) {
        moments.push({
          title: 'Clear Intentions',
          description: `You clearly stated your investment amount of $${userAskAmount.toLocaleString()}, setting the foundation for the negotiation.`,
        });
      }
    } else if (!moments.some(m => m.title.includes('Response'))) {
      moments.push({
        title: 'Active Engagement',
        description: `You maintained active participation throughout the conversation with ${transcript.filter(m => m.sender === 'user').length} messages.`,
      });
    } else {
      moments.push({
        title: 'Strategic Approach',
        description: `Your negotiation approach reflected thoughtful consideration of both the opportunity and the relationship with David.`,
      });
    }
  }
  
  return moments.slice(0, 3);
}

function calculatePersonalityDimensions(
  negotiationState: NegotiationState,
  transcript: ChatMessage[],
  conversationMetrics?: ConversationMetrics
): {
  extraversion_introversion: number;
  intuition_sensing: number;
  thinking_feeling: number;
  judging_perceiving: number;
} {
  const { userAskAmount, davidOfferAmount, negotiationCount, dealClosed, dealReached, userExpressedDisinterest } = negotiationState;
  const userMessages = transcript.filter(m => m.sender === 'user');
  
  // E vs I: Based on response time and engagement style
  let extraversion_introversion = 50; // Start balanced
  if (conversationMetrics) {
    const avgResponseSeconds = conversationMetrics.avgResponseTime / 1000;
    // Fast responses (under 10s avg) = more extraverted, slow (over 60s) = introverted
    if (avgResponseSeconds < 10) {
      extraversion_introversion = 70; // E
    } else if (avgResponseSeconds > 60) {
      extraversion_introversion = 25; // I
    }
    
    // If they asked quickly, more E
    if (conversationMetrics.firstAmountAskTime && conversationMetrics.startTime) {
      const timeToAsk = (conversationMetrics.firstAmountAskTime - conversationMetrics.startTime) / 1000;
      if (timeToAsk < 30) {
        extraversion_introversion = Math.min(100, extraversion_introversion + 15);
      }
    }
  }
  
  // N vs S: Based on negotiation approach and focus
  let intuition_sensing = 50;
  // Big picture focus, strategic vision = N
  if (negotiationCount > 0 && !userExpressedDisinterest) {
    // Strategic negotiation suggests intuition
    intuition_sensing = 65;
  }
  
  // If they focused on concrete amounts and practical terms = S
  if (userAskAmount && davidOfferAmount) {
    const gap = Math.abs(userAskAmount - davidOfferAmount);
    const avgAmount = (userAskAmount + davidOfferAmount) / 2;
    // If they were very precise with numbers (small gap or exact), more Sensing
    if (gap / avgAmount < 0.1) {
      intuition_sensing = Math.max(0, intuition_sensing - 20);
    }
  }
  
  // If no specific ask, might indicate abstract/intuitive thinking
  if (!userAskAmount && !dealClosed) {
    intuition_sensing = 70;
  }
  
  // T vs F: Based on decision-making style
  let thinking_feeling = 50;
  // Logic-driven, objective = T
  if (negotiationCount >= 2) {
    // Multiple negotiations suggest analytical, logical approach
    thinking_feeling = 70; // T
  } else if (dealClosed && !dealReached) {
    // Walking away based on principles could be either, but if done quickly = T
    thinking_feeling = 65; // T
  }
  
  // Relationship-oriented, value-based = F
  if (negotiationCount === 0 && dealReached) {
    // Accepted first offer = might value relationship
    thinking_feeling = 35; // F
  }
  
  // If they mentioned relationship/helping David = F
  const relationshipKeywords = ['help', 'support', 'relationship', 'trust', 'appreciate', 'thanks'];
  const hasRelationshipFocus = userMessages.some(msg => 
    relationshipKeywords.some(keyword => msg.text.toLowerCase().includes(keyword))
  );
  if (hasRelationshipFocus && negotiationCount === 0) {
    thinking_feeling = Math.max(0, thinking_feeling - 15);
  }
  
  // J vs P: Based on decisiveness and structure
  let judging_perceiving = 50;
  // Decisive closure, structured = J
  if (dealClosed) {
    judging_perceiving = 70; // J - they closed it
  }
  
  // Fast decision to accept or walk away = J
  if (negotiationCount === 0 && dealClosed) {
    judging_perceiving = 75; // J
  }
  
  // If they negotiated multiple times, might indicate P (exploring options)
  if (negotiationCount >= 2) {
    judging_perceiving = 35; // P - exploring different options
  }
  
  // If conversation ended without clear closure = P
  if (!dealClosed && !userExpressedDisinterest) {
    judging_perceiving = 30; // P - kept options open
  }
  
  return {
    extraversion_introversion: Math.max(0, Math.min(100, Math.round(extraversion_introversion))),
    intuition_sensing: Math.max(0, Math.min(100, Math.round(intuition_sensing))),
    thinking_feeling: Math.max(0, Math.min(100, Math.round(thinking_feeling))),
    judging_perceiving: Math.max(0, Math.min(100, Math.round(judging_perceiving))),
  };
}

function deriveMBTIType(personality: {
  extraversion_introversion: number;
  intuition_sensing: number;
  thinking_feeling: number;
  judging_perceiving: number;
}): string {
  const e = personality.extraversion_introversion >= 50 ? 'E' : 'I';
  const n = personality.intuition_sensing >= 50 ? 'N' : 'S';
  const t = personality.thinking_feeling >= 50 ? 'T' : 'F';
  const j = personality.judging_perceiving >= 50 ? 'J' : 'P';
  return `${e}${n}${t}${j}`;
}

function calculatePentagonScores(negotiationState: NegotiationState, transcript: ChatMessage[]): number[] {
  const { userAskAmount, davidOfferAmount, negotiationCount, dealClosed, dealReached } = negotiationState;
  
  // 1. Assertiveness: Based on negotiation count
  const assertiveness = Math.min(2 + negotiationCount * 4, 10);

  // 2. Patience: Based on not accepting the first offer
  const patience = negotiationCount > 0 ? 8 : 3;

  // 3. Clarity: Based on stating an investment amount
  const clarity = userAskAmount ? 9 : 2;

  // 4. Compromise: Based on the gap between ask and final offer
  let compromise = 5;
  if (dealClosed && dealReached && userAskAmount && davidOfferAmount) {
    const gap = userAskAmount - davidOfferAmount;
    if (userAskAmount > 0) {
      const compromiseRatio = gap / userAskAmount;
      if (compromiseRatio < 0.25) compromise = 8; 
      else if (compromiseRatio >= 0.5) compromise = 2;
    } else {
      compromise = 1;
    }
  } else if (dealClosed && !dealReached) {
    compromise = 1; // Walked away means no compromise
  } else if (!dealClosed) {
    compromise = 1; // No deal means no compromise
  }

  // 5. Efficiency: Based on number of messages to reach a conclusion
  const efficiency = Math.max(10 - transcript.filter(m => m.sender === 'user').length, 2);

  return [assertiveness, patience, clarity, compromise, efficiency].map(score => Math.round(score));
}
