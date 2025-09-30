'use server'

import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function generateWorkplaceScenario(
  formData: {
    name: string
    jobTitle: string
    company: string
  },
  clientSessionId?: string
) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  if (!formData.name || !formData.jobTitle || !formData.company) {
    return { error: 'Incomplete form data provided.' }
  }

  try {
    const systemPrompt = `You are a creative writer specializing in workplace dynamics and training simulations.
Generate a short, engaging, and realistic opening scenario for a workplace simulation.
The user will provide their name, job title, and company.
Create a scenario where the user faces a common workplace challenge.
The scenario should be a single paragraph.
Be insightful and creative.
`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `My name is ${formData.name}, I am a ${formData.jobTitle} at ${formData.company}. Please generate a scenario for me.`
        }
      ],
      model: 'openai/gpt-oss-20b'
    })

    const initialScenario =
      chatCompletion.choices[0]?.message?.content || 'Could not generate scenario.'

    try {
      // Best-effort client IP and User-Agent for additional tracking context
      const hdrs = await headers()
      const ipHeader =
        hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null
      const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null
      const userAgent = hdrs.get('user-agent') || null

      const sessionData = {
        game_id: 'workplace-simulation',
        user_id: user?.id ?? null,
        session_id: clientSessionId ?? null,
        data: {
          ...formData,
          meta: { clientIp, userAgent }
        },
        result: {
            initialScenario: initialScenario,
            storyChunks: [{ type: 'narrative', content: initialScenario }],
            currentTurn: 1,
            userActions: []
        }
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        console.error('Error saving game session:', error)
        return { error: 'Failed to save session.' }
      }
      
      return { success: true, scenario: initialScenario, sessionId: data.id }
    } catch (e) {
      console.error('Could not save game session', e)
      return { error: 'Could not save game session.' }
    }
  } catch (error) {
    console.error('Error with Groq API:', error)
    return { error: 'Failed to generate scenario due to a server error.' }
  }
}

export async function getSession(sessionId: string) {
    if (!sessionId) {
        return { error: 'Session ID is required.' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error) {
        console.error('Error fetching session:', error);
        return { error: 'Could not retrieve session.' };
    }

    return { success: true, data };
}

export async function continueStory(sessionId: string, userInput: string) {
    const supabase = await createClient()

    // 1. Get current session data
    const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (sessionError || !sessionData) {
        console.error('Error fetching session for continuation:', sessionError);
        return { error: 'Could not retrieve session to continue story.' };
    }

    // 2. Prepare data for story continuation
    const { result, data: initialData } = sessionData;
    const { storyChunks, currentTurn, userActions } = result;
    
    const userAction = {
        type: 'user-action',
        content: `Your response: "${userInput.trim()}"`,
        actionType: 'response'
    };

    const updatedStoryChunks = [...storyChunks, userAction];
    const fullStory = updatedStoryChunks.map(chunk => chunk.content).join('\n\n');

    const isComplete = (currentTurn + 1) >= 5;

    // 3. Call Groq to get the next narrative
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const systemPrompt = isComplete
            ? `You are a creative writer. Based on the story so far, write a concluding paragraph. The user's final action was: ${userInput}`
            : `You are a creative writer. Continue the story based on the user's last action. The user's action was: ${userInput}`;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Here is the story so far:\n${fullStory}` }
            ],
            model: 'openai/gpt-oss-20b'
        });

        const nextNarrative = chatCompletion.choices[0]?.message?.content || 'The story ends here.';
        
        const finalStoryChunks = [...updatedStoryChunks, { type: 'narrative', content: nextNarrative }];
        const updatedUserActions = [...userActions, { type: 'response', text: userInput.trim() }];
        
        // 4. Update the session in Supabase
        const updatedResult = {
            ...result,
            storyChunks: finalStoryChunks,
            currentTurn: currentTurn + 1,
            userActions: updatedUserActions
        };

        const { data: updatedData, error: updateError } = await supabase
            .from('sessions')
            .update({ result: updatedResult })
            .eq('id', sessionId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating session:', updateError);
            return { error: 'Failed to save progress.' };
        }
        
        return { success: true, data: updatedData };

    } catch (error) {
        console.error('Error with Groq API during story continuation:', error);
        return { error: 'Failed to continue story due to a server error.' };
    }
}

export async function analyzeBehavior(sessionId: string) {
  const supabase = await createClient();

  // 1. Get the completed session data
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !sessionData) {
    console.error('Error fetching session for analysis:', sessionError);
    return { error: 'Could not retrieve session for analysis.' };
  }

  // If analysis already exists in the result, return it
  if (sessionData.result && sessionData.result.analysis) {
    return { success: true, analysis: sessionData.result.analysis };
  }

  const { result, data: initialData } = sessionData;
  const { userActions } = result;

  // 2. Call Groq to analyze the user's actions
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const analysisPrompt = `You are an honest but supportive behavioral analyst. Give accurate, realistic insights based on what the user actually did - don't force positive spins on negative responses.

# User Actions During Crisis
${userActions.map((action: any, i: number) => `Turn ${i+1}: "${action.text}"`).join('\n')}

# Your Task
Generate an honest behavioral analysis in JSON format:

{
  "personalityHighlights": [
    "One genuine strength or pattern observed (only if actually present)",
    "Another authentic quality shown (only if actually present)"
  ],
  "behavioralPatterns": {
    "leadership": "Honest assessment of leadership approach based on actual responses.",
    "communication": "Realistic assessment of communication patterns shown.", 
    "decisionMaking": "Accurate description of decision-making patterns from actual actions.",
    "stressResponse": "Honest assessment of how they handle pressure - acknowledge if it's concerning."
  },
  "workplaceInsights": {
    "strengths": [
      "One authentic strength if demonstrated",
      "Another genuine strength if shown"
    ],
    "watchOutFor": [
      "One honest concern or pattern to be aware of",
      "Another realistic area needing attention"
    ],
    "dayToDayTips": [
      "One practical, realistic suggestion",
      "Another actionable tip based on what they actually need"
    ]
  },
  "developmentAreas": [
    "One honest growth area based on what responses revealed",
    "Another realistic development need"
  ]
}

Return ONLY the JSON - no other text or formatting.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: analysisPrompt }],
      model: 'openai/gpt-oss-20b',
      response_format: { type: 'json_object' }
    });

    const rawAnalysis = chatCompletion.choices[0]?.message?.content || '{}';
    let analysisResult;

    try {
      analysisResult = JSON.parse(rawAnalysis);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Fallback analysis
      analysisResult = {
        personalityHighlights: [
          "Response patterns varied across the crisis scenario",
          "Workplace behavior shows individual approach to pressure"
        ],
        behavioralPatterns: {
          leadership: "Analysis shows mixed responses to leadership moments during the crisis.",
          communication: "Communication patterns indicate personal style under workplace stress.",
          decisionMaking: "Decision-making approach reflects individual response to competing priorities.",
          stressResponse: "Stress response patterns suggest areas for professional development consideration."
        },
        workplaceInsights: {
          strengths: [
            "Individual approach to workplace scenarios",
            "Personal response style during crisis moments"
          ],
          watchOutFor: [
            "Consider alignment between stress responses and professional context",
            "Review effectiveness of crisis response strategies"
          ],
          dayToDayTips: [
            "Reflect on professional responses during high-pressure situations",
            "Consider developing workplace-specific crisis management strategies"
          ]
        },
        developmentAreas: [
          "Professional stress management techniques",
          "Workplace-appropriate crisis response strategies"
        ]
      };
    }

    // 3. Update the session with the analysis result
    const updatedResult = { ...result, analysis: analysisResult };

    const { error: updateError } = await supabase
      .from('sessions')
      .update({ result: updatedResult })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error saving analysis:', updateError);
      return { error: 'Failed to save analysis.' };
    }

    return { success: true, analysis: analysisResult };

  } catch (error) {
    console.error('Error with Groq API during analysis:', error);
    return { error: 'Failed to analyze behavior due to a server error.' };
  }
}
