import { NextResponse } from 'next/server';
import { NegotiationState, ChatMessage } from '@/app/investor/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { negotiationState, transcript } = body as {
      negotiationState: NegotiationState;
      transcript: ChatMessage[];
    };

    if (!negotiationState || !transcript) {
      return NextResponse.json({ success: false, error: 'Missing negotiation data' }, { status: 400 });
    }

    const analysis = await generateNegotiationAnalysis(negotiationState, transcript);

    return NextResponse.json({ success: true, analysis });

  } catch (error) {
    console.error('Error analyzing negotiation:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function generateNegotiationAnalysis(negotiationState: NegotiationState, transcript: ChatMessage[]) {
  const { userAskAmount, davidOfferAmount, dealClosed, dealReached } = negotiationState;
  
  const finalAgreedAmount = (dealClosed && dealReached) ? (davidOfferAmount || 0) : 0;
  
  const conversationForAI = transcript.map(msg => `${msg.sender === 'user' ? 'Investor' : 'David'}: ${msg.text}`).join('\n');

  const systemPrompt = `You are a negotiation analysis expert. Analyze the following conversation between an investor and a startup founder named David. Based on the transcript and the final outcome, provide a concise analysis of the investor's negotiation style.

Conversation Transcript:
---
${conversationForAI}
---

Final Negotiation State:
- Investor's initial ask: ${userAskAmount || 'Not specified'}
- David's final offer: ${davidOfferAmount || 'Not specified'}
- Was a deal reached? ${dealReached ? 'Yes - Deal was agreed' : 'No - Investor walked away or conversation ended without agreement'}
- Final Agreed Amount: ${finalAgreedAmount}

Your task is to return a JSON object with two keys:
1. "archetype": A short, catchy title for the investor's negotiation style (e.g., "The Assertive Investor", "The Cautious Collaborator", "The Unwavering Visionary").
2. "summary": A 2-3 sentence analysis of the investor's performance, highlighting their strategy, strengths, and areas for improvement. If no deal was made, explain why the negotiation fell apart.`;

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

    return {
      archetype: aiAnalysis.archetype,
      summary: aiAnalysis.summary,
      pentagonScores,
      pentagonLabels,
      finalAgreedAmount
    };

  } catch (error) {
    console.error("Failed to get AI analysis from OpenRouter:", error);
    // Fallback to programmatic analysis if AI fails
    return generateProgrammaticAnalysis(negotiationState, transcript);
  }
}

// This is the old function, now serving as a fallback.
function generateProgrammaticAnalysis(negotiationState: NegotiationState, transcript: ChatMessage[]) {
  const { userAskAmount, davidOfferAmount, negotiationCount, dealClosed, dealReached } = negotiationState;
  const finalOffer = davidOfferAmount || 0;
  const initialAsk = userAskAmount || 0;
  const finalAgreedAmount = (dealClosed && dealReached) ? finalOffer : 0;

  let archetype = 'The Accommodating Partner';
  let summary = "You were straightforward and accepted a deal without much back-and-forth. This can build goodwill, but remember that most founders expect some level of negotiation.";

  if (dealClosed && !dealReached) {
    archetype = "The Principled Investor";
    summary = "You walked away when the terms didn't align with your expectations. Knowing when to say no is a critical skill in negotiation. Sometimes the best deal is the one you don't make.";
  } else if (!dealClosed) {
    archetype = "The Missed Opportunity";
    summary = "The negotiation ended without a clear conclusion. It's important to find common ground and be clear about your intentions to successfully close an investment.";
  } else if (!userAskAmount) {
    archetype = 'The Conversationalist';
    summary = "You didn't state an investment amount, so the negotiation didn't fully kick off. In investment talks, being direct about your intentions is key to moving things forward.";
  } else if (negotiationCount === 0) {
    if (finalOffer * 2 === initialAsk) {
      archetype = 'The Eager Investor';
      summary = "You accepted the first offer on the table. While this shows you're keen, a little pushback can often reveal flexibility on the other side. Don't be afraid to test the waters next time.";
    }
  } else if (negotiationCount > 0) {
    const initialOffer = Math.floor(initialAsk / 2);
    if (finalOffer > initialOffer) {
      const increase = finalOffer - initialOffer;
      const percentageIncrease = initialOffer > 0 ? ((increase / initialOffer) * 100).toFixed(0) : 0;
      if (negotiationCount >= 2) {
        archetype = 'The Tenacious Negotiator';
        summary = `You pushed back and held your ground. You increased David's initial offer by ${percentageIncrease}%. Your persistence paid off, showing that you value your contribution and aren't afraid to ask for what you think is fair.`;
      } else {
        archetype = 'The Assertive Investor';
        summary = `You didn't take the first offer and negotiated for a better deal. You successfully increased your allocation by ${percentageIncrease}%. This shows you're a serious investor who knows their worth.`;
      }
    }
  }
  
  const pentagonScores = calculatePentagonScores(negotiationState, transcript);
  const pentagonLabels = ['Assertiveness', 'Patience', 'Clarity', 'Compromise', 'Efficiency'];

  return { archetype, summary, pentagonScores, pentagonLabels, finalAgreedAmount };
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
