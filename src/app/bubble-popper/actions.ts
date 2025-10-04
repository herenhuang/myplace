'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

interface GameData {
  bubblesPopped: number;
  timeElapsed: number;
  completed: boolean;
  poppingPattern: string;
}

export async function saveAndAnalyze(gameData: GameData, clientSessionId?: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    // Generate AI analysis
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const systemPrompt = `You're a wise, slightly teasing friend who just watched someone play a bubble-popping game.

What happened:
- ${gameData.bubblesPopped} bubbles popped out of 100
- ${formatTime(gameData.timeElapsed)} total
- ${gameData.completed ? 'Finished all 100' : 'Quit early'}
- Pattern: ${gameData.poppingPattern}

Write 2 short paragraphs (3-4 sentences each) that make them feel SEEN. Be direct and playful.

Paragraph 1: Call out what their behavior reveals. Be specific about ${gameData.bubblesPopped} bubbles and ${formatTime(gameData.timeElapsed)}.

Paragraph 2: What this says about how they approach things. One insight, keep it punchy.

Use "you" language. Be a friend who sees through their BS. Make them laugh and feel understood. No fluff.`;

    const chatCompletion = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Analyze this gameplay behavior.'
        }
      ]
    });

    const analysis = (chatCompletion.content[0] as { text: string })?.text || 'Could not generate analysis.';

    // Save to sessions table
    try {
      const hdrs = await headers();
      const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null;
      const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null;
      const userAgent = hdrs.get('user-agent') || null;

      const sessionData = {
        game_id: 'bubble-popper',
        user_id: user?.id ?? null,
        session_id: clientSessionId ?? null,
        data: {
          ...gameData,
          meta: { clientIp, userAgent }
        },
        result: { analysis }
      };

      const { error } = await supabase.from('sessions').insert([sessionData]);

      if (error) {
        console.error('Error saving game session:', error);
      }
    } catch (e) {
      console.error('Could not save game session', e);
    }

    return { success: true, analysis };
  } catch (error) {
    console.error('Error with Claude API:', error);
    return { error: 'Failed to generate analysis due to a server error.' };
  }
}

export async function getGlobalStats() {
  try {
    const supabase = await createClient();
    
    // Query sessions table for bubble-popper games
    const { data, error } = await supabase
      .from('sessions')
      .select('data')
      .eq('game_id', 'bubble-popper');

    if (error) {
      console.error('Error fetching stats:', error);
      return { 
        totalPlays: 0, 
        averageCompletion: 0, 
        averageTime: 0 
      };
    }

    if (!data || data.length === 0) {
      return { 
        totalPlays: 0, 
        averageCompletion: 0, 
        averageTime: 0 
      };
    }

    // Calculate stats from data
    const totalPlays = data.length;
    const totalBubbles = data.reduce((sum, session) => sum + (session.data?.bubblesPopped || 0), 0);
    const totalTime = data.reduce((sum, session) => sum + (session.data?.timeElapsed || 0), 0);

    return {
      totalPlays,
      averageCompletion: totalPlays > 0 ? totalBubbles / totalPlays : 0,
      averageTime: totalPlays > 0 ? totalTime / totalPlays : 0
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return { 
      totalPlays: 0, 
      averageCompletion: 0, 
      averageTime: 0 
    };
  }
}

